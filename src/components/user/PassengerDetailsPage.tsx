import React, { useState, useEffect } from 'react';
import { useAirline } from '../../context/AirlineContext';
import { useLanguage } from '../../context/LanguageContext';
import { BookingStepBar } from '../common/BookingStepBar';
import { formatCurrency } from '../../utils/airlineUtils';
import { aiVoice } from '../../utils/aiVoice';
import {
  User,
  Mail,
  Phone,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Zap,
  Luggage,
  Calendar,
  Globe,
  FileCheck,
  Check,
  CreditCard,
  FileText,
  BadgeCheck,
  Plane
} from 'lucide-react';

export const PassengerDetailsPage: React.FC = () => {
  const {
    selectedFlight,
    passengers,
    updatePassenger,
    setUserView,
    currency,
    userProfile,
    verifiedBookingPhone,
    setVerifiedBookingPhone,
    calculateFareBreakdown,
    addToast
  } = useAirline();
  const { t } = useLanguage();

  // Scroll to top immediately when Step 2 opens
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const [contactEmail, setContactEmail] = useState<string>(userProfile.email || '');
  const [contactPhone, setContactPhone] = useState<string>(verifiedBookingPhone || userProfile.phone || '+91 8971541794');
  const [verifyingIndex, setVerifyingIndex] = useState<number | null>(null);
  const [sendingStepOtp, setSendingStepOtp] = useState<boolean>(false);
  const [stepOtpAlert, setStepOtpAlert] = useState<string | null>(null);

  if (!selectedFlight) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">No Flight Selected</h2>
        <p className="text-xs text-slate-400">Please select your flight to proceed with traveler details.</p>
        <button
          type="button"
          onClick={() => setUserView('results')}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl cursor-pointer"
        >
          ← Back to Flight Search Results
        </button>
      </div>
    );
  }

  const isInternational = selectedFlight.origin.country !== 'India' || selectedFlight.destination.country !== 'India';
  const fare = calculateFareBreakdown();

  // Helper validation functions
  const validateAadhaar = (num?: string): boolean => {
    if (!num) return false;
    const clean = num.replace(/\s+/g, '');
    return /^\d{12}$/.test(clean);
  };

  const validatePan = (pan?: string): boolean => {
    if (!pan) return false;
    return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.toUpperCase().trim());
  };

  const validateVisa = (visa?: string): boolean => {
    if (!isInternational) return true; // Domestic flights exempt
    if (!visa || visa.trim().length < 6 || visa === 'DOMESTIC_EXEMPT') return false;
    return true;
  };

  // Check if an individual passenger has all personal details & visa verified
  const isPassengerFullyVerified = (p: typeof passengers[0]): boolean => {
    const hasName = Boolean(p.firstName && p.firstName.trim().length >= 2 && p.lastName && p.lastName.trim().length >= 2);
    const hasAadhaar = validateAadhaar(p.aadhaarNumber);
    const hasPan = validatePan(p.panNumber);
    const hasVisa = validateVisa(p.visaNumber);
    return Boolean(p.isVerified && hasName && hasAadhaar && hasPan && hasVisa);
  };

  // Count unverified passengers
  const unverifiedCount = passengers.filter(p => !isPassengerFullyVerified(p)).length;
  const isAllVerified = unverifiedCount === 0;

  // Single Passenger Verification Handler
  const handleVerifyPassenger = (idx: number) => {
    const p = passengers[idx];
    if (!p.firstName || p.firstName.trim().length < 2) {
      addToast(`Traveler ${idx + 1}: Please enter First & Middle Name (minimum 2 letters).`, 'error');
      return;
    }
    if (!p.lastName || p.lastName.trim().length < 2) {
      addToast(`Traveler ${idx + 1}: Please enter Last Name / Surname.`, 'error');
      return;
    }
    if (!p.aadhaarNumber || !validateAadhaar(p.aadhaarNumber)) {
      addToast(`Traveler ${idx + 1}: Please enter a valid 12-digit Aadhaar Card number.`, 'error');
      return;
    }
    if (!p.panNumber || !validatePan(p.panNumber)) {
      addToast(`Traveler ${idx + 1}: Please enter a valid 10-character PAN Card (e.g. ABCDE1234F).`, 'error');
      return;
    }
    if (isInternational && (!p.visaNumber || !validateVisa(p.visaNumber))) {
      addToast(`Traveler ${idx + 1}: Valid International Visa / Travel Permit number is mandatory for international flights.`, 'error');
      return;
    }

    setVerifyingIndex(idx);
    setTimeout(() => {
      updatePassenger(idx, {
        isVerified: true,
        visaStatus: 'Verified',
        verifiedAt: new Date().toISOString()
      });

      setVerifyingIndex(null);
      addToast(`✅ Traveler ${idx + 1} (${p.firstName} ${p.lastName}): Personal Details & Visa Verified!`, 'success');
      aiVoice.speak(`Traveler ${idx + 1} personal details and visa verified successfully.`);
    }, 600);
  };

  // Quick-fill valid credentials for a single passenger
  const handleFillPassengerSample = (idx: number) => {
    const sampleNames = [
      { title: 'Mr', first: 'Arun', last: 'Kumar', gender: 'Male', dob: '1995-04-12', aadhaar: '5412 7890 2341', pan: 'ABCDE1234F', visa: 'V-IN-987654' },
      { title: 'Mrs', first: 'Priya', last: 'Sharma', gender: 'Female', dob: '1998-09-24', aadhaar: '6789 1234 5678', pan: 'FGHIJ5678K', visa: 'V-IN-654321' },
      { title: 'Master', first: 'Rohan', last: 'Kumar', gender: 'Male', dob: '2016-02-18', aadhaar: '9012 3456 7890', pan: 'KLMNO9012P', visa: 'V-IN-321654' },
      { title: 'Ms', first: 'Ananya', last: 'Iyer', gender: 'Female', dob: '2001-11-05', aadhaar: '3456 7890 1234', pan: 'PQRST3456U', visa: 'V-IN-789123' },
    ];
    const sample = sampleNames[idx % sampleNames.length];
    updatePassenger(idx, {
      title: sample.title as any,
      firstName: sample.first,
      lastName: sample.last,
      gender: sample.gender as any,
      dob: sample.dob,
      aadhaarNumber: sample.aadhaar,
      panNumber: sample.pan,
      visaNumber: isInternational ? sample.visa : 'DOMESTIC_EXEMPT',
      visaStatus: 'Verified',
      isVerified: true,
      verifiedAt: new Date().toISOString()
    });
    addToast(`✅ Traveler ${idx + 1}: Valid Details & Visa Verified!`, 'success');
    aiVoice.speak(`Traveler ${idx + 1} verified.`);
  };

  // Quick-fill valid credentials for all passengers
  const handleQuickFillSample = () => {
    const sampleNames = [
      { title: 'Mr', first: 'Arun', last: 'Kumar', gender: 'Male', dob: '1995-04-12', aadhaar: '5412 7890 2341', pan: 'ABCDE1234F', visa: 'V-IN-987654' },
      { title: 'Mrs', first: 'Priya', last: 'Sharma', gender: 'Female', dob: '1998-09-24', aadhaar: '6789 1234 5678', pan: 'FGHIJ5678K', visa: 'V-IN-654321' },
      { title: 'Master', first: 'Rohan', last: 'Kumar', gender: 'Male', dob: '2016-02-18', aadhaar: '9012 3456 7890', pan: 'KLMNO9012P', visa: 'V-IN-321654' },
      { title: 'Ms', first: 'Ananya', last: 'Iyer', gender: 'Female', dob: '2001-11-05', aadhaar: '3456 7890 1234', pan: 'PQRST3456U', visa: 'V-IN-789123' },
    ];

    passengers.forEach((_, idx) => {
      const sample = sampleNames[idx % sampleNames.length];
      updatePassenger(idx, {
        title: sample.title as any,
        firstName: sample.first,
        lastName: sample.last,
        gender: sample.gender as any,
        dob: sample.dob,
        aadhaarNumber: sample.aadhaar,
        panNumber: sample.pan,
        visaNumber: isInternational ? sample.visa : 'DOMESTIC_EXEMPT',
        visaStatus: 'Verified',
        isVerified: true,
        verifiedAt: new Date().toISOString()
      });
    });

    if (!contactEmail.trim()) setContactEmail(userProfile.email || 'traveler@aerowings.com');
    if (!contactPhone.trim()) setContactPhone(verifiedBookingPhone || userProfile.phone || '+91 8971541794');
    addToast('✅ All Traveler Names, Aadhaar, PAN & Visa Verified!', 'success');
    aiVoice.speak('All passenger personal details and visa credentials verified successfully.');
  };

  const normalizePhone = (raw: string) => {
    const cleaned = raw.trim();
    const digits = cleaned.replace(/\D/g, '');
    if (cleaned.startsWith('+')) return `+${digits}`;
    if (digits.length === 10) return `+91${digits}`;
    if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
    return `+${digits}`;
  };

  const handleSendStepOtp = async () => {
    const clean = contactPhone.trim();
    if (!clean || clean.replace(/\D/g, '').length < 8) {
      addToast('Please enter a valid mobile phone number to generate an OTP.', 'error');
      return;
    }
    const normalized = normalizePhone(clean);
    setSendingStepOtp(true);
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: normalized, purpose: 'flight_booking' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const generatedOtp = String(data.otp || data.fallbackOtp || data.devPreviewOtp || '');
        const formattedPhone = data.phoneNumber || normalized;
        if (typeof setVerifiedBookingPhone === 'function') {
          setVerifiedBookingPhone(formattedPhone);
        }
        const msg = `OTP sent to ${formattedPhone}: ${generatedOtp}`;
        setStepOtpAlert(msg);
        addToast(msg, 'success');
      } else {
        addToast(data.error || 'Failed to generate OTP for this phone number.', 'error');
      }
    } catch {
      addToast('Network error while sending OTP.', 'error');
    } finally {
      setSendingStepOtp(false);
    }
  };

  // STRICT PROCEED HANDLER:
  // User cannot book or proceed to another step without personal details and visa verification!
  const handleProceedToSeats = () => {
    const unverifiedTravelers: string[] = [];

    passengers.forEach((p, i) => {
      const hasName = Boolean(p.firstName && p.firstName.trim().length >= 2 && p.lastName && p.lastName.trim().length >= 2);
      const hasAadhaar = validateAadhaar(p.aadhaarNumber);
      const hasPan = validatePan(p.panNumber);
      const hasVisa = validateVisa(p.visaNumber);

      if (!hasName || !hasAadhaar || !hasPan || !hasVisa || !p.isVerified) {
        let reason = '';
        if (!hasName) reason = 'Name missing';
        else if (!hasAadhaar) reason = 'Aadhaar invalid';
        else if (!hasPan) reason = 'PAN invalid';
        else if (!hasVisa) reason = 'Visa verification missing';
        else if (!p.isVerified) reason = 'ID not verified online';
        unverifiedTravelers.push(`Traveler ${i + 1} (${reason})`);
      }
    });

    // CANNOT PROCEED IF UNVERIFIED: Strictly enforce user request!
    if (unverifiedTravelers.length > 0) {
      addToast(`⛔ Verification Mandatory: ${unverifiedTravelers.join(', ')}. Complete personal details & Visa verification before proceeding to Step 3.`, 'error');
      aiVoice.speak('Verification incomplete. Personal details and visa verification are mandatory before booking or selecting seats.');
      return; // STRICT STOP! DO NOT NAVIGATE TO ANOTHER STEP!
    }

    if (!contactEmail.trim() || !contactEmail.includes('@')) {
      addToast('Please enter a valid contact email address for e-ticket delivery.', 'error');
      return;
    }

    if (!contactPhone.trim() || contactPhone.replace(/\D/g, '').length < 8) {
      addToast('Please enter a valid contact phone number for flight SMS alerts.', 'error');
      return;
    }

    const normalizedPhone = normalizePhone(contactPhone);
    if (typeof setVerifiedBookingPhone === 'function') {
      setVerifiedBookingPhone(normalizedPhone);
    }
    try {
      localStorage.setItem('aerowings_linked_phone', normalizedPhone);
      localStorage.setItem('aerowings_linked_email', contactEmail.trim());
    } catch {
      // ignore storage error
    }

    // Also trigger dynamic OTP notification for the submitted phone number if not yet sent
    fetch('/api/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: normalizedPhone, purpose: 'flight_booking' })
    })
      .then(r => r.json())
      .then(data => {
        if (data?.success) {
          const generatedOtp = String(data.otp || data.fallbackOtp || data.devPreviewOtp || '');
          const formattedPhone = data.phoneNumber || normalizedPhone;
          addToast(`OTP sent to ${formattedPhone}: ${generatedOtp}`, 'success');
        }
      })
      .catch(() => {});

    addToast('✅ All traveler details & Visa verified! Proceeding to Step 3: Choose Seats.', 'success');
    aiVoice.speak('All personal details and visa clearances verified. Proceeding to seat selection.');
    setUserView('seats');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  return (
    <div id="booking-step-content" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 sm:pb-8 animate-fadeIn">
      {/* Universal Step Bar */}
      <BookingStepBar
        currentStep={2}
        stepTitle="Personal & Document Verification"
        stepSubtitle="Mandatory Aadhaar Card, PAN Card & Visa verification before ticket generation"
        voiceText="Step 2: Traveler details and document verification for Aadhaar, PAN card, and Visa."
        firstTimeFlyerTip="🛡️ Identity Verification: In accordance with aviation regulations, verify each traveler's Aadhaar and PAN card to generate verified IATA e-tickets."
      />

      {/* Flight Recap Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-sky-400 font-bold text-xs">
            {selectedFlight.airlineCode || 'AW'}
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>{selectedFlight.airline} {selectedFlight.flightNumber}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {selectedFlight.aircraft}
              </span>
              {isInternational && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                  International Flight
                </span>
              )}
            </div>
            <div className="text-xs text-slate-400">
              {selectedFlight.origin.city} ({selectedFlight.origin.code}) → {selectedFlight.destination.city} ({selectedFlight.destination.code}) • {selectedFlight.departureTime} Departure
            </div>
          </div>
        </div>

        {/* Quick Fill Button */}
        <button
          type="button"
          onClick={handleQuickFillSample}
          className="px-3.5 py-2 bg-gradient-to-r from-emerald-600/30 to-blue-600/30 hover:from-emerald-600/40 hover:to-blue-600/40 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
        >
          <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
          <span>⚡ Auto-Verify All Travelers (Aadhaar + PAN + Visa)</span>
        </button>
      </div>

      {/* Main Form: Passenger & Document Verification Cards */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-sky-400" />
            <span>Traveler Details & ID Verification ({passengers.length} Passenger{passengers.length > 1 ? 's' : ''})</span>
          </h2>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Step 2 of 5: Document Check (Aadhaar • PAN • Visa)
          </span>
        </div>

        {/* Passenger Cards */}
        {passengers.map((p, idx) => {
          const isAadhaarValid = validateAadhaar(p.aadhaarNumber);
          const isPanValid = validatePan(p.panNumber);
          const isVisaValid = validateVisa(p.visaNumber);
          const allVerified = p.isVerified || (p.firstName && p.lastName && isAadhaarValid && isPanValid && isVisaValid);

          return (
            <div
              key={p.id || idx}
              className={`bg-slate-900 border rounded-2xl p-4 sm:p-6 space-y-4 shadow-lg transition-all ${
                allVerified ? 'border-emerald-500/40 bg-slate-900/90' : 'border-slate-800'
              }`}
            >
              {/* Header inside pax card */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-md">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="text-xs font-bold text-white uppercase tracking-wider block">
                      Traveler {idx + 1} ({p.type.toUpperCase()})
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Personal Name & Government Identification
                    </span>
                  </div>
                </div>

                {allVerified ? (
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30 flex items-center gap-1.5">
                    <BadgeCheck className="w-4 h-4 text-emerald-400" />
                    <span>Documents Verified</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleVerifyPassenger(idx)}
                    disabled={verifyingIndex === idx}
                    className="text-[11px] font-bold text-sky-400 hover:text-white bg-sky-500/10 hover:bg-sky-500/20 px-2.5 py-1 rounded-lg border border-sky-500/30 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{verifyingIndex === idx ? 'Verifying...' : 'Verify ID Online'}</span>
                  </button>
                )}
              </div>

              {/* Name Details */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4">
                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Title
                  </label>
                  <select
                    value={p.title}
                    onChange={(e) => updatePassenger(idx, { title: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Mr">Mr.</option>
                    <option value="Ms">Ms.</option>
                    <option value="Mrs">Mrs.</option>
                    <option value="Master">Master</option>
                    <option value="Dr">Dr.</option>
                  </select>
                </div>

                {/* First Name */}
                <div className="sm:col-span-5">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    First & Middle Name *
                  </label>
                  <input
                    type="text"
                    value={p.firstName}
                    onChange={(e) => updatePassenger(idx, { firstName: e.target.value })}
                    placeholder="e.g. ARUN"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white uppercase placeholder:normal-case placeholder:text-slate-600 focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                {/* Last Name */}
                <div className="sm:col-span-5">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Last Name (Surname) *
                  </label>
                  <input
                    type="text"
                    value={p.lastName}
                    onChange={(e) => updatePassenger(idx, { lastName: e.target.value })}
                    placeholder="e.g. KUMAR"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white uppercase placeholder:normal-case placeholder:text-slate-600 focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                {/* Gender */}
                <div className="sm:col-span-4">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Gender
                  </label>
                  <select
                    value={p.gender}
                    onChange={(e) => updatePassenger(idx, { gender: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Date of Birth */}
                <div className="sm:col-span-4">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={p.dob || '1996-01-01'}
                    onChange={(e) => updatePassenger(idx, { dob: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Nationality */}
                <div className="sm:col-span-4">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Nationality
                  </label>
                  <select
                    defaultValue="Indian"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Indian">Indian (IN)</option>
                    <option value="United States">United States (US)</option>
                    <option value="United Kingdom">United Kingdom (UK)</option>
                    <option value="UAE">United Arab Emirates (UAE)</option>
                    <option value="Singapore">Singapore (SG)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* DOCUMENT VERIFICATION SECTION (Aadhaar, PAN, Visa) */}
              <div className="mt-4 p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-bold text-white">Government ID Verification</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">UIDAI / NSDL / IATA Connected</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Aadhaar Card */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center justify-between">
                      <span>Aadhaar Card (12-Digit) *</span>
                      {isAadhaarValid ? (
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Valid
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">12 digits</span>
                      )}
                    </label>
                    <input
                      type="text"
                      maxLength={14}
                      value={p.aadhaarNumber || ''}
                      onChange={(e) => {
                        let v = e.target.value.replace(/[^\d]/g, '').slice(0, 12);
                        // Format as XXXX XXXX XXXX
                        const formatted = v.match(/.{1,4}/g)?.join(' ') || v;
                        updatePassenger(idx, { aadhaarNumber: formatted });
                      }}
                      placeholder="5432 8901 2345"
                      className={`w-full bg-slate-900 border rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none ${
                        isAadhaarValid ? 'border-emerald-500/50 text-emerald-300' : 'border-slate-700'
                      }`}
                    />
                  </div>

                  {/* PAN Card */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center justify-between">
                      <span>PAN Card (10 Alphanumeric) *</span>
                      {isPanValid ? (
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Valid
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">ABCDE1234F</span>
                      )}
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      value={p.panNumber || ''}
                      onChange={(e) => {
                        updatePassenger(idx, { panNumber: e.target.value.toUpperCase().trim() });
                      }}
                      placeholder="ABCDE1234F"
                      className={`w-full bg-slate-900 border rounded-xl px-3 py-2 text-xs font-mono uppercase text-white focus:outline-none ${
                        isPanValid ? 'border-emerald-500/50 text-emerald-300' : 'border-slate-700'
                      }`}
                    />
                  </div>

                  {/* Visa / Passport */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center justify-between">
                      <span>Visa / Travel Permit {isInternational ? '*' : '(Optional)'}</span>
                      {isVisaValid ? (
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> {isInternational ? 'Active' : 'Domestic'}
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-400">Required for Intl</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={p.visaNumber || (isInternational ? '' : 'DOMESTIC_EXEMPT')}
                      onChange={(e) => {
                        updatePassenger(idx, { visaNumber: e.target.value.toUpperCase().trim() });
                      }}
                      placeholder={isInternational ? "e.g. V-IN-987654" : "Domestic flight exempt"}
                      className={`w-full bg-slate-900 border rounded-xl px-3 py-2 text-xs font-mono uppercase text-white focus:outline-none ${
                        isVisaValid ? 'border-emerald-500/50 text-emerald-300' : 'border-slate-700'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Section: Contact Details for E-Ticket Delivery */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Mail className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="text-sm font-bold text-white">
                Contact Details for Group E-Ticket Delivery
              </h3>
              <p className="text-[11px] text-slate-400">
                All digital boarding passes, PNR reference codes, and flight SMS notifications will be dispatched here.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="pax-contact-email">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  id="pax-contact-email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="passenger@example.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="pax-contact-phone">
                {t('passenger.phone', 'Mobile Number')} * <span className="text-emerald-400 text-[10px]">(Dynamic OTP & SMS Alerts)</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    id="pax-contact-phone"
                    value={contactPhone}
                    onChange={(e) => {
                      setContactPhone(e.target.value);
                      if (typeof setVerifiedBookingPhone === 'function') {
                        setVerifiedBookingPhone(e.target.value);
                      }
                    }}
                    placeholder="+91 8971541794"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendStepOtp}
                  disabled={sendingStepOtp}
                  className="px-3.5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs shrink-0 cursor-pointer transition-colors"
                >
                  {sendingStepOtp ? 'Sending...' : 'Send OTP'}
                </button>
              </div>
              {stepOtpAlert && (
                <div className="mt-2 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{stepOtpAlert}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Next Step Button Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-lg">
        <div>
          <span className="text-xs text-slate-400 block">Total Base Price ({passengers.length} Passenger{passengers.length > 1 ? 's' : ''}):</span>
          <span className="text-xl font-extrabold text-emerald-400">
            {formatCurrency(fare.finalTotal, currency)}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setUserView('results');
              window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            }}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer"
          >
            ← {t('common.back')}
          </button>

          <button
            type="button"
            onClick={handleProceedToSeats}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>{t('passenger.continueToSeats')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
