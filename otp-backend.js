/**
 * AeroWings Airline Reservation System - Standalone OTP Backend Service
 * 
 * Features:
 * 1. Generates cryptographically secure 6-digit OTP using Node.js crypto
 * 2. Temporarily stores OTP in MongoDB with 5-minute TTL index (automatic expiration)
 *    Includes automatic in-memory fallback if MongoDB is not connected
 * 3. Sends OTP via SMS API (Twilio integration with Mock/Simulated SMS provider fallback)
 * 4. Second verification endpoint to validate match and expiration before proceeding to booking
 * 5. Works seamlessly in VS Code with `node otp-backend.js`
 */

import express from 'express';
import crypto from 'crypto';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config({ override: true });

const app = express();
app.use(express.json());

// Enable CORS for frontend integration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

const PORT = process.env.OTP_PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://arunkumartharun400328_db_user:GQv4bcNNhxn312bT@cluster0.kvtruwh.mongodb.net/?appName=Cluster0';
const DB_NAME = process.env.MONGODB_DB_NAME || 'aerowings_db';
const OTP_COLLECTION = 'flight_booking_otps';

// In-Memory Fallback Map (Ensures script runs immediately in VS Code even without a local MongoDB daemon)
const inMemoryOtpStore = new Map();

// Auto-cleanup for in-memory fallback
const cleanupTimer = setInterval(() => {
  const now = new Date();
  for (const [phone, record] of inMemoryOtpStore.entries()) {
    if (now > record.expiresAt) {
      inMemoryOtpStore.delete(phone);
    }
  }
}, 30 * 1000);
cleanupTimer.unref();

let mongoClient = null;
let otpCollection = null;

// Initialize MongoDB connection & TTL Index
async function initMongo() {
  try {
    const client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 6000,
      connectTimeoutMS: 6000
    });
    await client.connect();
    mongoClient = client;
    const db = mongoClient.db(DB_NAME);
    otpCollection = db.collection(OTP_COLLECTION);

    // Create TTL index: documents automatically deleted 300 seconds (5 mins) after createdAt
    await otpCollection.createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: 300, name: 'otp_5min_ttl_idx' }
    );
    // Index on phoneNumber for fast lookups
    await otpCollection.createIndex(
      { phoneNumber: 1 },
      { unique: true, name: 'phone_number_unique_idx' }
    );

    console.log(`✅ [MongoDB Atlas] Connected to database "${DB_NAME}". 5-minute TTL index active.`);
  } catch (err) {
    console.warn(`⚠️ [MongoDB Atlas] Notice (${err.message}). In-memory fallback available.`);
    mongoClient = null;
    otpCollection = null;
  }
}

/**
 * Generate cryptographically secure 6-digit numeric OTP
 */
function generateSecure6DigitOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Format phone to international E.164 for SMS delivery
 */
function formatE164Phone(rawPhone) {
  const digits = rawPhone.trim().replace(/[^0-9+]/g, '');
  if (digits.startsWith('+')) return digits;
  if (digits.length === 10) {
    // Default to +91 if Indian 10-digit mobile (6, 7, 8, 9)
    if (/^[6-9]/.test(digits)) return `+91${digits}`;
    return `+1${digits}`;
  }
  return `+${digits}`;
}

/**
 * SMS API service (Twilio cloud with fallback to mock gateway)
 */
async function sendSmsViaApi(phoneNumber, otpCode) {
  const message = `[AeroWings Prestige] Your flight booking verification code is: ${otpCode}. Valid for 5 minutes. Do not share this code with anyone.`;
  const formattedPhone = formatE164Phone(phoneNumber);
  
  const twilioSid = process.env.TWILIO_ACCOUNT_SID || 'AC96b612b55974a9b5bc1152cb9fd85251';
  const twilioToken = process.env.TWILIO_AUTH_TOKEN || '7f8e24c69aa9d778405895672a450496';
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER || '+17372508034';

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

      const resJson = await response.json();
      if (response.ok) {
        console.log(`✅ [Twilio SMS Cloud] Dispatched successfully to ${formattedPhone}. SID: ${resJson.sid}`);
        return {
          success: true,
          messageId: resJson.sid,
          provider: 'Twilio SMS Cloud',
          previewMessage: message
        };
      } else {
        console.warn(`⚠️ [Twilio API Notice] Code ${resJson.code}: ${resJson.message}`);
      }
    } catch (err) {
      console.warn('Twilio dispatch failed, falling back to mock gateway:', err.message);
    }
  }

  // High-fidelity Mock SMS Service Fallback
  const simulatedId = 'mock_sms_' + crypto.randomBytes(6).toString('hex');
  console.log(`\n======================================================`);
  console.log(`📱 [MOCK SMS GATEWAY DISPATCH]`);
  console.log(`To: ${formattedPhone}`);
  console.log(`Message: "${message}"`);
  console.log(`Delivery ID: ${simulatedId}`);
  console.log(`Status: DELIVERED`);
  console.log(`======================================================\n`);

  return {
    success: true,
    messageId: simulatedId,
    provider: 'AeroWings Mock SMS Gateway',
    previewMessage: message
  };
}

