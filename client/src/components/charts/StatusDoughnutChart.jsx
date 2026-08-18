import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';
import { Activity } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

const StatusDoughnutChart = ({ statusBreakdown = {}, loading = false }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const active = statusBreakdown.Active || 0;
  const idle = statusBreakdown.Idle || 0;
  const warning = statusBreakdown.Warning || 0;
  const offline = statusBreakdown.Offline || 0;
  const total = active + idle + warning + offline;

  const chartData = {
    labels: ['Active', 'Idle', 'Warning', 'Offline'],
    datasets: [
      {
        data: [active, idle, warning, offline],
        backgroundColor: [
          '#10b981', // Emerald
          '#3b82f6', // Blue
          '#f59e0b', // Amber
          '#f43f5e', // Rose
        ],
        borderColor: isDark ? '#111827' : '#ffffff',
        borderWidth: 3,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: isDark ? '#9ca3af' : '#4b5563',
          font: { family: 'Inter', size: 11, weight: '500' },
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 14,
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        titleColor: isDark ? '#f3f4f6' : '#111827',
        bodyColor: isDark ? '#d1d5db' : '#374151',
        borderColor: isDark ? '#374151' : '#e5e7eb',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context) => {
            const val = context.raw || 0;
            const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0.0';
            return ` ${context.label}: ${val.toLocaleString()} (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="glass-panel p-5 rounded-2xl flex flex-col h-full">
      <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100 dark:border-dark-border">
        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Health & Status Distribution
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Real-time operational distribution of nodes
          </p>
        </div>
      </div>

      <div className="relative flex-1 min-h-[260px] w-full flex items-center justify-center pt-2">
        {loading ? (
          <div className="h-40 w-40 rounded-full border-8 border-gray-200 dark:border-gray-700 animate-pulse" />
        ) : total === 0 ? (
          <div className="text-center text-gray-400 text-xs">
            No status distribution data available
          </div>
        ) : (
          <>
            <Doughnut data={chartData} options={options} />
            {/* Center Stat Badge */}
            <div className="absolute flex flex-col items-center justify-center pointer-events-none pb-7">
              <span className="text-2xl font-extrabold text-gray-900 dark:text-white font-mono">
                {total.toLocaleString()}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                Total Events
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StatusDoughnutChart;
