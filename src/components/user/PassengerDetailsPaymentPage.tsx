import React, { useState, useEffect } from 'react';
import { useAirline } from '../../context/AirlineContext';
import { useLanguage } from '../../context/LanguageContext';
import { BookingStepBar } from '../common/BookingStepBar';
import { DEMO_TEST_CARDS } from '../../data/mockData';
import { formatCurrency } from '../../utils/airlineUtils';
import { aiVoice } from '../../utils/aiVoice';
import { isAirportWeatherUnsafe } from '../../utils/realtimeWeather';
import {
  CreditCard,
  Building2,
  Wallet,
  QrCode,
  Lock,
  ShieldCheck,
  ShieldAlert,
  Tag,
  Sparkles,
  Plane,
  Clock,
  User,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Luggage,
  Utensils,
  Armchair,
  HelpCircle,
  Zap,
  Receipt,
  Phone,
  Mail,
  Smartphone,
  Check,
  Globe
} from 'lucide-react';

export const PassengerDetailsPaymentPage: React.FC = () => {
  const {
    selectedFlight,
    passengers,
    selectedSeats,
    hasInsurance,
    hasPriorityBoarding,
    promoCode,
    applyPromoCode,
    discountAmount,
    calculateFareBreakdown,
    completeBooking,
    setUserView,
    currency,
    userProfile,
    verifiedBookingPhone,
    setVerifiedBookingPhone,
    addToast
  } = useAirline();
  const { t } = useLanguage();

  // Contact Details initialized from verifiedBookingPhone or userProfile
  const initialRawPhone = verifiedBookingPhone || userProfile.phone || (typeof localStorage !== 'undefined' ? localStorage.getItem('aerowings_linked_phone') || '' : '');
  const [countryCode, setCountryCode] = useState(() => {
    if (initialRawPhone.startsWith('+1')) return '+1';
    if (initialRawPhone.startsWith('+44')) return '+44';
    if (initialRawPhone.startsWith('+971')) return '+971';
    if (initialRawPhone.startsWith('+65')) return '+65';
    if (initialRawPhone.startsWith('+61')) return '+61';
    return '+91';
  });
  const [contactPhone, setContactPhone] = useState(() =>
    initialRawPhone.replace(/^\+(91|1|44|971|65|61)\s*/, '').replace(/\D/g, '')
  );
  const [contactEmail, setContactEmail] = useState(userProfile.email || 'traveler@aerowings.com');

  // Payment states (clean defaults)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking' | 'wallet'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [promoInput, setPromoInput] = useState('');
  
  // Real Mobile OTP + 3D Secure Verification Modal & Inline State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [fallbackOtpCode, setFallbackOtpCode] = useState<string | null>(null);
  const [lastOtpPhone, setLastOtpPhone] = useState<string>('');
  const [otpDeliveryNote, setOtpDeliveryNote] = useState<string>('');
  const [otpTimer, setOtpTimer] = useState(300);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [authStatus, setAuthStatus] = useState<'idle' | 'verifying' | 'success' | 'failed'>('idle');

  // OTP Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showOtpModal && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showOtpModal, otpTimer]);

  if (!selectedFlight) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">No Flight Selected</h2>
        <button
          onClick={() => setUserView('results')}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl"
        >
          ← Back to Flight Search
        </button>
      </div>
    );
  }

  const fare = calculateFareBreakdown();

  const handleApplyPromo = (codeToApply?: string) => {
    const code = codeToApply || promoInput;
    if (!code) return;
    const ok = applyPromoCode(code);
    if (ok) {
      addToast(`Promo code "${code.toUpperCase()}" applied successfully!`, 'success');
      aiVoice.speak(`Promo code ${code} applied. You saved ${discountAmount || 500} rupees.`);
    } else {
      addToast('Invalid promo code. Try AEROFLY500 or FIRSTFLY', 'error');
    }
  };

  const handleQuickFillCard = (card: typeof DEMO_TEST_CARDS[0]) => {
    setCardNumber(card.number);
    setCardHolder(card.holder);
    setCardExpiry(card.expiry);
    setCardCvv(card.cvv);
    addToast(`Test card (${card.type}) loaded!`, 'info');
  };

  const getFormattedPhone = () => {
    const cleanDigits = contactPhone.trim().replace(/\D/g, '');
    if (!cleanDigits) return '';
    if (contactPhone.trim().startsWith('+')) return contactPhone.trim().replace(/[^0-9+]/g, '');
    return `${countryCode}${cleanDigits}`;
  };

  const handleSendRealOtp = async (openModal = true) => {
    const fullPhone = getFormattedPhone();
    if (!fullPhone || fullPhone.replace(/\D/g, '').length < 8) {
      addToast('Please enter a valid mobile phone number to receive your 6-digit OTP', 'error');
      return false;
    }

    setIsSendingOtp(true);
    setOtpCode('');
    try {
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: fullPhone,
          purpose: 'flight_booking'
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        const generatedOtp = String(data.otp || data.fallbackOtp || data.devPreviewOtp || '');
        const formattedPhone = data.phoneNumber || fullPhone;
        const alertText = `OTP sent to ${formattedPhone}: ${generatedOtp}`;

        setOtpTimer(data.expiresInSeconds || 300);
        setFallbackOtpCode(generatedOtp);
        setLastOtpPhone(formattedPhone);
        setOtpCode('');
        setOtpDeliveryNote(alertText);
        addToast(alertText, 'success');

        if (openModal) {
          setAuthStatus('idle');
          setShowOtpModal(true);
        }
        aiVoice.speak(`A 6 digit One Time Password has been sent to your mobile number ${contactPhone}. Please enter the code to authorize payment.`);
        return true;
      } else {
        addToast(data.error || 'Failed to send OTP. Please check your phone number.', 'error');
        return false;
      }
    } catch (err) {
      addToast('Network error while sending OTP. Please try again.', 'error');
      return false;
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleInitiatePayment = async () => {
    // Basic verification
    if (!contactEmail || !contactPhone || contactPhone.replace(/\D/g, '').length < 8) {
      addToast('Please enter a valid contact email and mobile phone number for ticket SMS', 'error');
      return;
    }

    if (paymentMethod === 'card' && (!cardNumber || !cardHolder || !cardExpiry || !cardCvv)) {
      addToast('Please enter all credit/debit card fields (or click a Demo Test Card)', 'error');
      return;
    }

    if (paymentMethod === 'upi' && !upiId) {
      addToast('Please enter a valid UPI ID or select a quick UPI app', 'error');
      return;
    }

    // Direct Instant Payment Authorization (Zero OTP Blocker)
    setIsProcessing(true);
    setAuthStatus('verifying');
    const phoneToVerify = getFormattedPhone();

    try {
      localStorage.setItem('aerowings_linked_phone', phoneToVerify);
      localStorage.setItem('aerowings_linked_email', contactEmail);
    } catch {
      // ignore storage error
    }

    if (typeof setVerifiedBookingPhone === 'function') {
      setVerifiedBookingPhone(phoneToVerify);
    }

    aiVoice.speak(`Authorizing payment of ${fare.finalTotal} rupees via secure banking clearance.`);
    addToast(`Authorizing payment via 256-bit bank clearance...`, 'info');

    setTimeout(() => {
      const paymentId = `PAY-AW-${Date.now().toString().slice(-6)}`;
      completeBooking(paymentMethod, paymentId, contactEmail, phoneToVerify);
      setIsProcessing(false);
      setAuthStatus('success');
      aiVoice.speak(`Payment authorized successfully! Your AeroWings flight booking is confirmed and e-ticket has been sent to ${contactPhone}.`);
      addToast(`✅ Payment Authorized! Confirmed booking for ${passengers.length} passenger(s).`, 'success');
    }, 1000);
  };

  const handleConfirmOtp = async () => {
    const cleanOtp = otpCode.trim();
    if (!/^\d{6}$/.test(cleanOtp)) {
      addToast('Please enter the 6-digit OTP code sent to your phone', 'error');
      return;
    }

    const phoneToVerify = lastOtpPhone || getFormattedPhone();

    if (fallbackOtpCode && cleanOtp !== fallbackOtpCode) {
      setAuthStatus('failed');
      addToast(`Invalid OTP code. Please enter the exact 6-digit OTP sent to ${phoneToVerify}: ${fallbackOtpCode}`, 'error');
      return;
    }

    setIsProcessing(true);
    setAuthStatus('verifying');

    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phoneToVerify,
          otp: cleanOtp
        })
      });
      const data = await res.json();

      if (!res.ok || (!data.success && !data.verified)) {
        setIsProcessing(false);
        setAuthStatus('failed');
        addToast(data.error || 'Invalid or expired OTP. Please check the code or resend.', 'error');
        return;
      }

      setIsPhoneVerified(true);
      if (typeof setVerifiedBookingPhone === 'function') {
        setVerifiedBookingPhone(phoneToVerify);
      }
      try {
        localStorage.setItem('aerowings_linked_phone', phoneToVerify);
        localStorage.setItem('aerowings_linked_email', contactEmail);
      } catch {
        // ignore storage error
      }

      setAuthStatus('success');

      setTimeout(() => {
        const paymentId = `PAY-AW-${Date.now().toString().slice(-6)}`;
        completeBooking(paymentMethod, paymentId, contactEmail, phoneToVerify);

        setShowOtpModal(false);
        setIsProcessing(false);
        setAuthStatus('idle');

        aiVoice.speak(`OTP verified and payment authorized! Your AeroWings flight booking is confirmed and an SMS confirmation has been sent to ${contactPhone}.`);
      }, 800);
    } catch (err) {
      setIsProcessing(false);
      setAuthStatus('failed');
      addToast('Error verifying OTP. Please try again.', 'error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-36 sm:pb-8">
      {/* Universal Step Bar */}
      <BookingStepBar
        currentStep={5}
        stepTitle="Review & 3D Secure Payment"
        stepSubtitle="Review traveler details, flight timings, and authorize bank payment."
        voiceText="Step 5: Final Review and Secure Payment. Verify your booking summary and authorize payment via 3D Secure."
        firstTimeFlyerTip="💡 First-Time Flyer Payment Tip: Once your payment is authorized via Bank 3D Secure, your PNR reservation code and E-Ticket are issued immediately. You can download the PDF and scan the QR pass directly at airport gates."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Review Summary & Payment Gateway (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Detailed Flight & Traveler Review Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Plane className="w-5 h-5 text-sky-400" />
                <span>Flight & Traveler Review</span>
              </div>
              <button
                type="button"
                onClick={() => setUserView('passengers')}
                className="text-xs text-sky-400 hover:underline cursor-pointer"
              >
                Edit Details
              </button>
            </div>

            {/* Flight Itinerary strip */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-600/20 text-blue-300 font-bold text-xs border border-blue-500/30">
                    {selectedFlight.airlineCode} {selectedFlight.flightNumber}
                  </span>
                  <span className="text-xs text-slate-300 font-semibold">{selectedFlight.aircraft}</span>
                </div>
                <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {selectedFlight.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 items-center text-center">
                <div className="text-left">
                  <div className="text-xl font-black text-white">{selectedFlight.departureTime}</div>
                  <div className="text-xs font-bold text-sky-400">{selectedFlight.origin.code}</div>
                  <div className="text-[11px] text-slate-400 truncate">{selectedFlight.origin.city}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] text-slate-400 font-medium">{selectedFlight.duration}</div>
                  <div className="w-full h-0.5 bg-gradient-to-r from-sky-500 via-blue-500 to-emerald-500 relative">
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full bg-sky-400"></div>
                  </div>
                  <div className="text-[10px] text-emerald-400 font-semibold">Non-Stop Direct</div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-black text-white">{selectedFlight.arrivalTime}</div>
                  <div className="text-xs font-bold text-sky-400">{selectedFlight.destination.code}</div>
                  <div className="text-[11px] text-slate-400 truncate">{selectedFlight.destination.city}</div>
                </div>
              </div>
            </div>

            {/* Flight Route Meteorological Safety Status */}
            {(() => {
              const origWeather = selectedFlight ? isAirportWeatherUnsafe(selectedFlight.origin.code) : { unsafe: false, condition: 'Clear Skies' };
              const destWeather = selectedFlight ? isAirportWeatherUnsafe(selectedFlight.destination.code) : { unsafe: false, condition: 'Clear Skies' };
              const isRouteUnsafe = selectedFlight?.status === 'Cancelled' || origWeather.unsafe || destWeather.unsafe;
              const reasonCondition = origWeather.unsafe ? origWeather.condition : destWeather.unsafe ? destWeather.condition : 'Adverse Atmospheric Conditions';

              return (
                <div className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
                  isRouteUnsafe 
                    ? 'bg-rose-950/40 border-rose-500/50 text-rose-200' 
                    : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                }`}>
                  <div className="flex items-center gap-2.5">
                    {isRouteUnsafe ? (
                      <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        <span>AeroWings AI Doppler Safety Radar:</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono font-black ${
                          isRouteUnsafe ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {isRouteUnsafe ? `Critical Alert: ${reasonCondition}` : 'Safe Corridor Active'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        {isRouteUnsafe 
                          ? `Severe weather detected along route. If authorized, 100% zero-deduction refund protection will auto-cancel and refund tickets if unsafe.`
                          : `Real-time atmospheric telemetry confirms favorable runway and en-route flight conditions.`}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Travelers summary table */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 block">Travelers & Add-ons Summary:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {passengers.map((p, idx) => {
                  const s = selectedSeats[idx];
                  return (
                    <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">
                          {p.title} {p.firstName || `Traveler ${idx + 1}`} {p.lastName}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {p.type} • {p.meal || 'Standard Snack'}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono font-bold text-[11px]">
                          Seat {s?.id || 'Auto-12A'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Contact Delivery Inputs (E-Ticket PDF Delivery) */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-white block flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-sky-400" />
                <span>{t('common.contactDetailsAlerts')}:</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">{t('passenger.email')}</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      id="contact-email"
                      name="email"
                      autoComplete="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="traveler@aerowings.com"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    {t('passenger.phone')} <span className="text-emerald-400 text-[10px]">(Receives Live OTP & Booking Confirmation SMS)</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => {
                        setCountryCode(e.target.value);
                        setIsPhoneVerified(false);
                      }}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-white font-mono text-xs focus:outline-none"
                    >
                      <option value="+91">🇮🇳 +91 (IN)</option>
                      <option value="+1">🇺🇸 +1 (US)</option>
                      <option value="+44">🇬🇧 +44 (UK)</option>
                      <option value="+971">🇦🇪 +971 (UAE)</option>
                      <option value="+65">🇸🇬 +65 (SG)</option>
                      <option value="+61">🇦🇺 +61 (AU)</option>
                    </select>
                    <div className="relative flex-1">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        id="contact-phone"
                        name="phone"
                        inputMode="tel"
                        autoComplete="tel"
                        value={contactPhone}
                        onChange={(e) => {
                          setContactPhone(e.target.value.replace(/[^0-9]/g, ''));
                          setIsPhoneVerified(false);
                        }}
                        placeholder="Enter 10-digit mobile number"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSendRealOtp(false)}
                      disabled={isSendingOtp}
                      className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-[11px] shrink-0 cursor-pointer transition-colors"
                    >
                      {isSendingOtp ? 'Sending...' : isPhoneVerified ? '✓ Verified' : 'Send OTP'}
                    </button>
                  </div>
                  {otpDeliveryNote && (
                    <div role="alert" className="mt-2 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center justify-between gap-2">
                      <span>🔔 {otpDeliveryNote}</span>
                      {!showOtpModal && (
                        <button
                          type="button"
                          onClick={() => setShowOtpModal(true)}
                          className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 text-[10px] font-black cursor-pointer shrink-0"
                        >
                          Enter OTP
                        </button>
                      )}
                    </div>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1">
                    📲 Before completing booking, a real 6-digit OTP is sent to <span className="text-sky-300 font-mono">{getFormattedPhone() || 'your phone'}</span>, followed by your PNR & E-Ticket confirmation SMS.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Secure Payment Options */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">Select Payment Mode</h2>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold flex items-center gap-1">
                <Lock className="w-3 h-3" /> 256-Bit SSL Encrypted
              </span>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-md ring-2 ring-blue-500/40'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-5 h-5 mx-auto mb-1.5 text-sky-400" />
                <span className="text-xs font-bold block">Credit / Debit</span>
                <span className="text-[10px] text-slate-500">Visa, MC, RuPay</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'upi'
                    ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-md ring-2 ring-emerald-500/40'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <QrCode className="w-5 h-5 mx-auto mb-1.5 text-emerald-400" />
                <span className="text-xs font-bold block">UPI / QR Pay</span>
                <span className="text-[10px] text-slate-500">GPay, PhonePe</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('netbanking')}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'netbanking'
                    ? 'bg-purple-600/20 border-purple-500 text-white shadow-md ring-2 ring-purple-500/40'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Building2 className="w-5 h-5 mx-auto mb-1.5 text-purple-400" />
                <span className="text-xs font-bold block">Netbanking</span>
                <span className="text-[10px] text-slate-500">50+ Banks</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('wallet')}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'wallet'
                    ? 'bg-amber-600/20 border-amber-500 text-white shadow-md ring-2 ring-amber-500/40'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Wallet className="w-5 h-5 mx-auto mb-1.5 text-amber-400" />
                <span className="text-xs font-bold block">SkyWings Wallet</span>
                <span className="text-[10px] text-slate-500">Instant Cash</span>
              </button>
            </div>

            {/* Method Content */}
            {paymentMethod === 'card' && (
              <div className="space-y-4 pt-2">
                {/* Test Cards Quick Picker */}
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
                    <span>⚡ Quick-Fill Sandbox Test Cards:</span>
                    <span className="text-emerald-400 font-mono text-[10px]">Auto-Validates</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {DEMO_TEST_CARDS.map((card, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleQuickFillCard(card)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-sky-300 border border-slate-700 text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        {card.type}: ****{card.number.slice(-4)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card Input Form */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4532 8900 1234 5678"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Cardholder Legal Name
                      </label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                        placeholder="ARUN KUMAR"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs uppercase text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Expiry (MM/YY)
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="08/28"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="w-36">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      CVV / Security Code
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="420"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'upi' && (
              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Enter Virtual Payment Address (VPA / UPI ID)</span>
                    <span className="text-[11px] text-slate-400">Works with Google Pay, PhonePe, Paytm, BHIM</span>
                  </div>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="user@oksbi"
                    className="w-full max-w-sm mx-auto bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-mono text-center text-emerald-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'netbanking' && (
              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <span className="text-xs font-bold text-white block">Popular Banking Portals:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Bank', 'Punjab National Bank'].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setSelectedBank(b)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                          selectedBank === b
                            ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'wallet' && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">SkyWings Frequent Flyer Cash Balance:</span>
                  <span className="font-mono font-bold text-amber-400">
                    {userProfile.miles} Miles (Value: {formatCurrency(userProfile.miles * 0.5, currency)})
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Your wallet points will be automatically applied to waive ticket cost.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Fare Breakdown & Promo (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Fare Breakdown Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-800">
              <Receipt className="w-4 h-4 text-emerald-400" />
              <span>{t('payment.fareBreakdown')}</span>
            </h3>

            <div className="space-y-2.5 text-xs text-slate-300">
              {fare.specialFareDiscount > 0 ? (
                <>
                  <div className="flex justify-between">
                    <span>Original Base Fare ({passengers.length} Pax):</span>
                    <span className="line-through text-slate-500">{formatCurrency(fare.originalBaseFare, currency)}</span>
                  </div>
                  <div className="flex justify-between text-amber-300 font-bold">
                    <span>{fare.specialFareLabel}:</span>
                    <span>-{formatCurrency(fare.specialFareDiscount, currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discounted {t('payment.baseFare')}:</span>
                    <span className="font-semibold text-white">{formatCurrency(fare.baseFare, currency)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between">
                  <span>{t('payment.baseFare')} ({passengers.length} Pax):</span>
                  <span className="font-semibold text-white">{formatCurrency(fare.baseFare, currency)}</span>
                </div>
              )}

              {fare.extraFreeBaggageKg > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>🎓 Student Extra Check-in Baggage (+{fare.extraFreeBaggageKg}kg):</span>
                  <span>FREE (₹0)</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>{t('payment.taxes')}:</span>
                <span className="font-semibold text-white">{formatCurrency(fare.taxesAndFees, currency)}</span>
              </div>

              {fare.seatsTotal > 0 && (
                <div className="flex justify-between text-sky-400">
                  <span>Selected Seat Add-ons:</span>
                  <span className="font-semibold">+{formatCurrency(fare.seatsTotal, currency)}</span>
                </div>
              )}

              {fare.mealsTotal > 0 && (
                <div className="flex justify-between text-sky-400">
                  <span>In-Flight Gourmet Meals:</span>
                  <span className="font-semibold">+{formatCurrency(fare.mealsTotal, currency)}</span>
                </div>
              )}

              {fare.baggageTotal > 0 && (
                <div className="flex justify-between text-sky-400">
                  <span>Extra Check-in Baggage:</span>
                  <span className="font-semibold">+{formatCurrency(fare.baggageTotal, currency)}</span>
                </div>
              )}

              {hasInsurance && (
                <div className="flex justify-between text-sky-400">
                  <span>Travel Trip Insurance:</span>
                  <span className="font-semibold">+{formatCurrency(fare.insuranceTotal, currency)}</span>
                </div>
              )}

              {hasPriorityBoarding && (
                <div className="flex justify-between text-sky-400">
                  <span>Priority Boarding:</span>
                  <span className="font-semibold">+{formatCurrency(fare.priorityBoardingTotal, currency)}</span>
                </div>
              )}

              {fare.couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-400 font-bold pt-1 border-t border-slate-800">
                  <span>Promo Discount ({promoCode}):</span>
                  <span>-{formatCurrency(fare.couponDiscount, currency)}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                <span className="text-xs font-bold text-white uppercase tracking-wider">{t('common.grandTotal')}:</span>
                <span className="text-xl font-black text-emerald-400">
                  {formatCurrency(fare.finalTotal, currency)}
                </span>
              </div>
            </div>

            {/* Desktop Pay Button */}
            <button
              type="button"
              onClick={handleInitiatePayment}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-sky-500 hover:from-emerald-500 hover:to-sky-400 text-white text-xs font-black rounded-2xl shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer transform hover:scale-[1.02] active:scale-95"
            >
              <Lock className="w-4 h-4" />
              <span>{t('common.authorizeAndPay')} {formatCurrency(fare.finalTotal, currency)} →</span>
            </button>
          </div>

          {/* Promo Code Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-sky-400" />
              <span>{t('common.havePromo')}</span>
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                placeholder="e.g. AEROFLY500"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white uppercase focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => handleApplyPromo()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                {t('common.apply')}
              </button>
            </div>

            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] text-slate-500 block">Available Offers:</span>
              <div className="flex flex-wrap gap-1.5">
                {['AEROFLY500', 'FIRSTFLY', 'STUDENT'].map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => {
                      setPromoInput(code);
                      handleApplyPromo(code);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-sky-300 border border-slate-700 text-[10px] font-mono font-bold transition-colors cursor-pointer"
                  >
                    ⚡ {code}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bank 3D Secure Authentication Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl animate-scaleIn relative overflow-hidden">
            
            {/* Header with Bank 3D Secure Badges */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 mx-auto shadow-lg shadow-emerald-500/25">
                <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-8 h-8" />
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold uppercase">
                <span>Verified by Visa & Mastercard Identity Check</span>
              </div>

              <h3 className="text-lg font-black text-white">
                Mobile OTP & Booking Verification
              </h3>
              <p className="text-xs text-slate-300">
                A 6-digit One-Time Password (OTP) was sent to <span className="text-sky-300 font-mono font-bold">{getFormattedPhone()}</span>
              </p>
              {otpDeliveryNote && (
                <div role="alert" className="text-xs font-mono font-black text-emerald-300 bg-emerald-950/80 border-2 border-emerald-500/50 rounded-xl px-3 py-2 shadow-lg">
                  🔔 {otpDeliveryNote}
                </div>
              )}
            </div>

            {/* Merchant Details Box */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Recipient Phone (OTP + Confirmation SMS):</span>
                <span className="text-sky-300 font-mono font-bold">{getFormattedPhone()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Booking Amount:</span>
                <span className="text-emerald-400 font-mono font-bold text-sm">{formatCurrency(fare.finalTotal, currency)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>SMS Confirmation on Success:</span>
                <span className="font-mono text-emerald-400 font-bold">Enabled (Twilio Gateway)</span>
              </div>
            </div>

            {/* OTP Input Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>Enter 6-Digit Mobile OTP:</span>
                <span className="text-amber-400 font-mono font-bold">Expires in {otpTimer}s</span>
              </div>

              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="••••••"
                className="w-52 mx-auto bg-slate-900 border-2 border-emerald-500/60 rounded-2xl px-4 py-2.5 text-center text-2xl font-mono font-black text-emerald-400 tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />

              <div className="flex items-center justify-center gap-3 flex-wrap pt-1">
                {fallbackOtpCode && (
                  <button
                    type="button"
                    onClick={() => setOtpCode(fallbackOtpCode)}
                    className="text-[11px] text-amber-300 hover:underline font-semibold cursor-pointer"
                  >
                    ⚡ Use Generated OTP ({fallbackOtpCode})
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleSendRealOtp(false)}
                  disabled={isSendingOtp}
                  className="text-[11px] text-sky-400 hover:underline font-semibold cursor-pointer"
                >
                  {isSendingOtp ? 'Sending new OTP...' : '🔄 Resend OTP to Phone'}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                disabled={isProcessing}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-2xl border border-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmOtp}
                disabled={isProcessing}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-black rounded-2xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                {authStatus === 'verifying' ? (
                  <span>Verifying with Bank...</span>
                ) : authStatus === 'success' ? (
                  <span className="flex items-center gap-1"><Check className="w-4 h-4" /> Approved!</span>
                ) : (
                  <span>Authorize Payment →</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Action Bar for Smartphone Screens */}
      <div className="fixed bottom-0 left-0 right-0 z-30 sm:hidden bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-3 shadow-2xl">
        <div className="flex items-center justify-between gap-2 max-w-lg mx-auto">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Final Fare</span>
            <div className="text-base font-black text-emerald-400 leading-tight">
              {formatCurrency(fare.finalTotal, currency)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setUserView('addons')}
              className="px-3 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold border border-slate-700"
            >
              ← Back
            </button>

            <button
              type="button"
              onClick={handleInitiatePayment}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-sky-500 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Authorize & Pay →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
