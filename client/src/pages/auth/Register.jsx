import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import WebAuthnAuth from '../../components/WebAuthnAuth';
import { toast } from 'react-toastify';
import { Shield, CheckCircle, Copy, Download, AlertTriangle, ArrowRight } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState([]);

  const handleSuccess = async () => {
    toast.success('Pendaftaran berhasil!');
    try {
      const token = localStorage.getItem('token');
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
      console.warn('Kode pemulihan tidak dibuat:', err);
    }
    navigate('/dashboard');
  };

  const handleDismissCodes = () => {
    setShowRecoveryCodes(false);
    navigate('/dashboard');
  };

  const handleCopyCodes = () => {
    navigator.clipboard.writeText(recoveryCodes.join('\n'));
    toast.success('Kode pemulihan disalin ke clipboard');
  };

  const handleDownloadCodes = () => {
    const text = `Layanan Desa Digital Karangpucung — Kode Pemulihan\nDibuat: ${new Date().toLocaleString('id-ID')}\n${'='.repeat(40)}\n\n${recoveryCodes.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\n${'='.repeat(40)}\nSimpan kode ini di tempat yang aman.\nSetiap kode hanya dapat digunakan satu kali.`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kode-pemulihan-karangpucung.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('File kode pemulihan diunduh');
  };

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
            <h1 className="text-2xl font-black">Akun Berhasil Dibuat!</h1>
            <p className="text-sm text-gray-500 mt-1">Simpan kode pemulihan ini di tempat aman</p>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
            <div className="p-3.5 bg-yellow-500/[0.06] border border-yellow-500/10 rounded-xl mb-5 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-yellow-400 font-bold mb-1 text-left">Peringatan Penting</p>
                <p className="text-xs text-gray-500 leading-relaxed text-left">
                  Kode ini adalah <b className="text-white">satu-satunya cara</b> untuk memulihkan akun jika perangkat hilang. Setiap kode hanya bisa digunakan sekali.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-5">
              {recoveryCodes.map((code, i) => (
                <div key={i} className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-lg text-center font-mono text-xs tracking-widest text-white/80">
                  {code}
                </div>
              ))}
            </div>

            <div className="flex gap-2 mb-4">
              <button onClick={handleCopyCodes} className="flex-1 py-3 bg-white/[0.05] border border-white/10 text-white rounded-xl text-xs font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                <Copy className="w-3.5 h-3.5" /> Salin Semua
              </button>
              <button onClick={handleDownloadCodes} className="flex-1 py-3 bg-white/[0.05] border border-white/10 text-white rounded-xl text-xs font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                <Download className="w-3.5 h-3.5" /> Unduh
              </button>
            </div>

            <button onClick={handleDismissCodes} className="w-full py-4 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all text-sm flex items-center justify-center gap-2">
              Sudah Disimpan <ArrowRight className="w-4 h-4" /> Masuk ke Layanan
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans flex flex-col items-center justify-center px-6 relative overflow-hidden transition-colors duration-300">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/[0.05] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black tracking-tight mb-2">Daftar Akun</h1>
          <p className="text-sm text-gray-500">Layanan Desa Digital Karangpucung</p>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
          <div className="flex items-center gap-3 p-3.5 bg-emerald-500/[0.06] border border-emerald-500/10 rounded-xl mb-6">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <p className="text-xs text-gray-400 leading-relaxed">
              Akun Anda dilindungi dengan <span className="text-white font-semibold">kriptografi kunci publik</span> — tidak perlu password.
            </p>
          </div>

          <WebAuthnAuth mode="register" onSuccess={handleSuccess} />

          <p className="text-center text-xs text-gray-600 mt-5">
            Gunakan perangkat dengan sidik jari, Windows Hello, atau kunci keamanan.
          </p>
        </div>

        <p className="text-center text-xs text-gray-700 mt-6">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
