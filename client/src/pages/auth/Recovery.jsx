import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { startRegistration } from '@simplewebauthn/browser';
import { recoveryAPI } from '../../services/api';
import { setAuth } from '../../utils/auth';
import { toast } from 'react-toastify';
import { Shield, KeyRound, AlertTriangle, ArrowLeft, Check, CheckCircle, Fingerprint, ArrowRight, MessageCircle } from 'lucide-react';

const Recovery = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: enter code, 2: re-register, 3: done
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [newRecoveryCodes, setNewRecoveryCodes] = useState([]);

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await recoveryAPI.verifyCode({ email, code });
      setAuth(response.token, response.user);
      toast.success('Kode pemulihan terverifikasi');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Kode pemulihan tidak valid');
    } finally {
      setLoading(false);
    }
  };

  const handleReRegister = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      setMessage('Meminta opsi registrasi...');
      const options = await recoveryAPI.getReRegisterOptions(email);

      setMessage('Gunakan authenticator baru Anda...');
      const credential = await startRegistration(options);

      setMessage('Memverifikasi perangkat baru...');
      const response = await recoveryAPI.reRegister({ credential });

      setAuth(response.token, response.user);

      if (response.newRecoveryCodes) {
        setNewRecoveryCodes(response.newRecoveryCodes);
      }

      toast.success('Perangkat baru berhasil didaftarkan!');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registrasi gagal');
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] selection:bg-blue-500/30 font-sans transition-colors duration-300">
      <div className="flex flex-col items-center justify-center min-h-screen px-6 pt-16">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Progress */}
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

          {step === 1 && (
            <div>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/15 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <KeyRound className="w-8 h-8 text-amber-400" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight mb-3">Pemulihan Akun</h1>
                <p className="text-gray-500 text-base">Masukkan email dan salah satu kode pemulihan Anda</p>
              </div>

              <div className="glass-card rounded-2xl p-8">
                <form onSubmit={handleVerifyCode} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      required
                      className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all text-sm"
                      placeholder="Masukkan email Anda"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Kode Pemulihan</label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
                      required
                      maxLength={8}
                      className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all text-sm font-mono tracking-widest text-center text-lg"
                      placeholder="XXXXXXXX"
                    />
                  </div>
                  {error && (
                    <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>
                  )}
                  <button type="submit" disabled={loading} className="w-full px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                    {loading ? 'Memverifikasi...' : 'Verifikasi Kode'}
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </form>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/15 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Fingerprint className="w-8 h-8 text-blue-400" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight mb-3">Daftarkan Perangkat Baru</h1>
                <p className="text-gray-500 text-base">Gunakan authenticator baru Anda untuk memulihkan akses</p>
              </div>

              <div className="glass-card rounded-2xl p-8 space-y-6">
                {message && (
                  <div className="px-4 py-3 bg-blue-500/[0.06] border border-blue-500/15 rounded-xl text-blue-400 text-sm">{message}</div>
                )}
                {error && (
                  <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>
                )}
                <button onClick={handleReRegister} disabled={loading} className="w-full px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                  {loading ? 'Memproses...' : 'Daftarkan Authenticator Baru'}
                  {!loading && <Fingerprint className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/15 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight mb-3">Pemulihan Berhasil!</h1>
                <p className="text-gray-500 text-base">Perangkat baru Anda telah didaftarkan</p>
              </div>

              {newRecoveryCodes.length > 0 && (
                <div className="glass-card rounded-2xl p-8 mb-6">
                  <div className="p-4 bg-amber-500/[0.06] border border-amber-500/15 rounded-xl mb-6">
                    <p className="text-sm text-amber-400 font-semibold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Kode Pemulihan Baru
                    </p>
                    <p className="text-sm text-gray-400 mt-1">Kode lama sudah tidak berlaku. Simpan kode baru ini.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {newRecoveryCodes.map((c, i) => (
                      <div key={i} className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-center">
                        <span className="font-mono text-sm font-bold tracking-widest">{c}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      const text = `Kunci Cadangan Desa Digital Karangpucung Anda:\n\n${newRecoveryCodes.join('\n')}\n\n*Hanya bisa dipakai 1x. Simpan pesan ini!*`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                    }}
                    className="w-full py-3 bg-[#25D366]/[0.1] border border-[#25D366]/20 text-[#25D366] rounded-xl text-xs font-bold hover:bg-[#25D366]/20 transition-all flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" /> Kirim ke WhatsApp (Simpan)
                  </button>
                </div>
              )}

              <button onClick={() => navigate('/dashboard')} className="w-full px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-blue-500/20">
                Lanjut ke Dashboard
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-gray-600 hover:text-gray-400 text-sm font-medium transition-colors flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Masuk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recovery;
