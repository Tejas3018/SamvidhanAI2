import { Layout } from '@/components/layout/Layout';
import { Hero } from '@/components/home/Hero';
import { LevelPreview } from '@/components/home/LevelPreview';
import { Stats } from '@/components/home/Stats';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageCircle, Gamepad2, FileText, ArrowRight, Sparkles, BarChart3, BookOpen } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Index = () => {
  const { t } = useLanguage();

  return (
    <Layout>
      <Hero />
      <Stats />
      <LevelPreview />
      
      {/* Quick Access Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-sm font-medium text-accent mb-4">
              <Sparkles className="w-4 h-4" />
              {t('quickAccess.badge')}
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 font-display">
              {t('quickAccess.title').split('More Features')[0]}
              <span className="bg-gradient-to-r from-accent to-gold bg-clip-text text-transparent">
                {t('quickAccess.title').includes('More Features') ? 'More Features' : t('quickAccess.title')}
              </span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t('quickAccess.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            <QuickAccessCard
              icon={<MessageCircle className="w-7 h-7" />}
              title={t('quickAccess.chatbot')}
              description={t('quickAccess.chatbotDesc')}
              link="/chat"
              color="primary"
              badge={t('quickAccess.popular')}
            />
            <QuickAccessCard
              icon={<Gamepad2 className="w-7 h-7" />}
              title={t('quickAccess.games')}
              description={t('quickAccess.gamesDesc')}
              link="/games"
              color="accent"
              badge="10+ Games"
            />
            <QuickAccessCard
              icon={<FileText className="w-7 h-7" />}
              title={t('quickAccess.amendments')}
              description={t('quickAccess.amendmentsDesc')}
              link="/amendments"
              color="gold"
            />
            <QuickAccessCard
              icon={<BarChart3 className="w-7 h-7" />}
              title={t('quickAccess.progress')}
              description={t('quickAccess.progressDesc')}
              link="/progress"
              color="secondary"
              badge={t('quickAccess.new')}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-gold/10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,hsl(var(--accent)/0.1),transparent_50%)]" />
        </div>
        
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-accent mb-8 shadow-2xl shadow-primary/30">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 font-display">
              {t('cta.title').split('Learning Journey')[0]}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {t('cta.title').includes('Learning Journey') ? 'Learning Journey' : ''}
              </span>
              ?
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              {t('cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/learn">
                <Button 
                  size="lg" 
                  className="group h-14 px-10 text-lg rounded-2xl bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all shadow-xl shadow-primary/25"
                >
                  {t('cta.startNow')}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/chat">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="h-14 px-10 text-lg rounded-2xl border-2"
                >
                  {t('cta.tryChat')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-border/50 bg-gradient-to-b from-muted/10 to-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md shadow-primary/15">
                <span className="text-2xl">📜</span>
              </div>
              <span className="font-display font-bold text-2xl">{t('nav.appName')}</span>
            </div>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
              {t('footer.tagline')}
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground mb-8">
              {[
                { to: '/learn', label: t('nav.learn') },
                { to: '/games', label: t('nav.games') },
                { to: '/chat', label: t('nav.askAi') },
                { to: '/progress', label: t('nav.progress') },
                { to: '/amendments', label: t('nav.amendments') },
              ].map(link => (
                <Link key={link.to} to={link.to} className="hover:text-primary transition-colors duration-300">{link.label}</Link>
              ))}
            </div>
            <div className="section-divider mb-6" />
            <p className="text-xs text-muted-foreground/70">
              {t('footer.copyright')}
            </p>
          </div>
        </div>
      </footer>
    </Layout>
  );
};

function QuickAccessCard({
  icon,
  title,
  description,
  link,
  color,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
  color: 'primary' | 'accent' | 'secondary' | 'gold';
  badge?: string;
}) {
  const { t } = useLanguage();

  const colorClasses = {
    primary: 'border-primary/20 hover:border-primary/50 from-primary/5 via-primary/10 to-primary/5',
    accent: 'border-accent/20 hover:border-accent/50 from-accent/5 via-accent/10 to-accent/5',
    secondary: 'border-secondary/20 hover:border-secondary/50 from-secondary/5 via-secondary/10 to-secondary/5',
    gold: 'border-gold/20 hover:border-gold/50 from-gold/5 via-gold/10 to-gold/5',
  };

  const iconColorClasses = {
    primary: 'text-primary bg-primary/10 group-hover:bg-primary/20',
    accent: 'text-accent bg-accent/10 group-hover:bg-accent/20',
    secondary: 'text-secondary bg-secondary/10 group-hover:bg-secondary/20',
    gold: 'text-gold bg-gold/10 group-hover:bg-gold/20',
  };

  const badgeColors = {
    primary: 'bg-primary/20 text-primary',
    accent: 'bg-accent/20 text-accent',
    secondary: 'bg-secondary/20 text-secondary',
    gold: 'bg-gold/20 text-gold',
  };

  return (
    <Link to={link}>
      <div className={`group relative p-6 rounded-3xl border-2 bg-gradient-to-br ${colorClasses[color]} backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl h-full`}>
        {badge && (
          <span className={`absolute -top-2 right-4 px-3 py-1 rounded-full text-xs font-bold ${badgeColors[color]}`}>
            {badge}
          </span>
        )}
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${iconColorClasses[color]} group-hover:scale-110`}>
          {icon}
        </div>
        <h3 className="font-bold text-lg mb-2 text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{description}</p>
        <span className="inline-flex items-center gap-2 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300">
          {t('quickAccess.explore')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </Link>
  );
}

export default Index;
