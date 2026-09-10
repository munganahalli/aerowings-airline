import React, { useState, useEffect, useRef } from 'react';
import { useAirline } from '../../context/AirlineContext';
import { processUserAiQuery } from '../../utils/aiConciergeEngine';
import { airlineDB, ChatMessage } from '../../utils/airlineDatabase';
import { aiVoice } from '../../utils/aiVoice';
import {
  MessageSquare,
  Sparkles,
  Send,
  X,
  RefreshCw,
  Volume2,
  VolumeX,
  Plane,
  Ticket,
  Luggage,
  ShieldAlert,
  Search,
  CheckCircle2,
  ChevronDown,
  Maximize2,
  Minimize2,
  ArrowRight,
  AlertTriangle,
  Mic,
  MicOff,
  Globe2,
  MapPin
} from 'lucide-react';
import { AiLanguageCode } from '../../types/airline';
import { GoogleMapsGroundingModal } from './GoogleMapsGroundingModal';

const LANGUAGE_OPTIONS: { code: AiLanguageCode; name: string; nativeName: string; flag: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇦🇪' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' }
];

const WELCOME_MESSAGES: Record<AiLanguageCode, { text: string; suggestions: string[] }> = {
  en: {
    text: '👋 **Hello! I am AeroWings SkyGuide AI Concierge.**\n\nI can assist you with:\n• Searching flights & comparing fares across all states & countries\n• Document verification (Aadhaar, PAN & Visa)\n• Multi-passenger e-ticket downloads with QR codes\n• Weather Doppler radar & 100% instant refunds\n\nHow can I help you today?',
    suggestions: ['Flights from Bengaluru to Mumbai', 'Download All Passenger Tickets', 'Verify Aadhaar & PAN Card', 'What is my baggage allowance?']
  },
  kn: {
    text: '👋 **ನಮಸ್ಕಾರ! ನಾನು ಏರೋವಿಂಗ್ಸ್ ಸ್ಕೈಗೈಡ್ AI ಸಹಾಯಕರಾಗಿದ್ದೇನೆ.**\n\nನಾನು ನಿಮಗೆ ಈ ಕೆಳಗಿನವುಗಳಲ್ಲಿ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ:\n• ಎಲ್ಲಾ ರಾಜ್ಯಗಳು ಮತ್ತು ದೇಶಗಳಿಗೆ ವಿಮಾನಗಳನ್ನು ಹುಡುಕುವುದು\n• ಆಧಾರ್, ಪ್ಯಾನ್ ಮತ್ತು ವೀಸಾ ಪರಿಶೀಲನೆ\n• ಎಲ್ಲ ಪ್ರಯಾಣಿಕರ ಇ-ಟಿಕೆಟ್ ಡೌನ್‌ಲೋಡ್\n• 100% ಹವಾಮಾನ ಮರುಪಾವತಿ ನೀತಿ\n\nಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?',
    suggestions: ['ಬೆಂಗಳೂರಿನಿಂದ ಮುಂಬೈಗೆ ವಿಮಾನಗಳು', 'ಎಲ್ಲಾ ಪ್ರಯಾಣಿಕರ ಟಿಕೆಟ್ ಡೌನ್‌ಲೋಡ್', 'ಆಧಾರ್ ಮತ್ತು ಪ್ಯಾನ್ ಕಾರ್ಡ್ ಪರಿಶೀಲನೆ', 'ಬ್ಯಾಗೇಜ್ ನಿಯಮಗಳು']
  },
  te: {
    text: '👋 **నమస్కారం! నేను ఏరోవింగ్స్ స్కైగైడ్ AI అసిస్టెంట్‌ని.**\n\nనేను మీకు వీటిలో సహాయం చేయగలను:\n• అన్ని రాష్ట్రాలు & దేశాలకు విమానాల శోధన\n• ఆధార్, పాన్ & వీసా ధృవీకరణ వివరాలు\n• ప్రయాణికులందరి ఇ-టికెట్ డౌన్‌లోడ్\n• లైవ్ వెదర్ & 100% తక్షణ రీఫండ్ పాలసీ\n\nఈరోజు నేను మీకు ఎలా సహాయపడగలను?',
    suggestions: ['బెంగళూరు నుండి హైదరాబాద్ విమానాలు', 'అందరి టిక్కెట్లను డౌన్‌లోడ్ చేయండి', 'ఆధార్ మరియు పాన్ కార్డు వెరిఫై', 'లగేజ్ నియమాలు']
  },
  ta: {
    text: '👋 **வணக்கம்! நான் ஏரோவிங்ஸ் AI வழிகாட்டி.**\n\nநான் உங்களுக்கு உதவக்கூடியவை:\n• அனைத்து மாநிலங்களுக்கும் நாடுகளுக்கும் விமானங்களைத் தேடுதல்\n• ஆதார், பான் மற்றும் விசா சரிபார்ப்பு\n• அனைத்து பயணிகளின் மின்-டிக்கெட் பதிவிறக்கம்\n• வானிலை எச்சரிக்கை & 100% உடனடி பணத்தைத் திரும்பப் பெறுதல்\n\nஇன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?',
    suggestions: ['பெங்களூரிலிருந்து சென்னை விமானங்கள்', 'அனைத்து டிக்கெட்டுகளையும் பதிவிறக்கவும்', 'ஆதார் மற்றும் பான் கார்டு சரிபார்த்தல்', 'லக்கேஜ் விவரங்கள்']
  },
  hi: {
    text: '👋 **नमस्ते! मैं एयरोविंग्स स्काईगाइड एआई कंसीयर्ज हूँ।**\n\nमैं आपकी सहायता कर सकता हूँ:\n• सभी राज्यों और देशों के लिए फ्लाइट सर्च\n• आधार, पैन और वीजा सत्यापन\n• सभी यात्रियों के ई-टिकट डाउनलोड\n• मौसम रडार और 100% त्वरित रिफंड\n\nमैं आज आपकी क्या सहायता कर सकता हूँ?',
    suggestions: ['बेंगलुरु से दिल्ली फ्लाइट्स', 'सभी यात्रियों का टिकट डाउनलोड करें', 'आधार और पैन कार्ड सत्यापन', 'सामान (बैगेज) की सीमा']
  },
  ml: {
    text: '👋 **നമസ്കാരം! ഞാൻ എയ്റോവിങ്സ് എഐ അസിസ്റ്റന്റാണ്.**\n\nഎല്ലാ സംസ്ഥാനങ്ങളിലേക്കും രാജ്യങ്ങളിലേക്കും ഫ്ലൈറ്റ് ബുക്കിംഗ്, ആധാർ/പാൻ വെരിഫിക്കേഷൻ, ടിക്കറ്റ് ഡൗൺലോഡ് എന്നിവയിൽ സഹായിക്കാം.',
    suggestions: ['ബാംഗ്ലൂർ മുതൽ കൊച്ചി ഫ്ലൈറ്റുകൾ', 'എല്ലാ ടിക്കറ്റുകളും ഡൗൺലോഡ് ചെയ്യുക', 'ആധാർ പാൻ വെരിഫിക്കേഷൻ']
  },
  mr: {
    text: '👋 **नमस्कार! मी एरोविंग्स स्कायगाइड AI आहे.**\n\nसर्व राज्ये आणि देशांसाठी उड्डाणे शोधणे, आधार/पॅन पडताळणी आणि सर्व प्रवाशांचे तिकीट डाउनलोड करण्यात मदत करतो.',
    suggestions: ['बंगळुरू ते मुंबई उड्डाणे', 'सर्व प्रवाशांचे तिकीट डाउनलोड', 'आधार आणि पॅन कार्ड पडताळणी']
  },
  bn: {
    text: '👋 **নমস্কার! আমি অ্যারোউইংস এআই সহায়ক।**\n\nসমস্ত রাজ্য ও দেশে ফ্লাইট বুকিং, আধার/প্যান যাচাই এবং টিকিট ডাউনলোডে আপনাকে সাহায্য করতে পারি।',
    suggestions: ['বেঙ্গালুরু থেকে কলকাতা ফ্লাইট', 'সমস্ত যাত্রীদের টিকিট ডাউনলোড', 'আধার ও প্যান ভেরিফিকেশন']
  },
  gu: {
    text: '👋 **નમસ્તે! હું એરોવિંગ્સ AI સહાયક છું.**\n\nબધા રાજ્યો અને દેશો માટે ફ્લાઇટ બુકિંગ, આધાર/પાન વેરિફિકેશન અને ટિકિટ ડાઉનલોડમાં મદદ માટે તૈયાર છું.',
    suggestions: ['બેંગલુરુથી અમદાવાદ ફ્લાઇટ્સ', 'બધા મુસાફરોની ટિકિટ ડાઉનલોડ કરો', 'આધાર અને પાન વેરિફિકેશન']
  },
  fr: {
    text: '👋 **Bonjour ! Je suis AeroWings SkyGuide AI.**\n\nJe peux vous aider à réserver des vols, vérifier vos documents et télécharger les billets de tous les passagers.',
    suggestions: ['Vols Paris - Bangalore', 'Télécharger les billets', 'Franchise bagages']
  },
  es: {
    text: '👋 **¡Hola! Soy AeroWings SkyGuide AI.**\n\nPuedo ayudarte con la búsqueda de vuelos, verificación de documentos y descarga de boletos para todos los pasajeros.',
    suggestions: ['Vuelos a Bangalore', 'Descargar billetes', 'Límite de equipaje']
  },
  ar: {
    text: '👋 **مرحباً! أنا مساعد AeroWings AI.**\n\nيمكنني مساعدتك في البحث عن الرحلات وتنزيل التذاكر لجميع الركاب والتحقق من المستندات.',
    suggestions: ['رحلات دبي إلى بنغالور', 'تنزيل تذاكر جميع المسافرين', 'قواعد الأمتعة']
  },
  de: {
    text: '👋 **Hallo! Ich bin AeroWings SkyGuide AI.**\n\nIch helfe Ihnen bei der Flugsuche, Dokumentenüberprüfung und beim Herunterladen von Tickets für alle Passagiere.',
    suggestions: ['Flüge nach Bangalore', 'Alle Tickets herunterladen', 'Gepäckbestimmungen']
  }
};

