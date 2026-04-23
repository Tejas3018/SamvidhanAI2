import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, RotateCcw, Shuffle, CheckCircle2, XCircle } from 'lucide-react';

const words = [
  { word: 'PREAMBLE', hint: 'The introduction to the Constitution' },
  { word: 'FUNDAMENTAL', hint: 'Type of rights guaranteed to citizens' },
  { word: 'SOVEREIGNTY', hint: 'Supreme power of a nation' },
  { word: 'SECULAR', hint: 'Separation of religion from state' },
  { word: 'DEMOCRACY', hint: 'Government by the people' },
  { word: 'REPUBLIC', hint: 'A state with elected representatives' },
  { word: 'JUSTICE', hint: 'Fairness and equality in law' },
  { word: 'LIBERTY', hint: 'Freedom from oppression' },
  { word: 'EQUALITY', hint: 'Same status for all citizens' },
  { word: 'FRATERNITY', hint: 'Brotherhood among citizens' },
];

function scrambleWord(word: string): string {
  const arr = word.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const scrambled = arr.join('');
  return scrambled === word ? scrambleWord(word) : scrambled;
}

export function WordScrambleGame() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrambledWord, setScrambledWord] = useState('');
  const [userGuess, setUserGuess] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const currentWord = words[currentIndex];

  useEffect(() => {
    setScrambledWord(scrambleWord(currentWord.word));
  }, [currentIndex]);

  const checkAnswer = () => {
    const correct = userGuess.toUpperCase() === currentWord.word;
    setIsCorrect(correct);
    setIsAnswered(true);
    
    if (correct) {
      setScore(prev => prev + (showHint ? 5 : 10));
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= words.length) {
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

  const reshuffleWord = () => {
    setScrambledWord(scrambleWord(currentWord.word));
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
    const maxScore = words.length * 10;
    const percentage = Math.round((score / maxScore) * 100);

    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto rounded-full bg-accent/20 flex items-center justify-center mb-6">
          <Trophy className="w-12 h-12 text-accent" />
        </div>
        <h2 className="text-3xl font-bold mb-2">Word Master!</h2>
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
          <h2 className="text-2xl font-bold">Word Scramble</h2>
          <p className="text-muted-foreground">Unscramble constitutional terms</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Score</p>
          <p className="text-2xl font-bold text-primary">{score}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Word {currentIndex + 1} of {words.length}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full gradient-hero transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Scrambled word */}
      <div className="bg-muted/50 rounded-2xl p-8 mb-6 text-center">
        <div className="flex justify-center gap-2 mb-4">
          {scrambledWord.split('').map((letter, index) => (
            <span
              key={index}
              className="w-10 h-12 md:w-12 md:h-14 flex items-center justify-center bg-card border-2 border-border rounded-lg text-xl md:text-2xl font-bold"
            >
              {letter}
            </span>
          ))}
        </div>
        <Button variant="ghost" size="sm" onClick={reshuffleWord} disabled={isAnswered}>
          <Shuffle className="w-4 h-4 mr-2" />
          Reshuffle
        </Button>
      </div>

      {/* Hint */}
      {showHint && (
        <div className="p-4 bg-accent/10 border border-accent/30 rounded-xl mb-6 text-center">
          <p className="text-accent font-medium">💡 {currentWord.hint}</p>
        </div>
      )}

      {/* Answer section */}
      {!isAnswered ? (
        <div className="space-y-4">
          <input
            type="text"
            value={userGuess}
            onChange={(e) => setUserGuess(e.target.value.toUpperCase())}
            placeholder="Type your answer"
            maxLength={currentWord.word.length}
            className="w-full px-4 py-3 rounded-xl border-2 border-border bg-card text-center text-xl font-bold tracking-widest focus:border-primary focus:outline-none transition-colors uppercase"
            onKeyDown={(e) => e.key === 'Enter' && userGuess && checkAnswer()}
          />
          <div className="flex gap-3">
            {!showHint && (
              <Button variant="outline" onClick={handleHint} className="flex-1">
                Need a Hint?
              </Button>
            )}
            <Button onClick={checkAnswer} disabled={!userGuess} variant="hero" className="flex-1">
              Submit
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 ${
            isCorrect 
              ? 'bg-accent/20 border-accent' 
              : 'bg-destructive/10 border-destructive'
          }`}>
            {isCorrect ? (
              <CheckCircle2 className="w-6 h-6 text-accent" />
            ) : (
              <XCircle className="w-6 h-6 text-destructive" />
            )}
            <div className="text-center">
              <p className={`font-semibold ${isCorrect ? 'text-accent' : 'text-destructive'}`}>
                {isCorrect ? 'Correct!' : 'Incorrect'}
              </p>
              <p className="text-muted-foreground">
                The word was <span className="font-bold">{currentWord.word}</span>
              </p>
            </div>
          </div>
          <Button onClick={handleNext} variant="hero" className="w-full">
            {currentIndex + 1 >= words.length ? 'See Results' : 'Next Word'}
          </Button>
        </div>
      )}
    </div>
  );
}