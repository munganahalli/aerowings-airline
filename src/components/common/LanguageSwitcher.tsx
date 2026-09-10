import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { SupportedLanguage } from '../../i18n/translations';

interface LanguageSwitcherProps {
  compact?: boolean;
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ compact = false, className = '' }) => {
  const { language, setLanguage, languages, currentLanguageOption } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: SupportedLanguage) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        id="language-switcher-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 text-[11px] sm:text-xs font-medium cursor-pointer transition-colors"
        aria-label="Select website language"
        title="Select website language"
      >
        <span className="text-xs">{currentLanguageOption.flag}</span>
        <Globe className="w-3 h-3 text-slate-400" />
        <span className="font-semibold uppercase tracking-wider">{language}</span>
        {!compact && (
          <span className="hidden sm:inline text-slate-300 font-normal">
            {currentLanguageOption.nativeName}
          </span>
        )}
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl py-1 z-50 animate-fadeIn text-xs">
          <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-800 flex items-center gap-1.5">
            <Globe className="w-3 h-3 text-blue-400" />
            <span>Select Language</span>
          </div>

          <div className="py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelect(lang.code)}
                className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-800 transition-colors cursor-pointer ${
                  language === lang.code ? 'text-blue-400 font-bold bg-blue-950/40' : 'text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none">{lang.flag}</span>
                  <div>
                    <div className="text-xs">{lang.nativeName}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{lang.name}</div>
                  </div>
                </div>
                {language === lang.code && <Check className="w-3.5 h-3.5 text-blue-400" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
