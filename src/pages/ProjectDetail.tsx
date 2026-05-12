import * as React from 'react';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  doc, 
  onSnapshot, 
  updateDoc, 
  collection, 
  addDoc, 
  Timestamp, 
  setDoc, 
  getDoc 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Project, AIAccount, ProjectHandoff, ProjectTransfer } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  ArrowRightLeft, 
  History, 
  FileEdit, 
  Save, 
  ExternalLink,
  Code2,
  Terminal,
  Database,
  Users,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const isAdmin = profile?.role === 'admin';

  const [project, setProject] = useState<Project | null>(null);
  const [accounts, setAccounts] = useState<AIAccount[]>([]);
  const [handoff, setHandoff] = useState<ProjectHandoff | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferData, setTransferData] = useState({ toAccountId: '', reason: '' });

  useEffect(() => {
    if (!id || !profile) return;

    const unsubP = onSnapshot(doc(db, 'projects', id), 
      (snap) => {
        if (snap.exists()) {
          setProject({ id: snap.id, ...snap.data() } as Project);
        } else {
          navigate('/projects');
        }
        setLoading(false);
      },
      (error) => {
        console.error("Project snapshot error:", error);
        setLoading(false);
      }
    );

    const unsubH = onSnapshot(doc(db, 'handoffs', id), 
      (snap) => {
        if (snap.exists()) {
          setHandoff({ id: snap.id, ...snap.data() } as ProjectHandoff);
        } else {
          setHandoff(null);
        }
      },
      (error) => {
        console.error("Handoff snapshot error:", error);
      }
    );

    const unsubA = onSnapshot(collection(db, 'accounts'), 
      (snap) => {
        setAccounts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AIAccount)));
      },
      (error) => {
        console.error("Accounts snapshot error:", error);
      }
    );

    return () => { unsubP(); unsubH(); unsubA(); };
  }, [id, navigate, profile]);

  const handleUpdateHandoff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const data = {
      projectId: id,
      architectureSummary: formData.get('architecture') as string,
      completedTasks: formData.get('completed') as string,
      pendingTasks: formData.get('pending') as string,
      codingConventions: formData.get('conventions') as string,
      importantPrompts: formData.get('prompts') as string,
      bugFixNotes: formData.get('bugs') as string,
      updatedAt: Timestamp.now()
    };

    try {
      await setDoc(doc(db, 'handoffs', id), data, { merge: true });
      toast.success('Handoff Updated', { description: 'Knowledge base synchronized.' });
    } catch (error: any) {
      toast.error('Sync failed', { description: error.message });
    }
  };

  const handleTransfer = async () => {
    if (!project || !id || !transferData.toAccountId) return;
    
    try {
      // 1. Create Transfer Log
      await addDoc(collection(db, 'transfers'), {
        projectId: id,
        fromAccountId: project.currentAccountId || 'UNASSIGNED',
        toAccountId: transferData.toAccountId,
        transferredAt: Timestamp.now(),
        reason: transferData.reason,
        userId: profile?.uid
      });

      // 2. Update Project
      await updateDoc(doc(db, 'projects', id), {
        currentAccountId: transferData.toAccountId,
        status: 'active'
      });

      toast.success('Project Transferred', { description: 'Token bucket updated for target account.' });
      setIsTransferring(false);
    } catch (error: any) {
      toast.error('Transfer failed', { description: error.message });
    }
  };

  if (loading || !project) return <div className="h-40 flex items-center justify-center text-zinc-500 uppercase tracking-widest font-mono text-xs">Loading context...</div>;

  const currentAccount = accounts.find(a => a.id === project.currentAccountId);

  return (
    <div className="space-y-0 text-foreground">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border bg-background p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/projects')} className="text-muted-foreground hover:text-foreground rounded-none">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-serif italic tracking-tight text-foreground">{project.name}</h1>
              <Badge variant="outline" className="rounded-none border-border bg-background text-[10px] h-5 px-1.5 uppercase font-semibold tracking-wider text-muted-foreground">{project.type}</Badge>
            </div>
            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-[0.1em] mt-1 opacity-60">
              System Instance: {id?.slice(0, 8)} / Type: {project.type}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          {isAdmin && (
            <Button 
              variant="outline" 
              className="rounded-none border border-border bg-background text-xs gap-2 font-serif italic h-9 px-4"
              onClick={() => setIsTransferring(true)}
            >
              <ArrowRightLeft className="w-3 h-3" /> Transfer Asset
            </Button>
          )}
          <Button className="rounded-none border border-border bg-foreground text-background hover:bg-muted hover:text-foreground transition-all h-9 px-6 font-serif italic text-sm">
            Initialize Session
          </Button>
        </div>
      </div>

      <div className="p-6 bg-[#F9F9F8] grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-background border border-border p-5">
            <h3 className="text-[11px] uppercase font-mono tracking-widest text-muted-foreground opacity-60 mb-4">Resource Provider</h3>
            {currentAccount ? (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 border border-border flex items-center justify-center bg-[#F1F1F0]">
                    <Users className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold tracking-tight">{currentAccount.email.split('@')[0]}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-tighter opacity-70">{currentAccount.provider}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-mono tracking-tighter uppercase opacity-70">
                    <span>Available Quota</span>
                    <span className="text-[#10B981]">{Math.round((currentAccount.currentTokenLeft / currentAccount.dailyTokenLimit) * 100)}%</span>
                  </div>
                  <div className="h-1 bg-border w-full overflow-hidden">
                    <div 
                      className="h-full bg-accent transition-all" 
                      style={{ width: `${(currentAccount.currentTokenLeft / currentAccount.dailyTokenLimit) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 border border-destructive/20 bg-destructive/5 text-center">
                <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">No Active Asset</p>
                <p className="text-[9px] text-destructive/70 mt-1 uppercase tracking-tighter italic font-serif">Critical error: unassigned instance</p>
              </div>
            )}
          </section>

          <section className="bg-background border border-border p-5">
            <h3 className="text-[11px] uppercase font-mono tracking-widest text-muted-foreground opacity-60 mb-4">Instance Metadata</h3>
            <div className="space-y-0 text-sm">
              <MetaRow label="Priority Tier" value={project.priority} />
              <MetaRow label="Active Status" value={project.status} />
              <MetaRow label="Init. Date" value={format(project.createdAt.toDate(), 'MM.dd.yyyy')} />
              <MetaRow label="VCS Link" value={project.repositoryUrl ? 'AUTHORIZED' : 'NONE'} />
            </div>
          </section>
        </div>

        <div className="lg:col-span-3">
          <Tabs defaultValue="handoff" className="space-y-6">
            <TabsList className="bg-[#EBEAE7] border border-border rounded-none p-0 h-10 w-full justify-start overflow-x-auto gap-0">
              <TabsTrigger 
                value="handoff" 
                className="rounded-none h-10 px-6 font-serif italic text-xs tracking-tight border-r border-border data-[state=active]:bg-background data-[state=active]:text-foreground"
              >
                <FileEdit className="w-3.5 h-3.5 mr-2" /> Context Handoff
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="rounded-none h-10 px-6 font-serif italic text-xs tracking-tight border-r border-border data-[state=active]:bg-background data-[state=active]:text-foreground"
              >
                <History className="w-3.5 h-3.5 mr-2" /> Session Logs
              </TabsTrigger>
              <TabsTrigger 
                value="transfers" 
                className="rounded-none h-10 px-6 font-serif italic text-xs tracking-tight data-[state=active]:bg-background data-[state=active]:text-foreground"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 mr-2" /> Transfer Index
              </TabsTrigger>
            </TabsList>

            <TabsContent value="handoff" className="m-0">
              <section className="bg-background border border-border">
                <div className="p-6 border-b border-border flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-serif italic tracking-tight">Technical Knowledge Base</h3>
                    <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest mt-1 opacity-60">Persistent context for system handoff</p>
                  </div>
                  {handoff && (
                    <span className="text-[9px] text-muted-foreground font-mono uppercase tracking-[0.2em] opacity-40">
                      SYNC: {format(handoff.updatedAt.toDate(), 'HH:mm')}
                    </span>
                  )}
                </div>
                <div className="p-6">
                  <form onSubmit={handleUpdateHandoff} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-8">
                      <HandoffField 
                        label="Architectural Blueprint" 
                        name="architecture" 
                        defaultValue={handoff?.architectureSummary} 
                        icon={Terminal} 
                        placeholder="Define system core, tech stack, and state management rules..."
                      />
                      <HandoffField 
                        label="Development Protocols" 
                        name="conventions" 
                        defaultValue={handoff?.codingConventions} 
                        icon={Code2} 
                        placeholder="Linter rules, file structure patterns, naming conventions..."
                      />
                      <HandoffField 
                        label="Command/Prompt Directives" 
                        name="prompts" 
                        defaultValue={handoff?.importantPrompts} 
                        icon={Zap} 
                        placeholder="Best performing prompts for fixing complex features..."
                      />
                    </div>
                    <div className="space-y-8">
                      <HandoffField 
                        label="Deployment Milestones" 
                        name="completed" 
                        defaultValue={handoff?.completedTasks} 
                        icon={Save} 
                        placeholder="Log of major milestones reached..."
                      />
                      <HandoffField 
                        label="Operational Roadmap" 
                        name="pending" 
                        defaultValue={handoff?.pendingTasks} 
                        icon={History} 
                        placeholder="Next critical steps to perform..."
                      />
                      <HandoffField 
                        label="Anomaly / Debug Logistics" 
                        name="bugs" 
                        defaultValue={handoff?.bugFixNotes} 
                        icon={Database} 
                        placeholder="Documented edge cases and known temporary workarounds..."
                      />
                    </div>
                    <div className="md:col-span-2 pt-4">
                      <Button type="submit" className="w-full rounded-none bg-foreground text-background font-serif italic h-12 shadow-sm">
                        <Save className="w-4 h-4 mr-2" /> Synchronize System Context
                      </Button>
                    </div>
                  </form>
                </div>
              </section>
            </TabsContent>

            <TabsContent value="history" className="m-0">
              <div className="flex flex-col items-center justify-center p-24 text-muted-foreground bg-background border border-border">
                 <Terminal className="w-10 h-10 mb-6 opacity-10" />
                 <p className="text-[10px] uppercase font-mono tracking-[0.3em] opacity-40">Zero telemetry detected for stream</p>
              </div>
            </TabsContent>
            
            <TabsContent value="transfers" className="m-0">
              <div className="flex flex-col items-center justify-center p-24 text-muted-foreground bg-background border border-border">
                 <ArrowRightLeft className="w-10 h-10 mb-6 opacity-10" />
                 <p className="text-[10px] uppercase font-mono tracking-[0.3em] opacity-40 text-center">Transfer immutable logs deferred</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={isTransferring} onOpenChange={setIsTransferring}>
        <DialogContent className="rounded-none bg-background border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="font-serif italic text-lg tracking-tight">Migrate Resource Provider</DialogTitle>
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">Instance Migration Protocol</p>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="font-serif italic text-[11px] uppercase tracking-widest opacity-70">Target Resource</Label>
              <Select onValueChange={v => setTransferData({...transferData, toAccountId: v})}>
                <SelectTrigger className="rounded-none border-border">
                  <SelectValue placeholder="Select target instance" />
                </SelectTrigger>
                <SelectContent className="rounded-none bg-background border-border">
                  {accounts.filter(a => a.id !== project.currentAccountId && a.status === 'active').map(acc => (
                    <SelectItem key={acc.id} value={acc.id}>{acc.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-serif italic text-[11px] uppercase tracking-widest opacity-70">Migration Rationale</Label>
              <Input 
                placeholder="Temporal quota exceeded / Provider shift..." 
                className="rounded-none border-border"
                value={transferData.reason}
                onChange={e => setTransferData({...transferData, reason: e.target.value})}
              />
            </div>
            <DialogFooter className="pt-4 gap-2">
              <Button variant="ghost" className="rounded-none font-serif italic" onClick={() => setIsTransferring(false)}>Abort</Button>
              <Button onClick={handleTransfer} className="rounded-none bg-foreground text-background px-8 font-serif italic">Confirm Migration</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-border/50 last:border-0">
      <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.1em] opacity-70">{label}</span>
      <span className="text-[12px] font-medium tracking-tight uppercase group-hover:text-accent transition-colors">{value}</span>
    </div>
  );
}

function HandoffField({ label, name, defaultValue, icon: Icon, placeholder }: any) {
  return (
    <div className="space-y-3 group">
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-muted-foreground opacity-50 group-focus-within:opacity-100 transition-opacity" />
        <Label className="text-[11px] font-serif italic uppercase tracking-widest text-muted-foreground group-focus-within:text-foreground transition-colors">{label}</Label>
      </div>
      <textarea 
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full h-40 bg-[#F9F9F8] border border-border rounded-none p-4 text-[13px] leading-relaxed text-foreground focus:bg-[#fff] focus:border-accent transition-all outline-none placeholder:text-muted-foreground placeholder:italic resize-none font-sans"
      />
    </div>
  );
}
