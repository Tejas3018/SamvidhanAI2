import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, Lock, LogOut, Mail, Shield, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user) {
        navigate('/auth');
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast({
        title: t('profile.updatePassword'),
        description: t('profile.minChars'),
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: t('profile.updatePassword'),
        description: "Passwords don't match",
        variant: "destructive",
      });
      return;
    }

    setUpdatingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        toast({
          title: t('profile.updatePassword'),
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: t('profile.updatePassword'),
          description: "Password updated successfully.",
        });
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {t('profile.backToHome')}
        </Link>

        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold">{t('profile.title')}</h1>
          <p className="text-muted-foreground mt-2">{t('profile.subtitle')}</p>
        </div>

        {/* Profile Info Card */}
        <div className="bg-card rounded-2xl border border-border shadow-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">{t('profile.accountInfo')}</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center">
                <Mail className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">{t('profile.emailAddress')}</p>
                <p className="font-medium truncate">{user?.email || 'No email'}</p>
              </div>
              <CheckCircle className="w-5 h-5 text-accent shrink-0" />
            </div>

            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">{t('profile.userId')}</p>
                <p className="font-mono text-sm truncate">{user?.id || 'Unknown'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center">
                <Shield className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{t('profile.accountCreated')}</p>
                <p className="font-medium">
                  {user?.created_at 
                    ? new Date(user.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'Unknown'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Update Password Card */}
        <div className="bg-card rounded-2xl border border-border shadow-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">{t('profile.updatePassword')}</h2>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">{t('profile.newPassword')}</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder={t('profile.enterNewPassword')}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-12 rounded-xl"
                disabled={updatingPassword}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('profile.confirmPassword')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder={t('profile.confirmNewPassword')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-12 rounded-xl"
                disabled={updatingPassword}
              />
            </div>

            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
              {t('profile.minChars')}
            </p>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl"
              disabled={updatingPassword || !newPassword || !confirmPassword}
            >
              {updatingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('profile.updating')}
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  {t('profile.updatePassword')}
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Logout Card */}
        <div className="bg-card rounded-2xl border border-destructive/20 shadow-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <LogOut className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{t('profile.signOut')}</h2>
              <p className="text-sm text-muted-foreground">{t('profile.signOutDesc')}</p>
            </div>
          </div>

          <Button
            variant="destructive"
            className="w-full h-12 rounded-xl"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t('profile.signOut')}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
