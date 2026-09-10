import React, { useState } from 'react';
import { useAirline } from '../../context/AirlineContext';
import { 
  Calendar, 
  Search, 
  Plane, 
  Clock, 
  MapPin, 
  ArrowRight, 
  Filter, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';
import { AIRPORTS } from '../../data/mockData';
import { formatCurrency } from '../../utils/airlineUtils';

export const TimetablePage: React.FC = () => {
  const { flights, currency, setUserView, setSelectedFlight, setSearchParams } = useAirline();
  
  const [filterOrigin, setFilterOrigin] = useState<string>('ALL');
  const [filterDest, setFilterDest] = useState<string>('ALL');
  const [filterDay, setFilterDay] = useState<string>('ALL');

  const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const filteredFlights = flights.filter(flight => {
    if (filterOrigin !== 'ALL' && flight.origin.code !== filterOrigin) return false;
    if (filterDest !== 'ALL' && flight.destination.code !== filterDest) return false;
    if (filterDay !== 'ALL') {
      const dayIdx = parseInt(filterDay, 10);
      if (!flight.daysOfWeek.includes(dayIdx)) return false;
    }
    return true;
  });

  const handleBookFromTimetable = (flight: typeof flights[0]) => {
    setSearchParams(prev => ({
      ...prev,
      origin: flight.origin.code,
      destination: flight.destination.code
    }));
    setSelectedFlight(flight);
    setUserView('seats');
  };

  return (
    <div className="min-w-0 bg-slate-950 text-slate-100 pb-20">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-b border-slate-800 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold mb-4">
            <Calendar className="w-3.5 h-3.5" />
            <span>AeroWings Global Route Timetable</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Flight Schedules & Timetable
          </h1>
          <p className="max-w-2xl mx-auto text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
            View scheduled flight frequencies, operational days of the week, aircraft equipment, and departure times across our global network.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-8">
        {/* Filters Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            <Filter className="w-4 h-4 text-sky-400" />
            <span>Filter Timetable Schedule</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Departure City</label>
              <select
                value={filterOrigin}
                onChange={(e) => setFilterOrigin(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Origins</option>
                {AIRPORTS.map((a) => (
                  <option key={a.code} value={a.code}>{a.city} ({a.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Arrival City</label>
              <select
                value={filterDest}
                onChange={(e) => setFilterDest(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Destinations</option>
                {AIRPORTS.map((a) => (
                  <option key={a.code} value={a.code}>{a.city} ({a.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Operating Day</label>
              <select
                value={filterDay}
                onChange={(e) => setFilterDay(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Days (Daily Flights)</option>
                {daysMap.map((day, idx) => (
                  <option key={day} value={idx.toString()}>{day}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Timetable Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">
              Scheduled Flights ({filteredFlights.length} Routes Found)
            </h2>
            <span className="text-xs text-slate-400">All times are local</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-4">Flight</th>
                  <th className="p-4">Route</th>
                  <th className="p-4">Departure / Arrival</th>
                  <th className="p-4">Aircraft</th>
                  <th className="p-4">Frequency</th>
                  <th className="p-4">Economy From</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredFlights.map((flight) => (
                  <tr key={flight.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-white">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                          <Plane className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div>{flight.flightNumber}</div>
                          <div className="text-[10px] text-slate-400">{flight.airline}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-white">
                        {flight.origin.city} ({flight.origin.code}) ➔ {flight.destination.city} ({flight.destination.code})
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {flight.stops === 0 ? 'Non-Stop' : `${flight.stops} Stop`} • {flight.duration}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-mono font-bold text-white">
                        {flight.departureTime} ➔ {flight.arrivalTime}
                      </div>
                      <div className="text-[11px] text-slate-400">Terminal {flight.terminal || '1'}</div>
                    </td>
                    <td className="p-4 text-slate-300">
                      <div className="font-medium text-slate-200">{flight.aircraft}</div>
                      <div className="text-[10px] text-slate-400">Wi-Fi & Inflight Entertainment</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((letter, idx) => {
                          const operates = flight.daysOfWeek.includes(idx);
                          return (
                            <span
                              key={idx}
                              className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
                                operates
                                  ? 'bg-blue-600/30 border border-blue-500 text-blue-300'
                                  : 'bg-slate-950 text-slate-600'
                              }`}
                            >
                              {letter}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-amber-300">
                      {formatCurrency(flight.prices.economy, currency)}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleBookFromTimetable(flight)}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-md"
                      >
                        <span>Book</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
