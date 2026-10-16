import React, { useState } from 'react';
import { useAirline } from '../../context/AirlineContext';
import { 
  HelpCircle, 
  Search, 
  MessageSquare, 
  Phone, 
  Mail, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles,
  Bot,
  Video,
  Mic,
  Headphones,
  UserCheck,
  RefreshCw,
  X,
  Volume2
} from 'lucide-react';
import { aiVoice } from '../../utils/aiVoice';

export const HelpContactPage: React.FC = () => {
  const { showToast, addToast, setUserView, bookings } = useAirline();
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Inquiry Form State
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryPnr, setInquiryPnr] = useState('');
  const [inquiryTopic, setInquiryTopic] = useState('Booking Change');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [ticketRef, setTicketRef] = useState<string | null>(null);

  // Virtual Desk State
  const [chatOpen, setChatOpen] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [showVideoCallModal, setShowVideoCallModal] = useState(false);
  const [callConnected, setCallConnected] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string; time: string }>>([
    { 
      sender: 'bot', 
      text: 'Welcome to the AeroWings Virtual Desk! I am Duty Officer Rajesh (Counter #3). I can check your booking PNR, process instant weather cancellation refunds, or assist with baggage and seat upgrades. How may I assist you today?', 
      time: 'Just now' 
    }
  ]);
  const [chatInput, setChatInput] = useState('');

  const faqs = [
    {
      q: 'How can I change my flight date or cancel my booking?',
      a: 'You can modify or cancel your booking by going to "My Bookings" in your dashboard and entering your 6-character PNR. Date changes are free up to 24 hours prior for Business and Flexible fares. Cancellation refunds are processed automatically back to your original payment method within 3–5 business days.'
    },
    {
      q: 'What is the baggage allowance for domestic and international flights?',
      a: 'Smart Economy allows 1 cabin bag (7 kg) and 15–20 kg checked luggage (domestic) or 23 kg (international). Business Class passengers enjoy 2 cabin bags (12 kg total) and up to 35 kg (domestic) or 2×32 kg checked bags (international).'
    },
    {
      q: 'When does Web Check-in open and close?',
      a: 'Online web check-in opens 48 hours prior to scheduled departure and closes 60 minutes before departure for domestic flights (75 minutes for international flights). You can select seats and download your PDF boarding pass instantly.'
    },
    {
      q: 'Can I request special assistance (wheelchair, medical, infant bassinet)?',
      a: 'Yes, wheelchair and medical assistance can be requested free of charge during the passenger details stage or by contacting our 24/7 support desk at least 24 hours before your flight.'
    },
    {
      q: 'What should I do if my checked baggage is delayed or damaged?',
      a: 'Please file a Property Irregularity Report (PIR) immediately at the airport AeroWings Baggage Service desk before leaving the arrival hall. You can track your bag using our Live Baggage Status Tracer in the Baggage Guide section.'
    },
    {
      q: 'How do I earn and redeem SkyMiles?',
      a: 'Simply enter your Frequent Flyer Number when booking. Miles are credited within 24 hours of flight completion. You can redeem miles for free award tickets, cabin upgrades, and lounge access in the SkyWings Loyalty Club portal.'
    }
  ];

  const filteredFaqs = faqs.filter(
    f => f.q.toLowerCase().includes(searchQuery.toLowerCase()) || f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName || !inquiryEmail || !inquiryMessage) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    const refId = `AW-TKT-${Math.floor(100000 + Math.random() * 900000)}`;
    setTicketRef(refId);
    showToast(`Support Ticket ${refId} created! Our team will reply within 2 hours.`, 'success');
  };

  const handleSendChat = (e?: React.FormEvent, customMsg?: string) => {
    if (e) e.preventDefault();
    const userText = (customMsg || chatInput).trim();
    if (!userText) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages(prev => [...prev, { sender: 'user', text: userText, time: now }]);
    setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      let botReply = "Thank you for contacting the AeroWings Virtual Desk. I have recorded your inquiry. Is there anything else regarding your flight, baggage, or itinerary I can assist with?";
      const lower = userText.toLowerCase();

      // Check for PNR pattern or 'pnr' query
      const pnrMatch = userText.toUpperCase().match(/\b(AW-[A-Z0-9]+|[A-Z0-9]{6})\b/);
      if (pnrMatch) {
        const foundPnr = pnrMatch[0];
        const matched = bookings.find(b => b.pnr.toUpperCase() === foundPnr);
        if (matched) {
          botReply = `✅ PNR ${foundPnr} Found! Flight ${matched.flight.flightNumber} from ${matched.flight.origin.city} (${matched.flight.origin.code}) to ${matched.flight.destination.city} (${matched.flight.destination.code}). Departure scheduled for ${matched.flight.departureTime}. Status: ${matched.status}. You can view the live boarding pass under 'My Trips'!`;
        } else {
          botReply = `🔍 Checking PNR ${foundPnr} in global reservation system: Booking is Active and confirmed. Baggage allowance: 15kg checked + 7kg cabin. Gate opens 45 mins before departure.`;
        }
      } else if (lower.includes('weather') || lower.includes('storm') || lower.includes('refund')) {
        botReply = "🌩️ Under our AI Doppler Weather Guarantee: If severe weather grounds your flight, your ticket is cancelled automatically with a 100% full refund and zero deduction. You can check real-time radar in the Weather & Radar tab!";
      } else if (lower.includes('baggage') || lower.includes('luggage')) {
        botReply = "🧳 Economy allowance: 7kg cabin + 15kg checked. Business Class: 12kg cabin + 35kg checked. Extra baggage vouchers can also be claimed using SkyMiles in the SkyWings Club!";
      } else if (lower.includes('checkin') || lower.includes('check-in') || lower.includes('boarding pass')) {
        botReply = "🎫 Web Check-in opens 48 hours prior to flight departure. You can check in directly from 'My Trips' to select seats and download your PDF boarding pass.";
      } else if (lower.includes('upgrade') || lower.includes('business')) {
        botReply = "👑 Lie-Flat Business Class upgrades can be redeemed for 7,500 SkyMiles in the SkyWings Club, or requested at the check-in desk subject to seat availability.";
      } else if (lower.includes('medical') || lower.includes('wheelchair')) {
        botReply = "♿ Complimentary wheelchair and airport tarmac assistance has been flagged for your reservation. Our ground crew will meet you at the departure drop-off point.";
      }

      setIsTyping(false);
      setChatMessages(prev => [...prev, { 
        sender: 'bot', 
        text: botReply, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
    }, 700);
  };

  return (
    <div className="min-w-0 bg-slate-950 text-slate-100 pb-20">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-b border-slate-800 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>AeroWings 24/7 Global Customer Care</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            How Can We Assist You Today?
          </h1>
          <p className="max-w-2xl mx-auto text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
            Search our comprehensive knowledge base, connect with our 24/7 support agents, or submit an official inquiry ticket.
          </p>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, e.g. baggage, cancellation refund, seat change, visa..."
              className="w-full bg-slate-900 border border-slate-700 rounded-2xl pl-12 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-16">
        {/* Contact Channels Grid */}
        <div id="care-desk" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Global Phone Support</h3>
              <p className="text-xs text-slate-400 mb-4">
                Toll-free customer hotline available 24 hours a day, 7 days a week.
              </p>
              <div className="font-mono font-bold text-white text-sm">+1 (800) 555-AERO</div>
              <div className="font-mono text-xs text-slate-400 mt-1">+91 (11) 4920-8000 (India)</div>
            </div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-4">Average wait time: &lt; 1 min</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Live Chat Assistant</h3>
              <p className="text-xs text-slate-400 mb-4">
                Chat with AeroBot or request an immediate transfer to a live desk supervisor.
              </p>
            </div>
            <button
              onClick={() => setChatOpen(true)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md"
            >
              Start Live Chat
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Email Desk</h3>
              <p className="text-xs text-slate-400 mb-4">
                For corporate bookings, charter quotes, and formal feedback.
              </p>
              <div className="font-mono text-xs text-slate-200">support@aerowings.com</div>
              <div className="font-mono text-xs text-slate-400 mt-1">corporate@aerowings.com</div>
            </div>
            <div className="text-[11px] text-slate-400 mt-4">Response within 2 hours guaranteed</div>
          </div>
        </div>

        {/* SECTION 1: SEARCHABLE FAQS */}
        <section id="faq-section" className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">
            Frequently Asked Questions ({filteredFaqs.length})
          </h2>

          <div className="space-y-3">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-900/50 transition-colors cursor-pointer"
                  >
                    <span className="font-semibold text-white text-sm sm:text-base">{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/80">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 2: SUBMIT A SUPPORT TICKET */}
        <section id="ticket-section" className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Submit an Official Inquiry Ticket
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm">
                Have a specific booking inquiry, refund question, or special request? We will assign an agent immediately.
              </p>
            </div>

            {ticketRef ? (
              <div className="bg-slate-950 p-8 rounded-2xl border border-emerald-500/40 text-center animate-fadeIn">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-1">Inquiry Ticket Registered</h3>
                <div className="text-sm text-slate-300 mb-4">
                  Your reference ID is <span className="font-mono font-bold text-amber-300">{ticketRef}</span>
                </div>
                <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
                  We have dispatched an acknowledgement to <strong>{inquiryEmail}</strong>. A customer relations specialist will update you shortly.
                </p>
                <button
                  onClick={() => {
                    setTicketRef(null);
                    setInquiryMessage('');
                  }}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitInquiry} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={inquiryEmail}
                      onChange={(e) => setInquiryEmail(e.target.value)}
                      placeholder="e.g. john@example.com"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">PNR Number (Optional)</label>
                    <input
                      type="text"
                      value={inquiryPnr}
                      onChange={(e) => setInquiryPnr(e.target.value.toUpperCase())}
                      placeholder="e.g. AW792K"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-blue-500 uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Inquiry Topic *</label>
                    <select
                      value={inquiryTopic}
                      onChange={(e) => setInquiryTopic(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Booking Change">Flight Rescheduling / Date Change</option>
                      <option value="Cancellation Refund">Cancellation & Refund Status</option>
                      <option value="Baggage Claim">Delayed or Damaged Baggage</option>
                      <option value="Special Assistance">Special Assistance / Medical Request</option>
                      <option value="SkyMiles Loyalty">SkyMiles Loyalty Account Issue</option>
                      <option value="Other">General Feedback or Inquiry</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Detailed Message *</label>
                  <textarea
                    rows={4}
                    required
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    placeholder="Please provide flight details, dates, or specific questions so we can assist you quickly..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/30"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Support Ticket</span>
                </button>
              </form>
            )}
          </div>
        </section>
      </div>

      {/* Floating Live Chat Widget */}
      {chatOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[480px] animate-fadeIn">
          <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-bold text-xs sm:text-sm">AeroWings Virtual Desk</div>
                <div className="text-[10px] text-blue-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Active Online</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="text-white/80 hover:text-white text-lg font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Chat message stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950 text-xs">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                  <div className="text-[9px] text-slate-400 text-right mt-1">{msg.time}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Chat input box */}
          <form onSubmit={handleSendChat} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type your question here..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
