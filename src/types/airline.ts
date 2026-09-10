export type UserView = 
  | 'home' 
  | 'results' 
  | 'passengers'
  | 'seats' 
  | 'addons'
  | 'payment'
  | 'passenger_payment' 
  | 'confirmation' 
  | 'dashboard' 
  | 'flight_status'
  | 'timetable'
  | 'experience'
  | 'loyalty'
  | 'deals'
  | 'baggage_guide'
  | 'help'
  | 'about'
  | 'visa_advisor'
  | 'weather_ops';

export type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first';

export type TripType = 'one_way' | 'round_trip' | 'multi_city';

export type RouteType = 'intra_state' | 'inter_state' | 'international';

export type FlightStatus = 'Scheduled' | 'On Time' | 'Delayed' | 'Boarding' | 'Departed' | 'Cancelled';

export type BookingStatus = 'Confirmed' | 'Checked-in' | 'Completed' | 'Cancelled';

export interface Airport {
  code: string;
  name: string;
  city: string;
  state?: string;
  country: string;
  terminal?: string;
  timezone?: string;
  isInternational?: boolean;
}

export interface WeatherCondition {
  condition: 'Clear' | 'Partly Cloudy' | 'Rain' | 'Heavy Thunderstorm' | 'Dense Fog' | 'Typhoon / Cyclone' | 'Blizzard' | 'Severe Crosswinds';
  temperatureC: number;
  visibilityKm: number;
  windSpeedKmh: number;
  stormIndex: number; // 0 to 100
  aiRiskScore: number; // 0 to 100%
  aiCancellationRisk: 'Low' | 'Moderate' | 'High' | 'Critical - Auto Cancelled';
  isAiAutoCancelled?: boolean;
  aiAutoCancelReason?: string;
  compensationOffered?: {
    freeReschedule: boolean;
    fullRefund: boolean;
    mealVoucher: boolean;
    hotelStay: boolean;
  };
}

export interface CompetitorComparison {
  competitorName: string;
  competitorLogo?: string;
  price: number;
  difference: number; // e.g. +1400 (Competitor is 1400 more expensive)
  baggageIncluded: string;
  mealIncluded: string;
}

export interface AIPrediction {
  fareTrend: 'rising_soon' | 'stable' | 'dropping';
  predictedPriceChangePercent: number;
  fareTrendExplanation: string;
  onTimeProbability: number; // 0-100%
  bestTimeToBook: string;
  seatRecommendation: string;
  weatherReliabilityScore: number; // 0-100%
}

export interface Flight {
  id: string;
  flightNumber: string;
  airline: string;
  airlineCode: string;
  airlineLogo?: string;
  aircraft: string;
  routeType: RouteType;
  origin: Airport;
  destination: Airport;
  departureTime: string; // e.g. "06:30"
  arrivalTime: string;   // e.g. "08:45"
  duration: string;      // e.g. "2h 15m"
  durationMinutes: number;
  stops: number;
  layoverAirport?: string;
  layoverDuration?: string;
  daysOfWeek: number[]; // 0 for Sun, 1 for Mon...
  prices: {
    economy: number;
    premium_economy: number;
    business: number;
    first: number;
  };
  availableSeats: {
    economy: number;
    premium_economy: number;
    business: number;
    first: number;
  };
  totalSeats: number;
  baggageAllowance: {
    cabin: string;
    checkIn: string;
  };
  amenities: string[];
  status: FlightStatus;
  delayMinutes?: number;
  delayReason?: string;
  cancellationReason?: string;
  aircraftRegistration?: string; // e.g. "VT-IGO", "VT-AIC", "VT-AWG"
  gate?: string;
  terminal?: string;
  weather: WeatherCondition;
  competitors: CompetitorComparison[];
  avgMarketPrice: number;
  savingsVsMarket: number;
  aiPrediction: AIPrediction;
}

export interface VisaRequirement {
  nationality: string;
  destinationCountry: string;
  purpose: 'tourism' | 'business' | 'transit' | 'student';
  status: 'Visa-Free' | 'eVisa / ETA' | 'Visa on Arrival' | 'Embassy Visa Required';
  statusBadgeColor: string;
  maxStay: string;
  passportValidityMonths: number;
  processingDays: string;
  approxFee: string;
  requirements: string[];
  mandatoryDocuments: string[];
  healthVaccines: string[];
  customsRestrictions: string[];
  officialPortalUrl: string;
  aiRecommendation: string;
}

