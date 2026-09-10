/**
 * AeroWings Airline Unified Persistent Database Manager
 * Handles local & indexed persistence for bookings, flights, passenger profiles,
 * SMS notifications log, and AI chat memory.
 */

import { Booking, Flight, Passenger } from '../types/airline';
import { INITIAL_FLIGHTS, SAMPLE_BOOKINGS } from '../data/mockData';

export interface SmsRecord {
  id: string;
  phoneNumber: string;
  type: 'OTP' | 'BOOKING_CONFIRMATION' | 'GATE_UPDATE' | 'WEATHER_ALERT' | 'REFUND' | 'BOARDING_PASS' | 'FLIGHT_DELAY' | 'PROMO' | 'STATUS_ALERT';
  title: string;
  body: string;
  timestamp: string;
  otpCode?: string;
  pnr?: string;
  isRead: boolean;
}

export interface EmailRecord {
  id: string;
  recipientEmail: string;
  sender: string;
  subject: string;
  previewText: string;
  htmlBody?: string;
  timestamp: string;
  pnr?: string;
  type: 'TICKET_CONFIRMATION' | 'REFUND_RECEIPT' | 'WEATHER_DISRUPTION' | 'GATE_UPDATE' | 'OTP' | 'GENERAL' | 'BOARDING_PASS' | 'STATUS_ALERT' | 'PROMO';
  isRead: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggestions?: string[];
  action?: {
    type: 'search_flight' | 'view_pnr' | 'view_baggage' | 'view_weather' | 'check_in';
    payload: any;
    label: string;
  };
  detectedTypo?: {
    original: string;
    suggested: string;
    reason: string;
  };
}

const DB_KEYS = {
  FLIGHTS: 'aerowings_db_flights_v6',
  BOOKINGS: 'aerowings_db_bookings_v6',
  SMS: 'aerowings_db_sms_v6',
  EMAIL: 'aerowings_db_email_v6',
  CHAT: 'aerowings_db_chat_v6',
  PROFILE: 'aerowings_db_profile_v6',
  SEARCH_HISTORY: 'aerowings_db_searches_v6'
};

