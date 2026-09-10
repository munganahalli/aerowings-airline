import React, { useState } from 'react';
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
  Info
} from 'lucide-react';
import { AIRPORTS } from '../../data/mockData';
import { formatCurrency } from '../../utils/airlineUtils';
import { aiVoice } from '../../utils/aiVoice';
import { RealtimeAirportWeatherWidget } from '../common/RealtimeAirportWeatherWidget';

export const WeatherDisruptionCenterPage: React.FC = () => {
  const { 
    flights, 
    bookings, 
    triggerWeatherDisruption, 
    instantWeatherRefund, 
    instantWeatherRebook, 
    currency, 
    addToast, 
    resetDefaultFlights 
  } = useAirline();

  const [selectedAirportCode, setSelectedAirportCode] = useState<string>('CCU');
  const [selectedWeatherType, setSelectedWeatherType] = useState<'Clear' | 'Rain' | 'Dense Fog' | 'Heavy Thunderstorm' | 'Typhoon / Cyclone' | 'Blizzard'>('Typhoon / Cyclone');
  const [simulating, setSimulating] = useState<boolean>(false);

  // Weather-affected / auto-cancelled flights
  const disruptedFlights = flights.filter(f => f.status === 'Cancelled' || f.weather?.aiCancellationRisk === 'Critical - Auto Cancelled' || f.status === 'Delayed');
  
  // Weather-affected customer bookings
  const affectedBookings = bookings.filter(b => 
    b.status === 'Cancelled' && (b.cancellationReason?.toLowerCase().includes('weather') || b.cancellationReason?.toLowerCase().includes('cyclone') || b.cancellationReason?.toLowerCase().includes('ai'))
  );

  const handleSimulateDisruption = (airport: string, condition: any, severity: 'normal' | 'moderate' | 'severe') => {
    setSimulating(true);
    setTimeout(() => {
      triggerWeatherDisruption(airport, condition, severity);
      setSimulating(false);
    }, 600);
  };

  const handleQuickReset = () => {
    resetDefaultFlights();
    addToast('All airport weather conditions restored to Clear Skies.', 'info');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Page Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-400 text-xs font-semibold">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>AI Automated Doppler Weather Monitoring & Zero-Risk Protection Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Live AI Weather & Flight Disruption Operations
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            AeroWings AI continuously tracks global atmospheric conditions. If severe storms or crosswinds exceed safety thresholds, the AI auto-cancels flights to safeguard lives and instantly issues 100% full refunds or 1-click rebooking.
          </p>
        </div>

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

          {/* Realtime Live Meteorological Weather Widget */}
          <div className="pt-2">
            <RealtimeAirportWeatherWidget
              originCode={selectedAirportCode}
              destinationCode="BOM"
              showBoth={true}
            />
          </div>
        </div>

        {/* Live Doppler Airport Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CloudRain className="w-5 h-5 text-sky-400" />
              <span>Live Atmospheric Radar across Key Hubs</span>
            </h3>
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Updated live every 30s</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AIRPORTS.slice(0, 6).map((airport) => {
              // Find flights from this airport to inspect weather
              const hubFlight = flights.find(f => f.origin.code === airport.code || f.destination.code === airport.code);
              const weather = hubFlight?.weather || {
                condition: 'Clear',
                temperatureC: 28,
                visibilityKm: 10,
                windSpeedKmh: 12,
                stormIndex: 4,
                aiRiskScore: 3,
                aiCancellationRisk: 'Low'
              };

              const isCritical = weather.aiCancellationRisk === 'Critical - Auto Cancelled';
              const isModerate = weather.aiCancellationRisk === 'Moderate';

              return (
                <div 
                  key={airport.code}
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
                        <span>{airport.city} ({airport.code})</span>
                      </div>
                      <div className="text-xs text-slate-400">{airport.name}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          aiVoice.speak(`Doppler Weather update for ${airport.city} airport, code ${airport.code}. Condition is ${weather.condition}, temperature ${weather.temperatureC} degrees Celsius, wind speed ${weather.windSpeedKmh} kilometers per hour, visibility ${weather.visibilityKm} kilometers. Risk level is ${weather.aiCancellationRisk}.`);
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
                        {weather.condition}
                      </div>
                    </div>
                  </div>

                  {/* Weather parameters */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-800 text-center">
                    <div>
                      <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                        <Thermometer className="w-3 h-3 text-amber-400" /> Temp
                      </div>
                      <div className="text-xs font-bold text-slate-200">{weather.temperatureC}°C</div>
                    </div>

                    <div>
                      <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                        <Wind className="w-3 h-3 text-sky-400" /> Wind
                      </div>
                      <div className="text-xs font-bold text-slate-200">{weather.windSpeedKmh} km/h</div>
                    </div>

                    <div>
                      <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                        <Eye className="w-3 h-3 text-emerald-400" /> Visibility
                      </div>
                      <div className="text-xs font-bold text-slate-200">{weather.visibilityKm} km</div>
                    </div>
                  </div>

                  {/* AI Risk Indicator */}
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-slate-400">AI Cancellation Risk:</span>
                    <span className={`font-bold ${
                      isCritical ? 'text-red-400' : isModerate ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {weather.aiCancellationRisk} ({weather.aiRiskScore}%)
                    </span>
                  </div>

                  {isCritical && (
                    <div className="mt-3 p-2.5 rounded-xl bg-red-950/60 border border-red-500/30 text-[11px] text-red-200 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <span>AI Flight Grounding Active. 100% instant compensation unlocked.</span>
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
                // Find potential alternative flight on safe route
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
