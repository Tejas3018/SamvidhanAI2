import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { 
  Gavel, 
  Scale, 
  Users, 
  Loader2, 
  Sparkles, 
  RotateCcw, 
  ChevronRight, 
  ArrowLeft,
  Trophy,
  Star,
  MessageSquare,
  BookOpen,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslateResponse } from '@/hooks/useTranslateResponse';

type Role = 'judge' | 'petitioner' | 'respondent';
type GameState = 'role-select' | 'loading' | 'playing' | 'submitted' | 'complete';
type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

interface Scenario {
  title: string;
  description: string;
  context: string;
  articles: string[];
}

interface AIResponse {
  relevantArticles: { article: string; reason: string }[];
  argument: string;
  outcome: string;
  learningTakeaway: string;
  score: number;
  feedback: string;
}

const defaultScenarios: Record<DifficultyLevel, Scenario[]> = {
  beginner: [
    {
      title: 'Freedom of Speech vs Public Order',
      description: 'A student activist gives a speech at a university criticizing government policies. The speech leads to minor protests on campus. The university administration suspends the student claiming it disrupted public order.',
      context: 'The student claims their fundamental right to free speech has been violated. The university argues that maintaining order on campus is essential for education.',
      articles: ['Article 19(1)(a)', 'Article 19(2)', 'Article 21']
    },
    {
      title: 'Right to Education',
      description: 'A private school denies admission to a child from an economically weaker section despite having available seats under the 25% reservation quota.',
      context: 'The parents claim violation of the Right to Education Act. The school argues they have already fulfilled their quota with other students.',
      articles: ['Article 21A', 'Article 14', 'Article 15']
    }
  ],
  intermediate: [
    {
      title: 'Privacy vs National Security',
      description: 'The government mandates linking of all social media accounts with Aadhaar numbers for national security purposes. A privacy activist challenges this in court.',
      context: 'The government claims this is necessary to prevent terrorism and fake news. The activist argues it violates the right to privacy established in the Puttaswamy judgment.',
      articles: ['Article 21', 'Article 19(1)(a)', 'Article 14']
    },
    {
      title: 'Reservation in Private Sector',
      description: 'A state government passes a law mandating 75% reservation for local residents in private sector jobs. Several companies challenge this law.',
      context: 'The state argues it promotes employment for locals. Companies argue it violates their right to carry on business and discriminates against non-residents.',
      articles: ['Article 19(1)(g)', 'Article 14', 'Article 16', 'Article 301']
    }
  ],
  advanced: [
    {
      title: 'Religious Freedom vs Gender Equality',
      description: 'Women challenge their exclusion from entering a prominent religious temple that follows a centuries-old tradition of barring women of menstruating age.',
      context: 'Temple authorities claim protection under religious freedom. Women argue this practice discriminates based on gender and violates their right to equality.',
      articles: ['Article 25', 'Article 26', 'Article 14', 'Article 15', 'Article 21']
    },
    {
      title: 'Environmental Rights vs Development',
      description: 'A major industrial project in a forested area is challenged by environmentalists. The project promises significant employment but threatens a unique ecosystem.',
      context: 'The government supports the project for economic development. Environmentalists invoke the right to a healthy environment as part of the right to life.',
      articles: ['Article 21', 'Article 48A', 'Article 51A(g)', 'Article 19(1)(g)']
    }
  ]
};

const roleInfo: Record<Role, { icon: typeof Gavel; title: string; description: string; color: string }> = {
  judge: {
    icon: Gavel,
    title: 'Judge',
    description: 'Analyze arguments from both sides and deliver a fair verdict based on constitutional principles',
    color: 'bg-amber-500/10 text-amber-600 border-amber-500/30'
  },
  petitioner: {
    icon: Users,
    title: 'Petitioner',
    description: 'Argue in favor of the aggrieved party, citing constitutional rights that have been violated',
    color: 'bg-blue-500/10 text-blue-600 border-blue-500/30'
  },
  respondent: {
    icon: Scale,
    title: 'Respondent',
    description: 'Defend the opposing party, providing constitutional justifications for their actions',
    color: 'bg-purple-500/10 text-purple-600 border-purple-500/30'
  }
};

