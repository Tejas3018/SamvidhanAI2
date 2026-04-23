import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useWeakTopics } from '@/hooks/useWeakTopics';
import { useQuizMistakes } from '@/hooks/useQuizMistakes';
import { useSkillMastery } from '@/hooks/useSkillMastery';
import { useAdaptiveDifficulty } from '@/hooks/useAdaptiveDifficulty';
import { useLearningStreak } from '@/hooks/useLearningStreak';
import { useProgress } from '@/hooks/useProgress';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Zap, CheckCircle2, XCircle, Trophy, RotateCcw, ArrowRight, Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface WeakAreasPracticeQuizProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PracticeQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  articleReference?: string;
}

export function WeakAreasPracticeQuiz({ open, onOpenChange }: WeakAreasPracticeQuizProps) {
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { getTopWeakTopics, recordAnswer } = useWeakTopics();
  const { recordMistake } = useQuizMistakes();
  const { recordSkillAttempt } = useSkillMastery();
  const { getCurrentDifficulty } = useAdaptiveDifficulty();
  const { recordActivity } = useLearningStreak();
  const { addXP } = useProgress();

  const weakTopics = getTopWeakTopics(5);

  useEffect(() => {
    if (open && questions.length === 0) {
      generateQuestions();
    }
  }, [open]);

  const generateQuestions = async () => {
    if (weakTopics.length === 0) {
      setError('No weak topics found. Keep practicing quizzes to identify areas for improvement!');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Combine weak topic names into a focused topic string
      const topicString = weakTopics.map(t => t.topic).join(', ');
      const count = Math.min(weakTopics.length * 2, 8); // 2 questions per weak topic, max 8

      const { data, error: fnError } = await supabase.functions.invoke('generate-questions', {
        body: {
          type: 'weak-areas',
          topic: topicString,
          count,
          difficulty: getCurrentDifficulty(),
          levelId: weakTopics[0]?.levelId || 1,
        },
      });

      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);

      const generated = data.questions.map((q: any, i: number) => ({
        ...q,
        id: `weak-practice-${Date.now()}-${i}`,
      }));

      setQuestions(generated);
    } catch (err) {
      console.error('Failed to generate practice questions:', err);
      setError('Failed to generate questions. Please try again.');
      toast.error('Failed to generate practice questions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAnswer = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
    setIsAnswered(true);

    const currentQ = questions[currentIndex];
    const isCorrect = index === currentQ.correctAnswer;

    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    }

    // Track answer for weak topics
    const topic = currentQ.articleReference || currentQ.question.slice(0, 50);
    const levelId = weakTopics[0]?.levelId || 1;
    recordAnswer(topic, levelId, isCorrect, currentQ.articleReference);

    // Track for skill mastery
    const questionType = currentQ.articleReference?.includes('Amendment') ? 'amendments' :
                        currentQ.articleReference?.includes('Article') ? 'articles' : 'reasoning';
    recordSkillAttempt(questionType as any, isCorrect);

    // Record mistake if wrong
    if (!isCorrect) {
      recordMistake({
        questionId: `weak-${Date.now()}-${currentIndex}`,
        question: currentQ.question,
        selectedAnswer: index,
        correctAnswer: currentQ.correctAnswer,
        selectedOption: currentQ.options[index],
        correctOption: currentQ.options[currentQ.correctAnswer],
        explanation: currentQ.explanation,
        articleReference: currentQ.articleReference,
        levelId,
      });
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      // Quiz complete
      setIsComplete(true);
      recordActivity();
      const bonusXP = Math.round((correctCount / questions.length) * 30);
      if (bonusXP > 0) {
        addXP(bonusXP);
        toast.success(`+${bonusXP} XP earned from practice!`);
      }
    }
  };

  const handleRetry = () => {
    setQuestions([]);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setCorrectCount(0);
    setIsComplete(false);
    setError(null);
    generateQuestions();
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after close animation
    setTimeout(() => {
      setQuestions([]);
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setCorrectCount(0);
      setIsComplete(false);
      setError(null);
    }, 300);
  };

  const currentQuestion = questions[currentIndex];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Target className="w-5 h-5 text-orange-500" />
            </div>
            Practice Weak Areas
          </DialogTitle>
        </DialogHeader>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">Generating practice questions from your weak areas...</p>
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {weakTopics.map((t, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded-full bg-orange-500/10 text-orange-500">
                  {t.topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <XCircle className="w-10 h-10 text-destructive" />
            <p className="text-muted-foreground text-sm text-center">{error}</p>
            <Button onClick={handleRetry} variant="outline" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Try Again
            </Button>
          </div>
        )}

        {/* Complete */}
        {isComplete && (
          <div className="flex flex-col items-center justify-center py-10 gap-4">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
              correctCount >= questions.length * 0.8 ? 'bg-accent/20' : correctCount >= questions.length * 0.5 ? 'bg-primary/20' : 'bg-orange-500/20'
            }`}>
              {correctCount >= questions.length * 0.8 ? (
                <Trophy className="w-10 h-10 text-accent" />
              ) : (
                <Target className="w-10 h-10 text-orange-500" />
              )}
            </div>
            <h3 className="text-2xl font-bold">
              {correctCount >= questions.length * 0.8 ? 'Excellent!' : correctCount >= questions.length * 0.5 ? 'Good Progress!' : 'Keep Practicing!'}
            </h3>
            <p className="text-muted-foreground">
              You got {correctCount} out of {questions.length} correct ({Math.round((correctCount / questions.length) * 100)}%)
            </p>
            <p className="text-sm text-muted-foreground">
              {correctCount >= questions.length * 0.8
                ? 'Your weak areas are getting stronger! 💪'
                : 'Keep practicing to master these topics. Each attempt makes you better!'}
            </p>
            <div className="flex gap-3 mt-2">
              <Button variant="outline" onClick={handleRetry} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Practice Again
              </Button>
              <Button onClick={handleClose} className="gap-2">
                Done
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Active Quiz */}
        {!isLoading && !error && !isComplete && currentQuestion && (
          <div className="space-y-5">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-accent">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {correctCount}
                  </span>
                  <span className="flex items-center gap-1 text-destructive">
                    <XCircle className="w-3.5 h-3.5" />
                    {currentIndex - correctCount - (isAnswered ? 0 : 0)}
                  </span>
                </div>
              </div>
              <Progress value={((currentIndex + (isAnswered ? 1 : 0)) / questions.length) * 100} className="h-2" />
            </div>

            {/* Question */}
            <div className="bg-muted/30 rounded-xl p-5 border border-border">
              <h3 className="text-lg font-semibold leading-relaxed">{currentQuestion.question}</h3>
              {currentQuestion.articleReference && (
                <p className="text-xs text-muted-foreground mt-2">📖 {currentQuestion.articleReference}</p>
              )}
            </div>

            {/* Options */}
            <div className="space-y-2.5">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrectOption = index === currentQuestion.correctAnswer;
                const showResult = isAnswered;

                let optionClass = 'border-border hover:border-primary/50 hover:bg-muted/50';
                if (showResult) {
                  if (isCorrectOption) {
                    optionClass = 'border-accent bg-accent/10';
                  } else if (isSelected && !isCorrectOption) {
                    optionClass = 'border-destructive bg-destructive/10';
                  } else {
                    optionClass = 'border-border opacity-50';
                  }
                } else if (isSelected) {
                  optionClass = 'border-primary bg-primary/10';
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleSelectAnswer(index)}
                    disabled={isAnswered}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${optionClass} ${
                      isAnswered ? 'cursor-default' : 'cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold shrink-0 ${
                        showResult && isCorrectOption
                          ? 'border-accent bg-accent text-accent-foreground'
                          : showResult && isSelected && !isCorrectOption
                          ? 'border-destructive bg-destructive text-destructive-foreground'
                          : 'border-muted-foreground/30'
                      }`}>
                        {showResult && isCorrectOption ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : showResult && isSelected && !isCorrectOption ? (
                          <XCircle className="w-4 h-4" />
                        ) : (
                          String.fromCharCode(65 + index)
                        )}
                      </div>
                      <span className="flex-1 text-sm">{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {isAnswered && (
              <div className={`p-4 rounded-xl animate-fade-in ${
                selectedAnswer === currentQuestion.correctAnswer
                  ? 'bg-accent/10 border border-accent/30'
                  : 'bg-destructive/5 border border-destructive/20'
              }`}>
                <p className="text-sm">
                  <strong>
                    {selectedAnswer === currentQuestion.correctAnswer ? '✓ Correct!' : '✗ Incorrect.'}
                  </strong>{' '}
                  {currentQuestion.explanation}
                </p>
              </div>
            )}

            {/* Next button */}
            {isAnswered && (
              <Button onClick={handleNext} className="w-full gap-2">
                {currentIndex < questions.length - 1 ? (
                  <>
                    Next Question
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    See Results
                    <Trophy className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}