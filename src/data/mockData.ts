import { Airport, Flight, MealOption, BaggageOption, Offer, Booking, VisaRequirement } from '../types/airline';

// ----------------------------------------------------
// AIRPORTS DIRECTORY - DEDICATED HUB CONSTANTS
// ----------------------------------------------------
export const AIRPORTS: Airport[] = [
  // India - Karnataka (Bangalore & Intra-State Regional)
  { code: 'BLR', name: 'Kempegowda International Airport', city: 'Bengaluru', state: 'Karnataka', country: 'India', terminal: 'T1', isInternational: true },
  { code: 'IXE', name: 'Mangalore International Airport', city: 'Mangalore', state: 'Karnataka', country: 'India', terminal: 'T1', isInternational: true },
  { code: 'MYQ', name: 'Mysuru Airport (Mandakalli)', city: 'Mysuru', state: 'Karnataka', country: 'India', terminal: 'T1', isInternational: false },
  { code: 'HBX', name: 'Hubballi Airport', city: 'Hubballi-Dharwad', state: 'Karnataka', country: 'India', terminal: 'T1', isInternational: false },
  { code: 'IXG', name: 'Belagavi Airport (Sambre)', city: 'Belagavi', state: 'Karnataka', country: 'India', terminal: 'T1', isInternational: false },

  // India - Maharashtra
  { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai', state: 'Maharashtra', country: 'India', terminal: 'T2', isInternational: true },
  { code: 'PNQ', name: 'Pune International Airport', city: 'Pune', state: 'Maharashtra', country: 'India', terminal: 'T1', isInternational: false },
  { code: 'NAG', name: 'Dr. Babasaheb Ambedkar International Airport', city: 'Nagpur', state: 'Maharashtra', country: 'India', terminal: 'T1', isInternational: false },
  { code: 'IXU', name: 'Chhatrapati Sambhaji Nagar Airport', city: 'Aurangabad', state: 'Maharashtra', country: 'India', terminal: 'T1', isInternational: false },

  // India - Delhi NCR
  { code: 'DEL', name: 'Indira Gandhi International Airport', city: 'New Delhi', state: 'Delhi NCR', country: 'India', terminal: 'T3', isInternational: true },

  // India - Tamil Nadu
  { code: 'MAA', name: 'Chennai International Airport', city: 'Chennai', state: 'Tamil Nadu', country: 'India', terminal: 'T4', isInternational: true },
  { code: 'CJB', name: 'Coimbatore International Airport', city: 'Coimbatore', state: 'Tamil Nadu', country: 'India', terminal: 'T1', isInternational: false },
  { code: 'IXM', name: 'Madurai Airport', city: 'Madurai', state: 'Tamil Nadu', country: 'India', terminal: 'T1', isInternational: false },
  { code: 'TRZ', name: 'Tiruchirappalli International Airport', city: 'Tiruchirappalli', state: 'Tamil Nadu', country: 'India', terminal: 'T2', isInternational: true },

  // India - Telangana & Andhra Pradesh
  { code: 'HYD', name: 'Rajiv Gandhi International Airport', city: 'Hyderabad', state: 'Telangana', country: 'India', terminal: 'T1', isInternational: true },
  { code: 'VTZ', name: 'Visakhapatnam International Airport', city: 'Visakhapatnam', state: 'Andhra Pradesh', country: 'India', terminal: 'T1', isInternational: true },
  { code: 'VGA', name: 'Vijayawada International Airport', city: 'Vijayawada', state: 'Andhra Pradesh', country: 'India', terminal: 'T1', isInternational: true },
  { code: 'TIR', name: 'Tirupati Airport', city: 'Tirupati', state: 'Andhra Pradesh', country: 'India', terminal: 'T1', isInternational: false },

  // India - Kerala
  { code: 'COK', name: 'Cochin International Airport', city: 'Kochi', state: 'Kerala', country: 'India', terminal: 'T3', isInternational: true },
  { code: 'TRV', name: 'Thiruvananthapuram International Airport', city: 'Thiruvananthapuram', state: 'Kerala', country: 'India', terminal: 'T2', isInternational: true },
  { code: 'CCJ', name: 'Calicut International Airport', city: 'Kozhikode', state: 'Kerala', country: 'India', terminal: 'T1', isInternational: true },
  { code: 'CNN', name: 'Kannur International Airport', city: 'Kannur', state: 'Kerala', country: 'India', terminal: 'T1', isInternational: true },

  // India - Gujarat & Rajasthan
  { code: 'AMD', name: 'Sardar Vallabhbhai Patel International Airport', city: 'Ahmedabad', state: 'Gujarat', country: 'India', terminal: 'T2', isInternational: true },
  { code: 'STV', name: 'Surat International Airport', city: 'Surat', state: 'Gujarat', country: 'India', terminal: 'T1', isInternational: false },
  { code: 'BDQ', name: 'Vadodara Airport', city: 'Vadodara', state: 'Gujarat', country: 'India', terminal: 'T1', isInternational: false },
  { code: 'JAI', name: 'Jaipur International Airport', city: 'Jaipur', state: 'Rajasthan', country: 'India', terminal: 'T2', isInternational: false },
  { code: 'UDR', name: 'Maharana Pratap Airport', city: 'Udaipur', state: 'Rajasthan', country: 'India', terminal: 'T1', isInternational: false },
  { code: 'JDH', name: 'Jodhpur Airport', city: 'Jodhpur', state: 'Rajasthan', country: 'India', terminal: 'T1', isInternational: false },

  // India - West Bengal & Uttar Pradesh & Bihar
  { code: 'CCU', name: 'Netaji Subhash Chandra Bose International Airport', city: 'Kolkata', state: 'West Bengal', country: 'India', terminal: 'T1', isInternational: true },
  { code: 'IXB', name: 'Bagdogra International Airport', city: 'Siliguri/Bagdogra', state: 'West Bengal', country: 'India', terminal: 'T1', isInternational: true },
  { code: 'LKO', name: 'Chaudhary Charan Singh International Airport', city: 'Lucknow', state: 'Uttar Pradesh', country: 'India', terminal: 'T3', isInternational: true },
  { code: 'VNS', name: 'Lal Bahadur Shastri International Airport', city: 'Varanasi', state: 'Uttar Pradesh', country: 'India', terminal: 'T1', isInternational: true },
  { code: 'AYJ', name: 'Maharishi Valmiki International Airport (Ayodhya)', city: 'Ayodhya', state: 'Uttar Pradesh', country: 'India', terminal: 'T1', isInternational: true },
  { code: 'PAT', name: 'Jay Prakash Narayan Airport', city: 'Patna', state: 'Bihar', country: 'India', terminal: 'T1', isInternational: false },

  // India - Punjab & Goa & Odisha & Assam & J&K & MP
  { code: 'IXC', name: 'Shaheed Bhagat Singh Airport', city: 'Chandigarh', state: 'Punjab/Chandigarh', country: 'India', terminal: 'T1', isInternational: true },
  { code: 'ATQ', name: 'Sri Guru Ram Dass Jee International Airport', city: 'Amritsar', state: 'Punjab', country: 'India', terminal: 'T1', isInternational: true },
  { code: 'GOI', name: 'Dabolim Airport', city: 'Goa (Dabolim)', state: 'Goa', country: 'India', terminal: 'T1', isInternational: false },
  { code: 'GOX', name: 'Manohar International Airport', city: 'Goa (Mopa)', state: 'Goa', country: 'India', terminal: 'T1', isInternational: true },
  { code: 'BBI', name: 'Biju Patnaik Airport', city: 'Bhubaneswar', state: 'Odisha', country: 'India', terminal: 'T1', isInternational: true },
  { code: 'GAU', name: 'Lokpriya Gopinath Bordoloi Airport', city: 'Guwahati', state: 'Assam', country: 'India', terminal: 'T1', isInternational: true },
  { code: 'SXR', name: 'Sheikh ul-Alam International Airport', city: 'Srinagar', state: 'Jammu & Kashmir', country: 'India', terminal: 'T1', isInternational: true },
  { code: 'IDR', name: 'Devi Ahilyabai Holkar Airport', city: 'Indore', state: 'Madhya Pradesh', country: 'India', terminal: 'T1', isInternational: false },

  // Global International Gateways (Country-to-Country)
  { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', state: 'Dubai', country: 'United Arab Emirates', terminal: 'T3', isInternational: true },
  { code: 'AUH', name: 'Zayed International Airport', city: 'Abu Dhabi', state: 'Abu Dhabi', country: 'United Arab Emirates', terminal: 'A', isInternational: true },
  { code: 'DOH', name: 'Hamad International Airport', city: 'Doha', state: 'Doha', country: 'Qatar', terminal: 'T1', isInternational: true },
  { code: 'KWI', name: 'Kuwait International Airport', city: 'Kuwait City', state: 'Al Farwaniyah', country: 'Kuwait', terminal: 'T4', isInternational: true },
  { code: 'RUH', name: 'King Khalid International Airport', city: 'Riyadh', state: 'Riyadh', country: 'Saudi Arabia', terminal: 'T2', isInternational: true },
  { code: 'JED', name: 'King Abdulaziz International Airport', city: 'Jeddah', state: 'Makkah', country: 'Saudi Arabia', terminal: 'T1', isInternational: true },
  { code: 'MCT', name: 'Muscat International Airport', city: 'Muscat', state: 'Muscat', country: 'Oman', terminal: 'T1', isInternational: true },
  { code: 'BAH', name: 'Bahrain International Airport', city: 'Manama', state: 'Muharraq', country: 'Bahrain', terminal: 'Main', isInternational: true },

  // Europe & UK
  { code: 'LHR', name: 'Heathrow Airport', city: 'London', state: 'England', country: 'United Kingdom', terminal: 'T5', isInternational: true },
  { code: 'LGW', name: 'Gatwick Airport', city: 'London (Gatwick)', state: 'England', country: 'United Kingdom', terminal: 'North', isInternational: true },
  { code: 'MAN', name: 'Manchester Airport', city: 'Manchester', state: 'Greater Manchester', country: 'United Kingdom', terminal: 'T1', isInternational: true },
  { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', state: 'Île-de-France', country: 'France', terminal: '2E', isInternational: true },
  { code: 'ORY', name: 'Paris Orly Airport', city: 'Paris (Orly)', state: 'Île-de-France', country: 'France', terminal: 'T3', isInternational: true },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', state: 'Hesse', country: 'Germany', terminal: 'T1', isInternational: true },
  { code: 'MUC', name: 'Munich Airport', city: 'Munich', state: 'Bavaria', country: 'Germany', terminal: 'T2', isInternational: true },
  { code: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', state: 'North Holland', country: 'Netherlands', terminal: 'T1', isInternational: true },
  { code: 'ZRH', name: 'Zurich Airport', city: 'Zurich', state: 'Zurich', country: 'Switzerland', terminal: 'A', isInternational: true },
  { code: 'FCO', name: 'Leonardo da Vinci–Fiumicino Airport', city: 'Rome', state: 'Lazio', country: 'Italy', terminal: 'T3', isInternational: true },
  { code: 'MAD', name: 'Adolfo Suárez Madrid–Barajas Airport', city: 'Madrid', state: 'Community of Madrid', country: 'Spain', terminal: 'T4', isInternational: true },
  { code: 'BCN', name: 'Josep Tarradellas Barcelona-El Prat Airport', city: 'Barcelona', state: 'Catalonia', country: 'Spain', terminal: 'T1', isInternational: true },
  { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', state: 'Marmara', country: 'Turkey', terminal: 'Main', isInternational: true },
  { code: 'VIE', name: 'Vienna International Airport', city: 'Vienna', state: 'Lower Austria', country: 'Austria', terminal: 'T3', isInternational: true },
  { code: 'DUB', name: 'Dublin Airport', city: 'Dublin', state: 'Leinster', country: 'Ireland', terminal: 'T2', isInternational: true },

  // North & South America
  { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', state: 'New York', country: 'United States', terminal: 'T4', isInternational: true },
  { code: 'EWR', name: 'Newark Liberty International Airport', city: 'New York (Newark)', state: 'New Jersey', country: 'United States', terminal: 'C', isInternational: true },
  { code: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco', state: 'California', country: 'United States', terminal: 'T3', isInternational: true },
  { code: 'ORD', name: 'O\'Hare International Airport', city: 'Chicago', state: 'Illinois', country: 'United States', terminal: 'T5', isInternational: true },
  { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', state: 'California', country: 'United States', terminal: 'TBIT', isInternational: true },
  { code: 'SEA', name: 'Seattle-Tacoma International Airport', city: 'Seattle', state: 'Washington', country: 'United States', terminal: 'Main', isInternational: true },
  { code: 'DFW', name: 'Dallas/Fort Worth International Airport', city: 'Dallas', state: 'Texas', country: 'United States', terminal: 'D', isInternational: true },
  { code: 'BOS', name: 'Logan International Airport', city: 'Boston', state: 'Massachusetts', country: 'United States', terminal: 'E', isInternational: true },
  { code: 'ATL', name: 'Hartsfield-Jackson Atlanta International Airport', city: 'Atlanta', state: 'Georgia', country: 'United States', terminal: 'Intl', isInternational: true },
  { code: 'YYZ', name: 'Toronto Pearson International Airport', city: 'Toronto', state: 'Ontario', country: 'Canada', terminal: 'T1', isInternational: true },
  { code: 'YVR', name: 'Vancouver International Airport', city: 'Vancouver', state: 'British Columbia', country: 'Canada', terminal: 'Main', isInternational: true },
  { code: 'YUL', name: 'Montréal-Trudeau International Airport', city: 'Montreal', state: 'Quebec', country: 'Canada', terminal: 'Main', isInternational: true },
  { code: 'GRU', name: 'São Paulo/Guarulhos International Airport', city: 'São Paulo', state: 'São Paulo', country: 'Brazil', terminal: 'T3', isInternational: true },

  // Asia-Pacific & Oceania & Africa
  { code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', state: 'Singapore', country: 'Singapore', terminal: 'T3', isInternational: true },
  { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', state: 'Central', country: 'Thailand', terminal: 'Main', isInternational: true },
  { code: 'HKT', name: 'Phuket International Airport', city: 'Phuket', state: 'Southern', country: 'Thailand', terminal: 'Intl', isInternational: true },
  { code: 'KUL', name: 'Kuala Lumpur International Airport', city: 'Kuala Lumpur', state: 'Selangor', country: 'Malaysia', terminal: 'KLIA', isInternational: true },
  { code: 'DPS', name: 'Ngurah Rai International Airport (Bali)', city: 'Bali', state: 'Bali', country: 'Indonesia', terminal: 'Intl', isInternational: true },
  { code: 'CGK', name: 'Soekarno-Hatta International Airport', city: 'Jakarta', state: 'Banten', country: 'Indonesia', terminal: 'T3', isInternational: true },
  { code: 'HKG', name: 'Hong Kong International Airport', city: 'Hong Kong', state: 'Hong Kong', country: 'Hong Kong', terminal: 'T1', isInternational: true },
  { code: 'HND', name: 'Haneda Airport', city: 'Tokyo (Haneda)', state: 'Kanto', country: 'Japan', terminal: 'T3', isInternational: true },
  { code: 'NRT', name: 'Narita International Airport', city: 'Tokyo (Narita)', state: 'Chiba', country: 'Japan', terminal: 'T1', isInternational: true },
  { code: 'ICN', name: 'Incheon International Airport', city: 'Seoul', state: 'Gyeonggi', country: 'South Korea', terminal: 'T2', isInternational: true },
  { code: 'SYD', name: 'Sydney Kingsford Smith Airport', city: 'Sydney', state: 'New South Wales', country: 'Australia', terminal: 'T1', isInternational: true },
  { code: 'MEL', name: 'Melbourne Airport', city: 'Melbourne', state: 'Victoria', country: 'Australia', terminal: 'T2', isInternational: true },
  { code: 'AKL', name: 'Auckland Airport', city: 'Auckland', state: 'Auckland', country: 'New Zealand', terminal: 'Intl', isInternational: true },
  { code: 'JNB', name: 'O.R. Tambo International Airport', city: 'Johannesburg', state: 'Gauteng', country: 'South Africa', terminal: 'A', isInternational: true },
  { code: 'NBO', name: 'Jomo Kenyatta International Airport', city: 'Nairobi', state: 'Nairobi', country: 'Kenya', terminal: 'T1', isInternational: true },
  { code: 'CAI', name: 'Cairo International Airport', city: 'Cairo', state: 'Cairo', country: 'Egypt', terminal: 'T3', isInternational: true },
  // Additional India Domestic & Island Hubs
  { code: 'IXR', name: 'Birsa Munda Airport', city: 'Ranchi', state: 'Jharkhand', country: 'India', terminal: 'T1', isInternational: false },
  { code: 'RPR', name: 'Swami Vivekananda Airport', city: 'Raipur', state: 'Chhattisgarh', country: 'India', terminal: 'T1', isInternational: false },
  { code: 'IXZ', name: 'Veer Savarkar International Airport', city: 'Port Blair (Andaman)', state: 'Andaman & Nicobar', country: 'India', terminal: 'T1', isInternational: false },
  { code: 'IXL', name: 'Kushok Bakula Rimpochee Airport', city: 'Leh (Ladakh)', state: 'Ladakh', country: 'India', terminal: 'T1', isInternational: false },
  { code: 'DED', name: 'Jolly Grant Airport', city: 'Dehradun', state: 'Uttarakhand', country: 'India', terminal: 'T1', isInternational: false },
  { code: 'IMF', name: 'Bir Tikendrajit International Airport', city: 'Imphal', state: 'Manipur', country: 'India', terminal: 'T1', isInternational: false },
  { code: 'IXA', name: 'Maharaja Bir Bikram Airport', city: 'Agartala', state: 'Tripura', country: 'India', terminal: 'T1', isInternational: false },
  // Additional Global International Hubs from India
  { code: 'CMB', name: 'Bandaranaike International Airport', city: 'Colombo', state: 'Western', country: 'Sri Lanka', terminal: 'T1', isInternational: true },
  { code: 'KTM', name: 'Tribhuvan International Airport', city: 'Kathmandu', state: 'Bagmati', country: 'Nepal', terminal: 'Intl', isInternational: true },
  { code: 'DAC', name: 'Hazrat Shahjalal International Airport', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', terminal: 'T2', isInternational: true },
  { code: 'MLE', name: 'Velana International Airport', city: 'Malé (Maldives)', state: 'Kaafu', country: 'Maldives', terminal: 'Intl', isInternational: true },
  { code: 'MRU', name: 'Sir Seewoosagur Ramgoolam International', city: 'Mauritius', state: 'Plaines Wilhems', country: 'Mauritius', terminal: 'Main', isInternational: true },
  { code: 'SEZ', name: 'Seychelles International Airport', city: 'Mahé (Seychelles)', state: 'Pointe La Rue', country: 'Seychelles', terminal: 'Intl', isInternational: true },
  { code: 'SHJ', name: 'Sharjah International Airport', city: 'Sharjah', state: 'Sharjah', country: 'UAE', terminal: 'T1', isInternational: true },
  { code: 'DMM', name: 'King Fahd International Airport', city: 'Dammam', state: 'Eastern Province', country: 'Saudi Arabia', terminal: 'Main', isInternational: true },
  { code: 'ATH', name: 'Athens International Airport', city: 'Athens', state: 'Attica', country: 'Greece', terminal: 'A', isInternational: true },
  { code: 'CPH', name: 'Copenhagen Airport', city: 'Copenhagen', state: 'Capital Region', country: 'Denmark', terminal: 'T3', isInternational: true },
  { code: 'ARN', name: 'Stockholm Arlanda Airport', city: 'Stockholm', state: 'Stockholm', country: 'Sweden', terminal: 'T5', isInternational: true },
  { code: 'BRU', name: 'Brussels Airport', city: 'Brussels', state: 'Flemish Brabant', country: 'Belgium', terminal: 'A', isInternational: true },
  { code: 'LIS', name: 'Humberto Delgado Airport', city: 'Lisbon', state: 'Lisbon', country: 'Portugal', terminal: 'T1', isInternational: true },
  { code: 'PRG', name: 'Václav Havel Airport Prague', city: 'Prague', state: 'Prague', country: 'Czech Republic', terminal: 'T1', isInternational: true },
  { code: 'WAW', name: 'Warsaw Chopin Airport', city: 'Warsaw', state: 'Masovian', country: 'Poland', terminal: 'A', isInternational: true },
  { code: 'MNL', name: 'Ninoy Aquino International Airport', city: 'Manila', state: 'Metro Manila', country: 'Philippines', terminal: 'T3', isInternational: true },
  { code: 'HAN', name: 'Noi Bai International Airport', city: 'Hanoi', state: 'Hanoi', country: 'Vietnam', terminal: 'T2', isInternational: true },
  { code: 'SGN', name: 'Tan Son Nhat International Airport', city: 'Ho Chi Minh City', state: 'South', country: 'Vietnam', terminal: 'T2', isInternational: true },
  { code: 'TPE', name: 'Taiwan Taoyuan International Airport', city: 'Taipei', state: 'Taoyuan', country: 'Taiwan', terminal: 'T2', isInternational: true },
  { code: 'PVG', name: 'Shanghai Pudong International Airport', city: 'Shanghai', state: 'Shanghai', country: 'China', terminal: 'T2', isInternational: true },
  { code: 'PER', name: 'Perth Airport', city: 'Perth', state: 'Western Australia', country: 'Australia', terminal: 'T1', isInternational: true },
  { code: 'IAD', name: 'Washington Dulles International Airport', city: 'Washington D.C.', state: 'Virginia', country: 'United States', terminal: 'Main', isInternational: true },
  { code: 'MIA', name: 'Miami International Airport', city: 'Miami', state: 'Florida', country: 'United States', terminal: 'N', isInternational: true },
  { code: 'IAH', name: 'George Bush Intercontinental Airport', city: 'Houston', state: 'Texas', country: 'United States', terminal: 'E', isInternational: true }
];

/**
 * Dynamically registers ANY city or destination on Earth into AIRPORTS at runtime
 * so if a user wants to fly from India to ANYWHERE on Earth, a live airport & flight corridor is created immediately!
 */
export function registerCustomAirport(cityOrCode: string, countryName = 'International Destination'): Airport {
  const cleaned = cityOrCode.trim();
  const existing = AIRPORTS.find(
    a => a.code.toLowerCase() === cleaned.toLowerCase() || a.city.toLowerCase() === cleaned.toLowerCase()
  );
  if (existing) return existing;

  const alphaOnly = cleaned.replace(/[^A-Za-z]/g, '').toUpperCase();
  const generatedCode = (alphaOnly.slice(0, 3) || 'GLB').padEnd(3, 'X');
  // Ensure unique code
  let finalCode = generatedCode;
  let counter = 1;
  while (AIRPORTS.some(a => a.code === finalCode)) {
    finalCode = `${generatedCode.slice(0, 2)}${counter}`;
    counter++;
  }

  const formattedCity = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  const newAirport: Airport = {
    code: finalCode,
    name: `${formattedCity} International Airport`,
    city: formattedCity,
    state: formattedCity,
    country: countryName,
    terminal: 'T1',
    isInternational: countryName.toLowerCase() !== 'india'
  };
  AIRPORTS.push(newAirport);
  return newAirport;
}

// Quick airport lookup helper
const getAirport = (code: string): Airport => {
  const found = AIRPORTS.find(a => a.code === code);
  if (!found) return registerCustomAirport(code);
  return found;
};

// ----------------------------------------------------
// COMPREHENSIVE FLIGHTS DATABASE (40+ FLIGHTS)
// Covers: Intra-State, State-to-State, Country-to-Country
// Airlines: IndiGo, Air India, AeroWings, Akasa, SpiceJet, Vistara, Alliance Air, Global Partners
// Statuses: Scheduled, On Time, Boarding, Delayed, Cancelled
// ----------------------------------------------------
export const INITIAL_FLIGHTS: Flight[] = [
  // =========================================================================
  // SECTION 1: INTRA-STATE FLIGHTS (Within the Same State)
  // =========================================================================

  // 1. MAHARASHTRA: Mumbai (BOM) -> Pune (PNQ) [IndiGo]
  {
    id: 'FL-INTRA-01',
    flightNumber: '6E-241',
    airline: 'IndiGo Airlines',
    airlineCode: '6E',
    aircraft: 'ATR 72-600 Turboprop',
    aircraftRegistration: 'VT-IRG',
    routeType: 'intra_state',
    origin: getAirport('BOM'),
    destination: getAirport('PNQ'),
    departureTime: '06:45',
    arrivalTime: '07:35',
    duration: '0h 50m',
    durationMinutes: 50,
    stops: 0,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    prices: { economy: 2150, premium_economy: 3400, business: 6900, first: 11000 },
    availableSeats: { economy: 64, premium_economy: 8, business: 4, first: 0 },
    totalSeats: 76,
    baggageAllowance: { cabin: '7 kg', checkIn: '15 kg' },
    amenities: ['6E Snack Bar (Paid)', 'Speedy 15m Boarding', 'Leather Seats', 'Standard Pitch'],
    status: 'On Time',
    gate: '1B',
    terminal: 'T1',
    weather: {
      condition: 'Clear',
      temperatureC: 27,
      visibilityKm: 10,
      windSpeedKmh: 9,
      stormIndex: 2,
      aiRiskScore: 1,
      aiCancellationRisk: 'Low',
    },
    competitors: [
      { competitorName: 'AeroWings StateShuttle', price: 2300, difference: 150, baggageIncluded: '15 kg', mealIncluded: 'Free Snack' },
      { competitorName: 'Regional Airlink', price: 2900, difference: 750, baggageIncluded: '10 kg', mealIncluded: 'None' }
    ],
    avgMarketPrice: 2600,
    savingsVsMarket: 450,
    aiPrediction: {
      fareTrend: 'stable',
      predictedPriceChangePercent: 0,
      fareTrendExplanation: 'AI Trend: Daily business commuter corridor with stable government fare-band limits.',
      onTimeProbability: 99,
      bestTimeToBook: 'Lowest fare tier available today',
      seatRecommendation: 'Row 3 for rapid deplaning at Pune Airport',
      weatherReliabilityScore: 99
    }
  },

  // 2. MAHARASHTRA: Mumbai (BOM) -> Pune (PNQ) [AeroWings]
  {
    id: 'FL-INTRA-02',
    flightNumber: 'AW-102',
    airline: 'AeroWings StateShuttle',
    airlineCode: 'AW',
    aircraft: 'ATR 72-600 EcoTurboprop',
    aircraftRegistration: 'VT-AWK',
    routeType: 'intra_state',
    origin: getAirport('BOM'),
    destination: getAirport('PNQ'),
    departureTime: '09:15',
    arrivalTime: '10:00',
    duration: '0h 45m',
    durationMinutes: 45,
    stops: 0,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    prices: { economy: 2200, premium_economy: 3500, business: 7200, first: 11500 },
    availableSeats: { economy: 48, premium_economy: 10, business: 6, first: 0 },
    totalSeats: 76,
    baggageAllowance: { cabin: '7 kg', checkIn: '15 kg' },
    amenities: ['Complimentary Mineral Water & Cookie', 'Priority Boarding Option', 'Power Outlets'],
    status: 'Boarding',
    gate: 'G2',
    terminal: 'T1B',
    weather: {
      condition: 'Clear',
      temperatureC: 28,
      visibilityKm: 10,
      windSpeedKmh: 10,
      stormIndex: 3,
      aiRiskScore: 2,
      aiCancellationRisk: 'Low',
    },
    competitors: [
      { competitorName: 'IndiGo Airlines', price: 2450, difference: 250, baggageIncluded: '15 kg', mealIncluded: 'Paid' },
      { competitorName: 'Air India', price: 3100, difference: 900, baggageIncluded: '15 kg', mealIncluded: 'Snack' }
    ],
    avgMarketPrice: 2775,
    savingsVsMarket: 575,
    aiPrediction: {
      fareTrend: 'stable',
      predictedPriceChangePercent: 2,
      fareTrendExplanation: 'AI Trend: Morning slot running on high on-time reliability score of 99%.',
      onTimeProbability: 99,
      bestTimeToBook: 'Book now to lock in seat with free beverage',
      seatRecommendation: 'Seats 4A/4D for extra aisle legroom',
      weatherReliabilityScore: 99
    }
  },

  // 3. MAHARASHTRA: Mumbai (BOM) -> Nagpur (NAG) [IndiGo]
  {
    id: 'FL-INTRA-03',
    flightNumber: '6E-548',
    airline: 'IndiGo Airlines',
    airlineCode: '6E',
    aircraft: 'Airbus A320neo',
    aircraftRegistration: 'VT-IZH',
    routeType: 'intra_state',
    origin: getAirport('BOM'),
    destination: getAirport('NAG'),
    departureTime: '14:20',
    arrivalTime: '15:45',
    duration: '1h 25m',
    durationMinutes: 85,
    stops: 0,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    prices: { economy: 3200, premium_economy: 4900, business: 10500, first: 16000 },
    availableSeats: { economy: 120, premium_economy: 18, business: 8, first: 0 },
    totalSeats: 180,
    baggageAllowance: { cabin: '7 kg', checkIn: '15 kg' },
    amenities: ['6E Snack Selection', 'Extra Legroom Rows available', 'Quiet Engine Noise Reduction'],
    status: 'Scheduled',
    gate: '24',
    terminal: 'T2',
    weather: {
      condition: 'Partly Cloudy',
      temperatureC: 31,
      visibilityKm: 10,
      windSpeedKmh: 12,
      stormIndex: 6,
      aiRiskScore: 4,
      aiCancellationRisk: 'Low',
    },
    competitors: [
      { competitorName: 'Air India', price: 4200, difference: 1000, baggageIncluded: '15 kg', mealIncluded: 'Hot Meal' },
      { competitorName: 'AeroWings', price: 3400, difference: 200, baggageIncluded: '15 kg', mealIncluded: 'Included' }
    ],
    avgMarketPrice: 3800,
    savingsVsMarket: 600,
    aiPrediction: {
      fareTrend: 'rising_soon',
      predictedPriceChangePercent: 14,
      fareTrendExplanation: 'AI Trend: Weekend travel surge expected between Mumbai and Vidarbha region.',
      onTimeProbability: 97,
      bestTimeToBook: 'Book before 18:00 to save ₹600',
      seatRecommendation: 'Row 12 Exit Row for 34-inch legroom',
      weatherReliabilityScore: 98
    }
  },

  // 4. MAHARASHTRA: Mumbai (BOM) -> Nagpur (NAG) [Air India - Delayed]
  {
    id: 'FL-INTRA-04',
    flightNumber: 'AI-628',
    airline: 'Air India',
    airlineCode: 'AI',
    aircraft: 'Airbus A320neo',
    aircraftRegistration: 'VT-EXV',
    routeType: 'intra_state',
    origin: getAirport('BOM'),
    destination: getAirport('NAG'),
    departureTime: '17:30',
    arrivalTime: '18:55',
    duration: '1h 25m',
    durationMinutes: 85,
    stops: 0,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    prices: { economy: 3600, premium_economy: 5400, business: 11900, first: 17500 },
    availableSeats: { economy: 98, premium_economy: 14, business: 6, first: 0 },
    totalSeats: 180,
    baggageAllowance: { cabin: '8 kg', checkIn: '15 kg' },
    amenities: ['Complimentary Hot Snack Box', 'Tea & Coffee Service', 'Maharaja Lounges'],
    status: 'Delayed',
    delayMinutes: 25,
    delayReason: 'ATC Flow Control & Mumbai Airport Runway Queue',
    gate: '16',
    terminal: 'T2',
    weather: {
      condition: 'Clear',
      temperatureC: 30,
      visibilityKm: 10,
      windSpeedKmh: 11,
      stormIndex: 4,
      aiRiskScore: 3,
      aiCancellationRisk: 'Low',
    },
    competitors: [
      { competitorName: 'IndiGo Airlines', price: 3450, difference: -150, baggageIncluded: '15 kg', mealIncluded: 'Paid' }
    ],
    avgMarketPrice: 3525,
    savingsVsMarket: -75,
    aiPrediction: {
      fareTrend: 'stable',
      predictedPriceChangePercent: 3,
      fareTrendExplanation: 'AI Dispatch: Aircraft on ground undergoing final luggage loading.',
      onTimeProbability: 88,
      bestTimeToBook: 'Price locked for today',
      seatRecommendation: 'Row 6 forward cabin for expedited boarding',
      weatherReliabilityScore: 97
    }
  },

  // 5. TAMIL NADU: Chennai (MAA) -> Madurai (IXM) [IndiGo]
  {
    id: 'FL-INTRA-05',
    flightNumber: '6E-7128',
    airline: 'IndiGo Airlines',
    airlineCode: '6E',
    aircraft: 'ATR 72-600 Turboprop',
    aircraftRegistration: 'VT-ITA',
    routeType: 'intra_state',
    origin: getAirport('MAA'),
    destination: getAirport('IXM'),
    departureTime: '08:15',
    arrivalTime: '09:20',
    duration: '1h 05m',
    durationMinutes: 65,
    stops: 0,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    prices: { economy: 2350, premium_economy: 3700, business: 8100, first: 12500 },
    availableSeats: { economy: 56, premium_economy: 8, business: 4, first: 0 },
    totalSeats: 74,
    baggageAllowance: { cabin: '7 kg', checkIn: '15 kg' },
    amenities: ['6E Snack Bar', 'Temple Tour Info Guide', 'Smooth Turboprop Cruising'],
    status: 'On Time',
    gate: 'T4-G1',
    terminal: 'T4',
    weather: {
      condition: 'Clear',
      temperatureC: 31,
      visibilityKm: 10,
      windSpeedKmh: 8,
      stormIndex: 3,
      aiRiskScore: 2,
      aiCancellationRisk: 'Low',
    },
    competitors: [
      { competitorName: 'SpiceJet Express', price: 2900, difference: 550, baggageIncluded: '15 kg', mealIncluded: 'Paid' },
      { competitorName: 'AeroWings', price: 2400, difference: 50, baggageIncluded: '15 kg', mealIncluded: 'Free Beverage' }
    ],
    avgMarketPrice: 2650,
    savingsVsMarket: 300,
    aiPrediction: {
      fareTrend: 'stable',
      predictedPriceChangePercent: 0,
      fareTrendExplanation: 'AI Trend: Pilgrimage corridor with steady morning demand.',
      onTimeProbability: 98,
      bestTimeToBook: 'Guaranteed window seat available now',
      seatRecommendation: 'Left side window (A seats) for Meenakshi Temple aerial descent',
      weatherReliabilityScore: 99
    }
  },

  // 6. TAMIL NADU: Chennai (MAA) -> Coimbatore (CJB) [Air India]
  {
    id: 'FL-INTRA-06',
    flightNumber: 'AI-542',
    airline: 'Air India',
    airlineCode: 'AI',
    aircraft: 'Airbus A320neo',
    aircraftRegistration: 'VT-EXD',
    routeType: 'intra_state',
    origin: getAirport('MAA'),
    destination: getAirport('CJB'),
    departureTime: '10:30',
    arrivalTime: '11:35',
    duration: '1h 05m',
    durationMinutes: 65,
    stops: 0,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    prices: { economy: 2600, premium_economy: 4100, business: 8900, first: 13500 },
    availableSeats: { economy: 114, premium_economy: 16, business: 8, first: 0 },
    totalSeats: 160,
    baggageAllowance: { cabin: '8 kg', checkIn: '15 kg' },
    amenities: ['South Indian Filter Coffee', 'Morning Snack', 'Comfortable 31-inch pitch'],
    status: 'On Time',
    gate: '04',
    terminal: 'T4',
    weather: {
      condition: 'Clear',
      temperatureC: 29,
      visibilityKm: 10,
      windSpeedKmh: 11,
      stormIndex: 4,
      aiRiskScore: 3,
      aiCancellationRisk: 'Low',
    },
    competitors: [
      { competitorName: 'IndiGo Airlines', price: 2850, difference: 250, baggageIncluded: '15 kg', mealIncluded: 'Paid' }
    ],
    avgMarketPrice: 2850,
    savingsVsMarket: 250,
    aiPrediction: {
      fareTrend: 'stable',
      predictedPriceChangePercent: 2,
      fareTrendExplanation: 'AI Trend: Textile corridor business transit operating with high punctuality.',
      onTimeProbability: 97,
      bestTimeToBook: 'Cheapest tier guaranteed',
      seatRecommendation: 'Row 8 forward cabin for quick exit',
      weatherReliabilityScore: 98
    }
  },

  // 7. KARNATAKA: Bengaluru (BLR) -> Mangalore (IXE) [IndiGo]
  {
    id: 'FL-INTRA-07',
    flightNumber: '6E-7201',
    airline: 'IndiGo Airlines',
    airlineCode: '6E',
    aircraft: 'ATR 72-600 Turboprop',
    aircraftRegistration: 'VT-IYE',
    routeType: 'intra_state',
    origin: getAirport('BLR'),
    destination: getAirport('IXE'),
    departureTime: '07:00',
    arrivalTime: '08:05',
    duration: '1h 05m',
    durationMinutes: 65,
    stops: 0,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    prices: { economy: 2400, premium_economy: 3800, business: 7900, first: 12000 },
    availableSeats: { economy: 60, premium_economy: 10, business: 4, first: 0 },
    totalSeats: 76,
    baggageAllowance: { cabin: '7 kg', checkIn: '15 kg' },
    amenities: ['6E Fresh Menu', 'Western Ghats Scenic Views', 'Fast Bag Drop'],
    status: 'On Time',
    gate: 'T1-08',
    terminal: 'T1',
    weather: {
      condition: 'Clear',
      temperatureC: 28,
      visibilityKm: 10,
      windSpeedKmh: 12,
      stormIndex: 4,
      aiRiskScore: 3,
      aiCancellationRisk: 'Low',
    },
    competitors: [
      { competitorName: 'AeroWings', price: 2600, difference: 200, baggageIncluded: '15 kg', mealIncluded: 'Complimentary Tea' }
    ],
    avgMarketPrice: 2600,
    savingsVsMarket: 200,
    aiPrediction: {
      fareTrend: 'stable',
      predictedPriceChangePercent: 0,
      fareTrendExplanation: 'AI Trend: Coastal Karnataka commuter frequency optimal.',
      onTimeProbability: 99,
      bestTimeToBook: 'Book today for best fare bracket',
      seatRecommendation: 'Window seat (F side) for Western Ghats mountains and Arabian Sea coastline',
      weatherReliabilityScore: 99
    }
  },

  // 8. GUJARAT: Ahmedabad (AMD) -> Surat (STV) [SpiceJet]
  {
    id: 'FL-INTRA-08',
    flightNumber: 'SG-289',
    airline: 'SpiceJet Express',
    airlineCode: 'SG',
    aircraft: 'Bombardier Q400 Turboprop',
    aircraftRegistration: 'VT-SQR',
    routeType: 'intra_state',
    origin: getAirport('AMD'),
    destination: getAirport('STV'),
    departureTime: '11:10',
    arrivalTime: '11:55',
    duration: '0h 45m',
    durationMinutes: 45,
    stops: 0,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    prices: { economy: 1950, premium_economy: 3100, business: 6500, first: 9800 },
    availableSeats: { economy: 68, premium_economy: 6, business: 4, first: 0 },
    totalSeats: 78,
    baggageAllowance: { cabin: '7 kg', checkIn: '15 kg' },
    amenities: ['Spicexpress Snacks', 'Diamond City Express Guide', 'Quick Turnaround'],
    status: 'On Time',
    gate: '02',
    terminal: 'T1',
    weather: {
      condition: 'Clear',
      temperatureC: 33,
      visibilityKm: 10,
      windSpeedKmh: 10,
      stormIndex: 3,
      aiRiskScore: 2,
      aiCancellationRisk: 'Low',
    },
    competitors: [
      { competitorName: 'AeroWings Shuttle', price: 2150, difference: 200, baggageIncluded: '15 kg', mealIncluded: 'Included' }
    ],
    avgMarketPrice: 2150,
    savingsVsMarket: 200,
    aiPrediction: {
      fareTrend: 'stable',
      predictedPriceChangePercent: 0,
      fareTrendExplanation: 'AI Trend: Diamond and textile merchant daily commute running on time.',
      onTimeProbability: 96,
      bestTimeToBook: 'Lowest fare tier currently active',
      seatRecommendation: 'Row 4 for fast deplaning',
      weatherReliabilityScore: 98
    }
  },

  // 9. RAJASTHAN: Jaipur (JAI) -> Udaipur (UDR) [IndiGo]
  {
    id: 'FL-INTRA-09',
    flightNumber: '6E-7422',
    airline: 'IndiGo Airlines',
    airlineCode: '6E',
    aircraft: 'ATR 72-600 Turboprop',
    aircraftRegistration: 'VT-IYP',
    routeType: 'intra_state',
    origin: getAirport('JAI'),
    destination: getAirport('UDR'),
    departureTime: '13:40',
    arrivalTime: '14:40',
    duration: '1h 00m',
    durationMinutes: 60,
    stops: 0,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    prices: { economy: 2450, premium_economy: 3900, business: 8400, first: 13000 },
    availableSeats: { economy: 52, premium_economy: 8, business: 4, first: 0 },
    totalSeats: 76,
    baggageAllowance: { cabin: '7 kg', checkIn: '15 kg' },
    amenities: ['6E Royal Rajasthan Guide', 'Aravalli Hills Panorama', 'Chilled Beverages'],
    status: 'On Time',
    gate: 'T2-03',
    terminal: 'T2',
    weather: {
      condition: 'Clear',
      temperatureC: 30,
      visibilityKm: 10,
      windSpeedKmh: 9,
      stormIndex: 2,
      aiRiskScore: 1,
      aiCancellationRisk: 'Low',
    },
    competitors: [
      { competitorName: 'Alliance Air', price: 2900, difference: 450, baggageIncluded: '15 kg', mealIncluded: 'Snack' }
    ],
    avgMarketPrice: 2900,
    savingsVsMarket: 450,
    aiPrediction: {
      fareTrend: 'rising_soon',
      predictedPriceChangePercent: 12,
      fareTrendExplanation: 'AI Trend: Heritage tourism and royal wedding bookings ramping up.',
      onTimeProbability: 99,
      bestTimeToBook: 'Book today to avoid tourist peak surcharge',
      seatRecommendation: 'Left window (A) for Lake Pichola views on approach',
      weatherReliabilityScore: 99
    }
  },

  // 10. WEST BENGAL: Kolkata (CCU) -> Bagdogra (IXB) [IndiGo - Cancelled by Severe Fog]
  {
    id: 'FL-INTRA-10',
    flightNumber: '6E-6511',
    airline: 'IndiGo Airlines',
    airlineCode: '6E',
    aircraft: 'Airbus A320neo',
    aircraftRegistration: 'VT-ISX',
    routeType: 'intra_state',
    origin: getAirport('CCU'),
    destination: getAirport('IXB'),
    departureTime: '06:30',
    arrivalTime: '07:35',
    duration: '1h 05m',
    durationMinutes: 65,
    stops: 0,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    prices: { economy: 2900, premium_economy: 4500, business: 9800, first: 15000 },
    availableSeats: { economy: 0, premium_economy: 0, business: 0, first: 0 },
    totalSeats: 180,
    baggageAllowance: { cabin: '7 kg', checkIn: '15 kg' },
    amenities: ['6E Snack Bar', 'Darjeeling Hills Visual Guide'],
    status: 'Cancelled',
    cancellationReason: 'Dense Fog & Low Optical Visibility at Bagdogra (RVR < 50m). Auto-Cancelled by AeroWings AI Protection with 100% Instant Full Refund (₹0 Fee) credited to source account.',
    gate: 'Gate Closed',
    terminal: 'T1',
    weather: {
      condition: 'Dense Fog',
      temperatureC: 13,
      visibilityKm: 0.05,
      windSpeedKmh: 4,
      stormIndex: 78,
      aiRiskScore: 95,
      aiCancellationRisk: 'Critical - Auto Cancelled',
      isAiAutoCancelled: true,
      aiAutoCancelReason: 'Extreme radiation fog dropping runway optical visibility below CAT-III landing minimums.',
      compensationOffered: {
        freeReschedule: true,
        fullRefund: true,
        mealVoucher: true,
        hotelStay: false
      }
    },
    competitors: [
      { competitorName: 'SpiceJet', price: 3400, difference: 500, baggageIncluded: '15 kg', mealIncluded: 'Paid' }
    ],
    avgMarketPrice: 3400,
    savingsVsMarket: 500,
    aiPrediction: {
      fareTrend: 'stable',
      predictedPriceChangePercent: 0,
      fareTrendExplanation: 'AI Safety Alert: Flight cancelled due to zero-visibility dense fog. 100% instant refund disbursed.',
      onTimeProbability: 0,
      bestTimeToBook: 'Rebook afternoon departure 6E-6515 scheduled at 14:00 once fog clears',
      seatRecommendation: 'N/A - Flight Grounded for Safety',
      weatherReliabilityScore: 12
    }
  },

  // =========================================================================
  // SECTION 2: INTER-STATE DOMESTIC FLIGHTS (State to State / Pan-India)
  // =========================================================================

  // 11. Delhi (DEL) -> Mumbai (BOM) [IndiGo - Registered & On Time]
  {
    id: 'FL-INTER-01',
    flightNumber: '6E-2042',
    airline: 'IndiGo Airlines',
    airlineCode: '6E',
    aircraft: 'Airbus A321neo',
    aircraftRegistration: 'VT-IMD',
    routeType: 'inter_state',
    origin: getAirport('DEL'),
    destination: getAirport('BOM'),
    departureTime: '06:00',
    arrivalTime: '08:15',
    duration: '2h 15m',
    durationMinutes: 135,
    stops: 0,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    prices: { economy: 4950, premium_economy: 7400, business: 16800, first: 27500 },
    availableSeats: { economy: 164, premium_economy: 32, business: 16, first: 4 },
    totalSeats: 222,
    baggageAllowance: { cabin: '7 kg', checkIn: '15 kg' },
    amenities: ['6E Snack Bar & Fresh Sandwiches', 'Fast Ka-band Wi-Fi', 'USB Power on A321neo', 'On-Time Star Fleet'],
    status: 'On Time',
    gate: 'T3-34',
    terminal: 'T3',
    weather: {
      condition: 'Clear',
      temperatureC: 28,
      visibilityKm: 10,
      windSpeedKmh: 12,
      stormIndex: 4,
      aiRiskScore: 3,
      aiCancellationRisk: 'Low',
    },
    competitors: [
      { competitorName: 'Air India', price: 6200, difference: 1250, baggageIncluded: '15 kg', mealIncluded: 'Hot Meal' },
      { competitorName: 'AeroWings Prime', price: 5100, difference: 150, baggageIncluded: '15 kg', mealIncluded: 'Included' },
      { competitorName: 'Vistara Prime', price: 6800, difference: 1850, baggageIncluded: '15 kg', mealIncluded: 'Free Meal' }
    ],
    avgMarketPrice: 6033,
    savingsVsMarket: 1083,
    aiPrediction: {
      fareTrend: 'rising_soon',
      predictedPriceChangePercent: 18,
      fareTrendExplanation: 'AI Trend: Peak business corridor surging. 85% of early morning seats are filled.',
      onTimeProbability: 99,
      bestTimeToBook: 'Book within 6 hours to lock in sub-₹5,000 fare',
      seatRecommendation: 'Seats 14A/14F for unobstructed wing views over Aravalli Range',
      weatherReliabilityScore: 99
    }
  },

  // 12. Delhi (DEL) -> Mumbai (BOM) [Air India - Boarding]
  {
    id: 'FL-INTER-02',
    flightNumber: 'AI-887',
    airline: 'Air India',
    airlineCode: 'AI',
    aircraft: 'Boeing 787-8 Dreamliner',
    aircraftRegistration: 'VT-ANX',
    routeType: 'inter_state',
    origin: getAirport('DEL'),
    destination: getAirport('BOM'),
    departureTime: '07:15',
    arrivalTime: '09:30',
    duration: '2h 15m',
    durationMinutes: 135,
    stops: 0,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    prices: { economy: 5800, premium_economy: 8600, business: 19500, first: 32000 },
    availableSeats: { economy: 140, premium_economy: 28, business: 18, first: 6 },
    totalSeats: 256,
    baggageAllowance: { cabin: '8 kg', checkIn: '20 kg' },
    amenities: ['Complimentary Hot Breakfast', 'Electrochromic Auto-Dimming Windows', 'HD In-Flight Screen', 'Maharaja Lounges'],
    status: 'Boarding',
    gate: 'T3-42B',
    terminal: 'T3',
    weather: {
      condition: 'Clear',
      temperatureC: 28,
      visibilityKm: 10,
      windSpeedKmh: 12,
      stormIndex: 4,
      aiRiskScore: 3,
      aiCancellationRisk: 'Low',
    },
    competitors: [
      { competitorName: 'IndiGo Airlines', price: 5400, difference: -400, baggageIncluded: '15 kg', mealIncluded: 'Paid' },
      { competitorName: 'AeroWings', price: 5200, difference: -600, baggageIncluded: '15 kg', mealIncluded: 'Included' }
    ],
    avgMarketPrice: 5466,
    savingsVsMarket: -334,
    aiPrediction: {
      fareTrend: 'stable',
      predictedPriceChangePercent: 2,
      fareTrendExplanation: 'AI Dispatch: Wide-body Dreamliner boarding on schedule at Terminal 3.',
      onTimeProbability: 97,
      bestTimeToBook: 'Gate closing soon',
      seatRecommendation: 'Row 11 Dreamliner forward economy with extra headroom',
      weatherReliabilityScore: 98
    }
  },

  // 13. Delhi (DEL) -> Mumbai (BOM) [AeroWings Express - On Time]
  {
    id: 'FL-INTER-03',
    flightNumber: 'AW-204',
    airline: 'AeroWings Express',
    airlineCode: 'AW',
    aircraft: 'Boeing 787-9 Dreamliner',
    aircraftRegistration: 'VT-AWG',
    routeType: 'inter_state',
    origin: getAirport('DEL'),
    destination: getAirport('BOM'),
    departureTime: '08:45',
    arrivalTime: '11:00',
    duration: '2h 15m',
    durationMinutes: 135,
    stops: 0,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    prices: { economy: 4850, premium_economy: 7200, business: 16500, first: 28000 },
    availableSeats: { economy: 142, premium_economy: 28, business: 18, first: 6 },
    totalSeats: 194,
    baggageAllowance: { cabin: '7 kg', checkIn: '15 kg' },
    amenities: ['In-flight Wi-Fi', 'USB Power Port', 'Complimentary Snack', 'On-demand Entertainment'],
    status: 'On Time',
    gate: 'T3-28',
    terminal: 'T3',
    weather: {
      condition: 'Clear',
      temperatureC: 29,
      visibilityKm: 10,
      windSpeedKmh: 11,
      stormIndex: 4,
      aiRiskScore: 3,
      aiCancellationRisk: 'Low',
    },
    competitors: [
      { competitorName: 'Air India', price: 6200, difference: 1350, baggageIncluded: '15 kg', mealIncluded: 'Free Hot Meal' },
      { competitorName: 'IndiGo Airlines', price: 5400, difference: 550, baggageIncluded: '15 kg', mealIncluded: 'Paid Snack Bar' },
      { competitorName: 'Vistara Prime', price: 6800, difference: 1950, baggageIncluded: '15 kg', mealIncluded: 'Free Meal' }
    ],
    avgMarketPrice: 6133,
    savingsVsMarket: 1283,
    aiPrediction: {
      fareTrend: 'rising_soon',
      predictedPriceChangePercent: 18,
      fareTrendExplanation: 'AI Trend: Route demand is surging 24% for the upcoming weekend. Lowest fare tier is 85% sold out.',
      onTimeProbability: 98,
      bestTimeToBook: 'Book within 12 hours to save ₹1,350',
      seatRecommendation: 'Seats 12A/12F for scenic sunrise views over western ghats',
      weatherReliabilityScore: 99
    }
  },

  // 14. Delhi (DEL) -> Mumbai (BOM) [Akasa Air - Scheduled]
  {
    id: 'FL-INTER-04',
    flightNumber: 'QP-1302',
    airline: 'Akasa Air',
    airlineCode: 'QP',
    aircraft: 'Boeing 737 MAX 8',
    aircraftRegistration: 'VT-YAA',
    routeType: 'inter_state',
    origin: getAirport('DEL'),
    destination: getAirport('BOM'),
    departureTime: '13:15',
    arrivalTime: '15:30',
    duration: '2h 15m',
    durationMinutes: 135,
    stops: 0,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    prices: { economy: 4700, premium_economy: 6900, business: 15200, first: 25000 },
    availableSeats: { economy: 132, premium_economy: 20, business: 10, first: 0 },
    totalSeats: 189,
    baggageAllowance: { cabin: '7 kg', checkIn: '15 kg' },
    amenities: ['Cafe Akasa Gourmet Meals', 'Ergonomic Slimline Cushioning', 'USB Charging'],
    status: 'Scheduled',
    gate: 'T3-12',
    terminal: 'T3',
    weather: {
      condition: 'Clear',
      temperatureC: 31,
      visibilityKm: 10,
      windSpeedKmh: 14,
      stormIndex: 5,
      aiRiskScore: 3,
      aiCancellationRisk: 'Low',
    },
    competitors: [
      { competitorName: 'IndiGo Airlines', price: 5200, difference: 500, baggageIncluded: '15 kg', mealIncluded: 'Paid' },
      { competitorName: 'Air India', price: 6100, difference: 1400, baggageIncluded: '15 kg', mealIncluded: 'Included' }
    ],
    avgMarketPrice: 5650,
    savingsVsMarket: 950,
    aiPrediction: {
      fareTrend: 'stable',
      predictedPriceChangePercent: 3,
      fareTrendExplanation: 'AI Trend: Mid-day flight pricing is stable. Good seat availability.',
      onTimeProbability: 97,
      bestTimeToBook: 'Book today to lock lowest fare',
      seatRecommendation: 'Row 15 Exit Row for generous stretch space',
      weatherReliabilityScore: 98
    }
  },

  // 15. Delhi (DEL) -> Mumbai (BOM) [SpiceJet - Delayed]
  {
    id: 'FL-INTER-05',
    flightNumber: 'SG-8169',
    airline: 'SpiceJet Express',
    airlineCode: 'SG',
    aircraft: 'Boeing 737-800',
    aircraftRegistration: 'VT-SPJ',
    routeType: 'inter_state',
    origin: getAirport('DEL'),
    destination: getAirport('BOM'),
    departureTime: '16:00',
    arrivalTime: '18:15',
    duration: '2h 15m',
    durationMinutes: 135,
    stops: 0,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    prices: { economy: 4500, premium_economy: 6600, business: 14200, first: 23500 },
    availableSeats: { economy: 110, premium_economy: 18, business: 8, first: 0 },
    totalSeats: 189,
    baggageAllowance: { cabin: '7 kg', checkIn: '15 kg' },
    amenities: ['Spicexpress Hot Food (Pre-book)', 'SpiceMax Extra Legroom Options'],
    status: 'Delayed',
    delayMinutes: 35,
    delayReason: 'Incoming aircraft delayed due to Air Traffic Congestion at Delhi Airport',
    gate: 'T3-19',
    terminal: 'T3',
    weather: {
      condition: 'Clear',
      temperatureC: 30,
      visibilityKm: 10,
      windSpeedKmh: 13,
      stormIndex: 4,
      aiRiskScore: 3,
      aiCancellationRisk: 'Low',
    },
    competitors: [
      { competitorName: 'IndiGo Airlines', price: 5400, difference: 900, baggageIncluded: '15 kg', mealIncluded: 'Paid' }
    ],
    avgMarketPrice: 5400,
    savingsVsMarket: 900,
    aiPrediction: {
      fareTrend: 'stable',
      predictedPriceChangePercent: 0,
      fareTrendExplanation: 'AI Dispatch: Turnaround in progress at Gate 19. Revised departure estimated at 16:35.',
      onTimeProbability: 82,
      bestTimeToBook: 'Lowest budget tier available',
      seatRecommendation: 'Row 3 SpiceMax for priority deplaning',
      weatherReliabilityScore: 97
    }
  },

  // 16. Delhi (DEL) -> Bengaluru (BLR) [IndiGo - Registered & On Time]
  {
    id: 'FL-INTER-06',
    flightNumber: '6E-531',
    airline: 'IndiGo Airlines',
    airlineCode: '6E',
    aircraft: 'Airbus A321neo',
    aircraftRegistration: 'VT-ILQ',
    routeType: 'inter_state',
    origin: getAirport('DEL'),
    destination: getAirport('BLR'),
    departureTime: '06:30',
    arrivalTime: '09:15',
    duration: '2h 45m',
    durationMinutes: 165,
    stops: 0,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    prices: { economy: 5600, premium_economy: 8200, business: 18500, first: 31000 },
    availableSeats: { economy: 172, premium_economy: 28, business: 14, first: 4 },
    totalSeats: 232,
    baggageAllowance: { cabin: '7 kg', checkIn: '15 kg' },
    amenities: ['6E Snack Bar', 'Fast Boarding', 'Airbus Sharklet Fuel Efficient Cruising', 'USB Ports'],
    status: 'On Time',
    gate: 'T3-10',
    terminal: 'T3',
    weather: {
      condition: 'Clear',
      temperatureC: 24,
      visibilityKm: 10,
      windSpeedKmh: 10,
      stormIndex: 4,
      aiRiskScore: 3,
      aiCancellationRisk: 'Low',
    },
    competitors: [
      { competitorName: 'Air India', price: 7400, difference: 1800, baggageIncluded: '15 kg', mealIncluded: 'Included' },
      { competitorName: 'AeroWings', price: 5900, difference: 300, baggageIncluded: '15 kg', mealIncluded: 'Included' }
    ],
    avgMarketPrice: 6650,
    savingsVsMarket: 1050,
    aiPrediction: {
      fareTrend: 'rising_soon',
      predictedPriceChangePercent: 16,
      fareTrendExplanation: 'AI Trend: Bengaluru tech corridor seeing high morning executive bookings.',
      onTimeProbability: 99,
      bestTimeToBook: 'Book today to lock under ₹6,000 fare',
      seatRecommendation: 'Row 14 exit row for maximum workspace comfort',
      weatherReliabilityScore: 98
    }
  },

  // 17. Delhi (DEL) -> Bengaluru (BLR) [Air India - Boarding]
  {
    id: 'FL-INTER-07',
    flightNumber: 'AI-805',
    airline: 'Air India',
    airlineCode: 'AI',
    aircraft: 'Airbus A350-900',
    aircraftRegistration: 'VT-IRA',
    routeType: 'inter_state',
    origin: getAirport('DEL'),
    destination: getAirport('BLR'),
    departureTime: '09:40',
    arrivalTime: '12:25',
    duration: '2h 45m',
    durationMinutes: 165,
    stops: 0,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    prices: { economy: 6400, premium_economy: 9500, business: 21000, first: 36000 },
    availableSeats: { economy: 180, premium_economy: 34, business: 22, first: 6 },
    totalSeats: 316,
    baggageAllowance: { cabin: '8 kg', checkIn: '20 kg' },
    amenities: ['Next-Gen A350 Panasonic 4K IFE', 'Complimentary Hot Meal', 'Private Business Suites with Sliding Doors'],
    status: 'Boarding',
    gate: 'T3-40',
    terminal: 'T3',
    weather: {
      condition: 'Clear',
      temperatureC: 24,
      visibilityKm: 10,
      windSpeedKmh: 10,
      stormIndex: 4,
      aiRiskScore: 3,
      aiCancellationRisk: 'Low',
    },
    competitors: [
      { competitorName: 'IndiGo Airlines', price: 6100, difference: -300, baggageIncluded: '15 kg', mealIncluded: 'Paid' },
      { competitorName: 'Vistara', price: 7200, difference: 800, baggageIncluded: '15 kg', mealIncluded: 'Included' }
    ],
    avgMarketPrice: 6650,
    savingsVsMarket: 250,
    aiPrediction: {
      fareTrend: 'stable',
      predictedPriceChangePercent: 3,
      fareTrendExplanation: 'AI Dispatch: Flagship Airbus A350 wide-body boarding on time at Gate 40.',
      onTimeProbability: 98,
      bestTimeToBook: 'Boarding now',
      seatRecommendation: 'Suites 1A-4A for private suite comfort',
      weatherReliabilityScore: 98
    }
  },

  // 18. Mumbai (BOM) -> Goa (GOI) [IndiGo - Registered & On Time]
  {
    id: 'FL-INTER-08',
    flightNumber: '6E-882',
    airline: 'IndiGo Airlines',
    airlineCode: '6E',
    aircraft: 'Airbus A320neo',
    aircraftRegistration: 'VT-IKL',
    routeType: 'inter_state',
    origin: getAirport('BOM'),
    destination: getAirport('GOI'),
    departureTime: '11:20',
    arrivalTime: '12:30',
    duration: '1h 10m',
    durationMinutes: 70,
    stops: 0,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    prices: { economy: 3200, premium_economy: 4800, business: 10200, first: 16500 },
    availableSeats: { economy: 135, premium_economy: 18, business: 8, first: 0 },
    totalSeats: 180,
    baggageAllowance: { cabin: '7 kg', checkIn: '15 kg' },
    amenities: ['6E Snack Bar', 'Goa Holiday Destination Guide', 'Express Bag Delivery'],
    status: 'On Time',
    gate: 'T1-06',
    terminal: 'T1',
    weather: {
      condition: 'Clear',
      temperatureC: 29,
      visibilityKm: 10,
      windSpeedKmh: 14,
      stormIndex: 5,
      aiRiskScore: 3,
      aiCancellationRisk: 'Low',
    },
    competitors: [
      { competitorName: 'SpiceJet', price: 3900, difference: 700, baggageIncluded: '15 kg', mealIncluded: 'Paid' },
      { competitorName: 'AeroWings', price: 3400, difference: 200, baggageIncluded: '15 kg', mealIncluded: 'Included' }
    ],
    avgMarketPrice: 3650,
    savingsVsMarket: 450,
    aiPrediction: {
      fareTrend: 'rising_soon',
      predictedPriceChangePercent: 20,
      fareTrendExplanation: 'AI Trend: Weekend Goa holiday surge beginning. Fares expected to increase ₹1,200.',
      onTimeProbability: 97,
      bestTimeToBook: 'Book today to capture lowest holiday bracket',
      seatRecommendation: 'Right side (F seats) for Konkan coastline aerial descent',
      weatherReliabilityScore: 98
    }
  },

  // 19. Chennai (MAA) -> Kolkata (CCU) [IndiGo - Auto-Cancelled by Cyclone Alert]
  {
    id: 'FL-INTER-09',
    flightNumber: '6E-401',
    airline: 'IndiGo Airlines',
    airlineCode: '6E',
    aircraft: 'Airbus A320neo',
    aircraftRegistration: 'VT-INA',
    routeType: 'inter_state',
    origin: getAirport('MAA'),
    destination: getAirport('CCU'),
    departureTime: '15:10',
    arrivalTime: '17:35',
    duration: '2h 25m',
    durationMinutes: 145,
    stops: 0,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    prices: { economy: 4100, premium_economy: 6200, business: 13900, first: 22000 },
    availableSeats: { economy: 0, premium_economy: 0, business: 0, first: 0 },
    totalSeats: 180,
    baggageAllowance: { cabin: '7 kg', checkIn: '15 kg' },
    amenities: ['6E Fresh Bites', 'Bay of Bengal Radar Updates'],
    status: 'Cancelled',
    cancellationReason: 'AI Doppler Warning: Category-3 Cyclone Alert across Bay of Bengal corridor. Flight grounded for passenger safety. 100% Instant Refund (₹0 Fee) disbursed & 1-Click Free Reschedule active.',
    gate: 'Gate Closed',
    terminal: 'T4',
    weather: {
      condition: 'Typhoon / Cyclone',
      temperatureC: 25,
      visibilityKm: 0.9,
      windSpeedKmh: 92,
      stormIndex: 93,
      aiRiskScore: 96,
      aiCancellationRisk: 'Critical - Auto Cancelled',
      isAiAutoCancelled: true,
      aiAutoCancelReason: 'Severe tropical cyclonic storm producing crosswinds in excess of aircraft structural safety limits.',
      compensationOffered: {
        freeReschedule: true,
        fullRefund: true,
        mealVoucher: true,
        hotelStay: true
      }
    },
    competitors: [
      { competitorName: 'Air India', price: 5400, difference: 1300, baggageIncluded: '15 kg', mealIncluded: 'Meal' }
    ],
    avgMarketPrice: 5400,
    savingsVsMarket: 1300,
    aiPrediction: {
      fareTrend: 'stable',
      predictedPriceChangePercent: 0,
      fareTrendExplanation: 'AI Safety Warning: Severe cyclonic conditions active. Immediate 100% instant refund disbursed.',
      onTimeProbability: 0,
      bestTimeToBook: 'Next safe operations resume tomorrow morning at 09:00',
      seatRecommendation: 'N/A - Weather Grounding',
      weatherReliabilityScore: 10
    }
  },

  // 20. Hyderabad (HYD) -> Delhi (DEL) [IndiGo - Registered & On Time]
  {
    id: 'FL-INTER-10',
    flightNumber: '6E-119',
    airline: 'IndiGo Airlines',
    airlineCode: '6E',
    aircraft: 'Airbus A320neo',
    aircraftRegistration: 'VT-ITK',
    routeType: 'inter_state',
    origin: getAirport('HYD'),
    destination: getAirport('DEL'),
    departureTime: '18:30',
    arrivalTime: '20:45',
    duration: '2h 15m',
    durationMinutes: 135,
    stops: 0,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    prices: { economy: 4300, premium_economy: 6400, business: 14500, first: 23000 },
    availableSeats: { economy: 148, premium_economy: 22, business: 10, first: 2 },
    totalSeats: 180,
    baggageAllowance: { cabin: '7 kg', checkIn: '15 kg' },
    amenities: ['6E Snack Bar', 'In-flight Reading', 'USB Charging Ports'],
    status: 'On Time',
    gate: '07A',
    terminal: 'T1',
    weather: {
      condition: 'Clear',
      temperatureC: 27,
      visibilityKm: 10,
      windSpeedKmh: 10,
      stormIndex: 4,
      aiRiskScore: 2,
      aiCancellationRisk: 'Low',
    },
    competitors: [
      { competitorName: 'Air India', price: 5600, difference: 1300, baggageIncluded: '15 kg', mealIncluded: 'Hot Meal' },
      { competitorName: 'AeroWings', price: 4600, difference: 300, baggageIncluded: '15 kg', mealIncluded: 'Included' }
    ],
    avgMarketPrice: 5100,
    savingsVsMarket: 800,
    aiPrediction: {
      fareTrend: 'stable',
      predictedPriceChangePercent: 4,
      fareTrendExplanation: 'AI Trend: Evening flight operating with high on-time score.',
      onTimeProbability: 98,
      bestTimeToBook: 'Cheapest tier active today',
      seatRecommendation: 'Row 5 forward seats for smooth ride',
      weatherReliabilityScore: 98
    }
  },

  // 21. Bengaluru (BLR) -> Kochi (COK) [IndiGo - On Time]
  {
    id: 'FL-INTER-11',
    flightNumber: '6E-618',
    airline: 'IndiGo Airlines',
    airlineCode: '6E',
    aircraft: 'ATR 72-600 Turboprop',
    aircraftRegistration: 'VT-IRJ',
    routeType: 'inter_state',
    origin: getAirport('BLR'),
    destination: getAirport('COK'),
    departureTime: '12:15',
    arrivalTime: '13:25',
    duration: '1h 10m',
    durationMinutes: 70,
    stops: 0,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    prices: { economy: 2800, premium_economy: 4200, business: 8900, first: 14000 },
    availableSeats: { economy: 58, premium_economy: 10, business: 4, first: 0 },
    totalSeats: 76,
    baggageAllowance: { cabin: '7 kg', checkIn: '15 kg' },
    amenities: ['6E Snack Bar', 'Kerala Backwaters Guide', 'Quiet Cabin Cruising'],
    status: 'On Time',
    gate: 'T1-14',
    terminal: 'T1',
    weather: {
      condition: 'Rain',
      temperatureC: 26,
      visibilityKm: 8,
      windSpeedKmh: 15,
      stormIndex: 14,
      aiRiskScore: 9,
      aiCancellationRisk: 'Low',
    },
    competitors: [
      { competitorName: 'Air India', price: 3600, difference: 800, baggageIncluded: '15 kg', mealIncluded: 'Included' },
      { competitorName: 'AeroWings', price: 2950, difference: 150, baggageIncluded: '15 kg', mealIncluded: 'Included' }
    ],
    avgMarketPrice: 3275,
    savingsVsMarket: 475,
    aiPrediction: {
      fareTrend: 'stable',
      predictedPriceChangePercent: 3,
      fareTrendExplanation: 'AI Trend: Mild tropical monsoon showers manageable within standard approach buffers.',
      onTimeProbability: 96,
      bestTimeToBook: 'Book now to guarantee lowest fare',
      seatRecommendation: 'Left window (A) for lush Western Ghats landscape views',
      weatherReliabilityScore: 94
    }
  },

  // 22. Delhi (DEL) -> Varanasi (VNS) [IndiGo - On Time]
  {
    id: 'FL-INTER-12',
    flightNumber: '6E-2121',
    airline: 'IndiGo Airlines',
    airlineCode: '6E',
    aircraft: 'Airbus A320neo',
    aircraftRegistration: 'VT-IVV',
    routeType: 'inter_state',
    origin: getAirport('DEL'),
    destination: getAirport('VNS'),
    departureTime: '10:00',
    arrivalTime: '11:25',
    duration: '1h 25m',
    durationMinutes: 85,
    stops: 0,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    prices: { economy: 3100, premium_economy: 4600, business: 9900, first: 15500 },
    availableSeats: { economy: 126, premium_economy: 16, business: 8, first: 0 },
    totalSeats: 180,
    baggageAllowance: { cabin: '7 kg', checkIn: '15 kg' },
    amenities: ['6E Snack Bar', 'Spiritual Varanasi Audio Guide', 'Fast Baggage Priority'],
    status: 'On Time',
    gate: 'T3-15',
    terminal: 'T3',
    weather: {
      condition: 'Clear',
      temperatureC: 28,
      visibilityKm: 10,
      windSpeedKmh: 8,
      stormIndex: 3,
      aiRiskScore: 2,
      aiCancellationRisk: 'Low',
    },
    competitors: [
      { competitorName: 'SpiceJet', price: 3800, difference: 700, baggageIncluded: '15 kg', mealIncluded: 'Paid' },
      { competitorName: 'Air India', price: 4200, difference: 1100, baggageIncluded: '15 kg', mealIncluded: 'Included' }
    ],
    avgMarketPrice: 4000,
    savingsVsMarket: 900,
    aiPrediction: {
      fareTrend: 'stable',
      predictedPriceChangePercent: 0,
      fareTrendExplanation: 'AI Trend: Steady cultural travel demand with high punctuality index.',
      onTimeProbability: 99,
      bestTimeToBook: 'Lock in lowest price tier now',
      seatRecommendation: 'Right window for holy Ganga river views on final approach',
      weatherReliabilityScore: 99
    }
  },

  // 23. Delhi (DEL) -> Ahmedabad (AMD) [IndiGo - Registered & On Time]
  {
    id: 'FL-INTER-13',
    flightNumber: '6E-701',
    airline: 'IndiGo Airlines',
    airlineCode: '6E',
    aircraft: 'Airbus A320neo',
    aircraftRegistration: 'VT-IUC',
    routeType: 'inter_state',
    origin: getAirport('DEL'),
    destination: getAirport('AMD'),
    departureTime: '14:50',
    arrivalTime: '16:25',
    duration: '1h 35m',
    durationMinutes: 95,
    stops: 0,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    prices: { economy: 3450, premium_economy: 5100, business: 11200, first: 17500 },
    availableSeats: { economy: 130, premium_economy: 18, business: 6, first: 0 },
    totalSeats: 180,
    baggageAllowance: { cabin: '7 kg', checkIn: '15 kg' },
    amenities: ['6E Snack Bar', 'Business Traveler Express Check-in'],
    status: 'On Time',
    gate: 'T3-22',
    terminal: 'T3',
    weather: {
      condition: 'Clear',
      temperatureC: 32,
      visibilityKm: 10,
      windSpeedKmh: 11,
      stormIndex: 4,
      aiRiskScore: 2,
      aiCancellationRisk: 'Low',
    },
    competitors: [
      { competitorName: 'SpiceJet', price: 4100, difference: 650, baggageIncluded: '15 kg', mealIncluded: 'Paid' },
      { competitorName: 'Air India', price: 4600, difference: 1150, baggageIncluded: '15 kg', mealIncluded: 'Included' }
    ],
    avgMarketPrice: 4350,
    savingsVsMarket: 900,
    aiPrediction: {
      fareTrend: 'stable',
      predictedPriceChangePercent: 2,
      fareTrendExplanation: 'AI Trend: High business frequency corridor operating smoothly.',
      onTimeProbability: 98,
      bestTimeToBook: 'Book today for guaranteed lowest fare',
      seatRecommendation: 'Row 4 forward cabin',
      weatherReliabilityScore: 98
    }
  },

  // 24. Kolkata (CCU) -> Delhi (DEL) [IndiGo - Scheduled]
  {
    id: 'FL-INTER-14',
    flightNumber: '6E-293',
    airline: 'IndiGo Airlines',
    airlineCode: '6E',
    aircraft: 'Airbus A321neo',
    aircraftRegistration: 'VT-IBH',
    routeType: 'inter_state',
    origin: getAirport('CCU'),
    destination: getAirport('DEL'),
    departureTime: '19:10',
    arrivalTime: '21:35',
    duration: '2h 25m',
    durationMinutes: 145,
    stops: 0,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    prices: { economy: 4800, premium_economy: 7100, business: 15900, first: 26000 },
    availableSeats: { economy: 154, premium_economy: 26, business: 12, first: 4 },
    totalSeats: 222,
    baggageAllowance: { cabin: '7 kg', checkIn: '15 kg' },
    amenities: ['6E Food & Beverage Menu', 'Fast Boarding Gate', 'Sharklet High Efficiency Cruising'],
    status: 'Scheduled',
    gate: 'T1-18',
    terminal: 'T1',
    weather: {
      condition: 'Clear',
      temperatureC: 27,
      visibilityKm: 10,
      windSpeedKmh: 10,
      stormIndex: 4,
      aiRiskScore: 3,
      aiCancellationRisk: 'Low',
    },
    competitors: [
      { competitorName: 'Air India', price: 5900, difference: 1100, baggageIncluded: '15 kg', mealIncluded: 'Full Dinner' },
      { competitorName: 'AeroWings', price: 4950, difference: 150, baggageIncluded: '15 kg', mealIncluded: 'Included' }
    ],
    avgMarketPrice: 5425,
    savingsVsMarket: 625,
    aiPrediction: {
      fareTrend: 'rising_soon',
      predictedPriceChangePercent: 12,
      fareTrendExplanation: 'AI Trend: High demand on evening capital transit.',
      onTimeProbability: 97,
      bestTimeToBook: 'Book before 17:00 to save ₹1,100',
      seatRecommendation: 'Row 12 for tranquil evening flight',
      weatherReliabilityScore: 98
    }
  },

  // =========================================================================
  // SECTION 3: COUNTRY-TO-COUNTRY INTERNATIONAL FLIGHTS
  // =========================================================================

  // 25. Delhi (DEL) -> Dubai (DXB) [IndiGo International]
  {
    id: 'FL-INTL-01',
    flightNumber: '6E-1461',
    airline: 'IndiGo International',
    airlineCode: '6E',
    aircraft: 'Airbus A321neo LR',
    aircraftRegistration: 'VT-IMV',
    routeType: 'international',
    origin: getAirport('DEL'),
    destination: getAirport('DXB'),
    departureTime: '17:25',
    arrivalTime: '20:10',
    duration: '4h 15m',
    durationMinutes: 255,
    stops: 0,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    prices: { economy: 15800, premium_economy: 24500, business: 54000, first: 89000 },
    availableSeats: { economy: 182, premium_economy: 28, business: 16, first: 4 },
    totalSeats: 232,
    baggageAllowance: { cabin: '7 kg', checkIn: '30 kg' },
    amenities: ['International Snack Bar', 'Duty-Free Shopping Catalog', 'Extended 30kg Baggage Allowance'],
    status: 'On Time',
    gate: 'T3-52',
    terminal: 'T3',
    weather: {
      condition: 'Clear',
      temperatureC: 35,
      visibilityKm: 10,
      windSpeedKmh: 14,
      stormIndex: 4,
      aiRiskScore: 3,
      aiCancellationRisk: 'Low',
    },
    competitors: [
      { competitorName: 'Emirates Airline', price: 26500, difference: 10700, baggageIncluded: '30 kg', mealIncluded: 'Full 3-Course' },
      { competitorName: 'Air India Express', price: 18200, difference: 2400, baggageIncluded: '20 kg', mealIncluded: 'Snack box' }
    ],
    avgMarketPrice: 22350,
    savingsVsMarket: 6550,
    aiPrediction: {
      fareTrend: 'rising_soon',
      predictedPriceChangePercent: 15,
      fareTrendExplanation: 'AI Trend: Dubai tourist and shopping season traffic high. Massive savings vs full-service airlines.',
      onTimeProbability: 97,
      bestTimeToBook: 'Book today to save over ₹10,000 vs Emirates',
      seatRecommendation: 'Row 14 exit row for comfortable leg stretch',
      weatherReliabilityScore: 98
    }
  },

  // 26. Delhi (DEL) -> Dubai (DXB) [Emirates Airline]
  {
    id: 'FL-INTL-02',
    flightNumber: 'EK-511',
    airline: 'Emirates',
    airlineCode: 'EK',
    aircraft: 'Boeing 777-300ER',
    aircraftRegistration: 'A6-EGC',
    routeType: 'international',
    origin: getAirport('DEL'),
    destination: getAirport('DXB'),
    departureTime: '11:00',
    arrivalTime: '13:30',
    duration: '4h 00m',
    durationMinutes: 240,
    stops: 0,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    prices: { economy: 24800, premium_economy: 39000, business: 84000, first: 148000 },
    availableSeats: { economy: 240, premium_economy: 42, business: 32, first: 8 },
    totalSeats: 354,
    baggageAllowance: { cabin: '10 kg', checkIn: '35 kg' },
    amenities: ['Award-winning ICE Entertainment (6500 Channels)', 'Gourmet Dining & Fine Beverages', 'First Class Private Suites', 'Wi-Fi'],
    status: 'Boarding',
    gate: 'T3-60',
    terminal: 'T3',
    weather: {
      condition: 'Clear',
      temperatureC: 35,
      visibilityKm: 10,
      windSpeedKmh: 14,
      stormIndex: 4,
      aiRiskScore: 3,
      aiCancellationRisk: 'Low',
    },
    competitors: [
      { competitorName: 'IndiGo International', price: 16500, difference: -8300, baggageIncluded: '30 kg', mealIncluded: 'Paid' },
      { competitorName: 'AeroWings Global', price: 18500, difference: -6300, baggageIncluded: '30 kg', mealIncluded: 'Included' }
    ],
    avgMarketPrice: 17500,
    savingsVsMarket: -7300,
    aiPrediction: {
      fareTrend: 'stable',
      predictedPriceChangePercent: 3,
      fareTrendExplanation: 'AI Dispatch: Luxury flagship wide-body boarding at Terminal 3 Gate 60.',
      onTimeProbability: 99,
      bestTimeToBook: 'Boarding in progress',
      seatRecommendation: 'First Class Private Suites for unmatched luxury',
      weatherReliabilityScore: 99
    }
  },

  // 27. Mumbai (BOM) -> London Heathrow (LHR) [Air India - Flagship]
  {
    id: 'FL-INTL-03',
    flightNumber: 'AI-129',
    airline: 'Air India',
    airlineCode: 'AI',
    aircraft: 'Boeing 777-300ER',
    aircraftRegistration: 'VT-ALR',
    routeType: 'international',
    origin: getAirport('BOM'),
    destination: getAirport('LHR'),
    departureTime: '06:15',
    arrivalTime: '11:30',
    duration: '9h 45m',
    durationMinutes: 585,
    stops: 0,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    prices: { economy: 46500, premium_economy: 72000, business: 162000, first: 285000 },
    availableSeats: { economy: 218, premium_economy: 36, business: 26, first: 6 },
    totalSeats: 342,
    baggageAllowance: { cabin: '10 kg', checkIn: '2x 23 kg' },
    amenities: ['Generous 2x 23kg Free Luggage', 'Maharaja Full Course Dining', 'Direct Non-Stop London Heathrow Landing', 'Lie-flat Suites'],
    status: 'On Time',
    gate: 'T2-76',
    terminal: 'T2',
    weather: {
      condition: 'Partly Cloudy',
      temperatureC: 17,
      visibilityKm: 10,
      windSpeedKmh: 16,
      stormIndex: 8,
      aiRiskScore: 5,
      aiCancellationRisk: 'Low',
    },
    competitors: [
      { competitorName: 'British Airways', price: 58000, difference: 11500, baggageIncluded: '1x 23 kg', mealIncluded: 'Full Dining' },
      { competitorName: 'Virgin Atlantic', price: 56000, difference: 9500, baggageIncluded: '1x 23 kg', mealIncluded: 'Full Dining' }
    ],
    avgMarketPrice: 57000,
    savingsVsMarket: 10500,
    aiPrediction: {
      fareTrend: 'rising_soon',
      predictedPriceChangePercent: 18,
      fareTrendExplanation: 'AI Trend: UK university student term surge driving rapid reservations.',
      onTimeProbability: 97,
      bestTimeToBook: 'Book within 24 hours to lock 2x 23kg free luggage allowance',
      seatRecommendation: 'Row 22 Premium Economy for 38-inch pitch & dedicated cabin service',
      weatherReliabilityScore: 96
    }
  },

  // 28. Mumbai (BOM) -> London Heathrow (LHR) [British Airways]
  {
    id: 'FL-INTL-04',
    flightNumber: 'BA-198',
    airline: 'British Airways',
    airlineCode: 'BA',
    aircraft: 'Boeing 787-9 Dreamliner',
    aircraftRegistration: 'G-ZBKA',
    routeType: 'international',
    origin: getAirport('BOM'),
    destination: getAirport('LHR'),
    departureTime: '13:10',
    arrivalTime: '18:20',
    duration: '9h 40m',
    durationMinutes: 580,
    stops: 0,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    prices: { economy: 54000, premium_economy: 82000, business: 179000, first: 310000 },
    availableSeats: { economy: 185, premium_economy: 32, business: 24, first: 6 },
    totalSeats: 260,
    baggageAllowance: { cabin: '10 kg', checkIn: '23 kg' },
    amenities: ['Club World Lie-Flat Suites with Doors', 'British High Tea Service', 'High-Speed Satellite Internet', 'Terminal 5 Arrival'],
    status: 'On Time',
    gate: 'T2-80',
    terminal: 'T2',
    weather: {
      condition: 'Partly Cloudy',
      temperatureC: 17,
      visibilityKm: 10,
      windSpeedKmh: 16,
      stormIndex: 8,
      aiRiskScore: 5,
      aiCancellationRisk: 'Low',
    },
    competitors: [
      { competitorName: 'Air India', price: 47000, difference: -7000, baggageIncluded: '2x 23 kg', mealIncluded: 'Full Dining' },
      { competitorName: 'AeroWings', price: 48000, difference: -6000, baggageIncluded: '35 kg', mealIncluded: 'Included' }
    ],
    avgMarketPrice: 47500,
    savingsVsMarket: -6500,
    aiPrediction: {
      fareTrend: 'stable',
      predictedPriceChangePercent: 2,
      fareTrendExplanation: 'AI Trend: Premier transatlantic & European connection route.',
      onTimeProbability: 96,
      bestTimeToBook: 'Book today for preferred Club World suite selection',
      seatRecommendation: 'Club World 6A for rear-facing private cocoon feel',
      weatherReliabilityScore: 96
    }
  },

  // 29. Bengaluru (BLR) -> Singapore (SIN) [IndiGo International]
  {
    id: 'FL-INTL-05',
    flightNumber: '6E-1005',
    airline: 'IndiGo International',
    airlineCode: '6E',
    aircraft: 'Airbus A321neo',
    aircraftRegistration: 'VT-INX',
    routeType: 'international',
    origin: getAirport('BLR'),
    destination: getAirport('SIN'),
    departureTime: '11:45',
    arrivalTime: '18:40',
    duration: '4h 25m',
    durationMinutes: 265,
    stops: 0,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    prices: { economy: 13900, premium_economy: 21500, business: 48000, first: 79000 },
    availableSeats: { economy: 168, premium_economy: 24, business: 12, first: 0 },
    totalSeats: 222,
    baggageAllowance: { cabin: '7 kg', checkIn: '30 kg' },
    amenities: ['6E Snack Bar', 'Changi Airport Arrival & Transit Guide', 'Duty-Free Goods'],
    status: 'On Time',
    gate: 'T1-28',
    terminal: 'T1',
    weather: {
      condition: 'Clear',
      temperatureC: 29,
      visibilityKm: 10,
      windSpeedKmh: 12,
      stormIndex: 6,
      aiRiskScore: 4,
      aiCancellationRisk: 'Low',
    },
    competitors: [
      { competitorName: 'Singapore Airlines', price: 23500, difference: 9600, baggageIncluded: '25 kg', mealIncluded: 'Full Service' },
      { competitorName: 'AeroWings', price: 16200, difference: 2300, baggageIncluded: '25 kg', mealIncluded: 'Included' }
    ],
    avgMarketPrice: 19850,
    savingsVsMarket: 5950,
    aiPrediction: {
      fareTrend: 'rising_soon',
      predictedPriceChangePercent: 14,
      fareTrendExplanation: 'AI Trend: Tech conferences in Singapore boosting mid-week demand.',
      onTimeProbability: 98,
      bestTimeToBook: 'Book today to save ~₹9,600 vs full-service airlines',
      seatRecommendation: 'Row 12 for calm mid-cabin flight',
      weatherReliabilityScore: 98
    }
  },

  // 30. Bengaluru (BLR) -> Singapore (SIN) [Singapore Airlines]
  {
    id: 'FL-INTL-06',
    flightNumber: 'SQ-503',
    airline: 'Singapore Airlines',
    airlineCode: 'SQ',
    aircraft: 'Airbus A350-900',
    aircraftRegistration: '9V-SMG',
    routeType: 'international',
    origin: getAirport('BLR'),
    destination: getAirport('SIN'),
    departureTime: '23:10',
    arrivalTime: '06:10',
    duration: '4h 30m',
    durationMinutes: 270,
    stops: 0,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    prices: { economy: 22800, premium_economy: 34500, business: 76000, first: 135000 },
    availableSeats: { economy: 190, premium_economy: 30, business: 28, first: 4 },
    totalSeats: 253,
    baggageAllowance: { cabin: '10 kg', checkIn: '30 kg' },
    amenities: ['World-renowned Singapore Girl Service', 'Book the Cook Chef Meals', 'KrisWorld Entertainment', 'High-Speed Wi-Fi'],
    status: 'Scheduled',
    gate: 'T1-32',
    terminal: 'T1',
    weather: {
      condition: 'Clear',
      temperatureC: 29,
      visibilityKm: 10,
      windSpeedKmh: 12,
      stormIndex: 6,
      aiRiskScore: 4,
      aiCancellationRisk: 'Low',
    },
    competitors: [
      { competitorName: 'IndiGo International', price: 14200, difference: -8600, baggageIncluded: '30 kg', mealIncluded: 'Paid' }
    ],
    avgMarketPrice: 14200,
    savingsVsMarket: -8600,
    aiPrediction: {
      fareTrend: 'stable',
      predictedPriceChangePercent: 3,
      fareTrendExplanation: 'AI Trend: Overnight red-eye service arriving fresh for Singapore business hours.',
      onTimeProbability: 99,
      bestTimeToBook: 'Book within 48 hours',
      seatRecommendation: 'Business Class Lie-Flat bed for full overnight sleep',
      weatherReliabilityScore: 98
    }
  },

  // 31. Delhi (DEL) -> New York (JFK) [Air India - Non-Stop Ultra Long Haul]
  {
    id: 'FL-INTL-07',
    flightNumber: 'AI-101',
    airline: 'Air India',
    airlineCode: 'AI',
    aircraft: 'Boeing 777-300ER',
    aircraftRegistration: 'VT-ALQ',
    routeType: 'international',
    origin: getAirport('DEL'),
    destination: getAirport('JFK'),
    departureTime: '02:00',
    arrivalTime: '07:35',
    duration: '15h 05m',
    durationMinutes: 905,
    stops: 0,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    prices: { economy: 68000, premium_economy: 112000, business: 245000, first: 420000 },
    availableSeats: { economy: 240, premium_economy: 40, business: 32, first: 6 },
    totalSeats: 342,
    baggageAllowance: { cabin: '10 kg', checkIn: '2x 23 kg' },
    amenities: ['Direct Non-Stop Ultra Long Haul (No Layover)', '3 Multi-Course Hot Meals', 'Free 2x 23kg Luggage', 'Comfort Amenity Kit'],
    status: 'On Time',
    gate: 'T3-68',
    terminal: 'T3',
    weather: {
      condition: 'Clear',
      temperatureC: 25,
      visibilityKm: 10,
      windSpeedKmh: 14,
      stormIndex: 5,
      aiRiskScore: 3,
      aiCancellationRisk: 'Low',
    },
    competitors: [
      { competitorName: 'Emirates (1-Stop DXB)', price: 82000, difference: 14000, baggageIncluded: '2x 23 kg', mealIncluded: 'Meals' },
      { competitorName: 'Qatar Airways (1-Stop DOH)', price: 79000, difference: 11000, baggageIncluded: '2x 23 kg', mealIncluded: 'Meals' }
    ],
    avgMarketPrice: 80500,
    savingsVsMarket: 12500,
    aiPrediction: {
      fareTrend: 'rising_soon',
      predictedPriceChangePercent: 22,
      fareTrendExplanation: 'AI Trend: Non-stop US corridor saves 6+ hours travel time. Fares rising rapidly for fall semester.',
      onTimeProbability: 95,
      bestTimeToBook: 'Book today to save ₹14,000+ vs Middle Eastern transit carriers',
      seatRecommendation: 'Row 24 Premium Economy with leg rest for maximum long-haul rest',
      weatherReliabilityScore: 97
    }
  },

  // 32. Chennai (MAA) -> Bangkok (BKK) [IndiGo International]
  {
    id: 'FL-INTL-08',
    flightNumber: '6E-1055',
    airline: 'IndiGo International',
    airlineCode: '6E',
    aircraft: 'Airbus A321neo',
    aircraftRegistration: 'VT-IRW',
    routeType: 'international',
    origin: getAirport('MAA'),
    destination: getAirport('BKK'),
    departureTime: '21:30',
    arrivalTime: '02:40',
    duration: '3h 40m',
    durationMinutes: 220,
    stops: 0,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    prices: { economy: 11800, premium_economy: 18200, business: 39000, first: 65000 },
    availableSeats: { economy: 174, premium_economy: 24, business: 12, first: 0 },
    totalSeats: 222,
    baggageAllowance: { cabin: '7 kg', checkIn: '30 kg' },
    amenities: ['6E Fresh Bites', 'Thailand Visa On Arrival Guidance', 'Duty-Free Express'],
    status: 'Scheduled',
    gate: 'T4-12',
    terminal: 'T4',
    weather: {
      condition: 'Partly Cloudy',
      temperatureC: 30,
      visibilityKm: 10,
      windSpeedKmh: 11,
      stormIndex: 7,
      aiRiskScore: 4,
      aiCancellationRisk: 'Low',
    },
    competitors: [
      { competitorName: 'Thai Airways', price: 19800, difference: 8000, baggageIncluded: '25 kg', mealIncluded: 'Thai Full Meal' },
      { competitorName: 'AirAsia', price: 12900, difference: 1100, baggageIncluded: '20 kg', mealIncluded: 'Paid' }
    ],
    avgMarketPrice: 16350,
    savingsVsMarket: 4550,
    aiPrediction: {
      fareTrend: 'rising_soon',
      predictedPriceChangePercent: 12,
      fareTrendExplanation: 'AI Trend: Weekend beach & leisure gateway demand strong.',
      onTimeProbability: 98,
      bestTimeToBook: 'Book today to preserve ₹11,800 promo fare',
      seatRecommendation: 'Row 14 exit row for spacious leg comfort',
      weatherReliabilityScore: 98
    }
  },

  // =========================================================================
  // SECTION 4: DEDICATED AEROWINGS FLEET (Intra-State, Inter-State & Global)
  // =========================================================================

  // 33. AeroWings Intra-State: Mumbai (BOM) -> Nagpur (NAG)
  {
    id: 'FL-AW-INTRA-01',
    flightNumber: 'AW-106',
    airline: 'AeroWings StateShuttle',
    airlineCode: 'AW',
    aircraft: 'Airbus A320neo',
    aircraftRegistration: 'VT-AWA',
    routeType: 'intra_state',
    origin: getAirport('BOM'),
    destination: getAirport('NAG'),
    departureTime: '08:30',
    arrivalTime: '09:50',
    duration: '1h 20m',
    durationMinutes: 80,
    stops: 0,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    prices: { economy: 3150, premium_economy: 4800, business: 9900, first: 15500 },
    availableSeats: { economy: 110, premium_economy: 20, business: 10, first: 0 },
    totalSeats: 180,
    baggageAllowance: { cabin: '7 kg', checkIn: '15 kg' },
    amenities: ['Complimentary AeroWings Snack Box', 'Fresh Brewed Coffee', 'High-Speed Wi-Fi', 'Extra Legroom Rows'],
    status: 'On Time',
    gate: 'T2-14',
    terminal: 'T2',
    weather: {
      condition: 'Clear',
      temperatureC: 31,
      visibilityKm: 10,
      windSpeedKmh: 10,
      stormIndex: 3,
      aiRiskScore: 2,
      aiCancellationRisk: 'Low',
    },
    competitors: [
      { competitorName: 'IndiGo Airlines', price: 3450, difference: 300, baggageIncluded: '15 kg', mealIncluded: 'Paid' },
      { competitorName: 'Air India', price: 4100, difference: 950, baggageIncluded: '15 kg', mealIncluded: 'Included' }
    ],
    avgMarketPrice: 3775,
    savingsVsMarket: 625,
    aiPrediction: {
      fareTrend: 'stable',
      predictedPriceChangePercent: 2,
      fareTrendExplanation: 'AI Trend: AeroWings intra-state shuttle operating with 99% punctuality record.',
      onTimeProbability: 99,
      bestTimeToBook: 'Book now to secure complimentary hot beverage & snacks',
      seatRecommendation: 'Row 3 for rapid deplaning at Nagpur',
      weatherReliabilityScore: 99
    }
  },

  // 34. AeroWings Intra-State: Chennai (MAA) -> Coimbatore (CJB)
  {
    id: 'FL-AW-INTRA-02',
    flightNumber: 'AW-112',
    airline: 'AeroWings StateShuttle',
    airlineCode: 'AW',
    aircraft: 'ATR 72-600 EcoTurboprop',
    aircraftRegistration: 'VT-AWB',
    routeType: 'intra_state',
    origin: getAirport('MAA'),
    destination: getAirport('CJB'),
    departureTime: '07:30',
    arrivalTime: '08:35',
    duration: '1h 05m',
    durationMinutes: 65,
    stops: 0,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    prices: { economy: 2450, premium_economy: 3900, business: 8400, first: 12800 },
    availableSeats: { economy: 54, premium_economy: 10, business: 4, first: 0 },
    totalSeats: 76,
    baggageAllowance: { cabin: '7 kg', checkIn: '15 kg' },
    amenities: ['Complimentary Madras Filter Coffee', 'Morning Snack Box', 'Fast Turboprop Transit'],
    status: 'On Time',
    gate: 'T4-02',
    terminal: 'T4',
    weather: {
      condition: 'Clear',
      temperatureC: 29,
      visibilityKm: 10,
      windSpeedKmh: 9,
      stormIndex: 3,
      aiRiskScore: 2,
      aiCancellationRisk: 'Low',
    },
    competitors: [
      { competitorName: 'Air India', price: 2850, difference: 400, baggageIncluded: '15 kg', mealIncluded: 'Included' },
      { competitorName: 'IndiGo Airlines', price: 2650, difference: 200, baggageIncluded: '15 kg', mealIncluded: 'Paid' }
    ],
    avgMarketPrice: 2750,
    savingsVsMarket: 300,
    aiPrediction: {
      fareTrend: 'stable',
      predictedPriceChangePercent: 0,
      fareTrendExplanation: 'AI Trend: Popular business textile corridor with consistent morning schedules.',
      onTimeProbability: 99,
      bestTimeToBook: 'Book today for best fare guarantee',
      seatRecommendation: 'Left window (A) for scenic Nilgiri foothill approaches',
      weatherReliabilityScore: 99
    }
  },

  // 35. AeroWings Intra-State: Bengaluru (BLR) -> Mangalore (IXE)
  {
    id: 'FL-AW-INTRA-03',
    flightNumber: 'AW-120',
    airline: 'AeroWings StateShuttle',
    airlineCode: 'AW',
    aircraft: 'ATR 72-600 EcoTurboprop',
    aircraftRegistration: 'VT-AWD',
    routeType: 'intra_state',
    origin: getAirport('BLR'),
    destination: getAirport('IXE'),
    departureTime: '09:00',
    arrivalTime: '10:00',
    duration: '1h 00m',
    durationMinutes: 60,
    stops: 0,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    prices: { economy: 2350, premium_economy: 3750, business: 7900, first: 11900 },
    availableSeats: { economy: 58, premium_economy: 8, business: 4, first: 0 },
    totalSeats: 76,
    baggageAllowance: { cabin: '7 kg', checkIn: '15 kg' },
    amenities: ['Complimentary Coastal Snack Box', 'Aerowings Western Ghats Guide', 'Quick Luggage Drop'],
    status: 'On Time',
    gate: 'T1-05',
    terminal: 'T1',
    weather: {
      condition: 'Clear',
      temperatureC: 28,
      visibilityKm: 10,
      windSpeedKmh: 11,
      stormIndex: 4,
      aiRiskScore: 3,
      aiCancellationRisk: 'Low',
    },
    competitors: [
      { competitorName: 'IndiGo Airlines', price: 2600, difference: 250, baggageIncluded: '15 kg', mealIncluded: 'Paid' }
    ],
    avgMarketPrice: 2600,
    savingsVsMarket: 250,
    aiPrediction: {
      fareTrend: 'stable',
      predictedPriceChangePercent: 0,
      fareTrendExplanation: 'AI Trend: Daily Karnataka regional link with optimal weather condition.',
      onTimeProbability: 99,
      bestTimeToBook: 'Book today for standard tier',
      seatRecommendation: 'Right window for Arabian Sea coastline views',
      weatherReliabilityScore: 99
    }
  },

  // 36. AeroWings Intra-State: Jaipur (JAI) -> Udaipur (UDR)
  {
    id: 'FL-AW-INTRA-04',
    flightNumber: 'AW-134',
    airline: 'AeroWings StateShuttle',
    airlineCode: 'AW',
    aircraft: 'ATR 72-600 EcoTurboprop',
    aircraftRegistration: 'VT-AWF',
    routeType: 'intra_state',
    origin: getAirport('JAI'),
    destination: getAirport('UDR'),
    departureTime: '15:10',
    arrivalTime: '16:05',
    duration: '0h 55m',
    durationMinutes: 55,
    stops: 0,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    prices: { economy: 2280, premium_economy: 3600, business: 7800, first: 12000 },
    availableSeats: { economy: 50, premium_economy: 8, business: 4, first: 0 },
    totalSeats: 76,
    baggageAllowance: { cabin: '7 kg', checkIn: '15 kg' },
    amenities: ['Royal Rajasthan Welcome Beverage', 'Palace City Guide', 'Comfortable Cabin'],
    status: 'On Time',
    gate: 'T2-01',
    terminal: 'T2',
    weather: {
      condition: 'Clear',
      temperatureC: 32,
      visibilityKm: 10,
      windSpeedKmh: 8,
      stormIndex: 2,
      aiRiskScore: 1,
      aiCancellationRisk: 'Low',
    },
    competitors: [
      { competitorName: 'IndiGo Airlines', price: 2550, difference: 270, baggageIncluded: '15 kg', mealIncluded: 'Paid' }
    ],
    avgMarketPrice: 2550,
    savingsVsMarket: 270,
    aiPrediction: {
      fareTrend: 'rising_soon',
      predictedPriceChangePercent: 10,
      fareTrendExplanation: 'AI Trend: Heritage tourism travelers booking sunset flights.',
      onTimeProbability: 99,
      bestTimeToBook: 'Book today to lock lowest fare',
      seatRecommendation: 'Left window for Lake Pichola panoramic views',
      weatherReliabilityScore: 99
    }
  },

  // 37. AeroWings Inter-State: Delhi (DEL) -> Bengaluru (BLR) [AeroWings Prime]
  {
    id: 'FL-AW-INTER-01',
    flightNumber: 'AW-305',
    airline: 'AeroWings Prime',
    airlineCode: 'AW',
    aircraft: 'Airbus A321neo LR',
    aircraftRegistration: 'VT-AWM',
    routeType: 'inter_state',
    origin: getAirport('DEL'),
    destination: getAirport('BLR'),
    departureTime: '08:00',
    arrivalTime: '10:45',
    duration: '2h 45m',
    durationMinutes: 165,
    stops: 0,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    prices: { economy: 5350, premium_economy: 7900, business: 17500, first: 29500 },
    availableSeats: { economy: 156, premium_economy: 28, business: 16, first: 4 },
    totalSeats: 222,
    baggageAllowance: { cabin: '7 kg', checkIn: '15 kg' },
    amenities: ['Complimentary Gourmet Hot Meal', 'High-Speed Ka-Band Wi-Fi', 'USB-C & AC Power Sockets', 'AeroWings IFE Streaming'],
    status: 'On Time',
    gate: 'T3-26',
    terminal: 'T3',
    weather: {
      condition: 'Clear',
      temperatureC: 25,
      visibilityKm: 10,
      windSpeedKmh: 10,
      stormIndex: 4,
      aiRiskScore: 3,
      aiCancellationRisk: 'Low',
    },
    competitors: [
      { competitorName: 'IndiGo Airlines', price: 5800, difference: 450, baggageIncluded: '15 kg', mealIncluded: 'Paid' },
      { competitorName: 'Air India', price: 6900, difference: 1550, baggageIncluded: '15 kg', mealIncluded: 'Included' }
    ],
    avgMarketPrice: 6350,
    savingsVsMarket: 1000,
    aiPrediction: {
      fareTrend: 'rising_soon',
      predictedPriceChangePercent: 15,
      fareTrendExplanation: 'AI Trend: Tech executive corridor with high customer rating on AeroWings Prime.',
      onTimeProbability: 99,
      bestTimeToBook: 'Book today to save over ₹1,000 vs full service carriers',
      seatRecommendation: 'Row 12 Exit Row for spacious workspace',
      weatherReliabilityScore: 99
    }
  },

  // 38. AeroWings Inter-State: Mumbai (BOM) -> Goa (GOI) [AeroWings Express]
  {
    id: 'FL-AW-INTER-02',
    flightNumber: 'AW-408',
    airline: 'AeroWings Express',
    airlineCode: 'AW',
    aircraft: 'Airbus A320neo',
    aircraftRegistration: 'VT-AWN',
    routeType: 'inter_state',
    origin: getAirport('BOM'),
    destination: getAirport('GOI'),
    departureTime: '13:45',
    arrivalTime: '14:55',
    duration: '1h 10m',
    durationMinutes: 70,
    stops: 0,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    prices: { economy: 3100, premium_economy: 4600, business: 9800, first: 15800 },
    availableSeats: { economy: 142, premium_economy: 20, business: 8, first: 0 },
    totalSeats: 180,
    baggageAllowance: { cabin: '7 kg', checkIn: '15 kg' },
    amenities: ['Complimentary Chilled Tropical Juice', 'Goa Beach Express Guide', 'Fast Turnaround'],
    status: 'On Time',
    gate: 'T2-18',
    terminal: 'T2',
    weather: {
      condition: 'Clear',
      temperatureC: 29,
      visibilityKm: 10,
      windSpeedKmh: 13,
      stormIndex: 4,
      aiRiskScore: 3,
      aiCancellationRisk: 'Low',
    },
    competitors: [
      { competitorName: 'IndiGo Airlines', price: 3400, difference: 300, baggageIncluded: '15 kg', mealIncluded: 'Paid' },
      { competitorName: 'SpiceJet', price: 3750, difference: 650, baggageIncluded: '15 kg', mealIncluded: 'Paid' }
    ],
    avgMarketPrice: 3575,
    savingsVsMarket: 475,
    aiPrediction: {
      fareTrend: 'rising_soon',
      predictedPriceChangePercent: 18,
      fareTrendExplanation: 'AI Trend: High leisure demand for afternoon Goa direct shuttle.',
      onTimeProbability: 98,
      bestTimeToBook: 'Book today for direct sub-₹3,500 holiday fare',
      seatRecommendation: 'Seats 10A-10F for sunny coastal views',
      weatherReliabilityScore: 98
    }
  },

  // 39. AeroWings Inter-State: Delhi (DEL) -> Kolkata (CCU) [AeroWings Express]
  {
    id: 'FL-AW-INTER-03',
    flightNumber: 'AW-502',
    airline: 'AeroWings Express',
    airlineCode: 'AW',
    aircraft: 'Airbus A320neo',
    aircraftRegistration: 'VT-AWP',
    routeType: 'inter_state',
    origin: getAirport('DEL'),
    destination: getAirport('CCU'),
    departureTime: '11:15',
    arrivalTime: '13:30',
    duration: '2h 15m',
    durationMinutes: 135,
    stops: 0,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    prices: { economy: 4600, premium_economy: 6800, business: 14800, first: 24500 },
    availableSeats: { economy: 138, premium_economy: 22, business: 10, first: 2 },
    totalSeats: 180,
    baggageAllowance: { cabin: '7 kg', checkIn: '15 kg' },
    amenities: ['Complimentary Hot Snack Box', 'Tea & Coffee Service', 'In-Seat USB Ports'],
    status: 'On Time',
    gate: 'T3-18',
    terminal: 'T3',
    weather: {
      condition: 'Clear',
      temperatureC: 28,
      visibilityKm: 10,
      windSpeedKmh: 9,
      stormIndex: 3,
      aiRiskScore: 2,
      aiCancellationRisk: 'Low',
    },
    competitors: [
      { competitorName: 'IndiGo Airlines', price: 4950, difference: 350, baggageIncluded: '15 kg', mealIncluded: 'Paid' },
      { competitorName: 'Air India', price: 5800, difference: 1200, baggageIncluded: '15 kg', mealIncluded: 'Included' }
    ],
    avgMarketPrice: 5375,
    savingsVsMarket: 775,
    aiPrediction: {
      fareTrend: 'stable',
      predictedPriceChangePercent: 4,
      fareTrendExplanation: 'AI Trend: Mid-day trunk transit operating on time.',
      onTimeProbability: 98,
      bestTimeToBook: 'Book today to lock lowest fare',
      seatRecommendation: 'Row 7 forward cabin for smooth ride',
      weatherReliabilityScore: 98
    }
  },

  // 40. AeroWings Inter-State: Hyderabad (HYD) -> Delhi (DEL) [AeroWings Express]
  {
    id: 'FL-AW-INTER-04',
    flightNumber: 'AW-604',
    airline: 'AeroWings Express',
    airlineCode: 'AW',
    aircraft: 'Airbus A320neo',
    aircraftRegistration: 'VT-AWQ',
    routeType: 'inter_state',
    origin: getAirport('HYD'),
    destination: getAirport('DEL'),
    departureTime: '10:15',
    arrivalTime: '12:30',
    duration: '2h 15m',
    durationMinutes: 135,
    stops: 0,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    prices: { economy: 4200, premium_economy: 6200, business: 13800, first: 22500 },
    availableSeats: { economy: 140, premium_economy: 20, business: 8, first: 2 },
    totalSeats: 180,
    baggageAllowance: { cabin: '7 kg', checkIn: '15 kg' },
    amenities: ['Complimentary Snack Box', 'Mineral Water Bottle', 'High-Speed Wi-Fi'],
    status: 'On Time',
    gate: 'T1-09',
    terminal: 'T1',
    weather: {
      condition: 'Clear',
      temperatureC: 29,
      visibilityKm: 10,
      windSpeedKmh: 10,
      stormIndex: 3,
      aiRiskScore: 2,
      aiCancellationRisk: 'Low',
    },
    competitors: [
      { competitorName: 'IndiGo Airlines', price: 4450, difference: 250, baggageIncluded: '15 kg', mealIncluded: 'Paid' },
      { competitorName: 'Air India', price: 5400, difference: 1200, baggageIncluded: '15 kg', mealIncluded: 'Included' }
    ],
    avgMarketPrice: 4925,
    savingsVsMarket: 725,
    aiPrediction: {
      fareTrend: 'stable',
      predictedPriceChangePercent: 2,
      fareTrendExplanation: 'AI Trend: Daily business link with high on-time rating.',
      onTimeProbability: 99,
      bestTimeToBook: 'Book today to lock lowest fare bracket',
      seatRecommendation: 'Row 5 forward cabin for rapid exit',
      weatherReliabilityScore: 99
    }
  },

  // 41. AeroWings International: Delhi (DEL) -> Dubai (DXB) [AeroWings Global]
  {
    id: 'FL-AW-INTL-01',
    flightNumber: 'AW-901',
    airline: 'AeroWings Global',
    airlineCode: 'AW',
    aircraft: 'Airbus A321neo XLR',
    aircraftRegistration: 'VT-AWX',
    routeType: 'international',
    origin: getAirport('DEL'),
    destination: getAirport('DXB'),
    departureTime: '14:10',
    arrivalTime: '16:50',
    duration: '4h 10m',
    durationMinutes: 250,
    stops: 0,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    prices: { economy: 14900, premium_economy: 23000, business: 51000, first: 84000 },
    availableSeats: { economy: 170, premium_economy: 28, business: 16, first: 4 },
    totalSeats: 222,
    baggageAllowance: { cabin: '8 kg', checkIn: '30 kg' },
    amenities: ['Complimentary Hot Multi-Course Meal', 'Generous 30kg Baggage Allowance', 'Global IFE 1000+ Movies', 'Wi-Fi & USB Power'],
    status: 'On Time',
    gate: 'T3-48',
    terminal: 'T3',
    weather: {
      condition: 'Clear',
      temperatureC: 35,
      visibilityKm: 10,
      windSpeedKmh: 13,
      stormIndex: 4,
      aiRiskScore: 3,
      aiCancellationRisk: 'Low',
    },
    competitors: [
      { competitorName: 'Emirates', price: 25500, difference: 10600, baggageIncluded: '30 kg', mealIncluded: 'Full Dining' },
      { competitorName: 'IndiGo International', price: 16200, difference: 1300, baggageIncluded: '30 kg', mealIncluded: 'Paid' }
    ],
    avgMarketPrice: 20850,
    savingsVsMarket: 5950,
    aiPrediction: {
      fareTrend: 'rising_soon',
      predictedPriceChangePercent: 16,
      fareTrendExplanation: 'AI Trend: Premier AeroWings Global service offering full meal and free 30kg luggage at competitive rates.',
      onTimeProbability: 98,
      bestTimeToBook: 'Book today to save over ₹10,000 vs Emirates',
      seatRecommendation: 'Row 14 exit row for generous leg stretch',
      weatherReliabilityScore: 98
    }
  },

  // 42. AeroWings International: Mumbai (BOM) -> London Heathrow (LHR) [AeroWings Global]
  {
    id: 'FL-AW-INTL-02',
    flightNumber: 'AW-910',
    airline: 'AeroWings Global',
    airlineCode: 'AW',
    aircraft: 'Boeing 777-300ER',
    aircraftRegistration: 'VT-AWZ',
    routeType: 'international',
    origin: getAirport('BOM'),
    destination: getAirport('LHR'),
    departureTime: '08:30',
    arrivalTime: '13:45',
    duration: '9h 45m',
    durationMinutes: 585,
    stops: 0,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    prices: { economy: 45000, premium_economy: 69000, business: 155000, first: 275000 },
    availableSeats: { economy: 220, premium_economy: 36, business: 28, first: 6 },
    totalSeats: 342,
    baggageAllowance: { cabin: '10 kg', checkIn: '2x 23 kg' },
    amenities: ['Generous 2x 23kg Check-in Luggage', 'Chef-Crafted Full Dining & Afternoon Tea', 'Direct Non-Stop London Heathrow Flight', 'Lie-flat Business Suites'],
    status: 'On Time',
    gate: 'T2-72',
    terminal: 'T2',
    weather: {
      condition: 'Partly Cloudy',
      temperatureC: 18,
      visibilityKm: 10,
      windSpeedKmh: 14,
      stormIndex: 7,
      aiRiskScore: 4,
      aiCancellationRisk: 'Low',
    },
    competitors: [
      { competitorName: 'British Airways', price: 56000, difference: 11000, baggageIncluded: '1x 23 kg', mealIncluded: 'Dining' },
      { competitorName: 'Air India', price: 47500, difference: 2500, baggageIncluded: '2x 23 kg', mealIncluded: 'Dining' }
    ],
    avgMarketPrice: 51750,
    savingsVsMarket: 6750,
    aiPrediction: {
      fareTrend: 'rising_soon',
      predictedPriceChangePercent: 20,
      fareTrendExplanation: 'AI Trend: Premium long-haul flight with high customer satisfaction on seating and in-flight catering.',
      onTimeProbability: 97,
      bestTimeToBook: 'Book today to secure 2x 23kg free baggage allowance',
      seatRecommendation: 'Row 20 Premium Economy for wide pitch and quiet cabin',
      weatherReliabilityScore: 97
    }
  },

  // 43. AeroWings International: Bengaluru (BLR) -> Singapore (SIN) [AeroWings Global]
  {
    id: 'FL-AW-INTL-03',
    flightNumber: 'AW-920',
    airline: 'AeroWings Global',
    airlineCode: 'AW',
    aircraft: 'Airbus A350-900',
    aircraftRegistration: 'VT-AWV',
    routeType: 'international',
    origin: getAirport('BLR'),
    destination: getAirport('SIN'),
    departureTime: '15:20',
    arrivalTime: '22:15',
    duration: '4h 25m',
    durationMinutes: 265,
    stops: 0,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    prices: { economy: 15200, premium_economy: 23500, business: 52000, first: 86000 },
    availableSeats: { economy: 184, premium_economy: 30, business: 22, first: 4 },
    totalSeats: 256,
    baggageAllowance: { cabin: '8 kg', checkIn: '30 kg' },
    amenities: ['Complimentary Hot Gourmet Asian/Indian Dinner', '30kg Free Luggage', 'A350 Ultra Quiet Cabin & Mood Lighting', 'High-Speed Wi-Fi'],
    status: 'On Time',
    gate: 'T1-30',
    terminal: 'T1',
    weather: {
      condition: 'Clear',
      temperatureC: 29,
      visibilityKm: 10,
      windSpeedKmh: 11,
      stormIndex: 5,
      aiRiskScore: 3,
      aiCancellationRisk: 'Low',
    },
    competitors: [
      { competitorName: 'Singapore Airlines', price: 23800, difference: 8600, baggageIncluded: '30 kg', mealIncluded: 'Full Service' },
      { competitorName: 'IndiGo International', price: 14500, difference: -700, baggageIncluded: '30 kg', mealIncluded: 'Paid' }
    ],
    avgMarketPrice: 19150,
    savingsVsMarket: 3950,
    aiPrediction: {
      fareTrend: 'stable',
      predictedPriceChangePercent: 4,
      fareTrendExplanation: 'AI Trend: Next-gen Airbus A350 long-range comfort arriving in Singapore at convenient evening hour.',
      onTimeProbability: 99,
      bestTimeToBook: 'Book today to enjoy A350 wide-body comfort',
      seatRecommendation: 'Row 15 for calm mid-cabin flight and fast deplaning',
      weatherReliabilityScore: 98
    }
  }
];

// ----------------------------------------------------
// AI VISA & TRAVEL DOCUMENT DATABASE
// ----------------------------------------------------
export const VISA_RULES_DATABASE: Record<string, Record<string, VisaRequirement>> = {
  India: {
    'United Arab Emirates': {
      nationality: 'India',
      destinationCountry: 'United Arab Emirates',
      purpose: 'tourism',
      status: 'eVisa / ETA',
      statusBadgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      maxStay: '30 to 60 Days',
      passportValidityMonths: 6,
      processingDays: '24 to 48 Hours',
      approxFee: 'AED 350 (~ ₹7,900)',
      requirements: [
        'Valid Indian Passport with minimum 6 months validity from date of entry.',
        'Confirmed return or onward flight ticket.',
        'Confirmed hotel reservation or proof of accommodation.',
        'Indian passport holders with valid US Visa (B1/B2/H1B) or UK/EU Residence permit get Instant Visa on Arrival (14 Days) at Dubai (DXB).'
      ],
      mandatoryDocuments: ['Passport front/back scan', 'Color photograph (white background)', 'Round-trip flight booking voucher', 'Proof of sufficient funds'],
      healthVaccines: ['Standard COVID-19 norms relaxed', 'No mandatory yellow fever unless arriving from endemic zone'],
      customsRestrictions: ['Maximum 10,000 AED cash without declaration', 'Strict ban on narcotics and unprescribed psychoactive medicines'],
      officialPortalUrl: 'https://smartservices.icp.gov.ae',
      aiRecommendation: '💡 AI Tip: If you hold a valid US/UK/Schengen visa in your passport, you do NOT need a pre-arranged visa! Simply proceed to the Marhaba desk at DXB for an instant 14-day Visa on Arrival for AED 120.'
    },
    'United Kingdom': {
      nationality: 'India',
      destinationCountry: 'United Kingdom',
      purpose: 'tourism',
      status: 'Embassy Visa Required',
      statusBadgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      maxStay: 'Up to 6 Months (Standard Visitor Visa)',
      passportValidityMonths: 6,
      processingDays: '3 to 6 Weeks (Priority 5-day available)',
      approxFee: '£115 (~ ₹12,100)',
      requirements: [
        'Standard Visitor Visa required prior to boarding flight.',
        'Biometric appointment at VFS Global Visa Application Centre.',
        'Proof of financial solvency (last 6 months bank statements with sufficient funds).',
        'Employment verification letter or business registration certificates.',
        'Detailed day-wise UK travel itinerary and confirmed hotel accommodation.'
      ],
      mandatoryDocuments: ['Current Passport + old passports', '6 months stamped bank statements', 'ITR returns (3 years)', 'Leave approval letter from employer', 'Accommodation proof'],
      healthVaccines: ['No quarantine required', 'Tuberculosis (TB) test certificate required only if staying over 6 months'],
      customsRestrictions: ['Maximum £10,000 cash or equivalent without declaration', 'Strict duty-free alcohol and tobacco limits'],
      officialPortalUrl: 'https://www.gov.uk/standard-visitor',
      aiRecommendation: '💡 AI Tip: Apply at least 4 to 6 weeks before your intended travel date. AeroWings provides official Visa Application Flight Reservation Letters free of charge from your booking dashboard.'
    },
    'Singapore': {
      nationality: 'India',
      destinationCountry: 'Singapore',
      purpose: 'tourism',
      status: 'eVisa / ETA',
      statusBadgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      maxStay: '30 Days (Multiple Entry)',
      passportValidityMonths: 6,
      processingDays: '2 to 3 Working Days',
      approxFee: 'SGD 30 (~ ₹1,900)',
      requirements: [
        'Valid Indian Passport with 6 months validity.',
        'SG Arrival Card (SGAC) with Electronic Health Declaration submitted within 3 days prior to arrival.',
        'Confirmed onward or return ticket.',
        'Proof of accommodation and sufficient funds for stay duration.'
      ],
      mandatoryDocuments: ['Passport bio page copy', 'Passport size photo', 'Form 14A duly completed', 'Covering letter explaining trip purpose'],
      healthVaccines: ['Yellow fever vaccine if arriving from endemic country', 'Routine immunizations recommended'],
      customsRestrictions: ['Chewing gum prohibited', 'Electronic cigarettes / vaping devices strictly prohibited with severe fines', 'Strict customs declaration for duty goods'],
      officialPortalUrl: 'https://www.ica.gov.sg',
      aiRecommendation: '💡 AI Tip: Do not forget to submit your free SG Arrival Card (SGAC) online 3 days before boarding — it takes 2 minutes and avoids immigration queues at Changi.'
    },
    'Thailand': {
      nationality: 'India',
      destinationCountry: 'Thailand',
      purpose: 'tourism',
      status: 'Visa-Free',
      statusBadgeColor: 'bg-green-500/20 text-green-400 border-green-500/30',
      maxStay: '60 Days (Visa Exemption Scheme)',
      passportValidityMonths: 6,
      processingDays: 'Instant at Airport / Visa-Exempt',
      approxFee: 'Free (0 THB)',
      requirements: [
        'Indian citizens enjoy 60-day visa-free entry for tourism.',
        'Valid passport with at least 6 months validity.',
        'Proof of confirmed return flight ticket within 60 days.',
        'Proof of funds: Minimum 20,000 THB per person (~ ₹48,000) or 40,000 THB per family in cash or equivalent.'
      ],
      mandatoryDocuments: ['Passport with 2 blank pages', 'Return flight boarding pass/ticket', 'Hotel booking confirmation'],
      healthVaccines: ['Standard travel vaccines recommended', 'No COVID-19 requirements'],
      customsRestrictions: ['Max 200 cigarettes or 250g tobacco', 'E-cigarettes & vapes strictly banned', 'Maximum $20,000 USD foreign currency without declaration'],
      officialPortalUrl: 'https://www.thaievisa.go.th',
      aiRecommendation: '💡 AI Tip: Indian travelers enjoy permanent 60-day visa-free entry! Ensure you carry proof of hotel stay and minimum 20,000 THB in cash or equivalent as random immigration checks occur.'
    },
    'France': {
      nationality: 'India',
      destinationCountry: 'France',
      purpose: 'tourism',
      status: 'Embassy Visa Required',
      statusBadgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      maxStay: '90 Days within 180-Day Period (Schengen C Visa)',
      passportValidityMonths: 6,
      processingDays: '10 to 15 Working Days',
      approxFee: '€90 (~ ₹8,200) + VFS service fee',
      requirements: [
        'Schengen Visa required before departure.',
        'Valid passport with at least 2 blank pages and 3 months validity beyond stay.',
        'Mandatory Travel & Medical Insurance with minimum €30,000 coverage including emergency medical evacuation.',
        'Last 3 months ITR and 6 months certified bank statement showing minimum €120/day solvency.',
        'Confirmed flight itinerary and hotel bookings across all Schengen destinations.'
      ],
      mandatoryDocuments: ['Passport', 'Schengen Application Form', 'Cover letter with daily itinerary', '6 months stamped bank statements', 'Travel insurance certificate (€30k)'],
      healthVaccines: ['No mandatory vaccines', 'Comprehensive medical insurance required'],
      customsRestrictions: ['Maximum €10,000 cash or equivalent without declaration', 'Strict limits on meat/dairy food products from outside EU'],
      officialPortalUrl: 'https://france-visas.gouv.fr',
      aiRecommendation: '💡 AI Tip: AeroWings booking confirmations include the exact embassy-compliant format for Schengen visa appointments with zero cancellation penalties while your visa is processing.'
    },
    'Japan': {
      nationality: 'India',
      destinationCountry: 'Japan',
      purpose: 'tourism',
      status: 'eVisa / ETA',
      statusBadgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      maxStay: 'Up to 90 Days (Single/Multiple Entry)',
      passportValidityMonths: 6,
      processingDays: '5 Working Days (via JAPAN e-Visa portal)',
      approxFee: '3,000 JPY (~ ₹1,700)',
      requirements: [
        'Indian passport holders residing in India can apply via the JAPAN e-Visa portal.',
        'Confirmed flight itinerary (Round trip).',
        'Detailed schedule of stay in Japan (Schedule of Stay Form).',
        'Proof of financial solvency (ITR copy, 6 months bank balance certificate).'
      ],
      mandatoryDocuments: ['Passport bio page', 'Schedule of Stay in Japan (day-by-day table)', 'ITR documents', 'Recent 35x45mm photograph'],
      healthVaccines: ['No specific vaccinations required', 'Standard health travel insurance recommended'],
      customsRestrictions: ['Strict plant & animal quarantine regulations (no fresh fruits/meats)', 'Gold declaration mandatory', 'Visit Japan Web QR code recommended for fast customs'],
      officialPortalUrl: 'https://www.evisa.mofa.go.jp',
      aiRecommendation: '💡 AI Tip: Register on the "Visit Japan Web" service 48 hours prior to arrival at Haneda/Kansai to generate immigration & customs QR codes for lightning-fast 5-minute airport clearance.'
    },
    'United States': {
      nationality: 'India',
      destinationCountry: 'United States',
      purpose: 'tourism',
      status: 'Embassy Visa Required',
      statusBadgeColor: 'bg-red-500/20 text-red-400 border-red-500/30',
      maxStay: 'Up to 6 Months per entry (B1/B2 10-Year Multiple Entry)',
      passportValidityMonths: 6,
      processingDays: 'Appointment wait times vary (Check US Consulate slots)',
      approxFee: '$185 USD (~ ₹15,500)',
      requirements: [
        'B1/B2 Visitor Visa required.',
        'Online DS-160 confirmation form.',
        'Biometric (VAC) + Consular Interview appointment.',
        'Proof of strong ties to home country (property, family, ongoing employment).',
        'Financial solvency to fund stay without working in the United States.'
      ],
      mandatoryDocuments: ['Passport valid for 6 months beyond intended stay', 'DS-160 confirmation page', 'Appointment confirmation letter', 'Supporting financial & employment records'],
      healthVaccines: ['No quarantine required', 'No mandatory vaccines for tourist entry'],
      customsRestrictions: ['Strict prohibition on fresh fruits, vegetables, and meat products', 'Declaration required for currency over $10,000 USD'],
      officialPortalUrl: 'https://ceac.state.gov/genniv',
      aiRecommendation: '💡 AI Tip: If you already hold an active US B1/B2 or F1/H1B visa, you automatically qualify for instant Visa-Free or Visa-on-Arrival transit in Dubai, Oman, Qatar, Mexico, and Singapore!'
    }
  }
};

// ----------------------------------------------------
// MEALS OPTIONS
// ----------------------------------------------------
export const MEAL_OPTIONS: MealOption[] = [
  {
    id: 'meal-1',
    name: 'Royal Indian Thali (Veg)',
    description: 'Paneer Makhani, Dal Tadka, Jeera Rice, Gulab Jamun & Paratha.',
    dietary: 'Vegetarian / Jain Option Available',
    price: 450,
    calories: 620,
    isPopular: true,
  },
  {
    id: 'meal-2',
    name: 'Grilled Butter Chicken & Saffron Rice',
    description: 'Tender chicken tikka in spiced tomato butter gravy with saffron basmati.',
    dietary: 'Non-Vegetarian / Halal',
    price: 550,
    calories: 710,
    isPopular: true,
  },
  {
    id: 'meal-3',
    name: 'South Indian Breakfast Box',
    description: 'Steaming Idlis, Medu Vada, Sambhar, Coconut Chutney & Filter Coffee.',
    dietary: 'South Indian Veg',
    price: 380,
    calories: 480,
  },
  {
    id: 'meal-4',
    name: 'Continental Club Sandwich & Salad',
    description: 'Multi-grain bread with roasted veggies, aged cheddar, hummus and fresh fruit cup.',
    dietary: 'Healthy & Light',
    price: 420,
    calories: 390,
  },
  {
    id: 'meal-5',
    name: 'Low Calorie Fruit & Gourmet Nut Platter',
    description: 'Seasonal dragon fruit, berries, kiwi with premium almonds and Greek yogurt.',
    dietary: 'Gluten-Free / Diabetic Friendly',
    price: 480,
    calories: 280,
  }
];

// ----------------------------------------------------
// BAGGAGE OPTIONS
// ----------------------------------------------------
export const BAGGAGE_OPTIONS: BaggageOption[] = [
  {
    id: 'bag-standard',
    weight: '0 kg',
    weightKg: 0,
    price: 0,
    label: 'Standard Allowance Included',
    description: '7 kg Cabin Baggage + 15 kg Check-in Baggage (20-30kg for International).',
    isIncluded: true,
  },
  {
    id: 'bag-3kg',
    weight: '+3 kg',
    weightKg: 3,
    price: 1350,
    label: '+3 kg Extra Check-in Baggage',
    description: 'Ideal for small shopping trips and gifts (Save 40% vs airport desk rate).',
  },
  {
    id: 'bag-5kg',
    weight: '+5 kg',
    weightKg: 5,
    price: 2100,
    label: '+5 kg Extra Check-in Baggage',
    description: 'Perfect for extended vacations and family souvenirs.',
  },
  {
    id: 'bag-10kg',
    weight: '+10 kg',
    weightKg: 10,
    price: 3800,
    label: '+10 kg Heavy Baggage Boost',
    description: 'Best for international travelers, students & excess gear.',
  }
];

// ----------------------------------------------------
// OFFERS & PROMO CODES
// ----------------------------------------------------
export const OFFERS: Offer[] = [
  {
    id: 'OFFER-1',
    code: 'AEROFLY',
    title: 'New Explorer Welcome - Flat ₹1,500 Off',
    description: 'Use code AEROFLY on your first reservation with zero minimum spend restrictions.',
    discountType: 'flat',
    discountValue: 1500,
    minAmount: 3500,
    expiresOn: '31 Dec 2026',
    bannerColor: 'from-blue-600 to-indigo-700',
    tag: 'Best Value',
  },
  {
    id: 'OFFER-2',
    code: 'INDIGO500',
    title: 'IndiGo Domestic Special - Flat ₹500 Off',
    description: 'Instant discount on all IndiGo Intra-State and Inter-State flights.',
    discountType: 'flat',
    discountValue: 500,
    minAmount: 2000,
    expiresOn: '30 Nov 2026',
    bannerColor: 'from-sky-600 to-blue-700',
    tag: 'Popular',
  },
  {
    id: 'OFFER-3',
    code: 'WINGS20',
    title: 'International Voyages - Flat 20% Off',
    description: 'Save up to ₹8,000 on Dubai, London, Singapore & Bangkok routes.',
    discountType: 'percentage',
    discountValue: 20,
    minAmount: 12000,
    expiresOn: '15 Oct 2026',
    bannerColor: 'from-emerald-600 to-teal-700',
    tag: 'Global',
  },
  {
    id: 'OFFER-4',
    code: 'SUPERFLEX',
    title: 'Business Class Upgrade Voucher',
    description: 'Flat ₹3,000 discount on all Business & First Class reservations.',
    discountType: 'flat',
    discountValue: 3000,
    minAmount: 15000,
    expiresOn: '25 Dec 2026',
    bannerColor: 'from-purple-600 to-pink-600',
    tag: 'Luxury',
  }
];

// ----------------------------------------------------
// SAMPLE REALISTIC BOOKINGS
// ----------------------------------------------------
export const SAMPLE_BOOKINGS: Booking[] = [
  {
    id: 'BK-9908',
    pnr: 'AW-892F1',
    ticketNumber: '098-7721849102',
    flightId: 'FL-INTER-01',
    flight: INITIAL_FLIGHTS[0] || INITIAL_FLIGHTS[10], // AeroWings flagship
    tripType: 'one_way',
    departureDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // 2 days in future
    cabinClass: 'economy',
    passengers: [
      {
        id: 'p-aw-1',
        title: 'Mr',
        firstName: 'Arun',
        lastName: 'Kumar',
        gender: 'Male',
        dob: '2003-05-14',
        type: 'adult',
        seatNumber: '08A',
        seatPrice: 350,
        meal: 'Royal Indian Thali (Veg)',
        mealPrice: 450,
        frequentFlyerNumber: 'AW-FF-7721',
        aadhaarNumber: '5412 7890 2341',
        panNumber: 'ABCDE1234F',
        visaNumber: 'DOMESTIC_EXEMPT',
        visaStatus: 'Verified',
        isVerified: true
      },
    ],
    contactEmail: 'arunkumartharun400328@gmail.com',
    contactPhone: '',
    bookingDate: new Date().toISOString().split('T')[0],
    status: 'Confirmed',
    priceBreakdown: {
      baseFare: 4950,
      taxesAndFees: 820,
      seatsTotal: 350,
      mealsTotal: 450,
      baggageTotal: 0,
      insuranceTotal: 299,
      priorityBoardingTotal: 199,
      couponDiscount: 1500,
      finalTotal: 5568,
    },
    paymentMethod: 'upi',
    paymentId: 'UPI-TXN-8840192',
    hasInsurance: true,
    hasPriorityBoarding: true,
    refundStatus: 'Not Applicable',
  },
  {
    id: 'BK-9909',
    pnr: 'AW-441A9',
    ticketNumber: '098-7721849104',
    flightId: 'FL-INTRA-01',
    flight: INITIAL_FLIGHTS[1] || INITIAL_FLIGHTS[0],
    tripType: 'one_way',
    departureDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0], // 5 days in future
    cabinClass: 'economy',
    passengers: [
      {
        id: 'p-aw-2',
        title: 'Mr',
        firstName: 'Arun',
        lastName: 'Kumar',
        gender: 'Male',
        dob: '2003-05-14',
        type: 'adult',
        seatNumber: '04F',
        seatPrice: 300,
        meal: 'South Indian Filter Coffee & Snacks',
        mealPrice: 250,
        aadhaarNumber: '5412 7890 2341',
        panNumber: 'ABCDE1234F',
        visaNumber: 'DOMESTIC_EXEMPT',
        visaStatus: 'Verified',
        isVerified: true
      },
    ],
    contactEmail: 'arunkumartharun400328@gmail.com',
    contactPhone: '',
    bookingDate: new Date().toISOString().split('T')[0],
    status: 'Confirmed',
    priceBreakdown: {
      baseFare: 2200,
      taxesAndFees: 614,
      seatsTotal: 300,
      mealsTotal: 250,
      baggageTotal: 0,
      insuranceTotal: 299,
      priorityBoardingTotal: 0,
      couponDiscount: 0,
      finalTotal: 3663,
    },
    paymentMethod: 'card',
    paymentId: 'CARD-TXN-441892',
    hasInsurance: true,
    hasPriorityBoarding: false,
    refundStatus: 'Not Applicable',
  },
  {
    id: 'BK-9910',
    pnr: '6E-892F1',
    ticketNumber: '098-2490184711',
    flightId: 'FL-INTER-01',
    flight: INITIAL_FLIGHTS[10], // IndiGo DEL -> BOM
    tripType: 'one_way',
    departureDate: new Date(Date.now() + 86400000 * 8).toISOString().split('T')[0],
    cabinClass: 'economy',
    passengers: [
      {
        id: 'p-1',
        title: 'Mr',
        firstName: 'Arun',
        lastName: 'Kumar',
        gender: 'Male',
        dob: '2003-05-14',
        type: 'adult',
        seatNumber: '14A',
        seatPrice: 350,
        meal: 'Royal Indian Thali (Veg)',
        mealPrice: 450,
        frequentFlyerNumber: '6E-FF-9021',
        aadhaarNumber: '5412 7890 2341',
        panNumber: 'ABCDE1234F',
        visaNumber: 'DOMESTIC_EXEMPT',
        visaStatus: 'Verified',
        isVerified: true
      },
    ],
    contactEmail: 'arunkumartharun400328@gmail.com',
    contactPhone: '',
    bookingDate: new Date().toISOString().split('T')[0],
    status: 'Confirmed',
    priceBreakdown: {
      baseFare: 4950,
      taxesAndFees: 820,
      seatsTotal: 350,
      mealsTotal: 450,
      baggageTotal: 0,
      insuranceTotal: 299,
      priorityBoardingTotal: 199,
      couponDiscount: 1500,
      finalTotal: 5568,
    },
    paymentMethod: 'upi',
    paymentId: 'UPI-TXN-8840192',
    hasInsurance: true,
    hasPriorityBoarding: true,
    refundStatus: 'Not Applicable',
  },
  {
    id: 'BK-9912',
    pnr: '6E-771WX',
    ticketNumber: '098-2490184715',
    flightId: 'FL-INTER-09',
    flight: INITIAL_FLIGHTS[18], // IndiGo MAA -> CCU (Cancelled by Cyclone Alert)
    tripType: 'one_way',
    departureDate: '2026-08-29',
    cabinClass: 'economy',
    passengers: [
      {
        id: 'p-3',
        title: 'Mr',
        firstName: 'Arun',
        lastName: 'Kumar',
        gender: 'Male',
        dob: '2003-05-14',
        type: 'adult',
        seatNumber: '12F',
        seatPrice: 200,
        meal: 'Grilled Butter Chicken & Saffron Rice',
        mealPrice: 550,
      }
    ],
    contactEmail: 'arunkumartharun400328@gmail.com',
    contactPhone: '',
    bookingDate: '2026-08-27',
    status: 'Cancelled',
    cancellationReason: 'AI Doppler Alert: Severe Cyclone Warning (Flight Auto-Cancelled by AeroWings AI Protection)',
    refundAmount: 5700,
    refundStatus: 'Processed',
    priceBreakdown: {
      baseFare: 4100,
      taxesAndFees: 850,
      seatsTotal: 200,
      mealsTotal: 550,
      baggageTotal: 0,
      insuranceTotal: 299,
      priorityBoardingTotal: 0,
      couponDiscount: 0,
      finalTotal: 5700,
    },
    paymentMethod: 'upi',
    paymentId: 'UPI-TXN-9988112',
    hasInsurance: true,
    hasPriorityBoarding: false,
  }
];

export const DEMO_TEST_CARDS = [
  {
    type: 'Visa Platinum',
    number: '4532 8901 2345 6789',
    holder: 'ARUN KUMAR',
    expiry: '08/29',
    cvv: '789',
    balance: '₹ 1,50,000',
  },
  {
    type: 'Mastercard World',
    number: '5412 7534 8901 1234',
    holder: 'PRIYA SHARMA',
    expiry: '12/28',
    cvv: '456',
    balance: '₹ 2,00,000',
  },
];
