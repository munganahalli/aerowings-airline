import React, { useState } from 'react';
import { useAirline } from '../../context/AirlineContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Plane, 
  Radio, 
  Ticket, 
  HelpCircle, 
  CloudSun,
  Crown,
  Menu, 
  X
} from 'lucide-react';
import { AirlineLogo } from './AirlineLogo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { CURRENCIES } from '../../utils/airlineUtils';
import { Currency, UserView } from '../../types/airline';

export const Navbar: React.FC = () => {
  const {
    userView,
    setUserView,
    currency,
    setCurrency,
    bookings,
  } = useAirline();

  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeBookingsCount = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Checked-in').length;

  const navigateTo = (view: UserView) => {
    setUserView(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems: Array<{
    id: string;
    label: string;
    view: UserView;
    icon: React.ReactNode;
    isActive: boolean;
    badge?: number;
  }> = [
    {
      id: 'nav-book-flight',
      label: t('nav.bookFlight', 'Book Flight'),
      view: 'home',
      icon: <Plane className="w-4 h-4" />,
      isActive: userView === 'home' || userView === 'results' || userView === 'passengers' || userView === 'seats' || userView === 'payment' || userView === 'confirmation'
    },
    {
      id: 'nav-flight-status',
      label: t('nav.flightStatus', 'Flight Status'),
      view: 'flight_status',
      icon: <Radio className="w-4 h-4 text-emerald-400" />,
      isActive: userView === 'flight_status'
    },
    {
      id: 'nav-my-trips',
      label: t('nav.myTrips', 'My Trips'),
      view: 'dashboard',
      icon: <Ticket className="w-4 h-4" />,
      isActive: userView === 'dashboard',
      badge: activeBookingsCount > 0 ? activeBookingsCount : undefined
    },
    {
      id: 'nav-help-support',
      label: t('nav.helpSupport', 'Help & Support'),
      view: 'help',
      icon: <HelpCircle className="w-4 h-4" />,
      isActive: userView === 'help'
    }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      {/* Top subtle bar for network & currency/language */}
      <div className="bg-slate-950 px-4 sm:px-6 py-1 text-xs border-b border-slate-800/80 flex justify-between items-center text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="text-[11px] text-slate-300 font-medium">AeroWings Global Network Active</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Multi-Language Switcher */}
          <LanguageSwitcher compact />

          {/* Currency Selector */}
          <div className="flex items-center gap-1 text-slate-300">
            <select
              id="currency-selector"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency['code'])}
              aria-label="Currency"
              className="bg-slate-900 text-slate-200 border border-slate-700 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:border-blue-500 cursor-pointer font-medium"
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left section: Brand Logo and Navigation beside AeroWings */}
          <div className="flex items-center gap-6 sm:gap-8">
            <div className="shrink-0">
              <AirlineLogo
                size="md"
                onClick={() => navigateTo('home')}
              />
            </div>

            {/* Top Navigation Links - beside AeroWings */}
            <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  id={item.id}
                  type="button"
                  onClick={() => navigateTo(item.view)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    item.isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Right Action: Web Check-In / My Booking Quick Access & Mobile Toggle */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigateTo('dashboard')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-800 text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
            >
              <Ticket className="w-3.5 h-3.5 text-blue-400" />
              <span>Web Check-In / PNR</span>
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-800 px-4 py-4 space-y-2 animate-fadeIn text-xs">
          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => navigateTo(item.view)}
                className={`w-full flex items-center justify-between p-3 rounded-xl font-semibold transition-colors ${
                  item.isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500 text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 text-xs">{t('app.language')}:</span>
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </header>
  );
};
