import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ScenarioQuestion {
  scenario: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  relatedArticle: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  articleReference?: string;
}

interface LevelQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  articleReference?: string;
}

export function useAIQuestions() {
  const [isLoading, setIsLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translateQuestions = useCallback(async <T extends QuizQuestion | LevelQuestion | ScenarioQuestion>(
    questions: T[],
    targetLanguage: string
  ): Promise<T[]> => {
    if (targetLanguage === 'en' || questions.length === 0) {
      return questions;
    }

    setIsTranslating(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('translate-questions', {
        body: { questions, targetLanguage }
      });

      if (fnError) {
        console.error('Translation function error:', fnError);
        toast.error('Translation failed. Showing questions in English.');
        return questions;
      }

      if (data.translationFailed) {
        toast.error('Translation failed. Showing questions in English.');
        return questions;
      }

      return data.questions as T[];
    } catch (err) {
      console.error('Translation error:', err);
      toast.error('Translation failed. Showing questions in English.');
      return questions;
    } finally {
      setIsTranslating(false);
    }
  }, []);

  const generateLevelQuestions = useCallback(async (
    levelId: number, 
    count: number = 5,
    targetLanguage: string = 'en'
  ): Promise<LevelQuestion[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-questions', {
        body: { type: 'level', levelId, count }
      });

      if (fnError) {
        console.error('Edge function error:', fnError);
        throw new Error(fnError.message || 'Failed to generate questions');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      let questions = data.questions as LevelQuestion[];
      
      // Translate if needed
      if (targetLanguage !== 'en') {
        questions = await translateQuestions(questions, targetLanguage);
      }

      return questions;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate questions';
      setError(message);
      toast.error('Failed to generate AI questions. Using fallback questions.');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [translateQuestions]);

  const generateScenarios = useCallback(async (
    level: string, 
    count: number = 5,
    targetLanguage: string = 'en'
  ): Promise<ScenarioQuestion[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-questions', {
        body: { type: 'scenario', level, count }
      });

      if (fnError) {
        console.error('Edge function error:', fnError);
        throw new Error(fnError.message || 'Failed to generate questions');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      let questions = data.questions as ScenarioQuestion[];
      
      // Translate if needed
      if (targetLanguage !== 'en') {
        questions = await translateQuestions(questions, targetLanguage);
      }

      return questions;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate questions';
      setError(message);
      toast.error('Failed to generate AI questions. Using fallback questions.');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [translateQuestions]);

  const generateQuizQuestions = useCallback(async (
    count: number = 5,
    targetLanguage: string = 'en'
  ): Promise<QuizQuestion[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-questions', {
        body: { type: 'quiz', count }
      });

      if (fnError) {
        console.error('Edge function error:', fnError);
        throw new Error(fnError.message || 'Failed to generate questions');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      let questions = data.questions as QuizQuestion[];
      
      // Translate if needed
      if (targetLanguage !== 'en') {
        questions = await translateQuestions(questions, targetLanguage);
      }

      return questions;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate questions';
      setError(message);
      toast.error('Failed to generate AI questions. Using fallback questions.');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [translateQuestions]);

  return {
    generateLevelQuestions,
    generateScenarios,
    generateQuizQuestions,
    translateQuestions,
    isLoading,
    isTranslating,
    error
  };
}