export interface Seat {
  id: string; // e.g. "12A"
  row: number;
  column: string;
  class: CabinClass;
  price: number;
  isOccupied: boolean;
  isExitRow?: boolean;
  isWindow?: boolean;
  isAisle?: boolean;
  hasExtraLegroom?: boolean;
  powerOutlet?: boolean;
}

export interface Passenger {
  id: string;
  title: 'Mr' | 'Ms' | 'Mrs' | 'Master' | 'Dr';
  firstName: string;
  lastName: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  type: 'adult' | 'child' | 'infant';
  aadhaarNumber?: string;
  panNumber?: string;
  passportNumber?: string;
  visaNumber?: string;
  visaStatus?: 'Verified' | 'Exempt' | 'On-Arrival' | 'Not-Required' | 'Pending';
  isVerified?: boolean;
  verifiedAt?: string;
  nationality?: string;
  seatNumber?: string;
  seatPrice?: number;
  meal?: string;
  mealPrice?: number;
  extraBaggage?: string;
  baggagePrice?: number;
  frequentFlyerNumber?: string;
}

export interface MealOption {
  id: string;
  name: string;
  description: string;
  dietary: 'Veg' | 'Non-Veg' | 'Vegan' | 'Jain' | 'Gluten-Free' | string;
  price: number;
  icon?: string;
  calories?: number;
  isPopular?: boolean;
}

export interface BaggageOption {
  id: string;
  weight: string;
  weightKg?: number;
  label?: string;
  description?: string;
  isIncluded?: boolean;
  price: number;
}

export interface Offer {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minAmount: number;
  expiresOn: string;
  bannerColor: string;
  tag: string;
}

export interface PriceBreakdown {
  baseFare: number;
  taxesAndFees: number;
  seatsTotal: number;
  mealsTotal: number;
  baggageTotal: number;
  insuranceTotal: number;
  priorityBoardingTotal: number;
  specialFareDiscount?: number;
  couponDiscount: number;
  finalTotal: number;
}

export interface Booking {
  id: string;
  pnr: string;
  ticketNumber: string;
  flightId: string;
  flight: Flight;
  returnFlightId?: string;
  returnFlight?: Flight;
  tripType: TripType;
  departureDate: string;
  returnDate?: string;
  cabinClass: CabinClass;
  passengers: Passenger[];
  contactEmail: string;
  contactPhone: string;
  bookingDate: string;
  status: BookingStatus;
  priceBreakdown: PriceBreakdown;
  paymentMethod: 'card' | 'upi' | 'netbanking' | 'wallet';
  paymentId: string;
  hasInsurance: boolean;
  hasPriorityBoarding: boolean;
  specialFare?: 'regular' | 'student' | 'senior' | 'armed_forces' | 'doctors_nurses';
  cancellationReason?: string;
  refundAmount?: number;
  refundStatus?: 'Pending' | 'Processed' | 'Not Applicable';
}

export interface FlightSearchParams {
  tripType: TripType;
  origin: string; // airport code
  destination: string; // airport code
  departureDate: string;
  returnDate?: string;
  cabinClass: CabinClass;
  adults: number;
  children: number;
  infants: number;
  specialFare?: 'regular' | 'student' | 'senior' | 'armed_forces' | 'doctors_nurses';
}

export interface Currency {
  code: 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED';
  symbol: string;
  rateFromINR: number;
}

export interface FlightNotification {
  id: string;
  pnr: string;
  flightNumber: string;
  type: 'delay' | 'gate_change' | 'terminal_change' | 'boarding' | 'weather_alert' | 'baggage_belt' | 'cancellation' | 'checkin_reminder';
  title: string;
  message: string;
  channel: 'sms' | 'email' | 'all';
  timestamp: string;
  read: boolean;
  recipientPhone?: string;
  recipientEmail?: string;
  details?: {
    oldValue?: string;
    newValue?: string;
    reason?: string;
    estimatedTime?: string;
    gate?: string;
    terminal?: string;
    carousel?: string;
  };
}

export interface NotificationPreferences {
  smsEnabled: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsPhone: string;
  emailAddress: string;
  notifyOnDelay: boolean;
  notifyOnGateChange: boolean;
  notifyOnBoarding: boolean;
  notifyOnWeatherAlert: boolean;
}

export type ThemeMode = 'night' | 'day';

export type AiLanguageCode = 'en' | 'hi' | 'kn' | 'te' | 'ta' | 'ml' | 'mr' | 'bn' | 'gu' | 'fr' | 'es' | 'ar' | 'de';

export interface AiLanguageOption {
  code: AiLanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  voiceLang: string;
}
