import { CabinClass, Currency, Flight, Seat } from '../types/airline';

export const CURRENCIES: Record<Currency['code'], Currency> = {
  INR: { code: 'INR', symbol: '₹', rateFromINR: 1 },
  USD: { code: 'USD', symbol: '$', rateFromINR: 0.012 },
  EUR: { code: 'EUR', symbol: '€', rateFromINR: 0.011 },
  GBP: { code: 'GBP', symbol: '£', rateFromINR: 0.0095 },
  AED: { code: 'AED', symbol: 'AED ', rateFromINR: 0.044 },
};

export const formatCurrency = (amountInINR: number, currencyCode: Currency['code'] = 'INR'): string => {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.INR;
  const converted = amountInINR * currency.rateFromINR;
  
  if (currencyCode === 'INR') {
    return `₹${Math.round(converted).toLocaleString('en-IN')}`;
  }
  return `${currency.symbol}${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const generatePNR = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'AW-';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const generateTicketNumber = (): string => {
  const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000);
  return `098-${randomDigits}`;
};

export const generateSeatMap = (flight: Flight): Seat[] => {
  const seats: Seat[] = [];
  const totalRows = 30;

  // Business class: Rows 1 to 4 (Cols: A, C, D, F)
  for (let r = 1; r <= 4; r++) {
    const cols = ['A', 'C', 'D', 'F'];
    cols.forEach(col => {
      const isOccupied = (r === 1 && col === 'A') || (r === 2 && col === 'D') || (r === 3 && col === 'F') || Math.random() < 0.25;
      seats.push({
        id: `${r}${col}`,
        row: r,
        column: col,
        class: 'business',
        price: 0, // Included in business fare
        isOccupied,
        isWindow: col === 'A' || col === 'F',
        isAisle: col === 'C' || col === 'D',
        hasExtraLegroom: true,
        powerOutlet: true,
      });
    });
  }

  // Premium Economy: Rows 5 to 8 (Cols: A, B, C, D, E, F)
  for (let r = 5; r <= 8; r++) {
    const cols = ['A', 'B', 'C', 'D', 'E', 'F'];
    cols.forEach(col => {
      const isOccupied = Math.random() < 0.35;
      seats.push({
        id: `${r}${col}`,
        row: r,
        column: col,
        class: 'premium_economy',
        price: 350,
        isOccupied,
        isWindow: col === 'A' || col === 'F',
        isAisle: col === 'C' || col === 'D',
        hasExtraLegroom: true,
        powerOutlet: true,
      });
    });
  }

  // Economy: Rows 9 to 30 (Cols: A, B, C, D, E, F)
  for (let r = 9; r <= totalRows; r++) {
    const isExit = r === 14 || r === 15;
    const cols = ['A', 'B', 'C', 'D', 'E', 'F'];
    cols.forEach(col => {
      // simulate standard occupied seats based on flight id seed
      const isOccupied = Math.random() < 0.40;
      let price = 0;
      if (isExit) {
        price = 900; // Extra legroom exit row
      } else if (r <= 12) {
        price = 450; // Front preferred zone
      } else if (col === 'A' || col === 'F') {
        price = 250; // Window seat fee
      } else if (col === 'C' || col === 'D') {
        price = 200; // Aisle seat fee
      } else {
        price = 0; // Middle seat free
      }

      seats.push({
        id: `${r}${col}`,
        row: r,
        column: col,
        class: 'economy',
        price,
        isOccupied,
        isExitRow: isExit,
        isWindow: col === 'A' || col === 'F',
        isAisle: col === 'C' || col === 'D',
        hasExtraLegroom: isExit,
        powerOutlet: r <= 18,
      });
    });
  }

  return seats;
};

export const getSeatPriceDescription = (seat: Seat, cabinClass: CabinClass): string => {
  if (cabinClass === 'business' || cabinClass === 'first') {
    return 'Complimentary with Business Class';
  }
  if (seat.isExitRow) return 'Exit Row (Extra Legroom) - ₹900';
  if (seat.row <= 12) return 'Front Cabin Zone - ₹450';
  if (seat.isWindow) return 'Window Seat - ₹250';
  if (seat.isAisle) return 'Aisle Seat - ₹200';
  return 'Standard Middle Seat - Free (₹0)';
};
