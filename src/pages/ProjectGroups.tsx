import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, Timestamp, addDoc, deleteDoc, doc, updateDoc, where, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ProjectGroup, Project } from '@/types';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2,
  FolderOpen,
  ArrowRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';

export default function ProjectGroups() {
  const [groups, setGroups] = useState<ProjectGroup[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ProjectGroup | null>(null);
  const [assigningGroup, setAssigningGroup] = useState<ProjectGroup | null>(null);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [newGroup, setNewGroup] = useState({ name: '', description: '', notes: '' });
  
  const { profile } = useAuthStore();
  const { t } = useLanguage();
  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    if (!profile) return;

    const gq = query(collection(db, 'project_groups'), orderBy('name', 'asc'));
    const pq = query(collection(db, 'projects'));

    const unsubG = onSnapshot(gq, (snapshot) => {
      setGroups(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProjectGroup)));
      setLoading(false);
    });

    const unsubP = onSnapshot(pq, (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
    });

    return () => { unsubG(); unsubP(); };
  }, [profile]);

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      await addDoc(collection(db, 'project_groups'), {
        ...newGroup,
        createdAt: Timestamp.now(),
      });
      setIsAddOpen(false);
      setNewGroup({ name: '', description: '', notes: '' });
      toast.success('Group Created');
    } catch (error: any) {
      toast.error('Creation failed', { description: error.message });
    }
  };

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup || !isAdmin) return;
    try {
      await updateDoc(doc(db, 'project_groups', editingGroup.id), {
        name: editingGroup.name,
        description: editingGroup.description || '',
        notes: editingGroup.notes || '',
      });
      setIsEditOpen(false);
      setEditingGroup(null);
      toast.success('Group Updated');
    } catch (error: any) {
      toast.error('Update failed', { description: error.message });
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!isAdmin || !confirm(t('projects.groups.actions.deleteConfirm'))) return;
    try {
      // Find all projects in this group and unlink them
      const batch = writeBatch(db);
      const projectsInGroup = projects.filter(p => p.groupId === groupId);
      
      projectsInGroup.forEach(p => {
        batch.update(doc(db, 'projects', p.id), { groupId: null });
      });

      batch.delete(doc(db, 'project_groups', groupId));
      await batch.commit();
      
      toast.success('Group Purged');
    } catch (error: any) {
      toast.error('Purge failed', { description: error.message });
    }
  };

  const handleAssignProjects = async () => {
    if (!assigningGroup || !isAdmin) return;
    try {
      const batch = writeBatch(db);
      
      // Unlink projects previously in this group that are no longer selected
      const currentlyInGroup = projects.filter(p => p.groupId === assigningGroup.id);
      currentlyInGroup.forEach(p => {
        if (!selectedProjectIds.includes(p.id)) {
          batch.update(doc(db, 'projects', p.id), { groupId: null });
        }
      });

      // Link newly selected projects
      selectedProjectIds.forEach(id => {
        batch.update(doc(db, 'projects', id), { groupId: assigningGroup.id });
      });

      await batch.commit();
      setIsAssignOpen(false);
      setAssigningGroup(null);
      setSelectedProjectIds([]);
      toast.success('Assignments Synchronized');
    } catch (error: any) {
      toast.error('Assignment failed', { description: error.message });
    }
  };

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(search.toLowerCase()) || 
    (g.description && g.description.toLowerCase().includes(search.toLowerCase())) ||
    (g.notes && g.notes.toLowerCase().includes(search.toLowerCase()))
  );

  const getProjectsCount = (groupId: string) => {
    return projects.filter(p => p.groupId === groupId).length;
  };

  return (
    <div className="space-y-0 text-foreground">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 bg-[#F9F9F8] p-6 border border-border">
        <div className="space-y-1">
          <h2 className="text-2xl font-serif italic tracking-tight">{t('projects.groups.title')}</h2>
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-[0.2em]">{t('projects.groups.subtitle')}</p>
        </div>
        {isAdmin && (
          <Button 
            onClick={() => setIsAddOpen(true)}
            className="rounded-none bg-foreground text-background hover:bg-foreground/90 font-mono text-[10px] uppercase tracking-widest h-9 px-6"
          >
            <Plus className="mr-2 h-3.5 w-3.5" />
            {t('projects.groups.addBtn')}
          </Button>
        )}
      </div>

      <div className="bg-background border border-border">
        <div className="p-4 border-b border-border bg-[#F9F9F8]/50 flex items-center gap-3">
          <Search className="w-4 h-4 opacity-30" />
          <Input 
            placeholder={t('common.search')} 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-none bg-transparent shadow-none focus-visible:ring-0 text-sm font-sans italic p-0 h-auto"
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-b border-border bg-[#EBEAE7] hover:bg-[#EBEAE7]">
              <TableHead className="font-serif italic text-[11px] uppercase tracking-[0.1em] text-muted-foreground opacity-60 h-10 px-6">{t('projects.groups.tableHeaders.name')}</TableHead>
              <TableHead className="font-serif italic text-[11px] uppercase tracking-[0.1em] text-muted-foreground opacity-60 h-10 px-6">{t('projects.groups.tableHeaders.description')}</TableHead>
              <TableHead className="font-serif italic text-[11px] uppercase tracking-[0.1em] text-muted-foreground opacity-60 h-10 px-6">Internal Notes</TableHead>
              <TableHead className="font-serif italic text-[11px] uppercase tracking-[0.1em] text-muted-foreground opacity-60 h-10 px-6">{t('projects.groups.tableHeaders.projectsCount')}</TableHead>
              <TableHead className="font-serif italic text-[11px] uppercase tracking-[0.1em] text-muted-foreground opacity-60 h-10 px-6">{t('projects.groups.tableHeaders.createdAt')}</TableHead>
              <TableHead className="h-10 px-6"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center font-mono text-[10px] uppercase opacity-40">Synchronizing Group Data...</TableCell>
              </TableRow>
            ) : filteredGroups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center font-mono text-[10px] uppercase opacity-40">{t('common.nothingFound')}</TableCell>
              </TableRow>
            ) : (
              filteredGroups.map((group) => (
                <TableRow key={group.id} className="group border-b border-border/50 hover:bg-[#F1F0EE] transition-colors">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3 font-medium text-[13px]">
                      <FolderOpen className="w-4 h-4 opacity-30" />
                      {group.name}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span className="text-[11px] text-muted-foreground line-clamp-1">{group.description || '—'}</span>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span className="text-[11px] text-muted-foreground italic whitespace-pre-wrap">{group.notes || '—'}</span>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="space-y-2">
                      <span className="text-[11px] font-mono opacity-60 block">{getProjectsCount(group.id)} STREAMS</span>
                      <div className="flex flex-wrap gap-1">
                        {projects.filter(p => p.groupId === group.id).map(p => (
                          <Link key={p.id} to={`/projects/${p.id}`}>
                            <Badge variant="outline" className="rounded-none text-[9px] h-4 px-1 font-mono uppercase bg-muted/30 border-border/50 hover:bg-muted transition-colors flex items-center gap-1 group/p">
                              {p.name}
                              <ArrowRight className="w-2 h-2 opacity-0 group-hover/p:opacity-100 transition-opacity" />
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-[11px] font-mono opacity-60">
                    {format(group.createdAt.toDate(), 'MM.dd.yyyy')}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    {isAdmin && (
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-none"
                          onClick={() => {
                            setAssigningGroup(group);
                            setSelectedProjectIds(projects.filter(p => p.groupId === group.id).map(p => p.id));
                            setIsAssignOpen(true);
                          }}
                        >
                          <Plus className="h-3.5 w-3.5 opacity-50" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-none"
                          onClick={() => {
                            setEditingGroup(group);
                            setIsEditOpen(true);
                          }}
                        >
                          <Edit2 className="h-3.5 w-3.5 opacity-50" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-none hover:text-destructive"
                          onClick={() => handleDeleteGroup(group.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 opacity-50 hover:opacity-100" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="rounded-none border-border bg-background sm:max-w-[425px]">
          <DialogHeader className="space-y-2 border-b border-border pb-4">
            <DialogTitle className="font-serif italic text-xl tracking-tight">{t('projects.groups.dialog.title')}</DialogTitle>
            <DialogDescription className="text-[11px] font-mono uppercase tracking-widest opacity-60">
              {t('projects.groups.dialog.description')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddGroup} className="space-y-6 pt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-serif italic text-[11px] uppercase tracking-widest opacity-70">{t('projects.groups.dialog.nameLabel')}</Label>
                <Input 
                  value={newGroup.name} 
                  onChange={e => setNewGroup({...newGroup, name: e.target.value})} 
                  placeholder="e.g., Core Services, Legacy, Experiments"
                  className="rounded-none border-border" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label className="font-serif italic text-[11px] uppercase tracking-widest opacity-70">{t('projects.groups.dialog.descriptionLabel')}</Label>
                <Input 
                  value={newGroup.description} 
                  onChange={e => setNewGroup({...newGroup, description: e.target.value})} 
                  placeholder="Optional context for this group..."
                  className="rounded-none border-border" 
                />
              </div>
              <div className="space-y-2">
                <Label className="font-serif italic text-[11px] uppercase tracking-widest opacity-70">Internal Notes</Label>
                <Textarea 
                  value={newGroup.notes} 
                  onChange={e => setNewGroup({...newGroup, notes: e.target.value})} 
                  placeholder="Extended notes or strategy..."
                  className="rounded-none border-border min-h-[100px]" 
                />
              </div>
            </div>
            <DialogFooter className="pt-4 border-t border-border">
              <Button type="submit" className="w-full rounded-none bg-foreground text-background font-mono text-[10px] uppercase tracking-widest">{t('common.save')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="rounded-none border-border bg-background sm:max-w-[425px]">
          <DialogHeader className="space-y-2 border-b border-border pb-4">
            <DialogTitle className="font-serif italic text-xl tracking-tight">Modify Group Identity</DialogTitle>
            <DialogDescription className="text-[11px] font-mono uppercase tracking-widest opacity-60">
              Update name and logical description.
            </DialogDescription>
          </DialogHeader>
          {editingGroup && (
            <form onSubmit={handleUpdateGroup} className="space-y-6 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-serif italic text-[11px] uppercase tracking-widest opacity-70">{t('projects.groups.dialog.nameLabel')}</Label>
                  <Input 
                    value={editingGroup.name} 
                    onChange={e => setEditingGroup({...editingGroup, name: e.target.value})} 
                    className="rounded-none border-border" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-serif italic text-[11px] uppercase tracking-widest opacity-70">{t('projects.groups.dialog.descriptionLabel')}</Label>
                  <Input 
                    value={editingGroup.description || ''} 
                    onChange={e => setEditingGroup({...editingGroup, description: e.target.value})} 
                    className="rounded-none border-border" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-serif italic text-[11px] uppercase tracking-widest opacity-70">Internal Notes</Label>
                  <Textarea 
                    value={editingGroup.notes || ''} 
                    onChange={e => setEditingGroup({...editingGroup, notes: e.target.value})} 
                    className="rounded-none border-border min-h-[100px]" 
                  />
                </div>
              </div>
              <DialogFooter className="pt-4 border-t border-border">
                <Button type="submit" className="w-full rounded-none bg-foreground text-background font-mono text-[10px] uppercase tracking-widest">{t('common.save')}</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Projects Dialog */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent className="rounded-none border-border bg-background sm:max-w-[500px]">
          <DialogHeader className="space-y-2 border-b border-border pb-4">
            <DialogTitle className="font-serif italic text-xl tracking-tight">Assign Projects to Group</DialogTitle>
            <DialogDescription className="text-[11px] font-mono uppercase tracking-widest opacity-60">
              {assigningGroup?.name} : Select streams to include in this bucket.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4 max-h-[400px] overflow-y-auto pr-2">
            <div className="space-y-2">
              <Label className="font-serif italic text-[11px] uppercase tracking-widest opacity-70">Available Projects</Label>
              <div className="grid grid-cols-1 gap-2">
                {projects.map(p => {
                  const isChecked = selectedProjectIds.includes(p.id);
                  const belongsToOther = p.groupId && p.groupId !== assigningGroup?.id;
                  
                  return (
                    <div 
                      key={p.id} 
                      onClick={() => {
                        if (isChecked) {
                          setSelectedProjectIds(selectedProjectIds.filter(id => id !== p.id));
                        } else {
                          setSelectedProjectIds([...selectedProjectIds, p.id]);
                        }
                      }}
                      className={`flex items-center justify-between p-3 border cursor-pointer transition-colors ${
                        isChecked ? 'border-foreground bg-foreground/5' : 'border-border hover:bg-muted'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="text-[12px] font-medium uppercase tracking-tight">{p.name}</div>
                        <div className="text-[10px] font-mono opacity-50 uppercase">
                          Type: {p.type} {p.groupId && p.groupId !== assigningGroup?.id && `(In: ${groups.find(g => g.id === p.groupId)?.name})`}
                        </div>
                      </div>
                      <div className={`w-4 h-4 border ${isChecked ? 'bg-foreground border-foreground' : 'border-border'} flex items-center justify-center`}>
                        {isChecked && <Plus className="w-3 h-3 text-background" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter className="pt-4 border-t border-border">
            <Button onClick={handleAssignProjects} className="w-full rounded-none bg-foreground text-background font-mono text-[10px] uppercase tracking-widest">
              Synchronize Assignments
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
