/**
 * AeroWings Airline Dedicated Twilio SMS Service
 * 
 * Provides production-ready SMS delivery for flight bookings, ticket issues,
 * gate changes, and OTP codes using the Twilio Node.js SDK.
 * 
 * Robust error handling ensures Twilio API issues (e.g. trial restrictions, 
 * carrier filters, unverified numbers, or invalid credentials) never crash 
 * the application or disrupt the user's booking flow.
 */

import twilio from 'twilio';

type TwilioClient = any;

export interface SmsDeliveryResult {
  success: boolean;
  messageId: string;
  provider: string;
  status: 'sent' | 'queued' | 'simulated' | 'failed';
  recipient: string;
  body: string;
  error?: string;
  timestamp: string;
}

export interface FlightBookingSmsPayload {
  pnr: string;
  passengerName: string;
  flightNumber: string;
  origin?: string;
  destination?: string;
  departureDate?: string;
  departureTime?: string;
  seatNumber?: string;
  seatClass?: string;
  totalPriceINR?: number;
  recipientPhone: string;
  ticketNumber?: string;
  gate?: string;
  customMessage?: string;
}

let twilioClient: TwilioClient | null = null;
let cachedProvisionedSender: string | null = null;

const DEFAULT_TWILIO_SID = 'AC96b612b55974a9b5bc1152cb9fd85251';
const DEFAULT_TWILIO_TOKEN = '7f8e24c69aa9d778405895672a450496';
const DEFAULT_TWILIO_FROM = '8971541794';
const FALLBACK_TWILIO_FROM = '+17372508034';

/**
 * Format raw phone number into standard international E.164 format
 */
