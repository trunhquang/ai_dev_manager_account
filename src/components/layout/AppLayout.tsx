import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Header } from './Header';

export function AppLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background text-foreground w-full overflow-hidden">
        <AppSidebar />
        <SidebarInset className="flex w-full flex-col overflow-hidden bg-background">
          <Header />
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
