import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';

export const NetworkStatusBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [showReconnectedToast, setShowReconnectedToast] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnectedToast(true);
      setTimeout(() => setShowReconnectedToast(false), 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleManualCheck = async () => {
    setIsChecking(true);
    try {
      const res = await fetch('/api/network/ping', { cache: 'no-store' });
      if (res.ok) {
        setIsOnline(true);
        setShowReconnectedToast(true);
        setTimeout(() => setShowReconnectedToast(false), 4000);
      } else {
        setIsOnline(false);
      }
    } catch {
      setIsOnline(false);
    } finally {
      setIsChecking(false);
    }
  };

  if (isOnline && !showReconnectedToast) {
    return null;
  }

  if (showReconnectedToast) {
    return (
      <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-lg sticky top-0 z-50 animate-fadeIn">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <Wifi className="w-4 h-4 text-emerald-200" />
          <span>✅ Internet Connection Restored. AeroWings Live Flight Reservation Network is Online & Synced.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-rose-950/95 border-b-2 border-rose-600 text-white px-4 py-3 text-xs shadow-2xl sticky top-0 z-50 backdrop-blur-md animate-fadeIn">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-rose-600/30 border border-rose-500 flex items-center justify-center text-rose-300 shrink-0 animate-pulse">
            <WifiOff className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white flex items-center gap-2">
              <span>⚠️ NO INTERNET / NETWORK CONNECTION DETECTED</span>
              <span className="px-2 py-0.5 rounded-full bg-rose-600 text-[10px] uppercase tracking-wider font-mono">
                Offline Mode
              </span>
            </div>
            <p className="text-[11px] text-rose-200 mt-0.5">
              AeroWings Cloud Reservation System requires active internet connectivity for real-time live seat lock, DGCA flight radar, bank 3D Secure payment, and ticket issuance.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleManualCheck}
          disabled={isChecking}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl flex items-center gap-2 text-xs transition-all shadow-lg shrink-0 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
          <span>{isChecking ? 'Checking Connection...' : 'Retry Connection Now'}</span>
        </button>
      </div>
    </div>
  );
};
