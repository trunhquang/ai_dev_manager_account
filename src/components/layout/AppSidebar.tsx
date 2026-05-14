import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Layers,
  History, 
  Terminal, 
  LogOut,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

export function AppSidebar() {
  const { profile, signOut } = useAuthStore();
  const location = useLocation();
  const { t } = useLanguage();

  const menuItems = [
    { title: t('common.dashboard'), icon: LayoutDashboard, path: '/' },
    { title: t('common.providers'), icon: Layers, path: '/providers' },
    { title: t('common.accounts'), icon: Users, path: '/accounts' },
    { title: t('common.projectGroups'), icon: Layers, path: '/project-groups' },
    { title: t('common.projects'), icon: Briefcase, path: '/projects' },
  ];

  return (
    <Sidebar variant="inset" className="border-r border-border bg-sidebar">
      <SidebarHeader className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center border border-border">
            <Terminal className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <h1 className="font-serif italic text-base tracking-tight text-foreground">{t('sidebar.brand')}</h1>
            <p className="text-[9px] text-muted-foreground font-mono uppercase tracking-widest leading-none">Internal Registry</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-6 py-6">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="text-muted-foreground font-serif italic text-[11px] uppercase tracking-[0.05em] mb-4 h-auto px-0 opacity-50">{t('sidebar.navMain')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton tooltip={item.title} className="p-0 h-auto" nativeButton={false} render={
                      <Link 
                        to={item.path} 
                        className={cn(
                          "flex items-center gap-3 py-2 transition-all duration-200 group text-xs font-medium",
                          isActive 
                            ? "text-accent border-l-2 border-accent pl-3 -ml-3 opacity-100" 
                            : "text-foreground opacity-70 hover:opacity-100 hover:text-accent"
                        )}
                      />
                    }>
                      <item.icon className={cn("w-4 h-4", isActive ? "text-accent" : "text-muted-foreground")} />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-6 border-t border-border mt-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-background flex items-center justify-center text-[10px] font-mono font-bold text-foreground border border-border">
            {profile?.displayName?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-foreground truncate uppercase tracking-tighter">{profile?.displayName}</p>
            <p className="text-[9px] text-muted-foreground truncate uppercase font-mono">{profile?.role}</p>
          </div>
        </div>
        <button 
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 py-2 text-[10px] text-foreground font-medium opacity-70 hover:opacity-100 hover:text-destructive transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="uppercase tracking-widest font-mono">{t('common.logout')}</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
