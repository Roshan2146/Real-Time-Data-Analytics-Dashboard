import React, { useState, useEffect, useCallback } from 'react';
import TrendLineChart from '../components/charts/TrendLineChart';
import CategoryBarChart from '../components/charts/CategoryBarChart';
import StatusDoughnutChart from '../components/charts/StatusDoughnutChart';
import DeviceMetricsChart from '../components/charts/DeviceMetricsChart';
import StatCard from '../components/common/StatCard';
import { analyticsService } from '../services/analyticsService';
import { BarChart3, Database, Thermometer, ShieldAlert, Cpu } from 'lucide-react';

const AnalyticsView = () => {
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [categories, setCategories] = useState([]);
  const [deviceAnalytics, setDeviceAnalytics] = useState([]);
  const [trendRange, setTrendRange] = useState('7d');
  const [loading, setLoading] = useState(true);

  const fetchAnalyticsData = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, trendsRes, catRes, devRes] = await Promise.all([
        analyticsService.getSummary(),
        analyticsService.getTrends({ range: trendRange }),
        analyticsService.getCategories(),
        analyticsService.getDevicesAnalytics(),
      ]);

      if (sumRes.success) setSummary(sumRes.data);
      if (trendsRes.success) setTrends(trendsRes.data);
      if (catRes.success) setCategories(catRes.data);
      if (devRes.success) setDeviceAnalytics(devRes.data);
    } catch (err) {
      console.error('[AnalyticsView] Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [trendRange]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
          Analytics & Intelligence
          <span className="p-1 rounded-full bg-brand-500/20 text-brand-500">
            <BarChart3 className="w-4 h-4" />
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Aggregated performance trends, historical distribution metrics, and device fleet telemetry
        </p>
      </div>

      {/* Analytics Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monitored Fleet Units"
          value={summary ? summary.totalDevices.toString() : '0'}
          subtitle="Distributed telemetry devices"
          icon={Cpu}
          color="brand"
          loading={loading}
        />
        <StatCard
          title="Avg Fleet Load"
          value={summary ? `${summary.avgValue}%` : '0%'}
          subtitle={`Peak Max: ${summary?.maxValue || 0}%`}
          icon={Database}
          color="cyan"
          loading={loading}
        />
        <StatCard
          title="Avg Thermal Baseline"
          value={summary ? `${summary.avgTemperature}°C` : '0°C'}
          subtitle={`Max reached: ${summary?.maxTemperature || 0}°C`}
          icon={Thermometer}
          color="amber"
          loading={loading}
        />
        <StatCard
          title="Anomaly Incident Rate"
          value={
            summary && summary.totalRecords > 0
              ? `${((summary.totalAlerts / summary.totalRecords) * 100).toFixed(2)}%`
              : '0.0%'
          }
          subtitle={`${summary?.totalAlerts || 0} Total Alerts`}
          icon={ShieldAlert}
          color="rose"
          loading={loading}
        />
      </div>

      {/* Primary Trend Chart */}
      <div className="grid grid-cols-1 gap-6">
        <TrendLineChart
          data={trends}
          range={trendRange}
          onRangeChange={setTrendRange}
          loading={loading}
          onRefresh={fetchAnalyticsData}
        />
      </div>

      {/* Secondary Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DeviceMetricsChart devices={deviceAnalytics} loading={loading} />
        </div>
        <div>
          <StatusDoughnutChart
            statusBreakdown={summary?.statusBreakdown || {}}
            loading={loading}
          />
        </div>
      </div>

      {/* Category Breakdown Full Width */}
      <div className="grid grid-cols-1 gap-6">
        <CategoryBarChart data={categories} loading={loading} />
      </div>
    </div>
  );
};

export default AnalyticsView;
