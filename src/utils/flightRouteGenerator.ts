import { Airport, Flight, RouteType, WeatherCondition, CompetitorComparison, AIPrediction } from '../types/airline';
import { AIRPORTS } from '../data/mockData';

// Coordinates lookup for distance and flight duration calculation
const AIRPORT_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // India
  BLR: { lat: 13.1986, lng: 77.7066 },
  IXE: { lat: 12.9613, lng: 74.8900 },
  MYQ: { lat: 12.2300, lng: 76.6500 },
  HBX: { lat: 15.3617, lng: 75.0849 },
  IXG: { lat: 15.8593, lng: 74.6183 },
  BOM: { lat: 19.0896, lng: 72.8656 },
  PNQ: { lat: 18.5822, lng: 73.9197 },
  NAG: { lat: 21.0922, lng: 79.0472 },
  IXU: { lat: 19.8631, lng: 75.3981 },
  DEL: { lat: 28.5562, lng: 77.1000 },
  MAA: { lat: 12.9941, lng: 80.1709 },
  CJB: { lat: 11.0298, lng: 77.0434 },
  IXM: { lat: 9.8345, lng: 78.0934 },
  TRZ: { lat: 10.7654, lng: 78.7097 },
  HYD: { lat: 17.2403, lng: 78.4294 },
  VTZ: { lat: 17.7214, lng: 83.2245 },
  VGA: { lat: 16.5304, lng: 80.7968 },
  TIR: { lat: 13.6325, lng: 79.5434 },
  COK: { lat: 10.1518, lng: 76.3930 },
  TRV: { lat: 8.4821, lng: 76.9200 },
  CCJ: { lat: 11.1368, lng: 75.9553 },
  CNN: { lat: 11.9173, lng: 75.5484 },
  AMD: { lat: 23.0772, lng: 72.6347 },
  STV: { lat: 21.1141, lng: 72.7419 },
  BDQ: { lat: 22.3361, lng: 73.2264 },
  JAI: { lat: 26.8242, lng: 75.8122 },
  UDR: { lat: 24.6177, lng: 73.8961 },
  JDH: { lat: 26.2511, lng: 73.0489 },
  CCU: { lat: 22.6547, lng: 88.4467 },
  IXB: { lat: 26.6812, lng: 88.3286 },
  LKO: { lat: 26.7606, lng: 80.8893 },
  VNS: { lat: 25.4524, lng: 82.8593 },
  AYJ: { lat: 26.7456, lng: 82.1489 },
  PAT: { lat: 25.5913, lng: 85.0880 },
  IXC: { lat: 30.6735, lng: 76.7885 },
  ATQ: { lat: 31.7096, lng: 74.7973 },
  GOI: { lat: 15.3808, lng: 73.8314 },
  GOX: { lat: 15.7275, lng: 73.8647 },
  BBI: { lat: 20.2444, lng: 85.8178 },
  GAU: { lat: 26.1061, lng: 91.5859 },
  SXR: { lat: 33.9871, lng: 74.7742 },
  IDR: { lat: 22.7217, lng: 75.8011 },

  // Middle East
  DXB: { lat: 25.2532, lng: 55.3657 },
  AUH: { lat: 24.4330, lng: 54.6511 },
  DOH: { lat: 25.2731, lng: 51.6081 },
  KWI: { lat: 29.2267, lng: 47.9789 },
  RUH: { lat: 24.9576, lng: 46.6988 },
  JED: { lat: 21.6796, lng: 39.1565 },
  MCT: { lat: 23.5933, lng: 58.2844 },
  BAH: { lat: 26.2708, lng: 50.6336 },

  // Europe & UK
  LHR: { lat: 51.4700, lng: -0.4543 },
  LGW: { lat: 51.1537, lng: -0.1821 },
  MAN: { lat: 53.3537, lng: -2.2750 },
  CDG: { lat: 49.0097, lng: 2.5479 },
  ORY: { lat: 48.7262, lng: 2.3652 },
  FRA: { lat: 50.0379, lng: 8.5622 },
  MUC: { lat: 48.3537, lng: 11.7750 },
  AMS: { lat: 52.3105, lng: 4.7683 },
  ZRH: { lat: 47.4582, lng: 8.5555 },
  FCO: { lat: 41.8003, lng: 12.2389 },
  MAD: { lat: 40.4839, lng: -3.5680 },
  BCN: { lat: 41.2974, lng: 2.0833 },
  IST: { lat: 41.2753, lng: 28.7519 },
  VIE: { lat: 48.1103, lng: 16.5697 },
  DUB: { lat: 53.4264, lng: -6.2499 },

  // Americas
  JFK: { lat: 40.6413, lng: -73.7781 },
  EWR: { lat: 40.6895, lng: -74.1745 },
  SFO: { lat: 37.6213, lng: -122.3790 },
  ORD: { lat: 41.9742, lng: -87.9073 },
  LAX: { lat: 33.9416, lng: -118.4085 },
  SEA: { lat: 47.4502, lng: -122.3088 },
  DFW: { lat: 32.8998, lng: -97.0403 },
  BOS: { lat: 42.3656, lng: -71.0096 },
  ATL: { lat: 33.6407, lng: -84.4277 },
  YYZ: { lat: 43.6777, lng: -79.6248 },
  YVR: { lat: 49.1967, lng: -123.1815 },
  YUL: { lat: 45.4706, lng: -73.7408 },
  GRU: { lat: -23.4356, lng: -46.4731 },

  // Asia Pacific & Oceania & Africa
  SIN: { lat: 1.3644, lng: 103.9915 },
  BKK: { lat: 13.6900, lng: 100.7501 },
  HKT: { lat: 8.1132, lng: 98.3169 },
  KUL: { lat: 2.7456, lng: 101.7072 },
  DPS: { lat: -8.7482, lng: 115.1672 },
  CGK: { lat: -6.1275, lng: 106.6537 },
  HKG: { lat: 22.3080, lng: 113.9185 },
  HND: { lat: 35.5494, lng: 139.7798 },
  NRT: { lat: 35.7720, lng: 140.3929 },
  ICN: { lat: 37.4602, lng: 126.4407 },
  SYD: { lat: -33.9399, lng: 151.1753 },
  MEL: { lat: -37.6690, lng: 144.8410 },
  AKL: { lat: -37.0082, lng: 174.7850 },
  JNB: { lat: -26.1367, lng: 28.2411 },
  NBO: { lat: -1.3192, lng: 36.9278 },
  CAI: { lat: 30.1219, lng: 31.4056 }
};

