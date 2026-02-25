import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Auth API — WebAuthn Only (passwordless)
export const authAPI = {
  getRegisterOptions: (email) =>
    api.post("/auth/webauthn/register/options", { email }),
  verifyRegister: (data) => api.post("/auth/webauthn/register/verify", data),
  getLoginOptions: (email) =>
    api.post("/auth/webauthn/login/options", { email }),
  verifyLogin: (data) => api.post("/auth/webauthn/login/verify", data),
};

// User API
export const userAPI = {
  getProfile: () => api.get("/user/me"),
  updateProfile: (data) => api.put("/user/me", data),
  getCredentials: () => api.get("/user/credentials"),
  deleteCredential: (credentialID) =>
    api.delete(`/user/credentials/${encodeURIComponent(credentialID)}`),
  updateNickname: (credentialID, nickname) =>
    api.put(`/user/credentials/${encodeURIComponent(credentialID)}/nickname`, {
      nickname,
    }),
  addDeviceOptions: () => api.post("/user/credentials/add-options"),
  addDeviceVerify: (data) => api.post("/user/credentials/add-verify", data),
};

// Stats API
export const statsAPI = {
  getStats: (viewMode = "global") =>
    api.get(`/stats/${viewMode === "global" ? "global-stats" : "my-stats"}`),
};

// Security API
export const securityAPI = {
  getAnalysis: (viewMode = "global") =>
    api.get(`/stats/security-analysis?viewMode=${viewMode}`),
  runSimulation: (method) => api.post("/security/simulate", { method }),
};

// UX API
export const uxAPI = {
  getUXData: (viewMode = "global") =>
    api.get(`/stats/ux-research?viewMode=${viewMode}`),
  submitFeedback: (data) => api.post("/ux/feedback", data),
  submitSUSSurvey: (data) => api.post("/ux/sus-survey", data),
  submitCognitiveLoad: (data) => api.post("/ux/cognitive-load", data),
  submitTaskCompletion: (data) => api.post("/ux/task-completion", data),
  submitDemographics: (data) => api.post("/ux/demographics", data),
  createSession: (data) => api.post("/ux/session", data),
  exportCSV: () => api.get("/ux/export-csv", { responseType: "blob" }),
};

// Recovery API
export const recoveryAPI = {
  generateCodes: () => api.post("/recovery/generate-codes"),
  verifyCode: (data) => api.post("/recovery/verify-code", data),
  reRegister: (data) => api.post("/recovery/re-register", data),
  getReRegisterOptions: (email) =>
    api.post("/recovery/re-register-options", { email }),
};

// Performance API
export const performanceAPI = {
  getSummary: () => api.get("/performance/summary"),
  getComparison: () => api.get("/performance/comparison"),
};

export default api;
