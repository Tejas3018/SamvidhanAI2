import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { MicroCheckQuestion } from '@/types/learning';
import { useVideoProgress } from '@/hooks/useVideoProgress';
import { useProgress } from '@/hooks/useProgress';

interface VideoMicroCheckProps {
  videoId: string;
  videoTitle: string;
  levelId: number;
  topic: string;
  onComplete?: (correct: boolean, xpEarned: number) => void;
}

export function VideoMicroCheck({ videoId, videoTitle, levelId, topic, onComplete }: VideoMicroCheckProps) {
  const [question, setQuestion] = useState<MicroCheckQuestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { markVideoUnderstood, getVideoStatus } = useVideoProgress();
  const { addXP } = useProgress();
  
  const videoStatus = getVideoStatus(videoId);
  const alreadyAnswered = videoStatus?.understood;

  const generateQuestion = useCallback(async () => {
    if (alreadyAnswered) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-questions', {
        body: {
          type: 'micro-check',
          topic,
          levelId,
          count: 1,
        },
      });

      if (fnError) throw fnError;
      
      if (data.questions && data.questions.length > 0) {
        setQuestion(data.questions[0]);
      } else {
        setError('Could not generate question');
      }
    } catch (err) {
      console.error('Error generating micro-check:', err);
      setError('Failed to load question');
    } finally {
      setIsLoading(false);
    }
  }, [topic, levelId, alreadyAnswered]);

  const handleAnswer = (index: number) => {
    if (isAnswered || !question) return;
    
    setSelectedAnswer(index);
    setIsAnswered(true);
    
    const isCorrect = index === question.correctAnswer;
    const xpEarned = isCorrect ? 5 : 0;
    
    if (isCorrect) {
      markVideoUnderstood(videoId, levelId, index);
      addXP(xpEarned);
    }
    
    onComplete?.(isCorrect, xpEarned);
  };

  if (alreadyAnswered) {
    return (
      <div className="p-3 rounded-lg bg-accent/10 border border-accent/30 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-accent" />
        <span className="text-sm text-accent">Video understood ✓</span>
      </div>
    );
  }

  if (!question && !isLoading) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={generateQuestion}
        className="w-full gap-2"
      >
        <Zap className="w-4 h-4" />
        Quick Knowledge Check (+5 XP)
      </Button>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 rounded-lg bg-muted/50 flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Generating question...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 rounded-lg bg-destructive/10 text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (!question) return null;

  const isCorrect = selectedAnswer === question.correctAnswer;

  return (
    <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-4 animate-fade-in">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Zap className="w-4 h-4 text-primary" />
        Quick Check
        {!isAnswered && <span className="text-muted-foreground">(+5 XP if correct)</span>}
      </div>
      
      <p className="text-sm font-medium">{question.question}</p>
      
      <div className="space-y-2">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrectAnswer = index === question.correctAnswer;
          const showResult = isAnswered;

          let optionClass = 'border-border hover:border-primary/50';
          if (showResult) {
            if (isCorrectAnswer) {
              optionClass = 'border-accent bg-accent/10';
            } else if (isSelected && !isCorrectAnswer) {
              optionClass = 'border-destructive bg-destructive/10';
            } else {
              optionClass = 'border-border opacity-60';
            }
          }

          return (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={isAnswered}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all text-sm ${optionClass} ${
                isAnswered ? 'cursor-default' : 'cursor-pointer hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-2">
                {showResult && isCorrectAnswer && (
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                )}
                {showResult && isSelected && !isCorrectAnswer && (
                  <XCircle className="w-4 h-4 text-destructive shrink-0" />
                )}
                <span>{option}</span>
              </div>
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <div className={`p-3 rounded-lg text-sm animate-fade-in ${
          isCorrect ? 'bg-accent/10 border border-accent/30' : 'bg-muted'
        }`}>
          <p className="font-medium mb-1">
            {isCorrect ? '✓ Correct! +5 XP' : '✗ Not quite right'}
          </p>
          <p className="text-muted-foreground">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}
