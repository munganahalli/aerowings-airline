import React, { useState } from 'react';
import { useAirline } from '../../context/AirlineContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Plane, 
  Shield, 
  User, 
  Luggage, 
  Radio, 
  Globe, 
  Ticket, 
  HelpCircle, 
  Menu, 
  X, 
  Sparkles, 
  Crown, 
  Tag, 
  Calendar, 
  Building2,
  ChevronDown,
  CloudSun,
  Mic,
  MicOff,
  Zap
} from 'lucide-react';
import { AirlineLogo } from './AirlineLogo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { CURRENCIES } from '../../utils/airlineUtils';
import { Currency, UserView } from '../../types/airline';

export const Navbar: React.FC = () => {
  const {
    portalMode,
    setPortalMode,
    userView,
    setUserView,
    currency,
    setCurrency,
    userProfile,
    bookings,
    isVoiceModeActive,
    toggleVoiceMode,
  } = useAirline();

  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeBookingsCount = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Checked-in').length;

  const navigateTo = (view: UserView) => {
    setUserView(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
      {/* Top micro-bar for global status, language switcher, and currency */}
      <div className="bg-slate-950 px-3 sm:px-6 py-1 text-xs border-b border-slate-800/80 flex justify-between items-center text-slate-400 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 truncate">
          <span className="flex items-center gap-1.5 text-slate-300 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] font-semibold text-emerald-300">{t('app.activeNetwork')}</span>
          </span>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <button 
            type="button"
            onClick={() => navigateTo('deals')} 
            className="hidden lg:flex items-center gap-1 text-[11px] text-amber-300 hover:text-amber-200 cursor-pointer"
          >
            <Tag className="w-3 h-3" />
            <span>{t('app.specialOffers')}</span>
          </button>

          {/* Multi-Language Switcher */}
          <LanguageSwitcher compact />

          {/* Currency Selector */}
          <div className="flex items-center gap-1 text-slate-300">
            <select
              id="currency-selector"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency['code'])}
              aria-label="Currency"
              className="bg-slate-900 text-slate-200 border border-slate-700 rounded px-1.5 py-0.5 text-[11px] sm:text-xs focus:outline-none focus:border-blue-500 cursor-pointer font-medium"
            >
              {Object.keys(CURRENCIES).map((code) => (
                <option key={code} value={code}>
                  {code} ({CURRENCIES[code as Currency['code']].symbol})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Brand Logo */}
          <div className="shrink-0">
            <AirlineLogo
              size="md"
              onClick={() => {
                if (portalMode === 'user') navigateTo('home');
              }}
            />
          </div>

          {/* Tablet & Desktop Navigation Bar */}
          {portalMode === 'user' ? (
            <nav className="hidden md:flex items-center gap-1.5 lg:gap-2 overflow-x-auto no-scrollbar py-1">
              <button
                id="nav-flight-status"
                onClick={() => navigateTo('flight_status')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  userView === 'flight_status'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>{t('nav.flightStatus')}</span>
              </button>

              <button
                onClick={() => navigateTo('loyalty')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  userView === 'loyalty'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-300 hover:text-amber-300 hover:bg-slate-800/80'
                }`}
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('nav.loyaltyClub')}</span>
              </button>

              <button
                onClick={() => navigateTo('deals')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  userView === 'deals'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                {t('app.specialOffers')}
              </button>

              <button
                onClick={() => navigateTo('experience')}
                className={`hidden lg:flex px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  userView === 'experience'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                {t('nav.experience')}
              </button>

              <button
                onClick={() => navigateTo('timetable')}
                className={`hidden xl:flex px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  userView === 'timetable'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                {t('nav.timetable')}
              </button>
            </nav>
          ) : null}

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Hands-Free AI Voice Mode Toggle */}
            <button
              id="nav-ai-voice-mode-toggle"
              type="button"
              onClick={toggleVoiceMode}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md ${
                isVoiceModeActive
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 text-white border border-sky-400 ring-2 ring-sky-500/30 animate-pulse'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-sky-300 border border-blue-500/30 hover:border-blue-500/60'
              }`}
              title="Toggle hands-free speech-only AI Voice Booking Mode"
            >
              {isVoiceModeActive ? (
                <>
                  <Mic className="w-3.5 h-3.5 text-white animate-bounce" />
                  <span className="font-extrabold tracking-wide">AI Voice Active</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5 text-sky-400" />
                  <span className="hidden sm:inline">AI Voice Mode</span>
                  <span className="sm:hidden">Voice</span>
                  <span className="hidden md:inline px-1.5 py-0.2 rounded text-[9px] bg-blue-500/20 text-sky-300 border border-blue-500/30 font-mono">
                    Hands-Free
                  </span>
                </>
              )}
            </button>



            {/* Mobile & Tablet Drawer Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Full Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-slate-950 border-b border-slate-800 px-4 pt-3 pb-6 space-y-3 animate-fadeIn text-xs max-h-[85vh] overflow-y-auto">
          {/* Language & Currency in Drawer */}
          <div className="flex items-center justify-between bg-slate-900 p-3 rounded-2xl border border-slate-800">
            <span className="text-slate-400 text-xs font-semibold">{t('app.language')}:</span>
            <LanguageSwitcher />
          </div>

          {/* Primary View Grid */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">Navigation</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => navigateTo('home')}
                className={`p-2.5 rounded-xl text-left font-semibold border transition-all ${
                  userView === 'home' ? 'bg-blue-600/30 border-blue-500 text-blue-300' : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                ✈️ {t('nav.bookFlight')}
              </button>

              <button
                onClick={() => navigateTo('weather_ops')}
                className={`p-2.5 rounded-xl text-left font-semibold border transition-all ${
                  userView === 'weather_ops' ? 'bg-sky-600/30 border-sky-500 text-sky-300' : 'bg-slate-900 border-slate-800 text-sky-400'
                }`}
              >
                🌦️ {t('nav.weatherRadar')}
              </button>

              <button
                onClick={() => navigateTo('visa_advisor')}
                className={`p-2.5 rounded-xl text-left font-semibold border transition-all ${
                  userView === 'visa_advisor' ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300' : 'bg-slate-900 border-slate-800 text-emerald-400'
                }`}
              >
                🛂 {t('nav.visaAdvisor')}
              </button>

              <button
                onClick={() => navigateTo('flight_status')}
                className={`p-2.5 rounded-xl text-left font-semibold border transition-all ${
                  userView === 'flight_status' ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                📡 {t('nav.flightStatus')}
              </button>

              <button
                onClick={() => navigateTo('deals')}
                className={`p-2.5 rounded-xl text-left font-semibold border transition-all ${
                  userView === 'deals' ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-slate-900 border-slate-800 text-amber-300'
                }`}
              >
                🏷️ {t('app.specialOffers')}
              </button>
            </div>
          </div>

          {/* Services & Guides */}
          <div className="space-y-1 pt-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">Services & Fleet</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => navigateTo('loyalty')}
                className="p-2.5 rounded-xl text-left font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              >
                👑 {t('nav.loyaltyClub')}
              </button>
              <button
                onClick={() => navigateTo('experience')}
                className="p-2.5 rounded-xl text-left font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              >
                🛫 {t('nav.experience')}
              </button>
              <button
                onClick={() => navigateTo('baggage_guide')}
                className="p-2.5 rounded-xl text-left font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              >
                🧳 {t('nav.baggageGuide')}
              </button>
              <button
                onClick={() => navigateTo('timetable')}
                className="p-2.5 rounded-xl text-left font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              >
                📅 {t('nav.timetable')}
              </button>
            </div>
          </div>

          {/* Language Switcher in Mobile Menu */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-slate-400">{t('app.language')}:</span>
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </header>
  );
};
