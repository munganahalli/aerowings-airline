import { Airport, Flight, RouteType, WeatherCondition, CompetitorComparison, AIPrediction, FlightStatus } from '../types/airline';
import { AIRPORTS, registerCustomAirport } from '../data/mockData';
import { isAirportWeatherUnsafe, getAirportWeatherImmediate } from './realtimeWeather';

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
  const match = AIRPORTS.find(
    a => a.code.toUpperCase() === code.toUpperCase() || a.city.toLowerCase() === code.trim().toLowerCase()
  );
  if (match) return match;
  return registerCustomAirport(code);
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
        aircraft: 'ATR 72-600 EcoTurboprop',
        depTime: '06:00',
        stops: 0,
        durationExtraMins: 0,
        priceMod: 1.0,
        terminal: origin.terminal || 'T1',
        rating: 4.9
      },
      {
        airline: 'Air Deccan',
        airlineCode: 'DN',
        flightPrefix: 'DN-1',
        aircraft: 'ATR 72-500 SimplyFly',
        depTime: '06:45',
        stops: 0,
        durationExtraMins: 0,
        priceMod: 0.88,
        terminal: origin.terminal || 'T1',
        rating: 4.6
      },
      {
        airline: 'TruJet',
        airlineCode: '2T',
        flightPrefix: '2T-3',
        aircraft: 'ATR 72-600 Regional',
        depTime: '07:30',
        stops: 0,
        durationExtraMins: 5,
        priceMod: 0.90,
        terminal: origin.terminal || 'T1',
        rating: 4.65
      },
      {
        airline: 'Air Costa',
        airlineCode: 'LB',
        flightPrefix: 'LB-2',
        aircraft: 'Embraer E190-E2 Jet',
        depTime: '08:20',
        stops: 0,
        durationExtraMins: -5,
        priceMod: 0.95,
        terminal: origin.terminal || 'T1',
        rating: 4.75
      },
      {
        airline: 'Air Pegasus',
        airlineCode: '9P',
        flightPrefix: '9P-4',
        aircraft: 'ATR 72-600 Turboprop',
        depTime: '09:15',
        stops: 0,
        durationExtraMins: 5,
        priceMod: 0.87,
        terminal: origin.terminal || 'T1',
        rating: 4.55
      },
      {
        airline: 'Air Carnival',
        airlineCode: '2S',
        flightPrefix: '2S-5',
        aircraft: 'ATR 72-500 Commuter',
        depTime: '10:10',
        stops: 0,
        durationExtraMins: 5,
        priceMod: 0.89,
        terminal: origin.terminal || 'T1',
        rating: 4.5
      },
      {
        airline: 'Air Odisha',
        airlineCode: '6O',
        flightPrefix: '6O-6',
        aircraft: 'Beechcraft 1900D Regional',
        depTime: '11:00',
        stops: 0,
        durationExtraMins: 10,
        priceMod: 0.91,
        terminal: origin.terminal || 'T1',
        rating: 4.5
      },
      {
        airline: 'Air Mantra',
        airlineCode: 'M9',
        flightPrefix: 'M9-7',
        aircraft: 'Beechcraft 1900D Turbo',
        depTime: '12:15',
        stops: 0,
        durationExtraMins: 5,
        priceMod: 0.93,
        terminal: origin.terminal || 'T1',
        rating: 4.6
      },
      {
        airline: 'Vayudoot',
        airlineCode: 'V5',
        flightPrefix: 'V5-8',
        aircraft: 'Dornier 228 EcoFeeder',
        depTime: '13:40',
        stops: 0,
        durationExtraMins: 8,
        priceMod: 0.85,
        terminal: origin.terminal || 'T1',
        rating: 4.7
      },
      {
        airline: 'Archana Airways',
        airlineCode: 'KW',
        flightPrefix: 'KW-9',
        aircraft: 'Let L-410 Turbolet',
        depTime: '14:50',
        stops: 0,
        durationExtraMins: 5,
        priceMod: 0.86,
        terminal: origin.terminal || 'T1',
        rating: 4.5
      },
      {
        airline: 'Paramount Airways',
        airlineCode: 'I7',
        flightPrefix: 'I7-1',
        aircraft: 'Embraer E170 Executive Jet',
        depTime: '16:00',
        stops: 0,
        durationExtraMins: -5,
        priceMod: 1.05,
        terminal: origin.terminal || 'T1',
        rating: 4.8
      },
      {
        airline: 'NEPC Airlines',
        airlineCode: 'D5',
        flightPrefix: 'D5-2',
        aircraft: 'Fokker 50 Turboprop',
        depTime: '17:15',
        stops: 0,
        durationExtraMins: 5,
        priceMod: 0.88,
        terminal: origin.terminal || 'T1',
        rating: 4.55
      },
      {
        airline: 'Zooom Air',
        airlineCode: 'ZO',
        flightPrefix: 'ZO-3',
        aircraft: 'Bombardier CRJ200ER Regional',
        depTime: '18:30',
        stops: 0,
        durationExtraMins: -5,
        priceMod: 0.92,
        terminal: origin.terminal || 'T1',
        rating: 4.65
      },
      {
        airline: 'AIX Connect',
        airlineCode: 'I5',
        flightPrefix: 'I5-4',
        aircraft: 'Airbus A320neo',
        depTime: '19:45',
        stops: 0,
        durationExtraMins: 0,
        priceMod: 0.94,
        terminal: origin.terminal || 'T1',
        rating: 4.75
      },
      {
        airline: 'Go First (GoAir)',
        airlineCode: 'G8',
        flightPrefix: 'G8-5',
        aircraft: 'Airbus A320neo FlySmart',
        depTime: '21:00',
        stops: 0,
        durationExtraMins: 0,
        priceMod: 0.90,
        terminal: origin.terminal || 'T1',
        rating: 4.7
      },
      {
        airline: 'AeroWings NightShuttle',
        airlineCode: 'AW',
        flightPrefix: 'AW-9',
        aircraft: 'ATR 72-600',
        depTime: '22:15',
        stops: 0,
        durationExtraMins: 0,
        priceMod: 0.98,
        terminal: origin.terminal || 'T1',
        rating: 4.85
      }
    ];
  } else if (!isInternational) {
    // Domestic Interstate across India - Complete 22 Airlines Roster
    airlineSlots = [
      {
        airline: 'AeroWings Premier',
        airlineCode: 'AW',
        flightPrefix: 'AW-1',
        aircraft: 'Airbus A321neo ACF',
        depTime: '05:30',
        stops: 0,
        durationExtraMins: 0,
        priceMod: 1.0,
        terminal: origin.terminal || 'T1',
        rating: 4.95
      },
      {
        airline: 'Vistara',
        airlineCode: 'UK',
        flightPrefix: 'UK-8',
        aircraft: 'Airbus A321neo FlyHigher',
        depTime: '06:15',
        stops: 0,
        durationExtraMins: 0,
        priceMod: 1.06,
        terminal: origin.terminal || 'T3',
        rating: 4.9
      },
      {
        airline: 'Kingfisher Airlines',
        airlineCode: 'IT',
        flightPrefix: 'IT-3',
        aircraft: 'Airbus A320 Kingfisher Class',
        depTime: '07:00',
        stops: 0,
        durationExtraMins: 0,
        priceMod: 1.04,
        terminal: origin.terminal || 'T2',
        rating: 4.9
      },
      {
        airline: 'Jet Airways',
        airlineCode: '9W',
        flightPrefix: '9W-4',
        aircraft: 'Boeing 737-800 NextGen',
        depTime: '07:45',
        stops: 0,
        durationExtraMins: 0,
        priceMod: 1.02,
        terminal: origin.terminal || 'T1',
        rating: 4.85
      },
      {
        airline: 'Indian Airlines',
        airlineCode: 'IC',
        flightPrefix: 'IC-1',
        aircraft: 'Airbus A320-200 Heritage',
        depTime: '08:30',
        stops: 0,
        durationExtraMins: 0,
        priceMod: 0.96,
        terminal: origin.terminal || 'T3',
        rating: 4.8
      },
      {
        airline: 'Air Sahara',
        airlineCode: 'S2',
        flightPrefix: 'S2-2',
        aircraft: 'Boeing 737-700 Sahara Express',
        depTime: '09:15',
        stops: 0,
        durationExtraMins: 0,
        priceMod: 0.94,
        terminal: origin.terminal || 'T1',
        rating: 4.75
      },
      {
        airline: 'Go First (GoAir)',
        airlineCode: 'G8',
        flightPrefix: 'G8-3',
        aircraft: 'Airbus A320neo FlySmart',
        depTime: '10:00',
        stops: 0,
        durationExtraMins: 0,
        priceMod: 0.91,
        terminal: origin.terminal || 'T1',
        rating: 4.7
      },
      {
        airline: 'AIX Connect',
        airlineCode: 'I5',
        flightPrefix: 'I5-7',
        aircraft: 'Airbus A320neo Connect',
        depTime: '10:45',
        stops: 0,
        durationExtraMins: 0,
        priceMod: 0.92,
        terminal: origin.terminal || 'T1',
        rating: 4.75
      },
      {
        airline: 'Air Costa',
        airlineCode: 'LB',
        flightPrefix: 'LB-6',
        aircraft: 'Embraer E190-E2 Jet',
        depTime: '11:30',
        stops: 0,
        durationExtraMins: -5,
        priceMod: 0.95,
        terminal: origin.terminal || 'T1',
        rating: 4.75
      },
      {
        airline: 'Air Deccan',
        airlineCode: 'DN',
        flightPrefix: 'DN-8',
        aircraft: 'ATR 72-500 SimplyFly',
        depTime: '12:15',
        stops: 0,
        durationExtraMins: 10,
        priceMod: 0.87,
        terminal: origin.terminal || 'T1',
        rating: 4.6
      },
      {
        airline: 'Damania Airways',
        airlineCode: 'D2',
        flightPrefix: 'D2-1',
        aircraft: 'Boeing 737-200 Royal Executive',
        depTime: '13:00',
        stops: 0,
        durationExtraMins: 0,
        priceMod: 0.98,
        terminal: origin.terminal || 'T1',
        rating: 4.8
      },
      {
        airline: 'East-West Airlines',
        airlineCode: '4S',
        flightPrefix: '4S-4',
        aircraft: 'Boeing 737-200 Pioneer',
        depTime: '13:45',
        stops: 0,
        durationExtraMins: 0,
        priceMod: 0.93,
        terminal: origin.terminal || 'T1',
        rating: 4.7
      },
      {
        airline: 'ModiLuft',
        airlineCode: 'OD',
        flightPrefix: 'OD-5',
        aircraft: 'Boeing 737-200 Premium',
        depTime: '14:30',
        stops: 0,
        durationExtraMins: 0,
        priceMod: 0.97,
        terminal: origin.terminal || 'T2',
        rating: 4.75
      },
      {
        airline: 'Paramount Airways',
        airlineCode: 'I7',
        flightPrefix: 'I7-7',
        aircraft: 'Embraer E175 All-Business',
        depTime: '15:15',
        stops: 0,
        durationExtraMins: -5,
        priceMod: 1.08,
        terminal: origin.terminal || 'T1',
        rating: 4.85
      },
      {
        airline: 'TruJet',
        airlineCode: '2T',
        flightPrefix: '2T-8',
        aircraft: 'ATR 72-600 Regional Express',
        depTime: '16:00',
        stops: 0,
        durationExtraMins: 10,
        priceMod: 0.89,
        terminal: origin.terminal || 'T1',
        rating: 4.65
      },
      {
        airline: 'Air Pegasus',
        airlineCode: '9P',
        flightPrefix: '9P-9',
        aircraft: 'ATR 72-600 Southern Link',
        depTime: '16:45',
        stops: 0,
        durationExtraMins: 10,
        priceMod: 0.88,
        terminal: origin.terminal || 'T1',
        rating: 4.6
      },
      {
        airline: 'Air Carnival',
        airlineCode: '2S',
        flightPrefix: '2S-2',
        aircraft: 'ATR 72-500 Express',
        depTime: '17:30',
        stops: 0,
        durationExtraMins: 10,
        priceMod: 0.87,
        terminal: origin.terminal || 'T1',
        rating: 4.55
      },
      {
        airline: 'Air Odisha',
        airlineCode: '6O',
        flightPrefix: '6O-3',
        aircraft: 'Beechcraft 1900D Shuttle',
        depTime: '18:15',
        stops: 0,
        durationExtraMins: 12,
        priceMod: 0.90,
        terminal: origin.terminal || 'T1',
        rating: 4.5
      },
      {
        airline: 'Air Mantra',
        airlineCode: 'M9',
        flightPrefix: 'M9-4',
        aircraft: 'Beechcraft 1900D Turbo',
        depTime: '19:00',
        stops: 0,
        durationExtraMins: 10,
        priceMod: 0.92,
        terminal: origin.terminal || 'T1',
        rating: 4.55
      },
      {
        airline: 'Archana Airways',
        airlineCode: 'KW',
        flightPrefix: 'KW-5',
        aircraft: 'Let L-410 Turbolet Link',
        depTime: '19:45',
        stops: 0,
        durationExtraMins: 12,
        priceMod: 0.86,
        terminal: origin.terminal || 'T1',
        rating: 4.5
      },
      {
        airline: 'NEPC Airlines',
        airlineCode: 'D5',
        flightPrefix: 'D5-6',
        aircraft: 'Fokker 50 Turboprop',
        depTime: '20:30',
        stops: 0,
        durationExtraMins: 10,
        priceMod: 0.88,
        terminal: origin.terminal || 'T1',
        rating: 4.6
      },
      {
        airline: 'Vayudoot',
        airlineCode: 'V5',
        flightPrefix: 'V5-7',
        aircraft: 'Dornier 228 Heritage',
        depTime: '21:15',
        stops: 0,
        durationExtraMins: 10,
        priceMod: 0.85,
        terminal: origin.terminal || 'T1',
        rating: 4.7
      },
      {
        airline: 'Zooom Air',
        airlineCode: 'ZO',
        flightPrefix: 'ZO-8',
        aircraft: 'Bombardier CRJ200ER Jet',
        depTime: '22:00',
        stops: 0,
        durationExtraMins: -5,
        priceMod: 0.91,
        terminal: origin.terminal || 'T1',
        rating: 4.65
      },
      {
        airline: 'AeroWings Nightliner',
        airlineCode: 'AW',
        flightPrefix: 'AW-9',
        aircraft: 'Airbus A321neo LongRange',
        depTime: '23:15',
        stops: 0,
        durationExtraMins: 0,
        priceMod: 0.95,
        terminal: origin.terminal || 'T2',
        rating: 4.9
      }
    ];
  } else {
    // Global International Flights - Including iconic Indian & Global International Carriers
    airlineSlots = [
      {
        airline: 'AeroWings World Flagship',
        airlineCode: 'AW',
        flightPrefix: 'AW-7',
        aircraft: 'Boeing 787-9 Dreamliner',
        depTime: '01:30',
        stops: 0,
        durationExtraMins: 0,
        priceMod: 1.0,
        terminal: origin.terminal || 'T3',
        rating: 4.95
      },
      {
        airline: 'Vistara International',
        airlineCode: 'UK',
        flightPrefix: 'UK-9',
        aircraft: 'Boeing 787-9 Dreamliner',
        depTime: '03:15',
        stops: 0,
        durationExtraMins: 0,
        priceMod: 1.06,
        terminal: origin.terminal || 'T3',
        rating: 4.9
      },
      {
        airline: 'Jet Airways Global',
        airlineCode: '9W',
        flightPrefix: '9W-1',
        aircraft: 'Boeing 777-300ER Premiere',
        depTime: '05:00',
        stops: 0,
        durationExtraMins: 0,
        priceMod: 1.02,
        terminal: origin.terminal || 'T2',
        rating: 4.88
      },
      {
        airline: 'Kingfisher First International',
        airlineCode: 'IT',
        flightPrefix: 'IT-2',
        aircraft: 'Airbus A330-200 Luxury',
        depTime: '06:45',
        stops: 0,
        durationExtraMins: 0,
        priceMod: 1.08,
        terminal: origin.terminal || 'T3',
        rating: 4.92
      },
      {
        airline: 'Indian Airlines International',
        airlineCode: 'IC',
        flightPrefix: 'IC-8',
        aircraft: 'Airbus A321neo LongRange',
        depTime: '08:30',
        stops: 0,
        durationExtraMins: 0,
        priceMod: 0.95,
        terminal: origin.terminal || 'T3',
        rating: 4.8
      },
      {
        airline: 'Air Sahara Global',
        airlineCode: 'S2',
        flightPrefix: 'S2-4',
        aircraft: 'Boeing 737-800 Extended',
        depTime: '10:15',
        stops: 0,
        durationExtraMins: 0,
        priceMod: 0.94,
        terminal: origin.terminal || 'T1',
        rating: 4.75
      },
      {
        airline: 'Go First International',
        airlineCode: 'G8',
        flightPrefix: 'G8-6',
        aircraft: 'Airbus A320neo FlySmart',
        depTime: '12:00',
        stops: 0,
        durationExtraMins: 0,
        priceMod: 0.91,
        terminal: origin.terminal || 'T1',
        rating: 4.7
      },
      {
        airline: 'AIX Connect Global',
        airlineCode: 'I5',
        flightPrefix: 'I5-8',
        aircraft: 'Airbus A320neo',
        depTime: '13:45',
        stops: 0,
        durationExtraMins: 0,
        priceMod: 0.92,
        terminal: origin.terminal || 'T1',
        rating: 4.75
      },
      {
        airline: 'Paramount Global',
        airlineCode: 'I7',
        flightPrefix: 'I7-9',
        aircraft: 'Embraer E190-E2',
        depTime: '15:30',
        stops: 0,
        durationExtraMins: -5,
        priceMod: 1.05,
        terminal: origin.terminal || 'T3',
        rating: 4.82
      },
      {
        airline: 'Damania Airways Intercontinental',
        airlineCode: 'D2',
        flightPrefix: 'D2-7',
        aircraft: 'Boeing 737-800',
        depTime: '17:15',
        stops: 0,
        durationExtraMins: 0,
        priceMod: 0.98,
        terminal: origin.terminal || 'T2',
        rating: 4.78
      },
      {
        airline: 'ModiLuft Express International',
        airlineCode: 'OD',
        flightPrefix: 'OD-8',
        aircraft: 'Boeing 737-800',
        depTime: '19:00',
        stops: 0,
        durationExtraMins: 0,
        priceMod: 0.97,
        terminal: origin.terminal || 'T2',
        rating: 4.76
      },
      {
        airline: 'AeroWings Nightliner Transcontinental',
        airlineCode: 'AW',
        flightPrefix: 'AW-8',
        aircraft: 'Boeing 787-9 Dreamliner',
        depTime: '21:30',
        stops: 0,
        durationExtraMins: 0,
        priceMod: 0.98,
        terminal: origin.terminal || 'T3',
        rating: 4.9
      },
      {
        airline: 'Air Costa Regional Intl',
        airlineCode: 'LB',
        flightPrefix: 'LB-9',
        aircraft: 'Embraer E195-E2',
        depTime: '23:00',
        stops: 0,
        durationExtraMins: 0,
        priceMod: 0.93,
        terminal: origin.terminal || 'T1',
        rating: 4.72
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

    // Weather generation based on route type and live weather predictor overrides
    const origCheck = isAirportWeatherUnsafe(origin.code);
    const destCheck = isAirportWeatherUnsafe(dest.code);
    const activeUnsafe = origCheck.unsafe ? origCheck : destCheck.unsafe ? destCheck : null;

    const weatherConditions: WeatherCondition['condition'][] = ['Clear', 'Partly Cloudy', 'Clear', 'Clear'];
    const selectedCondition = activeUnsafe
      ? (activeUnsafe.condition as WeatherCondition['condition'])
      : weatherConditions[idx % weatherConditions.length];

    const weather: WeatherCondition = activeUnsafe
      ? {
          condition: selectedCondition,
          temperatureC: activeUnsafe.weather.temperatureC,
          visibilityKm: activeUnsafe.weather.visibilityKm,
          windSpeedKmh: activeUnsafe.weather.windSpeedKmh,
          stormIndex: 92,
          aiRiskScore: 96,
          aiCancellationRisk: 'Critical - Auto Cancelled',
          isAiAutoCancelled: true,
          aiAutoCancelReason: `AI Auto-Cancelled: Severe ${selectedCondition} at ${activeUnsafe.weather.airportCode} exceeding flight safety limits.`,
          compensationOffered: {
            freeReschedule: true,
            fullRefund: true,
            mealVoucher: true,
            hotelStay: true
          }
        }
      : {
          condition: selectedCondition,
          temperatureC: getAirportWeatherImmediate(origin.code).temperatureC,
          visibilityKm: getAirportWeatherImmediate(origin.code).visibilityKm,
          windSpeedKmh: getAirportWeatherImmediate(origin.code).windSpeedKmh,
          stormIndex: 4,
          aiRiskScore: 3,
          aiCancellationRisk: 'Low',
          isAiAutoCancelled: false,
        };

    const computedStatus: FlightStatus = activeUnsafe ? 'Cancelled' : 'On Time';

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
      status: computedStatus,
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
