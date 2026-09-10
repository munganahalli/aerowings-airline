import React, { useState } from 'react';
import { useAirline } from '../../context/AirlineContext';
import { 
  Plane, 
  Send, 
  Check, 
  ShieldCheck, 
  CreditCard, 
  Globe, 
  Phone, 
  Mail, 
  ExternalLink,
  Award,
  Sparkles
} from 'lucide-react';
import { AirlineLogo } from './AirlineLogo';
import { UserView } from '../../types/airline';

export const WebsiteFooter: React.FC = () => {
  const { setUserView, setPortalMode, setAdminView, showToast } = useAirline();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    setIsSubscribed(true);
    showToast('Subscribed! Check your inbox for exclusive flight offers.', 'success');
  };

  const navigateTo = (view: UserView) => {
    setUserView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs">
      {/* Newsletter & Club Bar */}
      <div className="border-b border-slate-800/80 bg-gradient-to-r from-blue-950/30 via-slate-900 to-indigo-950/30 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 text-sky-400 font-bold uppercase tracking-wider text-xs mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AeroWings Insider Club</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
              Subscribe for Secret Fares & Vacation Deals
            </h3>
            <p className="text-slate-400 text-xs max-w-xl">
              Get members-only flash discounts, zero-convenience fee promo codes, and travel advisories straight to your inbox.
            </p>
          </div>

          <div className="w-full lg:w-auto">
            {isSubscribed ? (
              <div className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-2xl text-xs font-semibold">
                <Check className="w-4 h-4" />
                <span>You're subscribed! Welcome to AeroWings Insider.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto lg:mx-0">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 sm:w-72"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-blue-600/20"
                >
                  <span>Subscribe</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main Multi-Column Website Directory */}
      <div className="max-w-7xl mx-auto pt-10 pb-4 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-900">
        <AirlineLogo size="md" showTagline={true} />
        <div className="text-xs text-slate-400">
          World-Class Global Flight Operations • Connecting 150+ Destinations Across 45 Countries
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
        {/* Col 1: Book & Manage */}
        <div>
          <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-4">Book & Manage</h4>
          <ul className="space-y-2.5">
            <li>
              <button onClick={() => navigateTo('home')} className="hover:text-white transition-colors cursor-pointer text-left">
                Search Flights & Fares
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('dashboard')} className="hover:text-white transition-colors cursor-pointer text-left">
                Manage My Booking / PNR
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('dashboard')} className="hover:text-white transition-colors cursor-pointer text-left">
                Web Check-in & Boarding Pass
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('flight_status')} className="hover:text-white transition-colors cursor-pointer text-left">
                Live Flight Tracker
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('timetable')} className="hover:text-white transition-colors cursor-pointer text-left">
                Flight Schedule & Timetable
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('deals')} className="hover:text-white transition-colors cursor-pointer text-left">
                Special Concessions (Student/Senior)
              </button>
            </li>
          </ul>
        </div>

        {/* Col 2: Travel Experience */}
        <div>
          <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-4">Travel Experience</h4>
          <ul className="space-y-2.5">
            <li>
              <button onClick={() => navigateTo('experience')} className="hover:text-white transition-colors cursor-pointer text-left">
                First Class Private Suites
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('experience')} className="hover:text-white transition-colors cursor-pointer text-left">
                Business Class Lie-Flat
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('experience')} className="hover:text-white transition-colors cursor-pointer text-left">
                Premium & Smart Economy
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('experience')} className="hover:text-white transition-colors cursor-pointer text-left">
                Gourmet In-Flight Dining
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('experience')} className="hover:text-white transition-colors cursor-pointer text-left">
                AeroWings Studio & Wi-Fi
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('experience')} className="hover:text-white transition-colors cursor-pointer text-left">
                Global Airport Lounges
              </button>
            </li>
          </ul>
        </div>

        {/* Col 3: AI Innovations & Baggage */}
        <div>
          <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-4">AI Innovations & Travel</h4>
          <ul className="space-y-2.5">
            <li>
              <button onClick={() => navigateTo('visa_advisor')} className="hover:text-emerald-300 transition-colors cursor-pointer text-left text-emerald-400 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>AI Visa & Entry Verifier</span>
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('weather_ops')} className="hover:text-sky-300 transition-colors cursor-pointer text-left text-sky-400 font-semibold flex items-center gap-1">
                <span>🌩️ AI Weather Radar & Auto-Refund</span>
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('loyalty')} className="hover:text-white transition-colors cursor-pointer text-left text-amber-300 font-semibold">
                SkyWings Frequent Flyer Club
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('baggage_guide')} className="hover:text-white transition-colors cursor-pointer text-left">
                Baggage Allowance Calculator
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('baggage_guide')} className="hover:text-white transition-colors cursor-pointer text-left">
                Restricted & Dangerous Goods
              </button>
            </li>
          </ul>
        </div>

        {/* Col 4: Corporate & About */}
        <div>
          <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-4">About AeroWings</h4>
          <ul className="space-y-2.5">
            <li>
              <button onClick={() => navigateTo('about')} className="hover:text-white transition-colors cursor-pointer text-left">
                About Our Company
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('about')} className="hover:text-white transition-colors cursor-pointer text-left">
                Our Fleet (A350, B787, A321)
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('about')} className="hover:text-white transition-colors cursor-pointer text-left">
                FlyNet Zero 2050 Sustainability
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('about')} className="hover:text-white transition-colors cursor-pointer text-left">
                Safety & IOSA Accreditations
              </button>
            </li>
            <li>
              <button 
                onClick={() => {
                  setPortalMode('admin');
                  setAdminView('dashboard');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }} 
                className="text-sky-400 hover:text-sky-300 font-semibold cursor-pointer text-left"
              >
                Flight Operations Admin Portal
              </button>
            </li>
          </ul>
        </div>

        {/* Col 5: Help & Support */}
        <div>
          <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-4">Help & Support</h4>
          <ul className="space-y-2.5">
            <li>
              <button onClick={() => navigateTo('help')} className="hover:text-white transition-colors cursor-pointer text-left">
                24/7 Customer Care Desk
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('help')} className="hover:text-white transition-colors cursor-pointer text-left">
                Frequently Asked Questions
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('help')} className="hover:text-white transition-colors cursor-pointer text-left">
                Submit Support Ticket
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('help')} className="hover:text-white transition-colors cursor-pointer text-left">
                Special & Medical Assistance
              </button>
            </li>
            <li>
              <div className="pt-2 text-slate-300">
                <div className="font-bold text-white">24/7 Hotline:</div>
                <div className="font-mono text-sky-400 mt-0.5">+1 (800) 555-AERO</div>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Certifications & Badges Bar */}
      <div className="border-t border-slate-900 bg-slate-950 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-500">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>IOSA Safety Certified Airline</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Skytrax 5-Star World Airline</span>
            </span>
            <span>•</span>
            <span className="text-slate-400">IATA Active Member</span>
            <span>•</span>
            <span className="text-slate-400">256-Bit SSL Encrypted Booking Engine</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400">Accepted Payments:</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 font-mono text-[10px] border border-slate-800">VISA</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 font-mono text-[10px] border border-slate-800">Mastercard</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 font-mono text-[10px] border border-slate-800">Amex</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 font-mono text-[10px] border border-slate-800">UPI / QR</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 font-mono text-[10px] border border-slate-800">Apple Pay</span>
          </div>
        </div>
      </div>

      {/* Bottom Copyright & Legal */}
      <div className="border-t border-slate-900 py-6 px-4 text-center text-slate-500 text-[11px]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            © {new Date().getFullYear()} AeroWings Airlines Group S.A. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button onClick={() => navigateTo('help')} className="hover:text-white cursor-pointer">Conditions of Carriage</button>
            <span>•</span>
            <button onClick={() => navigateTo('help')} className="hover:text-white cursor-pointer">Privacy Policy</button>
            <span>•</span>
            <button onClick={() => navigateTo('help')} className="hover:text-white cursor-pointer">Cookie Settings</button>
            <span>•</span>
            <button onClick={() => navigateTo('help')} className="hover:text-white cursor-pointer">Security & Compliance</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
