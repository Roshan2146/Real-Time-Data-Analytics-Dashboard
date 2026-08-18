import React from 'react';
import { AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';

const Toast = ({ alerts = [], onDismiss }) => {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {alerts.slice(0, 3).map((alert) => (
        <div
          key={alert.id}
          className="pointer-events-auto p-4 rounded-xl shadow-2xl border flex items-start gap-3 backdrop-blur-md bg-white/95 dark:bg-gray-900/95 border-rose-500/30 text-gray-900 dark:text-white animate-slide-up"
        >
          <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-500 shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                {alert.severity || 'Alert'} - {alert.deviceId}
              </span>
              <span className="text-[10px] text-gray-400">
                {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            <p className="text-xs mt-1 text-gray-600 dark:text-gray-300 font-medium line-clamp-2">
              {alert.message}
            </p>
          </div>
          <button
            onClick={() => onDismiss(alert.id)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-md transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
