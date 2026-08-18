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
import { Layers } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CategoryBarChart = ({ data = [], loading = false }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const labels = data.map((item) => item.category || 'Unknown');
  const counts = data.map((item) => item.count || 0);
  const avgValues = data.map((item) => item.avgValue || 0);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Avg Value (%)',
        data: avgValues,
        backgroundColor: 'rgba(99, 102, 241, 0.85)',
        hoverBackgroundColor: '#4f46e5',
        borderRadius: 6,
        borderSkipped: false,
        yAxisID: 'y',
      },
      {
        label: 'Record Volume',
        data: counts,
        backgroundColor: 'rgba(14, 165, 233, 0.5)',
        hoverBackgroundColor: 'rgba(14, 165, 233, 0.8)',
        borderRadius: 6,
        borderSkipped: false,
        yAxisID: 'y1',
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
        callbacks: {
          label: (context) => {
            if (context.datasetIndex === 0) {
              return ` Avg Value: ${context.raw}%`;
            }
            return ` Records: ${context.raw.toLocaleString()}`;
          },
        },
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
        type: 'linear',
        position: 'left',
        min: 0,
        max: 100,
        grid: {
          color: isDark ? 'rgba(55, 65, 81, 0.3)' : 'rgba(229, 231, 235, 0.7)',
        },
        ticks: {
          color: isDark ? '#9ca3af' : '#6b7280',
          font: { family: 'Inter', size: 10 },
          callback: (value) => `${value}%`,
        },
      },
      y1: {
        type: 'linear',
        position: 'right',
        grid: {
          drawOnChartArea: false,
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
        <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Category Breakdown
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Average utilization & volume by infrastructure category
          </p>
        </div>
      </div>

      <div className="relative flex-1 min-h-[260px] w-full pt-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="h-32 w-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-xs">
            No category data available
          </div>
        ) : (
          <Bar data={chartData} options={options} />
        )}
      </div>
    </div>
  );
};

export default CategoryBarChart;
