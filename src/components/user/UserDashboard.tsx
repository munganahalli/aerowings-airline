import React, { useState } from 'react';
import { useAirline } from '../../context/AirlineContext';
import { formatCurrency } from '../../utils/airlineUtils';
import { Booking, FlightNotification } from '../../types/airline';
import { SAMPLE_BOOKINGS } from '../../data/mockData';
import { airlineDB } from '../../utils/airlineDatabase';
import { downloadTicketBlob } from '../../utils/ticketDownloadGenerator';
import {
  User,
  Ticket,
  Calendar,
  Clock,
  Plane,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Download,
  RotateCcw,
  Search,
  Award,
  ChevronRight,
  Shield,
  ArrowRight,
  QrCode,
  Smartphone,
  X,
  Bell,
  BellRing,
  Mail,
  MessageSquare,
  Sparkles,
  Zap,
  Sliders,
  Send,
  Trash2,
  CheckCheck,
  Radio,
  ExternalLink,
  ShieldCheck,
  Luggage,
  Volume2
} from 'lucide-react';

export const UserDashboard: React.FC = () => {
  const {
    bookings,
    cancelBooking,
    checkInBooking,
    setCurrentBookingSuccess,
    setUserView,
    userProfile,
    updateUserProfile,
    currency,
    addToast,
    trackedPNR,
    setTrackedPNR,
    notifications,
    notificationPreferences,
    updateNotificationPreferences,
    simulateFlightStatusChange,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    sendFlightNotification
  } = useAirline();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'alerts' | 'preferences' | 'completed' | 'cancelled'>('upcoming');
  const [pnrSearchInput, setPnrSearchInput] = useState<string>(trackedPNR || '');
  const [selectedBookingForAction, setSelectedBookingForAction] = useState<Booking | null>(null);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>('Change in travel plans');
  
  // Notification Viewer Modal
  const [selectedNotificationForView, setSelectedNotificationForView] = useState<FlightNotification | null>(null);
  const [filterChannel, setFilterChannel] = useState<'all' | 'sms' | 'email' | 'push'>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Custom Simulator State
  const [simulatorPNR, setSimulatorPNR] = useState<string>(bookings[0]?.pnr || '');
  const [simulatorStatus, setSimulatorStatus] = useState<'delay' | 'gate_change' | 'boarding' | 'weather' | 'baggage'>('delay');

  // Filter Bookings by status and query
  const query = pnrSearchInput.trim().toLowerCase();
  const cleanQuery = query.replace(/[^a-z0-9]/g, '');

  const filterByQuery = (list: Booking[]) => {
    if (!query) return list;
    return list.filter(b => {
      const bPnr = b.pnr.toLowerCase();
      const bPnrClean = bPnr.replace(/[^a-z0-9]/g, '');
      const matchPnr = bPnr.includes(query) || (cleanQuery.length >= 2 && bPnrClean.includes(cleanQuery));
      const matchFlight = `${b.flight.airlineCode}${b.flight.flightNumber}`.toLowerCase().replace(/[^a-z0-9]/g, '').includes(cleanQuery || query);
      const matchCity = b.flight.origin.city.toLowerCase().includes(query) || 
                        b.flight.destination.city.toLowerCase().includes(query) ||
                        b.flight.origin.code.toLowerCase().includes(query) ||
                        b.flight.destination.code.toLowerCase().includes(query);
      const matchPax = b.passengers.some(p => `${p.firstName} ${p.lastName}`.toLowerCase().includes(query));
      return matchPnr || matchFlight || matchCity || matchPax;
    });
  };

  const upcomingBookings = filterByQuery(bookings.filter(b => b.status === 'Confirmed' || b.status === 'Checked-in'));
  const completedBookings = filterByQuery(bookings.filter(b => b.status === 'Completed'));
  const cancelledBookings = filterByQuery(bookings.filter(b => b.status === 'Cancelled'));

  const unreadCount = notifications.filter(n => !n.read).length;

  const displayedBookings =
    activeTab === 'upcoming' ? upcomingBookings :
    activeTab === 'completed' ? completedBookings : cancelledBookings;

  // Filter notifications
  const filteredNotifications = notifications.filter(n => {
    if (filterChannel !== 'all' && n.channel !== filterChannel) return false;
    if (filterType !== 'all' && n.type !== filterType) return false;
    return true;
  });

  // Search by PNR handler
  const handlePnrSearch = (e?: React.FormEvent, customPnr?: string) => {
    if (e) e.preventDefault();
    const searchTarget = (customPnr ?? pnrSearchInput).trim();
    if (!searchTarget) return;

    const clean = searchTarget.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const allCandidates: Booking[] = [...bookings, ...SAMPLE_BOOKINGS];
    const found = airlineDB.findBookingByPnr(searchTarget) || allCandidates.find(b => {
      const bPnr = b.pnr.toUpperCase().replace(/[^A-Z0-9]/g, '');
      const bId = b.id.toUpperCase().replace(/[^A-Z0-9]/g, '');
      const bTicket = (b.ticketNumber || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      return bPnr === clean || bId === clean || bTicket === clean || bPnr.includes(clean) || clean.includes(bPnr);
    });

    if (found) {
      setCurrentBookingSuccess(found);
      setUserView('confirmation');
      addToast(`PNR ${found.pnr} found! Opening complete voyage itinerary.`, 'success');
    } else {
      addToast(`Filtered voyages matching: "${searchTarget}"`, 'info');
    }
  };

  const handleConfirmCancel = () => {
    if (!selectedBookingForAction) return;
    const res = cancelBooking(selectedBookingForAction.pnr, cancelReason);
    setShowCancelModal(false);
    setSelectedBookingForAction(null);
  };

  const handleTriggerSimulation = (type: 'delay' | 'gate_change' | 'boarding' | 'weather' | 'baggage') => {
    const targetPNR = simulatorPNR || upcomingBookings[0]?.pnr || bookings[0]?.pnr;
    if (!targetPNR) {
      addToast('Please book a flight or enter a valid PNR to simulate live flight status updates.', 'error');
      return;
    }
    simulateFlightStatusChange(targetPNR, type);
    setActiveTab('alerts');
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6">
      {/* User Frequent Flyer Loyalty Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950/60 to-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-left w-full md:w-auto">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg shadow-amber-500/20 shrink-0">
            {userProfile.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-2xl font-bold text-white">{userProfile.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {userProfile.tier} Frequent Flyer
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
              <span>{userProfile.email}</span>
              <span>•</span>
              <span>{userProfile.phone}</span>
            </p>
          </div>
        </div>

        {/* Loyalty Miles Tracker & Quick Alerts Widget */}
        <div className="flex items-center gap-3 sm:gap-6 w-full md:w-auto justify-between md:justify-end">
          <div className="bg-slate-950/70 border border-slate-800 p-3 sm:p-4 rounded-2xl flex items-center gap-4 sm:gap-6 text-center">
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Accumulated Miles</div>
              <div className="text-lg sm:text-xl font-extrabold text-amber-400">
                {userProfile.miles.toLocaleString()} mi
              </div>
            </div>
            <div className="border-l border-slate-800 pl-4 sm:pl-6 text-left">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Next Tier</div>
              <div className="text-xs font-semibold text-sky-400">Platinum Elite</div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('alerts')}
            className="relative p-3 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="View Real-Time Notifications"
          >
            <Bell className="w-5 h-5 text-sky-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* PNR Quick Search Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-slate-300 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="font-semibold">Quick PNR Finder / Retrieve Offline Booking:</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
            <span className="text-slate-500">Quick Test:</span>
            <button
              type="button"
              onClick={() => {
                setPnrSearchInput('AW-892F1');
                handlePnrSearch(undefined, 'AW-892F1');
              }}
              className="px-2 py-0.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-sky-300 font-mono border border-blue-500/30 cursor-pointer"
            >
              AW-892F1
            </button>
            <button
              type="button"
              onClick={() => {
                setPnrSearchInput('6E-771WX');
                handlePnrSearch(undefined, '6E-771WX');
              }}
              className="px-2 py-0.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30 cursor-pointer"
            >
              6E-771WX
            </button>
          </div>
        </div>

        <form onSubmit={handlePnrSearch} className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Enter 6-digit PNR (e.g. AW-892F1)"
              value={pnrSearchInput}
              onChange={(e) => setPnrSearchInput(e.target.value.toUpperCase())}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-blue-500 uppercase w-full pr-8"
            />
            {pnrSearchInput && (
              <button
                type="button"
                onClick={() => setPnrSearchInput('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                title="Clear filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0"
          >
            Find Booking
          </button>
        </form>
      </div>

      {/* Live Status Simulation Toolbar (Real-Time Flight Alerts Tester) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span className="text-xs font-bold text-white">Live Flight Status Dispatch Simulator</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              SMS + Email Real-Time Sync
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Simulate airport control dispatching instant SMS & Email updates to travelers
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-semibold text-slate-400">Test Dispatch:</span>
          
          <button
            type="button"
            onClick={() => handleTriggerSimulation('delay')}
            className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>⏱️ Flight Delay (+35m)</span>
          </button>

          <button
            type="button"
            onClick={() => handleTriggerSimulation('gate_change')}
            className="px-3 py-1.5 bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
            <span>🚪 Gate Changed (Gate 24B)</span>
          </button>

          <button
            type="button"
            onClick={() => handleTriggerSimulation('boarding')}
            className="px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>📢 Boarding Call (Zone 1)</span>
          </button>

          <button
            type="button"
            onClick={() => handleTriggerSimulation('weather')}
            className="px-3 py-1.5 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span>⛈️ Doppler Weather Notice</span>
          </button>

          <button
            type="button"
            onClick={() => handleTriggerSimulation('baggage')}
            className="px-3 py-1.5 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Luggage className="w-3.5 h-3.5 text-blue-400" />
            <span>🧳 Baggage Carousel 4</span>
          </button>
        </div>
      </div>

      {/* Bookings & Notifications Manager Tabs */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs sm:text-sm font-semibold scrollbar-thin">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`py-2 px-3 sm:px-4 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'upcoming'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Plane className="w-4 h-4" />
            <span>Upcoming Voyages ({upcomingBookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`py-2 px-3 sm:px-4 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'alerts'
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Flight Alerts & SMS ({notifications.length})</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('preferences')}
            className={`py-2 px-3 sm:px-4 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'preferences'
                ? 'bg-sky-600/20 text-sky-400 border border-sky-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Alert Preferences</span>
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`py-2 px-3 sm:px-4 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'completed'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Past Journeys ({completedBookings.length})
          </button>

          <button
            onClick={() => setActiveTab('cancelled')}
            className={`py-2 px-3 sm:px-4 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'cancelled'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Cancelled & Refunds ({cancelledBookings.length})
          </button>
        </div>

        {/* TAB 1 & 4 & 5: BOOKINGS CARD LIST */}
        {(activeTab === 'upcoming' || activeTab === 'completed' || activeTab === 'cancelled') && (
          <div>
            {displayedBookings.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center space-y-4">
                <Ticket className="w-12 h-12 text-slate-600 mx-auto" />
                <div>
                  <h3 className="text-base font-bold text-white">No {activeTab} flights match your query</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                    {pnrSearchInput ? (
                      <span>No voyage found matching &ldquo;{pnrSearchInput}&rdquo;. Try clearing your search filter or checking sample PNRs.</span>
                    ) : (
                      <span>Ready to explore? Book your next destination now with zero convenience fee!</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  {pnrSearchInput && (
                    <button
                      type="button"
                      onClick={() => setPnrSearchInput('')}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 cursor-pointer"
                    >
                      Clear Search Filter
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setUserView('home')}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/25 cursor-pointer"
                  >
                    Book a Flight Now
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {displayedBookings.map((booking) => {
                  const flight = booking.flight;
                  const isCheckedIn = booking.status === 'Checked-in';
                  const isCancelled = booking.status === 'Cancelled';

                  return (
                    <div
                      key={booking.id}
                      className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden p-4 sm:p-5 shadow-lg transition-all space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">
                            {flight.airlineCode}
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm">
                              {flight.airline} • {flight.flightNumber}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              PNR: <span className="font-mono font-bold text-amber-300">{booking.pnr}</span> • Booked on {booking.bookingDate}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                              isCheckedIn
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : isCancelled
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            }`}
                          >
                            ● {booking.status}
                          </span>
                        </div>
                      </div>

                      {/* Flight Segment Details (Responsive) */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        {/* Origin & Timings */}
                        <div className="md:col-span-4 flex items-center justify-between sm:justify-start gap-4">
                          <div>
                            <div className="text-xl sm:text-2xl font-black text-white">{flight.departureTime}</div>
                            <div className="text-xs font-bold text-sky-400">{flight.origin.code} - {flight.origin.city}</div>
                            <div className="text-[10px] text-slate-400">{new Date(booking.departureDate).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
                          </div>

                          <div className="text-center px-2">
                            <div className="text-[10px] text-slate-400 mb-1">{flight.duration}</div>
                            <Plane className="w-4 h-4 text-slate-500 transform rotate-90 mx-auto" />
                            <div className="text-[10px] text-emerald-400 font-semibold">{flight.stops === 0 ? 'Direct' : '1 Stop'}</div>
                          </div>

                          <div>
                            <div className="text-xl sm:text-2xl font-black text-white">{flight.arrivalTime}</div>
                            <div className="text-xs font-bold text-sky-400">{flight.destination.code} - {flight.destination.city}</div>
                            <div className="text-[10px] text-slate-400">Terminal {flight.destination.terminal || 'T2'}</div>
                          </div>
                        </div>

                        {/* Passenger & Seats info */}
                        <div className="md:col-span-4 text-xs text-slate-300 space-y-1">
                          <div>
                            <strong>Travelers:</strong> {booking.passengers.map(p => `${p.title} ${p.firstName} ${p.lastName}`).join(', ')}
                          </div>
                          <div>
                            <strong>Seats:</strong> {booking.passengers.map(p => p.seatNumber || 'Unassigned').join(', ')}
                          </div>
                          <div>
                            <strong>Total Fare:</strong> <span className="text-emerald-400 font-bold">{formatCurrency(booking.priceBreakdown.finalTotal, currency)}</span>
                          </div>
                        </div>

                        {/* Action Controls */}
                        <div className="md:col-span-4 flex flex-wrap items-center justify-start md:justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentBookingSuccess(booking);
                              setUserView('confirmation');
                            }}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Ticket className="w-3.5 h-3.5" />
                            <span>View E-Ticket</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              downloadTicketBlob(booking);
                              addToast(`✅ Downloaded E-Ticket PDF for PNR: ${booking.pnr}`, 'success');
                            }}
                            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-bold rounded-xl border border-slate-700 hover:border-sky-500/40 flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Download PDF Ticket directly"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </button>

                          {!isCancelled && !isCheckedIn && (
                            <button
                              type="button"
                              onClick={() => checkInBooking(booking.pnr)}
                              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Smartphone className="w-3.5 h-3.5" />
                              <span>Web Check-in</span>
                            </button>
                          )}

                          {!isCancelled && (
                            <button
                              onClick={() => {
                                setSelectedBookingForAction(booking);
                                setShowCancelModal(true);
                              }}
                              className="px-3 py-2 bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 text-xs font-semibold rounded-xl border border-slate-700 hover:border-rose-500/40 transition-colors cursor-pointer"
                            >
                              Cancel Flight
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Cancelled Info Notice */}
                      {isCancelled && (
                        <div className="mt-2 p-3 rounded-xl border text-xs flex flex-wrap items-center justify-between gap-2 bg-rose-950/30 border-rose-500/30 text-rose-300">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>
                              <strong>{booking.cancellationReason || 'Cancelled'}</strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-emerald-400">
                              100% Full Refund ₹{booking.refundAmount?.toLocaleString() || booking.priceBreakdown.finalTotal.toLocaleString()} Processed
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: REAL-TIME FLIGHT ALERTS & NOTIFICATIONS CENTER */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            {/* Filter and action toolbar */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-300">Filter Channel:</span>
                {(['all', 'sms', 'email', 'push'] as const).map(ch => (
                  <button
                    key={ch}
                    onClick={() => setFilterChannel(ch)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                      filterChannel === ch
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={markAllNotificationsRead}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Mark All Read</span>
                </button>

                <button
                  type="button"
                  onClick={clearNotifications}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/50 text-slate-300 hover:text-rose-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 hover:border-rose-500/40 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            {/* Notifications Feed */}
            {filteredNotifications.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
                <Bell className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-white">No flight alerts currently</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  When flight schedules change, gates get reassigned, or boarding commences, instant SMS & Email notifications will appear here.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => handleTriggerSimulation('delay')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-500/20"
                  >
                    ⚡ Test Live Flight Alert
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notif) => {
                  const isDelay = notif.type === 'delay';
                  const isGate = notif.type === 'gate_change';
                  const isBoarding = notif.type === 'boarding';
                  const isWeather = notif.type === 'weather';
                  const isBaggage = notif.type === 'baggage';

                  const badgeColor =
                    isDelay ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' :
                    isGate ? 'bg-sky-500/20 border-sky-500/40 text-sky-300' :
                    isBoarding ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' :
                    isWeather ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' :
                    'bg-blue-500/20 border-blue-500/40 text-blue-300';

                  const IconComp =
                    isDelay ? Clock :
                    isGate ? ArrowRight :
                    isBoarding ? Volume2 :
                    isWeather ? Zap :
                    notif.channel === 'sms' ? MessageSquare :
                    notif.channel === 'email' ? Mail : BellRing;

                  return (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markNotificationRead(notif.id);
                        setSelectedNotificationForView(notif);
                      }}
                      className={`bg-slate-900 border rounded-2xl p-4 sm:p-5 shadow-lg transition-all cursor-pointer hover:border-slate-600 relative overflow-hidden ${
                        !notif.read ? 'border-indigo-500/50 bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900' : 'border-slate-800'
                      }`}
                    >
                      {!notif.read && (
                        <div className="absolute top-0 right-0 w-3 h-3 bg-indigo-500 rounded-bl-lg" />
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex items-start gap-3.5">
                          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${badgeColor}`}>
                            <IconComp className="w-5 h-5" />
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-white">{notif.title}</h4>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${badgeColor}`}>
                                {notif.channel.toUpperCase()} Alert
                              </span>
                              {notif.flightNumber && (
                                <span className="text-[10px] font-mono bg-slate-950 px-2 py-0.5 rounded text-sky-300 font-bold">
                                  {notif.flightNumber}
                                </span>
                              )}
                              {notif.pnr && (
                                <span className="text-[10px] font-mono bg-slate-950 px-2 py-0.5 rounded text-amber-300 font-bold">
                                  PNR: {notif.pnr}
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed">
                              {notif.message}
                            </p>

                            <div className="text-[10px] text-slate-500 flex items-center gap-3 pt-1">
                              <span>
                                {(() => {
                                  try {
                                    const d = new Date(notif.timestamp);
                                    return !isNaN(d.getTime())
                                      ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                      : notif.timestamp;
                                  } catch {
                                    return notif.timestamp;
                                  }
                                })()}
                              </span>
                              <span>•</span>
                              <span>
                                {(() => {
                                  try {
                                    const d = new Date(notif.timestamp);
                                    return !isNaN(d.getTime())
                                      ? d.toLocaleDateString([], { month: 'short', day: 'numeric' })
                                      : 'Recent';
                                  } catch {
                                    return 'Recent';
                                  }
                                })()}
                              </span>
                              <span>•</span>
                              <span className="text-sky-400 font-semibold hover:underline flex items-center gap-1">
                                <span>Preview {notif.channel.toUpperCase()} delivery</span>
                                <ExternalLink className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedNotificationForView(notif);
                            }}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: NOTIFICATION PREFERENCES */}
        {activeTab === 'preferences' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-sky-400" />
                <span>Flight Alert & Notification Preferences</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Customize how and when you receive real-time schedule updates, SMS alerts, and gate dispatch notices.
              </p>
            </div>

            {/* Channels & Destination Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>SMS Mobile Alerts Channel</span>
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold text-slate-400">Verified Mobile Number</label>
                  <input
                    type="tel"
                    value={notificationPreferences.smsPhone}
                    onChange={(e) => updateNotificationPreferences({ smsPhone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                    placeholder="+1 (555) 012-3456"
                  />
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-slate-300">Enable Instant SMS</span>
                    <button
                      type="button"
                      onClick={() => updateNotificationPreferences({ smsEnabled: !notificationPreferences.smsEnabled })}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        notificationPreferences.smsEnabled ? 'bg-emerald-600' : 'bg-slate-800'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                        notificationPreferences.smsEnabled ? 'right-1' : 'left-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Mail className="w-4 h-4 text-sky-400" />
                  <span>Email Updates Channel</span>
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold text-slate-400">Primary Travel Email</label>
                  <input
                    type="email"
                    value={notificationPreferences.emailAddress}
                    onChange={(e) => updateNotificationPreferences({ emailAddress: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                    placeholder="traveler@example.com"
                  />
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-slate-300">Enable Email Reports</span>
                    <button
                      type="button"
                      onClick={() => updateNotificationPreferences({ emailEnabled: !notificationPreferences.emailEnabled })}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        notificationPreferences.emailEnabled ? 'bg-sky-600' : 'bg-slate-800'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                        notificationPreferences.emailEnabled ? 'right-1' : 'left-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Alert Categories Toggles */}
            <div className="space-y-3 border-t border-slate-800 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Alert Triggers</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'flightDelays', label: 'Flight Delays & Rescheduling', desc: 'Notifies when aircraft ETA changes by >15 minutes' },
                  { key: 'gateChanges', label: 'Gate & Terminal Changes', desc: 'Instant alerts when departure or arrival gate updates' },
                  { key: 'boardingCalls', label: 'Boarding Calls & Final Gate Closing', desc: 'Alerts when your seating zone begins boarding' },
                  { key: 'baggageUpdates', label: 'Baggage Carousel Allocation', desc: 'Provides baggage belt number upon landing' },
                  { key: 'weatherAlerts', label: 'AI Doppler Weather Radar Notices', desc: 'Advisories during severe storm or fog turbulence' },
                ].map((item) => {
                  const isChecked = (notificationPreferences as any)[item.key];
                  return (
                    <div
                      key={item.key}
                      onClick={() => updateNotificationPreferences({ [item.key]: !isChecked })}
                      className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 cursor-pointer hover:border-slate-700 transition-colors"
                    >
                      <div>
                        <div className="text-xs font-bold text-white">{item.label}</div>
                        <div className="text-[10px] text-slate-400">{item.desc}</div>
                      </div>
                      <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${
                        isChecked ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-700 bg-slate-900'
                      }`}>
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* High-Fidelity SMS & Email Preview Modal */}
      {selectedNotificationForView && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                {selectedNotificationForView.channel === 'sms' ? (
                  <MessageSquare className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Mail className="w-5 h-5 text-sky-400" />
                )}
                <h3 className="font-bold text-white text-base">
                  {selectedNotificationForView.channel.toUpperCase()} Dispatch Verification
                </h3>
              </div>
              <button
                onClick={() => setSelectedNotificationForView(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Smartphone Text Message Simulation */}
            {selectedNotificationForView.channel === 'sms' ? (
              <div className="bg-slate-950 border-2 border-slate-800 rounded-3xl p-4 sm:p-5 shadow-inner space-y-3">
                <div className="text-center pb-2 border-b border-slate-800">
                  <div className="text-xs font-bold text-white">AeroWings Priority SMS</div>
                  <div className="text-[10px] text-emerald-400 font-mono">To: {notificationPreferences.smsPhone}</div>
                </div>

                <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-2xl p-4 text-xs text-emerald-100 font-mono space-y-2">
                  <div className="font-bold text-emerald-300">
                    AeroWings Alert: {selectedNotificationForView.title}
                  </div>
                  <p>{selectedNotificationForView.message}</p>
                  <div className="text-[10px] text-emerald-400/80 pt-1">
                    Ref: {selectedNotificationForView.pnr || 'AW-FLT'} • Sent at {new Date(selectedNotificationForView.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ) : (
              /* Email Template Simulation */
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-inner space-y-3">
                <div className="border-b border-slate-800 pb-2.5 text-xs text-slate-300 space-y-1">
                  <div><strong>From:</strong> flight-dispatch@aerowings.com</div>
                  <div><strong>To:</strong> {notificationPreferences.emailAddress}</div>
                  <div><strong>Subject:</strong> {selectedNotificationForView.title}</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-sky-400 font-bold flex items-center justify-center text-xs">
                      AW
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">AeroWings Flight Operations</div>
                      <div className="text-[10px] text-slate-400">Live Passenger Notification System</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed">
                    {selectedNotificationForView.message}
                  </p>

                  <div className="p-3 bg-slate-950 rounded-lg text-xs text-slate-400 space-y-1">
                    <div><strong>Booking PNR:</strong> {selectedNotificationForView.pnr || 'AW-892F1'}</div>
                    <div><strong>Status:</strong> Dispatched via Global Airline Telemetry</div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedNotificationForView(null)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Booking Confirmation Modal */}
      {showCancelModal && selectedBookingForAction && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-white text-base">Cancel Flight Reservation</h3>
              </div>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-3">
              <p>
                Are you sure you want to cancel booking for PNR <span className="font-mono font-bold text-amber-300">{selectedBookingForAction.pnr}</span> ({selectedBookingForAction.flight.origin.city} → {selectedBookingForAction.flight.destination.city})?
              </p>

              {/* Refund calculation breakdown */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Original Total Paid:</span>
                  <span>₹{selectedBookingForAction.priceBreakdown.finalTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-rose-400">
                  <span>Airline Cancellation Fee:</span>
                  <span>- ₹1,500</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-bold border-t border-slate-800 pt-1 text-sm">
                  <span>Instant Refund Amount:</span>
                  <span>₹{Math.max(0, selectedBookingForAction.priceBreakdown.finalTotal - 1500).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Reason for Cancellation</label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Change in travel plans">Change in travel plans</option>
                  <option value="Medical emergency">Medical emergency</option>
                  <option value="Flight schedule conflict">Flight schedule conflict</option>
                  <option value="Other personal reason">Other personal reason</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Keep Booking
              </button>

              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-500/25 transition-colors cursor-pointer"
              >
                Confirm Cancellation & Process Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
