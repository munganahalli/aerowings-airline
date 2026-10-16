import React from 'react';
import { useAirline } from '../../context/AirlineContext';
import { AirlineLogo } from './AirlineLogo';
import { UserView } from '../../types/airline';
import { ShieldCheck, Phone, Mail } from 'lucide-react';

export const WebsiteFooter: React.FC = () => {
  const { setUserView } = useAirline();

  const navigateTo = (view: UserView) => {
    setUserView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs">
      {/* Clean Airline Footer Directory */}
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Mission Column */}
          <div className="space-y-3 md:col-span-1">
            <AirlineLogo size="md" />
            <p className="text-slate-400 text-xs leading-relaxed">
              AeroWings Airlines connects major global and domestic destinations with heartfelt hospitality, modern aircraft, and reliable on-time operations.
            </p>
            <div className="flex items-center gap-1.5 text-slate-300 text-[11px] pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>IATA & DGCA Compliant Airline</span>
            </div>
          </div>

          {/* Quick Booking Navigation */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">
              Book & Manage
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('home')}
                  className="hover:text-blue-400 text-left transition-colors cursor-pointer"
                >
                  Book a Flight
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('flight_status')}
                  className="hover:text-blue-400 text-left transition-colors cursor-pointer"
                >
                  Live Flight Status
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('dashboard')}
                  className="hover:text-blue-400 text-left transition-colors cursor-pointer"
                >
                  Manage My Booking (PNR)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('dashboard')}
                  className="hover:text-blue-400 text-left transition-colors cursor-pointer"
                >
                  Web Check-in & Boarding Pass
                </button>
              </li>
            </ul>
          </div>

          {/* Passenger Information */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">
              Travel Information
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('baggage_guide')}
                  className="hover:text-blue-400 text-left transition-colors cursor-pointer"
                >
                  Baggage Allowances & Rules
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('timetable')}
                  className="hover:text-blue-400 text-left transition-colors cursor-pointer"
                >
                  Flight Schedules & Timetable
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('about')}
                  className="hover:text-blue-400 text-left transition-colors cursor-pointer"
                >
                  About AeroWings Fleet
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('help')}
                  className="hover:text-blue-400 text-left transition-colors cursor-pointer"
                >
                  Special & Medical Assistance
                </button>
              </li>
            </ul>
          </div>

          {/* 24/7 Customer Care & Support */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">
              Customer Support
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-white font-semibold">24/7 Customer Hotline</div>
                  <div className="font-mono text-slate-300">+91 (11) 4920-8000</div>
                  <div className="font-mono text-slate-400 text-[11px]">+1 (800) 555-AERO</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-white font-semibold">Email Support</div>
                  <div className="font-mono text-slate-300">support@aerowings.com</div>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => navigateTo('help')}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Submit Support Inquiry →
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Clean Copyright & Legal Strip */}
      <div className="border-t border-slate-900 py-4 px-4 sm:px-6 lg:px-8 bg-slate-950 text-slate-500 text-[11px]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            © {new Date().getFullYear()} AeroWings Airlines Group S.A. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              type="button"
              onClick={() => navigateTo('about')}
              className="hover:text-slate-200 cursor-pointer"
            >
              Conditions of Carriage
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => navigateTo('help')}
              className="hover:text-slate-200 cursor-pointer"
            >
              Privacy Policy & Terms
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
