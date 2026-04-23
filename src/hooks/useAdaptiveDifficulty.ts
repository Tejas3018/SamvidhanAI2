import { useState, useEffect, useCallback } from 'react';
import { AdaptiveDifficultySettings } from '@/types/learning';

const DIFFICULTY_KEY = 'samvidhan_adaptive_difficulty';
const SCORE_HISTORY_LENGTH = 5;

const defaultSettings: AdaptiveDifficultySettings = {
  level: 'normal',
  recentScores: [],
  adjustedAt: new Date().toISOString(),
};

export function useAdaptiveDifficulty() {
  const [settings, setSettings] = useState<AdaptiveDifficultySettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(DIFFICULTY_KEY);
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch {
        setSettings(defaultSettings);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(DIFFICULTY_KEY, JSON.stringify(settings));
    }
  }, [settings, isLoaded]);

  const recordScore = useCallback((score: number) => {
    setSettings(prev => {
      const newScores = [score, ...prev.recentScores].slice(0, SCORE_HISTORY_LENGTH);
      const avgScore = newScores.reduce((a, b) => a + b, 0) / newScores.length;
      
      let newLevel: 'easy' | 'normal' | 'hard' = 'normal';
      
      if (avgScore < 50) {
        newLevel = 'easy';
      } else if (avgScore >= 80) {
        newLevel = 'hard';
      } else {
        newLevel = 'normal';
      }

      return {
        level: newLevel,
        recentScores: newScores,
        adjustedAt: new Date().toISOString(),
      };
    });
  }, []);

  const getCurrentDifficulty = useCallback(() => {
    return settings.level;
  }, [settings]);

  const getAverageScore = useCallback(() => {
    if (settings.recentScores.length === 0) return null;
    return Math.round(settings.recentScores.reduce((a, b) => a + b, 0) / settings.recentScores.length);
  }, [settings]);

  const getDifficultyLabel = useCallback(() => {
    switch (settings.level) {
      case 'easy':
        return { label: 'Beginner', color: 'text-accent', description: 'More hints, simpler questions' };
      case 'hard':
        return { label: 'Advanced', color: 'text-gold', description: 'Scenario-based, complex reasoning' };
      default:
        return { label: 'Intermediate', color: 'text-primary', description: 'Balanced challenge' };
    }
  }, [settings]);

  const getQuestionDistribution = useCallback(() => {
    switch (settings.level) {
      case 'easy':
        return { factual: 70, scenario: 20, explanation: 10 };
      case 'hard':
        return { factual: 30, scenario: 50, explanation: 20 };
      default:
        return { factual: 50, scenario: 35, explanation: 15 };
    }
  }, [settings]);

  return {
    settings,
    isLoaded,
    recordScore,
    getCurrentDifficulty,
    getAverageScore,
    getDifficultyLabel,
    getQuestionDistribution,
  };
}
