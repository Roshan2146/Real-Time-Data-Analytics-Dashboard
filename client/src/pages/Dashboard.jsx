import React, { useState, useEffect, useCallback } from 'react';
import StatCard from '../components/common/StatCard';
import TrendLineChart from '../components/charts/TrendLineChart';
import CategoryBarChart from '../components/charts/CategoryBarChart';
import StatusDoughnutChart from '../components/charts/StatusDoughnutChart';
import TelemetryTable from '../components/telemetry/TelemetryTable';
import TelemetryFilters from '../components/telemetry/TelemetryFilters';
import TelemetryModal from '../components/telemetry/TelemetryModal';
import { analyticsService } from '../services/analyticsService';
import { telemetryService } from '../services/telemetryService';
import { useSocket } from '../context/SocketContext';
import {
  Database,
  Gauge,
  Cpu,
  AlertTriangle,
  Zap,
  Activity,
  Radio,
  Flame,
} from 'lucide-react';

const Dashboard = () => {
  const { latestTelemetry } = useSocket();

  // Summary and Analytics state
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  // Charts state
  const [trends, setTrends] = useState([]);
  const [trendRange, setTrendRange] = useState('24h');
  const [trendLoading, setTrendLoading] = useState(true);

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Telemetry table state
  const [telemetryData, setTelemetryData] = useState([]);
  const [devices, setDevices] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState('timestamp');
  const [order, setOrder] = useState('desc');
  const [highlightId, setHighlightId] = useState(null);

  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    status: 'all',
    deviceId: 'all',
    hasAlert: 'false',
  });

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isViewOnly, setIsViewOnly] = useState(false);

  // Fetch KPI Summary
  const fetchSummary = useCallback(async () => {
    try {
      const res = await analyticsService.getSummary();
      if (res.success) {
        setSummary(res.data);
      }
    } catch (err) {
      console.error('[Dashboard] Error fetching summary:', err);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  // Fetch Trends
  const fetchTrends = useCallback(async () => {
    setTrendLoading(true);
    try {
      const res = await analyticsService.getTrends({
        range: trendRange,
        category: filters.category,
        deviceId: filters.deviceId,
      });
      if (res.success) {
        setTrends(res.data);
      }
    } catch (err) {
      console.error('[Dashboard] Error fetching trends:', err);
    } finally {
      setTrendLoading(false);
    }
  }, [trendRange, filters.category, filters.deviceId]);

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await analyticsService.getCategories();
      if (res.success) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('[Dashboard] Error fetching categories:', err);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  // Fetch Telemetry table data
  const fetchTelemetry = useCallback(async () => {
    setTableLoading(true);
    try {
      const params = {
        page,
        limit,
        sortBy,
        order,
        search: filters.search,
        category: filters.category,
        status: filters.status,
        deviceId: filters.deviceId,
        hasAlert: filters.hasAlert,
      };
      const res = await telemetryService.getTelemetryList(params);
      if (res.success) {
        setTelemetryData(res.data);
        setTotalCount(res.total);
        setTotalPages(res.totalPages);
      }
    } catch (err) {
      console.error('[Dashboard] Error fetching telemetry list:', err);
    } finally {
      setTableLoading(false);
    }
  }, [page, limit, sortBy, order, filters]);

  // Fetch Fleet Devices
  const fetchDevices = useCallback(async () => {
    try {
      const res = await telemetryService.getDevices();
      if (res.success) {
        setDevices(res.data);
      }
    } catch (err) {
      console.error('[Dashboard] Error fetching devices:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchSummary();
    fetchCategories();
    fetchDevices();
  }, [fetchSummary, fetchCategories, fetchDevices]);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  useEffect(() => {
    fetchTelemetry();
  }, [fetchTelemetry]);

  // Dynamic Real-time Socket Updates:
  // When a new telemetry arrives from socket, update state seamlessly
  useEffect(() => {
    if (!latestTelemetry) return;

    // Flash highlight
    setHighlightId(latestTelemetry._id);

    // If on page 1 and no active search filter, prepend to table
    if (page === 1 && !filters.search && filters.category === 'all' && filters.status === 'all') {
      setTelemetryData((prev) => [latestTelemetry, ...prev.slice(0, limit - 1)]);
      setTotalCount((prev) => prev + 1);
    }

    // Increment summary counters smoothly
    setSummary((prev) => {
      if (!prev) return prev;
      const newTotal = prev.totalRecords + 1;
      const isAlert = latestTelemetry.alert?.isTriggered;
      return {
        ...prev,
        totalRecords: newTotal,
        avgValue: Number(
          ((prev.avgValue * prev.totalRecords + latestTelemetry.value) / newTotal).toFixed(2)
        ),
        avgTemperature: Number(
          ((prev.avgTemperature * prev.totalRecords + latestTelemetry.temperature) / newTotal).toFixed(2)
        ),
        totalAlerts: isAlert ? prev.totalAlerts + 1 : prev.totalAlerts,
        statusBreakdown: {
          ...prev.statusBreakdown,
          [latestTelemetry.status]: (prev.statusBreakdown[latestTelemetry.status] || 0) + 1,
        },
      };
    });
  }, [latestTelemetry, page, limit, filters]);

  // Filter change handlers
  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      status: 'all',
      deviceId: 'all',
      hasAlert: 'false',
    });
    setPage(1);
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setOrder('desc');
    }
  };

  // CRUD Actions
  const handleCreateTelemetry = async (payload) => {
    await telemetryService.createTelemetry(payload);
    fetchTelemetry();
    fetchSummary();
  };

  const handleUpdateTelemetry = async (payload) => {
    if (!editingRecord) return;
    await telemetryService.updateTelemetry(editingRecord._id, payload);
    fetchTelemetry();
    fetchSummary();
  };

  const handleDeleteTelemetry = async (id) => {
    if (window.confirm('Are you sure you want to delete this telemetry record?')) {
      try {
        await telemetryService.deleteTelemetry(id);
        fetchTelemetry();
        fetchSummary();
      } catch (err) {
        alert('Failed to delete telemetry record');
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
            Real-Time Operations Center
            <span className="p-1 rounded-full bg-emerald-500/20 text-emerald-500 animate-pulse">
              <Radio className="w-4 h-4" />
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Live telemetry telemetry metrics, anomaly detection, and automated fleet monitoring
          </p>
        </div>

        {/* Live Flash Timestamp */}
        {latestTelemetry && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-xs font-mono text-gray-600 dark:text-gray-400 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping" />
            <span>Latest Packet:</span>
            <span className="font-semibold text-brand-600 dark:text-brand-400">
              {latestTelemetry.deviceId} ({latestTelemetry.value}%)
            </span>
          </div>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Records */}
        <StatCard
          title="Total Records"
          value={summary ? summary.totalRecords.toLocaleString() : '0'}
          subtitle="Processed packets"
          icon={Database}
          trend="+12.4%"
          trendType="positive"
          color="brand"
          loading={summaryLoading}
        />

        {/* Average Metric Value */}
        <StatCard
          title="Average Load"
          value={summary ? `${summary.avgValue}%` : '0%'}
          subtitle={`Min: ${summary?.minValue || 0}% • Max: ${summary?.maxValue || 0}%`}
          icon={Gauge}
          trend={summary && summary.avgValue > 75 ? '+High' : 'Normal'}
          trendType={summary && summary.avgValue > 75 ? 'negative' : 'positive'}
          color="cyan"
          loading={summaryLoading}
        />

        {/* Average Temperature */}
        <StatCard
          title="Avg Temperature"
          value={summary ? `${summary.avgTemperature}°C` : '0°C'}
          subtitle={`Range: ${summary?.minTemperature || 0} - ${summary?.maxTemperature || 0}°C`}
          icon={Flame}
          trend="Thermal Node"
          trendType="neutral"
          color="amber"
          loading={summaryLoading}
        />

        {/* Active Fleet Devices */}
        <StatCard
          title="Active Devices"
          value={summary ? `${summary.activeDevices} / ${summary.totalDevices}` : '0'}
          subtitle={`${summary?.warningDevices || 0} Warning • ${summary?.offlineDevices || 0} Offline`}
          icon={Cpu}
          trend="98.5% Uptime"
          trendType="positive"
          color="emerald"
          loading={summaryLoading}
        />

        {/* Alerts & Anomalies */}
        <StatCard
          title="Active Alerts"
          value={summary ? summary.totalAlerts.toLocaleString() : '0'}
          subtitle={`${summary?.criticalAlerts || 0} Critical triggers`}
          icon={AlertTriangle}
          trend={summary?.totalAlerts > 0 ? 'Action Req' : 'Clear'}
          trendType={summary?.totalAlerts > 0 ? 'negative' : 'positive'}
          color="rose"
          loading={summaryLoading}
        />
      </div>

      {/* Primary Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Line Chart (Spans 2 columns) */}
        <div className="lg:col-span-2">
          <TrendLineChart
            data={trends}
            range={trendRange}
            onRangeChange={setTrendRange}
            loading={trendLoading}
            onRefresh={fetchTrends}
          />
        </div>

        {/* Status Distribution Doughnut Chart */}
        <div>
          <StatusDoughnutChart
            statusBreakdown={summary?.statusBreakdown || {}}
            loading={summaryLoading}
          />
        </div>
      </div>

      {/* Secondary Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Bar Chart */}
        <CategoryBarChart data={categories} loading={categoriesLoading} />

        {/* Live Real-time Telemetry Pulse Stream */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-dark-border">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Throughput & Real-time Velocity
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Instantaneous ingestion rate into MongoDB
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-brand-500 px-2.5 py-1 rounded-lg bg-brand-500/10">
              {summary ? `${summary.throughputPerMinute} rec/min` : '0 rec/min'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-100 dark:border-dark-border">
              <span className="text-xs text-gray-500 dark:text-gray-400">Last 1 Hour Ingestion</span>
              <div className="text-2xl font-extrabold text-gray-900 dark:text-white font-mono mt-1">
                {summary ? summary.throughputLastHour.toLocaleString() : '0'}
              </div>
              <p className="text-[11px] text-emerald-500 font-semibold mt-1">✓ Normal Flow</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-100 dark:border-dark-border">
              <span className="text-xs text-gray-500 dark:text-gray-400">Active Node Categories</span>
              <div className="text-2xl font-extrabold text-gray-900 dark:text-white font-mono mt-1">
                {categories.length}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Servers, IoT, Switches, DB</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-gradient-to-r from-brand-600/10 via-purple-600/10 to-indigo-600/10 border border-brand-500/20 flex items-center justify-between text-xs">
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              WebSocket stream broadcasting every 3s
            </span>
            <span className="font-mono text-brand-600 dark:text-brand-400 font-bold">
              Socket.io v4.8
            </span>
          </div>
        </div>
      </div>

      {/* Filters and Telemetry Data Table Section */}
      <div className="space-y-4 pt-2">
        <TelemetryFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
          devices={devices}
        />

        <TelemetryTable
          data={telemetryData}
          total={totalCount}
          page={page}
          totalPages={totalPages}
          limit={limit}
          sortBy={sortBy}
          order={order}
          loading={tableLoading}
          onPageChange={setPage}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
          onSortChange={handleSortChange}
          onDelete={handleDeleteTelemetry}
          onEdit={(record) => {
            setEditingRecord(record);
            setIsViewOnly(false);
            setModalOpen(true);
          }}
          onCreate={() => {
            setEditingRecord(null);
            setIsViewOnly(false);
            setModalOpen(true);
          }}
          onViewDetails={(record) => {
            setEditingRecord(record);
            setIsViewOnly(true);
            setModalOpen(true);
          }}
          highlightId={highlightId}
        />
      </div>

      {/* Telemetry Create / Edit Modal */}
      <TelemetryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={editingRecord ? handleUpdateTelemetry : handleCreateTelemetry}
        initialData={editingRecord}
        isViewOnly={isViewOnly}
      />
    </div>
  );
};

export default Dashboard;
