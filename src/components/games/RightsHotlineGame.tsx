import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Phone, User, AlertTriangle, CheckCircle2, XCircle, Loader2, RotateCcw, Trophy, Lightbulb, Scale, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslateResponse } from '@/hooks/useTranslateResponse';

type Difficulty = 'easy' | 'medium' | 'hard';
type GamePhase = 'setup' | 'receiving' | 'responding' | 'result';

interface Complaint {
  complaint: string;
  callerName: string;
  callerBackground: string;
  category: string;
  violatedRights: string[];
  correctCategory: string;
  correctRemedies: string[];
  explanation: string;
  relatedCase: string | null;
}

interface EvaluationResult {
  categoryScore: number;
  categoryFeedback: string;
  rightsScore: number;
  rightsFeedback: string;
  remedyScore: number;
  remedyFeedback: string;
  overallScore: number;
  correctAnswer: {
    category: string;
    violatedRights: string[];
    remedies: string[];
  };
  learningTip: string;
  relatedCase: string | null;
}

const categories = [
  'Employment',
  'Education',
  'Detention',
  'Discrimination',
  'Expression',
  'Religion',
  'Property',
  'Other'
];

const commonRights = [
  'Article 14 - Equality before Law',
  'Article 15 - Prohibition of Discrimination',
  'Article 16 - Equality in Public Employment',
  'Article 17 - Abolition of Untouchability',
  'Article 19 - Freedom of Speech & Expression',
  'Article 20 - Protection against Conviction',
  'Article 21 - Right to Life & Liberty',
  'Article 21A - Right to Education',
  'Article 22 - Protection against Arrest',
  'Article 23 - Prohibition of Forced Labor',
  'Article 24 - Prohibition of Child Labor',
  'Article 25 - Freedom of Religion',
  'Article 32 - Right to Constitutional Remedies'
];

