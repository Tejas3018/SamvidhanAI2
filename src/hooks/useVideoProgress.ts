import { useState, useEffect, useCallback } from 'react';
import { VideoProgress } from '@/types/learning';

const VIDEO_PROGRESS_KEY = 'samvidhan_video_progress';

export function useVideoProgress() {
  const [videoProgress, setVideoProgress] = useState<VideoProgress[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(VIDEO_PROGRESS_KEY);
    if (stored) {
      try {
        setVideoProgress(JSON.parse(stored));
      } catch {
        setVideoProgress([]);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(VIDEO_PROGRESS_KEY, JSON.stringify(videoProgress));
    }
  }, [videoProgress, isLoaded]);

  const markVideoWatched = useCallback((videoId: string, levelId: number) => {
    setVideoProgress(prev => {
      const existing = prev.find(v => v.videoId === videoId);
      if (existing) {
        return prev.map(v =>
          v.videoId === videoId
            ? { ...v, watched: true, watchedAt: new Date().toISOString() }
            : v
        );
      }
      return [
        ...prev,
        {
          videoId,
          levelId,
          watched: true,
          understood: false,
          watchedAt: new Date().toISOString(),
        },
      ];
    });
  }, []);

  const markVideoUnderstood = useCallback((videoId: string, levelId: number, microCheckAnswer: number) => {
    setVideoProgress(prev => {
      const existing = prev.find(v => v.videoId === videoId);
      if (existing) {
        return prev.map(v =>
          v.videoId === videoId
            ? { ...v, understood: true, microCheckAnswer }
            : v
        );
      }
      return [
        ...prev,
        {
          videoId,
          levelId,
          watched: true,
          understood: true,
          watchedAt: new Date().toISOString(),
          microCheckAnswer,
        },
      ];
    });
  }, []);

  const getVideoStatus = useCallback((videoId: string) => {
    return videoProgress.find(v => v.videoId === videoId);
  }, [videoProgress]);

  const getLevelVideoProgress = useCallback((levelId: number) => {
    return videoProgress.filter(v => v.levelId === levelId);
  }, [videoProgress]);

  const getUnderstoodCount = useCallback((levelId: number) => {
    return videoProgress.filter(v => v.levelId === levelId && v.understood).length;
  }, [videoProgress]);

  return {
    videoProgress,
    isLoaded,
    markVideoWatched,
    markVideoUnderstood,
    getVideoStatus,
    getLevelVideoProgress,
    getUnderstoodCount,
  };
}
