import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { isAuthenticated } from './utils/auth';

import BottomNav from './components/BottomNav';
import NavLayout from './components/NavLayout';
import ScrollToTop from './components/ScrollToTop';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Recovery from './pages/auth/Recovery';
import Onboarding from './pages/auth/Onboarding';
import Help from './pages/Help';
import InstallAppBanner from './components/InstallAppBanner';

// Warga pages
import Dashboard from './pages/user/Dashboard';
import Profile from './pages/user/Profile';
import ManageDevices from './pages/user/ManageDevices';
import Layanan from './pages/user/Layanan';
import FormPengajuan from './pages/user/FormPengajuan';
import FormPengaduan from './pages/user/FormPengaduan';
import RiwayatPengajuan from './pages/user/RiwayatPengajuan';
import RiwayatPengaduan from './pages/user/RiwayatPengaduan';
import Pengumuman from './pages/user/Pengumuman';
import DetailPengumuman from './pages/user/DetailPengumuman';
import PanduanWarga from './pages/user/PanduanWarga';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminPengajuan from './pages/admin/Pengajuan.jsx';
import AdminPengumuman from './pages/admin/Pengumuman.jsx';
import AdminPengaduan from './pages/admin/Pengaduan.jsx';
import AdminProfile from './pages/admin/Profile.jsx';
import AdminUsers from './pages/admin/ManageUsers.jsx';
import AdminNavLayout from './components/AdminNavLayout.jsx';

import './App.css';

// Guard: wajib login
const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

// Guard: wajib login + role admin
const AdminRoute = ({ children }) => {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  // Initialize theme from localStorage on app startup
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <Router>
      <div className="App">
        <InstallAppBanner />
        <ScrollToTop />
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
          <Route path="/help" element={<Help />} />

          {/* Warga & Pengumuman - Wrapped in NavLayout */}
          <Route element={<NavLayout><Dashboard /></NavLayout>} path="/dashboard" />
          <Route element={<NavLayout><Profile /></NavLayout>} path="/profile" />
          <Route element={<NavLayout><ManageDevices /></NavLayout>} path="/manage-devices" />
          <Route element={<NavLayout><Layanan /></NavLayout>} path="/layanan" />
          <Route element={<NavLayout><FormPengajuan /></NavLayout>} path="/layanan/ajukan" />
          <Route element={<NavLayout><FormPengaduan /></NavLayout>} path="/pengaduan/ajukan" />
          <Route element={<NavLayout><RiwayatPengaduan /></NavLayout>} path="/pengaduan/riwayat" />
          <Route element={<NavLayout><RiwayatPengajuan /></NavLayout>} path="/riwayat" />
          <Route element={<NavLayout><Pengumuman /></NavLayout>} path="/pengumuman" />
          <Route element={<NavLayout><DetailPengumuman /></NavLayout>} path="/pengumuman/:id" />
          <Route element={<NavLayout><PanduanWarga /></NavLayout>} path="/panduan" />

          {/* Admin */}
          <Route path="/admin" element={<AdminRoute><AdminNavLayout><AdminDashboard /></AdminNavLayout></AdminRoute>} />
          <Route path="/admin/pengajuan" element={<AdminRoute><AdminNavLayout><AdminPengajuan /></AdminNavLayout></AdminRoute>} />
          <Route path="/admin/pengaduan" element={<AdminRoute><AdminNavLayout><AdminPengaduan /></AdminNavLayout></AdminRoute>} />
          <Route path="/admin/pengumuman" element={<AdminRoute><AdminNavLayout><AdminPengumuman /></AdminNavLayout></AdminRoute>} />
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
