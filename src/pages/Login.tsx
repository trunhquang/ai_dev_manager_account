import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, browserPopupRedirectResolver } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Terminal, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider, browserPopupRedirectResolver);
      toast.success('Access Granted', { description: 'Welcome to AI Dev Manager' });
    } catch (error: any) {
      console.error('Login Error:', error);
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        toast.error(t('login.popupClosed'), { 
          description: t('login.popupClosedDesc'),
          action: {
            label: t('login.openNewTab'),
            onClick: () => window.open(window.location.href, '_blank')
          },
          duration: 10000
        });
      } else if (error.code === 'auth/network-request-failed') {
        toast.error(t('login.networkError'), { 
          description: t('login.networkErrorDesc'),
          action: {
            label: t('login.openNewTab'),
            onClick: () => window.open(window.location.href, '_blank')
          },
          duration: 10000
        });
      } else {
        toast.error(t('login.authFailed'), { description: error.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background border border-border shadow-sm w-full max-w-md overflow-hidden">
      <div className="p-8 border-b border-border bg-[#F9F9F8]">
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 border border-border bg-background flex items-center justify-center">
            <Terminal className="w-8 h-8 text-foreground" />
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-serif italic tracking-tight text-foreground">{t('login.title')}</h1>
          <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-[0.2em] mt-2 opacity-60">
            {t('login.subtitle')}
          </p>
        </div>
      </div>
      <div className="p-8 space-y-6">
        <div className="p-4 border border-border bg-[#F1F1F0] italic font-serif text-[13px] leading-relaxed text-muted-foreground opacity-80">
          <div className="flex items-start gap-4">
            <ShieldCheck className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0" />
            <p>
              {t('login.description')}
            </p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          onClick={handleGoogleLogin} 
          disabled={loading}
          className="w-full rounded-none border border-border bg-foreground text-background hover:bg-muted hover:text-foreground transition-all h-12 font-serif italic text-base gap-3"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-background border-t-transparent animate-spin" />
          ) : (
            <svg className="h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
              <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
            </svg>
          )}
          {t('login.button')}
        </Button>

        <div className="flex items-center justify-center pt-2">
          <p className="text-[9px] text-muted-foreground uppercase font-mono tracking-[0.3em] opacity-40">
            Internal Auth / v.2.4.0-GRID
          </p>
        </div>
      </div>
    </div>
  );
}
