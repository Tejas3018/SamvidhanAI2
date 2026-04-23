import { Amendment } from '@/types';
import { Calendar, ChevronRight, Target, Bot, Check, X, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslateResponse } from '@/hooks/useTranslateResponse';

interface AmendmentCardProps {
  amendment: Amendment;
  index: number;
  onExplore?: (id: number) => void;
}

const categoryConfig: Record<string, { bg: string; text: string; border: string }> = {
  'Fundamental Rights': { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' },
  'Governance': { bg: 'bg-secondary/10', text: 'text-secondary', border: 'border-secondary/20' },
  'Elections': { bg: 'bg-accent/10', text: 'text-accent', border: 'border-accent/20' },
  'Reservations': { bg: 'bg-gold/10', text: 'text-gold', border: 'border-gold/20' },
  'Judiciary': { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/20' },
  'Other': { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border' },
};

// Generate quiz questions based on amendment data
function generateQuizQuestion(amendment: Amendment) {
  const questions = [
    {
      question: `The ${amendment.number} Amendment was passed in:`,
      options: [
        String(amendment.year),
        String(amendment.year - 2),
        String(amendment.year + 3),
        String(amendment.year - 5),
      ],
      correctIndex: 0,
      explanation: `This amendment was enacted in ${amendment.year}.`,
    },
    {
      question: `This amendment mainly relates to:`,
      options: [amendment.category, 'Defense', 'Foreign Policy', 'Sports'],
      correctIndex: 0,
      explanation: `The ${amendment.number} Amendment falls under the ${amendment.category} category.`,
    },
  ];
  return questions[Math.floor(Math.random() * questions.length)];
}

// Generate quick check question
function generateQuickCheck(amendment: Amendment) {
  const checks = [
    {
      question: `Did this amendment strengthen citizen rights?`,
      answer: amendment.category === 'Fundamental Rights',
      explanation: amendment.category === 'Fundamental Rights' 
        ? 'This amendment relates to Fundamental Rights.' 
        : `This amendment is about ${amendment.category}, not directly about citizen rights.`,
    },
    {
      question: `Was this passed after 2000?`,
      answer: amendment.year > 2000,
      explanation: `This amendment was passed in ${amendment.year}.`,
    },
  ];
  return checks[amendment.id % checks.length];
}

// Real-life examples for amendments
function getRealLifeExample(amendment: Amendment): string {
  const examples: Record<string, string> = {
    'Fundamental Rights': 'In real life: This affects how you can express your views and access public services.',
    'Governance': 'In real life: This impacts how your state and local government functions.',
    'Elections': 'In real life: This determines how you participate in choosing your representatives.',
    'Reservations': 'In real life: This affects educational and job opportunities for various communities.',
    'Judiciary': 'In real life: This influences how courts handle your legal disputes.',
    'Other': 'In real life: This has broad implications on administrative matters.',
  };
  return examples[amendment.category] || examples['Other'];
}

export function AmendmentCard({ amendment, index, onExplore }: AmendmentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [showExplainModal, setShowExplainModal] = useState(false);
  const [explanation, setExplanation] = useState<string>('');
  const [explainMode, setExplainMode] = useState<string>('');
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [quickCheckAnswer, setQuickCheckAnswer] = useState<boolean | null>(null);
  
  const config = categoryConfig[amendment.category] || categoryConfig['Other'];
  const quiz = generateQuizQuestion(amendment);
  const quickCheck = generateQuickCheck(amendment);
  const { t } = useLanguage();
  const { translateText } = useTranslateResponse();

  const handleExpand = () => {
    if (!isExpanded) {
      onExplore?.(amendment.id);
    }
    setIsExpanded(!isExpanded);
  };

  const handleQuizClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowQuiz(!showQuiz);
    setQuizAnswer(null);
    onExplore?.(amendment.id);
  };

  const handleQuizAnswer = (answerIndex: number) => {
    setQuizAnswer(answerIndex);
  };

  const handleExplainClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowExplainModal(true);
    setExplanation('');
    setExplainMode('');
    onExplore?.(amendment.id);
  };

  const fetchExplanation = async (mode: string) => {
    setExplainMode(mode);
    setIsLoadingExplanation(true);
    setExplanation('');

    try {
      const { data, error } = await supabase.functions.invoke('explain-amendment', {
        body: { amendment, mode },
      });

      if (error) throw error;
      const translated = await translateText(data.explanation);
      setExplanation(translated);
    } catch (err) {
      console.error('Error fetching explanation:', err);
      setExplanation('Unable to fetch explanation. Please try again.');
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  const handleQuickCheck = (answer: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    setQuickCheckAnswer(answer);
    onExplore?.(amendment.id);
  };

  return (
    <>
      <div
        className={`group bg-card border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-card animate-fade-in ${config.border}`}
        style={{ animationDelay: `${Math.min(index * 0.02, 0.5)}s` }}
      >
        {/* Header - clickable */}
        <div className="p-4 cursor-pointer" onClick={handleExpand}>
          <div className="flex items-start gap-3">
            {/* Amendment Number Badge */}
            <div className="w-12 h-12 rounded-lg gradient-hero flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-primary-foreground font-bold text-sm">{amendment.number}</span>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-sm leading-tight line-clamp-2">{amendment.title}</h3>
                <ChevronRight className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              </div>
              
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.bg} ${config.text}`}>
                  {amendment.category}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {amendment.year}
                </span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <p className={`text-sm text-muted-foreground mt-3 ${isExpanded ? '' : 'line-clamp-2'}`}>
            {amendment.summary}
          </p>
        </div>

        {/* Action Buttons Row */}
        <div className="px-4 pb-3 flex items-center gap-2 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleQuizClick}
            className="h-7 text-xs gap-1.5 text-primary hover:text-primary hover:bg-primary/10"
          >
            <Target className="w-3.5 h-3.5" />
            {t('amendments.quizMe')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExplainClick}
            className="h-7 text-xs gap-1.5 text-secondary hover:text-secondary hover:bg-secondary/10"
          >
            <Bot className="w-3.5 h-3.5" />
            {t('amendments.explainThis')}
          </Button>
        </div>

        {/* Feature 1: Inline Quiz */}
        {showQuiz && (
          <div className="px-4 pb-4 border-t border-border/50 animate-fade-in">
            <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
              <h4 className="text-xs font-semibold text-primary mb-2 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                Quick Check
              </h4>
              <p className="text-sm font-medium mb-3">{quiz.question}</p>
              <div className="space-y-2">
                {quiz.options.map((option, idx) => {
                  const isSelected = quizAnswer === idx;
                  const isCorrect = idx === quiz.correctIndex;
                  const showResult = quizAnswer !== null;

                  return (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuizAnswer(idx);
                      }}
                      disabled={quizAnswer !== null}
                      className={cn(
                        'w-full text-left text-sm px-3 py-2 rounded-md transition-all border',
                        !showResult && 'border-border hover:border-primary/50 hover:bg-primary/5',
                        showResult && isCorrect && 'border-green-500 bg-green-500/10 text-green-700 dark:text-green-400',
                        showResult && isSelected && !isCorrect && 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-400',
                        showResult && !isSelected && !isCorrect && 'border-border opacity-50'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'w-5 h-5 rounded-full border flex items-center justify-center text-xs',
                          showResult && isCorrect && 'border-green-500 bg-green-500 text-white',
                          showResult && isSelected && !isCorrect && 'border-red-500 bg-red-500 text-white',
                          !showResult && 'border-muted-foreground'
                        )}>
                          {showResult && isCorrect && <Check className="w-3 h-3" />}
                          {showResult && isSelected && !isCorrect && <X className="w-3 h-3" />}
                          {!showResult && String.fromCharCode(65 + idx)}
                        </span>
                        {option}
                      </div>
                    </button>
                  );
                })}
              </div>
              {quizAnswer !== null && (
                <p className="mt-3 text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                  {quiz.explanation}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Feature 5: Quick Check (Yes/No) */}
        {!showQuiz && (
          <div className="px-4 pb-3 border-t border-border/30">
            <div className="pt-3">
              <p className="text-xs text-muted-foreground mb-2">{quickCheck.question}</p>
              <div className="flex gap-2">
                {quickCheckAnswer === null ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleQuickCheck(true, e)}
                      className="h-7 text-xs px-4"
                    >
                      Yes
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleQuickCheck(false, e)}
                      className="h-7 text-xs px-4"
                    >
                      No
                    </Button>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-xs animate-fade-in">
                    {quickCheckAnswer === quickCheck.answer ? (
                      <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <Check className="w-3.5 h-3.5" /> Correct!
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                        <X className="w-3.5 h-3.5" /> Not quite
                      </span>
                    )}
                    <span className="text-muted-foreground">— {quickCheck.explanation}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Feature 4: Expandable "Why it matters" */}
        {isExpanded && (
          <div className="px-4 pb-4 border-t border-border/50 animate-fade-in">
            <div className="mt-3 p-3 rounded-lg bg-muted/50">
              <h4 className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-accent" />
                {t('amendments.whyItMatters')}
              </h4>
              <p className="text-sm text-foreground/80">{amendment.impact}</p>
              <p className="text-xs text-muted-foreground mt-2 italic border-t border-border/50 pt-2">
                {getRealLifeExample(amendment)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Feature 2: AI Explanation Modal */}
      <Dialog open={showExplainModal} onOpenChange={setShowExplainModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-secondary" />
              Explain: {amendment.number} Amendment
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Mode Selection */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={explainMode === 'simple' ? 'default' : 'outline'}
                size="sm"
                onClick={() => fetchExplanation('simple')}
                disabled={isLoadingExplanation}
              >
                📝 {t('amendments.simpleEnglish')}
              </Button>
              <Button
                variant={explainMode === 'eli12' ? 'default' : 'outline'}
                size="sm"
                onClick={() => fetchExplanation('eli12')}
                disabled={isLoadingExplanation}
              >
                🧒 {t('amendments.explainLike12')}
              </Button>
              <Button
                variant={explainMode === 'reallife' ? 'default' : 'outline'}
                size="sm"
                onClick={() => fetchExplanation('reallife')}
                disabled={isLoadingExplanation}
              >
                🏠 {t('amendments.realLifeExample')}
              </Button>
            </div>

            {/* Explanation Content */}
            <div className="min-h-[120px] p-4 rounded-lg bg-muted/50 border border-border">
              {!explainMode && !isLoadingExplanation && (
                <p className="text-sm text-muted-foreground text-center">
                  {t('amendments.chooseStyle')}
                </p>
              )}
              {isLoadingExplanation && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">{t('amendments.gettingExplanation')}</span>
                </div>
              )}
              {explanation && !isLoadingExplanation && (
                <p className="text-sm leading-relaxed">{explanation}</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
