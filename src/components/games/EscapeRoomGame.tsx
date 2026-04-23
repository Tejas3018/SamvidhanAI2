import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslateResponse } from '@/hooks/useTranslateResponse';
import { 
  Lock, 
  Unlock, 
  Key, 
  Lightbulb, 
  BookOpen, 
  Trophy,
  RefreshCw,
  DoorOpen,
  Scale,
  Clock,
  FileText,
  Loader2,
  CheckCircle2,
  XCircle,
  Star
} from 'lucide-react';

type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
type LockType = 'article' | 'case' | 'timeline';
type GameState = 'level-select' | 'playing' | 'loading' | 'puzzle-solved' | 'room-complete';

interface Puzzle {
  lock_type: LockType;
  puzzle: string;
  correct_answer: string;
  hint_1: string;
  hint_2: string;
  learning_point: string;
  lock_description: string;
}

interface Room {
  room_name: string;
  room_story: string;
  puzzles: Puzzle[];
  escape_message: string;
}

const levelInfo: Record<DifficultyLevel, { name: string; description: string; color: string; icon: string }> = {
  beginner: { 
    name: 'Beginner', 
    description: 'Basic Fundamental Rights', 
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
    icon: '🌱'
  },
  intermediate: { 
    name: 'Advocate', 
    description: 'Directive Principles & Duties', 
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    icon: '⚖️'
  },
  advanced: { 
    name: 'Senior Advocate', 
    description: 'Landmark Cases & Amendments', 
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    icon: '📜'
  },
  expert: { 
    name: 'Constitutional Expert', 
    description: 'Complex Provisions', 
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    icon: '🏛️'
  }
};

const lockIcons: Record<LockType, typeof Scale> = {
  article: FileText,
  case: Scale,
  timeline: Clock
};

