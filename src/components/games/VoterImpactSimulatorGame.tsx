import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useTranslateResponse } from '@/hooks/useTranslateResponse';
import { 
  Vote, 
  Play, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Scale, 
  BookOpen, 
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Award,
  BarChart3,
  Shield,
  Heart
} from 'lucide-react';

type GamePhase = 'intro' | 'policy-selection' | 'simulation' | 'constitutional-review' | 'outcome' | 'learning';

interface Policy {
  id: string;
  title: string;
  description: string;
  category: string;
}

interface DemographicImpact {
  group: string;
  changePercent: number;
  direction: 'increase' | 'decrease' | 'neutral';
  explanation: string;
}

interface ArticleReview {
  article: string;
  status: 'compliant' | 'potential_violation' | 'clear_violation';
  explanation: string;
}

interface GameState {
  selectedPolicy: Policy | null;
  decision: 'implement' | 'modify' | 'reject' | null;
  demographicImpacts: DemographicImpact[];
  overallTurnoutChange: number;
  impactSummary: string;
  articleReviews: ArticleReview[];
  courtChallenges: string[];
  courtRiskLevel: number;
  riskExplanation: string;
  judicialPrediction: string;
  scores: {
    democracy: number;
    fairness: number;
    inclusion: number;
    legalStability: number;
  };
  realWorldComparison: string;
  learnings: string[];
  reflectionQuestion: string;
  badges: Array<{
    id: string;
    name: string;
    earned: boolean;
    requirement: string;
  }>;
}

const policies: Policy[] = [
  {
    id: 'voter-id',
    title: 'Mandatory Government-Issued Voter ID',
    description: 'Require all voters to present a government-issued photo ID (Aadhaar, PAN, Passport, or Voter ID card) at polling stations to cast their vote.',
    category: 'Voter Verification'
  },
  {
    id: 'online-registration',
    title: 'Online-Only Voter Registration',
    description: 'Transition to a completely digital voter registration system, eliminating paper-based registration at government offices.',
    category: 'Registration'
  },
  {
    id: 'constituency-redraw',
    title: 'Constituency Boundary Restructuring',
    description: 'Redraw electoral constituency boundaries based on new census data, potentially changing representation patterns.',
    category: 'Representation'
  },
  {
    id: 'campaign-limit',
    title: 'Shortened Campaign Period',
    description: 'Reduce the official election campaign period from 14 days to 7 days before polling.',
    category: 'Campaigning'
  },
  {
    id: 'voting-age',
    title: 'Increase Minimum Voting Age',
    description: 'Raise the minimum voting age from 18 to 21 years, similar to pre-1989 provisions.',
    category: 'Eligibility'
  },
  {
    id: 'backward-regions',
    title: 'Priority Polling Infrastructure',
    description: 'Allocate additional polling booths and resources to economically backward regions to increase accessibility.',
    category: 'Infrastructure'
  }
];

