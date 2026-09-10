/**
 * AeroWings MongoDB Persistence Service
 * 
 * Provides production-grade database models and persistence for:
 * 1. Flight Bookings (collection: `bookings`)
 * 2. User Registrations (collection: `users`)
 * 3. Ticket Details & Boarding Passes (collection: `tickets`)
 * 4. Verification OTPs (collection: `flight_booking_otps`)
 * 
 * Includes index creation, typed models, query builders, and seamless 
 * memory fallback if MongoDB URI is being configured.
 */

import { MongoClient, Db, Collection, ObjectId } from 'mongodb';

// ==========================================
// 1. DATA MODELS & SCHEMAS
// ==========================================

export interface PassengerDetail {
  title?: string;
  firstName: string;
  lastName: string;
  gender?: string;
  age?: number;
  type?: 'Adult' | 'Child' | 'Infant' | 'Senior' | 'Student';
  seat: string;
  ticketNumber?: string;
  passportNumber?: string;
  mealPreference?: string;
  baggageWeightKg?: number;
}

export interface FlightBookingModel {
  _id?: ObjectId | string;
  pnr: string;
  ticketNumber?: string;
  flightNumber: string;
  airline: string;
  origin: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  passengers: PassengerDetail[];
  passengerName: string; // Primary passenger or lead traveler
  seatNumbers: string[];
  seatClass: string;
  totalPriceINR: number;
  contactEmail: string;
  contactPhone: string;
  status: 'Confirmed' | 'Checked-In' | 'Boarded' | 'Cancelled' | 'Refunded';
  paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED';
  paymentMethod?: string;
  gate?: string;
  terminal?: string;
  baggageAllowance?: string;
  smsSent?: boolean;
  smsMessageId?: string;
  createdAt: Date;
  updatedAt: Date;
  source?: 'web_portal' | 'ai_concierge' | 'mobile_agent' | 'counter';
}

export interface UserModel {
  _id?: ObjectId | string;
  fullName: string;
  email: string;
  phoneNumber: string;
  frequentFlyerNumber?: string;
  tier?: 'Silver' | 'Gold' | 'Platinum' | 'Prestige Club';
  milesBalance?: number;
  registeredAt: Date;
  updatedAt: Date;
  isActive: boolean;
  metadata?: Record<string, any>;
}

export interface TicketModel {
  _id?: ObjectId | string;
  ticketNumber: string; // e.g. "AW-ETK-948210"
  pnr: string;
  passengerName: string;
  flightNumber: string;
  airline: string;
  origin: string;
  destination: string;
  route: string;
  departureDate: string;
  departureTime: string;
  seatNumber: string;
  seatClass: string;
  gate: string;
  terminal: string;
  boardingGroup: string;
  boardingTime: string;
  barcodeHash: string;
  status: 'ISSUED' | 'CHECKED_IN' | 'BOARDED' | 'CANCELLED';
  issuedAt: Date;
  updatedAt: Date;
}

// ==========================================
// 2. MONGO CLIENT & CONNECTION MANAGEMENT
// ==========================================

let mongoClient: MongoClient | null = null;
let dbInstance: Db | null = null;
let isConnecting = false;

// Fallback in-memory arrays when MongoDB is disconnected or testing offline
const memoryBookings = new Map<string, FlightBookingModel>();
const memoryUsers = new Map<string, UserModel>();
const memoryTickets = new Map<string, TicketModel>();

/**
 * Connect to MongoDB using process.env.MONGODB_URI
 */
export async function connectToMongo(): Promise<Db | null> {
  if (dbInstance) {
    return dbInstance;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('ℹ️ [MongoDB] MONGODB_URI not set. Operating in memory-backed mode.');
    return null;
  }

  if (isConnecting) {
    return null;
  }

  isConnecting = true;
  try {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 6000,
      connectTimeoutMS: 6000
    });

    await client.connect();
    mongoClient = client;
    const dbName = process.env.MONGODB_DB_NAME || 'aerowings_db';
    dbInstance = mongoClient.db(dbName);

    console.log(`✅ [MongoDB Connected] Database: "${dbName}". Initializing schema indexes...`);

    // Ensure collections and unique indexes
    const bookingsColl = dbInstance.collection<FlightBookingModel>('bookings');
    await bookingsColl.createIndex({ pnr: 1 }, { unique: true });
    await bookingsColl.createIndex({ contactPhone: 1 });
    await bookingsColl.createIndex({ contactEmail: 1 });
    await bookingsColl.createIndex({ createdAt: -1 });

    const usersColl = dbInstance.collection<UserModel>('users');
    await usersColl.createIndex({ email: 1 }, { unique: true });
    await usersColl.createIndex({ phoneNumber: 1 });

    const ticketsColl = dbInstance.collection<TicketModel>('tickets');
    await ticketsColl.createIndex({ ticketNumber: 1 }, { unique: true });
    await ticketsColl.createIndex({ pnr: 1 });

    console.log(`✅ [MongoDB Indexes Active] Bookings (PNR unique), Users (Email unique), Tickets (ETK unique).`);
    return dbInstance;
  } catch (err: any) {
    console.warn('⚠️ [MongoDB Connection Notice]:', err?.message || err);
    return null;
  } finally {
    isConnecting = false;
  }
}

