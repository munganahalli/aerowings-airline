import React, { useState, useMemo } from 'react';
import { useAirline } from '../../context/AirlineContext';
import { useLanguage } from '../../context/LanguageContext';
import { BookingStepBar } from '../common/BookingStepBar';
import { generateSeatMap, formatCurrency } from '../../utils/airlineUtils';
import { Seat } from '../../types/airline';
import { aiVoice } from '../../utils/aiVoice';
import {
  Plane,
  User,
  ArrowRight,
  Shield,
  Info,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Zap,
  Check,
  Armchair,
  Wifi,
  LifeBuoy,
  Flame,
  PlusCircle,
  DoorOpen,
  Eye,
  Activity,
  HeartPulse,
  Wind
} from 'lucide-react';

export const SeatSelectionPage: React.FC = () => {
  const {
    selectedFlight,
    passengers,
    selectedSeats,
    assignSeat,
    removeSeat,
    setUserView,
    currency,
    calculateFareBreakdown
  } = useAirline();
  const { t } = useLanguage();

  const [activePassengerIndex, setActivePassengerIndex] = useState<number>(0);
  const [hoveredSeat, setHoveredSeat] = useState<Seat | null>(null);
  const [selectedAmenityTab, setSelectedAmenityTab] = useState<'all' | 'wifi' | 'safety' | 'washrooms'>('all');

  // Generate or memoize seat grid for this flight
  const seatGrid = useMemo(() => {
    if (!selectedFlight) return [];
    return generateSeatMap(selectedFlight);
  }, [selectedFlight]);

  // Compute live cabin statistics
  const seatStats = useMemo(() => {
    const total = seatGrid.length;
    const booked = seatGrid.filter(s => s.isOccupied).length;
    const userSelected = (Object.values(selectedSeats) as Seat[]).filter(Boolean).length;
    const available = total - booked;
    const occupancyPercent = total > 0 ? Math.round((booked / total) * 100) : 0;

    // By cabin class
    const businessSeats = seatGrid.filter(s => s.row <= 4);
    const premSeats = seatGrid.filter(s => s.row > 4 && s.row <= 8);
    const econSeats = seatGrid.filter(s => s.row > 8);

    return {
      total,
      booked,
      available,
      userSelected,
      occupancyPercent,
      business: {
        total: businessSeats.length,
        booked: businessSeats.filter(s => s.isOccupied).length,
        avail: businessSeats.filter(s => !s.isOccupied).length,
      },
      premium: {
        total: premSeats.length,
        booked: premSeats.filter(s => s.isOccupied).length,
        avail: premSeats.filter(s => !s.isOccupied).length,
      },
      economy: {
        total: econSeats.length,
        booked: econSeats.filter(s => s.isOccupied).length,
        avail: econSeats.filter(s => !s.isOccupied).length,
      },
    };
  }, [seatGrid, selectedSeats]);

  if (!selectedFlight) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">No Flight Selected</h2>
        <p className="text-xs text-slate-400">Please select a flight to proceed with seat selection.</p>
        <button
          onClick={() => setUserView('results')}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl"
        >
          ← Back to Flight Results
        </button>
      </div>
    );
  }

  const fare = calculateFareBreakdown();

  // Handle seat click
  const handleSeatClick = (seat: Seat) => {
    if (seat.isOccupied) return;

    // Check if this seat is already selected by another passenger
    const existingIndex = (Object.entries(selectedSeats) as [string, Seat][]).find(([_, s]) => s?.id === seat.id)?.[0];

    if (existingIndex !== undefined && parseInt(existingIndex, 10) === activePassengerIndex) {
      // Toggle off for current passenger
      removeSeat(activePassengerIndex);
      return;
    }

    // Assign seat to current active passenger
    assignSeat(activePassengerIndex, seat);
    const seatTypeDesc = seat.isWindow ? 'Window Seat' : seat.isAisle ? 'Aisle Seat' : 'Standard Seat';
    aiVoice.announceSeatAssigned(seat.id, seatTypeDesc, `Passenger ${activePassengerIndex + 1}`);

    // Auto-advance to next passenger if more exist
    if (activePassengerIndex < passengers.length - 1) {
      setActivePassengerIndex(activePassengerIndex + 1);
    }
  };

  // Auto assign seats for all passengers
  const handleAutoAssignFreeSeats = () => {
    passengers.forEach((_, idx) => {
      if (!selectedSeats[idx]) {
        const freeSeat = seatGrid.find(s => !s.isOccupied && s.price === 0 && !(Object.values(selectedSeats) as Seat[]).some(x => x?.id === s.id));
        const fallbackSeat = seatGrid.find(s => !s.isOccupied && !(Object.values(selectedSeats) as Seat[]).some(x => x?.id === s.id));
        const seatToAssign = freeSeat || fallbackSeat;
        if (seatToAssign) assignSeat(idx, seatToAssign);
      }
    });
    aiVoice.speak('Complimentary seats have been auto-assigned. Continuing to Step 4: Baggage and Meals.');
    setUserView('addons');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedToAddons = () => {
    aiVoice.speak('Seats confirmed. Proceeding to Step 4: Baggage, Meals, and Travel Add-ons.');
    setUserView('addons');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalSeatsPrice = (Object.values(selectedSeats) as Seat[]).reduce((sum: number, s: Seat) => sum + (s?.price || 0), 0);

  // Group seats by rows
  const groupedRows: Record<number, Seat[]> = {};
  seatGrid.forEach(seat => {
    if (!groupedRows[seat.row]) groupedRows[seat.row] = [];
    groupedRows[seat.row].push(seat);
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 sm:pb-8">
      {/* Step Progress Bar */}
      <BookingStepBar
        currentStep={3}
        stepTitle="Interactive Seat & Amenities Plan"
        stepSubtitle="Choose your seats and view live aircraft seat availability, Wi-Fi zones, safety gear, and washroom locations."
        voiceText="Step 3: Cabin Seat Selection. View live total, booked, and available seats, in-flight high-speed Wi-Fi, safety gear, and washrooms."
        firstTimeFlyerTip="💡 First-Time Flyer Tip: Window seats ('A' & 'F') offer cloud views, Aisle seats ('C' & 'D') offer quick access to washrooms and legroom. Look for the lavatory and Wi-Fi badges across the aircraft."
      />

      {/* Real-time Seat Availability & Capacity Dashboard */}
      <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white shadow-md">
              <Armchair className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span>{selectedFlight.aircraft} Cabin Capacity & Availability</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Live Seat Map
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Flight {selectedFlight.airlineCode || 'AW'}-{selectedFlight.flightNumber} • {selectedFlight.origin.code} → {selectedFlight.destination.code}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Cabin Amenities Feature Bar: Wi-Fi, Safety Equipment, Washrooms */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
              Onboard Amenities & In-Flight Aircraft Facilities
            </h3>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setSelectedAmenityTab('all')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                selectedAmenityTab === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              All Facilities
            </button>
            <button
              onClick={() => setSelectedAmenityTab('wifi')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                selectedAmenityTab === 'wifi' ? 'bg-sky-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              📶 In-Flight Wi-Fi
            </button>
            <button
              onClick={() => setSelectedAmenityTab('safety')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                selectedAmenityTab === 'safety' ? 'bg-amber-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              🦺 Safety Gear
            </button>
            <button
              onClick={() => setSelectedAmenityTab('washrooms')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                selectedAmenityTab === 'washrooms' ? 'bg-emerald-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              🚻 Washrooms
            </button>
          </div>
        </div>

        {/* 3 Interactive Amenity Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* In-Flight High-Speed Wi-Fi */}
          <div className={`p-4 rounded-2xl border transition-all ${
            selectedAmenityTab === 'wifi' || selectedAmenityTab === 'all'
              ? 'bg-sky-950/30 border-sky-500/40 shadow-lg shadow-sky-500/10'
              : 'bg-slate-950/60 border-slate-800 opacity-60'
          }`}>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
                <Wifi className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white text-xs">5G Satellite In-Flight Wi-Fi</div>
                <div className="text-[10px] text-sky-300 font-mono">120 Mbps High-Speed Ka-Band</div>
              </div>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              • <strong>Free Messaging:</strong> WhatsApp, iMessage, and WeChat included for all passengers.<br />
              • <strong>Streaming Ready:</strong> Watch live sports & YouTube in full 1080p HD at 35,000 ft.
            </p>
          </div>

          {/* Aircraft Safety Equipment */}
          <div className={`p-4 rounded-2xl border transition-all ${
            selectedAmenityTab === 'safety' || selectedAmenityTab === 'all'
              ? 'bg-amber-950/30 border-amber-500/40 shadow-lg shadow-amber-500/10'
              : 'bg-slate-950/60 border-slate-800 opacity-60'
          }`}>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white text-xs">Full Safety Equipment</div>
                <div className="text-[10px] text-amber-300 font-mono">FAA & DGCA Flight Certified</div>
              </div>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              • <strong>Life Vests:</strong> Located directly under each seat with whistle & locator strobe.<br />
              • <strong>Emergency Oxygen:</strong> Auto-deploy overhead drop masks at every row.<br />
              • <strong>Exits & Slides:</strong> 4 Overwing Exit Doors (Rows 14 & 15) with slide chutes.
            </p>
          </div>

          {/* Washrooms / Lavatories */}
          <div className={`p-4 rounded-2xl border transition-all ${
            selectedAmenityTab === 'washrooms' || selectedAmenityTab === 'all'
              ? 'bg-emerald-950/30 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
              : 'bg-slate-950/60 border-slate-800 opacity-60'
          }`}>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <span className="text-base">🚻</span>
              </div>
              <div>
                <div className="font-bold text-white text-xs">Aircraft Lavatories / Washrooms</div>
                <div className="text-[10px] text-emerald-300 font-mono">4 Total Clean Washrooms</div>
              </div>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              • <strong>Forward Washroom:</strong> Located near Cockpit & Row 1 (Executive).<br />
              • <strong>Mid-Cabin Washroom:</strong> Wheelchair accessible with Baby Diaper table.<br />
              • <strong>Aft Double Washrooms:</strong> Dual spacious lavatories behind Row 30.
            </p>
          </div>
        </div>
      </div>

      {/* Passenger Switcher Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4">
        <div className="text-xs font-bold text-slate-300 mb-2.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-sky-400" />
            <span>Select Seat For Passenger:</span>
          </span>
          <span className="text-slate-400 text-[11px]">
            {Object.keys(selectedSeats).length} of {passengers.length} Assigned
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {passengers.map((p, idx) => {
            const assigned = selectedSeats[idx];
            const isActive = activePassengerIndex === idx;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActivePassengerIndex(idx)}
                className={`flex-1 min-w-[170px] sm:min-w-[200px] p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-md ring-2 ring-blue-500/40'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Traveler {idx + 1}
                  </span>
                  {assigned ? (
                    <span className="text-[11px] font-black text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                      Seat {assigned.id}
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                      Not Selected
                    </span>
                  )}
                </div>
                <div className="font-bold text-xs text-white truncate">
                  {p.firstName ? `${p.title} ${p.firstName} ${p.lastName}` : `Traveler ${idx + 1}`}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Seat Layout & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Fuselage Seat Grid */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-3 sm:p-6 overflow-hidden flex flex-col items-center">
          
          {/* Fuselage Nose / Cockpit */}
          <div className="w-44 sm:w-60 h-14 bg-gradient-to-b from-slate-800 to-slate-900 rounded-t-full border-t-2 border-x-2 border-slate-700 flex items-center justify-center relative mb-3 shadow-inner">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold uppercase tracking-widest">
              <Plane className="w-3.5 h-3.5 text-sky-400 transform -rotate-90" />
              <span>COCKPIT / PILOTS</span>
            </div>
          </div>

          {/* Front Washroom & Galley Indicator */}
          <div className="w-full max-w-md bg-slate-950 border border-dashed border-emerald-500/40 rounded-xl p-2.5 mb-3 flex items-center justify-between text-[11px] font-bold px-4 text-slate-300">
            <span className="text-emerald-400 flex items-center gap-1">🚻 Forward Washroom</span>
            <span className="text-sky-300 flex items-center gap-1"><Wifi className="w-3 h-3" /> Wi-Fi Hub</span>
            <span className="text-amber-400 flex items-center gap-1">🍽️ Galley 1L</span>
          </div>

          {/* Seat Grid Scrollable on Small Phones */}
          <div className="w-full max-w-lg overflow-x-auto pb-2">
            <div className="space-y-1.5 min-w-[280px]">
              {Object.entries(groupedRows).map(([rowStr, rowSeats]) => {
                const rowNum = parseInt(rowStr, 10);
                const isBusiness = rowNum <= 4;
                const isPremEcon = rowNum > 4 && rowNum <= 8;
                const isExit = rowNum === 14 || rowNum === 15;
                const isMidLavatory = rowNum === 16;

                return (
                  <div key={rowNum} className="space-y-1">
                    {/* Class dividers */}
                    {rowNum === 1 && (
                      <div className="text-center py-1 my-1.5 rounded-lg bg-purple-900/30 border border-purple-500/30 text-purple-300 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
                        <Sparkles className="w-3 h-3" />
                        <span>Business Suites (180° Flat Bed • Direct Aisle)</span>
                      </div>
                    )}
                    {rowNum === 5 && (
                      <div className="text-center py-1 my-1.5 rounded-lg bg-blue-900/30 border border-blue-500/30 text-blue-300 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
                        <Armchair className="w-3 h-3" />
                        <span>Premium Economy (Extra Legroom & Dedicated USB)</span>
                      </div>
                    )}
                    {rowNum === 9 && (
                      <div className="text-center py-1 my-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                        Economy Class (High-Speed In-Flight Wi-Fi Zone)
                      </div>
                    )}

                    {/* Exit Row Safety Warning */}
                    {isExit && rowNum === 14 && (
                      <div className="flex items-center justify-between text-[9px] text-amber-400 font-bold px-2 py-1 bg-amber-500/10 rounded-lg border border-amber-500/30">
                        <span className="flex items-center gap-1">🚪 EMERGENCY EXIT 14L</span>
                        <span>EXTRA LEGROOM (+₹900) • LIFE VEST UNDER SEAT</span>
                        <span className="flex items-center gap-1">EMERGENCY EXIT 14R 🚪</span>
                      </div>
                    )}

                    {/* Mid-Cabin Washroom Banner */}
                    {isMidLavatory && (
                      <div className="flex items-center justify-between text-[9px] text-emerald-400 font-bold px-3 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/30 my-1">
                        <span>🚻 Mid-Cabin Restroom</span>
                        <span>♿ Wheelchair Accessible & Baby Care Station</span>
                        <span>🧯 Fire Safety Kit</span>
                      </div>
                    )}

                    {/* Seat Row */}
                    <div className="flex items-center justify-center gap-1 sm:gap-2">
                      <span className="w-4 sm:w-5 text-center text-[10px] font-bold text-slate-500">
                        {rowNum}
                      </span>

                      {/* Left Column Group */}
                      <div className="flex items-center gap-1">
                        {rowSeats
                          .filter(s => isBusiness ? (s.column === 'A' || s.column === 'C') : (s.column === 'A' || s.column === 'B' || s.column === 'C'))
                          .map(seat => {
                            const isOccupied = seat.isOccupied;
                            const selectedByActive = selectedSeats[activePassengerIndex]?.id === seat.id;
                            const selectedByOther = (Object.values(selectedSeats) as Seat[]).some(s => s?.id === seat.id);

                            let seatStyle = 'bg-slate-800 border-slate-700 text-slate-200 hover:border-sky-400 hover:bg-slate-700';

                            if (isOccupied) {
                              seatStyle = 'bg-slate-950 border-slate-900 text-slate-600 cursor-not-allowed opacity-50';
                            } else if (selectedByActive) {
                              seatStyle = 'bg-emerald-600 border-emerald-400 text-white font-black shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400 scale-105';
                            } else if (selectedByOther) {
                              seatStyle = 'bg-blue-600 border-blue-400 text-white font-bold';
                            } else if (seat.isExitRow) {
                              seatStyle = 'bg-amber-950/40 border-amber-500/50 text-amber-300 hover:bg-amber-900/50';
                            } else if (isBusiness) {
                              seatStyle = 'bg-purple-950/40 border-purple-500/50 text-purple-300 hover:bg-purple-900/50';
                            }

                            return (
                              <button
                                key={seat.id}
                                type="button"
                                disabled={isOccupied}
                                onClick={() => handleSeatClick(seat)}
                                onMouseEnter={() => setHoveredSeat(seat)}
                                className={`w-8 h-9 sm:w-9 sm:h-10 rounded-lg text-[10px] font-bold border transition-all flex flex-col items-center justify-center cursor-pointer select-none active:scale-90 ${seatStyle}`}
                                title={`${seat.id}: ${seat.price === 0 ? 'Free' : '₹' + seat.price}`}
                              >
                                <span>{seat.column}</span>
                                <span className="text-[8px] opacity-75">{seat.price === 0 ? 'Free' : `+₹${seat.price}`}</span>
                              </button>
                            );
                          })}
                      </div>

                      {/* Center Aisle */}
                      <div className="w-5 sm:w-7 text-center text-[9px] font-mono text-slate-600 uppercase">
                        Aisle
                      </div>

                      {/* Right Column Group */}
                      <div className="flex items-center gap-1">
                        {rowSeats
                          .filter(s => isBusiness ? (s.column === 'D' || s.column === 'F') : (s.column === 'D' || s.column === 'E' || s.column === 'F'))
                          .map(seat => {
                            const isOccupied = seat.isOccupied;
                            const selectedByActive = selectedSeats[activePassengerIndex]?.id === seat.id;
                            const selectedByOther = (Object.values(selectedSeats) as Seat[]).some(s => s?.id === seat.id);

                            let seatStyle = 'bg-slate-800 border-slate-700 text-slate-200 hover:border-sky-400 hover:bg-slate-700';

                            if (isOccupied) {
                              seatStyle = 'bg-slate-950 border-slate-900 text-slate-600 cursor-not-allowed opacity-50';
                            } else if (selectedByActive) {
                              seatStyle = 'bg-emerald-600 border-emerald-400 text-white font-black shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400 scale-105';
                            } else if (selectedByOther) {
                              seatStyle = 'bg-blue-600 border-blue-400 text-white font-bold';
                            } else if (seat.isExitRow) {
                              seatStyle = 'bg-amber-950/40 border-amber-500/50 text-amber-300 hover:bg-amber-900/50';
                            } else if (isBusiness) {
                              seatStyle = 'bg-purple-950/40 border-purple-500/50 text-purple-300 hover:bg-purple-900/50';
                            }

                            return (
                              <button
                                key={seat.id}
                                type="button"
                                disabled={isOccupied}
                                onClick={() => handleSeatClick(seat)}
                                onMouseEnter={() => setHoveredSeat(seat)}
                                className={`w-8 h-9 sm:w-9 sm:h-10 rounded-lg text-[10px] font-bold border transition-all flex flex-col items-center justify-center cursor-pointer select-none active:scale-90 ${seatStyle}`}
                                title={`${seat.id}: ${seat.price === 0 ? 'Free' : '₹' + seat.price}`}
                              >
                                <span>{seat.column}</span>
                                <span className="text-[8px] opacity-75">{seat.price === 0 ? 'Free' : `+₹${seat.price}`}</span>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rear Double Washroom & Galley 2 Footer */}
          <div className="w-full max-w-md bg-slate-950 border border-dashed border-emerald-500/40 rounded-xl p-2.5 mt-4 flex items-center justify-between text-[11px] font-bold px-4 text-slate-300">
            <span className="text-emerald-400 flex items-center gap-1">🚻 Aft Washroom L</span>
            <span className="text-amber-400 flex items-center gap-1">🍽️ Rear Galley 2</span>
            <span className="text-emerald-400 flex items-center gap-1">🚻 Aft Washroom R</span>
          </div>
        </div>

        {/* Right: Legend, Inspector & Proceed Card */}
        <div className="lg:col-span-4 space-y-4">
          {/* Color Legend */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Seat Selection Legend
            </h3>
            <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-emerald-600 border border-emerald-400"></div>
                <span>Your Picked Seat</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-slate-800 border border-slate-700"></div>
                <span>Available (Free / ₹0)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-amber-500/30 border border-amber-500/50"></div>
                <span>Extra Legroom</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-purple-500/30 border border-purple-500/50"></div>
                <span>Business Class</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-slate-950 border border-slate-900 opacity-50"></div>
                <span>Already Booked (38)</span>
              </div>
            </div>
          </div>

          {/* Seat Inspector Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-sky-400" />
              <span>Seat & Amenity Details</span>
            </h3>

            {hoveredSeat ? (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-extrabold text-white text-base">Seat {hoveredSeat.id}</span>
                  <span className="text-emerald-400 font-bold">
                    {hoveredSeat.price === 0 ? 'Complimentary (₹0)' : formatCurrency(hoveredSeat.price, currency)}
                  </span>
                </div>
                <div className="text-slate-300 space-y-1">
                  <div>• Position: {hoveredSeat.isWindow ? 'Window Scenic View' : hoveredSeat.isAisle ? 'Aisle Direct Walk' : 'Standard Middle'}</div>
                  <div>• Legroom: {hoveredSeat.hasExtraLegroom ? '38 inches (Extra Space)' : '31 inches Standard'}</div>
                  <div>• Safety Gear: Certified Life Vest under seat & Oxygen Mask above</div>
                  <div>• Connectivity: 120 Mbps In-Flight Wi-Fi zone + Fast USB charging</div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Tap or hover on any seat to check exact legroom, window status, and distance to washrooms.
              </p>
            )}
          </div>

          {/* Selected Seats Summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Seat Assignment Summary</span>
            </h3>

            <div className="space-y-2 text-xs">
              {passengers.map((p, idx) => {
                const s = selectedSeats[idx];
                return (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-300 font-medium truncate max-w-[140px]">
                      {p.firstName ? `${p.title} ${p.firstName}` : `Traveler ${idx + 1}`}
                    </span>
                    <span className="font-bold text-white">
                      {s ? `Seat ${s.id} (${s.price === 0 ? 'Free' : '₹' + s.price})` : 'Auto-Assign (Free)'}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">Seat Add-ons Total:</span>
                <span className="text-base font-extrabold text-emerald-400">
                  {formatCurrency(totalSeatsPrice, currency)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleProceedToAddons}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                Proceed to Add-ons →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Step Action Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4">
        <div>
          <span className="text-xs text-slate-400 block">Total Fare Breakdown:</span>
          <span className="text-xl font-extrabold text-emerald-400">
            {formatCurrency(fare.finalTotal, currency)}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setUserView('passengers')}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer"
          >
            ← {t('common.back')}
          </button>

          <button
            type="button"
            onClick={handleProceedToAddons}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>{t('seats.continueToAddons')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sticky Bottom Action Bar for Smartphone Screens */}
      <div className="fixed bottom-0 left-0 right-0 z-30 sm:hidden bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-3 shadow-2xl">
        <div className="flex items-center justify-between gap-2 max-w-lg mx-auto">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Step 3: Seats</span>
            <div className="text-base font-black text-emerald-400 leading-tight">
              {formatCurrency(fare.finalTotal, currency)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setUserView('passengers')}
              className="px-3 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold border border-slate-700"
            >
              ← Back
            </button>

            <button
              type="button"
              onClick={handleProceedToAddons}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5"
            >
              <span>Add-ons (Step 4) →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
