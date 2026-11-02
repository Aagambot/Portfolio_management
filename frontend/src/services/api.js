import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto-inject JWT token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token if expired or invalid
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
    }
    return Promise.reject(error);
  }
);

// Currency and metric formatters
export const formatINR = (value) => {
  if (value === undefined || value === null || isNaN(value)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatPercent = (value) => {
  if (value === undefined || value === null || isNaN(value)) return '0.00%';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

// API Services
export const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

export const portfolioService = {
  list: async () => {
    const res = await api.get('/portfolios');
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/portfolios', data);
    return res.data;
  },
  get: async (id) => {
    const res = await api.get(`/portfolios/${id}`);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/portfolios/${id}`);
    return res.data;
  },
  downloadSampleCsv: () => {
    window.open('/api/v1/portfolios/sample-csv', '_blank');
  },
  previewCsv: async (portfolioId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post(`/portfolios/${portfolioId}/preview-csv`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  importCsv: async (portfolioId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post(`/portfolios/${portfolioId}/import-csv`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};

export const holdingsService = {
  getHoldings: async (portfolioId) => {
    const res = await api.get(`/portfolios/${portfolioId}/holdings`);
    return res.data;
  },
  getSummary: async (portfolioId) => {
    const res = await api.get(`/portfolios/${portfolioId}/summary`);
    return res.data;
  },
  getAllocations: async (portfolioId) => {
    const res = await api.get(`/portfolios/${portfolioId}/allocations`);
    return res.data;
  },
  getPerformance: async (portfolioId) => {
    const res = await api.get(`/portfolios/${portfolioId}/performance`);
    return res.data;
  },
  getRiskMetrics: async (portfolioId) => {
    const res = await api.get(`/portfolios/${portfolioId}/risk-metrics`);
    return res.data;
  },
};

export const transactionService = {
  list: async (portfolioId) => {
    const res = await api.get(`/portfolios/${portfolioId}/transactions`);
    return res.data;
  },
  create: async (portfolioId, txData) => {
    const res = await api.post(`/portfolios/${portfolioId}/transactions`, txData);
    return res.data;
  },
  delete: async (txId) => {
    const res = await api.delete(`/transactions/${txId}`);
    return res.data;
  },
};

export const adminService = {
  getStats: async () => {
    const res = await api.get('/admin/stats');
    return res.data;
  },
};

export default api;
