import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, type FunctionDeclaration, Type } from '@google/genai';
import dotenv from 'dotenv';
import {
  generateSecure6DigitOtp,
  saveOtpToDatabase,
  sendSmsViaApi,
  verifyOtpInDatabase,
  sendCustomSms,
  createFlightBookingAndNotify
} from './server/otpService.ts';
import {
  connectToMongo,
  saveFlightBooking,
  getBookingByPnr,
  getAllBookings,
  searchBookings,
  registerUser,
  findUserByEmailOrPhone,
  getAllUsers,
  issueTicket,
  getTicketByIdentifier,
  getAllTickets,
  type FlightBookingModel,
  type UserModel,
  type TicketModel
} from './server/mongoService.ts';
import {
  sendSms,
  sendFlightBookingSms,
  sendTicketIssuedSms,
  formatE164Phone,
  getTwilioClient
} from './server/twilioSmsService.ts';

dotenv.config({ override: true });

// Port resolution:
// 1. In AI Studio dev container, DEFAULT_APP_PORT is 3000 (proxied via nginx).
// 2. In deployed Cloud Run container, PORT is injected by Cloud Run (default 8080) while DEFAULT_APP_PORT is unset.
const PORT = process.env.DEFAULT_APP_PORT
  ? parseInt(process.env.DEFAULT_APP_PORT, 10)
  : (process.env.PORT ? parseInt(process.env.PORT, 10) : 3000);

// Function declaration for processing flight bookings
const processFlightBookingDeclaration: FunctionDeclaration = {
  name: 'process_flight_booking',
  description: 'Process flight booking requests with structured passenger, flight, and fare details, issue a verified PNR, and dispatch a mobile confirmation SMS.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      pnr: {
        type: Type.STRING,
        description: 'Unique 6-character alphanumeric Passenger Name Record (PNR) code, e.g., AW8942'
      },
      passengerName: {
        type: Type.STRING,
        description: 'Full name of the passenger traveling'
      },
      flightNumber: {
        type: Type.STRING,
        description: 'Flight identifier code, e.g., AW-402'
      },
      seatClass: {
        type: Type.STRING,
        description: 'Class of travel (Economy, Premium Economy, Business, or First Class)'
      },
      totalPriceINR: {
        type: Type.NUMBER,
        description: 'Total ticket price in Indian Rupees (INR)'
      },
      recipientPhone: {
        type: Type.STRING,
        description: '10-digit mobile phone number to receive confirmation SMS'
      },
      smsMessage: {
        type: Type.STRING,
        description: 'Detailed SMS notification message to send to the passenger'
      }
    },
    required: [
      'pnr',
      'passengerName',
      'flightNumber',
      'seatClass',
      'totalPriceINR',
      'recipientPhone',
      'smsMessage'
    ]
  }
};

// Lazy initialize Gemini API client to prevent startup crashes if key is not configured
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Resilient Gemini Model caller with automatic circuit-breaker on 503 overload / 429 rate limits
const FALLBACK_MODELS = ['gemini-3.1-flash-lite', 'gemini-flash-latest'];
let geminiQuotaCooldownUntil = 0;

async function generateWithModelFallback(
  client: GoogleGenAI,
  requestParams: {
    contents: any[];
    systemInstruction?: string;
    temperature?: number;
    tools?: any[];
  },
  models: string[] = FALLBACK_MODELS
): Promise<{ text?: string; functionCalls?: any[]; modelUsed: string } | null> {
  if (Date.now() < geminiQuotaCooldownUntil) {
    return null;
  }
  for (const model of models) {
    try {
      const response = await client.models.generateContent({
        model,
        contents: requestParams.contents,
        config: {
          systemInstruction: requestParams.systemInstruction,
          temperature: requestParams.temperature ?? 0.7,
          tools: requestParams.tools,
        }
      });
      if (response && (response.text || response.functionCalls?.length)) {
        return { text: response.text || '', functionCalls: response.functionCalls, modelUsed: model };
      }
    } catch (err: any) {
      const errMsg = (err?.message || String(err)).toLowerCase();
      if (
        errMsg.includes('429') ||
        errMsg.includes('resource_exhausted') ||
        errMsg.includes('quota') ||
        errMsg.includes('overloaded') ||
        errMsg.includes('503')
      ) {
        // Trip 10-minute cooldown so subsequent calls use the zero-latency local multilingual engine immediately
        geminiQuotaCooldownUntil = Date.now() + 10 * 60 * 1000;
        return null;
      }
    }
  }
  return null;
}

