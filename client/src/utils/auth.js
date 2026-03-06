// Fungsi untuk simpan data login (token & info user) ke browser
export const setAuth = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

// Ambil data login yang tersimpan di browser
export const getAuth = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return {
    token,
    user: user ? JSON.parse(user) : null,
  };
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

