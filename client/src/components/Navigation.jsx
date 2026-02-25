import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { isAuthenticated, clearAuth } from '../utils/auth';
import { toast } from 'react-toastify';
import { Shield, Menu, X, LogOut, User, BarChart3, BookOpen, Key } from 'lucide-react';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const authenticated = isAuthenticated();

  const handleLogout = () => {
    clearAuth();
    toast.info('Sesi berakhir. Anda telah keluar.');
    navigate('/login');
    setIsMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  if (!authenticated || location.pathname === '/docs' || location.pathname === '/dashboard') return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-[60] bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="text-white font-bold text-sm tracking-tight flex items-center gap-2.5">
            <div className="w-7 h-7 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <span className="hidden sm:inline">WebAuthn Research</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/dashboard"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/dashboard') ? 'text-blue-400 bg-blue-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              Dashboard
            </Link>
            <Link
              to="/docs"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/docs') ? 'text-blue-400 bg-blue-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              Dokumentasi
            </Link>
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/profile"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/profile') ? 'text-blue-400 bg-blue-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <User className="w-4 h-4" />
            Profil
          </Link>
          <Link
            to="/manage-devices"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/manage-devices') ? 'text-blue-400 bg-blue-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Key className="w-4 h-4" />
            Perangkat
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/[0.06]">
          <div className="px-6 py-6 space-y-2">
            <Link
              to="/dashboard"
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/dashboard') ? 'text-blue-400 bg-blue-500/10' : 'text-gray-400 hover:bg-white/5'}`}
            >
              <BarChart3 className="w-5 h-5" />
              Dashboard
            </Link>
            <Link
              to="/profile"
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/profile') ? 'text-blue-400 bg-blue-500/10' : 'text-gray-400 hover:bg-white/5'}`}
            >
              <User className="w-5 h-5" />
              Profil
            </Link>
            <Link
              to="/docs"
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/docs') ? 'text-blue-400 bg-blue-500/10' : 'text-gray-400 hover:bg-white/5'}`}
            >
              <BookOpen className="w-5 h-5" />
              Dokumentasi
            </Link>
            <Link
              to="/manage-devices"
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/manage-devices') ? 'text-blue-400 bg-blue-500/10' : 'text-gray-400 hover:bg-white/5'}`}
            >
              <Key className="w-5 h-5" />
              Kelola Perangkat
            </Link>
            <div className="pt-4 border-t border-white/[0.06]">
              <button
                onClick={handleLogout}
                className="w-full py-3 bg-red-500/10 text-red-400 rounded-xl font-semibold text-sm hover:bg-red-500/15 transition-all flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Keluar dari Sesi
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
