import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuizMistakes } from '@/hooks/useQuizMistakes';
import { XCircle, CheckCircle2, BookOpen, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface MistakeReviewSectionProps {
  levelId?: number;
}

export function MistakeReviewSection({ levelId }: MistakeReviewSectionProps) {
  const { mistakes, getMistakesForLevel, getRecentMistakes } = useQuizMistakes();
  const [expanded, setExpanded] = useState<string | null>(null);

  const displayMistakes = levelId ? getMistakesForLevel(levelId) : getRecentMistakes(5);

  if (displayMistakes.length === 0) {
    return null;
  }

  return (
    <Card className="border-destructive/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="p-2 rounded-lg bg-destructive/10">
            <XCircle className="w-4 h-4 text-destructive" />
          </div>
          Review Your Mistakes
          <span className="ml-auto text-sm font-normal text-muted-foreground">
            {displayMistakes.length} {displayMistakes.length === 1 ? 'mistake' : 'mistakes'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[400px]">
          <div className="space-y-3">
            {displayMistakes.map((mistake, index) => (
              <div
                key={`${mistake.questionId}-${index}`}
                className="border border-border rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setExpanded(expanded === mistake.questionId ? null : mistake.questionId)}
                  className="w-full p-3 flex items-start gap-3 text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
                    <XCircle className="w-4 h-4 text-destructive" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-2">{mistake.question}</p>
                    {mistake.articleReference && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {mistake.articleReference}
                      </p>
                    )}
                  </div>
                  <ChevronRight className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${
                    expanded === mistake.questionId ? 'rotate-90' : ''
                  }`} />
                </button>

                {expanded === mistake.questionId && (
                  <div className="px-3 pb-3 space-y-3 animate-fade-in border-t border-border bg-muted/30">
                    <div className="pt-3 space-y-2">
                      {/* Your answer - Wrong */}
                      <div className="flex items-start gap-2 p-2 rounded-lg bg-destructive/10 border border-destructive/20">
                        <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-destructive">Your Answer:</p>
                          <p className="text-sm">{mistake.selectedOption}</p>
                        </div>
                      </div>

                      {/* Correct answer */}
                      <div className="flex items-start gap-2 p-2 rounded-lg bg-accent/10 border border-accent/20">
                        <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-accent">Correct Answer:</p>
                          <p className="text-sm">{mistake.correctOption}</p>
                        </div>
                      </div>

                      {/* Explanation */}
                      <div className="p-2 rounded-lg bg-muted">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Why?</p>
                        <p className="text-sm">{mistake.explanation}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <p className="text-xs text-muted-foreground text-center mt-3">
          💡 Understanding mistakes is the key to mastery!
        </p>
      </CardContent>
    </Card>
  );
}
