import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, MessageCircle, Sparkles, ArrowRight, Play, Gamepad2, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden py-20 lg:py-28">
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/4 via-transparent to-accent/4" />
        <div className="absolute top-10 left-[5%] w-80 h-80 bg-primary/8 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-10 right-[5%] w-96 h-96 bg-accent/8 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gold/6 rounded-full blur-[100px] animate-float" style={{ animationDelay: '4s' }} />
        <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-secondary/6 rounded-full blur-[100px] animate-float" style={{ animationDelay: '3s' }} />
        
        {/* Subtle dot pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{
            backgroundImage: 'radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto text-center">
          {/* Animated badge */}
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/15 mb-12 animate-fade-in backdrop-blur-sm">
            <div className="relative">
              <Sparkles className="w-4 h-4 text-primary" />
              <div className="absolute inset-0 animate-ping">
                <Sparkles className="w-4 h-4 text-primary opacity-30" />
              </div>
            </div>
            <span className="text-sm font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t('hero.badge')}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-accent/15 text-accent text-xs font-bold border border-accent/20">{t('hero.badgeNew')}</span>
          </div>

          {/* Main heading */}
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-8 animate-fade-in tracking-tight leading-[1.08]" style={{ animationDelay: '0.1s' }}>
            {t('hero.titlePrefix')}{' '}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-primary via-saffron-light to-gold bg-clip-text text-transparent">
                {t('hero.titleHighlight')}
              </span>
              <span className="absolute -inset-2 bg-gradient-to-r from-primary/15 via-accent/15 to-gold/15 blur-3xl -z-10 rounded-2xl" />
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-14 max-w-3xl mx-auto animate-fade-in leading-relaxed" style={{ animationDelay: '0.2s' }}>
            {t('hero.subtitle')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Link to="/learn">
              <Button 
                size="xl" 
                className="group w-full sm:w-auto bg-gradient-to-r from-primary via-primary to-saffron-light text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-500 hover:scale-[1.03] border-0"
              >
                <Play className="w-5 h-5 mr-1 group-hover:scale-110 transition-transform" />
                {t('hero.startLearning')}
                <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/chat">
              <Button 
                variant="outline" 
                size="xl" 
                className="group w-full sm:w-auto border-2 border-border hover:border-primary/40 hover:bg-primary/5 backdrop-blur-sm"
              >
                <MessageCircle className="w-5 h-5 mr-1 group-hover:scale-110 transition-transform" />
                {t('hero.askAi')}
              </Button>
            </Link>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 mb-18 animate-fade-in" style={{ animationDelay: '0.35s' }}>
            {[
              { icon: Users, color: 'text-primary', value: '10,000+', label: t('hero.students') },
              { icon: BookOpen, color: 'text-accent', value: '8', label: t('hero.learningLevels') },
              { icon: Gamepad2, color: 'text-gold', value: '10+', label: t('hero.gamesCount') },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-2.5 text-muted-foreground">
                <div className="p-1.5 rounded-lg bg-muted/60">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <span className="text-sm"><strong className="text-foreground font-semibold">{stat.value}</strong> {stat.label}</span>
              </div>
            ))}
          </div>

          {/* Bento Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-fade-in max-w-4xl mx-auto" style={{ animationDelay: '0.4s' }}>
            {[
              { emoji: '📚', title: t('hero.featureLevelsTitle'), desc: t('hero.featureLevelsDesc'), cta: t('hero.explore'), color: 'primary' as const },
              { emoji: '🎮', title: t('hero.featureGamesTitle'), desc: t('hero.featureGamesDesc'), cta: t('hero.playNow'), color: 'accent' as const },
              { emoji: '🤖', title: t('hero.featureChatbotTitle'), desc: t('hero.featureChatbotDesc'), cta: t('hero.askNow'), color: 'gold' as const },
            ].map((feature, i) => {
              const colorMap = {
                primary: { border: 'border-primary/15 hover:border-primary/35', bg: 'from-primary/3 via-primary/8 to-primary/3', hover: 'from-primary/8', icon: 'bg-primary/10 group-hover:bg-primary/18', text: 'text-primary' },
                accent: { border: 'border-accent/15 hover:border-accent/35', bg: 'from-accent/3 via-accent/8 to-accent/3', hover: 'from-accent/8', icon: 'bg-accent/10 group-hover:bg-accent/18', text: 'text-accent' },
                gold: { border: 'border-gold/15 hover:border-gold/35', bg: 'from-gold/3 via-gold/8 to-gold/3', hover: 'from-gold/8', icon: 'bg-gold/10 group-hover:bg-gold/18', text: 'text-gold' },
              };
              const c = colorMap[feature.color];
              return (
                <div key={i} className={`group relative p-7 rounded-3xl bg-gradient-to-br ${c.bg} border ${c.border} transition-all duration-500 hover:-translate-y-2 hover:shadow-xl`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${c.hover} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`} />
                  <div className="relative">
                    <div className={`w-14 h-14 rounded-2xl ${c.icon} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500`}>
                      <span className="text-3xl">{feature.emoji}</span>
                    </div>
                    <h3 className="font-display text-lg font-bold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                    <div className={`flex items-center gap-1.5 mt-4 ${c.text} text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0`}>
                      <span>{feature.cta}</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
