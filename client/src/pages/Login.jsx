
import { useNavigate, Link } from 'react-router-dom';
import WebAuthnAuth from '../components/WebAuthnAuth';
import { toast } from 'react-toastify';
import { Shield, Github, Fingerprint } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();

  const handleSuccess = (response) => {
    toast.success('Autentikasi berhasil. Mengarahkan ke dashboard...');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-blue-500/30 font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-white font-bold text-sm tracking-tight flex items-center gap-2.5">
            <div className="w-7 h-7 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
            </div>
            WebAuthn Research
          </Link>
          <div className="flex items-center gap-4">
            <a href="https://github.com/IchwanArdi/PasskeyStudy" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg">
              <Github className="w-5 h-5" />
            </a>
            <Link to="/register" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/20">
              Daftar
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-screen px-6 pt-16">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-3">Masuk ke Akun Anda</h1>
          </div>

          <div className="glass-card rounded-2xl p-8 glow-blue">
            <div className="flex items-center gap-3 p-4 bg-emerald-500/[0.06] border border-emerald-500/15 rounded-xl mb-8">
              <Shield className="w-5 h-5 text-emerald-400 shrink-0" />
              <p className="text-sm text-gray-400 leading-relaxed">
                Sistem ini menggunakan <span className="text-emerald-400 font-semibold">WebAuthn/FIDO2</span> — tidak ada password yang dikirim atau disimpan.
              </p>
            </div>

            <WebAuthnAuth mode="login" onSuccess={handleSuccess} />

            <div className="mt-8 pt-6 border-t border-white/[0.06] space-y-3 text-center">
              <p className="text-sm text-gray-500">
                Belum punya akun?{' '}
                <Link to="/register" className="text-blue-400 hover:text-blue-300 transition-colors font-semibold">
                  Buat Akun
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                Kehilangan akses?{' '}
                <Link to="/recovery" className="text-gray-400 hover:text-gray-300 transition-colors font-medium">
                  Pemulihan Akun
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link to="/" className="text-gray-600 hover:text-gray-400 text-sm font-medium transition-colors inline-flex items-center gap-1">
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
