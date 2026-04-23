import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { levels } from '@/data/levels';
import { Lock, CheckCircle2, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { useProgress } from '@/hooks/useProgress';
import { useLanguage } from '@/contexts/LanguageContext';

export function LevelPreview() {
  const displayLevels = levels.slice(0, 4);
  const { isLevelCompleted, getLevelProgress } = useProgress();
  const { t } = useLanguage();

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-muted/50 to-background" />
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-sm font-medium text-primary mb-4">
            <Sparkles className="w-4 h-4" />
            {t('levelPreview.badge')}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 font-display">
            {t('levelPreview.title').split('Journey')[0]}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t('levelPreview.title').includes('Journey') ? 'Journey' : ''}
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('levelPreview.subtitle')}
          </p>
        </div>

        {/* Journey path visualization */}
        <div className="relative max-w-5xl mx-auto mb-12">
          {/* Connecting line - hidden on mobile */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-accent/20 to-gold/20 -translate-y-1/2 rounded-full" />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {displayLevels.map((level, index) => (
              <LevelCard 
                key={level.id} 
                level={level} 
                index={index} 
                isCompleted={isLevelCompleted(level.id)}
                progress={getLevelProgress(level.id)}
              />
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link to="/learn">
            <Button 
              size="lg" 
              className="group gap-2 rounded-2xl px-8 h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all"
            >
              {t('levelPreview.viewAll')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function LevelCard({ 
  level, 
  index, 
  isCompleted,
  progress 
}: { 
  level: typeof levels[0]; 
  index: number;
  isCompleted: boolean;
  progress: number;
}) {
  const isUnlocked = index === 0 || isCompleted;
  const { t } = useLanguage();

  const gradientColors = [
    'from-primary/10 to-primary/5 border-primary/30 hover:border-primary/50',
    'from-accent/10 to-accent/5 border-accent/30 hover:border-accent/50',
    'from-gold/10 to-gold/5 border-gold/30 hover:border-gold/50',
    'from-secondary/10 to-secondary/5 border-secondary/30 hover:border-secondary/50',
  ];

  const badgeColors = [
    'bg-primary text-primary-foreground',
    'bg-accent text-accent-foreground',
    'bg-gold text-white',
    'bg-secondary text-secondary-foreground',
  ];

  return (
    <Link to={isUnlocked ? `/learn/${level.id}` : '#'}>
      <div 
        className={`group relative rounded-3xl p-6 border-2 transition-all duration-500 ${
          isUnlocked 
            ? `bg-gradient-to-br ${gradientColors[index]} cursor-pointer hover:-translate-y-3 hover:shadow-2xl` 
            : 'bg-muted/30 border-muted/50 opacity-60 cursor-not-allowed'
        }`}
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        {/* Level number badge */}
        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:-top-3 md:-right-3 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-lg transition-transform group-hover:scale-110 ${
          isCompleted
            ? 'bg-accent text-accent-foreground'
            : isUnlocked
            ? badgeColors[index]
            : 'bg-muted text-muted-foreground'
        }`}>
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : isUnlocked ? (
            level.id
          ) : (
            <Lock className="w-4 h-4" />
          )}
        </div>

        {/* Icon with glow */}
        <div className="relative mb-4">
          <div className="text-5xl transition-transform duration-300 group-hover:scale-110">
            {level.icon}
          </div>
          {isUnlocked && (
            <div className="absolute inset-0 blur-xl bg-current opacity-20 -z-10" />
          )}
        </div>

        {/* Content */}
        <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1">
          {level.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
          {level.description}
        </p>

        {/* XP and action */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-lg">✨</span>
            <span className="text-sm font-bold text-gold">+{level.xpReward} {t('common.xp')}</span>
          </div>
          {isUnlocked && (
            <span className="flex items-center gap-1 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              {isCompleted ? t('levelPreview.review') : t('levelPreview.start')}
              <ChevronRight className="w-3 h-3" />
            </span>
          )}
        </div>

        {/* Progress bar */}
        {isUnlocked && (
          <div className="mt-4 h-1.5 bg-muted/50 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${
                isCompleted 
                  ? 'bg-accent' 
                  : 'bg-gradient-to-r from-primary to-accent'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </Link>
  );
}
