import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Provider } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Trash2, 
  Edit2, 
  Shield,
  Layers,
  Info
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Providers() {
  const { t } = useLanguage();
  const { profile } = useAuthStore();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentProvider, setCurrentProvider] = useState<Provider | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    specialInfo: ''
  });

  const seedDefaultProviders = async () => {
    const defaults = [
      { name: 'OpenAI', description: 'Industry leader. Home of GPT-4o and o1-preview models. Highly versatile for all tasks.', specialInfo: 'Global / Multi-region' },
      { name: 'Anthropic', description: 'Focus on safety and reasoning. Claude 3.5 Sonnet is widely considered a top-tier coding model.', specialInfo: 'AWS / GCP / Tier 1' },
      { name: 'Google Gemini', description: 'Native multi-modality and massive context windows (up to 2M+ tokens). Excellent for large codebase analysis.', specialInfo: 'GCP Native / AI Studio' },
      { name: 'DeepSeek', description: 'Extremely popular high-performance models with very aggressive pricing. Great for high-volume tasks.', specialInfo: 'DeepSeek API / Low Cost' },
      { name: 'Groq', description: 'The fastest inference in the world using LPU architecture. Native support for open models like Llama 3 and Mixtral.', specialInfo: 'Ultra-fast / Real-time' },
      { name: 'Mistral AI', description: 'European leader in open-weight models. Fine-tuned for efficiency and performance.', specialInfo: 'Mese-est / European HQ' },
      { name: 'Together AI', description: 'Premier cloud for open-source models with high availability and fast inference.', specialInfo: 'Open Source Hub' }
    ];

    try {
      const existingNames = providers.map(p => p.name.toLowerCase());
      let addedCount = 0;

      for (const provider of defaults) {
        if (!existingNames.includes(provider.name.toLowerCase())) {
          await addDoc(collection(db, 'providers'), {
            ...provider,
            createdAt: serverTimestamp()
          });
          addedCount++;
        }
      }

      if (addedCount > 0) {
        toast.success(`Initialized ${addedCount} new providers`, { description: 'The registry has been updated with popular industry assets.' });
      } else {
        toast.info('Registry already synchronized', { description: 'All popular providers are already present in the system.' });
      }
    } catch (error: any) {
      toast.error('Seeding failed', { description: error.message });
    }
  };

  useEffect(() => {
    if (!profile) return;
    const q = query(collection(db, 'providers'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Provider[];
      setProviders(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [profile]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    try {
      await addDoc(collection(db, 'providers'), {
        ...formData,
        createdAt: serverTimestamp()
      });
      setIsAddOpen(false);
      setFormData({ name: '', description: '', specialInfo: '' });
      toast.success('Provider initialized successfully');
    } catch (error: any) {
      toast.error('Initialization failed', { description: error.message });
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProvider || !formData.name) return;
    try {
      await updateDoc(doc(db, 'providers', currentProvider.id), {
        ...formData
      });
      setIsEditOpen(false);
      setCurrentProvider(null);
      toast.success('Provider metadata updated');
    } catch (error: any) {
      toast.error('Update failed', { description: error.message });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you certain you wish to de-provision this provider?')) return;
    try {
      await deleteDoc(doc(db, 'providers', id));
      toast.success('Provider de-provisioned');
    } catch (error: any) {
      toast.error('De-provisioning failed', { description: error.message });
    }
  };

  const openEdit = (provider: Provider) => {
    setCurrentProvider(provider);
    setFormData({
      name: provider.name,
      description: provider.description || '',
      specialInfo: provider.specialInfo || ''
    });
    setIsEditOpen(true);
  };

  const filteredProviders = providers.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-serif italic tracking-tight">Provider Registry</h2>
          <p className="text-xs font-mono opacity-50 uppercase tracking-widest">Global Resource Definition Interface</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={seedDefaultProviders} 
            className="rounded-none border-border font-mono text-[10px] uppercase tracking-tighter h-9"
          >
            Seed Popular Assets
          </Button>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-30 group-focus-within:opacity-100 transition-opacity" />
            <Input 
              placeholder="Search providers..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 rounded-none border-border w-64 bg-background/50 focus:bg-background transition-all font-mono text-[11px] uppercase"
            />
          </div>
          <Button onClick={() => setIsAddOpen(true)} className="rounded-none bg-foreground text-background font-serif italic hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            New Provider
          </Button>
        </div>
      </div>

      <div className="border border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border bg-[#EBEAE7] hover:bg-[#EBEAE7]">
              <TableHead className="font-serif italic text-[11px] uppercase tracking-[0.1em] text-muted-foreground opacity-60 h-10 px-6">Provider Identity</TableHead>
              <TableHead className="font-serif italic text-[11px] uppercase tracking-[0.1em] text-muted-foreground opacity-60 h-10 px-6">Definition</TableHead>
              <TableHead className="font-serif italic text-[11px] uppercase tracking-[0.1em] text-muted-foreground opacity-60 h-10 px-6">Special Attributes</TableHead>
              <TableHead className="font-serif italic text-[11px] uppercase tracking-[0.1em] text-muted-foreground opacity-60 h-10 px-6 text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="h-32 text-center font-mono text-[10px] opacity-40 uppercase">Synchronizing...</TableCell></TableRow>
            ) : filteredProviders.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="h-32 text-center font-mono text-[10px] opacity-40 uppercase">No providers found in registry</TableCell></TableRow>
            ) : (
              filteredProviders.map(provider => (
                <TableRow key={provider.id} className="border-b border-border hover:bg-[#F9F9F8] transition-colors group">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-none border border-border flex items-center justify-center bg-background group-hover:border-foreground transition-colors">
                        <Layers className="w-4 h-4 opacity-40 group-hover:opacity-100" />
                      </div>
                      <div>
                        <p className="font-serif italic text-sm group-hover:translate-x-1 transition-transform">{provider.name}</p>
                        <p className="text-[9px] font-mono opacity-40 uppercase tracking-tighter">ID: {provider.id.substring(0, 8)}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <p className="text-xs opacity-70 max-w-md line-clamp-2">{provider.description || 'No definition provided'}</p>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <Info className="w-3 h-3 opacity-30" />
                       <span className="text-[10px] font-mono opacity-60 italic">{provider.specialInfo || 'Standard Parameters'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-none hover:bg-foreground hover:text-background transition-colors">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      } />
                      <DropdownMenuContent align="end" className="rounded-none bg-background border-border shadow-xl">
                        <DropdownMenuItem onClick={() => openEdit(provider)} className="font-serif italic cursor-pointer gap-2">
                          <Edit2 className="w-3.5 h-3.5" />
                          Modify Entry
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(provider.id)} className="font-serif italic text-destructive cursor-pointer gap-2">
                          <Trash2 className="w-3.5 h-3.5" />
                          De-provision
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="rounded-none border-border bg-background sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-serif italic text-xl">Initialize New Provider</DialogTitle>
            <p className="text-[10px] font-mono opacity-50 uppercase tracking-widest mt-1">Resource Definition Sequence</p>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="font-serif italic text-[11px] uppercase tracking-widest opacity-70">Provider Name</Label>
              <Input 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                className="rounded-none border-border bg-muted/30 focus:bg-background" 
                placeholder="e.g. Google Vertex AI"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="font-serif italic text-[11px] uppercase tracking-widest opacity-70">Definition / Description</Label>
              <Textarea 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                className="rounded-none border-border bg-muted/30 focus:bg-background min-h-[100px]" 
                placeholder="Describe the capabilities and scope of this resource..."
              />
            </div>
            <div className="space-y-2">
              <Label className="font-serif italic text-[11px] uppercase tracking-widest opacity-70">Special Attributes</Label>
              <Input 
                value={formData.specialInfo} 
                onChange={e => setFormData({...formData, specialInfo: e.target.value})} 
                className="rounded-none border-border bg-muted/30 focus:bg-background" 
                placeholder="Region, Tier, or specific identifying traits"
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-none border-border">Cancel</Button>
              <Button type="submit" className="rounded-none bg-foreground text-background font-serif italic">Authorize Entry</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="rounded-none border-border bg-background sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-serif italic text-xl">Modify Resource Entry</DialogTitle>
            <p className="text-[10px] font-mono opacity-50 uppercase tracking-widest mt-1">Registry Modification Protocol</p>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="font-serif italic text-[11px] uppercase tracking-widest opacity-70">Provider Name</Label>
              <Input 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                className="rounded-none border-border bg-muted/30 focus:bg-background" 
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="font-serif italic text-[11px] uppercase tracking-widest opacity-70">Definition / Description</Label>
              <Textarea 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                className="rounded-none border-border bg-muted/30 focus:bg-background min-h-[100px]" 
              />
            </div>
            <div className="space-y-2">
              <Label className="font-serif italic text-[11px] uppercase tracking-widest opacity-70">Special Attributes</Label>
              <Input 
                value={formData.specialInfo} 
                onChange={e => setFormData({...formData, specialInfo: e.target.value})} 
                className="rounded-none border-border bg-muted/30 focus:bg-background" 
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} className="rounded-none border-border">Cancel</Button>
              <Button type="submit" className="rounded-none bg-foreground text-background font-serif italic">Confirm Modification</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
