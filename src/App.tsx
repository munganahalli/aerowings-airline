/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AirlineProvider, useAirline } from './context/AirlineContext';
import { Navbar } from './components/common/Navbar';
import { AIVoiceCopilotBar } from './components/common/AIVoiceCopilotBar';
import { AIConciergeChatbot } from './components/common/AIConciergeChatbot';
import { WebsiteFooter } from './components/common/WebsiteFooter';
import { ToastContainer } from './components/common/ToastContainer';
import { MobileBottomNav } from './components/common/MobileBottomNav';

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

// Admin Portal
import { AdminPortal } from './components/admin/AdminPortal';

const MainLayout: React.FC = () => {
  const { portalMode, userView } = useAirline();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white pb-20 lg:pb-0">
      {/* Universal Top Navigation */}
      <Navbar />

      {/* AeroWings AI Voice Copilot & Weather Disruption Bar */}
      <AIVoiceCopilotBar />

      {/* Main Dynamic View Content */}
      <main className="flex-1">
        {portalMode === 'admin' ? (
          <AdminPortal />
        ) : (
          <>
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
          </>
        )}
      </main>

      {/* Global Toast Notification System */}
      <ToastContainer />

      {/* Persistent Mobile and Tablet Bottom Navigation */}
      <MobileBottomNav />

      {/* AeroWings AI Concierge Intelligent Assistant */}
      <AIConciergeChatbot />

      {/* Premier Comprehensive Airline Website Footer */}
      <WebsiteFooter />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AirlineProvider>
        <MainLayout />
      </AirlineProvider>
    </LanguageProvider>
  );
}
