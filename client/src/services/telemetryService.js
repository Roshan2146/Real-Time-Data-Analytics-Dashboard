import api from './api';

export const telemetryService = {
  // Get paginated and filtered telemetry records
  getTelemetryList: async (params = {}) => {
    const response = await api.get('/telemetry', { params });
    return response.data;
  },

  // Get telemetry record by ID
  getTelemetryById: async (id) => {
    const response = await api.get(`/telemetry/${id}`);
    return response.data;
  },

  // Create telemetry record (Admin only)
  createTelemetry: async (data) => {
    const response = await api.post('/telemetry', data);
    return response.data;
  },

  // Update telemetry record (Admin only)
  updateTelemetry: async (id, data) => {
    const response = await api.put(`/telemetry/${id}`, data);
    return response.data;
  },

  // Delete telemetry record (Admin only)
  deleteTelemetry: async (id) => {
    const response = await api.delete(`/telemetry/${id}`);
    return response.data;
  },

  // Get summary of all devices
  getDevices: async () => {
    const response = await api.get('/telemetry/devices');
    return response.data;
  },
};
