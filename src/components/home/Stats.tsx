import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export function Stats() {
  const { t } = useLanguage();

  const stats = [
    { value: 395, suffix: '+', labelKey: 'stats.articles', icon: '📜', color: 'primary' },
    { value: 12, suffix: '', labelKey: 'stats.schedules', icon: '📋', color: 'accent' },
    { value: 106, suffix: '', labelKey: 'stats.amendments', icon: '✏️', color: 'gold' },
    { value: 1949, suffix: '', labelKey: 'stats.adopted', icon: '🗓️', color: 'secondary' },
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-primary/5 via-accent/5 to-gold/5 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 text-sm font-medium text-muted-foreground mb-4">
              <span>🏛️</span> {t('stats.badge')}
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 font-display">
              {t('stats.title').split('Constitution')[0]}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {t('stats.title').includes('Longest Written') ? 'Longest Written' : ''}
              </span>
              {' '}Constitution
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t('stats.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, index) => (
              <StatCard key={stat.labelKey} stat={{ ...stat, label: t(stat.labelKey) }} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ stat, index }: { stat: { value: number; suffix: string; label: string; icon: string; color: string }; index: number }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 150);
    return () => clearTimeout(timer);
  }, [index]);

  useEffect(() => {
    if (!isVisible) return;
    
    const duration = 1500;
    const steps = 50;
    const increment = stat.value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= stat.value) {
        setCount(stat.value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [isVisible, stat.value]);

  const colorClasses = {
    primary: 'from-primary/10 to-primary/5 border-primary/20 hover:border-primary/40',
    accent: 'from-accent/10 to-accent/5 border-accent/20 hover:border-accent/40',
    gold: 'from-gold/10 to-gold/5 border-gold/20 hover:border-gold/40',
    secondary: 'from-secondary/10 to-secondary/5 border-secondary/20 hover:border-secondary/40',
  };

  const textColors = {
    primary: 'from-primary to-primary/70',
    accent: 'from-accent to-accent/70',
    gold: 'from-gold to-gold/70',
    secondary: 'from-secondary to-secondary/70',
  };

  return (
    <div
      className={`relative text-center p-6 md:p-8 rounded-3xl bg-gradient-to-br ${colorClasses[stat.color as keyof typeof colorClasses]} border backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-xl group ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${colorClasses[stat.color as keyof typeof colorClasses]} opacity-0 group-hover:opacity-50 blur-xl transition-opacity -z-10`} />
      
      <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
        {stat.icon}
      </div>
      <div className={`text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-br ${textColors[stat.color as keyof typeof textColors]} bg-clip-text text-transparent mb-2`}>
        {count}{stat.suffix}
      </div>
      <div className="text-sm md:text-base text-muted-foreground font-medium">
        {stat.label}
      </div>
    </div>
  );
}