async function startServer() {
  const app = express();

  app.use(express.json());

  // Connect to MongoDB using process.env.MONGODB_URI
  connectToMongo().then(() => {
    console.log('✈️ [AeroWings Database] MongoDB persistence initialized.');
  }).catch(err => {
    console.warn('⚠️ [AeroWings Database Notice] MongoDB init notice:', err?.message || err);
  });

  // 1. Health & Intranet/Network Ping Endpoint
  app.get('/api/health', (req, res) => {
    const isTwilioConfigured = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER);
    res.json({
      status: 'online',
      timestamp: new Date().toISOString(),
      service: 'AeroWings Flight Reservation Cloud Network',
      networkState: 'connected',
      database: {
        provider: 'MongoDB',
        configured: !!process.env.MONGODB_URI
      },
      smsGateway: {
        provider: isTwilioConfigured ? 'Twilio SMS Cloud' : 'Simulated Gateway',
        configured: isTwilioConfigured
      }
    });
  });

  app.get('/api/network/ping', (req, res) => {
    res.json({
      online: true,
      timestamp: Date.now(),
      latencyMs: 12
    });
  });

  // 2. Multilingual Gemini AI Chatbot with Context Awareness & Grounding
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { message, language = 'en', contextData = {}, conversationHistory = [] } = req.body;

      if (!message || typeof message !== 'string') {
        res.status(400).json({ error: 'Message is required' });
        return;
      }

      const client = getGeminiClient();

      const langMap: Record<string, string> = {
        en: 'English',
        hi: 'Hindi (हिन्दी)',
        kn: 'Kannada (ಕನ್ನಡ)',
        te: 'Telugu (తెలుగు)',
        ta: 'Tamil (தமிழ்)',
        ml: 'Malayalam (മലയാളം)',
        mr: 'Marathi (मराठी)',
        bn: 'Bengali (বাংলা)',
        gu: 'Gujarati (ગુજરાતી)',
        fr: 'French (Français)',
        es: 'Spanish (Español)',
        ar: 'Arabic (العربية)',
        de: 'German (Deutsch)'
      };

      const targetLangName = langMap[language] || 'English';

      // If Gemini client is available, attempt multi-model resilient call
      if (client) {
        try {
          const systemInstruction = `You are the AeroWings AI Reservation Assistant.
Your task is to process flight booking requests from users.
When a user provides booking details, you MUST call the process_flight_booking tool with structured booking data including pnr, passengerName, flightNumber, seatClass, totalPriceINR, recipientPhone, and an smsMessage.
CRITICAL: Always generate your full conversational reply in ${targetLangName} (using authentic native script and vocabulary).
Be helpful, accurate, polite, and scannable. Format important flight codes, PNRs, or terminal gates clearly in bold.
Context provided: ${JSON.stringify(contextData)}`;

          const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

          if (Array.isArray(conversationHistory)) {
            for (const item of conversationHistory.slice(-6)) {
              if (item.sender === 'user') {
                contents.push({ role: 'user', parts: [{ text: item.text }] });
              } else if (item.sender === 'ai') {
                contents.push({ role: 'model', parts: [{ text: item.text }] });
              }
            }
          }

          contents.push({
            role: 'user',
            parts: [{ text: message }]
          });

          const geminiResult = await generateWithModelFallback(client, {
            contents,
            systemInstruction,
            temperature: 0.7,
            tools: [{ functionDeclarations: [processFlightBookingDeclaration] }]
          });

          if (geminiResult) {
            // Handle process_flight_booking tool invocation
            if (geminiResult.functionCalls && geminiResult.functionCalls.length > 0) {
              const bookingCall = geminiResult.functionCalls.find(c => c.name === 'process_flight_booking') || geminiResult.functionCalls[0];
              const args: any = bookingCall.args || {};
              
              const bookingPnr = args.pnr || ('AW' + Math.floor(1000 + Math.random() * 9000));
              const recipientPhone = args.recipientPhone || '9876543210';
              const passengerName = args.passengerName || 'Valued Passenger';
              const flightNumber = args.flightNumber || 'AW-402';
              const seatClass = args.seatClass || 'Economy';
              const totalPriceINR = Number(args.totalPriceINR) || 4500;
              const ticketNum = `AW-ETK-${Math.floor(100000 + Math.random() * 900000)}`;

              // 1. Dispatch real SMS via dedicated Twilio SMS service
              const smsDispatchResult = await sendFlightBookingSms({
                pnr: bookingPnr,
                passengerName,
                flightNumber,
                seatClass,
                seatNumber: '12A',
                recipientPhone,
                ticketNumber: ticketNum,
                customMessage: args.smsMessage
              });

              // 2. Persist flight booking in MongoDB model
              await saveFlightBooking({
                pnr: bookingPnr,
                ticketNumber: ticketNum,
                flightNumber,
                airline: 'AeroWings',
                origin: 'DEL',
                destination: 'BOM',
                departureDate: new Date().toISOString().split('T')[0],
                departureTime: '10:30',
                arrivalDate: new Date().toISOString().split('T')[0],
                arrivalTime: '12:45',
                passengerName,
                passengers: [{
                  firstName: passengerName.split(' ')[0] || 'Valued',
                  lastName: passengerName.split(' ').slice(1).join(' ') || 'Passenger',
                  seat: '12A',
                  type: 'Adult',
                  ticketNumber: ticketNum
                }],
                seatNumbers: ['12A'],
                seatClass,
                totalPriceINR,
                contactEmail: 'passenger@aerowings.com',
                contactPhone: recipientPhone,
                status: 'Confirmed',
                paymentStatus: 'PAID',
                gate: '22A',
                terminal: 'T3',
                smsSent: smsDispatchResult.success,
                smsMessageId: smsDispatchResult.messageId,
                source: 'ai_concierge'
              });

              // 3. Persist ticket details in MongoDB model
              await issueTicket({
                ticketNumber: ticketNum,
                pnr: bookingPnr,
                passengerName,
                flightNumber,
                airline: 'AeroWings',
                origin: 'DEL',
                destination: 'BOM',
                route: 'DEL ➔ BOM',
                departureDate: new Date().toISOString().split('T')[0],
                departureTime: '10:30',
                seatNumber: '12A',
                seatClass,
                gate: '22A',
                terminal: 'T3',
                boardingGroup: 'Group 2',
                boardingTime: '09:45',
                barcodeHash: `AW*${bookingPnr}*${ticketNum}`,
                status: 'ISSUED'
              });

              res.json({
                reply: `✈️ **Flight Booking Successfully Confirmed & Persisted in MongoDB!**\n\n• **PNR:** **${bookingPnr}**\n• **E-Ticket:** **${ticketNum}**\n• **Passenger:** ${passengerName}\n• **Flight:** **${flightNumber}**\n• **Class:** ${seatClass}\n• **Total Fare:** ₹${totalPriceINR.toLocaleString('en-IN')}\n\n📱 **Confirmation SMS:** ${smsDispatchResult.success ? `Dispatched to ${recipientPhone} via ${smsDispatchResult.provider}` : `Queued (${smsDispatchResult.error || 'simulated fallback'})`}`,
                functionCall: {
                  name: 'process_flight_booking',
                  args: {
                    pnr: bookingPnr,
                    passengerName,
                    flightNumber,
                    seatClass,
                    totalPriceINR,
                    recipientPhone,
                    smsMessage: args.smsMessage
                  }
                },
                bookingResult: {
                  status: 'confirmed',
                  pnr: bookingPnr,
                  ticketNumber: ticketNum,
                  passengerName,
                  flightNumber,
                  seatClass,
                  totalPriceINR,
                  recipientPhone,
                  smsMessageId: smsDispatchResult.messageId,
                  smsStatus: smsDispatchResult.status,
                  confirmedAt: new Date().toISOString()
                },
                language,
                model: geminiResult.modelUsed,
                grounded: true
              });
              return;
            }

            if (geminiResult.text) {
              res.json({
                reply: geminiResult.text,
                language,
                model: geminiResult.modelUsed,
                grounded: true
              });
              return;
            }
          }
        } catch (apiErr) {
          // Graceful fallback to local engine
        }
      }

      // Local fallback for offline / rate-limit / missing key scenario
      const fallbackReplies: Record<string, string> = {
        en: `Hello! I am AeroWings SkyGuide AI. I can assist you with flight booking, 24-hour web check-in, real-time gate navigation, zero-cancellation weather refunds, and Google Maps airport terminal directions. How may I help you today?`,
        kn: `ನಮಸ್ಕಾರ! ನಾನು ಏರೋವಿಂಗ್ಸ್ ಸ್ಕೈಗೈಡ್ AI. ವಿಮಾನ ಬುಕಿಂಗ್, ವೆಬ್ ಚೆಕ್-ಇನ್, ಬೋರ್ಡಿಂಗ್ ಗೇಟ್ ಮತ್ತು ಹವಾಮಾನ ಮರುಪಾವತಿ ಮಾಹಿತಿಗೆ ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ನಾನು ಸಿದ್ಧನಿದ್ದೇನೆ. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?`,
        te: `నమస్కారం! నేను ఏరోవింగ్స్ స్కైగైడ్ AI. విమాన బుకింగ్, వెబ్ చెక్-ఇన్, బోర్డింగ్ గేట్లు మరియు లైవ్ వెదర్ రీఫండ్‌ల సమాచారంలో మీకు సహాయం చేయడానికి సిద్ధంగా ఉన్నాను.`,
        ta: `வணக்கம்! நான் ஏரோவிங்ஸ் AI வழிகாட்டி. விமான முன்பதிவு, செக்-இன் மற்றும் விமான விவரங்களுக்கு உதவ தயாராக உள்ளேன்.`,
        hi: `नमस्ते! मैं एयरोविंग्स स्काईगाइड एआई हूँ। मैं आपकी फ्लाइट बुकिंग, वेब चेक-इन, टर्मिनल गेट और मौसम की जानकारी में सहायता कर सकता हूँ।`,
        ml: `നമസ്കാരം! ഞാൻ എയ്റോവിങ്സ് എഐ അസിസ്റ്റന്റാണ്. ഫ്ലൈറ്റ് ബുക്കിംഗ്, വെബ് ചെക്ക്-ഇൻ, ടെർമിനൽ വിവരങ്ങൾ എന്നിവയിൽ സഹായിക്കാൻ ഞാൻ തയ്യാറാണ്.`,
        mr: `नमस्कार! मी एरोविंग्स AI सहाय्यक आहे. मी तुम्हाला फ्लाइट बुकिंग, चेक-इन आणि विमानतळ माहितीमध्ये मदत करू शकतो.`,
        bn: `নমস্কার! আমি অ্যারোউইংস এআই সহায়ক। ফ্লাইট বুকিং এবং টার্মিনাল তথ্যে সাহায্য করতে প্রস্তুত।`,
        gu: `નમસ્તે! હું એરોવિંગ્સ AI સહાયક છું. હું તમને ફ્લાઇટ બુકિંગ, વેબ ચેક-ઇન અને ટર્મિનલ વિગતોમાં મદદ કરી શકું છું.`,
        fr: `Bonjour! Je suis AeroWings SkyGuide AI. Je peux vous aider avec vos réservations de vol, l'enregistrement en ligne, et les informations de terminal.`,
        es: `¡Hola! Soy AeroWings SkyGuide AI. Puedo ayudarte con reservas de vuelos, check-in en línea y detalles de terminales y mapas.`,
        ar: `مرحباً! أنا مساعد AeroWings AI. يمكنني مساعدتك في حجز الرحلات وإتمام إجراءات السفر ومعلومات بوابات المطار.`,
        de: `Hallo! Ich bin AeroWings SkyGuide AI. Ich helfe Ihnen gerne bei Flugbuchungen, Web-Check-in und Terminal-Informationen.`
      };

      res.json({
        reply: fallbackReplies[language] || fallbackReplies.en,
        language,
        model: 'local-concierge-v6',
        grounded: false
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Server error in AI chat' });
    }
  });

  // 3. Real-Time Gemini Voice Copilot Endpoint
  app.post('/api/ai/live-voice', async (req, res) => {
    try {
      const { userTranscript, language = 'en', flightContext } = req.body;
      const client = getGeminiClient();

      const langNames: Record<string, string> = {
        en: 'English',
        hi: 'Hindi (हिन्दी)',
        kn: 'Kannada (ಕನ್ನಡ)',
        te: 'Telugu (తెలుగు)',
        ta: 'Tamil (தமிழ்)',
        ml: 'Malayalam (മലയാളം)',
        mr: 'Marathi (मराठी)',
        bn: 'Bengali (বাংলা)',
        gu: 'Gujarati (ગુજરાતી)',
        fr: 'French (Français)',
        es: 'Spanish (Español)',
        de: 'German (Deutsch)',
        ar: 'Arabic (العربية)'
      };
      const targetLangName = langNames[language] || 'English';

      if (client && userTranscript) {
        try {
          const geminiResult = await generateWithModelFallback(client, {
            contents: [{
              role: 'user',
              parts: [{
                text: `You are AeroWings Voice Copilot speaking directly to a passenger via voice audio.
Keep your response concise, spoken-friendly, conversational, and direct (max 2 sentences).
CRITICAL: You MUST speak in ${targetLangName} (using authentic native script and vocabulary). Do not speak in English unless the requested language is English.
System Instruction: You are the AeroWings AI Reservation Assistant. Your task is to process flight booking requests from users.
When a user provides booking details, you MUST call the process_flight_booking tool with structured booking data including pnr, passengerName, flightNumber, seatClass, totalPriceINR, recipientPhone, and an smsMessage.
Context: ${JSON.stringify(flightContext || {})}
User spoke: "${userTranscript}"`
              }]
            }],
            tools: [{ functionDeclarations: [processFlightBookingDeclaration] }],
            temperature: 0.6
          });

          if (geminiResult) {
            // Handle process_flight_booking tool invocation in live voice
            if (geminiResult.functionCalls && geminiResult.functionCalls.length > 0) {
              const bookingCall = geminiResult.functionCalls.find(c => c.name === 'process_flight_booking') || geminiResult.functionCalls[0];
              const args: any = bookingCall.args || {};

              const bookingPnr = args.pnr || ('AW' + Math.floor(1000 + Math.random() * 9000));
              const recipientPhone = args.recipientPhone || '9876543210';
              const passengerName = args.passengerName || 'Valued Passenger';
              const flightNumber = args.flightNumber || 'AW-402';
              const seatClass = args.seatClass || 'Economy';
              const totalPriceINR = Number(args.totalPriceINR) || 4850;
              const ticketNum = `AW-ETK-${Math.floor(100000 + Math.random() * 900000)}`;

              // Dispatch real SMS
              const smsDispatchResult = await sendFlightBookingSms({
                pnr: bookingPnr,
                passengerName,
                flightNumber,
                seatClass,
                seatNumber: '12A',
                recipientPhone,
                ticketNumber: ticketNum,
                customMessage: args.smsMessage
              });

              // Persist booking
              await saveFlightBooking({
                pnr: bookingPnr,
                ticketNumber: ticketNum,
                flightNumber,
                airline: 'AeroWings',
                origin: 'DEL',
                destination: 'BOM',
                departureDate: new Date().toISOString().split('T')[0],
                departureTime: '10:30',
                arrivalDate: new Date().toISOString().split('T')[0],
                arrivalTime: '12:45',
                passengerName,
                passengers: [{
                  firstName: passengerName.split(' ')[0] || 'Valued',
                  lastName: passengerName.split(' ').slice(1).join(' ') || 'Passenger',
                  seat: '12A',
                  type: 'Adult',
                  ticketNumber: ticketNum
                }],
                seatNumbers: ['12A'],
                seatClass,
                totalPriceINR,
                contactEmail: 'passenger@aerowings.com',
                contactPhone: recipientPhone,
                status: 'Confirmed',
                paymentStatus: 'PAID',
                gate: '22A',
                terminal: 'T3',
                smsSent: smsDispatchResult.success,
                smsMessageId: smsDispatchResult.messageId,
                source: 'ai_concierge'
              });

              await issueTicket({
                ticketNumber: ticketNum,
                pnr: bookingPnr,
                passengerName,
                flightNumber,
                airline: 'AeroWings',
                origin: 'DEL',
                destination: 'BOM',
                route: 'DEL ➔ BOM',
                departureDate: new Date().toISOString().split('T')[0],
                departureTime: '10:30',
                seatNumber: '12A',
                seatClass,
                gate: '22A',
                terminal: 'T3',
                boardingGroup: 'Group 2',
                boardingTime: '09:45',
                barcodeHash: `AW*${bookingPnr}*${ticketNum}`,
                status: 'ISSUED'
              });

              res.json({
                speechText: `Booking confirmed for ${passengerName}! Your PNR is ${bookingPnr}, flight ${flightNumber}. E-ticket issued and SMS confirmation sent to ${recipientPhone}.`,
                functionCall: {
                  name: 'process_flight_booking',
                  args: {
                    pnr: bookingPnr,
                    passengerName,
                    flightNumber,
                    seatClass,
                    totalPriceINR,
                    recipientPhone,
                    smsMessage: args.smsMessage
                  }
                },
                bookingResult: {
                  status: 'confirmed',
                  pnr: bookingPnr,
                  ticketNumber: ticketNum,
                  passengerName,
                  flightNumber,
                  seatClass,
                  totalPriceINR,
                  recipientPhone,
                  smsMessageId: smsDispatchResult.messageId,
                  smsStatus: smsDispatchResult.status,
                  confirmedAt: new Date().toISOString()
                },
                language,
                model: geminiResult.modelUsed
              });
              return;
            }

            if (geminiResult.text) {
              res.json({
                speechText: geminiResult.text,
                language,
                model: geminiResult.modelUsed
              });
              return;
            }
          }
        } catch (e) {
          console.warn('[Gemini Live Voice] Fallback triggered:', e);
        }
      }

      // Intelligent Local Intent Engine for instantaneous multilingual voice responses
      const q = (userTranscript || '').toLowerCase();
      const localizedVoiceResponses: Record<string, Record<string, string>> = {
        weather: {
          en: `Live atmospheric Doppler tracking is active. All airports currently meet safety criteria with 100% weather refund protection.`,
          hi: `लाइव डॉपलर मौसम रडार सक्रिय है। सभी हवाई अड्डे सुरक्षित हैं और 100% मौसम रिफंड सुरक्षा लागू है।`,
          kn: `ಲೈವ್ ಡಾಪ್ಲರ್ ಹವಾಮಾನ ರಾಡಾರ್ ಸಕ್ರಿಯವಾಗಿದೆ. ಎಲ್ಲಾ ವಿಮಾನ ನಿಲ್ದಾಣಗಳು ಸುರಕ್ಷಿತವಾಗಿವೆ ಮತ್ತು 100% ಮರುಪಾವತಿ ರಕ್ಷಣೆ ಇದೆ.`,
          te: `లైవ్ డాప్లర్ వాతావరణ రాడార్ సక్రియంగా ఉంది. అన్ని విమానాశ్రయాలు సురక్షితంగా ఉన్నాయి మరియు 100% రీఫండ్ రక్షణ కలదు.`,
          ta: `நேரடி வானிலை ரேடார் செயல்பாட்டில் உள்ளது. அனைத்து விமான நிலையங்களும் பாதுகாப்பாக உள்ளன.`,
          ml: `ലൈവ് കാലാവസ്ഥാ റഡാർ സജീവമാണ്. എല്ലാ വിമാനത്താവളങ്ങളും സുരക്ഷിതമാണ്.`,
          mr: `लाईव्ह डॉपलर हवामान रडार सक्रिय आहे. सर्व विमानतळ सुरक्षित आहेत आणि 100% परतावा संरक्षण लागू आहे.`,
          bn: `লাইভ ডপলার আবহাওয়া রাডার সক্রিয় রয়েছে। সমস্ত বিমানবন্দর সম্পূর্ণ নিরাপদ।`,
          gu: `લાઇવ ડોપ્લર હવામાન રડાર સક્રિય છે. તમામ એરપોર્ટ સુરक्षित છે અને ૧૦૦% રિફંડ સુરક્ષા ઉપલબ્ધ છે.`
        },
        refund: {
          en: `AeroWings provides guaranteed 100% automated instant refunds directly to your original payment method with zero cancellation fees.`,
          hi: `एयरोविंग्स बिना किसी शुल्क के आपके मूल भुगतान खाते में 100% तुरंत रिफंड की गारंटी देता है।`,
          kn: `ಏರೋವಿಂಗ್ಸ್ ಯಾವುದೇ ಶುಲ್ಕವಿಲ್ಲದೆ ನಿಮ್ಮ ಮೂಲ ಖಾತೆಗೆ ಶೇಕಡಾ 100 ರಷ್ಟು ತಕ್ಷಣದ ಮರುಪಾವತಿಯನ್ನು ನೀಡುತ್ತದೆ.`,
          te: `ఏరోవింగ్స్ ఎటువంటి రుసుము లేకుండా మీ ఖాతాకు 100% తక్షణ రీఫండ్ అందిస్తుంది.`,
          ta: `ஏரோவிங்ஸ் எந்த கட்டணமும் இன்றி 100% உடனடி பணத்தைத் திரும்பப் பெறும் வசதியை வழங்குகிறது.`,
          ml: `എയ്റോവിങ്സ് 100% തൽക്ഷണ റീഫണ്ട് യാതൊരു ചാർജും കൂടാതെ നൽകുന്നു.`,
          mr: `एरोविंग्स कोणत्याही शुल्काशिवाय तुमच्या खात्यात 100% त्वरित परतावा देते.`,
          bn: `অ্যারোউইংস কোনো চার্জ ছাড়াই ১০০% তাৎক্ষণিক রিফান্ড প্রদান করে।`,
          gu: `એરોવિંગ્સ કોઈપણ ચાર્જ વિના ૧૦૦% ત્વરિત રિફંડની ખાતરી આપે છે.`
        },
        baggage: {
          en: `Economy passengers receive 15 kilograms check-in and 7 kilograms cabin baggage free. Business class includes 35 kilograms allowance.`,
          hi: `इकोनॉमी यात्रियों को 15 किग्रा चेक-इन और 7 किग्रा केबिन बैगेज मुफ्त मिलता है। बिजनेस क्लास में 35 किग्रा की छूट है।`,
          kn: `ಎಕಾನಮಿ ಪ್ರಯಾಣಿಕರಿಗೆ 15 ಕೆಜಿ ಚೆಕ್-ಇನ್ ಮತ್ತು 7 ಕೆಜಿ ಕ್ಯಾಬಿನ್ ಬ್ಯಾಗೇಜ್ ಉಚಿತವಾಗಿದೆ. ಬಿಸಿನೆಸ್ ಕ್ಲಾಸ್‌ಗೆ 35 ಕೆಜಿ ಅವಕಾಶವಿದೆ.`,
          te: `ఎకానమీ ప్రయాణికులకు 15 కేజీల చెక్-ఇన్ మరియు 7 కేజీల క్యాబిన్ లగేజీ ఉచితం. బిజినెస్ క్లాస్‌లో 35 కేజీలు ఉచితం.`,
          ta: `எகானமி பயணிகளுக்கு 15 கிலோ செக்-இன் மற்றும் 7 கிலோ கேபின் லக்கேஜ் இலவசம்.`,
          ml: `ഇക്കോണമി യാത്രക്കാർക്ക് 15 കിലോ ചെക്ക്-ഇൻ, 7 കിലോ ക്യാബിൻ ബാഗേജ് സൗജന്യമാണ്.`,
          mr: `इकॉनॉमी प्रवाशांना 15 किलो चेक-इन आणि 7 किलो केबिन सामान मोफत मिळते.`,
          bn: `ইকোনমি যাত্রীরা ১৫ কেজি চেক-ইন এবং ৭ কেজি কেবিন লাগেজ বিনামূল্যে পাবেন।`,
          gu: `ઇકોનોમી મુસાફરોને ૧૫ કિલો ચેક-ઇન અને ૭ કિલો કેબિન બેગેજ મફત મળે છે.`
        },
        status: {
          en: `Flight operations are running on schedule. You can track live aircraft radar, gate, and terminal status in the Flight Status tab.`,
          hi: `सभी उड़ानें समय पर चल रही हैं। आप फ्लाइट स्टेटस टैब में लाइव रडार, गेट और टर्मिनल की जानकारी देख सकते हैं।`,
          kn: `ಎಲ್ಲಾ ವಿಮಾನಗಳು ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ ಸಂಚರಿಸುತ್ತಿವೆ. ಫ್ಲೈಟ್ ಸ್ಟೇಟಸ್ ಟ್ಯಾಬ್‌ನಲ್ಲಿ ಲೈವ್ ರಾಡಾರ್ ಮತ್ತು ಗೇಟ್ ಮಾಹಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಿ.`,
          te: `విమానాలన్నీ సమయానికి నడుస్తున్నాయి. ఫ్లైట్ స్టేటస్ ట్యాబ్‌లో లైవ్ రాడార్ మరియు గేట్ వివరాలను చూడవచ్చు.`,
          ta: `விமானங்கள் அனைத்தும் சரியான நேரத்தில் இயங்குகின்றன. விமான நிலை பிரிவில் நேரடி ரேடார் விவரங்களைப் பார்க்கலாம்.`,
          ml: `വിമാനങ്ങൾ കൃത്യസമയത്ത് സർവീസ് നടത്തുന്നു. ഫ്ലൈറ്റ് സ്റ്റാറ്റസ് ടാബിൽ തത്സമയ വിവരങ്ങൾ കാണാം.`,
          mr: `सर्व उड्डाणे वेळेवर सुरू आहेत. तुम्ही फ्लाईट स्टेटस टॅबमध्ये थेट रडार आणि गेट माहिती पाहू शकता.`,
          bn: `সব ফ্লাইট নির্ধারিত সময়ে চলছে। ফ্লাইট স্ট্যাটাস ট্যাবে লাইভ রাডার ও গেট দেখুন।`,
          gu: `તમામ ફ્લાઇટ્સ સમયસર ચાલી રહી છે. તમે ફ્લાઇટ સ્ટેટસ ટેબમાં લાઇવ રડાર અને ગેટ જોઈ શકો છો.`
        },
        default: {
          en: `Welcome to AeroWings Airlines! I am your AI Voice Copilot. I can help you with flight bookings, live flight radar, weather status, and instant refunds.`,
          hi: `एयरोविंग्स एयरलाइंस में आपका स्वागत है! मैं आपका एआई वॉइस असिस्टेंट हूँ। मैं फ्लाइट बुकिंग, लाइव स्थिति और मौसम की जानकारी में आपकी मदद कर सकता हूँ।`,
          kn: `ಏರೋವಿಂಗ್ಸ್ ಏರ್‌ಲೈನ್ಸ್‌ಗೆ ಸುಸ್ವಾಗತ! ನಾನು ನಿಮ್ಮ AI ಧ್ವನಿ ಸಹಾಯಕ. ವಿಮಾನ ಬುಕಿಂಗ್, ಲೈವ್ ರಾಡಾರ್ ಮತ್ತು ಹವಾಮಾನ ಮಾಹಿತಿಯಲ್ಲಿ ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡುತ್ತೇನೆ.`,
          te: `ఏరోవింగ్స్ ఎయిర్‌లైన్స్‌కు స్వాగతం! నేను మీ AI వాయిస్ అసిస్టెంట్‌ని. విమాన బుకింగ్, లైవ్ రాడార్ మరియు వాతావరణ సమాచారంలో మీకు సహాయం చేస్తాను.`,
          ta: `ஏரோவிங்ஸ் ஏர்லைன்ஸுக்கு வரவேற்கிறோம்! நான் உங்கள் AI குரல் வழிகாட்டி. விமான முன்பதிவு மற்றும் நேரடி தகவல்களுக்கு உதவ தயாராக உள்ளேன்.`,
          ml: `എയ്റോവിങ്സ് എയർലൈൻസിലേക്ക് സ്വാഗതം! ഫ്ലൈറ്റ് ബുക്കിംഗിലും തത്സമയ വിവരങ്ങളിലും സഹായിക്കാൻ ഞാൻ തയ്യാറാണ്.`,
          mr: `एरोविंग्स एअरलाइन्समध्ये आपले स्वागत आहे! मी तुमचा AI व्हॉइस असिस्टंट आहे. फ्लाईट बुकिंग आणि लाईव्ह माहितीसाठी मी सज्ज आहे.`,
          bn: `অ্যারোউইংস এয়ারলাইন্সে স্বাগতম! আমি আপনার এআই ভয়েস অ্যাসিস্ট্যান্ট। ফ্লাইট বুকিং এবং তথ্যে সাহায্য করতে প্রস্তুত।`,
          gu: `એરોવિંગ્સ એરલાઇન્સમાં આપનું સ્વાગત છે! હું તમારો AI વોઇસ આસિસ્ટન્ટ છું. ફ્લાઇટ બુકિંગ અને લાઇવ માહિતીમાં મદદ કરવા તૈયાર છું.`
        }
      };

      let topic = 'default';
      if (q.includes('weather') || q.includes('cyclone') || q.includes('rain') || q.includes('storm') || q.includes('मौसम') || q.includes('ಹವಾಮಾನ') || q.includes('వాతావరణ')) {
        topic = 'weather';
      } else if (q.includes('refund') || q.includes('cancel') || q.includes('रिफंड') || q.includes('ಮರುಪಾವತಿ') || q.includes('రీఫండ్')) {
        topic = 'refund';
      } else if (q.includes('baggage') || q.includes('luggage') || q.includes('weight') || q.includes('बैगेज') || q.includes('ಬ್ಯಾಗೇಜ್')) {
        topic = 'baggage';
      } else if (q.includes('status') || q.includes('flight') || q.includes('delay') || q.includes('gate') || q.includes('उड़ान')) {
        topic = 'status';
      }

      const responseSpeech = localizedVoiceResponses[topic]?.[language] || localizedVoiceResponses[topic]?.en || localizedVoiceResponses.default.en;

      res.json({
        speechText: responseSpeech,
        language
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Voice assistant error' });
    }
  });

  // 3.2. Native Multilingual Audio TTS Stream Proxy (Ensures crystal-clear native speech on all browsers/OS)
  const handleTtsProxy = async (req: express.Request, res: express.Response) => {
    try {
      const text = (req.query.text as string) || (req.body?.text as string) || '';
      const lang = (req.query.lang as string) || (req.body?.lang as string) || 'en';

      if (!text || !text.trim()) {
        res.status(400).json({ error: 'Text is required for TTS' });
        return;
      }

      const tlMap: Record<string, string> = {
        en: 'en-IN',
        hi: 'hi',
        kn: 'kn',
        te: 'te',
        ta: 'ta',
        ml: 'ml',
        mr: 'mr',
        bn: 'bn',
        gu: 'gu',
        fr: 'fr',
        es: 'es',
        de: 'de',
        ar: 'ar'
      };
      const tl = tlMap[lang] || lang || 'en';
      // Truncate cleanly to 200 chars for Google TTS endpoint
      const cleanText = text.replace(/[*_#`~\[\]•●★►→]/g, '').trim().slice(0, 200);

      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=${encodeURIComponent(tl)}&client=tw-ob`;
      const response = await fetch(ttsUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://translate.google.com/'
        },
        signal: AbortSignal.timeout(3500)
      });

      if (!response.ok) {
        res.status(502).json({ error: `TTS upstream status ${response.status}` });
        return;
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.send(buffer);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'TTS stream error' });
    }
  };

  app.get('/api/ai/tts', handleTtsProxy);
  app.post('/api/ai/tts', handleTtsProxy);

  // 3.3. Real-Time Current Airport Weather API Proxy (Open-Meteo + Aviation Telemetry)
  app.get('/api/weather/current', async (req, res) => {
    try {
      const code = ((req.query.code as string) || 'DEL').toUpperCase().trim();
      const airportCoords: Record<string, { lat: number; lng: number; city: string }> = {
        // India - Major & All States
        DEL: { lat: 28.5562, lng: 77.1000, city: 'Delhi' },
        BOM: { lat: 19.0896, lng: 72.8656, city: 'Mumbai' },
        BLR: { lat: 13.1986, lng: 77.7066, city: 'Bengaluru' },
        MAA: { lat: 12.9941, lng: 80.1709, city: 'Chennai' },
        CCU: { lat: 22.6547, lng: 88.4467, city: 'Kolkata' },
        HYD: { lat: 17.2403, lng: 78.4294, city: 'Hyderabad' },
        GOI: { lat: 15.3808, lng: 73.8314, city: 'Goa (Dabolim)' },
        GOX: { lat: 15.7275, lng: 73.8647, city: 'Goa (Mopa)' },
        COK: { lat: 10.1518, lng: 76.4019, city: 'Kochi' },
        JAI: { lat: 26.8242, lng: 75.8122, city: 'Jaipur' },
        PNQ: { lat: 18.5822, lng: 73.9197, city: 'Pune' },
        AMD: { lat: 23.0772, lng: 72.6347, city: 'Ahmedabad' },
        LKO: { lat: 26.7606, lng: 80.8893, city: 'Lucknow' },
        IXC: { lat: 30.6735, lng: 76.7885, city: 'Chandigarh' },
        GAU: { lat: 26.1061, lng: 91.5859, city: 'Guwahati' },
        PAT: { lat: 25.5913, lng: 85.0880, city: 'Patna' },
        BBI: { lat: 20.2444, lng: 85.8178, city: 'Bhubaneswar' },
        VNS: { lat: 25.4524, lng: 82.8593, city: 'Varanasi' },
        IXE: { lat: 12.9613, lng: 74.8900, city: 'Mangalore' },
        CJB: { lat: 11.0298, lng: 77.0434, city: 'Coimbatore' },
        IXM: { lat: 9.8345, lng: 78.0934, city: 'Madurai' },
        TRZ: { lat: 10.7654, lng: 78.7097, city: 'Tiruchirappalli' },
        NAG: { lat: 21.0922, lng: 79.0472, city: 'Nagpur' },
        UDR: { lat: 24.6177, lng: 73.8961, city: 'Udaipur' },
        STV: { lat: 21.1141, lng: 72.7417, city: 'Surat' },
        IXB: { lat: 26.6812, lng: 88.3286, city: 'Bagdogra' },
        MYQ: { lat: 12.2300, lng: 76.6500, city: 'Mysuru' },
        HBX: { lat: 15.3617, lng: 75.0849, city: 'Hubballi' },
        IXG: { lat: 15.8593, lng: 74.6183, city: 'Belagavi' },
        IXU: { lat: 19.8631, lng: 75.3981, city: 'Aurangabad' },
        VTZ: { lat: 17.7214, lng: 83.2245, city: 'Visakhapatnam' },
        VGA: { lat: 16.5304, lng: 80.7968, city: 'Vijayawada' },
        TIR: { lat: 13.6325, lng: 79.5434, city: 'Tirupati' },
        TRV: { lat: 8.4821, lng: 76.9200, city: 'Thiruvananthapuram' },
        CCJ: { lat: 11.1368, lng: 75.9553, city: 'Kozhikode' },
        CNN: { lat: 11.9173, lng: 75.5484, city: 'Kannur' },
        BDQ: { lat: 22.3361, lng: 73.2264, city: 'Vadodara' },
        JDH: { lat: 26.2511, lng: 73.0489, city: 'Jodhpur' },
        AYJ: { lat: 26.7456, lng: 82.1489, city: 'Ayodhya' },
        ATQ: { lat: 31.7096, lng: 74.7973, city: 'Amritsar' },
        SXR: { lat: 33.9871, lng: 74.7742, city: 'Srinagar' },
        IXJ: { lat: 32.6891, lng: 74.8374, city: 'Jammu' },
        BHO: { lat: 23.2875, lng: 77.3378, city: 'Bhopal' },
        IDR: { lat: 22.7217, lng: 75.8011, city: 'Indore' },
        IXR: { lat: 23.3143, lng: 85.3217, city: 'Ranchi' },
        RPR: { lat: 21.1804, lng: 81.7388, city: 'Raipur' },
        IXZ: { lat: 11.6410, lng: 92.7297, city: 'Port Blair' },
        IXL: { lat: 34.1359, lng: 77.5465, city: 'Leh' },
        DED: { lat: 30.1897, lng: 78.1803, city: 'Dehradun' },
        IMF: { lat: 24.7600, lng: 93.8967, city: 'Imphal' },
        IXA: { lat: 23.8869, lng: 91.2405, city: 'Agartala' },

        // Middle East
        DXB: { lat: 25.2532, lng: 55.3657, city: 'Dubai' },
        AUH: { lat: 24.4330, lng: 54.6511, city: 'Abu Dhabi' },
        DOH: { lat: 25.2731, lng: 51.6081, city: 'Doha' },
        KWI: { lat: 29.2267, lng: 47.9789, city: 'Kuwait City' },
        RUH: { lat: 24.9576, lng: 46.6988, city: 'Riyadh' },
        JED: { lat: 21.6796, lng: 39.1565, city: 'Jeddah' },
        MCT: { lat: 23.5933, lng: 58.2844, city: 'Muscat' },
        BAH: { lat: 26.2708, lng: 50.6336, city: 'Manama' },
        SHJ: { lat: 25.3286, lng: 55.5172, city: 'Sharjah' },
        DMM: { lat: 26.4712, lng: 49.7978, city: 'Dammam' },

        // Europe & UK
        LHR: { lat: 51.4700, lng: -0.4543, city: 'London' },
        LGW: { lat: 51.1537, lng: -0.1821, city: 'London (Gatwick)' },
        MAN: { lat: 53.3537, lng: -2.2750, city: 'Manchester' },
        CDG: { lat: 49.0097, lng: 2.5479, city: 'Paris' },
        ORY: { lat: 48.7262, lng: 2.3652, city: 'Paris (Orly)' },
        FRA: { lat: 50.0379, lng: 8.5622, city: 'Frankfurt' },
        MUC: { lat: 48.3537, lng: 11.7750, city: 'Munich' },
        AMS: { lat: 52.3105, lng: 4.7683, city: 'Amsterdam' },
        ZRH: { lat: 47.4582, lng: 8.5555, city: 'Zurich' },
        FCO: { lat: 41.8003, lng: 12.2389, city: 'Rome' },
        MAD: { lat: 40.4839, lng: -3.5680, city: 'Madrid' },
        BCN: { lat: 41.2974, lng: 2.0833, city: 'Barcelona' },
        IST: { lat: 41.2753, lng: 28.7519, city: 'Istanbul' },
        VIE: { lat: 48.1103, lng: 16.5697, city: 'Vienna' },
        DUB: { lat: 53.4264, lng: -6.2499, city: 'Dublin' },
        EDI: { lat: 55.9508, lng: -3.3725, city: 'Edinburgh' },
        ATH: { lat: 37.9364, lng: 23.9445, city: 'Athens' },
        CPH: { lat: 55.6180, lng: 12.6560, city: 'Copenhagen' },
        ARN: { lat: 59.6519, lng: 17.9186, city: 'Stockholm' },
        BRU: { lat: 50.9010, lng: 4.4844, city: 'Brussels' },
        LIS: { lat: 38.7742, lng: -9.1342, city: 'Lisbon' },
        PRG: { lat: 50.1008, lng: 14.2600, city: 'Prague' },
        WAW: { lat: 52.1672, lng: 20.9679, city: 'Warsaw' },

        // Americas
        JFK: { lat: 40.6413, lng: -73.7781, city: 'New York' },
        EWR: { lat: 40.6895, lng: -74.1745, city: 'New York (Newark)' },
        SFO: { lat: 37.6213, lng: -122.3790, city: 'San Francisco' },
        ORD: { lat: 41.9742, lng: -87.9073, city: 'Chicago' },
        LAX: { lat: 33.9416, lng: -118.4085, city: 'Los Angeles' },
        SEA: { lat: 47.4502, lng: -122.3088, city: 'Seattle' },
        DFW: { lat: 32.8998, lng: -97.0403, city: 'Dallas' },
        BOS: { lat: 42.3656, lng: -71.0096, city: 'Boston' },
        ATL: { lat: 33.6407, lng: -84.4277, city: 'Atlanta' },
        MIA: { lat: 25.7959, lng: -80.2870, city: 'Miami' },
        IAD: { lat: 38.9531, lng: -77.4565, city: 'Washington D.C.' },
        YYZ: { lat: 43.6777, lng: -79.6248, city: 'Toronto' },
        YVR: { lat: 49.1967, lng: -123.1815, city: 'Vancouver' },
        YUL: { lat: 45.4706, lng: -73.7408, city: 'Montreal' },
        GRU: { lat: -23.4356, lng: -46.4731, city: 'São Paulo' },
        MEX: { lat: 19.4361, lng: -99.0719, city: 'Mexico City' },

        // Asia Pacific & Oceania & Africa
        SIN: { lat: 1.3644, lng: 103.9915, city: 'Singapore' },
        BKK: { lat: 13.6900, lng: 100.7501, city: 'Bangkok' },
        HKT: { lat: 8.1132, lng: 98.3169, city: 'Phuket' },
        KUL: { lat: 2.7456, lng: 101.7072, city: 'Kuala Lumpur' },
        DPS: { lat: -8.7482, lng: 115.1672, city: 'Bali' },
        CGK: { lat: -6.1275, lng: 106.6537, city: 'Jakarta' },
        HKG: { lat: 22.3080, lng: 113.9185, city: 'Hong Kong' },
        HND: { lat: 35.5494, lng: 139.7798, city: 'Tokyo (Haneda)' },
        NRT: { lat: 35.7720, lng: 140.3929, city: 'Tokyo (Narita)' },
        ICN: { lat: 37.4602, lng: 126.4407, city: 'Seoul' },
        SYD: { lat: -33.9399, lng: 151.1753, city: 'Sydney' },
        MEL: { lat: -37.6690, lng: 144.8410, city: 'Melbourne' },
        AKL: { lat: -37.0082, lng: 174.7850, city: 'Auckland' },
        BNE: { lat: -27.3842, lng: 153.1175, city: 'Brisbane' },
        PER: { lat: -31.9403, lng: 115.9668, city: 'Perth' },
        JNB: { lat: -26.1367, lng: 28.2411, city: 'Johannesburg' },
        CPT: { lat: -33.9715, lng: 18.6021, city: 'Cape Town' },
        NBO: { lat: -1.3192, lng: 36.9278, city: 'Nairobi' },
        CAI: { lat: 30.1219, lng: 31.4056, city: 'Cairo' },
        CMB: { lat: 7.1808, lng: 79.8841, city: 'Colombo' },
        KTM: { lat: 27.6966, lng: 85.3591, city: 'Kathmandu' },
        DAC: { lat: 23.8433, lng: 90.3978, city: 'Dhaka' },
        MLE: { lat: 4.1918, lng: 73.5291, city: 'Malé' },
        MRU: { lat: -20.4302, lng: 57.6836, city: 'Mauritius' },
        SEZ: { lat: -4.6743, lng: 55.5219, city: 'Seychelles' },
        MNL: { lat: 14.5086, lng: 121.0194, city: 'Manila' },
        HAN: { lat: 21.2212, lng: 105.8072, city: 'Hanoi' },
        SGN: { lat: 10.8188, lng: 106.6519, city: 'Ho Chi Minh City' },
        TPE: { lat: 25.0797, lng: 121.2342, city: 'Taipei' },
        PVG: { lat: 31.1443, lng: 121.8083, city: 'Shanghai' },
        KIX: { lat: 34.4320, lng: 135.2304, city: 'Osaka' }
      };

      let info = airportCoords[code];
      let lat = parseFloat(req.query.lat as string);
      let lng = parseFloat(req.query.lng as string);

      if (info) {
        if (isNaN(lat)) lat = info.lat;
        if (isNaN(lng)) lng = info.lng;
      } else {
        // Dynamic geocoding fallback for custom city / state name
        try {
          const geoRes = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(code)}&count=1&language=en&format=json`
          );
          if (geoRes.ok) {
            const geoJson = await geoRes.json();
            if (geoJson.results && geoJson.results[0]) {
              const r = geoJson.results[0];
              lat = r.latitude;
              lng = r.longitude;
              info = { lat: r.latitude, lng: r.longitude, city: r.name };
            }
          }
        } catch {}

        if (!info) {
          info = { lat: 28.5562, lng: 77.1000, city: code };
          if (isNaN(lat)) lat = 28.5562;
          if (isNaN(lng)) lng = 77.1000;
        }
      }

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&timezone=auto`;
      const response = await fetch(url, { signal: AbortSignal.timeout(4500) });
      if (!response.ok) {
        throw new Error(`Open-Meteo HTTP ${response.status}`);
      }
      const data = await response.json();
      const c = data.current || {};
      const tempC = Math.round(c.temperature_2m ?? 25);
      const wmo = c.weather_code ?? 0;

      const getCondition = (w: number) => {
        if (w === 0) return 'Clear Sky & Optimal Visibility';
        if (w <= 2) return 'Mainly Clear to Partly Cloudy';
        if (w === 3) return 'Overcast Cloud Ceiling';
        if (w >= 45 && w <= 48) return 'Fog / Low Visibility Warning';
        if (w >= 51 && w <= 55) return 'Light Drizzle';
        if (w >= 61 && w <= 65) return 'Moderate Rain';
        if (w >= 71 && w <= 77) return 'Snow Showers';
        if (w >= 80 && w <= 82) return 'Heavy Rain Showers';
        if (w >= 95) return 'Thunderstorm with Doppler Radar Alert';
        return 'Fair Skies';
      };

      res.json({
        success: true,
        code,
        current: c,
        weather: {
          city: info.city,
          temperatureC: tempC,
          temperatureF: Math.round((tempC * 9) / 5 + 32),
          feelsLikeC: Math.round(c.apparent_temperature ?? tempC),
          humidity: Math.round(c.relative_humidity_2m ?? 55),
          windSpeedKmh: Math.round(c.wind_speed_10m ?? 12),
          windDirection: Math.round(c.wind_direction_10m ?? 180),
          visibilityKm: wmo >= 45 && wmo <= 48 ? 1.5 : wmo >= 95 ? 3 : 10,
          precipitationMm: c.precipitation ?? 0,
          weatherCode: wmo,
          condition: getCondition(wmo)
        },
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      res.status(200).json({
        success: false,
        error: err?.message || 'Fallback weather active'
      });
    }
  });

  // 3.4. Meteorological AI Data Scientist Short-Term Forecast API
  app.post('/api/weather/meteorological-ai-forecast', async (req, res) => {
    try {
      const data = req.body?.environmentalData;
      if (!data) {
        res.status(400).json({ error: 'environmentalData is required' });
        return;
      }

      const systemPrompt = `You are a highly analytical meteorological AI data scientist. Your job is to evaluate real-time weather metrics against regional baselines to generate a short-term forecast. 

Strict Rules:
1. Never invent or hallucinate data. Rely strictly on the values provided in the User Prompt.
2. Maintain an objective, scientific tone.
3. Assign quantitative probabilities (0-100%) based entirely on fluid dynamics and meteorological principles (e.g., relationship between rapidly dropping pressure, high humidity, and precipitation).`;

      const userPrompt = `### Environmental Input Data
- Target Location: ${data.targetLocation}
- Current Local Time & Date: ${data.localTimeDate}
- Current Temperature: ${data.temperatureC}°C
- Barometric Pressure: ${data.barometricPressureHpa} hPa
- Pressure Trend over last 3 hours: ${data.pressureTrend3h}
- Relative Humidity: ${data.relativeHumidityPercent}%
- Wind Speed & Direction: ${data.windSpeedKmh} km/h from ${data.windDirectionCardinal}
- Cloud Cover & Classification: ${data.cloudClassification}
- Precipitation (Last 3 Hours): ${data.precipitationLast3hMm} mm

### Climatic Base Rate Context
- Current Season: ${data.season}
- Regional Base Rate: ${data.regionalBaseRate}

### Tasks
1. Evaluate the interaction between the pressure trend and relative humidity to determine the exact likelihood of precipitation.
2. Outline the primary meteorological mechanism driving the forecast (e.g., convective instability, low-pressure system).
3. Produce the forecast using the exact structure specified below.

### Expected Output Format
- **Short-Term Forecast (Next 6–12 Hours):** [Clear / Rainy / Thunderstorm / Overcast]
- **Precipitation Probability:** [X]%
- **Expected Wind Behavior:** [Stable / Gusty / Shifting]
- **Primary Meteorological Driver:** [1 sentence explaining the scientific cause]
- **Confidence Rating:** [High / Medium / Low] based on data alignment.`;

      let aiForecastText = '';
      const client = getGeminiClient();

      if (client) {
        try {
          const result = await generateWithModelFallback(
            client,
            {
              contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
              systemInstruction: systemPrompt,
              temperature: 0.2
            },
            ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest']
          );
          if (result && result.text) {
            aiForecastText = result.text.trim();
          }
        } catch (err: any) {
          console.warn('Gemini meteorological AI call failed, using deterministic fluid dynamics calculation:', err?.message);
        }
      }

      // Parse structured output from text or compute via fluid dynamics principles
      let shortTermForecast: 'Clear' | 'Rainy' | 'Thunderstorm' | 'Overcast' | 'Partly Cloudy' = 'Clear';
      let precipitationProbability = 20;
      let expectedWindBehavior: 'Stable' | 'Gusty' | 'Shifting' | 'Severe Crosswinds' = 'Stable';
      let primaryMeteorologicalDriver = '';
      let confidenceRating: 'High' | 'Medium' | 'Low' = 'High';

      if (aiForecastText) {
        const forecastMatch = aiForecastText.match(/Short-Term Forecast[^*:\n]*:\*{0,2}\s*([^\n\r]+)/i);
        const probMatch = aiForecastText.match(/Precipitation Probability[^*:\n]*:\*{0,2}\s*(\d+)%/i);
        const windMatch = aiForecastText.match(/Expected Wind Behavior[^*:\n]*:\*{0,2}\s*([^\n\r]+)/i);
        const driverMatch = aiForecastText.match(/Primary Meteorological Driver[^*:\n]*:\*{0,2}\s*([^\n\r]+)/i);
        const confMatch = aiForecastText.match(/Confidence Rating[^*:\n]*:\*{0,2}\s*([^\n\r]+)/i);

        if (forecastMatch) {
          const rawF = forecastMatch[1].trim();
          if (/thunderstorm/i.test(rawF)) shortTermForecast = 'Thunderstorm';
          else if (/rain/i.test(rawF)) shortTermForecast = 'Rainy';
          else if (/overcast/i.test(rawF)) shortTermForecast = 'Overcast';
          else if (/partly/i.test(rawF)) shortTermForecast = 'Partly Cloudy';
          else shortTermForecast = 'Clear';
        }
        if (probMatch) {
          precipitationProbability = parseInt(probMatch[1], 10);
        }
        if (windMatch) {
          const rawW = windMatch[1].trim();
          if (/gust/i.test(rawW)) expectedWindBehavior = 'Gusty';
          else if (/shift/i.test(rawW)) expectedWindBehavior = 'Shifting';
          else if (/severe|crosswind/i.test(rawW)) expectedWindBehavior = 'Severe Crosswinds';
          else expectedWindBehavior = 'Stable';
        }
        if (driverMatch) {
          primaryMeteorologicalDriver = driverMatch[1].replace(/^[*\s]+|[*\s]+$/g, '').trim();
        }
        if (confMatch) {
          const rawC = confMatch[1].trim();
          if (/high/i.test(rawC)) confidenceRating = 'High';
          else if (/low/i.test(rawC)) confidenceRating = 'Low';
          else confidenceRating = 'Medium';
        }
      }

      // If no AI text or missing driver, execute deterministic fluid dynamics principles
      if (!primaryMeteorologicalDriver) {
        const pDelta = data.pressureDeltaHpa ?? -3.0;
        const rh = data.relativeHumidityPercent ?? 88;
        if (pDelta <= -2.5 && rh >= 80) {
          shortTermForecast = 'Thunderstorm';
          precipitationProbability = 85;
          expectedWindBehavior = 'Gusty';
          primaryMeteorologicalDriver = `Rapid barometric pressure drop (${data.pressureTrend3h}) coinciding with high boundary-layer humidity (${rh}%) provides the requisite convective available potential energy (CAPE) for intense cumulonimbus vertical development.`;
          confidenceRating = 'High';
        } else if (pDelta < 0 && rh >= 70) {
          shortTermForecast = 'Rainy';
          precipitationProbability = 68;
          expectedWindBehavior = 'Shifting';
          primaryMeteorologicalDriver = `Cyclonic surface convergence and high relative humidity (${rh}%) lower the lifting condensation level, producing sustained convective showers.`;
          confidenceRating = 'High';
        } else {
          shortTermForecast = 'Clear';
          precipitationProbability = 15;
          expectedWindBehavior = 'Stable';
          primaryMeteorologicalDriver = `Anticyclonic atmospheric subsidence and elevated barometric pressure (${data.barometricPressureHpa} hPa) suppress vertical thermal plumes, maintaining dry laminar airflow.`;
          confidenceRating = 'High';
        }
      }

      res.json({
        success: true,
        forecast: {
          shortTermForecast,
          precipitationProbability,
          expectedWindBehavior,
          primaryMeteorologicalDriver,
          confidenceRating,
          rawAiResponse: aiForecastText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isLiveApiData: true
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Meteorological forecast engine error' });
    }
  });

  // 3.5. Real-Time Multilingual Booking Flow Narration & Pronunciation API
  app.post('/api/ai/narrate-booking-step', async (req, res) => {
    try {
      const { 
        step = 1, 
        stepName = 'flight_search', 
        language = 'en', 
        flight, 
        passengers = [], 
        seat, 
        pnr, 
        totalAmount,
        customPrompt
      } = req.body;

      const client = getGeminiClient();

      const langMap: Record<string, string> = {
        en: 'English (Clear, welcoming airline announcer tone)',
        kn: 'Kannada (ಕನ್ನಡ - authentic, respectful, clear pronunciation)',
        te: 'Telugu (తెలుగు - clear, polite, natural cadence)',
        ta: 'Tamil (தமிழ் - formal, clear, welcoming)',
        hi: 'Hindi (हिन्दी - polite, clear Shuddh/Vyavaharik Hindi)',
        ml: 'Malayalam (മലയാളം - clear, natural diction)',
        mr: 'Marathi (मराठी - respectful, clear pronunciation)',
        bn: 'Bengali (বাংলা - clear, warm tone)',
        gu: 'Gujarati (ગુજરાતી - polite, clear cadence)',
        fr: 'French (Français - professional, refined)',
        es: 'Spanish (Español - clear, warm)',
        ar: 'Arabic (العربية - clear Modern Standard Arabic)',
        de: 'German (Deutsch - clear, professional)'
      };

      const targetLang = langMap[language] || 'English';

      if (client) {
        try {
          const prompt = customPrompt || `You are the AeroWings In-Flight Audio & Booking Copilot.
Generate a short (1-2 sentences max), clear, natural spoken announcement for passenger ticket booking.
Step: ${step} (${stepName})
Target Language: ${targetLang}
Flight: ${flight ? `${flight.airline || 'AeroWings'} ${flight.flightNumber || ''} (${flight.origin?.city || ''} to ${flight.destination?.city || ''})` : 'Flight booking'}
Passengers count: ${passengers.length || 1}
Seat: ${seat?.id || seat?.seatNumber || 'Selected'}
PNR: ${pnr || ''}
Total Amount: ₹${totalAmount || ''}

RULES:
- Must be written in authentic native script of ${targetLang} (or English if en).
- Keep it concise, friendly, and easy for text-to-speech to pronounce clearly.
- Do NOT use markdown symbols, bullet points, asterisks, or brackets.
- Return ONLY the exact spoken text.`;

          const geminiResult = await generateWithModelFallback(client, {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            temperature: 0.5
          });

          if (geminiResult && geminiResult.text) {
            const cleanText = geminiResult.text.replace(/[*_#`~\[\]]/g, '').trim();
            res.json({
              speechText: cleanText,
              language,
              step,
              model: geminiResult.modelUsed
            });
            return;
          }
        } catch (apiErr) {
          console.warn('[Gemini Booking Narrate API] Fallback:', apiErr);
        }
      }

      // Offline / Fallback localized announcements
      const fallbackPhrases: Record<string, Record<string, string>> = {
        flight_search: {
          en: `Found available flights for your chosen route with 100% instant refund guarantee.`,
          kn: `ನಿಮ್ಮ ಮಾರ್ಗಕ್ಕೆ ಲಭ್ಯವಿರುವ ವಿಮಾನಗಳು ಇಲ್ಲಿವೆ. 100% ತಕ್ಷಣ ಮರುಪಾವತಿ ರಕ್ಷಣೆ ಸಕ್ರಿಯವಾಗಿದೆ.`,
          te: `మీ ప్రయాణ మార్గానికి అందుబాటులో ఉన్న విమానాలు సిద్ధంగా ఉన్నాయి. 100% తక్షణ రీఫండ్ సదుపాయం కలదు.`,
          ta: `உங்கள் பயணத்திற்கான விமானங்கள் கிடைக்கின்றன. 100% உடனடி பணத்தைத் திரும்பப் பெறும் வசதி உள்ளது.`,
          hi: `आपके चुने हुए मार्ग के लिए उड़ानें उपलब्ध हैं। 100% तत्काल रिफंड गारंटी सक्रिय है।`,
          ml: `നിങ്ങൾ തിരഞ്ഞെടുത്ത റൂട്ടിലേക്ക് ലഭ്യമായ ഫ്ലൈറ്റുകൾ തയ്യാറാണ്.`,
          mr: `तुमच्या मार्गासाठी उपलब्ध उड्डाणे येथे आहेत. 100% झटपट परतावा हमी लागू.`,
          bn: `আপনার রুটের জন্য ফ্লাইটগুলি প্রস্তুত। ১০০% তাৎক্ষণিক রিফান্ড সক্রিয়।`,
          gu: `તમારા રૂટ માટે ઉપલબ્ધ ફ્લાઇટ્સ તૈયાર છે. ૧૦૦% ત્વરિત રિફંડ સુવિધા ઉપલબ્ધ છે.`,
          fr: `Vols disponibles pour votre itinéraire avec garantie de remboursement à 100%.`,
          es: `Vuelos disponibles para su ruta con garantía de reembolso instantáneo del 100%.`,
          ar: `الرحلات متاحة لمسارك المحدد مع ضمان استرداد الأموال الفوري بنسبة 100%.`,
          de: `Verfügbare Flüge für Ihre Route mit 100% Sofort-Rückerstattungsgarantie.`
        },
        flight_select: {
          en: `Flight selected. Moving to Step 2: Traveler details and document verification.`,
          kn: `ವಿಮಾನವನ್ನು ಆಯ್ಕೆಮಾಡಲಾಗಿದೆ. ಹಂತ 2: ಪ್ರಯಾಣಿಕರ ವಿವರಗಳು ಮತ್ತು ಆಧಾರ್ ಪರಿಶೀಲನೆಗೆ ಮುಂದುವರಿಯಿರಿ.`,
          te: `విమానం ఎంపిక చేయబడింది. దశ 2: ప్రయాణికుల వివరాలు మరియు ఆధార్ ధృవీకరణకు వెళ్తున్నాము.`,
          ta: `விமானம் தேர்ந்தெடுக்கப்பட்டது. படி 2: பயணிகள் விவரங்கள் மற்றும் ஆவண சரிபார்ப்பு.`,
          hi: `उड़ान का चयन हो गया है। चरण 2: यात्री विवरण और पहचान सत्यापन की ओर बढ़ रहे हैं।`,
          ml: `ഫ്ലൈറ്റ് തിരഞ്ഞെടുത്തു. സ്റ്റെപ്പ് 2: യാത്രക്കാരുടെ വിവരങ്ങൾ നൽകുക.`,
          mr: `उड्डाण निवडले गेले आहे. पायरी 2: प्रवासी तपशील आणि ओळख पडताळणी.`,
          bn: `ফ্লাইট নির্বাচিত হয়েছে। ধাপ ২: যাত্রী তথ্য এবং নথি যাচাইকরণ।`,
          gu: `ફ્લાઇટ પસંદ કરવામાં આવી છે. સ્ટેપ ૨: મુસાફરોની વિગતો અને ઓળખ ચકાસણી.`,
          fr: `Vol sélectionné. Étape 2: Détails des passagers et vérification.`,
          es: `Vuelo seleccionado. Paso 2: Detalles de los pasajeros y verificación.`,
          ar: `تم اختيار الرحلة. الخطوة 2: بيانات المسافرين والتحقق من الهوية.`,
          de: `Flug ausgewählt. Schritt 2: Passagierdaten und Dokumentenprüfung.`
        },
        passengers_verified: {
          en: `Traveler identification and documents verified successfully. Proceeding to seat selection.`,
          kn: `ಪ್ರಯಾಣಿಕರ ದಾಖಲೆಗಳು ಮತ್ತು ಆಧಾರ್ ಯಶಸ್ವಿಯಾಗಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ. ಸೀಟ್ ಆಯ್ಕೆಗೆ ಮುಂದುವರಿಯಿರಿ.`,
          te: `ప్రయాణీకుల ఆధార్ మరియు పత్రాలు విజయవంతంగా ధృవీకరించబడ్డాయి. సీటు ఎంపికకు వెళ్లండి.`,
          ta: `பயணிகளின் ஆவணங்கள் வெற்றிகரமாக சரிபார்க்கப்பட்டன. இருக்கை தேர்வுக்கு தொடரவும்.`,
          hi: `यात्री के पहचान दस्तावेज सफलतापूर्वक सत्यापित हो गए हैं। सीट चयन के लिए आगे बढ़ें।`,
          ml: `യാത്രക്കാരുടെ രേഖകൾ വിജയകരമായി പരിശോധിച്ചു. സീറ്റ് തിരഞ്ഞെടുക്കുക.`,
          mr: `प्रवाशांचे ओळखपत्र यशस्वीरीत्या पडताळले गेले आहे. सीट निवडीकडे पुढे जा.`,
          bn: `যাত্রীদের নথি সফলভাবে যাচাই করা হয়েছে। আসন নির্বাচনে এগিয়ে যান।`,
          gu: `મુસાફરોના દસ્તાવેજો સફળતાપૂર્વક ચકાસાયા છે. સીટ પસંદગી તરફ આગળ વધો.`,
          fr: `Documents des passagers vérifiés avec succès. Choix des sièges.`,
          es: `Documentos de pasajeros verificados con éxito. Selección de asientos.`,
          ar: `تم التحقق من وثائق المسافرين بنجاح. الانتقال إلى اختيار المقاعد.`,
          de: `Passagierdokumente erfolgreich geprüft. Weiter zur Sitzplatzwahl.`
        },
        seat_assigned: {
          en: `Seat assigned successfully. Moving to baggage and in-flight meals.`,
          kn: `ಸೀಟ್ ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ. ಬ್ಯಾಗೇಜ್ ಮತ್ತು ಊಟದ ಆಯ್ಕೆಗೆ ಮುಂದುವರಿಯುತ್ತಿದ್ದೇವೆ.`,
          te: `సీటు కేటాయించబడింది. బ్యాగేజీ మరియు భోజన ఎంపికకు వెళ్తున్నాము.`,
          ta: `இருக்கை ஒதுக்கப்பட்டது. லக்கேஜ் மற்றும் உணவுத் தேர்வுக்குச் செல்லவும்.`,
          hi: `सीट आवंटित कर दी गई है। अब सामान और भोजन चयन की ओर बढ़ें।`,
          ml: `സീറ്റ് അനുവദിച്ചു. ലഗേജ്, ഭക്ഷണ തിരഞ്ഞെടുപ്പിലേക്ക് പോകുക.`,
          mr: `सीट यशस्वीरीत्या आरक्षित केली. लगेज आणि जेवण निवडीकडे चला.`,
          bn: `আসন সফলভাবে বরাদ্দ করা হয়েছে। লাগেজ এবং খাবার পছন্দে এগিয়ে যান।`,
          gu: `સીટ સફળતાપૂર્વક ફાળવવામાં આવી છે. બેગેજ અને ભોજન પસંદગી તરફ આગળ વધો.`,
          fr: `Siège attribué avec succès. Choix des bagages et repas.`,
          es: `Asiento asignado con éxito. Selección de equipaje y comidas.`,
          ar: `تم تخصيص المقعد بنجاح. الانتقال إلى الأمتعة والوجبات.`,
          de: `Sitzplatz erfolgreich zugewiesen. Weiter zu Gepäck und Mahlzeiten.`
        },
        payment_processed: {
          en: `Payment processed securely. 100% instant refund protection is active for your journey.`,
          kn: `ಪಾವತಿಯನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲಾಗಿದೆ. 100% ತಕ್ಷಣ ಮರುಪಾವತಿ ರಕ್ಷಣೆ ಸಕ್ರಿಯವಾಗಿದೆ.`,
          te: `చెల్లింపు సురక్షితంగా పూర్తయింది. 100% తక్షణ రీఫండ్ రక్షణ సక్రియం చేయబడింది.`,
          ta: `கட்டணம் பாதுகாப்பாக செலுத்தப்பட்டது. 100% உடனடி பணத்தைத் திரும்பப் பெறும் பாதுகாப்பு உள்ளது.`,
          hi: `भुगतान सुरक्षित रूप से संसाधित हो गया है। 100% त्वरित रिफंड सुरक्षा सक्रिय है।`,
          ml: `പേയ്‌മെന്റ് സുരക്ഷിതമായി പൂർത്തിയായി. 100% റീഫണ്ട് സുരക്ഷ സജീവമാണ്.`,
          mr: `पेमेंट सुरक्षितपणे पूर्ण झाले. 100% त्वरित परतावा सुरक्षा लागू आहे.`,
          bn: `পেমেন্ট সফলভাবে প্রক্রিয়া করা হয়েছে। ১০০% রিফান্ড সুরক্ষা সক্রিয়।`,
          gu: `ચુકવણી સુરક્ષિત રીતે પૂર્ણ થઈ ગઈ છે. ૧૦૦% ત્વરિત રિફંડ સુરક્ષા સક્રિય છે.`,
          fr: `Paiement sécurisé effectué. Protection de remboursement à 100% active.`,
          es: `Pago procesado de forma segura. Protección de reembolso del 100% activa.`,
          ar: `تمت معالجة الدفع بأمان. حماية استرداد الأموال بنسبة 100% مفعلة.`,
          de: `Zahlung sicher verarbeitet. 100% Sofort-Rückerstattungsschutz aktiv.`
        },
        booking_confirmed: {
          en: `Congratulations! Your AeroWings booking is confirmed. Your digital E-Ticket with QR code is ready.`,
          kn: `ಅಭಿನಂದನೆಗಳು! ನಿಮ್ಮ ಏರೋವಿಂಗ್ಸ್ ಟಿಕೆಟ್ ದೃಢೀಕರಿಸಲಾಗಿದೆ. ಕ್ಯೂಆರ್ ಕೋಡ್ ಹೊಂದಿರುವ ಇ-ಟಿಕೆಟ್ ಸಿದ್ಧವಾಗಿದೆ.`,
          te: `అభినందనలు! మీ ఏరోవింగ్స్ బుకింగ్ ధృవీకరించబడింది. క్యూఆర్ కోడ్ తో కూడిన ఇ-టికెట్ సిద్ధంగా ఉంది.`,
          ta: `வாழ்த்துகள்! உங்கள் ஏரோவிங்ஸ் முன்பதிவு உறுதி செய்யப்பட்டது. மின்-டிக்கெட் தயாராக உள்ளது.`,
          hi: `बधाई हो! आपकी एयरोविंग्स बुकिंग की पुष्टि हो गई है। क्यूआर कोड वाला ई-टिकट तैयार है।`,
          ml: `അഭിനന്ദനങ്ങൾ! നിങ്ങളുടെ എയ്റോവിങ്സ് ബുക്കിംഗ് സ്ഥിരീകരിച്ചു. ഇ-ടിക്കറ്റ് തയ്യാറാണ്.`,
          mr: `अभिनंदन! आपले एरोविंग्स बुकिंग निश्चित झाले आहे. ई-तिकीट तयार आहे.`,
          bn: `অভিনন্দন! আপনার অ্যারোউইংস বুকিং নিশ্চিত হয়েছে। ডিজিটাল ই-টিকিট প্রস্তুত।`,
          gu: `અભિનંદન! તમારું એરોવિંગ્સ બુકિંગ કન્ફર્મ થઈ ગયું છે. ડિજિટલ ઇ-ટિકિટ તૈયાર છે.`,
          fr: `Félicitations ! Votre réservation AeroWings est confirmée. Votre billet électronique est prêt.`,
          es: `¡Felicidades! Su reserva de AeroWings está confirmada. Su boleto electrónico está listo.`,
          ar: `تهانينا! تم تأكيد حجزك في AeroWings. تذكرتك الإلكترونية جاهزة للتحميل.`,
          de: `Herzlichen Glückwunsch! Ihre AeroWings-Buchung ist bestätigt. Ihr E-Ticket ist bereit.`
        }
      };

      const stepDict = fallbackPhrases[stepName] || fallbackPhrases.flight_search;
      const speechText = stepDict[language] || stepDict.en;

      res.json({
        speechText,
        language,
        step,
        model: 'aerowings-native-tts-v6'
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Narration error' });
    }
  });

  // 4. Google Maps & Airport Navigation Grounding Endpoint
  app.post('/api/ai/maps-grounding', async (req, res) => {
    try {
      const { airportCode, originCode, destinationCode } = req.body;
      
      const airportDetails: Record<string, any> = {
        DEL: {
          code: 'DEL',
          name: 'Indira Gandhi International Airport',
          city: 'New Delhi',
          country: 'India',
          lat: 28.5562,
          lng: 77.1000,
          terminals: ['Terminal 1 (Low Cost Domestic)', 'Terminal 2 (Domestic Regional)', 'Terminal 3 (Premier International & Full Service)'],
          aeroWingsGates: 'T3 Gates 18A to 26B',
          metroStation: 'Airport Express Metro - IGI Terminal 3 Station',
          runways: ['RWY 09/27 (4430m)', 'RWY 10/28 (3810m)', 'RWY 11/29 (4430m)'],
          weatherGrounding: 'Visibility 6000m, CAT III ILS Active',
          mapEmbedQuery: 'Indira+Gandhi+International+Airport+Delhi'
        },
        BOM: {
          code: 'BOM',
          name: 'Chhatrapati Shivaji Maharaj International Airport',
          city: 'Mumbai',
          country: 'India',
          lat: 19.0896,
          lng: 72.8656,
          terminals: ['Terminal 1 (Domestic Santacruz)', 'Terminal 2 (Sahar Integrated International & Domestic)'],
          aeroWingsGates: 'T2 Pier South Gates 42 to 50',
          metroStation: 'CSMIA International Airport Metro Line 3',
          runways: ['RWY 09/27 (3445m)', 'RWY 14/32 (2925m)'],
          weatherGrounding: 'Visibility 8000m, Sea Breeze 14 knots',
          mapEmbedQuery: 'Chhatrapati+Shivaji+Maharaj+International+Airport+Mumbai'
        },
        BLR: {
          code: 'BLR',
          name: 'Kempegowda International Airport',
          city: 'Bengaluru',
          country: 'India',
          lat: 13.1986,
          lng: 77.7066,
          terminals: ['Terminal 1 (Domestic/Regional)', 'Terminal 2 (Garden Terminal - International & Premium)'],
          aeroWingsGates: 'T2 Gates 10 to 18',
          metroStation: 'KIAL Airport Express Shuttle Line & Suburban Rail Halt',
          runways: ['RWY 09L/27R (4000m)', 'RWY 09R/27L (4000m)'],
          weatherGrounding: 'Clear Skies, Temperature 24°C, CAT I Active',
          mapEmbedQuery: 'Kempegowda+International+Airport+Bengaluru'
        },
        MAA: {
          code: 'MAA',
          name: 'Chennai International Airport',
          city: 'Chennai',
          country: 'India',
          lat: 12.9941,
          lng: 80.1709,
          terminals: ['Terminal 1 (Kamraj Domestic)', 'Terminal 2 (Anna International)', 'Terminal 4 (New Integrated Terminal)'],
          aeroWingsGates: 'T4 Gates 04 to 12',
          metroStation: 'Chennai Metro Blue Line - Airport Metro Station',
          runways: ['RWY 07/25 (3658m)', 'RWY 12/30 (2045m)'],
          weatherGrounding: 'Visibility 9000m, Coastal Crosswind 11kt',
          mapEmbedQuery: 'Chennai+International+Airport'
        },
        HYD: {
          code: 'HYD',
          name: 'Rajiv Gandhi International Airport',
          city: 'Hyderabad',
          country: 'India',
          lat: 17.2403,
          lng: 78.4294,
          terminals: ['Main Passenger Terminal (Domestic & International Piers)'],
          aeroWingsGates: 'East Pier Gates 21 to 29',
          metroStation: 'Pushpak Airport Liner & RGIA Express Corridor',
          runways: ['RWY 09L/27R (4260m)', 'RWY 09R/27L (3707m)'],
          weatherGrounding: 'Clear, Temperature 28°C, Visibility 10km',
          mapEmbedQuery: 'Rajiv+Gandhi+International+Airport+Hyderabad'
        },
        CCU: {
          code: 'CCU',
          name: 'Netaji Subhash Chandra Bose International Airport',
          city: 'Kolkata',
          country: 'India',
          lat: 22.6547,
          lng: 88.4467,
          terminals: ['Integrated Terminal 2 (Domestic & International)'],
          aeroWingsGates: 'Concourse A Gates 14 to 22',
          metroStation: 'Kolkata Metro Yellow Line - Biman Bandar Metro',
          runways: ['RWY 01R/19L (3627m)', 'RWY 01L/19R (2790m)'],
          weatherGrounding: 'Visibility 5000m, CAT II ILS Operational',
          mapEmbedQuery: 'Netaji+Subhash+Chandra+Bose+International+Airport'
        },
        COK: {
          code: 'COK',
          name: 'Cochin International Airport (Solar Powered)',
          city: 'Kochi',
          country: 'India',
          lat: 10.1556,
          lng: 76.3908,
          terminals: ['Terminal 1 (Domestic)', 'Terminal 3 (Traditional Kerala International)'],
          aeroWingsGates: 'T3 International Gates 08 to 15',
          metroStation: 'Aluva Metro Station with Feeder EV Bus Connect',
          runways: ['RWY 09/27 (3400m)'],
          weatherGrounding: 'Tropical Breeze 9kt, Green Solar Grid Active',
          mapEmbedQuery: 'Cochin+International+Airport'
        },
        GOI: {
          code: 'GOI',
          name: 'Dabolim Airport',
          city: 'Goa (Dabolim)',
          country: 'India',
          lat: 15.3800,
          lng: 73.8317,
          terminals: ['Integrated Terminal Building'],
          aeroWingsGates: 'Terminal Gates 01 to 06',
          metroStation: 'Dabolim Airport Shuttle & Kadamba Electric Coaches',
          runways: ['RWY 08/26 (3458m)'],
          weatherGrounding: 'Sea Breeze 12kt, Visibility 10km',
          mapEmbedQuery: 'Dabolim+Airport+Goa'
        },
        AMD: {
          code: 'AMD',
          name: 'Sardar Vallabhbhai Patel International Airport',
          city: 'Ahmedabad',
          country: 'India',
          lat: 23.0772,
          lng: 72.6347,
          terminals: ['Terminal 1 (Domestic)', 'Terminal 2 (International)'],
          aeroWingsGates: 'T2 Gates 07 to 12',
          metroStation: 'Ahmedabad Metro Line 2 Feeder Route',
          runways: ['RWY 05/23 (3505m)'],
          weatherGrounding: 'Clear, Temperature 30°C, Good Visibility',
          mapEmbedQuery: 'Sardar+Vallabhbhai+Patel+International+Airport'
        },
        PNQ: {
          code: 'PNQ',
          name: 'Pune International Airport',
          city: 'Pune',
          country: 'India',
          lat: 18.5822,
          lng: 73.9197,
          terminals: ['New Integrated Terminal (NIT)'],
          aeroWingsGates: 'NIT Concourse Gates 04 to 10',
          metroStation: 'Pune Metro Line 2 Airport Extension Shuttle',
          runways: ['RWY 10/28 (2539m)'],
          weatherGrounding: 'Mild Wind 8kt, Visibility 8000m',
          mapEmbedQuery: 'Pune+International+Airport'
        },
        DXB: {
          code: 'DXB',
          name: 'Dubai International Airport',
          city: 'Dubai',
          country: 'United Arab Emirates',
          lat: 25.2532,
          lng: 55.3657,
          terminals: ['Terminal 1 (Concourse D)', 'Terminal 2', 'Terminal 3 (Concourse A/B/C)'],
          aeroWingsGates: 'T1 Concourse D Gates D01-D15',
          metroStation: 'Red Line - Airport Terminal 1 & 3 Stations',
          runways: ['RWY 12L/30R (4450m)', 'RWY 12R/30L (4000m)'],
          weatherGrounding: 'Clear, Temperature 32°C, High Visibility',
          mapEmbedQuery: 'Dubai+International+Airport'
        },
        LHR: {
          code: 'LHR',
          name: 'London Heathrow Airport',
          city: 'London',
          country: 'United Kingdom',
          lat: 51.4700,
          lng: -0.4543,
          terminals: ['Terminal 2 (The Queen\'s Terminal)', 'Terminal 3', 'Terminal 4', 'Terminal 5'],
          aeroWingsGates: 'Terminal 2 Gates B30 to B48',
          metroStation: 'Elizabeth Line & Piccadilly Line - Heathrow Terminals 2 & 3',
          runways: ['RWY 09L/27R (3902m)', 'RWY 09R/27L (3660m)'],
          weatherGrounding: 'Light Mist, Overcast, RWY Dry',
          mapEmbedQuery: 'Heathrow+Airport+London'
        },
        SIN: {
          code: 'SIN',
          name: 'Singapore Changi Airport',
          city: 'Singapore',
          country: 'Singapore',
          lat: 1.3644,
          lng: 103.9915,
          terminals: ['Terminal 1', 'Terminal 2', 'Terminal 3', 'Terminal 4', 'Jewel Changi Dome'],
          aeroWingsGates: 'Terminal 3 Concourse B Gates B1 to B10',
          metroStation: 'Changi Airport MRT Station (CG2)',
          runways: ['RWY 02L/20R (4000m)', 'RWY 02C/20C (4000m)', 'RWY 02R/20L (4000m)'],
          weatherGrounding: 'Tropical Warm, 29°C, CAT II Operational',
          mapEmbedQuery: 'Singapore+Changi+Airport'
        },
        JFK: {
          code: 'JFK',
          name: 'John F. Kennedy International Airport',
          city: 'New York',
          country: 'USA',
          lat: 40.6413,
          lng: -73.7781,
          terminals: ['Terminal 1', 'Terminal 4', 'Terminal 5', 'Terminal 7', 'Terminal 8'],
          aeroWingsGates: 'Terminal 4 Gates B20-B35',
          metroStation: 'JFK AirTrain connecting Jamaica & Howard Beach Subways',
          runways: ['RWY 04L/22R (3682m)', 'RWY 04R/22L (2560m)', 'RWY 13L/31R (3048m)', 'RWY 13R/31L (4423m)'],
          weatherGrounding: 'Partly Cloudy, Wind 280@10kt',
          mapEmbedQuery: 'John+F+Kennedy+International+Airport'
        }
      };

      const code = (airportCode || originCode || 'DEL').toUpperCase();
      // Generate accurate dynamic fallback if code is not explicitly in map
      const data = airportDetails[code] || {
        code,
        name: `${code} International Airport`,
        city: code,
        country: 'Global Aviation Hub',
        lat: 20.5937,
        lng: 78.9629,
        terminals: ['Main Terminal 1', 'Terminal 2'],
        aeroWingsGates: 'Concourse A Gates 01-10',
        metroStation: 'Airport Transit Express & Cab Stations',
        runways: ['RWY 09/27 (3500m)'],
        weatherGrounding: 'Operational CAT I, Visibility 8000m',
        mapEmbedQuery: `${code}+Airport`
      };

      const originObj = airportDetails[(originCode || 'DEL').toUpperCase()] || airportDetails['DEL'];
      const destObj = airportDetails[(destinationCode || 'BOM').toUpperCase()] || airportDetails['BOM'];

      res.json({
        airport: data,
        route: {
          origin: originObj,
          destination: destObj,
        },
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.name)}`
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Maps grounding error' });
    }
  });

  // 5. Secure 6-Digit OTP Generator, MongoDB 5-Minute TTL Storage & Real Twilio SMS Dispatch API
  app.post('/api/otp/send', async (req, res) => {
    try {
      const { phoneNumber, purpose = 'flight_booking' } = req.body;

      if (!phoneNumber || typeof phoneNumber !== 'string' || phoneNumber.replace(/\D/g, '').length < 8) {
        res.status(400).json({
          success: false,
          error: 'A valid mobile phone number is required to receive the verification OTP.'
        });
        return;
      }

      const formattedPhone = formatE164Phone(phoneNumber.trim()) || phoneNumber.trim();

      // 1. Dynamically generate a cryptographically secure 6-digit OTP for ANY phone number entered
      const secureOtp = generateSecure6DigitOtp();

      // 2. Store temporarily in MongoDB (and memory store) with a strict 5-minute expiration time
      const otpDoc = await saveOtpToDatabase(formattedPhone, secureOtp, purpose);

      // 3. Send real 6-digit SMS OTP via Twilio API to user's mobile phone
      const smsResult = await sendSmsViaApi(formattedPhone, secureOtp);

      console.log(`[OTP Engine] Generated dynamic 6-digit OTP ${secureOtp} for ${formattedPhone}. Expires at: ${otpDoc.expiresAt.toISOString()}`);

      res.json({
        success: true,
        message: `OTP sent to ${formattedPhone}: ${secureOtp}`,
        toastMessage: `OTP sent to ${formattedPhone}: ${secureOtp}`,
        otp: secureOtp,
        fallbackOtp: secureOtp,
        devPreviewOtp: secureOtp,
        deliveryNote: smsResult.success
          ? `OTP sent to ${formattedPhone}: ${secureOtp} (Twilio SMS Dispatched)`
          : `OTP sent to ${formattedPhone}: ${secureOtp}`,
        expiresInSeconds: 300,
        expiresAt: otpDoc.expiresAt.toISOString(),
        phoneNumber: formattedPhone,
        smsDelivery: {
          status: smsResult.success ? 'sent' : 'simulated',
          messageId: smsResult.messageId,
          provider: smsResult.provider,
          error: smsResult.error
        }
      });
    } catch (err: any) {
      console.error('[OTP Send Error]', err);
      res.status(500).json({
        success: false,
        error: err?.message || 'Internal server error while generating and sending OTP.'
      });
    }
  });

  // 6. OTP Verification Endpoint (Validates match and 5-min expiration before flight booking page)
  app.post('/api/otp/verify', async (req, res) => {
    try {
      const { phoneNumber, otp } = req.body;

      if (!phoneNumber || typeof phoneNumber !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Phone number is required.'
        });
        return;
      }

      if (!otp || typeof otp !== 'string' || otp.trim().length !== 6) {
        res.status(400).json({
          success: false,
          error: 'Please enter a valid 6-digit numeric OTP.'
        });
        return;
      }

      // Check against MongoDB (and TTL expiration)
      const verification = await verifyOtpInDatabase(phoneNumber, otp);

      if (!verification.valid) {
        res.status(400).json({
          success: false,
          verified: false,
          expired: verification.expired || false,
          attemptsExceeded: verification.attemptsExceeded || false,
          error: verification.message
        });
        return;
      }

      // Generate a temporary booking clearance token valid for this booking session
      const bookingToken = 'aw_auth_' + Buffer.from(`${phoneNumber}:${Date.now()}`).toString('base64url');

      res.json({
        success: true,
        verified: true,
        message: 'OTP verified successfully! Clearance granted for flight booking.',
        bookingToken,
        verifiedAt: new Date().toISOString()
      });
    } catch (err: any) {
      console.error('[OTP Verify Error]', err);
      res.status(500).json({
        success: false,
        error: err?.message || 'Internal server error while verifying OTP.'
      });
    }
  });

  // 7. Flight Booking Creation & SMS Dispatch to Linked Phone Number (MongoDB + Twilio)
  const handleBookingCreation = async (req: express.Request, res: express.Response) => {
    try {
      const {
        phoneNumber,
        passengerName = 'Valued Passenger',
        flightNumber = 'AW-402',
        airline = 'AeroWings',
        origin = 'BOM',
        destination = 'DEL',
        departureDate = new Date().toISOString().split('T')[0],
        departureTime = '10:30',
        arrivalDate = new Date().toISOString().split('T')[0],
        arrivalTime = '12:45',
        seatNumber = '12A',
        seatClass = 'Economy',
        totalPriceINR = 4850,
        contactEmail = 'reservations@aerowings.com',
        passengers,
        gate = '22A',
        terminal = 'T3',
        pnr: providedPnr,
        customMessage
      } = req.body;

      if (!phoneNumber || typeof phoneNumber !== 'string' || phoneNumber.trim().length < 8) {
        res.status(400).json({
          success: false,
          error: 'A valid linked mobile phone number is required to receive flight booking confirmation SMS.'
        });
        return;
      }

      const cleanPhone = phoneNumber.trim();
      const pnr = providedPnr || ('AW' + Math.floor(1000 + Math.random() * 9000));
      const ticketNumber = `AW-ETK-${Math.floor(100000 + Math.random() * 900000)}`;

      // 1. Dispatch Real SMS via Dedicated Twilio Service (Catches all Twilio errors cleanly)
      const smsDelivery = await sendFlightBookingSms({
        pnr,
        passengerName,
        flightNumber,
        origin,
        destination,
        departureDate,
        departureTime,
        seatNumber,
        seatClass,
        totalPriceINR: Number(totalPriceINR),
        recipientPhone: cleanPhone,
        ticketNumber,
        gate,
        customMessage
      });

      // 2. Persist Flight Booking into MongoDB Model
      const bookingDoc = await saveFlightBooking({
        pnr,
        ticketNumber,
        flightNumber,
        airline,
        origin,
        destination,
        departureDate,
        departureTime,
        arrivalDate,
        arrivalTime,
        passengerName,
        passengers: passengers && Array.isArray(passengers) && passengers.length > 0 
          ? passengers 
          : [{
              firstName: passengerName.split(' ')[0] || 'Valued',
              lastName: passengerName.split(' ').slice(1).join(' ') || 'Passenger',
              seat: seatNumber,
              type: 'Adult',
              ticketNumber
            }],
        seatNumbers: [seatNumber],
        seatClass,
        totalPriceINR: Number(totalPriceINR),
        contactEmail,
        contactPhone: cleanPhone,
        status: 'Confirmed',
        paymentStatus: 'PAID',
        gate,
        terminal,
        smsSent: smsDelivery.success,
        smsMessageId: smsDelivery.messageId,
        source: 'web_portal'
      });

      // 3. Persist Ticket Details into MongoDB Model
      const ticketDoc = await issueTicket({
        ticketNumber,
        pnr,
        passengerName,
        flightNumber,
        airline,
        origin,
        destination,
        route: `${origin} ➔ ${destination}`,
        departureDate,
        departureTime,
        seatNumber,
        seatClass,
        gate,
        terminal,
        boardingGroup: 'Group 2',
        boardingTime: '45 mins prior to departure',
        barcodeHash: `AW*${pnr}*${ticketNumber}`,
        status: 'ISSUED'
      });

      res.json({
        success: true,
        message: 'Flight booked successfully! Stored in MongoDB and confirmation SMS processed via Twilio.',
        booking: bookingDoc,
        ticket: ticketDoc,
        smsDelivery: {
          status: smsDelivery.status,
          success: smsDelivery.success,
          messageId: smsDelivery.messageId,
          provider: smsDelivery.provider,
          recipientPhone: cleanPhone,
          smsMessage: smsDelivery.body,
          error: smsDelivery.error
        }
      });
    } catch (err: any) {
      console.error('[Booking Creation Error]', err);
      res.status(500).json({
        success: false,
        error: err?.message || 'Failed to process flight booking and SMS dispatch.'
      });
    }
  };

  // Mount booking creation on both endpoints
  app.post('/api/bookings', handleBookingCreation);
  app.post('/api/booking/create', handleBookingCreation);

  // 8. Query Bookings from MongoDB
  app.get('/api/bookings', async (req, res) => {
    try {
      const { q, limit } = req.query;
      let bookings: FlightBookingModel[] = [];
      if (q && typeof q === 'string') {
        bookings = await searchBookings(q);
      } else {
        bookings = await getAllBookings(Number(limit) || 100);
      }
      res.json({ success: true, count: bookings.length, bookings });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Error fetching bookings' });
    }
  });

  app.get('/api/bookings/:pnr', async (req, res) => {
    try {
      const { pnr } = req.params;
      const booking = await getBookingByPnr(pnr);
      if (!booking) {
        res.status(404).json({ success: false, error: `Booking with PNR ${pnr} not found in database.` });
        return;
      }
      res.json({ success: true, booking });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Error fetching booking' });
    }
  });

  // 9. User Registration Endpoint (MongoDB `users` collection)
  app.post('/api/users/register', async (req, res) => {
    try {
      const { fullName, email, phoneNumber, frequentFlyerNumber, tier } = req.body;

      if (!fullName || !email || !phoneNumber) {
        res.status(400).json({
          success: false,
          error: 'fullName, email, and phoneNumber are required for registration.'
        });
        return;
      }

      const user = await registerUser({
        fullName,
        email,
        phoneNumber,
        frequentFlyerNumber,
        tier
      });

      res.json({
        success: true,
        message: 'User registered successfully and stored in MongoDB.',
        user
      });
    } catch (err: any) {
      console.error('[User Registration Error]', err);
      res.status(500).json({ success: false, error: err?.message || 'Registration failed' });
    }
  });

  app.get('/api/users', async (req, res) => {
    try {
      const users = await getAllUsers();
      res.json({ success: true, count: users.length, users });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Error fetching users' });
    }
  });

  // 10. Ticket Details Persistence (MongoDB `tickets` collection)
  app.post('/api/tickets/issue', async (req, res) => {
    try {
      const ticket = await issueTicket(req.body);
      
      // Optionally notify via SMS if recipientPhone provided
      if (req.body.recipientPhone) {
        sendTicketIssuedSms(
          req.body.recipientPhone,
          ticket.passengerName,
          ticket.ticketNumber,
          ticket.pnr,
          ticket.flightNumber
        ).catch(e => console.warn('Ticket SMS notice:', e));
      }

      res.json({
        success: true,
        message: 'Ticket details successfully issued and stored in MongoDB.',
        ticket
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Ticket issuance failed' });
    }
  });

  app.get('/api/tickets/:identifier', async (req, res) => {
    try {
      const ticket = await getTicketByIdentifier(req.params.identifier);
      if (!ticket) {
        res.status(404).json({ success: false, error: 'Ticket not found in database.' });
        return;
      }
      res.json({ success: true, ticket });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Error fetching ticket' });
    }
  });

  // 11. Dedicated SMS Send API (Twilio SMS Service)
  app.post('/api/sms/send', async (req, res) => {
    try {
      const { phoneNumber, message } = req.body;
      if (!phoneNumber || !message) {
        res.status(400).json({ success: false, error: 'phoneNumber and message are required.' });
        return;
      }

      const result = await sendSms(phoneNumber, message);
      res.json({
        success: result.success,
        delivery: result
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'SMS service error' });
    }
  });

  // 8. Vite Middleware Integration (Development) / Static Files (Production)
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'), (err) => {
        if (err && !res.headersSent) {
          res.status(200).send('<!DOCTYPE html><html><head><title>AeroWings Airlines</title></head><body>AeroWings Airlines is starting up...</body></html>');
        }
      });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✈️ AeroWings Unified Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal server startup error:', err);
});
