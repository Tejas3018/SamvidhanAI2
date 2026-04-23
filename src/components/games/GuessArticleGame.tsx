import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { guessArticleData } from '@/data/games';
import { Trophy, RotateCcw, Lightbulb, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';

export function GuessArticleGame() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userGuess, setUserGuess] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const currentQuestion = guessArticleData[currentIndex];

  const checkAnswer = () => {
    const normalizedGuess = userGuess.toLowerCase().replace(/\s+/g, '');
    const normalizedAnswer = currentQuestion.answer.toLowerCase().replace(/\s+/g, '');
    
    const correct = normalizedGuess.includes(normalizedAnswer) || 
                   normalizedAnswer.includes(normalizedGuess) ||
                   normalizedGuess.includes(normalizedAnswer.replace('article', ''));
    
    setIsCorrect(correct);
    setIsAnswered(true);
    
    if (correct) {
      setScore(prev => prev + (showHint ? 5 : 10));
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= guessArticleData.length) {
      setIsComplete(true);
    } else {
      setCurrentIndex(prev => prev + 1);
      setUserGuess('');
      setShowHint(false);
      setIsAnswered(false);
      setIsCorrect(false);
    }
  };

  const handleHint = () => {
    setShowHint(true);
    setHintsUsed(prev => prev + 1);
  };

  const restartGame = () => {
    setCurrentIndex(0);
    setUserGuess('');
    setShowHint(false);
    setIsAnswered(false);
    setIsCorrect(false);
    setScore(0);
    setHintsUsed(0);
    setIsComplete(false);
  };

  if (isComplete) {
    const maxScore = guessArticleData.length * 10;
    const percentage = Math.round((score / maxScore) * 100);

    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto rounded-full bg-accent/20 flex items-center justify-center mb-6">
          <Trophy className="w-12 h-12 text-accent" />
        </div>
        <h2 className="text-3xl font-bold mb-2">Great Job!</h2>
        <p className="text-4xl font-bold text-primary mb-2">{score}/{maxScore}</p>
        <p className="text-muted-foreground mb-2">
          You scored {percentage}%!
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          Hints used: {hintsUsed}
        </p>
        <Button onClick={restartGame} variant="hero">
          <RotateCcw className="w-4 h-4 mr-2" />
          Play Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">Guess the Article</h2>
          <p className="text-muted-foreground">Read the description and identify the Article</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Score</p>
          <p className="text-2xl font-bold text-primary">{score}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Question {currentIndex + 1} of {guessArticleData.length}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full gradient-hero transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / guessArticleData.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Description */}
      <div className="bg-muted/50 rounded-2xl p-6 mb-6">
        <p className="text-lg leading-relaxed">{currentQuestion.description}</p>
      </div>

      {/* Hint */}
      {showHint && (
        <div className="flex items-center gap-2 p-4 bg-accent/10 border border-accent/30 rounded-xl mb-6">
          <Lightbulb className="w-5 h-5 text-accent shrink-0" />
          <p className="text-accent font-medium">Hint: {currentQuestion.hint}</p>
        </div>
      )}

      {/* Answer section */}
      {!isAnswered ? (
        <div className="space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={userGuess}
              onChange={(e) => setUserGuess(e.target.value)}
              placeholder="Type your answer (e.g., Article 21)"
              className="flex-1 px-4 py-3 rounded-xl border-2 border-border bg-card focus:border-primary focus:outline-none transition-colors"
              onKeyDown={(e) => e.key === 'Enter' && userGuess && checkAnswer()}
            />
            <Button onClick={checkAnswer} disabled={!userGuess} variant="hero">
              Submit
            </Button>
          </div>
          {!showHint && (
            <Button variant="outline" onClick={handleHint} className="w-full">
              <Lightbulb className="w-4 h-4 mr-2" />
              Need a Hint? (-5 points)
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className={`flex items-center gap-3 p-4 rounded-xl border-2 ${
            isCorrect 
              ? 'bg-accent/10 border-accent' 
              : 'bg-destructive/10 border-destructive'
          }`}>
            {isCorrect ? (
              <CheckCircle2 className="w-6 h-6 text-accent shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 text-destructive shrink-0" />
            )}
            <div>
              <p className={`font-semibold ${isCorrect ? 'text-accent' : 'text-destructive'}`}>
                {isCorrect ? 'Correct!' : 'Incorrect'}
              </p>
              <p className="text-muted-foreground">
                The answer is <span className="font-bold">{currentQuestion.answer}</span>
              </p>
            </div>
          </div>
          <Button onClick={handleNext} variant="hero" className="w-full">
            {currentIndex + 1 >= guessArticleData.length ? 'See Results' : 'Next Question'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}