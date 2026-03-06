import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, User } from 'lucide-react';

// Item navigasi untuk bilah bawah warga (tampilan mobile)
const navItems = [
  { to: '/dashboard', icon: Home, label: 'Beranda' },
  { to: '/layanan', icon: FileText, label: 'Layanan' },
  { to: '/profile', icon: User, label: 'Profil' },
];

const BottomNav = () => {
  const location = useLocation();

  // Daftar rute di mana navigasi bawah harus disembunyikan (misal: halaman awal, login, admin)
  const hide = ['/', '/login', '/register', '/recovery', '/admin', '/admin/pengajuan'];
  
  // Sembunyikan jika rute saat ini ada di daftar 'hide' atau berada di area admin
  if (hide.some((p) => location.pathname === p || location.pathname.startsWith('/admin'))) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg)]/80 backdrop-blur-2xl border-t border-[var(--card-border)] pb-safe pt-1">
      <div className="flex items-stretch max-w-lg mx-auto px-2">
        {navItems.map(({ to, icon: Icon, label }) => {
          // Cek apakah menu saat ini sedang aktif
          const isActive = location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to));
          
          return (
            <Link
              key={to}
              to={to}
              className={`flex-1 flex flex-col items-center justify-center py-2 md:py-3 gap-1.5 transition-all relative ${
                isActive ? 'text-emerald-400' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {/* Icon menu dengan latar lingkaran saat aktif */}
              <div className={`relative p-1.5 rounded-xl transition-all ${isActive ? 'bg-emerald-400/10' : ''}`}>
                <Icon className={`w-5 h-5 md:w-6 md:h-6 ${isActive ? 'stroke-emerald-400' : ''}`} />
              </div>
              
              {/* Teks label menu */}
              <span className={`text-[10px] font-bold tracking-wide ${isActive ? 'text-emerald-400' : ''}`}>{label}</span>
              
              {/* Indikator titik kecil di atas menu yang aktif */}
              {isActive && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 h-1 w-1 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
