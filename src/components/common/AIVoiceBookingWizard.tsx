import React, { useState, useEffect, useRef } from 'react';
import { useAirline } from '../../context/AirlineContext';
import { useLanguage } from '../../context/LanguageContext';
import { aiVoice } from '../../utils/aiVoice';
import { AIRPORTS } from '../../data/mockData';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  X, 
  Check, 
  Plane, 
  ArrowRight, 
  RotateCcw, 
  Send,
  Zap,
  Globe2,
  Calendar,
  User,
  Phone,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { AiLanguageCode, Flight } from '../../types/airline';

interface StepState {
  originCode: string;
  originCity: string;
  destCode: string;
  destCity: string;
  dateStr: string;
  selectedFlight: Flight | null;
  passengerName: string;
  passengerPhone: string;
}

export const AIVoiceBookingWizard: React.FC = () => {
  const {
    isVoiceModeActive,
    setVoiceMode,
    toggleVoiceMode,
    aiLanguage,
    setAiLanguage,
    flights,
    performSearch,
    setSelectedFlight,
    executeVoiceBooking,
    setUserView,
    addToast
  } = useAirline();

  const { language: websiteLang } = useLanguage();

  const [currentStep, setCurrentStep] = useState<'search' | 'select' | 'passenger' | 'confirmed'>('search');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [wizardData, setWizardData] = useState<StepState>({
    originCode: 'DEL',
    originCity: 'Delhi',
    destCode: 'BOM',
    destCity: 'Mumbai',
    dateStr: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    selectedFlight: null,
    passengerName: '',
    passengerPhone: ''
  });

  const [availableFlights, setAvailableFlights] = useState<Flight[]>([]);
  const [confirmedPnr, setConfirmedPnr] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [typedInput, setTypedInput] = useState<string>('');
  const recognitionRef = useRef<any>(null);
  const isContinuousActiveRef = useRef<boolean>(false);

  // Keep continuous state in sync
  useEffect(() => {
    isContinuousActiveRef.current = isVoiceModeActive;
    if (isVoiceModeActive) {
      startListening();
      promptStep(currentStep);
    } else {
      stopListening();
    }
  }, [isVoiceModeActive]);

  // Prompt the user with spoken instructions for each step
  const promptStep = (step: 'search' | 'select' | 'passenger' | 'confirmed') => {
    let speechText = '';
    if (step === 'search') {
      if (aiLanguage === 'hi') {
        speechText = 'एयरोविंग्स वॉइस मोड सक्रिय है। आप कहाँ से कहाँ जाना चाहते हैं? जैसे दिल्ली से मुंबई।';
      } else if (aiLanguage === 'kn') {
        speechText = 'ಏರೋವಿಂಗ್ಸ್ ವಾಯ್ಸ್ ಮೋಡ್ ಸಕ್ರಿಯವಾಗಿದೆ. ನೀವು ಎಲ್ಲಿಂದ ಎಲ್ಲಿಗೆ ಪ್ರಯಾಣಿಸಲು ಬಯಸುತ್ತೀರಿ? ಉದಾಹರಣೆಗೆ ದೆಹಲಿಯಿಂದ ಮುಂಬೈ.';
      } else if (aiLanguage === 'te') {
        speechText = 'ఏరోవింగ్స్ వాయిస్ మోడ్ యాక్టివ్‌గా ఉంది. మీరు ఎక్కడి నుండి ఎక్కడికి వెళ్లాలనుకుంటున్నారు? ఉదాహరణకు ఢిల్లీ నుండి ముంబై.';
      } else if (aiLanguage === 'ta') {
        speechText = 'ஏரோவிங்ஸ் வாய்ஸ் மோடு இயங்குகிறது. எங்கிருந்து எங்கு செல்ல விரும்புகிறீர்கள்? உதாரணம் டெல்லி முதல் மும்பை.';
      } else {
        speechText = 'AeroWings Hands-Free Voice Mode active. Where would you like to travel? For example, Delhi to Mumbai.';
      }
    } else if (step === 'select') {
      speechText = `I found matching flights from ${wizardData.originCity} to ${wizardData.destCity}. Say Option 1, Option 2, or say the flight number to choose.`;
    } else if (step === 'passenger') {
      speechText = 'Great choice. Please tell me your passenger name and ten-digit phone number. For example, Arun Kumar, 9876543210.';
    } else if (step === 'confirmed') {
      speechText = `Your ticket is confirmed with PNR ${confirmedPnr}! Zero human hands needed. SMS notification sent.`;
    }

    if (speechText) {
      aiVoice.speak(speechText, { lang: aiLanguage });
    }
  };

  // Web Speech API Continuous Engine
  const startListening = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('SpeechRecognition API not supported in this browser environment.');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.lang = aiLanguage === 'hi' ? 'hi-IN' : aiLanguage === 'kn' ? 'kn-IN' : aiLanguage === 'te' ? 'te-IN' : aiLanguage === 'ta' ? 'ta-IN' : 'en-US';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        const spoken = (final || interim).trim();
        if (spoken) {
          setTranscript(spoken);
          if (final) {
            handleSpokenInput(final);
          }
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('Voice Wizard Recognition Error:', err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        // If still active, seamlessly restart continuous listening
        if (isContinuousActiveRef.current) {
          setTimeout(() => {
            if (isContinuousActiveRef.current) {
              try {
                recognition.start();
              } catch {}
            }
          }, 350);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Recognition start exception:', e);
    }
  };

  const stopListening = () => {
    isContinuousActiveRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
  };

  // Helper to extract cities from user spoken utterance
  const findAirportMatch = (text: string): { code: string; city: string } | null => {
    const lower = text.toLowerCase();
    for (const a of AIRPORTS) {
      if (lower.includes(a.city.toLowerCase()) || lower.includes(a.code.toLowerCase())) {
        return { code: a.code, city: a.city };
      }
    }
    // Popular aliases
    if (lower.includes('delhi') || lower.includes('dilli')) return { code: 'DEL', city: 'Delhi' };
    if (lower.includes('mumbai') || lower.includes('bombay')) return { code: 'BOM', city: 'Mumbai' };
    if (lower.includes('bangalore') || lower.includes('bengaluru')) return { code: 'BLR', city: 'Bengaluru' };
    if (lower.includes('chennai') || lower.includes('madras')) return { code: 'MAA', city: 'Chennai' };
    if (lower.includes('hyderabad')) return { code: 'HYD', city: 'Hyderabad' };
    if (lower.includes('kolkata') || lower.includes('calcutta')) return { code: 'CCU', city: 'Kolkata' };
    if (lower.includes('goa')) return { code: 'GOI', city: 'Goa' };
    if (lower.includes('kochi') || lower.includes('cochin')) return { code: 'COK', city: 'Kochi' };
    if (lower.includes('london')) return { code: 'LHR', city: 'London' };
    if (lower.includes('dubai')) return { code: 'DXB', city: 'Dubai' };
    if (lower.includes('singapore')) return { code: 'SIN', city: 'Singapore' };
    if (lower.includes('new york') || lower.includes('nyc')) return { code: 'JFK', city: 'New York' };
    return null;
  };

  // Process user speech based on the active step
  const handleSpokenInput = async (spokenText: string) => {
    if (!spokenText.trim() || isProcessing) return;
    const lower = spokenText.toLowerCase();

    // STEP 1: Search Routing
    if (currentStep === 'search') {
      setIsProcessing(true);

      // Check if user specified route like "Delhi to Mumbai"
      const toIndex = lower.indexOf(' to ');
      const seIndex = lower.indexOf(' से ');
      let origMatch: { code: string; city: string } | null = null;
      let destMatch: { code: string; city: string } | null = null;

      if (toIndex !== -1) {
        const fromPart = lower.substring(0, toIndex);
        const toPart = lower.substring(toIndex + 4);
        origMatch = findAirportMatch(fromPart);
        destMatch = findAirportMatch(toPart);
      } else if (seIndex !== -1) {
        const fromPart = lower.substring(0, seIndex);
        const toPart = lower.substring(seIndex + 4);
        origMatch = findAirportMatch(fromPart);
        destMatch = findAirportMatch(toPart);
      } else {
        // Look for any two airports in sentence
        const words = lower.split(' ');
        for (const w of words) {
          const match = findAirportMatch(w);
          if (match) {
            if (!origMatch) origMatch = match;
            else if (!destMatch && match.code !== origMatch.code) destMatch = match;
          }
        }
      }

      const orig = origMatch || { code: 'DEL', city: 'Delhi' };
      const dest = destMatch || { code: 'BOM', city: 'Mumbai' };

      // Update search params in AirlineContext
      performSearch({
        tripType: 'one_way',
        origin: orig.code,
        destination: dest.code,
        departureDate: wizardData.dateStr,
        cabinClass: 'economy',
        adults: 1,
        children: 0,
        infants: 0,
        specialFare: 'regular'
      });

      // Filter or find flights for route
      const matching = flights.filter(f => f.origin.code === orig.code && f.destination.code === dest.code);
      const flightsList = matching.length > 0 ? matching.slice(0, 3) : flights.slice(0, 3);

      setWizardData(prev => ({
        ...prev,
        originCode: orig.code,
        originCity: orig.city,
        destCode: dest.code,
        destCity: dest.city
      }));

      setAvailableFlights(flightsList);
      setIsProcessing(false);
      setCurrentStep('select');
      promptStep('select');
      return;
    }

    // STEP 2: Flight Selection
    if (currentStep === 'select') {
      setIsProcessing(true);
      let chosenFlight: Flight | null = null;

      if (lower.includes('one') || lower.includes('1') || lower.includes('first') || lower.includes('पहला') || lower.includes('ಮೊದಲ')) {
        chosenFlight = availableFlights[0] || flights[0];
      } else if (lower.includes('two') || lower.includes('2') || lower.includes('second') || lower.includes('दूसरा') || lower.includes('ಎರಡನೇ')) {
        chosenFlight = availableFlights[1] || availableFlights[0] || flights[0];
      } else if (lower.includes('three') || lower.includes('3') || lower.includes('third') || lower.includes('तीसरा') || lower.includes('ಮೂರನೇ')) {
        chosenFlight = availableFlights[2] || availableFlights[0] || flights[0];
      } else {
        // Check for specific flight number mentioned
        const found = availableFlights.find(f => lower.includes(f.flightNumber.toLowerCase().replace(/[^a-z0-9]/g, '')));
        chosenFlight = found || availableFlights[0] || flights[0];
      }

      if (chosenFlight) {
        setSelectedFlight(chosenFlight);
        setWizardData(prev => ({ ...prev, selectedFlight: chosenFlight }));
        setIsProcessing(false);
        setCurrentStep('passenger');
        promptStep('passenger');
      }
      return;
    }

    // STEP 3: Passenger Details & Immediate Autonomous Booking
    if (currentStep === 'passenger') {
      setIsProcessing(true);

      // Extract phone number (10 digits)
      const phoneDigits = spokenText.match(/(\d{10})/);
      const phone = phoneDigits ? phoneDigits[1] : '9876543210';

      // Extract passenger name
      let cleanName = spokenText
        .replace(/\b(for|name|passenger|phone|number|mobile|is|and|\d)\b/gi, ' ')
        .trim();
      if (!cleanName || cleanName.length < 2) {
        cleanName = 'Arun Kumar';
      }

      setWizardData(prev => ({
        ...prev,
        passengerName: cleanName,
        passengerPhone: phone
      }));

      // Execute Autonomous Voice Booking with Zero Hands
      const targetFlight = wizardData.selectedFlight || flights[0];
      const newBooking = await executeVoiceBooking({
        origin: wizardData.originCode,
        destination: wizardData.destCode,
        flightNumber: targetFlight.flightNumber,
        passengerName: cleanName,
        recipientPhone: phone,
        seatClass: 'Economy',
        totalPriceINR: targetFlight.prices.economy
      });

      setConfirmedPnr(newBooking.pnr);
      setIsProcessing(false);
      setCurrentStep('confirmed');
      promptStep('confirmed');
      return;
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typedInput.trim()) {
      handleSpokenInput(typedInput.trim());
      setTypedInput('');
    }
  };

  if (!isVoiceModeActive) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-slate-900 border-2 border-blue-500/80 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-sky-400">
              <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-sky-300 font-extrabold text-[10px] uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Hands-Free AI Voice Mode</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white">
                Step-by-Step Voice Booking Wizard
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Pill Selector */}
            <select
              value={aiLanguage}
              onChange={(e) => {
                const l = e.target.value as AiLanguageCode;
                setAiLanguage(l);
                promptStep(currentStep);
              }}
              className="bg-slate-950 border border-slate-700 text-xs text-sky-300 rounded-xl px-2 py-1 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => toggleVoiceMode()}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close Voice Mode"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step Progress Tracker */}
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 grid grid-cols-4 gap-2 text-center text-xs">
          {[
            { id: 'search', label: '1. Route & City', active: currentStep === 'search', done: currentStep !== 'search' },
            { id: 'select', label: '2. Pick Flight', active: currentStep === 'select', done: currentStep === 'passenger' || currentStep === 'confirmed' },
            { id: 'passenger', label: '3. Passenger', active: currentStep === 'passenger', done: currentStep === 'confirmed' },
            { id: 'confirmed', label: '4. Confirmed', active: currentStep === 'confirmed', done: currentStep === 'confirmed' },
          ].map((s) => (
            <div
              key={s.id}
              className={`p-1.5 rounded-xl border text-[11px] font-bold transition-all ${
                s.active
                  ? 'bg-blue-600/20 border-blue-500 text-sky-300 shadow-sm'
                  : s.done
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              {s.label}
            </div>
          ))}
        </div>

        {/* Wizard Main Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* STEP 1: Flight Search by Speech */}
          {currentStep === 'search' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/30 space-y-2">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Spoken Route Query</span>
                <p className="text-sm text-slate-200">
                  Say: <strong className="text-amber-300">&ldquo;Search flights from Delhi to Mumbai&rdquo;</strong> or <strong className="text-amber-300">&ldquo;Fly from Bengaluru to Goa&rdquo;</strong>
                </p>
              </div>

              {/* Quick shortcut speech triggers */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400">Or tap to simulate spoken voice command:</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Delhi to Mumbai',
                    'Bengaluru to Goa',
                    'Mumbai to London',
                    'Delhi to Dubai'
                  ].map((route) => (
                    <button
                      key={route}
                      type="button"
                      onClick={() => handleSpokenInput(route)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 hover:text-white transition-all cursor-pointer font-medium"
                    >
                      🎙️ &ldquo;{route}&rdquo;
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Spoken Flight Selection */}
          {currentStep === 'select' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400">Route: </span>
                  <strong className="text-white">{wizardData.originCity} ({wizardData.originCode}) ➔ {wizardData.destCity} ({wizardData.destCode})</strong>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep('search')}
                  className="text-sky-400 hover:underline font-semibold"
                >
                  Change Route
                </button>
              </div>

              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block">
                Say &ldquo;Option 1&rdquo;, &ldquo;Option 2&rdquo;, or &ldquo;Select Flight&rdquo;:
              </span>

              <div className="space-y-2.5">
                {availableFlights.map((f, idx) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleSpokenInput(`Option ${idx + 1}`)}
                    className="w-full p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-blue-500 text-left transition-all cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-sky-300 font-bold flex items-center justify-center text-xs">
                        #{idx + 1}
                      </div>
                      <div>
                        <div className="text-sm font-black text-white flex items-center gap-2">
                          <span>{f.airline} ({f.flightNumber})</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-medium">Non-Stop</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {f.departureTime} ({f.origin.code}) ➔ {f.arrivalTime} ({f.destination.code}) • {f.duration}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-black text-emerald-400">₹{f.prices.economy.toLocaleString()}</div>
                      <span className="text-[10px] text-sky-400 font-bold group-hover:underline">Say &quot;Option {idx + 1}&quot; ➔</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Spoken Passenger Details */}
          {currentStep === 'passenger' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/30 space-y-2">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Say Passenger Details</span>
                <p className="text-sm text-slate-200">
                  Say aloud: <strong className="text-amber-300">&ldquo;My name is Arun Kumar, phone 9876543210&rdquo;</strong>
                </p>
              </div>

              {/* Quick simulation buttons */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400">Or tap to simulate spoken passenger details:</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Arun Kumar 9876543210',
                    'Priya Sharma 9123456780',
                    'Rahul Verma 9898989898'
                  ].map((pax) => (
                    <button
                      key={pax}
                      type="button"
                      onClick={() => handleSpokenInput(pax)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 hover:text-white transition-all cursor-pointer font-medium"
                    >
                      🎙️ &ldquo;{pax}&rdquo;
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Confirmed Ticket Ready */}
          {currentStep === 'confirmed' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border-2 border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-white">Booking Confirmed by AI Voice!</h3>
                <p className="text-xs text-emerald-300 font-mono font-bold">PNR: {confirmedPnr} • E-Ticket Dispatched</p>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  AeroWings AI Reservation Assistant processed your ticket with zero human hands. 100% weather refund guarantee is activated.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setUserView('confirmation');
                    setVoiceMode(false);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white text-xs font-bold transition-all shadow-lg cursor-pointer"
                >
                  View Digital Boarding Pass
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Live Speech Recognition Microphone Bar & Subtitle */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 space-y-3">
          
          {/* Subtitles */}
          <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 p-2.5 rounded-2xl">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              isListening ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'bg-slate-800 text-slate-400'
            }`}>
              {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </div>
            
            <div className="flex-1 truncate text-xs">
              {transcript ? (
                <span className="text-white font-medium italic">&ldquo;{transcript}&rdquo;</span>
              ) : isListening ? (
                <span className="text-sky-300 font-medium animate-pulse">Listening continuously... Speak your answer now.</span>
              ) : (
                <span className="text-slate-500">Microphone paused. Click below to speak or type.</span>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                if (isListening) stopListening();
                else startListening();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {isListening ? 'Mute Mic' : 'Listen Mic'}
            </button>
          </div>

          {/* Typing Fallback Input */}
          <form onSubmit={handleManualSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
              placeholder="Or type here if mic is restricted (e.g., Delhi to Mumbai, Option 1)..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={!typedInput.trim()}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};
