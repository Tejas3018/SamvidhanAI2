import { useState, useEffect, useCallback } from 'react';
import { RevisionSchedule } from '@/types/learning';

const REVISION_STORAGE_KEY = 'samvidhan_revision_schedule';

export function useRevisionSchedule() {
  const [schedules, setSchedules] = useState<RevisionSchedule[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(REVISION_STORAGE_KEY);
    if (stored) {
      try {
        setSchedules(JSON.parse(stored));
      } catch {
        setSchedules([]);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(REVISION_STORAGE_KEY, JSON.stringify(schedules));
    }
  }, [schedules, isLoaded]);

  const scheduleRevisions = useCallback((levelId: number, levelTitle: string, levelIcon: string) => {
    const today = new Date();
    
    const newSchedules: RevisionSchedule[] = [
      {
        id: `rev_${levelId}_1d_${Date.now()}`,
        levelId,
        levelTitle,
        levelIcon,
        scheduledDate: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        type: 'next_day',
        completed: false,
      },
      {
        id: `rev_${levelId}_3d_${Date.now()}`,
        levelId,
        levelTitle,
        levelIcon,
        scheduledDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        type: '3_days',
        completed: false,
      },
      {
        id: `rev_${levelId}_7d_${Date.now()}`,
        levelId,
        levelTitle,
        levelIcon,
        scheduledDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        type: '7_days',
        completed: false,
      },
    ];

    setSchedules(prev => {
      // Remove any existing uncompleted schedules for this level
      const filtered = prev.filter(s => s.levelId !== levelId || s.completed);
      return [...filtered, ...newSchedules];
    });
  }, []);

  const completeRevision = useCallback((revisionId: string, xpEarned: number) => {
    setSchedules(prev =>
      prev.map(s =>
        s.id === revisionId
          ? { ...s, completed: true, completedAt: new Date().toISOString(), xpEarned }
          : s
      )
    );
    return xpEarned;
  }, []);

  const getUpcomingRevisions = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return schedules
      .filter(s => !s.completed && s.scheduledDate <= today)
      .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
  }, [schedules]);

  const getDueRevisions = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return schedules.filter(s => !s.completed && s.scheduledDate <= today);
  }, [schedules]);

  const getOverdueRevisions = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return schedules.filter(s => !s.completed && s.scheduledDate < today);
  }, [schedules]);

  const getPendingRevisions = useCallback(() => {
    return schedules.filter(s => !s.completed);
  }, [schedules]);

  const getScheduledRevisions = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return schedules
      .filter(s => !s.completed)
      .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
  }, [schedules]);

  return {
    schedules,
    isLoaded,
    scheduleRevisions,
    completeRevision,
    getUpcomingRevisions,
    getDueRevisions,
    getOverdueRevisions,
    getPendingRevisions,
    getScheduledRevisions,
  };
}
