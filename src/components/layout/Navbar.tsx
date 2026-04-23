import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, BookOpen, Gamepad2, MessageCircle, FileText, LogIn, BarChart3, Sparkles, ChevronRight, UserCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';
import { LanguageSelector } from '@/components/learn/LanguageSelector';
import { useLanguage } from '@/contexts/LanguageContext';

const navItems = [
  { path: '/', labelKey: 'nav.home', icon: Sparkles },
  { path: '/learn', labelKey: 'nav.learn', icon: BookOpen },
  { path: '/games', labelKey: 'nav.games', icon: Gamepad2 },
  { path: '/chat', labelKey: 'nav.askAi', icon: MessageCircle },
  { path: '/amendments', labelKey: 'nav.amendments', icon: FileText },
  { path: '/progress', labelKey: 'nav.progress', icon: BarChart3 },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Spacer for fixed navbar */}
      <div className="h-20" />
      
      <nav className={cn(
        "fixed left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl transition-all duration-500",
        scrolled 
          ? "top-2 bg-background/92 backdrop-blur-2xl border border-border/50" 
          : "top-4 bg-background/75 backdrop-blur-xl border border-border/30",
        "rounded-2xl",
        scrolled ? "shadow-elevated" : "shadow-card"
      )}>
        <div className="px-4 lg:px-6">
          <div className="flex items-center justify-between h-14 lg:h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-accent/40 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500" />
                <div className="relative w-10 h-10 lg:w-11 lg:h-11 rounded-xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center shadow-md shadow-primary/20 group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-500 group-hover:scale-105">
                  <span className="text-xl lg:text-2xl">📜</span>
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-display font-bold text-lg lg:text-xl text-foreground tracking-tight">{t('nav.appName')}</h1>
                <p className="text-[10px] lg:text-xs text-muted-foreground -mt-0.5 font-medium tracking-wide">{t('nav.appTagline')}</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-0.5 bg-muted/40 rounded-xl p-1 border border-border/30">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}>
                    <button
                      className={cn(
                        "relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2",
                        isActive
                          ? "text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                      )}
                    >
                      {isActive && (
                        <span className="absolute inset-0 bg-gradient-to-r from-primary to-primary/85 rounded-lg shadow-md shadow-primary/20 animate-scale-in" />
                      )}
                      <Icon className={cn("w-4 h-4 relative z-10", isActive && "text-primary-foreground")} />
                      <span className="relative z-10">{t(item.labelKey)}</span>
                    </button>
                  </Link>
                );
              })}
            </div>

            {/* Right side - Desktop */}
            <div className="hidden lg:flex items-center gap-2.5">
              <LanguageSelector value={language} onChange={setLanguage} />
              <ThemeToggle />
              
              {user ? (
                <Link to="/profile">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2 text-muted-foreground hover:text-foreground rounded-xl"
                  >
                    <UserCircle className="w-4 h-4" />
                    <span className="hidden xl:inline">Profile</span>
                  </Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button variant="default" size="sm" className="gap-2 rounded-xl shadow-md shadow-primary/15 hover:shadow-lg hover:shadow-primary/20 transition-all">
                    <LogIn className="w-4 h-4" />
                    Get Started
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex lg:hidden items-center gap-2">
              <LanguageSelector value={language} onChange={setLanguage} />
              <ThemeToggle />
              <button
                className={cn(
                  "p-2.5 rounded-xl transition-all duration-300",
                  isOpen ? "bg-primary text-primary-foreground rotate-90" : "hover:bg-muted/50"
                )}
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={cn(
          "lg:hidden overflow-hidden transition-all duration-400 ease-in-out",
          isOpen ? "max-h-[500px] border-t border-border/40 opacity-100" : "max-h-0 opacity-0"
        )}>
          <div className="p-4 space-y-1.5">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                >
                  <div 
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
                      isActive
                        ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md shadow-primary/15"
                        : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                    )}
                    style={{ animationDelay: isOpen ? `${index * 50}ms` : '0ms' }}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{t(item.labelKey)}</span>
                    {isActive && <div className="ml-auto w-2 h-2 rounded-full bg-primary-foreground/60" />}
                  </div>
                </Link>
              );
            })}
            
            {/* Mobile Auth */}
            <div className="pt-3 mt-3 border-t border-border/40">
              {user ? (
                <Link to="/profile" onClick={() => setIsOpen(false)}>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-all">
                    <UserCircle className="w-5 h-5" />
                    <span className="font-medium">Profile</span>
                  </div>
                </Link>
              ) : (
                <Link to="/auth" onClick={() => setIsOpen(false)}>
                  <div className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md shadow-primary/15">
                    <div className="flex items-center gap-3">
                      <LogIn className="w-5 h-5" />
                      <span className="font-medium">Get Started</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
