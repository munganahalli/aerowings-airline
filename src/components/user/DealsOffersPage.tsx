import React, { useState, useMemo } from 'react';
import { useAirline } from '../../context/AirlineContext';
import { useLanguage } from '../../context/LanguageContext';
import { OFFERS } from '../../data/mockData';
import { getAirportWeatherImmediate } from '../../utils/realtimeWeather';
import { formatCurrency } from '../../utils/airlineUtils';
import { aiVoice } from '../../utils/aiVoice';
import {
  Tag,
  Sparkles,
  Copy,
  Check,
  Plane,
  ArrowRight,
  Clock,
  ShieldCheck,
  MapPin,
  Sun,
  Globe,
  Volume2,
  Compass,
  Percent
} from 'lucide-react';

interface FeaturedDestinationOffer {
  id: string;
  city: string;
  code: string;
  originCode: string;
  originCity: string;
  country: string;
  category: 'domestic' | 'international' | 'beach' | 'heritage';
  tagline: string;
  discountBadge: string;
  promoCode: string;
  originalFareINR: number;
  specialFareINR: number;
  flightDuration: string;
  image: string;
}

export const FEATURED_DESTINATION_DEALS: FeaturedDestinationOffer[] = [
  {
    id: 'dest-goi',
    city: 'Goa (Dabolim & Mopa)',
    code: 'GOI',
    originCode: 'BOM',
    originCity: 'Mumbai',
    country: 'India',
    category: 'beach',
    tagline: 'Tropical Beaches, Sunset Cruises & Coastal Heritage',
    discountBadge: 'FLAT 25% OFF',
    promoCode: 'GOABEACH25',
    originalFareINR: 4999,
    specialFareINR: 3499,
    flightDuration: '1h 15m Non-Stop',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'dest-blr',
    city: 'Bengaluru',
    code: 'BLR',
    originCode: 'DEL',
    originCity: 'New Delhi',
    country: 'India',
    category: 'domestic',
    tagline: 'Silicon Valley of India, Lalbagh Gardens & Craft Cafes',
    discountBadge: 'SAVE ₹1,200',
    promoCode: 'FIRSTFLY',
    originalFareINR: 5899,
    specialFareINR: 4499,
    flightDuration: '2h 40m Non-Stop',
    image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'dest-hyd',
    city: 'Hyderabad',
    code: 'HYD',
    originCode: 'BLR',
    originCity: 'Bengaluru',
    country: 'India',
    category: 'heritage',
    tagline: 'City of Pearls, Charminar, Golconda Fort & Royal Biryani',
    discountBadge: '20% FESTIVE OFF',
    promoCode: 'FLYBCA150',
    originalFareINR: 4299,
    specialFareINR: 3199,
    flightDuration: '1h 10m Non-Stop',
    image: 'https://images.unsplash.com/photo-1572445271230-a78b5944a659?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'dest-bom',
    city: 'Mumbai',
    code: 'BOM',
    originCode: 'DEL',
    originCity: 'New Delhi',
    country: 'India',
    category: 'domestic',
    tagline: 'Marine Drive, Gateway of India & Financial Capital Express',
    discountBadge: 'SUPER SAVER',
    promoCode: 'FIRSTFLY',
    originalFareINR: 5499,
    specialFareINR: 4199,
    flightDuration: '2h 10m Non-Stop',
    image: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'dest-jai',
    city: 'Jaipur (Pink City)',
    code: 'JAI',
    originCode: 'DEL',
    originCity: 'New Delhi',
    country: 'India',
    category: 'heritage',
    tagline: 'Hawa Mahal, Amer Fort & Royal Rajasthani Palaces',
    discountBadge: 'ROYAL DEAL 30% OFF',
    promoCode: 'STUDENT10',
    originalFareINR: 3999,
    specialFareINR: 2799,
    flightDuration: '1h 05m Non-Stop',
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'dest-cok',
    city: 'Kochi (Kerala Backwaters)',
    code: 'COK',
    originCode: 'BLR',
    originCity: 'Bengaluru',
    country: 'India',
    category: 'beach',
    tagline: 'God’s Own Country, Serene Backwaters & Chinese Fishing Nets',
    discountBadge: 'MONSOON SAVER',
    promoCode: 'FLYBCA150',
    originalFareINR: 4599,
    specialFareINR: 3299,
    flightDuration: '1h 15m Non-Stop',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'dest-maa',
    city: 'Chennai',
    code: 'MAA',
    originCode: 'HYD',
    originCity: 'Hyderabad',
    country: 'India',
    category: 'heritage',
    tagline: 'Marina Beach, Kapaleeshwarar Temple & Classical Arts Hub',
    discountBadge: 'FLAT ₹900 OFF',
    promoCode: 'FIRSTFLY',
    originalFareINR: 4399,
    specialFareINR: 3399,
    flightDuration: '1h 15m Non-Stop',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'dest-vns',
    city: 'Varanasi & Ayodhya',
    code: 'VNS',
    originCode: 'DEL',
    originCity: 'New Delhi',
    country: 'India',
    category: 'heritage',
    tagline: 'Sacred Ganga Aarti, Ancient Ghats & Spiritual Heritage Trail',
    discountBadge: 'PILGRIM SPECIAL',
    promoCode: 'FLYBCA150',
    originalFareINR: 4899,
    specialFareINR: 3599,
    flightDuration: '1h 25m Non-Stop',
    image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'dest-dxb',
    city: 'Dubai',
    code: 'DXB',
    originCode: 'BOM',
    originCity: 'Mumbai',
    country: 'United Arab Emirates',
    category: 'international',
    tagline: 'Burj Khalifa, Desert Safari, Luxury Shopping & Marina Skyline',
    discountBadge: 'INTL SAVER ₹2,500 OFF',
    promoCode: 'BIZUPGRADE',
    originalFareINR: 16999,
    specialFareINR: 12499,
    flightDuration: '3h 15m Non-Stop',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'dest-sin',
    city: 'Singapore',
    code: 'SIN',
    originCode: 'MAA',
    originCity: 'Chennai',
    country: 'Singapore',
    category: 'international',
    tagline: 'Gardens by the Bay, Marina Bay Sands & Sentosa Island',
    discountBadge: 'EARLY BIRD 22% OFF',
    promoCode: 'BIZUPGRADE',
    originalFareINR: 18499,
    specialFareINR: 13999,
    flightDuration: '4h 10m Non-Stop',
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'dest-lhr',
    city: 'London Heathrow',
    code: 'LHR',
    originCode: 'DEL',
    originCity: 'New Delhi',
    country: 'United Kingdom',
    category: 'international',
    tagline: 'Big Ben, Tower Bridge, West End & Royal Parks Direct',
    discountBadge: 'LONG-HAUL SPECIAL',
    promoCode: 'BIZUPGRADE',
    originalFareINR: 44999,
    specialFareINR: 34999,
    flightDuration: '9h 15m Non-Stop',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'dest-cdg',
    city: 'Paris',
    code: 'CDG',
    originCode: 'DEL',
    originCity: 'New Delhi',
    country: 'France',
    category: 'international',
    tagline: 'Eiffel Tower, Louvre Museum, Seine River & Champs-Élysées',
    discountBadge: 'ROMANCE SAVER',
    promoCode: 'BIZUPGRADE',
    originalFareINR: 42999,
    specialFareINR: 33499,
    flightDuration: '8h 50m Non-Stop',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80'
  }
];

