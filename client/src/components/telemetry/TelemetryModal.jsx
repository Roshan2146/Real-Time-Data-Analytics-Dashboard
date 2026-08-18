import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';

const TelemetryModal = ({ isOpen, onClose, onSubmit, initialData = null, isViewOnly = false }) => {
  const [formData, setFormData] = useState({
    deviceId: 'Device-001',
    deviceName: 'Core App Server #1',
    category: 'Server',
    value: 50,
    temperature: 45,
    status: 'Active',
    location: 'US-East-1',
    isAlertTriggered: false,
    alertMessage: '',
    alertSeverity: 'none',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        deviceId: initialData.deviceId || '',
        deviceName: initialData.deviceName || '',
        category: initialData.category || 'Server',
        value: initialData.value ?? 50,
        temperature: initialData.temperature ?? 45,
        status: initialData.status || 'Active',
        location: initialData.location || 'DataCenter-Primary',
        isAlertTriggered: initialData.alert?.isTriggered || false,
        alertMessage: initialData.alert?.message || '',
        alertSeverity: initialData.alert?.severity || 'none',
      });
    } else {
      setFormData({
        deviceId: 'Device-001',
        deviceName: 'Core App Server #1',
        category: 'Server',
        value: 50,
        temperature: 45,
        status: 'Active',
        location: 'US-East-1',
        isAlertTriggered: false,
        alertMessage: '',
        alertSeverity: 'none',
      });
    }
    setError('');
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isViewOnly) {
      onClose();
      return;
    }

    if (!formData.deviceId || !formData.deviceName) {
      setError('Device ID and Device Name are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        deviceId: formData.deviceId,
        deviceName: formData.deviceName,
        category: formData.category,
        value: Number(formData.value),
        temperature: Number(formData.temperature),
        status: formData.status,
        location: formData.location,
        alert: {
          isTriggered: formData.isAlertTriggered,
          message: formData.alertMessage,
          severity: formData.alertSeverity,
        },
      };

      await onSubmit(payload);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Server', 'IoT-Sensor', 'Network-Switch', 'Database', 'Industrial-PLC'];
  const statuses = ['Active', 'Idle', 'Warning', 'Offline'];
  const severities = ['none', 'low', 'medium', 'high', 'critical'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isViewOnly
          ? `Telemetry Details: ${formData.deviceId}`
          : initialData
          ? 'Edit Telemetry Record'
          : 'Create Manual Telemetry Entry'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-xl">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Device ID
            </label>
            <input
              type="text"
              name="deviceId"
              value={formData.deviceId}
              onChange={handleChange}
              disabled={isViewOnly}
              placeholder="e.g. Device-001"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Device Name
            </label>
            <input
              type="text"
              name="deviceName"
              value={formData.deviceName}
              onChange={handleChange}
              disabled={isViewOnly}
              placeholder="e.g. Primary Edge Node"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={isViewOnly}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={isViewOnly}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              disabled={isViewOnly}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Throughput / Metric Value (%) ({formData.value}%)
            </label>
            <input
              type="range"
              name="value"
              min="0"
              max="100"
              step="0.5"
              value={formData.value}
              onChange={handleChange}
              disabled={isViewOnly}
              className="w-full accent-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Temperature (°C) ({formData.temperature}°C)
            </label>
            <input
              type="range"
              name="temperature"
              min="20"
              max="95"
              step="0.5"
              value={formData.temperature}
              onChange={handleChange}
              disabled={isViewOnly}
              className="w-full accent-amber-500"
            />
          </div>
        </div>

        {/* Alert Configuration */}
        <div className="p-3.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50/50 dark:bg-dark-surface/50 space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isAlertTriggered"
              name="isAlertTriggered"
              checked={formData.isAlertTriggered}
              onChange={handleChange}
              disabled={isViewOnly}
              className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
            />
            <label
              htmlFor="isAlertTriggered"
              className="text-xs font-bold text-gray-900 dark:text-white select-none cursor-pointer"
            >
              Trigger System Alert / Anomaly
            </label>
          </div>

          {formData.isAlertTriggered && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Severity
                </label>
                <select
                  name="alertSeverity"
                  value={formData.alertSeverity}
                  onChange={handleChange}
                  disabled={isViewOnly}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg text-xs"
                >
                  {severities.map((sev) => (
                    <option key={sev} value={sev}>{sev.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Alert Message
                </label>
                <input
                  type="text"
                  name="alertMessage"
                  value={formData.alertMessage}
                  onChange={handleChange}
                  disabled={isViewOnly}
                  placeholder="e.g. Critical temperature exceeded"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg text-xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100 dark:border-dark-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-gray-100 dark:bg-dark-surface text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-border transition-colors"
          >
            {isViewOnly ? 'Close' : 'Cancel'}
          </button>
          {!isViewOnly && (
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-md disabled:opacity-50 transition-all"
            >
              {loading ? 'Saving...' : initialData ? 'Save Changes' : 'Create Telemetry'}
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default TelemetryModal;
