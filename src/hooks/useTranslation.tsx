import { useLanguage } from '../contexts/languageContext';

// Import translation files
import enTranslations from '../translations/en.json';
import frTranslations from '../translations/fr.json';

const translations = {
  en: enTranslations,
  fr: frTranslations
};

export const useTranslation = () => {
  const { language } = useLanguage() as { language: keyof typeof translations };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return (value as string) || key; // Return the key if translation not found
  };

  return { t };
};