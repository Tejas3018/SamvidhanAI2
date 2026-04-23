import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useAIQuestions } from '@/hooks/useAIQuestions';
import { Timer, Trophy, RotateCcw, Zap, Sparkles, Loader2 } from 'lucide-react';

const fallbackQuestions = [
  { question: 'Which Article guarantees Right to Equality?', options: ['Article 12', 'Article 14', 'Article 19', 'Article 21'], correctAnswer: 1 },
  { question: 'The Preamble declares India as a?', options: ['Federal Republic', 'Sovereign Socialist Secular Democratic Republic', 'Democratic Republic', 'Parliamentary Republic'], correctAnswer: 1 },
  { question: 'Which Article abolishes untouchability?', options: ['Article 15', 'Article 16', 'Article 17', 'Article 18'], correctAnswer: 2 },
  { question: 'Right to Constitutional Remedies is under?', options: ['Article 30', 'Article 31', 'Article 32', 'Article 33'], correctAnswer: 2 },
  { question: 'Fundamental Duties are mentioned in which Article?', options: ['Article 51', 'Article 51A', 'Article 52', 'Article 53'], correctAnswer: 1 },
  { question: 'Which Article deals with the amendment procedure?', options: ['Article 352', 'Article 356', 'Article 368', 'Article 370'], correctAnswer: 2 },
  { question: 'Right to Education is a Fundamental Right under?', options: ['Article 21', 'Article 21A', 'Article 22', 'Article 23'], correctAnswer: 1 },
  { question: 'Which Article provides for Uniform Civil Code?', options: ['Article 42', 'Article 43', 'Article 44', 'Article 45'], correctAnswer: 2 },
  { question: 'The concept of "Basic Structure" originated from?', options: ['Golaknath Case', 'Kesavananda Bharati Case', 'Minerva Mills Case', 'Maneka Gandhi Case'], correctAnswer: 1 },
  { question: 'Which Part of Constitution deals with Fundamental Rights?', options: ['Part II', 'Part III', 'Part IV', 'Part V'], correctAnswer: 1 },
];

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  articleReference?: string;
}

export function QuizBattleGame() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [useAI, setUseAI] = useState(true);
  
  const { generateQuizQuestions, isLoading: aiLoading } = useAIQuestions();

  const loadQuestions = async () => {
    setIsLoading(true);
    if (useAI) {
      const aiQuestions = await generateQuizQuestions(10);
      if (aiQuestions.length > 0) {
        setQuestions(aiQuestions);
      } else {
        setQuestions(fallbackQuestions);
      }
    } else {
      setQuestions(fallbackQuestions);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const handleNext = useCallback(() => {
    if (currentQuestion + 1 >= questions.length) {
      setIsComplete(true);
    } else {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setTimeLeft(15);
    }
  }, [currentQuestion, questions.length]);

  const handleAnswer = useCallback((index: number) => {
    if (isAnswered || questions.length === 0) return;
    
    setSelectedAnswer(index);
    setIsAnswered(true);
    
    const isCorrect = index === questions[currentQuestion].correctAnswer;
    if (isCorrect) {
      const timeBonus = Math.floor(timeLeft / 3);
      const streakBonus = streak >= 3 ? 2 : streak >= 2 ? 1 : 0;
      setScore(prev => prev + 10 + timeBonus + streakBonus);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }

    setTimeout(() => handleNext(), 1500);
  }, [isAnswered, currentQuestion, timeLeft, streak, handleNext, questions]);

  useEffect(() => {
    if (isComplete || isAnswered || isLoading || questions.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleAnswer(-1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isComplete, isAnswered, handleAnswer, isLoading, questions.length]);

  const restartGame = async () => {
    setCurrentQuestion(0);
    setScore(0);
    setTimeLeft(15);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsComplete(false);
    setStreak(0);
    await loadQuestions();
  };

  const toggleAI = async () => {
    setUseAI(!useAI);
    setIsLoading(true);
    if (!useAI) {
      const aiQuestions = await generateQuizQuestions(10);
      if (aiQuestions.length > 0) {
        setQuestions(aiQuestions);
      } else {
        setQuestions(fallbackQuestions);
      }
    } else {
      setQuestions(fallbackQuestions);
    }
    setCurrentQuestion(0);
    setScore(0);
    setTimeLeft(15);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsComplete(false);
    setStreak(0);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-pulse">
          <Sparkles className="w-10 h-10 text-primary animate-spin" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Generating AI Questions</h2>
        <p className="text-muted-foreground">Creating unique quiz questions about the Indian Constitution...</p>
        <div className="mt-6 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (isComplete) {
    const percentage = Math.round((score / (questions.length * 15)) * 100);
    
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto rounded-full bg-accent/20 flex items-center justify-center mb-6">
          <Trophy className="w-12 h-12 text-accent" />
        </div>
        <h2 className="text-3xl font-bold mb-2">Battle Complete!</h2>
        <p className="text-4xl font-bold text-primary mb-2">{score} points</p>
        <p className="text-muted-foreground mb-6">
          You scored {percentage}% in this quiz battle!
        </p>
        <Button onClick={restartGame} variant="hero">
          <RotateCcw className="w-4 h-4 mr-2" />
          Battle Again
          {useAI && <Sparkles className="w-4 h-4 ml-2" />}
        </Button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No questions available.</p>
        <Button onClick={restartGame} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Score</p>
            <p className="text-2xl font-bold text-primary">{score}</p>
          </div>
          {streak >= 2 && (
            <div className="flex items-center gap-1 px-3 py-1 bg-accent/20 rounded-full">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">{streak}x Streak!</span>
            </div>
          )}
          {useAI && (
            <span className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" />
              AI
            </span>
          )}
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
          timeLeft <= 5 ? 'bg-destructive/20 text-destructive' : 'bg-muted'
        }`}>
          <Timer className="w-5 h-5" />
          <span className="text-xl font-bold">{timeLeft}s</span>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Question {currentQuestion + 1} of {questions.length}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full gradient-hero transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-muted/50 rounded-2xl p-6 mb-6">
        <h2 className="text-xl font-semibold text-center">{question.question}</h2>
      </div>

      {/* Options */}
      <div className="grid gap-3">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(index)}
            disabled={isAnswered}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 ${
              isAnswered
                ? index === question.correctAnswer
                  ? 'bg-accent/20 border-accent text-accent'
                  : selectedAnswer === index
                  ? 'bg-destructive/20 border-destructive text-destructive'
                  : 'bg-muted/50 border-border opacity-50'
                : 'bg-card border-border hover:border-primary/50 hover:shadow-card'
            }`}
          >
            <span className="font-medium">{option}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
