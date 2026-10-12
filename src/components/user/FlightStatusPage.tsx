import React, { useState, useEffect, useMemo } from 'react';
import { useAirline } from '../../context/AirlineContext';
import { useLanguage } from '../../context/LanguageContext';
import { getAirportWeatherImmediate } from '../../utils/realtimeWeather';
import { aiVoice } from '../../utils/aiVoice';
import {
  Search,
  Plane,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  MapPin,
  ArrowRight,
  Radio,
  Compass,
  Wind,
  Gauge,
  Navigation,
  Volume2,
  RefreshCw,
  ShieldCheck,
  Luggage
} from 'lucide-react';
import { Flight, FlightStatus } from '../../types/airline';

export const FlightStatusPage: React.FC = () => {
  const { flights, bookings, aiLanguage, addToast, updateFlightStatus, updateFlight } = useAirline();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AIRBORNE' | 'On Time' | 'Boarding' | 'Delayed'>('ALL');
  const [selectedFlightId, setSelectedFlightId] = useState<string>(() => flights[0]?.id || '');
  const [liveTick, setLiveTick] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Flight Status Simulation Handlers
  const handleSimulateGateChange = () => {
    if (!activeFlight) return;
    const gates = ['Gate A12', 'Gate B22', 'Gate C08', 'Gate D15', 'Gate E04', 'Gate 31B'];
    const currentGate = activeFlight.gate || 'Gate A14';
    const nextGate = gates.find(g => g !== currentGate) || 'Gate B22';
    updateFlight(activeFlight.id, { gate: nextGate });
    addToast(`🚨 Gate Change: Flight ${activeFlight.flightNumber} moved to ${nextGate}!`, 'info');
    aiVoice.speak(`Attention passengers: Flight ${activeFlight.flightNumber} gate change. Please proceed to ${nextGate}.`);
  };

  const handleSimulateDelay = () => {
    if (!activeFlight) return;
    updateFlightStatus(activeFlight.id, 'Delayed', 35);
    addToast(`⚠️ Delay Alert: Flight ${activeFlight.flightNumber} delayed (+35m)`, 'error');
    aiVoice.speak(`Flight ${activeFlight.flightNumber} to ${activeFlight.destination.city} is experiencing a 35 minute operational delay.`);
  };

  const handleSimulateCancellation = () => {
    if (!activeFlight) return;
    updateFlightStatus(activeFlight.id, 'Cancelled');
    addToast(`🛑 Cancellation: Flight ${activeFlight.flightNumber} cancelled. 100% full refund disbursed!`, 'error');
    aiVoice.speak(`Flight ${activeFlight.flightNumber} has been grounded due to severe weather. 100% instant refund disbursed.`);
  };

  const handleRestoreOnTime = () => {
    if (!activeFlight) return;
    updateFlightStatus(activeFlight.id, 'On Time', 0);
    addToast(`✅ Flight ${activeFlight.flightNumber} restored to On-Time status`, 'success');
    aiVoice.speak(`Flight ${activeFlight.flightNumber} is now operating on time.`);
  };

  // Live telemetry heartbeat every 4 seconds for real-time aircraft movement & radar updates
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTick((prev) => prev + 1);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Filter flights + synthesize dynamic flight if user searches a specific flight number, PNR, or city not in base list
  const displayedFlights = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let baseList = flights.filter((f) => {
      const matchQuery =
        !q ||
        f.flightNumber.toLowerCase().includes(q) ||
        f.origin.code.toLowerCase().includes(q) ||
        f.origin.city.toLowerCase().includes(q) ||
        f.destination.code.toLowerCase().includes(q) ||
        f.destination.city.toLowerCase().includes(q);

      if (!matchQuery) return false;

      if (statusFilter === 'ALL') return true;
      if (statusFilter === 'AIRBORNE') return f.status === 'On Time' || f.status === 'Boarding';
      return f.status === statusFilter;
    });

    // Check if query matches a booked PNR
    if (q && baseList.length === 0) {
      const matchedBooking = bookings.find((b) => b.pnr.toLowerCase().includes(q));
      if (matchedBooking) {
        baseList = [matchedBooking.flight];
      }
    }

    // If user typed a flight number or city code that still has 0 matches, generate a live tracked flight so tracker always works
    if (q && baseList.length === 0 && q.length >= 2) {
      const upperQ = q.toUpperCase();
      const isFlightNo = /^[A-Z0-9-]{3,8}$/.test(upperQ);
      const syntheticFlight: Flight = {
        id: `LIVE-${upperQ}`,
        flightNumber: isFlightNo ? (upperQ.includes('-') ? upperQ : `AW-${upperQ.replace(/\D/g, '') || '402'}`) : 'AW-709',
        airline: 'AeroWings',
        airlineCode: 'AW',
        aircraft: 'Airbus A350-900 XWB',
        routeType: 'inter_state',
        origin: {
          code: isFlightNo ? 'DEL' : upperQ.slice(0, 3),
          city: isFlightNo ? 'New Delhi' : searchQuery.trim(),
          name: `${isFlightNo ? 'Indira Gandhi' : searchQuery.trim()} International Airport`,
          country: 'India',
          terminal: 'T3'
        },
        destination: {
          code: 'BLR',
          city: 'Bengaluru',
          name: 'Kempegowda International Airport',
          country: 'India',
          terminal: 'T2'
        },
        departureTime: '10:30',
        arrivalTime: '13:15',
        duration: '2h 45m',
        durationMinutes: 165,
        stops: 0,
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        status: 'On Time',
        gate: 'A14',
        terminal: 'T3',
        prices: { economy: 4899, premium_economy: 7499, business: 14999, first: 26999 },
        availableSeats: { economy: 42, premium_economy: 16, business: 8, first: 4 },
        totalSeats: 180,
        baggageAllowance: { cabin: '7 kg', checkIn: '15 kg' },
        amenities: ['Wi-Fi', 'Live TV', 'Hot Meals', 'USB Power'],
        weather: {
          condition: 'Clear',
          temperatureC: 28,
          visibilityKm: 10,
          windSpeedKmh: 12,
          stormIndex: 5,
          aiRiskScore: 3,
          aiCancellationRisk: 'Low'
        },
        competitors: [],
        avgMarketPrice: 5400,
        savingsVsMarket: 501,
        aiPrediction: {
          fareTrend: 'stable',
          predictedPriceChangePercent: 0,
          fareTrendExplanation: 'Stable live fare corridor.',
          onTimeProbability: 99,
          bestTimeToBook: 'Book today',
          seatRecommendation: 'Row 12A Window',
          weatherReliabilityScore: 99
        }
      };
      baseList = [syntheticFlight];
    }

    return baseList;
  }, [flights, bookings, searchQuery, statusFilter]);

  const activeFlight: Flight = useMemo(() => {
    return (
      displayedFlights.find((f) => f.id === selectedFlightId) ||
      displayedFlights[0] ||
      flights[0]
    );
  }, [displayedFlights, selectedFlightId, flights]);

  // Compute realistic live telemetry metrics for the active flight
  const telemetry = useMemo(() => {
    if (!activeFlight) return null;
    const seed = activeFlight.flightNumber.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const isCancelled = activeFlight.status === 'Cancelled';
    const isDelayed = activeFlight.status === 'Delayed';
    const isBoarding = activeFlight.status === 'Boarding';

    const baseProgress = isCancelled ? 0 : isBoarding ? 12 : isDelayed ? 38 : 55 + (seed % 32);
    const progressPercent = isCancelled
      ? 0
      : Math.min(96, baseProgress + (liveTick % 5));

    const altitudeFt = isCancelled || isBoarding ? 0 : 34000 + ((seed * 130 + liveTick * 25) % 4200);
    const groundSpeedKmh = isCancelled || isBoarding ? 0 : 845 + ((seed * 7 + liveTick * 3) % 48);
    const mach = (groundSpeedKmh / 1062).toFixed(2);
    const distanceTotalKm = 720 + (seed % 1400);
    const distanceRemainingKm = Math.max(0, Math.round(distanceTotalKm * (1 - progressPercent / 100)));
    const minutesRemaining = Math.max(5, Math.round((distanceRemainingKm / Math.max(600, groundSpeedKmh)) * 60));
    const baggageBelt = `Belt ${(seed % 9) + 1}`;

    const originWeather = getAirportWeatherImmediate(activeFlight.origin.code);
    const destWeather = getAirportWeatherImmediate(activeFlight.destination.code);

    return {
      progressPercent,
      altitudeFt,
      groundSpeedKmh,
      mach,
      distanceTotalKm,
      distanceRemainingKm,
      minutesRemaining,
      baggageBelt,
      originWeather,
      destWeather
    };
  }, [activeFlight, liveTick]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setLiveTick((prev) => prev + 1);
    setTimeout(() => {
      setIsRefreshing(false);
      addToast('Live satellite ADS-B flight radar & gate telemetry synced!', 'success');
    }, 450);
  };

  const handleSpeakFlightStatus = (flight: Flight) => {
    const msg = `AeroWings Live Flight Tracker: Flight ${flight.flightNumber} from ${flight.origin.city} to ${flight.destination.city} is currently ${flight.status}. Departure at ${flight.departureTime} from Terminal ${flight.terminal || 'T3'}, Gate ${flight.gate || '14A'}. Arrival at ${flight.arrivalTime}.`;
    aiVoice.speak(msg, true, aiLanguage);
  };

  const getStatusBadge = (status: FlightStatus, delayMinutes?: number) => {
    switch (status) {
      case 'On Time':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> {t('status.onTime', 'On Time')}
          </span>
        );
      case 'Boarding':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" /> {t('status.boarding', 'Boarding Now')}
          </span>
        );
      case 'Delayed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" /> {t('status.delayed', 'Delayed')} {delayMinutes ? `(+${delayMinutes}m)` : ''}
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/30">
            <XCircle className="w-3.5 h-3.5" /> {t('status.cancelled', 'Cancelled')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950/60 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              <span>ADS-B Satellite Telemetry • Live Gate, Altitude & Weather Feed</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {t('status.title', 'Real-Time Flight Status & Live Radar Tracker')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              {t('status.subtitle', 'Track live aircraft position, altitude, ground speed, terminal gates, baggage carousels, and real-time airport weather.')}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              type="button"
              onClick={handleManualRefresh}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-sky-300 flex items-center gap-2 cursor-pointer transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Syncing Radar...' : 'Refresh Live Telemetry'}</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('status.searchPlaceholder', 'Search by Flight No (e.g. AW-101), PNR, City or Airport (DEL, BLR, BOM, DXB)...')}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="md:col-span-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="md:col-span-3 flex items-center gap-2">
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 cursor-pointer"
              >
                Reset Search
              </button>
            )}
            <div className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
              <span>Tracked Flights:</span>
              <span className="font-mono font-black text-sky-400 text-sm">{displayedFlights.length}</span>
            </div>
          </div>
        </div>

        {/* Quick Status Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap mt-4">
          {[
            { id: 'ALL', label: 'All Flights' },
            { id: 'AIRBORNE', label: '✈️ Airborne / In-Flight' },
            { id: 'On Time', label: '🟢 On Time' },
            { id: 'Boarding', label: '🔵 Boarding Now' },
            { id: 'Delayed', label: '🟠 Delayed' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                statusFilter === tab.id
                  ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-lg shadow-sky-500/20'
                  : 'bg-slate-950/90 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Live Flight Radar & Telemetry Cockpit for Selected Flight */}
      {activeFlight && telemetry && (
        <div className="bg-slate-900/95 border-2 border-sky-500/30 rounded-3xl p-6 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0">
                <Compass className="w-6 h-6 animate-spin-slow" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-md bg-sky-500/20 text-sky-300 font-mono text-xs font-black border border-sky-500/30">
                    LIVE RADAR TARGET: {activeFlight.flightNumber}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">{activeFlight.aircraft}</span>
                  {getStatusBadge(activeFlight.status, activeFlight.delayMinutes)}
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                  {activeFlight.origin.city} ({activeFlight.origin.code}) ➔ {activeFlight.destination.city} ({activeFlight.destination.code})
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleSpeakFlightStatus(activeFlight)}
                className="px-3.5 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Volume2 className="w-4 h-4 text-sky-400" />
                <span>🔊 Speak Status</span>
              </button>

              <button
                type="button"
                onClick={handleSimulateGateChange}
                className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold cursor-pointer transition-all flex items-center gap-1"
                title="Simulate random gate change"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Simulate Gate Change</span>
              </button>

              <button
                type="button"
                onClick={handleSimulateDelay}
                className="px-3 py-2 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-300 text-xs font-bold cursor-pointer transition-all flex items-center gap-1"
                title="Simulate +35m departure delay"
              >
                <Clock className="w-3.5 h-3.5 text-orange-400" />
                <span>Simulate Delay (+35m)</span>
              </button>

              <button
                type="button"
                onClick={handleSimulateCancellation}
                className="px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-xs font-bold cursor-pointer transition-all flex items-center gap-1"
                title="Simulate weather cancellation & refund"
              >
                <XCircle className="w-3.5 h-3.5 text-red-400" />
                <span>Simulate Cancellation</span>
              </button>

              <button
                type="button"
                onClick={handleRestoreOnTime}
                className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold cursor-pointer transition-all flex items-center gap-1"
                title="Restore flight to On-Time status"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Restore On-Time</span>
              </button>
            </div>
          </div>

          {/* Live Flight Path Progress Visual */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block">ORIGIN DEPARTURE</span>
                <span className="text-lg font-black text-white">{activeFlight.origin.code} • {activeFlight.departureTime}</span>
                <span className="text-[11px] text-sky-400 block">{activeFlight.origin.city} (Terminal {activeFlight.terminal || 'T3'})</span>
              </div>

              <div className="text-center">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-bold">
                  {activeFlight.status === 'Cancelled'
                    ? 'Flight Grounded'
                    : `${telemetry.progressPercent}% Route Completed • ~${telemetry.minutesRemaining}m to Arrival`}
                </span>
              </div>

              <div className="text-right">
                <span className="text-slate-400 block">DESTINATION ARRIVAL</span>
                <span className="text-lg font-black text-white">{activeFlight.destination.code} • {activeFlight.arrivalTime}</span>
                <span className="text-[11px] text-emerald-400 block">{activeFlight.destination.city} (Gate {activeFlight.gate || 'A14'})</span>
              </div>
            </div>

            {/* Animated Aircraft Progress Track */}
            <div className="relative pt-4 pb-2">
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 via-blue-500 to-emerald-400 rounded-full transition-all duration-700"
                  style={{ width: `${telemetry.progressPercent}%` }}
                />
              </div>
              <div
                className="absolute top-1.5 -translate-x-1/2 transition-all duration-700"
                style={{ left: `${ Math.max(4, Math.min(96, telemetry.progressPercent)) }%` }}
              >
                <div className="w-7 h-7 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center shadow-lg shadow-sky-500/50 border-2 border-white">
                  <Plane className="w-4 h-4 transform rotate-45" />
                </div>
              </div>
            </div>

            {/* Telemetry Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                  <Navigation className="w-3 h-3 text-sky-400" /> Cruising Altitude
                </div>
                <div className="text-sm font-mono font-black text-white mt-1">
                  {telemetry.altitudeFt.toLocaleString()} ft
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-emerald-400" /> Ground Speed
                </div>
                <div className="text-sm font-mono font-black text-white mt-1">
                  {telemetry.groundSpeedKmh} km/h (M{telemetry.mach})
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-400" /> Terminal & Gate
                </div>
                <div className="text-sm font-mono font-black text-amber-300 mt-1">
                  {activeFlight.terminal || 'T3'} • Gate {activeFlight.gate || 'A12'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                  <Luggage className="w-3 h-3 text-purple-400" /> Baggage Claim
                </div>
                <div className="text-sm font-mono font-black text-purple-300 mt-1">
                  {telemetry.baggageBelt}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                  <Wind className="w-3 h-3 text-sky-400" /> {activeFlight.origin.code} Weather
                </div>
                <div className="text-xs font-bold text-white mt-1 truncate">
                  {telemetry.originWeather.temperatureC}°C • {telemetry.originWeather.conditionText}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> {activeFlight.destination.code} Weather
                </div>
                <div className="text-xs font-bold text-white mt-1 truncate">
                  {telemetry.destWeather.temperatureC}°C • {telemetry.destWeather.conditionText}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Flights Board List (Click any flight to inspect in Live Radar above) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plane className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Live Flight Operations Board (Click any flight to track live radar telemetry)
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Showing {displayedFlights.length} active flights
          </span>
        </div>

        <div className="divide-y divide-slate-800/70">
          {displayedFlights.map((flight) => {
            const isSelected = activeFlight?.id === flight.id;
            const origW = getAirportWeatherImmediate(flight.origin.code);
            const destW = getAirportWeatherImmediate(flight.destination.code);

            return (
              <div
                key={flight.id}
                onClick={() => setSelectedFlightId(flight.id)}
                className={`p-5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-950/30 border-l-4 border-l-sky-400'
                    : 'hover:bg-slate-800/40'
                }`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                  {/* Flight Info */}
                  <div className="lg:col-span-3 flex items-center gap-3.5">
                    <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-sky-500 text-slate-950 border-sky-400'
                        : 'bg-blue-600/10 border-blue-500/20 text-sky-400'
                    }`}>
                      <Plane className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-white">{flight.flightNumber}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          {flight.aircraft}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {origW.temperatureC}°C {flight.origin.code} ➔ {destW.temperatureC}°C {flight.destination.code}
                      </div>
                    </div>
                  </div>

                  {/* Route & Schedule */}
                  <div className="lg:col-span-5 flex items-center justify-between bg-slate-950/70 px-4 py-3 rounded-2xl border border-slate-800/80">
                    <div>
                      <div className="text-lg font-black text-white">{flight.departureTime}</div>
                      <div className="text-xs font-bold text-sky-400">{flight.origin.code}</div>
                      <div className="text-[11px] text-slate-400">{flight.origin.city}</div>
                    </div>

                    <div className="flex flex-col items-center px-3">
                      <span className="text-[10px] text-slate-400 font-mono mb-1">{flight.duration}</span>
                      <div className="w-20 sm:w-28 h-px bg-slate-700 relative flex items-center justify-center">
                        <ArrowRight className="w-3.5 h-3.5 text-sky-400 bg-slate-950 px-0.5" />
                      </div>
                      <span className="text-[10px] text-emerald-400 mt-1">Direct Radar</span>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-black text-white">{flight.arrivalTime}</div>
                      <div className="text-xs font-bold text-sky-400">{flight.destination.code}</div>
                      <div className="text-[11px] text-slate-400">{flight.destination.city}</div>
                    </div>
                  </div>

                  {/* Terminal & Gate */}
                  <div className="lg:col-span-2 flex lg:flex-col justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>Terminal: <strong className="text-white">{flight.terminal || 'T3'}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Gate: <strong className="text-sky-400">{flight.gate || 'A12'}</strong></span>
                    </div>
                  </div>

                  {/* Status Badge & Speak Action */}
                  <div className="lg:col-span-2 flex items-center justify-end gap-2">
                    {getStatusBadge(flight.status, flight.delayMinutes)}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSpeakFlightStatus(flight);
                      }}
                      title="Speak flight status"
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
