import React from 'react';
import { useAirline } from '../../context/AirlineContext';
import { AdminDashboard } from './AdminDashboard';
import { FlightManagement } from './FlightManagement';
import { BookingPassengerRecords } from './BookingPassengerRecords';
import { AdminLoginPage } from './AdminLoginPage';
import {
  LayoutDashboard,
  Plane,
  Ticket,
  LogOut,
  Shield,
  Layers,
  ArrowLeft,
  Sparkles
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const {
    isAdminAuthenticated,
    adminView,
    setAdminView,
    logoutAdmin,
    setPortalMode,
    flights,
    bookings
  } = useAirline();

  if (!isAdminAuthenticated) {
    return <AdminLoginPage />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Admin Top Navigation Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-base">AeroWings Admin Console</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                MASTER ROOT
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Operations • Fleet Dispatch • Financial Ledger
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setAdminView('dashboard')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
              adminView === 'dashboard'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Analytics Dashboard</span>
          </button>

          <button
            onClick={() => setAdminView('flights')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
              adminView === 'flights'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Plane className="w-3.5 h-3.5" />
            <span>Flight Management ({flights.length})</span>
          </button>

          <button
            onClick={() => setAdminView('bookings')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
              adminView === 'bookings'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Bookings & Passengers ({bookings.length})</span>
          </button>
        </div>

        {/* Right Exit / Logout buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPortalMode('user')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Passenger View</span>
          </button>

          <button
            onClick={logoutAdmin}
            className="px-3.5 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-bold rounded-xl border border-rose-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Admin Content Views */}
      {adminView === 'dashboard' && <AdminDashboard />}
      {adminView === 'flights' && <FlightManagement />}
      {adminView === 'bookings' && <BookingPassengerRecords />}
    </div>
  );
};
