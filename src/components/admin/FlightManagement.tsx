import React, { useState } from 'react';
import { useAirline } from '../../context/AirlineContext';
import { AIRPORTS } from '../../data/mockData';
import { formatCurrency } from '../../utils/airlineUtils';
import { airlineDB } from '../../utils/airlineDatabase';
import { Flight, FlightStatus, RouteType } from '../../types/airline';
import {
  Plane,
  Plus,
  Edit2,
  Trash2,
  Search,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Clock,
  Radio,
  X,
  Sparkles,
  Send,
  CloudLightning,
  ShieldAlert,
  Smartphone,
  Check
} from 'lucide-react';

export const FlightManagement: React.FC = () => {
  const {
    flights,
    addFlight,
    updateFlight,
    deleteFlight,
    updateFlightStatus,
    resetDefaultFlights,
    currency,
    addToast
  } = useAirline();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);
  const [showStatusModal, setShowStatusModal] = useState<Flight | null>(null);
  const [newStatus, setNewStatus] = useState<FlightStatus>('On Time');
  const [delayMins, setDelayMins] = useState<number>(0);
  const [editingGateFlightId, setEditingGateFlightId] = useState<string | null>(null);
  const [quickGate, setQuickGate] = useState<string>('');

  // Form State for Add / Edit
  const [flightNumber, setFlightNumber] = useState('AW-650');
  const [airline, setAirline] = useState('AeroWings Express');
  const [aircraft, setAircraft] = useState('Boeing 787-9 Dreamliner');
  const [originCode, setOriginCode] = useState('DEL');
  const [destCode, setDestCode] = useState('BOM');
  const [departureTime, setDepartureTime] = useState('14:00');
  const [arrivalTime, setArrivalTime] = useState('16:15');
  const [duration, setDuration] = useState('2h 15m');
  const [stops, setStops] = useState<number>(0);
  const [economyPrice, setEconomyPrice] = useState<number>(4900);
  const [premEconPrice, setPremEconPrice] = useState<number>(7500);
  const [businessPrice, setBusinessPrice] = useState<number>(17000);
  const [firstPrice, setFirstPrice] = useState<number>(29000);
  const [totalSeats, setTotalSeats] = useState<number>(180);
  const [gate, setGate] = useState('24B');
  const [terminal, setTerminal] = useState('T3');

  const filteredFlights = flights.filter(f =>
    f.flightNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.origin.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.destination.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.airline.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingFlight(null);
    setFlightNumber(`AW-${Math.floor(100 + Math.random() * 900)}`);
    setShowAddModal(true);
  };

  const handleOpenEdit = (f: Flight) => {
    setEditingFlight(f);
    setFlightNumber(f.flightNumber);
    setAirline(f.airline);
    setAircraft(f.aircraft);
    setOriginCode(f.origin.code);
    setDestCode(f.destination.code);
    setDepartureTime(f.departureTime);
    setArrivalTime(f.arrivalTime);
    setDuration(f.duration);
    setStops(f.stops);
    setEconomyPrice(f.prices.economy);
    setPremEconPrice(f.prices.premium_economy);
    setBusinessPrice(f.prices.business);
    setFirstPrice(f.prices.first);
    setTotalSeats(f.totalSeats);
    setGate(f.gate || '12A');
    setTerminal(f.terminal || 'T3');
    setShowAddModal(true);
  };

  const handleSaveFlight = (e: React.FormEvent) => {
    e.preventDefault();
    const origin = AIRPORTS.find(a => a.code === originCode) || AIRPORTS[0];
    const destination = AIRPORTS.find(a => a.code === destCode) || AIRPORTS[1];

    const isInternational = origin.country !== destination.country;
    const isIntraState = origin.state === destination.state && !isInternational;
    const routeType: RouteType = isInternational ? 'international' : isIntraState ? 'intra_state' : 'inter_state';

    const baseEcon = Number(economyPrice);

    const flightData: Omit<Flight, 'id'> = {
      flightNumber,
      airline,
      airlineCode: 'AW',
      aircraft,
      origin,
      destination,
      departureTime,
      arrivalTime,
      duration,
      durationMinutes: 135,
      stops,
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      routeType,
      prices: {
        economy: baseEcon,
        premium_economy: Number(premEconPrice),
        business: Number(businessPrice),
        first: Number(firstPrice),
      },
      availableSeats: {
        economy: Math.round(totalSeats * 0.7),
        premium_economy: Math.round(totalSeats * 0.15),
        business: Math.round(totalSeats * 0.1),
        first: Math.round(totalSeats * 0.05),
      },
      totalSeats: Number(totalSeats),
      baggageAllowance: {
        cabin: '7 kg',
        checkIn: isInternational ? '25 kg' : '15 kg',
      },
      amenities: ['In-flight Entertainment', 'Complimentary Meal', 'Wi-Fi'],
      status: 'On Time',
      gate,
      terminal,
      weather: {
        condition: 'Clear',
        temperatureC: 28,
        visibilityKm: 10,
        windSpeedKmh: 12,
        stormIndex: 4,
        aiRiskScore: 3,
        aiCancellationRisk: 'Low'
      },
      competitors: [
        {
          competitorName: isInternational ? 'Emirates' : 'Air India',
          price: Math.round(baseEcon * 1.22),
          difference: Math.round(baseEcon * 0.22),
          baggageIncluded: isInternational ? '20 kg' : '15 kg',
          mealIncluded: 'Paid Snack Only'
        },
        {
          competitorName: isInternational ? 'British Airways / Singapore Air' : 'IndiGo Air',
          price: Math.round(baseEcon * 1.12),
          difference: Math.round(baseEcon * 0.12),
          baggageIncluded: '15 kg',
          mealIncluded: 'Extra Fee'
        }
      ],
      avgMarketPrice: Math.round(baseEcon * 1.2),
      savingsVsMarket: Math.round(baseEcon * 0.2),
      aiPrediction: {
        fareTrend: 'stable',
        predictedPriceChangePercent: 5,
        fareTrendExplanation: 'Stable historical demand. Expected to rise within 48h before departure.',
        onTimeProbability: 96,
        bestTimeToBook: 'Book Today for Best Rate',
        seatRecommendation: 'Window Seat in Row 4-10 recommended',
        weatherReliabilityScore: 98
      }
    };

    if (editingFlight) {
      updateFlight(editingFlight.id, flightData);
    } else {
      addFlight(flightData);
    }

    setShowAddModal(false);
    setEditingFlight(null);
  };

  const handleSaveStatus = () => {
    if (showStatusModal) {
      updateFlightStatus(showStatusModal.id, newStatus, delayMins);
      setShowStatusModal(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Plane className="w-5 h-5 text-sky-400" />
            <span>Flight Schedule & Fleet Management (CRUD)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Create, update timetable records, reassign gates, and dispatch operational flight statuses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetDefaultFlights}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Timetable</span>
          </button>

          <button
            onClick={handleOpenAdd}
            id="add-new-flight-btn"
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Flight</span>
          </button>
        </div>
      </div>

      {/* Severe Weather & Operations Ground Stop Control Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <CloudLightning className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white flex items-center gap-1.5">
              <span>Flight Operations & Meteorological Disruption Dispatch</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">LIVE ATC</span>
            </div>
            <div className="text-slate-400 text-[11px]">
              Directly reassign gates, delay departures, ground flights for safety, or broadcast SMS & emails to all manifest passengers.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              // Quick ground weather advisory
              const delFlights = flights.filter(f => f.origin.code === 'DEL');
              delFlights.forEach(f => updateFlightStatus(f.id, 'Delayed', 45));
              addToast('Severe Fog Warning: All DEL departures delayed by 45m. Passenger alerts dispatched.', 'warning');
            }}
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Simulate DEL Fog Delay (+45m)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              // Instant normalize
              flights.forEach(f => {
                if (f.status !== 'On Time') updateFlightStatus(f.id, 'On Time', 0);
              });
              addToast('All flights cleared for on-time operations.', 'success');
            }}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Clear All to On-Time</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filter by flight number, airline, or city name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent text-xs text-white w-full focus:outline-none placeholder-slate-500"
        />
      </div>

      {/* Flights Management Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Flight</th>
                <th className="py-3 px-4">Airline & Aircraft</th>
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-4">Schedule</th>
                <th className="py-3 px-4">Fares (Econ / Biz)</th>
                <th className="py-3 px-4">Gate / Term</th>
                <th className="py-3 px-4">Status Dispatch</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredFlights.map((flight) => (
                <tr key={flight.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-mono font-bold text-sky-400">
                    {flight.flightNumber}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-white">{flight.airline}</div>
                    <div className="text-[11px] text-slate-400">{flight.aircraft}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-white">
                      {flight.origin.code} → {flight.destination.code}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {flight.origin.city} to {flight.destination.city}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-white">
                      {flight.departureTime} - {flight.arrivalTime}
                    </div>
                    <div className="text-[10px] text-slate-400">{flight.duration}</div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                    {formatCurrency(flight.prices.economy, currency)} / {formatCurrency(flight.prices.business, currency)}
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {editingGateFlightId === flight.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={quickGate}
                          onChange={(e) => setQuickGate(e.target.value)}
                          placeholder="Gate"
                          className="w-16 px-1.5 py-0.5 bg-slate-950 border border-sky-500 rounded text-xs text-white font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (quickGate.trim()) {
                              updateFlight(flight.id, { gate: quickGate.trim() });
                            }
                            setEditingGateFlightId(null);
                          }}
                          className="p-1 bg-emerald-500 text-slate-950 rounded hover:bg-emerald-400 cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div 
                        onClick={() => {
                          setEditingGateFlightId(flight.id);
                          setQuickGate(flight.gate || '22A');
                        }}
                        className="cursor-pointer hover:text-sky-400 flex items-center gap-1 group"
                        title="Click to edit gate"
                      >
                        <span>Gate {flight.gate || '22A'} • {flight.terminal || 'T3'}</span>
                        <Edit2 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-sky-400" />
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <select
                        value={flight.status}
                        onChange={(e) => {
                          const val = e.target.value as FlightStatus;
                          const delay = val === 'Delayed' ? 30 : 0;
                          updateFlightStatus(flight.id, val, delay);
                        }}
                        className={`px-2 py-1 rounded-lg text-[11px] font-bold border cursor-pointer bg-slate-900 focus:outline-none ${
                          flight.status === 'On Time' ? 'text-emerald-300 border-emerald-500/40' :
                          flight.status === 'Delayed' ? 'text-rose-300 border-rose-500/40' :
                          flight.status === 'Boarding' ? 'text-amber-300 border-amber-500/40' :
                          'text-sky-300 border-sky-500/40'
                        }`}
                      >
                        <option value="On Time">On Time</option>
                        <option value="Boarding">Boarding Active</option>
                        <option value="Delayed">Delayed (+30m)</option>
                        <option value="Departed">Departed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          // Broadcast SMS to linked mobile
                          const phone = localStorage.getItem('aerowings_linked_phone') || '';
                          airlineDB.addSms({
                            phoneNumber: phone,
                            type: 'FLIGHT_DELAY',
                            title: `Operations Notice: Flight ${flight.flightNumber}`,
                            body: `AeroWings ATC Dispatch: Flight ${flight.flightNumber} (${flight.origin.code} ➔ ${flight.destination.code}) is currently ${flight.status}. Gate: ${flight.gate || '22A'}.`,
                            pnr: 'ALL-MANIFEST'
                          });
                          addToast(`Dispatched SMS broadcast to manifest for ${flight.flightNumber}`, 'success');
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-sky-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title="Broadcast SMS to Manifest"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(flight)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title="Edit Flight"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteFlight(flight.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title="Delete Flight"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Flight Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">
                {editingFlight ? `Edit Flight ${editingFlight.flightNumber}` : 'Add New Flight to Schedule'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFlight} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Flight Number</label>
                  <input
                    type="text"
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Airline Brand</label>
                  <select
                    value={airline}
                    onChange={(e) => setAirline(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="AeroWings Express">AeroWings Express</option>
                    <option value="AeroWings Prime">AeroWings Prime</option>
                    <option value="AeroWings Global">AeroWings Global</option>
                    <option value="AeroWings Connect">AeroWings Connect</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Aircraft Model</label>
                  <select
                    value={aircraft}
                    onChange={(e) => setAircraft(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Boeing 787-9 Dreamliner">Boeing 787-9 Dreamliner</option>
                    <option value="Airbus A350-900">Airbus A350-900</option>
                    <option value="Boeing 777-300ER">Boeing 777-300ER</option>
                    <option value="Airbus A320neo">Airbus A320neo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Origin Airport</label>
                  <select
                    value={originCode}
                    onChange={(e) => setOriginCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
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
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    {AIRPORTS.map(a => (
                      <option key={a.code} value={a.code}>{a.city} ({a.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Departure Time</label>
                  <input
                    type="time"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Arrival Time</label>
                  <input
                    type="time"
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 2h 15m"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Fares */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">Economy Fare (₹)</label>
                  <input
                    type="number"
                    value={economyPrice}
                    onChange={(e) => setEconomyPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">Prem Econ Fare (₹)</label>
                  <input
                    type="number"
                    value={premEconPrice}
                    onChange={(e) => setPremEconPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">Business Fare (₹)</label>
                  <input
                    type="number"
                    value={businessPrice}
                    onChange={(e) => setBusinessPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">First Class Fare (₹)</label>
                  <input
                    type="number"
                    value={firstPrice}
                    onChange={(e) => setFirstPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25"
                >
                  {editingFlight ? 'Update Flight' : 'Save & Publish Flight'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Flight Status Dispatch Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">
                Dispatch Status for {showStatusModal.flightNumber}
              </h3>
              <button onClick={() => setShowStatusModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Operational Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Scheduled', 'On Time', 'Delayed', 'Boarding', 'Departed', 'Cancelled'] as FlightStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setNewStatus(st)}
                      className={`p-2 rounded-xl border text-center font-bold transition-all ${
                        newStatus === st
                          ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {newStatus === 'Delayed' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Delay Duration (Minutes)</label>
                  <input
                    type="number"
                    value={delayMins}
                    onChange={(e) => setDelayMins(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowStatusModal(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveStatus}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl"
              >
                Apply Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
