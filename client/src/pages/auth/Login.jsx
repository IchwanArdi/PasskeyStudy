import { useNavigate, Link } from 'react-router-dom';
import WebAuthnAuth from '../../components/WebAuthnAuth';
import { toast } from 'react-toastify';
import { Shield } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Cek role untuk redirect yang tepat
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    toast.success('Autentikasi berhasil!');
    if (user?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans flex items-center justify-center p-6 transition-colors duration-300 relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/[0.06] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black tracking-tight mb-2">Masuk ke Akun</h1>
          <p className="text-sm text-gray-500">Layanan Desa Digital Karangpucung</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 p-3.5 bg-emerald-500/[0.06] border border-emerald-500/10 rounded-xl mb-6">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <p className="text-xs text-gray-400 leading-relaxed">
              Masuk menggunakan <span className="text-white font-semibold">sidik jari, wajah, atau kunci keamanan</span> — tanpa password.
            </p>
          </div>

          <WebAuthnAuth mode="login" onSuccess={handleSuccess} />

          <div className="mt-6 pt-5 border-t border-white/[0.06] text-center space-y-3">
            <Link to="/recovery" className="block text-xs text-gray-600 hover:text-gray-400 transition-colors font-semibold uppercase tracking-widest">
              Pemulihan Akun
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-700 mt-6">
          Belum punya akun?{' '}
          <Link to="/register" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
