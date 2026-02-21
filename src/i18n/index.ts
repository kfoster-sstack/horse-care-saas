import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import en from './locales/en';
import es from './locales/es';

export type Language = 'en' | 'es';

export type TranslationKeys = typeof en;

const translations: Record<Language, TranslationKeys> = {
  en,
  es,
};

interface I18nState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

// Helper to get nested value from object using dot notation
function getNestedValue(obj: any, path: string): string | undefined {
  return path.split('.').reduce((acc, part) => acc?.[part], obj);
}

export const useI18n = create<I18nState>()(
  persist(
    (set, get) => ({
      language: 'en',

      setLanguage: (lang: Language) => set({ language: lang }),

      t: (key: string, params?: Record<string, string | number>): string => {
        const { language } = get();
        const translation = getNestedValue(translations[language], key);

        if (!translation) {
          // Fallback to English if key not found
          const fallback = getNestedValue(translations.en, key);
          if (!fallback) {
            console.warn(`Translation key not found: ${key}`);
            return key;
          }
          return interpolate(fallback, params);
        }

        return interpolate(translation, params);
      },
    }),
    {
      name: 'horse-care-i18n',
    }
  )
);

// Helper to interpolate params into translation strings
function interpolate(str: string, params?: Record<string, string | number>): string {
  if (!params) return str;

  return Object.entries(params).reduce((acc, [key, value]) => {
    return acc.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
  }, str);
}

// Hook for easier usage in components
export function useTranslation() {
  const { language, setLanguage, t } = useI18n();
  return { language, setLanguage, t };
}
