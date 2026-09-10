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

import twilio, { Twilio } from 'twilio';

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

let twilioClient: Twilio | null = null;

/**
 * Format raw phone number into standard international E.164 format
 */
export function formatE164Phone(rawPhone: string): string {
  if (!rawPhone) return '';
  const cleaned = rawPhone.trim().replace(/[^0-9+]/g, '');
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
  return `+${cleaned}`;
}

/**
 * Lazy initialization of the Twilio client using environment variables.
 * Falls back safely if credentials are not provided.
 */
export function getTwilioClient(): Twilio | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

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
 * Send an SMS message using the Twilio Node.js SDK.
 * Catches all errors gracefully to prevent server crashes.
 */
export async function sendSms(toPhone: string, messageBody: string): Promise<SmsDeliveryResult> {
  const formattedPhone = formatE164Phone(toPhone);
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  const client = getTwilioClient();
  const timestamp = new Date().toISOString();

  // 1. If Twilio client and sender number are configured, attempt real dispatch via SDK
  if (client && fromNumber) {
    try {
      console.log(`📡 [Twilio SDK] Dispatching SMS to ${formattedPhone} from ${fromNumber}...`);
      const twilioMessage = await client.messages.create({
        to: formattedPhone,
        from: fromNumber,
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
      const code = twilioErr?.code ? `(Code ${twilioErr.code}) ` : '';
      const errMsg = `${code}${twilioErr?.message || 'Twilio dispatch failed'}`;
      console.warn(`⚠️ [Twilio API Notice] ${errMsg}. SMS logged safely without interrupting flow.`);

      // Return clean failure payload with fallback details
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