export function getDatabase(): Db | null {
  return dbInstance;
}

// ==========================================
// 3. FLIGHT BOOKING SERVICE METHODS
// ==========================================

export async function saveFlightBooking(
  bookingInput: Omit<FlightBookingModel, 'createdAt' | 'updatedAt'> & { createdAt?: Date; updatedAt?: Date }
): Promise<FlightBookingModel> {
  const now = new Date();
  const booking: FlightBookingModel = {
    ...bookingInput,
    createdAt: bookingInput.createdAt || now,
    updatedAt: now
  };

  const db = await connectToMongo();
  if (db) {
    try {
      const coll = db.collection<FlightBookingModel>('bookings');
      await coll.updateOne(
        { pnr: booking.pnr },
        { $set: booking },
        { upsert: true }
      );
      console.log(`💾 [MongoDB Saved] Booking PNR: ${booking.pnr} for ${booking.passengerName}`);
    } catch (err: any) {
      console.error('Failed to save booking to MongoDB:', err?.message || err);
    }
  }

  // Also sync memory store for immediate fast queries
  memoryBookings.set(booking.pnr, booking);
  return booking;
}

export async function getBookingByPnr(pnr: string): Promise<FlightBookingModel | null> {
  if (!pnr) return null;
  const cleanPnr = pnr.trim().toUpperCase();

  const db = await connectToMongo();
  if (db) {
    try {
      const coll = db.collection<FlightBookingModel>('bookings');
      const found = await coll.findOne({ pnr: cleanPnr });
      if (found) return found;
    } catch (err: any) {
      console.warn('MongoDB booking query error, falling back to cache:', err?.message);
    }
  }

  return memoryBookings.get(cleanPnr) || null;
}

