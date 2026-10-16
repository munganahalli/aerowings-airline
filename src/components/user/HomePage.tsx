import React, { useState, useEffect } from 'react';
import { useAirline } from '../../context/AirlineContext';
import { useLanguage } from '../../context/LanguageContext';
import { AIRPORTS } from '../../data/mockData';
import { formatCurrency } from '../../utils/airlineUtils';
import { CabinClass, FlightSearchParams, TripType } from '../../types/airline';
import { AirportSearchCombobox } from '../common/AirportSearchCombobox';
import {
  Plane,
  Users,
  Search,
  ArrowRightLeft,
  ShieldCheck,
  Coffee,
  Wifi,
  ChevronRight,
  TrendingUp,
  MapPin,
  Clock,
  Radio,
  Check,
  SlidersHorizontal,
  Filter,
  Plus,
  Trash2,
  Building,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const {
    searchParams,
    setSearchParams,
    performSearch,
    currency,
    setUserView,
    setTrackedPNR,
    addToast
  } = useAirline();
  const { t } = useLanguage();

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

  // Smart Filters State
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

  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);
  const [quickPnrQuery, setQuickPnrQuery] = useState('');

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

  // Sync external concession fare changes
  useEffect(() => {
    if (searchParams.specialFare && searchParams.specialFare !== specialFare) {
      setSpecialFare(searchParams.specialFare);
    }
  }, [searchParams.specialFare]);

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

  const totalPassengers = adults + children + infants;

  const popularRoutes = [
    { origin: 'BOM', dest: 'PNQ', title: 'Mumbai to Pune', price: 2200, desc: 'Direct Flight • 45m • Daily Non-Stop' },
    { origin: 'DEL', dest: 'BOM', title: 'Delhi to Mumbai', price: 4850, desc: 'Business Corridor • 2h 15m • High Frequency' },
    { origin: 'DEL', dest: 'BLR', title: 'Delhi to Bengaluru', price: 5350, desc: 'Tech Express • 2h 45m • Modern Fleet' },
    { origin: 'BOM', dest: 'GOI', title: 'Mumbai to Goa', price: 3100, desc: 'Coastal Route • 1h 10m • Daily Flights' },
    { origin: 'BLR', dest: 'HYD', title: 'Bengaluru to Hyderabad', price: 3199, desc: 'Southern Trunk • 1h 10m • Non-Stop' },
    { origin: 'DEL', dest: 'JAI', title: 'Delhi to Jaipur', price: 2799, desc: 'Heritage Corridor • 1h 05m • Multiple Departures' },
    { origin: 'DEL', dest: 'DXB', title: 'Delhi to Dubai', price: 14900, desc: 'International • 4h 10m • Full Service' },
    { origin: 'BOM', dest: 'LHR', title: 'Mumbai to London', price: 45000, desc: 'Direct Long-Haul • 9h 45m • Boeing 787' },
    { origin: 'BLR', dest: 'SIN', title: 'Bengaluru to Singapore', price: 15200, desc: 'International • 4h 25m • Non-Stop Service' }
  ];

  return (
    <div className="space-y-10 pb-16">
      {/* Clean Hero Header & Flight Search Engine */}
      <section className="pt-8 pb-10 px-4 sm:px-6 lg:px-8 bg-slate-900 border-b border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-6 space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Book Flights with Confidence
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Search and reserve domestic and international flights with zero convenience fee and transparent fares.
            </p>
          </div>

          {/* Search Engine Card */}
          <div id="flight-search-form" className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
            {/* Trip Type Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                {([
                  { type: 'one_way', label: t('search.oneWay', 'One Way') },
                  { type: 'round_trip', label: t('search.roundTrip', 'Round Trip') },
                  { type: 'multi_city', label: t('search.multiCity', 'Multi City') }
                ] as { type: TripType; label: string }[]).map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setTripType(item.type)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                      tripType === item.type
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Filters Toggle */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSmartFilters(!showSmartFilters)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                    showSmartFilters
                      ? 'bg-slate-800 text-white border-slate-700'
                      : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
                  <span>{showSmartFilters ? 'Hide Filters' : 'More Filters'}</span>
                  {showSmartFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Fare Concession Types */}
            <div className="pt-3 pb-3 border-b border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-bold text-xs uppercase tracking-wider">
                  Select Fare Type:
                </span>
                <span className="text-[11px] text-slate-400">Standard or concession rates</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap text-xs">
                {/* Regular */}
                <button
                  type="button"
                  onClick={() => {
                    setSpecialFare('regular');
                    setSearchParams(prev => ({ ...prev, specialFare: 'regular' }));
                  }}
                  className={`px-3 py-1.5 rounded-xl font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    specialFare === 'regular'
                      ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {specialFare === 'regular' && <Check className="w-3.5 h-3.5" />}
                  <span>Regular Fare</span>
                </button>

                {/* Student */}
                <button
                  type="button"
                  onClick={() => {
                    setSpecialFare('student');
                    setSearchParams(prev => ({ ...prev, specialFare: 'student' }));
                    addToast('Student Concession Selected: 10% Off Base Fare + 25kg Baggage Allowance', 'success');
                  }}
                  className={`px-3 py-1.5 rounded-xl font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    specialFare === 'student'
                      ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {specialFare === 'student' && <Check className="w-3.5 h-3.5" />}
                  <span>Student (Extra 10kg Baggage)</span>
                </button>

                {/* Senior Citizen */}
                <button
                  type="button"
                  onClick={() => {
                    setSpecialFare('senior');
                    setSearchParams(prev => ({ ...prev, specialFare: 'senior' }));
                    addToast('Senior Citizen Concession Selected: 12% Off Base Fare', 'success');
                  }}
                  className={`px-3 py-1.5 rounded-xl font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    specialFare === 'senior'
                      ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {specialFare === 'senior' && <Check className="w-3.5 h-3.5" />}
                  <span>Senior Citizen (60+ yrs)</span>
                </button>

                {/* Armed Forces */}
                <button
                  type="button"
                  onClick={() => {
                    setSpecialFare('armed_forces');
                    setSearchParams(prev => ({ ...prev, specialFare: 'armed_forces' }));
                    addToast('Armed Forces Concession Selected: 15% Off Base Fare', 'success');
                  }}
                  className={`px-3 py-1.5 rounded-xl font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    specialFare === 'armed_forces'
                      ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {specialFare === 'armed_forces' && <Check className="w-3.5 h-3.5" />}
                  <span>Armed Forces</span>
                </button>

                {/* Doctor and Nurses */}
                <button
                  type="button"
                  onClick={() => {
                    setSpecialFare('doctors_nurses');
                    setSearchParams(prev => ({ ...prev, specialFare: 'doctors_nurses' }));
                    addToast('Medical Professionals Concession Selected: 10% Off', 'success');
                  }}
                  className={`px-3 py-1.5 rounded-xl font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    specialFare === 'doctors_nurses'
                      ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {specialFare === 'doctors_nurses' && <Check className="w-3.5 h-3.5" />}
                  <span>Doctors & Nurses</span>
                </button>

                {/* Have a GST number ? */}
                <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold cursor-pointer hover:border-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={hasGstNumber}
                    onChange={(e) => setHasGstNumber(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                  />
                  <Building className="w-3.5 h-3.5 text-blue-400" />
                  <span>GST Invoice</span>
                </label>
              </div>

              {/* GST Number Expansion Box */}
              {hasGstNumber && (
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs animate-fadeIn">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Registered GSTIN Number</label>
                    <input
                      type="text"
                      maxLength={15}
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                      placeholder="e.g. 29AAAAA0000A1Z5"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono uppercase focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Company / Legal Business Name</label>
                    <input
                      type="text"
                      value={gstCompanyName}
                      onChange={(e) => setGstCompanyName(e.target.value)}
                      placeholder="e.g. Acme Technologies Pvt Ltd"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Smart Filters Collapsible Panel */}
            {showSmartFilters && (
              <div className="mt-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Filter className="w-4 h-4 text-blue-400" />
                    <span>Flight Search Preferences</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedPopularFilters([]);
                      setAppliedLayoverAirports([]);
                      setAppliedTimeFilter('any');
                      setAppliedMaxPrice(25000);
                      addToast('Filters reset', 'info');
                    }}
                    className="text-[11px] text-blue-400 hover:underline font-semibold cursor-pointer"
                  >
                    Reset
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-2">
                    <span className="font-semibold text-slate-300 block text-[11px]">Flight Type:</span>
                    <div className="space-y-1.5">
                      {[
                        { id: 'non_stop', label: 'Non-Stop Direct Flights Only' },
                        { id: 'morning_departure', label: 'Morning Departure (06:00 - 12:00)' },
                        { id: 'free_meal', label: 'Complimentary Hot Meal Included' }
                      ].map(pop => (
                        <label key={pop.id} className="flex items-center gap-2 text-slate-400 hover:text-slate-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={appliedPopularFilters.includes(pop.id)}
                            onChange={(e) => {
                              if (e.target.checked) setAppliedPopularFilters(prev => [...prev, pop.id]);
                              else setAppliedPopularFilters(prev => prev.filter(x => x !== pop.id));
                            }}
                            className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500"
                          />
                          <span>{pop.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="font-semibold text-slate-300 block text-[11px]">Time Window:</span>
                    <select
                      value={appliedTimeFilter}
                      onChange={(e) => setAppliedTimeFilter(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    >
                      <option value="any">Any Departure Time</option>
                      <option value="morning">Morning (06:00 - 12:00)</option>
                      <option value="afternoon">Afternoon (12:00 - 18:00)</option>
                      <option value="evening">Evening (18:00 - 24:00)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Max Price / Person:</span>
                      <span className="font-bold text-white">{formatCurrency(appliedMaxPrice, currency)}</span>
                    </div>
                    <input
                      type="range"
                      min={2000}
                      max={50000}
                      step={1000}
                      value={appliedMaxPrice}
                      onChange={(e) => setAppliedMaxPrice(Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Flight Search Form */}
            <form onSubmit={handleSearch} className="pt-5 space-y-4">
              {tripType === 'multi_city' ? (
                /* Multi-City Itinerary Builder */
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Plane className="w-4 h-4 text-blue-400" />
                      <h4 className="text-sm font-bold text-white">Multi-City Itinerary ({multiCitySegments.length} Segments)</h4>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddSegment}
                      disabled={multiCitySegments.length >= 6}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Flight Leg</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {multiCitySegments.map((seg, idx) => (
                      <div
                        key={seg.id}
                        className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
                      >
                        <div className="md:col-span-1 flex items-center justify-center">
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-xs font-bold border border-slate-700">
                            #{idx + 1}
                          </span>
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
                            Date
                          </label>
                          <input
                            type="date"
                            value={seg.departureDate}
                            onChange={(e) => handleUpdateSegment(seg.id, 'departureDate', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs font-semibold text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                          />
                        </div>

                        <div className="md:col-span-1 flex justify-center">
                          {multiCitySegments.length > 2 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSegment(seg.id)}
                              className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 cursor-pointer transition-colors"
                              title="Remove flight leg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Multi-City Controls & Class Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center pt-2">
                    <div className="sm:col-span-6 flex items-center gap-3">
                      <span className="text-xs text-slate-400">
                        {multiCitySegments.length} route segments configured
                      </span>
                    </div>

                    <div className="sm:col-span-6 relative bg-slate-900 border border-slate-800 rounded-xl p-3">
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Travelers & Cabin Class
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
                        className="w-full text-left flex items-center justify-between text-white text-xs font-semibold focus:outline-none cursor-pointer"
                      >
                        <span className="truncate">
                          {totalPassengers} Traveler{totalPassengers > 1 ? 's' : ''}, {cabinClass.replace('_', ' ')}
                        </span>
                        <Users className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-800">
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Zero booking fee guarantee on all multi-city legs</span>
                    </div>

                    <button
                      type="submit"
                      className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Search className="w-4 h-4" />
                      <span>Search Multi-City Flights →</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* One-Way & Round-Trip Search Grid */
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
                    {/* Origin Combobox */}
                    <div className="lg:col-span-3">
                      <AirportSearchCombobox
                        id="origin-search"
                        label="From"
                        value={origin}
                        onChange={(code) => setOrigin(code)}
                        airports={AIRPORTS}
                        excludeCode={destination}
                        placeholder="Departure City (DEL, BOM, BLR)..."
                        icon={<Plane className="w-4 h-4 text-blue-400 transform rotate-45 flex-shrink-0" />}
                      />
                    </div>

                    {/* Swap Button */}
                    <div className="lg:col-span-1 flex justify-center py-1 sm:py-0">
                      <button
                        type="button"
                        onClick={handleSwapAirports}
                        className="p-2.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all shadow-sm cursor-pointer"
                        title="Swap Origin and Destination"
                        aria-label="Swap Origin and Destination"
                      >
                        <ArrowRightLeft className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Destination Combobox */}
                    <div className="lg:col-span-3">
                      <AirportSearchCombobox
                        id="destination-search"
                        label="To"
                        value={destination}
                        onChange={(code) => setDestination(code)}
                        airports={AIRPORTS}
                        excludeCode={origin}
                        placeholder="Arrival City (BOM, DXB, LHR)..."
                        icon={<MapPin className="w-4 h-4 text-rose-400 flex-shrink-0" />}
                      />
                    </div>

                    {/* Dates */}
                    <div className={`${tripType === 'round_trip' ? 'lg:col-span-3' : 'lg:col-span-2'} bg-slate-900 border border-slate-800 rounded-xl p-3`}>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                            Departure
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
                              Return
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
                    <div className={`${tripType === 'round_trip' ? 'lg:col-span-2' : 'lg:col-span-3'} relative bg-slate-900 border border-slate-800 rounded-xl p-3`}>
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Travelers & Class
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
                        className="w-full text-left flex items-center justify-between text-white text-xs sm:text-sm font-semibold focus:outline-none cursor-pointer"
                      >
                        <span className="truncate">
                          {totalPassengers} Traveler{totalPassengers > 1 ? 's' : ''}, {cabinClass.replace('_', ' ')}
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
                                className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center hover:bg-slate-700 cursor-pointer"
                              >
                                -
                              </button>
                              <span className="w-5 text-center text-sm font-bold text-white">{adults}</span>
                              <button
                                type="button"
                                onClick={() => setAdults(Math.min(9, adults + 1))}
                                className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center hover:bg-slate-700 cursor-pointer"
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
                                className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center hover:bg-slate-700 cursor-pointer"
                              >
                                -
                              </button>
                              <span className="w-5 text-center text-sm font-bold text-white">{children}</span>
                              <button
                                type="button"
                                onClick={() => setChildren(Math.min(6, children + 1))}
                                className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center hover:bg-slate-700 cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Infants */}
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs font-bold text-white">Infants</div>
                              <div className="text-[10px] text-slate-400">Under 2 years</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setInfants(Math.max(0, infants - 1))}
                                className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center hover:bg-slate-700 cursor-pointer"
                              >
                                -
                              </button>
                              <span className="w-5 text-center text-sm font-bold text-white">{infants}</span>
                              <button
                                type="button"
                                onClick={() => setInfants(Math.min(4, infants + 1))}
                                className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center hover:bg-slate-700 cursor-pointer"
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
                                  className={`p-2 rounded text-xs font-semibold capitalize border cursor-pointer ${
                                    cabinClass === cls
                                      ? 'bg-blue-600 border-blue-500 text-white'
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
                            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            Done
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Search Action Bar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3">
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>{t('common.freeCancellation', 'Zero Convenience Fees • Instant Ticket Confirmation')}</span>
                    </div>

                    <button
                      type="submit"
                      id="search-flights-btn"
                      className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Search className="w-4 h-4" />
                      <span>{t('search.searchFlights', 'Search Flights')}</span>
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Quick Lookup Toolbar: Flight Status & Web Check-in */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Flight Status Lookup */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Live Flight Status</h4>
                <p className="text-xs text-slate-400">Track aircraft departure, arrival gate & terminal</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setUserView('flight_status')}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-colors whitespace-nowrap cursor-pointer"
            >
              Check Status →
            </button>
          </div>

          {/* Web Check-in Quick Bar */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
                <Plane className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Web Check-in & Boarding Pass</h4>
                <p className="text-xs text-slate-400">Enter your PNR to download Boarding Pass</p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="PNR (e.g. AW-101)"
                value={quickPnrQuery}
                onChange={(e) => setQuickPnrQuery(e.target.value.toUpperCase())}
                className="bg-slate-950 border border-slate-700 text-white text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500 w-32 uppercase font-mono font-bold"
              />
              <button
                type="button"
                onClick={() => {
                  if (quickPnrQuery) {
                    setTrackedPNR(quickPnrQuery);
                    setUserView('dashboard');
                  } else {
                    setUserView('dashboard');
                  }
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Go
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Domestic & International Routes */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Popular Non-Stop Routes</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularRoutes.map((route, idx) => (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all duration-200 hover:shadow-lg cursor-pointer"
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
                <div>
                  <h3 className="font-bold text-white text-sm">
                    {route.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{route.desc}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase">From</span>
                  <span className="text-sm font-bold text-white">
                    {formatCurrency(route.price, currency)}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono">{route.origin} ➔ {route.dest}</span>
                <span className="text-blue-400 font-semibold flex items-center gap-1 hover:underline">
                  <span>Book Flight</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Fly AeroWings */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
          <div className="text-center max-w-xl mx-auto mb-6">
            <h3 className="text-xl font-bold text-white mb-1">Why Travel with AeroWings</h3>
            <p className="text-xs text-slate-400">
              Delivering comfortable, punctual, and safe air travel across all domestic and global corridors.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2">
              <Clock className="w-6 h-6 text-blue-400 mx-auto" />
              <h4 className="font-bold text-white text-xs">99.4% On-Time Record</h4>
              <p className="text-[11px] text-slate-400">Industry-leading punctuality across domestic and global routes.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2">
              <Coffee className="w-6 h-6 text-blue-400 mx-auto" />
              <h4 className="font-bold text-white text-xs">In-Flight Meals</h4>
              <p className="text-[11px] text-slate-400">Hot meals and beverages crafted for passenger satisfaction.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2">
              <Wifi className="w-6 h-6 text-blue-400 mx-auto" />
              <h4 className="font-bold text-white text-xs">Satellite Wi-Fi</h4>
              <p className="text-[11px] text-slate-400">Stay connected during your journey at 35,000 feet.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2">
              <ShieldCheck className="w-6 h-6 text-blue-400 mx-auto" />
              <h4 className="font-bold text-white text-xs">Zero-Hassle Booking</h4>
              <p className="text-[11px] text-slate-400">Instant e-ticket generation and simple online trip management.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
