import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, Bell, Users, User } from 'lucide-react';

const navItems = [
  { to: '/admin', icon: Home, label: 'Beranda' },
  { to: '/admin/pengajuan', icon: FileText, label: 'Pengajuan' },
  { to: '/admin/pengumuman', icon: Bell, label: 'Pengumuman' },
  { to: '/admin/users', icon: Users, label: 'Warga' },
  { to: '/admin/profile', icon: User, label: 'Profil' },
];

const AdminBottomNav = () => {
  const location = useLocation();

  // Hanya tampilkan jika berada di rute /admin
  if (!location.pathname.startsWith('/admin')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg)]/80 backdrop-blur-2xl border-t border-[var(--card-border)] pb-safe pt-1">
      <div className="flex items-stretch max-w-lg mx-auto px-2">
        {navItems.map(({ to, icon: NavIcon, label }) => {
          const isActive = location.pathname === to || (to !== '/admin' && location.pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              className={`flex-1 flex flex-col items-center justify-center py-2 md:py-3 gap-1.5 transition-all relative ${
                isActive ? 'text-red-400' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <div className={`relative p-1.5 rounded-xl transition-all ${isActive ? 'bg-red-400/10' : ''}`}>
                <NavIcon className={`w-5 h-5 md:w-6 md:h-6 ${isActive ? 'stroke-red-400' : ''}`} />
              </div>
              <span className={`text-[9px] sm:text-[10px] font-bold tracking-wide ${isActive ? 'text-red-400' : ''}`}>{label}</span>
              {isActive && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 h-1 w-1 bg-red-400 rounded-full shadow-[0_0_8px_rgba(248,113,113,0.8)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default AdminBottomNav;
