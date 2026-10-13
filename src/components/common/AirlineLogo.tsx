import React from 'react';

interface AirlineLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  variant?: 'light' | 'dark' | 'glass';
  className?: string;
  onClick?: () => void;
}

export const AirlineLogo: React.FC<AirlineLogoProps> = ({
  size = 'md',
  showTagline = true,
  variant = 'dark',
  className = '',
  onClick,
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }[size];

  const titleSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  }[size];

  const badgeSizes = {
    sm: 'text-[9px] px-1 py-0.2',
    md: 'text-[10px] px-1.5 py-0.5',
    lg: 'text-xs px-2 py-0.5',
    xl: 'text-xs px-2.5 py-1',
  }[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-3 select-none ${onClick ? 'cursor-pointer hover:opacity-95' : ''} ${className}`}
      id="aerowings-brand-logo"
    >
      {/* High-Impact Colorful Dynamic Emblem */}
      <div className={`relative ${iconDimensions} rounded-2xl p-0.5 bg-gradient-to-tr from-blue-600 via-indigo-500 to-sky-400 shadow-lg shadow-sky-500/25 flex items-center justify-center shrink-0`}>
        <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center p-1 relative overflow-hidden">
          {/* Subtle colorful aura backdrop */}
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500/30 via-indigo-600/20 to-amber-500/30"></div>
          
          {/* Custom Aerodynamic Dual-Wing Supersonic SVG Logo */}
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full relative z-10 drop-shadow-md"
          >
            <defs>
              <linearGradient id="wingGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="50%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
              <linearGradient id="wingBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>
              <linearGradient id="bodyCyan" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="40%" stopColor="#e0f2fe" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>

            {/* Left Swift Wing (Gold Flare) */}
            <path
              d="M10 34C16 30 20 23 23 16L18 20C13 24 10 29 10 34Z"
              fill="url(#wingGold)"
            />

            {/* Right Swift Wing (Deep Aero Sapphire) */}
            <path
              d="M38 34C32 30 28 23 25 16L30 20C35 24 38 29 38 34Z"
              fill="url(#wingBlue)"
            />

            {/* Center Supersonic Jet Fuselage & Swept Delta */}
            <path
              d="M24 6L28 22L36 29L28 28L26 40L24 37L22 40L20 28L12 29L20 22L24 6Z"
              fill="url(#bodyCyan)"
            />

            {/* Cockpit Canopy Glint */}
            <path
              d="M24 12L25.5 19H22.5L24 12Z"
              fill="#0284c7"
            />

            {/* Radiant Navigation Star Glow */}
            <circle cx="24" cy="7" r="1.5" fill="#38bdf8" />
            <circle cx="24" cy="7" r="3" fill="#38bdf8" opacity="0.4" />
          </svg>
        </div>
      </div>

      {/* Brand Typography */}
      <div>
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-black tracking-tight bg-gradient-to-r from-white via-sky-100 to-sky-300 bg-clip-text text-transparent ${titleSizes}`}>
            AeroWings
          </span>
          <span className={`rounded-md bg-gradient-to-r from-sky-600/30 to-blue-600/30 text-sky-300 border border-sky-400/30 uppercase tracking-widest font-black ${badgeSizes}`}>
            Airways
          </span>
        </div>
        {showTagline && (
          <p className="text-[11px] font-medium text-slate-400 mt-0.5 tracking-wide">
            Fly Beyond Boundaries
          </p>
        )}
      </div>
    </div>
  );
};

export interface AirlineBrandInfo {
  code: string;
  name: string;
  gradient: string;
  textColor: string;
  borderColor: string;
  icon: string;
}

