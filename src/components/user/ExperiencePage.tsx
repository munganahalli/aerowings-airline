import React, { useState } from 'react';
import { useAirline } from '../../context/AirlineContext';
import { 
  Sparkles, 
  Utensils, 
  Tv, 
  Wifi, 
  Coffee, 
  ShieldCheck, 
  Bed, 
  Headphones, 
  Wine, 
  ArrowRight,
  Plane,
  Clock,
  Compass,
  CheckCircle2
} from 'lucide-react';

export const ExperiencePage: React.FC = () => {
  const { setUserView, setSearchParams, defaultSearchParams } = useAirline();
  const [activeTab, setActiveTab] = useState<'cabins' | 'dining' | 'entertainment' | 'lounges'>('cabins');
  const [selectedCabin, setSelectedCabin] = useState<'first' | 'business' | 'premium' | 'economy'>('business');

  React.useEffect(() => {
    const handleTabSwitch = (e?: any) => {
      const storedTab = e?.detail?.tab || sessionStorage.getItem('aerowings_experience_tab');
      const storedCabin = e?.detail?.cabin || sessionStorage.getItem('aerowings_experience_cabin');
      if (storedTab) {
        setActiveTab(storedTab as any);
        sessionStorage.removeItem('aerowings_experience_tab');
      }
      if (storedCabin) {
        setSelectedCabin(storedCabin as any);
        sessionStorage.removeItem('aerowings_experience_cabin');
      }
    };
    handleTabSwitch();
    window.addEventListener('aerowings_switch_experience_tab', handleTabSwitch);
    return () => window.removeEventListener('aerowings_switch_experience_tab', handleTabSwitch);
  }, []);

  const handleBookCabin = (cabinClass: 'economy' | 'premium_economy' | 'business' | 'first') => {
    setUserView('home');
  };

  const cabinsData = {
    first: {
      title: 'First Class Private Suites',
      tagline: 'Unmatched luxury with closing privacy doors and fine dining',
      pitch: '82" pitch (Fully flat 2-meter bed)',
      screen: '32-inch 4K HDR Touchscreen',
      dining: 'À la carte dining on demand with vintage Champagne and caviar service',
      baggage: '50 kg checked baggage + 2 cabin bags (14 kg)',
      lounge: 'Complimentary First Class Lounge & Chauffeur Drive',
      features: [
        'Private suite with sliding floor-to-ceiling privacy doors',
        'Personal mini-bar with chilled refreshments',
        'Turn-down service with luxury duvet and pyjamas by luxury designers',
        'Bvlgari amenity kit with designer skincare',
        'Unlimited high-speed satellite Wi-Fi access'
      ],
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80',
      badge: 'Signature Luxury'
    },
    business: {
      title: 'Business Class Lie-Flat Suites',
      tagline: 'Direct aisle access and 180° lie-flat beds for restful global journeys',
      pitch: '78" pitch (180° lie-flat bed)',
      screen: '22-inch Full HD Interactive Display',
      dining: 'Multi-course chef-curated menus paired with sommelier-selected wines',
      baggage: '40 kg checked baggage + 2 cabin bags (12 kg)',
      lounge: 'Full AeroWings Executive Lounge access worldwide',
      features: [
        '1-2-1 direct aisle seating configuration',
        'Noise-cancelling active headphones',
        'Universal power socket, USB-C 65W fast charging and wireless pad',
        'Priority check-in, priority security, and fast-track boarding',
        'Luxury designer amenity kit and plush pillow'
      ],
      image: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1200&q=80',
      badge: 'Most Popular for Business'
    },
    premium: {
      title: 'Premium Economy Experience',
      tagline: 'Generous legroom, dedicated cabin, and elevated culinary service',
      pitch: '38" pitch with 8" deep recline and adjustable footrest',
      screen: '13.3-inch Ultra HD Touchscreen',
      dining: 'Upgraded 3-course hot meal service with complimentary wine & beer',
      baggage: '35 kg checked baggage + 1 cabin bag (10 kg)',
      lounge: 'Discounted access to AeroWings Executive Lounges',
      features: [
        'Spacious 2-3-2 wide cabin configuration',
        'Dedicated check-in desks and priority boarding (Zone 2)',
        'Calf and footrest support for ergonomic sleep',
        'Eco-friendly amenity kit with dental kit and eye shades',
        'Noise-reducing headphones and personal reading spotlight'
      ],
      image: 'https://images.unsplash.com/photo-1507812984078-917a274065be?auto=format&fit=crop&w=1200&q=80',
      badge: 'Best Value'
    },
    economy: {
      title: 'Smart Economy Class',
      tagline: 'Ergonomic comfort, complimentary hot meals, and endless entertainment',
      pitch: '32" pitch with 5" recline and 6-way adjustable headrest',
      screen: '10.6-inch HD Touchscreen',
      dining: 'Complimentary international hot meals, desserts, and beverage service',
      baggage: '25 kg to 30 kg checked baggage + 1 cabin bag (7 kg)',
      lounge: 'Pay-per-use lounge passes available at booking',
      features: [
        'Slimline ergonomic seating with contoured lumbar support',
        'Over 3,000 hours of movies, TV shows, games, and audio channels',
        'Individual USB charging ports at every seat',
        'Complimentary tea, coffee, juices, and snacks throughout the flight',
        'Special assistance and pre-ordered dietary meals at zero extra charge'
      ],
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
      badge: 'Smart & Comfortable'
    }
  };

  const currentCabin = cabinsData[selectedCabin];

  return (
    <div className="min-w-0 bg-slate-950 text-slate-100 pb-20">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-b border-slate-800 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The AeroWings 5-Star Travel Standard</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            World-Class Comfort in the Skies
          </h1>
          <p className="max-w-2xl mx-auto text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
            From Michelin-inspired gourmet dining and private lie-flat suites to high-speed satellite Wi-Fi, discover how AeroWings elevates every mile of your journey.
          </p>

          {/* Section Navigation Tabs */}
          <div className="inline-flex flex-wrap justify-center p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl gap-1">
            <button
              onClick={() => setActiveTab('cabins')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'cabins' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Bed className="w-4 h-4" />
              <span>Cabin Classes & Fleet</span>
            </button>
            <button
              onClick={() => setActiveTab('dining')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'dining' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>Culinary & Menus</span>
            </button>
            <button
              onClick={() => setActiveTab('entertainment')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'entertainment' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Tv className="w-4 h-4" />
              <span>In-Flight Entertainment & Wi-Fi</span>
            </button>
            <button
              onClick={() => setActiveTab('lounges')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'lounges' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Coffee className="w-4 h-4" />
              <span>Airport Lounges</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {/* TAB 1: CABIN CLASSES */}
        {activeTab === 'cabins' && (
          <div className="space-y-12">
            {/* Cabin selector buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
              {(['first', 'business', 'premium', 'economy'] as const).map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedCabin(key)}
                  className={`p-3.5 rounded-xl text-center border transition-all ${
                    selectedCabin === key
                      ? 'bg-blue-600/20 border-blue-500 text-white font-bold shadow-lg shadow-blue-500/10'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs uppercase tracking-wider text-slate-400 mb-1">Class</div>
                  <div className="text-sm font-semibold capitalize">
                    {key === 'first' && 'First Class'}
                    {key === 'business' && 'Business Class'}
                    {key === 'premium' && 'Premium Economy'}
                    {key === 'economy' && 'Economy'}
                  </div>
                </button>
              ))}
            </div>

            {/* Selected Cabin Detail Showcase */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-12">
                <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold rounded-full">
                        {currentCabin.badge}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">Aircraft: A350-900 & B787-9</span>
                    </div>

                    <h2 className="text-2xl sm:text-4xl font-bold text-white mb-2">
                      {currentCabin.title}
                    </h2>
                    <p className="text-slate-300 text-sm sm:text-base mb-6">
                      {currentCabin.tagline}
                    </p>

                    {/* Key Specs Matrix */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                      <div>
                        <div className="text-xs text-slate-400">Seat Pitch & Bed</div>
                        <div className="text-sm font-semibold text-white mt-0.5">{currentCabin.pitch}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">Screen Size</div>
                        <div className="text-sm font-semibold text-white mt-0.5">{currentCabin.screen}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">Checked Baggage</div>
                        <div className="text-sm font-semibold text-sky-400 mt-0.5">{currentCabin.baggage}</div>
                      </div>
                    </div>

                    {/* Features List */}
                    <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-3">
                      Included Cabin Amenities
                    </h3>
                    <ul className="space-y-2.5 mb-8">
                      {currentCabin.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="text-xs text-slate-400">Lounge Access</div>
                      <div className="text-xs font-medium text-slate-200">{currentCabin.lounge}</div>
                    </div>
                    <button
                      onClick={() => handleBookCabin(selectedCabin === 'premium' ? 'premium_economy' : selectedCabin)}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
                    >
                      <span>Search Flights for this Cabin</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5 relative min-h-[300px] lg:min-h-[500px] bg-slate-950">
                  <img
                    src={currentCabin.image}
                    alt={currentCabin.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CULINARY & DINING */}
        {activeTab === 'dining' && (
          <div className="space-y-12">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Michelin-Inspired In-Flight Dining</h2>
              <p className="text-slate-300 text-sm">
                Our global culinary team creates artisanal menus using fresh, locally sourced ingredients tailored to your route and dietary preferences.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
                    <Utensils className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Regional Specialty Menus</h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-4">
                    Authentic regional cuisines curated for every international route. Savor Dum Biryanis on India routes, French Pastries on European corridors, and Wasabi Salmon on Asian sectors.
                  </p>
                </div>
                <div className="text-xs text-sky-400 font-semibold">Pre-order up to 24h before flight</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
                    <Wine className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Award-Winning Cellar</h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-4">
                    Sommelier-selected Grand Cru wines, vintage Champagnes, artisanal craft beers, signature mocktails, and fresh barista coffees served in First & Business cabins.
                  </p>
                </div>
                <div className="text-xs text-sky-400 font-semibold">Complimentary across premium cabins</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Special Dietary Requirements</h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-4">
                    Over 18 special meal types available at zero charge: Pure Vegetarian (Hindu/Jain), Vegan, Halal, Kosher, Gluten-Free, Diabetic, and Low-Sodium options.
                  </p>
                </div>
                <div className="text-xs text-emerald-400 font-semibold">Included on all flights</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ENTERTAINMENT & WI-FI */}
        {activeTab === 'entertainment' && (
          <div className="space-y-12">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">AeroWings Studio & Satellite Wi-Fi</h2>
              <p className="text-slate-300 text-sm">
                Immerse yourself in high-definition cinema or stay connected with friends and colleagues at 38,000 feet.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 text-sky-400 mb-4">
                    <Tv className="w-8 h-8" />
                    <span className="text-lg font-bold text-white">3,000+ Hours of On-Demand Media</span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed mb-6">
                    Latest Hollywood blockbusters, Bollywood releases, European cinema, international television series, live BBC/CNN news broadcasts, podcasts, and multiplayer seat-to-seat games.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs py-2 border-b border-slate-800 text-slate-300">
                      <span>4K Touchscreens</span>
                      <span className="font-semibold text-white">Capacitive Multi-touch</span>
                    </div>
                    <div className="flex items-center justify-between text-xs py-2 border-b border-slate-800 text-slate-300">
                      <span>Audio</span>
                      <span className="font-semibold text-white">Spatial Dolby Atmos & Bluetooth Audio</span>
                    </div>
                    <div className="flex items-center justify-between text-xs py-2 text-slate-300">
                      <span>Languages</span>
                      <span className="font-semibold text-white">40+ Global Subtitles & Audio Tracks</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 text-purple-400 mb-4">
                    <Wifi className="w-8 h-8" />
                    <span className="text-lg font-bold text-white">High-Speed Satellite Wi-Fi</span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed mb-6">
                    Powered by high-capacity Ka-Band satellites for seamless video streaming, Zoom calls, WhatsApp messaging, and VPN work connections throughout the flight.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs py-2 border-b border-slate-800 text-slate-300">
                      <span>Chat Messaging</span>
                      <span className="font-semibold text-emerald-400">Complimentary for Loyalty Members</span>
                    </div>
                    <div className="flex items-center justify-between text-xs py-2 border-b border-slate-800 text-slate-300">
                      <span>Streaming Pass</span>
                      <span className="font-semibold text-white">Unlimited Full Flight Speed</span>
                    </div>
                    <div className="flex items-center justify-between text-xs py-2 text-slate-300">
                      <span>Coverage</span>
                      <span className="font-semibold text-white">Global Gate-to-Gate Connectivity</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AIRPORT LOUNGES */}
        {activeTab === 'lounges' && (
          <div className="space-y-12">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">AeroWings Signature Airport Lounges</h2>
              <p className="text-slate-300 text-sm">
                Relax before departure in our tranquil airport havens with spa treatments, private sleeping suites, and chef-driven dining.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="h-44 bg-slate-950 relative">
                  <img
                    src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=600&q=80"
                    alt="London Heathrow Lounge"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-slate-900/90 text-white text-xs font-bold rounded-lg backdrop-blur-md">
                    London Heathrow (LHR T2)
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-white text-base mb-2">The Royal Sky Lounge</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Panoramic runway vistas, a cocktail bar with British botanical gins, private work pods, and rain shower suites.
                  </p>
                  <div className="text-[11px] text-sky-400 font-semibold">Open 24 Hours • Terminal 2</div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="h-44 bg-slate-950 relative">
                  <img
                    src="https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80"
                    alt="Dubai International Lounge"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-slate-900/90 text-white text-xs font-bold rounded-lg backdrop-blur-md">
                    Dubai (DXB T3)
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-white text-base mb-2">The Oasis Luxury Lounge</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Middle-Eastern mezze live stations, quiet snooze rooms with acoustic noise dampening, and a complimentary wellness spa.
                  </p>
                  <div className="text-[11px] text-sky-400 font-semibold">Open 24 Hours • Concourse B</div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="h-44 bg-slate-950 relative">
                  <img
                    src="https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=600&q=80"
                    alt="Delhi IGI Lounge"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-slate-900/90 text-white text-xs font-bold rounded-lg backdrop-blur-md">
                    Delhi (DEL T3)
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-white text-base mb-2">The Lotus Grand Lounge</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Interactive tandoori live kitchen, premium baristas, dedicated VIP escort services, and private conference suites.
                  </p>
                  <div className="text-[11px] text-sky-400 font-semibold">Open 24 Hours • Terminal 3</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
