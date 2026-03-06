import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { isAuthenticated } from '../utils/auth';

/**
 * Layout pembungkus utama untuk sisi pengguna (warga).
 * Mengatur tampilan Sidebar untuk desktop dan BottomNav untuk mobile.
 */
const NavLayout = ({ children }) => {
  const location = useLocation();

  // Daftar rute di mana navigasi (Sidebar/BottomNav) tidak ditampilkan
  // Ditambah kondisi: sembunyikan di /panduan jika user belum login (untuk bantuan login)
  const hideNav = ['/', '/login', '/register', '/recovery'].includes(location.pathname) || 
                  location.pathname.startsWith('/admin') ||
                  (location.pathname === '/panduan' && !isAuthenticated());

  // Jika rute ada di daftar sembunyi, tampilkan konten tanpa navigasi
  if (hideNav) {
    return <div className="min-h-screen bg-[var(--bg)]">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Struktur Layout Desktop */}
      <div className="hidden md:flex">
        <Sidebar />
        <main className="flex-1 ml-64 min-h-screen relative overflow-hidden">
          {/* Elemen Dekoratif Latar Belakang (Desktop) */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] -mr-64 -mt-64" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] -ml-32 -mb-32" />
          
          {/* Konten Halaman */}
          <div className="relative max-w-6xl mx-auto p-8 lg:p-12">
            {children}
          </div>
        </main>
      </div>

      {/* Struktur Layout Mobile */}
      <div className="md:hidden">
        <main className="min-h-screen pb-24">
          {children}
        </main>
        {/* Navigasi Bawah khusus Mobile */}
        <BottomNav />
      </div>
    </div>
  );
};

export default NavLayout;
