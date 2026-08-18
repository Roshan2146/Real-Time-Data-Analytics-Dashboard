import api from './api';

export const analyticsService = {
  // Get KPI analytics summary
  getSummary: async () => {
    const response = await api.get('/analytics/summary');
    return response.data;
  },

  // Get time-series trends
  getTrends: async (params = {}) => {
    const response = await api.get('/analytics/trends', { params });
    return response.data;
  },

  // Get category breakdown
  getCategories: async () => {
    const response = await api.get('/analytics/categories');
    return response.data;
  },

  // Get device comparison analytics
  getDevicesAnalytics: async () => {
    const response = await api.get('/analytics/devices');
    return response.data;
  },
};