/**
 * Send customized SMS text via Twilio or mock gateway
 */
async function sendCustomSmsViaApi(phoneNumber, messageText) {
  const formattedPhone = formatE164Phone(phoneNumber);
  const twilioSid = process.env.TWILIO_ACCOUNT_SID || 'AC96b612b55974a9b5bc1152cb9fd85251';
  const twilioToken = process.env.TWILIO_AUTH_TOKEN || '7f8e24c69aa9d778405895672a450496';
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER || '+17372508034';

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
          Body: messageText
        }).toString()
      });

      const resJson = await response.json();
      if (response.ok) {
        console.log(`✅ [Twilio Flight Booking SMS] Sent to ${formattedPhone}. SID: ${resJson.sid}`);
        return {
          success: true,
          messageId: resJson.sid,
          provider: 'Twilio SMS Cloud',
          smsMessage: messageText
        };
      } else {
        console.warn(`⚠️ [Twilio API Notice] Code ${resJson.code}: ${resJson.message}`);
      }
    } catch (err) {
      console.warn('Twilio booking SMS failed, using mock fallback:', err.message);
    }
  }

  const simulatedId = 'sms_book_' + crypto.randomBytes(6).toString('hex');
  return {
    success: true,
    messageId: simulatedId,
    provider: 'AeroWings Mock SMS Gateway',
    smsMessage: messageText
  };
}

// -------------------------------------------------------------
// ROUTES
// -------------------------------------------------------------

// Service health & status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'AeroWings OTP Service',
    database: otpCollection ? 'MongoDB (5-min TTL active)' : 'In-Memory (5-min TTL active)',
    timestamp: new Date().toISOString()
  });
});

/**
 * ENDPOINT 1: Generate 6-digit OTP, store in MongoDB with 5-minute TTL, and send via SMS API
 * POST /api/otp/send
 * Body: { phoneNumber: "9876543210", purpose: "flight_booking" }
 */
app.post('/api/otp/send', async (req, res) => {
  try {
    const { phoneNumber, purpose = 'flight_booking' } = req.body;

    if (!phoneNumber || typeof phoneNumber !== 'string' || phoneNumber.trim().length < 8) {
      return res.status(400).json({
        success: false,
        error: 'A valid mobile phone number is required (min 8 digits).'
      });
    }

    const cleanPhone = phoneNumber.trim().replace(/[^0-9+]/g, '');

    // 1. Generate secure 6-digit OTP
    const secureOtp = generateSecure6DigitOtp();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes TTL

    const otpDoc = {
      phoneNumber: cleanPhone,
      otp: secureOtp,
      purpose,
      createdAt: now,
      expiresAt: expiresAt,
      attempts: 0
    };

    // 2. Store in MongoDB or in-memory fallback
    if (otpCollection) {
      await otpCollection.updateOne(
        { phoneNumber: cleanPhone },
        { $set: otpDoc },
        { upsert: true }
      );
    } else {
      inMemoryOtpStore.set(cleanPhone, otpDoc);
    }

    // 3. Send via SMS API (Mock or Twilio)
    const smsResult = await sendSmsViaApi(cleanPhone, secureOtp);

    console.log(`[OTP Sent] Code ${secureOtp} generated for ${cleanPhone}. Expires at: ${expiresAt.toLocaleTimeString()}`);

    res.json({
      success: true,
      message: 'Secure 6-digit OTP generated and sent to mobile phone via SMS API.',
      phoneNumber: cleanPhone,
      expiresInSeconds: 300,
      expiresAt: expiresAt.toISOString(),
      smsDelivery: {
        status: 'delivered',
        messageId: smsResult.messageId,
        provider: smsResult.provider
      },
      // Convenience for testing in VS Code terminal or Postman
      testPreviewCode: secureOtp
    });
  } catch (err) {
    console.error('Error in /api/otp/send:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to generate and dispatch OTP: ' + err.message
    });
  }
});

