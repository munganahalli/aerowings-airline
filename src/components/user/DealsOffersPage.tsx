import React, { useState } from 'react';
import { useAirline } from '../../context/AirlineContext';
import { 
  Tag, 
  Sparkles, 
  Copy, 
  Check, 
  Percent, 
  ArrowRight, 
  Plane, 
  Gift, 
  ShieldCheck, 
  GraduationCap, 
  UserCheck, 
  Clock 
} from 'lucide-react';
import { OFFERS } from '../../data/mockData';
import { formatCurrency } from '../../utils/airlineUtils';

export const DealsOffersPage: React.FC = () => {
  const { currency, setUserView, setSearchParams, showToast } = useAirline();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'promos' | 'concessions' | 'destinations'>('all');

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`Promo code ${code} copied to clipboard!`, 'success');
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const handleBookWithOffer = (code: string) => {
    handleCopyCode(code);
    setUserView('home');
  };

  const curatedDestinations = [
    {
      city: 'London, United Kingdom',
      airport: 'LHR',
      from: 'DEL',
      priceINR: 42500,
      image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80',
      tag: 'Autumn Getaway',
      discount: 'Save 15%'
    },
    {
      city: 'Dubai, UAE',
      airport: 'DXB',
      from: 'BOM',
      priceINR: 18900,
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80',
      tag: 'Weekend Escape',
      discount: 'Save 20%'
    },
    {
      city: 'Singapore',
      airport: 'SIN',
      from: 'DEL',
      priceINR: 24300,
      image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=600&q=80',
      tag: 'City Explorer',
      discount: 'Save 18%'
    },
    {
      city: 'New York, USA',
      airport: 'JFK',
      from: 'DEL',
      priceINR: 64900,
      image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&q=80',
      tag: 'Direct Dreamliner',
      discount: 'Save 25%'
    }
  ];

  return (
    <div className="min-w-0 bg-slate-950 text-slate-100 pb-20">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-b border-slate-800 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-4">
            <Tag className="w-3.5 h-3.5" />
            <span>Limited-Time Flight Deals & Concessions</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Fly More for Less
          </h1>
          <p className="max-w-2xl mx-auto text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
            Take advantage of exclusive discount vouchers, concessionary student fares, senior discounts, and seasonal fare sales.
          </p>

          {/* Category Filter Tabs */}
          <div className="inline-flex flex-wrap justify-center p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl gap-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                selectedCategory === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Offers
            </button>
            <button
              onClick={() => setSelectedCategory('promos')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                selectedCategory === 'promos' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Promo Codes
            </button>
            <button
              onClick={() => setSelectedCategory('concessions')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                selectedCategory === 'concessions' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Special Concessions
            </button>
            <button
              onClick={() => setSelectedCategory('destinations')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                selectedCategory === 'destinations' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Featured Destinations
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-16">
        {/* PROMO CODES SECTION */}
        {(selectedCategory === 'all' || selectedCategory === 'promos') && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Active Promotional Coupons</h2>
                <p className="text-xs sm:text-sm text-slate-400">Copy code and apply at payment checkout.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {OFFERS.map((offer) => (
                <div 
                  key={offer.id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden shadow-xl hover:border-slate-700 transition-all"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${offer.bannerColor} opacity-10 rounded-full blur-2xl -mr-10 -mt-10`}></div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 text-xs font-semibold rounded-full border border-amber-500/40">
                        {offer.tag}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Expires {offer.expiresOn}</span>
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2">{offer.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed mb-6">
                      {offer.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-800">
                    <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-dashed border-slate-700">
                      <span className="font-mono font-bold text-amber-300 text-sm tracking-wider pl-2">
                        {offer.code}
                      </span>
                      <button
                        onClick={() => handleCopyCode(offer.code)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        {copiedCode === offer.code ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <button
                      onClick={() => handleBookWithOffer(offer.code)}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-600/20"
                    >
                      <span>Book Flights with This Code</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CONCESSIONS SECTION */}
        {(selectedCategory === 'all' || selectedCategory === 'concessions') && (
          <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Special Concessionary Fares</h2>
              <p className="text-slate-300 text-sm">
                AeroWings offers dedicated privileges for students, senior citizens, and defense personnel.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Student */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">Student Explorer Fare</h3>
                  <div className="text-xs text-sky-400 font-semibold mb-3">Up to 10% Off Base Fare</div>
                  <ul className="space-y-2 text-xs text-slate-300 mb-6">
                    <li className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>+10 kg complimentary baggage</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Free date change up to 48h prior</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Valid Student ID required at check-in</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => {
                    setSearchParams(prev => ({ ...prev, specialFare: 'student' }));
                    setUserView('home');
                  }}
                  className="w-full py-2.5 bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Select Student Fare
                </button>
              </div>

              {/* Senior Citizen */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">Senior Citizen Privileges</h3>
                  <div className="text-xs text-amber-400 font-semibold mb-3">Flat 15% Off Base Fare</div>
                  <ul className="space-y-2 text-xs text-slate-300 mb-6">
                    <li className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Applicable for passengers aged 60+</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Priority wheelchair & check-in service</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Government photo ID required</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => {
                    setSearchParams(prev => ({ ...prev, specialFare: 'senior' }));
                    setUserView('home');
                  }}
                  className="w-full py-2.5 bg-amber-600/30 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/40 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Select Senior Fare
                </button>
              </div>

              {/* Armed Forces */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">Armed Forces Gratitude</h3>
                  <div className="text-xs text-emerald-400 font-semibold mb-3">Up to 20% Off Base Fare</div>
                  <ul className="space-y-2 text-xs text-slate-300 mb-6">
                    <li className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>For active military personnel & veterans</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Extended to accompanying dependent family</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Military Service ID required</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => {
                    setSearchParams(prev => ({ ...prev, specialFare: 'armed_forces' }));
                    setUserView('home');
                  }}
                  className="w-full py-2.5 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Select Armed Forces Fare
                </button>
              </div>
            </div>
          </section>
        )}

        {/* FEATURED DESTINATIONS SECTION */}
        {(selectedCategory === 'all' || selectedCategory === 'destinations') && (
          <section>
            <div className="text-center max-w-3xl mx-auto mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Curated Destination Deals</h2>
              <p className="text-slate-300 text-sm">
                Explore handpicked world capitals and popular vacation spots with discounted promotional fares.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {curatedDestinations.map((dest, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between">
                  <div className="h-48 relative">
                    <img src={dest.image} alt={dest.city} className="w-full h-full object-cover" />
                    <span className="absolute top-3 right-3 px-2.5 py-1 bg-blue-600 text-white text-[11px] font-bold rounded-lg shadow-md">
                      {dest.discount}
                    </span>
                    <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-slate-900/90 text-white text-[11px] font-semibold rounded-lg backdrop-blur-md">
                      {dest.tag}
                    </span>
                  </div>

                  <div className="p-5 flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="text-base font-bold text-white mb-1">{dest.city}</h3>
                      <div className="text-xs text-slate-400 mb-3">From {dest.from} to {dest.airport}</div>
                      <div className="text-xs text-slate-400">Starting from</div>
                      <div className="text-xl font-extrabold text-amber-300">
                        {formatCurrency(dest.priceINR, currency)}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSearchParams(prev => ({
                          ...prev,
                          origin: dest.from,
                          destination: dest.airport
                        }));
                        setUserView('home');
                      }}
                      className="mt-4 w-full py-2 bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Book Flights</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
