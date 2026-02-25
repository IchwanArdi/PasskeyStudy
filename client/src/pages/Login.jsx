
import { useNavigate, Link } from 'react-router-dom';
import WebAuthnAuth from '../components/WebAuthnAuth';
import { toast } from 'react-toastify';
import { Shield, Github, Fingerprint, Search } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    toast.success('Autentikasi berhasil. Mengarahkan ke dashboard...');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/20 font-sans relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 grid-bg mask-radial opacity-20" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.08] bg-black/50 backdrop-blur-md">
        <div className="max-w-[1440px] mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-white font-bold tracking-tighter flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span>WebAuthn Research</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/docs" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Docs</Link>
              <Link to="/about" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">About</Link>
              <a href="https://github.com/IchwanArdi/PasskeyStudy" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">GitHub</a>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/register" className="bg-white text-black px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-gray-200 transition-colors">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 pt-16">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4">Welcome Back</h1>
            <p className="text-gray-400 text-sm">Sign in using your biometric identity</p>
          </div>

          <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-sm">
            <div className="flex items-center gap-3 p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl mb-8">
              <Shield className="w-5 h-5 text-gray-400 shrink-0" />
              <p className="text-xs text-gray-500 leading-relaxed">
                This system uses <span className="text-white font-semibold">WebAuthn / FIDO2</span>. No passwords are ever sent or stored.
              </p>
            </div>

            <WebAuthnAuth mode="login" onSuccess={handleSuccess} />

            <div className="mt-10 pt-6 border-t border-white/[0.08] space-y-4 text-center">
              <p className="text-sm text-gray-500">
                Don't have an account?{' '}
                <Link to="/register" className="text-white hover:underline transition-colors font-semibold">
                  Sign Up
                </Link>
              </p>
              <p className="text-xs text-gray-600 uppercase tracking-widest font-bold">
                <Link to="/recovery" className="hover:text-gray-400 transition-colors">
                  Account Recovery
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link to="/" className="text-gray-600 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors inline-flex items-center gap-2">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
