import React, { useState } from 'react';
import { useAirline } from '../../context/AirlineContext';
import { airlineDB } from '../../utils/airlineDatabase';
import { Booking } from '../../types/airline';
import { SAMPLE_BOOKINGS } from '../../data/mockData';
import { formatCurrency } from '../../utils/airlineUtils';
import { QRCodeSVG } from 'qrcode.react';
import {
  Ticket,
  Search,
  Download,
  Printer,
  Smartphone,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Plane,
  X,
  User,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface TicketLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TicketLookupModal: React.FC<TicketLookupModalProps> = ({ isOpen, onClose }) => {
  const {
    bookings,
    setCurrentBookingSuccess,
    setUserView,
    currency,
    addToast,
    cancelBooking
  } = useAirline();

  const [searchMode, setSearchMode] = useState<'pnr' | 'phone'>('pnr');
  const [pnrInput, setPnrInput] = useState<string>('');
  const [phoneOrEmailInput, setPhoneOrEmailInput] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Booking[] | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [selectedBookingForPreview, setSelectedBookingForPreview] = useState<Booking | null>(null);

  if (!isOpen) return null;

  const handleSearch = (e?: React.FormEvent, directPnr?: string) => {
    if (e) e.preventDefault();
    setHasSearched(true);

    const pnrToSearch = (directPnr || pnrInput).trim().toUpperCase();

    if (searchMode === 'pnr' || directPnr) {
      if (!pnrToSearch) return;
      const cleanTarget = pnrToSearch.replace(/[^A-Z0-9]/g, '');

      // Check airlineDB, state bookings, and SAMPLE_BOOKINGS
      const allSources: Booking[] = [...bookings, ...SAMPLE_BOOKINGS];
      
      const found = airlineDB.findBookingByPnr(pnrToSearch) || allSources.find(b => {
        const bClean = b.pnr.toUpperCase().replace(/[^A-Z0-9]/g, '');
        const bId = b.id.toUpperCase().replace(/[^A-Z0-9]/g, '');
        const bTicket = (b.ticketNumber || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
        return bClean === cleanTarget || bId === cleanTarget || bTicket === cleanTarget || bClean.includes(cleanTarget) || cleanTarget.includes(bClean);
      });

      if (found) {
        setSearchResults([found]);
        setSelectedBookingForPreview(found);
        addToast(`Voyage found for PNR: ${found.pnr}!`, 'success');
      } else {
        setSearchResults([]);
        setSelectedBookingForPreview(null);
        addToast(`No booking found matching PNR: ${pnrToSearch}`, 'error');
      }
    } else {
      if (!phoneOrEmailInput.trim()) return;
      const cleanQuery = phoneOrEmailInput.trim().toLowerCase();
      const allSources: Booking[] = [...bookings, ...SAMPLE_BOOKINGS];
      
      const matched = allSources.filter(b => {
        const matchEmail = b.contactEmail.toLowerCase().includes(cleanQuery);
        const matchPhone = b.contactPhone.replace(/[^0-9]/g, '').includes(cleanQuery.replace(/[^0-9]/g, ''));
        const matchPax = b.passengers.some(p => `${p.firstName} ${p.lastName}`.toLowerCase().includes(cleanQuery));
        return matchEmail || matchPhone || matchPax;
      });

      const dbResults = airlineDB.findBookingsByPhoneOrEmail(phoneOrEmailInput);
      const combined = Array.from(new Map([...matched, ...dbResults].map(item => [item.pnr, item])).values());

      setSearchResults(combined);
      if (combined.length > 0) {
        setSelectedBookingForPreview(combined[0]);
        addToast(`Found ${combined.length} reservation(s)!`, 'success');
      } else {
        setSelectedBookingForPreview(null);
        addToast(`No bookings found for: ${phoneOrEmailInput}`, 'error');
      }
    }
  };

  const handleOpenFullConfirmation = (booking: Booking) => {
    setCurrentBookingSuccess(booking);
    setUserView('confirmation');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-sky-400 flex items-center justify-center">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Find & Retrieve E-Ticket</h2>
              <p className="text-xs text-slate-400">
                Instantly look up your booking, download PDF boarding pass, or manage reservation
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar / Selector */}
        <div className="p-4 sm:p-6 bg-slate-900/60 border-b border-slate-800 space-y-4">
          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 w-fit">
            <button
              type="button"
              onClick={() => {
                setSearchMode('pnr');
                setSearchResults(null);
                setHasSearched(false);
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                searchMode === 'pnr'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Search by 6-digit PNR
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchMode('phone');
                setSearchResults(null);
                setHasSearched(false);
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                searchMode === 'phone'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Search by Mobile / Email / Name
            </button>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
            {searchMode === 'pnr' ? (
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  placeholder="Enter 6-digit PNR (e.g. AW-892F1 or AW-68213)"
                  value={pnrInput}
                  onChange={(e) => setPnrInput(e.target.value.toUpperCase())}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm font-mono font-bold text-white placeholder:text-slate-500 uppercase focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            ) : (
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  placeholder="Enter Registered Mobile Number (e.g. 9876543210) or Email"
                  value={phoneOrEmailInput}
                  onChange={(e) => setPhoneOrEmailInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap"
            >
              <Search className="w-4 h-4" />
              <span>Retrieve Ticket</span>
            </button>
          </form>

          {/* Quick Click from Recent Bookings */}
          {bookings.length > 0 && !hasSearched && (
            <div className="pt-2">
              <div className="text-[11px] font-semibold text-slate-400 mb-2">Or select from your recent bookings:</div>
              <div className="flex flex-wrap gap-2">
                {bookings.slice(0, 4).map((b) => (
                  <button
                    key={b.pnr}
                    type="button"
                    onClick={() => {
                      setPnrInput(b.pnr);
                      setSearchResults([b]);
                      setSelectedBookingForPreview(b);
                      setHasSearched(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 text-xs text-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <span className="font-mono font-bold text-sky-400">{b.pnr}</span>
                    <span className="text-slate-400">•</span>
                    <span>{b.flight.origin.code} → {b.flight.destination.code}</span>
                    <span className="text-slate-500 text-[10px]">({b.departureDate})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 bg-slate-950/40">
          {searchResults && searchResults.length > 0 ? (
            <div className="space-y-4">
              <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Found {searchResults.length} Confirmed Reservation{searchResults.length > 1 ? 's' : ''}</span>
              </div>

              {searchResults.map((booking) => (
                <div
                  key={booking.pnr}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 space-y-4 transition-all shadow-xl"
                >
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-sky-300 border border-blue-500/30 font-mono font-bold text-xs">
                        PNR: {booking.pnr}
                      </span>
                      <span className="text-xs text-slate-400">
                        Ticket #: <span className="font-mono text-slate-300">{booking.ticketNumber}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        booking.status === 'Confirmed'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : booking.status === 'Checked-in'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>

                  {/* Flight Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    {/* Origin & Destination */}
                    <div className="md:col-span-8 flex items-center justify-between gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <div>
                        <div className="text-xl sm:text-2xl font-black text-white">{booking.flight.origin.code}</div>
                        <div className="text-xs text-slate-400">{booking.flight.origin.city}</div>
                        <div className="text-xs font-mono font-bold text-sky-400 mt-1">{booking.flight.departureTime}</div>
                      </div>

                      <div className="flex-1 flex flex-col items-center px-4">
                        <span className="text-[10px] text-slate-500">{booking.flight.duration} • Non-stop</span>
                        <div className="w-full flex items-center gap-1 my-1">
                          <div className="h-0.5 bg-slate-800 flex-1" />
                          <Plane className="w-4 h-4 text-blue-400 transform rotate-90" />
                          <div className="h-0.5 bg-slate-800 flex-1" />
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{booking.flight.airlineCode} {booking.flight.flightNumber}</span>
                      </div>

                      <div className="text-right">
                        <div className="text-xl sm:text-2xl font-black text-white">{booking.flight.destination.code}</div>
                        <div className="text-xs text-slate-400">{booking.flight.destination.city}</div>
                        <div className="text-xs font-mono font-bold text-sky-400 mt-1">{booking.flight.arrivalTime}</div>
                      </div>
                    </div>

                    {/* Passenger & QR Preview */}
                    <div className="md:col-span-4 bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold">Passenger</div>
                        <div className="text-xs font-bold text-white truncate max-w-[120px]">
                          {booking.passengers[0]?.title} {booking.passengers[0]?.firstName} {booking.passengers[0]?.lastName}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Seat: <strong className="text-amber-400">{booking.passengers[0]?.seatNumber || '12A'}</strong> ({booking.cabinClass})
                        </div>
                      </div>

                      <div className="p-1.5 bg-white rounded-lg">
                        <QRCodeSVG value={`AEROWINGS:${booking.pnr}:${booking.ticketNumber}`} size={56} />
                      </div>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="text-xs text-slate-400">
                      Booked on {booking.bookingDate} • Contact: <span className="text-slate-200">{booking.contactPhone || 'Registered Mobile'}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenFullConfirmation(booking)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Boarding Pass & QR</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUserView('dashboard');
                          onClose();
                        }}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer"
                      >
                        Manage Booking
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : hasSearched ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <Ticket className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">No Bookings Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                We couldn&apos;t find any reservation matching your search. Please verify your 6-digit PNR or mobile number.
              </p>
            </div>
          ) : (
            <div className="py-12 text-center space-y-2">
              <Sparkles className="w-8 h-8 text-sky-400 mx-auto animate-pulse" />
              <h3 className="text-sm font-bold text-white">Enter Your PNR or Mobile Number Above</h3>
              <p className="text-xs text-slate-400">
                Your E-ticket, QR code boarding pass, and flight receipt will appear instantly.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
