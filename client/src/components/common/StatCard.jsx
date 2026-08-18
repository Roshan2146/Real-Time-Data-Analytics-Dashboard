import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendType = 'neutral', // 'positive' | 'negative' | 'neutral'
  color = 'brand',
  loading = false,
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'emerald':
        return {
          iconBg: 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20',
          border: 'hover:border-emerald-500/40',
        };
      case 'amber':
        return {
          iconBg: 'bg-amber-500/10 text-amber-500 dark:bg-amber-500/20',
          border: 'hover:border-amber-500/40',
        };
      case 'rose':
        return {
          iconBg: 'bg-rose-500/10 text-rose-500 dark:bg-rose-500/20',
          border: 'hover:border-rose-500/40',
        };
      case 'cyan':
        return {
          iconBg: 'bg-cyan-500/10 text-cyan-500 dark:bg-cyan-500/20',
          border: 'hover:border-cyan-500/40',
        };
      case 'brand':
      default:
        return {
          iconBg: 'bg-brand-500/10 text-brand-500 dark:bg-brand-500/20',
          border: 'hover:border-brand-500/40',
        };
    }
  };

  const colors = getColorClasses();

  return (
    <div
      className={`glass-panel p-5 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${colors.border}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${colors.iconBg} transition-transform duration-300 group-hover:scale-110`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3">
        {loading ? (
          <div className="h-8 w-28 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg mb-2" />
        ) : (
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white font-mono">
            {value}
          </div>
        )}

        {(subtitle || trend) && (
          <div className="mt-2 flex items-center gap-2 text-xs">
            {trend && (
              <span
                className={`inline-flex items-center gap-0.5 font-semibold ${
                  trendType === 'positive'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : trendType === 'negative'
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {trendType === 'positive' && <ArrowUpRight className="w-3.5 h-3.5" />}
                {trendType === 'negative' && <ArrowDownRight className="w-3.5 h-3.5" />}
                {trendType === 'neutral' && <Minus className="w-3.5 h-3.5" />}
                {trend}
              </span>
            )}
            {subtitle && (
              <span className="text-gray-500 dark:text-gray-400 truncate">
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
