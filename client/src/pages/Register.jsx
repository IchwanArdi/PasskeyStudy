import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import WebAuthnAuth from '../components/WebAuthnAuth';
import { toast } from 'react-toastify';
import { Shield, Github, Fingerprint, CheckCircle } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState([]);

  const handleSuccess = async (response) => {
    toast.success('Registrasi berhasil!');

    // Try to generate recovery codes after registration
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/recovery/generate-codes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.codes && data.codes.length > 0) {
          setRecoveryCodes(data.codes);
          setShowRecoveryCodes(true);
          return; // Don't navigate yet, show codes first
        }
      }
    } catch (err) {
      console.warn('Recovery codes not generated:', err);
    }

    navigate('/dashboard');
  };

  const handleDismissCodes = () => {
    setShowRecoveryCodes(false);
    navigate('/dashboard');
  };

  const handleCopyCodes = () => {
    const text = recoveryCodes.join('\n');
    navigator.clipboard.writeText(text);
    toast.success('Recovery codes disalin ke clipboard');
  };

  const handleDownloadCodes = () => {
    const text = `WebAuthn Research — Recovery Codes\nGenerated: ${new Date().toLocaleString('id-ID')}\n${'='.repeat(40)}\n\n${recoveryCodes.map((code, i) => `${i + 1}. ${code}`).join('\n')}\n\n${'='.repeat(40)}\nSimpan kode ini di tempat yang aman.\nSetiap kode hanya dapat digunakan satu kali.`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'webauthn-recovery-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('File recovery codes berhasil diunduh');
  };

  // Show recovery codes after registration
  if (showRecoveryCodes) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-blue-500/30 font-sans flex items-center justify-center px-6">
        <div className="w-full max-w-lg animate-fade-in-up">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/15 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-3">Registrasi Berhasil!</h1>
            <p className="text-gray-500 text-base">Simpan kode pemulihan di bawah ini dengan aman</p>
          </div>

          <div className="glass-card rounded-2xl p-8">
            <div className="p-4 bg-amber-500/[0.06] border border-amber-500/15 rounded-xl mb-6">
              <p className="text-sm text-amber-400 font-semibold mb-1">⚠ Penting</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                Kode ini adalah <b>satu-satunya cara</b> untuk memulihkan akun Anda jika kehilangan perangkat. Setiap kode hanya bisa digunakan satu kali.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {recoveryCodes.map((code, i) => (
                <div key={i} className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-center">
                  <span className="font-mono text-sm font-bold tracking-widest text-white">{code}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mb-6">
              <button
                onClick={handleCopyCodes}
                className="flex-1 px-4 py-3 bg-white/[0.06] border border-white/[0.08] text-white rounded-xl text-sm font-semibold hover:bg-white/10 transition-all"
              >
                📋 Salin Semua
              </button>
              <button
                onClick={handleDownloadCodes}
                className="flex-1 px-4 py-3 bg-white/[0.06] border border-white/[0.08] text-white rounded-xl text-sm font-semibold hover:bg-white/10 transition-all"
              >
                📥 Unduh File
              </button>
            </div>

            <button
              onClick={handleDismissCodes}
              className="w-full px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-blue-500/20"
            >
              Saya Sudah Menyimpan → Lanjut ke Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            <Link to="/login" className="px-5 py-2.5 bg-white/[0.06] hover:bg-white/10 text-white rounded-xl text-sm font-semibold transition-all border border-white/10">
              Masuk
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-screen px-6 pt-16">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-3">Buat Akun Baru</h1>
            <p className="text-gray-500 text-base">Daftar menggunakan autentikasi biometrik passwordless</p>
          </div>

          <div className="glass-card rounded-2xl p-8 glow-blue">
            <div className="flex items-center gap-3 p-4 bg-blue-500/[0.06] border border-blue-500/15 rounded-xl mb-8">
              <Shield className="w-5 h-5 text-blue-400 shrink-0" />
              <p className="text-sm text-gray-400 leading-relaxed">
                Akun Anda dilindungi oleh <span className="text-blue-400 font-semibold">kriptografi kunci publik</span> — tidak ada password yang perlu diingat.
              </p>
            </div>

            <WebAuthnAuth mode="register" onSuccess={handleSuccess} />

            <div className="mt-8 pt-6 border-t border-white/[0.06] text-center">
              <p className="text-sm text-gray-500">
                Sudah punya akun?{' '}
                <Link to="/login" className="text-blue-400 hover:text-blue-300 transition-colors font-semibold">
                  Masuk
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

export default Register;
