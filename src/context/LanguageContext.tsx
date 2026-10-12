import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupportedLanguage, SUPPORTED_LANGUAGES, TRANSLATIONS, LanguageOption } from '../i18n/translations';
import { aiVoice } from '../utils/aiVoice';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, fallback?: string) => string;
  languages: LanguageOption[];
  currentLanguageOption: LanguageOption;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'aerowings_selected_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
        return saved as SupportedLanguage;
      }
    } catch {
      // ignore
    }
    return 'en';
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.lang = lang;
      aiVoice.setLanguage(lang as any);
      window.dispatchEvent(new CustomEvent('aerowings_website_language_sync', { detail: lang }));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
    aiVoice.setLanguage(language as any);
  }, [language]);

  useEffect(() => {
    const handleAiLangSync = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const newLang = customEvent.detail;
      if (newLang && SUPPORTED_LANGUAGES.some((l) => l.code === newLang)) {
        setLanguageState(newLang as SupportedLanguage);
        try {
          localStorage.setItem(STORAGE_KEY, newLang);
          document.documentElement.lang = newLang;
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('aerowings_ai_language_sync', handleAiLangSync);
    return () => window.removeEventListener('aerowings_ai_language_sync', handleAiLangSync);
  }, []);

  const t = (key: string, fallback?: string): string => {
    const langDict = TRANSLATIONS[language];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    if (TRANSLATIONS.en && TRANSLATIONS.en[key]) {
      return TRANSLATIONS.en[key];
    }
    if (fallback) {
      return fallback;
    }
    // Automatic self-healing formatter so raw keys like 'nav.flightStatus' never appear on screen
    const rawSegment = key.includes('.') ? key.split('.').pop() || key : key;
    return rawSegment
      .replace(/([A-Z])/g, ' $1')
      .replace(/[_-]+/g, ' ')
      .replace(/^\w/, (c) => c.toUpperCase())
      .trim();
  };

  const currentLanguageOption = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        languages: SUPPORTED_LANGUAGES,
        currentLanguageOption,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