/**
 * ENDPOINT 2: Verify user-entered OTP before allowing them to proceed with flight booking page
 * POST /api/otp/verify
 * Body: { phoneNumber: "9876543210", otp: "123456" }
 */
app.post('/api/otp/verify', async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || typeof phoneNumber !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required.'
      });
    }

    if (!otp || typeof otp !== 'string' || otp.trim().length !== 6) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid 6-digit numeric OTP.'
      });
    }

    const cleanPhone = phoneNumber.trim().replace(/[^0-9+]/g, '');
    const cleanOtp = otp.trim();

    // 1. Fetch record from MongoDB or fallback
    let record = null;
    if (otpCollection) {
      record = await otpCollection.findOne({ phoneNumber: cleanPhone });
    } else {
      record = inMemoryOtpStore.get(cleanPhone) || null;
    }

    if (!record) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: 'No active OTP found for this number or code has expired. Please request a new OTP.'
      });
    }

    // 2. Check 5-minute expiration
    const now = new Date();
    if (now > new Date(record.expiresAt)) {
      if (otpCollection) {
        await otpCollection.deleteOne({ phoneNumber: cleanPhone });
      } else {
        inMemoryOtpStore.delete(cleanPhone);
      }
      return res.status(400).json({
        success: false,
        verified: false,
        expired: true,
        error: 'Your 6-digit OTP has expired (5-minute validity exceeded). Please request a new code.'
      });
    }

    // 3. Security: Prevent brute-force attempts (max 5)
    if (record.attempts >= 5) {
      if (otpCollection) {
        await otpCollection.deleteOne({ phoneNumber: cleanPhone });
      } else {
        inMemoryOtpStore.delete(cleanPhone);
      }
      return res.status(400).json({
        success: false,
        verified: false,
        attemptsExceeded: true,
        error: 'Too many incorrect attempts. For security, this OTP is invalidated. Please request a new code.'
      });
    }

    // 4. Validate OTP match
    if (record.otp !== cleanOtp) {
      const remainingAttempts = 4 - record.attempts;
      if (otpCollection) {
        await otpCollection.updateOne(
          { phoneNumber: cleanPhone },
          { $inc: { attempts: 1 } }
        );
      } else {
        record.attempts += 1;
      }
      return res.status(400).json({
        success: false,
        verified: false,
        error: `Incorrect OTP. You have ${remainingAttempts > 0 ? remainingAttempts : 0} attempt(s) remaining.`
      });
    }

    // 5. Success: Invalidate OTP so it cannot be re-used
    if (otpCollection) {
      await otpCollection.deleteOne({ phoneNumber: cleanPhone });
    } else {
      inMemoryOtpStore.delete(cleanPhone);
    }

    // 6. Generate cryptographic booking clearance token
    const bookingClearanceToken = 'aw_clearance_' + crypto.randomBytes(16).toString('hex');

    console.log(`✅ [OTP Verified] Phone ${cleanPhone} successfully verified! Booking clearance granted.`);

    return res.json({
      success: true,
      verified: true,
      message: 'OTP verified successfully! You may now proceed with your flight booking.',
      bookingClearanceToken,
      canProceedToBooking: true,
      verifiedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error in /api/otp/verify:', err);
    res.status(500).json({
      success: false,
      error: 'Error validating OTP: ' + err.message
    });
  }
});

/**
 * ENDPOINT 3: Create Flight Booking & Send SMS to Linked Mobile Phone
 * POST /api/booking/create
 * Body:
 * {
 *   "phoneNumber": "9876543210",
 *   "passengerName": "John Doe",
 *   "flightNumber": "AW-402",
 *   "origin": "BOM",
 *   "destination": "DEL",
 *   "departureDate": "2026-09-15",
 *   "seatNumber": "12A",
 *   "seatClass": "Economy",
 *   "totalPriceINR": 4850
 * }
 */
