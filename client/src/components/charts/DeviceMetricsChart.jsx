import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';
import { Cpu } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DeviceMetricsChart = ({ devices = [], loading = false }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const labels = devices.map((d) => d.deviceId || d._id || 'Device');
  const values = devices.map((d) => d.avgValue || 0);
  const temps = devices.map((d) => d.avgTemperature || 0);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Avg Load (%)',
        data: values,
        backgroundColor: '#6366f1',
        borderRadius: 4,
      },
      {
        label: 'Avg Temp (°C)',
        data: temps,
        backgroundColor: '#f59e0b',
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          color: isDark ? '#9ca3af' : '#4b5563',
          font: { family: 'Inter', size: 11, weight: '500' },
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 12,
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        titleColor: isDark ? '#f3f4f6' : '#111827',
        bodyColor: isDark ? '#d1d5db' : '#374151',
        borderColor: isDark ? '#374151' : '#e5e7eb',
        borderWidth: 1,
        padding: 10,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: isDark ? '#9ca3af' : '#6b7280',
          font: { family: 'Inter', size: 11 },
        },
      },
      y: {
        min: 0,
        max: 100,
        grid: {
          color: isDark ? 'rgba(55, 65, 81, 0.3)' : 'rgba(229, 231, 235, 0.7)',
        },
        ticks: {
          color: isDark ? '#9ca3af' : '#6b7280',
          font: { family: 'Inter', size: 10 },
        },
      },
    },
  };

  return (
    <div className="glass-panel p-5 rounded-2xl flex flex-col h-full">
      <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100 dark:border-dark-border">
        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
          <Cpu className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Fleet Device Performance
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Average workload and temperature comparison across all fleet units
          </p>
        </div>
      </div>

      <div className="relative flex-1 min-h-[260px] w-full pt-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="h-32 w-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl" />
          </div>
        ) : devices.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-xs">
            No device performance data available
          </div>
        ) : (
          <Bar data={chartData} options={options} />
        )}
      </div>
    </div>
  );
};

export default DeviceMetricsChart;
