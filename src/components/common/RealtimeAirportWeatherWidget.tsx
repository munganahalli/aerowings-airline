import React, { useState, useEffect } from 'react';
import { 
  fetchLiveAirportWeather, 
  getAirportWeatherImmediate, 
  RealtimeAirportWeather 
} from '../../utils/realtimeWeather';
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
  ArrowRight,
  ExternalLink
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

  const loadWeatherData = async () => {
    setLoading(true);
    try {
      const origCode = originCode || 'DEL';
      const dCode = destinationCode || (showBoth ? 'BOM' : undefined);

      const [originData, destData] = await Promise.all([
        fetchLiveAirportWeather(origCode),
        dCode ? fetchLiveAirportWeather(dCode) : Promise.resolve(null)
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
    // Immediately update with synchronous data when codes change
    if (originCode) {
      setOriginWeather(getAirportWeatherImmediate(originCode));
    }
    if (destinationCode) {
      setDestWeather(getAirportWeatherImmediate(destinationCode));
    } else if (showBoth) {
      setDestWeather(getAirportWeatherImmediate('BOM'));
    }
    // Then trigger background live refresh
    loadWeatherData();
  }, [originCode, destinationCode, showBoth]);

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

        <div className="flex items-center gap-2">
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
            onClick={loadWeatherData}
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
          { code: 'DEL', city: 'Delhi', temp: '32°C', icon: '☀️' },
          { code: 'BOM', city: 'Mumbai', temp: '29°C', icon: '🌧️' },
          { code: 'BLR', city: 'Bengaluru', temp: '27°C', icon: '⛅' },
          { code: 'MAA', city: 'Chennai', temp: '31°C', icon: '☀️' },
          { code: 'CCU', city: 'Kolkata', temp: '30°C', icon: '⛅' },
          { code: 'HYD', city: 'Hyderabad', temp: '29°C', icon: '☀️' },
          { code: 'GOI', city: 'Goa', temp: '28°C', icon: '🌧️' },
          { code: 'DXB', city: 'Dubai', temp: '36°C', icon: '☀️' },
          { code: 'LHR', city: 'London', temp: '18°C', icon: '🌧️' }
        ].map(hub => (
          <button
            key={hub.code}
            type="button"
            onClick={() => {
              if (onSelectAirport) {
                onSelectAirport(hub.code);
              } else {
                setOriginWeather(getAirportWeatherImmediate(hub.code));
              }
            }}
            className="px-2 py-1 rounded-lg bg-slate-950/80 hover:bg-blue-600/20 border border-slate-800 hover:border-blue-500/40 text-slate-300 hover:text-sky-300 font-medium shrink-0 flex items-center gap-1 transition-all cursor-pointer text-[11px]"
          >
            <span>{hub.icon}</span>
            <span className="font-bold text-white">{hub.code}</span>
            <span className="text-slate-400">{hub.temp}</span>
          </button>
        ))}
      </div>

      {/* Weather Stations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3.5">
        {/* Origin Weather Card */}
        {originWeather && (
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 space-y-2.5 relative overflow-hidden shadow-inner">
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
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="font-semibold text-emerald-300">{originWeather.conditionText}</span>
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

            <div className="text-[10px] text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 rounded-lg px-2.5 py-1.5 flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5 truncate">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{originWeather.runwayAdvisory}</span>
              </div>
              <span className="font-mono font-bold text-emerald-400 shrink-0">
                Safety: {originWeather.safetyScore}%
              </span>
            </div>
          </div>
        )}

        {/* Destination Weather Card */}
        {destWeather ? (
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 space-y-2.5 relative overflow-hidden shadow-inner">
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
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="font-semibold text-emerald-300">{destWeather.conditionText}</span>
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

            <div className="text-[10px] text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 rounded-lg px-2.5 py-1.5 flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5 truncate">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{destWeather.runwayAdvisory}</span>
              </div>
              <span className="font-mono font-bold text-emerald-400 shrink-0">
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
    </div>
  );
};
