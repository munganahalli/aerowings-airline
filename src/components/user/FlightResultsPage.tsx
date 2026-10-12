import React, { useState, useMemo } from 'react';
import { useAirline } from '../../context/AirlineContext';
import { useLanguage } from '../../context/LanguageContext';
import { BookingStepBar } from '../common/BookingStepBar';
import { AIRPORTS } from '../../data/mockData';
import { formatCurrency } from '../../utils/airlineUtils';
import { Flight, RouteType } from '../../types/airline';
import { aiVoice } from '../../utils/aiVoice';
import { generateFlightsForRoute } from '../../utils/flightRouteGenerator';
import { RealtimeAirportWeatherWidget } from '../common/RealtimeAirportWeatherWidget';
import { getAirportWeatherImmediate } from '../../utils/realtimeWeather';
import { PrestigeOtpVerificationModal } from '../common/PrestigeOtpVerificationModal';
import {
  Plane,
  ArrowRight,
  Filter,
  SlidersHorizontal,
  Clock,
  Luggage,
  Coffee,
  Wifi,
  ChevronDown,
  ChevronUp,
  Shield,
  RotateCcw,
  Sparkles,
  Info,
  Calendar,
  Check,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Zap,
  Building2,
  Globe2,
  DollarSign,
  RefreshCw,
  Volume2,
  Search,
  X
} from 'lucide-react';

