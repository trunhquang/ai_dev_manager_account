import * as React from 'react';
import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, Timestamp, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AIAccount, AIAccountStatus, Project } from '@/types';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Mail, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  Ban,
  Filter,
  Users,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Accounts() {
  const [accounts, setAccounts] = useState<AIAccount[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AIAccount | null>(null);
  const [editProviders, setEditProviders] = useState<string[]>([]);
  const [customProviders, setCustomProviders] = useState<string[]>([]);
  const [isCustomProvider, setIsCustomProvider] = useState(false);
  const [customProvider, setCustomProvider] = useState('');
  const { profile } = useAuthStore();
  const { language, setLanguage, t } = useLanguage();
  const isAdmin = profile?.role === 'admin';

  // State for new account form
  const [newAccount, setNewAccount] = useState({
    email: '',
    providers: ['OnSpace'] as string[],
    packageType: 'Pro',
    dailyTokenLimit: 100000,
    status: 'active' as AIAccountStatus,
    note: ''
  });

  useEffect(() => {
    if (!profile) return;
    
    const q = query(collection(db, 'accounts'), orderBy('createdAt', 'desc'));
    const unsubscribeA = onSnapshot(q, 
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AIAccount));
        setAccounts(data);
      },
      (error) => {
        console.error("Accounts snapshot error:", error);
      }
    );

    const pq = query(collection(db, 'projects'));
    const unsubscribeP = onSnapshot(pq, 
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
        setProjects(data);
        setLoading(false);
      },
      (error) => {
        console.error("Projects snapshot error:", error);
        setLoading(false);
      }
    );

    return () => {
      unsubscribeA();
      unsubscribeP();
    };
  }, [profile]);

  useEffect(() => {
    const q = query(collection(db, 'providers'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data().name as string);
      setCustomProviders(data);
    });
    return unsubscribe;
  }, []);

  const saveNewProvider = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    
    const defaults = ['OnSpace', 'OpenAI', 'Anthropic', 'Cursor'];
    if (defaults.includes(trimmed) || customProviders.includes(trimmed)) return;

    try {
      await addDoc(collection(db, 'providers'), {
        name: trimmed,
        isCustom: true,
        createdAt: Timestamp.now()
      });
    } catch (err) {
      console.error("Failed to save provider:", err);
    }
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const allProviders = [...newAccount.providers];
      if (isCustomProvider && customProvider) {
        const trimmed = customProvider.trim();
        if (trimmed && !allProviders.includes(trimmed)) {
          allProviders.push(trimmed);
          await saveNewProvider(trimmed);
        }
      }

      if (allProviders.length === 0) throw new Error('At least one provider is required');

      await addDoc(collection(db, 'accounts'), {
        email: newAccount.email,
        providers: allProviders,
        packageType: newAccount.packageType,
        dailyTokenLimit: newAccount.dailyTokenLimit,
        status: newAccount.status,
        note: newAccount.note,
        currentTokenLeft: newAccount.dailyTokenLimit,
        createdAt: Timestamp.now(),
        lastUsedAt: null
      });
      toast.success('Account Added', { description: `${newAccount.email} is now in the system.` });
      setIsAddOpen(false);
      setIsCustomProvider(false);
      setCustomProvider('');
      setNewAccount({
        email: '',
        providers: ['OnSpace'],
        packageType: 'Pro',
        dailyTokenLimit: 100000,
        status: 'active',
        note: ''
      });
    } catch (error: any) {
      toast.error('Failed to add account', { description: error.message });
    }
  };

  const handleStatusChange = async (id: string, status: AIAccountStatus) => {
    if (!isAdmin) return;
    try {
      await updateDoc(doc(db, 'accounts', id), { status });
      toast.success('Status Updated');
    } catch (error: any) {
      toast.error('Update failed', { description: error.message });
    }
  };

  const handleUpdateProviders = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount || !isAdmin) return;
    try {
      const allProviders = [...editProviders];
      if (isCustomProvider && customProvider) {
        const trimmed = customProvider.trim();
        if (trimmed && !allProviders.includes(trimmed)) {
          allProviders.push(trimmed);
          await saveNewProvider(trimmed);
        }
      }

      if (allProviders.length === 0) throw new Error('At least one provider is required');

      await updateDoc(doc(db, 'accounts', editingAccount.id), {
        providers: allProviders
      });
      
      toast.success('Account Updated', { description: 'Resource providers synchronized successfully.' });
      setIsEditOpen(false);
      setIsCustomProvider(false);
      setCustomProvider('');
    } catch (error: any) {
      toast.error('Update failed', { description: error.message });
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (!isAdmin || !window.confirm(t('accounts.actions.deleteConfirm'))) return;
    try {
      await deleteDoc(doc(db, 'accounts', id));
      toast.success('Account Deleted');
    } catch (error: any) {
      toast.error('Deletion failed', { description: error.message });
    }
  };

  const filteredAccounts = accounts.filter(acc => 
    acc.email.toLowerCase().includes(search.toLowerCase()) || 
    acc.providers.some(p => p.toLowerCase().includes(search.toLowerCase()))
  );

  const getStatusBadge = (status: AIAccountStatus) => {
    switch (status) {
      case 'active':
        return <Badge className="rounded-none border-[#10B981] bg-transparent text-[#10B981] uppercase font-semibold text-[10px] h-5 px-1.5 leading-none">Active</Badge>;
      case 'cooldown':
        return <Badge className="rounded-none border-[#F59E0B] bg-transparent text-[#F59E0B] uppercase font-semibold text-[10px] h-5 px-1.5 leading-none">Cooldown</Badge>;
      case 'banned':
        return <Badge className="rounded-none border-[#EF4444] bg-transparent text-[#EF4444] uppercase font-semibold text-[10px] h-5 px-1.5 leading-none">Banned</Badge>;
      default:
        return <Badge variant="outline" className="rounded-none uppercase text-[10px] h-5 px-1.5">{status}</Badge>;
    }
  };

  const allAvailableProviders = Array.from(new Set(['OnSpace', 'OpenAI', 'Anthropic', 'Cursor', ...customProviders]));

  return (
    <div className="space-y-0 text-foreground">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border bg-background p-6">
        <div>
          <h1 className="text-2xl font-serif italic tracking-tight text-foreground">{t('accounts.title')}</h1>
          <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-[0.1em] mt-1 opacity-60">{t('accounts.subtitle')}</p>
        </div>

        {isAdmin && (
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger render={
              <button className={cn(buttonVariants({ variant: 'default' }), "rounded-none border border-border bg-foreground text-background hover:bg-muted hover:text-foreground transition-all h-9 px-6 font-serif italic text-sm cursor-pointer")}>
                <Plus className="w-4 h-4 mr-2" /> {t('accounts.addBtn')}
              </button>
            } />
            <DialogContent className="rounded-none bg-background border-border text-foreground sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="font-serif italic">New Registry Entry</DialogTitle>
                <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">Provisioning System Resource</p>
              </DialogHeader>
              <form onSubmit={handleAddAccount} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-serif italic text-[11px] uppercase tracking-widest opacity-70">{t('accounts.dialog.emailLabel')}</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={newAccount.email}
                    onChange={e => setNewAccount({...newAccount, email: e.target.value})}
                    placeholder="dev-node-01@system.ai" 
                    className="rounded-none bg-background border-border focus:ring-accent" 
                    required
                  />
                </div>
                  <div className="space-y-3">
                    <Label className="font-serif italic text-[11px] uppercase tracking-widest opacity-70">{t('accounts.dialog.providerLabel')}</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {allAvailableProviders.map((p) => (
                        <div key={p} className="flex items-center gap-2 border border-border p-2 hover:bg-accent/50 transition-colors">
                          <input 
                            type="checkbox"
                            className="w-3 h-3 accent-foreground"
                            checked={newAccount.providers.includes(p)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewAccount({...newAccount, providers: [...newAccount.providers, p]});
                              } else {
                                setNewAccount({...newAccount, providers: newAccount.providers.filter(i => i !== p)});
                              }
                            }}
                          />
                          <span className="font-mono text-[10px] uppercase">{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2 border-t border-border pt-4">
                    <div className="flex items-center justify-between">
                      <Label className="font-serif italic text-[11px] uppercase tracking-widest opacity-70">Custom Providers</Label>
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="sm" 
                        className="h-6 text-[9px] uppercase font-mono"
                        onClick={() => setIsCustomProvider(!isCustomProvider)}
                      >
                        {isCustomProvider ? '- Remove' : '+ Add New'}
                      </Button>
                    </div>

                    {isCustomProvider && (
                      <Input 
                        placeholder={t('accounts.dialog.providerPlaceholder')}
                        value={customProvider}
                        onChange={e => setCustomProvider(e.target.value)}
                        className="rounded-none border-border h-8 text-[11px] uppercase font-mono"
                        autoFocus
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="package" className="font-serif italic text-[11px] uppercase tracking-widest opacity-70">{t('accounts.dialog.tierLabel')}</Label>
                    <Select 
                      value={newAccount.packageType} 
                      onValueChange={v => setNewAccount({...newAccount, packageType: v})}
                    >
                      <SelectTrigger id="package" className="rounded-none bg-background border-border uppercase font-mono text-[10px]">
                        <SelectValue placeholder="Select Tier" />
                      </SelectTrigger>
                      <SelectContent className="rounded-none bg-background border-border text-foreground">
                        <SelectItem value="Free">FREE</SelectItem>
                        <SelectItem value="Pro">PRO</SelectItem>
                        <SelectItem value="Team">TEAM</SelectItem>
                        <SelectItem value="Enterprise">ENTERPRISE</SelectItem>
                        <SelectItem value="Tier 1">TIER 1</SelectItem>
                        <SelectItem value="Tier 2">TIER 2</SelectItem>
                        <SelectItem value="Tier 3">TIER 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                <div className="space-y-2">
                  <Label htmlFor="limit" className="font-serif italic text-[11px] uppercase tracking-widest opacity-70">Quota Limit (Daily)</Label>
                  <Input 
                    id="limit" 
                    type="number" 
                    value={newAccount.dailyTokenLimit}
                    onChange={e => setNewAccount({...newAccount, dailyTokenLimit: parseInt(e.target.value)})}
                    className="rounded-none border-border" 
                    required 
                  />
                </div>
                <DialogFooter className="pt-4">
                  <Button type="submit" className="w-full rounded-none bg-foreground text-background font-serif italic">Authorize Entry</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="bg-background">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border-b border-border bg-[#F9F9F8]">
          <span className="font-serif italic text-[11px] uppercase tracking-[0.1em] text-muted-foreground opacity-70 px-2">Registry Table</span>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input 
                placeholder={t('common.search')} 
                className="pl-9 h-8 w-64 rounded-none bg-background border-border focus:ring-accent text-xs"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-none border-border bg-background text-foreground">
              <Filter className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table className="border-collapse">
            <TableHeader>
              <TableRow className="border-b border-border bg-[#EBEAE7] hover:bg-[#EBEAE7]">
                <TableHead className="font-serif italic text-[11px] uppercase tracking-[0.1em] text-muted-foreground opacity-60 h-10 px-6">{t('accounts.tableHeaders.email')}</TableHead>
                <TableHead className="font-serif italic text-[11px] uppercase tracking-[0.1em] text-muted-foreground opacity-60 h-10 px-6">{t('accounts.tableHeaders.provider')}</TableHead>
                <TableHead className="font-serif italic text-[11px] uppercase tracking-[0.1em] text-muted-foreground opacity-60 h-10 px-6">Linked Projects</TableHead>
                <TableHead className="font-serif italic text-[11px] uppercase tracking-[0.1em] text-muted-foreground opacity-60 h-10 px-6">Quota Used</TableHead>
                <TableHead className="font-serif italic text-[11px] uppercase tracking-[0.1em] text-muted-foreground opacity-60 h-10 px-6">{t('common.status')}</TableHead>
                <TableHead className="font-serif italic text-[11px] uppercase tracking-[0.1em] text-muted-foreground opacity-60 h-10 px-6">{t('accounts.tableHeaders.createdAt')}</TableHead>
                <TableHead className="font-serif italic text-[11px] uppercase tracking-[0.1em] text-muted-foreground opacity-60 h-10 px-6 text-right">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-border">
                    <TableCell colSpan={6} className="h-16 animate-pulse bg-muted/20" />
                  </TableRow>
                ))
              ) : filteredAccounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-muted-foreground italic font-serif">
                    {t('common.nothingFound')}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAccounts.map((account) => {
                  const usagePercent = (account.dailyTokenLimit - account.currentTokenLeft) / account.dailyTokenLimit * 100;
                  const isLow = account.currentTokenLeft < (account.dailyTokenLimit * 0.2);
                  
                  return (
                    <TableRow key={account.id} className="border-b border-border hover:bg-foreground hover:text-background group transition-colors cursor-pointer">
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 border border-border group-hover:border-background flex items-center justify-center">
                            <Mail className="w-4 h-4 opacity-50" />
                          </div>
                          <span className="text-[13px] font-medium">{account.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {account.providers && Array.isArray(account.providers) ? (
                            account.providers.map((p, idx) => (
                              <span key={idx} className="font-mono text-[9px] uppercase tracking-wider bg-accent/10 px-1 border border-accent/20 group-hover:border-background/30">{p}</span>
                            ))
                          ) : (
                            <span className="font-mono text-[9px] uppercase tracking-wider opacity-70">{(account as any).provider}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                          {projects.filter(p => p.linkedAccountIds?.includes(account.id)).length === 0 ? (
                            <span className="text-[9px] font-mono italic opacity-30 uppercase">No Links</span>
                          ) : (
                            projects.filter(p => p.linkedAccountIds?.includes(account.id)).map(p => {
                              const isActive = p.currentAccountId === account.id;
                              return (
                                <div 
                                  key={p.id} 
                                  className={cn(
                                    "flex items-center gap-1 px-1.5 py-0.5 border text-[8px] font-mono uppercase tracking-tighter",
                                    isActive 
                                      ? "bg-[#10B981]/20 border-[#10B981]/40 text-[#10B981] group-hover:bg-[#10B981] group-hover:text-background" 
                                      : "bg-muted/30 border-border group-hover:border-background/50 group-hover:text-background"
                                  )}
                                >
                                  <div className={cn(
                                    "w-1 h-1",
                                    p.status === 'active' ? "bg-current" : "bg-muted-foreground group-hover:bg-background/40"
                                  )} />
                                  {p.name.substring(0, 10)}{p.name.length > 10 ? '..' : ''}
                                  {isActive && <span className="text-[7px] ml-0.5 opacity-60">●</span>}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 w-[240px]">
                        <div className="space-y-1">
                          <span className="font-mono text-[11px] opacity-70 group-hover:opacity-100">{Math.round(usagePercent)}%</span>
                          <div className="h-1 bg-border group-hover:bg-background/20 w-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full transition-all duration-500",
                                usagePercent > 80 ? "bg-destructive" : "bg-accent"
                              )}
                              style={{ width: `${usagePercent}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        {getStatusBadge(account.status)}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-[11px] font-mono opacity-60 group-hover:opacity-80">
                        {account.lastUsedAt 
                          ? format(account.lastUsedAt.toDate(), 'HH:mm | MMM dd') 
                          : 'VOID'}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger render={
                            <button className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), "h-7 w-7 rounded-none hover:bg-background hover:text-foreground cursor-pointer")}>
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </button>
                          } />
                          <DropdownMenuContent align="end" className="rounded-none bg-background border-border text-foreground">
                            <DropdownMenuGroup>
                              <DropdownMenuLabel className="font-serif italic text-[10px] uppercase tracking-widest opacity-60">{t('accounts.actions.title')}</DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-border" />
                              <DropdownMenuItem 
                                className="font-mono text-[10px] uppercase gap-2 cursor-pointer"
                                onClick={() => handleStatusChange(account.id, 'active')}
                              >
                                <CheckCircle2 className="w-3 h-3 text-[#10B981]" /> {t('accounts.actions.active')}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="font-mono text-[10px] uppercase gap-2 cursor-pointer"
                                onClick={() => handleStatusChange(account.id, 'cooldown')}
                              >
                                <Clock className="w-3 h-3 text-[#F59E0B]" /> {t('accounts.actions.cooldown')}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="font-mono text-[10px] uppercase gap-2 cursor-pointer"
                                onClick={() => handleStatusChange(account.id, 'banned')}
                              >
                                <Ban className="w-3 h-3 text-[#EF4444]" /> {t('accounts.actions.ban')}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-border" />
                              <DropdownMenuItem 
                                className="font-mono text-[10px] uppercase gap-2 cursor-pointer"
                                onClick={() => {
                                  setEditingAccount(account);
                                  setEditProviders(account.providers || []);
                                  setIsEditOpen(true);
                                }}
                              >
                                <Plus className="w-3 h-3" /> {t('accounts.actions.editProviders')}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-border" />
                              <DropdownMenuItem 
                                className="font-mono text-[10px] uppercase gap-2 cursor-pointer text-destructive focus:text-destructive"
                                onClick={() => handleDeleteAccount(account.id)}
                              >
                                <Trash2 className="w-3 h-3" /> {t('accounts.actions.purge')}
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {accounts.length > 0 && accounts.some(a => a.status === 'cooldown') && (
        <div className="bg-background p-6 border-t border-border">
          <div className="bg-[#fff] border border-border p-4 flex items-start gap-4">
            <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-[11px] font-serif italic uppercase tracking-widest text-[#F59E0B]">Critical: Rate Limit Exhaustion</h4>
              <p className="text-[12px] leading-relaxed mt-1 opacity-70 font-sans italic">
                Registry entries flagged 'Cooldown' have reached temporal quota limits. System throughput may be degraded until next operational cycle.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Providers Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="rounded-none bg-background border-border text-foreground sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-serif italic">{t('accounts.actions.editProviders')}</DialogTitle>
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">Update AI Resources for {editingAccount?.email}</p>
          </DialogHeader>
          <form onSubmit={handleUpdateProviders} className="space-y-4 py-4">
            <div className="space-y-3">
              <Label className="font-serif italic text-[11px] uppercase tracking-widest opacity-70">{t('accounts.dialog.providerLabel')}</Label>
              <div className="grid grid-cols-2 gap-2">
                {allAvailableProviders.map((p) => (
                  <div key={p} className="flex items-center gap-2 border border-border p-2 hover:bg-accent/50 transition-colors">
                    <input 
                      type="checkbox"
                      className="w-3 h-3 accent-foreground"
                      checked={editProviders.includes(p)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditProviders([...editProviders, p]);
                        } else {
                          setEditProviders(editProviders.filter(i => i !== p));
                        }
                      }}
                    />
                    <span className="font-mono text-[10px] uppercase">{p}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2 border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <Label className="font-serif italic text-[11px] uppercase tracking-widest opacity-70">Custom Providers</Label>
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-[9px] uppercase font-mono"
                  onClick={() => setIsCustomProvider(!isCustomProvider)}
                >
                  {isCustomProvider ? '- Remove' : '+ Add New'}
                </Button>
              </div>

              {isCustomProvider && (
                <Input 
                  placeholder={t('accounts.dialog.providerPlaceholder')}
                  value={customProvider}
                  onChange={e => setCustomProvider(e.target.value)}
                  className="rounded-none border-border h-8 text-[11px] uppercase font-mono"
                  autoFocus
                />
              )}
            </div>

            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full rounded-none bg-foreground text-background font-serif italic">{t('accounts.actions.saveChanges')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
