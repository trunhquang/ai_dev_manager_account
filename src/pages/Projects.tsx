import * as React from 'react';
import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, Timestamp, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Project, ProjectType, ProjectPriority, ProjectStatus, AIAccount } from '@/types';
import { Button } from '@/components/ui/button';
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
import { 
  Plus, 
  Search, 
  Code2,
  FileCode,
  Smartphone,
  Layers,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [accounts, setAccounts] = useState<AIAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { profile } = useAuthStore();
  const { t } = useLanguage();
  const isAdmin = profile?.role === 'admin';

  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    type: 'fullstack' as ProjectType,
    repositoryUrl: '',
    currentAccountId: '',
    priority: 'medium' as ProjectPriority,
    status: 'active' as ProjectStatus
  });

  useEffect(() => {
    if (!profile) return;

    const pq = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const aq = query(collection(db, 'accounts'), orderBy('email', 'asc'));

    const unsubP = onSnapshot(pq, 
      (snapshot) => {
        setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
        setLoading(false);
      },
      (error) => {
        console.error("Projects snapshot error:", error);
        setLoading(false);
      }
    );

    const unsubA = onSnapshot(aq, 
      (snapshot) => {
        setAccounts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AIAccount)));
      },
      (error) => {
        console.error("Accounts snapshot error:", error);
      }
    );

    return () => { unsubP(); unsubA(); };
  }, [profile]);

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'projects'), {
        ...newProject,
        createdAt: Timestamp.now(),
      });
      toast.success('Project Created', { description: 'New development stream initialized.' });
      setIsAddOpen(false);
      setNewProject({
        name: '',
        description: '',
        type: 'fullstack',
        repositoryUrl: '',
        currentAccountId: '',
        priority: 'medium',
        status: 'active'
      });
    } catch (error: any) {
      toast.error('Creation failed', { description: error.message });
    }
  };

  const getPriorityBadge = (p: ProjectPriority) => {
    switch (p) {
      case 'high': return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">HIGH</Badge>;
      case 'medium': return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">MEDIUM</Badge>;
      case 'low': return <Badge className="bg-zinc-500/10 text-zinc-500 border-zinc-500/20">LOW</Badge>;
    }
  };

  const getTypeIcon = (type: ProjectType) => {
    switch (type) {
      case 'backend': return <Layers className="w-4 h-4" />;
      case 'frontend': return <FileCode className="w-4 h-4" />;
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      default: return <Code2 className="w-4 h-4" />;
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-0 text-foreground">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border bg-background p-6">
        <div>
          <h1 className="text-2xl font-serif italic tracking-tight text-foreground">{t('projects.title')}</h1>
          <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-[0.1em] mt-1 opacity-60">{t('projects.subtitle')}</p>
        </div>

        {isAdmin && (
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger render={
              <Button className="rounded-none border border-border bg-foreground text-background hover:bg-muted hover:text-foreground transition-all h-9 px-6 font-serif italic text-sm">
                <Plus className="w-4 h-4 mr-2" /> {t('projects.addBtn')}
              </Button>
            } />
            <DialogContent className="rounded-none bg-background border-border text-foreground sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="font-serif italic text-lg">{t('projects.dialog.title')}</DialogTitle>
                <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">{t('projects.dialog.description')}</p>
              </DialogHeader>
              <form onSubmit={handleAddProject} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="font-serif italic text-[11px] uppercase tracking-widest opacity-70">{t('projects.dialog.nameLabel')}</Label>
                  <Input 
                    value={newProject.name} 
                    onChange={e => setNewProject({...newProject, name: e.target.value})} 
                    className="rounded-none border-border" 
                    required 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-serif italic text-[11px] uppercase tracking-widest opacity-70">Scope Type</Label>
                    <Select value={newProject.type} onValueChange={v => setNewProject({...newProject, type: v as ProjectType})}>
                      <SelectTrigger className="rounded-none border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-none bg-background border-border">
                        <SelectItem value="frontend">FRONTEND</SelectItem>
                        <SelectItem value="backend">BACKEND</SelectItem>
                        <SelectItem value="mobile">MOBILE</SelectItem>
                        <SelectItem value="fullstack">FULLSTACK</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-serif italic text-[11px] uppercase tracking-widest opacity-70">Priority Tier</Label>
                    <Select value={newProject.priority} onValueChange={v => setNewProject({...newProject, priority: v as ProjectPriority})}>
                      <SelectTrigger className="rounded-none border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-none bg-background border-border">
                        <SelectItem value="low">LOW-PRIO</SelectItem>
                        <SelectItem value="medium">STANDARD</SelectItem>
                        <SelectItem value="high">HIGH-CRITICAL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-serif italic text-[11px] uppercase tracking-widest opacity-70">Assign Asset</Label>
                  <Select value={newProject.currentAccountId} onValueChange={v => setNewProject({...newProject, currentAccountId: v})}>
                    <SelectTrigger className="rounded-none border-border">
                      <SelectValue placeholder="Select resource" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none bg-background border-border">
                      {accounts.filter(a => a.status === 'active').map(acc => (
                        <SelectItem key={acc.id} value={acc.id}>{acc.email}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter className="pt-4">
                  <Button type="submit" className="w-full rounded-none bg-foreground text-background font-serif italic">Authorize Initialization</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="bg-background">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border-b border-border bg-[#F9F9F8]">
          <span className="font-serif italic text-[11px] uppercase tracking-[0.1em] text-muted-foreground opacity-70 px-2">Pipeline Directory</span>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input 
              placeholder={t('common.search')} 
              className="pl-9 h-8 w-64 rounded-none bg-background border-border focus:ring-accent text-xs"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table className="border-collapse">
            <TableHeader>
              <TableRow className="border-b border-border bg-[#EBEAE7] hover:bg-[#EBEAE7]">
                <TableHead className="font-serif italic text-[11px] uppercase tracking-[0.1em] text-muted-foreground opacity-60 h-10 px-6">{t('projects.tableHeaders.name')}</TableHead>
                <TableHead className="font-serif italic text-[11px] uppercase tracking-[0.1em] text-muted-foreground opacity-60 h-10 px-6">Classification</TableHead>
                <TableHead className="font-serif italic text-[11px] uppercase tracking-[0.1em] text-muted-foreground opacity-60 h-10 px-6">{t('common.status')}</TableHead>
                <TableHead className="font-serif italic text-[11px] uppercase tracking-[0.1em] text-muted-foreground opacity-60 h-10 px-6">Linked Resource</TableHead>
                <TableHead className="font-serif italic text-[11px] uppercase tracking-[0.1em] text-muted-foreground opacity-60 h-10 px-6 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map(project => {
                const projectAccount = accounts.find(a => a.id === project.currentAccountId);
                return (
                  <TableRow key={project.id} className="border-b border-border hover:bg-foreground hover:text-background group transition-colors cursor-pointer">
                    <TableCell className="px-6 py-4">
                      <div className="space-y-1">
                        <Link to={`/projects/${project.id}`} className="text-[14px] font-medium leading-none group-hover:underline">
                          {project.name}
                        </Link>
                        <div className="flex items-center gap-3">
                          {project.priority === 'high' && (
                            <span className="text-[9px] font-mono font-bold text-destructive uppercase bg-destructive/10 group-hover:bg-background/20 px-1 border border-destructive">CRITICAL</span>
                          )}
                          <span className="text-[10px] opacity-50 font-mono uppercase tracking-widest leading-none">
                            INIT: {format(project.createdAt.toDate(), 'yy.MM.dd')}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-2 opacity-70 group-hover:opacity-100 font-mono text-[11px] uppercase">
                        {getTypeIcon(project.type)}
                        {project.type}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge variant="outline" className="rounded-none border-current text-[10px] h-5 px-1.5 uppercase font-semibold">
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {projectAccount ? (
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-1.5 h-1.5 border border-border group-hover:border-background",
                            projectAccount.status === 'active' ? "bg-[#10B981]" : "bg-[#F59E0B]"
                          )} />
                          <span className="text-[11px] font-mono opacity-80 group-hover:opacity-100">{projectAccount.email.split('@')[0]}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono italic opacity-40 group-hover:opacity-60">UNASSIGNED</span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-none hover:bg-background hover:text-foreground" render={
                        <Link to={`/projects/${project.id}`} />
                      }>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
