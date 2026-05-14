import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { AuthLayout } from './components/layout/AuthLayout';
import { AppLayout } from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import Projects from './pages/Projects';
import ProjectGroups from './pages/ProjectGroups';
import Providers from './pages/Providers';
import ProjectDetail from './pages/ProjectDetail';
import Login from './pages/Login';
import { Toaster } from '@/components/ui/sonner';
import { LanguageProvider } from './contexts/LanguageContext';

export default function App() {
  const { initialize, user, loading } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background text-foreground">
        <div className="animate-pulse flex flex-col items-center gap-6">
          <div className="w-16 h-16 border border-border flex items-center justify-center bg-[#F9F9F8]">
            <div className="w-8 h-8 border border-foreground border-t-transparent animate-spin" />
          </div>
          <p className="text-[10px] font-mono tracking-[0.3em] uppercase opacity-60">Initializing System Context...</p>
        </div>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
          </Route>

          {/* Private Routes */}
          <Route element={user ? <AppLayout /> : <Navigate to="/login" replace />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/project-groups" element={<ProjectGroups />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/providers" element={<Providers />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-right" />
      </BrowserRouter>
    </LanguageProvider>
  );
}
