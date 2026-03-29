import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, User } from 'lucide-react';

// Item navigasi untuk bilah bawah warga (tampilan mobile)
const navItems = [
  { to: '/dashboard', icon: Home, label: 'Beranda' },
  { to: '/layanan', icon: FileText, label: 'Layanan' },
  { to: '/profile', icon: User, label: 'Profil' },
];

const UserBottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg)]/80 backdrop-blur-2xl border-t border-[var(--card-border)] pb-safe pt-1">
      <div className="flex items-stretch max-w-lg mx-auto px-2">
        {navItems.map(({ to, icon: Icon, label }) => {
          // Logika penentuan apakah menu sedang aktif
          const isActive = location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to));
          
          return (
            <Link
              key={to}
              to={to}
              className={`flex-1 flex flex-col items-center justify-center py-2 md:py-3 gap-1.5 transition-all relative ${
                isActive ? 'text-emerald-400' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {/* Icon menu dengan latar belakang subtil saat aktif */}
              <div className={`relative p-1.5 rounded-xl transition-all ${isActive ? 'bg-emerald-400/10' : ''}`}>
                <Icon className={`w-5 h-5 md:w-6 md:h-6 ${isActive ? 'stroke-emerald-400' : ''}`} />
              </div>
              
              {/* Label menu */}
              <span className={`text-[9px] sm:text-[10px] font-bold tracking-wide ${isActive ? 'text-emerald-400' : ''}`}>{label}</span>
              
              {/* Indikator titik di bagian atas saat menu dipilih */}
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

export default UserBottomNav;
