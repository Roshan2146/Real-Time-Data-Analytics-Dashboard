import React, { useState } from 'react';
import StatusBadge from '../common/StatusBadge';
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  AlertTriangle,
  Trash2,
  Edit2,
  Eye,
  Activity,
  Plus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TelemetryTable = ({
  data = [],
  total = 0,
  page = 1,
  totalPages = 1,
  limit = 20,
  sortBy = 'timestamp',
  order = 'desc',
  loading = false,
  onPageChange,
  onLimitChange,
  onSortChange,
  onDelete,
  onEdit,
  onCreate,
  onViewDetails,
  highlightId = null,
}) => {
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin');
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Helper for sort indicators
  const renderSortIcon = (field) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity" />;
    }
    return order === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-brand-500" />
    ) : (
      <ArrowDown className="w-3 h-3 text-brand-500" />
    );
  };

  // CSV Exporter
  const handleExportCSV = () => {
    if (!data.length) return;

    const headers = [
      'ID',
      'Device ID',
      'Device Name',
      'Category',
      'Value (%)',
      'Temperature (°C)',
      'Status',
      'Location',
      'Alert Triggered',
      'Alert Severity',
      'Alert Message',
      'Timestamp',
    ];

    const csvRows = [
      headers.join(','),
      ...data.map((row) =>
        [
          `"${row._id}"`,
          `"${row.deviceId}"`,
          `"${row.deviceName}"`,
          `"${row.category}"`,
          row.value,
          row.temperature,
          `"${row.status}"`,
          `"${row.location}"`,
          row.alert?.isTriggered ? 'TRUE' : 'FALSE',
          `"${row.alert?.severity || 'none'}"`,
          `"${(row.alert?.message || '').replace(/"/g, '""')}"`,
          `"${new Date(row.timestamp).toISOString()}"`,
        ].join(',')
      ),
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `telemetry_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden shadow-sm flex flex-col">
      {/* Table Top Controls */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-dark-border bg-white/50 dark:bg-dark-card/50">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-brand-500/10 text-brand-500">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Telemetry Records
              <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-gray-400">
                {total.toLocaleString()} total
              </span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Live streaming and historical telemetry events
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {isAdmin && onCreate && (
            <button
              onClick={onCreate}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Record
            </button>
          )}

          <button
            onClick={handleExportCSV}
            disabled={!data.length}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-dark-surface hover:bg-gray-200 dark:hover:bg-dark-border text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-xl transition-all disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-gray-50/80 dark:bg-dark-surface/80 border-b border-gray-100 dark:border-dark-border text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider text-[11px] select-none">
            <tr>
              <th
                onClick={() => onSortChange('deviceId')}
                className="py-3 px-4 cursor-pointer hover:text-brand-500 transition-colors group"
              >
                <div className="flex items-center gap-1.5">
                  Device ID {renderSortIcon('deviceId')}
                </div>
              </th>
              <th
                onClick={() => onSortChange('deviceName')}
                className="py-3 px-4 cursor-pointer hover:text-brand-500 transition-colors group"
              >
                <div className="flex items-center gap-1.5">
                  Device Name {renderSortIcon('deviceName')}
                </div>
              </th>
              <th
                onClick={() => onSortChange('category')}
                className="py-3 px-4 cursor-pointer hover:text-brand-500 transition-colors group"
              >
                <div className="flex items-center gap-1.5">
                  Category {renderSortIcon('category')}
                </div>
              </th>
              <th
                onClick={() => onSortChange('value')}
                className="py-3 px-4 cursor-pointer hover:text-brand-500 transition-colors group"
              >
                <div className="flex items-center gap-1.5">
                  Value {renderSortIcon('value')}
                </div>
              </th>
              <th
                onClick={() => onSortChange('temperature')}
                className="py-3 px-4 cursor-pointer hover:text-brand-500 transition-colors group"
              >
                <div className="flex items-center gap-1.5">
                  Temp {renderSortIcon('temperature')}
                </div>
              </th>
              <th
                onClick={() => onSortChange('status')}
                className="py-3 px-4 cursor-pointer hover:text-brand-500 transition-colors group"
              >
                <div className="flex items-center gap-1.5">
                  Status {renderSortIcon('status')}
                </div>
              </th>
              <th className="py-3 px-4">Location</th>
              <th
                onClick={() => onSortChange('timestamp')}
                className="py-3 px-4 cursor-pointer hover:text-brand-500 transition-colors group"
              >
                <div className="flex items-center gap-1.5">
                  Timestamp {renderSortIcon('timestamp')}
                </div>
              </th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-dark-border/50">
            {loading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-3.5 px-4"><div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                  <td className="py-3.5 px-4"><div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                  <td className="py-3.5 px-4"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                  <td className="py-3.5 px-4"><div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                  <td className="py-3.5 px-4"><div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                  <td className="py-3.5 px-4"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                  <td className="py-3.5 px-4"><div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                  <td className="py-3.5 px-4"><div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                  <td className="py-3.5 px-4 text-right"><div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded ml-auto" /></td>
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan="9" className="py-12 text-center text-gray-400">
                  <div className="flex flex-col items-center justify-center">
                    <Activity className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      No telemetry records found
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Try adjusting search filters or wait for incoming real-time records.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((record) => {
                const isHighlighted = highlightId === record._id;
                const isAlert = record.alert && record.alert.isTriggered;

                return (
                  <tr
                    key={record._id}
                    className={`transition-colors duration-200 hover:bg-gray-50/70 dark:hover:bg-dark-surface/50 ${
                      isHighlighted ? 'animate-row-flash bg-brand-500/10' : ''
                    }`}
                  >
                    {/* Device ID */}
                    <td className="py-3 px-4 font-mono font-medium text-brand-600 dark:text-brand-400">
                      {record.deviceId}
                    </td>

                    {/* Device Name */}
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                      <div className="flex items-center gap-1.5">
                        <span>{record.deviceName}</span>
                        {isAlert && (
                          <span
                            title={record.alert.message}
                            className="p-0.5 rounded text-rose-500 bg-rose-500/10"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-dark-surface text-xs font-mono">
                        {record.category}
                      </span>
                    </td>

                    {/* Metric Value */}
                    <td className="py-3 px-4 font-mono font-semibold text-gray-900 dark:text-white">
                      <div className="flex items-center gap-1">
                        <span>{record.value}%</span>
                        <div className="w-12 bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className={`h-full rounded-full ${
                              record.value > 85
                                ? 'bg-rose-500'
                                : record.value > 70
                                ? 'bg-amber-500'
                                : 'bg-brand-500'
                            }`}
                            style={{ width: `${Math.min(100, record.value)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Temperature */}
                    <td className="py-3 px-4 font-mono">
                      <span
                        className={`font-semibold ${
                          record.temperature > 75
                            ? 'text-rose-500'
                            : record.temperature > 55
                            ? 'text-amber-500'
                            : 'text-emerald-500'
                        }`}
                      >
                        {record.temperature}°C
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <StatusBadge status={record.status} size="sm" />
                    </td>

                    {/* Location */}
                    <td className="py-3 px-4 text-xs text-gray-500 dark:text-gray-400 font-mono">
                      {record.location || 'N/A'}
                    </td>

                    {/* Timestamp */}
                    <td className="py-3 px-4 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap font-mono">
                      {new Date(record.timestamp).toLocaleString([], {
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {onViewDetails && (
                          <button
                            onClick={() => onViewDetails(record)}
                            title="View Details"
                            className="p-1 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        {isAdmin && onEdit && (
                          <button
                            onClick={() => onEdit(record)}
                            title="Edit Telemetry"
                            className="p-1 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {isAdmin && onDelete && (
                          <button
                            onClick={() => onDelete(record._id)}
                            title="Delete Telemetry"
                            className="p-1 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="p-4 border-t border-gray-100 dark:border-dark-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="px-2 py-1 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>
            Page <span className="font-semibold text-gray-900 dark:text-white">{page}</span> of{' '}
            <span className="font-semibold text-gray-900 dark:text-white">{totalPages}</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || loading}
            className="p-1.5 rounded-lg border border-gray-200 dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-surface disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 py-1 font-mono font-medium bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-lg">
            {page}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || loading}
            className="p-1.5 rounded-lg border border-gray-200 dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-surface disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TelemetryTable;
