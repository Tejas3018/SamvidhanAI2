import { useState, useEffect, useCallback } from 'react';

interface StreakData {
  currentStreak: number;
  lastActivityDate: string | null;
  longestStreak: number;
}

const STREAK_STORAGE_KEY = 'samvidhan_learning_streak';

const getToday = (): string => {
  return new Date().toISOString().split('T')[0];
};

const getYesterday = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
};

const defaultStreak: StreakData = {
  currentStreak: 0,
  lastActivityDate: null,
  longestStreak: 0,
};

export function useLearningStreak() {
  const [streak, setStreak] = useState<StreakData>(defaultStreak);
  const [justIncreased, setJustIncreased] = useState(false);

  // Load streak from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STREAK_STORAGE_KEY);
    if (stored) {
      try {
        const parsed: StreakData = JSON.parse(stored);
        const today = getToday();
        const yesterday = getYesterday();
        
        // Check if streak should be reset
        if (parsed.lastActivityDate && 
            parsed.lastActivityDate !== today && 
            parsed.lastActivityDate !== yesterday) {
          // Streak is broken - reset current streak but keep longest
          setStreak({
            currentStreak: 0,
            lastActivityDate: null,
            longestStreak: parsed.longestStreak,
          });
        } else {
          setStreak(parsed);
        }
      } catch {
        setStreak(defaultStreak);
      }
    }
  }, []);

  // Save streak to localStorage
  useEffect(() => {
    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(streak));
  }, [streak]);

  const recordActivity = useCallback(() => {
    const today = getToday();
    
    setStreak(prev => {
      // Already recorded today
      if (prev.lastActivityDate === today) {
        return prev;
      }

      const yesterday = getYesterday();
      let newStreak = 1;

      // If last activity was yesterday, continue streak
      if (prev.lastActivityDate === yesterday) {
        newStreak = prev.currentStreak + 1;
        setJustIncreased(true);
        setTimeout(() => setJustIncreased(false), 2000);
      }

      return {
        currentStreak: newStreak,
        lastActivityDate: today,
        longestStreak: Math.max(prev.longestStreak, newStreak),
      };
    });
  }, []);

  const isActiveToday = streak.lastActivityDate === getToday();

  return {
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    isActiveToday,
    justIncreased,
    recordActivity,
  };
}