export const DealsOffersPage: React.FC = () => {
  const { setUserView, addToast, performSearch, searchParams, currency, aiLanguage } = useAirline();
  const { t } = useLanguage();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'domestic' | 'international' | 'beach' | 'heritage'>('all');

  const filteredDestinations = useMemo(() => {
    if (selectedCategory === 'all') return FEATURED_DESTINATION_DEALS;
    return FEATURED_DESTINATION_DEALS.filter((d) => d.category === selectedCategory);
  }, [selectedCategory]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    addToast(`Promo code "${code}" copied! Apply at checkout.`, 'success');
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleBookDestination = (dest: FeaturedDestinationOffer) => {
    addToast(`Searching special offer flights from ${dest.originCity} (${dest.originCode}) to ${dest.city} (${dest.code})!`, 'success');
    performSearch({
      ...searchParams,
      origin: dest.originCode,
      destination: dest.code
    });
  };

  const handleSpeakDestinationOffer = (dest: FeaturedDestinationOffer) => {
    const weather = getAirportWeatherImmediate(dest.code);
    const speech = `Special Featured Destination: ${dest.city} (${dest.code}). Direct flights from ${dest.originCity} starting at ₹${dest.specialFareINR}. Current weather in ${dest.city} is ${weather.temperatureC} degrees Celsius, ${weather.conditionText}. Use promo code ${dest.promoCode}.`;
    aiVoice.speak(speech, true, aiLanguage);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 border border-blue-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('deals.badge', 'Exclusive AeroWings Promo Codes, Featured Destinations & Regional Deals')}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t('deals.title', 'Special Offers & Featured Destinations')}
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            {t('deals.subtitle', 'Explore 12+ handpicked domestic and international featured destinations with live airport weather, instant promo codes, and guaranteed lowest fares.')}
          </p>
        </div>
        <Plane className="w-64 h-64 text-white/5 absolute -right-10 -bottom-10 transform -rotate-12 pointer-events-none" />
      </div>

      {/* Featured Destinations Section (Expanded to 12 Destinations with Category Filters & Live Weather) */}
      <div className="space-y-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Compass className="w-4 h-4" />
              <span>{t('home.featuredDestinations', 'Featured Destinations & Special Route Fares')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Explore {FEATURED_DESTINATION_DEALS.length} Featured Destinations on Sale
            </h2>
            <p className="text-xs text-slate-400">
              Every destination includes live meteorological telemetry and 1-click instant booking
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { id: 'all', label: `All Destinations (${FEATURED_DESTINATION_DEALS.length})` },
              { id: 'domestic', label: '🇮🇳 Domestic Metro' },
              { id: 'beach', label: '🏖️ Beach & Coastal' },
              { id: 'heritage', label: '🏛️ Heritage & Culture' },
              { id: 'international', label: '🌍 International Hubs' }
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  selectedCategory === cat.id
                    ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-lg shadow-sky-500/20'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 12 Featured Destinations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredDestinations.map((dest) => {
            const liveWeather = getAirportWeatherImmediate(dest.code);
            return (
              <div
                key={dest.id}
                className="group bg-slate-900 border border-slate-800 hover:border-sky-500/50 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between transition-all hover:-translate-y-1"
              >
                <div>
                  {/* Image & Overlays */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={dest.image}
                      alt={dest.city}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 shadow-md">
                        {dest.discountBadge}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-950/85 text-sky-300 border border-sky-500/30 backdrop-blur-md flex items-center gap-1">
                        <Sun className="w-3 h-3 text-amber-400" />
                        {liveWeather.temperatureC}°C • {dest.code}
                      </span>
                    </div>

                    {/* Bottom Title inside Image */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="flex items-center gap-1.5 text-[11px] text-sky-300 font-semibold">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{dest.originCity} ({dest.originCode}) ➔ {dest.city} ({dest.code})</span>
                      </div>
                      <h3 className="text-lg font-black text-white leading-tight mt-0.5">
                        {dest.city}
                      </h3>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3">
                    <p className="text-xs text-slate-400 line-clamp-2 min-h-[32px]">
                      {dest.tagline}
                    </p>

                    <div className="flex items-center justify-between text-[11px] bg-slate-950/90 border border-slate-800 rounded-xl px-3 py-2">
                      <div>
                        <span className="text-slate-500 block">Live Airport Weather</span>
                        <span className="text-emerald-300 font-semibold">{liveWeather.conditionText}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 block">Duration</span>
                        <span className="text-slate-200 font-mono font-bold">{dest.flightDuration}</span>
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between pt-1">
                      <div>
                        <span className="text-[10px] text-slate-500 line-through block">
                          {formatCurrency(dest.originalFareINR, currency)}
                        </span>
                        <div className="text-xl font-black text-emerald-400">
                          {formatCurrency(dest.specialFareINR, currency)}
                          <span className="text-[10px] text-slate-400 font-normal ml-1">/ adult</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopyCode(dest.promoCode)}
                        className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-dashed border-sky-500/40 text-[11px] font-mono font-bold text-sky-300 cursor-pointer"
                        title="Click to copy promo code"
                      >
                        🏷️ {dest.promoCode}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="p-4 pt-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleBookDestination(dest)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/20 cursor-pointer transition-all"
                  >
                    <span>{t('common.bookNow', 'Book Special Fare')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSpeakDestinationOffer(dest)}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 cursor-pointer transition-colors"
                    title="Listen to offer in your selected language"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Instant Checkout Promo Vouchers Grid */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <Percent className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl font-black text-white">
            Active Promo Vouchers & Bank Coupons
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {OFFERS.map((offer) => {
            const isCopied = copiedCode === offer.code;
            return (
              <div
                key={offer.id}
                className="bg-slate-900 border border-slate-800 hover:border-blue-500/40 rounded-3xl p-6 flex flex-col justify-between gap-6 transition-all shadow-xl group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-600/20 text-sky-400 border border-blue-500/30">
                      {offer.discountType === 'flat' ? `FLAT ₹${offer.discountValue} OFF` : `${offer.discountValue}% DISCOUNT`}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" /> Valid till {offer.expiresOn}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-sky-400 transition-colors">
                    {offer.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {offer.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Promo Code</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-dashed border-sky-500/50 font-mono text-sm font-black text-sky-400 tracking-wider">
                        {offer.code}
                      </span>
                      <button
                        onClick={() => handleCopyCode(offer.code)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                        title="Copy Code"
                      >
                        {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      handleCopyCode(offer.code);
                      setUserView('home');
                    }}
                    className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
                  >
                    <span>{t('deals.useOffer', 'Book with Offer')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Special Fare Eligibility Info */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> Special Concession Fares
            </div>
            <h3 className="text-lg font-bold text-white">
              Additional 10% to 15% Off for Students, Senior Citizens & Armed Forces
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Select your concession category directly on the flight search widget to automatically unlock extra baggage allowance (up to 25 kg) and instant base fare reductions.
            </p>
          </div>
          <button
            onClick={() => setUserView('home')}
            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-all cursor-pointer shrink-0"
          >
            Search Special Fares →
          </button>
        </div>
      </div>
    </div>
  );
};
