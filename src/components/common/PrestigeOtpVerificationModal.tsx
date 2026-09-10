import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Phone, KeyRound, Clock, ArrowRight, RefreshCw, X, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';

interface PrestigeOtpVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (bookingToken: string, phoneNumber: string) => void;
  flightSummary?: {
    flightNumber: string;
    airline: string;
    originCity: string;
    destCity: string;
  };
}

export const PrestigeOtpVerificationModal: React.FC<PrestigeOtpVerificationModalProps> = ({
  isOpen,
  onClose,
  onVerified,
  flightSummary
}) => {
  const [phone, setPhone] = useState<string>('+91 98765 43210');
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes in seconds
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [smsDeliveryStatus, setSmsDeliveryStatus] = useState<string | null>(null);

  const digitInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 5-minute Countdown Timer when in verify step
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'verify' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  if (!isOpen) return null;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendOtp = async () => {
    if (!phone || phone.trim().length < 8) {
      setErrorMsg('Please provide a valid mobile number with country code (e.g. +91 9876543210)');
      return;
    }

    setIsSending(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phone.trim(),
          purpose: 'flight_booking'
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to dispatch 6-digit OTP.');
      }

      setStep('verify');
      setTimeLeft(300); // Strict 5-minute MongoDB TTL
      setSuccessMsg('Secure 6-digit OTP sent via SMS gateway!');
      if (data.devPreviewOtp) {
        setDevOtp(data.devPreviewOtp);
      }
      if (data.smsDelivery) {
        setSmsDeliveryStatus(data.smsDelivery.provider || 'SMS Gateway');
      }

      // Auto focus first OTP digit input
      setTimeout(() => {
        digitInputRefs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error generating OTP. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    const char = val.slice(-1);
    if (char && !/^\d$/.test(char)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);
    setErrorMsg(null);

    // Auto advance to next box
    if (char && index < 5) {
      digitInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      digitInputRefs.current[index - 1]?.focus();
    }
  };

  const handleQuickFillDemo = () => {
    if (!devOtp) return;
    const split = devOtp.split('').slice(0, 6);
    setOtpDigits(split);
    setErrorMsg(null);
  };

  const handleVerifyOtp = async () => {
    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setErrorMsg('Please enter all 6 digits of the OTP.');
      return;
    }

    if (timeLeft <= 0) {
      setErrorMsg('This 6-digit OTP has expired (5-minute limit exceeded). Please generate a new OTP.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phone.trim(),
          otp: fullOtp
        })
      });

      const data = await response.json();

      if (!response.ok || !data.verified) {
        throw new Error(data.error || 'Verification failed. Incorrect OTP.');
      }

      setSuccessMsg('OTP verified successfully! Clearance granted.');
      setTimeout(() => {
        onVerified(data.bookingToken || 'verified_token', phone.trim());
      }, 600);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Verification error. Please verify the 6-digit code.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-950/30 text-white">
        
        {/* Prestige Gold Accent Line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-24 bg-gradient-to-r from-transparent via-amber-400 to-transparent rounded-full" />

        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-amber-400" /> Prestige Passenger Verification
            </div>
            <h3 className="text-lg font-bold text-white mt-0.5">
              Secure Flight Booking Authorization
            </h3>
          </div>
        </div>

        {flightSummary && (
          <div className="mb-5 p-3 rounded-xl bg-slate-950/60 border border-amber-500/20 text-xs flex items-center justify-between">
            <div>
              <span className="font-semibold text-amber-300">{flightSummary.airline} • {flightSummary.flightNumber}</span>
              <p className="text-[11px] text-slate-400 mt-0.5">{flightSummary.originCity} → {flightSummary.destCity}</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
              Authorized Pass
            </span>
          </div>
        )}

        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <p className="leading-snug">{errorMsg}</p>
          </div>
        )}

        {/* Success Notification */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <p className="leading-snug">{successMsg}</p>
          </div>
        )}

        {step === 'request' ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              For elite passenger safety and ticket reservation security, a 6-digit One-Time Password (OTP) will be dispatched to your phone number and valid for 5 minutes.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-400" /> Mobile Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-950 border border-amber-500/30 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
              <p className="text-[10px] text-slate-400">
                Supports all international and Indian (+91) mobile formats.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSendOtp}
              disabled={isSending}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 transition-all shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Connecting to SMS Gateway...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 text-slate-950" />
                  <span>Send 6-Digit OTP</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs pb-1">
              <span className="text-slate-300">Sent to: <strong className="text-amber-300">{phone}</strong></span>
              <button
                type="button"
                onClick={() => {
                  setStep('request');
                  setOtpDigits(['', '', '', '', '', '']);
                }}
                className="text-amber-400 hover:underline cursor-pointer text-[11px]"
              >
                Change Phone
              </button>
            </div>

            {/* 6-Digit Segmented Input Boxes */}
            <div className="flex justify-between gap-1.5 sm:gap-2 my-2">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (digitInputRefs.current[idx] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-11 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-mono font-extrabold bg-slate-950 border border-amber-500/40 rounded-xl text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-inner"
                />
              ))}
            </div>

            {/* 5-minute TTL Expiration Indicator */}
            <div className="flex items-center justify-between text-xs px-1">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Clock className={`w-3.5 h-3.5 ${timeLeft < 60 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`} />
                <span>Expires in:</span>
                <span className={`font-mono font-bold ${timeLeft < 60 ? 'text-rose-400' : 'text-amber-300'}`}>
                  {formatTimer(timeLeft)}
                </span>
              </div>
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isSending}
                className="text-[11px] text-amber-400 hover:text-amber-300 cursor-pointer flex items-center gap-1 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isSending ? 'animate-spin' : ''}`} />
                <span>Resend OTP</span>
              </button>
            </div>

            {/* Dev Demo Quick Fill Helper */}
            {devOtp && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-amber-300">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Dev Preview OTP: <strong className="font-mono text-white tracking-widest">{devOtp}</strong></span>
                </div>
                <button
                  type="button"
                  onClick={handleQuickFillDemo}
                  className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-bold text-[10px] hover:bg-amber-300 cursor-pointer transition-colors"
                >
                  Quick Fill
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={isVerifying || otpDigits.join('').length !== 6 || timeLeft <= 0}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 transition-all shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Validating OTP in MongoDB...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-slate-950" />
                  <span>Verify OTP & Enter Passenger Page</span>
                </>
              )}
            </button>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-slate-800/80 text-center">
          <p className="text-[10px] text-slate-400">
            🔒 Protected by 256-bit AES cryptographic encryption & MongoDB automated 5-minute document purge.
          </p>
        </div>

      </div>
    </div>
  );
};