export function formatE164Phone(rawPhone: string): string {
  if (!rawPhone) return '';
  const cleaned = rawPhone.trim().replace(/[^0-9+]/g, '');
  if (!cleaned) return '';
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  // Default to +91 (India) if 10 digits starting with 6-9, else +1 (US)
  if (cleaned.length === 10) {
    if (/^[6-9]/.test(cleaned)) {
      return `+91${cleaned}`;
    }
    return `+1${cleaned}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }
  return `+${cleaned}`;
}

/**
 * Lazy initialization of the Twilio client using environment variables or user credentials.
 * Falls back safely if credentials are not provided.
 */
export function getTwilioClient(): TwilioClient | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID || DEFAULT_TWILIO_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN || DEFAULT_TWILIO_TOKEN;

  if (!accountSid || !authToken) {
    return null;
  }

  if (!twilioClient) {
    try {
      twilioClient = twilio(accountSid, authToken);
    } catch (err: any) {
      console.warn('⚠️ [Twilio Init Warning] Failed to initialize Twilio client:', err?.message || err);
      twilioClient = null;
    }
  }

  return twilioClient;
}

/**
 * Resolve active Twilio sender number if user-provided From number is rejected by Twilio REST API
 */
async function resolveTwilioSenderNumber(client: TwilioClient): Promise<string> {
  if (cachedProvisionedSender) return cachedProvisionedSender;
  try {
    const incomingNumbers = await client.incomingPhoneNumbers.list({ limit: 1 });
    if (incomingNumbers && incomingNumbers.length > 0 && incomingNumbers[0].phoneNumber) {
      cachedProvisionedSender = incomingNumbers[0].phoneNumber;
      return cachedProvisionedSender;
    }
  } catch {
    // ignore lookup error
  }
  return FALLBACK_TWILIO_FROM;
}

/**
 * Send an SMS message using the Twilio Node.js SDK.
 * Catches all errors gracefully to prevent server crashes.
 */
export async function sendSms(toPhone: string, messageBody: string): Promise<SmsDeliveryResult> {
  const formattedPhone = formatE164Phone(toPhone);
  const rawFrom = process.env.TWILIO_PHONE_NUMBER || DEFAULT_TWILIO_FROM;
  const formattedFrom = formatE164Phone(rawFrom) || rawFrom;
  const client = getTwilioClient();
  const timestamp = new Date().toISOString();

  // 1. If Twilio client and sender number are configured, attempt real dispatch via SDK
  if (client && rawFrom) {
    const candidateSenders = Array.from(new Set([rawFrom, formattedFrom, FALLBACK_TWILIO_FROM]));
    let lastError: any = null;

    for (const sender of candidateSenders) {
      try {
        // Avoid sending where To === From on Twilio if alternative sender exists
        if (sender === formattedPhone && candidateSenders.length > 1 && sender !== FALLBACK_TWILIO_FROM) {
          const provisioned = await resolveTwilioSenderNumber(client);
          if (provisioned && provisioned !== formattedPhone) {
            console.log(`📡 [Twilio SDK] Dispatching SMS to ${formattedPhone} via provisioned number ${provisioned}...`);
            const msg = await client.messages.create({
              to: formattedPhone,
              from: provisioned,
              body: messageBody
            });
            console.log(`✅ [Twilio SMS Success] SID: ${msg.sid} | Status: ${msg.status}`);
            return {
              success: true,
              messageId: msg.sid,
              provider: 'Twilio SMS Cloud',
              status: (msg.status as any) || 'sent',
              recipient: formattedPhone,
              body: messageBody,
              timestamp
            };
          }
        }

        console.log(`📡 [Twilio SDK] Dispatching SMS to ${formattedPhone} from ${sender}...`);
        const twilioMessage = await client.messages.create({
          to: formattedPhone,
          from: sender,
          body: messageBody
        });

        console.log(`✅ [Twilio SMS Success] SID: ${twilioMessage.sid} | Status: ${twilioMessage.status}`);

        return {
          success: true,
          messageId: twilioMessage.sid,
          provider: 'Twilio SMS Cloud',
          status: (twilioMessage.status as any) || 'sent',
          recipient: formattedPhone,
          body: messageBody,
          timestamp
        };
      } catch (twilioErr: any) {
        lastError = twilioErr;
        // If error is related to invalid 'From' number (e.g. 21212, 21606, 21659), try next candidate sender or resolved Twilio number
        const errCode = Number(twilioErr?.code);
        if (errCode === 21212 || errCode === 21606 || errCode === 21659 || String(twilioErr?.message || '').toLowerCase().includes('from')) {
          const resolved = await resolveTwilioSenderNumber(client);
          if (resolved && !candidateSenders.includes(resolved)) {
            candidateSenders.push(resolved);
          }
          continue;
        }
        break;
      }
    }

    const code = lastError?.code ? `(Code ${lastError.code}) ` : '';
    const errMsg = `${code}${lastError?.message || 'Twilio dispatch failed'}`;
    console.warn(`⚠️ [Twilio API Notice] ${errMsg}. SMS logged safely without interrupting flow.`);

    return {
      success: false,
      messageId: `sim_err_${Date.now().toString(36)}`,
      provider: 'Twilio (Notice Logged)',
      status: 'failed',
      recipient: formattedPhone,
      body: messageBody,
      error: errMsg,
      timestamp
    };
  }

  // 2. Fallback when credentials are not configured in environment
  const fallbackId = `mock_sms_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 4)}`;
  console.log(`📱 [AeroWings Mock Gateway] No active Twilio credentials. Message to ${formattedPhone}: "${messageBody.substring(0, 70)}..." (ID: ${fallbackId})`);

  return {
    success: true,
    messageId: fallbackId,
    provider: 'AeroWings Simulated Gateway (Missing Twilio Env)',
    status: 'simulated',
    recipient: formattedPhone,
    body: messageBody,
    timestamp
  };
}

/**
 * Dedicated flight booking confirmation SMS dispatcher.
 * Composes a clear, high-priority flight confirmation text with PNR, flight details,
 * passenger name, and boarding guidance.
 */
export async function sendFlightBookingSms(payload: FlightBookingSmsPayload): Promise<SmsDeliveryResult> {
  const {
    pnr,
    passengerName,
    flightNumber,
    origin = 'DEL',
    destination = 'BOM',
    departureDate = 'Upcoming',
    departureTime = 'Scheduled',
    seatNumber = 'Assigned',
    seatClass = 'Economy',
    recipientPhone,
    ticketNumber,
    gate = 'Gate 22A',
    customMessage
  } = payload;

  const smsText = customMessage || 
    `✈️ [AeroWings Prestige] Flight Booking Confirmed!\n` +
    `PNR: ${pnr}\n` +
    `Passenger: ${passengerName}\n` +
    `Flight: ${flightNumber} (${origin} ➔ ${destination})\n` +
    `Date & Time: ${departureDate} @ ${departureTime}\n` +
    `Seat: ${seatNumber} (${seatClass})\n` +
    `Gate: ${gate}\n` +
    (ticketNumber ? `E-Ticket: ${ticketNumber}\n` : '') +
    `Show this SMS or digital pass at airport security. Safe travels!`;

  return await sendSms(recipientPhone, smsText);
}

/**
 * Dedicated ticket issuance SMS dispatcher.
 */
export async function sendTicketIssuedSms(
  recipientPhone: string,
  passengerName: string,
  ticketNumber: string,
  pnr: string,
  flightNumber: string
): Promise<SmsDeliveryResult> {
  const text = `🎫 [AeroWings E-Ticket Issued] Ticket #${ticketNumber} for ${passengerName} (PNR: ${pnr}, Flight: ${flightNumber}). Your digital boarding pass is ready. Please report to the gate 45 mins prior to departure.`;
  return await sendSms(recipientPhone, text);
}
