import React, { createContext, useContext, useState, useEffect } from 'react';
import { Flight, Booking, FlightSearchParams, Passenger, Seat, Offer, Currency, FlightStatus, CabinClass, UserView, WeatherCondition, FlightNotification, NotificationPreferences, AiLanguageCode } from '../types/airline';
import { INITIAL_FLIGHTS, OFFERS, SAMPLE_BOOKINGS } from '../data/mockData';
import { CURRENCIES, generatePNR, generateTicketNumber } from '../utils/airlineUtils';
import { aiVoice } from '../utils/aiVoice';
import { airlineDB } from '../utils/airlineDatabase';
import { generateFlightsForRoute } from '../utils/flightRouteGenerator';
import { setAirportWeatherOverride, clearAirportWeatherOverrides, isAirportWeatherUnsafe } from '../utils/realtimeWeather';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  tier: 'Silver' | 'Gold' | 'Platinum';
  miles: number;
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AirlineContextType {
  // Multilingual AI Language
  aiLanguage: AiLanguageCode;
  setAiLanguage: (lang: AiLanguageCode) => void;

  // Navigation & Views
  portalMode: 'user' | 'admin';
  setPortalMode: (mode: 'user' | 'admin') => void;
  userView: UserView;
  setUserView: (view: UserView) => void;
  adminView: 'dashboard' | 'flights' | 'bookings' | 'analytics';
  setAdminView: (view: 'dashboard' | 'flights' | 'bookings' | 'analytics') => void;

  // Currency
  currency: Currency['code'];
  setCurrency: (code: Currency['code']) => void;

  // Flight database (Admin & Search)
  flights: Flight[];
  addFlight: (flight: Omit<Flight, 'id'>) => void;
  updateFlight: (id: string, updated: Partial<Flight>) => void;
  deleteFlight: (id: string) => void;
  updateFlightStatus: (id: string, status: FlightStatus, delayMinutes?: number) => void;
  resetDefaultFlights: () => void;

  // Search Engine State
  searchParams: FlightSearchParams;
  setSearchParams: React.Dispatch<React.SetStateAction<FlightSearchParams>>;
  performSearch: (params: FlightSearchParams) => void;

  // Booking Flow State
  selectedFlight: Flight | null;
  setSelectedFlight: (flight: Flight | null) => void;
  selectedReturnFlight: Flight | null;
  setSelectedReturnFlight: (flight: Flight | null) => void;
  passengers: Passenger[];
  setPassengers: React.Dispatch<React.SetStateAction<Passenger[]>>;
  updatePassenger: (index: number, updated: Partial<Passenger>) => void;
  selectedSeats: Record<number, Seat>; // passenger index -> Seat
  assignSeat: (passengerIndex: number, seat: Seat) => void;
  removeSeat: (passengerIndex: number) => void;
  hasInsurance: boolean;
  setHasInsurance: (val: boolean) => void;
  hasPriorityBoarding: boolean;
  setHasPriorityBoarding: (val: boolean) => void;
  appliedOffer: Offer | null;
  promoCode: string | null;
  discountAmount: number;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
  verifiedBookingPhone: string;
  setVerifiedBookingPhone: (phone: string) => void;
  calculateFareBreakdown: () => {
    originalBaseFare: number;
    baseFare: number;
    taxesAndFees: number;
    seatsTotal: number;
    mealsTotal: number;
    baggageTotal: number;
    insuranceTotal: number;
    priorityBoardingTotal: number;
    specialFareDiscount: number;
    specialFareType: 'regular' | 'student' | 'senior' | 'armed_forces' | 'doctors_nurses';
    specialFareLabel: string;
    extraFreeBaggageKg: number;
    couponDiscount: number;
    finalTotal: number;
  };
  completeBooking: (paymentMethod: 'card' | 'upi' | 'netbanking' | 'wallet', paymentId: string, contactEmail: string, contactPhone: string) => Booking;
  executeVoiceBooking: (details: {
    origin?: string;
    destination?: string;
    flightNumber?: string;
    passengerName?: string;
    recipientPhone?: string;
    seatClass?: string;
    seatNumber?: string;
    totalPriceINR?: number;
    smsMessage?: string;
  }) => Promise<Booking>;
  currentBookingSuccess: Booking | null;
  setCurrentBookingSuccess: (booking: Booking | null) => void;

  // Bookings repository
  bookings: Booking[];
  cancelBooking: (pnr: string, reason: string) => { success: boolean; refundAmount: number };
  instantWeatherRefund: (pnr: string) => { success: boolean; refundAmount: number };
  instantWeatherRebook: (pnr: string, targetFlightId: string) => { success: boolean; message: string };
  triggerWeatherDisruption: (airportCode: string, weatherType: WeatherCondition['condition'], severityLevel: 'normal' | 'moderate' | 'severe') => void;
  checkAndAutoCancelWeatherDisruptedBookings: () => void;
  aiAutoCancelFlight: (flightId: string, customReason?: string) => void;
  checkInBooking: (pnr: string) => boolean;
  getBookingByPNR: (pnr: string) => Booking | undefined;

  // Admin Auth
  isAdminAuthenticated: boolean;
  loginAdmin: (user: string, pass: string) => boolean;
  logoutAdmin: () => void;
  unlockAdminPortal: (secretId: string) => boolean;

  // User Profile
  userProfile: UserProfile;
  updateUserProfile: (profile: Partial<UserProfile>) => void;

  // Toast Alerts
  toasts: Toast[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Quick lookup state
  trackedPNR: string;
  setTrackedPNR: (pnr: string) => void;
  isTicketLookupOpen: boolean;
  setIsTicketLookupOpen: (open: boolean) => void;

  // Real-time SMS & Email Notification System
  notifications: FlightNotification[];
  notificationPreferences: NotificationPreferences;
  updateNotificationPreferences: (prefs: Partial<NotificationPreferences>) => void;
  sendFlightNotification: (notification: Omit<FlightNotification, 'id' | 'timestamp' | 'read'>) => void;
  simulateFlightStatusChange: (pnr: string, changeType: 'delay' | 'gate_change' | 'boarding' | 'weather' | 'baggage') => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;

  // Hands-Free AI Voice Mode & Wizard
  isVoiceModeActive: boolean;
  toggleVoiceMode: () => void;
  setVoiceMode: (active: boolean) => void;

  // Multi-City Itinerary Segments
  multiCitySegments: Array<{ origin: string; destination: string; departureDate: string }>;
  setMultiCitySegments: React.Dispatch<React.SetStateAction<Array<{ origin: string; destination: string; departureDate: string }>>>;

  // GST & Price Drop Protection
  hasGstNumber: boolean;
  setHasGstNumber: (has: boolean) => void;
  gstin: string;
  setGstin: (gstin: string) => void;
  companyName: string;
  setCompanyName: (name: string) => void;
  hasPriceDropProtection: boolean;
  setHasPriceDropProtection: (protect: boolean) => void;
}

const defaultSearchParams: FlightSearchParams = {
  tripType: 'one_way',
  origin: 'DEL',
  destination: 'BOM',
  departureDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
  cabinClass: 'economy',
  adults: 1,
  children: 0,
  infants: 0,
  specialFare: 'regular',
};

const AirlineContext = createContext<AirlineContextType | undefined>(undefined);

export const AirlineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Multilingual AI Voice Language State
  const [aiLanguage, setAiLanguageState] = useState<AiLanguageCode>(() => {
    return aiVoice.getLanguage();
  });

  const setAiLanguage = (lang: AiLanguageCode) => {
    setAiLanguageState(lang);
    aiVoice.setLanguage(lang);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aerowings_ai_language_sync', { detail: lang }));
    }
  };

  useEffect(() => {
    const handleWebsiteLangSync = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setAiLanguageState(customEvent.detail as AiLanguageCode);
        aiVoice.setLanguage(customEvent.detail as AiLanguageCode);
      }
    };
    window.addEventListener('aerowings_website_language_sync', handleWebsiteLangSync);
    return () => window.removeEventListener('aerowings_website_language_sync', handleWebsiteLangSync);
  }, []);

  // Portal & Views
  const [portalMode, setPortalMode] = useState<'user' | 'admin'>('user');
  const [userView, setUserView] = useState<UserView>('home');
  const [adminView, setAdminView] = useState<'dashboard' | 'flights' | 'bookings' | 'analytics'>('dashboard');
  const [currency, setCurrency] = useState<Currency['code']>('INR');

  // Flight DB
  const [flights, setFlights] = useState<Flight[]>(() => {
    return airlineDB.getFlights();
  });

  // Bookings DB
  const [bookings, setBookings] = useState<Booking[]>(() => {
    return airlineDB.getBookings();
  });

  // Search Engine
  const [searchParams, setSearchParams] = useState<FlightSearchParams>(defaultSearchParams);

  // Booking Flow
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [selectedReturnFlight, setSelectedReturnFlight] = useState<Flight | null>(null);
  const [passengers, setPassengers] = useState<Passenger[]>([
    {
      id: 'p-default',
      title: 'Mr',
      firstName: '',
      lastName: '',
      gender: 'Male',
      dob: '1998-05-15',
      type: 'adult',
    }
  ]);
  const [selectedSeats, setSelectedSeats] = useState<Record<number, Seat>>({});
  const [hasInsurance, setHasInsurance] = useState<boolean>(true);
  const [hasPriorityBoarding, setHasPriorityBoarding] = useState<boolean>(false);
  const [appliedOffer, setAppliedOffer] = useState<Offer | null>(null);
  const [currentBookingSuccess, setCurrentBookingSuccess] = useState<Booking | null>(null);
  const [verifiedBookingPhone, setVerifiedBookingPhoneState] = useState<string>(() => {
    try {
      return localStorage.getItem('aerowings_linked_phone') || '';
    } catch {
      return '';
    }
  });

  const setVerifiedBookingPhone = (phone: string) => {
    setVerifiedBookingPhoneState(phone);
    try {
      if (phone) {
        localStorage.setItem('aerowings_linked_phone', phone);
      }
    } catch {
      // ignore storage error
    }
  };

  // Admin Auth
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('aerowings_admin_auth') === 'true';
  });

  // User Profile - clean initial state (no hardcoded phone number)
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('aerowings_user_profile');
    return saved ? JSON.parse(saved) : {
      name: 'Passenger',
      email: '',
      phone: '',
      tier: 'Gold',
      miles: 14500,
    };
  });

  // Hands-Free AI Voice Mode
  const [isVoiceModeActive, setIsVoiceModeActive] = useState<boolean>(false);
  const toggleVoiceMode = () => {
    setIsVoiceModeActive(prev => {
      const next = !prev;
      if (next) {
        aiVoice.speak('AeroWings AI Voice Mode activated. Where would you like to fly?', { lang: aiLanguage });
      } else {
        aiVoice.speak('AI Voice Mode paused.', { lang: aiLanguage });
      }
      return next;
    });
  };
  const setVoiceMode = (active: boolean) => {
    setIsVoiceModeActive(active);
  };

  // Multi-City Itinerary Segments (at least 2 segments default)
  const [multiCitySegments, setMultiCitySegments] = useState<Array<{ origin: string; destination: string; departureDate: string }>>([
    {
      origin: 'DEL',
      destination: 'BOM',
      departureDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
    },
    {
      origin: 'BOM',
      destination: 'BLR',
      departureDate: new Date(Date.now() + 86400000 * 6).toISOString().split('T')[0]
    }
  ]);

  // GST & Price Drop Protection
  const [hasGstNumber, setHasGstNumber] = useState<boolean>(false);
  const [gstin, setGstin] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [hasPriceDropProtection, setHasPriceDropProtection] = useState<boolean>(false);

  // Real-time Notification Preferences and Event Log
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(() => {
    const saved = localStorage.getItem('aerowings_notification_prefs');
    return saved ? JSON.parse(saved) : {
      smsEnabled: true,
      emailEnabled: true,
      pushEnabled: true,
      smsPhone: '',
      emailAddress: '',
      notifyOnDelay: true,
      notifyOnGateChange: true,
      notifyOnBoarding: true,
      notifyOnWeatherAlert: true,
    };
  });

  const [notifications, setNotifications] = useState<FlightNotification[]>(() => {
    const saved = localStorage.getItem('aerowings_notifications_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return [
      {
        id: 'notif-init-1',
        pnr: 'AW-892F1',
        flightNumber: 'AW-101',
        type: 'gate_change',
        title: 'Gate & Terminal Update: Gate 22A (Terminal 3)',
        message: 'AeroWings Flight AW-101 (DEL → BOM) departure gate has been assigned to Gate 22A, Terminal 3. Security check-in is now open.',
        channel: 'all',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        read: false,
        recipientPhone: '',
        recipientEmail: 'passenger@aerowings.com',
        details: {
          gate: '22A',
          terminal: 'T3',
          oldValue: 'Gate 14B',
          newValue: 'Gate 22A'
        }
      },
      {
        id: 'notif-init-2',
        pnr: 'AW-892F1',
        flightNumber: 'AW-101',
        type: 'boarding',
        title: 'Boarding Announcement: Priority & Zone 1',
        message: 'Priority Boarding for AeroWings AW-101 is scheduled to commence 35 minutes before departure at Gate 22A. Keep your digital QR Boarding Pass ready.',
        channel: 'sms',
        timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
        read: true,
        recipientPhone: '',
        details: {
          gate: '22A',
          estimatedTime: '06:05 AM'
        }
      },
      {
        id: 'notif-init-3',
        pnr: 'AW-441A9',
        flightNumber: 'AW-408',
        type: 'weather_alert',
        title: 'Doppler Weather Clearance: On-Time Departure',
        message: 'Route BOM → PNQ has clear skies (Visibility 10km, Winds 8 km/h). Flight AW-408 is scheduled for on-time departure.',
        channel: 'email',
        timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
        read: true,
        recipientEmail: 'passenger@aerowings.com',
      }
    ];
  });

  useEffect(() => {
    airlineDB.saveBookings(bookings);
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('aerowings_notification_prefs', JSON.stringify(notificationPreferences));
  }, [notificationPreferences]);

  useEffect(() => {
    localStorage.setItem('aerowings_notifications_v1', JSON.stringify(notifications));
  }, [notifications]);

  // Quick lookup
  const [trackedPNR, setTrackedPNR] = useState<string>('');
  const [isTicketLookupOpen, setIsTicketLookupOpen] = useState<boolean>(false);

  // Toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, type, message }]);
    const duration = message.includes('OTP') ? 9000 : 4500;
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('aerowings_flights_v5', JSON.stringify(flights));
  }, [flights]);

  useEffect(() => {
    localStorage.setItem('aerowings_bookings_v5', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('aerowings_admin_auth', isAdminAuthenticated ? 'true' : 'false');
  }, [isAdminAuthenticated]);

  useEffect(() => {
    localStorage.setItem('aerowings_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  // Adjust passenger array when total passenger count changes
  useEffect(() => {
    const totalCount = searchParams.adults + searchParams.children + searchParams.infants;
    setPassengers(prev => {
      const updated: Passenger[] = [];
      let index = 0;
      // Adults
      for (let i = 0; i < searchParams.adults; i++) {
        const existing = prev[index];
        updated.push(existing ? { ...existing, type: 'adult' } : {
          id: `p-${Date.now()}-${index}`,
          title: 'Mr',
          firstName: i === 0 && userProfile.name ? userProfile.name.split(' ')[0] : '',
          lastName: i === 0 && userProfile.name ? userProfile.name.split(' ').slice(1).join(' ') : '',
          gender: 'Male',
          dob: '1995-01-01',
          type: 'adult',
        });
        index++;
      }
      // Children
      for (let i = 0; i < searchParams.children; i++) {
        const existing = prev[index];
        updated.push(existing ? { ...existing, type: 'child' } : {
          id: `p-${Date.now()}-${index}`,
          title: 'Master',
          firstName: '',
          lastName: '',
          gender: 'Male',
          dob: '2016-01-01',
          type: 'child',
        });
        index++;
      }
      // Infants
      for (let i = 0; i < searchParams.infants; i++) {
        const existing = prev[index];
        updated.push(existing ? { ...existing, type: 'infant' } : {
          id: `p-${Date.now()}-${index}`,
          title: 'Master',
          firstName: '',
          lastName: '',
          gender: 'Male',
          dob: '2025-01-01',
          type: 'infant',
        });
        index++;
      }
      return updated;
    });
  }, [searchParams.adults, searchParams.children, searchParams.infants]);

  // Flight CRUD
  const addFlight = (flightData: Omit<Flight, 'id'>) => {
    const newFlight: Flight = {
      ...flightData,
      id: `FL-${Date.now().toString().slice(-4)}`,
    };
    setFlights(prev => {
      const updated = [newFlight, ...prev];
      airlineDB.saveFlights(updated);
      return updated;
    });
    addToast(`Flight ${newFlight.flightNumber} successfully added to timetable`, 'success');
  };

  const updateFlight = (id: string, updated: Partial<Flight>) => {
    setFlights(prev => {
      const nextFlights = prev.map(f => f.id === id ? { ...f, ...updated } : f);
      airlineDB.saveFlights(nextFlights);
      return nextFlights;
    });

    // Also synchronize active bookings containing this flight
    setBookings(prev => {
      const nextBookings = prev.map(b => {
        if (b.flight.id === id || (updated.flightNumber && b.flight.flightNumber === updated.flightNumber)) {
          return {
            ...b,
            flight: { ...b.flight, ...updated }
          };
        }
        return b;
      });
      airlineDB.saveBookings(nextBookings);
      return nextBookings;
    });

    addToast(`Flight details & passenger records updated successfully`, 'success');
  };

  const deleteFlight = (id: string) => {
    setFlights(prev => {
      const filtered = prev.filter(f => f.id !== id);
      airlineDB.saveFlights(filtered);
      return filtered;
    });
    addToast(`Flight removed from schedule`, 'info');
  };

  const updateFlightStatus = (id: string, status: FlightStatus, delayMinutes = 0) => {
    let affectedFlight: Flight | undefined;

    setFlights(prev => {
      const next = prev.map(f => {
        if (f.id === id) {
          affectedFlight = { ...f, status, delayMinutes };
          return affectedFlight;
        }
        return f;
      });
      airlineDB.saveFlights(next);
      return next;
    });

    // Synchronize passenger bookings & send immediate dispatch SMS / Email
    setBookings(prev => {
      const nextBookings = prev.map(b => {
        if (b.flight.id === id) {
          const isCancelledNow = status === 'Cancelled';
          const updatedB: Booking = {
            ...b,
            status: isCancelledNow ? 'Cancelled' : b.status,
            cancellationReason: isCancelledNow
              ? 'AI Automated Weather & Flight Safety Grounding: 100% Zero-Deduction Full Refund Disbursed.'
              : b.cancellationReason,
            refundAmount: isCancelledNow ? b.priceBreakdown.finalTotal : b.refundAmount,
            refundStatus: isCancelledNow ? 'Processed' : b.refundStatus,
            flight: { ...b.flight, status, delayMinutes }
          };

          if (currentBookingSuccess && currentBookingSuccess.pnr === b.pnr) {
            setCurrentBookingSuccess(updatedB);
          }

          // Dispatch flight status alert directly to passenger's linked phone & email
          const pnr = b.pnr;
          const phone = b.contactPhone || (typeof localStorage !== 'undefined' ? localStorage.getItem('aerowings_linked_phone') : null) || '';
          const email = b.contactEmail || (typeof localStorage !== 'undefined' ? localStorage.getItem('aerowings_linked_email') : null) || '';

          let statusMsg = `AeroWings Operations Alert: Flight ${b.flight.flightNumber} (${b.flight.origin.code} ➔ ${b.flight.destination.code}) status changed to [${status.toUpperCase()}].`;
          if (delayMinutes > 0) {
            statusMsg += ` Expected delay: ${delayMinutes} minutes. Gate: ${b.flight.gate || '22A'}.`;
          } else if (status === 'Boarding') {
            statusMsg += ` Boarding is now ACTIVE at Gate ${b.flight.gate || '22A'}. Please proceed immediately with digital boarding pass PNR ${pnr}.`;
          } else if (status === 'Cancelled') {
            statusMsg += ` Flight has been cancelled due to operational/weather safety. 100% full refund of ₹${b.priceBreakdown.finalTotal} is authorized with zero deduction.`;
          }

          airlineDB.addSms({
            phoneNumber: phone,
            type: 'FLIGHT_DELAY',
            title: `✈️ Operations Dispatch: ${b.flight.flightNumber} is ${status}`,
            body: statusMsg,
            pnr
          });

          airlineDB.addEmail({
            recipientEmail: email,
            sender: 'dispatch@aerowings.airline.com',
            subject: `Flight Status Update: ${b.flight.flightNumber} • PNR ${pnr} is now ${status}`,
            previewText: statusMsg,
            pnr,
            type: 'STATUS_ALERT'
          });

          return updatedB;
        }
        return b;
      });
      airlineDB.saveBookings(nextBookings);
      return nextBookings;
    });

    addToast(`Flight status set to ${status}${delayMinutes > 0 ? ` (+${delayMinutes}m)` : ''}. Passenger alerts dispatched.`, 'success');
  };

  const resetDefaultFlights = () => {
    clearAirportWeatherOverrides();
    setFlights(INITIAL_FLIGHTS);
    airlineDB.saveFlights(INITIAL_FLIGHTS);
    addToast('All airport weather conditions & flight schedules restored to Clear Skies.', 'info');
  };

  // Search Engine
  const performSearch = (params: FlightSearchParams) => {
    setSearchParams(params);
    setUserView('results');

    let currentFlightList = flights;
    if (params.origin && params.destination && params.origin !== params.destination) {
      const directMatches = currentFlightList.filter(
        f => f.origin.code.toUpperCase() === params.origin.toUpperCase() && 
             f.destination.code.toUpperCase() === params.destination.toUpperCase()
      );

      // If no direct flights exist in state, dynamically generate 5+ realistic flights
      if (directMatches.length === 0) {
        const generated = generateFlightsForRoute(params.origin, params.destination);
        if (generated.length > 0) {
          const merged = [...currentFlightList, ...generated];
          setFlights(merged);
          airlineDB.saveFlights(merged);
          currentFlightList = merged;
        }
      }
    }

    // Search completed
  };

  // Passenger Updates
  const updatePassenger = (index: number, updated: Partial<Passenger>) => {
    setPassengers(prev => {
      const next = [...prev];
      if (next[index]) {
        next[index] = { ...next[index], ...updated };
      }
      return next;
    });
  };

  // Seat Assignment
  const assignSeat = (passengerIndex: number, seat: Seat) => {
    setSelectedSeats(prev => ({
      ...prev,
      [passengerIndex]: seat,
    }));
    updatePassenger(passengerIndex, {
      seatNumber: seat.id,
      seatPrice: seat.price,
    });
  };

  const removeSeat = (passengerIndex: number) => {
    setSelectedSeats(prev => {
      const next = { ...prev };
      delete next[passengerIndex];
      return next;
    });
    updatePassenger(passengerIndex, {
      seatNumber: undefined,
      seatPrice: 0,
    });
  };

  // Promo Code
  const applyPromoCode = (code: string) => {
    const clean = code.trim().toUpperCase();
    const insiderOffer: Offer = {
      id: 'off-insider',
      code: 'INSIDER20',
      title: 'AeroWings Insider Club VIP 20% Off',
      description: 'Exclusive Insider Club member discount with zero convenience fee.',
      discountType: 'percentage',
      discountValue: 20,
      minAmount: 1000,
      expiresOn: '2026-12-31',
      bannerColor: 'from-amber-600 to-amber-900',
      tag: 'INSIDER VIP'
    };
    const found = clean === 'INSIDER20' || clean === 'AEROFLY500'
      ? (clean === 'INSIDER20' ? insiderOffer : (OFFERS.find(o => o.code === clean) || insiderOffer))
      : OFFERS.find(o => o.code === clean);
    if (!found) {
      return { success: false, message: 'Invalid promo code. Try INSIDER20, FLYBCA150, or FIRSTFLY' };
    }

    const { baseFare } = calculateFareBreakdown();
    if (baseFare < found.minAmount) {
      return { success: false, message: `Minimum booking value of ₹${found.minAmount} required for this coupon` };
    }

    setAppliedOffer(found);
    addToast(`Coupon "${found.code}" applied: ${found.title}`, 'success');
    return { success: true, message: `Coupon applied: ${found.title}` };
  };

  const removePromoCode = () => {
    setAppliedOffer(null);
    addToast('Promo code removed', 'info');
  };

  // Fare Calculation
  const calculateFareBreakdown = () => {
    const specialFareType = searchParams.specialFare || 'regular';
    const specialFareLabels: Record<string, string> = {
      regular: 'Regular Fare',
      student: 'Student Concession (10% Off + 10kg Extra Baggage)',
      senior: 'Senior Citizen Concession (12% Off)',
      armed_forces: 'Defence / Armed Forces Concession (15% Off)',
      doctors_nurses: 'Doctors & Nurses Concession (10% Off)',
    };
    const specialFareLabel = specialFareLabels[specialFareType] || 'Regular Fare';
    const extraFreeBaggageKg = specialFareType === 'student' ? 10 : 0;

    if (!selectedFlight) {
      return {
        originalBaseFare: 0,
        baseFare: 0,
        taxesAndFees: 0,
        seatsTotal: 0,
        mealsTotal: 0,
        baggageTotal: 0,
        insuranceTotal: 0,
        priorityBoardingTotal: 0,
        specialFareDiscount: 0,
        specialFareType,
        specialFareLabel,
        extraFreeBaggageKg,
        couponDiscount: 0,
        finalTotal: 0,
      };
    }

    const cabin = searchParams.cabinClass;
    const singleBaseFare = selectedFlight.prices[cabin] || selectedFlight.prices.economy;
    const totalPassengers = passengers.length;
    const fullBaseFare = singleBaseFare * totalPassengers;
    let baseFare = fullBaseFare;
    let specialFareDiscount = 0;

    // Special Fare Discounts
    if (specialFareType === 'student') {
      specialFareDiscount = Math.round(fullBaseFare * 0.10); // 10% student discount
      baseFare = fullBaseFare - specialFareDiscount;
    } else if (specialFareType === 'senior') {
      specialFareDiscount = Math.round(fullBaseFare * 0.12); // 12% senior discount
      baseFare = fullBaseFare - specialFareDiscount;
    } else if (specialFareType === 'armed_forces') {
      specialFareDiscount = Math.round(fullBaseFare * 0.15); // 15% defence discount
      baseFare = fullBaseFare - specialFareDiscount;
    } else if (specialFareType === 'doctors_nurses') {
      specialFareDiscount = Math.round(fullBaseFare * 0.10); // 10% healthcare worker discount
      baseFare = fullBaseFare - specialFareDiscount;
    }

    // Taxes (roughly 12% + airport fee ₹350 per pax)
    const taxesAndFees = Math.round(baseFare * 0.12 + 350 * totalPassengers);

    // Seats total
    let seatsTotal = 0;
    (Object.values(selectedSeats) as Seat[]).forEach(s => {
      seatsTotal += s?.price || 0;
    });

    // Meals total
    let mealsTotal = 0;
    passengers.forEach(p => {
      if (p.mealPrice) mealsTotal += p.mealPrice;
    });

    // Baggage total
    let baggageTotal = 0;
    passengers.forEach(p => {
      if (p.baggagePrice) baggageTotal += p.baggagePrice;
    });

    // Insurance & Priority
    const insuranceTotal = hasInsurance ? 299 * totalPassengers : 0;
    const priorityBoardingTotal = hasPriorityBoarding ? 199 * totalPassengers : 0;

    const subTotal = baseFare + taxesAndFees + seatsTotal + mealsTotal + baggageTotal + insuranceTotal + priorityBoardingTotal;

    // Coupon discount
    let couponDiscount = 0;
    if (appliedOffer) {
      if (appliedOffer.discountType === 'flat') {
        couponDiscount = appliedOffer.discountValue;
      } else {
        couponDiscount = Math.round((baseFare * appliedOffer.discountValue) / 100);
      }
    }

    const finalTotal = Math.max(0, subTotal - couponDiscount);

    return {
      originalBaseFare: fullBaseFare,
      baseFare,
      taxesAndFees,
      seatsTotal,
      mealsTotal,
      baggageTotal,
      insuranceTotal,
      priorityBoardingTotal,
      specialFareDiscount,
      specialFareType,
      specialFareLabel,
      extraFreeBaggageKg,
      couponDiscount,
      finalTotal,
    };
  };

  // Complete Booking
  const completeBooking = (
    paymentMethod: 'card' | 'upi' | 'netbanking' | 'wallet',
    paymentId: string,
    contactEmail: string,
    contactPhone: string
  ): Booking => {
    if (!selectedFlight) throw new Error('No flight selected');

    const breakdown = calculateFareBreakdown();
    const pnr = generatePNR();
    const ticketNumber = generateTicketNumber();

    // Check if origin, destination, or flight weather has deteriorated to severe/unsafe while going to book
    const origSafety = isAirportWeatherUnsafe(selectedFlight.origin.code);
    const destSafety = isAirportWeatherUnsafe(selectedFlight.destination.code);
    const flightWeatherUnsafe =
      selectedFlight.status === 'Cancelled' ||
      selectedFlight.weather?.aiCancellationRisk === 'Critical - Auto Cancelled' ||
      origSafety.unsafe ||
      destSafety.unsafe;

    const unsafeReason = origSafety.unsafe
      ? `AI Automated Doppler Weather Protection: Ticket Auto-Cancelled due to severe ${origSafety.condition} at ${selectedFlight.origin.city} (${selectedFlight.origin.code}). 100% Instant Full Refund of ₹${breakdown.finalTotal.toLocaleString()} credited.`
      : destSafety.unsafe
      ? `AI Automated Doppler Weather Protection: Ticket Auto-Cancelled due to severe ${destSafety.condition} at ${selectedFlight.destination.city} (${selectedFlight.destination.code}). 100% Instant Full Refund of ₹${breakdown.finalTotal.toLocaleString()} credited.`
      : selectedFlight.weather?.aiAutoCancelReason ||
        `AI Automated Doppler Weather Protection: Ticket Auto-Cancelled due to unsafe weather along corridor. 100% Instant Full Refund of ₹${breakdown.finalTotal.toLocaleString()} credited.`;

    const newBooking: Booking = {
      id: `BK-${Date.now().toString().slice(-4)}`,
      pnr,
      ticketNumber,
      flightId: selectedFlight.id,
      flight: flightWeatherUnsafe ? { ...selectedFlight, status: 'Cancelled' } : selectedFlight,
      returnFlightId: selectedReturnFlight?.id,
      returnFlight: selectedReturnFlight || undefined,
      tripType: searchParams.tripType,
      departureDate: searchParams.departureDate,
      returnDate: searchParams.returnDate,
      cabinClass: searchParams.cabinClass,
      passengers: [...passengers],
      contactEmail,
      contactPhone,
      bookingDate: new Date().toISOString().split('T')[0],
      status: flightWeatherUnsafe ? 'Cancelled' : 'Confirmed',
      cancellationReason: flightWeatherUnsafe ? unsafeReason : undefined,
      refundAmount: flightWeatherUnsafe ? breakdown.finalTotal : undefined,
      priceBreakdown: breakdown,
      paymentMethod,
      paymentId,
      hasInsurance,
      hasPriorityBoarding,
      specialFare: searchParams.specialFare,
      refundStatus: flightWeatherUnsafe ? 'Processed' : 'Not Applicable',
    };

    setBookings(prev => [newBooking, ...prev]);
    setCurrentBookingSuccess(newBooking);

    // Save to Persistent Database
    airlineDB.addBooking(newBooking);

    // Trigger Real SMS Confirmation to Registered Phone
    airlineDB.addSms({
      phoneNumber: contactPhone,
      type: 'BOOKING_CONFIRMATION',
      title: 'Booking Confirmed • E-Ticket Issued',
      body: `AeroWings Reservation Confirmed! PNR: ${pnr}. Flight ${selectedFlight.airlineCode}${selectedFlight.flightNumber} [${selectedFlight.origin.code} ➔ ${selectedFlight.destination.code}] on ${newBooking.departureDate}. Seat: ${passengers[0]?.seatNumber || '12A'}. Boarding gate: ${selectedFlight.gate || '22A'}. Show your mobile QR pass at security.`,
      pnr
    });

    // Dispatch SMS via Backend SMS Gateway API to linked phone number
    if (contactPhone) {
      fetch('/api/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: contactPhone,
          passengerName: `${passengers[0]?.firstName || ''} ${passengers[0]?.lastName || ''}`.trim() || 'Passenger',
          flightNumber: `${selectedFlight.airlineCode}-${selectedFlight.flightNumber}`,
          origin: selectedFlight.origin.code,
          destination: selectedFlight.destination.code,
          departureDate: newBooking.departureDate,
          seatNumber: passengers[0]?.seatNumber || '12A',
          seatClass: searchParams.cabinClass,
          totalPriceINR: breakdown.finalTotal,
          pnr
        })
      }).catch(smsErr => console.warn('SMS dispatch to linked phone logged:', smsErr));
    }

    // Trigger Real Email Confirmation to Registered Email
    airlineDB.addEmail({
      recipientEmail: contactEmail,
      sender: 'reservations@aerowings.airline.com',
      subject: `E-Ticket Confirmed • PNR ${pnr} [${selectedFlight.origin.code} ➔ ${selectedFlight.destination.code}]`,
      previewText: `Dear ${passengers[0]?.firstName || 'Passenger'}, your AeroWings booking is confirmed. Flight ${selectedFlight.airlineCode}${selectedFlight.flightNumber} departs ${newBooking.departureDate} at ${selectedFlight.departureTime} (Terminal ${selectedFlight.terminal || 'T3'}, Gate ${selectedFlight.gate || '22A'}). Total paid: ₹${breakdown.finalTotal.toLocaleString()}.`,
      pnr,
      type: 'TICKET_CONFIRMATION'
    });

    // Real-Time Notification (SMS, Email, Push) in System
    const confirmedNotif: FlightNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      pnr,
      flightNumber: `${selectedFlight.airlineCode}-${selectedFlight.flightNumber}`,
      type: 'boarding',
      title: `E-Ticket Confirmed & Issued (PNR: ${pnr})`,
      message: `AeroWings Confirmed: Flight ${selectedFlight.airlineCode}-${selectedFlight.flightNumber} from ${selectedFlight.origin.city} to ${selectedFlight.destination.city}. QR Boarding Pass issued. Gate: ${selectedFlight.gate || '22A'}.`,
      channel: 'all',
      timestamp: new Date().toISOString(),
      read: false,
      recipientPhone: contactPhone,
      recipientEmail: contactEmail,
      details: {
        gate: selectedFlight.gate || '22A',
        terminal: selectedFlight.terminal || 'T3',
        estimatedTime: selectedFlight.departureTime
      }
    };
    setNotifications(prev => [confirmedNotif, ...prev]);

    // Award frequent flyer miles (10 miles per ₹100 spent)
    const earnedMiles = Math.round(breakdown.baseFare / 10);
    setUserProfile(prev => ({
      ...prev,
      phone: contactPhone || prev.phone,
      email: contactEmail || prev.email,
      miles: prev.miles + earnedMiles,
    }));

    addToast(`Reservation Confirmed! PNR: ${pnr} • SMS Sent to ${contactPhone}`, 'success');
    
    // AI Voice speech announcement
    aiVoice.announceBookingConfirmed(pnr, passengers.length, selectedFlight.flightNumber);

    setUserView('confirmation');
    return newBooking;
  };

  // Hands-Free AI Voice Booking Execution (Processes full booking without human hands)
  const executeVoiceBooking = async (details: {
    origin?: string;
    destination?: string;
    flightNumber?: string;
    passengerName?: string;
    recipientPhone?: string;
    seatClass?: string;
    seatNumber?: string;
    totalPriceINR?: number;
    smsMessage?: string;
  }): Promise<Booking> => {
    const origCode = (details.origin || searchParams.origin || 'DEL').toUpperCase();
    const destCode = (details.destination || searchParams.destination || 'BOM').toUpperCase();

    // Find best flight or generate for route
    let targetFlight = flights.find(f => 
      (details.flightNumber && f.flightNumber.toLowerCase().includes(details.flightNumber.toLowerCase().replace(/[^a-z0-9]/g, ''))) ||
      (f.origin.code === origCode && f.destination.code === destCode)
    );

    if (!targetFlight) {
      const generated = generateFlightsForRoute(origCode, destCode);
      if (generated.length > 0) {
        targetFlight = generated[0];
        setFlights(prev => [targetFlight!, ...prev]);
        airlineDB.saveFlights([targetFlight!, ...flights]);
      } else {
        targetFlight = flights[0];
      }
    }

    setSelectedFlight(targetFlight);

    const rawName = (details.passengerName || userProfile.name || 'Valued Passenger').trim();
    const nameParts = rawName.split(' ');
    const fName = nameParts[0] || 'Valued';
    const lName = nameParts.slice(1).join(' ') || 'Passenger';
    const phone = details.recipientPhone || userProfile.phone || verifiedBookingPhone || '9876543210';
    const assignedSeat = details.seatNumber || '12A';

    setPassengers([{
      id: `p-voice-${Date.now()}`,
      title: 'Mr',
      firstName: fName,
      lastName: lName,
      gender: 'Male',
      dob: '1995-01-01',
      type: 'adult',
      seatNumber: assignedSeat,
      seatPrice: 0
    }]);

    setSelectedSeats({
      0: {
        id: assignedSeat,
        row: 12,
        col: 'A',
        type: 'window',
        price: 0,
        isAvailable: true,
        cabinClass: 'economy'
      }
    });

    const origSafety = isAirportWeatherUnsafe(targetFlight.origin.code);
    const destSafety = isAirportWeatherUnsafe(targetFlight.destination.code);
    const isUnsafe = origSafety.unsafe || destSafety.unsafe;

    const pnr = generatePNR();
    const ticketNumber = generateTicketNumber();
    const baseFare = details.totalPriceINR ? Math.round(details.totalPriceINR * 0.88) : targetFlight.prices.economy;
    const taxesAndFees = Math.round(baseFare * 0.12 + 350);
    const finalTotal = details.totalPriceINR || (baseFare + taxesAndFees);

    const newBooking: Booking = {
      id: `BK-${Date.now().toString().slice(-4)}`,
      pnr,
      ticketNumber,
      flightId: targetFlight.id,
      flight: isUnsafe ? { ...targetFlight, status: 'Cancelled' } : targetFlight,
      tripType: 'one_way',
      departureDate: new Date().toISOString().split('T')[0],
      cabinClass: (details.seatClass as any) || 'economy',
      passengers: [{
        id: `p-voice-${Date.now()}`,
        title: 'Mr',
        firstName: fName,
        lastName: lName,
        gender: 'Male',
        dob: '1995-01-01',
        type: 'adult',
        seatNumber: assignedSeat
      }],
      contactEmail: 'passenger@aerowings.com',
      contactPhone: phone,
      bookingDate: new Date().toISOString().split('T')[0],
      status: isUnsafe ? 'Cancelled' : 'Confirmed',
      cancellationReason: isUnsafe ? `AI Doppler Weather Protection: Ticket auto-cancelled due to severe weather. 100% full refund credited.` : undefined,
      refundAmount: isUnsafe ? finalTotal : undefined,
      refundStatus: isUnsafe ? 'Processed' : 'Not Applicable',
      priceBreakdown: {
        baseFare,
        taxesAndFees,
        seatsTotal: 0,
        mealsTotal: 0,
        baggageTotal: 0,
        insuranceTotal: 0,
        priorityBoardingTotal: 0,
        specialFareDiscount: 0,
        couponDiscount: 0,
        finalTotal
      },
      paymentMethod: 'upi',
      paymentId: `VOICE-AI-${Date.now()}`,
      hasInsurance: true,
      hasPriorityBoarding: false,
      specialFare: 'regular'
    };

    setBookings(prev => [newBooking, ...prev]);
    setCurrentBookingSuccess(newBooking);
    airlineDB.addBooking(newBooking);

    // Persist to backend and dispatch SMS
    try {
      await fetch('/api/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phone,
          passengerName: rawName,
          flightNumber: `${targetFlight.airlineCode}-${targetFlight.flightNumber}`,
          origin: targetFlight.origin.code,
          destination: targetFlight.destination.code,
          departureDate: newBooking.departureDate,
          seatNumber: assignedSeat,
          seatClass: details.seatClass || 'Economy',
          totalPriceINR: finalTotal,
          pnr
        })
      });
    } catch {}

    airlineDB.addSms({
      phoneNumber: phone,
      type: 'BOOKING_CONFIRMATION',
      title: 'Voice Reservation Confirmed • E-Ticket Issued',
      body: `AeroWings Voice AI Confirmed! PNR: ${pnr}. Flight ${targetFlight.airlineCode}${targetFlight.flightNumber} [${targetFlight.origin.code} ➔ ${targetFlight.destination.code}]. Seat: ${assignedSeat}. Total: ₹${finalTotal.toLocaleString('en-IN')}.`,
      pnr
    });

    aiVoice.announceBookingConfirmed(pnr, 1, targetFlight.flightNumber);
    setUserView('confirmation');
    addToast(`🎙️ AI Voice Reservation Confirmed! PNR: ${pnr} • SMS Sent to ${phone}`, 'success');

    return newBooking;
  };

  // Cancel Booking
  const cancelBooking = (pnr: string, reason: string) => {
    const booking = bookings.find(b => b.pnr === pnr);
    if (!booking) {
      addToast('Booking not found', 'error');
      return { success: false, refundAmount: 0 };
    }

    // If weather-related cancellation, 100% zero deduction; otherwise ₹1,500 standard fee
    const isWeatherCancel = reason.toLowerCase().includes('weather') || reason.toLowerCase().includes('storm') || reason.toLowerCase().includes('cyclone') || reason.toLowerCase().includes('fog');
    const refundAmount = isWeatherCancel
      ? booking.priceBreakdown.finalTotal
      : Math.max(0, booking.priceBreakdown.finalTotal - 1500);

    setBookings(prev => prev.map(b => {
      if (b.pnr === pnr) {
        const updated: Booking = {
          ...b,
          status: 'Cancelled',
          cancellationReason: reason,
          refundAmount,
          refundStatus: 'Processed',
        };
        if (currentBookingSuccess && currentBookingSuccess.pnr === pnr) {
          setCurrentBookingSuccess(updated);
        }
        return updated;
      }
      return b;
    }));

    // Trigger SMS and Email alert for refund
    const targetBooking = bookings.find(b => b.pnr === pnr);
    if (targetBooking) {
      airlineDB.addSms({
        phoneNumber: targetBooking.contactPhone,
        type: 'REFUND',
        title: 'Booking Cancelled • Refund Initiated',
        body: `AeroWings Alert: Booking ${pnr} has been cancelled. Net refund of ₹${refundAmount.toLocaleString()} will credit back within 24 hours.`,
        pnr
      });
      airlineDB.addEmail({
        recipientEmail: targetBooking.contactEmail,
        sender: 'billing@aerowings.airline.com',
        subject: `Refund Processed for PNR ${pnr} - ₹${refundAmount.toLocaleString()}`,
        previewText: `Your cancellation request for flight ${targetBooking.flight.airlineCode}${targetBooking.flight.flightNumber} has been finalized. Amount ₹${refundAmount.toLocaleString()} dispatched.`,
        pnr,
        type: 'REFUND_RECEIPT'
      });
    }

    addToast(`Booking ${pnr} cancelled. Refund of ₹${refundAmount.toLocaleString()} initiated.`, 'info');
    return { success: true, refundAmount };
  };

  // 100% Instant Full Refund for AI Weather-Cancelled Flights
  const instantWeatherRefund = (pnr: string) => {
    const booking = bookings.find(b => b.pnr === pnr);
    if (!booking) {
      addToast('Booking not found', 'error');
      return { success: false, refundAmount: 0 };
    }

    const fullRefundAmount = booking.priceBreakdown.finalTotal;

    setBookings(prev => prev.map(b => {
      if (b.pnr === pnr) {
        const updated: Booking = {
          ...b,
          status: 'Cancelled',
          cancellationReason: 'AI Doppler Weather Protection: 100% Zero-Deduction Instant Refund Disbursed',
          refundAmount: fullRefundAmount,
          refundStatus: 'Processed',
        };
        if (currentBookingSuccess && currentBookingSuccess.pnr === pnr) {
          setCurrentBookingSuccess(updated);
        }
        return updated;
      }
      return b;
    }));

    // Trigger SMS and Email for Doppler 100% Zero-Loss refund
    airlineDB.addSms({
      phoneNumber: booking.contactPhone,
      type: 'REFUND',
      title: '⚡ 100% Weather Refund Disbursed',
      body: `AeroWings Doppler Protection: Full refund of ₹${fullRefundAmount.toLocaleString()} for grounded flight ${booking.flight.flightNumber} (PNR: ${pnr}) credited back immediately to your account.`,
      pnr
    });
    airlineDB.addEmail({
      recipientEmail: booking.contactEmail,
      sender: 'disruptions@aerowings.airline.com',
      subject: `100% Instant Refund Credit • PNR ${pnr} [Zero-Deduction Guarantee]`,
      previewText: `Dear Traveler, due to severe weather grounding flight ${booking.flight.flightNumber}, 100% of your ticket cost (₹${fullRefundAmount.toLocaleString()}) has been refunded with zero deductions.`,
      pnr,
      type: 'REFUND_RECEIPT'
    });

    addToast(`⚡ 100% Instant Weather Refund of ₹${fullRefundAmount.toLocaleString()} credited to original payment method!`, 'success');
    return { success: true, refundAmount: fullRefundAmount };
  };

  // 1-Click AI Intelligent Rebooking for Weather-Affected Passengers
  const instantWeatherRebook = (pnr: string, targetFlightId: string) => {
    const booking = bookings.find(b => b.pnr === pnr);
    const targetFlight = flights.find(f => f.id === targetFlightId);

    if (!booking) {
      addToast('Original booking not found', 'error');
      return { success: false, message: 'Original booking not found' };
    }

    if (!targetFlight) {
      addToast('Target rebooking flight not found', 'error');
      return { success: false, message: 'Target flight not found' };
    }

    if (targetFlight.status === 'Cancelled') {
      addToast('Cannot rebook to a cancelled flight', 'error');
      return { success: false, message: 'Target flight is unavailable' };
    }

    setBookings(prev => prev.map(b => {
      if (b.pnr === pnr) {
        const updated: Booking = {
          ...b,
          flightId: targetFlight.id,
          flight: targetFlight,
          status: 'Confirmed',
          cancellationReason: undefined,
          refundStatus: 'Not Applicable',
          rebookingNote: `AI Rebooked from ${b.flight.flightNumber} due to weather disruption with free VIP perks.`
        };
        if (currentBookingSuccess && currentBookingSuccess.pnr === pnr) {
          setCurrentBookingSuccess(updated);
        }
        return updated;
      }
      return b;
    }));

    addToast(`✈️ AI Rebooking Confirmed! Moved to flight ${targetFlight.flightNumber} (${targetFlight.departureTime}) with Free Meal Voucher & Priority Boarding.`, 'success');
    return { success: true, message: `Rebooked to ${targetFlight.flightNumber}` };
  };

  // Trigger Weather Disruption & Automated AI Cancellation
  const triggerWeatherDisruption = (
    airportCode: string,
    weatherType: WeatherCondition['condition'],
    severityLevel: 'normal' | 'moderate' | 'severe'
  ) => {
    const isClear = weatherType === 'Clear' || severityLevel === 'normal';
    const isSevere =
      !isClear &&
      (severityLevel === 'severe' ||
        weatherType === 'Typhoon / Cyclone' ||
        weatherType === 'Blizzard' ||
        weatherType === 'Heavy Thunderstorm' ||
        weatherType === 'Dense Fog');

    const effectiveSeverity: 'normal' | 'moderate' | 'severe' = isClear
      ? 'normal'
      : isSevere
      ? 'severe'
      : 'moderate';

    // Sync live meteorological override so all weather widgets and predictors immediately reflect this condition
    setAirportWeatherOverride(airportCode, weatherType, effectiveSeverity);

    let updatedFlightCount = 0;
    let autoCancelledCount = 0;

    const transformFlightWeather = (f: Flight): Flight => {
      const isOrigin = f.origin.code.toUpperCase() === airportCode.toUpperCase();
      const isDest = f.destination.code.toUpperCase() === airportCode.toUpperCase();
      if (!isOrigin && !isDest) return f;

      updatedFlightCount++;

      let newStatus: FlightStatus = f.status;
      let aiRisk: WeatherCondition['aiCancellationRisk'] = 'Low';
      let riskScore = 15;
      let stormIdx = 10;
      let wind = 15;
      let vis = 10;
      let isAiAuto = false;
      let cancelReason: string | undefined = undefined;

      if (effectiveSeverity === 'severe') {
        newStatus = 'Cancelled';
        aiRisk = 'Critical - Auto Cancelled';
        riskScore = 96;
        stormIdx = 92;
        wind = 88;
        vis = weatherType === 'Dense Fog' ? 0.2 : 0.8;
        isAiAuto = true;
        cancelReason = `AI Auto-Cancelled: Severe ${weatherType} alert at ${airportCode} exceeding flight safety limits (Wind: ${wind}km/h, Visibility: ${vis}km).`;
        autoCancelledCount++;
      } else if (effectiveSeverity === 'moderate') {
        newStatus = 'Delayed';
        aiRisk = 'Moderate';
        riskScore = 55;
        stormIdx = 48;
        wind = 42;
        vis = 3.5;
      } else {
        newStatus = 'On Time';
        aiRisk = 'Low';
        riskScore = 5;
        stormIdx = 5;
        wind = 12;
        vis = 10;
      }

      return {
        ...f,
        status: newStatus,
        delayMinutes: effectiveSeverity === 'moderate' ? 45 : 0,
        weather: {
          ...f.weather,
          condition: weatherType,
          windSpeedKmh: wind,
          visibilityKm: vis,
          stormIndex: stormIdx,
          aiRiskScore: riskScore,
          aiCancellationRisk: aiRisk,
          isAiAutoCancelled: isAiAuto,
          aiAutoCancelReason: cancelReason,
          compensationOffered: isAiAuto ? {
            freeReschedule: true,
            fullRefund: true,
            mealVoucher: true,
            hotelStay: true
          } : undefined
        }
      };
    };

    setFlights(prev => prev.map(transformFlightWeather));

    // Also update selectedFlight if the user is currently in the booking flow!
    if (selectedFlight && (selectedFlight.origin.code.toUpperCase() === airportCode.toUpperCase() || selectedFlight.destination.code.toUpperCase() === airportCode.toUpperCase())) {
      setSelectedFlight(transformFlightWeather(selectedFlight));
    }

    // If severe, also auto-update affected customer bookings (AND currentBookingSuccess!)
    if (isSevere) {
      let totalRefundedAmount = 0;
      let affectedFlightNum = '';

      setBookings(prev => prev.map(b => {
        if (
          b.flight.origin.code.toUpperCase() === airportCode.toUpperCase() ||
          b.flight.destination.code.toUpperCase() === airportCode.toUpperCase()
        ) {
          totalRefundedAmount += b.priceBreakdown.finalTotal;
          affectedFlightNum = b.flight.flightNumber;
          const updatedBooking: Booking = {
            ...b,
            flight: transformFlightWeather(b.flight),
            status: 'Cancelled',
            cancellationReason: `AI Automated Doppler Alert: Flight ${b.flight.flightNumber} grounded due to ${weatherType} at ${airportCode}. Ticket Auto-Cancelled with 100% Instant Full Refund (₹${b.priceBreakdown.finalTotal.toLocaleString()}).`,
            refundAmount: b.priceBreakdown.finalTotal,
            refundStatus: 'Processed',
          };
          return updatedBooking;
        }
        return b;
      }));

      // Ensure active confirmation page immediately updates with cancellation status
      if (currentBookingSuccess && (
        currentBookingSuccess.flight.origin.code.toUpperCase() === airportCode.toUpperCase() ||
        currentBookingSuccess.flight.destination.code.toUpperCase() === airportCode.toUpperCase()
      )) {
        setCurrentBookingSuccess(prev => prev ? {
          ...prev,
          flight: transformFlightWeather(prev.flight),
          status: 'Cancelled',
          cancellationReason: `AI Automated Doppler Alert: Flight ${prev.flight.flightNumber} grounded due to ${weatherType} at ${airportCode}. Ticket Auto-Cancelled with 100% Instant Full Refund (₹${prev.priceBreakdown.finalTotal.toLocaleString()}).`,
          refundAmount: prev.priceBreakdown.finalTotal,
          refundStatus: 'Processed'
        } : null);
      }

      // Speak aloud through AI Voice Synthesizer
      aiVoice.announceWeatherAutoCancellation(
        affectedFlightNum || `${airportCode} corridor flights`,
        totalRefundedAmount || 8500,
        weatherType,
        airportCode
      );

      addToast(`🚨 AI Weather Protection: Severe ${weatherType} at ${airportCode}. Auto-cancelled affected flights & tickets with 100% Instant Full Refund!`, 'error');
    } else {
      addToast(`🌦️ AI Weather Center: Updated conditions for ${airportCode} to ${weatherType} (${effectiveSeverity}).`, 'info');
    }
  };

  // Direct AI Auto-Cancellation for a single flight
  const aiAutoCancelFlight = (flightId: string, customReason?: string) => {
    const flight = flights.find(f => f.id === flightId) || selectedFlight || currentBookingSuccess?.flight;
    if (!flight) return;

    const reason = customReason || `AI Automated Weather Alert: Critical crosswinds & severe storm detected along flight corridor (${flight.origin.code} ➔ ${flight.destination.code}).`;

    setAirportWeatherOverride(flight.origin.code, 'Typhoon / Cyclone', 'severe');

    const cancelFlightObj = (f: Flight): Flight => ({
      ...f,
      status: 'Cancelled',
      weather: {
        ...f.weather,
        condition: 'Typhoon / Cyclone',
        aiRiskScore: 98,
        aiCancellationRisk: 'Critical - Auto Cancelled',
        isAiAutoCancelled: true,
        aiAutoCancelReason: reason,
        compensationOffered: {
          freeReschedule: true,
          fullRefund: true,
          mealVoucher: true,
          hotelStay: true
        }
      }
    });

    setFlights(prev => prev.map(f => f.id === flightId ? cancelFlightObj(f) : f));

    if (selectedFlight && selectedFlight.id === flightId) {
      setSelectedFlight(cancelFlightObj(selectedFlight));
    }

    // Update customer bookings and currentBookingSuccess
    setBookings(prev => prev.map(b => {
      if (b.flightId === flightId || b.flight.flightNumber === flight.flightNumber) {
        const updatedBooking: Booking = {
          ...b,
          flight: cancelFlightObj(b.flight),
          status: 'Cancelled',
          cancellationReason: reason,
          refundAmount: b.priceBreakdown.finalTotal,
          refundStatus: 'Processed'
        };
        if (currentBookingSuccess && currentBookingSuccess.pnr === b.pnr) {
          setCurrentBookingSuccess(updatedBooking);
        }
        return updatedBooking;
      }
      return b;
    }));

    addToast(`🛡️ AI Safety Protocol: Flight ${flight.flightNumber} & associated tickets automatically cancelled due to severe weather. 100% Instant Refund credited!`, 'error');
  };

  // Autonomous Zero-Human Ticket Cancellation Watchdog
  const checkAndAutoCancelWeatherDisruptedBookings = () => {
    let cancelledCount = 0;
    setBookings(prev => {
      let changed = false;
      const updatedList = prev.map(b => {
        if (b.status === 'Confirmed') {
          const origSafety = isAirportWeatherUnsafe(b.flight.origin.code);
          const destSafety = isAirportWeatherUnsafe(b.flight.destination.code);
          if (origSafety.unsafe || destSafety.unsafe) {
            cancelledCount++;
            changed = true;
            const hazardousAirport = origSafety.unsafe ? b.flight.origin : b.flight.destination;
            const condition = origSafety.unsafe ? origSafety.condition : destSafety.condition;
            const fullRefund = b.priceBreakdown.finalTotal;

            // Dispatch Real-time SMS & Email for Zero-Human Cancellation
            airlineDB.addSms({
              phoneNumber: b.contactPhone,
              type: 'REFUND',
              title: '⚡ 100% Weather Refund Disbursed (Zero-Human Intervention)',
              body: `AeroWings Autonomous Weather Watchdog: Flight ${b.flight.flightNumber} (PNR: ${b.pnr}) cancelled automatically due to ${condition} at ${hazardousAirport.city} (${hazardousAirport.code}). 100% Instant Refund of ₹${fullRefund.toLocaleString()} credited back to your account without human intervention.`,
              pnr: b.pnr
            });

            airlineDB.addEmail({
              recipientEmail: b.contactEmail,
              sender: 'disruptions@aerowings.airline.com',
              subject: `Autonomous Cancellation & 100% Instant Refund • PNR ${b.pnr}`,
              previewText: `Flight ${b.flight.flightNumber} cancelled automatically due to severe weather. Full ₹${fullRefund.toLocaleString()} refund processed without human intervention.`,
              pnr: b.pnr,
              type: 'REFUND_RECEIPT'
            });

            aiVoice.announceWeatherAutoCancellation(
              b.flight.flightNumber,
              fullRefund,
              condition,
              hazardousAirport.code
            );

            const autoCancelledBooking = {
              ...b,
              status: 'Cancelled' as FlightStatus,
              cancellationReason: `AI Automated Doppler Alert: Flight ${b.flight.flightNumber} grounded due to hazardous ${condition} at ${hazardousAirport.city} (${hazardousAirport.code}). Ticket Auto-Cancelled with 100% Instant Full Refund (₹${fullRefund.toLocaleString()}) without human intervention.`,
              refundAmount: fullRefund,
              refundStatus: 'Processed' as const
            };

            setCurrentBookingSuccess(prevSuccess => {
              if (prevSuccess && prevSuccess.pnr === b.pnr) {
                return autoCancelledBooking;
              }
              return prevSuccess;
            });

            return autoCancelledBooking;
          }
        }
        return b;
      });

      if (changed) {
        airlineDB.saveBookings(updatedList);
      }
      return updatedList;
    });

    if (cancelledCount > 0) {
      addToast(`🚨 AI Watchdog: Auto-cancelled ${cancelledCount} ticket(s) due to hazardous weather without human intervention. 100% full refund disbursed!`, 'error');
    }
  };

  // Run autonomous watchdog every 20 seconds and on weather changes
  useEffect(() => {
    const handleWeatherUpdate = () => {
      checkAndAutoCancelWeatherDisruptedBookings();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('aerowings_weather_updated', handleWeatherUpdate);
    }
    const interval = setInterval(() => {
      checkAndAutoCancelWeatherDisruptedBookings();
    }, 20000);

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('aerowings_weather_updated', handleWeatherUpdate);
      }
      clearInterval(interval);
    };
  }, []);

  // Web Check-in
  const checkInBooking = (pnr: string) => {
    const booking = bookings.find(b => b.pnr === pnr);
    if (!booking) {
      addToast('Booking with this PNR not found', 'error');
      return false;
    }

    setBookings(prev => prev.map(b => {
      if (b.pnr === pnr) {
        return { ...b, status: 'Checked-in' };
      }
      return b;
    }));

    // Dispatch SMS and Email for Web Check-in Boarding Pass
    airlineDB.addSms({
      phoneNumber: booking.contactPhone,
      type: 'BOARDING_PASS',
      title: 'Digital Boarding Pass Ready',
      body: `AeroWings: Check-in confirmed for PNR ${pnr}. Flight ${booking.flight.flightNumber}, Seat: ${booking.passengers[0]?.seatNumber || '12A'}, Gate: ${booking.flight.gate || '22A'}. Security barcode active.`,
      pnr
    });
    airlineDB.addEmail({
      recipientEmail: booking.contactEmail,
      sender: 'boarding@aerowings.airline.com',
      subject: `Your Digital Boarding Pass • PNR ${pnr} [Seat ${booking.passengers[0]?.seatNumber || '12A'}]`,
      previewText: `Web check-in complete. Flight ${booking.flight.flightNumber} departing from Gate ${booking.flight.gate || '22A'}. Show QR at terminal gate.`,
      pnr,
      type: 'BOARDING_PASS'
    });

    addToast(`Web Check-in Successful for PNR ${pnr}! Digital Boarding Pass Ready`, 'success');
    return true;
  };

  const getBookingByPNR = (pnr: string) => {
    const clean = pnr.trim().toUpperCase();
    return bookings.find(b => b.pnr.toUpperCase() === clean);
  };

  // Admin Auth
  const loginAdmin = (user: string, pass: string) => {
    const cleanUser = user.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (
      (cleanUser === 'admin@aerowings.com' && cleanPass === 'admin123') ||
      (cleanUser === 'admin' && cleanPass === 'admin') ||
      (cleanUser === 'admin' && cleanPass === 'admin123') ||
      cleanUser.includes('admin')
    ) {
      setIsAdminAuthenticated(true);
      addToast('Flight Operations Admin Authenticated. Dispatch Console Active.', 'success');
      return true;
    }
    // Still authenticate but advise on credentials
    setIsAdminAuthenticated(true);
    addToast('Admin Access Granted (Demo Mode)', 'info');
    return true;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    setPortalMode('user');
    try {
      localStorage.removeItem('aerowings_admin_unlocked');
    } catch {}
    addToast('Logged out from Admin Console', 'info');
  };

  const unlockAdminPortal = (secretId: string): boolean => {
    const cleanId = secretId.trim();
    if (cleanId === 'AK8971541794M') {
      setPortalMode('admin');
      setIsAdminAuthenticated(true);
      try {
        localStorage.setItem('aerowings_admin_unlocked', 'AK8971541794M');
      } catch {}
      addToast('🔓 AeroWings Prestige Operations Control Center authorized and unlocked.', 'success');
      aiVoice.speak('Operations Control Center authorized.');
      return true;
    } else {
      addToast('❌ Invalid Authorized ID / Number. Access denied.', 'error');
      aiVoice.speak('Access denied. Invalid administrator ID.');
      return false;
    }
  };

  const updateUserProfile = (profile: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...profile }));
    addToast('User Profile Updated', 'success');
  };

  const updateNotificationPreferences = (prefs: Partial<NotificationPreferences>) => {
    setNotificationPreferences(prev => ({ ...prev, ...prefs }));
    addToast('Notification settings and active alert channels saved', 'success');
  };

  const sendFlightNotification = (notification: Omit<FlightNotification, 'id' | 'timestamp' | 'read'>) => {
    const savedLinkedPhone = typeof localStorage !== 'undefined' ? localStorage.getItem('aerowings_linked_phone') : null;
    const recipientPhone = notification.recipientPhone || notificationPreferences.smsPhone || userProfile.phone || savedLinkedPhone || '';
    const recipientEmail = notification.recipientEmail || notificationPreferences.emailAddress || userProfile.email || 'passenger@aerowings.com';

    const newNotif: FlightNotification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      read: false,
      recipientPhone,
      recipientEmail,
    };

    setNotifications(prev => [newNotif, ...prev]);

    // Automatically deliver to SMS Simulator / Linked Phone inbox
    if (newNotif.channel === 'sms' || newNotif.channel === 'all') {
      const smsType = newNotif.type === 'weather_alert' ? 'WEATHER_ALERT' 
        : newNotif.type === 'cancellation' ? 'REFUND' 
        : newNotif.type === 'gate_change' ? 'GATE_UPDATE' 
        : 'BOOKING_CONFIRMATION';

      airlineDB.addSms({
        phoneNumber: recipientPhone,
        type: smsType,
        pnr: newNotif.pnr,
        title: `✈️ ${newNotif.title}`,
        body: `AeroWings Alert (${newNotif.flightNumber || newNotif.pnr}): ${newNotif.message}`,
      });
    }

    const channelTag = newNotif.channel === 'all' ? 'SMS & Email' : newNotif.channel.toUpperCase();
    addToast(`📲 Real-Time ${channelTag} Dispatched to ${recipientPhone}`, 'info');
    aiVoice.speak(`Flight update for ${newNotif.flightNumber}: ${newNotif.title}`);
  };

  const simulateFlightStatusChange = (pnr: string, changeType: 'delay' | 'gate_change' | 'boarding' | 'weather' | 'baggage') => {
    const targetBooking = bookings.find(b => b.pnr.toUpperCase() === pnr.toUpperCase()) || bookings[0];
    if (!targetBooking) {
      addToast('No booking found to simulate status change', 'error');
      return;
    }

    const flight = targetBooking.flight;
    const flightCode = `${flight.airlineCode || 'AW'}-${flight.flightNumber}`;

    if (changeType === 'delay') {
      const delayMinutes = 30;
      const newTime = '07:15 AM';
      setFlights(prev => prev.map(f => f.id === flight.id ? { ...f, status: 'Delayed' as FlightStatus, delayMinutes, delayReason: 'Air Traffic Control Departure Sequencing' } : f));
      
      sendFlightNotification({
        pnr: targetBooking.pnr,
        flightNumber: flightCode,
        type: 'delay',
        title: `Flight Delayed by ${delayMinutes} mins (New Departure: ${newTime})`,
        message: `AeroWings Alert: Flight ${flightCode} (${flight.origin.city} → ${flight.destination.city}) departure rescheduled to ${newTime} due to ATC airspace sequencing. Complimentary lounge refreshments available.`,
        channel: notificationPreferences.smsEnabled && notificationPreferences.emailEnabled ? 'all' : notificationPreferences.smsEnabled ? 'sms' : 'email',
        details: {
          oldValue: flight.departureTime,
          newValue: newTime,
          reason: 'ATC Airspace Sequencing Congestion',
          estimatedTime: newTime
        }
      });
    } else if (changeType === 'gate_change') {
      const newGate = '18B';
      const term = flight.terminal || 'T3';
      setFlights(prev => prev.map(f => f.id === flight.id ? { ...f, gate: newGate } : f));

      sendFlightNotification({
        pnr: targetBooking.pnr,
        flightNumber: flightCode,
        type: 'gate_change',
        title: `Gate Changed to Gate ${newGate} (Terminal ${term})`,
        message: `Gate Change Notice: Flight ${flightCode} to ${flight.destination.city} will now depart from Gate ${newGate} (Terminal ${term}). Please proceed directly to Gate ${newGate}.`,
        channel: 'all',
        details: {
          oldValue: `Gate ${flight.gate || '22A'}`,
          newValue: `Gate ${newGate}`,
          gate: newGate,
          terminal: term
        }
      });
    } else if (changeType === 'boarding') {
      setFlights(prev => prev.map(f => f.id === flight.id ? { ...f, status: 'Boarding' as FlightStatus } : f));

      sendFlightNotification({
        pnr: targetBooking.pnr,
        flightNumber: flightCode,
        type: 'boarding',
        title: `Now Boarding at Gate ${flight.gate || '22A'}`,
        message: `Final Call: Boarding for AeroWings Flight ${flightCode} is now active at Gate ${flight.gate || '22A'}. Please have your boarding pass and photo ID ready for immediate scanning.`,
        channel: 'sms',
        details: {
          gate: flight.gate || '22A',
          terminal: flight.terminal || 'T3'
        }
      });
    } else if (changeType === 'weather') {
      sendFlightNotification({
        pnr: targetBooking.pnr,
        flightNumber: flightCode,
        type: 'weather_alert',
        title: `AI Weather Doppler: Clear Cruising Route`,
        message: `Corridor Doppler Scan: Winds 8 km/h, visibility 12 km at ${flight.origin.city} (${flight.origin.code}). Turbulence Risk: Minimal (8/100). Smooth flight expected.`,
        channel: 'email',
        details: {
          reason: 'Atmospheric scan confirmed 100% flight clearance'
        }
      });
    } else if (changeType === 'baggage') {
      sendFlightNotification({
        pnr: targetBooking.pnr,
        flightNumber: flightCode,
        type: 'baggage_belt',
        title: `Baggage Ready: Carousel Belt 04`,
        message: `Baggage Claim: Checked bags from flight ${flightCode} are arriving on Carousel Belt 04 at ${flight.destination.city} Terminal Arrival Hall.`,
        channel: 'sms',
        details: {
          carousel: 'Belt 04',
          terminal: flight.destination.terminal || 'T2'
        }
      });
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    addToast('All notifications marked as read', 'info');
  };

  const clearNotifications = () => {
    setNotifications([]);
    addToast('Notification history cleared', 'info');
  };

  return (
    <AirlineContext.Provider
      value={{
        aiLanguage,
        setAiLanguage,
        portalMode,
        setPortalMode,
        userView,
        setUserView,
        adminView,
        setAdminView,
        currency,
        setCurrency,
        flights,
        addFlight,
        updateFlight,
        deleteFlight,
        updateFlightStatus,
        resetDefaultFlights,
        searchParams,
        setSearchParams,
        performSearch,
        selectedFlight,
        setSelectedFlight,
        selectedReturnFlight,
        setSelectedReturnFlight,
        passengers,
        setPassengers,
        updatePassenger,
        selectedSeats,
        assignSeat,
        removeSeat,
        hasInsurance,
        setHasInsurance,
        hasPriorityBoarding,
        setHasPriorityBoarding,
        appliedOffer,
        promoCode: appliedOffer?.code || null,
        discountAmount: calculateFareBreakdown().couponDiscount,
        applyPromoCode,
        removePromoCode,
        verifiedBookingPhone,
        setVerifiedBookingPhone,
        calculateFareBreakdown,
        completeBooking,
        executeVoiceBooking,
        currentBookingSuccess,
        setCurrentBookingSuccess,
        bookings,
        cancelBooking,
        instantWeatherRefund,
        instantWeatherRebook,
        triggerWeatherDisruption,
        checkAndAutoCancelWeatherDisruptedBookings,
        aiAutoCancelFlight,
        checkInBooking,
        getBookingByPNR,
        isAdminAuthenticated,
        loginAdmin,
        logoutAdmin,
        unlockAdminPortal,
        userProfile,
        updateUserProfile,
        toasts,
        addToast,
        showToast: addToast,
        removeToast,
        trackedPNR,
        setTrackedPNR,
        isTicketLookupOpen,
        setIsTicketLookupOpen,
        notifications,
        notificationPreferences,
        updateNotificationPreferences,
        sendFlightNotification,
        simulateFlightStatusChange,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
        isVoiceModeActive,
        toggleVoiceMode,
        setVoiceMode,
        multiCitySegments,
        setMultiCitySegments,
        hasGstNumber,
        setHasGstNumber,
        gstin,
        setGstin,
        companyName,
        setCompanyName,
        hasPriceDropProtection,
        setHasPriceDropProtection,
      }}
    >
      {children}
    </AirlineContext.Provider>
  );
};

export const useAirline = () => {
  const context = useContext(AirlineContext);
  if (!context) {
    throw new Error('useAirline must be used within an AirlineProvider');
  }
  return context;
};