export const airlineDB = {
  // --- Flights Table ---
  getFlights(): Flight[] {
    try {
      const data = localStorage.getItem(DB_KEYS.FLIGHTS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed reading flights DB', e);
    }
    return INITIAL_FLIGHTS;
  },

  saveFlights(flights: Flight[]): void {
    try {
      localStorage.setItem(DB_KEYS.FLIGHTS, JSON.stringify(flights));
    } catch (e) {
      console.error('Failed saving flights DB', e);
    }
  },

  // --- Bookings Table ---
  getBookings(): Booking[] {
    try {
      const data = localStorage.getItem(DB_KEYS.BOOKINGS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed reading bookings DB', e);
    }
    return SAMPLE_BOOKINGS;
  },

  saveBookings(bookings: Booking[]): void {
    try {
      localStorage.setItem(DB_KEYS.BOOKINGS, JSON.stringify(bookings));
    } catch (e) {
      console.error('Failed saving bookings DB', e);
    }
  },

  addBooking(booking: Booking): void {
    const current = this.getBookings();
    const updated = [booking, ...current.filter(b => b.pnr !== booking.pnr)];
    this.saveBookings(updated);
  },

  findBookingByPnr(pnr: string): Booking | undefined {
    if (!pnr) return undefined;
    const clean = pnr.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const bookings = this.getBookings();
    return bookings.find(b => {
      const bPnr = b.pnr.toUpperCase().replace(/[^A-Z0-9]/g, '');
      const bId = b.id.toUpperCase().replace(/[^A-Z0-9]/g, '');
      const bTicket = (b.ticketNumber || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      return bPnr === clean || bId === clean || bTicket === clean || bPnr.includes(clean);
    });
  },

  findBookingsByPhoneOrEmail(query: string): Booking[] {
    const q = query.trim().toLowerCase().replace(/[\s+-]/g, '');
    if (!q) return [];
    const bookings = this.getBookings();
    return bookings.filter(b => {
      const cleanPhone = (b.contactPhone || '').replace(/[\s+-]/g, '').toLowerCase();
      const cleanEmail = (b.contactEmail || '').toLowerCase();
      const hasPaxName = b.passengers.some(p => 
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(query.toLowerCase())
      );
      return cleanPhone.includes(q) || cleanEmail.includes(query.toLowerCase()) || hasPaxName;
    });
  },

  // --- SMS Notifications Table ---
  getSmsLog(): SmsRecord[] {
    try {
      const data = localStorage.getItem(DB_KEYS.SMS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed reading SMS DB', e);
    }
    return [];
  },

  saveSmsLog(smsList: SmsRecord[]): void {
    try {
      localStorage.setItem(DB_KEYS.SMS, JSON.stringify(smsList.slice(0, 50)));
    } catch (e) {
      console.error('Failed saving SMS DB', e);
    }
  },

  addSms(record: Omit<SmsRecord, 'id' | 'timestamp' | 'isRead'>): SmsRecord {
    const newRecord: SmsRecord = {
      ...record,
      id: `SMS-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      isRead: false
    };
    const current = this.getSmsLog();
    const updated = [newRecord, ...current];
    this.saveSmsLog(updated);
    
    // Dispatch custom event for real-time live SMS toast/inbox
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aerowings_new_sms', { detail: newRecord }));
    }
    return newRecord;
  },

  // --- Email Notifications Table ---
  getEmailLog(): EmailRecord[] {
    try {
      const data = localStorage.getItem(DB_KEYS.EMAIL);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed reading Email DB', e);
    }
    return [
      {
        id: 'EMAIL-INIT-01',
        recipientEmail: localStorage.getItem('aerowings_linked_email') || 'arunkumartharun400328@gmail.com',
        sender: 'no-reply@aerowings.airline.com',
        subject: 'Welcome to AeroWings Airlines • Active Communications Link Confirmed',
        previewText: 'Your mobile number and email are now connected to real-time Doppler flight tracking, automated e-tickets, and weather protection alerts.',
        timestamp: 'Just now',
        type: 'GENERAL',
        isRead: false
      }
    ];
  },

  saveEmailLog(emailList: EmailRecord[]): void {
    try {
      localStorage.setItem(DB_KEYS.EMAIL, JSON.stringify(emailList.slice(0, 50)));
    } catch (e) {
      console.error('Failed saving Email DB', e);
    }
  },

  addEmail(record: Omit<EmailRecord, 'id' | 'timestamp' | 'isRead'>): EmailRecord {
    const newRecord: EmailRecord = {
      ...record,
      id: `EMAIL-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      isRead: false
    };
    const current = this.getEmailLog();
    const updated = [newRecord, ...current];
    this.saveEmailLog(updated);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aerowings_new_email', { detail: newRecord }));
    }
    return newRecord;
  },

  // --- AI Chat History Table ---
  getChatHistory(): ChatMessage[] {
    try {
      const data = localStorage.getItem(DB_KEYS.CHAT);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed reading Chat DB', e);
    }
    return [];
  },

  saveChatHistory(history: ChatMessage[]): void {
    try {
      localStorage.setItem(DB_KEYS.CHAT, JSON.stringify(history.slice(-40)));
    } catch (e) {
      console.error('Failed saving Chat DB', e);
    }
  },

  // --- Export / Import Full Database Backup ---
  exportDatabase(): string {
    const fullDb = {
      version: '6.0',
      exportedAt: new Date().toISOString(),
      flights: this.getFlights(),
      bookings: this.getBookings(),
      sms: this.getSmsLog(),
      profile: localStorage.getItem(DB_KEYS.PROFILE)
    };
    return JSON.stringify(fullDb, null, 2);
  },

  importDatabase(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.flights && Array.isArray(data.flights)) this.saveFlights(data.flights);
      if (data.bookings && Array.isArray(data.bookings)) this.saveBookings(data.bookings);
      if (data.sms && Array.isArray(data.sms)) this.saveSmsLog(data.sms);
      return true;
    } catch (e) {
      console.error('Failed importing DB', e);
      return false;
    }
  },

  clearDatabase(): void {
    localStorage.removeItem(DB_KEYS.FLIGHTS);
    localStorage.removeItem(DB_KEYS.BOOKINGS);
    localStorage.removeItem(DB_KEYS.SMS);
    localStorage.removeItem(DB_KEYS.CHAT);
  }
};
