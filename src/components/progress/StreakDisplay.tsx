import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLearningStreak } from '@/hooks/useLearningStreak';
import { Flame, Gift, Zap, Trophy } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
const streakMilestones = [
  { days: 3, xp: 25, label: '3 days', icon: '🔥' },
  { days: 7, xp: 75, label: '1 week', icon: '⭐' },
  { days: 14, xp: 150, label: '2 weeks', icon: '🏆' },
  { days: 30, xp: 300, label: '1 month', icon: '👑' },
];

interface StreakDisplayProps {
  compact?: boolean;
}

export function StreakDisplay({ compact = false }: StreakDisplayProps) {
  const { currentStreak, longestStreak, isActiveToday, justIncreased } = useLearningStreak();
  const { t } = useLanguage();

  const nextMilestone = streakMilestones.find(m => m.days > currentStreak);
  const daysToNextMilestone = nextMilestone ? nextMilestone.days - currentStreak : 0;

  if (compact) {
    return (
      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
        justIncreased 
          ? 'bg-orange-500/20 border-2 border-orange-500 animate-pulse' 
          : isActiveToday
          ? 'bg-orange-500/10 border border-orange-500/30'
          : 'bg-muted border border-border'
      }`}>
        <Flame className={`w-5 h-5 ${currentStreak > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
        <div>
          <span className="font-bold text-lg">{currentStreak}</span>
          <span className="text-sm text-muted-foreground ml-1">{t('streak.dayStreak')}</span>
        </div>
        {justIncreased && (
          <Badge className="bg-orange-500 text-white animate-bounce">+1</Badge>
        )}
      </div>
    );
  }

  return (
    <Card className={`overflow-hidden ${justIncreased ? 'ring-2 ring-orange-500 ring-offset-2' : ''}`}>
      <CardHeader className="pb-3 bg-gradient-to-r from-orange-500/10 to-red-500/10">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="p-2 rounded-lg bg-orange-500/20">
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          {t('streak.learningStreak')}
          {justIncreased && (
            <Badge className="bg-orange-500 text-white ml-auto animate-pulse">
              {t('streak.today')}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-center">
            <div className="flex items-center gap-2">
              <Flame className={`w-8 h-8 ${currentStreak > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
              <span className="text-4xl font-bold">{currentStreak}</span>
            </div>
            <p className="text-sm text-muted-foreground">{t('streak.current')}</p>
          </div>
          
          <div className="h-12 w-px bg-border" />
          
          <div className="text-center">
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-gold" />
              <span className="text-2xl font-bold">{longestStreak}</span>
            </div>
            <p className="text-sm text-muted-foreground">{t('streak.best')}</p>
          </div>
        </div>

        {/* Status */}
        <div className={`rounded-lg p-3 mb-4 ${
          isActiveToday
            ? 'bg-accent/10 border border-accent/30'
            : 'bg-muted border border-border'
        }`}>
          <p className="text-sm text-center">
            {isActiveToday ? (
              <span className="text-accent font-medium">{t('streak.studiedToday')}</span>
            ) : currentStreak > 0 ? (
              <span className="text-orange-500 font-medium">{t('streak.keepStreak')}</span>
            ) : (
              <span className="text-muted-foreground">{t('streak.startStreak')}</span>
            )}
          </p>
        </div>

        {/* Next milestone */}
        {nextMilestone && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="text-2xl">{nextMilestone.icon}</div>
            <div className="flex-1">
              <p className="text-sm font-medium">
                {daysToNextMilestone} {daysToNextMilestone === 1 ? t('streak.dayTo') : t('streak.daysTo')} {nextMilestone.label} {t('streak.milestone')}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Gift className="w-3 h-3" />
                {t('streak.earnBonus')} {nextMilestone.xp} XP
              </p>
            </div>
          </div>
        )}

        {/* Milestones progress */}
        <div className="flex justify-between mt-4 gap-1">
          {streakMilestones.map(milestone => (
            <div
              key={milestone.days}
              className={`flex-1 text-center py-2 rounded-lg transition-all ${
                currentStreak >= milestone.days
                  ? 'bg-orange-500/20 border border-orange-500/30'
                  : 'bg-muted'
              }`}
            >
              <div className="text-lg">{milestone.icon}</div>
              <p className="text-xs text-muted-foreground">{milestone.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
