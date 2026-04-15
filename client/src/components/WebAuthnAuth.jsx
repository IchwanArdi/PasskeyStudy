import { useState } from 'react';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import { setAuth, api } from '../utils/auth';
import { Fingerprint } from 'lucide-react';

/**
 * Komponen utama untuk menangani autentikasi WebAuthn (Passkey).
 * Mendukung mode 'login' dan 'register'.
 * Menggunakan biometrik perangkat (sidik jari, wajah, dll) untuk login tanpa kata sandi.
 */
const WebAuthnAuth = ({ onSuccess, mode = 'login' }) => {
  const [nik, setNik] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Menangani perubahan input NIK atau nama pengguna
  const handleNikChange = (e) => {
    // Hanya terima angka, max 16 digit
    const value = e.target.value.replace(/\D/g, '').slice(0, 16);
    setNik(value);
    setError('');
    setMessage('');
  };

  /**
   * ALUR REGISTRASI:
   * 1. Minta opsi registrasi (challenge) dari backend.
   * 2. Panggil API WebAuthn browser untuk membuat kunci baru di perangkat.
   * 3. Kirim hasil (kredensial) ke backend untuk diverifikasi dan disimpan.
   */
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!nik || nik.length !== 16 || !username) {
      setError('Nama dan NIK (16 digit) harus diisi');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      setMessage('Meminta opsi registrasi...');
      const options = await api.post("/auth/webauthn/register/options", { nik, username });
      
      // Memulai proses pembuatan kunci di perangkat (pop-up biometrik)
      const credential = await startRegistration({
        ...options,
      });

      setMessage('Menyimpan kunci aman ke server...');
      const verifyResponse = await api.post("/auth/webauthn/register/verify", {
        nik,
        credential,
      });

      // Simpan token dan info pengguna jika verifikasi berhasil
      setAuth(verifyResponse.token, verifyResponse.user);
      setMessage('Registrasi berhasil!');
      onSuccess(verifyResponse);
    } catch (err) {
      // Sembunyikan pesan error jika pengguna membatalkan proses (Abort/NotAllowed)
      if (err.name === 'AbortError' || err.name === 'NotAllowedError' || err.message?.includes('timed out')) {
        setLoading(false);
        setMessage('');
        return; 
      }
      
      // Pesan khusus jika NIK sudah terdaftar
      if (err.name === 'InvalidStateError' || err.message?.includes('already registered')) {
        setError('NIK ini sudah terdaftar. Silakan langsung gunakan menu Login.');
      } else {
        setError(err.response?.data?.message || err.message || 'Registrasi gagal');
      }
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  /**
   * ALUR LOGIN:
   * 1. Minta opsi login dari server berdasarkan NIK/nama.
   * 2. Panggil API WebAuthn browser untuk memverifikasi identitas pengguna.
   * 3. Kirim tanda tangan biometrik ke backend untuk verifikasi akhir.
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!nik) {
      setError('Nama atau NIK harus diisi');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      setMessage('Menghubungkan ke sistem desa...');
      const options = await api.post("/auth/webauthn/login/options", { identifier: nik });

      if (!options || !options.challenge) {
        throw new Error('Gagal mendapatkan respon dari server.');
      }

      setMessage('Silakan gunakan sidik jari atau wajah Anda...');
      const credential = await startAuthentication({
        ...options,
      });

      setMessage('Memverifikasi autentikasi...');
      const verifyResponse = await api.post("/auth/webauthn/login/verify", {
        identifier: nik,
        credential,
      });

      setAuth(verifyResponse.token, verifyResponse.user);
      setMessage('Login berhasil!');
      onSuccess(verifyResponse);
    } catch (err) {
      if (err.name === 'AbortError' || err.name === 'NotAllowedError' || err.message?.includes('timed out')) {
        setLoading(false);
        setMessage('');
        return;
      }
      setError(err.response?.data?.message || err.message || 'Login gagal, pastikan akun sudah terdaftar.');
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={mode === 'register' ? handleRegister : handleLogin} className="space-y-5">
        
        {/* Input Nama Lengkap (Hanya saat Registrasi) */}
        {mode === 'register' && (
          <div>
            <label htmlFor="webauthn-username" className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-widest text-[10px]">
              Nama Lengkap
            </label>
            <input
              type="text"
              id="webauthn-username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
                setMessage('');
              }}
              required
              disabled={loading}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-[var(--text)] placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all text-sm"
              placeholder="Masukkan nama lengkap Anda"
            />
          </div>
        )}

        {/* Input NIK (Untuk Login/Register) */}
        <div>
          <label htmlFor="webauthn-nik" className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-widest text-[10px]">
            {mode === 'register' ? 'Nomor Induk Kependudukan (NIK)' : 'Nama atau NIK'}
          </label>
          <input
            type="text"
            inputMode="numeric"
            id="webauthn-nik"
            value={nik}
            onChange={handleNikChange}
            required
            disabled={loading}
            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-[var(--text)] placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all text-sm"
            placeholder={mode === 'register' ? "Masukkan 16 digit NIK" : "Masukkan Nama atau NIK"}
          />
          {mode === 'register' && nik.length > 0 && nik.length < 16 && (
            <p className="text-[10px] text-yellow-400 mt-1.5 font-medium">{nik.length}/16 digit</p>
          )}
        </div>

        {/* Notifikasi Error */}
        {error && (
          <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
            <b>Terjadi Kesalahan:</b> {error}
          </div>
        )}

        {/* Notifikasi Status Proses */}
        {message && (
          <div className="px-4 py-3 bg-emerald-500/[0.06] border border-emerald-500/15 rounded-xl text-emerald-500 font-medium text-sm">
            {message}
          </div>
        )}

        {/* Tombol Aksi Utama */}
        <button
          type="submit"
          disabled={loading || !nik || (mode === 'register' && (!username || nik.length !== 16))}
          className="w-full px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 flex items-center justify-center gap-2"
        >
          <Fingerprint className="w-5 h-5" />
          {loading ? 'Memproses...' : mode === 'register' ? 'Daftar dengan Biometrik' : 'Masuk dengan Biometrik'}
        </button>
      </form>
    </div>
  );
};

export default WebAuthnAuth;
