import { useState, useEffect, useCallback } from 'react';
import { WeakTopic } from '@/types/learning';

const WEAK_TOPICS_KEY = 'samvidhan_weak_topics';

export function useWeakTopics() {
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(WEAK_TOPICS_KEY);
    if (stored) {
      try {
        setWeakTopics(JSON.parse(stored));
      } catch {
        setWeakTopics([]);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(WEAK_TOPICS_KEY, JSON.stringify(weakTopics));
    }
  }, [weakTopics, isLoaded]);

  const recordAnswer = useCallback((
    topic: string,
    levelId: number,
    isCorrect: boolean,
    articleReference?: string
  ) => {
    setWeakTopics(prev => {
      const existing = prev.find(t => t.topic === topic && t.levelId === levelId);
      
      if (existing) {
        const newIncorrectCount = isCorrect ? existing.incorrectCount : existing.incorrectCount + 1;
        const newTotalAttempts = existing.totalAttempts + 1;
        const accuracy = (newTotalAttempts - newIncorrectCount) / newTotalAttempts;
        
        // Mark as mastered if accuracy is above 80% with at least 3 attempts
        const mastered = accuracy >= 0.8 && newTotalAttempts >= 3;

        return prev.map(t =>
          t.topic === topic && t.levelId === levelId
            ? {
                ...t,
                incorrectCount: newIncorrectCount,
                totalAttempts: newTotalAttempts,
                lastIncorrect: isCorrect ? t.lastIncorrect : new Date().toISOString(),
                mastered,
              }
            : t
        );
      } else if (!isCorrect) {
        // Only add new topic if answer was incorrect
        return [
          ...prev,
          {
            topic,
            articleReference,
            levelId,
            incorrectCount: 1,
            totalAttempts: 1,
            lastIncorrect: new Date().toISOString(),
            mastered: false,
          },
        ];
      }
      
      return prev;
    });
  }, []);

  const getTopWeakTopics = useCallback((limit: number = 5) => {
    return weakTopics
      .filter(t => !t.mastered)
      .sort((a, b) => {
        const aAccuracy = (a.totalAttempts - a.incorrectCount) / a.totalAttempts;
        const bAccuracy = (b.totalAttempts - b.incorrectCount) / b.totalAttempts;
        return aAccuracy - bAccuracy; // Lower accuracy = weaker
      })
      .slice(0, limit);
  }, [weakTopics]);

  const getWeakTopicsForLevel = useCallback((levelId: number) => {
    return weakTopics.filter(t => t.levelId === levelId && !t.mastered);
  }, [weakTopics]);

  const getTopicAccuracy = useCallback((topic: string, levelId: number) => {
    const found = weakTopics.find(t => t.topic === topic && t.levelId === levelId);
    if (!found || found.totalAttempts === 0) return null;
    return ((found.totalAttempts - found.incorrectCount) / found.totalAttempts) * 100;
  }, [weakTopics]);

  const hasWeakTopics = weakTopics.filter(t => !t.mastered).length > 0;

  return {
    weakTopics,
    isLoaded,
    recordAnswer,
    getTopWeakTopics,
    getWeakTopicsForLevel,
    getTopicAccuracy,
    hasWeakTopics,
  };
}
