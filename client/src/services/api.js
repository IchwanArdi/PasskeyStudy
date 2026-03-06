import axios from "axios";

// Ambil URL API dari environment variable atau pakai default localhost
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// INTERCEPTOR REQUEST: Otomatis nempelin token JWT ke setiap request yang dikirim ke server
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

// INTERCEPTOR RESPONSE: Kalau server bilang token gak valid (401), otomatis logout dan tendang ke halaman login
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

// API AUTENTIKASI: Khusus WebAuthn (Login & Daftar tanpa password)
export const authAPI = {
  getRegisterOptions: (email, username) =>
    api.post("/auth/webauthn/register/options", { email, username }),
  verifyRegister: (data) => api.post("/auth/webauthn/register/verify", data),
  getLoginOptions: (identifier) =>
    api.post("/auth/webauthn/login/options", { identifier }),
  verifyLogin: (data) => api.post("/auth/webauthn/login/verify", data),
};

// API USER: Kelola profil dan perangkat biometrik (Passkey)
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

// API RECOVERY: Untuk urusan kode pemulihan kalau HP/sidik jari bermasalah
export const recoveryAPI = {
  generateCodes: () => api.post("/recovery/generate-codes"),
  verifyCode: (data) => api.post("/recovery/verify-code", data),
  reRegister: (data) => api.post("/recovery/re-register", data),
  getReRegisterOptions: (email) =>
    api.post("/recovery/re-register-options", { email }),
};

// API PENGAJUAN SURAT: Urusan buat baru, liat riwayat, dan download PDF
export const pengajuanAPI = {
  createPengajuan: (data) => api.post("/pengajuan", data),
  getMyPengajuan: () => api.get("/pengajuan/saya"),
  downloadPDF: (id) => api.get(`/pengajuan/${id}/pdf`, { responseType: 'blob' }),
  deletePengajuan: (id) => api.delete(`/pengajuan/${id}`),
};

export default api;
