import React from 'react';
import { useAirline } from '../../context/AirlineContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAirline();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="alert"
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-2xl border-2 transition-all transform animate-in slide-in-from-top-2 ${
            toast.type === 'success'
              ? 'bg-slate-900/95 backdrop-blur-md border-emerald-500/70 text-emerald-300 shadow-emerald-950/50'
              : toast.type === 'error'
              ? 'bg-slate-900/95 backdrop-blur-md border-rose-500/70 text-rose-300 shadow-rose-950/50'
              : 'bg-slate-900/95 backdrop-blur-md border-sky-500/70 text-sky-300 shadow-sky-950/50'
          }`}
        >
          <div className="mt-0.5 flex-shrink-0">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-sky-400" />}
          </div>
          <div className="flex-1 text-xs sm:text-sm font-bold leading-snug text-white font-mono">
            {toast.message}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-white p-0.5 rounded transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
