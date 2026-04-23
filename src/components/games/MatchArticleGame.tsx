import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { matchArticleData } from '@/data/games';
import { Shuffle, Trophy, RotateCcw, CheckCircle2, XCircle } from 'lucide-react';

interface MatchItem {
  id: string;
  content: string;
  type: 'article' | 'right';
  isMatched: boolean;
}

export function MatchArticleGame() {
  const [items, setItems] = useState<MatchItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MatchItem | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [wrongMatch, setWrongMatch] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const initializeGame = () => {
    const articles = matchArticleData.map((item, i) => ({
      id: `article-${i}`,
      content: item.article,
      type: 'article' as const,
      isMatched: false,
    }));

    const rights = matchArticleData.map((item, i) => ({
      id: `right-${i}`,
      content: item.right,
      type: 'right' as const,
      isMatched: false,
    }));

    // Shuffle both arrays
    const shuffledArticles = [...articles].sort(() => Math.random() - 0.5);
    const shuffledRights = [...rights].sort(() => Math.random() - 0.5);

    setItems([...shuffledArticles, ...shuffledRights]);
    setSelectedItem(null);
    setMatchedPairs([]);
    setWrongMatch([]);
    setScore(0);
    setAttempts(0);
    setIsComplete(false);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const handleItemClick = (item: MatchItem) => {
    if (item.isMatched || wrongMatch.length > 0) return;

    if (!selectedItem) {
      setSelectedItem(item);
    } else {
      if (selectedItem.id === item.id) {
        setSelectedItem(null);
        return;
      }

      if (selectedItem.type === item.type) {
        // Same type - can't match
        setSelectedItem(item);
        return;
      }

      setAttempts(attempts + 1);

      // Check if it's a valid match
      const articleIndex = selectedItem.type === 'article' 
        ? parseInt(selectedItem.id.split('-')[1])
        : parseInt(item.id.split('-')[1]);
      const rightIndex = selectedItem.type === 'right'
        ? parseInt(selectedItem.id.split('-')[1])
        : parseInt(item.id.split('-')[1]);

      if (articleIndex === rightIndex) {
        // Correct match!
        const matchedIds = [selectedItem.id, item.id];
        setMatchedPairs([...matchedPairs, ...matchedIds]);
        setItems(items.map(i => 
          matchedIds.includes(i.id) ? { ...i, isMatched: true } : i
        ));
        setScore(score + 1);

        if (matchedPairs.length + 2 === matchArticleData.length * 2) {
          setIsComplete(true);
        }
      } else {
        // Wrong match
        setWrongMatch([selectedItem.id, item.id]);
        setTimeout(() => {
          setWrongMatch([]);
        }, 600);
      }

      setSelectedItem(null);
    }
  };

  if (isComplete) {
    const accuracy = Math.round((score / attempts) * 100);
    
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto rounded-full bg-accent/20 flex items-center justify-center mb-6">
          <Trophy className="w-12 h-12 text-accent" />
        </div>
        <h2 className="text-3xl font-bold mb-2">Well Done!</h2>
        <p className="text-muted-foreground mb-6">
          You matched all {matchArticleData.length} pairs with {accuracy}% accuracy!
        </p>
        <Button onClick={initializeGame} variant="hero">
          <RotateCcw className="w-4 h-4 mr-2" />
          Play Again
        </Button>
      </div>
    );
  }

  const articles = items.filter(i => i.type === 'article');
  const rights = items.filter(i => i.type === 'right');

  return (
    <div className="max-w-4xl mx-auto">
      {/* Game header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">Match the Article</h2>
          <p className="text-muted-foreground">Match each Article with its correct provision</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Matched</p>
            <p className="font-bold text-lg">{score}/{matchArticleData.length}</p>
          </div>
          <Button variant="outline" size="icon" onClick={initializeGame}>
            <Shuffle className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Game board */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Articles column */}
        <div className="space-y-3">
          <h3 className="font-semibold text-muted-foreground mb-4">Articles</h3>
          {articles.map((item) => (
            <GameButton
              key={item.id}
              item={item}
              isSelected={selectedItem?.id === item.id}
              isWrong={wrongMatch.includes(item.id)}
              onClick={() => handleItemClick(item)}
            />
          ))}
        </div>

        {/* Rights column */}
        <div className="space-y-3">
          <h3 className="font-semibold text-muted-foreground mb-4">Provisions</h3>
          {rights.map((item) => (
            <GameButton
              key={item.id}
              item={item}
              isSelected={selectedItem?.id === item.id}
              isWrong={wrongMatch.includes(item.id)}
              onClick={() => handleItemClick(item)}
            />
          ))}
        </div>
      </div>

      {/* Progress */}
      <div className="mt-8">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full gradient-hero transition-all duration-500"
            style={{ width: `${(score / matchArticleData.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function GameButton({
  item,
  isSelected,
  isWrong,
  onClick,
}: {
  item: MatchItem;
  isSelected: boolean;
  isWrong: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={item.isMatched}
      className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 ${
        item.isMatched
          ? 'bg-accent/10 border-accent text-accent opacity-60 cursor-default'
          : isWrong
          ? 'bg-destructive/10 border-destructive animate-wiggle'
          : isSelected
          ? 'bg-primary/10 border-primary shadow-soft'
          : 'bg-card border-border hover:border-primary/50 hover:shadow-card'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium">{item.content}</span>
        {item.isMatched && <CheckCircle2 className="w-5 h-5 text-accent" />}
        {isWrong && <XCircle className="w-5 h-5 text-destructive" />}
      </div>
    </button>
  );
}
