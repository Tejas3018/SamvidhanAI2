import { useState, useEffect } from 'react';
import { QuizQuestion } from '@/types';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, ArrowRight, ArrowLeft, RotateCcw, Trophy, Eye, ChevronLeft, ChevronRight, Zap, Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuizMistakes } from '@/hooks/useQuizMistakes';
import { useWeakTopics } from '@/hooks/useWeakTopics';
import { useSkillMastery } from '@/hooks/useSkillMastery';
import { useAdaptiveDifficulty } from '@/hooks/useAdaptiveDifficulty';
import { useRevisionSchedule } from '@/hooks/useRevisionSchedule';
import { useLearningStreak } from '@/hooks/useLearningStreak';
import { levels } from '@/data/levels';
import { getLevelGoal } from '@/data/levelGoals';

interface QuizProps {
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
  levelId: number;
  isRevision?: boolean;
  revisionId?: string;
}

interface AnswerRecord {
  selectedAnswer: number | null;
  isCorrect: boolean;
}

export function Quiz({ questions, onComplete, levelId, isRevision = false, revisionId }: QuizProps) {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [answers, setAnswers] = useState<Record<number, AnswerRecord>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);

  const { recordMistake } = useQuizMistakes();
  const { recordAnswer } = useWeakTopics();
  const { recordSkillAttempt } = useSkillMastery();
  const { recordScore } = useAdaptiveDifficulty();
  const { scheduleRevisions, completeRevision } = useRevisionSchedule();
  const { recordActivity } = useLearningStreak();

  const currentQuestion = questions[currentIndex];
  const currentAnswerRecord = answers[currentIndex];
  const isCurrentAnswered = currentAnswerRecord !== undefined;
  const isCorrect = selectedAnswer === currentQuestion?.correctAnswer;

  const answeredCount = Object.keys(answers).length;
  const correctCount = Object.values(answers).filter(a => a.isCorrect).length;

  const levelInfo = levels.find(l => l.id === levelId);
  const levelGoal = getLevelGoal(levelId);

  const handleSelectAnswer = (index: number) => {
    if (isCurrentAnswered || isReviewMode) return;
    setSelectedAnswer(index);
    setIsAnswered(true);
    
    const isCorrectAnswer = index === currentQuestion.correctAnswer;
    setAnswers(prev => ({
      ...prev,
      [currentIndex]: {
        selectedAnswer: index,
        isCorrect: isCorrectAnswer
      }
    }));

    // Track for weak topics
    const topic = currentQuestion.articleReference || currentQuestion.question.slice(0, 50);
    recordAnswer(topic, levelId, isCorrectAnswer, currentQuestion.articleReference);

    // Track for skill mastery
    const questionType = (currentQuestion as any).isScenario ? 'scenarios' : 
                        currentQuestion.articleReference?.includes('Amendment') ? 'amendments' :
                        currentQuestion.articleReference?.includes('Article') ? 'articles' : 'reasoning';
    recordSkillAttempt(questionType as any, isCorrectAnswer);

    // Record mistake if wrong
    if (!isCorrectAnswer) {
      recordMistake({
        questionId: currentQuestion.id,
        question: currentQuestion.question,
        selectedAnswer: index,
        correctAnswer: currentQuestion.correctAnswer,
        selectedOption: currentQuestion.options[index],
        correctOption: currentQuestion.options[currentQuestion.correctAnswer],
        explanation: currentQuestion.explanation,
        articleReference: currentQuestion.articleReference,
        levelId,
      });
    }
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (direction === 'next' && currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
    setSelectedAnswer(null);
    setIsAnswered(false);
  };

  const handleJumpToQuestion = (index: number) => {
    setCurrentIndex(index);
    setSelectedAnswer(null);
    setIsAnswered(false);
  };

  const handleFinishQuiz = () => {
    setIsComplete(true);
    const finalScore = Math.round((correctCount / questions.length) * 100);
    
    // Record for adaptive difficulty
    recordScore(finalScore);
    
    // Record activity for streak
    recordActivity();
    
    // Schedule revisions if passed and not a revision quiz
    if (finalScore >= 50 && !isRevision && levelInfo) {
      scheduleRevisions(levelId, levelInfo.title, levelInfo.icon);
    }
    
    // Complete revision if this was a revision quiz
    if (isRevision && revisionId) {
      const xpEarned = Math.round(finalScore / 10) * 5; // 0-50 XP based on score
      completeRevision(revisionId, xpEarned);
    }
    
    onComplete(finalScore);
  };

  const handleReview = () => {
    setIsReviewMode(true);
    setCurrentIndex(0);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setAnswers({});
    setIsComplete(false);
    setIsReviewMode(false);
  };

  // Results screen
  if (isComplete && !isReviewMode) {
    const percentage = Math.round((correctCount / questions.length) * 100);
    const isPassed = percentage >= 50;
    const hasBonus = percentage >= 80;
    const bonusXP = hasBonus && levelGoal ? levelGoal.bonusXP : 0;

    return (
      <div className="text-center py-12">
        <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 ${
          hasBonus ? 'bg-gold/20' : isPassed ? 'bg-accent/20' : 'bg-destructive/20'
        }`}>
          {hasBonus ? (
            <Star className="w-12 h-12 text-gold" />
          ) : isPassed ? (
            <Trophy className="w-12 h-12 text-accent" />
          ) : (
            <RotateCcw className="w-12 h-12 text-destructive" />
          )}
        </div>

        <h2 className="text-3xl font-bold mb-2">
          {hasBonus ? t('quiz.outstanding') : isPassed ? t('quiz.congratulations') : t('quiz.keepTrying')}
        </h2>
        <p className="text-muted-foreground mb-2">
          {t('quiz.youScored')} {correctCount} {t('quiz.outOf')} {questions.length} ({percentage}%)
        </p>
        
        {hasBonus && levelGoal && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 text-gold mb-4">
            <Zap className="w-4 h-4" />
            <span className="font-semibold">+{bonusXP} {t('quiz.bonusXP')}</span>
          </div>
        )}
        
        <p className="text-sm text-muted-foreground mb-6">
          {hasBonus 
            ? t('quiz.masteredLevel')
            : isPassed 
            ? isRevision 
              ? t('quiz.revisionGreat')
              : t('quiz.passed')
            : t('quiz.needPass')}
        </p>

        {/* Wrong answers summary */}
        {correctCount < questions.length && (
          <div className="mb-6 p-4 rounded-xl bg-muted/50 max-w-md mx-auto text-left">
            <p className="text-sm font-medium mb-2 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-destructive" />
              {questions.length - correctCount} {t('quiz.questionsToReview')}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('quiz.reviewAnswers')}
            </p>
          </div>
        )}

        <div className="flex justify-center gap-4 flex-wrap">
          <Button variant="outline" onClick={handleRestart}>
            <RotateCcw className="w-4 h-4 mr-2" />
            {t('common.tryAgain')}
          </Button>
          <Button variant="secondary" onClick={handleReview}>
            <Eye className="w-4 h-4 mr-2" />
            {t('quiz.reviewAnswers')}
          </Button>
          {isPassed && !isRevision && (
            <Button variant="hero">
              <Trophy className="w-4 h-4 mr-2" />
              {t('common.continue')}
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return <div>{t('quiz.noQuestions')}</div>;
  }

  // Get the answer for current question in review mode or during quiz
  const displayAnswer = isReviewMode ? answers[currentIndex] : (isAnswered ? { selectedAnswer, isCorrect } : null);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Review mode banner */}
      {isReviewMode && (
        <div className="bg-primary/10 border border-primary/30 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Eye className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="font-semibold text-primary block">{t('quiz.reviewMode')}</span>
              <span className="text-sm text-muted-foreground">
                Score: {correctCount}/{questions.length} ({Math.round((correctCount / questions.length) * 100)}%)
              </span>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleRestart} className="shrink-0">
            <RotateCcw className="w-4 h-4 mr-2" />
            {t('quiz.restartQuiz')}
          </Button>
        </div>
      )}

      {/* Revision badge */}
      {isRevision && !isReviewMode && (
        <div className="bg-accent/10 border border-accent/30 rounded-2xl p-3 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
            <RotateCcw className="w-4 h-4 text-accent" />
          </div>
          <div>
            <span className="font-medium text-accent">{t('quiz.revisionQuiz')}</span>
            <span className="text-sm text-muted-foreground ml-2">
              {t('quiz.quickReview')}
            </span>
          </div>
        </div>
      )}

      {/* Progress Section */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center text-primary-foreground font-bold text-lg">
              {currentIndex + 1}
            </div>
            <div>
              <p className="font-semibold text-lg">{t('game.question')} {currentIndex + 1}</p>
              <p className="text-sm text-muted-foreground">{t('quiz.questionOf')} {questions.length} {t('quiz.questions')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted">
              <CheckCircle2 className="w-4 h-4 text-accent" />
              <span className="font-medium">{correctCount} {t('quiz.correct')}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted">
              <span className="font-medium">{answeredCount} / {questions.length}</span>
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full gradient-hero transition-all duration-500 rounded-full"
            style={{ width: `${(answeredCount / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question navigator - Collapsible on mobile */}
      <details className="mb-6 bg-card border border-border rounded-2xl overflow-hidden group">
        <summary className="p-4 cursor-pointer flex items-center justify-between hover:bg-muted/50 transition-colors">
          <span className="font-medium flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t('quiz.quickNavigation')}</span>
          </span>
          <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-90" />
        </summary>
        <div className="p-4 pt-0 border-t border-border">
          <div className="flex flex-wrap gap-2 mt-4">
            {questions.map((_, index) => {
              const answer = answers[index];
              let bgClass = 'bg-muted hover:bg-muted/80 text-foreground';
              if (answer) {
                bgClass = answer.isCorrect 
                  ? 'bg-accent text-accent-foreground' 
                  : 'bg-destructive text-destructive-foreground';
              }
              const isCurrentQuestion = index === currentIndex;
              return (
                <button
                  key={index}
                  onClick={() => handleJumpToQuestion(index)}
                  className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${bgClass} ${
                    isCurrentQuestion ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>
      </details>

      {/* Scenario indicator */}
      {(currentQuestion as any).isScenario && (
        <div className="mb-4 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-medium inline-flex items-center gap-1">
          {t('quiz.scenarioBased')}
        </div>
      )}

      {/* Question */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6 shadow-card">
        <h3 className="text-xl font-semibold mb-6">{currentQuestion.question}</h3>

        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = displayAnswer?.selectedAnswer === index;
            const isCorrectAnswer = index === currentQuestion.correctAnswer;
            const showResult = displayAnswer !== null || isReviewMode;

            let optionClass = 'border-border hover:border-primary/50 hover:bg-muted/50';
            if (showResult) {
              if (isCorrectAnswer) {
                optionClass = 'border-accent bg-accent/10';
              } else if (isSelected && !isCorrectAnswer) {
                optionClass = 'border-destructive bg-destructive/10';
              } else {
                optionClass = 'border-border opacity-60';
              }
            } else if (isSelected) {
              optionClass = 'border-primary bg-primary/10';
            }

            return (
              <button
                key={index}
                onClick={() => handleSelectAnswer(index)}
                disabled={isCurrentAnswered || isReviewMode}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 ${optionClass} ${
                  (isCurrentAnswered || isReviewMode) ? 'cursor-default' : 'cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold ${
                    showResult && isCorrectAnswer
                      ? 'border-accent bg-accent text-accent-foreground'
                      : showResult && isSelected && !isCorrectAnswer
                      ? 'border-destructive bg-destructive text-destructive-foreground'
                      : 'border-current'
                  }`}>
                    {showResult && isCorrectAnswer ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : showResult && isSelected && !isCorrectAnswer ? (
                      <XCircle className="w-4 h-4" />
                    ) : (
                      String.fromCharCode(65 + index)
                    )}
                  </div>
                  <span className="flex-1">{option}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Explanation */}
      {(displayAnswer !== null || isReviewMode) && answers[currentIndex] && (
        <div className={`p-4 rounded-xl mb-6 animate-fade-in ${
          answers[currentIndex].isCorrect ? 'bg-accent/10 border border-accent/30' : 'bg-muted'
        }`}>
          <p className="text-sm">
            <strong>{answers[currentIndex].isCorrect ? '✓ Correct!' : '✗ Incorrect.'}</strong>{' '}
            {currentQuestion.explanation}
          </p>
          {currentQuestion.articleReference && (
            <p className="text-xs text-muted-foreground mt-2">
              {t('quiz.reference')} {currentQuestion.articleReference}
            </p>
          )}
          
          {/* Why wrong explanation for incorrect answers in review mode */}
          {!answers[currentIndex].isCorrect && isReviewMode && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs font-medium text-destructive mb-1">{t('quiz.whyWrong')}</p>
              <p className="text-xs text-muted-foreground">
                You selected "{currentQuestion.options[answers[currentIndex].selectedAnswer!]}" but the correct answer is "{currentQuestion.options[currentQuestion.correctAnswer]}". 
                Understanding this distinction is key to mastering this concept.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => handleNavigate('prev')}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          {t('quiz.previous')}
        </Button>

        <div className="flex gap-2">
          {!isReviewMode && answeredCount === questions.length && (
            <Button onClick={handleFinishQuiz} variant="hero">
              <Trophy className="w-4 h-4 mr-2" />
              {t('quiz.finishQuiz')}
            </Button>
          )}
        </div>

        <Button
          variant="outline"
          onClick={() => handleNavigate('next')}
          disabled={currentIndex === questions.length - 1}
        >
          {t('quiz.next')}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
