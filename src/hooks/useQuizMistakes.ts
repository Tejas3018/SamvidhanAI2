import { useState, useEffect, useCallback } from 'react';
import { QuizMistake } from '@/types/learning';

const MISTAKES_KEY = 'samvidhan_quiz_mistakes';
const MAX_MISTAKES = 100; // Limit stored mistakes

export function useQuizMistakes() {
  const [mistakes, setMistakes] = useState<QuizMistake[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(MISTAKES_KEY);
    if (stored) {
      try {
        setMistakes(JSON.parse(stored));
      } catch {
        setMistakes([]);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(MISTAKES_KEY, JSON.stringify(mistakes));
    }
  }, [mistakes, isLoaded]);

  const recordMistake = useCallback((mistake: Omit<QuizMistake, 'timestamp'>) => {
    setMistakes(prev => {
      const newMistake = { ...mistake, timestamp: new Date().toISOString() };
      const updated = [newMistake, ...prev].slice(0, MAX_MISTAKES);
      return updated;
    });
  }, []);

  const getMistakesForLevel = useCallback((levelId: number) => {
    return mistakes.filter(m => m.levelId === levelId);
  }, [mistakes]);

  const getRecentMistakes = useCallback((limit: number = 10) => {
    return mistakes.slice(0, limit);
  }, [mistakes]);

  const getMistakesByTopic = useCallback(() => {
    const topicMap = new Map<string, QuizMistake[]>();
    mistakes.forEach(m => {
      const topic = m.articleReference || 'General';
      if (!topicMap.has(topic)) {
        topicMap.set(topic, []);
      }
      topicMap.get(topic)!.push(m);
    });
    return topicMap;
  }, [mistakes]);

  const clearMistakesForLevel = useCallback((levelId: number) => {
    setMistakes(prev => prev.filter(m => m.levelId !== levelId));
  }, []);

  const hasMistakes = mistakes.length > 0;

  return {
    mistakes,
    isLoaded,
    recordMistake,
    getMistakesForLevel,
    getRecentMistakes,
    getMistakesByTopic,
    clearMistakesForLevel,
    hasMistakes,
  };
}
