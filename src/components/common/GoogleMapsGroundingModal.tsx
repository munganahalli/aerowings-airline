import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Compass, ExternalLink, X, Plane, Car, Train, Building2, Wind, Eye, Search, Layers } from 'lucide-react';
import { Airport } from '../../types/airline';
import { AIRPORTS } from '../../data/mockData';

interface GoogleMapsGroundingModalProps {
  isOpen: boolean;
  onClose: () => void;
  airport?: Airport;
  destinationAirport?: Airport;
}

export const GoogleMapsGroundingModal: React.FC<GoogleMapsGroundingModalProps> = ({
  isOpen,
  onClose,
  airport,
  destinationAirport
}) => {
  const [activeAirportCode, setActiveAirportCode] = useState<string>(airport?.code || 'DEL');
  const [airportData, setAirportData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mapMode, setMapMode] = useState<'roadmap' | 'satellite'>('roadmap');

  useEffect(() => {
    if (airport?.code) {
      setActiveAirportCode(airport.code);
    }
  }, [airport]);

  // Client-side instant baseline dataset for zero-hang guarantee
  const getClientFallbackAirport = (code: string) => {
    const matched = AIRPORTS.find(a => a.code.toUpperCase() === code.toUpperCase());
    return {
      code: code.toUpperCase(),
      name: matched?.name || `${code} Airport`,
      city: matched?.city || code,
      country: matched?.country || 'India',
      lat: code === 'DEL' ? 28.5562 : code === 'BOM' ? 19.0896 : code === 'BLR' ? 13.1986 : code === 'MAA' ? 12.9941 : code === 'HYD' ? 17.2403 : code === 'CCU' ? 22.6547 : 20.5937,
      lng: code === 'DEL' ? 77.1000 : code === 'BOM' ? 72.8656 : code === 'BLR' ? 77.7066 : code === 'MAA' ? 80.1709 : code === 'HYD' ? 78.4294 : code === 'CCU' ? 88.4467 : 78.9629,
      terminals: [matched?.terminal ? `Terminal ${matched.terminal} (Passenger Hub)` : 'Main Terminal 1', 'Terminal 2'],
      aeroWingsGates: `Gate Concourse ${code === 'DEL' ? 'T3 18A-26B' : code === 'BOM' ? 'T2 42-50' : 'A04-A12'}`,
      metroStation: `${matched?.city || code} Airport Express Metro & App Cab Stands`,
      runways: ['RWY 09/27 (Main Runway)', 'RWY 14/32 (Cross Runway)'],
      weatherGrounding: 'Visibility 8000m • ILS CAT II Ground Telemetry Active',
      mapEmbedQuery: `${matched?.name || code + ' Airport'}`
    };
  };

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);

    const fallback = getClientFallbackAirport(activeAirportCode);

    fetch('/api/ai/maps-grounding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        airportCode: activeAirportCode,
        originCode: airport?.code || 'DEL',
        destinationCode: destinationAirport?.code || 'BOM'
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data?.airport) {
          setAirportData(data.airport);
        } else {
          setAirportData(fallback);
        }
        setLoading(false);
      })
      .catch(err => {
        console.warn('Maps grounding fetch fallback:', err);
        setAirportData(fallback);
        setLoading(false);
      });
  }, [isOpen, activeAirportCode, airport, destinationAirport]);

  if (!isOpen) return null;

  const quickCodes = Array.from(new Set([
    airport?.code || 'DEL',
    destinationAirport?.code || 'BOM',
    'BLR',
    'MAA',
    'HYD',
    'CCU',
    'GOI',
    'DXB',
    'LHR',
    'SIN',
    'JFK'
  ]));

  const filteredAirports = searchQuery.trim()
    ? AIRPORTS.filter(a =>
        a.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-white">Google Maps Airport Grounding & Telemetry</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Live Satellite Grounding
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Interactive terminal layout, gates, radar runways, and live coordinates
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Airport Search & Hub Selector Bar */}
        <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search any airport by city, name, or code (e.g., Chennai, Goa, HYD, Dubai)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-xl shrink-0">
              <button
                onClick={() => setMapMode('roadmap')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  mapMode === 'roadmap' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Map
              </button>
              <button
                onClick={() => setMapMode('satellite')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  mapMode === 'satellite' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Satellite
              </button>
            </div>
          </div>

          {/* Search suggestions if typing */}
          {filteredAirports.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap p-2 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">Found:</span>
              {filteredAirports.map(item => (
                <button
                  key={item.code}
                  onClick={() => {
                    setActiveAirportCode(item.code);
                    setSearchQuery('');
                  }}
                  className="px-2.5 py-1 bg-blue-950/60 hover:bg-blue-600 border border-blue-800/60 text-blue-200 hover:text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                >
                  {item.code} - {item.city}
                </button>
              ))}
            </div>
          )}

          {/* Quick switcher buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <span className="text-xs text-slate-400 font-medium shrink-0">Quick Hubs:</span>
            {quickCodes.map(code => (
              <button
                key={code}
                onClick={() => setActiveAirportCode(code)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeAirportCode === code
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {code === airport?.code ? `🛫 ${code} (Origin)` : code === destinationAirport?.code ? `🛬 ${code} (Dest)` : code}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5 flex-1">
          {loading && !airportData ? (
            <div className="py-16 text-center">
              <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-300">Retrieving Google Maps Terminal & Runway Telemetry...</p>
            </div>
          ) : airportData ? (
            <>
              {/* Primary Info Banner */}
              <div className="bg-gradient-to-r from-blue-950/70 via-slate-900 to-slate-950 border border-blue-800/40 rounded-2xl p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-blue-500/20 text-blue-300 text-xs font-mono font-bold">
                        ICAO / IATA: {airportData.code}
                      </span>
                      <span className="text-xs font-medium text-slate-400">
                        AeroWings Ground Station
                      </span>
                    </div>
                    <h4 className="text-lg sm:text-xl font-black text-white mt-1">{airportData.name}</h4>
                    <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-1 flex-wrap">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>{airportData.city}, {airportData.country}</span>
                      <span className="text-slate-500">•</span>
                      <span className="font-mono text-slate-400">Lat: {airportData.lat}° N, Lng: {airportData.lng}° E</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(airportData.name + ' ' + airportData.city)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-lg cursor-pointer"
                    >
                      <span>Open in Google Maps</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Embedded Interactive Map Preview */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
                <div className="absolute top-3 left-3 z-10 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-200 flex items-center gap-2">
                  <Navigation className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                  <span>Interactive Airport Geo-Map: <strong className="text-white">{airportData.name}</strong></span>
                </div>
                
                <iframe
                  title={`Google Maps embed for ${airportData.name}`}
                  width="100%"
                  height="260"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=${airportData.lat || 28.5562},${airportData.lng || 77.1000}&hl=en&z=13&t=${mapMode === 'satellite' ? 'k' : 'm'}&output=embed`}
                  className="w-full h-64 sm:h-72 rounded-2xl"
                />
              </div>

              {/* Grid: Terminal, Gates & Transit */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Terminals & AeroWings Gates */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sky-400">
                    <Building2 className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">Terminals & Gates</span>
                  </div>
                  <div className="space-y-2">
                    {airportData.terminals?.map((t: string, i: number) => (
                      <div key={i} className="text-xs text-slate-300 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        {t}
                      </div>
                    ))}
                    <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 font-semibold">
                      ✈️ AeroWings Gate Complex: <span className="text-white font-bold">{airportData.aeroWingsGates}</span>
                    </div>
                  </div>
                </div>

                {/* Transit & Ground Transport */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Train className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">Transit & Ground Connect</span>
                  </div>
                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <div className="font-bold text-white mb-1 flex items-center gap-1.5">
                        <Train className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Airport Metro / Express Shuttle</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{airportData.metroStation}</p>
                    </div>

                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <div className="font-bold text-white mb-1 flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5 text-amber-400" />
                        <span>Cabs & Parking Navigation</span>
                      </div>
                      <p className="text-[11px] text-slate-400">Designated pickup zones at Multi-Level Car Parking (MLCP) Level 2 & 3 with QR check-in.</p>
                    </div>
                  </div>
                </div>

                {/* Weather Grounding & Runways */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400">
                    <Compass className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">Runway & Radar Grounding</span>
                  </div>
                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[11px] text-slate-400 block mb-1">Active Runways:</span>
                      <ul className="space-y-1">
                        {airportData.runways?.map((r: string, idx: number) => (
                          <li key={idx} className="font-mono text-white text-[11px]">• {r}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">
                      <Wind className="w-4 h-4 text-sky-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 block">Current Ground Telemetry</span>
                        <span className="text-xs font-bold text-white">{airportData.weatherGrounding}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
          <span>Grounded with Google Maps Platform Data & DGCA Aviation Charts</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close Navigator
          </button>
        </div>
      </div>
    </div>
  );
};