export const AIConciergeChatbot: React.FC = () => {
  const {
    flights,
    bookings,
    trackedPNR,
    performSearch,
    setUserView,
    setCurrentBookingSuccess,
    searchParams,
    selectedFlight,
    addToast
  } = useAirline();

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedLang, setSelectedLang] = useState<AiLanguageCode>('en');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showMapsModal, setShowMapsModal] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = airlineDB.getChatHistory();
    if (saved.length > 0) return saved;
    return [
      {
        id: 'welcome-1',
        sender: 'ai',
        text: '👋 **Hello! I am AeroWings SkyGuide AI Concierge.**\n\nI can assist you with:\n• Searching flights & comparing fares across all states & countries\n• Retrieving your E-Ticket by PNR\n• Weather Doppler radar & 100% instant refunds\n• Google Maps airport terminal & gate directions\n\nHow can I help you today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: [
          'Flights from Delhi to Mumbai',
          'Retrieve My Booking Ticket',
          'What is my baggage allowance?',
          'Airport Terminal Map'
        ]
      }
    ];
  });

  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    airlineDB.saveChatHistory(messages);
  }, [messages]);

  const handleStartVoiceInput = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addToast('Speech recognition not supported in this browser.', 'error');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      const langSpeechMap: Record<AiLanguageCode, string> = {
        en: 'en-IN',
        kn: 'kn-IN',
        te: 'te-IN',
        ta: 'ta-IN',
        hi: 'hi-IN',
        ml: 'ml-IN',
        mr: 'mr-IN',
        bn: 'bn-IN',
        gu: 'gu-IN',
        fr: 'fr-FR',
        es: 'es-ES',
        ar: 'ar-SA',
        de: 'de-DE'
      };
      recognition.lang = langSpeechMap[selectedLang] || 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        const langObj = LANGUAGE_OPTIONS.find(l => l.code === selectedLang);
        addToast(`🎙️ Listening in ${langObj?.name || 'English'}... Speak your query.`, 'info');
      };

      recognition.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        setIsListening(false);
        setInputVal(transcript);
        handleSendMessage(transcript);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const handleLanguageChange = (code: AiLanguageCode) => {
    setSelectedLang(code);
    setShowLangMenu(false);
    
    const welcome = WELCOME_MESSAGES[code] || WELCOME_MESSAGES.en;
    const switchNotice: ChatMessage = {
      id: `lang-switch-${Date.now()}`,
      sender: 'ai',
      text: welcome.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: welcome.suggestions
    };

    setMessages(prev => [...prev, switchNotice]);
    const langObj = LANGUAGE_OPTIONS.find(l => l.code === code);
    addToast(`AI Concierge language set to ${langObj?.nativeName} (${langObj?.name})`, 'success');
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputVal).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    try {
      // 1. Try Calling Gemini API endpoint on server
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          language: selectedLang,
          contextData: {
            selectedFlight: selectedFlight ? `${selectedFlight.airline} ${selectedFlight.flightNumber}` : 'None',
            searchOrigin: searchParams.origin,
            searchDestination: searchParams.destination,
            pnr: trackedPNR || bookings[0]?.pnr || 'None',
            totalBookings: bookings.length
          },
          conversationHistory: messages.slice(-5)
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: data.reply || 'I am ready to help you with your AeroWings flight.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestions: selectedLang === 'kn'
            ? ['ವಿಮಾನಗಳನ್ನು ಹುಡುಕಿ', 'ನನ್ನ ಬುಕಿಂಗ್‌ಗಳು', 'ಟರ್ಮಿನಲ್ ನಕ್ಷೆ']
            : selectedLang === 'te'
            ? ['విమానాల శోధన', 'నా బుకింగ్స్', 'విమానాశ్రయం మ్యాప్']
            : selectedLang === 'ta'
            ? ['விமானங்களைத் தேடுங்கள்', 'எனது முன்பதிவுகள்', 'விமான நிலைய வரைபடம்']
            : selectedLang === 'hi'
            ? ['फ्लाइट सर्च करें', 'मेरी बुकिंग्स', 'एयरपोर्ट मैप']
            : ['Search Flights', 'My Bookings', 'Airport Maps']
        };

        setMessages(prev => [...prev, aiMsg]);
        setIsTyping(false);

        if (voiceEnabled) {
          const plainText = data.reply.replace(/[*_#`•●★]/g, '').trim();
          aiVoice.speak(plainText, { lang: selectedLang });
        }
        return;
      }
    } catch (apiErr) {
      console.warn('Server AI route unavailable, using local engine:', apiErr);
    }

    // Fallback to local intelligent rule engine
    setTimeout(async () => {
      const aiResponse = await processUserAiQuery(query, {
        flights,
        bookings,
        currentPnr: trackedPNR
      });

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);

      if (voiceEnabled) {
        const plainText = aiResponse.text.replace(/[*_#`•●★]/g, '').trim();
        aiVoice.speak(plainText, { lang: selectedLang });
      }
    }, 400);
  };

  const handleExecuteAction = (action: NonNullable<ChatMessage['action']>) => {
    if (action.type === 'search_flight') {
      const payload = action.payload;
      performSearch({
        tripType: 'one_way',
        origin: payload.origin,
        destination: payload.dest,
        departureDate: searchParams.departureDate || new Date().toISOString().split('T')[0],
        cabinClass: 'economy',
        adults: 1,
        children: 0,
        infants: 0
      });
      setUserView('results');
      setIsOpen(false);
      addToast(`Searching flights: ${payload.originCity || payload.origin} → ${payload.destCity || payload.dest}`, 'info');
    } else if (action.type === 'view_pnr') {
      const booking = action.payload.pnr 
        ? airlineDB.findBookingByPnr(action.payload.pnr) 
        : (bookings[0] || null);
      if (booking) {
        setCurrentBookingSuccess(booking);
        setUserView('confirmation');
      } else {
        setUserView('dashboard');
      }
      setIsOpen(false);
    } else if (action.type === 'view_baggage') {
      setUserView('baggage_guide');
      setIsOpen(false);
    } else if (action.type === 'view_weather') {
      setUserView('weather_ops');
      setIsOpen(false);
    } else if (action.type === 'check_in') {
      setUserView('dashboard');
      setIsOpen(false);
    }
  };

  const handleClearChat = () => {
    const initial: ChatMessage = {
      id: `welcome-${Date.now()}`,
      sender: 'ai',
      text: 'Chat history cleared. How can I assist with your flight booking or ticket retrieval today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        'Search flights: Delhi to Mumbai',
        'Find My Ticket by PNR',
        'Baggage Rules'
      ]
    };
    setMessages([initial]);
    airlineDB.saveChatHistory([initial]);
    addToast('Chat conversation reset', 'info');
  };

  return (
    <>
      {/* Floating Chatbot Bubble Trigger */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-40 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 hover:from-blue-500 hover:to-sky-300 text-white shadow-2xl shadow-blue-500/40 flex items-center gap-2.5 transition-all hover:scale-105 group cursor-pointer"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '4s' }} />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-black tracking-wide leading-none">AeroWings SkyGuide AI</div>
            <div className="text-[10px] text-blue-100 mt-0.5">Multi-Lingual Assistant</div>
          </div>
        </button>
      )}

      {/* Main Chatbot Window */}
      {isOpen && (
        <div
          className={`fixed z-40 bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col transition-all overflow-hidden animate-fadeIn ${
            isExpanded
              ? 'inset-4 sm:inset-10'
              : 'bottom-4 right-4 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white font-bold shadow-md">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">SkyGuide AI Concierge</h3>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300">
                    Gemini Live
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Multi-Language • Google Maps Grounded</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Language Picker */}
              <div className="relative">
                <button
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs flex items-center gap-1"
                  title="Change AI Language"
                >
                  <Globe2 className="w-3.5 h-3.5 text-sky-400" />
                  <span className="uppercase text-[10px] font-bold">{selectedLang}</span>
                </button>

                {showLangMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1 z-50 max-h-56 overflow-y-auto">
                    {LANGUAGE_OPTIONS.map(l => (
                      <button
                        key={l.code}
                        onClick={() => handleLanguageChange(l.code)}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between cursor-pointer ${
                          selectedLang === l.code ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">{l.flag} {l.name}</span>
                        <span className="text-[11px] opacity-75">{l.nativeName}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Voice Read Aloud Toggle */}
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`p-1.5 rounded-lg text-xs ${
                  voiceEnabled ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
                title={voiceEnabled ? 'Voice output enabled' : 'Voice output muted'}
              >
                {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              {/* Reset Chat */}
              <button
                onClick={handleClearChat}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs"
                title="Reset conversation"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

              {/* Expand Toggle */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs hidden sm:block"
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              {/* Close */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Tools Header Strip */}
          <div className="px-3 py-1.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMapsModal(true)}
                className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 border border-blue-500/30 flex items-center gap-1 cursor-pointer"
              >
                <MapPin className="w-3 h-3 text-rose-400" />
                <span>Google Maps Grounding</span>
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-slate-800 text-slate-200 border border-slate-700/80 rounded-bl-none'
                  }`}
                >
                  <div className="whitespace-pre-line break-words">{msg.text}</div>

                  {/* Interactive Action Button if attached */}
                  {msg.action && (
                    <button
                      onClick={() => handleExecuteAction(msg.action!)}
                      className="mt-3 w-full px-3 py-2 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 text-xs shadow-md cursor-pointer transition-all"
                    >
                      <span>{msg.action.label}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-1 px-1">
                  <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                  {msg.sender === 'ai' && (
                    <button
                      type="button"
                      onClick={() => aiVoice.speak(msg.text.replace(/[*_#`•●★]/g, ''), { lang: selectedLang })}
                      className="text-[10px] text-slate-400 hover:text-sky-400 flex items-center gap-1 cursor-pointer transition-colors"
                      title="Listen with clear pronunciation"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Speak</span>
                    </button>
                  )}
                </div>

                {/* AI Suggestions Pill List */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {msg.suggestions.map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(sug)}
                        className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-blue-600/30 text-slate-300 hover:text-sky-300 border border-slate-700 hover:border-blue-500/40 text-[11px] transition-all cursor-pointer"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 text-xs text-sky-400 bg-slate-800 p-2.5 rounded-2xl rounded-bl-none max-w-[120px] border border-slate-700 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-[11px] ml-1">Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
            {/* Mic Speech-To-Text Button */}
            <button
              type="button"
              onClick={handleStartVoiceInput}
              className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
              title="Speak query with speech recognition"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-sky-400" />}
            </button>

            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              placeholder={`Ask in ${LANGUAGE_OPTIONS.find(l => l.code === selectedLang)?.name || 'English'}...`}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />

            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputVal.trim()}
              className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal for Maps Grounding */}
      <GoogleMapsGroundingModal
        isOpen={showMapsModal}
        onClose={() => setShowMapsModal(false)}
        airport={selectedFlight?.origin}
        destinationAirport={selectedFlight?.destination}
      />
    </>
  );
};
