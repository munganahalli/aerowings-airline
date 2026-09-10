import React, { useState, useEffect } from 'react';
import { useAirline } from '../../context/AirlineContext';
import { useLanguage } from '../../context/LanguageContext';
import { BookingStepBar } from '../common/BookingStepBar';
import { DEMO_TEST_CARDS } from '../../data/mockData';
import { formatCurrency } from '../../utils/airlineUtils';
import { aiVoice } from '../../utils/aiVoice';
import {
  CreditCard,
  Building2,
  Wallet,
  QrCode,
  Lock,
  ShieldCheck,
  Tag,
  Sparkles,
  Plane,
  Clock,
  User,
  AlertCircle,
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
    addToast
  } = useAirline();
  const { t } = useLanguage();

  // Contact Details (clean defaults, no unwanted prefilled dummy phone/email)
  const [countryCode, setCountryCode] = useState('+91');
  const [contactPhone, setContactPhone] = useState(userProfile.phone?.replace(/^\+\d+\s*/, '') || '');
  const [contactEmail, setContactEmail] = useState(userProfile.email || '');

  // Payment states (clean defaults)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking' | 'wallet'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [promoInput, setPromoInput] = useState('');
  
  // 3D Secure OTP Simulator modal
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('489201');
  const [otpTimer, setOtpTimer] = useState(60);
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

  const handleInitiatePayment = () => {
    // Basic verification
    if (!contactEmail || !contactPhone) {
      addToast('Please enter your contact email and phone for ticket issuance', 'error');
      return;
    }

    if (paymentMethod === 'card' && (!cardNumber || !cardHolder || !cardExpiry || !cardCvv)) {
      addToast('Please enter all credit/debit card fields', 'error');
      return;
    }

    if (paymentMethod === 'upi' && !upiId) {
      addToast('Please enter a valid UPI ID or scan QR code', 'error');
      return;
    }

    setOtpTimer(60);
    setOtpCode('489201'); // Pre-fill valid test OTP
    setAuthStatus('idle');
    setShowOtpModal(true);
    aiVoice.speak('3D Secure Bank authentication triggered. Please verify the one-time password.');
  };

  const handleConfirmOtp = () => {
    if (otpCode !== '489201' && otpCode.length < 4) {
      addToast('Invalid OTP. Please enter 489201 (pre-filled demo code)', 'error');
      return;
    }

    setIsProcessing(true);
    setAuthStatus('verifying');

    setTimeout(() => {
      setAuthStatus('success');
      
      setTimeout(() => {
        const fullPhone = `${countryCode} ${contactPhone}`;
        const paymentId = `PAY-AW-${Date.now().toString().slice(-6)}`;
        
        completeBooking(paymentMethod, paymentId, contactEmail, fullPhone);
        
        setShowOtpModal(false);
        setIsProcessing(false);
        setAuthStatus('idle');
        
        aiVoice.speak('Payment authorized! Your AeroWings reservation is confirmed. Boarding pass and E-ticket are ready.');
      }, 1000);
    }, 1200);
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
                  <label className="block text-slate-400 mb-1 font-semibold">{t('passenger.phone')}</label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
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
                        pattern="[0-9]*"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="9876543210"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
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
              <div className="flex justify-between">
                <span>{t('payment.baseFare')} ({passengers.length} Pax):</span>
                <span className="font-semibold text-white">{formatCurrency(fare.baseFare, currency)}</span>
              </div>

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
                Bank 3D Secure Authentication
              </h3>
              <p className="text-xs text-slate-300">
                A 6-digit verification code was sent to <span className="text-sky-300 font-mono font-bold">{countryCode} {contactPhone.slice(0, 2)}****{contactPhone.slice(-4)}</span>
              </p>
            </div>

            {/* Merchant Details Box */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Merchant:</span>
                <span className="text-white font-bold">AeroWings Airlines Int.</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Amount:</span>
                <span className="text-emerald-400 font-mono font-bold text-sm">{formatCurrency(fare.finalTotal, currency)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Transaction Ref:</span>
                <span className="font-mono text-slate-300">TXN-AW-{Date.now().toString().slice(-6)}</span>
              </div>
            </div>

            {/* OTP Input Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>Enter 6-Digit Bank OTP:</span>
                <span className="text-amber-400 font-mono font-bold">Expires in {otpTimer}s</span>
              </div>

              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="489201"
                className="w-52 mx-auto bg-slate-900 border-2 border-emerald-500/60 rounded-2xl px-4 py-2.5 text-center text-2xl font-mono font-black text-emerald-400 tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />

              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setOtpCode('489201')}
                  className="text-[11px] text-sky-400 hover:underline font-semibold cursor-pointer"
                >
                  ⚡ Autofill Demo Code (489201)
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
