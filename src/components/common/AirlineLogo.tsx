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
