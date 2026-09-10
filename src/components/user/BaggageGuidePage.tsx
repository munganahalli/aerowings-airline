import React, { useState } from 'react';
import { useAirline } from '../../context/AirlineContext';
import { 
  Luggage, 
  ShieldAlert, 
  CheckCircle2, 
  HelpCircle, 
  Search, 
  AlertTriangle, 
  Scale, 
  Clock, 
  Plane, 
  ArrowRight,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { AIRPORTS } from '../../data/mockData';

export const BaggageGuidePage: React.FC = () => {
  const { setUserView, showToast } = useAirline();

  // Baggage Calculator State
  const [calcClass, setCalcClass] = useState<'economy' | 'premium_economy' | 'business' | 'first'>('economy');
  const [isInternational, setIsInternational] = useState(false);

  // Baggage Tracer State
  const [pirNumber, setPirNumber] = useState('');
  const [tracingResult, setTracingResult] = useState<{
    found: boolean;
    tag: string;
    pnr: string;
    location: string;
    status: string;
    carousel: string;
    estimatedDelivery: string;
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const allowances = {
    economy: {
      cabin: isInternational ? '1 Bag (7 kg) • Max 55×35×25 cm' : '1 Bag (7 kg) • Max 55×35×25 cm',
      checked: isInternational ? '2 Pieces (23 kg each / 46 kg total)' : '1 Piece (15 kg to 20 kg)',
      personal: '1 Small laptop bag or handbag (up to 3 kg)'
    },
    premium_economy: {
      cabin: '1 Bag (10 kg) • Max 55×35×25 cm',
      checked: isInternational ? '2 Pieces (28 kg each / 56 kg total)' : '1 Piece (25 kg)',
      personal: '1 Laptop bag or camera backpack (up to 4 kg)'
    },
    business: {
      cabin: '2 Bags (12 kg total) • Max 55×35×25 cm each',
      checked: isInternational ? '2 Pieces (32 kg each / 64 kg total)' : '2 Pieces (35 kg total)',
      personal: '1 Laptop briefcase or suit garment carrier'
    },
    first: {
      cabin: '2 Bags (14 kg total) • Priority overhead bins',
      checked: isInternational ? '3 Pieces (32 kg each / 96 kg total)' : '2 Pieces (40 kg total)',
      personal: '1 Garment bag + luxury personal item'
    }
  };

  const currentAllowance = allowances[calcClass];

  const handleTraceBaggage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pirNumber.trim()) {
      showToast('Please enter your 10-digit PIR reference number or Bag Tag', 'error');
      return;
    }

    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setTracingResult({
        found: true,
        tag: pirNumber.toUpperCase(),
        pnr: 'AW792K',
        location: 'London Heathrow (LHR) • Terminal 2 Baggage Hall',
        status: 'Unloaded from Aircraft • Re-routing onto Priority Carousel',
        carousel: 'Belt 04 (Priority Lane)',
        estimatedDelivery: 'Ready for Collection in approx. 12 mins'
      });
      showToast('Baggage location telemetry retrieved successfully!', 'success');
    }, 1000);
  };

  return (
    <div className="min-w-0 bg-slate-950 text-slate-100 pb-20">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-b border-slate-800 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold mb-4">
            <Luggage className="w-3.5 h-3.5" />
            <span>AeroWings Global Baggage Guide & Tracer</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Pack Smart, Travel Worry-Free
          </h1>
          <p className="max-w-2xl mx-auto text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
            Check your cabin & checked-in luggage allowances, pre-purchase excess weight at up to 40% discount, and track checked bags in real-time.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-16">
        {/* SECTION 1: INTERACTIVE BAGGAGE CALCULATOR */}
        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Baggage Allowance Calculator
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm">
              Select your travel route and cabin class to view exact weight and dimension limits.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {/* Route Type Toggle */}
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsInternational(false)}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                  !isInternational
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Domestic Flights
              </button>
              <button
                type="button"
                onClick={() => setIsInternational(true)}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                  isInternational
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                International Flights
              </button>
            </div>

            {/* Cabin Class Selection */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(['economy', 'premium_economy', 'business', 'first'] as const).map((cls) => (
                <button
                  key={cls}
                  type="button"
                  onClick={() => setCalcClass(cls)}
                  className={`py-3 px-3 rounded-xl border text-center transition-all ${
                    calcClass === cls
                      ? 'bg-blue-600/20 border-blue-500 text-white font-bold shadow-lg shadow-blue-500/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs uppercase text-slate-400">Class</div>
                  <div className="text-sm font-semibold capitalize mt-0.5">
                    {cls === 'economy' && 'Economy'}
                    {cls === 'premium_economy' && 'Premium'}
                    {cls === 'business' && 'Business'}
                    {cls === 'first' && 'First'}
                  </div>
                </button>
              ))}
            </div>

            {/* Calculated Allowances Result Box */}
            <div className="bg-slate-950 p-6 sm:p-8 rounded-2xl border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border-b md:border-b-0 md:border-r border-slate-800 pb-4 md:pb-0 md:pr-4">
                <div className="flex items-center gap-2 text-sky-400 mb-2">
                  <Luggage className="w-5 h-5" />
                  <span className="text-xs uppercase font-bold tracking-wider">Cabin Hand Baggage</span>
                </div>
                <div className="text-base font-bold text-white mb-1">{currentAllowance.cabin}</div>
                <p className="text-xs text-slate-400">Must fit in overhead compartment</p>
              </div>

              <div className="border-b md:border-b-0 md:border-r border-slate-800 pb-4 md:pb-0 md:pr-4">
                <div className="flex items-center gap-2 text-emerald-400 mb-2">
                  <Scale className="w-5 h-5" />
                  <span className="text-xs uppercase font-bold tracking-wider">Checked Baggage</span>
                </div>
                <div className="text-base font-bold text-white mb-1">{currentAllowance.checked}</div>
                <p className="text-xs text-slate-400">Standard check-in counter drop</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-purple-400 mb-2">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-xs uppercase font-bold tracking-wider">Personal Item</span>
                </div>
                <div className="text-base font-bold text-white mb-1">{currentAllowance.personal}</div>
                <p className="text-xs text-slate-400">Must fit under the seat in front</p>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => setUserView('home')}
                className="inline-flex items-center gap-2 text-xs text-sky-400 hover:text-sky-300 font-semibold cursor-pointer"
              >
                <span>Ready to fly? Search flights now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 2: LOST & DELAYED BAGGAGE TRACER SIMULATOR */}
        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-full mb-3">
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Live WorldTracer Telemetry</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Live Baggage Status Tracer
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm">
                Enter your Bag Tag Number (printed on your boarding pass sticker) or 10-character PIR reference number.
              </p>
            </div>

            <form onSubmit={handleTraceBaggage} className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={pirNumber}
                  onChange={(e) => setPirNumber(e.target.value)}
                  placeholder="e.g. LHR-AW-92841 or 0092849102"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/30"
              >
                {isSearching ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Locating Bag...</span>
                  </>
                ) : (
                  <>
                    <span>Trace Baggage</span>
                    <Search className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-xs text-slate-400 text-center mb-6">
              💡 Demo test: Type <button type="button" onClick={() => setPirNumber('LHR-AW-92841')} className="text-sky-400 font-mono underline">LHR-AW-92841</button> to test immediate telemetry.
            </div>

            {/* Tracing Results Display */}
            {tracingResult && (
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-700 animate-fadeIn space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs text-slate-400">Bag Tag Ref:</span>
                    <span className="ml-2 font-mono font-bold text-white">{tracingResult.tag}</span>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-500/30">
                    Live Tracking Active
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div>
                    <span className="text-slate-400 block text-xs mb-0.5">Current Location</span>
                    <span className="font-semibold text-white">{tracingResult.location}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs mb-0.5">Arrival Carousel</span>
                    <span className="font-bold text-amber-300">{tracingResult.carousel}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs mb-0.5">Telemetry Status</span>
                    <span className="font-semibold text-emerald-400">{tracingResult.status}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs mb-0.5">Delivery Time</span>
                    <span className="font-semibold text-slate-200">{tracingResult.estimatedDelivery}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 3: RESTRICTED & HAZARDOUS ITEMS */}
        <section>
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Restricted & Dangerous Goods</h2>
            <p className="text-slate-300 text-sm">
              For the safety of all passengers, certain items are strictly forbidden in checked or cabin baggage.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mb-3">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base mb-1">Lithium Batteries & Powerbanks</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Must be carried in <strong>Cabin Baggage only</strong>. Strictly forbidden inside checked luggage. Max 100Wh per battery.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mb-3">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base mb-1">Liquids, Aerosols & Gels (LAGs)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                In cabin bags, containers must not exceed <strong>100 ml each</strong> and must fit inside a transparent 1-litre resealable bag.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mb-3">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base mb-1">E-Cigarettes & Vapes</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Permitted in cabin baggage only. Charging or using electronic smoking devices on board is strictly illegal.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mb-3">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base mb-1">Flammables & Fireworks</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Lighter fuels, matches, toxic chemicals, and fireworks are <strong>completely prohibited</strong> from all luggage.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
