import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useSkillMastery } from '@/hooks/useSkillMastery';
import { Brain, TrendingUp, Award } from 'lucide-react';

const skillIcons: Record<string, string> = {
  articles: '📜',
  amendments: '📝',
  cases: '⚖️',
  reasoning: '🧠',
  scenarios: '🎭',
};

const skillLabels: Record<string, string> = {
  articles: 'Articles',
  amendments: 'Amendments',
  cases: 'Case Laws',
  reasoning: 'Reasoning',
  scenarios: 'Scenarios',
};

const skillColors: Record<string, string> = {
  articles: 'from-blue-500 to-blue-600',
  amendments: 'from-purple-500 to-purple-600',
  cases: 'from-amber-500 to-amber-600',
  reasoning: 'from-emerald-500 to-emerald-600',
  scenarios: 'from-pink-500 to-pink-600',
};

export function SkillTreeSection() {
  const { skills, getOverallMastery } = useSkillMastery();
  const overallMastery = getOverallMastery();

  const activeSkills = skills.filter(s => s.questionsAttempted > 0);
  
  if (activeSkills.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-2 rounded-lg bg-accent/10">
              <Brain className="w-4 h-4 text-accent" />
            </div>
            Skill Mastery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Complete quizzes to unlock your skill tree!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="p-2 rounded-lg bg-accent/10">
            <Brain className="w-4 h-4 text-accent" />
          </div>
          Skill Mastery
          <span className="ml-auto text-sm font-normal text-muted-foreground">
            Overall: {overallMastery}%
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {skills.map(skill => {
            const hasData = skill.questionsAttempted > 0;
            return (
              <div
                key={skill.skill}
                className={`relative rounded-xl p-4 transition-all ${
                  hasData
                    ? 'bg-gradient-to-br from-muted/50 to-muted border border-border'
                    : 'bg-muted/30 border border-dashed border-border opacity-50'
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">{skillIcons[skill.skill]}</div>
                  <p className="text-xs font-medium mb-2">{skillLabels[skill.skill]}</p>
                  
                  {hasData ? (
                    <>
                      <div className="relative h-2 bg-background rounded-full overflow-hidden mb-1">
                        <div
                          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${skillColors[skill.skill]} rounded-full transition-all duration-500`}
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                      <p className="text-lg font-bold">{skill.level}%</p>
                      <p className="text-xs text-muted-foreground">
                        {skill.correctAnswers}/{skill.questionsAttempted}
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">Not started</p>
                  )}

                  {skill.level >= 80 && hasData && (
                    <div className="absolute -top-1 -right-1">
                      <Award className="w-5 h-5 text-gold" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
