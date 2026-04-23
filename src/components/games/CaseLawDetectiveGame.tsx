import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Search, Scale, Eye, Trophy, RefreshCw } from 'lucide-react';
import { useTranslateResponse } from '@/hooks/useTranslateResponse';

type Difficulty = 'beginner' | 'intermediate' | 'advanced';
type GamePhase = 'setup' | 'investigating' | 'predicting' | 'revealed' | 'results';

interface CaseData {
  caseSummary: string;
  hiddenFacts: string[];
}

interface GameResult {
  constitutionalIssues: string[];
  articlesInvolved: { article: string; explanation: string }[];
  predictedJudgment: string;
  actualCase: {
    name: string;
    finalVerdict: string;
  };
  learningPoints: string;
  score: number;
  feedback: string;
}

export function CaseLawDetectiveGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userArticles, setUserArticles] = useState('');
  const [userPrediction, setUserPrediction] = useState('');
  const [result, setResult] = useState<GameResult | null>(null);
  const [advancedMode, setAdvancedMode] = useState(false);
  const { translateText, translateObject } = useTranslateResponse();

  const startGame = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('case-law-detective', {
        body: { 
          action: 'generate_case',
          difficulty,
          advancedMode
        }
      });

      if (error) throw error;

      const translatedSummary = await translateText(data.caseSummary);
      setCaseData({
        caseSummary: translatedSummary,
        hiddenFacts: data.hiddenFacts || []
      });
      setPhase('investigating');
    } catch (error) {
      console.error('Error starting game:', error);
      toast.error('Failed to generate case. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const submitInvestigation = () => {
    if (!userArticles.trim()) {
      toast.error('Please identify the articles involved');
      return;
    }
    setPhase('predicting');
  };

  const submitPrediction = async () => {
    if (!userPrediction.trim()) {
      toast.error('Please make your prediction');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('case-law-detective', {
        body: { 
          action: 'evaluate',
          difficulty,
          caseSummary: caseData?.caseSummary,
          userArticles,
          userPrediction,
          advancedMode
        }
      });

      if (error) throw error;

      const translated = await translateObject(data, ['feedback', 'learningPoints']);
      setResult(translated);
      setPhase('results');
    } catch (error) {
      console.error('Error evaluating:', error);
      toast.error('Failed to evaluate. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetGame = () => {
    setPhase('setup');
    setCaseData(null);
    setUserArticles('');
    setUserPrediction('');
    setResult(null);
  };

  const getDifficultyColor = (diff: Difficulty) => {
    switch (diff) {
      case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
    }
  };

  if (phase === 'setup') {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Case Law Detective</h2>
          <p className="text-muted-foreground">
            Investigate famous case summaries, identify constitutional issues, and predict judgments!
          </p>
        </div>

        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Select Difficulty</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {(['beginner', 'intermediate', 'advanced'] as Difficulty[]).map((diff) => (
                <Button
                  key={diff}
                  variant={difficulty === diff ? 'default' : 'outline'}
                  onClick={() => setDifficulty(diff)}
                  className="capitalize"
                >
                  {diff}
                </Button>
              ))}
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div>
                <p className="font-medium">Advanced Mode</p>
                <p className="text-sm text-muted-foreground">Case name hidden until the end</p>
              </div>
              <Button
                variant={advancedMode ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAdvancedMode(!advancedMode)}
              >
                {advancedMode ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Button 
          onClick={startGame} 
          className="w-full" 
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Case...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Start Investigation
            </>
          )}
        </Button>
      </div>
    );
  }

  if (phase === 'investigating' && caseData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge className={getDifficultyColor(difficulty)}>
              {difficulty}
            </Badge>
            {advancedMode && (
              <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                <Eye className="w-3 h-3 mr-1" />
                Case Name Hidden
              </Badge>
            )}
          </div>
          <Badge variant="secondary">Phase 1: Investigation</Badge>
        </div>

        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Case Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed whitespace-pre-line">
              {caseData.caseSummary}
            </p>
            {caseData.hiddenFacts.length > 0 && (
              <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground italic">
                  Some facts have been redacted for investigation...
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Identify Constitutional Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="List the Articles you think are involved (e.g., Article 14, Article 21, Article 19(1)(a)...) and briefly explain why each is relevant."
              value={userArticles}
              onChange={(e) => setUserArticles(e.target.value)}
              className="min-h-[120px]"
            />
          </CardContent>
        </Card>

        <Button onClick={submitInvestigation} className="w-full" size="lg">
          <Scale className="w-4 h-4 mr-2" />
          Proceed to Prediction
        </Button>
      </div>
    );
  }

  if (phase === 'predicting') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Badge className={getDifficultyColor(difficulty)}>
            {difficulty}
          </Badge>
          <Badge variant="secondary">Phase 2: Prediction</Badge>
        </div>

        <Card className="bg-muted/30 border-border/50">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-2">Your identified articles:</p>
            <p className="text-foreground">{userArticles}</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="w-5 h-5" />
              Predict the Judgment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Based on your analysis, predict what the court's judgment would be. Consider the constitutional issues and articles you identified."
              value={userPrediction}
              onChange={(e) => setUserPrediction(e.target.value)}
              className="min-h-[150px]"
            />
          </CardContent>
        </Card>

        <Button 
          onClick={submitPrediction} 
          className="w-full" 
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-2" />
              Reveal Case & Results
            </>
          )}
        </Button>
      </div>
    );
  }

  if (phase === 'results' && result) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Badge className={getDifficultyColor(difficulty)}>
            {difficulty}
          </Badge>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="text-xl font-bold">{result.score}/100</span>
          </div>
        </div>

        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg">🎯 The Actual Case</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Case Name</p>
              <p className="text-xl font-bold text-primary">{result.actualCase.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Final Verdict</p>
              <p className="text-foreground">{result.actualCase.finalVerdict}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Constitutional Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium mb-2">Constitutional Issues:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {result.constitutionalIssues.map((issue, i) => (
                  <li key={i}>{issue}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium mb-2">Articles Involved:</p>
              <div className="space-y-2">
                {result.articlesInvolved.map((item, i) => (
                  <div key={i} className="p-2 bg-muted/30 rounded">
                    <span className="font-medium text-primary">{item.article}:</span>{' '}
                    <span className="text-muted-foreground">{item.explanation}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Your Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-medium mb-1">Feedback:</p>
              <p className="text-muted-foreground">{result.feedback}</p>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg">
              <p className="font-medium mb-1">📚 Learning Takeaway:</p>
              <p className="text-foreground">{result.learningPoints}</p>
            </div>
          </CardContent>
        </Card>

        <Button onClick={resetGame} className="w-full" size="lg">
          <RefreshCw className="w-4 h-4 mr-2" />
          Play Again
        </Button>
      </div>
    );
  }

  return null;
}
