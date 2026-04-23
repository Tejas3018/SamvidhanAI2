import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Swords, Bot, User, Trophy, RefreshCw, Scale } from 'lucide-react';
import { useTranslateResponse } from '@/hooks/useTranslateResponse';

type Difficulty = 'beginner' | 'intermediate' | 'advanced';
type GamePhase = 'setup' | 'ai-opening' | 'user-rebuttal' | 'ai-counter' | 'results';

interface AIArgument {
  argument: string;
  articlesUsed: string[];
}

interface DebateResult {
  articleUsageScore: number;
  logicalCoherenceScore: number;
  constitutionalValidityScore: number;
  totalScore: number;
  feedback: string;
  aiCounterArgument: string;
  aiArticlesUsed: string[];
  learningPoints: string;
  winner: 'user' | 'ai' | 'tie';
}

export function AIDebateGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [topic, setTopic] = useState('');
  const [aiArgument, setAiArgument] = useState<AIArgument | null>(null);
  const [userRebuttal, setUserRebuttal] = useState('');
  const [result, setResult] = useState<DebateResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [round, setRound] = useState(1);
  const { translateText, translateObject } = useTranslateResponse();

  const debateTopics = {
    beginner: [
      'Right to Privacy vs National Security',
      'Freedom of Speech vs Hate Speech Laws',
      'Right to Education vs State Resources'
    ],
    intermediate: [
      'Reservation Policy and Right to Equality',
      'Capital Punishment and Right to Life',
      'Uniform Civil Code vs Religious Freedom'
    ],
    advanced: [
      'Judicial Activism vs Separation of Powers',
      'President\'s Rule and Federal Structure',
      'Basic Structure Doctrine Limitations'
    ]
  };

  const startDebate = async () => {
    const topics = debateTopics[difficulty];
    const selectedTopic = topics[Math.floor(Math.random() * topics.length)];
    setTopic(selectedTopic);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-debate', {
        body: {
          action: 'ai_opening',
          topic: selectedTopic,
          difficulty,
          round
        }
      });

      if (error) throw error;

      const translatedArg = await translateText(data.argument);
      setAiArgument({
        argument: translatedArg,
        articlesUsed: data.articlesUsed
      });
      setPhase('ai-opening');
    } catch (error) {
      console.error('Error starting debate:', error);
      toast.error('Failed to start debate. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const submitRebuttal = async () => {
    if (!userRebuttal.trim()) {
      toast.error('Please enter your rebuttal');
      return;
    }

    setIsLoading(true);
    setPhase('user-rebuttal');

    try {
      const { data, error } = await supabase.functions.invoke('ai-debate', {
        body: {
          action: 'evaluate_and_counter',
          topic,
          difficulty,
          aiArgument: aiArgument?.argument,
          aiArticles: aiArgument?.articlesUsed,
          userRebuttal,
          round
        }
      });

      if (error) throw error;

      const translated = await translateObject(data, ['feedback', 'aiCounterArgument', 'learningPoints']);
      setResult(translated);
      setPhase('results');
    } catch (error) {
      console.error('Error evaluating rebuttal:', error);
      toast.error('Failed to evaluate. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetGame = () => {
    setPhase('setup');
    setTopic('');
    setAiArgument(null);
    setUserRebuttal('');
    setResult(null);
    setRound(1);
  };

  const getDifficultyColor = (diff: Difficulty) => {
    switch (diff) {
      case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (phase === 'setup') {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">AI vs You: Constitutional Debate</h2>
          <p className="text-muted-foreground">
            Challenge the AI in a constitutional debate. Counter its arguments with your knowledge!
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

            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Sample Topics:</p>
              <ul className="text-sm space-y-1">
                {debateTopics[difficulty].map((t, i) => (
                  <li key={i} className="text-foreground">• {t}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={startDebate}
          className="w-full"
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              AI is preparing...
            </>
          ) : (
            <>
              <Swords className="w-4 h-4 mr-2" />
              Start Debate
            </>
          )}
        </Button>
      </div>
    );
  }

  if (phase === 'ai-opening' && aiArgument) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Badge className={getDifficultyColor(difficulty)}>
            {difficulty}
          </Badge>
          <Badge variant="secondary">Round {round}</Badge>
        </div>

        <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Scale className="w-5 h-5" />
              Debate Topic
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold text-foreground">{topic}</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-400" />
              AI's Opening Argument
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground leading-relaxed whitespace-pre-line">
              {aiArgument.argument}
            </p>
            <div className="flex flex-wrap gap-2">
              {aiArgument.articlesUsed.map((article, i) => (
                <Badge key={i} variant="outline" className="border-blue-500/50 text-blue-400">
                  {article}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-green-400" />
              Your Rebuttal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Present your constitutional counter-argument. Cite relevant Articles and build a logical case against the AI's position..."
              value={userRebuttal}
              onChange={(e) => setUserRebuttal(e.target.value)}
              className="min-h-[150px]"
            />
          </CardContent>
        </Card>

        <Button
          onClick={submitRebuttal}
          className="w-full"
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              AI is evaluating...
            </>
          ) : (
            <>
              <Swords className="w-4 h-4 mr-2" />
              Submit Rebuttal
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
            <Trophy className={`w-5 h-5 ${result.winner === 'user' ? 'text-yellow-500' : 'text-muted-foreground'}`} />
            <span className="text-xl font-bold">{result.totalScore}/100</span>
          </div>
        </div>

        <Card className={`bg-gradient-to-br ${
          result.winner === 'user' 
            ? 'from-green-500/20 to-green-500/5 border-green-500/30' 
            : result.winner === 'tie'
            ? 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30'
            : 'from-red-500/20 to-red-500/5 border-red-500/30'
        }`}>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold mb-2">
                {result.winner === 'user' ? '🎉 You Won!' : result.winner === 'tie' ? '🤝 It\'s a Tie!' : '🤖 AI Wins'}
              </p>
              <p className="text-muted-foreground">{result.feedback}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Score Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Article Usage</p>
                <p className={`text-2xl font-bold ${getScoreColor(result.articleUsageScore)}`}>
                  {result.articleUsageScore}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Logical Coherence</p>
                <p className={`text-2xl font-bold ${getScoreColor(result.logicalCoherenceScore)}`}>
                  {result.logicalCoherenceScore}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Constitutional Validity</p>
                <p className={`text-2xl font-bold ${getScoreColor(result.constitutionalValidityScore)}`}>
                  {result.constitutionalValidityScore}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-400" />
              AI's Counter-Argument
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-foreground leading-relaxed">{result.aiCounterArgument}</p>
            <div className="flex flex-wrap gap-2">
              {result.aiArticlesUsed.map((article, i) => (
                <Badge key={i} variant="outline" className="border-blue-500/50 text-blue-400">
                  {article}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary/10 border-primary/30">
          <CardContent className="pt-6">
            <p className="font-medium mb-1">📚 Learning Takeaway:</p>
            <p className="text-foreground">{result.learningPoints}</p>
          </CardContent>
        </Card>

        <Button onClick={resetGame} className="w-full" size="lg">
          <RefreshCw className="w-4 h-4 mr-2" />
          New Debate
        </Button>
      </div>
    );
  }

  return null;
}
