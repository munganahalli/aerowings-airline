import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown, Volume2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { SupportedLanguage } from '../../i18n/translations';
import { aiVoice } from '../../utils/aiVoice';

interface LanguageSwitcherProps {
  compact?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ compact = false }) => {
  const { language, setLanguage, languages, currentLanguageOption } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLanguage = (code: SupportedLanguage) => {
    setLanguage(code);
    setIsOpen(false);
    try {
      window.dispatchEvent(new CustomEvent('aerowings_ai_language_sync', { detail: code }));
    } catch {}
    const greeting = aiVoice.getLocalizedGreeting(code as any);
    aiVoice.speak(greeting, true, code as any);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-1.5 ${
          compact ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'
        } rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-amber-500/30 font-medium text-slate-100 transition-all cursor-pointer shadow-sm`}
        aria-label="Select Website and Voice AI Language"
        title="Translate Website & AI Voice (13 Regional & Global Languages)"
      >
        <Globe className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-sm leading-none">{currentLanguageOption.flag}</span>
        <span className="font-semibold text-amber-300">{currentLanguageOption.nativeName}</span>
        <Volume2 className="w-3 h-3 text-sky-400" />
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 border-b border-slate-800 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Website & Voice Language
            </span>
            <Volume2 className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="max-h-72 overflow-y-auto py-1">
            {languages.map((lang) => {
              const isSelected = lang.code === language;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600/20 text-sky-400 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base leading-none">{lang.flag}</span>
                    <div className="text-left">
                      <div className="font-bold leading-tight">{lang.nativeName}</div>
                      <div className="text-[10px] text-slate-500">{lang.name}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-sky-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
