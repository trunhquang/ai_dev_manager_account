import { SidebarTrigger } from '@/components/ui/sidebar';
import { Bell, Search, Activity, Globe } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Header() {
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return t('common.dashboard');
    if (path.startsWith('/accounts')) return t('common.accounts');
    if (path.startsWith('/projects')) return t('common.projects');
    return '';
  };

  return (
    <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6 shrink-0 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors rounded-none" />
        <div className="h-4 w-px bg-border mx-2 hidden sm:block" />
        <h2 className="text-sm font-serif italic tracking-tight text-foreground sm:block hidden">
          {getPageTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 bg-[#F9F9F8] border border-border rounded-none px-3 py-1.5 focus-within:bg-white transition-all">
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder={t('common.search')} 
            className="bg-transparent border-none outline-none text-[11px] text-foreground w-48 placeholder:text-muted-foreground opacity-70"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <button className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), "h-8 gap-2 px-2 hover:bg-accent/50 rounded-none border border-border cursor-pointer")}>
                <Globe className="w-3.5 h-3.5" />
                <span className="text-[10px] font-mono uppercase leading-none">{language}</span>
              </button>
            } />
            <DropdownMenuContent align="end" className="rounded-none">
              <DropdownMenuItem 
                onClick={() => setLanguage('en')}
                className={language === 'en' ? 'bg-accent' : ''}
              >
                English
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setLanguage('vi')}
                className={language === 'vi' ? 'bg-accent' : ''}
              >
                Tiếng Việt
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-[#EBEAE7] rounded-none transition-all relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-foreground border border-background" />
          </button>
          <div className="flex items-center gap-2 px-3 py-1 border border-border bg-[#F1F1F0]">
            <Activity className="w-3 h-3 text-[#10B981]" />
            <span className="text-[9px] text-muted-foreground font-mono uppercase tracking-widest leading-none">SYS_READY</span>
          </div>
        </div>
      </div>
    </header>
  );
}