export function ConstitutionalCourtroomGame() {
  const [gameState, setGameState] = useState<GameState>('role-select');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<DifficultyLevel>('beginner');
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [userArgument, setUserArgument] = useState('');
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [aiResponse, setAIResponse] = useState<AIResponse | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [scenarios, setScenarios] = useState<Record<DifficultyLevel, Scenario[]>>(defaultScenarios);
  const [isGeneratingScenarios, setIsGeneratingScenarios] = useState(false);
  const { translateObject } = useTranslateResponse();

  const allArticles = [
    'Article 14', 'Article 15', 'Article 16', 'Article 19(1)(a)', 'Article 19(1)(g)',
    'Article 19(2)', 'Article 21', 'Article 21A', 'Article 25', 'Article 26',
    'Article 32', 'Article 48A', 'Article 51A(g)', 'Article 301', 'Article 368'
  ];

  const generateNewScenarios = async (level: DifficultyLevel) => {
    setIsGeneratingScenarios(true);
    try {
      const { data, error } = await supabase.functions.invoke('constitutional-courtroom', {
        body: {
          action: 'generate_scenarios',
          level,
          count: 3
        }
      });

      if (error) throw error;

      if (data?.scenarios && data.scenarios.length > 0) {
        setScenarios(prev => ({
          ...prev,
          [level]: [...prev[level], ...data.scenarios]
        }));
        toast.success(`Generated ${data.scenarios.length} new scenarios!`);
      }
    } catch (error) {
      console.error('Error generating scenarios:', error);
      toast.error('Failed to generate new scenarios');
    } finally {
      setIsGeneratingScenarios(false);
    }
  };

  const startGame = () => {
    if (!selectedRole) return;
    
    const levelScenarios = scenarios[selectedLevel];
    const randomScenario = levelScenarios[Math.floor(Math.random() * levelScenarios.length)];
    setCurrentScenario(randomScenario);
    setUserArgument('');
    setSelectedArticles([]);
    setAIResponse(null);
    setGameState('playing');
  };

  const toggleArticle = (article: string) => {
    setSelectedArticles(prev => 
      prev.includes(article) 
        ? prev.filter(a => a !== article)
        : [...prev, article]
    );
  };

  const submitArgument = async () => {
    if (!currentScenario || !selectedRole || userArgument.trim().length < 50) {
      toast.error('Please write at least 50 characters for your argument');
      return;
    }

    if (selectedArticles.length === 0) {
      toast.error('Please select at least one relevant Article');
      return;
    }

    setIsLoading(true);
    setGameState('submitted');

    try {
      const { data, error } = await supabase.functions.invoke('constitutional-courtroom', {
        body: {
          role: selectedRole,
          level: selectedLevel,
          scenario: currentScenario,
          userArgument,
          selectedArticles
        }
      });

      if (error) throw error;

      const translated = await translateObject(data, ['argument', 'outcome', 'learningTakeaway', 'feedback']);
      setAIResponse(translated);
      setTotalScore(prev => prev + (translated.score || 0));
      setRoundsPlayed(prev => prev + 1);
      setGameState('complete');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to evaluate your argument. Please try again.');
      setGameState('playing');
    } finally {
      setIsLoading(false);
    }
  };

  const playAgain = () => {
    setSelectedArticles([]);
    setUserArgument('');
    setAIResponse(null);
    
    const levelScenarios = scenarios[selectedLevel];
    const randomScenario = levelScenarios[Math.floor(Math.random() * levelScenarios.length)];
    setCurrentScenario(randomScenario);
    setGameState('playing');
  };

  const changeRole = () => {
    setGameState('role-select');
    setSelectedRole(null);
    setAIResponse(null);
    setCurrentScenario(null);
  };

  // Role Selection Screen
  if (gameState === 'role-select') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Gavel className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Constitutional Courtroom</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Step into the courtroom and argue constitutional cases. Choose your role and apply your knowledge of the Indian Constitution.
          </p>
        </div>

        {/* Difficulty Selection */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3 text-center">Select Difficulty</h3>
          <div className="flex justify-center gap-3 mb-4">
            {(['beginner', 'intermediate', 'advanced'] as DifficultyLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`px-6 py-3 rounded-xl font-medium capitalize transition-all ${
                  selectedLevel === level
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
          <div className="flex justify-center items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {scenarios[selectedLevel].length} scenarios available
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => generateNewScenarios(selectedLevel)}
              disabled={isGeneratingScenarios}
              className="gap-2"
            >
              {isGeneratingScenarios ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Generate More with AI
            </Button>
          </div>
        </div>

        {/* Role Selection */}
        <h3 className="text-lg font-semibold mb-4 text-center">Choose Your Role</h3>
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {(Object.entries(roleInfo) as [Role, typeof roleInfo.judge][]).map(([role, info]) => {
            const Icon = info.icon;
            return (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 ${
                  selectedRole === role
                    ? 'border-primary bg-primary/5 shadow-lg'
                    : 'border-border bg-card hover:border-primary/50 hover:shadow-card'
                }`}
              >
                <div className={`w-14 h-14 rounded-xl ${info.color} border flex items-center justify-center mb-4`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-bold mb-2">{info.title}</h4>
                <p className="text-sm text-muted-foreground">{info.description}</p>
              </button>
            );
          })}
        </div>

        {/* Stats */}
        {roundsPlayed > 0 && (
          <div className="bg-muted/50 rounded-xl p-4 mb-6 text-center">
            <p className="text-sm text-muted-foreground">
              Rounds Played: <span className="font-bold text-foreground">{roundsPlayed}</span>
              {' • '}
              Average Score: <span className="font-bold text-primary">{Math.round(totalScore / roundsPlayed)}%</span>
            </p>
          </div>
        )}

        <Button 
          onClick={startGame} 
          disabled={!selectedRole}
          variant="hero"
          className="w-full py-6 text-lg"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Enter the Courtroom
        </Button>
      </div>
    );
  }

  // Loading/Submitted Screen
  if (gameState === 'submitted' || isLoading) {
    return (
      <div className="text-center py-16 max-w-md mx-auto">
        <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-pulse">
          <Scale className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Evaluating Your Argument</h2>
        <p className="text-muted-foreground mb-6">
          The AI is analyzing your constitutional reasoning...
        </p>
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
      </div>
    );
  }

  // Playing Screen
  if (gameState === 'playing' && currentScenario && selectedRole) {
    const roleData = roleInfo[selectedRole];
    const RoleIcon = roleData.icon;

    return (
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={changeRole}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Change Role
          </button>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${roleData.color} border`}>
            <RoleIcon className="w-4 h-4" />
            <span className="font-medium capitalize">{selectedRole}</span>
          </div>
        </div>

        {/* Scenario Card */}
        <div className="bg-gradient-to-br from-card to-muted/30 border border-border rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Scale className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-bold">{currentScenario.title}</h3>
            <span className="ml-auto px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full capitalize">
              {selectedLevel}
            </span>
          </div>
          <p className="text-muted-foreground mb-4 leading-relaxed">{currentScenario.description}</p>
          <div className="bg-background/50 rounded-xl p-4 border border-border/50">
            <p className="text-sm"><span className="font-semibold">Context:</span> {currentScenario.context}</p>
          </div>
        </div>

        {/* Article Selection */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-primary" />
            <h4 className="font-semibold">Select Relevant Articles</h4>
            <span className="text-sm text-muted-foreground">({selectedArticles.length} selected)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {allArticles.map(article => (
              <button
                key={article}
                onClick={() => toggleArticle(article)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedArticles.includes(article)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                }`}
              >
                {article}
              </button>
            ))}
          </div>
        </div>

        {/* Argument Input */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h4 className="font-semibold">Your Argument</h4>
          </div>
          <textarea
            value={userArgument}
            onChange={(e) => setUserArgument(e.target.value)}
            placeholder={`As the ${selectedRole}, present your constitutional argument here. Reference the relevant Articles and explain your reasoning...`}
            className="w-full h-48 p-4 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {userArgument.length} / 50 minimum characters
          </p>
        </div>

        <Button 
          onClick={submitArgument}
          disabled={userArgument.length < 50 || selectedArticles.length === 0}
          variant="hero"
          className="w-full py-6 text-lg"
        >
          <Gavel className="w-5 h-5 mr-2" />
          Submit Argument for Review
        </Button>
      </div>
    );
  }

  // Complete Screen
  if (gameState === 'complete' && aiResponse && selectedRole) {
    const stars = aiResponse.score >= 90 ? 3 : aiResponse.score >= 70 ? 2 : aiResponse.score >= 50 ? 1 : 0;

    return (
      <div className="max-w-4xl mx-auto">
        {/* Score Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-full bg-accent/20 flex items-center justify-center mb-4">
            <Trophy className="w-10 h-10 text-accent" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Case Evaluated!</h2>
          <div className="flex justify-center gap-1 mb-4">
            {[1, 2, 3].map(star => (
              <Star 
                key={star} 
                className={`w-8 h-8 ${star <= stars ? 'fill-accent text-accent' : 'text-muted'}`} 
              />
            ))}
          </div>
          <p className="text-4xl font-bold text-primary">{aiResponse.score}%</p>
          <p className="text-muted-foreground">Legal Reasoning Score</p>
        </div>

        {/* AI Feedback */}
        <div className="space-y-4 mb-8">
          {/* Relevant Articles Analysis */}
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-5">
            <h4 className="font-semibold text-blue-600 mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Relevant Articles Analysis
            </h4>
            <div className="space-y-2">
              {aiResponse.relevantArticles.map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 mt-1 shrink-0" />
                  <p className="text-sm">
                    <span className="font-medium">{item.article}:</span>{' '}
                    <span className="text-muted-foreground">{item.reason}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Model Argument */}
          <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-5">
            <h4 className="font-semibold text-purple-600 mb-3 flex items-center gap-2">
              <Scale className="w-5 h-5" />
              Model Argument ({selectedRole})
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{aiResponse.argument}</p>
          </div>

          {/* Outcome */}
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5">
            <h4 className="font-semibold text-amber-600 mb-3 flex items-center gap-2">
              <Gavel className="w-5 h-5" />
              Constitutional Outcome
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{aiResponse.outcome}</p>
          </div>

          {/* AI Feedback */}
          <div className="bg-accent/5 border border-accent/20 rounded-xl p-5">
            <h4 className="font-semibold text-accent mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              AI Feedback on Your Argument
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{aiResponse.feedback}</p>
          </div>

          {/* Learning Takeaway */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
            <h4 className="font-semibold text-primary mb-2">📚 Learning Takeaway</h4>
            <p className="text-sm text-muted-foreground">{aiResponse.learningTakeaway}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={playAgain} variant="hero" className="flex-1">
            <RotateCcw className="w-4 h-4 mr-2" />
            New Case
          </Button>
          <Button onClick={changeRole} variant="outline" className="flex-1">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Change Role
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
