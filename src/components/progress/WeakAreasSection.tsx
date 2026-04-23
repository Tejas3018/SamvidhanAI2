import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useWeakTopics } from '@/hooks/useWeakTopics';
import { Target, TrendingDown, Zap, BookOpen } from 'lucide-react';

interface WeakAreasSectionProps {
  onPracticeWeakAreas?: () => void;
}

export function WeakAreasSection({ onPracticeWeakAreas }: WeakAreasSectionProps) {
  const { getTopWeakTopics, hasWeakTopics } = useWeakTopics();
  
  const topWeakTopics = getTopWeakTopics(3);
  
  if (!hasWeakTopics || topWeakTopics.length === 0) {
    return null;
  }

  const getAccuracyColor = (incorrectCount: number, totalAttempts: number) => {
    const accuracy = ((totalAttempts - incorrectCount) / totalAttempts) * 100;
    if (accuracy < 30) return 'text-destructive';
    if (accuracy < 50) return 'text-orange-500';
    return 'text-yellow-500';
  };

  const getAccuracyLabel = (incorrectCount: number, totalAttempts: number) => {
    const accuracy = ((totalAttempts - incorrectCount) / totalAttempts) * 100;
    if (accuracy < 30) return 'Needs Practice';
    if (accuracy < 50) return 'Low Accuracy';
    return 'Improving';
  };

  return (
    <Card className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-red-500/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="p-2 rounded-lg bg-orange-500/10">
            <Target className="w-4 h-4 text-orange-500" />
          </div>
          Weak Areas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {topWeakTopics.map((topic, index) => {
          const accuracy = ((topic.totalAttempts - topic.incorrectCount) / topic.totalAttempts) * 100;
          return (
            <div key={`${topic.topic}-${topic.levelId}`} className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{topic.topic}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={getAccuracyColor(topic.incorrectCount, topic.totalAttempts)}>
                      {getAccuracyLabel(topic.incorrectCount, topic.totalAttempts)}
                    </span>
                    {topic.articleReference && (
                      <span className="text-muted-foreground">• {topic.articleReference}</span>
                    )}
                  </div>
                </div>
                <span className="text-xs font-medium text-muted-foreground shrink-0">
                  {Math.round(accuracy)}%
                </span>
              </div>
              <Progress value={accuracy} className="h-1.5" />
            </div>
          );
        })}

        <Button
          onClick={onPracticeWeakAreas}
          className="w-full gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90"
        >
          <Zap className="w-4 h-4" />
          Practice Weak Areas
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          🎯 Focus on these to improve faster!
        </p>
      </CardContent>
    </Card>
  );
}
