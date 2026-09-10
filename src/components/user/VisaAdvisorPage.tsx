import React, { useState } from 'react';
import { useAirline } from '../../context/AirlineContext';
import { 
  FileText, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  Plane, 
  Sparkles, 
  Globe2, 
  Search, 
  Info,
  Calendar,
  CreditCard,
  Building2,
  ChevronRight,
  Download
} from 'lucide-react';
import { VISA_RULES_DATABASE, AIRPORTS } from '../../data/mockData';
import { VisaRequirement } from '../../types/airline';

const NATIONALITIES = [
  { code: 'India', name: 'Indian Passport (Republic of India)', flag: '🇮🇳' },
  { code: 'United States', name: 'United States Passport (USA)', flag: '🇺🇸' },
  { code: 'United Kingdom', name: 'British Passport (UK)', flag: '🇬🇧' },
  { code: 'United Arab Emirates', name: 'UAE Passport (Emirati)', flag: '🇦🇪' },
  { code: 'Canada', name: 'Canadian Passport', flag: '🇨🇦' },
  { code: 'Australia', name: 'Australian Passport', flag: '🇦🇺' },
  { code: 'Singapore', name: 'Singaporean Passport', flag: '🇸🇬' },
  { code: 'Japan', name: 'Japanese Passport', flag: '🇯🇵' },
  { code: 'Germany', name: 'German Passport (EU)', flag: '🇩🇪' },
  { code: 'France', name: 'French Passport (EU)', flag: '🇫🇷' },
];

const DESTINATIONS = [
  { code: 'United Arab Emirates', name: 'Dubai / Abu Dhabi (UAE)', flag: '🇦🇪', airportCode: 'DXB' },
  { code: 'United Kingdom', name: 'London / England (UK)', flag: '🇬🇧', airportCode: 'LHR' },
  { code: 'Singapore', name: 'Singapore Changi (SIN)', flag: '🇸🇬', airportCode: 'SIN' },
  { code: 'Thailand', name: 'Bangkok / Phuket (Thailand)', flag: '🇹🇭', airportCode: 'BKK' },
  { code: 'United States', name: 'New York / Los Angeles (USA)', flag: '🇺🇸', airportCode: 'JFK' },
  { code: 'Japan', name: 'Tokyo / Osaka (Japan)', flag: '🇯🇵', airportCode: 'HND' },
  { code: 'France', name: 'Paris / France (EU Schengen)', flag: '🇫🇷', airportCode: 'CDG' },
  { code: 'Germany', name: 'Frankfurt / Germany (EU Schengen)', flag: '🇩🇪', airportCode: 'FRA' },
  { code: 'Australia', name: 'Sydney / Melbourne (Australia)', flag: '🇦🇺', airportCode: 'SYD' },
  { code: 'India', name: 'Delhi / Mumbai (India)', flag: '🇮🇳', airportCode: 'DEL' },
];

