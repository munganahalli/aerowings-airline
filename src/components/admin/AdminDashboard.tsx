import React from 'react';
import { useAirline } from '../../context/AirlineContext';
import { formatCurrency } from '../../utils/airlineUtils';
import {
  TrendingUp,
  DollarSign,
  Ticket,
  Plane,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    flights,
    bookings,
    currency,
    setAdminView,
    logoutAdmin
  } = useAirline();

  // Compute live operational statistics
  const totalRevenue = bookings
    .filter(b => b.status !== 'Cancelled')
    .reduce((sum, b) => sum + (b.priceBreakdown.finalTotal || 0), 0);

  const totalBookingsCount = bookings.length;
  const activeFlightsCount = flights.filter(f => f.status === 'On Time' || f.status === 'Boarding' || f.status === 'Scheduled').length;
  const checkedInCount = bookings.filter(b => b.status === 'Checked-in').length;
  const cancelledCount = bookings.filter(b => b.status === 'Cancelled').length;

  // Average Occupancy calculation (simulated approx ~78%)
  const occupancyRate = 78.4;
  const onTimePerformance = 96.2;

  // Monthly Revenue Data for visual bar chart
  const monthlyRevenueData = [
    { month: 'Apr', amount: 420000 },
    { month: 'May', amount: 560000 },
    { month: 'Jun', amount: 680000 },
    { month: 'Jul', amount: 820000 },
    { month: 'Aug', amount: 950000 },
    { month: 'Sep (Est)', amount: 1100000 },
  ];

  const maxMonthAmount = Math.max(...monthlyRevenueData.map(d => d.amount));

  return (
    <div className="space-y-6">
      {/* Top Operations Welcome Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>AEROWINGS AIRLINE OPERATIONS & REVENUE CONTROL CENTER</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">
            System Analytics & Dispatch Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time fleet scheduling, passenger passenger capacity, ticketing receipts, and revenue monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAdminView('flights')}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plane className="w-4 h-4" />
            <span>Manage Flights</span>
          </button>
          <button
            onClick={() => setAdminView('bookings')}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Ticket className="w-4 h-4" />
            <span>Passenger Records</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400">
            {formatCurrency(totalRevenue, currency)}
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+18.4% compared to last month</span>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confirmed Bookings</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {totalBookingsCount} Reservations
          </div>
          <div className="text-[11px] text-slate-400">
            {checkedInCount} Checked-in • {cancelledCount} Cancelled
          </div>
        </div>

        {/* Average Occupancy */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Load Factor</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-300">
            {occupancyRate}%
          </div>
          <div className="text-[11px] text-slate-400">
            High passenger capacity utilization
          </div>
        </div>

        {/* Active Flights & Punctuality */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Fleet Today</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Plane className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-300">
            {activeFlightsCount} Flights
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{onTimePerformance}% On-Time Dispatch</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Revenue Bar Trajectory */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Monthly Revenue Trajectory</h3>
              <p className="text-xs text-slate-400">Financial year 2026 booking turnover</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
              Target Surpassed
            </span>
          </div>

          <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2">
            {monthlyRevenueData.map((item, idx) => {
              const heightPercent = Math.round((item.amount / maxMonthAmount) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    ₹{(item.amount / 100000).toFixed(1)}L
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[48px] bg-gradient-to-t from-blue-700 to-sky-400 rounded-t-xl group-hover:from-blue-600 group-hover:to-sky-300 transition-all shadow-md"
                  />
                  <span className="text-[11px] font-bold text-slate-300">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cabin Class & Route Distribution */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white">Cabin Class Load Ratio</h3>
            <p className="text-xs text-slate-400">Share of passenger bookings</p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Economy Class</span>
                <span className="font-bold text-white">68%</span>
              </div>
              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '68%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Premium Economy</span>
                <span className="font-bold text-white">18%</span>
              </div>
              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-sky-400 rounded-full" style={{ width: '18%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Business & First Suites</span>
                <span className="font-bold text-white">14%</span>
              </div>
              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '14%' }} />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 mt-4">
            💡 <strong>Revenue Note:</strong> Business Suites account for 44% of total profit margin despite representing 14% of passenger volume.
          </div>
        </div>
      </div>

      {/* Recent Bookings Feed Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">Live Passenger Reservations Stream</h3>
            <p className="text-xs text-slate-400">Recent bookings recorded across domestic and international routes</p>
          </div>
          <button
            onClick={() => setAdminView('bookings')}
            className="text-xs text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>View All Records ({bookings.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">PNR</th>
                <th className="py-3 px-3">Passenger</th>
                <th className="py-3 px-3">Route</th>
                <th className="py-3 px-3">Flight</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {bookings.slice(0, 5).map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-3 font-mono font-bold text-amber-300">{b.pnr}</td>
                  <td className="py-3 px-3 font-semibold text-white">
                    {b.passengers[0]?.firstName} {b.passengers[0]?.lastName}
                    {b.passengers.length > 1 ? ` (+${b.passengers.length - 1})` : ''}
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    {b.flight.origin.code} → {b.flight.destination.code}
                  </td>
                  <td className="py-3 px-3">{b.flight.flightNumber}</td>
                  <td className="py-3 px-3 text-slate-400">{b.departureDate}</td>
                  <td className="py-3 px-3 font-bold text-emerald-400">
                    {formatCurrency(b.priceBreakdown.finalTotal, currency)}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      b.status === 'Checked-in' ? 'bg-emerald-500/20 text-emerald-300' :
                      b.status === 'Cancelled' ? 'bg-rose-500/20 text-rose-300' : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
