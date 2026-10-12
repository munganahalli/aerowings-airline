import React, { useState, useEffect } from 'react';
import { 
  CloudRain, 
  Wind, 
  Compass, 
  Gauge, 
  Droplets, 
  Cloud, 
  Sun, 
  CloudLightning, 
  RefreshCw, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  Volume2, 
  MapPin, 
  Calendar, 
  Activity,
  Layers,
  ArrowDownRight,
  ArrowUpRight,
  Radio
} from 'lucide-react';
import { 
  EnvironmentalInputData, 
  MeteorologicalForecastOutput, 
  fetchLiveEnvironmentalMetrics, 
  runMeteorologicalAiForecast, 
  evaluateMeteorologicalPrinciples,
  getInitialEnvironmentalData
} from '../../utils/meteorologicalAiService';
import { aiVoice } from '../../utils/aiVoice';
import { useAirline } from '../../context/AirlineContext';
import { AIRPORTS } from '../../data/mockData';

interface MeteorologicalWeatherReaderProps {
  initialAirportCode?: string;
  onAutoCancelTrigger?: (airportCode: string, condition: string) => void;
  title?: string;
}

export const MeteorologicalWeatherReader: React.FC<MeteorologicalWeatherReaderProps> = ({
  initialAirportCode = 'BLR',
  onAutoCancelTrigger,
  title = 'Real-Time Meteorological AI Data Scientist & Atmospheric Reader'
}) => {
  const { addToast, triggerWeatherDisruption } = useAirline();
  const [selectedAirport, setSelectedAirport] = useState<string>(initialAirportCode);
  const [activeTab, setActiveTab] = useState<'forecast' | 'prompt_inspection' | 'simulate_metrics'>('forecast');

  // Synchronously initialize with instant authentic meteorological data so component is NEVER blank
  const [envData, setEnvData] = useState<EnvironmentalInputData>(() => 
    getInitialEnvironmentalData(initialAirportCode || 'BLR')
  );
  const [forecast, setForecast] = useState<MeteorologicalForecastOutput>(() => 
    evaluateMeteorologicalPrinciples(getInitialEnvironmentalData(initialAirportCode || 'BLR'))
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAiRunning, setIsAiRunning] = useState<boolean>(false);

  const airportOptions = AIRPORTS.map(a => ({
    code: a.code,
    label: `${a.city} (${a.code}) - ${a.country === 'India' ? (a.state || 'India') : a.country}`,
    city: a.city
  }));

  const loadData = async (airportCode: string) => {
    setIsLoading(true);
    try {
      const data = await fetchLiveEnvironmentalMetrics(airportCode);
      setEnvData(data);
      // Run AI evaluation immediately
      setIsAiRunning(true);
      const prediction = await runMeteorologicalAiForecast(data);
      setForecast(prediction);
    } catch (e) {
      console.warn('Weather reader load error:', e);
    } finally {
      setIsLoading(false);
      setIsAiRunning(false);
    }
  };

  useEffect(() => {
    loadData(selectedAirport);
  }, [selectedAirport]);

  const handleSpeakForecast = () => {
    if (!forecast || !envData) return;
    const speech = `Meteorological AI Data Scientist Report for ${envData.targetLocation}. Temperature: ${envData.temperatureC} degrees Celsius. Barometric pressure: ${envData.barometricPressureHpa} hectopascals, ${envData.pressureTrend3h}. Relative humidity: ${envData.relativeHumidityPercent} percent. Forecast for the next 6 to 12 hours: ${forecast.shortTermForecast}, with ${forecast.precipitationProbability} percent precipitation probability. Expected wind behavior: ${forecast.expectedWindBehavior}. Primary driver: ${forecast.primaryMeteorologicalDriver}`;
    aiVoice.speak(speech, true, 'en');
    addToast('🔊 Speaking Meteorological AI Forecast analysis', 'info');
  };

  const handleTriggerAutoCancellation = () => {
    if (!envData || !forecast) return;
    triggerWeatherDisruption(envData.airportCode, 'Heavy Thunderstorm', 'severe');
    if (onAutoCancelTrigger) {
      onAutoCancelTrigger(envData.airportCode, 'Heavy Thunderstorm');
    }
    addToast(`🚨 High-impact weather threshold met! Flight grounding & 100% automated refund triggered for ${envData.airportCode}.`, 'error');
  };

  return (
    <div className="bg-gradient-to-br from-slate-900/95 via-slate-950 to-blue-950/80 border-2 border-sky-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6 text-left relative overflow-hidden">
      {/* Decorative ambient background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800 relative z-10">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider mb-1">
            <Radio className="w-4 h-4 animate-pulse text-emerald-400" />
            <span>Fluid Dynamics Meteorological Engine • Real-Time Weather Reader</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <span>{title}</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Evaluates real-time barometric pressure gradients, humidity, and fluid dynamics against regional climatic base rates to predict short-term aviation forecasts.
          </p>
        </div>

        {/* Airport Hub Selector & Refresh */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={selectedAirport}
            onChange={(e) => setSelectedAirport(e.target.value)}
            className="bg-slate-950 border border-slate-700 hover:border-sky-400 text-white text-xs font-bold px-3.5 py-2 rounded-xl focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            {airportOptions.map((opt) => (
              <option key={opt.code} value={opt.code}>
                {opt.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => loadData(selectedAirport)}
            disabled={isLoading || isAiRunning}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading || isAiRunning ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Reading API...' : isAiRunning ? 'AI Predicting...' : 'Sync Live Weather'}</span>
          </button>

          <button
            type="button"
            onClick={handleSpeakForecast}
            disabled={!forecast}
            className="px-3 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Audio Readout</span>
          </button>
        </div>
      </div>

      {envData && (
        <div className="space-y-6 relative z-10">
          {/* SECTION 1: ENVIRONMENTAL INPUT DATA GRID */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
              <span className="flex items-center gap-1.5 text-amber-300">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Environmental Input Data (Live Weather API Feed)</span>
              </span>
              <span className="text-[11px] font-mono text-emerald-400 lowercase">
                verified: {envData.localTimeDate}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {/* Location & Terrain */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-sky-400" /> Target Location
                </div>
                <div className="text-sm font-black text-white">{envData.airportCode} - {envData.terrainType.split(',')[0]}</div>
                <div className="text-[10px] text-slate-400">{envData.elevationMeters}m Elevation MSL</div>
              </div>

              {/* Barometric Pressure & 3-Hour Trend */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-purple-400" /> Barometric Pressure
                </div>
                <div className="text-sm font-mono font-black text-white flex items-center gap-1.5">
                  <span>{envData.barometricPressureHpa} hPa</span>
                  {envData.pressureDeltaHpa < 0 ? (
                    <ArrowDownRight className="w-4 h-4 text-rose-400 inline" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 text-emerald-400 inline" />
                  )}
                </div>
                <div className={`text-[10px] font-bold ${
                  envData.pressureDeltaHpa <= -2 ? 'text-rose-400' : envData.pressureDeltaHpa < 0 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  Trend (3h): {envData.pressureTrend3h}
                </div>
              </div>

              {/* Temperature */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Sun className="w-3 h-3 text-amber-400" /> Current Temperature
                </div>
                <div className="text-sm font-black text-white">
                  {envData.temperatureC}°C <span className="text-xs text-slate-400 font-normal">({envData.temperatureF}°F)</span>
                </div>
                <div className="text-[10px] text-slate-400">Boundary Layer Ambient</div>
              </div>

              {/* Relative Humidity */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-blue-400" /> Relative Humidity
                </div>
                <div className="text-sm font-mono font-black text-sky-300">
                  {envData.relativeHumidityPercent}%
                </div>
                <div className={`text-[10px] font-bold ${
                  envData.relativeHumidityPercent >= 80 ? 'text-sky-300' : 'text-slate-400'
                }`}>
                  {envData.relativeHumidityPercent >= 80 ? 'Near Saturation (High CAPE)' : 'Moderate Saturation'}
                </div>
              </div>

              {/* Wind Speed & Direction */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Wind className="w-3 h-3 text-emerald-400" /> Wind Velocity
                </div>
                <div className="text-sm font-black text-white">
                  {envData.windSpeedKmh} km/h
                </div>
                <div className="text-[10px] text-slate-300 font-mono">
                  {envData.windDirectionDegrees}° from {envData.windDirectionCardinal}
                </div>
              </div>

              {/* Cloud Cover & Classification */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Cloud className="w-3 h-3 text-slate-300" /> Cloud Cover
                </div>
                <div className="text-sm font-black text-white">
                  {envData.cloudCoverPercent}% Cover
                </div>
                <div className="text-[10px] text-slate-300 truncate" title={envData.cloudClassification}>
                  {envData.cloudClassification}
                </div>
              </div>

              {/* Precipitation (Last 3 Hours) */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <CloudRain className="w-3 h-3 text-sky-400" /> Precipitation (3h)
                </div>
                <div className="text-sm font-mono font-black text-white">
                  {envData.precipitationLast3hMm} mm
                </div>
                <div className="text-[10px] text-slate-400">Doppler Rain Accumulation</div>
              </div>

              {/* Regional Season */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-amber-400" /> Climatic Season
                </div>
                <div className="text-xs font-bold text-amber-200 truncate" title={envData.season}>
                  {envData.season}
                </div>
                <div className="text-[10px] text-slate-400">Regional Monsoon Cycle</div>
              </div>
            </div>

            {/* Climatic Base Rate Context Banner */}
            <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-3 text-xs text-slate-300 flex items-start gap-2.5">
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold font-mono text-[10px] shrink-0 uppercase mt-0.5">
                Climatic Base Rate
              </span>
              <p className="leading-relaxed">
                {envData.regionalBaseRate}
              </p>
            </div>
          </div>

          {/* Tab Selector Bar */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('forecast')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'forecast'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              📊 Live Atmospheric Forecast & Drivers
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('prompt_inspection')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'prompt_inspection'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🤖 Meteorological AI Prompt & Scientific Protocol
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('simulate_metrics')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'simulate_metrics'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ⚙️ Fluid Dynamics Sliders (What-If Simulator)
            </button>
          </div>

          {/* Prompt Inspection View */}
          {activeTab === 'prompt_inspection' && (
            <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-4 sm:p-5 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between text-amber-300 border-b border-slate-800 pb-2">
                <span className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Meteorological AI System Prompt & User Data Grounding
                </span>
                <span className="text-[10px] text-slate-400">Strict Scientific Fluid Dynamics</span>
              </div>
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-slate-300 leading-relaxed whitespace-pre-wrap">
                <strong className="text-amber-400"># System Role:</strong>{'\n'}
                You are a highly analytical meteorological AI data scientist. Your job is to evaluate real-time weather metrics against regional baselines to generate a short-term forecast.{'\n\n'}
                <strong className="text-amber-400"># Strict Rules:</strong>{'\n'}
                1. Never invent or hallucinate data. Rely strictly on the values provided in the User Prompt.{'\n'}
                2. Maintain an objective, scientific tone.{'\n'}
                3. Assign quantitative probabilities (0-100%) based entirely on fluid dynamics and meteorological principles (e.g., relationship between rapidly dropping pressure, high humidity, and precipitation).{'\n\n'}
                <strong className="text-sky-300">### Environmental Input Data</strong>{'\n'}
                - Target Location: {envData.targetLocation}{'\n'}
                - Current Local Time & Date: {envData.localTimeDate}{'\n'}
                - Current Temperature: {envData.temperatureC}°C{'\n'}
                - Barometric Pressure: {envData.barometricPressureHpa} hPa{'\n'}
                - Pressure Trend over last 3 hours: {envData.pressureTrend3h}{'\n'}
                - Relative Humidity: {envData.relativeHumidityPercent}%{'\n'}
                - Wind Speed & Direction: {envData.windSpeedKmh} km/h from {envData.windDirectionCardinal}{'\n'}
                - Cloud Cover & Classification: {envData.cloudClassification}{'\n'}
                - Precipitation (Last 3 Hours): {envData.precipitationLast3hMm} mm{'\n\n'}
                <strong className="text-emerald-300">### Climatic Base Rate Context</strong>{'\n'}
                - Current Season: {envData.season}{'\n'}
                - Regional Base Rate: {envData.regionalBaseRate}
              </div>

              <div className="bg-slate-900/90 p-3 rounded-xl border border-emerald-500/30 text-emerald-200 space-y-1.5">
                <div className="font-bold text-emerald-400 text-xs">### Expected Output Format (Generated)</div>
                <div>- <strong>Short-Term Forecast (Next 6–12 Hours):</strong> {forecast.shortTermForecast}</div>
                <div>- <strong>Precipitation Probability:</strong> {forecast.precipitationProbability}%</div>
                <div>- <strong>Expected Wind Behavior:</strong> {forecast.expectedWindBehavior}</div>
                <div>- <strong>Primary Meteorological Driver:</strong> {forecast.primaryMeteorologicalDriver}</div>
                <div>- <strong>Confidence Rating:</strong> {forecast.confidenceRating}</div>
              </div>
            </div>
          )}

          {/* Metric Adjustment Simulator View */}
          {activeTab === 'simulate_metrics' && (
            <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-emerald-400">
                  Interactive Atmospheric Fluid Dynamics Controls
                </span>
                <span className="text-[10px] text-slate-400">Adjust values to see real-time forecast reaction</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Pressure Trend Slider */}
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-bold">3h Pressure Trend:</span>
                    <span className={`font-mono font-bold ${envData.pressureDeltaHpa < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {envData.pressureDeltaHpa} hPa
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-5.0"
                    max="3.0"
                    step="0.5"
                    value={envData.pressureDeltaHpa}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      const desc = val <= -2.5 ? `Falling sharply by ${Math.abs(val)} hPa` : val < 0 ? `Falling by ${Math.abs(val)} hPa` : `Rising by ${val} hPa`;
                      const updated = { ...envData, pressureDeltaHpa: val, pressureTrend3h: desc };
                      setEnvData(updated);
                      setForecast(evaluateMeteorologicalPrinciples(updated));
                    }}
                    className="w-full accent-sky-400 cursor-pointer"
                  />
                  <div className="text-[10px] text-slate-400">Values &lt; -2.5 trigger convective instability</div>
                </div>

                {/* Relative Humidity Slider */}
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-bold">Relative Humidity:</span>
                    <span className="font-mono font-bold text-sky-300">{envData.relativeHumidityPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    step="1"
                    value={envData.relativeHumidityPercent}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      const updated = { ...envData, relativeHumidityPercent: val };
                      setEnvData(updated);
                      setForecast(evaluateMeteorologicalPrinciples(updated));
                    }}
                    className="w-full accent-sky-400 cursor-pointer"
                  />
                  <div className="text-[10px] text-slate-400">Values &gt; 80% indicate boundary layer saturation</div>
                </div>

                {/* Temperature Slider */}
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-bold">Temperature:</span>
                    <span className="font-mono font-bold text-amber-300">{envData.temperatureC}°C</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="45"
                    step="1"
                    value={envData.temperatureC}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      const updated = { ...envData, temperatureC: val, temperatureF: Math.round((val * 9) / 5 + 32) };
                      setEnvData(updated);
                      setForecast(evaluateMeteorologicalPrinciples(updated));
                    }}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                  <div className="text-[10px] text-slate-400">High ambient heat drives thermal updrafts</div>
                </div>

                {/* Cloud Cover Slider */}
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-bold">Cloud Cover:</span>
                    <span className="font-mono font-bold text-slate-200">{envData.cloudCoverPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={envData.cloudCoverPercent}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      const updated = { ...envData, cloudCoverPercent: val };
                      setEnvData(updated);
                      setForecast(evaluateMeteorologicalPrinciples(updated));
                    }}
                    className="w-full accent-slate-400 cursor-pointer"
                  />
                  <div className="text-[10px] text-slate-400">Cumulonimbus vertical cloud development</div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: AI METEOROLOGICAL FORECAST OUTPUT (EXACT FORMAT) */}
          {forecast && (
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">
                      Meteorological AI Data Scientist Short-Term Forecast
                    </h3>
                    <div className="text-[11px] text-slate-400">
                      Calculated from real-time fluid dynamics interactions (Pressure Gradient vs. Relative Humidity)
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase border ${
                    forecast.confidenceRating === 'High'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : forecast.confidenceRating === 'Medium'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  }`}>
                    Confidence: {forecast.confidenceRating}
                  </span>
                </div>
              </div>

              {/* Exact Output Structure Required by User */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Short-Term Forecast */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-center">
                  <div className="text-[11px] uppercase font-bold text-slate-400 mb-1">
                    Short-Term Forecast (Next 6–12 Hours)
                  </div>
                  <div className={`text-xl font-black ${
                    forecast.shortTermForecast === 'Thunderstorm'
                      ? 'text-red-400'
                      : forecast.shortTermForecast === 'Rainy'
                      ? 'text-sky-400'
                      : forecast.shortTermForecast === 'Overcast'
                      ? 'text-slate-200'
                      : 'text-amber-300'
                  }`}>
                    {forecast.shortTermForecast === 'Thunderstorm' && '⛈️ Thunderstorm'}
                    {forecast.shortTermForecast === 'Rainy' && '🌧️ Rainy'}
                    {forecast.shortTermForecast === 'Overcast' && '☁️ Overcast'}
                    {forecast.shortTermForecast === 'Partly Cloudy' && '⛅ Partly Cloudy'}
                    {forecast.shortTermForecast === 'Clear' && '☀️ Clear Sky'}
                  </div>
                </div>

                {/* Precipitation Probability */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-center">
                  <div className="text-[11px] uppercase font-bold text-slate-400 mb-1">
                    Precipitation Probability
                  </div>
                  <div className="text-2xl font-mono font-black text-sky-400">
                    {forecast.precipitationProbability}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Quantitative fluid dynamics probability
                  </div>
                </div>

                {/* Expected Wind Behavior */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-center">
                  <div className="text-[11px] uppercase font-bold text-slate-400 mb-1">
                    Expected Wind Behavior
                  </div>
                  <div className={`text-xl font-black ${
                    forecast.expectedWindBehavior === 'Severe Crosswinds'
                      ? 'text-red-400'
                      : forecast.expectedWindBehavior === 'Gusty'
                      ? 'text-amber-400'
                      : 'text-emerald-300'
                  }`}>
                    {forecast.expectedWindBehavior}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Surface & runway shear forecast
                  </div>
                </div>
              </div>

              {/* Primary Meteorological Driver */}
              <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 space-y-1">
                <div className="text-[11px] uppercase font-bold text-amber-400">
                  Primary Meteorological Driver
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                  {forecast.primaryMeteorologicalDriver}
                </p>
              </div>

              {/* Aviation Safety Guard & Ticket Auto-Cancel Sync */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    AeroWings Weather Guarantee: If weather deteriorates to severe thunderstorm or crosswinds exceed safety margins, flights are auto-grounded with 100% instant full refund.
                  </span>
                </div>

                {forecast.precipitationProbability >= 70 && (
                  <button
                    type="button"
                    onClick={handleTriggerAutoCancellation}
                    className="px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-500/50 text-red-200 text-xs font-bold whitespace-nowrap cursor-pointer transition-all shrink-0"
                  >
                    Simulate Auto-Grounding & Refund
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
