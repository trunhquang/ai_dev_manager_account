import * as React from 'react';
import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, Timestamp, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AIAccount, AIAccountStatus } from '@/types';
import { Button } from '@/components/ui/button';
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
  Users
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

export default function Accounts() {
  const [accounts, setAccounts] = useState<AIAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isCustomProvider, setIsCustomProvider] = useState(false);
  const [customProvider, setCustomProvider] = useState('');
  const { language, setLanguage, t } = useLanguage();
  const isAdmin = profile?.role === 'admin';

  // State for new account form
  const [newAccount, setNewAccount] = useState({
    email: '',
    provider: 'OnSpace',
    packageType: 'Pro',
    dailyTokenLimit: 100000,
    status: 'active' as AIAccountStatus,
    note: ''
  });

  useEffect(() => {
    if (!profile) return;
    
    const q = query(collection(db, 'accounts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AIAccount));
        setAccounts(data);
        setLoading(false);
      },
      (error) => {
        console.error("Accounts snapshot error:", error);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [profile]);

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const provider = isCustomProvider ? customProvider : newAccount.provider;
      if (!provider) throw new Error('Provider is required');

      await addDoc(collection(db, 'accounts'), {
        ...newAccount,
        provider,
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
        provider: 'OnSpace',
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

  const filteredAccounts = accounts.filter(acc => 
    acc.email.toLowerCase().includes(search.toLowerCase()) || 
    acc.provider.toLowerCase().includes(search.toLowerCase())
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

  return (
    <div className="space-y-0 text-foreground">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border bg-background p-6">
        <div>
          <h1 className="text-2xl font-serif italic tracking-tight text-foreground">AI Account Registry</h1>
          <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-[0.1em] mt-1 opacity-60">System Inventory / Token Burn Metrics</p>
        </div>

        {isAdmin && (
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger render={
              <Button className="rounded-none border border-border bg-foreground text-background hover:bg-muted hover:text-foreground transition-all h-9 px-6 font-serif italic text-sm">
                <Plus className="w-4 h-4 mr-2" /> Add Entry
              </Button>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="provider" className="font-serif italic text-[11px] uppercase tracking-widest opacity-70">{t('accounts.dialog.providerLabel')}</Label>
                      <Select 
                        value={isCustomProvider ? "custom" : newAccount.provider} 
                        onValueChange={v => {
                          if (v === "custom") {
                            setIsCustomProvider(true);
                          } else {
                            setIsCustomProvider(false);
                            setNewAccount({...newAccount, provider: v});
                          }
                        }}
                      >
                        <SelectTrigger id="provider" className="rounded-none bg-background border-border uppercase font-mono text-[10px]">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent className="rounded-none bg-background border-border text-foreground">
                          <SelectItem value="OnSpace">ONSPACE</SelectItem>
                          <SelectItem value="OpenAI">OPENAI</SelectItem>
                          <SelectItem value="Anthropic">ANTHROPIC</SelectItem>
                          <SelectItem value="Cursor">CURSOR</SelectItem>
                          <SelectItem value="custom" className="text-accent font-bold italic">{t('accounts.dialog.newProvider')}</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {isCustomProvider && (
                        <Input 
                          placeholder={t('accounts.dialog.providerPlaceholder')}
                          value={customProvider}
                          onChange={e => setCustomProvider(e.target.value)}
                          className="rounded-none border-border mt-2 h-8 text-[11px] uppercase font-mono"
                          autoFocus
                          required
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
                placeholder="Find entry..." 
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
                <TableHead className="font-serif italic text-[11px] uppercase tracking-[0.1em] text-muted-foreground opacity-60 h-10 px-6">AI Account Email</TableHead>
                <TableHead className="font-serif italic text-[11px] uppercase tracking-[0.1em] text-muted-foreground opacity-60 h-10 px-6">Provider</TableHead>
                <TableHead className="font-serif italic text-[11px] uppercase tracking-[0.1em] text-muted-foreground opacity-60 h-10 px-6">Quota Used</TableHead>
                <TableHead className="font-serif italic text-[11px] uppercase tracking-[0.1em] text-muted-foreground opacity-60 h-10 px-6">Status</TableHead>
                <TableHead className="font-serif italic text-[11px] uppercase tracking-[0.1em] text-muted-foreground opacity-60 h-10 px-6">Last Sys. Sync</TableHead>
                <TableHead className="font-serif italic text-[11px] uppercase tracking-[0.1em] text-muted-foreground opacity-60 h-10 px-6 text-right">Ops</TableHead>
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
                    No matching records found in system core.
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
                        <span className="font-mono text-[11px] uppercase tracking-wider opacity-70">{account.provider}</span>
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
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-none hover:bg-background hover:text-foreground">
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </Button>
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
    </div>
  );
}
