import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { scenarioLevels } from '@/data/games';
import { useAIQuestions } from '@/hooks/useAIQuestions';
import { Trophy, RotateCcw, ChevronRight, CheckCircle2, XCircle, Scale, Lock, Star, ArrowLeft, Sparkles, Loader2 } from 'lucide-react';

type GameState = 'level-select' | 'loading' | 'playing' | 'complete';

interface AIScenario {
  scenario: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  relatedArticle: string;
}

export function ScenarioChallengeGame() {
  const [gameState, setGameState] = useState<GameState>('level-select');
  const [selectedLevel, setSelectedLevel] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [useAI, setUseAI] = useState(true);
  const [aiScenarios, setAIScenarios] = useState<AIScenario[]>([]);
  
  const { generateScenarios, isLoading } = useAIQuestions();

  const currentLevelData = scenarioLevels[selectedLevel];
  const scenarios = useAI && aiScenarios.length > 0 ? aiScenarios : currentLevelData?.scenarios;
  const currentScenario = scenarios?.[currentIndex];

  const levelNames: Record<number, string> = {
    0: 'beginner',
    1: 'intermediate', 
    2: 'advanced',
    3: 'expert'
  };

  const handleLevelSelect = async (levelIndex: number) => {
    if (levelIndex === 0 || completedLevels.includes(levelIndex - 1)) {
      setSelectedLevel(levelIndex);
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setScore(0);
      setAIScenarios([]);
      
      if (useAI) {
        setGameState('loading');
        const questions = await generateScenarios(levelNames[levelIndex] || 'beginner', 5);
        if (questions.length > 0) {
          setAIScenarios(questions);
        }
      }
      
      setGameState('playing');
    }
  };

  const handleAnswer = (index: number) => {
    if (isAnswered) return;
    
    setSelectedAnswer(index);
    setIsAnswered(true);
    
    if (index === currentScenario?.correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    const totalScenarios = scenarios?.length || 0;
    if (currentIndex + 1 >= totalScenarios) {
      const passed = score >= Math.ceil(totalScenarios * 0.6);
      if (passed && !completedLevels.includes(selectedLevel)) {
        setCompletedLevels(prev => [...prev, selectedLevel]);
      }
      setGameState('complete');
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    }
  };

  const handleRetry = async () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    
    if (useAI) {
      setGameState('loading');
      const questions = await generateScenarios(levelNames[selectedLevel] || 'beginner', 5);
      if (questions.length > 0) {
        setAIScenarios(questions);
      }
    }
    
    setGameState('playing');
  };

  const handleBackToLevels = () => {
    setGameState('level-select');
    setAIScenarios([]);
  };

  // Loading Screen
  if (gameState === 'loading') {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-pulse">
          <Sparkles className="w-10 h-10 text-primary animate-spin" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Generating AI Questions</h2>
        <p className="text-muted-foreground">Creating unique scenarios based on the Indian Constitution...</p>
        <div className="mt-6 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Level Selection Screen
  if (gameState === 'level-select') {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Scale className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Scenario Challenge</h2>
          <p className="text-muted-foreground">Apply constitutional knowledge to real-life situations</p>
          
          {/* AI Toggle */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={() => setUseAI(!useAI)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                useAI 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              AI-Generated Questions
            </button>
          </div>
          {useAI && (
            <p className="text-xs text-muted-foreground mt-2">
              Questions are uniquely generated each time using AI
            </p>
          )}
        </div>

        <div className="grid gap-4">
          {scenarioLevels.map((level, index) => {
            const isUnlocked = index === 0 || completedLevels.includes(index - 1);
            const isCompleted = completedLevels.includes(index);
            
            return (
              <button
                key={level.level}
                onClick={() => handleLevelSelect(index)}
                disabled={!isUnlocked}
                className={`w-full p-6 rounded-2xl border-2 text-left transition-all duration-300 ${
                  isUnlocked
                    ? isCompleted
                      ? 'bg-accent/10 border-accent hover:shadow-card'
                      : 'bg-card border-border hover:border-primary/50 hover:shadow-card'
                    : 'bg-muted/50 border-border opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isCompleted ? 'bg-accent/20' : isUnlocked ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                      {!isUnlocked ? (
                        <Lock className="w-5 h-5 text-muted-foreground" />
                      ) : isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-accent" />
                      ) : (
                        <span className="text-xl font-bold text-primary">{level.level}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{level.name}</h3>
                      <p className="text-sm text-muted-foreground">{level.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {useAI ? '5 AI-generated scenarios' : `${level.scenarios.length} scenarios`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isCompleted && (
                      <div className="flex gap-0.5">
                        {[1, 2, 3].map(star => (
                          <Star key={star} className="w-4 h-4 fill-accent text-accent" />
                        ))}
                      </div>
                    )}
                    {isUnlocked && <ChevronRight className="w-5 h-5 text-muted-foreground" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Level Complete Screen
  if (gameState === 'complete') {
    const totalScenarios = scenarios?.length || 0;
    const percentage = Math.round((score / totalScenarios) * 100);
    const passed = percentage >= 60;
    const stars = percentage >= 90 ? 3 : percentage >= 75 ? 2 : percentage >= 60 ? 1 : 0;
    const nextLevelAvailable = passed && selectedLevel + 1 < scenarioLevels.length;

    return (
      <div className="text-center py-12 max-w-md mx-auto">
        <div className="w-24 h-24 mx-auto rounded-full bg-accent/20 flex items-center justify-center mb-6">
          <Trophy className="w-12 h-12 text-accent" />
        </div>
        <h2 className="text-3xl font-bold mb-2">
          {passed ? 'Level Complete!' : 'Keep Practicing!'}
        </h2>
        <p className="text-lg text-muted-foreground mb-2">{currentLevelData.name}</p>
        <p className="text-4xl font-bold text-primary mb-2">{score}/{totalScenarios}</p>
        <p className="text-muted-foreground mb-4">
          {percentage}% correct
        </p>
        
        {passed && (
          <div className="flex justify-center gap-1 mb-6">
            {[1, 2, 3].map(star => (
              <Star 
                key={star} 
                className={`w-8 h-8 ${star <= stars ? 'fill-accent text-accent' : 'text-muted'}`} 
              />
            ))}
          </div>
        )}
        
        {!passed && (
          <p className="text-sm text-muted-foreground mb-6">
            Score at least 60% to unlock the next level
          </p>
        )}

        <div className="flex flex-col gap-3">
          <Button onClick={handleRetry} variant={passed ? 'outline' : 'hero'}>
            <RotateCcw className="w-4 h-4 mr-2" />
            {passed ? 'Retry Level' : 'Try Again'}
            {useAI && <Sparkles className="w-4 h-4 ml-2" />}
          </Button>
          
          {nextLevelAvailable && (
            <Button 
              onClick={() => handleLevelSelect(selectedLevel + 1)} 
              variant="hero"
            >
              Next Level
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
          
          <Button variant="ghost" onClick={handleBackToLevels}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            All Levels
          </Button>
        </div>
      </div>
    );
  }

  // Playing Screen
  if (!currentScenario) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No scenarios available. Please try again.</p>
        <Button onClick={handleBackToLevels} className="mt-4">
          Back to Levels
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleBackToLevels}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">Level {currentLevelData.level}</p>
              {useAI && aiScenarios.length > 0 && (
                <span className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3" />
                  AI
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold">{currentLevelData.name}</h2>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Score</p>
          <p className="text-2xl font-bold text-primary">{score}/{scenarios?.length || 0}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Scenario {currentIndex + 1} of {scenarios?.length || 0}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full gradient-hero transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / (scenarios?.length || 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Scenario */}
      <div className="bg-muted/50 rounded-2xl p-6 mb-6">
        <p className="text-lg leading-relaxed">{currentScenario.scenario}</p>
      </div>

      {/* Options */}
      <div className="grid gap-3 mb-6">
        {currentScenario.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(index)}
            disabled={isAnswered}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 ${
              isAnswered
                ? index === currentScenario.correctAnswer
                  ? 'bg-accent/20 border-accent'
                  : selectedAnswer === index
                  ? 'bg-destructive/20 border-destructive'
                  : 'bg-muted/50 border-border opacity-50'
                : 'bg-card border-border hover:border-primary/50 hover:shadow-card'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{option}</span>
              {isAnswered && index === currentScenario.correctAnswer && (
                <CheckCircle2 className="w-5 h-5 text-accent" />
              )}
              {isAnswered && selectedAnswer === index && index !== currentScenario.correctAnswer && (
                <XCircle className="w-5 h-5 text-destructive" />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Explanation */}
      {isAnswered && (
        <div className="space-y-4">
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <p className="font-semibold text-primary mb-1">Explanation</p>
            <p className="text-muted-foreground">{currentScenario.explanation}</p>
            <p className="text-sm text-primary mt-2">Related: {currentScenario.relatedArticle}</p>
          </div>
          <Button onClick={handleNext} variant="hero" className="w-full">
            {currentIndex + 1 >= (scenarios?.length || 0) ? 'See Results' : 'Next Scenario'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
