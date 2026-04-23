import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getLevelGoal } from '@/data/levelGoals';
import { Target, Trophy, Gift, Star, Zap } from 'lucide-react';
import { useProgress } from '@/hooks/useProgress';

interface LevelGoalCardProps {
  levelId: number;
  currentScore?: number;
}

export function LevelGoalCard({ levelId, currentScore }: LevelGoalCardProps) {
  const goal = getLevelGoal(levelId);
  const { progress } = useProgress();
  
  if (!goal) return null;

  const levelScore = currentScore ?? progress.quizScores[levelId];
  const hasBonus = levelScore !== undefined && levelScore >= 80;
  const hasPassed = levelScore !== undefined && levelScore >= 50;

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 via-accent/5 to-gold/5 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
            <Target className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm">Level Goal</h3>
              {hasBonus && (
                <Badge className="bg-gold text-gold-foreground text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  80%+ Bonus!
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground mb-3">
              {goal.goal}
            </p>
            
            <div className="flex flex-wrap gap-3">
              {/* Reward badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-xs">
                <Trophy className="w-3.5 h-3.5 text-gold" />
                <span>{goal.reward}</span>
              </div>
              
              {/* Bonus XP indicator */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs ${
                hasBonus ? 'bg-gold/20 text-gold' : 'bg-muted text-muted-foreground'
              }`}>
                <Zap className="w-3.5 h-3.5" />
                <span>
                  {hasBonus ? `+${goal.bonusXP} Bonus XP Earned!` : `+${goal.bonusXP} XP for 80%+`}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Progress indicator */}
        {levelScore !== undefined && (
          <div className="mt-4 pt-3 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Your Score</span>
              <span className={`font-bold ${
                hasBonus ? 'text-gold' : hasPassed ? 'text-accent' : 'text-destructive'
              }`}>
                {levelScore}%
              </span>
            </div>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  hasBonus ? 'bg-gold' : hasPassed ? 'bg-accent' : 'bg-destructive'
                }`}
                style={{ width: `${Math.min(levelScore, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>50% to pass</span>
              <span>80% for bonus</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