export const AIRLINE_BRANDS: Record<string, AirlineBrandInfo> = {
  AW: { code: 'AW', name: 'AeroWings', gradient: 'from-blue-600 via-indigo-600 to-sky-500', textColor: 'text-sky-300', borderColor: 'border-sky-400/40', icon: '✈️' },
  UK: { code: 'UK', name: 'Vistara', gradient: 'from-purple-900 via-fuchsia-900 to-amber-700', textColor: 'text-amber-200', borderColor: 'border-amber-400/40', icon: '👑' },
  IT: { code: 'IT', name: 'Kingfisher Airlines', gradient: 'from-red-700 via-red-800 to-amber-600', textColor: 'text-amber-300', borderColor: 'border-red-500/50', icon: '🦅' },
  '9W': { code: '9W', name: 'Jet Airways', gradient: 'from-amber-600 via-yellow-600 to-blue-900', textColor: 'text-amber-200', borderColor: 'border-amber-400/50', icon: '☀️' },
  IC: { code: 'IC', name: 'Indian Airlines', gradient: 'from-orange-600 via-amber-600 to-slate-800', textColor: 'text-orange-200', borderColor: 'border-orange-500/40', icon: '☸️' },
  S2: { code: 'S2', name: 'Air Sahara', gradient: 'from-red-800 via-blue-900 to-slate-900', textColor: 'text-rose-200', borderColor: 'border-red-500/40', icon: '⭐' },
  G8: { code: 'G8', name: 'Go First (GoAir)', gradient: 'from-blue-700 via-cyan-700 to-sky-600', textColor: 'text-cyan-200', borderColor: 'border-cyan-400/40', icon: '⚡' },
  I5: { code: 'I5', name: 'AIX Connect', gradient: 'from-rose-700 via-red-700 to-red-900', textColor: 'text-rose-100', borderColor: 'border-rose-400/40', icon: '🔴' },
  LB: { code: 'LB', name: 'Air Costa', gradient: 'from-sky-700 via-blue-800 to-yellow-600', textColor: 'text-amber-200', borderColor: 'border-yellow-400/40', icon: '🌟' },
  DN: { code: 'DN', name: 'Air Deccan', gradient: 'from-yellow-600 via-amber-600 to-blue-800', textColor: 'text-yellow-100', borderColor: 'border-yellow-400/40', icon: '🛩️' },
  D2: { code: 'D2', name: 'Damania Airways', gradient: 'from-amber-700 via-rose-900 to-purple-900', textColor: 'text-amber-200', borderColor: 'border-amber-400/40', icon: '🥂' },
  '4S': { code: '4S', name: 'East-West Airlines', gradient: 'from-emerald-700 via-teal-800 to-blue-900', textColor: 'text-emerald-200', borderColor: 'border-emerald-400/40', icon: '🧭' },
  OD: { code: 'OD', name: 'ModiLuft', gradient: 'from-blue-800 via-indigo-900 to-amber-600', textColor: 'text-amber-200', borderColor: 'border-blue-400/40', icon: '💠' },
  I7: { code: 'I7', name: 'Paramount Airways', gradient: 'from-slate-900 via-red-950 to-amber-700', textColor: 'text-rose-200', borderColor: 'border-amber-500/40', icon: '💼' },
  '2T': { code: '2T', name: 'TruJet', gradient: 'from-teal-700 via-cyan-800 to-orange-700', textColor: 'text-teal-200', borderColor: 'border-teal-400/40', icon: '🦚' },
  '9P': { code: '9P', name: 'Air Pegasus', gradient: 'from-sky-600 via-blue-700 to-indigo-900', textColor: 'text-sky-200', borderColor: 'border-sky-400/40', icon: '🐎' },
  '2S': { code: '2S', name: 'Air Carnival', gradient: 'from-rose-600 via-pink-700 to-purple-900', textColor: 'text-pink-200', borderColor: 'border-pink-400/40', icon: '🎪' },
  '6O': { code: '6O', name: 'Air Odisha', gradient: 'from-amber-700 via-orange-800 to-slate-900', textColor: 'text-orange-200', borderColor: 'border-orange-400/40', icon: '🌊' },
  M9: { code: 'M9', name: 'Air Mantra', gradient: 'from-cyan-800 via-blue-900 to-indigo-950', textColor: 'text-cyan-200', borderColor: 'border-cyan-400/40', icon: '✨' },
  KW: { code: 'KW', name: 'Archana Airways', gradient: 'from-emerald-800 via-green-900 to-amber-700', textColor: 'text-emerald-200', borderColor: 'border-emerald-400/40', icon: '🏔️' },
  D5: { code: 'D5', name: 'NEPC Airlines', gradient: 'from-teal-800 via-emerald-900 to-slate-900', textColor: 'text-teal-200', borderColor: 'border-teal-400/40', icon: '🍃' },
  V5: { code: 'V5', name: 'Vayudoot', gradient: 'from-blue-700 via-sky-800 to-slate-800', textColor: 'text-sky-200', borderColor: 'border-sky-300/40', icon: '🕊️' },
  ZO: { code: 'ZO', name: 'Zooom Air', gradient: 'from-neutral-900 via-zinc-800 to-orange-600', textColor: 'text-orange-300', borderColor: 'border-orange-500/50', icon: '🚀' },
  '6E': { code: '6E', name: 'IndiGo Airlines', gradient: 'from-blue-700 to-sky-500', textColor: 'text-sky-200', borderColor: 'border-blue-400/40', icon: '✈️' },
  AI: { code: 'AI', name: 'Air India', gradient: 'from-red-700 to-amber-600', textColor: 'text-amber-200', borderColor: 'border-red-400/40', icon: '🪔' },
  QP: { code: 'QP', name: 'Akasa Air', gradient: 'from-orange-600 to-purple-800', textColor: 'text-orange-200', borderColor: 'border-orange-400/40', icon: '🧡' },
  EK: { code: 'EK', name: 'Emirates', gradient: 'from-red-800 to-neutral-900', textColor: 'text-amber-300', borderColor: 'border-red-500/40', icon: '🌍' },
  BA: { code: 'BA', name: 'British Airways', gradient: 'from-blue-900 to-red-800', textColor: 'text-sky-200', borderColor: 'border-blue-400/40', icon: '🇬🇧' },
  SQ: { code: 'SQ', name: 'Singapore Airlines', gradient: 'from-amber-600 to-blue-900', textColor: 'text-amber-200', borderColor: 'border-amber-400/40', icon: '🇸🇬' },
  LH: { code: 'LH', name: 'Lufthansa', gradient: 'from-yellow-600 to-blue-950', textColor: 'text-yellow-200', borderColor: 'border-yellow-400/40', icon: '🇩🇪' },
  QR: { code: 'QR', name: 'Qatar Airways', gradient: 'from-purple-950 to-rose-900', textColor: 'text-rose-200', borderColor: 'border-purple-400/40', icon: '🇶🇦' }
};

export const AirlineBrandBadge: React.FC<{ code: string; name?: string; className?: string }> = ({
  code,
  name,
  className = ''
}) => {
  const brand = AIRLINE_BRANDS[code.toUpperCase()] || {
    code: code || 'AW',
    name: name || code || 'AeroWings',
    gradient: 'from-blue-600 via-indigo-600 to-sky-500',
    textColor: 'text-sky-300',
    borderColor: 'border-sky-400/40',
    icon: '✈️'
  };

  return (
    <div
      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${brand.gradient} border ${brand.borderColor} flex items-center justify-center font-black text-xs text-white shadow-md shrink-0 relative overflow-hidden ${className}`}
      title={name || brand.name}
    >
      <span className="relative z-10 font-mono tracking-wider drop-shadow-sm">{brand.code}</span>
      <span className="absolute -bottom-1 -right-1 text-[10px] opacity-40 select-none">{brand.icon}</span>
    </div>
  );
};

