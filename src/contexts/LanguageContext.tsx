import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { en } from '@/i18n/en';
import { supabase } from '@/integrations/supabase/client';

const CACHE_VERSION = 'v1';
const STORAGE_KEY = 'app-language';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
  isTranslating: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => en[key] || key,
  isTranslating: false,
});

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'en';
    } catch {
      return 'en';
    }
  });
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);

  const getCacheKey = (lang: string) => `ui-translations-${lang}-${CACHE_VERSION}`;

  const loadTranslations = useCallback(async (lang: string) => {
    if (lang === 'en') {
      setTranslations({});
      return;
    }

    // Check cache
    try {
      const cached = localStorage.getItem(getCacheKey(lang));
      if (cached) {
        setTranslations(JSON.parse(cached));
        return;
      }
    } catch {}

    // Fetch from edge function
    setIsTranslating(true);
    try {
      const { data, error } = await supabase.functions.invoke('translate-ui', {
        body: { keys: en, targetLanguage: lang },
      });

      if (error) throw error;

      if (data?.translations) {
        setTranslations(data.translations);
        try {
          localStorage.setItem(getCacheKey(lang), JSON.stringify(data.translations));
        } catch {}
      }
    } catch (err) {
      console.error('Failed to load UI translations:', err);
      // Fall back to English
      setTranslations({});
    } finally {
      setIsTranslating(false);
    }
  }, []);

  const setLanguage = useCallback((lang: string) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {}
    loadTranslations(lang);
  }, [loadTranslations]);

  // Load translations on mount if non-English
  useEffect(() => {
    if (language !== 'en') {
      loadTranslations(language);
    }
  }, []);

  const t = useCallback((key: string): string => {
    if (language === 'en') {
      return en[key] || key;
    }
    return translations[key] || en[key] || key;
  }, [language, translations]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isTranslating }}>
      {children}
    </LanguageContext.Provider>
  );
}
