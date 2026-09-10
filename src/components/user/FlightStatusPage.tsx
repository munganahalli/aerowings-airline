import React, { useState } from 'react';
import { useAirline } from '../../context/AirlineContext';
import { AIRPORTS } from '../../data/mockData';
import { Plane, Search, Radio, Clock, MapPin, CheckCircle, AlertTriangle, Shield } from 'lucide-react';

export const FlightStatusPage: React.FC = () => {
  const { flights } = useAirline();
  const [searchMethod, setSearchMethod] = useState<'flight_number' | 'route'>('flight_number');
  const [flightNumberQuery, setFlightNumberQuery] = useState<string>('AW-204');
  const [originCode, setOriginCode] = useState<string>('DEL');
  const [destCode, setDestCode] = useState<string>('BOM');

  const filteredFlights = flights.filter(f => {
    if (searchMethod === 'flight_number') {
      return f.flightNumber.toLowerCase().includes(flightNumberQuery.toLowerCase().trim());
    }
    return f.origin.code === originCode && f.destination.code === destCode;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>LIVE FLIGHT RADAR & DISPATCH STATUS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Real-Time Flight Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Monitor gate announcements, boarding milestones, aircraft models, and runway transit schedules.
          </p>
        </div>
      </div>

      {/* Tracker Search Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4">
        {/* Mode Selector */}
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 w-fit text-xs font-semibold">
          <button
            onClick={() => setSearchMethod('flight_number')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              searchMethod === 'flight_number' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            By Flight Number
          </button>
          <button
            onClick={() => setSearchMethod('route')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              searchMethod === 'route' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            By Route
          </button>
        </div>

        {/* Input Form */}
        {searchMethod === 'flight_number' ? (
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="e.g. AW-204, AW-318, AW-905"
                value={flightNumberQuery}
                onChange={(e) => setFlightNumberQuery(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-white font-mono font-bold uppercase focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              onClick={() => {}}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-colors"
            >
              Search Flight
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Origin Airport</label>
              <select
                value={originCode}
                onChange={(e) => setOriginCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {AIRPORTS.map(a => (
                  <option key={a.code} value={a.code}>{a.city} ({a.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Destination Airport</label>
              <select
                value={destCode}
                onChange={(e) => setDestCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {AIRPORTS.map(a => (
                  <option key={a.code} value={a.code}>{a.city} ({a.code})</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results List */}
      <div className="space-y-4">
        <div className="text-xs text-slate-400">
          Showing <span className="text-white font-bold">{filteredFlights.length}</span> live flight schedules
        </div>

        {filteredFlights.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-2">
            <Plane className="w-10 h-10 mx-auto text-slate-600" />
            <div className="text-white font-bold text-sm">No Flights Found</div>
            <p className="text-xs">Try searching for AW-204, AW-318, or changing route airports.</p>
          </div>
        ) : (
          filteredFlights.map((flight) => {
            const isOnTime = flight.status === 'On Time';
            const isDelayed = flight.status === 'Delayed';
            const isBoarding = flight.status === 'Boarding';

            return (
              <div
                key={flight.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-lg space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                      {flight.airlineCode}
                    </div>
                    <div>
                      <div className="text-base font-bold text-white flex items-center gap-2">
                        <span>{flight.flightNumber}</span>
                        <span className="text-xs text-slate-400 font-normal">• {flight.airline}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">{flight.aircraft}</div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                      isOnTime
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : isDelayed
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : isBoarding
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}
                  >
                    ● {flight.status} {flight.delayMinutes ? `(+${flight.delayMinutes}m)` : ''}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  {/* Origin */}
                  <div className="sm:col-span-4">
                    <div className="text-2xl font-black text-white">{flight.departureTime}</div>
                    <div className="text-xs font-bold text-sky-400">{flight.origin.city} ({flight.origin.code})</div>
                    <div className="text-[11px] text-slate-400">Terminal {flight.terminal || 'T3'} • Gate {flight.gate || '18A'}</div>
                  </div>

                  {/* Route Bar */}
                  <div className="sm:col-span-4 text-center">
                    <div className="text-[11px] text-slate-400 mb-1">{flight.duration}</div>
                    <div className="relative flex items-center justify-center">
                      <div className="h-[2px] w-full bg-slate-700"></div>
                      <Plane className="w-4 h-4 text-sky-400 absolute transform rotate-90" />
                    </div>
                    <div className="text-[10px] text-emerald-400 font-semibold mt-1">
                      {flight.stops === 0 ? 'Non-Stop Scheduled' : '1 Transit Stop'}
                    </div>
                  </div>

                  {/* Destination */}
                  <div className="sm:col-span-4 text-left sm:text-right">
                    <div className="text-2xl font-black text-white">{flight.arrivalTime}</div>
                    <div className="text-xs font-bold text-sky-400">{flight.destination.city} ({flight.destination.code})</div>
                    <div className="text-[11px] text-slate-400">Terminal {flight.destination.terminal || 'T2'}</div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
