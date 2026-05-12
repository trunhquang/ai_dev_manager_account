import * as React from 'react';
import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AIAccount, Project, DevSession } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
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

  const chartData = accounts.map(a => ({
    name: a.email.split('@')[0],
    usage: Math.round(((a.dailyTokenLimit - a.currentTokenLeft) / a.dailyTokenLimit) * 100),
    tokens: a.currentTokenLeft
  })).sort((a, b) => b.usage - a.usage).slice(0, 5);

  const statusData = [
    { name: 'Active', value: activeAccounts, color: '#10b981' },
    { name: 'Cooldown', value: accounts.filter(a => a.status === 'cooldown').length, color: '#f59e0b' },
    { name: 'Banned', value: accounts.filter(a => a.status === 'banned').length, color: '#ef4444' },
  ];

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
          value={`${Math.round(chartData.reduce((acc, curr) => acc + curr.usage, 0) / (chartData.length || 1))}%`} 
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

      <div className="grid grid-cols-1 lg:grid-cols-3 bg-background">
        <Card className="lg:col-span-2 rounded-none border-0 border-r border-border">
          <CardHeader className="bg-background border-b border-border py-3">
            <CardTitle className="text-[11px] font-serif italic uppercase tracking-[0.1em] text-muted-foreground opacity-70">{t('dashboard.charts.usageTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="h-80 p-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="0" stroke="#1A1A1A" horizontal={true} vertical={false} opacity={0.1} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#1A1A1A', fontSize: 10, fontFamily: 'Courier New, monospace', opacity: 0.6 }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #1A1A1A', borderRadius: '0px', fontSize: '10px', fontFamily: 'Courier New' }}
                />
                <Bar dataKey="usage" radius={0}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.usage > 80 ? '#EF4444' : '#2563EB'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-none border-0">
          <CardHeader className="bg-background border-b border-border py-3">
            <CardTitle className="text-[11px] font-serif italic uppercase tracking-[0.1em] text-muted-foreground opacity-70">{t('dashboard.charts.statusDistribution')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-8 p-6">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="#1A1A1A"
                    strokeWidth={0.5}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #1A1A1A', borderRadius: '0px', fontFamily: 'Courier New' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full">
              {statusData.map(s => (
                <div key={s.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 border border-border" style={{ backgroundColor: s.color }} />
                  <span className="text-[10px] uppercase font-mono text-muted-foreground tracking-tighter">{s.name}: {s.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 bg-background border-t border-border">
        <Card className="rounded-none border-0 border-r border-border">
          <CardHeader className="py-3 border-b border-border">
            <CardTitle className="text-[11px] font-serif italic uppercase tracking-[0.1em] text-muted-foreground opacity-70">Active Project Registry</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {projects.slice(0, 5).map(p => (
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
                              acc.id === p.currentAccountId ? "bg-[#10B981]" : "bg-muted-foreground group-hover:bg-background/40"
                            )} />
                            <span className="text-[8px] font-mono opacity-50 group-hover:opacity-100 uppercase tracking-tighter">
                              {acc.email.split('@')[0]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="rounded-none border-current text-[10px] h-5 px-1.5 uppercase font-semibold">{p.status}</Badge>
                </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-none border-0 overflow-hidden">
          <CardHeader className="py-3 border-b border-border">
            <CardTitle className="text-[11px] font-serif italic uppercase tracking-[0.1em] text-muted-foreground opacity-70">Resource Activity Pool</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {accounts.slice(0, 5).map(acc => {
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
                          linkedProjects.map(p => (
                            <div key={p.id} className="flex items-center gap-1">
                              <div className={cn(
                                "w-1 h-1",
                                p.currentAccountId === acc.id ? "bg-[#10B981]" : "bg-muted-foreground group-hover:bg-background/40"
                              )} />
                              <span className={cn(
                                "text-[8px] font-mono opacity-50 group-hover:opacity-100 uppercase tracking-tighter",
                                p.currentAccountId === acc.id && "font-bold"
                              )}>
                                {p.name.substring(0, 10)}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-mono opacity-60 group-hover:opacity-100 leading-none">{acc.currentTokenLeft.toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="bg-[#F9F9F8] p-6 space-y-6 lg:col-span-2">
          <div className="space-y-4">
            <h3 className="text-[11px] font-serif italic uppercase tracking-[0.1em] text-muted-foreground opacity-70 border-b border-border pb-2">System Diagnostics</h3>
            <div className="space-y-4 opacity-80">
              <div className="p-4 bg-background border border-border">
                <p className="font-serif italic text-sm border-b border-border pb-2 mb-2">Internal Flux Monitor</p>
                <p className="text-[10px] font-mono opacity-60 mb-2 leading-none">STATUS: NOMINAL | FREQ: 60Hz</p>
                <div className="text-xs leading-relaxed opacity-80">
                  Real-time monitoring of AI development streams. All systems operating within standard parameters.
                </div>
              </div>
              <div className="p-4 bg-background border border-border">
                <p className="font-serif italic text-sm border-b border-border pb-2 mb-2">Context Handoff Tool</p>
                <p className="text-[10px] font-mono opacity-60 mb-2 leading-none">VERSION: 4.2.0 | REGION: GLOBAL</p>
                <div className="text-xs leading-relaxed opacity-80">
                  Pending transfers: 03. Optimization of cross-account context mapping in progress.
                </div>
              </div>
            </div>
          </div>
        </div>
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
