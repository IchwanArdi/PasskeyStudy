import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  // Password authentication
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),

  // WebAuthn authentication
  getRegisterOptions: (email) => api.post('/auth/webauthn/register/options', { email }),
  verifyRegister: (data) => api.post('/auth/webauthn/register/verify', data),
  getLoginOptions: (email) => api.post('/auth/webauthn/login/options', { email }),
  verifyLogin: (data) => api.post('/auth/webauthn/login/verify', data),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/user/me'),
  updateProfile: (data) => api.put('/user/me', data),
  getCredentials: () => api.get('/user/credentials'),
};

// Stats API
export const statsAPI = {
  getMyStats: () => api.get('/stats/my-stats'),
  getGlobalStats: () => api.get('/stats/global-stats'),
};

// Security API
export const securityAPI = {
  bruteForceSimulation: (data) => api.post('/security/brute-force-simulation', data),
  getPhishingResistance: () => api.get('/security/phishing-resistance'),
  getVulnerabilityAssessment: () => api.get('/security/vulnerability-assessment'),
  getAttackSurface: () => api.get('/security/attack-surface'),
  getSecurityScore: () => api.get('/security/security-score'),
};

// UX API
export const uxAPI = {
  submitSUSSurvey: (data) => api.post('/ux/sus-survey', data),
  getSUSResults: () => api.get('/ux/sus-results'),
  submitCognitiveLoad: (data) => api.post('/ux/cognitive-load', data),
  getCognitiveLoadResults: () => api.get('/ux/cognitive-load-results'),
  submitTaskCompletion: (data) => api.post('/ux/task-completion', data),
  getTaskCompletionResults: () => api.get('/ux/task-completion-results'),
};

// Cost API
export const costAPI = {
  getImplementationCost: () => api.get('/cost/implementation'),
  getOperationalCost: () => api.get('/cost/operational'),
  getROI: () => api.get('/cost/roi'),
  getCostComparison: () => api.get('/cost/comparison'),
};

// Compatibility API
export const compatibilityAPI = {
  getBrowserMatrix: () => api.get('/compatibility/browser-matrix'),
  getDeviceSupport: () => api.get('/compatibility/device-support'),
  getAccessibility: () => api.get('/compatibility/accessibility'),
};

export default api;
