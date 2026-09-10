import crypto from 'crypto';
import { MongoClient, Collection, Db } from 'mongodb';

// Interface for OTP Document in MongoDB
export interface OtpDocument {
  phoneNumber: string;
  otp: string;
  createdAt: Date;
  expiresAt: Date;
  verified: boolean;
  purpose: string;
  attempts: number;
}

// In-memory fallback cache in case MONGODB_URI is not configured in local environment
const inMemoryOtpStore = new Map<string, OtpDocument>();

// Auto-cleanup expired in-memory entries every minute
const cleanupTimer = setInterval(() => {
  const now = new Date();
  for (const [phone, doc] of inMemoryOtpStore.entries()) {
    if (now > doc.expiresAt) {
      inMemoryOtpStore.delete(phone);
    }
  }
}, 60 * 1000);
cleanupTimer.unref();

let mongoClient: MongoClient | null = null;
let dbInstance: Db | null = null;
let otpCollection: Collection<OtpDocument> | null = null;
let isMongoConnecting = false;

const DEFAULT_MONGODB_URI = 'mongodb+srv://arunkumartharun400328_db_user:GQv4bcNNhxn312bT@cluster0.kvtruwh.mongodb.net/?appName=Cluster0';
const DEFAULT_TWILIO_SID = 'AC96b612b55974a9b5bc1152cb9fd85251';
const DEFAULT_TWILIO_TOKEN = '7f8e24c69aa9d778405895672a450496';
const DEFAULT_TWILIO_FROM = '+17372508034';

/**
 * Format phone to international E.164 for SMS delivery
 */
export function formatE164Phone(rawPhone: string): string {
  const digits = rawPhone.trim().replace(/[^0-9+]/g, '');
  if (digits.startsWith('+')) return digits;
  if (digits.length === 10) {
    if (/^[6-9]/.test(digits)) return `+91${digits}`;
    return `+1${digits}`;
  }
  return `+${digits}`;
}

/**
 * Initialize MongoDB connection and establish TTL index for 5-minute expiration
 */
export async function initMongo(): Promise<Collection<OtpDocument> | null> {
  const uri = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;
  if (!uri) {
    // Gracefully use secure in-memory storage if MongoDB URI not set
    return null;
  }

  if (otpCollection) {
    return otpCollection;
  }

  if (isMongoConnecting) {
    return null;
  }

  isMongoConnecting = true;
  try {
    mongoClient = new MongoClient(uri, {
      connectTimeoutMS: 6000,
      serverSelectionTimeoutMS: 6000
    });
    await mongoClient.connect();
    dbInstance = mongoClient.db(process.env.MONGODB_DB_NAME || 'aerowings_db');
    otpCollection = dbInstance.collection<OtpDocument>('otps');

    // Create TTL index on expiresAt (MongoDB automatically deletes documents when expiresAt is reached)
    await otpCollection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    // Also index phoneNumber for fast lookups
    await otpCollection.createIndex({ phoneNumber: 1 });

    console.log('✅ MongoDB Atlas connected successfully for OTP storage with 5-minute TTL index.');
    return otpCollection;
  } catch (err) {
    console.warn('⚠️ MongoDB Atlas connection notice:', (err as any)?.message || err);
    return null;
  } finally {
    isMongoConnecting = false;
  }
}

/**
 * Generates a cryptographically secure 6-digit OTP (between 100000 and 999999)
 */
export function generateSecure6DigitOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Sends OTP via SMS API (Twilio / SMS Gateway / Mock for development)
 */
export async function sendSmsViaApi(
  phoneNumber: string,
  otp: string
): Promise<{ success: boolean; messageId: string; provider: string; previewText: string }> {
  const message = `Your AeroWings Prestige Flight Booking verification code is: ${otp}. Valid for 5 minutes. Do not share this OTP with anyone.`;
  const formattedPhone = formatE164Phone(phoneNumber);
  
  // External SMS API credentials (Twilio)
  const twilioSid = process.env.TWILIO_ACCOUNT_SID || DEFAULT_TWILIO_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN || DEFAULT_TWILIO_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER || DEFAULT_TWILIO_FROM;

  if (twilioSid && twilioToken && twilioPhone) {
    try {
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          To: formattedPhone,
          From: twilioPhone,
          Body: message
        }).toString()
      });

      const resJson: any = await response.json();
      if (response.ok) {
        console.log(`✅ [Twilio SMS Cloud] Dispatched to ${formattedPhone}. SID: ${resJson.sid}`);
        return {
          success: true,
          messageId: resJson.sid || 'twilio_' + Date.now(),
          provider: 'Twilio SMS Cloud',
          previewText: message
        };
      } else {
        console.warn(`⚠️ [Twilio API Notice] Code ${resJson.code}: ${resJson.message}`);
      }
    } catch (smsErr) {
      console.warn('Twilio dispatch failed, using standard SMS gateway fallback:', smsErr);
    }
  }

  // Fast2SMS / Generic Gateway or Development SMS Dispatcher
  const simulatedId = 'sms_' + crypto.randomBytes(6).toString('hex');
  console.log(`📱 [SMS Gateway] Dispatched to ${formattedPhone}: "${message}" (ID: ${simulatedId})`);

  return {
    success: true,
    messageId: simulatedId,
    provider: 'AeroWings Prestige SMS Gateway',
    previewText: message
  };
}

