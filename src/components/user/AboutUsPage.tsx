import React, { useState } from 'react';
import { useAirline } from '../../context/AirlineContext';
import { 
  Building2, 
  Plane, 
  Leaf, 
  ShieldCheck, 
  Award, 
  Users, 
  Globe2, 
  ArrowRight, 
  Sparkles,
  CheckCircle2,
  Compass,
  UtensilsCrossed,
  Languages,
  HeartHandshake
} from 'lucide-react';

export const AboutUsPage: React.FC = () => {
  const { setUserView, setOrigin, setDestination, addToast } = useAirline();
  const [selectedCorridorIndex, setSelectedCorridorIndex] = useState<number>(0);

  const continentalCorridors = [
    {
      id: 'corridor-europe',
      title: 'India ↔ Europe Corridor',
      hubs: 'DEL / BOM ⇄ LHR (London), CDG (Paris), FRA (Frankfurt)',
      originCode: 'DEL',
      destCode: 'LHR',
      flightTime: '8h 45m Direct',
      aircraft: 'Airbus A350-900 & Boeing 787-9',
      highlight: 'Connecting the financial hubs of London & Frankfurt with heartfelt Indian hospitality.',
      culturalExperience: 'Michelin-starred European dining paired with authentic Indian Royal Awadhi Thali.',
      languages: 'English, Hindi, French, German in-flight announcements',
      image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'corridor-middle-east',
      title: 'India ↔ Middle East Gateway',
      hubs: 'DEL / BOM / BLR ⇄ DXB (Dubai), DOH (Doha), AUH (Abu Dhabi)',
      originCode: 'BOM',
      destCode: 'DXB',
      flightTime: '3h 30m Direct',
      aircraft: 'Boeing 787-9 Dreamliner',
      highlight: 'Bridging South Asia to the Persian Gulf with multiple daily direct luxury departures.',
      culturalExperience: 'Arabic mezze platters, dates & cardamom coffee, and 100% Halal certified dining.',
      languages: 'Arabic, English, Hindi, Urdu, Malayalam',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'corridor-asia',
      title: 'India ↔ Southeast & East Asia',
      hubs: 'DEL / BOM ⇄ SIN (Singapore), HND (Tokyo), BKK (Bangkok)',
      originCode: 'DEL',
      destCode: 'SIN',
      flightTime: '5h 45m Direct',
      aircraft: 'Airbus A350-900',
      highlight: 'Linking vibrant cultural capitals and cutting-edge tech corridors across the Asia-Pacific.',
      culturalExperience: 'Pan-Asian fusion cuisine, Japanese green tea service, and Singaporean street-style satays.',
      languages: 'English, Hindi, Japanese, Mandarin, Tamil',
      image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'corridor-americas',
      title: 'India ↔ North America Non-Stop',
      hubs: 'DEL / BOM ⇄ JFK (New York), SFO (San Francisco)',
      originCode: 'DEL',
      destCode: 'JFK',
      flightTime: '15h 20m Ultra-Long Haul Non-Stop',
      aircraft: 'Airbus A350-900 Ultra Long Range',
      highlight: 'Non-stop transpolar connectivity linking Silicon Valley and Manhattan directly with India.',
      culturalExperience: 'Four-course global culinary journey, sleep-inducing mood lighting, and mid-flight wellness snacks.',
      languages: 'English, Hindi, Punjabi, Gujarati',
      image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&q=80'
    }
  ];

  const activeCorridor = continentalCorridors[selectedCorridorIndex];

  const fleetData = [
    {
      model: 'Airbus A350-900 Ultra Long Haul',
      count: 24,
      range: '15,000 km (Intercontinental)',
      capacity: '325 Passengers (First, Business, Premium, Economy)',
      engine: 'Rolls-Royce Trent XWB (25% lower fuel burn)',
      amenities: 'Full Lie-flat suites, 4K IFE, High-speed Ka-band Wi-Fi',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&q=80'
    },
    {
      model: 'Boeing 787-9 Dreamliner',
      count: 32,
      range: '14,140 km (Global Long Haul)',
      capacity: '290 Passengers',
      engine: 'GEnx-1B with composite carbon-fibre fuselage',
      amenities: 'Dynamic LED mood lighting, larger dimmable windows, quieter cabin',
      image: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=600&q=80'
    },
    {
      model: 'Airbus A321neo Direct',
      count: 58,
      range: '7,400 km (Regional & High-Density Domestic)',
      capacity: '220 Passengers',
      engine: 'CFM LEAP-1A with Sharklet wingtips (20% lower CO2)',
      amenities: 'Airspace cabin architecture, extra-large overhead XL bins, USB-C at all seats',
      image: 'https://images.unsplash.com/photo-1507812984078-917a274065be?auto=format&fit=crop&w=600&q=80'
    }
  ];

  const milestones = [
    { year: '2012', title: 'AeroWings Founded', desc: 'Inaugural operations began connecting primary domestic hubs with 5 modern A320 aircraft.' },
    { year: '2016', title: 'Global Long-Haul Expansion', desc: 'Launched direct intercontinental routes to London Heathrow, Dubai, and Singapore.' },
    { year: '2020', title: 'Dreamliner Fleet Integration', desc: 'Inducted 20 Boeing 787-9 Dreamliners and pioneered 100% digital contactless travel.' },
    { year: '2024', title: '5-Star Skytrax Rating', desc: 'Awarded World’s Best Cabin Crew and Skytrax 5-Star Global Airline certification.' }
  ];

  return (
    <div className="min-w-0 bg-slate-950 text-slate-100 pb-20">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-b border-slate-800 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-4">
            <Building2 className="w-3.5 h-3.5" />
            <span>The AeroWings Story & Fleet Profile</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Connecting People, Cultures & Continents
          </h1>
          <p className="max-w-2xl mx-auto text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
            As a premier global carrier, AeroWings operates one of the world's youngest, most fuel-efficient fleets, delivering heartfelt hospitality and operational excellence.
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
              <div className="text-2xl sm:text-3xl font-extrabold text-white">114+</div>
              <div className="text-xs text-slate-400 mt-1">Modern Aircraft in Fleet</div>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">92+</div>
              <div className="text-xs text-slate-400 mt-1">Global Destinations</div>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-300">99.4%</div>
              <div className="text-xs text-slate-400 mt-1">On-Time Reliability</div>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
              <div className="text-2xl sm:text-3xl font-extrabold text-purple-400">18M+</div>
              <div className="text-xs text-slate-400 mt-1">Passengers Flown Annually</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div id="company-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-16">
        
        {/* INTERACTIVE: CONNECTING PEOPLE, CULTURES & CONTINENTS EXPLORER */}
        <section id="connecting-cultures" className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-2 border-indigo-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-indigo-500/20 pb-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
                <Globe2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Connecting People, Cultures & Continents</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Global Corridors & Cultural Bridge
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                AeroWings is more than an airline — we are a cultural ambassador linking over 92 destinations across 4 continents. Explore our flagship intercontinental corridors, specialized cultural culinary offerings, and non-stop flight paths.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {continentalCorridors.map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCorridorIndex(i)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedCorridorIndex === i
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 ring-2 ring-blue-400'
                      : 'bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {c.title}
                </button>
              ))}
            </div>
          </div>

          {/* Active Corridor Showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-widest font-mono">
                  Corridor #{selectedCorridorIndex + 1} • {activeCorridor.flightTime}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {activeCorridor.title}
                </h3>
                <div className="text-xs text-amber-300 font-semibold flex items-center gap-2">
                  <Compass className="w-4 h-4 text-amber-400" />
                  <span>{activeCorridor.hubs}</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800">
                {activeCorridor.highlight}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
                    <UtensilsCrossed className="w-3.5 h-3.5" />
                    <span>Cultural Dining</span>
                  </div>
                  <p className="text-[11px] text-slate-300">{activeCorridor.culturalExperience}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-sky-300 font-bold text-xs">
                    <Languages className="w-3.5 h-3.5" />
                    <span>Multilingual Crew</span>
                  </div>
                  <p className="text-[11px] text-slate-300">{activeCorridor.languages}</p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setOrigin(activeCorridor.originCode);
                    setDestination(activeCorridor.destCode);
                    setUserView('home');
                    addToast(`Route ${activeCorridor.originCode} ➔ ${activeCorridor.destCode} pre-filled! Search flights now.`, 'info');
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Plane className="w-4 h-4" />
                  <span>Book This Continental Corridor ({activeCorridor.originCode} ✈ {activeCorridor.destCode})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 relative rounded-2xl overflow-hidden border border-slate-700 shadow-2xl h-80">
              <img
                src={activeCorridor.image}
                alt={activeCorridor.title}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white">
                <span className="px-3 py-1 bg-slate-900/90 rounded-xl border border-slate-700 font-mono font-bold">
                  Aircraft: {activeCorridor.aircraft}
                </span>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl font-bold">
                  Daily Scheduled
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 1: MODERN FLEET PROFILE */}
        <section id="fleet-section">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Our Modern Fleet</h2>
            <p className="text-slate-300 text-sm">
              With an average fleet age of just 4.2 years, AeroWings operates cutting-edge Airbus and Boeing aircraft engineered for silence, comfort, and ultra-low emissions.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {fleetData.map((aircraft, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between">
                <div>
                  <div className="h-48 relative">
                    <img src={aircraft.image} alt={aircraft.model} className="w-full h-full object-cover" />
                    <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-slate-950/90 text-white text-xs font-mono font-bold rounded-lg backdrop-blur-md">
                      {aircraft.count} Aircraft in Service
                    </span>
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-bold text-white mb-3">{aircraft.model}</h3>
                    
                    <div className="space-y-2 text-xs text-slate-300 mb-4">
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-400">Flight Range</span>
                        <span className="font-semibold text-white">{aircraft.range}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-400">Total Capacity</span>
                        <span className="font-semibold text-white">{aircraft.capacity}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-400">Engine Technology</span>
                        <span className="font-semibold text-emerald-400">{aircraft.engine}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                      ✨ {aircraft.amenities}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: SUSTAINABILITY & NET ZERO */}
        <section id="sustainability-section" className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-full mb-3 border border-emerald-500/30">
                <Leaf className="w-3.5 h-3.5" />
                <span>FlyNet Zero 2050 Commitment</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Pioneering Sustainable Commercial Aviation
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
                AeroWings is committed to achieving net-zero carbon emissions by 2050 through fleet modernisation, Sustainable Aviation Fuel (SAF) investments, and zero-single-use plastics across our in-flight dining.
              </p>

              <div className="space-y-3 text-xs sm:text-sm text-slate-300">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Sustainable Aviation Fuel (SAF)</strong> blended on 30% of long-haul routes.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>100% Biodegradable Cutlery & Meal Trays</strong> eliminating 800+ tonnes of plastic annually.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Continuous Descent Operations (CDO)</strong> minimizing airport noise and ground emissions.</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 p-6 sm:p-8 rounded-2xl border border-slate-800 text-center">
              <div className="text-xs uppercase text-slate-400 font-semibold mb-2">Our 2030 Carbon Target</div>
              <div className="text-4xl sm:text-5xl font-extrabold text-emerald-400 mb-2">-35%</div>
              <div className="text-xs text-slate-300 max-w-xs mx-auto mb-6">
                Reduction in grams of CO2 per revenue passenger kilometre compared to 2019 levels.
              </div>
              <button
                onClick={() => setUserView('home')}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <span>Book Eco-Efficient Flight</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 3: SAFETY & GLOBAL ACCREDITATIONS */}
        <section id="safety-section">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Safety, Quality & Accreditations</h2>
            <p className="text-slate-300 text-sm">
              Safety is the foundational cornerstone of every decision at AeroWings.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-base mb-1">IOSA Certified</h3>
              <p className="text-xs text-slate-400">
                IATA Operational Safety Audit certification with continuous 100% compliance audit scores.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-base mb-1">Skytrax 5-Star</h3>
              <p className="text-xs text-slate-400">
                Recognised for exceptional service across ground handling, executive lounges, and cabin crew hospitality.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                <Globe2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-base mb-1">IATA Member Airline</h3>
              <p className="text-xs text-slate-400">
                Full active voting member of the International Air Transport Association since 2014.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-base mb-1">12,000+ Aviation Crew</h3>
              <p className="text-xs text-slate-400">
                Trained at the AeroWings Flight Academy under strict international flight safety standards.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
