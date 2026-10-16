import React, { useEffect, useRef, useState } from 'react';
import { useAirline } from '../../context/AirlineContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrency } from '../../utils/airlineUtils';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { downloadTicketBlob, downloadHtmlTicket, printTicketDocument } from '../../utils/ticketDownloadGenerator';
import { airlineDB } from '../../utils/airlineDatabase';
import { getAirportWeatherImmediate, fetchLiveAirportWeather, RealtimeAirportWeather } from '../../utils/realtimeWeather';
import {
  CheckCircle2,
  Download,
  Printer,
  Mail,
  Share2,
  Plane,
  Calendar,
  CalendarPlus,
  Clock,
  MapPin,
  Luggage,
  User,
  Ticket,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  QrCode,
  Sparkles,
  Zap,
  Volume2,
  Check,
  Copy,
  FileText,
  CreditCard,
  Wifi,
  Utensils,
  ExternalLink,
  Code,
  Phone,
  CloudSun,
  X,
  Radio,
  Eye,
  Wind,
  AlertTriangle,
  RotateCcw,
  ShieldAlert
} from 'lucide-react';
import { GoogleMapsGroundingModal } from '../common/GoogleMapsGroundingModal';

export const TicketConfirmationPage: React.FC = () => {
  const {
    currentBookingSuccess,
    setCurrentBookingSuccess,
    setUserView,
    currency,
    addToast,
    checkInBooking,
    userProfile,
    aiAutoCancelFlight,
    triggerWeatherDisruption,
    resetDefaultFlights,
    setBookings,
    instantWeatherRefund
  } = useAirline();
  const { t } = useLanguage();

  const ticketRef = useRef<HTMLDivElement>(null);
  const [activePassengerIdx, setActivePassengerIdx] = useState<number>(0);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [qrEncodeMode, setQrEncodeMode] = useState<'text' | 'url'>('text');
  const [showCalendarMenu, setShowCalendarMenu] = useState<boolean>(false);
  const [showMapsModal, setShowMapsModal] = useState<boolean>(false);
  const [copiedPnr, setCopiedPnr] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);

  // Subscribe for Secret Fares & Vacation Deals (until should not)
  const [hasSubscribedSecretDeals, setHasSubscribedSecretDeals] = useState<boolean>(() => {
    return localStorage.getItem('aerowings_secret_deals_subscribed') === 'true';
  });
  const [dismissedSecretDeals, setDismissedSecretDeals] = useState<boolean>(false);
  const [secretEmail, setSecretEmail] = useState<string>('');
  const [secretSubscribedAnim, setSecretSubscribedAnim] = useState<boolean>(false);

  // Origin & Destination route real-time weather
  const [originWeather, setOriginWeather] = useState<RealtimeAirportWeather | null>(null);
  const [destWeather, setDestWeather] = useState<RealtimeAirportWeather | null>(null);
  const [isAutoCancelled, setIsAutoCancelled] = useState<boolean>(false);
  const [cancellationNotice, setCancellationNotice] = useState<string | null>(null);
  const [refundProcessed, setRefundProcessed] = useState<boolean>(false);

  // Trigger celebration confetti on mount and initialize weather
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#38bdf8', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
      });
    } catch (e) {
      // ignore
    }

    if (currentBookingSuccess) {
      const email = currentBookingSuccess.contactEmail || userProfile?.email || '';
      setSecretEmail(email);

      const cancelledNow =
        currentBookingSuccess.status === 'Cancelled' ||
        currentBookingSuccess.flight.status === 'Cancelled';
      setIsAutoCancelled(cancelledNow);
      setCancellationNotice(
        currentBookingSuccess.cancellationReason ||
          (cancelledNow ? 'Grounded due to severe weather conditions.' : null)
      );
      setRefundProcessed(currentBookingSuccess.refundStatus === 'Processed' || cancelledNow);

      // Load origin and destination weather
      const origCode = currentBookingSuccess.flight.origin.code;
      const destCode = currentBookingSuccess.flight.destination.code;
      setOriginWeather(getAirportWeatherImmediate(origCode));
      setDestWeather(getAirportWeatherImmediate(destCode));

      Promise.all([
        fetchLiveAirportWeather(origCode),
        fetchLiveAirportWeather(destCode)
      ]).then(([origW, destW]) => {
        if (origW) setOriginWeather(origW);
        if (destW) setDestWeather(destW);
      });
    }
  }, [currentBookingSuccess, userProfile]);

  // Listen to global weather updates so if weather turns bad after booking, ticket auto-cancels immediately
  useEffect(() => {
    const handleWeatherUpdate = () => {
      if (!currentBookingSuccess) return;
      const origW = getAirportWeatherImmediate(currentBookingSuccess.flight.origin.code);
      const destW = getAirportWeatherImmediate(currentBookingSuccess.flight.destination.code);
      setOriginWeather(origW);
      setDestWeather(destW);
      if (origW.flightSafetyStatus === 'SEVERE_IFR' || destW.flightSafetyStatus === 'SEVERE_IFR') {
        const badHub = origW.flightSafetyStatus === 'SEVERE_IFR' ? origW : destW;
        const reason = `AI Automated Doppler Weather Protection: Ticket Auto-Cancelled due to ${badHub.conditionText} at ${badHub.cityName} (${badHub.airportCode}). 100% Instant Refund Credited.`;
        setIsAutoCancelled(true);
        setCancellationNotice(reason);
        setRefundProcessed(true);
      }
    };
    window.addEventListener('aerowings_weather_updated', handleWeatherUpdate);
    return () => window.removeEventListener('aerowings_weather_updated', handleWeatherUpdate);
  }, [currentBookingSuccess]);

  if (!currentBookingSuccess) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-sky-400">
          <Ticket className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">No Active Confirmation Found</h2>
        <p className="text-xs text-slate-400">View all your confirmed flights in My Bookings Hub.</p>
        <button
          onClick={() => setUserView('dashboard')}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/25 cursor-pointer"
        >
          Go to My Bookings Hub
        </button>
      </div>
    );
  }

  const booking = currentBookingSuccess;
  const flight = booking.flight;
  const currentPassenger = booking.passengers[activePassengerIdx] || booking.passengers[0];
  const assignedSeat = currentPassenger?.seatNumber || '12A';
  const paxFullName = `${currentPassenger.title} ${currentPassenger.firstName} ${currentPassenger.lastName}`.trim();
  const effectiveStatus = isAutoCancelled ? 'CANCELLED (100% REFUNDED)' : booking.status.toUpperCase();

  const handleSimulateBadWeather = (weatherCondition: 'Heavy Thunderstorm' | 'Dense Fog' | 'Typhoon / Cyclone' = 'Typhoon / Cyclone') => {
    const reason = `AI Automated Flight & Ticket Cancellation: Severe ${weatherCondition} & Low Visibility at ${flight.destination.city} (${flight.destination.code}). Ticket Auto-Cancelled with 100% Instant Full Refund of ${formatCurrency(booking.priceBreakdown.finalTotal, currency)}.`;
    setIsAutoCancelled(true);
    setCancellationNotice(reason);
    setRefundProcessed(true);

    triggerWeatherDisruption(flight.destination.code, weatherCondition, 'severe');

    if (flight?.id && aiAutoCancelFlight) {
      aiAutoCancelFlight(flight.id, reason);
    }

    const updatedBooking = {
      ...booking,
      status: 'Cancelled' as const,
      cancellationReason: reason,
      refundAmount: booking.priceBreakdown.finalTotal,
      refundStatus: 'Processed' as const
    };
    setCurrentBookingSuccess(updatedBooking);

    setBookings((prev: any[]) =>
      prev.map((b) => (b.id === booking.id || b.pnr === booking.pnr ? updatedBooking : b))
    );

    addToast(`🚨 Weather Alert (${weatherCondition}): Ticket ${booking.pnr} automatically cancelled for safety! 100% Instant Refund of ${formatCurrency(booking.priceBreakdown.finalTotal, currency)} credited.`, 'error');
  };

  const handleRestoreSafeWeather = () => {
    resetDefaultFlights();
    setIsAutoCancelled(false);
    setCancellationNotice(null);
    const restoredBooking = {
      ...booking,
      status: 'Confirmed' as const,
      cancellationReason: undefined,
      refundStatus: 'Not Applicable' as const
    };
    setCurrentBookingSuccess(restoredBooking);
    setBookings((prev: any[]) =>
      prev.map((b) => (b.id === booking.id || b.pnr === booking.pnr ? restoredBooking : b))
    );
    addToast('☀️ Weather cleared! Ticket restored to Confirmed status.', 'success');
  };

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://aerowings.airline.com';
  const paxManifestParam = encodeURIComponent(
    JSON.stringify(
      booking.passengers.map((p, i) => ({
        index: i + 1,
        title: p.title || 'Mr',
        firstName: p.firstName,
        lastName: p.lastName,
        seatNumber: p.seatNumber || `${12 + i}${['A', 'B', 'C', 'D', 'E', 'F'][i % 6]}`,
        aadhaarNumber: p.aadhaarNumber || 'Verified',
        panNumber: p.panNumber || '',
        visaNumber: p.visaNumber || ''
      }))
    )
  );

  const qrVerificationUrl = `${originUrl}/?verifyPnr=${encodeURIComponent(booking.pnr)}&pax=${encodeURIComponent(paxFullName)}&flight=${encodeURIComponent(`${flight.airlineCode || 'AW'}-${flight.flightNumber}`)}&from=${encodeURIComponent(flight.origin.code)}&fromCity=${encodeURIComponent(flight.origin.city)}&to=${encodeURIComponent(flight.destination.code)}&toCity=${encodeURIComponent(flight.destination.city)}&date=${encodeURIComponent(booking.departureDate)}&time=${encodeURIComponent(flight.departureTime)}&seat=${encodeURIComponent(assignedSeat)}&gate=${encodeURIComponent(flight.gate || '22A')}&class=${encodeURIComponent(booking.cabinClass.toUpperCase())}&status=${encodeURIComponent(effectiveStatus)}&paid=${encodeURIComponent(String(booking.priceBreakdown.finalTotal))}&paxManifest=${paxManifestParam}`;

  const allPassengersManifest = booking.passengers.map((p, idx) => `[Pax ${idx + 1}: ${p.title || 'Mr'} ${p.firstName} ${p.lastName} | Seat: ${p.seatNumber || 'Auto'} | Aadhaar: ${p.aadhaarNumber || 'N/A'}]`).join('\n');
  const qrReadableText = [
    `AEROWINGS OFFICIAL MASTER E-TICKET (${booking.passengers.length} TRAVELERS)`,
    `PNR: ${booking.pnr} (${effectiveStatus})`,
    `FLIGHT: ${flight.airlineCode || 'AW'}-${flight.flightNumber} (${flight.origin.code} -> ${flight.destination.code})`,
    `DATE: ${booking.departureDate} | DEP: ${flight.departureTime} | GATE: ${flight.gate || '22A'} | CLASS: ${booking.cabinClass.toUpperCase()}`,
    `PASSENGERS MANIFEST:`,
    allPassengersManifest,
    `TOTAL GROUP PAID: INR ${booking.priceBreakdown.finalTotal.toLocaleString()}`
  ].join('\n');

  const qrCodeData = qrEncodeMode === 'url' ? qrVerificationUrl : qrReadableText;

  const handleDownloadAllPassengersPDF = async () => {
    setDownloading(true);
    addToast(`Generating Master E-Tickets & Boarding Passes for all ${booking.passengers.length} passenger(s)...`, 'info');

    try {
      const success = downloadTicketBlob(booking, undefined); // undefined triggers all passengers
      if (success) {
        addToast(`✅ All ${booking.passengers.length} Passenger Tickets (PNR: ${booking.pnr}) downloaded!`, 'success');
      } else {
        downloadHtmlTicket(booking, undefined);
        addToast('Downloaded offline E-ticket format for all passengers.', 'info');
      }
    } catch (err) {
      console.error('PDF download error', err);
      downloadHtmlTicket(booking, undefined);
      addToast('Downloaded offline E-tickets.', 'success');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadSelectedPDF = async () => {
    setDownloading(true);
    addToast(`Generating Boarding Pass for ${currentPassenger.firstName} ${currentPassenger.lastName}...`, 'info');

    try {
      const success = downloadTicketBlob(booking, activePassengerIdx);
      if (success) {
        addToast(`✅ Passenger ${activePassengerIdx + 1} Ticket downloaded!`, 'success');
      } else {
        downloadHtmlTicket(booking, activePassengerIdx);
      }
    } catch (err) {
      downloadHtmlTicket(booking, activePassengerIdx);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadHTML = () => {
    downloadHtmlTicket(booking, undefined);
    addToast(`✅ Standalone Offline E-Tickets for all travelers saved (PNR: ${booking.pnr})`, 'success');
  };

  const handlePrint = () => {
    addToast('Preparing official boarding pass printout...', 'info');
    const printed = printTicketDocument(booking, activePassengerIdx);
    if (printed) {
      addToast('Print dialog opened for boarding pass.', 'success');
    }
  };

  const handleCopyPNR = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(booking.pnr);
      setCopiedPnr(true);
      addToast(`PNR "${booking.pnr}" copied to clipboard`, 'success');
      setTimeout(() => setCopiedPnr(false), 2000);
    }
  };

  const handleSubscribeSecretDeals = (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretEmail || !secretEmail.includes('@')) {
      addToast('Please enter a valid email address for secret fares', 'error');
      return;
    }
    localStorage.setItem('aerowings_secret_deals_subscribed', 'true');
    setSecretSubscribedAnim(true);

    // Send secret email
    if (secretEmail) {
      airlineDB.addEmail({
        recipientEmail: secretEmail,
        sender: 'secretfares@aerowings.airline.com',
        subject: `🎉 Secret Fares & Vacation Deals Passport [Promo: SECRET25]`,
        previewText: `Exclusive member fares unlocked. 25% off coupon code SECRET25 is now active on your account.`,
        pnr: booking.pnr,
        type: 'PROMO'
      });
    }

    addToast('Subscribed! Secret promo code SECRET25 has been registered.', 'success');

    setTimeout(() => {
      setHasSubscribedSecretDeals(true);
    }, 2800);
  };

  const smsBody = `✈️ AeroWings E-Ticket Confirmation\nPNR: ${booking.pnr}\nFlight: ${flight.flightNumber} (${flight.origin.code} ➔ ${flight.destination.code})\nDate: ${booking.departureDate} | Time: ${flight.departureTime}\nPassenger: ${currentPassenger.firstName} ${currentPassenger.lastName}\nSeat: ${assignedSeat} | Gate: ${flight.gate || '22A'}\nTotal Paid: ${formatCurrency(booking.priceBreakdown.finalTotal, currency)}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fadeIn pb-24 sm:pb-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-white">{t('confirm.title', 'Booking Confirmed!')}</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {booking.passengers.length} {t('passenger.traveler', 'Passenger')}{booking.passengers.length > 1 ? 's' : ''} {t('common.verified', 'Verified')}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {t('confirm.subtitle', 'E-Tickets & Boarding Passes issued for')} {t('confirm.pnr', 'PNR')} <span className="font-mono font-bold text-sky-400">{booking.pnr}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons: Download All Passengers & Print */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
          <button
            type="button"
            onClick={handleDownloadAllPassengersPDF}
            disabled={downloading}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/25 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? t('common.loading') : `${t('confirm.downloadPdf', 'Download Tickets')} (${booking.passengers.length} PAX PDF)`}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadHTML}
            className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Download offline HTML Boarding Passes for all"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Offline HTML</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('confirm.printTicket', 'Print')}</span>
          </button>
        </div>
      </div>

      {/* Live Flight Weather Condition & Automatic Cancellation Safety Protocol */}
      <div className={`rounded-3xl p-5 sm:p-6 border transition-all ${
        isAutoCancelled
          ? 'bg-rose-950/40 border-rose-500/60 shadow-2xl shadow-rose-950/50'
          : 'bg-slate-900/95 border-amber-500/30 shadow-xl'
      }`}>
        {isAutoCancelled ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
                  <ShieldAlert className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-500/25 text-rose-300 border border-rose-500/40">
                      Automated Weather Safety Protocol
                    </span>
                    <span className="text-xs text-rose-300 font-mono font-bold">
                      Status: CANCELLED (100% REFUNDED)
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white mt-1">
                    Flight Automatically Cancelled Due to Adverse Weather Conditions
                  </h3>
                  <p className="text-xs text-rose-200 mt-1 max-w-2xl leading-relaxed">
                    {cancellationNotice || `Severe atmospheric disturbance (Dangerous Cyclonic Crosswinds & Low Visibility) detected along flight route. Under AeroWings Prestige safety regulations, flight ${flight.flightNumber} has been automatically cancelled to safeguard all passengers.`}
                  </p>
                </div>
              </div>
            </div>

            {/* Instant Refund Confirmation */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>100% Instant Full Refund Executed</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Full booking amount of <strong className="text-amber-300 font-bold">{formatCurrency(booking.priceBreakdown.finalTotal, currency)}</strong> has been automatically credited back to your payment method.
                </p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Refund Reference: REF-AW-{booking.pnr}-WEATHER
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleRestoreSafeWeather}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>☀️ Restore Clear Weather</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUserView('home')}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-950/40 cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Rebook Next Safe Flight</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <CloudSun className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Live Flight Weather Safety Radar & Auto-Cancel Protection
                  </span>
                  <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Safe to Fly
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Flight route {flight.origin.city} ({flight.origin.code}) → {flight.destination.city} ({flight.destination.code}): If any weather condition goes wrong, our AI automatically cancels the ticket with 100% instant full refund.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <button
                type="button"
                onClick={() => handleSimulateBadWeather('Heavy Thunderstorm')}
                className="px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                title="Test automated ticket cancellation for Heavy Thunderstorm"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>⛈️ Test Storm Auto-Cancel</span>
              </button>
              <button
                type="button"
                onClick={() => handleSimulateBadWeather('Dense Fog')}
                className="px-3 py-2 rounded-xl bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500/40 text-amber-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                title="Test automated ticket cancellation for Zero-Visibility Fog"
              >
                <span>🌫️ Test Fog Auto-Cancel</span>
              </button>
              <button
                type="button"
                onClick={() => handleSimulateBadWeather('Typhoon / Cyclone')}
                className="px-3 py-2 rounded-xl bg-red-950/70 hover:bg-red-900/90 border border-red-500/50 text-red-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                title="Test automated ticket cancellation for Super Cyclone"
              >
                <span>🌀 Test Cyclone Auto-Cancel</span>
              </button>
            </div>
          </div>
        )}
      </div>



      {/* Real-Time Route Weather Telemetry: Origin & Destination */}
      {(originWeather || destWeather) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {originWeather && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <CloudSun className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>Departure: {originWeather.cityName} ({originWeather.airportCode})</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      originWeather.flightSafetyStatus === 'OPTIMAL_VFR'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : originWeather.flightSafetyStatus === 'SEVERE_IFR'
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {originWeather.flightSafetyStatus === 'OPTIMAL_VFR' ? 'Optimal Flight Weather' : originWeather.conditionText}
                    </span>
                  </div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    {originWeather.temperatureC}°C ({originWeather.temperatureF}°F) • {originWeather.conditionText} • Wind: {originWeather.windSpeedKmh} km/h • Vis: {originWeather.visibilityKm} km
                  </div>
                </div>
              </div>
              <div className="text-[11px] font-mono text-slate-300 whitespace-nowrap">
                <span className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800">
                  {originWeather.runwayAdvisory}
                </span>
              </div>
            </div>
          )}

          {destWeather && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <CloudSun className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>Arrival: {destWeather.cityName} ({destWeather.airportCode})</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      destWeather.flightSafetyStatus === 'OPTIMAL_VFR'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : destWeather.flightSafetyStatus === 'SEVERE_IFR'
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {destWeather.flightSafetyStatus === 'OPTIMAL_VFR' ? 'Optimal Flight Weather' : destWeather.conditionText}
                    </span>
                  </div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    {destWeather.temperatureC}°C ({destWeather.temperatureF}°F) • {destWeather.conditionText} • Wind: {destWeather.windSpeedKmh} km/h • Vis: {destWeather.visibilityKm} km
                  </div>
                </div>
              </div>
              <div className="text-[11px] font-mono text-slate-300 whitespace-nowrap">
                <span className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800">
                  {destWeather.runwayAdvisory}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Multi-Passenger Selector Tab */}
      <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-bold text-slate-400 whitespace-nowrap">View Boarding Pass:</span>
          {booking.passengers.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActivePassengerIdx(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activePassengerIdx === idx
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{idx + 1}. {p.title} {p.firstName} {p.lastName}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800/80 text-sky-300">
                Seat {p.seatNumber || 'Auto'}
              </span>
            </button>
          ))}
        </div>

        {booking.passengers.length > 1 && (
          <button
            type="button"
            onClick={handleDownloadSelectedPDF}
            disabled={downloading}
            className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Pax {activePassengerIdx + 1} Only</span>
          </button>
        )}
      </div>

      {/* Main E-Ticket Display Card */}
      <div
        ref={ticketRef}
        className="bg-slate-900 border-2 border-blue-500/40 rounded-3xl overflow-hidden shadow-2xl space-y-0"
      >
        {/* Ticket Header */}
        <div className="bg-gradient-to-r from-slate-950 via-blue-950/60 to-slate-950 p-5 sm:p-6 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-white text-lg shadow-lg">
              {flight.airlineCode || 'AW'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                  {flight.airline.toUpperCase()} BOARDING PASS
                </h2>
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-sky-300 font-mono text-xs font-bold border border-blue-500/30">
                  {booking.cabinClass.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-400">Electronic Ticket & IATA Passenger Itinerary</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase">Booking Reference</div>
              <div className="text-lg font-mono font-black text-sky-400 tracking-wider flex items-center gap-1.5">
                <span>{booking.pnr}</span>
                <button
                  type="button"
                  onClick={handleCopyPNR}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Copy PNR"
                >
                  {copiedPnr ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Flight Route & Timings */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-900/60 border-b border-slate-800">
          {/* Origin */}
          <div className="md:col-span-4 text-left">
            <span className="text-3xl sm:text-4xl font-black text-white block">{flight.origin.code}</span>
            <span className="text-sm font-semibold text-slate-200 block mt-0.5">{flight.origin.city}</span>
            <span className="text-xs text-slate-400 block">{flight.origin.name}</span>
            <div className="mt-3 inline-block px-3 py-1 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-xs font-mono font-bold text-sky-300">{flight.departureTime}</span>
              <span className="text-[10px] text-slate-400 ml-1.5">• Terminal {flight.terminal || 'T3'}</span>
            </div>
          </div>

          {/* Flight Path Graphic */}
          <div className="md:col-span-4 flex flex-col items-center justify-center text-center py-2">
            <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
              <Plane className="w-4 h-4" />
              <span>{flight.airlineCode || 'AW'}{flight.flightNumber}</span>
            </span>
            <div className="w-full flex items-center gap-2 my-2">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <div className="flex-1 border-t-2 border-dashed border-slate-700 relative">
                <Plane className="w-3.5 h-3.5 text-sky-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90" />
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <span className="text-[11px] text-slate-400">{flight.duration} • Non-Stop Flight</span>
            <span className="text-[10px] text-slate-500">{booking.departureDate}</span>
          </div>

          {/* Destination */}
          <div className="md:col-span-4 text-right">
            <span className="text-3xl sm:text-4xl font-black text-white block">{flight.destination.code}</span>
            <span className="text-sm font-semibold text-slate-200 block mt-0.5">{flight.destination.city}</span>
            <span className="text-xs text-slate-400 block">{flight.destination.name}</span>
            <div className="mt-3 inline-block px-3 py-1 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-xs font-mono font-bold text-emerald-300">{flight.arrivalTime}</span>
              <span className="text-[10px] text-slate-400 ml-1.5">• Terminal {flight.destination.terminal || 'T2'}</span>
            </div>
          </div>
        </div>

        {/* Passenger, Seat & QR Code Section */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-950/40">
          <div className="md:col-span-8 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Passenger Name</span>
                <div className="text-xs sm:text-sm font-extrabold text-white mt-1 uppercase">
                  {currentPassenger.title} {currentPassenger.firstName} {currentPassenger.lastName}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Assigned Seat</span>
                <div className="text-sm sm:text-lg font-black text-sky-400 mt-0.5">
                  {assignedSeat}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Boarding Gate</span>
                <div className="text-sm sm:text-lg font-black text-amber-400 mt-0.5">
                  {flight.gate || '22A'}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">E-Ticket Number</span>
                <div className="text-xs font-mono font-bold text-slate-300 mt-1">
                  {booking.ticketNumber}-{activePassengerIdx + 1}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Baggage Allowance</span>
                <div className="text-xs font-bold text-slate-300 mt-1">
                  7kg Cabin + 15kg Luggage
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Paid</span>
                <div className="text-xs font-mono font-black text-emerald-400 mt-1">
                  {formatCurrency(booking.priceBreakdown.finalTotal, currency)}
                </div>
              </div>
            </div>

            {/* Verified Personal Details Card */}
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-2 flex-wrap text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-bold text-slate-300">Verified IDs:</span>
              </div>
              <div className="flex items-center gap-3 font-mono text-[11px] text-slate-300 flex-wrap">
                {currentPassenger.aadhaarNumber && (
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700">
                    Aadhaar: •••• {currentPassenger.aadhaarNumber.slice(-4)}
                  </span>
                )}
                {currentPassenger.panNumber && (
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                    PAN: {currentPassenger.panNumber}
                  </span>
                )}
                {currentPassenger.visaNumber && (
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-300 border border-slate-700">
                    Visa: {currentPassenger.visaNumber} ({currentPassenger.visaStatus || 'Valid'})
                  </span>
                )}
                {!currentPassenger.aadhaarNumber && !currentPassenger.panNumber && !currentPassenger.visaNumber && (
                  <span className="text-emerald-400 font-sans">● Photo ID Verified for Boarding</span>
                )}
              </div>
            </div>
          </div>

          {/* QR Code Barcode Box */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2.5">
            <div className="flex items-center gap-1 text-[10px] bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setQrEncodeMode('text')}
                className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-all ${
                  qrEncodeMode === 'text' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                📄 Instant Scan Pass
              </button>
              <button
                type="button"
                onClick={() => setQrEncodeMode('url')}
                className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-all ${
                  qrEncodeMode === 'url' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                📱 Web Verify Link
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="p-3 bg-white rounded-2xl shadow-xl hover:scale-105 transition-transform cursor-pointer group relative"
              title="Click to Scan / Verify E-Ticket QR Code"
            >
              <QRCodeSVG
                value={qrCodeData}
                size={144}
                level="M"
                includeMargin={true}
              />
            </button>

            <span className="text-[10px] font-mono text-emerald-400 font-bold text-center">
              ● Scannable IATA 2D Barcode Active
            </span>

            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="w-full py-1.5 px-3 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Scan / Open Verified Ticket Sheet</span>
            </button>
          </div>
        </div>

        {/* Airport Services Toolbar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowMapsModal(true)}
              className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-sky-300 border border-blue-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>Google Maps Airport Terminal Grounding</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setUserView('dashboard')}
            className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
          >
            <span>View in My Trips Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Live QR Code Scanner & Verified Boarding Pass Sheet Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-950 p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    ✅ QR Code Scanned & Verified
                  </div>
                  <h3 className="text-base font-black text-white">
                    Official AeroWings Digital E-Ticket Sheet
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="p-2.5 bg-white rounded-xl shrink-0">
                  <QRCodeSVG value={qrCodeData} size={136} level="M" includeMargin={true} />
                </div>
                <div className="space-y-1.5 text-xs flex-1">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
                    <ShieldCheck className="w-3 h-3" /> IATA BCBP M1 Cryptographic Signature Valid ({booking.passengers.length} Travelers)
                  </div>
                  <div className="text-white font-black text-sm">Group PNR: <span className="text-amber-400">{booking.pnr}</span></div>
                  <div className="text-slate-300 font-mono text-[11px]">
                    Flight: <strong className="text-sky-400">{flight.airlineCode || 'AW'}-{flight.flightNumber}</strong> ({flight.origin.code} ➔ {flight.destination.code})
                  </div>
                  <div className="text-slate-300 text-[11px]">
                    Travelers: {booking.passengers.map((p, i) => `${i+1}. ${p.title || 'Mr'} ${p.firstName} ${p.lastName} (Seat: ${p.seatNumber || 'Auto'})`).join(' • ')}
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Date: {booking.departureDate} • Dep: {flight.departureTime} • Gate: <strong className="text-amber-300">{flight.gate || '22A'}</strong>
                  </div>
                  <div className={`font-bold ${isAutoCancelled ? 'text-rose-400' : 'text-emerald-400'}`}>
                    Status: {effectiveStatus}
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Decoded QR Payload (Shown when scanned by Phone / Airport Gate Scanner):
                </div>
                <pre className="text-[11px] font-mono text-emerald-300 whitespace-pre-wrap break-all bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                  {qrReadableText}
                </pre>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <a
                  href={qrVerificationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Scanned Mobile Verification Sheet</span>
                </a>
                <button
                  type="button"
                  onClick={() => setShowQrModal(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Maps Grounding */}
      <GoogleMapsGroundingModal
        isOpen={showMapsModal}
        onClose={() => setShowMapsModal(false)}
        airport={flight.origin}
        destinationAirport={flight.destination}
      />
    </div>
  );
};