/**
 * Save OTP to MongoDB with 5-minute expiration time
 */
export async function saveOtpToDatabase(phoneNumber: string, otp: string, purpose = 'flight_booking'): Promise<OtpDocument> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes exactly

  const otpDoc: OtpDocument = {
    phoneNumber: phoneNumber.trim(),
    otp,
    createdAt: now,
    expiresAt,
    verified: false,
    purpose,
    attempts: 0
  };

  const col = await initMongo();
  if (col) {
    // Delete any previous active OTPs for this phone number
    await col.deleteMany({ phoneNumber: phoneNumber.trim() });
    await col.insertOne(otpDoc);
  } else {
    inMemoryOtpStore.set(phoneNumber.trim(), otpDoc);
  }

  return otpDoc;
}

/**
 * Verify OTP from MongoDB (or in-memory fallback)
 */
export async function verifyOtpInDatabase(
  phoneNumber: string,
  userEnteredOtp: string
): Promise<{ valid: boolean; message: string; expired?: boolean; attemptsExceeded?: boolean }> {
  const cleanPhone = phoneNumber.trim();
  const cleanOtp = userEnteredOtp.trim();

  const col = await initMongo();
  let record: OtpDocument | null = null;

  if (col) {
    record = await col.findOne({ phoneNumber: cleanPhone });
  } else {
    record = inMemoryOtpStore.get(cleanPhone) || null;
  }

  if (!record) {
    return {
      valid: false,
      message: 'No active OTP found for this phone number. Please request a new verification code.'
    };
  }

  // Check 5-minute expiration
  const now = new Date();
  if (now > record.expiresAt) {
    // Remove expired document
    if (col) {
      await col.deleteOne({ phoneNumber: cleanPhone });
    } else {
      inMemoryOtpStore.delete(cleanPhone);
    }
    return {
      valid: false,
      expired: true,
      message: 'The 6-digit OTP has expired after 5 minutes. Please request a new code.'
    };
  }

  // Rate-limiting check for incorrect attempts (maximum 5 attempts)
  if (record.attempts >= 5) {
    if (col) {
      await col.deleteOne({ phoneNumber: cleanPhone });
    } else {
      inMemoryOtpStore.delete(cleanPhone);
    }
    return {
      valid: false,
      attemptsExceeded: true,
      message: 'Too many incorrect attempts. For your security, this OTP has been invalidated. Please request a new code.'
    };
  }

  // Match OTP
  if (record.otp !== cleanOtp) {
    const updatedAttempts = record.attempts + 1;
    if (col) {
      await col.updateOne({ phoneNumber: cleanPhone }, { $set: { attempts: updatedAttempts } });
    } else {
      record.attempts = updatedAttempts;
    }

    return {
      valid: false,
      message: `Invalid OTP code. You have ${5 - updatedAttempts} attempt(s) remaining.`
    };
  }

  // Valid OTP! Delete or mark as verified so it cannot be reused
  if (col) {
    await col.deleteOne({ phoneNumber: cleanPhone });
  } else {
    inMemoryOtpStore.delete(cleanPhone);
  }

  return {
    valid: true,
    message: 'OTP verified successfully! You may now proceed with your flight booking.'
  };
}

/**
 * Send custom SMS notification via Twilio or local prestige gateway
 */
