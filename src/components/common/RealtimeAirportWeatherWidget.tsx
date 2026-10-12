import React, { useState, useEffect } from 'react';
import { 
  fetchLiveAirportWeather, 
  fetchLiveCoordinatesWeather,
  getAirportWeatherImmediate, 
  AIRPORT_METEO_COORDINATES,
  RealtimeAirportWeather 
} from '../../utils/realtimeWeather';
import { aiVoice } from '../../utils/aiVoice';
import { useAirline } from '../../context/AirlineContext';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  CloudLightning, 
  Wind, 
  Eye, 
  Droplets, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Radio, 
  Compass,
  MapPin,
  Volume2,
  Zap,
  RotateCcw
} from 'lucide-react';

interface RealtimeAirportWeatherWidgetProps {
  originCode: string;
  destinationCode?: string;
  compact?: boolean;
  showBoth?: boolean;
  onNavigateToWeatherRadar?: () => void;
  onSelectAirport?: (code: string) => void;
}

export const RealtimeAirportWeatherWidget: React.FC<RealtimeAirportWeatherWidgetProps> = ({
  originCode,
  destinationCode,
  compact = false,
  showBoth = false,
  onNavigateToWeatherRadar,
  onSelectAirport
}) => {
  const { triggerWeatherDisruption, resetDefaultFlights } = useAirline();
  // Synchronously initialize with instant realistic data to avoid any blank loading delay
  const [originWeather, setOriginWeather] = useState<RealtimeAirportWeather>(() => 
    getAirportWeatherImmediate(originCode || 'DEL')
  );
  const [destWeather, setDestWeather] = useState<RealtimeAirportWeather | null>(() => 
    destinationCode ? getAirportWeatherImmediate(destinationCode) : (showBoth ? getAirportWeatherImmediate('BOM') : null)
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>(() => 
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );
  const [activeTab, setActiveTab] = useState<'route' | 'radar_hubs'>('route');

  const loadWeatherData = async (force = false, customOrigin?: string, customDest?: string) => {
    setLoading(true);
    try {
      const origCode = customOrigin || originCode || 'DEL';
      const dCode = customDest || destinationCode || (showBoth ? 'BOM' : undefined);

      const [originData, destData] = await Promise.all([
        fetchLiveAirportWeather(origCode, force),
        dCode ? fetchLiveAirportWeather(dCode, force) : Promise.resolve(null)
      ]);
      setOriginWeather(originData);
      if (destData) setDestWeather(destData);
      setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.warn('Weather fetch warning:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (originCode) {
      setOriginWeather(getAirportWeatherImmediate(originCode));
    }
    if (destinationCode) {
      setDestWeather(getAirportWeatherImmediate(destinationCode));
    } else if (showBoth) {
      setDestWeather(getAirportWeatherImmediate('BOM'));
    }
    loadWeatherData(false);
  }, [originCode, destinationCode, showBoth]);

  useEffect(() => {
    const handleWeatherSync = () => {
      const origCode = originWeather?.airportCode || originCode || 'DEL';
      const dCode = destWeather?.airportCode || destinationCode || (showBoth ? 'BOM' : undefined);
      setOriginWeather(getAirportWeatherImmediate(origCode));
      if (dCode) {
        setDestWeather(getAirportWeatherImmediate(dCode));
      }
      setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    window.addEventListener('aerowings_weather_updated', handleWeatherSync);
    return () => window.removeEventListener('aerowings_weather_updated', handleWeatherSync);
  }, [originCode, destinationCode, showBoth, originWeather?.airportCode, destWeather?.airportCode]);

  const getWeatherIcon = (iconType?: string) => {
    switch (iconType) {
      case 'clear':
        return <Sun className="w-5 h-5 text-amber-400 animate-spin-slow" />;
      case 'rain':
        return <CloudRain className="w-5 h-5 text-sky-400" />;
      case 'thunderstorm':
        return <CloudLightning className="w-5 h-5 text-purple-400 animate-pulse" />;
      case 'fog':
        return <Wind className="w-5 h-5 text-slate-400" />;
      default:
        return <Cloud className="w-5 h-5 text-slate-300" />;
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
        {getWeatherIcon(originWeather.iconType)}
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-white">{originWeather.cityName} ({originWeather.airportCode})</span>
          <span className="font-extrabold text-amber-300">{originWeather.temperatureC}°C</span>
          <span className="text-slate-400">• {originWeather.conditionText}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl text-left">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 gap-2 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs sm:text-sm font-bold text-white">Live Meteorological Radar & Current Airport Weather</h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                🟢 Live Synced
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Real-time atmospheric telemetry • 100% Zero-Deduction Weather Guarantee
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Select Origin Airport */}
          <select
            value={originWeather?.airportCode || originCode || 'DEL'}
            onChange={(e) => {
              const code = e.target.value;
              if (onSelectAirport) onSelectAirport(code);
              setOriginWeather(getAirportWeatherImmediate(code));
              loadWeatherData(true, code);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-sky-500 cursor-pointer"
            title="Select origin airport to check current weather"
          >
            {Object.entries(AIRPORT_METEO_COORDINATES).map(([code, info]) => (
              <option key={code} value={code}>
                From: {info.city} ({code})
              </option>
            ))}
          </select>

          {/* Quick Select Destination Airport */}
          <select
            value={destWeather?.airportCode || destinationCode || 'BOM'}
            onChange={(e) => {
              const code = e.target.value;
              setDestWeather(getAirportWeatherImmediate(code));
              loadWeatherData(true, originWeather?.airportCode || originCode || 'DEL', code);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-emerald-300 text-xs font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
            title="Select destination airport to check current weather"
          >
            {Object.entries(AIRPORT_METEO_COORDINATES).map(([code, info]) => (
              <option key={code} value={code}>
                To: {info.city} ({code})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'route' ? 'radar_hubs' : 'route')}
            className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
              activeTab === 'radar_hubs'
                ? 'bg-purple-600/30 border-purple-400 text-purple-200'
                : 'bg-purple-950/50 hover:bg-purple-900/50 border-purple-500/40 text-purple-300'
            }`}
            title="Toggle 5-Day AI Weather & Flight Delay Predictor"
          >
            <span>🔮 {activeTab === 'radar_hubs' ? 'Hide Predictor' : 'Weather Predictor'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (typeof navigator !== 'undefined' && navigator.geolocation) {
                setLoading(true);
                navigator.geolocation.getCurrentPosition(
                  async (pos) => {
                    const data = await fetchLiveCoordinatesWeather(pos.coords.latitude, pos.coords.longitude, 'My Current Location');
                    setOriginWeather(data);
                    setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                    setLoading(false);
                  },
                  async () => {
                    await loadWeatherData(true, 'BLR');
                  },
                  { timeout: 4000 }
                );
              } else {
                loadWeatherData(true, 'BLR');
              }
            }}
            className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            title="Detect current weather at my location"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>My Weather</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const w = originWeather;
              const d = destWeather;
              const text = `Current airport weather in ${w.cityName} (${w.airportCode}) is ${w.temperatureC} degrees Celsius with ${w.conditionText}, wind speed ${w.windSpeedKmh} kilometers per hour, and humidity ${w.humidity} percent.${d ? ` Destination ${d.cityName} (${d.airportCode}) is ${d.temperatureC} degrees Celsius with ${d.conditionText}.` : ''}`;
              aiVoice.speak(text, true);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            title="Speak current weather report"
          >
            <Volume2 className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Speak</span>
          </button>

          {onNavigateToWeatherRadar && (
            <button
              type="button"
              onClick={onNavigateToWeatherRadar}
              className="px-2.5 py-1 rounded-lg bg-sky-950/60 hover:bg-sky-900/60 border border-sky-500/40 text-sky-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Open full Doppler Radar Ops Center"
            >
              <Compass className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Radar Ops Center</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => loadWeatherData(true)}
            disabled={loading}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Refresh meteorological telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Updating...' : `Refreshed ${lastRefreshed}`}</span>
          </button>
        </div>
      </div>

      {/* Quick Major Hub Weather Chips */}
      <div className="flex items-center gap-1.5 py-2.5 overflow-x-auto no-scrollbar border-b border-slate-800/60 text-xs">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">Major Hubs:</span>
        {[
          { code: 'DEL', city: 'Delhi', icon: '☀️' },
          { code: 'BOM', city: 'Mumbai', icon: '🌤️' },
          { code: 'BLR', city: 'Bengaluru', icon: '⛅' },
          { code: 'HYD', city: 'Hyderabad', icon: '☀️' },
          { code: 'MAA', city: 'Chennai', icon: '☀️' },
          { code: 'CCU', city: 'Kolkata', icon: '⛅' },
          { code: 'GOI', city: 'Goa', icon: '🏖️' },
          { code: 'COK', city: 'Kochi', icon: '🌴' },
          { code: 'JAI', city: 'Jaipur', icon: '☀️' },
          { code: 'DXB', city: 'Dubai', icon: '☀️' },
          { code: 'SIN', city: 'Singapore', icon: '⛅' },
          { code: 'LHR', city: 'London', icon: '🌧️' }
        ].map(hub => {
          const hubW = getAirportWeatherImmediate(hub.code);
          const isSelectedHub = originWeather?.airportCode === hub.code;
          return (
            <button
              key={hub.code}
              type="button"
              onClick={() => {
                if (onSelectAirport) {
                  onSelectAirport(hub.code);
                }
                setOriginWeather(getAirportWeatherImmediate(hub.code));
                loadWeatherData(true, hub.code);
              }}
              className={`px-2.5 py-1 rounded-lg border font-medium shrink-0 flex items-center gap-1 transition-all cursor-pointer text-[11px] ${
                isSelectedHub
                  ? 'bg-sky-500/20 border-sky-400 text-white shadow-sm'
                  : 'bg-slate-950/80 hover:bg-blue-600/20 border-slate-800 hover:border-blue-500/40 text-slate-300 hover:text-sky-300'
              }`}
            >
              <span>{hub.icon}</span>
              <span className="font-bold text-white">{hub.city} ({hub.code})</span>
              <span className="text-amber-300 font-bold">{hubW.temperatureC}°C</span>
            </button>
          );
        })}
      </div>

      {/* Weather Stations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3.5">
        {/* Origin Weather Card */}
        {originWeather && (
          <div className={`rounded-xl p-3.5 space-y-2.5 relative overflow-hidden shadow-inner border ${
            originWeather.flightSafetyStatus === 'SEVERE_IFR'
              ? 'bg-red-950/30 border-red-500/60'
              : originWeather.flightSafetyStatus === 'MODERATE_MVFR'
              ? 'bg-amber-950/20 border-amber-500/50'
              : 'bg-slate-950/90 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-blue-600/20 text-blue-400 font-mono text-xs font-bold border border-blue-500/30">
                  ORIGIN: {originWeather.airportCode}
                </span>
                <span className="text-xs font-bold text-white truncate max-w-[140px] sm:max-w-[200px]">
                  {originWeather.cityName}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {getWeatherIcon(originWeather.iconType)}
                <span className="text-lg font-black text-white">{originWeather.temperatureC}°C</span>
                <span className="text-[11px] text-slate-400">({originWeather.temperatureF}°F)</span>
              </div>
            </div>

            <div className="text-xs text-slate-200 font-medium flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full animate-ping ${
                originWeather.flightSafetyStatus === 'SEVERE_IFR' ? 'bg-red-400' : 'bg-emerald-400'
              }`}></span>
              <span className={`font-semibold ${
                originWeather.flightSafetyStatus === 'SEVERE_IFR' ? 'text-red-300' : 'text-emerald-300'
              }`}>{originWeather.conditionText}</span>
              <span className="text-slate-500">•</span>
              <span className="text-[11px] text-slate-400">Apparent: {originWeather.apparentTemperatureC}°C</span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-300">
              <div className="flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-lg">
                <Wind className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>{originWeather.windSpeedKmh} km/h</span>
              </div>
              <div className="flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-lg">
                <Droplets className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{originWeather.humidity}% Hum</span>
              </div>
              <div className="flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-lg">
                <Eye className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{originWeather.visibilityKm} km Vis</span>
              </div>
            </div>

            <div className={`text-[10px] rounded-lg px-2.5 py-1.5 flex items-center justify-between gap-1.5 border ${
              originWeather.flightSafetyStatus === 'SEVERE_IFR'
                ? 'text-red-200 bg-red-950/60 border-red-500/50'
                : 'text-emerald-300 bg-emerald-950/40 border-emerald-500/30'
            }`}>
              <div className="flex items-center gap-1.5 truncate">
                {originWeather.flightSafetyStatus === 'SEVERE_IFR' ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                )}
                <span className="truncate">{originWeather.runwayAdvisory}</span>
              </div>
              <span className={`font-mono font-bold shrink-0 ${
                originWeather.flightSafetyStatus === 'SEVERE_IFR' ? 'text-red-400' : 'text-emerald-400'
              }`}>
                Safety: {originWeather.safetyScore}%
              </span>
            </div>
          </div>
        )}

        {/* Destination Weather Card */}
        {destWeather ? (
          <div className={`rounded-xl p-3.5 space-y-2.5 relative overflow-hidden shadow-inner border ${
            destWeather.flightSafetyStatus === 'SEVERE_IFR'
              ? 'bg-red-950/30 border-red-500/60'
              : destWeather.flightSafetyStatus === 'MODERATE_MVFR'
              ? 'bg-amber-950/20 border-amber-500/50'
              : 'bg-slate-950/90 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-600/20 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/30">
                  DEST: {destWeather.airportCode}
                </span>
                <span className="text-xs font-bold text-white truncate max-w-[140px] sm:max-w-[200px]">
                  {destWeather.cityName}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {getWeatherIcon(destWeather.iconType)}
                <span className="text-lg font-black text-white">{destWeather.temperatureC}°C</span>
                <span className="text-[11px] text-slate-400">({destWeather.temperatureF}°F)</span>
              </div>
            </div>

            <div className="text-xs text-slate-200 font-medium flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full animate-ping ${
                destWeather.flightSafetyStatus === 'SEVERE_IFR' ? 'bg-red-400' : 'bg-emerald-400'
              }`}></span>
              <span className={`font-semibold ${
                destWeather.flightSafetyStatus === 'SEVERE_IFR' ? 'text-red-300' : 'text-emerald-300'
              }`}>{destWeather.conditionText}</span>
              <span className="text-slate-500">•</span>
              <span className="text-[11px] text-slate-400">Apparent: {destWeather.apparentTemperatureC}°C</span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-300">
              <div className="flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-lg">
                <Wind className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>{destWeather.windSpeedKmh} km/h</span>
              </div>
              <div className="flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-lg">
                <Droplets className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{destWeather.humidity}% Hum</span>
              </div>
              <div className="flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-lg">
                <Eye className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{destWeather.visibilityKm} km Vis</span>
              </div>
            </div>

            <div className={`text-[10px] rounded-lg px-2.5 py-1.5 flex items-center justify-between gap-1.5 border ${
              destWeather.flightSafetyStatus === 'SEVERE_IFR'
                ? 'text-red-200 bg-red-950/60 border-red-500/50'
                : 'text-emerald-300 bg-emerald-950/40 border-emerald-500/30'
            }`}>
              <div className="flex items-center gap-1.5 truncate">
                {destWeather.flightSafetyStatus === 'SEVERE_IFR' ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                )}
                <span className="truncate">{destWeather.runwayAdvisory}</span>
              </div>
              <span className={`font-mono font-bold shrink-0 ${
                destWeather.flightSafetyStatus === 'SEVERE_IFR' ? 'text-red-400' : 'text-emerald-400'
              }`}>
                Safety: {destWeather.safetyScore}%
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-slate-950/40 border border-slate-800 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center text-slate-400 text-xs">
            <Cloud className="w-6 h-6 text-slate-600 mb-1" />
            <p className="font-semibold text-slate-300">Select Destination in the Search Bar Above</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Atmospheric data and runway safety sync in real-time</p>
          </div>
        )}
      </div>

      {/* 5-Day AI Weather & Flight Delay / Auto-Cancel Predictor Panel */}
      <div className="mt-4 pt-3.5 border-t border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
            <span>🔮 AI 5-Day Aviation Weather & Auto-Cancellation Predictor:</span>
            <span className="text-white">
              {originWeather.cityName} ({originWeather.airportCode}) {destWeather ? `➔ ${destWeather.cityName} (${destWeather.airportCode})` : ''}
            </span>
          </div>
          {originWeather.flightSafetyStatus === 'SEVERE_IFR' || destWeather?.flightSafetyStatus === 'SEVERE_IFR' ? (
            <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/50 text-[11px] text-red-300 font-bold animate-pulse">
              🚨 CRITICAL WEATHER: Flights & Tickets Auto-Cancelled (100% Instant Refund)
            </span>
          ) : (
            <span className="text-[11px] text-emerald-400 font-semibold">
              On-Time Departure Probability: {Math.min(99, Math.min(originWeather.safetyScore, destWeather?.safetyScore ?? 98))}%
            </span>
          )}
        </div>

        {/* Interactive Weather Condition Tester & Auto-Cancel Trigger */}
        <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
            <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-bold text-white">Live Weather Condition & Ticket Auto-Cancel Guard ({originWeather.airportCode}):</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { label: '☀️ Clear Skies', type: 'Clear' as const, sev: 'normal' as const, cls: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25' },
              { label: '⛈️ Heavy Thunderstorm (Auto-Cancel)', type: 'Heavy Thunderstorm' as const, sev: 'severe' as const, cls: 'bg-red-500/15 border-red-500/40 text-red-300 hover:bg-red-500/25' },
              { label: '🌫️ Dense Fog (Auto-Cancel)', type: 'Dense Fog' as const, sev: 'severe' as const, cls: 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25' },
              { label: '🌀 Super Cyclone (Auto-Cancel)', type: 'Typhoon / Cyclone' as const, sev: 'severe' as const, cls: 'bg-rose-500/20 border-rose-500/50 text-rose-200 hover:bg-rose-500/30' },
              { label: '❄️ Blizzard (Auto-Cancel)', type: 'Blizzard' as const, sev: 'severe' as const, cls: 'bg-sky-500/15 border-sky-500/40 text-sky-300 hover:bg-sky-500/25' }
            ].map((btn) => (
              <button
                key={btn.type}
                type="button"
                onClick={() => {
                  const targetCode = originWeather?.airportCode || originCode || 'DEL';
                  if (btn.type === 'Clear') {
                    resetDefaultFlights();
                  } else {
                    triggerWeatherDisruption(targetCode, btn.type, btn.sev);
                  }
                }}
                className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${btn.cls}`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
          {[0, 1, 2, 3, 4].map((dayOffset) => {
            const d = new Date();
            d.setDate(d.getDate() + dayOffset);
            const dayLabel = dayOffset === 0 ? 'Today (Live)' : dayOffset === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            const isSevereToday = (originWeather.flightSafetyStatus === 'SEVERE_IFR' || destWeather?.flightSafetyStatus === 'SEVERE_IFR') && dayOffset <= 1;
            const tempDelta = dayOffset % 2 === 0 ? (dayOffset === 0 ? 0 : 1) : -1;
            const predTemp = originWeather.temperatureC + tempDelta;
            const predWind = isSevereToday ? originWeather.windSpeedKmh : Math.max(6, originWeather.windSpeedKmh + (dayOffset % 3 === 0 ? -2 : 3));
            const rawSafety = Math.min(originWeather.safetyScore, destWeather?.safetyScore ?? 98);
            const predSafety = isSevereToday ? rawSafety : Math.min(99, Math.max(85, rawSafety - (dayOffset % 2)));
            const delayRisk = isSevereToday
              ? '🚨 AUTO-CANCELLED'
              : predSafety >= 94
              ? 'Low (<3%)'
              : predSafety >= 88
              ? 'Minimal (6%)'
              : 'Moderate (12%)';

            return (
              <div
                key={dayOffset}
                className={`rounded-xl p-2.5 space-y-1 text-center border transition-all ${
                  isSevereToday
                    ? 'bg-red-950/40 border-red-500/60'
                    : 'bg-slate-950/90 border-slate-800/90 hover:border-purple-500/40'
                }`}
              >
                <div className="text-[10px] font-bold text-slate-400">{dayLabel}</div>
                <div className="text-sm font-black text-white flex items-center justify-center gap-1">
                  <span>{isSevereToday ? '🌩️' : predTemp > 30 ? '☀️' : predTemp < 18 ? '🌥️' : '⛅'}</span>
                  <span>{predTemp}°C</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Wind: <strong className="text-slate-200">{predWind} km/h</strong>
                </div>
                <div className={`text-[10px] font-bold rounded px-1.5 py-0.5 border ${
                  isSevereToday
                    ? 'text-red-300 bg-red-500/20 border-red-500/40'
                    : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                }`}>
                  {isSevereToday ? delayRisk : `Delay Risk: ${delayRisk}`}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
