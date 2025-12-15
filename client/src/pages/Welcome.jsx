import { useNavigate, Link } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';
import { Search, Github } from 'lucide-react';

const Welcome = () => {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header - Like fydemy/ui */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-sm border-b border-gray-800 animate-slideDown">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-white font-semibold text-sm hover:text-gray-300 transition-colors">
              WebAuthn Research
            </Link>
            <Link to="/docs" className="text-gray-400 hover:text-white transition-colors hidden md:block text-sm">
              Dokumentasi
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-gray-900 border border-gray-800 rounded-lg text-xs text-gray-400 hover:border-gray-700 transition-all cursor-pointer">
              <Search className="w-3.5 h-3.5" />
              <span>Cari</span>
              <span className="ml-1.5 px-1 py-0.5 bg-gray-800 rounded text-xs">Ctrl K</span>
            </div>
            <a href="#" className="text-gray-400 hover:text-white p-1.5 hover:bg-gray-800 rounded-lg transition-all" aria-label="GitHub">
              <Github className="w-5 h-5" />
            </a>
            {authenticated ? (
              <button onClick={() => navigate('/dashboard')} className="px-3 py-1.5 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-200 transition-all shadow-lg hover:shadow-xl">
                Dashboard
              </button>
            ) : (
              <>
                <Link to="/login" className="text-gray-400 hover:text-white transition-colors hidden md:block text-sm">
                  Masuk
                </Link>
                <Link to="/register" className="px-3 py-1.5 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-200 transition-all shadow-lg hover:shadow-xl">
                  Mulai
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section - Like fydemy/ui */}
      <section id="home" className="min-h-screen flex items-center justify-center px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent animate-fadeInUp">WebAuthn Research</h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-3 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            Sistem autentikasi passwordless
          </p>
          <p className="text-base text-gray-500 mb-10 max-w-2xl mx-auto animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
            Dibangun untuk keamanan modern dan pengalaman pengguna yang lebih baik. Bandingkan WebAuthn/FIDO2 dengan autentikasi password tradisional.
          </p>
          <div className="flex gap-4 justify-center flex-wrap animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
            {!authenticated ? (
              <>
                <button
                  onClick={() => navigate('/register')}
                  className="px-5 py-2.5 bg-white text-black rounded-lg font-semibold text-sm hover:bg-gray-200 transition-all transform duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1"
                >
                  Mulai
                </button>
                <Link to="/docs" className="px-5 py-2.5 bg-transparent border-2 border-gray-700 text-white rounded-lg font-semibold text-sm hover:border-gray-600 transition-all transform duration-300 hover:bg-gray-800/50">
                  Dokumentasi
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-5 py-2.5 bg-white text-black rounded-lg font-semibold text-sm hover:bg-gray-200 transition-all transform duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1"
                >
                  Masuk Dashboard
                </button>
                <Link to="/docs" className="px-5 py-2.5 bg-transparent border-2 border-gray-700 text-white rounded-lg font-semibold text-sm hover:border-gray-600 transition-all transform duration-300 hover:bg-gray-800/50">
                  Dokumentasi
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out both;
        }

        .animate-slideDown {
          animation: slideDown 0.5s ease-out both;
        }
      `}</style>
    </div>
  );
};

export default Welcome;
