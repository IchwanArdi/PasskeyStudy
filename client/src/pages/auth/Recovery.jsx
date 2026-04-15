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
  const [nik, setNik] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [newRecoveryCodes, setNewRecoveryCodes] = useState([]);

  // Tahap 1: Verifikasi apakah NIK & Kode Pemulihan cocok
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post("/recovery/verify-code", { nik, code });
      // Simpan session sementara agar bisa lanjut ke tahap pendaftaran perangkat baru
      setAuth(response.token, response.user);
      toast.success('Kode pemulihan terverifikasi');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'NIK atau kode pemulihan salah');
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
      const options = await api.post('/recovery/re-register/options', { nik });

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
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans flex items-center justify-center p-6 transition-colors duration-300 relative overflow-hidden">
      <div className="relative z-10 w-full max-w-sm animate-fade-in-up">
        
        {/* Indikator Langkah (Stepper) */}
        <div className="flex items-center justify-center gap-3 mb-10">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? 'bg-emerald-500 text-black' : 'bg-white/[0.04] text-gray-600 border border-white/[0.08]'}`}>
                {step > s ? <Check className="w-3 h-3" /> : s}
              </div>
              {s < 3 && <div className={`w-12 h-0.5 rounded-full ${step > s ? 'bg-emerald-500' : 'bg-white/[0.06]'}`} />}
            </div>
          ))}
        </div>

          {/* LANGKAH 1: INPUT KODE PEMULIHAN */}
          {step === 1 && (
            <div>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-black tracking-tight mb-2">Pemulihan Akun</h1>
                <p className="text-sm text-gray-500">Gunakan kode cadangan yang Anda simpan saat mendaftar.</p>
              </div>

              <div className="glass-card rounded-[24px] p-6 sm:p-8">
                <form onSubmit={handleVerifyCode} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">NIK Akun</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={nik}
                      onChange={(e) => { setNik(e.target.value.replace(/\D/g, '').slice(0, 16)); setError(''); }}
                      required
                      className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all text-sm"
                      placeholder="Masukkan 16 digit NIK"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Kode Pemulihan (4 Karakter)</label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
                      required
                      maxLength={4}
                      className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all text-sm font-mono tracking-[0.5em] text-center text-lg"
                      placeholder="XXXX"
                    />
                  </div>
                  {error && (
                    <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium italic">{error}</div>
                  )}
                  <button type="submit" disabled={loading} className="w-full py-4 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50">
                    {loading ? 'Memverifikasi...' : 'Verifikasi Kode'}
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
                <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Fingerprint className="w-7 h-7 text-emerald-400" />
                </div>
                <h1 className="text-2xl font-black tracking-tight mb-2">Perangkat Baru</h1>
                <p className="text-sm text-gray-500">Kode valid! Sekarang daftarkan Sidik Jari/Wajah di perangkat ini.</p>
              </div>

              <div className="glass-card rounded-[24px] p-6 sm:p-8 space-y-6">
                {message && (
                  <div className="px-4 py-3 bg-emerald-500/[0.06] border border-emerald-500/15 rounded-xl text-emerald-400 text-xs text-center font-medium animate-pulse">{message}</div>
                )}
                {error && (
                  <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium italic">{error}</div>
                )}
                <button onClick={handleReRegister} disabled={loading} className="w-full py-4 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50">
                  {loading ? 'Memproses...' : 'Daftarkan Perangkat Ini'}
                  {!loading && <Fingerprint className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* LANGKAH 3: SELESAI & KODE BARU */}
          {step === 3 && (
            <div>
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-7 h-7 text-emerald-400" />
                </div>
                <h1 className="text-2xl font-black tracking-tight mb-2">Berhasil Pulih!</h1>
                <p className="text-sm text-gray-500">Akses pulih. Simpan kode baru ini sebagai cadangan.</p>
              </div>

              {newRecoveryCodes.length > 0 && (
                <div className="glass-card rounded-[24px] p-6 sm:p-8 mb-6">
                  <div className="p-3.5 bg-yellow-500/[0.06] border border-yellow-500/10 rounded-xl mb-5 flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0" />
                    <div className="flex-1 text-left">
                      <p className="text-[10px] text-yellow-400 font-bold mb-1 uppercase tracking-wider">KODE PEMULIHAN BARU</p>
                      <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                        Kode lama Anda sudah hangus. Simpan kode-kode di bawah ini di tempat aman.
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    {newRecoveryCodes.map((c, i) => (
                      <div key={i} className="p-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-center font-mono text-xs tracking-widest text-[var(--text)]">
                        {c}
                      </div>
                    ))}
                  </div>
                  
                  {/* Tombol Aksi: Salin & Unduh */}
                  <div className="flex gap-2 mb-4">
                    <button onClick={handleCopyCodes} className="flex-1 py-3 bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text)] rounded-xl text-[11px] font-bold hover:opacity-80 transition-all flex items-center justify-center gap-2">
                      <Copy className="w-3.5 h-3.5" /> Salin
                    </button>
                    <button onClick={handleDownloadCodes} className="flex-1 py-3 bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text)] rounded-xl text-[11px] font-bold hover:opacity-80 transition-all flex items-center justify-center gap-2">
                      <Download className="w-3.5 h-3.5" /> Unduh .TXT
                    </button>
                  </div>

                  <button onClick={() => navigate('/dashboard')} className="w-full py-4 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95">
                    Masuk ke Dashboard <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Navigasi Balik ke Login */}
          <p className="text-center text-xs text-gray-700 mt-6 font-medium">
            <Link to="/login" className="text-gray-500 hover:text-gray-300 transition-colors flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Kembali ke Login
            </Link>
          </p>
        </div>
      </div>
    );
  };

export default Recovery;
