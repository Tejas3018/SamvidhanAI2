import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, RotateCcw, Calendar, ArrowUp, ArrowDown, Check } from 'lucide-react';

const amendments = [
  { id: 1, name: '1st Amendment', year: 1951, description: 'Added Ninth Schedule, restrictions on fundamental rights' },
  { id: 2, name: '7th Amendment', year: 1956, description: 'Reorganization of states on linguistic basis' },
  { id: 3, name: '42nd Amendment', year: 1976, description: 'Added "Socialist" and "Secular" to Preamble' },
  { id: 4, name: '44th Amendment', year: 1978, description: 'Right to Property removed from Fundamental Rights' },
  { id: 5, name: '73rd Amendment', year: 1992, description: 'Panchayati Raj institutions given constitutional status' },
  { id: 6, name: '86th Amendment', year: 2002, description: 'Right to Education made a Fundamental Right' },
  { id: 7, name: '101st Amendment', year: 2016, description: 'Introduction of GST' },
  { id: 8, name: '103rd Amendment', year: 2019, description: '10% EWS reservation in education and jobs' },
];

interface AmendmentItem {
  id: number;
  name: string;
  year: number;
  description: string;
  position: number;
}

export function TimelineMasterGame() {
  const [items, setItems] = useState<AmendmentItem[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [moves, setMoves] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [correctPositions, setCorrectPositions] = useState<number[]>([]);

  const initializeGame = () => {
    const shuffled = [...amendments]
      .sort(() => Math.random() - 0.5)
      .map((item, index) => ({ ...item, position: index }));
    setItems(shuffled);
    setIsComplete(false);
    setMoves(0);
    setIsChecking(false);
    setCorrectPositions([]);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (isChecking) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;

    const newItems = [...items];
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    newItems.forEach((item, i) => item.position = i);
    
    setItems(newItems);
    setMoves(prev => prev + 1);
  };

  const checkOrder = () => {
    setIsChecking(true);
    
    const correct: number[] = [];
    const sortedByYear = [...amendments].sort((a, b) => a.year - b.year);
    
    items.forEach((item, index) => {
      if (item.id === sortedByYear[index].id) {
        correct.push(item.id);
      }
    });
    
    setCorrectPositions(correct);
    
    if (correct.length === items.length) {
      setIsComplete(true);
    }
  };

  if (isComplete) {
    const efficiency = Math.max(0, 100 - moves * 2);

    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto rounded-full bg-accent/20 flex items-center justify-center mb-6">
          <Trophy className="w-12 h-12 text-accent" />
        </div>
        <h2 className="text-3xl font-bold mb-2">Timeline Master!</h2>
        <p className="text-muted-foreground mb-2">
          You arranged all amendments correctly in {moves} moves!
        </p>
        <p className="text-lg font-semibold text-primary mb-6">
          Efficiency: {efficiency}%
        </p>
        <Button onClick={initializeGame} variant="hero">
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
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Amendment Timeline</h2>
            <p className="text-muted-foreground">Arrange amendments chronologically</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Moves</p>
          <p className="text-2xl font-bold text-primary">{moves}</p>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-muted/50 rounded-xl p-4 mb-6 text-center">
        <p className="text-muted-foreground">
          Use the arrows to arrange amendments from <span className="font-semibold">oldest to newest</span>
        </p>
      </div>

      {/* Timeline items */}
      <div className="space-y-3 mb-6">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 ${
              isChecking
                ? correctPositions.includes(item.id)
                  ? 'bg-accent/20 border-accent'
                  : 'bg-destructive/10 border-destructive'
                : 'bg-card border-border'
            }`}
          >
            <div className="flex flex-col gap-1">
              <button
                onClick={() => moveItem(index, 'up')}
                disabled={index === 0 || isChecking}
                className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => moveItem(index, 'down')}
                disabled={index === items.length - 1 || isChecking}
                className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1">
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
            {isChecking && (
              <div className="text-sm font-bold">
                {correctPositions.includes(item.id) ? (
                  <span className="text-accent">{item.year}</span>
                ) : (
                  <span className="text-destructive">{item.year}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={initializeGame} className="flex-1">
          <RotateCcw className="w-4 h-4 mr-2" />
          Shuffle
        </Button>
        <Button 
          variant="hero" 
          onClick={isChecking ? initializeGame : checkOrder} 
          className="flex-1"
        >
          <Check className="w-4 h-4 mr-2" />
          {isChecking ? 'Try Again' : 'Check Order'}
        </Button>
      </div>
    </div>
  );
}