import React, { useState, useEffect, useCallback } from 'react';
import TelemetryTable from '../components/telemetry/TelemetryTable';
import TelemetryFilters from '../components/telemetry/TelemetryFilters';
import TelemetryModal from '../components/telemetry/TelemetryModal';
import { telemetryService } from '../services/telemetryService';
import { useSocket } from '../context/SocketContext';
import { Radio, RefreshCw, Layers } from 'lucide-react';

const TelemetryLogs = () => {
  const { latestTelemetry } = useSocket();
  const [telemetryData, setTelemetryData] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortBy, setSortBy] = useState('timestamp');
  const [order, setOrder] = useState('desc');
  const [highlightId, setHighlightId] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    status: 'all',
    deviceId: 'all',
    hasAlert: 'false',
    startDate: '',
    endDate: '',
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isViewOnly, setIsViewOnly] = useState(false);

  const fetchTelemetry = useCallback(async () => {
    setLoading(true);
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
        startDate: filters.startDate,
        endDate: filters.endDate,
      };
      const res = await telemetryService.getTelemetryList(params);
      if (res.success) {
        setTelemetryData(res.data);
        setTotalCount(res.total);
        setTotalPages(res.totalPages);
      }
    } catch (err) {
      console.error('[TelemetryLogs] Error fetching telemetry:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortBy, order, filters]);

  const fetchDevices = useCallback(async () => {
    try {
      const res = await telemetryService.getDevices();
      if (res.success) {
        setDevices(res.data);
      }
    } catch (err) {
      console.error('[TelemetryLogs] Error fetching devices:', err);
    }
  }, []);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  useEffect(() => {
    fetchTelemetry();
  }, [fetchTelemetry]);

  // Real-time packet prepend
  useEffect(() => {
    if (!latestTelemetry) return;
    setHighlightId(latestTelemetry._id);

    if (page === 1 && !filters.search && filters.category === 'all' && filters.status === 'all') {
      setTelemetryData((prev) => [latestTelemetry, ...prev.slice(0, limit - 1)]);
      setTotalCount((prev) => prev + 1);
    }
  }, [latestTelemetry, page, limit, filters]);

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
      startDate: '',
      endDate: '',
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

  const handleCreate = async (payload) => {
    await telemetryService.createTelemetry(payload);
    fetchTelemetry();
  };

  const handleUpdate = async (payload) => {
    if (!editingRecord) return;
    await telemetryService.updateTelemetry(editingRecord._id, payload);
    fetchTelemetry();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete telemetry record permanently?')) {
      await telemetryService.deleteTelemetry(id);
      fetchTelemetry();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
            Telemetry Stream & Logs
            <span className="p-1 rounded-full bg-brand-500/20 text-brand-500">
              <Radio className="w-4 h-4" />
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Complete database of raw telemetry transmissions with real-time stream ingestion
          </p>
        </div>

        <button
          onClick={fetchTelemetry}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 dark:bg-dark-surface hover:bg-gray-200 dark:hover:bg-dark-border text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-xl transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* Date Range Selection Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center gap-3 text-xs">
        <span className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-brand-500" />
          Time Window Filter:
        </span>
        <div className="flex items-center gap-2">
          <label className="text-gray-500">From:</label>
          <input
            type="datetime-local"
            value={filters.startDate}
            onChange={(e) => handleFilterChange({ startDate: e.target.value })}
            className="px-2.5 py-1.5 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg text-gray-900 dark:text-white text-xs"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-gray-500">To:</label>
          <input
            type="datetime-local"
            value={filters.endDate}
            onChange={(e) => handleFilterChange({ endDate: e.target.value })}
            className="px-2.5 py-1.5 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg text-gray-900 dark:text-white text-xs"
          />
        </div>
        {(filters.startDate || filters.endDate) && (
          <button
            onClick={() => handleFilterChange({ startDate: '', endDate: '' })}
            className="text-xs text-rose-500 hover:underline font-semibold"
          >
            Clear dates
          </button>
        )}
      </div>

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
        loading={loading}
        onPageChange={setPage}
        onLimitChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
        onSortChange={handleSortChange}
        onDelete={handleDelete}
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

      <TelemetryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={editingRecord ? handleUpdate : handleCreate}
        initialData={editingRecord}
        isViewOnly={isViewOnly}
      />
    </div>
  );
};

export default TelemetryLogs;
