import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWeakTopics } from '@/hooks/useWeakTopics';
import { useSkillMastery } from '@/hooks/useSkillMastery';
import { useProgress } from '@/hooks/useProgress';
import { useLearningStreak } from '@/hooks/useLearningStreak';
import { useRevisionSchedule } from '@/hooks/useRevisionSchedule';
import { Bot, Sparkles, ArrowRight, TrendingUp, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { levels } from '@/data/levels';
import { AICoachMessage } from '@/types/learning';
import { useLanguage } from '@/contexts/LanguageContext';

interface AICoachCardProps {
  onPracticeNow?: () => void;
}

export function AICoachCard({ onPracticeNow }: AICoachCardProps) {
  const navigate = useNavigate();
  const { getTopWeakTopics, hasWeakTopics } = useWeakTopics();
  const { getWeakestSkills, getStrongestSkills, getOverallMastery } = useSkillMastery();
  const { progress, isLevelCompleted } = useProgress();
  const { currentStreak } = useLearningStreak();
  const { getDueRevisions, getOverdueRevisions } = useRevisionSchedule();
  const { t } = useLanguage();

  const coachMessage: AICoachMessage = useMemo(() => {
    const overdueRevisions = getOverdueRevisions();
    const dueRevisions = getDueRevisions();
    const weakTopics = getTopWeakTopics(3);
    const weakSkills = getWeakestSkills(1);
    const strongSkills = getStrongestSkills(1);
    const completedCount = progress.completedLevels.length;
    const overallMastery = getOverallMastery();

    // Priority 1: Overdue revisions
    if (overdueRevisions.length > 0) {
      return {
        type: 'warning',
        message: `You have ${overdueRevisions.length} overdue revision${overdueRevisions.length > 1 ? 's' : ''}! Complete them to maintain your knowledge.`,
        actionLabel: 'Start Revision',
        actionPath: '/progress',
      };
    }

    // Priority 2: Due revisions
    if (dueRevisions.length > 0) {
      return {
        type: 'suggestion',
        message: `Time for a quick revision of ${dueRevisions[0].levelTitle}! It only takes 5 minutes.`,
        actionLabel: 'Start Now',
        actionPath: '/progress',
      };
    }

    // Priority 3: Streak encouragement
    if (currentStreak === 0) {
      return {
        type: 'encouragement',
        message: "Start your learning streak today! Even 10 minutes daily builds strong knowledge.",
        actionLabel: 'Start Learning',
        actionPath: '/learn',
      };
    }

    if (currentStreak >= 7) {
      return {
        type: 'celebration',
        message: `Amazing ${currentStreak}-day streak! 🔥 You're building a powerful learning habit.`,
      };
    }

    // Priority 4: Weak areas
    if (hasWeakTopics && weakTopics.length > 0) {
      const weakestTopic = weakTopics[0];
      return {
        type: 'suggestion',
        message: `Focus on "${weakestTopic.topic}" - practice makes perfect! Your accuracy will improve.`,
        actionLabel: 'Practice Now',
        actionPath: '/progress',
      };
    }

    // Priority 5: Progress-based
    if (completedCount === 0) {
      return {
        type: 'encouragement',
        message: "Welcome! Start with Level 1 to build a strong foundation in constitutional law.",
        actionLabel: 'Start Level 1',
        actionPath: '/learn/1',
      };
    }

    // Priority 6: Skill-based recommendations
    if (weakSkills.length > 0 && weakSkills[0].level < 50) {
      const skillNames: Record<string, string> = {
        articles: 'Articles',
        amendments: 'Amendments',
        cases: 'Case Laws',
        reasoning: 'Legal Reasoning',
        scenarios: 'Scenario Analysis',
      };
      return {
        type: 'suggestion',
        message: `Your ${skillNames[weakSkills[0].skill]} skill needs work. Try more ${skillNames[weakSkills[0].skill].toLowerCase()} questions!`,
        actionLabel: 'Practice',
        actionPath: '/learn',
      };
    }

    // Priority 7: Next level
    const nextLevel = levels.find(l => !isLevelCompleted(l.id));
    if (nextLevel) {
      return {
        type: 'encouragement',
        message: `Great progress! Ready to tackle "${nextLevel.title}"? You're on a roll!`,
        actionLabel: 'Continue',
        actionPath: `/learn/${nextLevel.id}`,
      };
    }

    // Default: Celebrate completion
    return {
      type: 'celebration',
      message: "You've completed all levels! 🎉 Keep revising to maintain your knowledge.",
    };
  }, [
    getOverdueRevisions,
    getDueRevisions,
    getTopWeakTopics,
    getWeakestSkills,
    getStrongestSkills,
    getOverallMastery,
    progress.completedLevels.length,
    currentStreak,
    hasWeakTopics,
    isLevelCompleted,
  ]);

  const getMessageStyles = () => {
    switch (coachMessage.type) {
      case 'warning':
        return 'from-orange-500/10 to-red-500/10 border-orange-500/20';
      case 'celebration':
        return 'from-gold/10 to-accent/10 border-gold/20';
      case 'suggestion':
        return 'from-primary/10 to-accent/10 border-primary/20';
      default:
        return 'from-primary/10 to-accent/10 border-primary/20';
    }
  };

  const getIcon = () => {
    switch (coachMessage.type) {
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-orange-500" />;
      case 'celebration':
        return <Sparkles className="w-6 h-6 text-gold" />;
      default:
        return <Bot className="w-6 h-6 text-primary" />;
    }
  };

  return (
    <Card className={`border bg-gradient-to-br ${getMessageStyles()} overflow-hidden`}>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-accent shrink-0 shadow-lg">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm font-semibold">{t('coach.aiCoach')}</p>
              <Badge variant="outline" className="text-xs">{t('coach.personal')}</Badge>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              {coachMessage.message}
            </p>
            {coachMessage.actionLabel && coachMessage.actionPath && (
              <Button
                size="sm"
                variant={coachMessage.type === 'warning' ? 'destructive' : 'default'}
                onClick={() => {
                  if (onPracticeNow && (coachMessage.actionLabel === 'Practice Now' || coachMessage.actionLabel === 'Practice')) {
                    onPracticeNow();
                  } else {
                    navigate(coachMessage.actionPath!);
                  }
                }}
                className="gap-1"
              >
                {coachMessage.actionLabel}
                <ArrowRight className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
