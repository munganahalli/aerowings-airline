import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Airport } from '../../types/airline';
import { getAirportWeatherImmediate, fetchLiveAirportWeather, RealtimeAirportWeather } from '../../utils/realtimeWeather';
import { 
  Search, 
  MapPin, 
  Plane, 
  ArrowRightLeft, 
  X, 
  Check, 
  Compass, 
  CloudSun, 
  Calendar, 
  Sparkles,
  ChevronDown
} from 'lucide-react';

interface DedicatedRouteSearchBarProps {
  origin: string;
  destination: string;
  onOriginChange: (code: string) => void;
  onDestinationChange: (code: string) => void;
  onSearchFlights?: () => void;
  airports: Airport[];
  className?: string;
  title?: string;
}

export const DedicatedRouteSearchBar: React.FC<DedicatedRouteSearchBarProps> = ({
  origin,
  destination,
  onOriginChange,
  onDestinationChange,
  onSearchFlights,
  airports,
  className = '',
  title = 'Direct Source to Destination Route Finder'
}) => {
  const { t } = useLanguage();
  const [originQuery, setOriginQuery] = useState<string>('');
  const [destQuery, setDestQuery] = useState<string>('');
  const [isOriginOpen, setIsOriginOpen] = useState<boolean>(false);
  const [isDestOpen, setIsDestOpen] = useState<boolean>(false);
  const [swapAnimating, setSwapAnimating] = useState<boolean>(false);

  const originContainerRef = useRef<HTMLDivElement>(null);
  const destContainerRef = useRef<HTMLDivElement>(null);

  const originAirport = airports.find(a => a.code.toUpperCase() === origin.toUpperCase()) || airports[0];
  const destAirport = airports.find(a => a.code.toUpperCase() === destination.toUpperCase()) || airports[1];

  // Live weather snippets for the selected airports
  const [originWeather, setOriginWeather] = useState<RealtimeAirportWeather>(() => 
    getAirportWeatherImmediate(origin || 'DEL')
  );
  const [destWeather, setDestWeather] = useState<RealtimeAirportWeather>(() => 
    getAirportWeatherImmediate(destination || 'BOM')
  );

  useEffect(() => {
    if (origin) {
      setOriginWeather(getAirportWeatherImmediate(origin));
      fetchLiveAirportWeather(origin).then(w => {
        if (w) setOriginWeather(w);
      });
    }
  }, [origin]);

  useEffect(() => {
    if (destination) {
      setDestWeather(getAirportWeatherImmediate(destination));
      fetchLiveAirportWeather(destination).then(w => {
        if (w) setDestWeather(w);
      });
    }
  }, [destination]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (originContainerRef.current && !originContainerRef.current.contains(e.target as Node)) {
        setIsOriginOpen(false);
      }
      if (destContainerRef.current && !destContainerRef.current.contains(e.target as Node)) {
        setIsDestOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter airports for origin
  const filteredOriginAirports = airports.filter(a => {
    if (a.code.toUpperCase() === destination.toUpperCase()) return false;
    if (!originQuery.trim()) return true;
    const q = originQuery.toLowerCase();
    return (
      a.code.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      (a.state && a.state.toLowerCase().includes(q))
    );
  });

  // Filter airports for destination
  const filteredDestAirports = airports.filter(a => {
    if (a.code.toUpperCase() === origin.toUpperCase()) return false;
    if (!destQuery.trim()) return true;
    const q = destQuery.toLowerCase();
    return (
      a.code.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      (a.state && a.state.toLowerCase().includes(q))
    );
  });

  const handleSwap = () => {
    setSwapAnimating(true);
    const temp = origin;
    onOriginChange(destination);
    onDestinationChange(temp);
    setTimeout(() => setSwapAnimating(false), 300);
  };

  const handleSelectPopularRoute = (orig: string, dest: string) => {
    onOriginChange(orig);
    onDestinationChange(dest);
  };

  return (
    <div className={`bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border-2 border-blue-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4 ${className}`}>
      {/* Header with Title and Current Live Status */}
      <div className="flex items-center justify-between gap-2 flex-wrap pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/40 text-sky-400 flex items-center justify-center">
            <Search className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{title}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-sky-300 font-mono font-bold border border-blue-500/30">
                POINT-TO-POINT
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Select origin source and arrival destination with real-time airport telemetry
            </p>
          </div>
        </div>

        {/* Live Weather Preview Pill */}
        <div className="flex items-center gap-2 text-xs bg-slate-950/80 px-3 py-1 rounded-xl border border-slate-800">
          <div className="flex items-center gap-1 text-slate-300">
            <span className="text-sky-400 font-bold">{origin}:</span>
            <span className="text-amber-300 font-extrabold">{originWeather.temperatureC}°C</span>
            <span className="text-[11px] text-slate-400">({originWeather.conditionText.split(' ')[0]})</span>
          </div>
          <span className="text-slate-600">➔</span>
          <div className="flex items-center gap-1 text-slate-300">
            <span className="text-emerald-400 font-bold">{destination}:</span>
            <span className="text-amber-300 font-extrabold">{destWeather.temperatureC}°C</span>
            <span className="text-[11px] text-slate-400">({destWeather.conditionText.split(' ')[0]})</span>
          </div>
        </div>
      </div>

      {/* Main Dual Search Bars Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
        
        {/* SOURCE / ORIGIN SEARCH BAR */}
        <div ref={originContainerRef} className="lg:col-span-5 relative">
          <label htmlFor="source-airport-input" className="block text-[11px] font-bold text-sky-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Plane className="w-3.5 h-3.5 transform rotate-45" />
              {t('search.origin')}
            </span>
            <span className="text-[10px] text-slate-400 font-normal">
              Weather: {originWeather.temperatureC}°C • {originWeather.conditionText.split(' ')[0]}
            </span>
          </label>

          <div 
            onClick={() => setIsOriginOpen(true)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-700 hover:border-blue-500 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <span className="px-2 py-1 rounded-lg bg-blue-500/20 text-blue-400 font-mono text-xs font-black border border-blue-500/30 shrink-0">
                {originAirport?.code || 'DEL'}
              </span>
              <div className="truncate flex-1">
                <input
                  id="source-airport-input"
                  type="text"
                  value={isOriginOpen ? originQuery : `${originAirport?.city || 'Delhi'} (${originAirport?.name?.slice(0, 24)}...)`}
                  onChange={(e) => {
                    setOriginQuery(e.target.value);
                    if (!isOriginOpen) setIsOriginOpen(true);
                  }}
                  onFocus={() => {
                    setIsOriginOpen(true);
                    setOriginQuery('');
                  }}
                  placeholder="Type city or airport code (e.g. DEL, Mumbai)..."
                  className="w-full bg-transparent text-white text-xs sm:text-sm font-semibold focus:outline-none placeholder:text-slate-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold hidden sm:inline">
                {originAirport?.terminal || 'T1'}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isOriginOpen ? 'rotate-180 text-blue-400' : ''}`} />
            </div>
          </div>

          {/* Autocomplete Dropdown */}
          {isOriginOpen && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-h-64 overflow-y-auto p-1.5 space-y-1 animate-fadeIn">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Select Origin Airport ({filteredOriginAirports.length} available)
              </div>
              {filteredOriginAirports.map(airport => (
                <button
                  key={airport.code}
                  type="button"
                  onClick={() => {
                    onOriginChange(airport.code);
                    setIsOriginOpen(false);
                    setOriginQuery('');
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                    airport.code === origin
                      ? 'bg-blue-600/30 text-white font-bold border border-blue-500/40'
                      : 'hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-10 font-mono font-bold text-sky-400">{airport.code}</span>
                    <div className="truncate">
                      <div className="font-semibold text-white">{airport.city}</div>
                      <div className="text-[10px] text-slate-400 truncate">{airport.name}</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {airport.terminal}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* SWAP ROUTE BUTTON */}
        <div className="lg:col-span-2 flex justify-center py-1">
          <button
            type="button"
            onClick={handleSwap}
            className={`p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-sky-400 hover:text-white transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95 flex items-center gap-1.5 ${
              swapAnimating ? 'rotate-180 text-amber-400' : ''
            }`}
            title="Swap Origin and Destination Airports"
            aria-label="Swap Source and Destination"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span className="text-[11px] font-bold sm:hidden">Swap Route</span>
          </button>
        </div>

        {/* DESTINATION SEARCH BAR */}
        <div ref={destContainerRef} className="lg:col-span-5 relative">
          <label htmlFor="destination-airport-input" className="block text-[11px] font-bold text-rose-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              {t('search.destination')}
            </span>
            <span className="text-[10px] text-slate-400 font-normal">
              Weather: {destWeather.temperatureC}°C • {destWeather.conditionText.split(' ')[0]}
            </span>
          </label>

          <div 
            onClick={() => setIsDestOpen(true)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-700 hover:border-rose-500 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <span className="px-2 py-1 rounded-lg bg-rose-500/20 text-rose-400 font-mono text-xs font-black border border-rose-500/30 shrink-0">
                {destAirport?.code || 'BOM'}
              </span>
              <div className="truncate flex-1">
                <input
                  id="destination-airport-input"
                  type="text"
                  value={isDestOpen ? destQuery : `${destAirport?.city || 'Mumbai'} (${destAirport?.name?.slice(0, 24)}...)`}
                  onChange={(e) => {
                    setDestQuery(e.target.value);
                    if (!isDestOpen) setIsDestOpen(true);
                  }}
                  onFocus={() => {
                    setIsDestOpen(true);
                    setDestQuery('');
                  }}
                  placeholder="Type destination city or airport code (e.g. BOM, Dubai)..."
                  className="w-full bg-transparent text-white text-xs sm:text-sm font-semibold focus:outline-none placeholder:text-slate-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold hidden sm:inline">
                {destAirport?.terminal || 'T2'}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isDestOpen ? 'rotate-180 text-rose-400' : ''}`} />
            </div>
          </div>

          {/* Autocomplete Dropdown */}
          {isDestOpen && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-h-64 overflow-y-auto p-1.5 space-y-1 animate-fadeIn">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Select Destination Airport ({filteredDestAirports.length} available)
              </div>
              {filteredDestAirports.map(airport => (
                <button
                  key={airport.code}
                  type="button"
                  onClick={() => {
                    onDestinationChange(airport.code);
                    setIsDestOpen(false);
                    setDestQuery('');
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                    airport.code === destination
                      ? 'bg-rose-600/30 text-white font-bold border border-rose-500/40'
                      : 'hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-10 font-mono font-bold text-rose-400">{airport.code}</span>
                    <div className="truncate">
                      <div className="font-semibold text-white">{airport.city}</div>
                      <div className="text-[10px] text-slate-400 truncate">{airport.name}</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {airport.terminal}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Real-time Route Weather Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
        <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono font-bold text-sky-400 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-500/30 text-[11px]">
              {originWeather.airportCode}
            </span>
            <div className="truncate">
              <span className="font-semibold text-white">{originWeather.cityName}:</span>
              <span className="text-slate-300 ml-1.5">{originWeather.temperatureC}°C ({originWeather.temperatureF}°F), {originWeather.conditionText}</span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 shrink-0 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
            {originWeather.flightSafetyStatus === 'OPTIMAL_VFR' ? 'Optimal VFR' : 'Monitored'}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono font-bold text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-500/30 text-[11px]">
              {destWeather.airportCode}
            </span>
            <div className="truncate">
              <span className="font-semibold text-white">{destWeather.cityName}:</span>
              <span className="text-slate-300 ml-1.5">{destWeather.temperatureC}°C ({destWeather.temperatureF}°F), {destWeather.conditionText}</span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 shrink-0 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
            {destWeather.flightSafetyStatus === 'OPTIMAL_VFR' ? 'Optimal VFR' : 'Monitored'}
          </span>
        </div>
      </div>

      {/* Popular Fast-Select Route Chips & Direct Action */}
      <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Popular Routes:
          </span>
          {[
            { orig: 'DEL', dest: 'BOM', label: 'Delhi ⇄ Mumbai' },
            { orig: 'BLR', dest: 'DEL', label: 'Bengaluru ⇄ Delhi' },
            { orig: 'BOM', dest: 'GOI', label: 'Mumbai ⇄ Goa' },
            { orig: 'MAA', dest: 'DEL', label: 'Chennai ⇄ Delhi' },
            { orig: 'DEL', dest: 'DXB', label: 'Delhi ⇄ Dubai' },
            { orig: 'BOM', dest: 'LHR', label: 'Mumbai ⇄ London' }
          ].map(r => (
            <button
              key={`${r.orig}-${r.dest}`}
              type="button"
              onClick={() => handleSelectPopularRoute(r.orig, r.dest)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer shrink-0 ${
                origin === r.orig && destination === r.dest
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : 'bg-slate-950/90 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {onSearchFlights && (
          <button
            type="button"
            onClick={onSearchFlights}
            className="w-full sm:w-auto px-5 py-2 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:scale-105"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Find Flights on this Route</span>
          </button>
        )}
      </div>
    </div>
  );
};
