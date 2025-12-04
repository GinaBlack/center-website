import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/languageContext'; // Updated to use @/ alias
//import "../styles/languageSwitcher.css"; // Updated to use @/ alias

interface LanguageContextType {
  language: string;
  changeLanguage: (lang: string) => void;
}

const LanguageSwitcher: React.FC = () => {
  const { language, changeLanguage } = useLanguage() as LanguageContextType;
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languageNames: Record<string, string> = {
    en: 'English',
    fr: 'Français'
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageSelect = (lang: string) => {
    changeLanguage(lang);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
  <div className="language-switcher" ref={dropdownRef}>
    <button
      className={isOpen ? "language-dropdown open" : "language-dropdown"}
      onClick={toggleDropdown}
      aria-haspopup="listbox"
      //aria-expanded={isOpen.toString()}
      aria-label={`Select language. Current: ${languageNames[language]}`}
      type="button"
    >
      {languageNames[language]}
    </button>
    
    <div 
      className={isOpen ? "dropdown-options open" : "dropdown-options"} 
      role="listbox"
      aria-label="Language options"
    >
      <div
        className={language === 'en' ? "dropdown-option active" : "dropdown-option"}
        onClick={() => handleLanguageSelect('en')}
        role="option"
        //aria-selected={language === 'en'}
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleLanguageSelect('en')}
      >
        English
      </div>
      <div
        className={language === 'fr' ? "dropdown-option active" : "dropdown-option"}
        onClick={() => handleLanguageSelect('fr')}
        role="option"
        //aria-selected={language === 'fr'}
        tabIndex={0}
      >
        Français
      </div>
    </div>
  </div>
);
}

export default LanguageSwitcher;