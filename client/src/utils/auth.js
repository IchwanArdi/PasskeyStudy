import axios from 'axios';

// Ambil URL API dari environment variable atau pakai default localhost
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// INTERCEPTOR REQUEST: Otomatis nempelin token JWT ke setiap request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// INTERCEPTOR RESPONSE: Logout otomatis jika token tidak valid (401)
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Jangan redirect jika error 401 datang dari request cek kode pemulihan
    const isRecoveryRequest = error.config?.url?.includes('/recovery/verify-code');

    if (error.response?.status === 401 && !isRecoveryRequest) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
export const setAuth = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

// Hapus data login (Logout)
export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Cek apakah user sudah masuk/login atau belum (cukup liat ada token atau gak)
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

