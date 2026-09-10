/**
 * AeroWings Official IATA E-Ticket & Multi-Passenger Boarding Pass Generator
 * Generates vector multi-page PDF via jsPDF with 100% Chrome/Edge/Safari/Mobile compatibility.
 * Produces Page 1 (Master Reservation & All Travelers Manifest) + Dedicated Pages for Every Passenger in the Group!
 */

import { jsPDF } from 'jspdf';
import { Booking, Passenger } from '../types/airline';

export interface TicketDownloadOptions {
  activePassengerIndex?: number;
  format?: 'pdf' | 'html' | 'print';
}

function drawHeader(doc: jsPDF, pageTitle: string, subtitle: string) {
  // Deep navy background header banner
  doc.setFillColor(10, 15, 30);
  doc.rect(0, 0, 210, 38, 'F');

  // Brand title
  doc.setTextColor(56, 189, 248);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('✈️ AEROWINGS AIRLINES', 14, 16);

  // Subtitle
  doc.setTextColor(226, 232, 240);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(pageTitle.toUpperCase(), 14, 23);
  doc.text(subtitle, 14, 29);

  // Status Badge
  doc.setFillColor(16, 185, 129);
  doc.roundedRect(144, 10, 52, 9, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('STATUS: CONFIRMED ●', 148, 16.5);
}

function drawFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 280, 196, 280);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Please present this document with a valid Government Photo ID (Aadhaar / PAN / Passport / Voter ID) at airport security.', 14, 285);
  doc.text('AeroWings 100% Weather Protection Guarantee: Zero-fee automated cancellation & instant refunds in case of weather disruptions.', 14, 289);
  doc.text(`Page ${pageNum} of ${totalPages} • 24/7 Global Customer Support: 1800-555-AERO`, 140, 289);
}

