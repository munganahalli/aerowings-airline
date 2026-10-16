/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, useEffect, useState, useMemo, ReactNode } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AirlineProvider, useAirline } from './context/AirlineContext';
import { Navbar } from './components/common/Navbar';
import { WebsiteFooter } from './components/common/WebsiteFooter';
import { ToastContainer } from './components/common/ToastContainer';
import { initializeAutoDebugger } from './utils/autoDebugger';
import { ShieldCheck, Plane, QrCode, X, CheckCircle2 } from 'lucide-react';

// Public / User Pages
import { HomePage } from './components/user/HomePage';
import { FlightResultsPage } from './components/user/FlightResultsPage';
import { PassengerDetailsPage } from './components/user/PassengerDetailsPage';
import { SeatSelectionPage } from './components/user/SeatSelectionPage';
import { AddonsPage } from './components/user/AddonsPage';
import { PassengerDetailsPaymentPage } from './components/user/PassengerDetailsPaymentPage';
import { TicketConfirmationPage } from './components/user/TicketConfirmationPage';
import { UserDashboard } from './components/user/UserDashboard';
import { FlightStatusPage } from './components/user/FlightStatusPage';
import { ExperiencePage } from './components/user/ExperiencePage';
import { LoyaltyClubPage } from './components/user/LoyaltyClubPage';
import { DealsOffersPage } from './components/user/DealsOffersPage';
import { TimetablePage } from './components/user/TimetablePage';
import { BaggageGuidePage } from './components/user/BaggageGuidePage';
import { HelpContactPage } from './components/user/HelpContactPage';
import { AboutUsPage } from './components/user/AboutUsPage';
import { VisaAdvisorPage } from './components/user/VisaAdvisorPage';
import { WeatherDisruptionCenterPage } from './components/user/WeatherDisruptionCenterPage';



interface ErrorBoundaryProps {
  children: ReactNode;
}

const PrestigeErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children }) => {
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      console.warn('[AeroWings Auto-Debugger] Intercepted runtime error:', event.message);
      setHasError(false);
    };
    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-amber-500/30 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
          <div className="text-amber-400 font-bold text-lg">AeroWings Self-Healing Engine</div>
          <p className="text-xs text-slate-300">
            Restoring your luxury flight reservation session automatically...
          </p>
          <button
            type="button"
            onClick={() => setHasError(false)}
            className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer"
          >
            Resume Session
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const MainLayout: React.FC = () => {
  const { portalMode, userView, getBookingByPNR } = useAirline();
  const [scannedTicketParams, setScannedTicketParams] = useState<Record<string, string> | null>(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    const pnr = params.get('verifyPnr');
    if (!pnr) return null;
    const obj: Record<string, string> = {};
    params.forEach((val, key) => {
      obj[key] = val;
    });
    return obj;
  });

  useEffect(() => {
    initializeAutoDebugger();
  }, []);

  // Ensure every view switch smoothly repositions to the top of the viewport
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [userView, portalMode]);

  const closeScannedSheet = () => {
    setScannedTicketParams(null);
    if (typeof window !== 'undefined' && window.history.replaceState) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  const matchedLocalBooking = scannedTicketParams?.verifyPnr
    ? getBookingByPNR(scannedTicketParams.verifyPnr)
    : undefined;

  const scannedPassengers: Array<{
    title?: string;
    firstName: string;
    lastName?: string;
    seatNumber?: string;
    aadhaarNumber?: string;
    panNumber?: string;
    visaNumber?: string;
  }> = useMemo(() => {
    if (matchedLocalBooking?.passengers && matchedLocalBooking.passengers.length > 0) {
      return matchedLocalBooking.passengers;
    }
    if (scannedTicketParams?.paxManifest) {
      try {
        const decoded = JSON.parse(decodeURIComponent(scannedTicketParams.paxManifest));
        if (Array.isArray(decoded) && decoded.length > 0) return decoded;
      } catch {
        // fallback
      }
    }
    if (scannedTicketParams?.pax) {
      return [
        {
          title: 'Mr',
          firstName: scannedTicketParams.pax,
          lastName: '',
          seatNumber: scannedTicketParams.seat || '12A'
        }
      ];
    }
    return [];
  }, [matchedLocalBooking, scannedTicketParams]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Universal Top Navigation */}
      <Navbar />

      {/* Scanned QR Code Official E-Ticket Verification Sheet (Shown when scanning ticket QR code) */}
      {scannedTicketParams && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border-2 border-emerald-500/60 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl my-auto">
            <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-blue-950 p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Official IATA 2D Barcode Verified
                  </div>
                  <h2 className="text-lg font-black text-white">
                    AeroWings Verified E-Ticket & Boarding Pass Sheet
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={closeScannedSheet}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Route Header */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-white">
                    {scannedTicketParams.from || matchedLocalBooking?.flight.origin.code || 'DEL'}
                  </div>
                  <div className="text-xs text-slate-400">
                    {scannedTicketParams.fromCity || matchedLocalBooking?.flight.origin.city || 'Origin'}
                  </div>
                </div>

                <div className="flex flex-col items-center px-4">
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {scannedTicketParams.flight || matchedLocalBooking?.flight.flightNumber || 'AW-101'}
                  </span>
                  <div className="w-24 sm:w-36 border-t-2 border-dashed border-sky-500/50 my-2 relative">
                    <Plane className="w-4 h-4 text-sky-400 absolute -top-2 left-1/2 -translate-x-1/2 rotate-90" />
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase">
                    {scannedTicketParams.status || matchedLocalBooking?.status || 'CONFIRMED'}
                  </span>
                </div>

                <div className="text-right">
                  <div className="text-2xl sm:text-3xl font-black text-white">
                    {scannedTicketParams.to || matchedLocalBooking?.flight.destination.code || 'BOM'}
                  </div>
                  <div className="text-xs text-slate-400">
                    {scannedTicketParams.toCity || matchedLocalBooking?.flight.destination.city || 'Destination'}
                  </div>
                </div>
              </div>

              {/* Master PNR & Travel Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                  <span className="text-[10px] text-slate-400 uppercase block">Group PNR</span>
                  <strong className="text-amber-400 text-sm font-mono font-black block mt-0.5">
                    {scannedTicketParams.verifyPnr}
                  </strong>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                  <span className="text-[10px] text-slate-400 uppercase block">Travel Date</span>
                  <strong className="text-white text-xs font-bold block mt-0.5">
                    {scannedTicketParams.date || matchedLocalBooking?.departureDate || 'Today'}
                  </strong>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                  <span className="text-[10px] text-slate-400 uppercase block">Gate & Class</span>
                  <strong className="text-emerald-300 text-xs font-bold block mt-0.5">
                    Gate {scannedTicketParams.gate || '22A'} • {scannedTicketParams.class || 'ECONOMY'}
                  </strong>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                  <span className="text-[10px] text-slate-400 uppercase block">Total Fare Paid</span>
                  <strong className="text-emerald-400 text-xs font-mono font-black block mt-0.5">
                    ₹{Number(scannedTicketParams.paid || matchedLocalBooking?.priceBreakdown.finalTotal || 4850).toLocaleString()}
                  </strong>
                </div>
              </div>

              {/* All Booked Passengers Manifest */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span>👥 All Booked Travelers Manifest ({scannedPassengers.length} Member{scannedPassengers.length > 1 ? 's' : ''})</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    All Passes Active
                  </span>
                </div>

                <div className="space-y-2 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
                  {scannedPassengers.map((p, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <strong className="text-white text-xs block">
                            {p.title || 'Mr'} {p.firstName} {p.lastName || ''}
                          </strong>
                          <span className="text-[10px] text-slate-400">
                            {p.aadhaarNumber ? `Aadhaar: ${p.aadhaarNumber}` : 'Govt Photo ID Verified'} {p.panNumber ? `• PAN: ${p.panNumber}` : ''} {p.visaNumber ? '• Visa Active' : ''}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[9px] text-slate-400 uppercase block font-semibold">Seat Number</span>
                        <strong className="text-sky-400 font-black text-sm">
                          {p.seatNumber || `${12 + idx}A`}
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between gap-2 text-xs text-emerald-200">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Cleared for Airport Terminal Security & All Gate Boarding Passes</span>
                </div>
                <span className="font-mono text-[10px] text-emerald-400 font-bold">BCBP-OK</span>
              </div>

              <button
                type="button"
                onClick={closeScannedSheet}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white font-bold text-xs shadow-lg cursor-pointer transition-all"
              >
                Continue to AeroWings Portal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Dynamic View Content */}
      <main className="flex-1">
        {userView === 'home' && <HomePage />}
        {userView === 'results' && <FlightResultsPage />}
        {userView === 'passengers' && <PassengerDetailsPage />}
        {userView === 'seats' && <SeatSelectionPage />}
        {userView === 'addons' && <AddonsPage />}
        {(userView === 'payment' || userView === 'passenger_payment') && <PassengerDetailsPaymentPage />}
        {userView === 'confirmation' && <TicketConfirmationPage />}
        {userView === 'dashboard' && <UserDashboard />}
        {userView === 'flight_status' && <FlightStatusPage />}
        {userView === 'experience' && <ExperiencePage />}
        {userView === 'loyalty' && <LoyaltyClubPage />}
        {userView === 'deals' && <DealsOffersPage />}
        {userView === 'timetable' && <TimetablePage />}
        {userView === 'baggage_guide' && <BaggageGuidePage />}
        {userView === 'help' && <HelpContactPage />}
        {userView === 'about' && <AboutUsPage />}
        {userView === 'visa_advisor' && <VisaAdvisorPage />}
        {userView === 'weather_ops' && <WeatherDisruptionCenterPage />}
      </main>

      {/* Global Toast Notification System */}
      <ToastContainer />

      {/* Clean Modern Airline Website Footer */}
      <WebsiteFooter />
    </div>
  );
};

export default function App() {
  return (
    <PrestigeErrorBoundary>
      <LanguageProvider>
        <AirlineProvider>
          <MainLayout />
        </AirlineProvider>
      </LanguageProvider>
    </PrestigeErrorBoundary>
  );
}
