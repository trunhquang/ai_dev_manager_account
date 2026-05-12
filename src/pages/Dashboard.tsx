import * as React from 'react';
import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AIAccount, Project, DevSession } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { 
  Users, 
  Briefcase, 
  Activity, 
  Zap, 
  ArrowRightLeft,
  AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

import { useLanguage } from '@/contexts/LanguageContext';

export default function Dashboard() {
  const [accounts, setAccounts] = useState<AIAccount[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const unsubA = onSnapshot(query(collection(db, 'accounts')), (snap) => {
      setAccounts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AIAccount)));
    });
    const unsubP = onSnapshot(query(collection(db, 'projects')), (snap) => {
      setProjects(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
      setLoading(false);
    });
    return () => { unsubA(); unsubP(); };
  }, []);

  const totalAccounts = accounts.length;
  const activeAccounts = accounts.filter(a => a.status === 'active').length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const lowTokenAccounts = accounts.filter(a => a.currentTokenLeft < (a.dailyTokenLimit * 0.2)).length;
  
  const totalUsagePercent = accounts.length > 0 
    ? Math.round(accounts.reduce((acc, a) => acc + ((a.dailyTokenLimit - a.currentTokenLeft) / a.dailyTokenLimit), 0) / accounts.length * 100)
    : 0;

  return (
    <div className="space-y-0.5 bg-border border-b border-border">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 bg-background">
        <StatCard 
          title={t('dashboard.stats.activeAccounts')} 
          value={`0${activeAccounts}/${totalAccounts}`} 
          subtitle={`${activeAccounts} currently connected`} 
          icon={Users} 
        />
        <StatCard 
          title={t('dashboard.stats.projectsInPlay')} 
          value={activeProjects} 
          subtitle="Development in progress" 
          icon={Activity} 
        />
        <StatCard 
          title={t('dashboard.stats.avgTokenUsage')} 
          value={`${totalUsagePercent}%`} 
          subtitle="System efficiency" 
          icon={Zap} 
        />
        <StatCard 
          title={t('dashboard.stats.quotaAlerts')} 
          value={lowTokenAccounts} 
          subtitle="Accounts below 20%" 
          icon={AlertCircle} 
          isAlert={lowTokenAccounts > 0}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 bg-background border-t border-border">
        <Card className="rounded-none border-0 border-r border-border">
          <CardHeader className="py-3 border-b border-border">
            <CardTitle className="text-[11px] font-serif italic uppercase tracking-[0.1em] text-muted-foreground opacity-70">Active Project Registry</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {projects.map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 border-b border-border last:border-0 hover:bg-foreground hover:text-background group transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 border border-border group-hover:border-background flex items-center justify-center">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[13px] font-medium leading-none">{p.name}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 pt-1.5 border-t border-border/20 group-hover:border-background/20">
                        {accounts.filter(a => p.linkedAccountIds?.includes(a.id)).map(acc => (
                          <div key={acc.id} className="flex items-center gap-1 group-h-opacity-100">
                            <div className={cn(
                              "w-1 h-1",
                              acc.id === p.currentAccountId ? "bg-[#10B981]" : "bg-muted-foreground/30 group-hover:bg-background/40"
                            )} />
                            <span className={cn(
                              "text-[8px] font-mono uppercase tracking-tighter",
                              acc.id === p.currentAccountId ? "opacity-100 font-bold" : "opacity-40 group-hover:opacity-80"
                            )}>
                              {acc.email.split('@')[0]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className={cn(
                    "rounded-none border-current text-[10px] h-5 px-1.5 uppercase font-semibold",
                    p.status === 'active' ? "text-[#10B981]" : "text-muted-foreground"
                  )}>{p.status}</Badge>
                </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-none border-0 overflow-hidden">
          <CardHeader className="py-3 border-b border-border">
            <CardTitle className="text-[11px] font-serif italic uppercase tracking-[0.1em] text-muted-foreground opacity-70">Resource Activity Pool</CardTitle>
          </CardHeader>
          <CardContent className="p-0 max-h-[400px] overflow-y-auto">
            {accounts.map(acc => {
              const linkedProjects = projects.filter(p => p.linkedAccountIds?.includes(acc.id));
              return (
                <div key={acc.id} className="flex items-center justify-between p-4 border-b border-border last:border-0 hover:bg-foreground hover:text-background group transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 border border-border group-hover:border-background flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[13px] font-medium leading-none">{acc.email.split('@')[0]}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 pt-1.5 border-t border-border/20 group-hover:border-background/20">
                        {linkedProjects.length === 0 ? (
                          <span className="text-[8px] font-mono opacity-30 group-hover:opacity-50 uppercase tracking-tighter">Standby</span>
                        ) : (
                          linkedProjects.map(p => {
                            const isCurrent = p.currentAccountId === acc.id;
                            return (
                              <div key={p.id} className="flex items-center gap-1">
                                <div className={cn(
                                  "w-1 h-1",
                                  p.status === 'active' ? "bg-[#10B981]" : "bg-muted-foreground group-hover:bg-background/40"
                                )} />
                                <span className={cn(
                                  "text-[8px] font-mono uppercase tracking-tighter",
                                  isCurrent ? "opacity-100 font-bold underline decoration-accent/50" : "opacity-40 group-hover:opacity-80"
                                )}>
                                  {p.name.substring(0, 10)}
                                  {isCurrent && <span className="ml-0.5 text-[#10B981]">●</span>}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-mono opacity-60 group-hover:opacity-100 leading-none">{acc.currentTokenLeft.toLocaleString()}</p>
                    <p className="text-[8px] font-mono opacity-30 group-hover:opacity-60 uppercase mt-1">Tokens Remaining</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, isAlert }: any) {
  return (
    <Card className="rounded-none border-0 border-r border-border last:border-r-0 bg-background">
      <CardContent className="p-6">
        <p className="text-[10px] font-serif italic uppercase tracking-[0.1em] text-muted-foreground opacity-70 mb-4">{title}</p>
        <div className="flex items-baseline gap-2">
          <span className={cn("text-3xl font-mono font-bold leading-none", isAlert ? "text-destructive" : "text-foreground")}>{value}</span>
        </div>
        <p className="text-[10px] text-muted-foreground font-mono mt-4 uppercase opacity-60">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
