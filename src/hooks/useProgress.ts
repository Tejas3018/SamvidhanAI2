import { useState, useEffect, useCallback } from 'react';
import { UserProgress } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

const STORAGE_KEY = 'constitution-learning-progress';
const SESSION_KEY = 'constitution-session-id';

const defaultProgress: UserProgress = {
  currentLevel: 1,
  totalXP: 0,
  completedLevels: [],
  earnedBadges: [],
  quizScores: {}
};

// Generate or retrieve session ID for anonymous users
const getSessionId = (): string => {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
};

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(defaultProgress);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const newUser = session?.user ?? null;
        setCurrentUser(newUser);
        
        // Reset progress state when user changes to trigger reload
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          setIsLoaded(false);
          setProgress(defaultProgress);
        }
      }
    );

    // Get initial user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load progress from database based on user or session
  useEffect(() => {
    const loadProgress = async () => {
      try {
        let data = null;
        let error = null;

        if (currentUser) {
          // Logged in user - fetch by user_id
          const result = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', currentUser.id)
            .maybeSingle();
          
          data = result.data;
          error = result.error;

          // If no user-specific progress, check if there's session-based progress to migrate
          if (!data) {
            const sessionId = getSessionId();
            const sessionResult = await supabase
              .from('user_progress')
              .select('*')
              .eq('session_id', sessionId)
              .is('user_id', null)
              .maybeSingle();

            if (sessionResult.data) {
              // Migrate session progress to user
              const { error: updateError } = await supabase
                .from('user_progress')
                .update({ user_id: currentUser.id })
                .eq('id', sessionResult.data.id);

              if (!updateError) {
                data = { ...sessionResult.data, user_id: currentUser.id };
              }
            }
          }
        } else {
          // Anonymous user - fetch by session_id
          const sessionId = getSessionId();
          const result = await supabase
            .from('user_progress')
            .select('*')
            .eq('session_id', sessionId)
            .is('user_id', null)
            .maybeSingle();
          
          data = result.data;
          error = result.error;
        }

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading progress:', error);
        }

        if (data) {
          setProgress({
            currentLevel: data.current_level,
            totalXP: data.total_xp,
            completedLevels: data.completed_levels || [],
            earnedBadges: data.earned_badges || [],
            quizScores: (data.quiz_scores as Record<string, number>) || {}
          });
        } else {
          // Check for legacy localStorage data and migrate
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            try {
              const localProgress = JSON.parse(stored);
              setProgress(localProgress);
              // Migrate to database
              await saveToDatabase(localProgress);
            } catch {
              setProgress(defaultProgress);
            }
          } else {
            setProgress(defaultProgress);
          }
        }
      } catch (err) {
        console.error('Error loading progress:', err);
        // Fallback to localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            setProgress(JSON.parse(stored));
          } catch {
            setProgress(defaultProgress);
          }
        }
      }
      
      setIsLoaded(true);
    };

    loadProgress();
  }, [currentUser]);

  // Save to database
  const saveToDatabase = useCallback(async (progressData: UserProgress) => {
    if (isSyncing) return;
    setIsSyncing(true);
    
    const sessionId = getSessionId();
    
    try {
      const upsertData: {
        session_id: string;
        current_level: number;
        total_xp: number;
        completed_levels: number[];
        earned_badges: string[];
        quiz_scores: Record<string, number>;
        user_id?: string;
      } = {
        session_id: sessionId,
        current_level: progressData.currentLevel,
        total_xp: progressData.totalXP,
        completed_levels: progressData.completedLevels,
        earned_badges: progressData.earnedBadges,
        quiz_scores: progressData.quizScores
      };

      // If user is logged in, include user_id
      if (currentUser) {
        upsertData.user_id = currentUser.id;
      }

      // For logged-in users, upsert by user_id; for anonymous, by session_id
      if (currentUser) {
        // Check if record exists for this user
        const { data: existing } = await supabase
          .from('user_progress')
          .select('id')
          .eq('user_id', currentUser.id)
          .maybeSingle();

        if (existing) {
          // Update existing record
          const { error } = await supabase
            .from('user_progress')
            .update({
              current_level: progressData.currentLevel,
              total_xp: progressData.totalXP,
              completed_levels: progressData.completedLevels,
              earned_badges: progressData.earnedBadges,
              quiz_scores: progressData.quizScores
            })
            .eq('user_id', currentUser.id);

          if (error) {
            console.error('Error updating progress:', error);
          }
        } else {
          // Insert new record
          const { error } = await supabase
            .from('user_progress')
            .insert(upsertData);

          if (error) {
            console.error('Error inserting progress:', error);
          }
        }
      } else {
        // Anonymous user - upsert by session_id
        const { error } = await supabase
          .from('user_progress')
          .upsert(upsertData, {
            onConflict: 'session_id'
          });

        if (error) {
          console.error('Error saving progress:', error);
        }
      }
    } catch (err) {
      console.error('Error saving progress:', err);
    }
    
    setIsSyncing(false);
  }, [isSyncing, currentUser]);

  // Save progress when it changes
  useEffect(() => {
    if (isLoaded) {
      // Save to localStorage as backup
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      // Save to database
      saveToDatabase(progress);
    }
  }, [progress, isLoaded, saveToDatabase]);

  const addXP = (amount: number) => {
    setProgress(prev => ({
      ...prev,
      totalXP: prev.totalXP + amount
    }));
  };

  const completeLevel = (levelId: number, xpReward: number) => {
    setProgress(prev => {
      if (prev.completedLevels.includes(levelId)) {
        return prev;
      }
      return {
        ...prev,
        totalXP: prev.totalXP + xpReward,
        completedLevels: [...prev.completedLevels, levelId],
        currentLevel: Math.max(prev.currentLevel, levelId + 1)
      };
    });
  };

  const saveQuizScore = (levelId: number, score: number) => {
    setProgress(prev => ({
      ...prev,
      quizScores: {
        ...prev.quizScores,
        [levelId]: Math.max(prev.quizScores[levelId] || 0, score)
      }
    }));
  };

  const earnBadge = (badgeId: string) => {
    setProgress(prev => {
      if (prev.earnedBadges.includes(badgeId)) {
        return prev;
      }
      return {
        ...prev,
        earnedBadges: [...prev.earnedBadges, badgeId]
      };
    });
  };

  const isLevelUnlocked = (levelId: number): boolean => {
    if (levelId === 1) return true;
    const previousScore = progress.quizScores[levelId - 1];
    return previousScore !== undefined && previousScore >= 50;
  };

  const isLevelCompleted = (levelId: number): boolean => {
    return progress.completedLevels.includes(levelId);
  };

  const getLevelProgress = (levelId: number): number => {
    const score = progress.quizScores[levelId];
    if (score === undefined) return 0;
    return Math.min(100, score);
  };

  const resetProgress = async () => {
    setProgress(defaultProgress);
    localStorage.removeItem(STORAGE_KEY);
    
    try {
      if (currentUser) {
        await supabase
          .from('user_progress')
          .delete()
          .eq('user_id', currentUser.id);
      } else {
        const sessionId = getSessionId();
        await supabase
          .from('user_progress')
          .delete()
          .eq('session_id', sessionId);
      }
    } catch (err) {
      console.error('Error resetting progress:', err);
    }
  };

  return {
    progress,
    isLoaded,
    isSyncing,
    addXP,
    completeLevel,
    saveQuizScore,
    earnBadge,
    isLevelUnlocked,
    isLevelCompleted,
    getLevelProgress,
    resetProgress
  };
}
