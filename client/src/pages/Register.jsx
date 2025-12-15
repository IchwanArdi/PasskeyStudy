import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PasswordAuth from '../components/PasswordAuth';
import WebAuthnAuth from '../components/WebAuthnAuth';
import { toast } from 'react-toastify';
import { Search, Github } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('password');

  const handleSuccess = (data) => {
    toast.success(`Registration successful! Duration: ${data.duration || 0}ms`);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-sm border-b border-gray-800">
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
            <Link to="/login" className="text-gray-400 hover:text-white transition-colors hidden md:block text-sm">
              Masuk
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center px-6 pt-20 pb-12 relative z-10">
        <div className="w-full max-w-md">
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-8 shadow-2xl">
            <h1 className="text-3xl font-bold mb-2 text-center">Daftar</h1>
            <p className="text-center text-gray-400 mb-8 text-sm">Pilih metode autentikasi - Anda bisa mendaftar langsung dengan salah satu metode</p>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-800">
              <button
                className={`flex-1 py-3 px-4 text-center font-medium transition-colors border-b-2 ${activeTab === 'password' ? 'text-white border-white' : 'text-gray-400 border-transparent hover:text-gray-300'}`}
                onClick={() => setActiveTab('password')}
              >
                Password
              </button>
              <button
                className={`flex-1 py-3 px-4 text-center font-medium transition-colors border-b-2 ${activeTab === 'webauthn' ? 'text-white border-white' : 'text-gray-400 border-transparent hover:text-gray-300'}`}
                onClick={() => setActiveTab('webauthn')}
              >
                WebAuthn / FIDO2
              </button>
            </div>

            {/* Auth Content */}
            <div className="mb-6">{activeTab === 'password' ? <PasswordAuth mode="register" onSuccess={handleSuccess} /> : <WebAuthnAuth mode="register" onSuccess={handleSuccess} />}</div>

            {/* Footer */}
            <p className="text-center text-sm text-gray-400">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-white hover:text-gray-300 transition-colors font-medium">
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
