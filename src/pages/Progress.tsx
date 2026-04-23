import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useProgress } from '@/hooks/useProgress';
import { useLearningStreak } from '@/hooks/useLearningStreak';
import { levels, badges } from '@/data/levels';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  Trophy, 
  Target, 
  Star, 
  Flame, 
  TrendingUp, 
  Award,
  CheckCircle2,
  Clock,
  Zap,
  Play,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Gift,
  Brain,
  Bot,
  Gamepad2,
  BookOpen,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { SmartRevisionSection } from '@/components/progress/SmartRevisionSection';
import { WeakAreasSection } from '@/components/progress/WeakAreasSection';
import { AICoachCard } from '@/components/progress/AICoachCard';
import { SkillTreeSection } from '@/components/progress/SkillTreeSection';
import { StreakDisplay } from '@/components/progress/StreakDisplay';
import { MistakeReviewSection } from '@/components/progress/MistakeReviewSection';
import { WeakAreasPracticeQuiz } from '@/components/progress/WeakAreasPracticeQuiz';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ProgressDashboard() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { progress, isLevelCompleted, getLevelProgress } = useProgress();
  const { currentStreak, justIncreased, recordActivity, isActiveToday } = useLearningStreak();
  const [expandedLevels, setExpandedLevels] = useState<number[]>([]);
  const [practiceQuizOpen, setPracticeQuizOpen] = useState(false);

  // Record activity when visiting progress page
  useEffect(() => {
    recordActivity();
  }, [recordActivity]);

  const completedCount = progress.completedLevels.length;
  const totalLevels = levels.length;
  const overallProgress = Math.round((completedCount / totalLevels) * 100);

  // Calculate stats
  const totalQuizzesTaken = Object.keys(progress.quizScores).length;
  const averageScore = totalQuizzesTaken > 0 
    ? Math.round(Object.values(progress.quizScores).reduce((a, b) => a + b, 0) / totalQuizzesTaken)
    : 0;
  const highestScore = totalQuizzesTaken > 0 
    ? Math.max(...Object.values(progress.quizScores))
    : 0;

  // Find next level to continue
  const nextLevelToLearn = useMemo(() => {
    const firstIncomplete = levels.find(level => !isLevelCompleted(level.id));
    const lowScoredLevel = levels.find(level => {
      const score = progress.quizScores[level.id];
      return score !== undefined && score < 80;
    });
    return lowScoredLevel || firstIncomplete || levels[0];
  }, [progress.quizScores, isLevelCompleted]);

  // Find weakness areas
  const weaknessAreas = useMemo(() => {
    const scoredLevels = levels
      .filter(level => progress.quizScores[level.id] !== undefined)
      .map(level => ({
        id: level.id,
        title: level.title,
        score: progress.quizScores[level.id],
        icon: level.icon,
      }))
      .sort((a, b) => a.score - b.score)
      .slice(0, 3);
    return scoredLevels;
  }, [progress.quizScores]);

  // Next reward
  const nextReward = useMemo(() => {
    const nextBadge = badges.find(badge => !progress.earnedBadges.includes(badge.id));
    if (!nextBadge) return null;
    let xpNeeded = 0;
    if (nextBadge.id === 'first-step') xpNeeded = 100;
    else if (nextBadge.id === 'rights-champion') xpNeeded = 250;
    else if (nextBadge.id === 'quiz-master') xpNeeded = 500;
    else if (nextBadge.id === 'constitution-scholar') xpNeeded = 1000;
    else xpNeeded = 300;
    const remaining = Math.max(0, xpNeeded - progress.totalXP);
    return { badge: nextBadge, xpNeeded: remaining };
  }, [progress.earnedBadges, progress.totalXP]);

  // Chart data
  const levelProgressData = levels.map(level => ({
    name: `L${level.id}`,
    fullName: level.title,
    score: progress.quizScores[level.id] || 0,
    completed: isLevelCompleted(level.id),
  }));

  const chartConfig = {
    score: { label: "Score", color: "hsl(var(--primary))" },
  };

  const toggleLevelExpand = (levelId: number) => {
    setExpandedLevels(prev => 
      prev.includes(levelId) 
        ? prev.filter(id => id !== levelId)
        : [...prev, levelId]
    );
  };

  const handleContinueLearning = () => {
    navigate(`/learn/${nextLevelToLearn.id}`);
  };

  const handlePracticeWeakAreas = () => {
    setPracticeQuizOpen(true);
  };

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-transparent py-10 border-b border-border">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-10 left-[10%] w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-[10%] w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
          </div>
          
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-sm font-medium text-primary mb-4">
                <Sparkles className="w-4 h-4" />
                {t('progress.badge')}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold mb-3 font-display">
                {t('progress.title').split('Dashboard')[0]}{' '}
                <span className="bg-gradient-to-r from-primary via-accent to-gold bg-clip-text text-transparent">
                  Dashboard
                </span>
              </h1>
              <p className="text-muted-foreground max-w-xl mx-auto">
                {t('progress.subtitle')}
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Top Row: Stats + Continue Learning */}
          <div className="grid lg:grid-cols-5 gap-4 mb-6">
            <StatCard icon={<Trophy className="w-5 h-5" />} value={progress.totalXP} label={t('progress.totalXP')} color="gold" />
            <StatCard icon={<Target className="w-5 h-5" />} value={`${completedCount}/${totalLevels}`} label={t('progress.levelsDone')} color="primary" />
            <StatCard icon={<TrendingUp className="w-5 h-5" />} value={`${averageScore}%`} label={t('progress.avgScore')} color="accent" />
            <StatCard icon={<Zap className="w-5 h-5" />} value={`${highestScore}%`} label={t('progress.bestScore')} color="secondary" />
            <StatCard icon={<Flame className="w-5 h-5" />} value={currentStreak} label={t('progress.dayStreak')} color="orange" highlight={justIncreased} />
          </div>

          {/* Continue Learning CTA */}
          <Card className="mb-6 border-2 border-primary/30 bg-gradient-to-r from-primary/5 via-primary/10 to-accent/5 shadow-lg overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row items-center">
                <div className="flex-1 p-5 sm:p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl shadow-lg">
                      {nextLevelToLearn.icon}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">
                        {isLevelCompleted(nextLevelToLearn.id) && progress.quizScores[nextLevelToLearn.id] < 80
                          ? t('progress.improveScore')
                          : t('progress.continueLearning')
                        }
                      </p>
                      <h3 className="font-bold text-lg">{nextLevelToLearn.title}</h3>
                    </div>
                  </div>
                  <Button 
                    onClick={handleContinueLearning}
                    className="gap-2 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg mt-2"
                  >
                    <Play className="w-4 h-4" />
                    {t('progress.continueLearning')}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
                <div className="hidden sm:flex items-center justify-center w-36 h-full bg-gradient-to-l from-primary/10 to-transparent p-6">
                  <div className="text-6xl opacity-40">{nextLevelToLearn.icon}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main 2-column layout: AI Coach & Actions | Charts */}
          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            {/* Left: AI Coach + Quick Actions */}
            <div className="space-y-5">
              <AICoachCard onPracticeNow={handlePracticeWeakAreas} />
              <SmartRevisionSection />
              <WeakAreasSection onPracticeWeakAreas={handlePracticeWeakAreas} />
            </div>

            {/* Center: Main content */}
            <div className="lg:col-span-2 space-y-5">
              {/* Overall Progress */}
              <Card>
                <CardHeader className="pb-3 bg-gradient-to-r from-muted/50 to-transparent">
                  <CardTitle className="text-base flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Flame className="w-4 h-4 text-primary" />
                    </div>
                    {t('progress.overallProgress')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('progress.journeyCompletion')}</span>
                      <span className="font-bold text-lg">{overallProgress}%</span>
                    </div>
                    <div className="relative">
                      <Progress value={overallProgress} className="h-3 rounded-full" />
                      <div 
                        className="absolute top-0 h-3 rounded-full bg-gradient-to-r from-primary via-accent to-gold opacity-30"
                        style={{ width: `${overallProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {completedCount === totalLevels 
                        ? t('progress.completedAll')
                        : `${totalLevels - completedCount} ${t('progress.levelsToGo')}`
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Charts side by side */}
              <div className="grid md:grid-cols-2 gap-5">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Star className="w-4 h-4 text-gold" />
                      {t('progress.levelScores')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-[180px] w-full">
                      <BarChart data={levelProgressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} domain={[0, 100]} />
                        <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: 'hsl(var(--muted))' }} />
                        <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                          {levelProgressData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.completed ? 'hsl(var(--accent))' : 'hsl(var(--primary))'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Next Reward + Badges combined */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Gift className="w-4 h-4 text-gold" />
                      {t('progress.rewardsBadges')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {nextReward && (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-gold/5 border border-gold/20">
                        <div className="text-3xl">{nextReward.badge.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{nextReward.badge.name}</p>
                          <p className="text-xs text-muted-foreground mb-1 truncate">{nextReward.badge.description}</p>
                          <div className="flex items-center gap-2">
                            <Progress value={((nextReward.xpNeeded > 0 ? (1 - nextReward.xpNeeded / 300) : 1) * 100)} className="h-1.5 flex-1" />
                            <span className="text-xs font-medium text-gold">{nextReward.xpNeeded} XP</span>
                          </div>
                        </div>
                      </div>
                    )}
                    {progress.earnedBadges.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {progress.earnedBadges.map((badge) => (
                          <Badge key={badge} variant="outline" className="px-2 py-1 gap-1 text-xs bg-gold/5">
                            <Award className="w-3 h-3 text-gold" />
                            {badge}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {!nextReward && progress.earnedBadges.length === 0 && (
                      <div className="text-center py-6 text-muted-foreground">
                        <Trophy className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="text-xs">{t('progress.completeLevels')}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Skill Mastery */}
              <SkillTreeSection />

              {/* Mistake Review */}
              <MistakeReviewSection />
            </div>
          </div>

          {/* Focus Areas */}
          {weaknessAreas.length > 0 && (
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <AlertCircle className="w-4 h-4 text-destructive" />
                  </div>
                  {t('progress.focusAreas')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-3">
                  {weaknessAreas.map((area) => (
                    <Link to={`/learn/${area.id}`} key={area.id}>
                      <div className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer border border-border">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{area.icon}</span>
                          <span className="text-sm font-medium">{area.title}</span>
                        </div>
                        <Badge variant={area.score < 50 ? "destructive" : area.score < 70 ? "secondary" : "default"}>
                          {area.score}%
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Level Details - collapsible grid */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
                {t('progress.allLevels')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {levels.map((level) => {
                  const score = progress.quizScores[level.id] || 0;
                  const completed = isLevelCompleted(level.id);
                  const isExpanded = expandedLevels.includes(level.id);
                  const needsImprovement = completed && score < 80;
                  
                  return (
                    <Collapsible key={level.id} open={isExpanded} onOpenChange={() => toggleLevelExpand(level.id)}>
                      <CollapsibleTrigger className="w-full">
                        <div 
                          className={`flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r transition-all cursor-pointer ${
                            completed 
                              ? 'from-accent/10 to-accent/5 hover:from-accent/15' 
                              : 'from-muted/50 to-muted/30 hover:from-muted/70'
                          } ${needsImprovement ? 'ring-2 ring-orange-500/30' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg ${
                              completed ? 'bg-accent/20' : 'bg-muted'
                            }`}>
                              {level.icon}
                            </div>
                            <div className="text-left">
                              <p className="font-semibold text-sm">{level.title}</p>
                              <p className="text-xs text-muted-foreground">{level.xpReward} XP</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {score > 0 && (
                              <Badge variant={score >= 80 ? "default" : score >= 50 ? "secondary" : "destructive"} className="text-xs">
                                {score}%
                              </Badge>
                            )}
                            {completed ? (
                              <CheckCircle2 className="w-5 h-5 text-accent" />
                            ) : score > 0 ? (
                              <Clock className="w-5 h-5 text-muted-foreground" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                            )}
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="p-4 mt-2 rounded-xl bg-muted/30 space-y-3">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                              <BookOpen className="w-3 h-3" /> {t('progress.topicsCovered')}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {level.topics.map((topic, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">{topic}</Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Gamepad2 className="w-3 h-3" />{t('progress.quizIncluded')}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{t('progress.estimatedTime')}</span>
                            <span className="flex items-center gap-1"><Trophy className="w-3 h-3" />{level.xpReward} XP</span>
                          </div>
                          <div className="flex gap-2">
                            {needsImprovement && (
                              <Link to={`/learn/${level.id}`}>
                                <Button variant="outline" size="sm" className="gap-2 text-orange-500 border-orange-500/30 hover:bg-orange-500/10">
                                  <RotateCcw className="w-4 h-4" />
                                  {t('progress.improveScore')}
                                </Button>
                              </Link>
                            )}
                            {!completed && (
                              <Link to={`/learn/${level.id}`}>
                                <Button size="sm" className="gap-2">
                                  <Play className="w-4 h-4" />
                                  {t('progress.startLevel')}
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Practice Quiz Dialog */}
      <WeakAreasPracticeQuiz open={practiceQuizOpen} onOpenChange={setPracticeQuizOpen} />
    </Layout>
  );
}

function StatCard({ 
  icon, 
  value, 
  label, 
  color, 
  highlight 
}: { 
  icon: React.ReactNode; 
  value: string | number; 
  label: string; 
  color: 'primary' | 'accent' | 'gold' | 'secondary' | 'orange';
  highlight?: boolean;
}) {
  const colorClasses = {
    primary: 'from-primary/15 to-primary/5 border-primary/20',
    accent: 'from-accent/15 to-accent/5 border-accent/20',
    gold: 'from-gold/15 to-gold/5 border-gold/20',
    secondary: 'from-secondary/15 to-secondary/5 border-secondary/20',
    orange: 'from-orange-500/15 to-orange-500/5 border-orange-500/20',
  };

  const iconColors = {
    primary: 'text-primary bg-primary/20',
    accent: 'text-accent bg-accent/20',
    gold: 'text-gold bg-gold/20',
    secondary: 'text-secondary bg-secondary/20',
    orange: 'text-orange-500 bg-orange-500/20',
  };

  const textColors = {
    primary: 'text-primary',
    accent: 'text-accent',
    gold: 'text-gold',
    secondary: 'text-secondary',
    orange: 'text-orange-500',
  };

  return (
    <Card className={`border bg-gradient-to-br ${colorClasses[color]} transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${highlight ? 'scale-105 ring-2 ring-orange-500/50 animate-pulse' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${iconColors[color]} ${highlight ? 'animate-bounce' : ''}`}>
            {icon}
          </div>
          <div>
            <p className={`text-xl font-bold ${textColors[color]}`}>{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