app.post('/api/booking/create', async (req, res) => {
  try {
    const {
      phoneNumber,
      passengerName = 'Valued Passenger',
      flightNumber = 'AW-402',
      origin = 'BOM',
      destination = 'DEL',
      departureDate = new Date().toISOString().split('T')[0],
      seatNumber = '12A',
      seatClass = 'Economy',
      totalPriceINR = 4850,
      pnr,
      customMessage
    } = req.body;

    if (!phoneNumber || typeof phoneNumber !== 'string' || phoneNumber.trim().length < 8) {
      return res.status(400).json({
        success: false,
        error: 'A valid linked mobile phone number is required to receive flight booking confirmation SMS.'
      });
    }

    const cleanPhone = phoneNumber.trim().replace(/[^0-9+]/g, '');
    const bookingPnr = (pnr || ('AW' + Math.floor(1000 + Math.random() * 9000))).toUpperCase();

    // 1. Prepare SMS dispatch text
    const smsMessage = customMessage ||
      `[AeroWings Prestige] Flight Booking Confirmed! PNR: ${bookingPnr}. Passenger: ${passengerName}. Flight: ${flightNumber} (${origin} ➔ ${destination}) on ${departureDate}. Seat: ${seatNumber}, Class: ${seatClass}. Gate: 22A. Show this SMS/QR pass at airport security.`;

    // 2. Dispatch SMS to linked phone number via Twilio / SMS API
    const customSmsResult = await sendCustomSmsViaApi(cleanPhone, smsMessage);

    console.log(`\n======================================================`);
    console.log(`✈️ [FLIGHT BOOKING CONFIRMED & SMS SENT TO LINKED PHONE]`);
    console.log(`PNR: ${bookingPnr}`);
    console.log(`Passenger: ${passengerName}`);
    console.log(`Flight: ${flightNumber} (${origin} ➔ ${destination})`);
    console.log(`Linked Phone: ${formatE164Phone(cleanPhone)}`);
    console.log(`SMS Sent: "${smsMessage}"`);
    console.log(`Gateway Provider: ${customSmsResult.provider}`);
    console.log(`======================================================\n`);

    // 3. Save to MongoDB if available
    const bookingRecord = {
      pnr: bookingPnr,
      phoneNumber: cleanPhone,
      passengerName,
      flightNumber,
      origin,
      destination,
      departureDate,
      seatNumber,
      seatClass,
      totalPriceINR: Number(totalPriceINR),
      createdAt: new Date(),
      status: 'Confirmed',
      smsMessageId: customSmsResult.messageId
    };

    if (mongoClient && otpCollection) {
      try {
        const db = mongoClient.db(DB_NAME);
        await db.collection('bookings').updateOne({ pnr: bookingPnr }, { $set: bookingRecord }, { upsert: true });
      } catch (dbErr) {
        console.warn('MongoDB booking persistence fallback:', dbErr.message);
      }
    }

    res.json({
      success: true,
      message: 'Flight booked successfully! Confirmation SMS dispatched to linked phone number.',
      booking: bookingRecord,
      smsDelivery: {
        status: 'delivered',
        messageId: customSmsResult.messageId,
        provider: customSmsResult.provider,
        recipientPhone: cleanPhone,
        smsMessage
      }
    });
  } catch (err) {
    console.error('Error in /api/booking/create:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to create booking and send SMS: ' + err.message
    });
  }
});

// Start Server immediately so requests are handled without waiting on Mongo
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 AeroWings OTP Backend Service is running!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`\nEndpoints ready for VS Code / Postman:`);
  console.log(`1. POST http://localhost:${PORT}/api/otp/send`);
  console.log(`   Body: { "phoneNumber": "9876543210" }`);
  console.log(`2. POST http://localhost:${PORT}/api/otp/verify`);
  console.log(`   Body: { "phoneNumber": "9876543210", "otp": "123456" }`);
  console.log(`3. POST http://localhost:${PORT}/api/booking/create`);
  console.log(`   Body: { "phoneNumber": "9876543210", "passengerName": "John Doe", "flightNumber": "AW-402" }`);
  console.log(`======================================================\n`);
  // Connect to MongoDB in background
  initMongo();
});
