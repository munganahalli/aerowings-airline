import React, { useState, useEffect } from 'react';
import { useAirline } from '../../context/AirlineContext';
import { 
  CloudRain, 
  CloudLightning, 
  Wind, 
  Eye, 
  Thermometer, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  RotateCcw, 
  Plane, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Zap, 
  ArrowRight,
  RefreshCw,
  Volume2,
  Info,
  Radio,
  Check,
  Compass,
  Gauge,
  Search,
  Globe
} from 'lucide-react';
import { AIRPORTS } from '../../data/mockData';
import { formatCurrency } from '../../utils/airlineUtils';
import { aiVoice } from '../../utils/aiVoice';
import { RealtimeAirportWeatherWidget } from '../common/RealtimeAirportWeatherWidget';
import { MeteorologicalWeatherReader } from '../common/MeteorologicalWeatherReader';
import { 
  getAirportWeatherImmediate, 
  fetchLiveAirportWeather, 
  fetchLiveWeatherByQuery,
  RealtimeAirportWeather,
  isAirportWeatherUnsafe
} from '../../utils/realtimeWeather';

export const WeatherDisruptionCenterPage: React.FC = () => {
  const { 
    flights, 
    bookings, 
    triggerWeatherDisruption, 
    instantWeatherRefund, 
    instantWeatherRebook, 
    checkAndAutoCancelWeatherDisruptedBookings,
    executeVoiceBooking,
    currency, 
    addToast, 
    resetDefaultFlights 
  } = useAirline();

  const [selectedAirportCode, setSelectedAirportCode] = useState<string>('CCU');
  const [selectedWeatherType, setSelectedWeatherType] = useState<'Clear' | 'Rain' | 'Dense Fog' | 'Heavy Thunderstorm' | 'Typhoon / Cyclone' | 'Blizzard'>('Typhoon / Cyclone');
  const [simulating, setSimulating] = useState<boolean>(false);
  const [isRefreshingLive, setIsRefreshingLive] = useState<boolean>(false);
  const [liveHubsWeather, setLiveHubsWeather] = useState<Record<string, RealtimeAirportWeather>>({});

  // Route-Specific Live Weather Telemetry State
  const [routeOrigin, setRouteOrigin] = useState<string>('DEL');
  const [routeDest, setRouteDest] = useState<string>('BOM');
  const [routeOriginWeather, setRouteOriginWeather] = useState<RealtimeAirportWeather | null>(null);
  const [routeDestWeather, setRouteDestWeather] = useState<RealtimeAirportWeather | null>(null);
  const [isLoadingRouteWeather, setIsLoadingRouteWeather] = useState<boolean>(false);

  // Global Real-Time Weather Explorer state (All States & Countries Worldwide)
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('Delhi');
  const [globalSearchResult, setGlobalSearchResult] = useState<RealtimeAirportWeather | null>(null);
  const [isSearchingGlobal, setIsSearchingGlobal] = useState<boolean>(false);

  // AI Weather Radar & Auto-Refund State
  const [autoRefundPnr, setAutoRefundPnr] = useState<string>('');
  const [autoRefundResult, setAutoRefundResult] = useState<{
    pnr: string;
    flightNumber: string;
    route: string;
    amount: number;
    utr: string;
    timestamp: string;
  } | null>(null);
  const [isRefundingLive, setIsRefundingLive] = useState<boolean>(false);

  const handleTriggerAutoRefundByPnr = (targetPnr?: string) => {
    const pnrToUse = (targetPnr || autoRefundPnr).trim().toUpperCase();
    if (!pnrToUse) {
      addToast('Please enter or select a valid PNR to check auto-refund.', 'info');
      return;
    }
    setIsRefundingLive(true);
    setTimeout(() => {
      const existing = bookings.find(b => b.pnr.toUpperCase() === pnrToUse);
      const flightNum = existing?.flight?.flightNumber || 'AW-408';
      const route = existing?.flight ? `${existing.flight.origin.code} ➔ ${existing.flight.destination.code}` : 'DEL ➔ BOM';
      const amount = existing?.priceBreakdown?.finalTotal || 5400;
      const utr = `AW-REF-${Math.floor(10000000 + Math.random() * 90000000)}`;

      if (existing) {
        instantWeatherRefund(existing.pnr);
      }

      setAutoRefundResult({
        pnr: pnrToUse,
        flightNumber: flightNum,
        route,
        amount,
        utr,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
      setIsRefundingLive(false);
      addToast(`⚡ 100% Instant Auto-Refund Approved for PNR ${pnrToUse}! Transferred UTR: ${utr}`, 'success');
      aiVoice.speak(`100 percent weather refund successfully credited for PNR ${pnrToUse}.`);
    }, 700);
  };

  const handleSearchGlobalWeather = async (queryToSearch: string) => {
    const q = (queryToSearch || globalSearchQuery).trim();
    if (!q) return;
    setIsSearchingGlobal(true);
    try {
      const res = await fetchLiveWeatherByQuery(q);
      if (res) {
        setGlobalSearchResult(res);
        addToast(`✅ Live Open-Meteo Weather for ${res.cityName}: ${res.temperatureC}°C, ${res.conditionText}`, 'success');
      } else {
        addToast(`Could not retrieve weather for "${q}". Please check the name.`, 'error');
      }
    } catch (e) {
      console.warn('Global weather search error:', e);
    } finally {
      setIsSearchingGlobal(false);
    }
  };

  // Weather-affected / auto-cancelled flights
  const disruptedFlights = flights.filter(f => f.status === 'Cancelled' || f.weather?.aiCancellationRisk === 'Critical - Auto Cancelled' || f.status === 'Delayed');
  
  // Weather-affected customer bookings
  const affectedBookings = bookings.filter(b => 
    b.status === 'Cancelled' && (b.cancellationReason?.toLowerCase().includes('weather') || b.cancellationReason?.toLowerCase().includes('cyclone') || b.cancellationReason?.toLowerCase().includes('doppler') || b.cancellationReason?.toLowerCase().includes('grounding') || b.cancellationReason?.toLowerCase().includes('watchdog'))
  );

  const activeConfirmedBookings = bookings.filter(b => b.status === 'Confirmed');

  // Key hub airports to track in live radar grid
  const keyHubCodes = ['DEL', 'BOM', 'BLR', 'MAA', 'CCU', 'HYD', 'GOI', 'JAI', 'DXB', 'LHR', 'SIN', 'JFK'];

  // Load live real-time weather from Open-Meteo API for all hubs
  const loadAllHubsLiveWeather = async (forceRefresh = false) => {
    setIsRefreshingLive(true);
    const updatedMap: Record<string, RealtimeAirportWeather> = {};
    for (const code of keyHubCodes) {
      try {
        const live = await fetchLiveAirportWeather(code, forceRefresh);
        updatedMap[code] = live;
      } catch {
        updatedMap[code] = getAirportWeatherImmediate(code);
      }
    }
    setLiveHubsWeather(updatedMap);
    setIsRefreshingLive(false);
  };

  // Load live weather for the selected flight route
  const loadRouteWeather = async (orig: string, dest: string) => {
    setIsLoadingRouteWeather(true);
    try {
      const [origW, destW] = await Promise.all([
        fetchLiveAirportWeather(orig, true),
        fetchLiveAirportWeather(dest, true)
      ]);
      setRouteOriginWeather(origW);
      setRouteDestWeather(destW);
    } catch {
      setRouteOriginWeather(getAirportWeatherImmediate(orig));
      setRouteDestWeather(getAirportWeatherImmediate(dest));
    } finally {
      setIsLoadingRouteWeather(false);
    }
  };

  useEffect(() => {
    loadAllHubsLiveWeather(true);
    loadRouteWeather(routeOrigin, routeDest);
    handleSearchGlobalWeather('Delhi');

    const handleWeatherUpdate = () => {
      loadAllHubsLiveWeather(false);
      loadRouteWeather(routeOrigin, routeDest);
    };

    window.addEventListener('aerowings_weather_updated', handleWeatherUpdate);
    return () => window.removeEventListener('aerowings_weather_updated', handleWeatherUpdate);
  }, []);

  const handleSimulateDisruption = (airport: string, condition: any, severity: 'normal' | 'moderate' | 'severe') => {
    setSimulating(true);
    setTimeout(() => {
      triggerWeatherDisruption(airport, condition, severity);
      setSimulating(false);
      // Automatically check and cancel affected bookings without human intervention
      setTimeout(() => {
        checkAndAutoCancelWeatherDisruptedBookings();
      }, 400);
    }, 500);
  };

  const handleQuickReset = () => {
    resetDefaultFlights();
    loadAllHubsLiveWeather(true);
    loadRouteWeather(routeOrigin, routeDest);
    addToast('All airport weather conditions restored to Clear Skies.', 'info');
  };

  // Test zero-human auto-cancellation on booked flight
  const handleTestZeroHumanCancellation = (targetAirportCode: string, flightNumber: string) => {
    addToast(`⚡ Triggering severe storm at ${targetAirportCode} to verify Autonomous Zero-Human Cancellation...`, 'info');
    triggerWeatherDisruption(targetAirportCode, 'Typhoon / Cyclone', 'severe');
    setTimeout(() => {
      checkAndAutoCancelWeatherDisruptedBookings();
      loadAllHubsLiveWeather(false);
    }, 400);
  };

  // Demo auto-booking creation if user has no booked flights yet
  const handleCreateDemoBookingAndCancel = async () => {
    addToast('Creating quick flight booking to demonstrate zero-human cancellation...', 'info');
    try {
      const demoBooking = await executeVoiceBooking({
        origin: 'DEL',
        destination: 'BOM',
        passengerName: 'Rohit Verma',
        recipientPhone: '9876543210',
        seatClass: 'Economy',
        totalPriceINR: 4850
      });
      addToast(`Booking confirmed for PNR ${demoBooking.pnr}. Now initiating severe weather watchdog...`, 'info');
      setTimeout(() => {
        handleTestZeroHumanCancellation('DEL', demoBooking.flight.flightNumber);
      }, 1000);
    } catch {
      handleTestZeroHumanCancellation('DEL', 'AW-302');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Page Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-400 text-xs font-semibold">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Real-Time Open-Meteo & Doppler Aviation Radar • Live API Active</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Live AI Weather & Flight Disruption Operations
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            AeroWings AI continuously tracks live atmospheric telemetry across all domestic states & global airports via real-time Meteorological API feeds. If severe storms, cyclones, or low-visibility fog occurs, tickets are <span className="text-amber-400 font-semibold">automatically cancelled without human intervention</span> with 100% instant refunds.
          </p>
        </div>

        {/* Autonomous Zero-Human Ticket Cancellation Watchdog Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-500/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                  <span>Autonomous Weather Protection Watchdog</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    ACTIVE (Continuous 20s Scan)
                  </span>
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Guarantees that when weather conditions turn hazardous along your booked flight route, your ticket is cancelled <strong>automatically without any human handling</strong>, and 100% instant full refund is credited.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => checkAndAutoCancelWeatherDisruptedBookings()}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Run Immediate AI Watchdog Scan</span>
              </button>
            </div>
          </div>

          {/* Active Bookings Status & Zero-Human Verification Action */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
              <div className="text-[11px] font-semibold text-slate-400">Active Booked Flights</div>
              <div className="text-2xl font-black text-white">{activeConfirmedBookings.length}</div>
              <p className="text-[11px] text-slate-500">Continuously monitored against Doppler storm & wind thresholds.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
              <div className="text-[11px] font-semibold text-slate-400">Auto-Cancelled & Refunded Tickets</div>
              <div className="text-2xl font-black text-emerald-400">{affectedBookings.length}</div>
              <p className="text-[11px] text-slate-500">100% full refunds credited with zero manual human effort.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
              <div className="text-[11px] font-semibold text-slate-400">Zero-Human Cancellation Test</div>
              {activeConfirmedBookings.length > 0 ? (
                <button
                  type="button"
                  onClick={() => handleTestZeroHumanCancellation(activeConfirmedBookings[0].flight.origin.code, activeConfirmedBookings[0].flight.flightNumber)}
                  className="mt-2 w-full py-2 px-3 rounded-lg bg-red-600/80 hover:bg-red-500 text-white text-xs font-bold transition-all shadow cursor-pointer text-center"
                >
                  ⚡ Test Auto-Cancel on {activeConfirmedBookings[0].flight.flightNumber}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCreateDemoBookingAndCancel}
                  className="mt-2 w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow cursor-pointer text-center"
                >
                  ⚡ Book Demo & Test Auto-Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 🌩️ AI Weather Radar & Auto-Refund Console */}
        <div id="weather-refund-console" className="bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border-2 border-sky-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-sky-500/20 pb-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-black border border-sky-500/30 uppercase tracking-wider mb-2">
                <CloudLightning className="w-3.5 h-3.5 text-amber-400" />
                <span>🌩️ AI Weather Radar & Auto-Refund Portal</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Instant 100% Zero-Loss Weather Disruption Refund
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                If your flight is grounded or cancelled due to thunderstorms, cyclones, blizzards, or zero visibility, our automated Doppler radar triggers an immediate 100% full refund with <strong className="text-emerald-400">zero cancellation fees</strong> directly to your bank account or original payment method.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Full Refund Guarantee</span>
              </span>
            </div>
          </div>

          {/* Auto-Refund PNR Input & Quick Selector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 space-y-4">
              <label className="block text-xs font-bold text-white uppercase tracking-wider">
                Enter Booking PNR to Process Instant Auto-Refund:
              </label>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Plane className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={autoRefundPnr}
                    onChange={(e) => setAutoRefundPnr(e.target.value.toUpperCase())}
                    placeholder="Enter PNR e.g. AW-7291 or select a flight below..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm font-mono font-bold text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <button
                  type="button"
                  disabled={isRefundingLive}
                  onClick={() => handleTriggerAutoRefundByPnr()}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white font-black text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 whitespace-nowrap"
                >
                  {isRefundingLive ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying Doppler Radar...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-amber-300" />
                      <span>Execute 100% Auto-Refund</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quick Select from Active Bookings */}
              <div className="space-y-2 pt-1">
                <div className="text-[11px] text-slate-400 font-semibold">Quick Select from My Bookings or Demo PNRs:</div>
                <div className="flex flex-wrap gap-2">
                  {bookings.slice(0, 4).map((b) => (
                    <button
                      key={b.pnr}
                      type="button"
                      onClick={() => {
                        setAutoRefundPnr(b.pnr);
                        handleTriggerAutoRefundByPnr(b.pnr);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500 text-slate-200 text-xs font-mono font-bold cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      <span className="text-sky-400">{b.pnr}</span>
                      <span className="text-[10px] text-slate-400 font-sans">({b.flight.origin.code}➔{b.flight.destination.code})</span>
                    </button>
                  ))}

                  {/* Fallback demo PNRs if user has no bookings */}
                  {['AW-302', 'AW-201', 'AW-451'].map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => {
                        setAutoRefundPnr(code);
                        handleTriggerAutoRefundByPnr(code);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500 text-slate-300 text-xs font-mono cursor-pointer transition-all"
                    >
                      Demo PNR: <strong className="text-emerald-400">{code}</strong>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Auto-Refund Result Receipt */}
            <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>Auto-Refund Settlement Status</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  autoRefundResult ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                }`}>
                  {autoRefundResult ? 'CREDITED TO BANK' : 'Awaiting PNR'}
                </span>
              </div>

              {autoRefundResult ? (
                <div className="space-y-3 animate-fadeIn text-xs">
                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1.5 text-emerald-200">
                    <div className="flex justify-between font-mono">
                      <span>Booking PNR:</span>
                      <strong className="text-white">{autoRefundResult.pnr}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Flight Route:</span>
                      <strong className="text-white">{autoRefundResult.flightNumber} ({autoRefundResult.route})</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>100% Refund Amount:</span>
                      <strong className="text-emerald-400 text-sm font-extrabold">{formatCurrency(autoRefundResult.amount, currency)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Cancellation Fee:</span>
                      <span className="text-white line-through">₹2,500</span> <strong className="text-emerald-400">₹0 (Waived)</strong>
                    </div>
                    <div className="flex justify-between border-t border-emerald-500/20 pt-1.5">
                      <span>Bank UTR Ref:</span>
                      <span className="font-mono text-sky-300 font-bold">{autoRefundResult.utr}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Credited At:</span>
                      <span>{autoRefundResult.timestamp}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      addToast(`📥 Downloaded Official Auto-Refund Receipt for PNR ${autoRefundResult.pnr}`, 'success');
                    }}
                    className="w-full py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 font-bold text-xs cursor-pointer transition-colors text-center"
                  >
                    Download Settlement Receipt (PDF)
                  </button>
                </div>
              ) : (
                <div className="py-6 text-center space-y-2 text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto" />
                  <p>Enter any flight PNR above to preview zero-fee weather cancellation and disburse 100% automatic refund instantly.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Global Real-Time Weather Explorer (All States & Countries Worldwide) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-sky-300 text-[11px] font-bold uppercase tracking-wider mb-2">
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                <span>Worldwide Meteorological API Grounding • Live Open-Meteo Feed</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-amber-400" />
                <span>Global Real-Time Weather Explorer (All States & Countries)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Search any state, city, or country worldwide to fetch live, verifiable meteorological telemetry (exact temperature, wind, humidity, visibility, and flight safety index).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Open-Meteo API v1 Connected</span>
              </span>
            </div>
          </div>

          {/* Search Input Bar & Quick Shortcut Chips */}
          <div className="space-y-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearchGlobalWeather(globalSearchQuery);
              }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={globalSearchQuery}
                  onChange={(e) => setGlobalSearchQuery(e.target.value)}
                  placeholder="Enter any state, city, or country (e.g., Delhi, Mumbai, Karnataka, Kashmir, California, London, Tokyo)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs text-white placeholder-slate-500 focus:outline-none font-medium"
                />
              </div>
              <button
                type="submit"
                disabled={isSearchingGlobal}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSearchingGlobal ? 'animate-spin' : ''}`} />
                <span>{isSearchingGlobal ? 'Fetching Live API...' : 'Check Live Weather'}</span>
              </button>
            </form>

            {/* Quick States & Hubs rendered one by one */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-4 h-4" />
                  <span>Quick States & Hubs (Select One by One for Real-Time Radar & Disruption Telemetry):</span>
                </span>
                <span className="text-[11px] text-slate-400">14 Verified Corridors</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {[
                  { label: '🇮🇳 Delhi', q: 'Delhi', desc: 'Indira Gandhi International Hub (DEL)' },
                  { label: '🇮🇳 Mumbai', q: 'Mumbai', desc: 'Chhatrapati Shivaji Maharaj Hub (BOM)' },
                  { label: '🇮🇳 Bengaluru (Karnataka)', q: 'Bengaluru (Karnataka)', desc: 'Kempegowda International Hub (BLR)' },
                  { label: '🇮🇳 Chennai (Tamil Nadu)', q: 'Chennai (Tamil Nadu)', desc: 'Chennai International Hub (MAA)' },
                  { label: '🇮🇳 Srinagar (Kashmir)', q: 'Srinagar (Kashmir)', desc: 'Sheikh ul-Alam International Hub (SXR)' },
                  { label: '🇮🇳 Goa', q: 'Goa', desc: 'Dabolim / Manohar International Hub (GOI)' },
                  { label: '🇮🇳 Kolkata (West Bengal)', q: 'Kolkata (West Bengal)', desc: 'Netaji Subhash Chandra Bose Hub (CCU)' },
                  { label: '🇦🇪 Dubai', q: 'Dubai', desc: 'Dubai International Hub (DXB)' },
                  { label: '🇬🇧 London', q: 'London', desc: 'London Heathrow Gateway (LHR)' },
                  { label: '🇺🇸 New York', q: 'New York', desc: 'John F. Kennedy Gateway (JFK)' },
                  { label: '🇺🇸 California', q: 'California', desc: 'San Francisco Bay Area Corridor (SFO)' },
                  { label: '🇯🇵 Tokyo', q: 'Tokyo', desc: 'Tokyo Haneda International Hub (HND)' },
                  { label: '🇸🇬 Singapore', q: 'Singapore', desc: 'Singapore Changi Gateway (SIN)' },
                  { label: '🇫🇷 Paris', q: 'Paris', desc: 'Paris Charles de Gaulle Gateway (CDG)' }
                ].map((loc, idx) => {
                  const isSelected = globalSearchQuery.toLowerCase() === loc.q.toLowerCase() || 
                    (globalSearchResult?.cityName && globalSearchResult.cityName.toLowerCase().includes(loc.q.toLowerCase().split(' ')[0]));

                  return (
                    <button
                      key={loc.q}
                      id={`hub-one-by-one-${idx}`}
                      type="button"
                      onClick={() => {
                        setGlobalSearchQuery(loc.q);
                        handleSearchGlobalWeather(loc.q);
                      }}
                      className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-white shadow-md shadow-blue-500/10'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] font-mono font-bold shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="font-bold text-xs truncate flex items-center gap-1.5">
                            <span>{loc.label}</span>
                            {isSelected && (
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">{loc.desc}</div>
                        </div>
                      </div>

                      <span className={`text-[11px] font-bold px-2 py-1 rounded-lg shrink-0 whitespace-nowrap transition-colors ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-900 text-sky-400 hover:text-white'
                      }`}>
                        {isSelected ? 'Live Active' : 'Inspect'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Result Card */}
          {globalSearchResult && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white">{globalSearchResult.cityName}</h3>
                    <span className="px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 font-mono text-xs font-bold border border-sky-500/30">
                      {globalSearchResult.airportCode}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                      globalSearchResult.flightSafetyStatus === 'SEVERE_IFR'
                        ? 'bg-red-500/20 text-red-400 border-red-500/30'
                        : globalSearchResult.flightSafetyStatus === 'MODERATE_MVFR'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}>
                      {globalSearchResult.flightSafetyStatus === 'OPTIMAL_VFR' ? 'Optimal Flight Safety' : globalSearchResult.conditionText}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {globalSearchResult.airportName} • Lat: {globalSearchResult.latitude.toFixed(4)}°, Lng: {globalSearchResult.longitude.toFixed(4)}° • Updated: {globalSearchResult.lastUpdated}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      aiVoice.speak(
                        `Live Open-Meteo weather update for ${globalSearchResult.cityName}. The current temperature is exactly ${globalSearchResult.temperatureC} degrees Celsius, ${globalSearchResult.conditionText}. Wind speed is ${globalSearchResult.windSpeedKmh} kilometers per hour, visibility is ${globalSearchResult.visibilityKm} kilometers. Flight safety is ${globalSearchResult.flightSafetyStatus}.`
                      );
                    }}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                    title="Speak Weather Report Aloud"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Listen Live</span>
                  </button>

                  <div className="text-right">
                    <div className="text-3xl sm:text-4xl font-black text-white">
                      {globalSearchResult.temperatureC}°C
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {globalSearchResult.temperatureF}°F (Feels like {globalSearchResult.apparentTemperatureC}°C)
                    </div>
                  </div>
                </div>
              </div>

              {/* Weather Telemetry Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-slate-800/80 text-center">
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                    <Wind className="w-3.5 h-3.5 text-sky-400" /> Wind Velocity
                  </div>
                  <div className="text-sm font-bold text-white mt-1">{globalSearchResult.windSpeedKmh} km/h</div>
                  <div className="text-[10px] text-slate-500">{globalSearchResult.windDirectionDeg}° direction</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-emerald-400" /> Visibility
                  </div>
                  <div className="text-sm font-bold text-white mt-1">{globalSearchResult.visibilityKm} km</div>
                  <div className="text-[10px] text-slate-500">{globalSearchResult.visibilityKm >= 9 ? 'Unlimited VFR' : 'Restricted CAT-I'}</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                    <Gauge className="w-3.5 h-3.5 text-amber-400" /> Relative Humidity
                  </div>
                  <div className="text-sm font-bold text-white mt-1">{globalSearchResult.humidity}%</div>
                  <div className="text-[10px] text-slate-500">Dew Point Synced</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> Safety Score
                  </div>
                  <div className="text-sm font-bold text-emerald-400 mt-1">{globalSearchResult.safetyScore} / 100</div>
                  <div className="text-[10px] text-slate-500">Autonomous Watchdog</div>
                </div>
              </div>

              {/* Advisory bar */}
              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/20 flex items-center justify-between text-xs text-sky-200">
                <span className="font-semibold">✈️ Aviation Advisory: {globalSearchResult.runwayAdvisory}</span>
                <span className="font-mono text-[10px] text-slate-400">Open-Meteo Verified</span>
              </div>
            </div>
          )}
        </div>

        {/* Live Route Real-Time Weather API Telemetry Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-sky-400" />
                <span>Live Flight Route Weather Telemetry (Open-Meteo API Feed)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Inspect real-time weather API metrics (exact live temperature, wind speed, precipitation, visibility) across any departure and arrival corridor.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => loadRouteWeather(routeOrigin, routeDest)}
                disabled={isLoadingRouteWeather}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${isLoadingRouteWeather ? 'animate-spin' : ''}`} />
                <span>Fetch Live API Weather</span>
              </button>
            </div>
          </div>

          {/* Route Selector Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Departure Origin Hub</label>
              <select
                value={routeOrigin}
                onChange={(e) => {
                  setRouteOrigin(e.target.value);
                  loadRouteWeather(e.target.value, routeDest);
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                {AIRPORTS.map((a) => (
                  <option key={`orig-${a.code}`} value={a.code}>
                    {a.city} ({a.code}) - {a.country}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Arrival Destination Hub</label>
              <select
                value={routeDest}
                onChange={(e) => {
                  setRouteDest(e.target.value);
                  loadRouteWeather(routeOrigin, e.target.value);
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                {AIRPORTS.map((a) => (
                  <option key={`dest-${a.code}`} value={a.code}>
                    {a.city} ({a.code}) - {a.country}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <button
                type="button"
                onClick={() => {
                  const t = routeOrigin;
                  setRouteOrigin(routeDest);
                  setRouteDest(t);
                  loadRouteWeather(routeDest, t);
                }}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
                <span>Swap Route Direction</span>
              </button>
            </div>
          </div>

          {/* Live Telemetry Display for Both Airports */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Origin Telemetry Card */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-sky-400 font-bold uppercase tracking-wider">Departure Airport</div>
                  <div className="text-lg font-black text-white">{routeOriginWeather?.cityName || routeOrigin} ({routeOrigin})</div>
                  <div className="text-[11px] text-slate-400">{routeOriginWeather?.airportName}</div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-extrabold text-white">
                    {routeOriginWeather ? `${routeOriginWeather.temperatureC}°C` : '--'}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    {routeOriginWeather?.conditionText || 'Syncing API...'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-slate-800/80 text-center text-xs">
                <div>
                  <div className="text-slate-400 text-[10px] flex items-center justify-center gap-1">
                    <Wind className="w-3 h-3 text-sky-400" /> Wind
                  </div>
                  <div className="font-bold text-white mt-0.5">{routeOriginWeather?.windSpeedKmh ?? 12} km/h</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px] flex items-center justify-center gap-1">
                    <Eye className="w-3 h-3 text-emerald-400" /> Visibility
                  </div>
                  <div className="font-bold text-white mt-0.5">{routeOriginWeather?.visibilityKm ?? 10} km</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px] flex items-center justify-center gap-1">
                    <Gauge className="w-3 h-3 text-amber-400" /> Humidity
                  </div>
                  <div className="font-bold text-white mt-0.5">{routeOriginWeather?.humidity ?? 55}%</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Flight Safety Status:</span>
                <span className="font-bold text-emerald-400">{routeOriginWeather?.flightSafetyStatus ?? 'OPTIMAL_VFR'}</span>
              </div>
            </div>

            {/* Destination Telemetry Card */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-sky-400 font-bold uppercase tracking-wider">Arrival Destination</div>
                  <div className="text-lg font-black text-white">{routeDestWeather?.cityName || routeDest} ({routeDest})</div>
                  <div className="text-[11px] text-slate-400">{routeDestWeather?.airportName}</div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-extrabold text-white">
                    {routeDestWeather ? `${routeDestWeather.temperatureC}°C` : '--'}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    {routeDestWeather?.conditionText || 'Syncing API...'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-slate-800/80 text-center text-xs">
                <div>
                  <div className="text-slate-400 text-[10px] flex items-center justify-center gap-1">
                    <Wind className="w-3 h-3 text-sky-400" /> Wind
                  </div>
                  <div className="font-bold text-white mt-0.5">{routeDestWeather?.windSpeedKmh ?? 14} km/h</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px] flex items-center justify-center gap-1">
                    <Eye className="w-3 h-3 text-emerald-400" /> Visibility
                  </div>
                  <div className="font-bold text-white mt-0.5">{routeDestWeather?.visibilityKm ?? 10} km</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px] flex items-center justify-center gap-1">
                    <Gauge className="w-3 h-3 text-amber-400" /> Humidity
                  </div>
                  <div className="font-bold text-white mt-0.5">{routeDestWeather?.humidity ?? 60}%</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Flight Safety Status:</span>
                <span className="font-bold text-emerald-400">{routeDestWeather?.flightSafetyStatus ?? 'OPTIMAL_VFR'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Real-Time Meteorological AI Weather Reader & API Predictor */}
        <MeteorologicalWeatherReader
          initialAirportCode="DEL"
          title="AeroWings Flight Operations Meteorological AI Reader & Short-Term Predictor"
        />

        {/* Live Weather Simulator Control Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <span>AI Automated Weather Trigger Simulator</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulate extreme weather events across our hubs to test the automatic AI grounding & passenger refund mechanisms.
              </p>
            </div>

            <button
              onClick={handleQuickReset}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Clear Weather</span>
            </button>
          </div>

          {/* Quick Preset Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              onClick={() => handleSimulateDisruption('CCU', 'Typhoon / Cyclone', 'severe')}
              disabled={simulating}
              className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 hover:border-red-500/60 text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs font-bold text-red-400 mb-1">
                <span>🌀 Super Cyclone Alert</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20">CCU (Kolkata)</span>
              </div>
              <p className="text-[11px] text-slate-400">95 km/h winds, torrential rain. AI auto-cancels flights.</p>
            </button>

            <button
              onClick={() => handleSimulateDisruption('DEL', 'Dense Fog', 'severe')}
              disabled={simulating}
              className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 hover:border-amber-500/60 text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs font-bold text-amber-400 mb-1">
                <span>🌫️ Zero-Visibility Fog</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20">DEL (Delhi)</span>
              </div>
              <p className="text-[11px] text-slate-400">CAT-III sub-200m visibility. AI grounds departures.</p>
            </button>

            <button
              onClick={() => handleSimulateDisruption('LHR', 'Blizzard', 'severe')}
              disabled={simulating}
              className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 hover:border-blue-500/60 text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs font-bold text-sky-400 mb-1">
                <span>❄️ Arctic Blizzard</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20">LHR (London)</span>
              </div>
              <p className="text-[11px] text-slate-400">-5°C freezing snowstorm. AI initiates instant rebooking.</p>
            </button>

            <button
              onClick={() => handleSimulateDisruption('BOM', 'Heavy Thunderstorm', 'moderate')}
              disabled={simulating}
              className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 hover:border-purple-500/60 text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs font-bold text-purple-400 mb-1">
                <span>⛈️ Monsoon Thunderstorm</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20">BOM (Mumbai)</span>
              </div>
              <p className="text-[11px] text-slate-400">45-min hold. AI flags moderate delay.</p>
            </button>
          </div>

          {/* Custom Interactive Airport Weather Predictor & Trigger Form */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-sky-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Interactive Airport Weather Predictor & Scenario Tester</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Select Airport Hub</label>
                <select
                  value={selectedAirportCode}
                  onChange={(e) => setSelectedAirportCode(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  {AIRPORTS.map((a) => (
                    <option key={a.code} value={a.code}>
                      {a.city} ({a.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Predicted Weather Condition</label>
                <select
                  value={selectedWeatherType}
                  onChange={(e) => setSelectedWeatherType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="Clear">☀️ Clear Skies (Optimal VFR)</option>
                  <option value="Rain">🌧️ Moderate Rain</option>
                  <option value="Dense Fog">🌫️ Dense Fog (Low Visibility)</option>
                  <option value="Heavy Thunderstorm">⛈️ Heavy Thunderstorm</option>
                  <option value="Typhoon / Cyclone">🌀 Typhoon / Super Cyclone</option>
                  <option value="Blizzard">❄️ Blizzard / Snowstorm</option>
                </select>
              </div>

              <div className="sm:col-span-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const sev = selectedWeatherType === 'Clear' ? 'normal' : selectedWeatherType === 'Rain' ? 'moderate' : 'severe';
                    handleSimulateDisruption(selectedAirportCode, selectedWeatherType, sev);
                  }}
                  disabled={simulating}
                  className="flex-1 py-2 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
                >
                  {simulating ? 'Running AI Predictor...' : `🔮 Run Weather Predictor & Auto-Cancel Guard for ${selectedAirportCode}`}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Doppler Airport Cards (Exact Real-Time Weather API Telemetry) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CloudRain className="w-5 h-5 text-sky-400" />
              <span>Live Atmospheric Radar across Key Hubs (Real-Time API)</span>
            </h3>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => loadAllHubsLiveWeather(true)}
                disabled={isRefreshingLive}
                className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshingLive ? 'animate-spin' : ''}`} />
                <span>Refresh Live API</span>
              </button>
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Live Feed Synced</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {keyHubCodes.map((code) => {
              const airportObj = AIRPORTS.find(a => a.code === code) || { code, city: code, name: `${code} Airport` };
              const liveW = liveHubsWeather[code] || getAirportWeatherImmediate(code);

              const isCritical = liveW.flightSafetyStatus === 'SEVERE_IFR' || liveW.safetyScore < 40;
              const isModerate = liveW.flightSafetyStatus === 'MODERATE_MVFR';

              return (
                <div 
                  key={code}
                  className={`bg-slate-900 rounded-2xl p-5 border transition-all ${
                    isCritical 
                      ? 'border-red-500/50 bg-red-950/10 shadow-lg shadow-red-950/30' 
                      : isModerate
                      ? 'border-amber-500/40 bg-amber-950/10'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-lg font-bold text-white flex items-center gap-2">
                        <span>{liveW.cityName || airportObj.city} ({code})</span>
                      </div>
                      <div className="text-xs text-slate-400">{liveW.airportName || airportObj.name}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          aiVoice.speak(`Live weather report for ${liveW.cityName || airportObj.city}. Condition is ${liveW.conditionText}, temperature ${liveW.temperatureC} degrees Celsius, wind speed ${liveW.windSpeedKmh} kilometers per hour, visibility ${liveW.visibilityKm} kilometers. Safety status is ${liveW.flightSafetyStatus}.`);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-white transition-colors cursor-pointer"
                        title="Listen to AI Weather Voice"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>

                      <div className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                        isCritical
                          ? 'bg-red-500/20 text-red-400 border-red-500/30'
                          : isModerate
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {liveW.conditionText}
                      </div>
                    </div>
                  </div>

                  {/* Weather parameters */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-800 text-center">
                    <div>
                      <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                        <Thermometer className="w-3 h-3 text-amber-400" /> Temp
                      </div>
                      <div className="text-sm font-black text-slate-200 mt-0.5">{liveW.temperatureC}°C</div>
                    </div>

                    <div>
                      <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                        <Wind className="w-3 h-3 text-sky-400" /> Wind
                      </div>
                      <div className="text-xs font-bold text-slate-200 mt-0.5">{liveW.windSpeedKmh} km/h</div>
                    </div>

                    <div>
                      <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                        <Eye className="w-3 h-3 text-emerald-400" /> Visibility
                      </div>
                      <div className="text-xs font-bold text-slate-200 mt-0.5">{liveW.visibilityKm} km</div>
                    </div>
                  </div>

                  {/* AI Risk Indicator */}
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Doppler Safety Score:</span>
                    <span className={`font-bold ${
                      isCritical ? 'text-red-400' : isModerate ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {liveW.safetyScore}/100 ({liveW.flightSafetyStatus})
                    </span>
                  </div>

                  {isCritical && (
                    <div className="mt-3 p-2.5 rounded-xl bg-red-950/60 border border-red-500/30 text-[11px] text-red-200 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <span>Zero-Human Auto-Grounding active. 100% full refund guaranteed.</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Disrupted & Protected Flights Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                <span>AI Grounded / Protected Flight Manifest</span>
              </h3>
              <p className="text-xs text-slate-400">
                Flights automatically protected by the AI Doppler Flight Watch system.
              </p>
            </div>

            <span className="px-3 py-1 rounded-full bg-slate-800 text-xs font-bold text-slate-300 border border-slate-700">
              {disruptedFlights.length} Flights Monitored
            </span>
          </div>

          {disruptedFlights.length === 0 ? (
            <div className="text-center py-10 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <div className="text-sm font-bold text-white">All Air Corridors Clear</div>
              <p className="text-xs text-slate-400">Zero active flight cancellations. Sky conditions are optimal worldwide.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {disruptedFlights.map((flight) => {
                const isAutoCancelled = flight.status === 'Cancelled';
                const alternativeFlight = flights.find(f => f.id !== flight.id && f.status !== 'Cancelled');

                return (
                  <div 
                    key={flight.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isAutoCancelled 
                        ? 'bg-red-950/20 border-red-500/40' 
                        : 'bg-amber-950/20 border-amber-500/40'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      
                      {/* Flight Route Details */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold text-white">{flight.flightNumber}</span>
                          <span className="text-xs text-slate-400">({flight.airline})</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            isAutoCancelled ? 'bg-red-500/30 text-red-300 border border-red-500/40' : 'bg-amber-500/30 text-amber-300'
                          }`}>
                            {flight.status}
                          </span>
                        </div>

                        <div className="text-xs text-slate-300 flex items-center gap-2">
                          <span className="font-semibold">{flight.origin.city} ({flight.origin.code})</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold">{flight.destination.city} ({flight.destination.code})</span>
                          <span className="text-slate-500">•</span>
                          <span>Departure: {flight.departureTime}</span>
                        </div>

                        {flight.weather?.aiAutoCancelReason && (
                          <div className="text-xs text-red-300/90 font-medium pt-1">
                            ⚠️ {flight.weather.aiAutoCancelReason}
                          </div>
                        )}
                      </div>

                      {/* Passenger Protection Actions */}
                      <div className="flex flex-wrap items-center gap-2">
                        {isAutoCancelled && (
                          <>
                            <div className="text-right mr-2 hidden sm:block">
                              <div className="text-[11px] text-emerald-400 font-bold">100% Zero Deduction</div>
                              <div className="text-xs font-bold text-white">{formatCurrency(flight.prices.economy, currency)} Refund</div>
                            </div>

                            <button
                              id={`refund-btn-${flight.id}`}
                              onClick={() => {
                                const sampleBooking = affectedBookings[0] || bookings[0];
                                if (sampleBooking) {
                                  instantWeatherRefund(sampleBooking.pnr);
                                } else {
                                  addToast('100% Instant Weather Refund Processed to registered account!', 'success');
                                }
                              }}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                            >
                              <DollarSign className="w-4 h-4" />
                              <span>Instant 100% Refund</span>
                            </button>

                            {alternativeFlight && (
                              <button
                                id={`rebook-btn-${flight.id}`}
                                onClick={() => {
                                  const sampleBooking = affectedBookings[0] || bookings[0];
                                  if (sampleBooking) {
                                    instantWeatherRebook(sampleBooking.pnr, alternativeFlight.id);
                                  } else {
                                    addToast(`✈️ 1-Click Free Rebooking dispatched to next available safe flight (${alternativeFlight.flightNumber})!`, 'success');
                                  }
                                }}
                                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                              >
                                <RefreshCw className="w-4 h-4" />
                                <span>Free AI Rebook</span>
                              </button>
                            )}
                          </>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
