// ROUTER UTAMA: Memetakan hierarki navigasi (URL ke Komponen Spesifik) untuk seluruh aplikasi React
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { isAuthenticated } from './utils/auth';

import NavLayout from './components/NavLayout';
import ScrollToTop from './components/ScrollToTop';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Recovery from './pages/auth/Recovery';
import Onboarding from './pages/auth/Onboarding';
import InstallAppBanner from './components/InstallAppBanner';

// Warga pages
import Dashboard from './pages/user/Dashboard';
import Profile from './pages/user/Profile';
import ManageDevices from './pages/user/ManageDevices';
import Layanan from './pages/user/Layanan';
import FormPengajuan from './pages/user/FormPengajuan';
import RiwayatPengajuan from './pages/user/RiwayatPengajuan';
import PanduanWarga from './pages/user/PanduanWarga';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminPengajuan from './pages/admin/Pengajuan.jsx';
import AdminProfile from './pages/admin/Profile.jsx';
import AdminUsers from './pages/admin/ManageUsers.jsx';
import AdminNavLayout from './components/AdminNavLayout.jsx';

import './App.css';

// GUARD ROUTE ADMIN: Mengecek lapis dua; selain harus login, role user di localStorage harus persis 'admin'
const AdminRoute = ({ children }) => {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  // Inisialisasi tema dari localStorage saat app pertama kali dimuat.
  // Hook useTheme() dipakai di komponen individual untuk toggle.
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const html = document.documentElement;
    if (savedTheme === 'light') {
      html.classList.add('light');
      html.classList.remove('dark');
    } else {
      html.classList.remove('light');
      html.classList.add('dark');
    }
  }, []);

  return (
    <Router>
      <div className="App">
        <InstallAppBanner />
        <ScrollToTop />
        {/* BUNDEL ROUTING: Daftar pemetaan URL (path) ke Komponen UI (element). Dikelompokkan per Role. */}
        <Routes>
          {/* Onboarding — halaman awal (skip jika sudah login) */}
          <Route path="/" element={
            isAuthenticated()
              ? <Navigate to="/dashboard" replace />
              : <Onboarding />
          } />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/recovery" element={<Recovery />} />

          {/* Warga - Wrapped in NavLayout */}
          <Route element={<NavLayout><Dashboard /></NavLayout>} path="/dashboard" />
          <Route element={<NavLayout><Profile /></NavLayout>} path="/profile" />
          <Route element={<NavLayout><ManageDevices /></NavLayout>} path="/manage-devices" />
          <Route element={<NavLayout><Layanan /></NavLayout>} path="/layanan" />
          <Route element={<NavLayout><FormPengajuan /></NavLayout>} path="/layanan/ajukan" />
          <Route element={<NavLayout><RiwayatPengajuan /></NavLayout>} path="/riwayat" />
          <Route element={<NavLayout><PanduanWarga /></NavLayout>} path="/panduan" />

          {/* Admin */}
          <Route path="/admin" element={<AdminRoute><AdminNavLayout><AdminDashboard /></AdminNavLayout></AdminRoute>} />
          <Route path="/admin/pengajuan" element={<AdminRoute><AdminNavLayout><AdminPengajuan /></AdminNavLayout></AdminRoute>} />
          <Route path="/admin/profile" element={<AdminRoute><AdminNavLayout><AdminProfile /></AdminNavLayout></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminNavLayout><AdminUsers /></AdminNavLayout></AdminRoute>} />
          <Route path="/admin/manage-devices" element={<AdminRoute><AdminNavLayout><ManageDevices /></AdminNavLayout></AdminRoute>} />
          <Route path="/admin/panduan" element={<AdminRoute><AdminNavLayout><PanduanWarga /></AdminNavLayout></AdminRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>


        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          toastClassName="!rounded-xl !text-sm"
        />
      </div>
    </Router>
  );
}

export default App;
