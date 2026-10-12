import React from 'react';
import { useAirline } from '../../context/AirlineContext';
import { useLanguage } from '../../context/LanguageContext';
import { BookingStepBar } from '../common/BookingStepBar';
import { MEAL_OPTIONS, BAGGAGE_OPTIONS } from '../../data/mockData';
import { formatCurrency } from '../../utils/airlineUtils';
import { aiVoice } from '../../utils/aiVoice';
import {
  Luggage,
  Coffee,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Battery,
  Shield,
  Utensils
} from 'lucide-react';

export const AddonsPage: React.FC = () => {
  const {
    selectedFlight,
    passengers,
    updatePassenger,
    hasInsurance,
    setHasInsurance,
    hasPriorityBoarding,
    setHasPriorityBoarding,
    calculateFareBreakdown,
    setUserView,
    currency,
    addToast
  } = useAirline();
  const { t } = useLanguage();

  if (!selectedFlight) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">No Flight Selected</h2>
        <button
          onClick={() => setUserView('results')}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl"
        >
          ← Back to Flight Results
        </button>
      </div>
    );
  }

  const fare = calculateFareBreakdown();

  const handleProceedToPayment = () => {
    aiVoice.speak('Add-ons saved. Proceeding to final Step 5: Review and Secure Payment.');
    setUserView('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 sm:pb-8">
      {/* Universal Step Progress Bar */}
      <BookingStepBar
        currentStep={4}
        stepTitle="Baggage & In-Flight Meals"
        stepSubtitle="Complimentary baggage included. Select optional hot meals and trip protection."
        voiceText="Step 4: Baggage and In-Flight Services. Every AeroWings ticket includes 7 kg cabin baggage and 15 kg check-in baggage for free. You can also pick gourmet hot meals and insurance."
        firstTimeFlyerTip="💡 Critical Baggage Tip for Travelers: Laptops, Mobile Phones, and Power Banks MUST be carried in your 7 kg Cabin Handbag only. Power banks are strictly prohibited inside check-in cargo bags by aviation safety rules."
      />

      {/* Free Included Baggage Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-emerald-950/40 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20 mb-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <Luggage className="w-5 h-5" />
            <span>Complimentary Baggage Included With Your Ticket</span>
          </div>
          <span className="text-[11px] font-black text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            ₹0 FREE (Included)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <div className="font-bold text-white flex items-center justify-between">
              <span>👜 Cabin / Hand Luggage</span>
              <span className="text-emerald-400 font-bold">7 kg / passenger</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Small backpack or cabin trolley bag fitting the overhead bin. Carry medicines and laptops here.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <div className="font-bold text-white flex items-center justify-between">
              <span>🧳 Check-in Luggage</span>
              <span className="text-emerald-400 font-bold">
                {fare.extraFreeBaggageKg > 0
                  ? `25 kg / passenger (15kg + ${fare.extraFreeBaggageKg}kg Student Free)`
                  : '15 kg / passenger'}
              </span>
            </div>
            <p className="text-slate-400 text-[11px]">
              {fare.extraFreeBaggageKg > 0
                ? 'Student Concession applied: Includes 15 kg standard + 10 kg extra student check-in baggage at ₹0 free!'
                : 'Drop this luggage at the airport airline counter during check-in. Retrieved upon arrival.'}
            </p>
          </div>
        </div>
      </div>

      {/* In-flight Meal Selection for Each Passenger */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Utensils className="w-5 h-5 text-sky-400" />
            <span>Chef-Crafted In-Flight Meals (Optional)</span>
          </div>
          <span className="text-[11px] text-slate-400">
            Freshly prepared hot meals served at 35,000 feet
          </span>
        </div>

        <div className="space-y-3">
          {passengers.map((p, idx) => (
            <div key={p.id || idx} className="p-3.5 sm:p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-blue-600/20 text-blue-400 font-bold text-xs flex items-center justify-center border border-blue-500/30">
                  {idx + 1}
                </span>
                <div>
                  <span className="font-bold text-xs text-white">
                    {p.firstName ? `${p.title} ${p.firstName} ${p.lastName}` : `Traveler ${idx + 1}`}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {p.meal ? `Selected: ${p.meal} (+₹${p.mealPrice || 0})` : 'Complimentary Snack Box & Tea/Coffee'}
                  </span>
                </div>
              </div>

              <div className="sm:w-72">
                <select
                  value={p.meal || ''}
                  onChange={(e) => {
                    const m = MEAL_OPTIONS.find(x => x.name === e.target.value);
                    updatePassenger(idx, {
                      meal: m ? m.name : undefined,
                      mealPrice: m ? m.price : 0,
                    });
                    if (m) addToast(`Selected ${m.name} for ${p.firstName || 'Traveler ' + (idx + 1)}`, 'info');
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="">Complimentary Snack Box (₹0 Included)</option>
                  {MEAL_OPTIONS.map(m => (
                    <option key={m.id} value={m.name}>
                      {m.icon} {m.name} (+₹{m.price})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Extra Baggage Packages */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Luggage className="w-5 h-5 text-sky-400" />
            <span>Pre-Book Extra Baggage (Save up to 40% vs Airport)</span>
          </div>
          <span className="text-xs text-amber-400 font-semibold">Online Discount Applied</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {BAGGAGE_OPTIONS.map((bag) => {
            const isSelected = passengers[0]?.extraBaggage === bag.weight;

            return (
              <button
                key={bag.id}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    updatePassenger(0, { extraBaggage: undefined, baggagePrice: 0 });
                  } else {
                    updatePassenger(0, { extraBaggage: bag.weight, baggagePrice: bag.price });
                    addToast(`Added ${bag.label || bag.weight} Extra Baggage (+₹${bag.price})`, 'info');
                  }
                }}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-md ring-2 ring-blue-500/40'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-white">{bag.label}</span>
                  <span className="text-xs font-black text-emerald-400">+{formatCurrency(bag.price, currency)}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Pre-purchased excess allowance for sports gear or heavy suitcases.
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Travel Protection & Priority Boarding */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Insurance */}
        <label
          className={`p-4 rounded-2xl border flex items-start gap-3.5 cursor-pointer transition-all shadow-lg ${
            hasInsurance
              ? 'bg-emerald-950/25 border-emerald-500/50 text-white ring-1 ring-emerald-500/30'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <input
            type="checkbox"
            checked={hasInsurance}
            onChange={(e) => {
              setHasInsurance(e.target.checked);
              addToast(e.target.checked ? 'Comprehensive Travel Insurance added' : 'Insurance removed', 'info');
            }}
            className="mt-1 rounded bg-slate-950 border-slate-700 text-emerald-600 focus:ring-0 cursor-pointer w-4 h-4"
          />
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>AI Weather & Medical Protection</span>
              </span>
              <span className="text-xs font-extrabold text-emerald-400">+₹249/pax</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              100% instant auto-refund for weather delays, baggage loss up to ₹25,000, and medical emergency cover.
            </p>
          </div>
        </label>

        {/* Priority Boarding */}
        <label
          className={`p-4 rounded-2xl border flex items-start gap-3.5 cursor-pointer transition-all shadow-lg ${
            hasPriorityBoarding
              ? 'bg-sky-950/25 border-sky-500/50 text-white ring-1 ring-sky-500/30'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <input
            type="checkbox"
            checked={hasPriorityBoarding}
            onChange={(e) => {
              setHasPriorityBoarding(e.target.checked);
              addToast(e.target.checked ? 'Priority Boarding added' : 'Priority Boarding removed', 'info');
            }}
            className="mt-1 rounded bg-slate-950 border-slate-700 text-sky-600 focus:ring-0 cursor-pointer w-4 h-4"
          />
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span>Priority Check-in & Fast Baggage</span>
              </span>
              <span className="text-xs font-extrabold text-sky-400">+₹350/pax</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Skip lines with dedicated AeroWings Priority counters and first-out baggage tags on the carousel.
            </p>
          </div>
        </label>
      </div>

      {/* Desktop Next Step Button Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4">
        <div>
          <span className="text-xs text-slate-400 block">Total Fare (Including Add-ons & Taxes):</span>
          <span className="text-xl font-extrabold text-emerald-400">
            {formatCurrency(fare.finalTotal, currency)}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setUserView('seats')}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer"
          >
            ← {t('common.back')}
          </button>

          <button
            type="button"
            onClick={handleProceedToPayment}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>{t('addons.continueToPayment')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sticky Bottom Action Bar for Smartphone Screens */}
      <div className="fixed bottom-0 left-0 right-0 z-30 sm:hidden bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-3 shadow-2xl">
        <div className="flex items-center justify-between gap-2 max-w-lg mx-auto">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Step 4: Total</span>
            <div className="text-base font-black text-emerald-400 leading-tight">
              {formatCurrency(fare.finalTotal, currency)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setUserView('seats')}
              className="px-3 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold border border-slate-700"
            >
              ← Back
            </button>

            <button
              type="button"
              onClick={handleProceedToPayment}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5"
            >
              <span>Review & Pay (Step 5) →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
