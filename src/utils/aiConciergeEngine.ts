/**
 * AeroWings AI Concierge Engine
 * Handles natural human-like flight assistance, intelligent spelling & typo correction,
 * dynamic conversational answers (non-repetitive), and actionable booking assistance.
 */

import { AIRPORTS } from '../data/mockData';
import { Flight, Booking } from '../types/airline';
import { airlineDB, ChatMessage } from './airlineDatabase';

// Common city / airport nicknames and spelling mistakes
const CITY_TYPO_MAP: Record<string, { code: string; name: string; city: string }> = {
  // Delhi
  'delh': { code: 'DEL', name: 'Indira Gandhi International Airport', city: 'Delhi' },
  'delhy': { code: 'DEL', name: 'Indira Gandhi International Airport', city: 'Delhi' },
  'dilli': { code: 'DEL', name: 'Indira Gandhi International Airport', city: 'Delhi' },
  'new delhi': { code: 'DEL', name: 'Indira Gandhi International Airport', city: 'Delhi' },
  'ndls': { code: 'DEL', name: 'Indira Gandhi International Airport', city: 'Delhi' },
  // Mumbai
  'bomby': { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai' },
  'bombay': { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai' },
  'mumbay': { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai' },
  'mumbi': { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai' },
  // Bengaluru
  'banglore': { code: 'BLR', name: 'Kempegowda International Airport', city: 'Bengaluru' },
  'bangalore': { code: 'BLR', name: 'Kempegowda International Airport', city: 'Bengaluru' },
  'bengaluru': { code: 'BLR', name: 'Kempegowda International Airport', city: 'Bengaluru' },
  'blore': { code: 'BLR', name: 'Kempegowda International Airport', city: 'Bengaluru' },
  // Chennai
  'chenai': { code: 'MAA', name: 'Chennai International Airport', city: 'Chennai' },
  'madras': { code: 'MAA', name: 'Chennai International Airport', city: 'Chennai' },
  'chennay': { code: 'MAA', name: 'Chennai International Airport', city: 'Chennai' },
  // Hyderabad
  'hydrabad': { code: 'HYD', name: 'Rajiv Gandhi International Airport', city: 'Hyderabad' },
  'hyderbad': { code: 'HYD', name: 'Rajiv Gandhi International Airport', city: 'Hyderabad' },
  'hyd': { code: 'HYD', name: 'Rajiv Gandhi International Airport', city: 'Hyderabad' },
  // Pune
  'puna': { code: 'PNQ', name: 'Pune International Airport', city: 'Pune' },
  'poona': { code: 'PNQ', name: 'Pune International Airport', city: 'Pune' },
  // Kolkata
  'calcuta': { code: 'CCU', name: 'Netaji Subhash Chandra Bose International Airport', city: 'Kolkata' },
  'kolkatta': { code: 'CCU', name: 'Netaji Subhash Chandra Bose International Airport', city: 'Kolkata' },
  'calcutta': { code: 'CCU', name: 'Netaji Subhash Chandra Bose International Airport', city: 'Kolkata' },
  // Goa
  'goaa': { code: 'GOI', name: 'Dabolim Airport', city: 'Goa' },
  'mopa': { code: 'GOI', name: 'Manohar International Airport', city: 'Goa' },
  // Dubai
  'dubay': { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai' },
  'dubaye': { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai' },
  'dxb': { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai' },
  // London
  'londn': { code: 'LHR', name: 'London Heathrow Airport', city: 'London' },
  'heathrow': { code: 'LHR', name: 'London Heathrow Airport', city: 'London' },
  'londone': { code: 'LHR', name: 'London Heathrow Airport', city: 'London' },
  // Singapore
  'singapor': { code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore' },
  'changi': { code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore' },
  'singapoor': { code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore' },
  // New York
  'newyork': { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York' },
  'jfk': { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York' },
  'ny': { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York' }
};

// Common misspellings for aviation terms
const GENERAL_TYPO_MAP: Record<string, { term: string; explanation: string }> = {
  'flite': { term: 'flight', explanation: 'Corrected to "flight"' },
  'fligts': { term: 'flights', explanation: 'Corrected to "flights"' },
  'tikcet': { term: 'ticket', explanation: 'Corrected to "ticket"' },
  'tkt': { term: 'ticket', explanation: 'Understood as "ticket"' },
  'tikets': { term: 'tickets', explanation: 'Corrected to "tickets"' },
  'cancle': { term: 'cancel', explanation: 'Corrected to "cancel booking"' },
  'canclation': { term: 'cancellation', explanation: 'Corrected to "cancellation policy"' },
  'cancelling': { term: 'cancellation', explanation: 'Looking for cancellation rules' },
  'refnd': { term: 'refund', explanation: 'Corrected to "refund status"' },
  'bagage': { term: 'baggage', explanation: 'Corrected to "baggage allowance"' },
  'lugage': { term: 'luggage', explanation: 'Corrected to "luggage allowance"' },
  'chekin': { term: 'check-in', explanation: 'Corrected to "web check-in"' },
  'chek in': { term: 'check-in', explanation: 'Corrected to "web check-in"' },
  'passengr': { term: 'passenger', explanation: 'Corrected to "passenger details"' },
  'wether': { term: 'weather', explanation: 'Corrected to "weather status"' },
  'seets': { term: 'seats', explanation: 'Corrected to "seat selection"' },
  'faras': { term: 'fares', explanation: 'Corrected to "special fares"' }
};

// Helper: Detect city from text
function extractAirportsFromQuery(query: string): { origin?: { code: string; city: string }; dest?: { code: string; city: string }; typoFound?: string } {
  const lower = query.toLowerCase();
  
  let foundCities: { code: string; city: string; originalWord: string }[] = [];

  // Check typos first
  for (const [typo, match] of Object.entries(CITY_TYPO_MAP)) {
    const regex = new RegExp(`\\b${typo}\\b`, 'i');
    if (regex.test(lower)) {
      foundCities.push({ code: match.code, city: match.city, originalWord: typo });
    }
  }

  // Check known airports
  for (const apt of AIRPORTS) {
    const cityRegex = new RegExp(`\\b${apt.city.toLowerCase()}\\b`, 'i');
    const codeRegex = new RegExp(`\\b${apt.code.toLowerCase()}\\b`, 'i');
    if ((cityRegex.test(lower) || codeRegex.test(lower)) && !foundCities.some(c => c.code === apt.code)) {
      foundCities.push({ code: apt.code, city: apt.city, originalWord: apt.city });
    }
  }

  if (foundCities.length >= 2) {
    return {
      origin: { code: foundCities[0].code, city: foundCities[0].city },
      dest: { code: foundCities[1].code, city: foundCities[1].city },
      typoFound: foundCities.find(c => c.originalWord.toLowerCase() !== c.city.toLowerCase())?.originalWord
    };
  } else if (foundCities.length === 1) {
    return {
      dest: { code: foundCities[0].code, city: foundCities[0].city },
      typoFound: foundCities[0].originalWord.toLowerCase() !== foundCities[0].city.toLowerCase() ? foundCities[0].originalWord : undefined
    };
  }

  return {};
}

// Random variation pickers to avoid robotic repetition
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function processUserAiQuery(
  rawInput: string,
  contextData: {
    flights: Flight[];
    bookings: Booking[];
    currentPnr?: string;
  }
): Promise<ChatMessage> {
  const query = rawInput.trim();
  const lower = query.toLowerCase();

  // 1. Check for Typos in user query
  let detectedTypo: ChatMessage['detectedTypo'] | undefined;

  for (const [misspelling, fix] of Object.entries(GENERAL_TYPO_MAP)) {
    const reg = new RegExp(`\\b${misspelling}\\b`, 'i');
    if (reg.test(lower)) {
      detectedTypo = {
        original: misspelling,
        suggested: fix.term,
        reason: fix.explanation
      };
      break;
    }
  }

  // 2. Flight / Route Search Intent (e.g. "delh to bomby", "flights to goa", "pune to mumbai")
  const extracted = extractAirportsFromQuery(query);
  if (extracted.origin && extracted.dest) {
    const origin = extracted.origin;
    const dest = extracted.dest;

    const typoNote = extracted.typoFound 
      ? `(Understood "${extracted.typoFound}" as **${origin.city}**)` 
      : '';

    const matching = contextData.flights.filter(f => f.origin.code === origin.code && f.destination.code === dest.code);
    const lowestFare = matching.length > 0 ? Math.min(...matching.map(f => f.prices.economy)) : 3450;
    const directFlight = matching.find(f => f.stops === 0);

    const intros = [
      `✈️ I found **${matching.length > 0 ? matching.length : 'daily'} scheduled flights** connecting **${origin.city} (${origin.code})** to **${dest.city} (${dest.code})** ${typoNote}.`,
      `🛫 Great choice! We operate regular flights between **${origin.city} (${origin.code})** and **${dest.city} (${dest.code})** ${typoNote}.`,
      `🗺️ Here is what is available on the **${origin.city} → ${dest.city}** corridor:`
    ];

    let text = `${pickRandom(intros)}\n\n`;
    text += `• **Starting Economy Fare:** ₹${lowestFare.toLocaleString()}\n`;
    text += `• **Travel Duration:** ${directFlight ? directFlight.duration : '1h 45m'} (${directFlight ? 'Non-Stop Direct' : 'Direct'})\n`;
    text += `• **Complimentary Inclusions:** 7kg Cabin bag, 15kg Check-in luggage, Free Hot Gourmet Snack & 5G Wi-Fi.\n\n`;
    text += `Would you like me to open the live flight results and seat map for this route?`;

    return {
      id: `ai-msg-${Date.now()}`,
      sender: 'ai',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        `Book ${origin.code} to ${dest.code}`,
        'Check Baggage Allowance',
        'Special Concession Fares',
        'Live Weather at Destination'
      ],
      action: {
        type: 'search_flight',
        label: `View All Flights: ${origin.city} → ${dest.city}`,
        payload: {
          origin: origin.code,
          dest: dest.code,
          originCity: origin.city,
          destCity: dest.city
        }
      },
      detectedTypo: extracted.typoFound ? {
        original: extracted.typoFound,
        suggested: `${origin.city} to ${dest.city}`,
        reason: `Mapped to ${origin.city} (${origin.code}) → ${dest.city} (${dest.code})`
      } : detectedTypo
    };
  }

  if (extracted.dest && !extracted.origin && (lower.includes('flight') || lower.includes('fly') || lower.includes('to') || lower.includes('book') || lower.includes('show'))) {
    const dest = extracted.dest;
    return {
      id: `ai-msg-${Date.now()}`,
      sender: 'ai',
      text: `🌟 AeroWings connects to **${dest.city} (${dest.code})** with multiple non-stop departures from Delhi (DEL), Mumbai (BOM), Bengaluru (BLR), and Chennai (MAA).\n\nEvery booking includes complimentary meals, 15kg baggage allowance, zero convenience fee, and full AI weather disruption protection.\n\nClick below to choose your departure city and view schedules.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        `Delhi to ${dest.city}`,
        `Mumbai to ${dest.city}`,
        `Bengaluru to ${dest.city}`
      ],
      action: {
        type: 'search_flight',
        label: `Search Flights to ${dest.city}`,
        payload: {
          origin: 'DEL',
          dest: dest.code,
          originCity: 'Delhi',
          destCity: dest.city
        }
      }
    };
  }

  // 3. Special Fares & Discounts (Student, Senior, Armed Forces, Doctors, Nurses)
  if (lower.includes('student') || lower.includes('senior') || lower.includes('armed') || lower.includes('defence') || lower.includes('doctor') || lower.includes('nurse') || lower.includes('discount') || lower.includes('special fare')) {
    return {
      id: `ai-msg-${Date.now()}`,
      sender: 'ai',
      text: `🎟️ **AeroWings Official Concession Fares & Special Discounts:**\n\n• 🎓 **Student Concession:** 10% discount on base fare + **10 kg extra check-in baggage** (Total 25 kg).\n• 👴 **Senior Citizens (60+ yrs):** 12% discount on base fare across all domestic flights.\n• 🎖️ **Armed Forces & Paramilitary:** 15% discount on base fare for active personnel & dependants.\n• 🩺 **Doctors & Nurses:** 10% discount on base fare with priority check-in as a token of gratitude.\n\n*Note: Special fares can be selected directly on the Home search bar or during booking.*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        'Search Flights with Special Fare',
        'Student Extra Baggage Rules',
        'Senior Citizen Eligibility'
      ],
      action: {
        type: 'search_flight',
        label: 'Book with Special Concession Fare',
        payload: { origin: 'DEL', dest: 'BOM', originCity: 'Delhi', destCity: 'Mumbai' }
      }
    };
  }

  // 4. PNR / Ticket Retrieval Request
  const pnrMatch = query.toUpperCase().match(/\b(AW-[A-Z0-9]{5,7}|[A-Z0-9]{6})\b/);
  if (pnrMatch || lower.includes('ticket') || lower.includes('pnr') || lower.includes('retrieve') || lower.includes('my booking') || lower.includes('download ticket') || lower.includes('e-ticket') || lower.includes('boarding pass')) {
    const searchPnr = pnrMatch ? pnrMatch[0] : (contextData.currentPnr || (contextData.bookings[0] ? contextData.bookings[0].pnr : ''));
    const booking = searchPnr ? airlineDB.findBookingByPnr(searchPnr) : contextData.bookings[0];

    if (booking) {
      const passengerName = `${booking.passengers[0]?.title} ${booking.passengers[0]?.firstName || 'Passenger'} ${booking.passengers[0]?.lastName}`;
      return {
        id: `ai-msg-${Date.now()}`,
        sender: 'ai',
        text: `🎫 **Active E-Ticket Found!**\n\n• **PNR:** \`${booking.pnr}\`\n• **Passenger:** ${passengerName}\n• **Flight:** ${booking.flight.airlineCode} ${booking.flight.flightNumber} (${booking.flight.origin.city} → ${booking.flight.destination.city})\n• **Departure:** ${booking.departureDate} at **${booking.flight.departureTime}**\n• **Terminal & Gate:** Terminal ${booking.flight.terminal || 'T3'}, Gate ${booking.flight.gate || '22A'}\n• **Seat:** ${booking.passengers[0]?.seatNumber || 'Auto-12A'}\n• **Status:** ${booking.status}\n\nYou can view, download official PDF with barcode, or sync with your Apple / Google Calendar directly below.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: [
          'Download PDF Ticket',
          'Sync with Calendar (.ics)',
          'Change / Add Extra Baggage'
        ],
        action: {
          type: 'view_pnr',
          label: `Open Official Ticket (${booking.pnr})`,
          payload: { pnr: booking.pnr }
        }
      };
    } else {
      return {
        id: `ai-msg-${Date.now()}`,
        sender: 'ai',
        text: `📄 You can retrieve any booking or E-ticket instantly on AeroWings using your **6-character PNR code** or your **Registered Mobile Number / Email**.\n\nClick below to open our 1-click Ticket Retrieval portal or enter your PNR here.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: [
          'Find Ticket by PNR',
          'Find by Mobile Number',
          'Web Check-in Online'
        ],
        action: {
          type: 'view_pnr',
          label: 'Open Ticket Retrieval Portal',
          payload: {}
        }
      };
    }
  }

  // 5. Baggage & Luggage Queries
  if (lower.includes('baggage') || lower.includes('luggage') || lower.includes('weight') || lower.includes('kilos') || lower.includes('kg') || lower.includes('extra bag')) {
    return {
      id: `ai-msg-${Date.now()}`,
      sender: 'ai',
      text: `🧳 **AeroWings Standard & Extra Baggage Guidelines:**\n\n• **Cabin Hand Bag:** 1 piece up to **7 kg** + 1 personal laptop bag / purse (Free for everyone).\n• **Check-in Allowance (Economy):** 1 piece up to **15 kg** included free.\n• **Check-in Allowance (Business / First):** Up to **30 kg - 40 kg** included free.\n• **Student Special:** 15 kg + 10 kg extra = **25 kg check-in allowance**.\n• **Excess Baggage:** Pre-booking extra baggage online saves up to **40%** compared to airport counter charges.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        'Pre-book Extra 5kg / 10kg Baggage',
        'Special Musical / Sports Gear Rules',
        'View Baggage Guide'
      ],
      action: {
        type: 'view_baggage',
        label: 'Open Complete Baggage Guide',
        payload: {}
      }
    };
  }

  // 6. Weather Disruptions, Grounding, Cyclone & Zero-Fee Instant Refunds
  if (lower.includes('weather') || lower.includes('cyclone') || lower.includes('fog') || lower.includes('delay') || lower.includes('storm') || lower.includes('grounded') || lower.includes('refund')) {
    return {
      id: `ai-msg-${Date.now()}`,
      sender: 'ai',
      text: `🌩️ **AeroWings AI Doppler Weather Protection & Zero-Fee Refunds:**\n\n• **Real-Time Doppler Tracking:** Our automated AI system monitors cyclone storms, gale winds, and fog visibility across all 35+ airport stations.\n• **Automatic Grounding:** If crosswinds or visibility fall below safety minimums, flights are immediately grounded for passenger safety.\n• **100% Instant Refund:** 0% cancellation penalty; your payment is refunded immediately with an automated SMS confirmation.\n• **Zero-Cost Rebooking:** Rebook onto the next clear-weather flight with one tap at no additional charge.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        'Launch AI Weather Radar Center',
        'Check Grounded Flight Status',
        'Instant Weather Refund Policy'
      ],
      action: {
        type: 'view_weather',
        label: 'Launch Live AI Weather Radar Center',
        payload: {}
      }
    };
  }

  // 7. Cancellation, Refund Policies, Rescheduling
  if (lower.includes('cancel') || lower.includes('reschedule') || lower.includes('refund policy') || lower.includes('change flight') || lower.includes('penalty')) {
    return {
      id: `ai-msg-${Date.now()}`,
      sender: 'ai',
      text: `🔄 **AeroWings Flexible Cancellation & Modification Rules:**\n\n• **24-Hour Grace Period:** Cancel any flight within 24 hours of booking for a **100% full refund** with zero deductions.\n• **Weather / Operational Cancellations:** 100% instant refund with zero fees.\n• **General Cancellation:** Can be requested up to 2 hours before scheduled departure directly from your My Bookings dashboard.\n• **Flight Rescheduling:** Free date changes available up to 4 hours prior to departure for Flexi fare holders.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        'Cancel My Booking',
        'Reschedule Flight Date',
        'View My Bookings Hub'
      ],
      action: {
        type: 'view_pnr',
        label: 'Manage Booking in Dashboard',
        payload: {}
      }
    };
  }

  // 8. Airport Timings & Departure Guidelines
  if (lower.includes('timing') || lower.includes('how early') || lower.includes('reach airport') || lower.includes('terminal') || lower.includes('gate') || lower.includes('boarding time')) {
    return {
      id: `ai-msg-${Date.now()}`,
      sender: 'ai',
      text: `⏱️ **Airport Arrival & Boarding Checklist:**\n\n• **Domestic Flights:** Arrive at the airport **2 hours before departure**. Baggage drop closes 45 minutes prior.\n• **International Flights:** Arrive **3 hours before departure**. Check-in counters close 60 minutes prior.\n• **Boarding Gate:** Reach your assigned departure gate **30 to 45 minutes before departure**.\n• **Required Documents:** Valid Govt Photo ID (Aadhaar / Voter ID / Passport) + Mobile or Printed QR E-Ticket.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        'View Departure Guide',
        'Instant Web Check-in',
        'My Flight Terminal & Gate'
      ],
      action: {
        type: 'check_in',
        label: 'View Airport Step-by-Step Guide',
        payload: {}
      }
    };
  }

  // 9. Dining, Meals & On-Board Amenities
  if (lower.includes('meal') || lower.includes('food') || lower.includes('snack') || lower.includes('dining') || lower.includes('wifi') || lower.includes('water') || lower.includes('coffee')) {
    return {
      id: `ai-msg-${Date.now()}`,
      sender: 'ai',
      text: `🍽️ **AeroWings In-Flight Dining & Hospitality:**\n\n• **Complimentary Hot Meals:** Included on all medium and long-haul flights.\n• **Special Dietary Choices:** Pure Vegetarian, Jain, Halal, Diabetic, Gluten-Free, and Child Meals available to pre-select at booking.\n• **Beverages:** Unlimited artisan tea, freshly brewed filter coffee, juices, and mineral water.\n• **In-Flight Connectivity:** Free high-speed 5G Wi-Fi for messaging and streaming on all Airbus A350 and Boeing 787 aircraft.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        'Select Special Dietary Meal',
        'View Fleet & Amenities',
        'Book Flight'
      ],
      action: {
        type: 'search_flight',
        label: 'Book Flight with Free Meals',
        payload: { origin: 'DEL', dest: 'BOM', originCity: 'Delhi', destCity: 'Mumbai' }
      }
    };
  }

  // 10. Regional Intra-State Corridors (Maharashtra, Tamil Nadu, Karnataka, Gujarat, Rajasthan, UP)
  if (lower.includes('intra') || lower.includes('regional') || lower.includes('within state') || lower.includes('short hop')) {
    return {
      id: `ai-msg-${Date.now()}`,
      sender: 'ai',
      text: `🏡 **AeroWings Intra-State Regional Network:**\n\nWe connect key state cities with 35-60 minute direct flights:\n• **Maharashtra:** Mumbai (BOM) ↔ Pune (PNQ), Nagpur (NAG)\n• **Tamil Nadu:** Chennai (MAA) ↔ Madurai (IXM), Coimbatore (CJB), Tiruchirappalli (TRZ)\n• **Karnataka:** Bengaluru (BLR) ↔ Mangaluru (IXE)\n• **Gujarat:** Ahmedabad (AMD) ↔ Surat (STV)\n• **Rajasthan:** Jaipur (JAI) ↔ Udaipur (UDR)\n• **Uttar Pradesh:** Lucknow (LKO) ↔ Varanasi (VNS)\n\nFares start at just ₹2,200 with 15kg baggage included.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        'Mumbai to Pune (PNQ)',
        'Chennai to Madurai (IXM)',
        'Jaipur to Udaipur (UDR)'
      ],
      action: {
        type: 'search_flight',
        label: 'Search Intra-State Routes',
        payload: { origin: 'BOM', dest: 'PNQ', originCity: 'Mumbai', destCity: 'Pune' }
      }
    };
  }

  // 11. Customer Support & Contact
  if (lower.includes('contact') || lower.includes('support') || lower.includes('phone number') || lower.includes('helpline') || lower.includes('human') || lower.includes('agent') || lower.includes('call')) {
    return {
      id: `ai-msg-${Date.now()}`,
      sender: 'ai',
      text: `📞 **AeroWings 24/7 Global Passenger Support:**\n\n• **Toll-Free Helpline:** +1 (800) 555-AERO (2376)\n• **Email:** support@aerowings.com\n• **Airport Helpdesks:** Dedicated customer care counters present at Terminal 3 (DEL), Terminal 2 (BOM), Terminal 1 (BLR), and all hub airports.\n\nI can also perform instant flight searches, ticket downloads, and refund status checks for you directly here!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        'Retrieve My E-Ticket',
        'Check Weather Status',
        'Book a Flight'
      ],
      action: {
        type: 'view_pnr',
        label: 'Open Support & Ticket Retrieval',
        payload: {}
      }
    };
  }

  // 12. Dynamic friendly human fallback (conversational & intelligent)
  const greetings = [
    `👋 Hello! I am your AeroWings AI Flight Concierge. I am directly at your service.`,
    `✈️ Welcome! How can I assist you with your flight booking, ticket retrieval, or travel questions today?`,
    `🌟 Warm greetings! Whether you want to check non-stop flights, retrieve your PNR ticket, or check baggage rules, I am here to help.`
  ];

  let responseText = `${pickRandom(greetings)}\n\nHere are some things I can do for you right now:\n\n1. 🔍 **Find Flights & Compare Fares** (e.g. *"Flights from Delhi to Mumbai"* or *"Mumbai to Pune"*)\n2. 🎫 **Retrieve Boarding Passes & E-Tickets** (using your PNR or registered phone)\n3. 🧳 **Check Baggage Allowances & Student / Senior Discounts**\n4. 🌩️ **Live AI Weather Grounding & 100% Instant Refunds**\n5. 🛂 **Verify Visa & Passport Rules for International Travel**`;

  if (detectedTypo) {
    responseText = `💡 *Note: I noticed "${detectedTypo.original}". ${detectedTypo.reason}*\n\n` + responseText;
  }

  return {
    id: `ai-msg-${Date.now()}`,
    sender: 'ai',
    text: responseText,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    suggestions: [
      'Delhi to Mumbai Flights',
      'Mumbai to Pune (Intra-State)',
      'Find My Ticket by PNR',
      'Student & Senior Discounts'
    ],
    detectedTypo
  };
}
