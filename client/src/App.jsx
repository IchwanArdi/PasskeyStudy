import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import RiwayatPengajuan from './pages/user/RiwayatPengajuan';
import Pengumuman from './pages/user/Pengumuman';
import DetailPengumuman from './pages/user/DetailPengumuman';
import PanduanWarga from './pages/user/PanduanWarga';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminPengajuan from './pages/admin/Pengajuan.jsx'; // Keeping .jsx for now if it was there, but usually Vite handles it. 
import AdminPengumuman from './pages/admin/Pengumuman.jsx';

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
          <Route element={<NavLayout><RiwayatPengajuan /></NavLayout>} path="/riwayat" />
          <Route element={<NavLayout><Pengumuman /></NavLayout>} path="/pengumuman" />
          <Route element={<NavLayout><DetailPengumuman /></NavLayout>} path="/pengumuman/:id" />
          <Route element={<NavLayout><PanduanWarga /></NavLayout>} path="/panduan" />

          {/* Admin */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/pengajuan" element={<AdminRoute><AdminPengajuan /></AdminRoute>} />
          <Route path="/admin/pengumuman" element={<AdminRoute><AdminPengumuman /></AdminRoute>} />

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