export function VoterImpactSimulatorGame() {
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [isLoading, setIsLoading] = useState(false);
  const { translateText, translateObject } = useTranslateResponse();
  const [gameState, setGameState] = useState<GameState>({
    selectedPolicy: null,
    decision: null,
    demographicImpacts: [],
    overallTurnoutChange: 0,
    impactSummary: '',
    articleReviews: [],
    courtChallenges: [],
    courtRiskLevel: 0,
    riskExplanation: '',
    judicialPrediction: '',
    scores: { democracy: 0, fairness: 0, inclusion: 0, legalStability: 0 },
    realWorldComparison: '',
    learnings: [],
    reflectionQuestion: '',
    badges: []
  });

  const handlePolicySelect = (policy: Policy) => {
    setGameState(prev => ({ ...prev, selectedPolicy: policy }));
  };

  const handleDecision = async (decision: 'implement' | 'modify' | 'reject') => {
    setGameState(prev => ({ ...prev, decision }));
    setIsLoading(true);
    setPhase('simulation');

    try {
      // Simulate demographic impact
      const { data: simData, error: simError } = await supabase.functions.invoke('voter-impact-simulator', {
        body: {
          policy: gameState.selectedPolicy,
          decision,
          type: 'simulate'
        }
      });

      if (simError) throw simError;

      const translatedSummary = await translateText(simData.summary || '');
      setGameState(prev => ({
        ...prev,
        demographicImpacts: simData.demographicImpacts || [],
        overallTurnoutChange: simData.overallTurnoutChange || 0,
        impactSummary: translatedSummary
      }));

      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      setPhase('constitutional-review');

      // Constitutional review
      const { data: reviewData, error: reviewError } = await supabase.functions.invoke('voter-impact-simulator', {
        body: {
          policy: gameState.selectedPolicy,
          decision,
          type: 'constitutional-review'
        }
      });

      if (reviewError) throw reviewError;

      const translatedRisk = await translateText(reviewData.riskExplanation || '');
      const translatedPrediction = await translateText(reviewData.judicialPrediction || '');
      setGameState(prev => ({
        ...prev,
        articleReviews: reviewData.articles || [],
        courtChallenges: reviewData.courtChallenges || [],
        courtRiskLevel: reviewData.courtRiskLevel || 0,
        riskExplanation: translatedRisk,
        judicialPrediction: translatedPrediction
      }));

    } catch (error) {
      console.error('Error during simulation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const proceedToOutcome = async () => {
    setIsLoading(true);
    setPhase('outcome');

    try {
      const { data, error } = await supabase.functions.invoke('voter-impact-simulator', {
        body: {
          policy: {
            ...gameState.selectedPolicy,
            demographicImpacts: gameState.demographicImpacts,
            courtRiskLevel: gameState.courtRiskLevel
          },
          decision: gameState.decision,
          type: 'final-outcome'
        }
      });

      if (error) throw error;

      const translatedComparison = await translateText(data.realWorldComparison || '');
      const translatedReflection = await translateText(data.reflectionQuestion || '');
      setGameState(prev => ({
        ...prev,
        scores: data.scores || { democracy: 50, fairness: 50, inclusion: 50, legalStability: 50 },
        realWorldComparison: translatedComparison,
        learnings: data.learnings || [],
        reflectionQuestion: translatedReflection,
        badges: data.badges || []
      }));

    } catch (error) {
      console.error('Error getting outcome:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetGame = () => {
    setPhase('intro');
    setGameState({
      selectedPolicy: null,
      decision: null,
      demographicImpacts: [],
      overallTurnoutChange: 0,
      impactSummary: '',
      articleReviews: [],
      courtChallenges: [],
      courtRiskLevel: 0,
      riskExplanation: '',
      judicialPrediction: '',
      scores: { democracy: 0, fairness: 0, inclusion: 0, legalStability: 0 },
      realWorldComparison: '',
      learnings: [],
      reflectionQuestion: '',
      badges: []
    });
  };

  const getImpactIcon = (direction: string) => {
    if (direction === 'increase') return <TrendingUp className="w-5 h-5 text-emerald-500" />;
    if (direction === 'decrease') return <TrendingDown className="w-5 h-5 text-red-500" />;
    return <Minus className="w-5 h-5 text-muted-foreground" />;
  };

  const getStatusIcon = (status: string) => {
    if (status === 'compliant') return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    if (status === 'potential_violation') return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-emerald-500';
    if (score >= 40) return 'text-amber-500';
    return 'text-red-500';
  };

  const getRiskColor = (risk: number) => {
    if (risk <= 30) return 'bg-emerald-500';
    if (risk <= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  // Intro Screen
  if (phase === 'intro') {
    return (
      <div className="text-center space-y-8 py-8">
        <div className="space-y-4">
          <div className="text-7xl mb-6">🗳️</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Voter Impact Simulator
          </h1>
          <p className="text-xl text-muted-foreground italic">
            "Every policy changes who gets heard."
          </p>
        </div>

        <Card className="max-w-2xl mx-auto bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200/50 dark:border-blue-800/50">
          <CardContent className="p-6 space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              You are designing an election-related policy. Your decision will affect 
              turnout, equality, and constitutional fairness.
            </p>
            <div className="space-y-2">
              <p className="font-medium text-foreground">The AI will simulate its impact across:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {['Rural voters', 'Urban voters', 'Minority groups', 'Youth voters', 'Judiciary response'].map((group) => (
                  <Badge key={group} variant="secondary" className="bg-background/80">
                    <Users className="w-3 h-3 mr-1" />
                    {group}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Button 
          size="xl" 
          variant="hero"
          onClick={() => setPhase('policy-selection')}
          className="gap-2"
        >
          <Play className="w-5 h-5" />
          Start Simulation
        </Button>
      </div>
    );
  }

  // Policy Selection Phase
  if (phase === 'policy-selection') {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <Badge variant="outline" className="mb-2">Phase 1 of 4</Badge>
          <h2 className="text-2xl font-bold">Select a Policy Proposal</h2>
          <p className="text-muted-foreground">Choose one policy to analyze its electoral impact</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {policies.map((policy) => (
            <Card 
              key={policy.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                gameState.selectedPolicy?.id === policy.id 
                  ? 'ring-2 ring-primary shadow-lg' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => handlePolicySelect(policy)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <Badge variant="secondary" className="text-xs">{policy.category}</Badge>
                  {gameState.selectedPolicy?.id === policy.id && (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  )}
                </div>
                <CardTitle className="text-lg mt-2">{policy.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{policy.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {gameState.selectedPolicy && (
          <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-primary font-medium">
                <Vote className="w-5 h-5" />
                <span>Selected Policy: {gameState.selectedPolicy.title}</span>
              </div>
              <p className="font-medium text-foreground">What do you want to do?</p>
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={() => handleDecision('implement')}
                  className="flex-1 min-w-[150px]"
                  variant="default"
                >
                  Implement as proposed
                </Button>
                <Button 
                  onClick={() => handleDecision('modify')}
                  className="flex-1 min-w-[150px]"
                  variant="secondary"
                >
                  Modify to reduce impact
                </Button>
                <Button 
                  onClick={() => handleDecision('reject')}
                  className="flex-1 min-w-[150px]"
                  variant="outline"
                >
                  Reject policy
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Simulation Phase
  if (phase === 'simulation') {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <Badge variant="outline" className="mb-2">Phase 2 of 4</Badge>
          <h2 className="text-2xl font-bold">Demographic Impact Simulation</h2>
          <p className="text-muted-foreground">
            Analyzing how "{gameState.selectedPolicy?.title}" affects different voter groups
          </p>
        </div>

        {isLoading && gameState.demographicImpacts.length === 0 ? (
          <Card className="p-12">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <BarChart3 className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" />
              </div>
              <p className="text-muted-foreground animate-pulse">
                Running AI simulation across voter demographics...
              </p>
            </div>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Demographic Impact Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {gameState.demographicImpacts.map((impact, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex-shrink-0">
                      {getImpactIcon(impact.direction)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{impact.group}</span>
                        <span className={`text-sm font-bold ${
                          impact.changePercent > 0 ? 'text-emerald-500' : 
                          impact.changePercent < 0 ? 'text-red-500' : 'text-muted-foreground'
                        }`}>
                          {impact.changePercent > 0 ? '+' : ''}{impact.changePercent}%
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{impact.explanation}</p>
                    </div>
                    <div className="w-24 hidden sm:block">
                      <Progress 
                        value={50 + impact.changePercent} 
                        className="h-2"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {gameState.impactSummary && (
              <Card className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <BarChart3 className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium mb-1">Overall Turnout Change: 
                        <span className={`ml-2 ${gameState.overallTurnoutChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {gameState.overallTurnoutChange > 0 ? '+' : ''}{gameState.overallTurnoutChange}%
                        </span>
                      </p>
                      <p className="text-sm text-muted-foreground">{gameState.impactSummary}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    );
  }

  // Constitutional Review Phase
  if (phase === 'constitutional-review') {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <Badge variant="outline" className="mb-2">Phase 3 of 4</Badge>
          <h2 className="text-2xl font-bold">Constitutional & Legal Review</h2>
          <p className="text-muted-foreground">
            Election Commission + Supreme Court analysis
          </p>
        </div>

        {isLoading && gameState.articleReviews.length === 0 ? (
          <Card className="p-12">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <Scale className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" />
              </div>
              <p className="text-muted-foreground animate-pulse">
                Conducting constitutional review...
              </p>
            </div>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-primary" />
                  Constitutional Review
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {gameState.articleReviews.map((review, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    {getStatusIcon(review.status)}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{review.article}</span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            review.status === 'compliant' ? 'border-emerald-500 text-emerald-500' :
                            review.status === 'potential_violation' ? 'border-amber-500 text-amber-500' :
                            'border-red-500 text-red-500'
                          }`}
                        >
                          {review.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.explanation}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {gameState.courtChallenges.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">⚠️ Possible Court Challenges</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {gameState.courtChallenges.map((challenge, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-amber-500">•</span>
                        {challenge}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <Card className="border-2">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium flex items-center gap-2">
                    🧑‍⚖️ Court Risk Meter
                  </span>
                  <span className={`font-bold text-lg ${
                    gameState.courtRiskLevel <= 30 ? 'text-emerald-500' :
                    gameState.courtRiskLevel <= 60 ? 'text-amber-500' :
                    'text-red-500'
                  }`}>
                    {gameState.courtRiskLevel <= 30 ? 'LOW' :
                     gameState.courtRiskLevel <= 60 ? 'MEDIUM' : 'HIGH'}
                  </span>
                </div>
                <div className="h-4 rounded-full bg-muted overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${getRiskColor(gameState.courtRiskLevel)}`}
                    style={{ width: `${gameState.courtRiskLevel}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">{gameState.riskExplanation}</p>
                {gameState.judicialPrediction && (
                  <div className="p-3 rounded-lg bg-muted/50 border">
                    <p className="text-sm font-medium">🔮 Judicial Prediction:</p>
                    <p className="text-sm text-muted-foreground mt-1">{gameState.judicialPrediction}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <Button 
                size="lg" 
                onClick={proceedToOutcome}
                className="gap-2"
              >
                View Final Outcome
                <TrendingUp className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    );
  }

  // Outcome Phase
  if (phase === 'outcome') {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <Badge variant="outline" className="mb-2">Phase 4 of 4</Badge>
          <h2 className="text-2xl font-bold">📊 Overall Impact Summary</h2>
        </div>

        {isLoading ? (
          <Card className="p-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <p className="text-muted-foreground animate-pulse">
                Calculating final outcome...
              </p>
            </div>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Democracy', value: gameState.scores.democracy, icon: Vote },
                { label: 'Fairness', value: gameState.scores.fairness, icon: Scale },
                { label: 'Inclusion', value: gameState.scores.inclusion, icon: Heart },
                { label: 'Legal Stability', value: gameState.scores.legalStability, icon: Shield },
              ].map((score) => (
                <Card key={score.label} className="text-center">
                  <CardContent className="p-4">
                    <score.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">{score.label}</p>
                    <p className={`text-3xl font-bold ${getScoreColor(score.value)}`}>
                      {score.value}
                    </p>
                    <Progress value={score.value} className="h-2 mt-2" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {gameState.realWorldComparison && (
              <Card className="bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20">
                <CardContent className="p-4">
                  <p className="font-medium mb-2">🧾 Real-world Comparison</p>
                  <p className="text-sm text-muted-foreground">{gameState.realWorldComparison}</p>
                </CardContent>
              </Card>
            )}

            {gameState.badges.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    Badges Earned
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {gameState.badges.map((badge) => (
                      <div 
                        key={badge.id}
                        className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                          badge.earned 
                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30' 
                            : 'border-muted opacity-50'
                        }`}
                      >
                        <span className="text-2xl">{badge.earned ? '🏅' : '🔒'}</span>
                        <div>
                          <p className={`font-medium text-sm ${badge.earned ? '' : 'text-muted-foreground'}`}>
                            {badge.name}
                          </p>
                          <p className="text-xs text-muted-foreground">{badge.requirement}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-center">
              <Button 
                size="lg" 
                onClick={() => setPhase('learning')}
                className="gap-2"
              >
                <BookOpen className="w-4 h-4" />
                View Learning Summary
              </Button>
            </div>
          </>
        )}
      </div>
    );
  }

  // Learning Phase
  if (phase === 'learning') {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">📚 What You Learned</h2>
          <p className="text-muted-foreground">Key insights from this simulation</p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            {gameState.learnings.map((learning, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <p className="text-foreground">{learning}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {gameState.reflectionQuestion && (
          <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="p-6">
              <p className="font-medium mb-2">💭 Reflection Question:</p>
              <p className="text-lg italic text-muted-foreground">{gameState.reflectionQuestion}</p>
            </CardContent>
          </Card>
        )}

        <Card className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardContent className="p-6">
            <h3 className="font-medium mb-3">🎯 Key Takeaways</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Elections are about fairness, not just rules
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Policies can unintentionally exclude voters
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Constitutional democracy protects participation
              </li>
            </ul>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button 
            size="lg" 
            onClick={resetGame}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Try a Different Policy
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