export async function getAllBookings(limit = 100): Promise<FlightBookingModel[]> {
  const db = await connectToMongo();
  if (db) {
    try {
      const coll = db.collection<FlightBookingModel>('bookings');
      const list = await coll.find({}).sort({ createdAt: -1 }).limit(limit).toArray();
      if (list.length > 0) return list;
    } catch (err: any) {
      console.warn('MongoDB list bookings error, fallback to cache:', err?.message);
    }
  }

  return Array.from(memoryBookings.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function searchBookings(query: string): Promise<FlightBookingModel[]> {
  const q = query.trim();
  if (!q) return [];

  const db = await connectToMongo();
  if (db) {
    try {
      const coll = db.collection<FlightBookingModel>('bookings');
      const list = await coll.find({
        $or: [
          { pnr: { $regex: q, $options: 'i' } },
          { contactPhone: { $regex: q, $options: 'i' } },
          { contactEmail: { $regex: q, $options: 'i' } },
          { passengerName: { $regex: q, $options: 'i' } }
        ]
      }).toArray();
      if (list.length > 0) return list;
    } catch (err: any) {
      console.warn('MongoDB search query fallback:', err?.message);
    }
  }

  const clean = q.toLowerCase();
  return Array.from(memoryBookings.values()).filter(b => 
    b.pnr.toLowerCase().includes(clean) ||
    b.contactPhone.toLowerCase().includes(clean) ||
    b.contactEmail.toLowerCase().includes(clean) ||
    b.passengerName.toLowerCase().includes(clean)
  );
}

// ==========================================
// 4. USER REGISTRATION SERVICE METHODS
// ==========================================

export async function registerUser(
  userInput: Omit<UserModel, 'registeredAt' | 'updatedAt' | 'isActive'> & {
    registeredAt?: Date;
    updatedAt?: Date;
    isActive?: boolean;
  }
): Promise<UserModel> {
  const now = new Date();
  const cleanEmail = userInput.email.trim().toLowerCase();
  const cleanPhone = userInput.phoneNumber.trim();

  // Generate frequent flyer number if not provided
  const frequentFlyerId = userInput.frequentFlyerNumber || 
    `AW-FF-${Math.floor(100000 + Math.random() * 900000)}`;

  const user: UserModel = {
    ...userInput,
    email: cleanEmail,
    phoneNumber: cleanPhone,
    frequentFlyerNumber: frequentFlyerId,
    tier: userInput.tier || 'Silver',
    milesBalance: userInput.milesBalance ?? 1500,
    isActive: userInput.isActive ?? true,
    registeredAt: userInput.registeredAt || now,
    updatedAt: now
  };

  const db = await connectToMongo();
  if (db) {
    try {
      const coll = db.collection<UserModel>('users');
      await coll.updateOne(
        { email: cleanEmail },
        { $set: user },
        { upsert: true }
      );
      console.log(`👤 [MongoDB Saved] User Registered: ${user.fullName} (${user.email})`);
    } catch (err: any) {
      console.error('Failed to save user to MongoDB:', err?.message || err);
    }
  }

  memoryUsers.set(cleanEmail, user);
  return user;
}

export async function findUserByEmailOrPhone(query: string): Promise<UserModel | null> {
  const clean = query.trim().toLowerCase();
  const db = await connectToMongo();
  if (db) {
    try {
      const coll = db.collection<UserModel>('users');
      const found = await coll.findOne({
        $or: [
          { email: clean },
          { phoneNumber: query.trim() }
        ]
      });
      if (found) return found;
    } catch (err: any) {
      console.warn('MongoDB find user error:', err?.message);
    }
  }

  return memoryUsers.get(clean) || 
    Array.from(memoryUsers.values()).find(u => u.phoneNumber === query.trim()) || null;
}

export async function getAllUsers(limit = 100): Promise<UserModel[]> {
  const db = await connectToMongo();
  if (db) {
    try {
      const coll = db.collection<UserModel>('users');
      const list = await coll.find({}).sort({ registeredAt: -1 }).limit(limit).toArray();
      if (list.length > 0) return list;
    } catch (err: any) {
      console.warn('MongoDB list users error:', err?.message);
    }
  }

  return Array.from(memoryUsers.values());
}

// ==========================================
// 5. TICKET ISSUANCE & QUERY METHODS
// ==========================================

export async function issueTicket(
  ticketInput: Omit<TicketModel, 'issuedAt' | 'updatedAt'> & { issuedAt?: Date; updatedAt?: Date }
): Promise<TicketModel> {
  const now = new Date();
  const ticket: TicketModel = {
    ...ticketInput,
    issuedAt: ticketInput.issuedAt || now,
    updatedAt: now
  };

  const db = await connectToMongo();
  if (db) {
    try {
      const coll = db.collection<TicketModel>('tickets');
      await coll.updateOne(
        { ticketNumber: ticket.ticketNumber },
        { $set: ticket },
        { upsert: true }
      );
      console.log(`🎫 [MongoDB Saved] Ticket Issued: #${ticket.ticketNumber} for PNR ${ticket.pnr}`);
    } catch (err: any) {
      console.error('Failed to save ticket to MongoDB:', err?.message || err);
    }
  }

  memoryTickets.set(ticket.ticketNumber, ticket);
  return ticket;
}

export async function getTicketByIdentifier(identifier: string): Promise<TicketModel | null> {
  if (!identifier) return null;
  const clean = identifier.trim().toUpperCase();

  const db = await connectToMongo();
  if (db) {
    try {
      const coll = db.collection<TicketModel>('tickets');
      const found = await coll.findOne({
        $or: [
          { ticketNumber: clean },
          { pnr: clean }
        ]
      });
      if (found) return found;
    } catch (err: any) {
      console.warn('MongoDB ticket query error:', err?.message);
    }
  }

  return memoryTickets.get(clean) || 
    Array.from(memoryTickets.values()).find(t => t.pnr.toUpperCase() === clean) || null;
}

export async function getAllTickets(limit = 100): Promise<TicketModel[]> {
  const db = await connectToMongo();
  if (db) {
    try {
      const coll = db.collection<TicketModel>('tickets');
      const list = await coll.find({}).sort({ issuedAt: -1 }).limit(limit).toArray();
      if (list.length > 0) return list;
    } catch (err: any) {
      console.warn('MongoDB list tickets error:', err?.message);
    }
  }

  return Array.from(memoryTickets.values());
}
