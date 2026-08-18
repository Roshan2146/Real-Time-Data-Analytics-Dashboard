import React, { useState, useEffect } from 'react';
import { Search, Filter, RotateCcw, AlertTriangle, Calendar } from 'lucide-react';

const TelemetryFilters = ({
  filters,
  onFilterChange,
  onReset,
  devices = [],
}) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filters.search) {
        onFilterChange({ search: searchTerm });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm, filters.search, onFilterChange]);

  const categories = [
    'All Categories',
    'Server',
    'IoT-Sensor',
    'Network-Switch',
    'Database',
    'Industrial-PLC',
  ];

  const statuses = ['All Statuses', 'Active', 'Idle', 'Warning', 'Offline'];

  return (
    <div className="glass-panel p-4 rounded-2xl mb-6 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-dark-border mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-brand-500" />
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            Data Filters & Search
          </span>
        </div>
        <button
          onClick={() => {
            setSearchTerm('');
            onReset();
          }}
          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-brand-500 transition-colors font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Filters
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Search Bar */}
        <div className="relative lg:col-span-2">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by device, name, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
          />
        </div>

        {/* Category Select */}
        <div>
          <select
            value={filters.category || 'all'}
            onChange={(e) => onFilterChange({ category: e.target.value })}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
          >
            <option value="all">All Categories</option>
            {categories.slice(1).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Status Select */}
        <div>
          <select
            value={filters.status || 'all'}
            onChange={(e) => onFilterChange({ status: e.target.value })}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
          >
            <option value="all">All Statuses</option>
            {statuses.slice(1).map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* Device Select */}
        <div>
          <select
            value={filters.deviceId || 'all'}
            onChange={(e) => onFilterChange({ deviceId: e.target.value })}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
          >
            <option value="all">All Devices</option>
            {devices.map((d) => (
              <option key={d._id || d.deviceId} value={d._id || d.deviceId}>
                {d._id || d.deviceId} ({d.deviceName})
              </option>
            ))}
          </select>
        </div>

        {/* Alert Filter Toggle */}
        <div>
          <button
            type="button"
            onClick={() =>
              onFilterChange({
                hasAlert: filters.hasAlert === 'true' ? 'false' : 'true',
              })
            }
            className={`w-full h-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
              filters.hasAlert === 'true'
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-600 dark:text-rose-400'
                : 'bg-gray-50 dark:bg-dark-surface border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span>Alerts Only</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TelemetryFilters;