// Calculate Great Circle Distance in Kilometers
function calculateDistanceKm(code1: string, code2: string): number {
  const c1 = AIRPORT_COORDINATES[code1.toUpperCase()] || { lat: 20.0, lng: 77.0 };
  const c2 = AIRPORT_COORDINATES[code2.toUpperCase()] || { lat: 25.0, lng: 80.0 };

  const R = 6371; // Earth radius in km
  const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
  const dLng = ((c2.lng - c1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1.lat * Math.PI) / 180) *
      Math.cos((c2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export function getAirportByCode(code: string): Airport {
  const match = AIRPORTS.find(a => a.code.toUpperCase() === code.toUpperCase());
  if (match) return match;
  return {
    code: code.toUpperCase(),
    name: `${code.toUpperCase()} International Airport`,
    city: code.toUpperCase(),
    state: 'Global Gateway',
    country: 'International',
    terminal: 'T1',
    isInternational: true,
  };
}

export function generateFlightsForRoute(originCode: string, destinationCode: string): Flight[] {
  if (!originCode || !destinationCode || originCode.toUpperCase() === destinationCode.toUpperCase()) {
    return [];
  }

  const origin = getAirportByCode(originCode);
  const dest = getAirportByCode(destinationCode);

  const isIntraState = origin.state && dest.state && origin.state === dest.state && origin.country === dest.country;
  const isInternational = origin.country !== dest.country;
  const routeType: RouteType = isIntraState ? 'intra_state' : isInternational ? 'international' : 'inter_state';

  const distanceKm = calculateDistanceKm(origin.code, dest.code);

  // Calculate realistic flight duration based on actual physical distance
  let calculatedDurationMins: number;
  if (distanceKm < 300) {
    calculatedDurationMins = Math.max(45, Math.round(distanceKm / 6.5) + 20); // Short turboprop
  } else if (distanceKm < 2000) {
    calculatedDurationMins = Math.round(distanceKm / 13) + 30; // Domestic jet (e.g. 1700km = 160m = 2h 40m)
  } else if (distanceKm < 6000) {
    calculatedDurationMins = Math.round(distanceKm / 14) + 40; // Medium haul (e.g. 5000km = 397m = 6h 37m)
  } else {
    calculatedDurationMins = Math.round(distanceKm / 14.5) + 45; // Long haul (e.g. 12000km = 872m = 14h 32m)
  }

  // Calculate realistic base economy fare
  let baseEconomyFare: number;
  if (isIntraState) {
    baseEconomyFare = 2400 + Math.floor(Math.min(distanceKm * 4.5, 2200));
  } else if (!isInternational) {
    baseEconomyFare = 4200 + Math.floor(distanceKm * 2.1);
  } else {
    // International tiered pricing
    if (distanceKm < 3000) {
      baseEconomyFare = 16500 + Math.floor(distanceKm * 3.5); // Middle East / SE Asia
    } else if (distanceKm < 7500) {
      baseEconomyFare = 34500 + Math.floor(distanceKm * 4.2); // Europe / Africa / East Asia
    } else {
      baseEconomyFare = 62000 + Math.floor(distanceKm * 4.8); // Americas / Australia
    }
  }

  // Select appropriate realistic airlines based on route regions
  interface AirlineSlot {
    airline: string;
    airlineCode: string;
    flightPrefix: string;
    aircraft: string;
    depTime: string;
    stops: number;
    layoverAirport?: string;
    layoverDuration?: string;
    durationExtraMins: number;
    priceMod: number;
    terminal: string;
    rating: number;
  }

  let airlineSlots: AirlineSlot[] = [];

  if (isIntraState) {
    airlineSlots = [
      {
        airline: 'AeroWings StateShuttle',
        airlineCode: 'AW',
        flightPrefix: 'AW-1',
        aircraft: 'ATR 72-600 Turboprop',
        depTime: '06:45',
        stops: 0,
        durationExtraMins: 0,
        priceMod: 1.0,
        terminal: origin.terminal || 'T1',
        rating: 4.8
      },
      {
        airline: 'IndiGo Regional',
        airlineCode: '6E',
        flightPrefix: '6E-7',
        aircraft: 'ATR 72-600',
        depTime: '10:15',
        stops: 0,
        durationExtraMins: 5,
        priceMod: 0.94,
        terminal: origin.terminal || 'T1',
        rating: 4.7
      },
      {
        airline: 'AeroWings Regional Express',
        airlineCode: 'AW',
        flightPrefix: 'AW-2',
        aircraft: 'Airbus A320neo',
        depTime: '15:30',
        stops: 0,
        durationExtraMins: 0,
        priceMod: 1.05,
        terminal: origin.terminal || 'T1',
        rating: 4.9
      },
      {
        airline: 'Alliance Air',
        airlineCode: '9I',
        flightPrefix: '9I-8',
        aircraft: 'ATR 72-600',
        depTime: '19:40',
        stops: 0,
        durationExtraMins: 10,
        priceMod: 0.92,
        terminal: origin.terminal || 'T1',
        rating: 4.5
      }
    ];
  } else if (!isInternational) {
    // Domestic Interstate across India
    airlineSlots = [
      {
        airline: 'AeroWings Premier',
        airlineCode: 'AW',
        flightPrefix: 'AW-3',
        aircraft: 'Airbus A321neo ACF',
        depTime: '06:00',
        stops: 0,
        durationExtraMins: 0,
        priceMod: 1.02,
        terminal: origin.terminal || 'T1',
        rating: 4.9
      },
      {
        airline: 'IndiGo Airlines',
        airlineCode: '6E',
        flightPrefix: '6E-5',
        aircraft: 'Airbus A320neo',
        depTime: '08:45',
        stops: 0,
        durationExtraMins: 5,
        priceMod: 0.93,
        terminal: origin.terminal || 'T1',
        rating: 4.8
      },
      {
        airline: 'Air India',
        airlineCode: 'AI',
        flightPrefix: 'AI-8',
        aircraft: 'Airbus A350-900',
        depTime: '13:15',
        stops: 0,
        durationExtraMins: 0,
        priceMod: 1.06,
        terminal: origin.terminal || 'T3',
        rating: 4.7
      },
      {
        airline: 'Akasa Air',
        airlineCode: 'QP',
        flightPrefix: 'QP-1',
        aircraft: 'Boeing 737 MAX 8',
        depTime: '17:30',
        stops: 0,
        durationExtraMins: 5,
        priceMod: 0.91,
        terminal: origin.terminal || 'T1',
        rating: 4.7
      },
      {
        airline: 'AeroWings Nightliner',
        airlineCode: 'AW',
        flightPrefix: 'AW-9',
        aircraft: 'Airbus A321neo',
        depTime: '21:15',
        stops: 0,
        durationExtraMins: 0,
        priceMod: 0.96,
        terminal: origin.terminal || 'T2',
        rating: 4.8
      },
      {
        airline: 'Vistara / AI Express',
        airlineCode: 'IX',
        flightPrefix: 'IX-4',
        aircraft: 'Boeing 737-800',
        depTime: '23:10',
        stops: 0,
        durationExtraMins: 10,
        priceMod: 0.89,
        terminal: origin.terminal || 'T1',
        rating: 4.6
      }
    ];
  } else {
    // Global International Flights
    const isAmericasOrAustralia = distanceKm > 8000;
    const isMiddleEast = ['DXB', 'AUH', 'DOH', 'KWI', 'RUH', 'JED', 'MCT', 'BAH'].includes(dest.code) || ['DXB', 'AUH', 'DOH'].includes(origin.code);
    const isEurope = ['LHR', 'LGW', 'MAN', 'CDG', 'ORY', 'FRA', 'MUC', 'AMS', 'ZRH', 'FCO', 'MAD', 'BCN', 'IST', 'VIE', 'DUB'].includes(dest.code);
    const isFarEast = ['SIN', 'BKK', 'HKT', 'KUL', 'DPS', 'CGK', 'HKG', 'HND', 'NRT', 'ICN'].includes(dest.code);

    airlineSlots = [
      {
        airline: 'AeroWings World Flagship',
        airlineCode: 'AW',
        flightPrefix: 'AW-7',
        aircraft: 'Boeing 787-9 Dreamliner',
        depTime: '02:30',
        stops: 0,
        durationExtraMins: 0,
        priceMod: 1.05,
        terminal: origin.terminal || 'T3',
        rating: 4.9
      },
      {
        airline: isMiddleEast ? 'Emirates' : isEurope ? 'British Airways' : isFarEast ? 'Singapore Airlines' : 'Emirates Global',
        airlineCode: isMiddleEast ? 'EK' : isEurope ? 'BA' : isFarEast ? 'SQ' : 'EK',
        flightPrefix: isMiddleEast ? 'EK-5' : isEurope ? 'BA-1' : isFarEast ? 'SQ-4' : 'EK-2',
        aircraft: 'Boeing 777-300ER',
        depTime: '08:15',
        stops: 0,
        durationExtraMins: 0,
        priceMod: 1.15,
        terminal: origin.terminal || 'T2',
        rating: 4.95
      },
      {
        airline: 'Air India International',
        airlineCode: 'AI',
        flightPrefix: 'AI-1',
        aircraft: 'Airbus A350-900',
        depTime: '12:45',
        stops: 0,
        durationExtraMins: 10,
        priceMod: 0.98,
        terminal: origin.terminal || 'T3',
        rating: 4.75
      },
      {
        airline: isAmericasOrAustralia ? 'Qatar Airways (via Doha)' : isEurope ? 'Lufthansa' : 'Qatar Airways',
        airlineCode: isEurope && !isAmericasOrAustralia ? 'LH' : 'QR',
        flightPrefix: isEurope && !isAmericasOrAustralia ? 'LH-7' : 'QR-5',
        aircraft: 'Airbus A350-1000',
        depTime: '19:20',
        stops: isAmericasOrAustralia ? 1 : 0,
        layoverAirport: isAmericasOrAustralia ? 'DOH (Hamad International, Doha)' : undefined,
        layoverDuration: isAmericasOrAustralia ? '2h 15m' : undefined,
        durationExtraMins: isAmericasOrAustralia ? 150 : 15,
        priceMod: 1.12,
        terminal: origin.terminal || 'T3',
        rating: 4.9
      },
      {
        airline: 'AeroWings Global Express',
        airlineCode: 'AW',
        flightPrefix: 'AW-8',
        aircraft: 'Boeing 787-9 Dreamliner',
        depTime: '23:55',
        stops: 0,
        durationExtraMins: 0,
        priceMod: 0.97,
        terminal: origin.terminal || 'T3',
        rating: 4.85
      }
    ];
  }

  return airlineSlots.map((slot, idx): Flight => {
    const totalFlightDuration = calculatedDurationMins + slot.durationExtraMins;
    const hours = Math.floor(totalFlightDuration / 60);
    const mins = totalFlightDuration % 60;
    const durStr = `${hours}h ${mins}m`;

    const depParts = slot.depTime.split(':');
    const depHour = parseInt(depParts[0], 10);
    const depMin = parseInt(depParts[1], 10);
    const totalDepMinutes = depHour * 60 + depMin;
    const totalArrMinutes = (totalDepMinutes + totalFlightDuration) % (24 * 60);
    const arrHour = Math.floor(totalArrMinutes / 60).toString().padStart(2, '0');
    const arrMinute = (totalArrMinutes % 60).toString().padStart(2, '0');
    const arrTime = `${arrHour}:${arrMinute}`;

    const numSeed = Math.abs(
      (originCode.charCodeAt(0) * 17 +
        destinationCode.charCodeAt(0) * 23 +
        (destinationCode.charCodeAt(1) || 65) * 11 +
        idx * 73) %
        899
    );
    const flightNum = `${slot.flightPrefix}${100 + numSeed}`;

    const economyFare = Math.round(baseEconomyFare * slot.priceMod);
    const premiumEconomyFare = Math.round(economyFare * 1.55);
    const businessFare = Math.round(economyFare * 2.85);
    const firstFare = Math.round(economyFare * 4.6);

    // Weather generation based on route type
    const weatherConditions: WeatherCondition['condition'][] = ['Clear', 'Partly Cloudy', 'Clear', 'Clear'];
    const selectedCondition = weatherConditions[idx % weatherConditions.length];

    const weather: WeatherCondition = {
      condition: selectedCondition,
      temperatureC: isInternational ? 22 : 28,
      visibilityKm: 10,
      windSpeedKmh: 12 + (idx * 2),
      stormIndex: 4,
      aiRiskScore: 3,
      aiCancellationRisk: 'Low',
      isAiAutoCancelled: false,
    };

    const competitorPrices: CompetitorComparison[] = [
      {
        competitorName: slot.airline.includes('IndiGo') ? 'Air India' : 'IndiGo Airlines',
        price: Math.round(economyFare * 1.05),
        difference: -Math.round(economyFare * 0.05),
        baggageIncluded: isInternational ? '23 kg' : '15 kg',
        mealIncluded: isInternational ? 'Complimentary' : 'Paid',
      },
      {
        competitorName: 'Global Aggregator Average',
        price: Math.round(economyFare * 1.08),
        difference: -Math.round(economyFare * 0.08),
        baggageIncluded: isInternational ? '30 kg' : '15 kg',
        mealIncluded: 'Standard',
      }
    ];

    const aiPrediction: AIPrediction = {
      fareTrend: idx === 0 ? 'stable' : idx === 1 ? 'rising_soon' : 'stable',
      predictedPriceChangePercent: idx === 1 ? 14 : 0,
      fareTrendExplanation: `AI Corridor Insight: Strong demand detected between ${origin.city} and ${dest.city}. Fares predicted to rise within 48 hours.`,
      onTimeProbability: 95 + (idx % 4),
      bestTimeToBook: 'Book Today for Best Guaranteed Tariff',
      seatRecommendation: isInternational ? 'Row 14-18 Center/Window for quietest cruise altitude.' : 'Row 4-6 for rapid exit.',
      weatherReliabilityScore: 98,
    };

    return {
      id: `FL-DYN-${originCode}-${destinationCode}-${idx + 1}`,
      flightNumber: flightNum,
      airline: slot.airline,
      airlineCode: slot.airlineCode,
      aircraft: slot.aircraft,
      routeType,
      origin,
      destination: dest,
      departureTime: slot.depTime,
      arrivalTime: arrTime,
      duration: durStr,
      durationMinutes: totalFlightDuration,
      stops: slot.stops,
      layoverAirport: slot.layoverAirport,
      layoverDuration: slot.layoverDuration,
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      prices: {
        economy: economyFare,
        premium_economy: premiumEconomyFare,
        business: businessFare,
        first: firstFare,
      },
      availableSeats: {
        economy: Math.max(12, 120 - idx * 14),
        premium_economy: Math.max(4, 24 - idx * 3),
        business: Math.max(2, 16 - idx * 2),
        first: isInternational ? 4 : 0,
      },
      totalSeats: isInternational ? 280 : 186,
      baggageAllowance: {
        cabin: isInternational ? '8 kg Cabin Handbag' : '7 kg Cabin Handbag Included',
        checkIn: isInternational ? '30 kg Check-in (2 Pieces)' : '15 kg Check-in Included',
      },
      amenities: [
        'High-Speed Wi-Fi',
        isInternational ? 'Gourmet Multi-Course Hot Meals & Beverages' : 'Complimentary AeroWings Snacks & Tea',
        'USB-C & Fast AC Power',
        'AeroStream HD Movies & Live TV',
      ],
      status: 'On Time',
      aircraftRegistration: `VT-${slot.airlineCode}${200 + idx * 15}`,
      gate: `${12 + idx * 3}${String.fromCharCode(65 + (idx % 3))}`,
      terminal: slot.terminal,
      weather,
      competitors: competitorPrices,
      avgMarketPrice: Math.round(economyFare * 1.06),
      savingsVsMarket: Math.round(economyFare * 0.06),
      aiPrediction,
    };
  });
}