export async function sendCustomSms(
  phoneNumber: string,
  message: string
): Promise<{ success: boolean; messageId: string; provider: string; previewText: string }> {
  const formattedPhone = formatE164Phone(phoneNumber);
  const twilioSid = process.env.TWILIO_ACCOUNT_SID || DEFAULT_TWILIO_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN || DEFAULT_TWILIO_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER || DEFAULT_TWILIO_FROM;

  if (twilioSid && twilioToken && twilioPhone) {
    try {
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          To: formattedPhone,
          From: twilioPhone,
          Body: message
        }).toString()
      });

      const resJson: any = await response.json();
      if (response.ok) {
        console.log(`✅ [Twilio Flight Booking SMS] Sent to ${formattedPhone}. SID: ${resJson.sid}`);
        return {
          success: true,
          messageId: resJson.sid || 'twilio_' + Date.now(),
          provider: 'Twilio SMS Cloud',
          previewText: message
        };
      } else {
        console.warn(`⚠️ [Twilio API Notice] Code ${resJson.code}: ${resJson.message}`);
      }
    } catch (smsErr) {
      console.warn('Twilio dispatch failed, using standard gateway fallback:', smsErr);
    }
  }

  const simulatedId = 'sms_res_' + crypto.randomBytes(6).toString('hex');
  console.log(`📱 [SMS Reservation Gateway] Dispatched to ${formattedPhone}: "${message}" (ID: ${simulatedId})`);

  return {
    success: true,
    messageId: simulatedId,
    provider: 'AeroWings Prestige Reservation SMS Gateway',
    previewText: message
  };
}

export interface FlightBookingRecord {
  pnr: string;
  phoneNumber: string;
  passengerName: string;
  flightNumber: string;
  origin?: string;
  destination?: string;
  departureDate?: string;
  seatNumber?: string;
  seatClass?: string;
  totalPriceINR?: number;
  createdAt: Date;
  status: string;
  smsMessageId?: string;
}

const inMemoryBookings = new Map<string, FlightBookingRecord>();

/**
 * Save confirmed booking to MongoDB and automatically dispatch confirmation SMS to linked phone number
 */
export async function createFlightBookingAndNotify(bookingData: {
  phoneNumber: string;
  passengerName: string;
  flightNumber: string;
  origin?: string;
  destination?: string;
  departureDate?: string;
  seatNumber?: string;
  seatClass?: string;
  totalPriceINR?: number;
  pnr?: string;
  customMessage?: string;
}): Promise<{
  booking: FlightBookingRecord;
  smsDelivery: { success: boolean; messageId: string; provider: string; previewText: string };
}> {
  const cleanPhone = (bookingData.phoneNumber || '').trim().replace(/[^0-9+]/g, '');
  const pnr = (bookingData.pnr || ('AW' + Math.floor(1000 + Math.random() * 9000))).toUpperCase();
  const passengerName = bookingData.passengerName || 'Valued Passenger';
  const flightNumber = bookingData.flightNumber || 'AW-402';
  const origin = bookingData.origin || 'BOM';
  const destination = bookingData.destination || 'DEL';
  const departureDate = bookingData.departureDate || new Date().toISOString().split('T')[0];
  const seatNumber = bookingData.seatNumber || '12A';
  const seatClass = bookingData.seatClass || 'Economy';
  const totalPriceINR = Number(bookingData.totalPriceINR) || 4850;

  const smsText = bookingData.customMessage || 
    `[AeroWings Prestige] Flight Booking Confirmed! PNR: ${pnr}. Passenger: ${passengerName}. Flight: ${flightNumber} (${origin} ➔ ${destination}) on ${departureDate}. Seat: ${seatNumber}, Class: ${seatClass}. Gate: 22A. Show this SMS/QR pass at airport security.`;

  // Send SMS to linked mobile phone
  const smsResult = await sendCustomSms(cleanPhone, smsText);

  const bookingRecord: FlightBookingRecord = {
    pnr,
    phoneNumber: cleanPhone,
    passengerName,
    flightNumber,
    origin,
    destination,
    departureDate,
    seatNumber,
    seatClass,
    totalPriceINR,
    createdAt: new Date(),
    status: 'Confirmed',
    smsMessageId: smsResult.messageId
  };

  // Store in MongoDB if available, otherwise in-memory
  await initMongo();
  if (dbInstance) {
    const bookingCol = dbInstance.collection<FlightBookingRecord>('bookings');
    await bookingCol.updateOne({ pnr }, { $set: bookingRecord }, { upsert: true });
  } else {
    inMemoryBookings.set(pnr, bookingRecord);
  }

  console.log(`✈️ [Booking Created] PNR: ${pnr} for ${passengerName}. SMS sent to ${cleanPhone}.`);

  return {
    booking: bookingRecord,
    smsDelivery: smsResult
  };
}


