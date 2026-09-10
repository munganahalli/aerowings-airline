import React from 'react';
import { useAirline } from '../../context/AirlineContext';
import { useLanguage } from '../../context/LanguageContext';
import { UserView } from '../../types/airline';
import { 
  Plane, 
  CloudSun, 
  Ticket, 
  Sparkles,
  Radio,
  Tag
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { userView, setUserView, portalMode, bookings } = useAirline();
  const { t } = useLanguage();

  if (portalMode === 'admin') return null;

  const activeBookingsCount = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Checked-in').length;

  const navigateTo = (view: UserView) => {
    setUserView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems: Array<{
    id: string;
    label: string;
    view: UserView;
    icon: React.ReactNode;
    isActive: boolean;
    badge?: number | string;
  }> = [
    {
      id: 'm-nav-home',
      label: t('nav.bookFlight', 'Book'),
      view: 'home',
      icon: <Plane className="w-4 h-4" />,
      isActive: userView === 'home' || userView === 'results' || userView === 'seats' || userView === 'passenger_payment'
    },
    {
      id: 'm-nav-status',
      label: t('nav.flightStatus', 'Status'),
      view: 'flight_status',
      icon: <Radio className="w-4 h-4" />,
      isActive: userView === 'flight_status'
    },
    {
      id: 'm-nav-weather',
      label: t('nav.weatherRadar', 'Weather'),
      view: 'weather_ops',
      icon: <CloudSun className="w-4 h-4" />,
      isActive: userView === 'weather_ops'
    },
    {
      id: 'm-nav-deals',
      label: t('app.specialOffers', 'Deals'),
      view: 'deals',
      icon: <Tag className="w-4 h-4 text-amber-400" />,
      isActive: userView === 'deals'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-amber-500/20 px-2 py-1.5 lg:hidden shadow-2xl">
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <button
            key={item.id}
            id={item.id}
            type="button"
            onClick={() => navigateTo(item.view)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative cursor-pointer min-w-[60px] ${
              item.isActive
                ? 'text-amber-300 bg-amber-500/15 font-bold border border-amber-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              {item.icon}
              {item.badge !== undefined && (
                <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center px-1 shadow-sm">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 whitespace-nowrap">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
