import React, { useState } from 'react';
import { useAirline } from '../../context/AirlineContext';
import { airlineDB } from '../../utils/airlineDatabase';
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
  Sparkles,
  X,
  Copy,
  CheckCircle2
} from 'lucide-react';
import { AirlineLogo } from './AirlineLogo';
import { UserView } from '../../types/airline';

export const WebsiteFooter: React.FC = () => {
  const {
    setUserView,
    setPortalMode,
    setAdminView,
    addToast,
    applyPromoCode,
    setSearchParams,
    performSearch,
    searchParams,
    unlockAdminPortal
  } = useAirline();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState<boolean>(() => {
    return localStorage.getItem('aerowings_insider_subscribed') === 'true';
  });
  const [copiedCode, setCopiedCode] = useState(false);
  const [showAdminUnlockModal, setShowAdminUnlockModal] = useState(false);
  const [adminSecretInput, setAdminSecretInput] = useState('');
  const [activeInfoModal, setActiveInfoModal] = useState<{
    title: string;
    badge: string;
    description: string;
    highlights: string[];
    actionLabel?: string;
    actionView?: UserView;
  } | null>(null);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newsletterEmail.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      addToast('Please enter a valid email address to join AeroWings Insider Club', 'error');
      return;
    }

    localStorage.setItem('aerowings_insider_subscribed', 'true');
    localStorage.setItem('aerowings_insider_email', cleanEmail);
    setIsSubscribed(true);
    applyPromoCode('INSIDER20');

    airlineDB.addEmail({
      recipientEmail: cleanEmail,
      sender: 'insider@aerowings.airline.com',
      subject: '✨ Welcome to AeroWings Insider Club — 20% Off Promo Code INSIDER20 Activated!',
      previewText: 'Your VIP Insider Club membership is active! Enjoy 20% off flights with promo code INSIDER20 and zero convenience fees.',
      pnr: 'INSIDER-VIP',
      type: 'PROMO'
    });

    addToast(`🎉 Subscribed ${cleanEmail} to AeroWings Insider Club! Promo code INSIDER20 (20% Off) automatically applied!`, 'success');
  };

  const scrollToTargetOrTop = (targetSectionId?: string) => {
    const attemptScroll = () => {
      if (targetSectionId) {
        const el = document.getElementById(targetSectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return true;
        }
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      return false;
    };

    attemptScroll();
    setTimeout(attemptScroll, 60);
    setTimeout(attemptScroll, 180);
    setTimeout(attemptScroll, 350);
  };

  const navigateTo = (view: UserView, toastMsg?: string, targetSectionId?: string) => {
    setPortalMode('user');
    setUserView(view);
    if (toastMsg) {
      addToast(toastMsg, 'info');
    }
    scrollToTargetOrTop(targetSectionId);
  };

  const navigateToExperience = (
    tab: 'cabins' | 'dining' | 'entertainment' | 'lounges',
    cabin?: 'first' | 'business' | 'premium' | 'economy',
    toastMsg?: string
  ) => {
    setPortalMode('user');
    sessionStorage.setItem('aerowings_experience_tab', tab);
    if (cabin) {
      sessionStorage.setItem('aerowings_experience_cabin', cabin);
    }
    setUserView('experience');
    window.dispatchEvent(new CustomEvent('aerowings_switch_experience_tab', { detail: { tab, cabin } }));
    if (toastMsg) {
      addToast(toastMsg, 'info');
    }
    scrollToTargetOrTop();
  };

  const handleConcessionQuickLaunch = (concessionType: 'student' | 'senior') => {
    setPortalMode('user');
    const nextParams = { ...searchParams, specialFare: concessionType };
    setSearchParams(nextParams);
    setUserView('home');
    addToast(
      concessionType === 'student'
        ? '🎓 Student Concession (10% Off + 25kg Baggage) activated in Flight Search!'
        : '👴 Senior Citizen Concession (12% Off + Priority Boarding) activated in Flight Search!',
      'success'
    );
    scrollToTargetOrTop('flight-search-form');
  };

  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs relative">
      {/* Newsletter & Club Bar */}
      <div className="border-b border-slate-800/80 bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-xs mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AeroWings Insider Club</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
              Subscribe for Secret Fares & Vacation Deals
            </h3>
            <p className="text-slate-400 text-xs max-w-xl">
              Get members-only flash discounts, zero-convenience fee promo codes (<strong className="text-amber-300">INSIDER20</strong>), and travel advisories straight to your inbox.
            </p>
          </div>

          <div className="w-full lg:w-auto">
            {isSubscribed ? (
              <div className="flex flex-col sm:flex-row items-center gap-2.5 bg-emerald-950/50 border border-emerald-500/40 p-3 rounded-2xl">
                <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Insider VIP Active! Promo <strong className="font-mono text-amber-300">INSIDER20</strong> (20% Off) applied.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText('INSIDER20');
                      applyPromoCode('INSIDER20');
                      setCopiedCode(true);
                      addToast('Promo code INSIDER20 copied & applied to your next booking!', 'success');
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copied' : 'Use INSIDER20'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem('aerowings_insider_subscribed');
                      setIsSubscribed(false);
                      setNewsletterEmail('');
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] cursor-pointer"
                  >
                    Change Email
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto lg:mx-0">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 sm:w-72"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
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
              <button 
                onClick={() => navigateTo('home', '✈️ Flight Search & Live Fares Engine ready', 'flight-search-form')} 
                className="hover:text-amber-300 transition-colors cursor-pointer text-left"
              >
                Search Flights & Fares
              </button>
            </li>
            <li>
              <button 
                onClick={() => {
                  navigateTo('dashboard', '📋 Opened Manage My Booking & PNR Hub', 'pnr-lookup-card');
                  window.dispatchEvent(new CustomEvent('aerowings_switch_dashboard_tab', { detail: { tab: 'upcoming', focusPnr: true } }));
                }} 
                className="hover:text-amber-300 transition-colors cursor-pointer text-left"
              >
                Manage My Booking / PNR
              </button>
            </li>
            <li>
              <button 
                onClick={() => {
                  navigateTo('dashboard', '🎫 Opened Web Check-in & Instant Boarding Pass Hub', 'pnr-lookup-card');
                  window.dispatchEvent(new CustomEvent('aerowings_switch_dashboard_tab', { detail: { tab: 'upcoming', focusPnr: true } }));
                }} 
                className="hover:text-amber-300 transition-colors cursor-pointer text-left"
              >
                Web Check-in & Boarding Pass
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('flight_status', '📡 Live ADS-B Satellite Flight Tracker active')} className="hover:text-amber-300 transition-colors cursor-pointer text-left">
                Live Flight Tracker
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('timetable', '🗓️ Global Flight Schedule & Timetable loaded')} className="hover:text-amber-300 transition-colors cursor-pointer text-left">
                Flight Schedule & Timetable
              </button>
            </li>
            <li>
              <button onClick={() => handleConcessionQuickLaunch('student')} className="hover:text-amber-300 transition-colors cursor-pointer text-left text-amber-300/90 font-medium">
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
              <button onClick={() => navigateToExperience('cabins', 'first', '👑 First Class Private Suites')} className="hover:text-amber-300 transition-colors cursor-pointer text-left">
                First Class Private Suites
              </button>
            </li>
            <li>
              <button onClick={() => navigateToExperience('cabins', 'business', '🥂 Business Class 180° Lie-Flat Suites')} className="hover:text-amber-300 transition-colors cursor-pointer text-left">
                Business Class Lie-Flat
              </button>
            </li>
            <li>
              <button onClick={() => navigateToExperience('cabins', 'premium', '✨ Premium & Smart Economy Experience')} className="hover:text-amber-300 transition-colors cursor-pointer text-left">
                Premium & Smart Economy
              </button>
            </li>
            <li>
              <button onClick={() => navigateToExperience('dining', undefined, '🍽️ Curated Gourmet In-Flight Dining')} className="hover:text-amber-300 transition-colors cursor-pointer text-left">
                Gourmet In-Flight Dining
              </button>
            </li>
            <li>
              <button onClick={() => navigateToExperience('entertainment', undefined, '📶 AeroWings Studio & High-Speed Satellite Wi-Fi')} className="hover:text-amber-300 transition-colors cursor-pointer text-left">
                AeroWings Studio & Wi-Fi
              </button>
            </li>
            <li>
              <button onClick={() => navigateToExperience('lounges', undefined, '🏛️ Global Airport Executive Lounges')} className="hover:text-amber-300 transition-colors cursor-pointer text-left">
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
              <button onClick={() => navigateTo('visa_advisor', '🛂 AI Visa & Entry Verifier launched')} className="hover:text-emerald-300 transition-colors cursor-pointer text-left text-emerald-400 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>AI Visa & Entry Verifier</span>
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('weather_ops', '🌩️ AI Doppler Weather Radar & Auto-Refund Center opened')} className="hover:text-sky-300 transition-colors cursor-pointer text-left text-sky-400 font-semibold flex items-center gap-1">
                <span>🌩️ AI Weather Radar & Auto-Refund</span>
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('loyalty', '🏆 SkyWings Frequent Flyer Club & Tier Calculator')} className="hover:text-white transition-colors cursor-pointer text-left text-amber-300 font-semibold">
                SkyWings Frequent Flyer Club
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('baggage_guide', '🧳 Baggage Allowance Calculator opened')} className="hover:text-amber-300 transition-colors cursor-pointer text-left">
                Baggage Allowance Calculator
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('baggage_guide', '⚠️ Restricted & Dangerous Goods Safety Guide', 'dangerous-goods')} className="hover:text-amber-300 transition-colors cursor-pointer text-left">
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
              <button onClick={() => navigateTo('about', '🏢 About AeroWings Aviation Group', 'company-section')} className="hover:text-amber-300 transition-colors cursor-pointer text-left">
                About Our Company
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('about', '✈️ Viewing AeroWings Next-Gen Fleet (A350, B787, A321neo)', 'fleet-section')} className="hover:text-amber-300 transition-colors cursor-pointer text-left">
                Our Fleet (A350, B787, A321)
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('about', '🌿 FlyNet Zero 2050 Sustainable Aviation Fuel Initiative', 'sustainability-section')} className="hover:text-amber-300 transition-colors cursor-pointer text-left">
                FlyNet Zero 2050 Sustainability
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('about', '🛡️ IOSA & DGCA 5-Star Safety Accreditations', 'safety-section')} className="hover:text-amber-300 transition-colors cursor-pointer text-left">
                Safety & IOSA Accreditations
              </button>
            </li>
            <li>
              <button 
                onClick={() => {
                  setPortalMode('admin');
                  setAdminView('dashboard');
                  addToast('🔐 Switched to Flight Operations Admin Portal', 'info');
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
              <button onClick={() => navigateTo('help', '🎧 24/7 Customer Care Desk opened', 'care-desk')} className="hover:text-amber-300 transition-colors cursor-pointer text-left">
                24/7 Customer Care Desk
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('help', '❓ Frequently Asked Questions & Instant Answers', 'faq-section')} className="hover:text-amber-300 transition-colors cursor-pointer text-left">
                Frequently Asked Questions
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('help', '📨 Submit Priority Support Ticket', 'ticket-section')} className="hover:text-amber-300 transition-colors cursor-pointer text-left">
                Submit Support Ticket
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('help', '♿ Special & Medical Mobility Assistance', 'care-desk')} className="hover:text-amber-300 transition-colors cursor-pointer text-left">
                Special & Medical Assistance
              </button>
            </li>
            <li>
              <div className="pt-2 text-slate-300">
                <div className="font-bold text-white">24/7 Hotline:</div>
                <a
                  href="tel:+18005552376"
                  onClick={(e) => {
                    e.preventDefault();
                    navigator.clipboard?.writeText('+1 (800) 555-AERO');
                    addToast('📞 24/7 Concierge Hotline +1 (800) 555-AERO copied! Priority Desk connected.', 'success');
                  }}
                  className="font-mono text-sky-400 hover:text-amber-300 mt-0.5 inline-block cursor-pointer"
                >
                  +1 (800) 555-AERO
                </a>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Certifications & Badges Bar */}
      <div className="border-t border-slate-900 bg-slate-950 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-500">
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => navigateTo('about', '🛡️ IOSA Safety Certified Airline — 100% Audit Score')}
              className="flex items-center gap-1.5 text-slate-300 hover:text-emerald-300 cursor-pointer transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>IOSA Safety Certified Airline</span>
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => navigateTo('experience', '⭐ Skytrax 5-Star World Airline Luxury Standards')}
              className="flex items-center gap-1.5 text-slate-300 hover:text-amber-300 cursor-pointer transition-colors"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>Skytrax 5-Star World Airline</span>
            </button>
            <span>•</span>
            <span className="text-slate-400">IATA Active Member</span>
            <span>•</span>
            <span className="text-slate-400">256-Bit SSL Encrypted Booking Engine</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400">Accepted Payments:</span>
            {['VISA', 'Mastercard', 'Amex', 'UPI / QR', 'Apple Pay'].map((pm) => (
              <button
                key={pm}
                type="button"
                onClick={() => addToast(`💳 ${pm} zero-fee instant checkout is supported on all AeroWings bookings.`, 'info')}
                className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 font-mono text-[10px] border border-slate-800 cursor-pointer transition-colors"
              >
                {pm}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Copyright & Legal */}
      <div className="border-t border-slate-900 py-6 px-4 text-center text-slate-500 text-[11px]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            © {new Date().getFullYear()} AeroWings Airlines Group S.A. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-slate-400 flex-wrap justify-center">
            <button
              type="button"
              onClick={() =>
                setActiveInfoModal({
                  title: 'Conditions of Carriage & Zero-Risk Weather Guarantee',
                  badge: 'IATA / DGCA Passenger Charter',
                  description:
                    'AeroWings Airlines operates under full IATA and DGCA passenger rights compliance, including automated 100% weather disruption refunds and transparent baggage entitlements.',
                  highlights: [
                    '100% Instant Full Refund if weather conditions (storm, fog, cyclone) render any flight unsafe before or after booking.',
                    'Complimentary 7 kg cabin baggage + 15 kg check-in luggage (25 kg for Students) on all domestic and international routes.',
                    'Zero convenience fee and instant PNR / 2D BCBP barcode issuance upon OTP-verified payment.'
                  ],
                  actionLabel: 'View Weather Auto-Refund Center',
                  actionView: 'weather_ops'
                })
              }
              className="hover:text-amber-300 cursor-pointer transition-colors"
            >
              Conditions of Carriage
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() =>
                setActiveInfoModal({
                  title: 'AeroWings Privacy Policy & Data Protection',
                  badge: 'ISO 27001 & GDPR Compliant',
                  description:
                    'Your personal identity documents (Aadhaar, PAN, Passport, Visa) and mobile OTP verifications are encrypted end-to-end using 256-bit TLS security.',
                  highlights: [
                    'Government ID numbers are masked on boarding passes and used strictly for DGCA/IATA gate verification.',
                    'Real-time SMS OTP dispatch is transmitted directly via encrypted telecom gateways.',
                    'Zero third-party data sharing without explicit traveler consent.'
                  ]
                })
              }
              className="hover:text-amber-300 cursor-pointer transition-colors"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() =>
                setActiveInfoModal({
                  title: 'Cookie Settings & Session Preferences',
                  badge: 'Session & Offline Storage Active',
                  description:
                    'AeroWings uses local encrypted browser storage to preserve your live bookings, PNR boarding passes, and Insider Club promo codes even offline.',
                  highlights: [
                    'Essential Booking Cookies: Enabled (Stores active PNR, passenger seats, and verified OTP state).',
                    'Live Telemetry & Weather Cache: Enabled (Syncs Open-Meteo & ADS-B radar every 3 minutes).',
                    'Personalization & Currency Preferences: Enabled (Preserves INR/USD/EUR/AED/GBP selection).'
                  ]
                })
              }
              className="hover:text-amber-300 cursor-pointer transition-colors"
            >
              Cookie Settings
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() =>
                setActiveInfoModal({
                  title: 'Aviation Security & Compliance Accreditations',
                  badge: 'IOSA • PCI-DSS Level 1 • 2FA OTP',
                  description:
                    'Every AeroWings reservation is protected by mandatory 6-digit dynamic mobile OTP authorization and real-time Doppler weather safety telemetry.',
                  highlights: [
                    'Mandatory Dynamic 6-Digit SMS/On-Screen OTP verification for any mobile number prior to ticket issuance.',
                    'Automated AI Self-Healing Debugger monitors and protects booking sessions in real time.',
                    'IOSA Registry Certified & Skytrax 5-Star Aviation Safety Compliance.'
                  ],
                  actionLabel: 'Explore Safety & Fleet',
                  actionView: 'about'
                })
              }
              className="hover:text-amber-300 cursor-pointer transition-colors"
            >
              Security & Compliance
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setShowAdminUnlockModal(true)}
              className="text-slate-600 hover:text-amber-400 cursor-pointer transition-colors"
              title="Authorized Personnel Only"
            >
              🔒 Admin Access
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Legal & Compliance Modal */}
      {activeInfoModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {activeInfoModal.badge}
                </span>
                <h3 className="text-lg font-black text-white mt-1.5">{activeInfoModal.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveInfoModal(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{activeInfoModal.description}</p>
            <ul className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              {activeInfoModal.highlights.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-end gap-2 pt-2">
              {activeInfoModal.actionLabel && activeInfoModal.actionView && (
                <button
                  type="button"
                  onClick={() => {
                    const target = activeInfoModal.actionView!;
                    setActiveInfoModal(null);
                    navigateTo(target);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  {activeInfoModal.actionLabel}
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveInfoModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Secure Admin Unlock Modal */}
      {showAdminUnlockModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/50 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Operations Control Center</h3>
                  <p className="text-[11px] text-slate-400">Restricted Administrator Authorization</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAdminUnlockModal(false);
                  setAdminSecretInput('');
                }}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const ok = unlockAdminPortal(adminSecretInput);
              if (ok) {
                setShowAdminUnlockModal(false);
                setAdminSecretInput('');
              }
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Enter Authorized Admin ID / Number
                </label>
                <input
                  type="password"
                  value={adminSecretInput}
                  onChange={(e) => setAdminSecretInput(e.target.value)}
                  placeholder="Enter secret authorization number..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-500"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminUnlockModal(false);
                    setAdminSecretInput('');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-lg"
                >
                  Authorize & Unlock →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </footer>
  );
};
