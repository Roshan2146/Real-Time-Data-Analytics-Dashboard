import React from 'react';
import { useSocket } from '../../context/SocketContext';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

const ConnectionIndicator = () => {
  const { status, latency } = useSocket();

  const getStatusDisplay = () => {
    switch (status) {
      case 'connected':
        return {
          label: 'Live',
          badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
          dotClass: 'bg-emerald-500',
          icon: <Wifi className="w-3.5 h-3.5" />,
          tooltip: `WebSocket connected (${latency ? `${latency}ms latency` : 'Active'})`,
        };
      case 'connecting':
        return {
          label: 'Reconnecting',
          badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
          dotClass: 'bg-amber-500',
          icon: <RefreshCw className="w-3.5 h-3.5 animate-spin" />,
          tooltip: 'Attempting to reconnect WebSocket stream...',
        };
      case 'disconnected':
      default:
        return {
          label: 'Disconnected',
          badgeClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
          dotClass: 'bg-rose-500',
          icon: <WifiOff className="w-3.5 h-3.5" />,
          tooltip: 'Socket stream disconnected. Check backend server.',
        };
    }
  };

  const display = getStatusDisplay();

  return (
    <div
      title={display.tooltip}
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold select-none shadow-sm backdrop-blur-sm transition-all duration-300 ${display.badgeClass}`}
    >
      <span className="relative flex h-2 w-2">
        {status === 'connected' && (
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${display.dotClass} opacity-75`}></span>
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${display.dotClass}`}></span>
      </span>
      <span className="flex items-center gap-1">
        {display.label}
        {status === 'connected' && latency !== null && (
          <span className="text-[10px] opacity-70 font-mono">({latency}ms)</span>
        )}
      </span>
    </div>
  );
};

export default ConnectionIndicator;
