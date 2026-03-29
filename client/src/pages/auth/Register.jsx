import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import WebAuthnAuth from '../../components/WebAuthnAuth';
import { toast } from 'react-toastify';
import { Shield, CheckCircle, Copy, Download, AlertTriangle, ArrowRight, HelpCircle } from 'lucide-react';

/**
 * Register Page — Halaman pendaftaran akun warga baru.
 * Menggunakan biometrik (Passkey) dan menghasilkan kode pemulihan cadangan.
 */
const Register = () => {
  const navigate = useNavigate();
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState([]);

  // Tahap sukses daftar: generate & tampilkan kode pemulihan
  const handleSuccess = async () => {
    toast.success('Pendaftaran berhasil!');
    try {
      const token = localStorage.getItem('token');
      // Minta kode pemulihan baru dari server untuk akun yang baru dibuat
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/recovery/generate-codes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.codes?.length > 0) {
          setRecoveryCodes(data.codes);
          setShowRecoveryCodes(true);
          return;
        }
      }
    } catch (err) {
      console.warn('Kode pemulihan tidak dapat dibuat saat ini:', err);
    }
    // Jika gagal generate kode, langsung ke dashboard saja
    navigate('/dashboard');
  };

  // Tutup tampilan kode pemulihan
  const handleDismissCodes = () => {
    setShowRecoveryCodes(false);
    navigate('/dashboard');
  };

  // Salin semua kode ke clipboard
  const handleCopyCodes = () => {
    navigator.clipboard.writeText(recoveryCodes.join('\n'));
    toast.success('Kode pemulihan disalin!');
  };

  // Unduh kode pemulihan dalam bentuk file .txt
  const handleDownloadCodes = () => {
    const text = `Layanan Desa Digital — Kode Pemulihan Akun\nDibuat: ${new Date().toLocaleString('id-ID')}\n${'='.repeat(45)}\n\n${recoveryCodes.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\n${'='.repeat(45)}\nPERINGATAN: Simpan kode ini di tempat yang sangat aman.\nSetiap kode hanya dapat digunakan satu kali untuk memulihkan akses akun Anda.`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kode-pemulihan-desa.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('File kode pemulihan telah diunduh');
  };

  // Tampilan khusus setelah sukses daftar (Modal/Full Screen Kode Pemulihan)
  if (showRecoveryCodes) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans flex items-center justify-center p-6 transition-colors duration-300 relative overflow-hidden">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/[0.05] rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-sm">
          <div className="text-center mb-7">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-7 h-7 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-black">Pendaftaran Berhasil!</h1>
            <p className="text-sm text-gray-500 mt-1">Wajib simpan kode pemulihan di bawah ini.</p>
          </div>

          <div className="glass-card rounded-[24px] p-6 sm:p-8">
            {/* Box Peringatan */}
            <div className="p-3.5 bg-yellow-500/[0.06] border border-yellow-500/10 rounded-xl mb-5 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0" />
              <div className="flex-1 text-left">
                <p className="text-[10px] text-yellow-400 font-bold mb-1 uppercase tracking-wider">Peringatan Penting</p>
                <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                   Kode ini adalah <b className="text-[var(--text)] font-bold">satu-satunya cara</b> memulihkan akun jika perangkat Anda hilang. Setiap kode hanya bisa dipakai 1x.
                </p>
              </div>
            </div>

            {/* Grid Kode */}
            <div className="grid grid-cols-2 gap-2 mb-5">
              {recoveryCodes.map((code, i) => (
                <div key={i} className="p-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-center font-mono text-xs tracking-widest text-[var(--text)]">
                  {code}
                </div>
              ))}
            </div>

            {/* Tombol Aksi */}
            <div className="flex gap-2 mb-4">
              <button onClick={handleCopyCodes} className="flex-1 py-3 bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text)] rounded-xl text-[11px] font-bold hover:opacity-80 transition-all flex items-center justify-center gap-2">
                <Copy className="w-3.5 h-3.5" /> Salin
              </button>
              <button onClick={handleDownloadCodes} className="flex-1 py-3 bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text)] rounded-xl text-[11px] font-bold hover:opacity-80 transition-all flex items-center justify-center gap-2">
                <Download className="w-3.5 h-3.5" /> Unduh .TXT
              </button>
            </div>

            <button onClick={handleDismissCodes} className="w-full py-4 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95">
              Sudah Saya Simpan <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Tampilan Form Pendaftaran Utama
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans flex flex-col items-center justify-center px-6 relative overflow-hidden transition-colors duration-300">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/[0.05] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black tracking-tight mb-2">Daftar Akun</h1>
          <p className="text-sm text-gray-500">Layanan Desa Digital</p>
        </div>

        <div className="glass-card rounded-[24px] p-6 sm:p-8">
          {/* Banner Informasi WebAuthn */}
          <div className="flex items-center gap-3 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-6">
            <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              Akun Anda dilindungi dengan <span className="text-[var(--text)] font-bold">Passkey</span> — aman tanpa password konvensional.
            </p>
          </div>

          {/* Komponen Autentikasi WebAuthn */}
          <WebAuthnAuth mode="register" onSuccess={handleSuccess} />

          <div className="mt-4 text-center">
            <Link to="/panduan" className="text-xs text-gray-500 hover:text-blue-400 transition-colors flex items-center justify-center gap-1.5 font-medium">
              <HelpCircle className="w-3.5 h-3.5" /> Belum paham caranya? Tonton panduan
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-700 mt-6 font-medium">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
