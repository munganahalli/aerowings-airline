import React, { useState, useEffect } from 'react';
import { useAirline } from '../../context/AirlineContext';
import { useLanguage } from '../../context/LanguageContext';
import { BookingStepBar } from '../common/BookingStepBar';
import { formatCurrency } from '../../utils/airlineUtils';
import { aiVoice } from '../../utils/aiVoice';
import { airlineDB } from '../../utils/airlineDatabase';
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



  // SPECIFIC RULE: Only flights flying from India to another country require Aadhaar, Visa, AND PAN Card verification before proceeding forward step!
  const isFlyingFromIndiaToAbroad = 
    selectedFlight.origin.country.toLowerCase() === 'india' && 
    selectedFlight.destination.country.toLowerCase() !== 'india';

  const isDomesticWithinIndia = 
    selectedFlight.origin.country.toLowerCase() === 'india' && 
    selectedFlight.destination.country.toLowerCase() === 'india';

  // Helper validation functions based on flight origin and destination
  const validateAadhaar = (num?: string): boolean => {
    if (!num) return false;
    const clean = num.replace(/\s+/g, '');
    return /^\d{12}$/.test(clean);
  };

  const validatePan = (pan?: string): boolean => {
    // Only required if flying from India to another country!
    if (!isFlyingFromIndiaToAbroad) return true;
    if (!pan) return false;
    return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.toUpperCase().trim());
  };

  const validateVisa = (visa?: string): boolean => {
    // Only required if flying from India to another country!
    if (!isFlyingFromIndiaToAbroad) return true;
    if (!visa || visa.trim().length < 6) return false;
    return true;
  };

  // Check if an individual passenger has all required documents verified
  const isPassengerFullyVerified = (p: typeof passengers[0]): boolean => {
    const hasName = Boolean(p.firstName && p.firstName.trim().length >= 2 && p.lastName && p.lastName.trim().length >= 2);
    if (!hasName) return false;

    // For flights flying from India to another country: Aadhaar + Visa + PAN Card MUST all be verified!
    if (isFlyingFromIndiaToAbroad) {
      const hasAadhaar = validateAadhaar(p.aadhaarNumber);
      const hasPan = validatePan(p.panNumber);
      const hasVisa = validateVisa(p.visaNumber);
      return Boolean(hasAadhaar && hasPan && hasVisa);
    }

    // For domestic flights within India: Aadhaar is required
    if (isDomesticWithinIndia) {
      return validateAadhaar(p.aadhaarNumber);
    }

    return true;
  };

  // Count unverified passengers
  const unverifiedCount = passengers.filter(p => !isPassengerFullyVerified(p)).length;
  const isAllVerified = unverifiedCount === 0;

  // Single Passenger Manual Verification Handler (User-triggered validation)
  const handleVerifyPassenger = (idx: number) => {
    const p = passengers[idx];
    if (!p.firstName || p.firstName.trim().length < 2) {
      addToast(`Traveler ${idx + 1}: Please enter First Name (minimum 2 characters).`, 'error');
      return;
    }
    if (!p.lastName || p.lastName.trim().length < 2) {
      addToast(`Traveler ${idx + 1}: Please enter Last Name / Surname.`, 'error');
      return;
    }

    // If flying from India to another country:
    if (isFlyingFromIndiaToAbroad) {
      if (!p.aadhaarNumber || !validateAadhaar(p.aadhaarNumber)) {
        addToast(`Traveler ${idx + 1}: Flying outside India requires a verified 12-digit Aadhaar Card.`, 'error');
        return;
      }
      if (!p.visaNumber || !validateVisa(p.visaNumber)) {
        addToast(`Traveler ${idx + 1}: Flying to ${selectedFlight.destination.country} requires a verified International Visa number.`, 'error');
        return;
      }
      if (!p.panNumber || !validatePan(p.panNumber)) {
        addToast(`Traveler ${idx + 1}: Flying outside India mandates a verified 10-character PAN Card (e.g. ABCDE1234F).`, 'error');
        return;
      }
    } else if (isDomesticWithinIndia) {
      if (!p.aadhaarNumber || !validateAadhaar(p.aadhaarNumber)) {
        addToast(`Traveler ${idx + 1}: Please enter a valid 12-digit Aadhaar Card number.`, 'error');
        return;
      }
    }

    setVerifyingIndex(idx);
    setTimeout(() => {
      updatePassenger(idx, {
        isVerified: true,
        visaStatus: isFlyingFromIndiaToAbroad ? 'Aadhaar, Visa & PAN Verified' : (isDomesticWithinIndia ? 'Exempt - Domestic Flight' : 'Verified'),
        verifiedAt: new Date().toISOString()
      });

      setVerifyingIndex(null);
      addToast(
        isFlyingFromIndiaToAbroad
          ? `✅ Traveler ${idx + 1} (${p.firstName} ${p.lastName}): Aadhaar, Visa & PAN Card Verified for travel to ${selectedFlight.destination.country}!`
          : `✅ Traveler ${idx + 1} (${p.firstName} ${p.lastName}): Documents Verified!`,
        'success'
      );
      aiVoice.speak(`Traveler ${idx + 1} verified.`);
    }, 350);
  };

  // Auto verify all travelers when user clicks 'Auto verify all travelers'
  const handleAutoVerifyAllTravelers = () => {
    passengers.forEach((_, idx) => {
      handleFillPassengerSample(idx);
    });
    addToast(
      isFlyingFromIndiaToAbroad
        ? '✅ Auto-verified all travelers: Aadhaar (12-digit), Visa, & PAN Card verified for departure from India!'
        : (isDomesticWithinIndia
            ? '✅ Auto-verified all travelers with 12-digit Aadhaar cards (Domestic Flight).'
            : '✅ Auto-verified all travelers successfully.'),
      'success'
    );
    aiVoice.speak('All travelers verified successfully.');
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
      panNumber: isFlyingFromIndiaToAbroad ? sample.pan : '',
      visaNumber: isFlyingFromIndiaToAbroad ? sample.visa : (isDomesticWithinIndia ? 'DOMESTIC_EXEMPT' : 'INTL_STANDARD'),
      visaStatus: isFlyingFromIndiaToAbroad ? 'Aadhaar, Visa & PAN Verified' : (isDomesticWithinIndia ? 'Exempt - Domestic Flight' : 'Verified'),
      isVerified: true,
      verifiedAt: new Date().toISOString()
    });
    addToast(
      isFlyingFromIndiaToAbroad
        ? `✅ Traveler ${idx + 1}: Aadhaar, Visa & PAN Verified for flight leaving India!`
        : `✅ Traveler ${idx + 1}: Verified!`,
      'success'
    );
    aiVoice.speak(`Traveler ${idx + 1} verified.`);
  };

  // AI Auto-Fill from previous bookings in airlineDB
  const handleAiAutoFillPrevious = () => {
    const pastBookings = airlineDB.getBookings();
    if (!pastBookings || pastBookings.length === 0) {
      addToast('No previous bookings found in your travel history. Using sample profile.', 'info');
      handleFillPassengerSample(0);
      return;
    }
    const lastBooking = pastBookings[0];
    if (lastBooking.contactEmail) setContactEmail(lastBooking.contactEmail);
    if (lastBooking.contactPhone) setContactPhone(lastBooking.contactPhone);

    if (lastBooking.passengers && lastBooking.passengers.length > 0) {
      lastBooking.passengers.forEach((p, idx) => {
        if (idx < passengers.length) {
          updatePassenger(idx, {
            title: p.title || 'Mr',
            firstName: p.firstName || 'Traveler',
            lastName: p.lastName || 'Passenger',
            gender: p.gender || 'Male',
            aadhaarNumber: '5412 7890 2341',
            panNumber: isDomesticWithinIndia ? '' : 'ABCDE1234F',
            visaNumber: isDomesticWithinIndia ? 'DOMESTIC_EXEMPT' : 'V-IN-987654',
            visaStatus: isDomesticWithinIndia ? 'Exempt - Domestic Flight' : 'Verified',
            isVerified: true
          });
        }
      });
      addToast(`✨ AI Successfully auto-filled details from your previous booking (PNR: ${lastBooking.pnr})!`, 'success');
      aiVoice.speak('Passenger details auto-filled by AI from your previous booking history.');
    } else {
      handleFillPassengerSample(0);
    }
  };

  const normalizePhone = (raw: string) => {
    const cleaned = raw.trim();
    const digits = cleaned.replace(/\D/g, '');
    if (cleaned.startsWith('+')) return `+${digits}`;
    if (digits.length === 10) return `+91${digits}`;
    if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
    return `+${digits}`;
  };

  // STRICT PROCEED HANDLER:
  // For flights flying from India to another country: verify Aadhaar, Visa, Pan Card THEN ONLY proceed forward step!
  const handleProceedToSeats = () => {
    const unverifiedTravelers: string[] = [];

    passengers.forEach((p, i) => {
      const hasName = Boolean(p.firstName && p.firstName.trim().length >= 2 && p.lastName && p.lastName.trim().length >= 2);
      const hasAadhaar = validateAadhaar(p.aadhaarNumber);
      const hasVisa = !isFlyingFromIndiaToAbroad || validateVisa(p.visaNumber);
      const hasPan = !isFlyingFromIndiaToAbroad || validatePan(p.panNumber);

      if (!hasName) {
        unverifiedTravelers.push(`Traveler ${i + 1} (Name missing)`);
      } else if (!hasAadhaar) {
        unverifiedTravelers.push(`Traveler ${i + 1} (Aadhaar 12 digits missing/invalid)`);
      } else if (isFlyingFromIndiaToAbroad && !validateVisa(p.visaNumber)) {
        unverifiedTravelers.push(`Traveler ${i + 1} (Visa number missing/invalid for travel to ${selectedFlight.destination.country})`);
      } else if (isFlyingFromIndiaToAbroad && !validatePan(p.panNumber)) {
        unverifiedTravelers.push(`Traveler ${i + 1} (PAN Card 10-char missing/invalid)`);
      } else {
        // Automatically ensure verified flag is set for valid inputs
        if (!p.isVerified) {
          updatePassenger(i, {
            isVerified: true,
            visaStatus: isFlyingFromIndiaToAbroad ? 'Aadhaar, Visa & PAN Verified' : (isDomesticWithinIndia ? 'Exempt - Domestic Flight' : 'Verified'),
            verifiedAt: new Date().toISOString()
          });
        }
      }
    });

    if (unverifiedTravelers.length > 0) {
      addToast(
        isFlyingFromIndiaToAbroad
          ? `⛔ Flights from India to ${selectedFlight.destination.country} mandate Aadhaar, Visa & PAN Card! Please verify: ${unverifiedTravelers.join(', ')}`
          : `⛔ Verification Incomplete: ${unverifiedTravelers.join(', ')}. Please complete required documents before proceeding.`,
        'error'
      );
      aiVoice.speak(
        isFlyingFromIndiaToAbroad
          ? 'Aadhaar, Visa, and Pan Card verification is required to proceed.'
          : 'Verification incomplete. Please enter valid passenger identification details.'
      );
      return; // STRICT STOP!
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

    addToast('✅ All traveler documents verified! Proceeding to Step 3: Choose Seats.', 'success');
    aiVoice.speak('All traveler details verified. Proceeding to seat selection.');
    setUserView('seats');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  return (
    <div id="booking-step-content" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 sm:pb-8 animate-fadeIn">
      {/* Universal Step Bar */}
      <BookingStepBar
        currentStep={2}
        stepTitle="Personal & Document Verification"
        stepSubtitle={
          isDomesticWithinIndia
            ? 'Intra-India Flight: Only 12-Digit Aadhaar Card verification required (No PAN or Visa needed)'
            : 'International Flight: Mandatory Aadhaar Card, PAN Card & Visa verification before ticket generation'
        }
        voiceText={
          isDomesticWithinIndia
            ? 'Step 2: Traveler details and Aadhaar verification for domestic flight.'
            : 'Step 2: Traveler details, Aadhaar, PAN card, and international Visa verification.'
        }
        firstTimeFlyerTip={
          isDomesticWithinIndia
            ? '🛡️ Domestic Travel Verification: Enter a valid 12-digit Aadhaar Card for each traveler. PAN and Visa are exempt.'
            : "🛡️ International Travel Verification: Government mandates Aadhaar, PAN, and Visa verification for overseas travel."
        }
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
              {isDomesticWithinIndia ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  🇮🇳 Domestic India Flight (Aadhaar Only)
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                  ✈️ International Flight (Aadhaar + PAN + Visa)
                </span>
              )}
            </div>
            <div className="text-xs text-slate-400">
              {selectedFlight.origin.city} ({selectedFlight.origin.code}) → {selectedFlight.destination.city} ({selectedFlight.destination.code}) • {selectedFlight.departureTime} Departure
            </div>
          </div>
        </div>

        {/* Quick Fill / Auto-Verify Button */}
        <button
          type="button"
          onClick={handleAutoVerifyAllTravelers}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-600/30 to-blue-600/30 hover:from-emerald-600/40 hover:to-blue-600/40 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
        >
          <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
          <span>
            {isDomesticWithinIndia
              ? '⚡ Auto-Verify All Travelers (Aadhaar Only)'
              : '⚡ Auto-Verify All Travelers (Aadhaar + PAN + Visa)'}
          </span>
        </button>
      </div>

      {/* AI Auto-Fill Repeat Booking Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-slate-900 border border-blue-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">AI Repeat Traveler Memory</h4>
            <p className="text-[11px] text-slate-300">Have you booked before? Instantly auto-fill your profile & visa documents using AI past history.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAiAutoFillPrevious}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white text-xs font-extrabold rounded-xl shadow-md transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>✨ AI Auto-Fill from Past Booking</span>
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
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-bold text-white">Government ID Verification</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">UIDAI / NSDL / IATA Connected</span>
                </div>

                <div className={`grid grid-cols-1 ${!isFlyingFromIndiaToAbroad ? 'sm:grid-cols-1 max-w-md' : 'sm:grid-cols-3'} gap-3`}>
                  {/* Aadhaar Card */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                      <span>Aadhaar Card (12-Digit) *</span>
                      {isAadhaarValid ? (
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Valid UIDAI
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">12 digits required</span>
                      )}
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        maxLength={14}
                        value={p.aadhaarNumber || ''}
                        onChange={(e) => {
                          const v = e.target.value.replace(/[^\d]/g, '').slice(0, 12);
                          const formatted = v.match(/.{1,4}/g)?.join(' ') || v;
                          const isValidNow = v.length === 12;
                          updatePassenger(idx, {
                            aadhaarNumber: formatted,
                            isVerified: !isFlyingFromIndiaToAbroad ? (isValidNow && Boolean(p.firstName && p.lastName)) : p.isVerified
                          });
                        }}
                        placeholder="5432 8901 2345"
                        className={`w-full bg-slate-900 border rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none ${
                          isAadhaarValid ? 'border-emerald-500/50 text-emerald-300' : 'border-slate-700'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (isAadhaarValid) {
                            addToast(`Traveler ${idx + 1}: Aadhaar Card ${p.aadhaarNumber} verified successfully via UIDAI!`, 'success');
                            if (!isFlyingFromIndiaToAbroad) {
                              updatePassenger(idx, { isVerified: true, visaStatus: 'Exempt - Domestic Flight' });
                            }
                          } else {
                            addToast(`Traveler ${idx + 1}: Please enter a full 12-digit Aadhaar number before verifying.`, 'error');
                          }
                        }}
                        className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold border transition-colors cursor-pointer shrink-0 ${
                          isAadhaarValid
                            ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        Verify
                      </button>
                    </div>
                  </div>

                  {isFlyingFromIndiaToAbroad && (
                    <>
                      {/* PAN Card */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                          <span>PAN Card (10 Alphanumeric) *</span>
                          {isPanValid ? (
                            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                              <Check className="w-3 h-3" /> Valid NSDL
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500">ABCDE1234F</span>
                          )}
                        </label>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            maxLength={10}
                            value={p.panNumber || ''}
                            onChange={(e) => {
                              const v = e.target.value.toUpperCase().trim();
                              updatePassenger(idx, { panNumber: v });
                            }}
                            placeholder="ABCDE1234F"
                            className={`w-full bg-slate-900 border rounded-xl px-3 py-2 text-xs font-mono uppercase text-white focus:outline-none ${
                              isPanValid ? 'border-emerald-500/50 text-emerald-300' : 'border-slate-700'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (isPanValid) {
                                addToast(`Traveler ${idx + 1}: PAN Card ${p.panNumber} verified successfully via NSDL portal!`, 'success');
                              } else {
                                addToast(`Traveler ${idx + 1}: Please enter a valid 10-character PAN Card (e.g. ABCDE1234F).`, 'error');
                              }
                            }}
                            className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold border transition-colors cursor-pointer shrink-0 ${
                              isPanValid
                                ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300'
                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                            }`}
                          >
                            Verify
                          </button>
                        </div>
                      </div>

                      {/* Visa / Passport */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                          <span>Visa / Travel Permit *</span>
                          {isVisaValid ? (
                            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                              <Check className="w-3 h-3" /> Valid IATA
                            </span>
                          ) : (
                            <span className="text-[10px] text-amber-400">Required for Intl</span>
                          )}
                        </label>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={p.visaNumber || ''}
                            onChange={(e) => {
                              const v = e.target.value.toUpperCase().trim();
                              updatePassenger(idx, { visaNumber: v });
                            }}
                            placeholder="e.g. V-IN-987654"
                            className={`w-full bg-slate-900 border rounded-xl px-3 py-2 text-xs font-mono uppercase text-white focus:outline-none ${
                              isVisaValid ? 'border-emerald-500/50 text-emerald-300' : 'border-slate-700'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (isVisaValid) {
                                addToast(`Traveler ${idx + 1}: International Visa ${p.visaNumber} cleared with IATA travel database!`, 'success');
                              } else {
                                addToast(`Traveler ${idx + 1}: Please enter a valid Visa number (minimum 6 characters).`, 'error');
                              }
                            }}
                            className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold border transition-colors cursor-pointer shrink-0 ${
                              isVisaValid
                                ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300'
                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                            }`}
                          >
                            Verify
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 flex-wrap gap-2">
                  {isDomesticWithinIndia ? (
                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Domestic Flight (India): Only 12-digit Aadhaar Card is required. PAN and Visa are not needed.</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-purple-300 text-xs">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-purple-400" />
                      <span>International Flight: Aadhaar, PAN card, and International Visa must all be verified.</span>
                    </div>
                  )}

                  {/* Manual verify button for traveler */}
                  <button
                    type="button"
                    onClick={() => handleVerifyPassenger(idx)}
                    disabled={verifyingIndex === idx}
                    className="px-3 py-1.5 rounded-xl bg-sky-600/30 hover:bg-sky-600/50 border border-sky-400/50 text-sky-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ml-auto"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                    <span>{verifyingIndex === idx ? 'Verifying...' : `Verify Traveler ${idx + 1} Documents`}</span>
                  </button>
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
                {t('passenger.phone', 'Mobile Number')} * <span className="text-emerald-400 text-[10px]">(Direct SMS E-Ticket & Gate Alerts)</span>
              </label>
              <div className="relative">
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
            className={`px-6 py-3 text-xs font-extrabold rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer ${
              isFlyingFromIndiaToAbroad && !isAllVerified
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30 ring-2 ring-amber-400/50'
                : 'bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white shadow-blue-500/25'
            }`}
          >
            <span>
              {isFlyingFromIndiaToAbroad && !isAllVerified
                ? `Verify Aadhaar, Visa & PAN (${unverifiedCount} Left) to Proceed`
                : t('passenger.continueToSeats')}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
