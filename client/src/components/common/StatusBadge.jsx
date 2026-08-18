import React from 'react';

const StatusBadge = ({ status, size = 'md' }) => {
  const normalized = (status || 'Active').toLowerCase();

  const getStyle = () => {
    switch (normalized) {
      case 'active':
      case 'online':
        return {
          bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          dot: 'bg-emerald-500',
          animate: true,
        };
      case 'idle':
        return {
          bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
          dot: 'bg-blue-500',
          animate: false,
        };
      case 'warning':
      case 'medium':
      case 'high':
        return {
          bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          dot: 'bg-amber-500',
          animate: true,
        };
      case 'offline':
      case 'critical':
        return {
          bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
          dot: 'bg-rose-500',
          animate: true,
        };
      default:
        return {
          bg: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
          dot: 'bg-gray-400',
          animate: false,
        };
    }
  };

  const style = getStyle();
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${style.bg} ${sizeClasses} tracking-wide transition-all`}
    >
      <span className="relative flex h-2 w-2">
        {style.animate && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full ${style.dot} opacity-75`}
          ></span>
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${style.dot}`}></span>
      </span>
      {status || 'Active'}
    </span>
  );
};

export default StatusBadge;
