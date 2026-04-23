import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'amendment-progress';

interface AmendmentProgress {
  exploredIds: number[];
}

export function useAmendmentProgress() {
  const [progress, setProgress] = useState<AmendmentProgress>({ exploredIds: [] });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setProgress(JSON.parse(stored));
      } catch {
        setProgress({ exploredIds: [] });
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }
  }, [progress, isLoaded]);

  const markExplored = useCallback((amendmentId: number) => {
    setProgress((prev) => {
      if (prev.exploredIds.includes(amendmentId)) return prev;
      return { exploredIds: [...prev.exploredIds, amendmentId] };
    });
  }, []);

  const isExplored = useCallback((amendmentId: number) => {
    return progress.exploredIds.includes(amendmentId);
  }, [progress.exploredIds]);

  const resetProgress = useCallback(() => {
    setProgress({ exploredIds: [] });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    exploredCount: progress.exploredIds.length,
    markExplored,
    isExplored,
    resetProgress,
    isLoaded,
  };
}
