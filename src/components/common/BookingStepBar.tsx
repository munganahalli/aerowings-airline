import React from 'react';
import { useAirline } from '../../context/AirlineContext';
import { UserView } from '../../types/airline';
import { aiVoice } from '../../utils/aiVoice';
import { 
  CheckCircle, 
  Plane, 
  User, 
  Armchair, 
  Luggage, 
  CreditCard, 
  Volume2, 
  HelpCircle,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface BookingStepBarProps {
  currentStep: number; // 1 to 5
  stepTitle: string;
  stepSubtitle?: string;
  voiceText?: string;
  firstTimeFlyerTip?: string;
}

export const BookingStepBar: React.FC<BookingStepBarProps> = ({
  currentStep,
  stepTitle,
  stepSubtitle,
  voiceText,
  firstTimeFlyerTip
}) => {
  const { userView, setUserView, selectedFlight, passengers } = useAirline();
  const [showTip, setShowTip] = React.useState(false);

  const steps = [
    { number: 1, title: 'Flight', view: 'results' as UserView, icon: Plane, desc: 'Selected Flight' },
    { number: 2, title: 'Travelers', view: 'passengers' as UserView, icon: User, desc: 'ID & Contact Info' },
    { number: 3, title: 'Seats', view: 'seats' as UserView, icon: Armchair, desc: 'Cabin Layout' },
    { number: 4, title: 'Add-ons', view: 'addons' as UserView, icon: Luggage, desc: 'Baggage & Meals' },
    { number: 5, title: 'Payment', view: 'payment' as UserView, icon: CreditCard, desc: 'Review & Pay' },
  ];

  const handleStepClick = (stepNum: number, view: UserView) => {
    // Only allow clicking to past completed steps or current step
    if (stepNum <= currentStep) {
      setUserView(view);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePlayVoice = () => {
    if (voiceText) {
      aiVoice.speak(voiceText);
    } else {
      aiVoice.speak(`Step ${currentStep} of 5: ${stepTitle}. Please complete the required details to continue your reservation.`);
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Step Progress Container */}
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl">
        
        {/* Desktop / Tablet Step Trail */}
        <div className="hidden md:flex items-center justify-between relative">
          {/* Background Track */}
          <div className="absolute top-5 left-8 right-8 h-0.5 bg-slate-800 -z-0"></div>
          {/* Active Fill Track */}
          <div 
            className="absolute top-5 left-8 h-0.5 bg-gradient-to-r from-blue-500 to-sky-400 -z-0 transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          ></div>

          {steps.map((step) => {
            const isCompleted = step.number < currentStep;
            const isCurrent = step.number === currentStep;
            const isUpcoming = step.number > currentStep;
            const Icon = step.icon;

            return (
              <button
                key={step.number}
                type="button"
                onClick={() => handleStepClick(step.number, step.view)}
                disabled={isUpcoming}
                className={`relative z-10 flex flex-col items-center group transition-all ${
                  isUpcoming ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                }`}
              >
                {/* Step Circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 border-2 border-emerald-400'
                      : isCurrent
                      ? 'bg-gradient-to-tr from-blue-600 to-sky-400 text-white ring-4 ring-blue-500/30 scale-110 shadow-lg shadow-blue-500/30 border-2 border-white'
                      : 'bg-slate-950 text-slate-400 border-2 border-slate-800'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>

                {/* Step Labels */}
                <div className="text-center mt-2">
                  <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                    Step {step.number}
                  </div>
                  <div
                    className={`text-xs font-bold transition-colors ${
                      isCurrent ? 'text-sky-300' : isCompleted ? 'text-slate-200' : 'text-slate-500'
                    }`}
                  >
                    {step.title}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Mobile Smartphone View: Compact Step Progress Card */}
        <div className="md:hidden space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-xs font-black shadow-sm">
                STEP {currentStep} OF 5
              </span>
              <span className="text-xs font-bold text-white tracking-wide truncate max-w-[170px]">
                {stepTitle}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePlayVoice}
                className="p-2 rounded-xl bg-slate-800 text-sky-400 hover:text-sky-300 hover:bg-slate-700 active:scale-95 border border-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                title="Listen to audio instructions"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span className="text-[10px] hidden xs:inline">Audio Guide</span>
              </button>

              {firstTimeFlyerTip && (
                <button
                  type="button"
                  onClick={() => setShowTip(!showTip)}
                  className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    showTip 
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' 
                      : 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
                  }`}
                  title="First-Time Flyer Helper"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span className="text-[10px] hidden xs:inline">Flyer Tip</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Progress Bar Fill */}
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-sky-400 to-emerald-400 transition-all duration-300 rounded-full"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            ></div>
          </div>

          {/* Quick Breadcrumbs for Mobile */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
            <span>
              {currentStep > 1 ? (
                <button
                  onClick={() => handleStepClick(currentStep - 1, steps[currentStep - 2].view)}
                  className="text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  ← Back to Step {currentStep - 1}: {steps[currentStep - 2].title}
                </button>
              ) : (
                <button
                  onClick={() => setUserView('results')}
                  className="text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  ← Change Flight
                </button>
              )}
            </span>
            <span className="text-slate-400 font-mono">
              {currentStep === 5 ? 'Final Step' : `Next: ${steps[currentStep]?.title || 'Done'}`}
            </span>
          </div>
        </div>

        {/* Desktop Audio & Tip Bar */}
        <div className="hidden md:flex items-center justify-between pt-3 mt-3 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              {stepSubtitle || 'Complete each step in order for instant confirmed e-ticket.'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePlayVoice}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-sky-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Listen to Step Instructions</span>
            </button>

            {firstTimeFlyerTip && (
              <button
                type="button"
                onClick={() => setShowTip(!showTip)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  showTip 
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' 
                    : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-amber-400'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{showTip ? 'Hide First-Time Flyer Tip' : '💡 First-Time Flyer Advice'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Expandable First-Time Flyer Guidance Notice */}
      {firstTimeFlyerTip && (showTip || currentStep === 2) && (
        <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border border-amber-500/40 rounded-2xl p-4 text-xs text-amber-200/95 space-y-1.5 shadow-lg animate-fadeIn">
          <div className="flex items-center justify-between font-bold text-amber-400">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Traveler Guidance (First-Time Flyer Helper)</span>
            </span>
            <button 
              onClick={() => setShowTip(false)}
              className="text-amber-400/80 hover:text-amber-300 text-[11px] underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
          <p className="leading-relaxed text-slate-300">
            {firstTimeFlyerTip}
          </p>
        </div>
      )}
    </div>
  );
};
