import { useNavigate, Link } from 'react-router-dom';
import WebAuthnAuth from '../../components/WebAuthnAuth';
import { toast } from 'react-toastify';
import { Shield, HelpCircle } from 'lucide-react';

/**
 * Login Page — Halaman masuk utama aplikasi.
 * Menggunakan komponen WebAuthnAuth untuk proses autentikasi biometrik (Passkey).
 */
const Login = () => {
  const navigate = useNavigate();

  // Menangani sukses login
  const handleSuccess = () => {
    // Ambil data user dari localStorage untuk menentukan tujuan redirect berdasarkan role
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    toast.success('Autentikasi berhasil!');
    
    // Redirect Admin ke dashboard admin, Warga ke dashboard warga
    if (user?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans flex items-center justify-center p-6 transition-colors duration-300 relative overflow-hidden">
      {/* Dekorasi Background (Efek cahaya/glow) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/[0.06] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Bagian Judul */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black tracking-tight mb-2">Masuk ke Akun</h1>
          <p className="text-sm text-gray-500">Layanan Desa Digital</p>
        </div>

        {/* Kartu Login */}
        <div className="glass-card rounded-[24px] p-6 sm:p-8">
          {/* Banner Informasi Keamanan */}
          <div className="flex items-center gap-3 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-6">
            <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              Masuk cukup pakai <span className="text-[var(--text)] font-bold">Sidik Jari atau Wajah</span> — aman tanpa perlu hafal password.
            </p>
          </div>

          {/* Form Autentikasi WebAuthn */}
          <WebAuthnAuth mode="login" onSuccess={handleSuccess} />

          {/* Tautan Tambahan (Bantuan & Pemulihan) */}
          <div className="mt-6 pt-5 border-t border-[var(--card-border)] flex flex-col items-center gap-3">
            <Link to="/panduan" className="text-xs text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-1.5 font-medium">
              <HelpCircle className="w-3.5 h-3.5" /> Butuh bantuan masuk?
            </Link>
            <Link to="/recovery" className="text-[10px] text-gray-600 hover:text-gray-400 transition-colors font-bold uppercase tracking-widest">
              Gunakan Kunci Cadangan
            </Link>
          </div>
        </div>

        {/* Tautan Daftar Akun Baru */}
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
