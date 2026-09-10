import React, { useState } from 'react';
import { useAirline } from '../../context/AirlineContext';
import { formatCurrency } from '../../utils/airlineUtils';
import { Booking } from '../../types/airline';
import {
  Ticket,
  Search,
  User,
  Plane,
  Download,
  Printer,
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
  Phone,
  CreditCard,
  X,
  FileSpreadsheet
} from 'lucide-react';

export const BookingPassengerRecords: React.FC = () => {
  const {
    bookings,
    cancelBooking,
    checkInBooking,
    currency,
    addToast
  } = useAirline();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Confirmed' | 'Checked-in' | 'Completed' | 'Cancelled'>('All');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const filteredBookings = bookings.filter(b => {
    const matchesQuery =
      b.pnr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.contactEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.flight.flightNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.passengers.some(p => `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()));

    if (statusFilter === 'All') return matchesQuery;
    return matchesQuery && b.status === statusFilter;
  });

  const handleExportCSV = () => {
    const headers = ['PNR', 'TicketNumber', 'FlightNumber', 'Origin', 'Destination', 'Date', 'Passengers', 'TotalPaid', 'Status', 'Email'];
    const rows = filteredBookings.map(b => [
      b.pnr,
      b.ticketNumber,
      b.flight.flightNumber,
      b.flight.origin.code,
      b.flight.destination.code,
      b.departureDate,
      `"${b.passengers.map(p => `${p.firstName} ${p.lastName} (${p.seatNumber || ''})`).join('; ')}"`,
      b.priceBreakdown.finalTotal,
      b.status,
      b.contactEmail
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AeroWings_Bookings_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Exported Bookings Ledger to CSV Spreadsheet', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Ticket className="w-5 h-5 text-amber-400" />
            <span>Passenger Manifest & Booking Ledger</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Global passenger records, automated PNR ticketing logs, and refund settlement audits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by PNR, Passenger Name, Email, or Flight #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1 text-xs">
          {(['All', 'Confirmed', 'Checked-in', 'Completed', 'Cancelled'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                statusFilter === st
                  ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                  : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Records Master Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">PNR / Ticket</th>
                <th className="py-3 px-4">Flight & Route</th>
                <th className="py-3 px-4">Passenger Manifest</th>
                <th className="py-3 px-4">Date & Class</th>
                <th className="py-3 px-4">Fare Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4">
                    <div className="font-mono font-bold text-amber-300 text-sm">{b.pnr}</div>
                    <div className="text-[10px] text-slate-500">{b.ticketNumber}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-white">
                      {b.flight.flightNumber} ({b.flight.origin.code} → {b.flight.destination.code})
                    </div>
                    <div className="text-[10px] text-slate-400">{b.flight.airline}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">
                      {b.passengers[0]?.firstName} {b.passengers[0]?.lastName}
                      {b.passengers.length > 1 && (
                        <span className="text-sky-400 font-bold ml-1">
                          +{b.passengers.length - 1} more
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Seats: {b.passengers.map(p => p.seatNumber || 'Auto').join(', ')}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-white">{b.departureDate}</div>
                    <div className="text-[10px] text-sky-400 uppercase font-semibold">
                      {b.cabinClass.replace('_', ' ')}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                    {formatCurrency(b.priceBreakdown.finalTotal, currency)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        b.status === 'Checked-in'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : b.status === 'Cancelled'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      ● {b.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedBooking(b)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-amber-600/30 text-slate-300 hover:text-amber-300 text-xs font-semibold rounded-lg border border-slate-700 transition-colors cursor-pointer"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Full Inspection Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <div className="text-[11px] text-slate-400 uppercase">Passenger Booking Audit</div>
                <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
                  <span>PNR:</span>
                  <span className="font-mono text-amber-300">{selectedBooking.pnr}</span>
                </h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-sky-400 flex items-center gap-1.5">
                  <Plane className="w-4 h-4" />
                  <span>Flight Segment</span>
                </div>
                <div><strong>Flight:</strong> {selectedBooking.flight.flightNumber} ({selectedBooking.flight.airline})</div>
                <div><strong>Route:</strong> {selectedBooking.flight.origin.city} ({selectedBooking.flight.origin.code}) → {selectedBooking.flight.destination.city} ({selectedBooking.flight.destination.code})</div>
                <div><strong>Departure Date:</strong> {selectedBooking.departureDate} at {selectedBooking.flight.departureTime}</div>
                <div><strong>Cabin Class:</strong> {selectedBooking.cabinClass.toUpperCase()}</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4" />
                  <span>Financial & Payment Details</span>
                </div>
                <div><strong>Total Amount:</strong> {formatCurrency(selectedBooking.priceBreakdown.finalTotal, currency)}</div>
                <div><strong>Payment Method:</strong> {selectedBooking.paymentMethod.toUpperCase()}</div>
                <div><strong>Payment Ref:</strong> {selectedBooking.paymentId}</div>
                <div><strong>Contact:</strong> {selectedBooking.contactEmail}</div>
              </div>
            </div>

            {/* Passenger List in Modal */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
              <div className="font-bold text-white flex items-center gap-1.5">
                <User className="w-4 h-4 text-sky-400" />
                <span>Travelers Manifest ({selectedBooking.passengers.length})</span>
              </div>

              <div className="space-y-2">
                {selectedBooking.passengers.map((p, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">
                        {p.title} {p.firstName} {p.lastName} <span className="text-slate-400 font-normal">({p.gender}, {p.type})</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Meal: {p.meal || 'None'}
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-300 font-mono font-bold border border-emerald-500/20">
                      Seat: {p.seatNumber || 'Auto'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                {selectedBooking.status !== 'Checked-in' && selectedBooking.status !== 'Cancelled' && (
                  <button
                    onClick={() => {
                      checkInBooking(selectedBooking.pnr);
                      setSelectedBooking({ ...selectedBooking, status: 'Checked-in' });
                      addToast(`Checked-in PNR ${selectedBooking.pnr}`, 'success');
                    }}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl"
                  >
                    Force Web Check-in
                  </button>
                )}

                {selectedBooking.status !== 'Cancelled' && (
                  <button
                    onClick={() => {
                      cancelBooking(selectedBooking.pnr, 'Administrative Cancellation');
                      setSelectedBooking({ ...selectedBooking, status: 'Cancelled' });
                    }}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl"
                  >
                    Process Refund & Cancel
                  </button>
                )}
              </div>

              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