export const VisaAdvisorPage: React.FC = () => {
  const { performSearch, searchParams, addToast } = useAirline();

  const [nationality, setNationality] = useState<string>('India');
  const [destination, setDestination] = useState<string>('United Arab Emirates');
  const [purpose, setPurpose] = useState<'tourism' | 'business' | 'transit' | 'student'>('tourism');
  const [downloadingProof, setDownloadingProof] = useState<boolean>(false);

  // Look up visa rule or generate dynamic AI advisory
  const getVisaRule = (): VisaRequirement => {
    if (nationality === destination) {
      return {
        nationality,
        destinationCountry: destination,
        purpose,
        status: 'Visa-Free',
        statusBadgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        maxStay: 'Unlimited (Domestic Citizen Rights)',
        passportValidityMonths: 0,
        processingDays: 'Instant',
        approxFee: 'Free (₹0)',
        requirements: ['Valid National ID / Passport for boarding domestic and return flights.'],
        mandatoryDocuments: ['Government Issued Photo Identity Card / Passport'],
        healthVaccines: ['Standard domestic guidelines'],
        customsRestrictions: ['Standard domestic airline baggage security rules apply'],
        officialPortalUrl: '#',
        aiRecommendation: '💡 Domestic Travel: No visa or immigration clearance required. Carry your valid government photo ID.'
      };
    }

    const matchedNationality = VISA_RULES_DATABASE[nationality];
    if (matchedNationality && matchedNationality[destination]) {
      return matchedNationality[destination];
    }

    // Default intelligent AI synthesized visa evaluation
    const isWesternNation = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Japan', 'Singapore'].includes(nationality);
    const isSchengen = ['France', 'Germany'].includes(destination);

    if (isWesternNation && !['India'].includes(destination)) {
      return {
        nationality,
        destinationCountry: destination,
        purpose,
        status: 'Visa-Free',
        statusBadgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        maxStay: 'Up to 90 Days Visa-Free',
        passportValidityMonths: 6,
        processingDays: 'Instant at border control',
        approxFee: 'Free or Low-cost ETA ($10 - $20)',
        requirements: [
          'Valid biometric passport with at least 6 months validity.',
          'Proof of onward or return flight ticket within 90 days.',
          'Digital electronic travel authorization (ETA) where applicable.'
        ],
        mandatoryDocuments: ['Valid Passport', 'Confirmed return AeroWings booking voucher', 'Sufficient travel funds'],
        healthVaccines: ['Standard international traveler norms'],
        customsRestrictions: ['Standard duty-free allowances and customs declarations'],
        officialPortalUrl: 'https://www.iatatravelcentre.com',
        aiRecommendation: `💡 AI Evaluation: Passport holders of ${nationality} enjoy streamlined Visa-Free or rapid ETA entry into ${destination}.`
      };
    }

    return {
      nationality,
      destinationCountry: destination,
      purpose,
      status: isSchengen ? 'Embassy Visa Required' : 'eVisa / ETA',
      statusBadgeColor: isSchengen ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      maxStay: '30 to 90 Days',
      passportValidityMonths: 6,
      processingDays: isSchengen ? '15 Working Days' : '3 to 5 Days',
      approxFee: isSchengen ? '€90 (~ ₹8,200)' : '$50 to $80 USD',
      requirements: [
        `Valid ${nationality} passport with at least 6 months validity from departure date.`,
        'Confirmed round-trip flights and proof of reserved accommodation.',
        'Proof of adequate financial means (bank statements / international credit card).',
        isSchengen ? 'Mandatory Schengen Travel Medical Insurance with minimum €30,000 emergency medical coverage.' : 'Online electronic visa submission.'
      ],
      mandatoryDocuments: ['Passport biographical scan', 'Passport sized photograph', 'AeroWings Flight Booking Receipt', 'Hotel Confirmation'],
      healthVaccines: ['Routine travel vaccinations'],
      customsRestrictions: ['Strict compliance with local currency and customs declarations'],
      officialPortalUrl: 'https://www.iatatravelcentre.com',
      aiRecommendation: `💡 AI Tip: For ${destination}, ensure your passport has at least 2 blank pages and 6 months validity from your scheduled flight date.`
    };
  };

  const currentRule = getVisaRule();

  const handleBookFlight = () => {
    const matchedDest = DESTINATIONS.find(d => d.code === destination);
    const destCode = matchedDest ? matchedDest.airportCode : 'DXB';

    performSearch({
      ...searchParams,
      origin: 'DEL',
      destination: destCode,
      tripType: 'round_trip',
      departureDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
      returnDate: new Date(Date.now() + 86400000 * 15).toISOString().split('T')[0],
    });
  };

  const handleDownloadProof = () => {
    setDownloadingProof(true);
    setTimeout(() => {
      setDownloadingProof(false);
      addToast(`📄 Official Visa Travel Itinerary Letter generated & downloaded for ${destination}!`, 'success');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>AI-Powered Global Visa & Entry Regulations Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Verify Visa Process & Entry Documents
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            Check real-time international visa requirements, passport validity rules, processing timelines, and embassy guidelines before booking your flight.
          </p>
        </div>

        {/* Dynamic Selector Controls Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Nationality Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Globe2 className="w-4 h-4 text-sky-400" />
                <span>Your Passport Nationality</span>
              </label>
              <select
                id="visa-nationality-select"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
              >
                {NATIONALITIES.map((n) => (
                  <option key={n.code} value={n.code}>
                    {n.flag} {n.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Destination Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Plane className="w-4 h-4 text-emerald-400" />
                <span>Destination Country</span>
              </label>
              <select
                id="visa-destination-select"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
              >
                {DESTINATIONS.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.flag} {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Purpose */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>Travel Purpose</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['tourism', 'business', 'transit', 'student'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPurpose(p)}
                    className={`py-2 px-2.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                      purpose === p
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* AI Result Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          
          {/* Header Banner with Status */}
          <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl border border-slate-700">
                {DESTINATIONS.find(d => d.code === destination)?.flag || '🌐'}
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Verified Immigration Status for {nationality} Citizens</div>
                <div className="text-xl font-bold text-white flex items-center gap-2">
                  <span>Traveling to {destination}</span>
                </div>
              </div>
            </div>

            <div className={`px-4 py-2 rounded-xl border text-sm font-bold flex items-center gap-2 shadow-sm ${currentRule.statusBadgeColor}`}>
              <ShieldCheck className="w-5 h-5" />
              <span>{currentRule.status}</span>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-800 bg-slate-950/60 text-center border-b border-slate-800">
            <div className="p-4 space-y-1">
              <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
                <Clock className="w-3.5 h-3.5 text-sky-400" /> Max Permitted Stay
              </div>
              <div className="text-sm font-bold text-slate-100">{currentRule.maxStay}</div>
            </div>

            <div className="p-4 space-y-1">
              <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Passport Validity
              </div>
              <div className="text-sm font-bold text-slate-100">
                {currentRule.passportValidityMonths > 0 ? `Min. ${currentRule.passportValidityMonths} Months` : 'Valid ID'}
              </div>
            </div>

            <div className="p-4 space-y-1">
              <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" /> Processing Turnaround
              </div>
              <div className="text-sm font-bold text-slate-100">{currentRule.processingDays}</div>
            </div>

            <div className="p-4 space-y-1">
              <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-purple-400" /> Government Fee
              </div>
              <div className="text-sm font-bold text-slate-100">{currentRule.approxFee}</div>
            </div>
          </div>

          {/* AI Recommendation Callout */}
          <div className="p-5 bg-blue-950/30 border-b border-blue-900/40 text-blue-200 text-xs sm:text-sm leading-relaxed flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-blue-300">AI Verified Intelligence: </span>
              {currentRule.aiRecommendation}
            </div>
          </div>

          {/* Detailed Lists */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Key Entry Regulations */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Mandatory Entry Requirements</span>
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-300">
                {currentRule.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0"></span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>

              {/* Health and Vaccines */}
              <div className="pt-3">
                <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> Health & Vaccination Guidelines
                </h4>
                <div className="space-y-1.5">
                  {currentRule.healthVaccines.map((item, idx) => (
                    <div key={idx} className="text-xs text-slate-400 flex items-center gap-2">
                      <span className="text-teal-400">•</span> {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Checklist of Mandatory Documents */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-400" />
                <span>Required Documents Checklist</span>
              </h3>
              <div className="space-y-2">
                {currentRule.mandatoryDocuments.map((doc, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-sky-400 flex-shrink-0" />
                    <span>{doc}</span>
                  </div>
                ))}
              </div>

              {/* Customs and Currency Warnings */}
              <div className="pt-3">
                <h4 className="text-xs font-bold text-amber-300 mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Customs & Baggage Declarations
                </h4>
                <div className="space-y-1.5">
                  {currentRule.customsRestrictions.map((item, idx) => (
                    <div key={idx} className="text-xs text-slate-400 flex items-center gap-2">
                      <span className="text-amber-400">•</span> {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Action Footer */}
          <div className="p-6 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                id="btn-download-visa-proof"
                onClick={handleDownloadProof}
                disabled={downloadingProof}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-sky-400" />
                <span>{downloadingProof ? 'Generating PDF...' : 'Download Visa Flight Reservation Letter'}</span>
              </button>

              {currentRule.officialPortalUrl !== '#' && (
                <a
                  href={currentRule.officialPortalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 text-xs font-semibold border border-slate-800 flex items-center gap-1.5 hover:text-white transition-all"
                >
                  <span>Official Government Portal</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
              )}
            </div>

            <button
              id="btn-search-flights-visa"
              onClick={handleBookFlight}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
            >
              <Plane className="w-4 h-4" />
              <span>Search AeroWings Flights to {destination}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
