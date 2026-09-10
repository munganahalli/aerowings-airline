import React, { useState, useRef, useEffect } from 'react';
import { Airport } from '../../types/airline';
import { Search, MapPin, X, Check, Plane, Globe, Building2, ChevronDown } from 'lucide-react';

interface AirportSearchComboboxProps {
  id: string;
  label: string;
  value: string; // airport code (e.g. 'DEL')
  onChange: (airportCode: string) => void;
  airports: Airport[];
  placeholder?: string;
  excludeCode?: string; // e.g. don't pick the same origin as destination
  icon?: React.ReactNode;
}

export const AirportSearchCombobox: React.FC<AirportSearchComboboxProps> = ({
  id,
  label,
  value,
  onChange,
  airports,
  placeholder = 'Type city, airport code, or country...',
  excludeCode,
  icon
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'intra_state' | 'domestic' | 'international'>('all');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);
  const [showAllPlaces, setShowAllPlaces] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedAirport = airports.find(a => a.code.toUpperCase() === value.toUpperCase()) || airports[0];

  // Helper to categorize airports
  const getAirportCategory = (airport: Airport): 'intra_state' | 'domestic' | 'international' => {
    const intraStateCodes = ['BOM', 'PNQ', 'NAG', 'MAA', 'CJB', 'IXM', 'TRZ', 'BLR', 'IXE', 'AMD', 'STV', 'JAI', 'UDR', 'CCU', 'IXB', 'LKO', 'VNS'];
    const intlCodes = ['DXB', 'LHR', 'SIN', 'BKK', 'CDG', 'FRA', 'HND', 'JFK', 'SFO', 'SYD', 'YYZ'];

    if (intlCodes.includes(airport.code) || airport.country !== 'India') {
      return 'international';
    }
    if (intraStateCodes.includes(airport.code)) {
      return 'intra_state';
    }
    return 'domestic';
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Filtered airports
  const filteredAirports = airports.filter(airport => {
    if (excludeCode && airport.code.toUpperCase() === excludeCode.toUpperCase()) {
      return false;
    }

    const category = getAirportCategory(airport);
    if (selectedCategory !== 'all' && category !== selectedCategory) {
      return false;
    }

    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase().trim();
    return (
      airport.code.toLowerCase().includes(q) ||
      airport.city.toLowerCase().includes(q) ||
      airport.name.toLowerCase().includes(q) ||
      (airport.state && airport.state.toLowerCase().includes(q)) ||
      (airport.country && airport.country.toLowerCase().includes(q))
    );
  });

  // Showing less places: default to top 5 premier destinations unless explicitly expanded
  const popularHubCodes = ['DEL', 'BOM', 'BLR', 'DXB', 'LHR', 'SIN'];
  const curatedAirports = !searchQuery.trim()
    ? [...filteredAirports].sort((a, b) => {
        const aPop = popularHubCodes.includes(a.code) ? 1 : 0;
        const bPop = popularHubCodes.includes(b.code) ? 1 : 0;
        return bPop - aPop;
      })
    : filteredAirports;

  const visibleAirports = showAllPlaces ? curatedAirports : curatedAirports.slice(0, 5);
  const hiddenPlacesCount = Math.max(0, curatedAirports.length - visibleAirports.length);

  const handleSelectAirport = (code: string) => {
    onChange(code);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < filteredAirports.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : filteredAirports.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredAirports[highlightedIndex]) {
        handleSelectAirport(filteredAirports[highlightedIndex].code);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Major popular shortcuts
  const popularHubs = ['DEL', 'BOM', 'BLR', 'MAA', 'CCU', 'DXB', 'LHR'];

  return (
    <div ref={containerRef} className="relative w-full text-left">
      <label htmlFor={id} className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
        {label}
      </label>

      {/* Main Trigger Card */}
      <button
        id={id}
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        onKeyDown={handleKeyDown}
        className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
          isOpen
            ? 'bg-slate-900 border-blue-500 shadow-lg shadow-blue-500/15 ring-2 ring-blue-500/20'
            : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            {icon || <Plane className="w-4 h-4" />}
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white text-sm tracking-wide">
                {selectedAirport?.city || 'Select Airport'}
              </span>
              <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-sky-300 border border-blue-500/30">
                {selectedAirport?.code || '---'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-xs mt-0.5">
              {selectedAirport?.name || 'Search city, state or code'}
            </p>
          </div>
        </div>

        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${isOpen ? 'rotate-180 text-blue-400' : ''}`} />
      </button>

      {/* Searchable Dropdown Overlay */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full sm:w-96 z-50 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden animate-fadeIn">
          {/* Search Input Bar */}
          <div className="p-3 border-b border-slate-800 bg-slate-950">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setHighlightedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 p-0.5 text-slate-400 hover:text-white rounded-md cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Popular Hubs */}
            <div className="mt-2 flex items-center gap-1 overflow-x-auto pb-1 text-[10px]">
              <span className="text-slate-500 shrink-0 font-medium">Quick:</span>
              {popularHubs.map(code => (
                <button
                  key={code}
                  type="button"
                  onClick={() => handleSelectAirport(code)}
                  className={`px-2 py-0.5 rounded-md font-mono font-bold shrink-0 transition-colors cursor-pointer ${
                    value === code
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>

            {/* Category Filter Pills */}
            <div className="mt-2 flex items-center gap-1 text-[11px] overflow-x-auto pb-0.5">
              {[
                { id: 'all', label: 'All Airports' },
                { id: 'intra_state', label: '🏡 Regional' },
                { id: 'domestic', label: '🇮🇳 Domestic' },
                { id: 'international', label: '✈️ International' }
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.id as any);
                    setHighlightedIndex(0);
                  }}
                  className={`px-2 py-0.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Airport Results List */}
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/60 p-1">
            {visibleAirports.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                <p className="font-semibold text-slate-300">No airports found matching &quot;{searchQuery}&quot;</p>
                <p className="text-[11px] text-slate-500 mt-1">Try searching city name like &apos;Delhi&apos;, &apos;Mumbai&apos;, or code &apos;DEL&apos;</p>
              </div>
            ) : (
              visibleAirports.map((airport, idx) => {
                const isSelected = airport.code.toUpperCase() === value.toUpperCase();
                const isHighlighted = idx === highlightedIndex;
                const cat = getAirportCategory(airport);

                return (
                  <button
                    key={airport.code}
                    type="button"
                    onClick={() => handleSelectAirport(airport.code)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/20 text-white border border-amber-500/40 shadow-sm'
                        : isHighlighted
                        ? 'bg-slate-800/80 text-white'
                        : 'text-slate-300 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-950 border border-amber-500/20 flex items-center justify-center font-mono font-bold text-xs text-amber-400 shrink-0 shadow-inner">
                        {airport.code}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-white truncate">
                            {airport.city}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ({airport.state || airport.country})
                          </span>
                          {cat === 'international' ? (
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                              Prestige Intl
                            </span>
                          ) : cat === 'intra_state' ? (
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-purple-500/20 text-purple-300 font-medium">
                              Regional
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-300 font-medium">
                              Domestic
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {airport.name}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-amber-400 shrink-0 mr-1" />
                    )}
                  </button>
                );
              })
            )}

            {/* Toggle to show more or less places */}
            {curatedAirports.length > 5 && (
              <div className="p-2 text-center bg-slate-950/60 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setShowAllPlaces(!showAllPlaces)}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors py-1 px-3 rounded-lg hover:bg-slate-800/60 cursor-pointer inline-flex items-center gap-1.5"
                >
                  {showAllPlaces ? (
                    <span>Show less places (Top 5 only) ↑</span>
                  ) : (
                    <span>Show more places ({hiddenPlacesCount} more available) ↓</span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
