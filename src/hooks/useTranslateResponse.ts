import { useCallback, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

export function useTranslateResponse() {
  const { language } = useLanguage();
  const [isTranslating, setIsTranslating] = useState(false);

  const translateText = useCallback(async (text: string): Promise<string> => {
    if (language === 'en' || !text) return text;

    setIsTranslating(true);
    try {
      const { data, error } = await supabase.functions.invoke('translate-content', {
        body: { content: text, targetLanguage: language },
      });
      if (error) throw error;
      return data?.translated || text;
    } catch (err) {
      console.error('Translation failed:', err);
      return text;
    } finally {
      setIsTranslating(false);
    }
  }, [language]);

  const translateObject = useCallback(async <T extends Record<string, any>>(
    obj: T,
    keys: (keyof T)[]
  ): Promise<T> => {
    if (language === 'en') return obj;

    setIsTranslating(true);
    try {
      const toTranslate: Record<string, string> = {};
      for (const key of keys) {
        if (typeof obj[key] === 'string') {
          toTranslate[key as string] = obj[key] as string;
        }
      }

      if (Object.keys(toTranslate).length === 0) return obj;

      const { data, error } = await supabase.functions.invoke('translate-content', {
        body: { content: toTranslate, targetLanguage: language },
      });
      if (error) throw error;

      const result = { ...obj };
      if (data?.translated) {
        for (const key of Object.keys(data.translated)) {
          (result as any)[key] = data.translated[key];
        }
      }
      return result;
    } catch (err) {
      console.error('Translation failed:', err);
      return obj;
    } finally {
      setIsTranslating(false);
    }
  }, [language]);

  return { translateText, translateObject, isTranslating };
}