export const FlightResultsPage: React.FC = () => {
  const {
    searchParams,
    setSearchParams,
    flights,
    setSelectedFlight,
    setUserView,
    currency,
    instantWeatherRefund,
    instantWeatherRebook,
    bookings,
    verifiedBookingPhone,
    setVerifiedBookingPhone,
    addToast
  } = useAirline();
  const { t } = useLanguage();

  // Search Bar State
  const [flightSearchQuery, setFlightSearchQuery] = useState<string>('');
  
  // Filters State - Hidden by default as requested by user ("filters should be hide")
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedRouteType, setSelectedRouteType] = useState<'all' | RouteType>('all');
  const [selectedStops, setSelectedStops] = useState<number[]>([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(300000);
  const [sortBy, setSortBy] = useState<'cheapest' | 'fastest' | 'earliest' | 'latest'>('cheapest');
  const [expandedFlightId, setExpandedFlightId] = useState<string | null>(null);
  const [activeFlightDetailTab, setActiveFlightDetailTab] = useState<'details' | 'competitors' | 'ai_predict' | 'baggage' | 'fare_rules'>('details');
  const [comparingFlight, setComparingFlight] = useState<Flight | null>(null);
  const [otpModalOpen, setOtpModalOpen] = useState<boolean>(false);
  const [pendingFlight, setPendingFlight] = useState<Flight | null>(null);
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);

  const originAirport = AIRPORTS.find(a => a.code === searchParams.origin);
  const destAirport = AIRPORTS.find(a => a.code === searchParams.destination);

  // Match Flights by route and category
  const { directAvailableFlights, otherAvailableFlights } = useMemo(() => {
    let list = flights;

    if (selectedRouteType !== 'all') {
      list = list.filter(f => f.routeType === selectedRouteType);
    }

    // Apply Stops Filter
    if (selectedStops.length > 0) {
      list = list.filter(f => selectedStops.includes(f.stops));
    }

    // Apply Time Slots Filter
    if (selectedTimeSlots.length > 0) {
      list = list.filter(f => {
        const hour = parseInt(f.departureTime.split(':')[0], 10);
        if (selectedTimeSlots.includes('early_morning') && hour < 8) return true;
        if (selectedTimeSlots.includes('morning') && hour >= 8 && hour < 12) return true;
        if (selectedTimeSlots.includes('afternoon') && hour >= 12 && hour < 18) return true;
        if (selectedTimeSlots.includes('night') && hour >= 18) return true;
        return false;
      });
    }

    // Apply Airlines Filter
    if (selectedAirlines.length > 0) {
      list = list.filter(f => selectedAirlines.some(a => 
        f.airline.toLowerCase().includes(a.toLowerCase()) || 
        f.airlineCode.toLowerCase() === a.toLowerCase() ||
        a.toLowerCase().includes(f.airlineCode.toLowerCase())
      ));
    }

    // Apply Max Price Filter
    const cabin = searchParams.cabinClass;
    list = list.filter(f => (f.prices[cabin] || f.prices.economy) <= maxPrice);

    // Apply Live Search Query Filter (Flight number, city, or airline)
    if (flightSearchQuery.trim()) {
      const q = flightSearchQuery.trim().toLowerCase();
      list = list.filter(f =>
        f.flightNumber.toLowerCase().includes(q) ||
        f.airline.toLowerCase().includes(q) ||
        f.airlineCode.toLowerCase().includes(q) ||
        f.origin.city.toLowerCase().includes(q) ||
        f.origin.code.toLowerCase().includes(q) ||
        f.destination.city.toLowerCase().includes(q) ||
        f.destination.code.toLowerCase().includes(q) ||
        f.aircraft.toLowerCase().includes(q)
      );
    }

    // Apply Sorting
    const sorted = [...list].sort((a, b) => {
      const priceA = a.prices[cabin] || a.prices.economy;
      const priceB = b.prices[cabin] || b.prices.economy;

      if (sortBy === 'cheapest') return priceA - priceB;
      if (sortBy === 'fastest') return a.durationMinutes - b.durationMinutes;
      if (sortBy === 'earliest') return a.departureTime.localeCompare(b.departureTime);
      if (sortBy === 'latest') return b.departureTime.localeCompare(a.departureTime);
      return 0;
    });

    let direct = sorted.filter(f => 
      f.origin.code.toUpperCase() === (searchParams.origin || '').toUpperCase() && 
      f.destination.code.toUpperCase() === (searchParams.destination || '').toUpperCase()
    );

    // If no direct flights exist for this pair in the static list, provide dynamic generated flights
    if (direct.length === 0 && searchParams.origin && searchParams.destination && searchParams.origin !== searchParams.destination) {
      const generated = generateFlightsForRoute(searchParams.origin, searchParams.destination);
      direct = generated;
    }

    const others = sorted.filter(f => 
      !(f.origin.code.toUpperCase() === (searchParams.origin || '').toUpperCase() && 
        f.destination.code.toUpperCase() === (searchParams.destination || '').toUpperCase())
    );

    return {
      directAvailableFlights: direct,
      otherAvailableFlights: others
    };
  }, [flights, searchParams, selectedRouteType, selectedStops, selectedTimeSlots, selectedAirlines, maxPrice, sortBy, flightSearchQuery]);

  // Date Ribbon (+/- 3 days)
  const dateRibbon = useMemo(() => {
    const base = new Date(searchParams.departureDate || Date.now());
    const days = [];
    for (let i = -3; i <= 3; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const isCurrent = i === 0;
      const fakeLowestFare = 4500 + Math.abs(i) * 350;
      days.push({
        dateStr: d.toISOString().split('T')[0],
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayMonth: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        isCurrent,
        price: fakeLowestFare,
      });
    }
    return days;
  }, [searchParams.departureDate]);

  const handleSelectFlight = (flight: Flight) => {
    if (flight.status === 'Cancelled') {
      addToast('This flight has been auto-cancelled due to severe weather. Please select a safe operational flight.', 'error');
      aiVoice.speak(`Notice: Flight ${flight.flightNumber} is currently grounded due to adverse weather. Please choose another scheduled flight.`);
      return;
    }
    
    // Proceed directly to passenger booking with zero OTP blocker
    proceedToBooking(flight);
  };

  const proceedToBooking = (flight: Flight) => {
    setSelectedFlight(flight);
    aiVoice.announceFlightSelected(
      flight.airline,
      flight.flightNumber,
      flight.origin.city,
      flight.destination.city,
      flight.aircraft,
      flight.weather?.condition || 'Clear'
    );
    setUserView('passengers');
  };

  const handleOtpVerified = (bookingToken: string, phone: string) => {
    setVerifiedPhone(phone);
    if (typeof setVerifiedBookingPhone === 'function') {
      setVerifiedBookingPhone(phone);
    }
    setOtpModalOpen(false);
    if (pendingFlight) {
      proceedToBooking(pendingFlight);
      addToast(`OTP Verified for ${phone}! Proceeding to Passenger Details.`, 'success');
    }
  };

  const cabinLabel = searchParams.cabinClass.replace('_', ' ');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Universal Step 1 Bar */}
      <BookingStepBar
        currentStep={1}
        stepTitle="Choose Flights"
        stepSubtitle="Compare fares, airline schedules, and select your flight."
        voiceText="Step 1: Choose your flight. Browse through available direct intra-state, inter-state, and international flights with transparent pricing."
        firstTimeFlyerTip="💡 First-Time Flyer Tip: All AeroWings flights include 7 kg cabin handbag and 15 kg check-in luggage at ₹0 free! You can filter by non-stop flights and check real-time weather safety scores before selecting."
      />

      {/* Route Summary Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-sky-400">
            <Plane className="w-6 h-6 transform -rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-base sm:text-xl font-bold text-white">
              <span>{originAirport?.city || searchParams.origin} ({searchParams.origin})</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <span>{destAirport?.city || searchParams.destination} ({searchParams.destination})</span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
              <span>{new Date(searchParams.departureDate).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
              <span>•</span>
              <span className="capitalize">{cabinLabel} Class</span>
              <span>•</span>
              <span>{searchParams.adults + searchParams.children + searchParams.infants} Traveler(s)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setUserView('visa_advisor')}
            className="px-3.5 py-2 bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-400 text-xs font-semibold rounded-xl border border-emerald-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Verify Visa Rules</span>
          </button>

          <button
            onClick={() => setUserView('weather_ops')}
            className="px-3.5 py-2 bg-sky-950/40 hover:bg-sky-900/40 text-sky-400 text-xs font-semibold rounded-xl border border-sky-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>AI Weather Radar</span>
          </button>

          <button
            onClick={() => setUserView('home')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer"
          >
            {t('common.modifySearch')}
          </button>
        </div>
      </div>

      {/* Real-time Route Weather Bar */}
      <RealtimeAirportWeatherWidget
        originCode={searchParams.origin}
        destinationCode={searchParams.destination}
        showBoth={true}
        onNavigateToWeatherRadar={() => setUserView('weather_ops')}
      />

      {/* Live Special Concession Fares Bar */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-3.5 sm:p-4 shadow-lg space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Special Concession Fares:</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {[
              { id: 'regular', label: 'Regular' },
              { id: 'student', label: 'Student (10% Off + 10kg Bags)' },
              { id: 'senior', label: 'Senior (12% Off)' },
              { id: 'armed_forces', label: 'Defence (15% Off)' },
              { id: 'doctors_nurses', label: 'Doctors & Nurses (10% Off)' },
            ].map((item) => {
              const active = (searchParams.specialFare || 'regular') === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSearchParams(prev => ({ ...prev, specialFare: item.id as any }));
                    addToast(`Applied ${item.label} to all flights`, 'success');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    active
                      ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-md shadow-amber-500/20'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {active && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        {(searchParams.specialFare && searchParams.specialFare !== 'regular') && (
          <div className="pt-2 border-t border-slate-800/80 text-xs text-amber-300 flex items-center justify-between flex-wrap gap-2">
            <span>
              ✅ <strong>Concession Active:</strong>{' '}
              {searchParams.specialFare === 'student' && '10% Instant Discount applied on all flight fares below + 10kg Extra Free Check-in Baggage (Total 25kg).'}
              {searchParams.specialFare === 'senior' && '12% Senior Citizen Instant Discount applied on all flight fares below + Priority Boarding.'}
              {searchParams.specialFare === 'armed_forces' && '15% Armed Forces / Defence Instant Discount applied on all flight fares below.'}
              {searchParams.specialFare === 'doctors_nurses' && '10% Doctors & Nurses Instant Discount applied on all flight fares below + Free Date Change.'}
            </span>
          </div>
        )}
      </div>

      {/* Route Type Tabs (Intra-State, Inter-State, International) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: '🌐 All Flight Categories', desc: 'Complete Network' },
          { id: 'intra_state', label: '🏡 Intra-State Flights', desc: 'Within Same State' },
          { id: 'inter_state', label: '🇮🇳 Inter-State Domestic', desc: 'State-to-State Hubs' },
          { id: 'international', label: '✈️ International Long-Haul', desc: 'Country-to-Country' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedRouteType(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 border cursor-pointer ${
              selectedRouteType === tab.id
                ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
              selectedRouteType === tab.id ? 'bg-blue-700/60 text-blue-100' : 'bg-slate-950 text-slate-500'
            }`}>
              {tab.desc}
            </span>
          </button>
        ))}
      </div>

      {/* Date Ribbon Strip */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-2 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {dateRibbon.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSearchParams(prev => ({ ...prev, departureDate: item.dateStr }));
              }}
              className={`flex-1 min-w-[120px] p-2.5 rounded-xl text-center border transition-all cursor-pointer ${
                item.isCurrent
                  ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="text-xs font-semibold">{item.dayName}, {item.dayMonth}</div>
              <div className={`text-[11px] font-bold mt-1 ${item.isCurrent ? 'text-blue-100' : 'text-emerald-400'}`}>
                From {formatCurrency(item.price, currency)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Flight Search Bar & Controls */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Real-time Flight Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-sky-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={flightSearchQuery}
              onChange={(e) => setFlightSearchQuery(e.target.value)}
              placeholder="Search flight number (e.g. AW-102, 6E-204), city, or airline..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
            />
            {flightSearchQuery && (
              <button
                type="button"
                onClick={() => setFlightSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Toggle Hide/Show Filters Button */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 shadow-sm ${
              showFilters
                ? 'bg-blue-600 text-white border-blue-500 hover:bg-blue-500'
                : 'bg-slate-950 text-slate-300 border-slate-700 hover:text-white hover:border-slate-600'
            }`}
            title="Toggle filter sidebar visibility"
          >
            <SlidersHorizontal className="w-4 h-4 text-sky-400" />
            <span>{showFilters ? t('common.hideFilters') : t('common.showFilters')}</span>
            {!showFilters && (
              <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                Hidden
              </span>
            )}
          </button>
        </div>

        {/* Quick Filter Tag Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs text-slate-300">
          <span className="text-[11px] text-slate-500 font-semibold shrink-0">{t('common.quickFilters')}:</span>
          <button
            type="button"
            onClick={() => {
              setSelectedStops(selectedStops.includes(0) ? [] : [0]);
            }}
            className={`px-2.5 py-1 rounded-lg border text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
              selectedStops.includes(0)
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            ⚡ {t('results.nonStop')}
          </button>
          <button
            type="button"
            onClick={() => {
              setMaxPrice(maxPrice === 6000 ? 300000 : 6000);
            }}
            className={`px-2.5 py-1 rounded-lg border text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
              maxPrice === 6000
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            🏷️ Under ₹6,000
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedAirlines(selectedAirlines.includes('AeroWings') ? [] : ['AeroWings']);
            }}
            className={`px-2.5 py-1 rounded-lg border text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
              selectedAirlines.includes('AeroWings')
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            ✈️ AeroWings Exclusive
          </button>
          {flightSearchQuery && (
            <span className="text-[11px] text-sky-400 font-medium ml-auto shrink-0">
              Matching: &quot;{flightSearchQuery}&quot;
            </span>
          )}
        </div>
      </div>

      {/* Main Grid: Filters & Flight Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Filter Sidebar (Hidden by default, toggled via showFilters button) */}
        {showFilters && (
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Filter className="w-4 h-4 text-sky-400" />
                  <span>Filter Flights</span>
                </div>
                <div className="flex items-center gap-2">
                  {(selectedStops.length > 0 || selectedTimeSlots.length > 0 || selectedAirlines.length > 0 || selectedRouteType !== 'all') && (
                    <button
                      onClick={() => {
                        setSelectedStops([]);
                        setSelectedTimeSlots([]);
                        setSelectedAirlines([]);
                        setSelectedRouteType('all');
                        setMaxPrice(300000);
                      }}
                      className="text-xs text-sky-400 hover:underline cursor-pointer"
                    >
                      Reset All
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowFilters(false)}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                    title="Hide filters"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

            {/* Stops Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">Stops</label>
              <div className="space-y-1.5">
                {[
                  { label: 'Non-Stop Direct', value: 0 },
                  { label: '1 Stop Layover', value: 1 },
                ].map((s) => (
                  <label
                    key={s.value}
                    className="flex items-center justify-between text-xs text-slate-300 p-2 rounded-lg hover:bg-slate-800/60 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedStops.includes(s.value)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedStops([...selectedStops, s.value]);
                          else setSelectedStops(selectedStops.filter(x => x !== s.value));
                        }}
                        className="rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-0 cursor-pointer"
                      />
                      <span>{s.label}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Departure Time Slots */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">Departure Time</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'early_morning', label: 'Early Morning', time: 'Before 8 AM' },
                  { id: 'morning', label: 'Morning', time: '8 AM - 12 PM' },
                  { id: 'afternoon', label: 'Afternoon', time: '12 PM - 6 PM' },
                  { id: 'night', label: 'Night', time: 'After 6 PM' },
                ].map((slot) => {
                  const active = selectedTimeSlots.includes(slot.id);
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => {
                        if (active) setSelectedTimeSlots(selectedTimeSlots.filter(s => s !== slot.id));
                        else setSelectedTimeSlots([...selectedTimeSlots, slot.id]);
                      }}
                      className={`p-2 rounded-xl border text-left transition-colors cursor-pointer ${
                        active
                          ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-semibold text-[11px] text-white">{slot.label}</div>
                      <div className="text-[10px] text-slate-400">{slot.time}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Airlines Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">Airlines</label>
              <div className="space-y-1.5">
                {[
                  { name: 'AeroWings', code: 'AW', badge: 'Flagship Airline', color: 'text-sky-400' },
                  { name: 'IndiGo', code: '6E', badge: 'Domestic Carrier', color: 'text-blue-400' },
                  { name: 'Air India', code: 'AI', badge: 'National Carrier', color: 'text-red-400' },
                  { name: 'Akasa Air', code: 'QP', badge: 'Budget Eco', color: 'text-amber-400' },
                  { name: 'SpiceJet', code: 'SG', badge: 'Express Carrier', color: 'text-orange-400' },
                  { name: 'Emirates / SQ / BA', code: 'INTL', badge: 'Global Partners', color: 'text-purple-400' },
                ].map((airlineItem) => {
                  const isChecked = selectedAirlines.includes(airlineItem.name) || selectedAirlines.includes(airlineItem.code);
                  return (
                    <label
                      key={airlineItem.code}
                      className={`flex items-center justify-between text-xs p-2 rounded-xl border transition-colors cursor-pointer ${
                        isChecked 
                          ? 'bg-blue-600/15 border-blue-500/40 text-white' 
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAirlines([...selectedAirlines, airlineItem.name]);
                            } else {
                              setSelectedAirlines(selectedAirlines.filter(a => a !== airlineItem.name && a !== airlineItem.code));
                            }
                          }}
                          className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0 cursor-pointer"
                        />
                        <span className="font-semibold">{airlineItem.name}</span>
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono">
                        {airlineItem.code}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* AI Zero-Cancellation Guarantee Badge */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-950/40 to-slate-950 border border-emerald-500/30 text-xs space-y-1.5">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                <span>AI Weather Protection</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                If bad weather forces any flight cancellation, AeroWings AI automatically processes 100% instant full refund or rebooks you with zero fee.
              </p>
            </div>
          </div>
        )}

        {/* Flight Cards Stream - Takes 12 columns if filters are hidden */}
        <div className={showFilters ? 'lg:col-span-9 space-y-4' : 'lg:col-span-12 space-y-4'}>
          
          {/* Sorting Tab Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 font-semibold text-slate-400 px-2">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Sort By:</span>
              </div>
              {!showFilters && (
                <button
                  type="button"
                  onClick={() => setShowFilters(true)}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                >
                  <Filter className="w-3 h-3 text-sky-400" />
                  <span>Show Filters</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'cheapest', label: 'Cheapest Fare' },
                { id: 'fastest', label: 'Fastest Flight' },
                { id: 'earliest', label: 'Earliest Departure' },
                { id: 'latest', label: 'Latest Departure' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSortBy(s.id as any)}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                    sortBy === s.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count Summary */}
          <div className="text-xs text-slate-400 px-1 flex flex-wrap items-center justify-between gap-2">
            <span>
              Found <span className="font-bold text-emerald-400">{directAvailableFlights.length}</span> direct flight(s) and <span className="font-bold text-sky-400">{otherAvailableFlights.length}</span> network flight(s)
            </span>
            <span className="text-emerald-400 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Real-time Seat & Flight Status Verified</span>
            </span>
          </div>

          {/* Helper Function to render single flight card */}
          {(() => {
            const renderCard = (flight: Flight, isAlternative: boolean = false) => {
              const cabin = searchParams.cabinClass;
              const baseFarePerPax = flight.prices[cabin] || flight.prices.economy;
              let effectiveFare = baseFarePerPax;
              let specialFareLabel = '';

              if (searchParams.specialFare === 'student') {
                effectiveFare = Math.round(baseFarePerPax * 0.90);
                specialFareLabel = '🎓 Student (10% Off + 10kg Bag)';
              } else if (searchParams.specialFare === 'senior') {
                effectiveFare = Math.round(baseFarePerPax * 0.88);
                specialFareLabel = '👴 Senior Citizen (12% Off)';
              } else if (searchParams.specialFare === 'armed_forces') {
                effectiveFare = Math.round(baseFarePerPax * 0.85);
                specialFareLabel = '🎖️ Defence (15% Off)';
              } else if (searchParams.specialFare === 'doctors_nurses') {
                effectiveFare = Math.round(baseFarePerPax * 0.90);
                specialFareLabel = '🩺 Doctors & Nurses (10% Off)';
              }

              const fare = effectiveFare;
              const hasSpecialDiscount = effectiveFare < baseFarePerPax;
              const isExpanded = expandedFlightId === flight.id;
              const isCancelled = flight.status === 'Cancelled';
              const aiPrediction = flight.aiPrediction;
              const competitorData = flight.competitors;

              // Calculate competitor price difference
              const savingsAmount = flight.savingsVsMarket || (flight.avgMarketPrice > fare ? flight.avgMarketPrice - fare : 0);

              const totalSeats = flight.totalSeats || 180;
              const availableSeatsCount = typeof flight.availableSeats === 'number' 
                ? flight.availableSeats 
                : (flight.availableSeats[cabin] || flight.availableSeats.economy || 42);
              const bookedSeats = Math.max(0, totalSeats - availableSeatsCount);

              const weatherCancellationRisk = flight.weather?.aiCancellationRisk === 'Critical - Auto Cancelled'
                ? 100
                : flight.weather?.aiCancellationRisk === 'High'
                ? 35
                : flight.weather?.aiCancellationRisk === 'Moderate'
                ? 15
                : 2;

              return (
                <div
                  key={flight.id}
                  className={`bg-slate-900 border rounded-2xl overflow-hidden shadow-lg transition-all duration-200 ${
                    isCancelled 
                      ? 'border-red-500/50 bg-red-950/10' 
                      : isAlternative
                      ? 'border-slate-800/80 hover:border-sky-500/40 bg-slate-900/90'
                      : 'border-slate-800 hover:border-blue-500/50'
                  }`}
                >
                  {/* AI Prediction Ribbon / Top Banner */}
                  {aiPrediction && !isCancelled && (
                    <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 px-4 py-2 border-b border-blue-900/30 flex flex-wrap items-center justify-between text-xs gap-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                        <span className="font-semibold text-slate-200">
                          AI Prediction: <span className="text-sky-300">{aiPrediction.seatRecommendation || 'Optimal Value Route'}</span>
                        </span>
                        <span className="text-slate-500 hidden sm:inline">•</span>
                        <span className="text-slate-400 hidden sm:inline">Trend: {aiPrediction.fareTrend}</span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="text-emerald-400 font-semibold">
                          ⚡ On-Time Score: {aiPrediction.onTimeProbability}%
                        </span>
                        <span className="text-sky-400 font-semibold">
                          🌤️ Weather Safety: {100 - weatherCancellationRisk}%
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Severe Weather Auto-Cancelled Alert Banner */}
                  {isCancelled && (
                    <div className="bg-red-950/60 border-b border-red-500/40 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 text-red-300 font-semibold">
                        <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                        <span>AI Doppler Alert: {flight.weather?.aiAutoCancelReason || 'Auto-cancelled due to hazardous weather'}</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                        ⚡ 100% Instant Refund Guaranteed
                      </span>
                    </div>
                  )}

                  <div className="p-4 sm:p-5">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      
                      {/* Airline & Aircraft & Route Badge */}
                      <div className="md:col-span-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">
                            {flight.airlineCode}
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm flex items-center gap-1.5 flex-wrap">
                              <span>{flight.airline}</span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                flight.routeType === 'intra_state' 
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                  : flight.routeType === 'international'
                                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              }`}>
                                {flight.routeType === 'intra_state' ? '🏡 Intra-State' : flight.routeType === 'international' ? '✈️ International' : '🇮🇳 Inter-State'}
                              </span>
                              {isAlternative && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  Alternative Route
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <span className="font-semibold text-slate-300">{flight.flightNumber}</span>
                              <span>•</span>
                              <span>{flight.aircraft}</span>
                              {flight.aircraftRegistration && (
                                <span className="px-1.5 py-0.2 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-sky-300 font-medium">
                                  {flight.aircraftRegistration}
                                </span>
                              )}
                            </div>
                            
                            {/* Live Flight Operational Condition Badge */}
                            <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                              {flight.status === 'On Time' && (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                                  ● On Time
                                </span>
                              )}
                              {flight.status === 'Boarding' && (
                                <span className="px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-400 border border-sky-500/30 text-[10px] font-bold animate-pulse">
                                  ● Boarding Gate {flight.gate || '22'}
                                </span>
                              )}
                              {flight.status === 'Delayed' && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                                  ● Delayed (+{flight.delayMinutes || 25}m)
                                </span>
                              )}
                              {flight.status === 'Cancelled' && (
                                <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-bold">
                                  ● Weather Cancelled (100% Refund)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Flight Timings & Duration */}
                      <div className="md:col-span-5">
                        <div className="flex items-center justify-between gap-3 text-center">
                          {/* Departure */}
                          <div className="text-left">
                            <div className="text-xl font-extrabold text-white">{flight.departureTime}</div>
                            <div className="text-xs font-semibold text-sky-400">{flight.origin.code}</div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[90px]">{flight.origin.city}</div>
                          </div>

                          {/* Flight Line */}
                          <div className="flex-1 px-2">
                            <div className="text-[10px] text-slate-400 mb-1">{flight.duration}</div>
                            <div className="relative flex items-center justify-center">
                              <div className="h-[2px] w-full bg-slate-700"></div>
                              <Plane className="w-3.5 h-3.5 text-sky-400 absolute transform rotate-90" />
                            </div>
                            <div className="text-[10px] font-semibold text-emerald-400 mt-1">
                              {flight.stops === 0 ? 'Non-Stop' : `1 Stop (${flight.layoverAirport || 'Transit'})`}
                            </div>
                          </div>

                          {/* Arrival */}
                          <div className="text-right">
                            <div className="text-xl font-extrabold text-white">{flight.arrivalTime}</div>
                            <div className="text-xs font-semibold text-sky-400">{flight.destination.code}</div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[90px]">{flight.destination.city}</div>
                          </div>
                        </div>
                      </div>

                      {/* Pricing & CTA & Competitor Difference */}
                      <div className="md:col-span-4 flex flex-row md:flex-col items-center md:items-end justify-between gap-2 border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
                        <div className="text-left md:text-right">
                          {specialFareLabel && (
                            <span className="inline-block px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold mb-1">
                              {specialFareLabel}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Fare / pax</span>
                          <div className="flex items-baseline gap-2 md:justify-end">
                            {hasSpecialDiscount && (
                              <span className="line-through text-slate-500 text-xs font-semibold">
                                {formatCurrency(baseFarePerPax, currency)}
                              </span>
                            )}
                            <div className="text-xl sm:text-2xl font-extrabold text-emerald-400">
                              {formatCurrency(fare, currency)}
                            </div>
                          </div>
                          
                          {/* Competitor Price Difference Tag */}
                          {savingsAmount > 0 && (
                            <div className="text-[10px] font-bold text-amber-300 flex items-center gap-1 md:justify-end mt-0.5">
                              <span>Save {formatCurrency(savingsAmount, currency)} vs Competitors</span>
                            </div>
                          )}
                        </div>

                        {isCancelled ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                const sampleBooking = bookings[0];
                                if (sampleBooking) instantWeatherRefund(sampleBooking.pnr);
                                else addToast('100% Instant Weather Refund Disbursed with ₹0 deduction!', 'success');
                              }}
                              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                            >
                              ⚡ Claim Refund
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              id={`select-flight-${flight.id}`}
                              onClick={() => handleSelectFlight(flight)}
                              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer whitespace-nowrap"
                            >
                              {t('results.bookNow')} →
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Delay or Cancellation Notice Banner */}
                    {flight.status === 'Delayed' && flight.delayReason && (
                      <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <div>
                          <strong className="font-semibold">Flight Delay Condition:</strong> {flight.delayReason}
                        </div>
                      </div>
                    )}

                    {flight.status === 'Cancelled' && flight.cancellationReason && (
                      <div className="mt-3 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                        <div>
                          <strong className="font-semibold">Cancellation Condition:</strong> {flight.cancellationReason}
                        </div>
                      </div>
                    )}

                    {/* Live Seat Inventory Bar (Total, Available, Booked) */}
                    <div className="mt-3 py-2 px-3 rounded-xl bg-slate-950/90 border border-slate-800/90 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 text-slate-300">
                        <span className="font-bold text-white text-[11px]">💺 Seat Capacity:</span>
                        <span className="text-slate-400 text-[11px]">Total: <strong className="text-white">{totalSeats}</strong></span>
                        <span className="text-slate-600">•</span>
                        <span className="text-emerald-400 font-bold text-[11px]">Available: {availableSeatsCount}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-amber-400 text-[11px]">Booked: {bookedSeats}</span>
                      </div>

                      {/* Progress Bar of Seat Occupancy */}
                      <div className="flex items-center gap-2 flex-1 max-w-xs">
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full"
                            style={{ width: `${Math.round((bookedSeats / totalSeats) * 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {Math.round((bookedSeats / totalSeats) * 100)}% Filled
                        </span>
                      </div>
                    </div>

                    {/* Live Weather & Atmospheric Safety Badge */}
                    {(() => {
                      const liveOriginW = getAirportWeatherImmediate(flight.origin.code);
                      const liveDestW = getAirportWeatherImmediate(flight.destination.code);
                      // Always use live real-time API temperature and conditions from Open-Meteo, unless specifically disrupted
                      const isDisrupted = flight.status === 'Cancelled' || flight.status === 'Delayed';
                      const effectiveCondition = isDisrupted ? (flight.weather?.condition || 'Severe Disruption') : liveOriginW.conditionText;
                      const effectiveTemp = liveOriginW.temperatureC;
                      const effectiveWind = liveOriginW.windSpeedKmh;
                      const effectiveVis = liveOriginW.visibilityKm;

                      return (
                        <div className="mt-3 py-2 px-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl flex-shrink-0">
                              {effectiveCondition.includes('Clear') ? '☀️' : 
                               effectiveCondition.includes('Rain') || effectiveCondition.includes('Drizzle') ? '🌧️' : 
                               effectiveCondition.includes('Thunderstorm') ? '⛈️' : 
                               effectiveCondition.includes('Fog') ? '🌫️' : 
                               effectiveCondition.includes('Cyclone') ? '🌪️' : 
                               effectiveCondition.includes('Blizzard') || effectiveCondition.includes('Snow') ? '❄️' : '⛅'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-white text-xs">
                                  Weather at {flight.origin.city} ({flight.origin.code}): <span className="text-sky-300">{effectiveCondition}</span>
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/30 text-sky-400 font-mono font-bold text-[11px]">
                                  {effectiveTemp}°C
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  ➔ {flight.destination.city} ({flight.destination.code}): <strong className="text-amber-300">{liveDestW.temperatureC}°C</strong>
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5 flex-wrap">
                                <span>💨 Wind: <strong className="text-slate-300">{effectiveWind} km/h</strong></span>
                                <span>•</span>
                                <span>👁️ Visibility: <strong className="text-slate-300">{effectiveVis} km</strong></span>
                                <span>•</span>
                                <span>🛡️ Safety Score: <strong className="text-emerald-400">{100 - weatherCancellationRisk}%</strong></span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setExpandedFlightId(flight.id);
                                setActiveFlightDetailTab('ai_predict');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-purple-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                              <span>Weather & Fare Predictor</span>
                            </button>

                            <div className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border flex items-center gap-1 ${
                              flight.weather?.aiCancellationRisk === 'Critical - Auto Cancelled' || flight.status === 'Cancelled'
                                ? 'bg-red-500/20 text-red-300 border-red-500/40'
                                : flight.weather?.aiCancellationRisk === 'Moderate'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            }`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
                              <span>AI Risk: {flight.status === 'Cancelled' ? 'Grounded (100% Refund)' : (flight.weather?.aiCancellationRisk || 'Low / Safe')}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Competitor Price Comparison Bar */}
                    {competitorData && competitorData.length > 0 && (
                      <div className="mt-3.5 pt-2.5 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 text-slate-300 flex-wrap">
                          <span className="text-slate-400 font-medium">Market Live Comparison:</span>
                          {competitorData.slice(0, 3).map((comp, cIdx) => (
                            <span key={cIdx} className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 text-[11px]">
                              {comp.competitorName}: {formatCurrency(comp.price, currency)}
                            </span>
                          ))}
                        </div>

                        <button
                          onClick={() => setComparingFlight(flight)}
                          className="text-amber-400 hover:text-amber-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <span>Compare Airline Amenities & Inclusions →</span>
                        </button>
                      </div>
                    )}

                    {/* Comprehensive Inclusions & Safety Equipment Bar */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                      <div className="flex items-center gap-3 flex-wrap text-[11px]">
                        <span className="flex items-center gap-1 text-slate-300">
                          <Luggage className="w-3.5 h-3.5 text-sky-400" />
                          <span>
                            Cabin: {flight.baggageAllowance.cabin} • Check-in: {searchParams.specialFare === 'student' ? '25 kg (15kg + 10kg Student Bonus)' : flight.baggageAllowance.checkIn}
                          </span>
                        </span>
                        <span className="flex items-center gap-1 text-slate-300">
                          <Coffee className="w-3.5 h-3.5 text-amber-400" />
                          <span>Hot Meal</span>
                        </span>
                        <span className="flex items-center gap-1 text-slate-300">
                          <Wifi className="w-3.5 h-3.5 text-purple-400" />
                          <span>High-Speed Wi-Fi</span>
                        </span>
                        <span className="flex items-center gap-1 text-slate-300">
                          <Shield className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Safety Equipment (Life Vests, First Aid)</span>
                        </span>
                        <span className="flex items-center gap-1 text-slate-300">
                          <span>🚻 Sanitized Washrooms</span>
                        </span>
                      </div>

                      <button
                        onClick={() => setExpandedFlightId(isExpanded ? null : flight.id)}
                        className="text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 text-[11px] cursor-pointer"
                      >
                        <span>{isExpanded ? 'Hide Details' : 'View Flight Details & Rules'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Flight Details Drawer */}
                  {isExpanded && (
                    <div className="bg-slate-950 border-t border-slate-800 p-4 text-xs space-y-4 animate-in slide-in-from-top-2">
                      <div className="flex border-b border-slate-800 gap-4 pb-2">
                        <button
                          onClick={() => setActiveFlightDetailTab('details')}
                          className={`font-bold pb-1 border-b-2 transition-colors ${
                            activeFlightDetailTab === 'details' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400'
                          }`}
                        >
                          Flight Itinerary
                        </button>
                        <button
                          onClick={() => setActiveFlightDetailTab('ai_predict')}
                          className={`font-bold pb-1 border-b-2 transition-colors ${
                            activeFlightDetailTab === 'ai_predict' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400'
                          }`}
                        >
                          AI Smart Analysis
                        </button>
                        <button
                          onClick={() => setActiveFlightDetailTab('baggage')}
                          className={`font-bold pb-1 border-b-2 transition-colors ${
                            activeFlightDetailTab === 'baggage' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400'
                          }`}
                        >
                          Baggage Allowance
                        </button>
                        <button
                          onClick={() => setActiveFlightDetailTab('fare_rules')}
                          className={`font-bold pb-1 border-b-2 transition-colors ${
                            activeFlightDetailTab === 'fare_rules' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400'
                          }`}
                        >
                          Cancellation & Zero-Risk Policy
                        </button>
                      </div>

                      {activeFlightDetailTab === 'details' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-300">
                          <div className="space-y-1">
                            <div className="font-bold text-white">{flight.origin.city} ({flight.origin.code})</div>
                            <div className="text-slate-400">{flight.origin.name} - Terminal {flight.terminal || 'T3'}</div>
                            <div className="text-amber-400">Boarding Gate: {flight.gate || 'Gate 22'}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="font-bold text-white">{flight.destination.city} ({flight.destination.code})</div>
                            <div className="text-slate-400">{flight.destination.name} - Terminal {flight.destination.terminal || 'T2'}</div>
                            <div className="text-emerald-400">Current Status: {flight.status}</div>
                          </div>
                        </div>
                      )}

                      {activeFlightDetailTab === 'ai_predict' && (
                        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-4">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="font-bold text-sky-400 flex items-center gap-2">
                              <Sparkles className="w-4 h-4" />
                              <span>AI Weather & Pre-Booking Fare Predictor ({flight.origin.code} ➔ {flight.destination.code})</span>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                              Live Doppler + ML Fare Engine
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
                            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                              <div className="text-slate-400 text-[10px]">Predicted Price Trend</div>
                              <div className="text-xs font-bold text-amber-300 mt-1 uppercase">{aiPrediction?.fareTrend?.replace('_', ' ') || 'Rising Soon (+8%)'}</div>
                            </div>
                            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                              <div className="text-slate-400 text-[10px]">On-Time Punctuality</div>
                              <div className="text-xs font-bold text-emerald-400 mt-1">{aiPrediction?.onTimeProbability || 96}% (High)</div>
                            </div>
                            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                              <div className="text-slate-400 text-[10px]">Corridor Weather Risk</div>
                              <div className="text-xs font-bold text-sky-400 mt-1">{100 - weatherCancellationRisk}% Safe VFR</div>
                            </div>
                            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                              <div className="text-slate-400 text-[10px]">Turbulence Forecast</div>
                              <div className="text-xs font-bold text-emerald-300 mt-1">Smooth (LightChops &lt; 5%)</div>
                            </div>
                          </div>

                          {/* 5-Day Corridor Weather & Fare Prediction Matrix */}
                          <div className="space-y-2">
                            <div className="text-[11px] font-bold text-slate-300">5-Day Route Weather & Dynamic Fare Forecast:</div>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                              {[0, 1, 2, 3, 4].map((offset) => {
                                const d = new Date(searchParams.departureDate || Date.now());
                                d.setDate(d.getDate() + offset);
                                const baseOriginW = getAirportWeatherImmediate(flight.origin.code);
                                const dayTemp = baseOriginW.temperatureC + (offset % 2 === 0 ? 1 : -1);
                                const dayFare = Math.round(fare * (1 + offset * 0.04));
                                const daySafety = Math.min(99, Math.max(85, baseOriginW.safetyScore - offset));
                                return (
                                  <div key={offset} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
                                    <div className="text-[10px] font-bold text-slate-400">
                                      {offset === 0 ? 'Selected Date' : d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
                                    </div>
                                    <div className="text-xs font-extrabold text-white">
                                      ☀️ {dayTemp}°C
                                    </div>
                                    <div className="text-[10px] text-sky-400 font-semibold">
                                      Safety: {daySafety}%
                                    </div>
                                    <div className="text-[11px] font-bold text-emerald-400">
                                      {formatCurrency(dayFare, currency)}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <p className="text-slate-300 text-xs">
                            {aiPrediction?.fareTrendExplanation || 'AeroWings AI Meteorological & Fare Engine predicts optimal VFR flying conditions and recommends locking in the current fare before dynamic demand pricing increases.'}
                          </p>
                        </div>
                      )}

                      {activeFlightDetailTab === 'baggage' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-300">
                          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                            <div className="font-bold text-white mb-1">Cabin Baggage</div>
                            <p className="text-slate-400">1 piece up to 7 kg + 1 personal laptop bag allowed per passenger.</p>
                          </div>
                          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                            <div className="font-bold text-white mb-1">Check-in Baggage</div>
                            <p className="text-slate-400">Standard {flight.baggageAllowance.checkIn} included with zero additional surcharge.</p>
                          </div>
                        </div>
                      )}

                      {activeFlightDetailTab === 'fare_rules' && (
                        <div className="space-y-2 text-slate-300">
                          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                            <Check className="w-4 h-4" />
                            <span>100% Free Automatic Refund if Weather Risk Triggers Cancellation</span>
                          </div>
                          <p className="text-slate-400">
                            Standard passenger cancellations within 24 hours receive full refund. If bad weather or cyclones disrupt your corridor, AeroWings AI provides instant 1-click rebooking or 100% immediate disbursement.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            };

            return (
              <div className="space-y-6">
                {/* Flight Details and Fare Options available for you! */}
                <div className="bg-gradient-to-r from-blue-900/40 via-slate-900 to-indigo-900/40 border border-amber-500/30 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-white">
                        Flight Details and Fare Options available for you!
                      </h3>
                      <p className="text-xs text-slate-300">
                        {searchParams.specialFare === 'student'
                          ? 'Showing certified Student Fare concession flights with flat 10% discount & 25kg complimentary baggage.'
                          : searchParams.specialFare !== 'regular'
                          ? `Showing ${searchParams.specialFare.replace('_', ' ')} concession options tailored for your travel profile.`
                          : 'Transparent airfares with zero convenience fee, gourmet in-flight dining, and 24-hr check-in.'}
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono text-xs font-black">
                    {searchParams.specialFare === 'student' ? '🎓 Student Concession Active' : 'Verified Fares'}
                  </span>
                </div>

                {/* 1. PRIMARY SECTION: Direct Matching Flights for Source -> Destination */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                      <h3 className="text-sm font-bold text-white">
                        Available Flights for {originAirport?.city || searchParams.origin} ({searchParams.origin}) ➔ {destAirport?.city || searchParams.destination} ({searchParams.destination})
                      </h3>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
                      {directAvailableFlights.length} Available
                    </span>
                  </div>

                  {directAvailableFlights.length === 0 ? (
                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-center space-y-2">
                      <Info className="w-8 h-8 text-sky-400 mx-auto" />
                      <h4 className="text-xs font-bold text-white">No Exact Direct Flights for {searchParams.origin} ➔ {searchParams.destination} on this Date</h4>
                      <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                        We have automatically loaded all other available scheduled flights in our network below so you can choose alternative connections or connecting hubs.
                      </p>
                    </div>
                  ) : (
                    directAvailableFlights.map(f => renderCard(f, false))
                  )}
                </div>

                {/* Thats all for Student Fares options ! */}
                {searchParams.specialFare === 'student' && (
                  <div className="my-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-slate-900 to-sky-500/15 border-2 border-amber-500/40 text-center space-y-2 shadow-xl animate-fadeIn">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-black text-xs uppercase tracking-wider border border-amber-500/30">
                      <span>🎓 Thats all for Student Fares options !</span>
                    </div>
                    <h4 className="text-sm sm:text-base font-black text-white">
                      Here are some regular flight options you may wish to explore
                    </h4>
                    <p className="text-xs text-slate-300 max-w-xl mx-auto">
                      Explore standard regular fare flights with full baggage allowances, flexible date rebooking, and direct departure slots across all airlines.
                    </p>
                  </div>
                )}

                {/* 2. SECONDARY SECTION: Other Available Flights Across the Network */}
                {otherAvailableFlights.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-slate-800/80">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <Globe2 className="w-4 h-4 text-sky-400" />
                          <h3 className="text-sm font-bold text-white">
                            Other Available Flights & Network Corridors
                          </h3>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Explore additional active routes, regional intra-state hops, return journeys, and international connections.
                        </p>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-950/60 border border-sky-500/30 text-sky-300">
                        {otherAvailableFlights.length} Other Flights
                      </span>
                    </div>

                    <div className="space-y-3">
                      {otherAvailableFlights.map(f => renderCard(f, true))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Competitor Comparison Modal / Drawer */}
      {comparingFlight && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Live Airline Market Price & Feature Comparison</h3>
                  <p className="text-xs text-slate-400">{comparingFlight.origin.city} ({comparingFlight.origin.code}) → {comparingFlight.destination.city} ({comparingFlight.destination.code})</p>
                </div>
              </div>
              <button
                onClick={() => setComparingFlight(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 px-3">Airline Provider</th>
                    <th className="py-2.5 px-3">Base Economy Fare</th>
                    <th className="py-2.5 px-3">Free Baggage</th>
                    <th className="py-2.5 px-3">Hot Meals</th>
                    <th className="py-2.5 px-3">AI Weather Protection</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  <tr className="bg-blue-950/40 font-bold text-white border-blue-500/30">
                    <td className="py-3 px-3 flex items-center gap-1.5 text-sky-400">
                      <span>✈️ AeroWings (This Flight)</span>
                    </td>
                    <td className="py-3 px-3 text-emerald-400 text-sm font-extrabold">
                      {formatCurrency(comparingFlight.prices.economy, currency)}
                    </td>
                    <td className="py-3 px-3 text-emerald-400">✅ {comparingFlight.baggageAllowance.checkIn} Free</td>
                    <td className="py-3 px-3 text-emerald-400">✅ Included Free</td>
                    <td className="py-3 px-3 text-emerald-400">✅ 100% Instant Refund</td>
                  </tr>

                  {comparingFlight.competitors && (
                    <>
                      <tr>
                        <td className="py-3 px-3 text-slate-300">Air India</td>
                        <td className="py-3 px-3 text-slate-300">{formatCurrency(comparingFlight.competitors.airIndia, currency)}</td>
                        <td className="py-3 px-3 text-slate-400">15 kg Standard</td>
                        <td className="py-3 px-3 text-slate-400">Included</td>
                        <td className="py-3 px-3 text-slate-400">Manual claim (5-7 days)</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 text-slate-300">IndiGo Airlines</td>
                        <td className="py-3 px-3 text-slate-300">{formatCurrency(comparingFlight.competitors.indigo, currency)}</td>
                        <td className="py-3 px-3 text-slate-400">15 kg Standard</td>
                        <td className="py-3 px-3 text-amber-400">Paid extra (₹450+)</td>
                        <td className="py-3 px-3 text-slate-400">Airline credit shell</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 text-slate-300">Emirates / Vistara</td>
                        <td className="py-3 px-3 text-slate-300">{formatCurrency(comparingFlight.competitors.emiratesOrVistara, currency)}</td>
                        <td className="py-3 px-3 text-slate-400">20-25 kg</td>
                        <td className="py-3 px-3 text-slate-400">Included</td>
                        <td className="py-3 px-3 text-slate-400">Standard refund queue</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
              <span>Why fly AeroWings? Best value transparent pricing, complimentary hot meals on all flights, and instant AI automated weather safety refunds.</span>
              <button
                onClick={() => {
                  setComparingFlight(null);
                  handleSelectFlight(comparingFlight);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl whitespace-nowrap ml-3 cursor-pointer"
              >
                Select AeroWings Flight
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prestige 6-Digit OTP Verification Modal */}
      {otpModalOpen && (
        <PrestigeOtpVerificationModal
          isOpen={otpModalOpen}
          onClose={() => setOtpModalOpen(false)}
          onVerified={handleOtpVerified}
          flightSummary={
            pendingFlight
              ? {
                  flightNumber: pendingFlight.flightNumber,
                  airline: pendingFlight.airline,
                  originCity: pendingFlight.origin.city,
                  destCity: pendingFlight.destination.city
                }
              : undefined
          }
        />
      )}

    </div>
  );
};