export function RightsHotlineGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedRights, setSelectedRights] = useState<string[]>([]);
  const [suggestedRemedy, setSuggestedRemedy] = useState('');
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [casesHandled, setCasesHandled] = useState(0);
  const { translateText, translateObject } = useTranslateResponse();

  const startGame = async () => {
    setIsLoading(true);
    setPhase('receiving');
    
    try {
      const { data, error } = await supabase.functions.invoke('rights-hotline', {
        body: { action: 'generate_complaint', difficulty }
      });

      if (error) throw error;
      
      const translated = await translateObject(data, ['complaint', 'callerBackground']);
      setComplaint(translated);
      setPhase('responding');
    } catch (error) {
      console.error('Error generating complaint:', error);
      toast.error('Failed to receive call. Please try again.');
      setPhase('setup');
    } finally {
      setIsLoading(false);
    }
  };

  const submitResponse = async () => {
    if (!selectedCategory) {
      toast.error('Please select a category');
      return;
    }
    if (selectedRights.length === 0) {
      toast.error('Please identify at least one violated right');
      return;
    }
    if (!suggestedRemedy.trim()) {
      toast.error('Please suggest a legal remedy');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('rights-hotline', {
        body: {
          action: 'evaluate_response',
          complaint: complaint?.complaint,
          userResponse: {
            category: selectedCategory,
            violatedRights: selectedRights,
            remedy: suggestedRemedy
          }
        }
      });

      if (error) throw error;

      const translated = await translateObject(data, ['categoryFeedback', 'rightsFeedback', 'remedyFeedback', 'learningTip']);
      setResult(translated);
      setScore(prev => prev + translated.overallScore);
      setCasesHandled(prev => prev + 1);
      setPhase('result');
    } catch (error) {
      console.error('Error evaluating response:', error);
      toast.error('Failed to evaluate response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRight = (right: string) => {
    setSelectedRights(prev =>
      prev.includes(right)
        ? prev.filter(r => r !== right)
        : [...prev, right]
    );
  };

  const nextCase = () => {
    setComplaint(null);
    setSelectedCategory('');
    setSelectedRights([]);
    setSuggestedRemedy('');
    setResult(null);
    startGame();
  };

  const resetGame = () => {
    setPhase('setup');
    setComplaint(null);
    setSelectedCategory('');
    setSelectedRights([]);
    setSuggestedRemedy('');
    setResult(null);
    setScore(0);
    setCasesHandled(0);
  };

  const getDifficultyColor = (d: Difficulty) => {
    switch (d) {
      case 'easy': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'hard': return 'bg-red-500/20 text-red-400 border-red-500/30';
    }
  };

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-green-400';
    if (s >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Setup Phase
  if (phase === 'setup') {
    return (
      <div className="space-y-8">
        {/* Game Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 mb-4">
            <Phone className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Rights Violation Hotline</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            You're running a citizen rights hotline. Receive complaints, identify violations, and suggest legal remedies.
          </p>
        </div>

        {/* Stats */}
        {casesHandled > 0 && (
          <div className="flex justify-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{casesHandled}</div>
              <div className="text-sm text-muted-foreground">Cases Handled</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{Math.round(score / casesHandled)}</div>
              <div className="text-sm text-muted-foreground">Avg Score</div>
            </div>
          </div>
        )}

        {/* Difficulty Selection */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="text-lg">Select Difficulty</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    difficulty === d
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Badge className={getDifficultyColor(d)}>{d}</Badge>
                  <p className="text-xs text-muted-foreground mt-2">
                    {d === 'easy' && 'Basic rights cases'}
                    {d === 'medium' && 'Nuanced scenarios'}
                    {d === 'hard' && 'Complex situations'}
                  </p>
                </button>
              ))}
            </div>

            <Button 
              onClick={startGame} 
              className="w-full"
              size="lg"
            >
              <Phone className="w-5 h-5 mr-2" />
              Start Taking Calls
            </Button>
          </CardContent>
        </Card>

        {/* How to Play */}
        <Card className="bg-muted/30 border-border">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              How to Play
            </h3>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li>1. Receive a complaint from a citizen</li>
              <li>2. Classify the type of issue</li>
              <li>3. Identify which fundamental rights are violated</li>
              <li>4. Suggest appropriate legal remedies</li>
              <li>5. Get AI-powered feedback on your response</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Receiving Call (Loading)
  if (phase === 'receiving' || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-red-500/20 animate-pulse flex items-center justify-center">
            <Phone className="w-12 h-12 text-red-400 animate-bounce" />
          </div>
          <div className="absolute inset-0 rounded-full border-4 border-red-500/30 animate-ping" />
        </div>
        <div className="text-center">
          <p className="text-xl font-semibold mb-2">Incoming Call...</p>
          <p className="text-muted-foreground">A citizen is reporting a rights violation</p>
        </div>
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Responding Phase
  if (phase === 'responding' && complaint) {
    return (
      <div className="space-y-6">
        {/* Caller Info */}
        <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-red-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{complaint.callerName}</span>
                  <Badge variant="outline" className="text-xs">{complaint.callerBackground}</Badge>
                </div>
                <p className="text-lg leading-relaxed">"{complaint.complaint}"</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Selection */}
        <div className="space-y-3">
          <label className="font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            Classify the Issue
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  selectedCategory === cat
                    ? 'border-primary bg-primary/20 text-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Rights Selection */}
        <div className="space-y-3">
          <label className="font-semibold flex items-center gap-2">
            <Scale className="w-4 h-4 text-blue-400" />
            Identify Violated Rights
            <span className="text-sm font-normal text-muted-foreground">(Select all that apply)</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {commonRights.map((right) => (
              <button
                key={right}
                onClick={() => toggleRight(right)}
                className={`p-3 rounded-lg border text-left text-sm transition-all ${
                  selectedRights.includes(right)
                    ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                    : 'border-border hover:border-blue-500/50'
                }`}
              >
                {selectedRights.includes(right) && (
                  <CheckCircle2 className="w-4 h-4 inline mr-2" />
                )}
                {right}
              </button>
            ))}
          </div>
        </div>

        {/* Remedy Input */}
        <div className="space-y-3">
          <label className="font-semibold flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-green-400" />
            Suggest Legal Remedy
          </label>
          <Textarea
            value={suggestedRemedy}
            onChange={(e) => setSuggestedRemedy(e.target.value)}
            placeholder="What legal steps should the caller take? (e.g., File a writ petition under Article 32, approach State Human Rights Commission, file PIL...)"
            className="min-h-[100px]"
          />
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={resetGame}>
            <RotateCcw className="w-4 h-4 mr-2" />
            End Shift
          </Button>
          <Button onClick={submitResponse} className="flex-1" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <CheckCircle2 className="w-4 h-4 mr-2" />
            )}
            Submit Response
          </Button>
        </div>
      </div>
    );
  }

  // Result Phase
  if (phase === 'result' && result) {
    return (
      <div className="space-y-6">
        {/* Score Header */}
        <div className="text-center py-6">
          <div className={`text-6xl font-bold ${getScoreColor(result.overallScore)}`}>
            {result.overallScore}
          </div>
          <p className="text-muted-foreground mt-2">Overall Score</p>
          {result.overallScore >= 80 && (
            <div className="flex items-center justify-center gap-2 mt-3 text-green-400">
              <Trophy className="w-5 h-5" />
              <span className="font-semibold">Excellent Response!</span>
            </div>
          )}
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-card/50">
            <CardContent className="pt-4 text-center">
              <div className={`text-2xl font-bold ${getScoreColor(result.categoryScore)}`}>
                {result.categoryScore}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Category</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="pt-4 text-center">
              <div className={`text-2xl font-bold ${getScoreColor(result.rightsScore)}`}>
                {result.rightsScore}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Rights ID</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="pt-4 text-center">
              <div className={`text-2xl font-bold ${getScoreColor(result.remedyScore)}`}>
                {result.remedyScore}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Remedy</p>
            </CardContent>
          </Card>
        </div>

        {/* Feedback Sections */}
        <div className="space-y-4">
          <Card className={result.categoryScore >= 80 ? 'border-green-500/30' : 'border-yellow-500/30'}>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                {result.categoryScore >= 80 ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold">Category Classification</p>
                  <p className="text-sm text-muted-foreground mt-1">{result.categoryFeedback}</p>
                  <p className="text-sm mt-2">
                    <span className="text-muted-foreground">Correct: </span>
                    <span className="text-primary">{result.correctAnswer.category}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={result.rightsScore >= 80 ? 'border-green-500/30' : 'border-yellow-500/30'}>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                {result.rightsScore >= 80 ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold">Rights Identification</p>
                  <p className="text-sm text-muted-foreground mt-1">{result.rightsFeedback}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {result.correctAnswer.violatedRights.map((right, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {right}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={result.remedyScore >= 80 ? 'border-green-500/30' : 'border-yellow-500/30'}>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                {result.remedyScore >= 80 ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold">Suggested Remedy</p>
                  <p className="text-sm text-muted-foreground mt-1">{result.remedyFeedback}</p>
                  <div className="mt-2 space-y-1">
                    {result.correctAnswer.remedies.map((remedy, i) => (
                      <p key={i} className="text-sm text-green-400">• {remedy}</p>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Learning Tip */}
        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Learning Tip</p>
                <p className="text-sm text-muted-foreground mt-1">{result.learningTip}</p>
                {result.relatedCase && (
                  <p className="text-sm mt-2">
                    <span className="text-muted-foreground">Related Case: </span>
                    <span className="text-primary font-medium">{result.relatedCase}</span>
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={resetGame}>
            <RotateCcw className="w-4 h-4 mr-2" />
            End Shift
          </Button>
          <Button onClick={nextCase} className="flex-1">
            <Phone className="w-4 h-4 mr-2" />
            Take Next Call
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
