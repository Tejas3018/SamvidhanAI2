import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AlertTriangle, Scale, Newspaper, Vote, Trophy, RotateCcw, BookOpen, History, Shield } from 'lucide-react';
import { useTranslateResponse } from '@/hooks/useTranslateResponse';

type GamePhase = 'intro' | 'round1' | 'round2' | 'round3' | 'outcome' | 'learning';

interface Choice {
  round: string;
  choice: string;
  consequence: string;
  healthImpact: number;
}

interface FinalAnalysis {
  playerOutcome: string;
  historicalReality: string;
  keyLessons: string[];
  verdictTitle: string;
  democracySurvived: boolean;
}

const rounds = {
  round1: {
    title: 'Courts & Judiciary',
    icon: Scale,
    situation: 'Courts are receiving petitions challenging the Emergency. Judges want to review detentions and rights suspension. The principle of judicial review hangs in balance.',
    infoPanel: {
      article: 'Article 359 invoked',
      detail: 'Habeas Corpus suspended'
    },
    choices: [
      { id: 'allow', text: 'Allow courts to hear habeas corpus cases', description: 'Let judiciary function independently' },
      { id: 'restrict', text: 'Restrict courts from reviewing Emergency actions', description: 'Limit judicial oversight' },
      { id: 'transfer', text: 'Transfer judges who oppose the government', description: 'Remove dissenting voices' }
    ]
  },
  round2: {
    title: 'Press & Media',
    icon: Newspaper,
    situation: 'Newspapers are publishing criticism of the Emergency. Protests are rising. The voice of the people depends on your decision.',
    infoPanel: {
      article: 'Article 19 at stake',
      detail: 'Freedom of Speech & Expression'
    },
    choices: [
      { id: 'free', text: 'Allow free reporting', description: 'Protect press freedom' },
      { id: 'censor', text: 'Introduce press censorship', description: 'Control the narrative' },
      { id: 'shutdown', text: 'Shut down critical newspapers', description: 'Silence opposition completely' }
    ]
  },
  round3: {
    title: 'Elections',
    icon: Vote,
    situation: 'The Emergency is about to end. Public demand for elections is rising. The future of Indian democracy rests on this decision.',
    infoPanel: {
      article: 'Article 324',
      detail: 'Election Commission powers'
    },
    choices: [
      { id: 'free', text: 'Conduct free and fair elections', description: 'Restore democratic process' },
      { id: 'postpone', text: 'Postpone elections indefinitely', description: 'Extend Emergency rule' },
      { id: 'controlled', text: 'Hold controlled elections', description: 'Elections with restrictions' }
    ]
  }
};

