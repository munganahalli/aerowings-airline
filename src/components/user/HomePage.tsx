import React, { useState, useEffect } from 'react';
import { useAirline } from '../../context/AirlineContext';
import { useLanguage } from '../../context/LanguageContext';
import { AIRPORTS, OFFERS } from '../../data/mockData';
import { formatCurrency } from '../../utils/airlineUtils';
import { CabinClass, FlightSearchParams, TripType } from '../../types/airline';
import { AirportSearchCombobox } from '../common/AirportSearchCombobox';
import { RealtimeAirportWeatherWidget } from '../common/RealtimeAirportWeatherWidget';
import { MeteorologicalWeatherReader } from '../common/MeteorologicalWeatherReader';
import { aiVoice } from '../../utils/aiVoice';
import {
  Plane,
  Calendar,
  Users,
  Search,
  ArrowRightLeft,
  Tag,
  ShieldCheck,
  Coffee,
  Wifi,
  Sparkles,
  ChevronRight,
  TrendingUp,
  MapPin,
  Clock,
  Radio,
  Check,
  CloudSun,
  Globe,
  Volume2,
  SlidersHorizontal,
  Filter,
  Plus,
  Trash2,
  Building,
  ChevronDown,
  ChevronUp,
  Shield
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const {
    searchParams,
    setSearchParams,
    performSearch,
    currency,
    setUserView,
    applyPromoCode,
    flights,
    setTrackedPNR,
    addToast
  } = useAirline();
  const { t, language, setLanguage, languages } = useLanguage();

  const [tripType, setTripType] = useState<TripType>(searchParams.tripType);
  const [origin, setOrigin] = useState<string>(searchParams.origin);
  const [destination, setDestination] = useState<string>(searchParams.destination);
  const [departureDate, setDepartureDate] = useState<string>(searchParams.departureDate);
  const [returnDate, setReturnDate] = useState<string>(searchParams.returnDate || '');
  const [cabinClass, setCabinClass] = useState<CabinClass>(searchParams.cabinClass);
  const [adults, setAdults] = useState<number>(searchParams.adults);
  const [children, setChildren] = useState<number>(searchParams.children);
  const [infants, setInfants] = useState<number>(searchParams.infants);
  const [specialFare, setSpecialFare] = useState<'regular' | 'student' | 'senior' | 'armed_forces' | 'doctors_nurses'>(searchParams.specialFare || 'regular');

  // GST Number State
  const [hasGstNumber, setHasGstNumber] = useState(false);
  const [gstNumber, setGstNumber] = useState('');
  const [gstCompanyName, setGstCompanyName] = useState('');

  // Price Drop Protection
  const [hasPriceDropProtection, setHasPriceDropProtection] = useState(false);

  // Smart Filters State (Add and Hide Smart Filters)
  const [showSmartFilters, setShowSmartFilters] = useState(false);
  const [appliedPopularFilters, setAppliedPopularFilters] = useState<string[]>([]);
  const [appliedLayoverAirports, setAppliedLayoverAirports] = useState<string[]>([]);
  const [appliedTimeFilter, setAppliedTimeFilter] = useState<string>('any');
  const [appliedMaxPrice, setAppliedMaxPrice] = useState<number>(25000);

  // Multi-City Flight Segments State
  const [multiCitySegments, setMultiCitySegments] = useState<Array<{ id: string; origin: string; destination: string; departureDate: string }>>([
    {
      id: 'seg-1',
      origin: searchParams.origin || 'DEL',
      destination: searchParams.destination || 'BOM',
      departureDate: searchParams.departureDate || new Date().toISOString().split('T')[0]
    },
    {
      id: 'seg-2',
      origin: 'BOM',
      destination: 'BLR',
      departureDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
    }
  ]);

  const handleAddSegment = () => {
    if (multiCitySegments.length >= 6) {
      addToast('Maximum 6 flight segments allowed for multi-city itinerary', 'info');
      return;
    }
    const lastSeg = multiCitySegments[multiCitySegments.length - 1];
    const newOrig = lastSeg ? lastSeg.destination : 'BLR';
    const newDest = newOrig === 'DEL' ? 'BOM' : 'DEL';
    const newDate = new Date(Date.now() + 86400000 * (multiCitySegments.length + 2)).toISOString().split('T')[0];
    setMultiCitySegments(prev => [
      ...prev,
      { id: `seg-${Date.now()}`, origin: newOrig, destination: newDest, departureDate: newDate }
    ]);
    addToast('Flight segment added to itinerary', 'success');
  };

  const handleRemoveSegment = (id: string) => {
    if (multiCitySegments.length <= 2) {
      addToast('Multi-city itinerary requires at least 2 flight segments', 'info');
      return;
    }
    setMultiCitySegments(prev => prev.filter(s => s.id !== id));
    addToast('Flight segment removed', 'info');
  };

  const handleUpdateSegment = (id: string, field: 'origin' | 'destination' | 'departureDate', value: string) => {
    setMultiCitySegments(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  // Sync external concession fare changes (e.g. from footer Special Concessions link)
  useEffect(() => {
    if (searchParams.specialFare && searchParams.specialFare !== specialFare) {
      setSpecialFare(searchParams.specialFare);
    }
  }, [searchParams.specialFare]);

  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);
  const [quickFlightQuery, setQuickFlightQuery] = useState('');
  const [quickPnrQuery, setQuickPnrQuery] = useState('');

  // Handle Swap Airports
  const handleSwapAirports = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  // Submit Search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveOrigin = tripType === 'multi_city' && multiCitySegments[0] ? multiCitySegments[0].origin : origin;
    const effectiveDest = tripType === 'multi_city' && multiCitySegments[0] ? multiCitySegments[0].destination : destination;
    const effectiveDepDate = tripType === 'multi_city' && multiCitySegments[0] ? multiCitySegments[0].departureDate : departureDate;

    const params: FlightSearchParams = {
      tripType,
      origin: effectiveOrigin,
      destination: effectiveDest,
      departureDate: effectiveDepDate,
      returnDate: tripType === 'round_trip' ? returnDate : undefined,
      cabinClass,
      adults,
      children,
      infants,
      specialFare,
    };
    performSearch(params);
  };

  const handleApplyOffer = (code: string) => {
    applyPromoCode(code);
    const params: FlightSearchParams = {
      tripType,
      origin,
      destination,
      departureDate,
      returnDate: tripType === 'round_trip' ? returnDate : undefined,
      cabinClass,
      adults,
      children,
      infants,
      specialFare,
    };
    performSearch(params);
  };

  const totalPassengers = adults + children + infants;

  const popularRoutes = [
    { origin: 'BOM', dest: 'PNQ', title: 'Mumbai to Pune', price: 2200, image: '🏡', desc: 'Intra-State Maharashtra • 45m • AeroWings AW-102' },
    { origin: 'DEL', dest: 'BOM', title: 'Delhi to Mumbai', price: 4850, image: '🌆', desc: 'State-to-State Trunk • 2h 15m • AeroWings AW-204' },
    { origin: 'DEL', dest: 'BLR', title: 'Delhi to Bengaluru', price: 5350, image: '🌿', desc: 'Silicon Corridor • 2h 45m • AeroWings AW-305' },
    { origin: 'BOM', dest: 'GOI', title: 'Mumbai to Goa', price: 3100, image: '🏖️', desc: 'Holiday Shuttle • 1h 10m • AeroWings AW-408' },
    { origin: 'BLR', dest: 'HYD', title: 'Bengaluru to Hyderabad', price: 3199, image: '🕌', desc: 'Deccan Express • 1h 10m • AeroWings AW-318' },
    { origin: 'DEL', dest: 'JAI', title: 'Delhi to Jaipur', price: 2799, image: '🏰', desc: 'Royal Rajasthan • 1h 05m • AeroWings AW-215' },
    { origin: 'BLR', dest: 'COK', title: 'Bengaluru to Kochi', price: 3299, image: '🌴', desc: 'Kerala Backwaters • 1h 15m • AeroWings AW-412' },
    { origin: 'DEL', dest: 'VNS', title: 'Delhi to Varanasi', price: 3599, image: '🪔', desc: 'Spiritual Heritage • 1h 25m • AeroWings AW-504' },
    { origin: 'DEL', dest: 'DXB', title: 'Delhi to Dubai', price: 14900, image: '🏜️', desc: 'International • 4h 10m • AeroWings AW-901' },
    { origin: 'BOM', dest: 'LHR', title: 'Mumbai to London', price: 45000, image: '🎡', desc: 'Non-Stop Direct • 9h 45m • AeroWings AW-910' },
    { origin: 'BLR', dest: 'SIN', title: 'Bengaluru to Singapore', price: 15200, image: '🦁', desc: 'International • 4h 25m • AeroWings AW-920' },
    { origin: 'MAA', dest: 'CJB', title: 'Chennai to Coimbatore', price: 2450, image: '🛕', desc: 'Intra-State Tamil Nadu • 1h 05m • AeroWings AW-112' },
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section with Flight Search Engine */}
      <section className="relative pt-6 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950">
        {/* Ambient background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-600/15 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-8 space-y-3">
            <div className="inline-flex items-center gap-2 text-amber-300 text-xs font-semibold tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('hero.badge', 'AeroWings Prestige Class • Royal Aviation Experience')}</span>
            </div>
            <h1 className="font-prestige text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-tight">
              {t('hero.title', 'Where will your dreams take you next?')}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {t('hero.subtitle', 'Experience the pinnacle of luxury flight booking with zero convenience fee, instant seat reservation, and complimentary gourmet dining.')}
            </p>
          </div>

          {/* Search Engine Card */}
          <div id="flight-search-form" className="bg-slate-900/95 backdrop-blur-xl border border-amber-500/25 rounded-2xl p-4 sm:p-6 shadow-2xl shadow-amber-950/20 ring-1 ring-white/5">
            {/* Trip Type Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {([
                  { type: 'one_way', label: t('search.oneWay') },
                  { type: 'round_trip', label: t('search.roundTrip') },
                  { type: 'multi_city', label: t('search.multiCity') }
                ] as { type: TripType; label: string }[]).map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setTripType(item.type)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                      tripType === item.type
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* FARE TYPE Section Header & Quick Filters */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSmartFilters(!showSmartFilters)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    showSmartFilters
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
                  <span>{showSmartFilters ? 'Hide Smart Filters' : 'Add Smart Filters'}</span>
                  {showSmartFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Prominent FARE TYPE Selector Bar */}
            <div className="pt-3 pb-3 border-b border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-amber-400 font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  <span>FARE TYPE:</span>
                </span>
                <span className="text-[11px] text-slate-400">Select traveler fare concession:</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap text-xs">
                {/* Regular */}
                <button
                  type="button"
                  onClick={() => {
                    setSpecialFare('regular');
                    setSearchParams(prev => ({ ...prev, specialFare: 'regular' }));
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    specialFare === 'regular'
                      ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-md shadow-amber-500/20 ring-1 ring-amber-400/50'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {specialFare === 'regular' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  <span>Regular</span>
                </button>

                {/* Student */}
                <button
                  type="button"
                  onClick={() => {
                    setSpecialFare('student');
                    setSearchParams(prev => ({ ...prev, specialFare: 'student' }));
                    addToast('Student Fare Selected: 10% Off Base Fare + 25kg Check-in Baggage', 'success');
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    specialFare === 'student'
                      ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-md shadow-amber-500/20 ring-1 ring-amber-400/50'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {specialFare === 'student' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  <span>Student</span>
                </button>

                {/* Armed Forces */}
                <button
                  type="button"
                  onClick={() => {
                    setSpecialFare('armed_forces');
                    setSearchParams(prev => ({ ...prev, specialFare: 'armed_forces' }));
                    addToast('Armed Forces Concession Selected: 15% Off Base Fare', 'success');
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    specialFare === 'armed_forces'
                      ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-md shadow-amber-500/20 ring-1 ring-amber-400/50'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {specialFare === 'armed_forces' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  <span>Armed Forces</span>
                </button>

                {/* Senior Citizen */}
                <button
                  type="button"
                  onClick={() => {
                    setSpecialFare('senior');
                    setSearchParams(prev => ({ ...prev, specialFare: 'senior' }));
                    addToast('Senior Citizen Concession Selected: 12% Off Base Fare', 'success');
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    specialFare === 'senior'
                      ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-md shadow-amber-500/20 ring-1 ring-amber-400/50'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {specialFare === 'senior' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  <span>Senior Citizen</span>
                </button>

                {/* Doctor and Nurses */}
                <button
                  type="button"
                  onClick={() => {
                    setSpecialFare('doctors_nurses');
                    setSearchParams(prev => ({ ...prev, specialFare: 'doctors_nurses' }));
                    addToast('Doctors & Nurses Concession Selected: 10% Off + Free Reschedule', 'success');
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    specialFare === 'doctors_nurses'
                      ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-md shadow-amber-500/20 ring-1 ring-amber-400/50'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {specialFare === 'doctors_nurses' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  <span>Doctor and Nurses</span>
                </button>

                {/* Have a GST number ? */}
                <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-bold cursor-pointer hover:border-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={hasGstNumber}
                    onChange={(e) => setHasGstNumber(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-amber-500 w-3.5 h-3.5 cursor-pointer"
                  />
                  <Building className="w-3.5 h-3.5 text-amber-400" />
                  <span>Have a GST number ?</span>
                </label>

                {/* Add Price Drop Protection */}
                <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-950/40 border border-blue-500/30 text-sky-300 font-bold cursor-pointer hover:border-blue-500/60 select-none">
                  <input
                    type="checkbox"
                    checked={hasPriceDropProtection}
                    onChange={(e) => {
                      setHasPriceDropProtection(e.target.checked);
                      if (e.target.checked) addToast('Price Drop Protection enabled: Locked against fare increases!', 'success');
                    }}
                    className="rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-sky-500 w-3.5 h-3.5 cursor-pointer"
                  />
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Add Price Drop Protection (+₹199)</span>
                </label>
              </div>

              {/* GST Number Expansion Box */}
              {hasGstNumber && (
                <div className="p-3 bg-slate-950/90 border border-amber-500/30 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs animate-in slide-in-from-top-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Registered GSTIN Number</label>
                    <input
                      type="text"
                      maxLength={15}
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                      placeholder="e.g. 29AAAAA0000A1Z5"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono uppercase focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Company / Legal Business Name</label>
                    <input
                      type="text"
                      value={gstCompanyName}
                      onChange={(e) => setGstCompanyName(e.target.value)}
                      placeholder="e.g. Acme Technologies Pvt Ltd"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Smart Filters Collapsible Panel */}
            {showSmartFilters && (
              <div className="mt-3 p-4 bg-slate-950/90 border border-sky-500/30 rounded-2xl space-y-4 animate-in slide-in-from-top-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Filter className="w-4 h-4 text-sky-400" />
                    <span>Smart Filters</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedPopularFilters([]);
                      setAppliedLayoverAirports([]);
                      setAppliedTimeFilter('any');
                      setAppliedMaxPrice(25000);
                      addToast('Smart filters reset', 'info');
                    }}
                    className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>

                {/* Applied Filters Section */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Applied Filters:</span>
                  <div className="flex items-center gap-1.5 flex-wrap min-h-[28px]">
                    {appliedPopularFilters.length === 0 && appliedLayoverAirports.length === 0 && appliedTimeFilter === 'any' ? (
                      <span className="text-xs text-slate-500 italic">No filters applied (showing all scheduled flights)</span>
                    ) : (
                      <>
                        {appliedPopularFilters.map(f => (
                          <span key={f} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[11px] font-bold">
                            {f.replace('_', ' ')}
                            <button type="button" onClick={() => setAppliedPopularFilters(prev => prev.filter(x => x !== f))} className="cursor-pointer hover:text-white">✕</button>
                          </span>
                        ))}
                        {appliedLayoverAirports.map(l => (
                          <span key={l} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                            Layover: {l}
                            <button type="button" onClick={() => setAppliedLayoverAirports(prev => prev.filter(x => x !== l))} className="cursor-pointer hover:text-white">✕</button>
                          </span>
                        ))}
                        {appliedTimeFilter !== 'any' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-bold">
                            Time: {appliedTimeFilter}
                            <button type="button" onClick={() => setAppliedTimeFilter('any')} className="cursor-pointer hover:text-white">✕</button>
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-800 text-xs">
                  {/* Popular Filters */}
                  <div className="space-y-2">
                    <span className="font-bold text-slate-300 uppercase tracking-wider block text-[11px]">Popular Filters:</span>
                    <div className="space-y-1.5">
                      {[
                        { id: 'non_stop', label: 'Non-Stop Direct Flights' },
                        { id: 'morning_departure', label: 'Morning Departure (06:00 - 12:00)' },
                        { id: 'free_meal', label: 'Free In-Flight Hot Meals' },
                        { id: 'refundable', label: '100% Refundable Fares' }
                      ].map(pop => (
                        <label key={pop.id} className="flex items-center gap-2 text-slate-400 hover:text-slate-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={appliedPopularFilters.includes(pop.id)}
                            onChange={(e) => {
                              if (e.target.checked) setAppliedPopularFilters(prev => [...prev, pop.id]);
                              else setAppliedPopularFilters(prev => prev.filter(x => x !== pop.id));
                            }}
                            className="rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-sky-500"
                          />
                          <span>{pop.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Layover Airports */}
                  <div className="space-y-2">
                    <span className="font-bold text-slate-300 uppercase tracking-wider block text-[11px]">Layover Airports:</span>
                    <div className="space-y-1.5">
                      {[
                        { id: 'direct', label: 'Direct Only (Zero Layovers)' },
                        { id: 'BOM', label: 'Mumbai (BOM) Transit' },
                        { id: 'DEL', label: 'Delhi (DEL) Transit' },
                        { id: 'DXB', label: 'Dubai (DXB) Transit' },
                        { id: 'SIN', label: 'Singapore (SIN) Transit' }
                      ].map(lay => (
                        <label key={lay.id} className="flex items-center gap-2 text-slate-400 hover:text-slate-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={appliedLayoverAirports.includes(lay.id)}
                            onChange={(e) => {
                              if (e.target.checked) setAppliedLayoverAirports(prev => [...prev, lay.id]);
                              else setAppliedLayoverAirports(prev => prev.filter(x => x !== lay.id));
                            }}
                            className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                          />
                          <span>{lay.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Time and Price */}
                  <div className="space-y-2">
                    <span className="font-bold text-slate-300 uppercase tracking-wider block text-[11px]">Time and Price:</span>
                    <div className="space-y-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Departure Time Window:</label>
                        <select
                          value={appliedTimeFilter}
                          onChange={(e) => setAppliedTimeFilter(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        >
                          <option value="any">Any Departure Time</option>
                          <option value="morning">Morning (06:00 - 12:00)</option>
                          <option value="afternoon">Afternoon (12:00 - 18:00)</option>
                          <option value="evening">Evening (18:00 - 24:00)</option>
                          <option value="night">Early Morning (00:00 - 06:00)</option>
                        </select>
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                          <span>Max Price / Person:</span>
                          <span className="font-bold text-emerald-400">{formatCurrency(appliedMaxPrice, currency)}</span>
                        </div>
                        <input
                          type="range"
                          min={2000}
                          max={50000}
                          step={1000}
                          value={appliedMaxPrice}
                          onChange={(e) => setAppliedMaxPrice(Number(e.target.value))}
                          className="w-full accent-sky-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Active Special Concession Fare Banner */}
            {specialFare !== 'regular' && (
              <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2 text-xs text-amber-200">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <strong>Active Concession Fare:</strong>{' '}
                    {specialFare === 'student' && 'Student Concession (10% Instant Discount on Base Fare + 10kg Extra Check-in Baggage Free — Total 25kg)'}
                    {specialFare === 'senior' && 'Senior Citizen Concession (12% Instant Discount on Base Fare + Complimentary Wheelchair & Boarding Assistance)'}
                    {specialFare === 'armed_forces' && 'Defence / Armed Forces Concession (15% Instant Discount on Base Fare + Priority Counter Check-in)'}
                    {specialFare === 'doctors_nurses' && 'Doctors & Nurses Concession (10% Instant Discount on Base Fare + Zero-Fee Date Change)'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSpecialFare('regular');
                    setSearchParams(prev => ({ ...prev, specialFare: 'regular' }));
                  }}
                  className="text-[11px] text-slate-300 hover:text-white underline shrink-0 cursor-pointer"
                >
                  Reset to Regular
                </button>
              </div>
            )}

            {/* Flight Search Form */}
            <form onSubmit={handleSearch} className="pt-5 space-y-4">
              {tripType === 'multi_city' ? (
                /* Multi-City Itinerary Builder */
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-sky-400 flex items-center justify-center font-bold">
                        <Plane className="w-4 h-4 transform -rotate-45" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Multi-City Route Planner ({multiCitySegments.length} Segments)</h4>
                        <p className="text-[11px] text-slate-400">Add or remove custom flight segments for hop-on, stopover, and multi-destination itineraries.</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddSegment}
                      disabled={multiCitySegments.length >= 6}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Segment</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {multiCitySegments.map((seg, idx) => (
                      <div
                        key={seg.id}
                        className="p-3.5 bg-slate-950/90 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all grid grid-cols-1 md:grid-cols-12 gap-3 items-center shadow-lg"
                      >
                        <div className="md:col-span-1 flex md:flex-col items-center justify-between md:justify-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-sky-300 font-mono text-xs font-black border border-blue-500/30">
                            #{idx + 1}
                          </span>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Leg {idx + 1}</span>
                        </div>

                        <div className="md:col-span-4">
                          <AirportSearchCombobox
                            id={`multi-orig-${seg.id}`}
                            label={`Flight ${idx + 1} Origin`}
                            value={seg.origin}
                            onChange={(code) => handleUpdateSegment(seg.id, 'origin', code)}
                            airports={AIRPORTS}
                            excludeCode={seg.destination}
                            placeholder="Departure airport..."
                            icon={<Plane className="w-4 h-4 text-blue-400 transform rotate-45 flex-shrink-0" />}
                          />
                        </div>

                        <div className="md:col-span-4">
                          <AirportSearchCombobox
                            id={`multi-dest-${seg.id}`}
                            label={`Flight ${idx + 1} Destination`}
                            value={seg.destination}
                            onChange={(code) => handleUpdateSegment(seg.id, 'destination', code)}
                            airports={AIRPORTS}
                            excludeCode={seg.origin}
                            placeholder="Arrival airport..."
                            icon={<MapPin className="w-4 h-4 text-rose-400 flex-shrink-0" />}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                            Departure Date
                          </label>
                          <input
                            type="date"
                            value={seg.departureDate}
                            onChange={(e) => handleUpdateSegment(seg.id, 'departureDate', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs font-semibold text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                          />
                        </div>

                        <div className="md:col-span-1 flex justify-center">
                          {multiCitySegments.length > 2 ? (
                            <button
                              type="button"
                              onClick={() => handleRemoveSegment(seg.id)}
                              className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 cursor-pointer transition-all hover:scale-105"
                              title={`Remove flight segment #${idx + 1}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-600 font-mono">Min 2</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Multi-City Controls & Class Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center pt-2">
                    <div className="sm:col-span-6 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleAddSegment}
                        disabled={multiCitySegments.length >= 6}
                        className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Flight Segment (up to 6)</span>
                      </button>
                      <span className="text-slate-600 text-xs">•</span>
                      <span className="text-xs text-slate-400">
                        {multiCitySegments.length} segments configured
                      </span>
                    </div>

                    <div className="sm:col-span-6 relative bg-slate-950 border border-slate-800 rounded-xl p-3 hover:border-slate-700 transition-colors">
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        {t('search.passengers')} & {t('search.class')}
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
                        className="w-full text-left flex items-center justify-between text-white text-xs font-semibold focus:outline-none cursor-pointer"
                      >
                        <span className="truncate">
                          {totalPassengers} {totalPassengers > 1 ? t('search.passengers') : t('search.passenger')}, {t(`search.${cabinClass === 'premium_economy' ? 'premiumEconomy' : cabinClass}`)}
                        </span>
                        <Users className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-800">
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Coordinated layovers & 100% weather refund protection for all segments</span>
                    </div>

                    <button
                      type="submit"
                      className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                    >
                      <Search className="w-4 h-4" />
                      <span>Search Multi-City Flights ({multiCitySegments.length} Segments) →</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* One-Way & Round-Trip Search Grid */
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
                    {/* Origin Search Combobox */}
                    <div className="lg:col-span-3">
                      <AirportSearchCombobox
                        id="origin-search"
                        label="From / Origin"
                        value={origin}
                        onChange={(code) => setOrigin(code)}
                        airports={AIRPORTS}
                        excludeCode={destination}
                        placeholder="Search origin city, code (DEL, BOM)..."
                        icon={<Plane className="w-4 h-4 text-blue-400 transform rotate-45 flex-shrink-0" />}
                      />
                    </div>

                    {/* Swap Button */}
                    <div className="lg:col-span-1 flex justify-center py-1 sm:py-0">
                      <button
                        type="button"
                        onClick={handleSwapAirports}
                        className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sky-400 hover:text-white transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95"
                        title="Swap Origin and Destination"
                        aria-label="Swap Origin and Destination Airports"
                      >
                        <ArrowRightLeft className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Destination Search Combobox */}
                    <div className="lg:col-span-3">
                      <AirportSearchCombobox
                        id="destination-search"
                        label="To / Destination"
                        value={destination}
                        onChange={(code) => setDestination(code)}
                        airports={AIRPORTS}
                        excludeCode={origin}
                        placeholder="Search destination city, code (BOM, DXB)..."
                        icon={<MapPin className="w-4 h-4 text-rose-400 flex-shrink-0" />}
                      />
                    </div>

                    {/* Dates */}
                    <div className={`${tripType === 'round_trip' ? 'lg:col-span-3' : 'lg:col-span-2'} bg-slate-950 border border-slate-800 rounded-xl p-3 hover:border-slate-700 transition-colors`}>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                            {t('search.departure')}
                          </label>
                          <input
                            type="date"
                            id="departure-date"
                            value={departureDate}
                            onChange={(e) => setDepartureDate(e.target.value)}
                            className="bg-transparent text-white text-xs sm:text-sm font-semibold w-full focus:outline-none cursor-pointer"
                          />
                        </div>
                        {tripType === 'round_trip' && (
                          <div className="border-l border-slate-800 pl-2">
                            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                              {t('search.return')}
                            </label>
                            <input
                              type="date"
                              id="return-date"
                              value={returnDate}
                              onChange={(e) => setReturnDate(e.target.value)}
                              className="bg-transparent text-white text-xs sm:text-sm font-semibold w-full focus:outline-none cursor-pointer"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Passengers & Class */}
                    <div className={`${tripType === 'round_trip' ? 'lg:col-span-2' : 'lg:col-span-3'} relative bg-slate-950 border border-slate-800 rounded-xl p-3 hover:border-slate-700 transition-colors`}>
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        {t('search.passengers')} & {t('search.class')}
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
                        className="w-full text-left flex items-center justify-between text-white text-xs sm:text-sm font-semibold focus:outline-none"
                      >
                        <span className="truncate">
                          {totalPassengers} {totalPassengers > 1 ? t('search.passengers') : t('search.passenger')}, {t(`search.${cabinClass === 'premium_economy' ? 'premiumEconomy' : cabinClass}`)}
                        </span>
                        <Users className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      </button>

                      {/* Dropdown menu */}
                      {showPassengerDropdown && (
                        <div className="absolute right-0 top-full mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-4 z-50 space-y-4">
                          {/* Adults */}
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs font-bold text-white">Adults</div>
                              <div className="text-[10px] text-slate-400">12+ years</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setAdults(Math.max(1, adults - 1))}
                                className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center hover:bg-slate-700"
                              >
                                -
                              </button>
                              <span className="w-5 text-center text-sm font-bold text-white">{adults}</span>
                              <button
                                type="button"
                                onClick={() => setAdults(Math.min(60, adults + 1))}
                                className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center hover:bg-slate-700"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Children */}
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs font-bold text-white">Children</div>
                              <div className="text-[10px] text-slate-400">2 - 12 years</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setChildren(Math.max(0, children - 1))}
                                className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center hover:bg-slate-700"
                              >
                                -
                              </button>
                              <span className="w-5 text-center text-sm font-bold text-white">{children}</span>
                              <button
                                type="button"
                                onClick={() => setChildren(Math.min(6, children + 1))}
                                className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center hover:bg-slate-700"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Infants */}
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs font-bold text-white">Infants</div>
                              <div className="text-[10px] text-slate-400">Below 2 years</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setInfants(Math.max(0, infants - 1))}
                                className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center hover:bg-slate-700"
                              >
                                -
                              </button>
                              <span className="w-5 text-center text-sm font-bold text-white">{infants}</span>
                              <button
                                type="button"
                                onClick={() => setInfants(Math.min(4, infants + 1))}
                                className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center hover:bg-slate-700"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Cabin Class */}
                          <div className="pt-2 border-t border-slate-800">
                            <label className="block text-xs font-bold text-white mb-2">Cabin Class</label>
                            <div className="grid grid-cols-2 gap-1.5">
                              {(['economy', 'premium_economy', 'business', 'first'] as CabinClass[]).map((cls) => (
                                <button
                                  key={cls}
                                  type="button"
                                  onClick={() => setCabinClass(cls)}
                                  className={`p-1.5 rounded text-[11px] font-semibold capitalize border ${
                                    cabinClass === cls
                                      ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                                  }`}
                                >
                                  {cls.replace('_', ' ')}
                                </button>
                              ))}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setShowPassengerDropdown(false)}
                            className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors"
                          >
                            Done
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Redesigned Popular Corridor Presets */}
                  <div className="pt-2 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-bold text-[11px] sm:text-xs flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                        <span>Popular Corridor Presets (1-Click Route Selection):</span>
                      </span>
                      <span className="text-[10px] text-slate-500">Tap to load route</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
                      {[
                        { label: '🏡 Intra-State: Mumbai ↔ Pune (40m)', origin: 'BOM', dest: 'PNQ', tag: 'Intra-State', fare: '₹2,450' },
                        { label: '🏡 Intra-State: Chennai ↔ Madurai (50m)', origin: 'MAA', dest: 'IXM', tag: 'Intra-State', fare: '₹2,680' },
                        { label: '🏡 Intra-State: Bengaluru ↔ Mangaluru (45m)', origin: 'BLR', dest: 'IXE', tag: 'Intra-State', fare: '₹2,350' },
                        { label: '🇮🇳 Trunk: Delhi ↔ Mumbai (Non-Stop)', origin: 'DEL', dest: 'BOM', tag: 'Trunk Metro', fare: '₹4,200' },
                        { label: '🇮🇳 Tech Hub: Delhi ↔ Bengaluru', origin: 'DEL', dest: 'BLR', tag: 'Silicon', fare: '₹4,850' },
                        { label: '🏖️ Holiday: Mumbai ↔ Goa (Dabolim)', origin: 'BOM', dest: 'GOI', tag: 'Holiday', fare: '₹3,150' },
                        { label: '🏖️ Holiday: Bengaluru ↔ Kochi', origin: 'BLR', dest: 'COK', tag: 'Holiday', fare: '₹2,800' },
                        { label: '✈️ Gulf Express: Delhi ↔ Dubai (Non-Stop)', origin: 'DEL', dest: 'DXB', tag: 'Intl Flagship', fare: '₹14,500' },
                        { label: '✈️ Westbound: Mumbai ↔ London Heathrow', origin: 'BOM', dest: 'LHR', tag: 'Long-Haul', fare: '₹38,900' },
                        { label: '✈️ Far East: Bengaluru ↔ Singapore', origin: 'BLR', dest: 'SIN', tag: 'Airbus A350', fare: '₹16,200' },
                      ].map((preset, idx) => {
                        const isSelected = origin === preset.origin && destination === preset.dest;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setOrigin(preset.origin);
                              setDestination(preset.dest);
                              addToast(`Loaded corridor: ${preset.origin} → ${preset.dest} (${preset.tag})`, 'info');
                            }}
                            className={`w-full text-left px-3.5 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all flex items-center justify-between gap-2 ${
                              isSelected
                                ? 'bg-gradient-to-r from-blue-600/30 to-sky-600/30 border-sky-400 text-sky-200 shadow-md shadow-blue-500/20'
                                : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
                            }`}
                          >
                            <span className="truncate">{preset.label}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-black shrink-0 ${
                              isSelected ? 'bg-sky-500/30 text-sky-200' : 'bg-slate-800 text-slate-300'
                            }`}>
                              {preset.fare}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Search Action Bar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>{t('common.freeCancellation')}</span>
                    </div>

                    <button
                      type="submit"
                      id="search-flights-btn"
                      className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                    >
                      <Search className="w-4 h-4" />
                      <span>{t('search.searchFlights')}</span>
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>

          {/* Real-time Airport Weather Widget */}
          <div className="mt-6">
            <RealtimeAirportWeatherWidget
              originCode={origin}
              destinationCode={destination}
              onSelectAirport={(code) => setOrigin(code)}
              onNavigateToWeatherRadar={() => setUserView('weather_ops')}
            />
          </div>

          {/* Meteorological AI Data Scientist Weather Reader & Forecast Predictor */}
          <div className="mt-8">
            <MeteorologicalWeatherReader
              initialAirportCode={origin || 'BLR'}
              title="Meteorological AI Weather Reader & Fluid Dynamics Predictor"
            />
          </div>
        </div>
      </section>

      {/* AI Super-Intelligence Innovations Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* AI Visa Advisor */}
          <div 
            onClick={() => setUserView('visa_advisor')}
            className="group bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 font-bold">
                🛂
              </div>
              <h3 className="font-bold text-white text-sm group-hover:text-emerald-300 transition-colors">
                AI Visa & Entry Verifier
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Check instant immigration rules, passport validity rules & mandatory forms for 50+ countries.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-400">
              <span>Verify Visa Now</span>
              <span>→</span>
            </div>
          </div>

          {/* AI Weather Doppler & Zero-Risk Auto Cancel */}
          <div 
            onClick={() => setUserView('weather_ops')}
            className="group bg-slate-900 border border-slate-800 hover:border-sky-500/50 rounded-2xl p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400 font-bold">
                🌩️
              </div>
              <h3 className="font-bold text-white text-sm group-hover:text-sky-300 transition-colors">
                AI Weather Doppler Protection
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tracks cyclones & fog in real-time. Automatically grounds unsafe flights with 100% instant full refund.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-sky-400">
              <span>Launch Weather Watch</span>
              <span>→</span>
            </div>
          </div>

          {/* Competitor Price Comparison */}
          <div 
            onClick={() => {
              performSearch(searchParams);
            }}
            className="group bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 font-bold">
                💰
              </div>
              <h3 className="font-bold text-white text-sm group-hover:text-amber-300 transition-colors">
                Live Competitor Benchmarking
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Live side-by-side price tracking vs Air India, Emirates & IndiGo. Save up to 25% on every ticket.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-amber-400">
              <span>Compare Live Fares</span>
              <span>→</span>
            </div>
          </div>

          {/* AI Pre-Booking Predictor */}
          <div 
            onClick={() => {
              performSearch(searchParams);
            }}
            className="group bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 font-bold">
                🔮
              </div>
              <h3 className="font-bold text-white text-sm group-hover:text-purple-300 transition-colors">
                AI Pre-Booking Fare Predictor
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Machine learning algorithms predict future fare rises or drops before you complete your booking.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-purple-400">
              <span>View Predictions</span>
              <span>→</span>
            </div>
          </div>

        </div>
      </section>

      {/* Quick Lookup Toolbar: Flight Status & PNR Check-in */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Flight Status Lookup */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Live Flight Tracker</h4>
                <p className="text-xs text-slate-400">Check real-time gate, terminal, and on-time status</p>
              </div>
            </div>
            <button
              onClick={() => setUserView('flight_status')}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold rounded-lg border border-slate-700 transition-colors whitespace-nowrap"
            >
              Track Status →
            </button>
          </div>

          {/* Web Check-in Quick Bar */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Plane className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Instant Web Check-in</h4>
                <p className="text-xs text-slate-400">Enter PNR to get Boarding Pass (48h - 1h prior)</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <input
                type="text"
                placeholder="e.g. AW-892F1"
                value={quickPnrQuery}
                onChange={(e) => setQuickPnrQuery(e.target.value.toUpperCase())}
                className="bg-slate-950 border border-slate-700 text-white text-xs px-2.5 py-2 rounded-lg focus:outline-none focus:border-blue-500 w-28 uppercase"
              />
              <button
                onClick={() => {
                  if (quickPnrQuery) {
                    setTrackedPNR(quickPnrQuery);
                    setUserView('dashboard');
                  }
                }}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Go
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Exclusive Promotional Offers */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
              <Tag className="w-3.5 h-3.5" />
              <span>{t('home.specialPromotions', 'SPECIAL PROMOTIONS & DEALS')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">{t('home.exclusiveOffers', 'Exclusive Flight Offers')}</h2>
          </div>
          <button
            type="button"
            onClick={() => setUserView('deals')}
            className="px-3.5 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>{t('home.viewAllDeals', 'View All 12+ Featured Destinations & Offers')}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {OFFERS.map((offer) => (
            <div
              key={offer.id}
              className="group relative bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all duration-300 hover:shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                    {offer.tag}
                  </span>
                  <span className="text-[10px] text-slate-500">Exp: {offer.expiresOn}</span>
                </div>
                <h3 className="font-bold text-white text-sm group-hover:text-sky-300 transition-colors">
                  {offer.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {offer.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="bg-slate-950 px-2 py-1 rounded border border-dashed border-slate-700 text-xs font-mono font-bold text-sky-400">
                  {offer.code}
                </div>
                <button
                  type="button"
                  onClick={() => handleApplyOffer(offer.code)}
                  className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>Apply & Book</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Domestic & International Routes */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{t('home.trendingDestinations', 'TRENDING DESTINATIONS')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">{t('home.featuredDestinations', 'Featured Destinations & Popular Non-Stop Routes')}</h2>
          </div>
          <button
            type="button"
            onClick={() => setUserView('deals')}
            className="text-xs font-bold text-sky-400 hover:underline cursor-pointer"
          >
            {t('home.viewAllDeals', 'Explore All Featured Destinations →')}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularRoutes.map((route, idx) => (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl cursor-pointer group"
              onClick={() => {
                setOrigin(route.origin);
                setDestination(route.dest);
                const params: FlightSearchParams = {
                  tripType: 'one_way',
                  origin: route.origin,
                  destination: route.dest,
                  departureDate,
                  cabinClass: 'economy',
                  adults: 1,
                  children: 0,
                  infants: 0,
                  specialFare,
                };
                performSearch(params);
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl p-2 rounded-xl bg-slate-950 border border-slate-800">
                    {route.image}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base group-hover:text-sky-400 transition-colors">
                      {route.title}
                    </h3>
                    <p className="text-xs text-slate-400">{route.desc}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">From</span>
                  <span className="text-base font-extrabold text-emerald-400">
                    {formatCurrency(route.price, currency)}
                  </span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-slate-800 text-sky-400 group-hover:bg-blue-600 group-hover:text-white text-xs font-semibold transition-colors flex items-center gap-1">
                  <span>Book Now</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Fly AeroWings Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">The AeroWings Signature Experience</h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Setting international standards in airline comfort, on-time performance, and contactless service.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white text-sm mb-1">99.4% On-Time Record</h4>
              <p className="text-xs text-slate-400">Ranked best airline punctuality across all major transit hubs.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Coffee className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white text-sm mb-1">Curated In-flight Dining</h4>
              <p className="text-xs text-slate-400">Master-chef prepared hot meals, special diet & vegan choices.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Wifi className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white text-sm mb-1">High-Speed Satellite Wi-Fi</h4>
              <p className="text-xs text-slate-400">Stream movies and stay connected at 38,000 feet.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white text-sm mb-1">Zero Cancellation Risk</h4>
              <p className="text-xs text-slate-400">Instant full refunds processed directly back to your source account.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Website Teasers: Experience, SkyWings Loyalty Club & Travel Tools */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cabins & In-Flight Banner */}
        <div 
          onClick={() => {
            setUserView('experience');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="relative group bg-slate-900 border border-slate-800 hover:border-sky-500/50 rounded-3xl overflow-hidden p-6 sm:p-8 cursor-pointer transition-all duration-300 shadow-xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 via-slate-900/90 to-slate-950/90 z-0"></div>
          <div className="relative z-10">
            <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold uppercase tracking-wider">
              Cabin Classes & Hospitality
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white mt-3 mb-2 group-hover:text-sky-300 transition-colors">
              Experience First & Business Class Luxury
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Lie-flat beds, Michelin-inspired dining, noise-canceling headsets, and chauffeur airport transfers.
            </p>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-400 group-hover:translate-x-1 transition-transform">
              <span>Explore All Cabins & Lounges</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* SkyWings Club Loyalty Banner */}
        <div 
          onClick={() => {
            setUserView('loyalty');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="relative group bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-3xl overflow-hidden p-6 sm:p-8 cursor-pointer transition-all duration-300 shadow-xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-amber-950/30 via-slate-900/90 to-slate-950/90 z-0"></div>
          <div className="relative z-10">
            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold uppercase tracking-wider">
              Frequent Flyer Rewards
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white mt-3 mb-2 group-hover:text-amber-300 transition-colors">
              SkyWings Club Membership
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Earn miles on every mile flown. Enjoy complimentary seat upgrades, priority check-in, and lounge passes.
            </p>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-300 group-hover:translate-x-1 transition-transform">
              <span>Calculate Miles & Tier Benefits</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
