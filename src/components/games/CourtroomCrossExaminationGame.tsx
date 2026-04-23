import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslateResponse } from '@/hooks/useTranslateResponse';
import { 
  Scale, 
  Send, 
  RotateCcw, 
  Sparkles, 
  MessageSquare,
  AlertTriangle,
  Gavel,
  User,
  Users,
  Trophy,
  Target,
  Brain,
  Shield,
  BookOpen
} from 'lucide-react';

interface CaseData {
  type: string;
  title: string;
  brief: string;
  violation: string;
  justification: string;
  witnessRole: string;
  witnessName: string;
  relevantArticles: string[];
}

interface Message {
  id: string;
  type: 'player' | 'witness' | 'counsel' | 'judge' | 'system';
  content: string;
  emotionalState?: string;
}

interface Verdict {
  effectivenessScore: number;
  constitutionalGrounding: string;
  witnessCredibility: string;
  caseOutcome: string;
  strengths: string[];
  improvements: string[];
  relevantArticlesExplained: { article: string; explanation: string }[];
  realCaseReference: string;
  xpEarned: number;
  badges: string[];
}

type GamePhase = 'intro' | 'case_brief' | 'examination' | 'verdict';
type QuestionMode = 'facts' | 'procedure' | 'constitutional';

export function CourtroomCrossExaminationGame() {
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [playerInput, setPlayerInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const [questionMode, setQuestionMode] = useState<QuestionMode>('facts');
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  
  // Hidden scores
  const [logicalPressure, setLogicalPressure] = useState(50);
  const [constitutionalStrength, setConstitutionalStrength] = useState(50);
  const [credibilityDamage, setCredibilityDamage] = useState(50);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const maxTurns = 8;
  const { translateText, translateObject } = useTranslateResponse();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const startGame = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('courtroom-cross-examination', {
        body: { action: 'get_case' }
      });

      if (error) throw error;
      setCaseData(data.case);
      setPhase('case_brief');
    } catch (error) {
      console.error('Error starting game:', error);
      toast.error('Failed to load case. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const beginExamination = () => {
    setPhase('examination');
    setMessages([{
      id: '1',
      type: 'system',
      content: `The court is now in session. ${caseData?.witnessName}, ${caseData?.witnessRole}, has taken the stand. You may begin your cross-examination.`
    }]);
  };

  const submitQuestion = async () => {
    if (!playerInput.trim() || !caseData) return;

    const question = playerInput.trim();
    setPlayerInput('');
    setIsLoading(true);

    // Add player message
    const playerMessage: Message = {
      id: Date.now().toString(),
      type: 'player',
      content: question
    };
    setMessages(prev => [...prev, playerMessage]);

    try {
      const conversationHistory = messages.map(m => ({
        role: m.type === 'player' ? 'player' : 'assistant',
        content: `[${m.type.toUpperCase()}]: ${m.content}`
      }));

      const { data, error } = await supabase.functions.invoke('courtroom-cross-examination', {
        body: {
          action: 'cross_examine',
          caseData,
          conversationHistory,
          playerQuestion: question,
          questionMode
        }
      });

      if (error) throw error;

      // Add witness response (translated)
      const translatedWitness = await translateText(data.witnessResponse);
      const witnessMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'witness',
        content: translatedWitness,
        emotionalState: data.witnessEmotionalState
      };
      setMessages(prev => [...prev, witnessMessage]);

      // Add opposing counsel action if any
      if (data.opposingCounselAction) {
        const counselMessage: Message = {
          id: (Date.now() + 2).toString(),
          type: 'counsel',
          content: data.opposingCounselAction
        };
        setMessages(prev => [...prev, counselMessage]);
      }

      // Add judge note if any
      if (data.judgeNote) {
        const judgeMessage: Message = {
          id: (Date.now() + 3).toString(),
          type: 'judge',
          content: data.judgeNote
        };
        setMessages(prev => [...prev, judgeMessage]);
      }

      // Update hidden scores
      setLogicalPressure(prev => Math.min(100, Math.max(0, prev + (data.logicalPressureChange || 0))));
      setConstitutionalStrength(prev => Math.min(100, Math.max(0, prev + (data.constitutionalStrengthChange || 0))));
      setCredibilityDamage(prev => Math.min(100, Math.max(0, prev + (data.credibilityDamageChange || 0))));

      setTurnCount(prev => prev + 1);

      // Check if game should end
      if (turnCount + 1 >= maxTurns) {
        setTimeout(() => getVerdict(), 1000);
      }
    } catch (error) {
      console.error('Error during cross-examination:', error);
      toast.error('Failed to process question. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getVerdict = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('courtroom-cross-examination', {
        body: {
          action: 'get_verdict',
          caseData: {
            ...caseData,
            logicalPressure,
            constitutionalStrength,
            credibilityDamage
          },
          conversationHistory: messages.map(m => ({
            role: m.type,
            content: m.content
          }))
        }
      });

      if (error) throw error;
      const translated = await translateObject(data, ['constitutionalGrounding', 'witnessCredibility', 'caseOutcome', 'realCaseReference']);
      setVerdict(translated);
      setPhase('verdict');
    } catch (error) {
      console.error('Error getting verdict:', error);
      toast.error('Failed to get verdict. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetGame = () => {
    setPhase('intro');
    setCaseData(null);
    setMessages([]);
    setPlayerInput('');
    setTurnCount(0);
    setVerdict(null);
    setLogicalPressure(50);
    setConstitutionalStrength(50);
    setCredibilityDamage(50);
  };

  const tryNewCase = async () => {
    resetGame();
    setTimeout(() => startGame(), 100);
  };

  const getEmotionalStateIcon = (state?: string) => {
    switch (state) {
      case 'nervous': return '😰';
      case 'evasive': return '😏';
      case 'defensive': return '😤';
      case 'uncomfortable': return '😓';
      default: return '😐';
    }
  };

  const getMessageStyle = (type: Message['type']) => {
    switch (type) {
      case 'player':
        return 'bg-primary/10 border-primary/30 ml-8';
      case 'witness':
        return 'bg-amber-500/10 border-amber-500/30 mr-8';
      case 'counsel':
        return 'bg-destructive/10 border-destructive/30 mr-8';
      case 'judge':
        return 'bg-blue-500/10 border-blue-500/30';
      case 'system':
        return 'bg-muted border-muted-foreground/20 text-center';
      default:
        return 'bg-muted';
    }
  };

  const getMessageIcon = (type: Message['type']) => {
    switch (type) {
      case 'player': return <User className="w-4 h-4" />;
      case 'witness': return <Users className="w-4 h-4" />;
      case 'counsel': return <AlertTriangle className="w-4 h-4" />;
      case 'judge': return <Gavel className="w-4 h-4" />;
      default: return <Scale className="w-4 h-4" />;
    }
  };

  const getMessageLabel = (type: Message['type']) => {
    switch (type) {
      case 'player': return 'You (Counsel)';
      case 'witness': return caseData?.witnessName || 'Witness';
      case 'counsel': return 'Opposing Counsel';
      case 'judge': return 'Court';
      default: return 'System';
    }
  };

  // Intro Screen
  if (phase === 'intro') {
    return (
      <div className="text-center py-8 max-w-2xl mx-auto">
        <div className="text-8xl mb-6">🧑‍⚖️</div>
        <h1 className="text-4xl font-bold mb-4">Courtroom Cross-Examination</h1>
        <p className="text-xl text-muted-foreground italic mb-8">
          "Truth is not told. It is extracted."
        </p>
        
        <Card className="mb-8 text-left">
          <CardContent className="pt-6 space-y-4">
            <p>You are a lawyer in a constitutional case. A witness is testifying. The opposing counsel (AI) will defend their side.</p>
            
            <div className="space-y-2">
              <p className="font-semibold">Your job:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Ask the right questions</li>
                <li>Expose contradictions</li>
                <li>Protect constitutional values</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Button 
          size="lg" 
          onClick={startGame} 
          disabled={isLoading}
          className="gap-2 text-lg px-8 py-6"
        >
          {isLoading ? (
            <>Loading case...</>
          ) : (
            <>
              <Scale className="w-5 h-5" />
              Enter Courtroom
            </>
          )}
        </Button>
      </div>
    );
  }

  // Case Brief Screen
  if (phase === 'case_brief' && caseData) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <div className="text-center mb-8">
          <Badge variant="outline" className="mb-4">Case Brief</Badge>
          <h1 className="text-3xl font-bold mb-2">{caseData.title}</h1>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6 space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">📜 Case Summary</h3>
              <p className="text-muted-foreground">{caseData.brief}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Alleged Violation
                </h4>
                <p className="text-sm text-muted-foreground">{caseData.violation}</p>
              </div>

              <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Government's Defense
                </h4>
                <p className="text-sm text-muted-foreground">{caseData.justification}</p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-secondary border border-border">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Witness on Stand
              </h4>
              <p className="text-lg font-medium">{caseData.witnessName}</p>
              <p className="text-sm text-muted-foreground">{caseData.witnessRole}</p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button size="lg" onClick={beginExamination} className="gap-2">
            <MessageSquare className="w-5 h-5" />
            Begin Cross-Examination
          </Button>
        </div>
      </div>
    );
  }

  // Examination Screen
  if (phase === 'examination' && caseData) {
    return (
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">{caseData.title}</h2>
            <p className="text-sm text-muted-foreground">Witness: {caseData.witnessName}</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline">
              Turn {turnCount}/{maxTurns}
            </Badge>
            {turnCount >= maxTurns - 2 && (
              <Badge variant="destructive">Final Questions</Badge>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <Card className="mb-4">
          <ScrollArea className="h-[400px] p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 rounded-lg border ${getMessageStyle(message.type)}`}
                >
                  <div className="flex items-center gap-2 mb-2 text-sm font-medium">
                    {getMessageIcon(message.type)}
                    <span>{getMessageLabel(message.type)}</span>
                    {message.emotionalState && (
                      <span className="ml-auto text-lg">
                        {getEmotionalStateIcon(message.emotionalState)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm">{message.content}</p>
                </div>
              ))}
              {isLoading && (
                <div className="text-center py-4">
                  <div className="animate-pulse text-muted-foreground">
                    Witness is responding...
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Input Area */}
        {turnCount < maxTurns && (
          <div className="space-y-4">
            {/* Question Mode Selector */}
            <div className="flex gap-2">
              <Button
                variant={questionMode === 'facts' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setQuestionMode('facts')}
              >
                <Target className="w-4 h-4 mr-2" />
                Ask about Facts
              </Button>
              <Button
                variant={questionMode === 'procedure' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setQuestionMode('procedure')}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Ask about Procedure
              </Button>
              <Button
                variant={questionMode === 'constitutional' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setQuestionMode('constitutional')}
              >
                <Scale className="w-4 h-4 mr-2" />
                Constitutional Basis
              </Button>
            </div>

            {/* Text Input */}
            <div className="flex gap-2">
              <Textarea
                value={playerInput}
                onChange={(e) => setPlayerInput(e.target.value)}
                placeholder="Type your question to the witness..."
                className="resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    submitQuestion();
                  }
                }}
              />
              <Button 
                onClick={submitQuestion} 
                disabled={isLoading || !playerInput.trim()}
                className="px-6"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                Press Enter to send • {maxTurns - turnCount} questions remaining
              </p>
              {turnCount >= 3 && (
                <Button variant="outline" size="sm" onClick={getVerdict}>
                  <Gavel className="w-4 h-4 mr-2" />
                  Rest Case Early
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Verdict Screen
  if (phase === 'verdict' && verdict) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <div className="text-center mb-8">
          <Gavel className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-bold mb-2">Court's Assessment</h1>
          <p className="text-muted-foreground">Case: {caseData?.title}</p>
        </div>

        {/* Main Scores */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-2">
                  {verdict.effectivenessScore}/10
                </div>
                <p className="text-muted-foreground">Cross-Examination Effectiveness</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-center">
                <span>Constitutional Grounding</span>
                <Badge variant={verdict.constitutionalGrounding === 'Strong' ? 'default' : 'secondary'}>
                  {verdict.constitutionalGrounding}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Witness Credibility</span>
                <Badge variant={verdict.witnessCredibility === 'Exposed' ? 'destructive' : 'secondary'}>
                  {verdict.witnessCredibility}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Case Outcome</span>
                <Badge variant={verdict.caseOutcome === 'Favorable' ? 'default' : 'secondary'}>
                  {verdict.caseOutcome}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Strengths & Improvements */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="w-5 h-5 text-primary" />
                What You Did Well
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {verdict.strengths.map((strength, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Brain className="w-5 h-5 text-muted-foreground" />
                Areas to Improve
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {verdict.improvements.map((improvement, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-muted-foreground">→</span>
                    {improvement}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Relevant Articles */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="w-5 h-5" />
              Relevant Constitutional Articles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {verdict.relevantArticlesExplained.map((article, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted">
                  <p className="font-semibold">{article.article}</p>
                  <p className="text-sm text-muted-foreground">{article.explanation}</p>
                </div>
              ))}
            </div>
            {verdict.realCaseReference && (
              <div className="mt-4 p-4 rounded-lg border border-primary/20 bg-primary/5">
                <p className="text-sm">
                  <span className="font-semibold">Similar Real Case: </span>
                  {verdict.realCaseReference}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* XP & Badges */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <Trophy className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">+{verdict.xpEarned} XP</div>
              </div>
              {verdict.badges.length > 0 && (
                <div className="text-center">
                  <div className="text-lg mb-2">🏅 Badges Earned</div>
                  <div className="flex gap-2">
                    {verdict.badges.map((badge, i) => (
                      <Badge key={i} variant="secondary">{badge}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={resetGame} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Retry This Case
          </Button>
          <Button onClick={tryNewCase} className="gap-2">
            <Sparkles className="w-4 h-4" />
            Try a New Case
          </Button>
        </div>
      </div>
    );
  }

  return null;
}