export function Emergency1975Game() {
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [democracyHealth, setDemocracyHealth] = useState(70);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentConsequence, setCurrentConsequence] = useState<string | null>(null);
  const [historicalNote, setHistoricalNote] = useState<string | null>(null);
  const [finalAnalysis, setFinalAnalysis] = useState<FinalAnalysis | null>(null);
  const { translateText, translateObject } = useTranslateResponse();

  const getHealthColor = () => {
    if (democracyHealth >= 80) return 'text-green-500';
    if (democracyHealth >= 40) return 'text-amber-500';
    return 'text-red-500';
  };

  const getHealthBgColor = () => {
    if (democracyHealth >= 80) return 'bg-green-500';
    if (democracyHealth >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const handleChoice = async (roundKey: string, choiceText: string) => {
    setIsLoading(true);
    setCurrentConsequence(null);
    setHistoricalNote(null);

    try {
      const { data, error } = await supabase.functions.invoke('emergency-1975', {
        body: {
          action: 'evaluate_choice',
          round: roundKey.replace('round', '') === '1' ? 'judiciary' : roundKey.replace('round', '') === '2' ? 'press' : 'elections',
          choice: choiceText,
          democracyHealth
        }
      });

      if (error) throw error;

      const newHealth = Math.max(0, Math.min(100, democracyHealth + data.healthImpact));
      setDemocracyHealth(newHealth);
      const translatedConsequence = await translateText(data.consequence);
      const translatedNote = data.historicalNote ? await translateText(data.historicalNote) : null;
      setCurrentConsequence(translatedConsequence);
      setHistoricalNote(translatedNote);

      const newChoice: Choice = {
        round: roundKey,
        choice: choiceText,
        consequence: data.consequence,
        healthImpact: data.healthImpact
      };
      setChoices(prev => [...prev, newChoice]);

      // Wait for user to read consequence, then auto-advance
      setTimeout(() => {
        if (roundKey === 'round1') setPhase('round2');
        else if (roundKey === 'round2') setPhase('round3');
        else if (roundKey === 'round3') getFinalAnalysis([...choices, newChoice], newHealth);
      }, 4000);

    } catch (error) {
      console.error('Error evaluating choice:', error);
      toast.error('Failed to process choice');
    } finally {
      setIsLoading(false);
    }
  };

  const getFinalAnalysis = async (allChoices: Choice[], finalHealth: number) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('emergency-1975', {
        body: {
          action: 'final_analysis',
          allChoices: allChoices.map(c => ({ round: c.round, choice: c.choice })),
          democracyHealth: finalHealth
        }
      });

      if (error) throw error;

      const translated = await translateObject(data, ['playerOutcome', 'historicalReality', 'verdictTitle']);
      setFinalAnalysis(translated);
      setPhase('outcome');
    } catch (error) {
      console.error('Error getting final analysis:', error);
      toast.error('Failed to get final analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const resetGame = () => {
    setPhase('intro');
    setDemocracyHealth(70);
    setChoices([]);
    setCurrentConsequence(null);
    setHistoricalNote(null);
    setFinalAnalysis(null);
  };

  // Intro Screen
  if (phase === 'intro') {
    return (
      <div className="min-h-[600px] bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 rounded-2xl p-8 relative overflow-hidden">
        {/* Dramatic background effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-900 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-amber-900 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        {/* Scanlines effect */}
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.3)_2px,rgba(0,0,0,0.3)_4px)] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center justify-center min-h-[550px] text-center">
          <div className="animate-pulse mb-6">
            <AlertTriangle className="w-20 h-20 text-red-500" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight">
            🚨 Emergency Mode: <span className="text-red-500">1975</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-zinc-400 mb-8 italic">
            "Democracy is under threat. Every decision matters."
          </p>

          <div className="max-w-2xl mx-auto bg-zinc-900/80 border border-zinc-700 rounded-xl p-6 mb-8 backdrop-blur">
            <p className="text-zinc-300 leading-relaxed">
              It is <span className="text-red-400 font-bold">June 1975</span>. A national Emergency has been declared under <span className="text-amber-400 font-semibold">Article 352</span>.
            </p>
            <p className="text-zinc-300 leading-relaxed mt-3">
              <span className="text-red-400">Fundamental Rights are suspended.</span>
            </p>
            <p className="text-zinc-300 leading-relaxed mt-3">
              You are now part of the decision-making system.
            </p>
            <p className="text-white font-bold mt-4 text-lg">
              Your choices will shape India's democracy.
            </p>
          </div>

          <Button 
            onClick={() => setPhase('round1')}
            className="bg-red-600 hover:bg-red-700 text-white text-xl px-10 py-6 rounded-xl shadow-lg shadow-red-900/50 transition-all hover:scale-105"
          >
            ▶ Enter Emergency Mode
          </Button>
        </div>
      </div>
    );
  }

  // Round Screen
  if (phase === 'round1' || phase === 'round2' || phase === 'round3') {
    const roundKey = phase;
    const round = rounds[roundKey];
    const RoundIcon = round.icon;

    return (
      <div className="min-h-[600px] bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 rounded-2xl p-6 md:p-8 relative overflow-hidden">
        {/* Democracy Health Meter */}
        <div className="sticky top-0 z-20 bg-zinc-900/90 backdrop-blur rounded-xl p-4 mb-6 border border-zinc-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Shield className={`w-5 h-5 ${getHealthColor()}`} />
              <span className="text-zinc-300 font-medium">Democracy Health</span>
            </div>
            <span className={`text-2xl font-bold ${getHealthColor()}`}>{democracyHealth}%</span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${getHealthBgColor()}`}
              style={{ width: `${democracyHealth}%` }}
            />
          </div>
        </div>

        {/* Round Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-zinc-800/50 px-6 py-3 rounded-full mb-4">
            <RoundIcon className="w-6 h-6 text-amber-500" />
            <span className="text-amber-500 font-bold text-lg">{round.title}</span>
          </div>
        </div>

        {/* Situation */}
        <Card className="bg-zinc-900/80 border-zinc-700 mb-6">
          <CardContent className="p-6">
            <h3 className="text-white font-bold text-lg mb-3">📍 Situation</h3>
            <p className="text-zinc-300 leading-relaxed text-lg">{round.situation}</p>
          </CardContent>
        </Card>

        {/* Info Panel */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Badge variant="outline" className="bg-zinc-800 border-amber-600 text-amber-400 px-4 py-2">
            📜 {round.infoPanel.article}
          </Badge>
          <Badge variant="outline" className="bg-zinc-800 border-zinc-600 text-zinc-300 px-4 py-2">
            ⚖️ {round.infoPanel.detail}
          </Badge>
        </div>

        {/* Choices */}
        {!currentConsequence && (
          <div className="space-y-4">
            <h3 className="text-white font-bold text-lg mb-4">What will you do?</h3>
            {round.choices.map((choice, index) => (
              <button
                key={choice.id}
                onClick={() => handleChoice(roundKey, choice.text)}
                disabled={isLoading}
                className="w-full text-left p-5 bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700 hover:border-amber-600/50 rounded-xl transition-all duration-300 group disabled:opacity-50"
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl font-bold text-zinc-500 group-hover:text-amber-500 transition-colors">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <div>
                    <p className="text-white font-medium text-lg">{choice.text}</p>
                    <p className="text-zinc-400 text-sm mt-1">{choice.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Consequence Display */}
        {currentConsequence && (
          <div className="animate-fade-in">
            <Card className="bg-red-950/30 border-red-800 mb-4">
              <CardContent className="p-6">
                <h3 className="text-red-400 font-bold text-lg mb-3">⚡ Consequence</h3>
                <p className="text-zinc-200 leading-relaxed text-lg">{currentConsequence}</p>
              </CardContent>
            </Card>
            
            {historicalNote && (
              <Card className="bg-amber-950/30 border-amber-800">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <History className="w-5 h-5 text-amber-500 mt-1 flex-shrink-0" />
                    <p className="text-amber-200 text-sm">{historicalNote}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <p className="text-center text-zinc-500 mt-6 animate-pulse">
              Proceeding to next decision...
            </p>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent" />
          </div>
        )}
      </div>
    );
  }

  // Outcome Screen
  if (phase === 'outcome' && finalAnalysis) {
    return (
      <div className="min-h-[600px] bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 rounded-2xl p-6 md:p-8 relative overflow-hidden">
        {/* Final Democracy Score */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-2">
            {finalAnalysis.verdictTitle}
          </h2>
          <div className={`text-6xl font-black ${getHealthColor()} mb-2`}>
            {democracyHealth}%
          </div>
          <p className="text-zinc-400">Final Democracy Health</p>
          
          {democracyHealth >= 70 && (
            <div className="mt-4 inline-flex items-center gap-2 bg-green-900/30 border border-green-600 px-6 py-3 rounded-full">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <span className="text-green-400 font-bold">🏅 Defender of Democracy</span>
            </div>
          )}
        </div>

        {/* Split Screen Comparison */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-zinc-900/80 border-zinc-700">
            <CardContent className="p-6">
              <h3 className="text-amber-400 font-bold text-lg mb-4 flex items-center gap-2">
                <span>📊</span> Your Choices
              </h3>
              <p className="text-zinc-300 leading-relaxed">{finalAnalysis.playerOutcome}</p>
              
              <div className="mt-4 space-y-2">
                {choices.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className={c.healthImpact >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {c.healthImpact >= 0 ? '✓' : '✗'}
                    </span>
                    <span className="text-zinc-400">{c.choice}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-950/30 border-amber-800">
            <CardContent className="p-6">
              <h3 className="text-amber-400 font-bold text-lg mb-4 flex items-center gap-2">
                <History className="w-5 h-5" />
                What Actually Happened (1977)
              </h3>
              <p className="text-zinc-300 leading-relaxed">{finalAnalysis.historicalReality}</p>
              
              <div className="mt-4 p-4 bg-zinc-900/50 rounded-lg">
                <p className="text-green-400 font-medium text-center">
                  "Democracy survived because elections were restored."
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => setPhase('learning')}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            What You Learned
          </Button>
          <Button 
            onClick={resetGame}
            variant="outline"
            className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Replay with Different Choices
          </Button>
        </div>
      </div>
    );
  }

  // Learning Screen
  if (phase === 'learning' && finalAnalysis) {
    return (
      <div className="min-h-[600px] bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 rounded-2xl p-6 md:p-8">
        <div className="text-center mb-8">
          <BookOpen className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-2">📚 What You Learned</h2>
          <p className="text-zinc-400">Key lessons from the 1975 Emergency</p>
        </div>

        <div className="max-w-2xl mx-auto space-y-4 mb-8">
          {finalAnalysis.keyLessons.map((lesson, index) => (
            <Card key={index} className="bg-zinc-900/80 border-zinc-700">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                  <p className="text-zinc-200 leading-relaxed">{lesson}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6 max-w-2xl mx-auto mb-8">
          <h3 className="text-white font-bold mb-4">Core Constitutional Lessons:</h3>
          <ul className="space-y-3 text-zinc-300">
            <li className="flex items-start gap-3">
              <Scale className="w-5 h-5 text-amber-500 mt-1 flex-shrink-0" />
              <span><strong>Judicial Review</strong> is essential for checking executive power</span>
            </li>
            <li className="flex items-start gap-3">
              <Newspaper className="w-5 h-5 text-amber-500 mt-1 flex-shrink-0" />
              <span><strong>Free Press</strong> is the watchdog of democracy</span>
            </li>
            <li className="flex items-start gap-3">
              <Vote className="w-5 h-5 text-amber-500 mt-1 flex-shrink-0" />
              <span><strong>Elections</strong> are the ultimate check on power</span>
            </li>
            <li className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-amber-500 mt-1 flex-shrink-0" />
              <span><strong>Article 352</strong> requires safeguards against misuse</span>
            </li>
          </ul>
        </div>

        <div className="flex justify-center">
          <Button 
            onClick={resetGame}
            className="bg-amber-600 hover:bg-amber-700 text-white px-8"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Replay with Different Choices
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
