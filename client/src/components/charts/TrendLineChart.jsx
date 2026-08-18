import React, { useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';
import { TrendingUp, RefreshCw } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const TrendLineChart = ({
  data = [],
  range = '24h',
  onRangeChange,
  loading = false,
  onRefresh,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const chartRef = useRef(null);

  const labels = data.map((item) => item.label || '');
  const values = data.map((item) => item.avgValue || 0);
  const temperatures = data.map((item) => item.avgTemperature || 0);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Telemetry Value (%)',
        data: values,
        borderColor: '#6366f1',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(99, 102, 241, 0.35)');
          gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');
          return gradient;
        },
        borderWidth: 2.5,
        pointBackgroundColor: '#6366f1',
        pointBorderColor: isDark ? '#111827' : '#ffffff',
        pointBorderWidth: 2,
        pointRadius: values.length > 30 ? 0 : 3.5,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.35,
        yAxisID: 'y',
      },
      {
        label: 'Avg Temperature (°C)',
        data: temperatures,
        borderColor: '#f59e0b',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [4, 4],
        pointBackgroundColor: '#f59e0b',
        pointBorderColor: isDark ? '#111827' : '#ffffff',
        pointBorderWidth: 2,
        pointRadius: values.length > 30 ? 0 : 3,
        pointHoverRadius: 5,
        tension: 0.35,
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          color: isDark ? '#9ca3af' : '#4b5563',
          font: { family: 'Inter', size: 12, weight: '500' },
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        titleColor: isDark ? '#f3f4f6' : '#111827',
        bodyColor: isDark ? '#d1d5db' : '#374151',
        borderColor: isDark ? '#374151' : '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: (context) => {
            const unit = context.datasetIndex === 0 ? '%' : '°C';
            return ` ${context.dataset.label}: ${context.raw}${unit}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: isDark ? 'rgba(55, 65, 81, 0.4)' : 'rgba(229, 231, 235, 0.8)',
        },
        ticks: {
          color: isDark ? '#9ca3af' : '#6b7280',
          font: { family: 'Inter', size: 11 },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8,
        },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        min: 0,
        max: 100,
        grid: {
          color: isDark ? 'rgba(55, 65, 81, 0.4)' : 'rgba(229, 231, 235, 0.8)',
        },
        ticks: {
          color: isDark ? '#9ca3af' : '#6b7280',
          font: { family: 'Inter', size: 11 },
          callback: (value) => `${value}%`,
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        min: 0,
        max: 100,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: '#f59e0b',
          font: { family: 'Inter', size: 11 },
          callback: (value) => `${value}°C`,
        },
      },
    },
  };

  const ranges = [
    { label: '1 Hour', value: '1h' },
    { label: '6 Hours', value: '6h' },
    { label: '24 Hours', value: '24h' },
    { label: '7 Days', value: '7d' },
  ];

  return (
    <div className="glass-panel p-5 rounded-2xl flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-dark-border">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-brand-500/10 text-brand-500">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Telemetry & Thermal Trends
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Live time-series analysis over selected timeframe
            </p>
          </div>
        </div>

        {/* Range Controls */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => onRangeChange && onRangeChange(r.value)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                range === r.value
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-border'
              }`}
            >
              {r.label}
            </button>
          ))}
          {onRefresh && (
            <button
              onClick={onRefresh}
              title="Refresh Trend Data"
              className="p-1.5 ml-1 rounded-lg bg-gray-100 dark:bg-dark-surface text-gray-500 hover:text-brand-500 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative flex-1 min-h-[280px] w-full pt-4">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-dark-card/50 backdrop-blur-xs rounded-xl">
            <div className="flex items-center gap-2 text-xs font-medium text-brand-600 dark:text-brand-400">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Loading real-time trends...
            </div>
          </div>
        )}
        {data.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12 text-gray-400">
            <p className="text-sm font-medium">No trend data available for this range</p>
            <p className="text-xs text-gray-500 mt-1">Live incoming data will appear here shortly</p>
          </div>
        ) : (
          <Line ref={chartRef} data={chartData} options={options} />
        )}
      </div>
    </div>
  );
};

export default TrendLineChart;
