import { Link, useLocation, useNavigate } from 'react-router-dom';
import { isAuthenticated, clearAuth } from '../utils/auth';
import { toast } from 'react-toastify';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const authenticated = isAuthenticated();

  const handleLogout = () => {
    clearAuth();
    toast.info('Logged out successfully');
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  // Navigation untuk user yang sudah login (hanya Dashboard dan Profile)
  if (authenticated) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="text-white font-semibold hover:text-gray-300 transition-colors">
              WebAuthn Research
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/dashboard" className={`text-gray-400 hover:text-white transition-colors ${isActive('/dashboard') ? 'text-white' : ''}`}>
              Dashboard
            </Link>
            <Link to="/profile" className={`text-gray-400 hover:text-white transition-colors ${isActive('/profile') ? 'text-white' : ''}`}>
              Profile
            </Link>
            <button onClick={handleLogout} className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors">
              Logout
            </button>
          </div>
        </div>
      </nav>
    );
  }

  // Navigation untuk user yang belum login (Welcome page)
  return null; // Navigation sudah ada di Welcome page
};

export default Navigation;
