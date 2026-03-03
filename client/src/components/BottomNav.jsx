import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, Bell, User } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Beranda' },
  { to: '/layanan', icon: FileText, label: 'Layanan' },
  { to: '/pengumuman', icon: Bell, label: 'Pengumuman' },
  { to: '/profile', icon: User, label: 'Profil' },
];

const BottomNav = () => {
  const location = useLocation();

  // Jangan tampilkan di halaman onboarding, login, register, recovery, admin
  const hide = ['/', '/login', '/register', '/recovery', '/admin', '/admin/pengajuan', '/admin/pengumuman'];
  if (hide.some((p) => location.pathname === p || location.pathname.startsWith('/admin'))) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg)]/90 backdrop-blur-xl border-t border-white/[0.06] safe-area-inset-bottom">
      <div className="flex items-stretch max-w-lg mx-auto">
        {navItems.map(({ to, icon: NavIcon, label }) => {
          const isActive = location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-all ${
                isActive ? 'text-emerald-400' : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              <NavIcon className={`w-5 h-5 ${isActive ? 'stroke-emerald-400' : ''}`} />
              <span className={`text-[10px] font-semibold ${isActive ? 'text-emerald-400' : ''}`}>{label}</span>
              {isActive && (
                <span className="absolute bottom-0 h-0.5 w-8 bg-emerald-400 rounded-full" style={{ marginBottom: '0px' }} />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
