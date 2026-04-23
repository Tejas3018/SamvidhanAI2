import { Layout } from '@/components/layout/Layout';
import { LevelCard } from '@/components/learn/LevelCard';
import { levels } from '@/data/levels';
import { useProgress } from '@/hooks/useProgress';
import { Trophy, Star, Target, Flame, BookOpen, GraduationCap } from 'lucide-react';
import { useLearningStreak } from '@/hooks/useLearningStreak';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Learn() {
  const { progress, isLevelUnlocked, isLevelCompleted, getLevelProgress } = useProgress();
  const { currentStreak } = useLearningStreak();
  const { t } = useLanguage();

  const completedCount = progress.completedLevels.length;
  const totalLevels = levels.length;
  const progressPercentage = Math.round((completedCount / totalLevels) * 100);

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 mesh-gradient opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
          
          <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm mb-6 backdrop-blur-sm">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="text-primary font-medium">{t('learn.badge')}</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                {t('learn.title').split('Constitution')[0]}<span className="gradient-text">Constitution</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {t('learn.subtitle')}
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
              <div className="group relative overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-br from-gold/10 via-gold/5 to-transparent p-5 hover:border-gold/40 transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gold/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                <Trophy className="w-8 h-8 text-gold mb-2" />
                <p className="text-3xl font-bold text-gold">{progress.totalXP}</p>
                <p className="text-xs text-muted-foreground font-medium">{t('learn.totalXP')}</p>
              </div>

              <div className="group relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5 hover:border-primary/40 transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                <Target className="w-8 h-8 text-primary mb-2" />
                <p className="text-3xl font-bold">
                  <span className="text-primary">{completedCount}</span>
                  <span className="text-muted-foreground text-lg">/{totalLevels}</span>
                </p>
                <p className="text-xs text-muted-foreground font-medium">{t('learn.levelsDone')}</p>
              </div>

              <div className="group relative overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent p-5 hover:border-accent/40 transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-20 h-20 bg-accent/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                <Star className="w-8 h-8 text-accent mb-2" />
                <p className="text-3xl font-bold text-accent">{progress.earnedBadges.length}</p>
                <p className="text-xs text-muted-foreground font-medium">{t('learn.badgesEarned')}</p>
              </div>

              <div className="group relative overflow-hidden rounded-2xl border border-destructive/20 bg-gradient-to-br from-destructive/10 via-destructive/5 to-transparent p-5 hover:border-destructive/40 transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-20 h-20 bg-destructive/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                <Flame className="w-8 h-8 text-destructive mb-2" />
                <p className="text-3xl font-bold text-destructive">{currentStreak}</p>
                <p className="text-xs text-muted-foreground font-medium">{t('learn.dayStreak')}</p>
              </div>
            </div>

            {/* Progress Overview */}
            <div className="max-w-4xl mx-auto">
              <div className="relative rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{t('learn.overallProgress')}</h3>
                        <p className="text-xs text-muted-foreground">{t('learn.keepGoing')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold gradient-text">{progressPercentage}%</p>
                      <p className="text-xs text-muted-foreground">{t('learn.complete')}</p>
                    </div>
                  </div>

                  <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 gradient-hero transition-all duration-700 ease-out rounded-full"
                      style={{ width: `${progressPercentage}%` }}
                    />
                    {[25, 50, 75].map((milestone) => (
                      <div
                        key={milestone}
                        className={`absolute top-1/2 -translate-y-1/2 w-1 h-6 rounded-full transition-colors ${
                          progressPercentage >= milestone ? 'bg-primary-foreground/50' : 'bg-muted-foreground/30'
                        }`}
                        style={{ left: `${milestone}%` }}
                      />
                    ))}
                  </div>

                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>{t('learn.beginner')}</span>
                    <span>{t('learn.scholar')}</span>
                    <span>{t('learn.expert')}</span>
                    <span>{t('learn.master')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Unlock Requirement */}
        <div className="container mx-auto px-4 -mt-2 mb-8">
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full text-sm shadow-soft">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">{t('learn.unlockHint')}</span>
            </div>
          </div>
        </div>

        {/* Level Journey */}
        <div className="container mx-auto px-4 pb-16">
          <div className="max-w-6xl mx-auto">
            <div className="relative">
              <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 z-0">
                <div className="h-full bg-gradient-to-b from-primary via-accent to-secondary rounded-full opacity-20" />
                <div 
                  className="absolute top-0 left-0 w-full bg-gradient-to-b from-primary via-accent to-secondary rounded-full transition-all duration-1000"
                  style={{ height: `${progressPercentage}%` }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 lg:gap-8">
                {levels.map((level, index) => (
                  <div 
                    key={level.id}
                    className={`relative ${index % 2 === 0 ? 'lg:pr-8' : 'lg:pl-8'}`}
                  >
                    <div className={`hidden lg:flex absolute top-1/2 -translate-y-1/2 z-10 ${
                      index % 2 === 0 ? 'right-0 translate-x-1/2' : 'left-0 -translate-x-1/2'
                    }`}>
                      <div className={`w-4 h-4 rounded-full border-4 transition-colors ${
                        isLevelCompleted(level.id)
                          ? 'bg-accent border-accent/50'
                          : isLevelUnlocked(level.id)
                          ? 'bg-primary border-primary/50 animate-pulse'
                          : 'bg-muted border-muted-foreground/20'
                      }`} />
                    </div>

                    <LevelCard
                      level={level}
                      isUnlocked={isLevelUnlocked(level.id)}
                      isCompleted={isLevelCompleted(level.id)}
                      progress={getLevelProgress(level.id)}
                      index={index}
                    />
                  </div>
                ))}
              </div>
            </div>

            {completedCount === totalLevels && (
              <div className="mt-12 text-center">
                <div className="inline-flex flex-col items-center gap-4 p-8 rounded-3xl bg-gradient-to-br from-accent/20 via-accent/10 to-transparent border border-accent/30">
                  <div className="text-6xl">🎓</div>
                  <h3 className="text-2xl font-bold gradient-text">{t('learn.congratulations')}</h3>
                  <p className="text-muted-foreground max-w-md">
                    {t('learn.congratulationsDesc')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
