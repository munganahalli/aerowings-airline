import React, { useState } from 'react';
import { useAirline } from '../../context/AirlineContext';
import { Shield, Lock, Mail, ArrowRight, Plane, Sparkles, KeyRound } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { loginAdmin, setPortalMode } = useAirline();
  const [email, setEmail] = useState<string>('admin@aerowings.com');
  const [password, setPassword] = useState<string>('admin123');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginAdmin(email, password);
  };

  const handleQuickDemo = () => {
    setEmail('admin@aerowings.com');
    setPassword('admin123');
    loginAdmin('admin@aerowings.com', 'admin123');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Flight Operations Admin</h1>
          <p className="text-xs text-slate-400">
            Secure administrative access for schedule dispatching, fleet management, and revenue analytics.
          </p>
        </div>

        {/* Quick Demo Fill Button */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div>
            <div className="font-bold text-white">BCA Examiner / Demo Access:</div>
            <div className="text-[11px] text-slate-400 font-mono">admin@aerowings.com / admin123</div>
          </div>
          <button
            type="button"
            onClick={handleQuickDemo}
            className="w-full sm:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>1-Click Instant Enter</span>
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Administrative Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Security Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Shield className="w-4 h-4" />
            <span>Authenticate Admin Portal</span>
          </button>
        </form>

        <div className="pt-2 text-center">
          <button
            onClick={() => setPortalMode('user')}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            ← Return to Passenger Booking Portal
          </button>
        </div>
      </div>
    </div>
  );
};