export const EscapeRoomGame = () => {
  const [gameState, setGameState] = useState<GameState>('level-select');
  const [selectedLevel, setSelectedLevel] = useState<DifficultyLevel>('beginner');
  const [room, setRoom] = useState<Room | null>(null);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint1, setShowHint1] = useState(false);
  const [showHint2, setShowHint2] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [puzzleScores, setPuzzleScores] = useState<number[]>([]);
  const { translateText, translateObject } = useTranslateResponse();

  const generateRoom = async () => {
    setIsLoading(true);
    setGameState('loading');
    
    try {
      const { data, error } = await supabase.functions.invoke('escape-room', {
        body: {
          action: 'generate_room',
          level: selectedLevel,
          roomNumber: Math.floor(Math.random() * 100) + 1
        }
      });

      if (error) throw error;

      const translated = await translateObject(data, ['room_story', 'escape_message']);
      setRoom(translated);
      setCurrentPuzzleIndex(0);
      setHintsUsed(0);
      setShowHint1(false);
      setShowHint2(false);
      setUserAnswer('');
      setFeedback(null);
      setTotalScore(0);
      setPuzzleScores([]);
      setGameState('playing');
      toast.success('Escape room generated! Solve the puzzles to escape!');
    } catch (error) {
      console.error('Error generating room:', error);
      toast.error('Failed to generate escape room. Please try again.');
      setGameState('level-select');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyAnswer = async () => {
    if (!room || !userAnswer.trim()) return;

    setIsVerifying(true);
    const currentPuzzle = room.puzzles[currentPuzzleIndex];

    try {
      const { data, error } = await supabase.functions.invoke('escape-room', {
        body: {
          action: 'verify_answer',
          userAnswer: userAnswer.trim(),
          correctAnswer: currentPuzzle.correct_answer,
          puzzle: currentPuzzle.puzzle
        }
      });

      if (error) throw error;

      const isCorrect = data.is_correct || data.partial_credit;
      
      // Calculate score based on hints used
      let puzzleScore = 100;
      if (showHint1) puzzleScore -= 25;
      if (showHint2) puzzleScore -= 25;
      if (data.partial_credit && !data.is_correct) puzzleScore = Math.floor(puzzleScore * 0.5);

      setFeedback({
        isCorrect,
        message: data.feedback || (isCorrect ? 'Correct! The lock opens!' : 'Not quite right. Try again!')
      });

      if (isCorrect) {
        setPuzzleScores(prev => [...prev, puzzleScore]);
        setTotalScore(prev => prev + puzzleScore);
        
        if (currentPuzzleIndex < room.puzzles.length - 1) {
          setGameState('puzzle-solved');
        } else {
          setGameState('room-complete');
        }
      }
    } catch (error) {
      console.error('Error verifying answer:', error);
      toast.error('Failed to verify answer. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const nextPuzzle = () => {
    setCurrentPuzzleIndex(prev => prev + 1);
    setUserAnswer('');
    setShowHint1(false);
    setShowHint2(false);
    setFeedback(null);
    setGameState('playing');
  };

  const useHint = (hintNumber: 1 | 2) => {
    if (hintNumber === 1 && !showHint1) {
      setShowHint1(true);
      setHintsUsed(prev => prev + 1);
    } else if (hintNumber === 2 && !showHint2) {
      setShowHint2(true);
      setHintsUsed(prev => prev + 1);
    }
  };

  const resetGame = () => {
    setGameState('level-select');
    setRoom(null);
    setCurrentPuzzleIndex(0);
    setUserAnswer('');
    setHintsUsed(0);
    setShowHint1(false);
    setShowHint2(false);
    setFeedback(null);
    setTotalScore(0);
    setPuzzleScores([]);
  };

  // Level Selection Screen
  if (gameState === 'level-select') {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <div className="text-6xl">🚪</div>
          <h2 className="text-2xl font-bold">Constitution Escape Room</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            You're locked in a room filled with constitutional puzzles. Solve article clues, 
            case references, and timeline challenges to unlock each door and escape!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {(Object.entries(levelInfo) as [DifficultyLevel, typeof levelInfo.beginner][]).map(([level, info]) => (
            <Card
              key={level}
              className={`cursor-pointer transition-all hover:scale-105 ${
                selectedLevel === level 
                  ? 'ring-2 ring-primary border-primary' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => setSelectedLevel(level)}
            >
              <CardContent className="p-6 text-center space-y-3">
                <div className="text-4xl">{info.icon}</div>
                <h3 className="font-semibold text-lg">{info.name}</h3>
                <Badge className={info.color}>{info.description}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center">
          <Button 
            size="lg" 
            onClick={generateRoom}
            className="gap-2"
          >
            <DoorOpen className="w-5 h-5" />
            Enter the Escape Room
          </Button>
        </div>

        <div className="bg-muted/50 rounded-xl p-6 max-w-2xl mx-auto">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Key className="w-5 h-5" />
            How to Play
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Each room has 3 locks to open: Article, Case, and Timeline puzzles</li>
            <li>• Read the clue carefully and type your answer</li>
            <li>• Use hints if you're stuck (but they reduce your score!)</li>
            <li>• Solve all 3 puzzles to escape the room</li>
            <li>• Higher levels have more challenging puzzles</li>
          </ul>
        </div>
      </div>
    );
  }

  // Loading Screen
  if (gameState === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
        <Loader2 className="w-16 h-16 text-primary animate-spin" />
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold">Preparing Your Escape Room...</h2>
          <p className="text-muted-foreground">Setting up constitutional puzzles and locks</p>
        </div>
      </div>
    );
  }

  // Room Complete Screen
  if (gameState === 'room-complete' && room) {
    const maxScore = room.puzzles.length * 100;
    const percentage = Math.round((totalScore / maxScore) * 100);
    
    return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <div className="text-7xl">🎉</div>
          <h2 className="text-3xl font-bold text-primary">You Escaped!</h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            {room.escape_message}
          </p>
        </div>

        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 space-y-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-primary">{totalScore}</div>
              <p className="text-muted-foreground">Total Score</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Performance</span>
                <span>{percentage}%</span>
              </div>
              <Progress value={percentage} className="h-3" />
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              {puzzleScores.map((score, index) => (
                <div key={index} className="space-y-1">
                  <div className="text-2xl font-semibold">{score}</div>
                  <p className="text-xs text-muted-foreground">Puzzle {index + 1}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2">
              {percentage >= 90 ? (
                <>
                  <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                  <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                  <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                </>
              ) : percentage >= 70 ? (
                <>
                  <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                  <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                  <Star className="w-6 h-6 text-muted-foreground" />
                </>
              ) : (
                <>
                  <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                  <Star className="w-6 h-6 text-muted-foreground" />
                  <Star className="w-6 h-6 text-muted-foreground" />
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={resetGame} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Another Room
          </Button>
          <Button onClick={generateRoom} className="gap-2">
            <DoorOpen className="w-4 h-4" />
            Play Same Level
          </Button>
        </div>
      </div>
    );
  }

  // Puzzle Solved Screen
  if (gameState === 'puzzle-solved' && room) {
    const currentPuzzle = room.puzzles[currentPuzzleIndex];
    
    return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <div className="text-6xl">🔓</div>
          <h2 className="text-2xl font-bold text-green-500">Lock Opened!</h2>
          <p className="text-muted-foreground">{feedback?.message}</p>
        </div>

        <Card className="max-w-xl mx-auto bg-green-500/10 border-green-500/30">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-green-500">
              <BookOpen className="w-5 h-5" />
              <span className="font-semibold">What You Learned</span>
            </div>
            <p className="text-sm">{currentPuzzle.learning_point}</p>
            <div className="pt-2">
              <Badge variant="outline" className="text-green-500 border-green-500">
                Answer: {currentPuzzle.correct_answer}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button onClick={nextPuzzle} size="lg" className="gap-2">
            <Key className="w-5 h-5" />
            Next Lock ({currentPuzzleIndex + 2} of {room.puzzles.length})
          </Button>
        </div>
      </div>
    );
  }

  // Playing Screen
  if (room) {
    const currentPuzzle = room.puzzles[currentPuzzleIndex];
    const LockIcon = lockIcons[currentPuzzle.lock_type];
    const progress = ((currentPuzzleIndex) / room.puzzles.length) * 100;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{room.room_name}</h2>
            <p className="text-sm text-muted-foreground">{room.room_story}</p>
          </div>
          <Badge className={levelInfo[selectedLevel].color}>
            {levelInfo[selectedLevel].name}
          </Badge>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Lock {currentPuzzleIndex + 1} of {room.puzzles.length}</span>
            <span>Score: {totalScore}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Lock Display */}
        <div className="grid grid-cols-3 gap-4">
          {room.puzzles.map((puzzle, index) => (
            <div
              key={index}
              className={`flex flex-col items-center p-4 rounded-xl border ${
                index < currentPuzzleIndex
                  ? 'bg-green-500/20 border-green-500/30'
                  : index === currentPuzzleIndex
                  ? 'bg-primary/20 border-primary/30 ring-2 ring-primary'
                  : 'bg-muted/30 border-border'
              }`}
            >
              {index < currentPuzzleIndex ? (
                <Unlock className="w-8 h-8 text-green-500" />
              ) : (
                <Lock className={`w-8 h-8 ${index === currentPuzzleIndex ? 'text-primary' : 'text-muted-foreground'}`} />
              )}
              <span className="text-xs mt-2 capitalize">{puzzle.lock_type}</span>
            </div>
          ))}
        </div>

        {/* Current Puzzle */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <LockIcon className="w-6 h-6 text-primary" />
              <span className="capitalize">{currentPuzzle.lock_type} Lock</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">{currentPuzzle.lock_description}</p>
              <p className="text-lg font-medium">{currentPuzzle.puzzle}</p>
            </div>

            {/* Hints */}
            <div className="space-y-3">
              {showHint1 && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-500 mb-1">
                    <Lightbulb className="w-4 h-4" />
                    <span className="text-sm font-medium">Hint 1</span>
                  </div>
                  <p className="text-sm">{currentPuzzle.hint_1}</p>
                </div>
              )}
              {showHint2 && (
                <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-500 mb-1">
                    <Lightbulb className="w-4 h-4" />
                    <span className="text-sm font-medium">Hint 2</span>
                  </div>
                  <p className="text-sm">{currentPuzzle.hint_2}</p>
                </div>
              )}
            </div>

            {/* Answer Input */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  onKeyDown={(e) => e.key === 'Enter' && verifyAnswer()}
                  disabled={isVerifying}
                />
                <Button 
                  onClick={verifyAnswer} 
                  disabled={isVerifying || !userAnswer.trim()}
                >
                  {isVerifying ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Key className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* Feedback */}
              {feedback && !feedback.isCorrect && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <span className="text-sm">{feedback.message}</span>
                </div>
              )}

              {/* Hint Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => useHint(1)}
                  disabled={showHint1}
                  className="gap-2"
                >
                  <Lightbulb className="w-4 h-4" />
                  {showHint1 ? 'Hint 1 Used' : 'Use Hint 1 (-25 pts)'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => useHint(2)}
                  disabled={showHint2 || !showHint1}
                  className="gap-2"
                >
                  <Lightbulb className="w-4 h-4" />
                  {showHint2 ? 'Hint 2 Used' : 'Use Hint 2 (-25 pts)'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exit Button */}
        <div className="flex justify-center">
          <Button variant="ghost" onClick={resetGame} className="text-muted-foreground">
            Exit Room
          </Button>
        </div>
      </div>
    );
  }

  return null;
};
