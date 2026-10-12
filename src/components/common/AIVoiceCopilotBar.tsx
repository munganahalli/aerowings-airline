import React, { useState, useEffect, useRef } from 'react';
import { aiVoice } from '../../utils/aiVoice';
import { 
  Volume2, 
  VolumeX, 
  Sparkles, 
  AlertTriangle, 
  ShieldCheck, 
  RefreshCw, 
  Zap, 
  Mic, 
  MicOff, 
  MapPin, 
  Globe2,
  MessageSquare,
  X,
  Send
} from 'lucide-react';
import { useAirline } from '../../context/AirlineContext';
import { useLanguage } from '../../context/LanguageContext';
import { GoogleMapsGroundingModal } from './GoogleMapsGroundingModal';
import { AiLanguageCode } from '../../types/airline';

export const AIVoiceCopilotBar: React.FC = () => {
  const [voiceState, setVoiceState] = useState({
    isSpeaking: false,
    isMuted: false,
    currentText: '',
  });
  const [showNotificationModal, setShowNotificationModal] = useState<boolean>(false);
  const [showMapsModal, setShowMapsModal] = useState<boolean>(false);
  const [showVoiceDialog, setShowVoiceDialog] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<AiLanguageCode>('en');
  const [typedQuestion, setTypedQuestion] = useState<string>('');
  const [isProcessingVoice, setIsProcessingVoice] = useState<boolean>(false);
  const [demoDisruptionData, setDemoDisruptionData] = useState<{
    flightNumber: string;
    pnr: string;
    refundAmount: number;
    reason: string;
  } | null>(null);

  const recognitionRef = useRef<any>(null);
  const { 
    bookings, 
    flights, 
    triggerWeatherDisruption, 
    selectedFlight, 
    searchParams, 
    addToast,
    aiLanguage,
    setAiLanguage,
    performSearch,
    executeVoiceBooking,
    setUserView
  } = useAirline();
  const { language: websiteLang, setLanguage: setWebsiteLang } = useLanguage();

  useEffect(() => {
    setSelectedLanguage(aiLanguage);
  }, [aiLanguage]);

  useEffect(() => {
    if (websiteLang && websiteLang !== selectedLanguage) {
      setSelectedLanguage(websiteLang as AiLanguageCode);
      setAiLanguage(websiteLang as AiLanguageCode);
    }
  }, [websiteLang]);

  const handleLanguageChange = (lang: AiLanguageCode) => {
    setSelectedLanguage(lang);
    setAiLanguage(lang);
    setWebsiteLang(lang as any);
    aiVoice.testPronunciation(lang);
    addToast(`Website & AI Voice switched to ${lang.toUpperCase()} with crystal-clear pronunciation.`, 'success');
  };

  const handleTestPronunciation = () => {
    aiVoice.testPronunciation(selectedLanguage);
    addToast(`Testing ${selectedLanguage.toUpperCase()} clear pronunciation...`, 'info');
  };

  useEffect(() => {
    const unsubscribe = aiVoice.subscribe((state) => {
      setVoiceState(state);
    });
    return () => unsubscribe();
  }, []);

  const handleToggleMute = () => {
    const isNowMuted = aiVoice.toggleMute();
    if (!isNowMuted) {
      aiVoice.testPronunciation(selectedLanguage);
    }
  };

  const handleReplay = () => {
    if (voiceState.currentText) {
      aiVoice.speak(voiceState.currentText, { lang: selectedLanguage });
    } else {
      aiVoice.testPronunciation(selectedLanguage);
    }
  };

  // Process a text or speech query with the AI voice endpoint
  const processVoiceQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    setIsProcessingVoice(true);
    addToast(`Processing voice query: "${queryText}"`, 'info');

    const lower = queryText.toLowerCase();

    // Direct Voice Flight Search Navigation
    if (lower.includes('search') || lower.includes('find flight') || lower.includes('flights to') || lower.includes('show flight') || lower.includes('खोजें') || lower.includes('ಹುಡುಕಿ')) {
      let orig = 'DEL';
      let dest = 'BOM';
      if (lower.includes('bangalore') || lower.includes('bengaluru') || lower.includes('blr')) dest = 'BLR';
      else if (lower.includes('goa') || lower.includes('goi')) dest = 'GOI';
      else if (lower.includes('london') || lower.includes('lhr')) dest = 'LHR';
      else if (lower.includes('dubai') || lower.includes('dxb')) dest = 'DXB';
      else if (lower.includes('kolkata') || lower.includes('ccu')) dest = 'CCU';
      else if (lower.includes('chennai') || lower.includes('maa')) dest = 'MAA';

      performSearch({ ...searchParams, origin: orig, destination: dest });
      aiVoice.speak(`Searching flights connecting ${orig} to ${dest}. Flight schedule updated.`, { lang: selectedLanguage });
      setIsProcessingVoice(false);
      setShowVoiceDialog(false);
      setTypedQuestion('');
      return;
    }

    try {
      const res = await fetch('/api/ai/live-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userTranscript: queryText,
          language: selectedLanguage,
          flightContext: {
            selectedFlight: selectedFlight ? `${selectedFlight.airline} ${selectedFlight.flightNumber} to ${selectedFlight.destination.city}` : 'None',
            searchRoute: `${searchParams.origin} to ${searchParams.destination}`
          }
        })
      });
      const data = await res.json();

      // If Gemini AI triggered the process_flight_booking function
      if (data.functionCall && data.functionCall.name === 'process_flight_booking') {
        const args = data.functionCall.args || {};
        await executeVoiceBooking({
          origin: searchParams.origin || 'DEL',
          destination: searchParams.destination || 'BOM',
          flightNumber: args.flightNumber || 'AW-302',
          passengerName: args.passengerName || 'Valued Passenger',
          recipientPhone: args.recipientPhone || '9876543210',
          seatClass: args.seatClass || 'Economy',
          totalPriceINR: args.totalPriceINR,
          smsMessage: args.smsMessage
        });
        if (data.speechText) {
          aiVoice.speak(data.speechText, { lang: selectedLanguage });
        }
        return;
      }

      // If user transcript is a direct booking request without manual form clicks
      if (lower.includes('book') || lower.includes('reserve') || lower.includes('बुक') || lower.includes('ಬುಕ್') || lower.includes('బుక్')) {
        let nameMatch = queryText.match(/for\s+([A-Za-z\s]+?)(?:,|\.|\s+phone|\s+with|\s+number|\s*\d|$)/i);
        let phoneMatch = queryText.match(/(\d{10})/);
        const passName = nameMatch ? nameMatch[1].trim() : 'Valued Passenger';
        const phone = phoneMatch ? phoneMatch[1] : '9876543210';

        await executeVoiceBooking({
          origin: searchParams.origin || 'DEL',
          destination: searchParams.destination || 'BOM',
          flightNumber: selectedFlight?.flightNumber || 'AW-302',
          passengerName: passName,
          recipientPhone: phone,
          seatClass: 'Economy',
          totalPriceINR: selectedFlight?.prices.economy || 4850
        });
        return;
      }

      if (data.speechText) {
        aiVoice.speak(data.speechText, { lang: selectedLanguage });
      }
    } catch (err) {
      if (lower.includes('book') || lower.includes('ticket')) {
        await executeVoiceBooking({
          origin: 'DEL',
          destination: 'BOM',
          passengerName: 'Valued Passenger',
          recipientPhone: '9876543210'
        });
      } else {
        aiVoice.speak(`I heard: "${queryText}". AeroWings is operating normally with 100% weather refund protection.`, { lang: selectedLanguage });
      }
    } finally {
      setIsProcessingVoice(false);
      setShowVoiceDialog(false);
      setTypedQuestion('');
    }
  };

  // Real-Time Voice Conversation with Speech Recognition & Gemini Live API
  const handleStartListening = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // Fallback: Open voice query dialog so user can still use voice assistant without browser restriction
      setShowVoiceDialog(true);
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = selectedLanguage === 'hi' ? 'hi-IN' : selectedLanguage === 'ta' ? 'ta-IN' : selectedLanguage === 'te' ? 'te-IN' : selectedLanguage === 'kn' ? 'kn-IN' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        addToast('🎙️ AeroWings Voice Copilot is listening... speak your flight question now.', 'info');
      };

      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        await processVoiceQuery(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
        // If mic permission was denied or failed, open prompt assistant
        setShowVoiceDialog(true);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Speech recognition error:', e);
      setIsListening(false);
      setShowVoiceDialog(true);
    }
  };

  const handleTestAutoCancellationAndRefund = () => {
    const activeBooking = bookings.find(b => b.status === 'Confirmed') || bookings[0];
    const targetFlight = activeBooking ? activeBooking.flight : (flights[0] || null);

    if (!targetFlight) return;

    const airportCode = targetFlight.origin.code;
    const pnr = activeBooking ? activeBooking.pnr : 'AI-DEMO-99';
    const refundAmt = activeBooking ? activeBooking.priceBreakdown.finalTotal : (targetFlight.prices.economy * 1.12);

    triggerWeatherDisruption(airportCode, 'Typhoon / Cyclone', 'severe');
    aiVoice.announceWeatherAutoCancellation(targetFlight.flightNumber, Math.round(refundAmt), 'Severe Cyclone', airportCode);

    setDemoDisruptionData({
      flightNumber: targetFlight.flightNumber,
      pnr,
      refundAmount: Math.round(refundAmt),
      reason: `AI Doppler Auto-Grounding: Severe Typhoon alert at ${airportCode} exceeding aircraft aerodynamic safety limits.`
    });
    setShowNotificationModal(true);
  };

  return (
    <>
      {/* Sleek Voice Copilot Bar - Relative on mobile, sticky on larger screens to avoid mobile clutter */}
      <div className="relative sm:sticky sm:top-16 z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-1.5 sm:py-2 flex items-center justify-between gap-2 sm:gap-3 text-xs">
          
          {/* Left: AI Voice Status & Mic Trigger */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-semibold shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-spin" style={{ animationDuration: '4s' }} />
              <span className="hidden sm:inline">AeroWings Voice Copilot</span>
              <span className="sm:hidden text-[11px]">AI Voice</span>
            </div>

            {/* Live Mic Speech Recognition / Assistant Button */}
            <button
              type="button"
              onClick={handleStartListening}
              className={`px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm text-xs shrink-0 ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-blue-600/20 hover:bg-blue-600/40 text-sky-300 border border-blue-500/40'
              }`}
              title="Speak with AI Voice Assistant"
            >
              {isListening ? (
                <>
                  <MicOff className="w-3.5 h-3.5 animate-spin" />
                  <span>Listening...</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5 text-sky-400" />
                  <span>Speak</span>
                </>
              )}
            </button>

            {/* Speaking Waveform */}
            {voiceState.isSpeaking && (
              <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 shrink-0">
                <span className="w-1 h-2.5 bg-emerald-400 rounded animate-pulse" />
                <span className="w-1 h-3.5 bg-emerald-400 rounded animate-pulse" style={{ animationDelay: '150ms' }} />
                <span className="w-1 h-2 bg-emerald-400 rounded animate-pulse" style={{ animationDelay: '300ms' }} />
                <span className="text-[10px] font-bold text-emerald-400 ml-1 hidden md:inline">Speaking</span>
              </div>
            )}

            {/* 100% Hands-Free Voice Booking Trigger */}
            <button
              type="button"
              onClick={() => {
                processVoiceQuery('Book flight from Delhi to Mumbai for Rahul Sharma 9876543210');
              }}
              className="hidden lg:inline-flex px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-sky-500/20 hover:from-amber-500/30 hover:to-sky-500/30 border border-amber-500/40 text-amber-300 font-bold items-center gap-1.5 transition-all text-xs cursor-pointer shadow-sm"
              title="Click to execute complete hands-free voice booking"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Voice Book (Hands-Free)</span>
            </button>

            {/* Subtitles text (hidden on phone, visible on tablet/desktop) */}
            <div className="truncate text-slate-300 text-xs italic bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800 flex-1 max-w-md hidden md:block">
              {voiceState.currentText ? (
                <span>&ldquo;{voiceState.currentText}&rdquo;</span>
              ) : (
                <span className="text-slate-500">AeroWings Voice Assistant ready — speak or tap Ask to get audio updates.</span>
              )}
            </div>
          </div>

          {/* Right: Controls & Language Selector */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Quick Ask Helper Button */}
            <button
              type="button"
              onClick={() => setShowVoiceDialog(true)}
              className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1 transition-colors cursor-pointer text-xs"
              title="Open Voice Query Assistant"
            >
              <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>

            {/* Multi-Language Selector Dropdown */}
            <div className="flex items-center gap-1 bg-slate-900 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg border border-slate-700">
              <Globe2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <select
                value={selectedLanguage}
                onChange={(e) => handleLanguageChange(e.target.value as AiLanguageCode)}
                className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer pr-1 max-w-[85px] sm:max-w-none"
                title="Select Multilingual AI Pronunciation Voice"
              >
                <option value="en" className="bg-slate-900 text-white">English</option>
                <option value="kn" className="bg-slate-900 text-white">ಕನ್ನಡ (Kannada)</option>
                <option value="te" className="bg-slate-900 text-white">తెలుగు (Telugu)</option>
                <option value="ta" className="bg-slate-900 text-white">தமிழ் (Tamil)</option>
                <option value="hi" className="bg-slate-900 text-white">हिन्दी (Hindi)</option>
                <option value="ml" className="bg-slate-900 text-white">മലയാളം (Malayalam)</option>
                <option value="mr" className="bg-slate-900 text-white">मराठी (Marathi)</option>
                <option value="bn" className="bg-slate-900 text-white">বাংলা (Bengali)</option>
                <option value="gu" className="bg-slate-900 text-white">ગુજરાતી (Gujarati)</option>
                <option value="fr" className="bg-slate-900 text-white">Français</option>
                <option value="es" className="bg-slate-900 text-white">Español</option>
                <option value="de" className="bg-slate-900 text-white">Deutsch</option>
                <option value="ar" className="bg-slate-900 text-white">العربية</option>
              </select>
            </div>

            {/* Mute/Unmute Toggle */}
            <button
              type="button"
              onClick={handleToggleMute}
              title={voiceState.isMuted ? 'Unmute AI Voice' : 'Mute AI Voice'}
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg border flex items-center gap-1 font-medium transition-colors cursor-pointer shrink-0 ${
                voiceState.isMuted
                  ? 'bg-rose-950/40 border-rose-500/40 text-rose-300 hover:bg-rose-900/40'
                  : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/40'
              }`}
            >
              {voiceState.isMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                  <span className="hidden sm:inline">Muted</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Sound On</span>
                </>
              )}
            </button>

            {/* Google Maps Terminal Grounding Button (desktop only) */}
            <button
              type="button"
              onClick={() => setShowMapsModal(true)}
              className="hidden md:inline-flex px-2 py-1 rounded-lg bg-blue-950/60 hover:bg-blue-900/60 border border-blue-500/30 text-blue-300 items-center gap-1 transition-colors cursor-pointer"
              title="Google Maps Airport Grounding Navigation"
            >
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>Airport Maps</span>
            </button>
          </div>

        </div>
      </div>

      {/* Voice Assistant Query Dialog (Guaranteed to work on all phones and browsers) */}
      {showVoiceDialog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 text-sky-400 flex items-center justify-center">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">AeroWings Voice Copilot</h3>
                  <p className="text-[11px] text-slate-400">Ask any flight, weather, or baggage question</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowVoiceDialog(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick-tap voice queries */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Common Flight Questions</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Book flight Delhi to Mumbai for Rahul Sharma 9876543210',
                  'Search flights Delhi to Bangalore',
                  'What is the live weather at Delhi Airport?',
                  'Check weather & Doppler radar',
                  'Test Zero-Human Weather Auto-Cancel & Refund'
                ].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => processVoiceQuery(q)}
                    disabled={isProcessingVoice}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-blue-600/30 hover:border-blue-500/40 border border-slate-700 text-xs text-slate-200 hover:text-sky-300 transition-colors cursor-pointer text-left"
                  >
                    💬 {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom question input */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400">Or type custom question to speak aloud:</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={typedQuestion}
                  onChange={(e) => setTypedQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') processVoiceQuery(typedQuestion);
                  }}
                  placeholder="e.g. Flight 102 gate number?"
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => processVoiceQuery(typedQuestion)}
                  disabled={!typedQuestion.trim() || isProcessingVoice}
                  className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
              <span>Language: <strong className="text-white">{selectedLanguage.toUpperCase()}</strong></span>
              <button
                type="button"
                onClick={handleTestPronunciation}
                className="text-sky-400 hover:underline"
              >
                Test Voice Pronunciation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Maps Airport Grounding Navigator Modal */}
      <GoogleMapsGroundingModal
        isOpen={showMapsModal}
        onClose={() => setShowMapsModal(false)}
        airport={selectedFlight?.origin}
        destinationAirport={selectedFlight?.destination}
      />

      {/* Modal triggered when Automated Cancellation & Refund is simulated */}
      {showNotificationModal && demoDisruptionData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-red-500 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5 text-red-400 font-bold">
                <AlertTriangle className="w-6 h-6 text-red-500 animate-bounce" />
                <div>
                  <h3 className="text-base text-white font-black">AI Doppler Auto-Cancellation Triggered</h3>
                  <p className="text-[11px] text-red-300">Severe Meteorological Hazard Detected</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-mono font-bold">
                CRITICAL - GROUNDED
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 space-y-2 text-xs">
              <div className="text-slate-200 font-medium leading-relaxed">
                {demoDisruptionData.reason}
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-slate-300 border-t border-red-900/40">
                <div>
                  <span className="text-slate-400">Flight: </span>
                  <span className="font-bold text-white">{demoDisruptionData.flightNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400">PNR: </span>
                  <span className="font-mono font-bold text-sky-400">{demoDisruptionData.pnr}</span>
                </div>
              </div>
            </div>

            {/* Instant Refund Card */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>100% Zero-Deduction Refund Completed</span>
                </div>
                <span className="text-xs font-mono font-extrabold text-emerald-300">
                  ₹{demoDisruptionData.refundAmount.toLocaleString()}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                AeroWings automated guarantee has credited <strong className="text-white">₹{demoDisruptionData.refundAmount.toLocaleString()}</strong> instantly back to original payment method. Zero cancellation fees applied.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-sky-300 bg-sky-950/30 p-2.5 rounded-xl border border-sky-500/20">
              <Volume2 className="w-4 h-4 text-sky-400 shrink-0" />
              <span>AeroWings AI Voice has announced this status aloud to passengers.</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowNotificationModal(false)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-colors"
              >
                Acknowledge & Close
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
