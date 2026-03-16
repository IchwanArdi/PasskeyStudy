import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { startRegistration } from '@simplewebauthn/browser';
import { setAuth, api } from '../../utils/auth';
import { toast } from 'react-toastify';
import { KeyRound, AlertTriangle, ArrowLeft, Check, CheckCircle, Fingerprint, ArrowRight, Copy, Download } from 'lucide-react';

/**
 * Recovery Page — Halaman untuk memulihkan akses akun jika perangkat Passkey hilang.
 * Menggunakan sistem kode pemulihan (Recovery Codes) untuk mendaftarkan perangkat baru.
 */
const Recovery = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // Langkah: 1: Masuk kode, 2: Daftar ulang perangkat, 3: Selesai
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [newRecoveryCodes, setNewRecoveryCodes] = useState([]);

  // Tahap 1: Verifikasi apakah Email & Kode Pemulihan cocok
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post("/recovery/verify-code", { email, code });
      // Simpan session sementara agar bisa lanjut ke tahap pendaftaran perangkat baru
      setAuth(response.token, response.user);
      toast.success('Kode pemulihan terverifikasi');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Email atau kode pemulihan salah');
    } finally {
      setLoading(false);
    }
  };

  // Tahap 2: Mendaftarkan perangkat baru (Passkey baru)
  const handleReRegister = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      setMessage('Menyiapkan opsi pendaftaran baru...');
      const options = await api.post('/recovery/re-register/options', { email });

      setMessage('Silakan gunakan sensor sidik jari/wajah Anda...');
      const credential = await startRegistration(options);

      setMessage('Sedang memverifikasi perangkat baru Anda...');
      const response = await api.post('/recovery/re-register/verify', { credential });

      // Autentikasi ulang dengan token baru yang permanen
      setAuth(response.token, response.user);

      if (response.newRecoveryCodes) {
        setNewRecoveryCodes(response.newRecoveryCodes);
      }

      toast.success('Akses akun berhasil dipulihkan!');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal mendaftarkan perangkat baru');
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  // Salin semua kode ke clipboard
  const handleCopyCodes = () => {
    navigator.clipboard.writeText(newRecoveryCodes.join('\n'));
    toast.success('Kode pemulihan disalin!');
  };

  // Unduh kode pemulihan dalam bentuk file .txt
  const handleDownloadCodes = () => {
    const text = `Layanan Desa Digital — Kode Pemulihan Baru\nDibuat: ${new Date().toLocaleString('id-ID')}\n${'='.repeat(45)}\n\n${newRecoveryCodes.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\n${'='.repeat(45)}\nPERINGATAN: Simpan kode ini di tempat yang sangat aman.\nKode lama Anda sudah tidak berlaku.`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kode-pemulihan-baru.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('File kode pemulihan telah diunduh');
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] selection:bg-blue-500/30 font-sans transition-colors duration-300">
      <div className="flex flex-col items-center justify-center min-h-screen px-6 pt-16">
        <div className="w-full max-w-md animate-fade-in-up">
          
          {/* Indikator Langkah (Stepper) */}
          <div className="flex items-center justify-center gap-3 mb-10">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? 'bg-blue-600 text-white' : 'bg-white/[0.04] text-gray-600 border border-white/[0.08]'}`}>
                  {step > s ? <Check className="w-3 h-3" /> : s}
                </div>
                {s < 3 && <div className={`w-12 h-0.5 rounded-full ${step > s ? 'bg-blue-600' : 'bg-white/[0.06]'}`} />}
              </div>
            ))}
          </div>

          {/* LANGKAH 1: INPUT KODE PEMULIHAN */}
          {step === 1 && (
            <div>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/15 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <KeyRound className="w-8 h-8 text-amber-400" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight mb-3">Pemulihan Akun</h1>
                <p className="text-gray-500 text-base">Gunakan kode cadangan yang Anda simpan saat mendaftar.</p>
              </div>

              <div className="glass-card rounded-2xl p-8">
                <form onSubmit={handleVerifyCode} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email Akun</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      required
                      className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all text-sm"
                      placeholder="contoh@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Kode Pemulihan (4 Karakter)</label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
                      required
                      maxLength={4}
                      className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all text-sm font-mono tracking-widest text-center text-lg"
                      placeholder="XXXX"
                    />
                  </div>
                  {error && (
                    <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm italic">{error}</div>
                  )}
                  <button type="submit" disabled={loading} className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-95">
                    {loading ? 'Sedang Memverifikasi...' : 'Verifikasi Kode'}
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* LANGKAH 2: REGISTRASI PASKEY BARU */}
          {step === 2 && (
            <div>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/15 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Fingerprint className="w-8 h-8 text-blue-400" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight mb-3">Daftar Perangkat Baru</h1>
                <p className="text-gray-500 text-base">Kode valid! Sekarang daftarkan Sidik Jari/Wajah di perangkat ini.</p>
              </div>

              <div className="glass-card rounded-2xl p-8 space-y-6">
                {message && (
                  <div className="px-4 py-3 bg-blue-500/[0.06] border border-blue-500/15 rounded-xl text-blue-400 text-sm text-center font-medium animate-pulse">{message}</div>
                )}
                {error && (
                  <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm italic">{error}</div>
                )}
                <button onClick={handleReRegister} disabled={loading} className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-95">
                  {loading ? 'Memproses pendaftaran...' : 'Daftarkan Perangkat Ini'}
                  {!loading && <Fingerprint className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* LANGKAH 3: SELESAI & KODE BARU */}
          {step === 3 && (
            <div>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/15 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight mb-3">Pemulihan Selesai!</h1>
                <p className="text-gray-500 text-base">Akses Anda telah pulih. Hapus kode lama dan simpan kode baru di bawah.</p>
              </div>

              {newRecoveryCodes.length > 0 && (
                <div className="glass-card rounded-2xl p-8 mb-6">
                  <div className="p-4 bg-amber-500/[0.06] border border-amber-500/15 rounded-xl mb-6">
                    <p className="text-sm text-amber-400 font-bold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> KODE PEMULIHAN BARU
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Kode lama otomatis hangus. Wajib simpan kode-kode di bawah ini!</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {newRecoveryCodes.map((c, i) => (
                      <div key={i} className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-center">
                        <span className="font-mono text-sm font-bold tracking-widest text-white">{c}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Tombol Aksi: Salin & Unduh */}
                  <div className="flex gap-2 mb-6">
                    <button onClick={handleCopyCodes} className="flex-1 py-3.5 bg-white/[0.05] border border-white/10 text-white rounded-xl text-xs font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                      <Copy className="w-4 h-4" /> Salin
                    </button>
                    <button onClick={handleDownloadCodes} className="flex-1 py-3.5 bg-white/[0.05] border border-white/10 text-white rounded-xl text-xs font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" /> Unduh .TXT
                    </button>
                  </div>
                </div>
              )}

              <button onClick={() => navigate('/dashboard')} className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20 active:scale-95">
                Masuk ke Dashboard
              </button>
            </div>
          )}

          {/* Navigasi Balik ke Login */}
          <div className="mt-6 text-center">
            <Link to="/login" className="text-gray-600 hover:text-gray-400 text-sm font-semibold transition-colors flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Kembali ke Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recovery;
