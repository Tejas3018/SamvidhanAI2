import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Send, CheckCircle2, Star, AlertCircle, Lightbulb } from 'lucide-react';

interface ExplainQuestionProps {
  topic: string;
  articleReference?: string;
  onComplete?: (score: number, xpEarned: number) => void;
}

interface AIFeedback {
  score: number;
  overall: string;
  strengths: string[];
  improvements: string[];
  correctExplanation: string;
}

export function ExplainQuestion({ topic, articleReference, onComplete }: ExplainQuestionProps) {
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<AIFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!userAnswer.trim() || userAnswer.length < 20) {
      setError('Please write at least 20 characters');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('explain-topic', {
        body: {
          type: 'evaluate-explanation',
          topic,
          articleReference,
          userAnswer: userAnswer.trim(),
        },
      });

      if (fnError) throw fnError;

      const feedbackData: AIFeedback = {
        score: data.score || 5,
        overall: data.overall || 'Good attempt!',
        strengths: data.strengths || [],
        improvements: data.improvements || [],
        correctExplanation: data.correctExplanation || '',
      };

      setFeedback(feedbackData);
      
      // Calculate XP: 1 XP per point (max 10 XP)
      const xpEarned = feedbackData.score;
      onComplete?.(feedbackData.score, xpEarned);
    } catch (err) {
      console.error('Error evaluating explanation:', err);
      setError('Failed to evaluate. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [userAnswer, topic, articleReference, onComplete]);

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-accent';
    if (score >= 6) return 'text-primary';
    if (score >= 4) return 'text-yellow-500';
    return 'text-destructive';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 9) return 'Excellent!';
    if (score >= 7) return 'Great Job!';
    if (score >= 5) return 'Good Effort';
    if (score >= 3) return 'Needs Work';
    return 'Keep Learning';
  };

  if (feedback) {
    return (
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Star className="w-5 h-5 text-gold" />
              Your Explanation Score
            </span>
            <span className={`text-2xl font-bold ${getScoreColor(feedback.score)}`}>
              {feedback.score}/10
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className={`font-medium ${getScoreColor(feedback.score)}`}>
            {getScoreLabel(feedback.score)}
          </p>
          
          <p className="text-sm text-muted-foreground">{feedback.overall}</p>

          {feedback.strengths.length > 0 && (
            <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
              <p className="text-xs font-medium text-accent mb-2 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                What you got right:
              </p>
              <ul className="text-sm space-y-1">
                {feedback.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-accent mt-1">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {feedback.improvements.length > 0 && (
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <Lightbulb className="w-3 h-3" />
                How to improve:
              </p>
              <ul className="text-sm space-y-1">
                {feedback.improvements.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-muted-foreground mt-1">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {feedback.correctExplanation && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-xs font-medium text-primary mb-2">Model Answer:</p>
              <p className="text-sm">{feedback.correctExplanation}</p>
            </div>
          )}

          <Button
            variant="outline"
            onClick={() => {
              setFeedback(null);
              setUserAnswer('');
            }}
            className="w-full"
          >
            Try Another Explanation
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <span>✍️</span>
          Explain in Your Own Words
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Explain <strong>{topic}</strong> in simple language. Your explanation will be evaluated by AI.
        </p>
        
        {articleReference && (
          <p className="text-xs text-primary">Related: {articleReference}</p>
        )}

        <Textarea
          placeholder="Write your explanation here... (minimum 20 characters)"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          className="min-h-[120px]"
          disabled={isSubmitting}
        />

        {error && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {error}
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {userAnswer.length} characters
          </span>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || userAnswer.length < 20}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Evaluating...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          💡 Good explanations earn bonus XP!
        </p>
      </CardContent>
    </Card>
  );
}
