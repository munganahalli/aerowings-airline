import React, { useState } from 'react';
import { useAirline } from '../../context/AirlineContext';
import { 
  Award, 
  Gift, 
  TrendingUp, 
  Crown, 
  ShieldCheck, 
  ArrowRight, 
  Plane, 
  CreditCard, 
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Zap,
  QrCode,
  Copy,
  Check,
  Ticket,
  Star,
  X
} from 'lucide-react';
import { AIRPORTS } from '../../data/mockData';

interface ClaimedVoucher {
  id: string;
  title: string;
  cost: number;
  code: string;
  redeemedAt: string;
  status: 'Active' | 'Used';
}

export const LoyaltyClubPage: React.FC = () => {
  const { userProfile, updateUserProfile, setUserView, addToast, setOrigin, setDestination } = useAirline();
  
  // Miles Calculator State
  const [calcOrigin, setCalcOrigin] = useState('DEL');
  const [calcDestination, setCalcDestination] = useState('LHR');
  const [calcClass, setCalcClass] = useState<'economy' | 'premium_economy' | 'business' | 'first'>('business');

  // Claimed Vouchers Inventory State
  const [claimedVouchers, setClaimedVouchers] = useState<ClaimedVoucher[]>(() => {
    try {
      const saved = localStorage.getItem('aerowings_claimed_vouchers');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      {
        id: 'vch-init-1',
        title: 'Priority Lounge Pass (DEL & BOM)',
        cost: 3000,
        code: 'SKYW-LNG-9481',
        redeemedAt: 'Oct 14, 2026',
        status: 'Active'
      }
    ];
  });

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showLoungePassModal, setShowLoungePassModal] = useState<boolean>(false);

  // Dynamic Tier calculations
  const tierTarget = userProfile.tier === 'Platinum' ? 25000 : userProfile.tier === 'Gold' ? 10000 : 3000;
  const milesToGo = Math.max(0, tierTarget - userProfile.miles);
  const progressPercent = Math.min(100, Math.round((userProfile.miles / tierTarget) * 100));

  // Tier calculator calculation
  const calculateMiles = () => {
    let baseMiles = 4200; // estimated distance DEL to LHR
    if (calcOrigin === 'DEL' && calcDestination === 'DXB') baseMiles = 1360;
    if (calcOrigin === 'BOM' && calcDestination === 'JFK') baseMiles = 7800;
    if (calcOrigin === 'SIN' && calcDestination === 'LHR') baseMiles = 6750;
    if (calcOrigin === 'DEL' && calcDestination === 'BOM') baseMiles = 720;
    
    const multipliers = {
      economy: 1.0,
      premium_economy: 1.25,
      business: 2.0,
      first: 3.0
    };

    const earned = Math.round(baseMiles * multipliers[calcClass]);
    const tierPoints = Math.round(earned * 0.2);

    return { earned, tierPoints };
  };

  const { earned, tierPoints } = calculateMiles();

  // Real interactive reward claim with miles deduction & voucher issuance
  const handleClaimReward = (title: string, cost: number) => {
    if (userProfile.miles < cost) {
      addToast(`Insufficient SkyMiles: You need ${cost - userProfile.miles} more miles to redeem ${title}`, 'error');
      return;
    }

    const code = `SKYW-${title.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newVoucher: ClaimedVoucher = {
      id: `vch-${Date.now()}`,
      title,
      cost,
      code,
      redeemedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Active'
    };

    const updatedMiles = Math.max(0, userProfile.miles - cost);
    updateUserProfile({ miles: updatedMiles });

    const updatedList = [newVoucher, ...claimedVouchers];
    setClaimedVouchers(updatedList);
    try {
      localStorage.setItem('aerowings_claimed_vouchers', JSON.stringify(updatedList));
    } catch {
      // ignore
    }

    addToast(`🎉 Successfully redeemed ${title}! Voucher Code: ${code} has been added to your inventory.`, 'success');
  };

  const handleTestEarnMiles = (points = 2500) => {
    const newMiles = userProfile.miles + points;
    let newTier = userProfile.tier;
    if (newMiles >= 10000) newTier = 'Platinum';
    else if (newMiles >= 3000) newTier = 'Gold';
    else newTier = 'Silver';

    updateUserProfile({ miles: newMiles, tier: newTier });
    addToast(`✨ Added +${points.toLocaleString()} SkyMiles! Balance: ${newMiles.toLocaleString()} pts (${newTier} Member)`, 'success');
  };

  const handleSwitchTier = (tier: 'Silver' | 'Gold' | 'Platinum') => {
    const targetMiles = tier === 'Platinum' ? 12500 : tier === 'Gold' ? 5200 : 1500;
    updateUserProfile({ tier, miles: targetMiles });
    addToast(`👑 Switched to ${tier} Member Privileges! Active benefits unlocked.`, 'info');
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    addToast(`Copied voucher code ${code} to clipboard!`, 'success');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-w-0 bg-slate-950 text-slate-100 pb-20">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-blue-950/40 via-slate-900 to-slate-950 border-b border-slate-800 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-4">
            <Crown className="w-3.5 h-3.5" />
            <span>SkyWings Frequent Flyer Club</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Fly More, Unlock Exceptional Privileges
          </h1>
          <p className="max-w-2xl mx-auto text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
            Earn miles on every flight with AeroWings and global partner airlines. Enjoy complimentary cabin upgrades, lounge access, priority boarding, and free flights.
          </p>

          {/* Member Profile Quick Card */}
          <div className="max-w-xl mx-auto bg-slate-900/90 border border-slate-700/80 rounded-2xl p-6 shadow-2xl backdrop-blur-md text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div>
                <div className="text-xs text-slate-400">Welcome Back,</div>
                <div className="text-lg font-bold text-white">{userProfile.name}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold rounded-full">
                  <Crown className="w-3.5 h-3.5" />
                  <span>{userProfile.tier} Member</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400">Available SkyMiles</div>
                <div className="text-2xl font-extrabold text-sky-400 mt-0.5">
                  {userProfile.miles.toLocaleString()} <span className="text-xs font-normal text-slate-400">pts</span>
                </div>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400">
                  {userProfile.tier === 'Platinum' ? 'Elite Milestone' : `Next Tier (${userProfile.tier === 'Silver' ? 'Gold' : 'Platinum'})`}
                </div>
                <div className="text-2xl font-extrabold text-amber-300 mt-0.5">
                  {milesToGo.toLocaleString()} <span className="text-xs font-normal text-slate-400">miles to go</span>
                </div>
              </div>
            </div>

            {/* Dynamic Progress bar */}
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                <span>{userProfile.tier} Status</span>
                <span>{tierTarget.toLocaleString()} pts Milestone ({progressPercent}%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Interactive Member Action Toolbar */}
            <div className="grid grid-cols-2 gap-2 mt-5 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => handleTestEarnMiles(2500)}
                className="py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>+2,500 Test Miles</span>
              </button>

              <button
                type="button"
                onClick={() => setShowLoungePassModal(true)}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <QrCode className="w-3.5 h-3.5 text-sky-400" />
                <span>Digital Lounge Pass</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-16">
        {/* SECTION 1: INTERACTIVE MILES CALCULATOR */}
        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="lg:w-1/2">
              <div className="inline-flex items-center gap-1.5 text-xs text-sky-400 font-bold uppercase tracking-wider mb-2">
                <Zap className="w-4 h-4" />
                <span>Interactive Mileage Tool</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Calculate Miles for Your Next Flight
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
                Discover how many SkyMiles and Tier Points you will earn for any journey across our global network.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">From (Origin)</label>
                  <select
                    value={calcOrigin}
                    onChange={(e) => setCalcOrigin(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    {AIRPORTS.map((a) => (
                      <option key={a.code} value={a.code}>{a.city} ({a.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">To (Destination)</label>
                  <select
                    value={calcDestination}
                    onChange={(e) => setCalcDestination(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    {AIRPORTS.map((a) => (
                      <option key={a.code} value={a.code}>{a.city} ({a.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Cabin Class</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['economy', 'premium_economy', 'business', 'first'] as const).map((cls) => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => setCalcClass(cls)}
                      className={`py-2 px-2 text-xs rounded-xl border text-center transition-all ${
                        calcClass === cls
                          ? 'bg-blue-600 border-blue-500 text-white font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {cls === 'economy' && 'Economy'}
                      {cls === 'premium_economy' && 'Premium'}
                      {cls === 'business' && 'Business'}
                      {cls === 'first' && 'First'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Calculation Output Box */}
            <div className="lg:w-1/2 w-full bg-slate-950 p-8 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <span className="text-xs text-slate-400">Selected Route</span>
                  <span className="font-bold text-white text-sm">{calcOrigin} ✈ {calcDestination}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400">Total SkyMiles Earned</div>
                    <div className="text-3xl font-extrabold text-emerald-400 mt-1">
                      +{earned.toLocaleString()} <span className="text-xs font-normal text-slate-400">Miles</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Tier Status Points</div>
                    <div className="text-2xl font-bold text-amber-300 mt-1">
                      +{tierPoints} <span className="text-xs font-normal text-slate-400">Pts</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
                  ✨ Gold & Platinum members receive an additional 25% to 50% tier bonus miles on this sector!
                </p>
              </div>

              <button
                onClick={() => {
                  setOrigin(calcOrigin);
                  setDestination(calcDestination);
                  setUserView('home');
                  addToast(`Route ${calcOrigin} ➔ ${calcDestination} selected for flight booking!`, 'info');
                }}
                className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-600/30"
              >
                <span>Book This Route & Earn Miles</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 2: TIER COMPARISON TABLE */}
        <section>
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Membership Tier Privileges</h2>
            <p className="text-slate-300 text-sm">
              Progress through our tiers to unlock VIP airport benefits, lounge entries, and guaranteed upgrades.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Silver Tier */}
            <div className={`bg-slate-900 rounded-3xl p-6 flex flex-col justify-between border transition-all ${
              userProfile.tier === 'Silver' ? 'border-sky-500 shadow-xl shadow-sky-500/10' : 'border-slate-800'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-slate-800 text-slate-200 text-xs font-bold rounded-full">
                    Silver Tier
                  </span>
                  <span className="text-xs text-slate-400">Entry Level</span>
                </div>
                <div className="text-xl font-bold text-white mb-4">Silver Explorer</div>
                <ul className="space-y-3 text-xs sm:text-sm text-slate-300 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Earn 1x Miles on every flight</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Free standard seat selection</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Complimentary in-flight messaging Wi-Fi</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>+5 kg extra baggage allowance</span>
                  </li>
                </ul>
              </div>
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="text-xs text-slate-400">
                  Qualify with 0 – 3,000 Tier Miles
                </div>
                <button
                  type="button"
                  onClick={() => handleSwitchTier('Silver')}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    userProfile.tier === 'Silver'
                      ? 'bg-sky-600 text-white cursor-default'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {userProfile.tier === 'Silver' ? '✓ Currently Active Tier' : 'Switch to Silver Tier'}
                </button>
              </div>
            </div>

            {/* Gold Tier */}
            <div className={`bg-slate-900 rounded-3xl p-6 flex flex-col justify-between relative border-2 transition-all ${
              userProfile.tier === 'Gold' ? 'border-amber-400 shadow-xl shadow-amber-500/20' : 'border-amber-500/50'
            }`}>
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider">
                Most Popular
              </span>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-full border border-amber-500/40">
                    Gold Tier
                  </span>
                  <span className="text-xs text-amber-400 font-semibold">Priority Status</span>
                </div>
                <div className="text-xl font-bold text-white mb-4">Gold Voyager</div>
                <ul className="space-y-3 text-xs sm:text-sm text-slate-300 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Earn 1.25x Miles + 25% Tier Bonus</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>AeroWings Executive Lounge access (+1 guest)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Priority Check-in & Priority Boarding (Zone 2)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>+15 kg complimentary baggage</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>2 complimentary upgrade vouchers / year</span>
                  </li>
                </ul>
              </div>
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="text-xs text-amber-300/80">
                  Qualify with 3,000 – 10,000 Tier Miles
                </div>
                <button
                  type="button"
                  onClick={() => handleSwitchTier('Gold')}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    userProfile.tier === 'Gold'
                      ? 'bg-amber-500 text-slate-950 font-black cursor-default'
                      : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {userProfile.tier === 'Gold' ? '✓ Currently Active Tier' : 'Switch to Gold Tier'}
                </button>
              </div>
            </div>

            {/* Platinum Tier */}
            <div className={`bg-slate-900 rounded-3xl p-6 flex flex-col justify-between border transition-all ${
              userProfile.tier === 'Platinum' ? 'border-purple-400 shadow-xl shadow-purple-500/20' : 'border-slate-800'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-bold rounded-full border border-purple-500/40">
                    Platinum Tier
                  </span>
                  <span className="text-xs text-purple-400 font-semibold">VIP Status</span>
                </div>
                <div className="text-xl font-bold text-white mb-4">Platinum Elite</div>
                <ul className="space-y-3 text-xs sm:text-sm text-slate-300 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Earn 1.5x Miles + 50% Tier Bonus</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>First Class Lounge Access worldwide (+2 guests)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Dedicated VIP 24/7 Concierge Hotline</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>+25 kg complimentary baggage allowance</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Unlimited Space-Available Cabin Upgrades</span>
                  </li>
                </ul>
              </div>
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="text-xs text-purple-300/80">
                  Qualify with 10,000+ Tier Miles
                </div>
                <button
                  type="button"
                  onClick={() => handleSwitchTier('Platinum')}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    userProfile.tier === 'Platinum'
                      ? 'bg-purple-600 text-white font-black cursor-default'
                      : 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40'
                  }`}
                >
                  {userProfile.tier === 'Platinum' ? '✓ Currently Active Tier' : 'Switch to Platinum Tier'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: REDEEM REWARDS CATALOGUE */}
        <section>
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Redeem Your SkyMiles</h2>
            <p className="text-slate-300 text-sm">
              Use your accumulated points for free flights, cabin upgrades, excess baggage, and luxury airport perks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
                  <Plane className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base mb-1">Free Award Flight</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Redeem for any one-way domestic or short-haul international ticket.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-sm font-bold text-amber-400">12,000 Miles</span>
                <button
                  onClick={() => handleClaimReward('Free Award Flight', 12000)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Redeem
                </button>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
                  <Crown className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base mb-1">Business Class Upgrade</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Upgrade your Economy ticket to a Lie-Flat Business suite.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-sm font-bold text-amber-400">7,500 Miles</span>
                <button
                  onClick={() => handleClaimReward('Business Class Upgrade', 7500)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Redeem
                </button>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base mb-1">VIP Lounge Day Pass</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Full access to AeroWings Executive Lounges with dining & showers.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-sm font-bold text-amber-400">3,000 Miles</span>
                <button
                  onClick={() => handleClaimReward('VIP Lounge Day Pass', 3000)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Redeem
                </button>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3">
                  <Gift className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base mb-1">+10 kg Baggage Voucher</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Complimentary 10 kg extra checked luggage allowance voucher.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-sm font-bold text-amber-400">2,500 Miles</span>
                <button
                  onClick={() => handleClaimReward('+10 kg Baggage Voucher', 2500)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Redeem
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: MY CLAIMED PRIVILEGES & VOUCHERS */}
        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-bold uppercase tracking-wider mb-1">
                <Ticket className="w-4 h-4" />
                <span>My Active Privilege Inventory</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Redeemed Vouchers & Passcodes ({claimedVouchers.length})
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Copy your unique voucher codes to apply complimentary upgrades, lounge access, or extra luggage during checkout.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleTestEarnMiles(1500)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-white rounded-xl text-xs font-bold border border-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Earn +1,500 Bonus Miles</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {claimedVouchers.map((voucher) => (
              <div
                key={voucher.id}
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 relative overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
                      Redeemed {voucher.redeemedAt}
                    </span>
                    <h3 className="font-bold text-white text-sm">{voucher.title}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {voucher.status}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between font-mono">
                  <span className="text-amber-300 font-bold text-xs">{voucher.code}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(voucher.code)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-sans font-semibold"
                  >
                    {copiedCode === voucher.code ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Value: {voucher.cost.toLocaleString()} SkyMiles</span>
                  <button
                    type="button"
                    onClick={() => {
                      setUserView('home');
                      addToast(`Promo code ${voucher.code} copied! Ready to apply during seat selection or booking.`, 'success');
                    }}
                    className="text-sky-400 hover:text-sky-300 font-bold cursor-pointer"
                  >
                    Apply to Flight →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Digital Executive Lounge Pass Modal */}
      {showLoungePassModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-5">
            <button
              type="button"
              onClick={() => setShowLoungePassModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">AeroWings Global Access</div>
                <h3 className="text-lg font-black text-white">Executive Digital Lounge Pass</h3>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Passenger / Member:</span>
                <strong className="text-white">{userProfile.name}</strong>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Membership Tier:</span>
                <span className="text-amber-300 font-bold">{userProfile.tier} Voyager</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Access Type:</span>
                <span className="text-emerald-400 font-bold">Complimentary Worldwide (+1 Guest)</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Eligible Hubs:</span>
                <span className="text-slate-300 font-mono text-[11px]">DEL, BOM, BLR, LHR, DXB, SIN</span>
              </div>

              {/* QR Barcode representation */}
              <div className="pt-3 pb-1 border-t border-slate-800 text-center space-y-2">
                <div className="inline-block p-3 rounded-2xl bg-white shadow-md">
                  <QrCode className="w-32 h-32 text-slate-950 mx-auto" />
                </div>
                <div className="font-mono text-xs text-amber-400 font-bold tracking-widest">
                  AW-LNG-VIP-{userProfile.tier.toUpperCase()}-2026
                </div>
                <p className="text-[10px] text-slate-400">
                  Scan this pass at AeroWings Lounge Reception Concierge for immediate entry.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowLoungePassModal(false);
                  addToast('Lounge Pass saved to your offline boarding profile!', 'success');
                }}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg cursor-pointer"
              >
                Save to Apple Wallet / Passbook
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