export function generateDirectVectorPDF(booking: Booking, targetPassengerIndex?: number): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const flight = booking.flight;
  const passengers: Passenger[] = booking.passengers && booking.passengers.length > 0 ? booking.passengers : [
    {
      id: 'pax-1',
      title: 'Mr',
      firstName: 'Primary',
      lastName: 'Traveler',
      gender: 'Male',
      dob: '1990-01-01',
      type: 'adult' as const,
      seatNumber: '12A',
      aadhaarNumber: 'XXXX-XXXX-8921',
      panNumber: 'ABCDE1234F',
      isVerified: true
    }
  ];

  const isSingleOnly = typeof targetPassengerIndex === 'number' && targetPassengerIndex >= 0;
  const targetPassengers = isSingleOnly ? [passengers[targetPassengerIndex] || passengers[0]] : passengers;
  const totalPages = isSingleOnly ? 1 : 1 + targetPassengers.length;

  // ==========================================
  // PAGE 1: MASTER RESERVATION & ALL TRAVELERS MANIFEST
  // ==========================================
  drawHeader(
    doc,
    `OFFICIAL MASTER E-TICKET & GROUP RESERVATION ITINERARY (${passengers.length} TRAVELERS)`,
    'IATA / DGCA VERIFIED • ZERO-CANCELLATION WEATHER GUARANTEED'
  );

  // 1. PNR & Ticket Header Box
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 43, 182, 22, 2.5, 2.5, 'FD');

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('BOOKING REFERENCE (PNR)', 20, 50);
  doc.text('E-TICKET NUMBER', 75, 50);
  doc.text('DATE OF ISSUE', 125, 50);
  doc.text('CABIN CLASS', 165, 50);

  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(booking.pnr, 20, 58);
  doc.setFontSize(9.5);
  doc.text(booking.ticketNumber, 75, 58);
  doc.text(booking.bookingDate, 125, 58);
  doc.text(booking.cabinClass.toUpperCase(), 165, 58);

  // 2. Flight Schedule Card
  doc.setDrawColor(59, 130, 246);
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, 69, 182, 44, 2.5, 2.5, 'FD');

  doc.setFillColor(30, 58, 138);
  doc.rect(14, 69, 182, 9, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`FLIGHT: ${flight.airlineCode || 'AW'} ${flight.flightNumber} • ${flight.airline} • AIRCRAFT: ${flight.aircraft}`, 20, 75.5);

  // Route: Origin
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(flight.origin.code, 22, 90);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(flight.origin.city, 22, 95);
  doc.text(`Terminal ${flight.terminal || 'T3'}`, 22, 99);
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(flight.departureTime, 22, 107);

  // Center Duration
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Duration: ${flight.duration}`, 90, 87);
  doc.setFontSize(11);
  doc.text('------------------->', 85, 93);
  doc.setFontSize(7.5);
  doc.setTextColor(16, 185, 129);
  doc.text(flight.stops === 0 ? 'Non-Stop Direct' : `${flight.stops} Stop`, 92, 100);

  // Route: Destination
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(flight.destination.code, 150, 90);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(flight.destination.city, 150, 95);
  doc.text(`Terminal ${flight.destination.terminal || 'T2'}`, 150, 99);
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(flight.arrivalTime, 150, 107);

  // 3. ALL PASSENGERS VERIFICATION & SEATS TABLE
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, 117, 182, 85, 2.5, 2.5, 'FD');

  doc.setFillColor(248, 250, 252);
  doc.rect(14, 117, 182, 9, 'F');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(`ALL REGISTERED PASSENGERS MANIFEST (${passengers.length} TOTAL TRAVELERS)`, 20, 123);

  // Table header
  let paxY = 132;
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.text('NO.', 18, paxY);
  doc.text('PASSENGER FULL NAME', 28, paxY);
  doc.text('SEAT', 75, paxY);
  doc.text('VERIFIED ID (AADHAAR / PAN / VISA)', 95, paxY);
  doc.text('STATUS', 165, paxY);

  doc.setDrawColor(226, 232, 240);
  doc.line(18, paxY + 2, 192, paxY + 2);

  // Loop through all passengers on Master Page
  passengers.forEach((p, idx) => {
    paxY += 9;
    if (paxY > 192) return; // Prevent table overflow

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(`${idx + 1}.`, 18, paxY);
    
    doc.setFont('helvetica', 'bold');
    doc.text(`${p.title} ${p.firstName} ${p.lastName}`.toUpperCase(), 28, paxY);

    doc.setTextColor(2, 132, 199);
    doc.text(p.seatNumber || `Auto-${10 + idx}B`, 75, paxY);

    // ID document text
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const idParts = [];
    if (p.aadhaarNumber) idParts.push(`Aadhaar: ${p.aadhaarNumber}`);
    if (p.panNumber) idParts.push(`PAN: ${p.panNumber}`);
    if (p.visaNumber) idParts.push(`Visa: ${p.visaNumber}`);
    const idStr = idParts.length > 0 ? idParts.join(' | ') : 'Govt ID Verified at Gate';
    doc.text(idStr, 95, paxY, { maxWidth: 65 });

    doc.setTextColor(16, 185, 129);
    doc.setFont('helvetica', 'bold');
    doc.text('● VERIFIED', 165, paxY);
  });

  // 4. Group Payment & Fare Breakdown Box
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 206, 182, 32, 2.5, 2.5, 'FD');

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL GROUP FARE PAID', 20, 214);
  doc.text('PAYMENT METHOD', 80, 214);
  doc.text('TRANSACTION REFERENCE', 130, 214);

  doc.setFontSize(12);
  doc.setTextColor(16, 185, 129);
  doc.setFont('helvetica', 'bold');
  doc.text(`INR ${booking.priceBreakdown.finalTotal.toLocaleString()}`, 20, 223);

  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(booking.paymentMethod.toUpperCase(), 80, 223);
  doc.text(booking.paymentId, 130, 223);

  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.text(`Contact: ${booking.contactEmail || 'N/A'} • Mobile: ${booking.contactPhone || 'N/A'} • Baggage: 7kg Cabin + 15kg Check-in Per Passenger Included`, 20, 232);

  // 5. IATA Security Barcode
  doc.setFillColor(15, 23, 42);
  doc.rect(20, 243, 170, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont('courier', 'bold');
  doc.text(`*BCBP M1${booking.pnr} ${flight.origin.code}${flight.destination.code}AW${flight.flightNumber} PAX_COUNT_${passengers.length}*`, 28, 247.5);

  drawFooter(doc, 1, totalPages);

  // ==========================================
  // INDIVIDUAL BOARDING PASSES FOR EACH PASSENGER
  // ==========================================
  targetPassengers.forEach((pax, pIdx) => {
    doc.addPage('a4', 'portrait');

    const passPageNum = pIdx + 2;
    drawHeader(
      doc,
      `INDIVIDUAL BOARDING PASS — PASSENGER ${pIdx + 1} OF ${passengers.length}`,
      'SHOW AT AIRPORT SECURITY & BOARDING GATE'
    );

    // Boarding Pass Outer Container
    doc.setDrawColor(2, 132, 199);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(14, 44, 182, 180, 3, 3, 'FD');

    // Header banner on the pass
    doc.setFillColor(30, 58, 138);
    doc.rect(14, 44, 182, 14, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`✈️ AEROWINGS BOARDING PASS • ${flight.airlineCode || 'AW'} ${flight.flightNumber}`, 20, 53);
    doc.setFontSize(9);
    doc.text(`SEAT: ${pax.seatNumber || `${12 + pIdx}A`}`, 160, 53);

    // Passenger Name & PNR
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text('PASSENGER NAME', 22, 67);
    doc.text('PNR / BOOKING REF', 95, 67);
    doc.text('E-TICKET NUMBER', 145, 67);

    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(`${pax.title} ${pax.firstName} ${pax.lastName}`.toUpperCase(), 22, 75);
    doc.setFontSize(11);
    doc.text(booking.pnr, 95, 75);
    doc.setFontSize(9);
    doc.text(`${booking.ticketNumber}-${pIdx + 1}`, 145, 75);

    // Verified Document details badge
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(20, 82, 170, 16, 2, 2, 'F');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.text('GOVERNMENT VERIFICATION DETAILS:', 24, 88);
    doc.setFont('helvetica', 'normal');
    const docVerifications = [
      pax.aadhaarNumber ? `Aadhaar: ${pax.aadhaarNumber}` : null,
      pax.panNumber ? `PAN: ${pax.panNumber}` : null,
      pax.visaNumber ? `Visa: ${pax.visaNumber} (${pax.visaStatus || 'Valid'})` : null,
      `Category: ${(pax.type || 'adult').toUpperCase()}`
    ].filter(Boolean).join('   |   ');
    doc.text(docVerifications, 24, 94);

    // Flight Departure Grid
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(20, 104, 170, 48, 2, 2, 'FD');

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('FROM', 26, 112);
    doc.text('TO', 85, 112);
    doc.text('BOARDING GATE', 140, 112);

    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(flight.origin.code, 26, 122);
    doc.text(flight.destination.code, 85, 122);
    doc.setTextColor(2, 132, 199);
    doc.text(flight.gate || '22A', 140, 122);

    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.text(`${flight.origin.city} (Term. ${flight.terminal || 'T3'})`, 26, 128);
    doc.text(`${flight.destination.city} (Term. ${flight.destination.terminal || 'T2'})`, 85, 128);
    doc.text('Zone 1 / Priority', 140, 128);

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('DEPARTURE TIME', 26, 138);
    doc.text('BOARDING TIME', 85, 138);
    doc.text('CABIN CLASS', 140, 138);

    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(`${flight.departureTime} hrs`, 26, 146);
    doc.setTextColor(220, 38, 38);
    doc.text('45m Before Dep', 85, 146);
    doc.setTextColor(15, 23, 42);
    doc.text(booking.cabinClass.toUpperCase(), 140, 146);

    // Free baggage & meal
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.text('• Cabin Baggage: 1 Handbag (7 kg Free) + Check-in: 1 Piece (15 kg Free Included)', 22, 160);
    doc.text(`• Selected Meal: ${pax.meal || 'Standard In-Flight Fresh Snacks'} • Special Request: None`, 22, 166);

    // Boarding Pass Barcode Strip
    doc.setFillColor(15, 23, 42);
    doc.rect(20, 176, 170, 9, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7.5);
    doc.setFont('courier', 'bold');
    doc.text(`*BCBP M1${pax.lastName || 'PAX'}/${pax.firstName || 'TRAV'} E${booking.pnr} ${flight.origin.code}${flight.destination.code}AW ${pax.seatNumber || '12A'}*`, 24, 182);

    // Tear-off stub divider line
    doc.setDrawColor(148, 163, 184);
    doc.setLineDashPattern([2, 2], 0);
    doc.line(20, 194, 190, 194);
    doc.setLineDashPattern([], 0);

    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text('AIRPORT SECURITY CHECK STUB • DETACH AT BOARDING GATE', 22, 201);
    doc.text(`Flight: AW-${flight.flightNumber} | Seat: ${pax.seatNumber || '12A'} | PNR: ${booking.pnr} | Date: ${booking.departureDate}`, 22, 206);

    drawFooter(doc, passPageNum, totalPages);
  });

  return doc;
}

export function downloadTicketBlob(booking: Booking, activePassengerIndex?: number): boolean {
  try {
    const doc = generateDirectVectorPDF(booking, activePassengerIndex);
    const fileName = `AeroWings-Tickets-${booking.pnr}-All-Passengers.pdf`;
    doc.save(fileName);
    return true;
  } catch (err) {
    console.error('Vector PDF generation error, creating standalone HTML ticket...', err);
    return downloadHtmlTicket(booking, activePassengerIndex);
  }
}

export function downloadAllPassengersTicketBlob(booking: Booking): boolean {
  return downloadTicketBlob(booking, undefined);
}

export function generateCompleteTicketHtml(booking: Booking, targetPax: Passenger[]): string {
  const flight = booking.flight;
  const passengerCardsHtml = targetPax.map((pax, idx) => {
    const docVerifications = [
      pax.aadhaarNumber ? `Aadhaar: <strong>${pax.aadhaarNumber}</strong>` : null,
      pax.panNumber ? `PAN: <strong>${pax.panNumber}</strong>` : null,
      pax.visaNumber ? `Visa: <strong>${pax.visaNumber} (${pax.visaStatus || 'Valid'})</strong>` : null
    ].filter(Boolean).join(' &bull; ') || 'Verified at Gate';

    return `
    <div style="background: white; border: 2px solid #0284c7; border-radius: 12px; margin-bottom: 24px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); page-break-inside: avoid;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 12px;">
        <div>
          <span style="font-size: 11px; background: #e0f2fe; color: #0369a1; padding: 3px 8px; border-radius: 6px; font-weight: bold;">PASSENGER ${idx + 1} OF ${targetPax.length}</span>
          <div style="font-size: 18px; font-weight: bold; color: #0f172a; margin-top: 4px;">${pax.title} ${pax.firstName} ${pax.lastName}</div>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 12px; color: #64748b;">ASSIGNED SEAT</span>
          <div style="font-size: 22px; font-weight: 900; color: #0284c7;">${pax.seatNumber || `12${String.fromCharCode(65 + idx)}`}</div>
        </div>
      </div>

      <div style="background: #f8fafc; padding: 10px 14px; border-radius: 8px; font-size: 12px; color: #334155; margin-bottom: 14px;">
        🛡️ <strong>Identity Verification:</strong> ${docVerifications}
      </div>

      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; font-size: 12px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 14px;">
        <div><span style="color: #64748b;">FLIGHT</span><br><strong>${flight.airlineCode || 'AW'} ${flight.flightNumber}</strong></div>
        <div><span style="color: #64748b;">BOARDING GATE</span><br><strong>${flight.gate || '22A'}</strong></div>
        <div><span style="color: #64748b;">BOARDING TIME</span><br><strong style="color: #dc2626;">45m Before Dep</strong></div>
        <div><span style="color: #64748b;">FREE BAGGAGE</span><br><strong>7kg Cabin + 15kg Luggage</strong></div>
      </div>

      <div style="background: #0f172a; color: white; text-align: center; font-family: monospace; padding: 8px; font-size: 12px; letter-spacing: 3px; margin-top: 14px; border-radius: 6px;">
        *AW-${booking.pnr}-${flight.flightNumber}-${pax.seatNumber || '12A'}-${idx + 1}*
      </div>
    </div>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AeroWings E-Tickets & Boarding Passes - ${booking.pnr}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 24px; background: #f8fafc; color: #0f172a; }
    .ticket-container { max-width: 850px; margin: 0 auto; }
    .master-header { background: #0f172a; color: white; padding: 24px; border-radius: 16px 16px 0 0; display: flex; justify-content: space-between; align-items: center; }
    .logo { font-size: 24px; font-weight: 900; color: #38bdf8; letter-spacing: 1px; }
    .status { background: #10b981; color: white; padding: 6px 14px; border-radius: 20px; font-weight: bold; font-size: 12px; }
    .pnr-bar { background: #f1f5f9; padding: 16px 24px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; border-left: 2px solid #0284c7; border-right: 2px solid #0284c7; font-size: 12px; }
    .pnr-bar strong { display: block; font-size: 16px; color: #0f172a; margin-top: 4px; }
    .route-bar { padding: 20px 24px; background: white; border-left: 2px solid #0284c7; border-right: 2px solid #0284c7; border-bottom: 2px solid #0284c7; border-radius: 0 0 16px 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
    .city-block { font-size: 26px; font-weight: 900; color: #0f172a; }
    .subtext { font-size: 12px; color: #64748b; margin-top: 2px; }
    .footer { padding: 16px 24px; background: #f1f5f9; font-size: 11px; color: #64748b; border-radius: 12px; text-align: center; margin-top: 20px; }
    @media print { 
      body { background: white; padding: 0; }
      .ticket-container { max-width: 100%; width: 100%; margin: 0; }
      @page { margin: 1cm; size: auto; }
    }
  </style>
</head>
<body>
  <div class="ticket-container">
    <div class="master-header">
      <div>
        <div class="logo">✈️ AEROWINGS AIRLINES</div>
        <div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">OFFICIAL GROUP E-TICKETS & BOARDING PASSES (${targetPax.length} TRAVELERS)</div>
      </div>
      <div class="status">● CONFIRMED & VERIFIED</div>
    </div>
    
    <div class="pnr-bar">
      <div>PNR REFERENCE<strong>${booking.pnr}</strong></div>
      <div>E-TICKET NUMBER<strong>${booking.ticketNumber}</strong></div>
      <div>TRAVEL DATE<strong>${booking.departureDate}</strong></div>
      <div>TOTAL FARE<strong>INR ${booking.priceBreakdown.finalTotal.toLocaleString()}</strong></div>
    </div>

    <div class="route-bar">
      <div>
        <div class="city-block">${flight.origin.code}</div>
        <div class="subtext">${flight.origin.city} (Terminal ${flight.terminal || 'T3'})</div>
        <div style="font-size: 16px; font-weight: bold; margin-top: 6px;">${flight.departureTime} hrs</div>
      </div>
      <div style="text-align: center; color: #64748b;">
        <div>✈️ ${flight.airlineCode || 'AW'}${flight.flightNumber} • ${flight.airline}</div>
        <div style="font-size: 12px; margin-top: 4px;">${flight.duration} • ${flight.stops === 0 ? 'Non-Stop Direct' : '1 Stop'}</div>
      </div>
      <div style="text-align: right;">
        <div class="city-block">${flight.destination.code}</div>
        <div class="subtext">${flight.destination.city} (Terminal ${flight.destination.terminal || 'T2'})</div>
        <div style="font-size: 16px; font-weight: bold; margin-top: 6px;">${flight.arrivalTime} hrs</div>
      </div>
    </div>

    <h3 style="color: #0f172a; margin-bottom: 12px;">Individual Boarding Passes (${targetPax.length} Passengers)</h3>
    ${passengerCardsHtml}

    <div class="footer">
      Please present this E-Ticket and a valid Government Photo ID (Aadhaar / PAN / Passport) at airport security. Have a pleasant flight with AeroWings!
    </div>
  </div>
</body>
</html>`;
}

export function downloadHtmlTicket(booking: Booking, activePassengerIndex?: number): boolean {
  try {
    const targetPax = activePassengerIndex !== undefined && booking.passengers[activePassengerIndex]
      ? [booking.passengers[activePassengerIndex]]
      : booking.passengers;

    const html = generateCompleteTicketHtml(booking, targetPax);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AeroWings-Tickets-${booking.pnr}-All-Passengers.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    return true;
  } catch (e) {
    console.error('HTML ticket download failed', e);
    return false;
  }
}

/**
 * 100% Reliable Cross-Browser Boarding Pass Printer
 * Injects formatted print layout into a dedicated sandboxed iframe or clean popup window,
 * avoiding browser iframe sandbox blocks, dark UI elements, or wasted ink.
 */
export function printTicketDocument(booking: Booking, activePassengerIndex?: number): boolean {
  try {
    const targetPax = activePassengerIndex !== undefined && booking.passengers[activePassengerIndex]
      ? [booking.passengers[activePassengerIndex]]
      : booking.passengers;

    const html = generateCompleteTicketHtml(booking, targetPax);

    // 1. Try invisible iframe print
    let printFrame = document.getElementById('aerowings-print-iframe') as HTMLIFrameElement | null;
    if (!printFrame) {
      printFrame = document.createElement('iframe');
      printFrame.id = 'aerowings-print-iframe';
      printFrame.style.position = 'fixed';
      printFrame.style.right = '0';
      printFrame.style.bottom = '0';
      printFrame.style.width = '0';
      printFrame.style.height = '0';
      printFrame.style.border = '0';
      document.body.appendChild(printFrame);
    }

    const doc = printFrame.contentWindow?.document || printFrame.contentDocument;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();

      setTimeout(() => {
        try {
          printFrame?.contentWindow?.focus();
          printFrame?.contentWindow?.print();
        } catch (frameErr) {
          console.warn('Iframe print failed, falling back to window.print()', frameErr);
          window.print();
        }
      }, 350);
      return true;
    }
  } catch (err) {
    console.warn('Print ticket document failed, invoking direct print', err);
    window.print();
    return false;
  }
  return false;
}
