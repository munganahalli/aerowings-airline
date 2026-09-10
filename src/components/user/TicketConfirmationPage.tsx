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
    setUserView,
    currency,
    addToast,
    checkInBooking,
    userProfile,
    aiAutoCancelFlight,
    setBookings,
    instantWeatherRefund
  } = useAirline();
  const { t } = useLanguage();

  const ticketRef = useRef<HTMLDivElement>(null);
  const [activePassengerIdx, setActivePassengerIdx] = useState<number>(0);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
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

  // Destination weather
  const [destWeather, setDestWeather] = useState<RealtimeAirportWeather | null>(null);

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

      // Load destination weather
      const destCode = currentBookingSuccess.flight.destination.code;
      setDestWeather(getAirportWeatherImmediate(destCode));
      fetchLiveAirportWeather(destCode).then(w => {
        if (w) setDestWeather(w);
      });
    }
  }, [currentBookingSuccess, userProfile]);

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

  const [isAutoCancelled, setIsAutoCancelled] = useState<boolean>(() => {
    return booking.status === 'Cancelled' || flight.status === 'Cancelled';
  });
  const [cancellationNotice, setCancellationNotice] = useState<string | null>(
    booking.cancellationReason || (booking.status === 'Cancelled' ? 'Grounded due to severe weather conditions.' : null)
  );
  const [refundProcessed, setRefundProcessed] = useState<boolean>(booking.refundStatus === 'Processed');

  const handleSimulateBadWeather = () => {
    const reason = `Automated Flight Cancellation: Dangerous Cyclonic Crosswinds & Low Visibility at ${flight.destination.city} (${flight.destination.code}). Grounded under Aviation Weather Safety Protocol.`;
    setIsAutoCancelled(true);
    setCancellationNotice(reason);
    setRefundProcessed(true);

    if (flight?.id && aiAutoCancelFlight) {
      aiAutoCancelFlight(flight.id, reason);
    }

    setBookings((prev: any[]) =>
      prev.map((b) =>
        b.id === booking.id
          ? {
              ...b,
              status: 'Cancelled',
              cancellationReason: reason,
              refundAmount: b.priceBreakdown.finalTotal,
              refundStatus: 'Processed'
            }
          : b
      )
    );

    addToast(`🚨 Adverse Weather Condition Alert: Flight ${flight.flightNumber} automatically cancelled for safety. 100% full refund initiated.`, 'error');
  };

  const qrCodeData = JSON.stringify({
    app: 'AEROWINGS_AIRLINES',
    pnr: booking.pnr,
    tkt: booking.ticketNumber,
    flight: `${flight.airlineCode || 'AW'}${flight.flightNumber}`,
    from: flight.origin.code,
    to: flight.destination.code,
    date: booking.departureDate,
    time: flight.departureTime,
    pax: `${currentPassenger.title} ${currentPassenger.firstName} ${currentPassenger.lastName}`,
    seat: assignedSeat,
    gate: flight.gate || '22A',
    class: booking.cabinClass.toUpperCase(),
    sig: `AW-${booking.pnr}-${flight.flightNumber}`
  });

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

              <div className="flex items-center gap-2">
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
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <CloudSun className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Live Flight Weather Safety Radar
                  </span>
                  <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Safe to Fly
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Flight route {flight.origin.city} ({flight.origin.code}) → {flight.destination.city} ({flight.destination.code}): Conditions are currently monitored. If weather condition turns severe, the system automatically cancels the flight with 100% instant full refund.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSimulateBadWeather}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-500/50 text-slate-300 hover:text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-sm"
              title="Test the automated flight cancellation condition"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate Severe Weather Disruption</span>
            </button>
          </div>
        )}
      </div>

      {/* Subscribe for Secret Fares & Vacation Deals (Shown after finishing booking until subscribed or dismissed) */}
      {!hasSubscribedSecretDeals && !dismissedSecretDeals && (
        <div className="bg-gradient-to-r from-blue-950/70 via-indigo-950/60 to-purple-950/70 border border-blue-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden animate-fadeIn">
          {/* Dismiss button */}
          <button
            type="button"
            onClick={() => {
              setDismissedSecretDeals(true);
              addToast('Secret Fares banner hidden.', 'info');
            }}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Dismiss / Don't show again"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-sky-300 font-extrabold text-[11px] border border-blue-500/30 uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Member Privilege • 25% Off Secret Fares</span>
              </div>
              <h3 className="text-base sm:text-xl font-black text-white">
                Subscribe for Secret Fares & Vacation Deals
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Unlock exclusive unlisted airfares, zero-convenience fee promo codes, and luxury hotel discounts. Instant promo coupon <strong className="text-amber-300">SECRET25</strong> dispatched to your mobile & inbox upon subscription!
              </p>
            </div>

            {secretSubscribedAnim ? (
              <div className="w-full lg:w-auto p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center gap-2.5 text-emerald-300 text-xs font-bold animate-fadeIn">
                <Check className="w-5 h-5 text-emerald-400" />
                <span>Subscribed! Secret promo code SECRET25 sent to your phone and email.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribeSecretDeals} className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1 sm:w-72">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={secretEmail}
                    onChange={(e) => setSecretEmail(e.target.value)}
                    placeholder="Enter email for secret deals..."
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900/90 border border-slate-700 focus:border-blue-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-blue-500/25 whitespace-nowrap cursor-pointer transition-all hover:scale-105"
                >
                  Subscribe for Secret Fares
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Destination Real-Time Weather Alert */}
      {destWeather && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <CloudSun className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white flex items-center gap-2">
                <span>Arrival Airport Weather: {destWeather.cityName} ({destWeather.airportCode})</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                  {destWeather.flightSafetyStatus === 'OPTIMAL_VFR' ? 'Optimal Flight Weather' : destWeather.conditionText}
                </span>
              </div>
              <div className="text-slate-400 text-[11px] mt-0.5">
                {destWeather.temperatureC}°C ({destWeather.temperatureF}°F) • {destWeather.conditionText} • Wind: {destWeather.windSpeedKmh} km/h • Visibility: {destWeather.visibilityKm} km
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-300">
            <span className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800">
              {destWeather.runwayAdvisory}
            </span>
          </div>
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
          <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="p-2 bg-white rounded-xl shadow-md">
              <QRCodeSVG
                value={qrCodeData}
                size={110}
                level="M"
                includeMargin={false}
              />
            </div>
            <span className="text-[10px] font-mono text-slate-400 mt-2 text-center">
              Scan at Airport Security / Boarding Gate
            </span>
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
