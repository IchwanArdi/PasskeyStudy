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
      console.log('\n==================================================');
      console.log('[REGISTRASI WEBAUTHN - LANGKAH 1] Meminta opsi registrasi dari server...');
      console.log(` -> Payload dikirim: NIK = ${nik}, Nama = ${username}`);

      setMessage('Meminta opsi registrasi...');
      const options = await api.post('/auth/webauthn/register/options', { nik, username });

      console.log(' -> Respon Opsi Registrasi dari server:', options);
      console.log('    - Challenge dari server:', options.challenge);
      console.log('    - RpID (Domain):', options.rp.id);

      setMessage('Memicu sensor biometrik perangkat...');
      console.log('[REGISTRASI WEBAUTHN - LANGKAH 2] Memanggil startRegistration() dari @simplewebauthn/browser...');
      console.log(' -> Menunggu warga memverifikasi sidik jari/wajah pada prompt browser...');

      const credential = await startRegistration({
        optionsJSON: options,
      });

      console.log(' -> Kredensial berhasil dibuat oleh Authenticator Perangkat!');
      console.log('    - Credential ID:', credential.id);
      console.log('    - Raw Attestation Object:', credential.response.attestationObject);
      console.log('    - Client Data JSON (mengandung origin & challenge):', atob(credential.response.clientDataJSON));

      setMessage('Menyimpan kunci aman ke server...');
      console.log('[REGISTRASI WEBAUTHN - LANGKAH 3] Mengirim data kredensial ke server untuk verifikasi...');

      const verifyResponse = await api.post('/auth/webauthn/register/verify', {
        nik,
        credential,
      });

      console.log(' -> Verifikasi backend berhasil! Pengguna telah terdaftar.');
      console.log('    - User Info:', verifyResponse.user);
      console.log('==================================================\n');

      setAuth(verifyResponse.token, verifyResponse.user);
      setMessage('Registrasi berhasil!');
      onSuccess(verifyResponse);
    } catch (err) {
      console.error(' [!] Error saat registrasi:', err);
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
      setError('NIK harus diisi');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      console.log('\n==================================================');
      console.log('[LOGIN WEBAUTHN - LANGKAH 1] Meminta opsi login (challenge) dari server...');
      console.log(` -> Payload dikirim: NIK/Identifier = ${nik}`);

      setMessage('Menghubungkan ke sistem kelurahan...');
      const options = await api.post('/auth/webauthn/login/options', { identifier: nik });

      console.log(' -> Respon Opsi Login dari server:', options);
      console.log('    - Challenge dari server:', options.challenge);
      console.log('    - Jumlah kredensial terdaftar yang diizinkan:', options.allowCredentials?.length);

      if (!options || !options.challenge) {
        throw new Error('Gagal mendapatkan respon dari server.');
      }

      setMessage('Silakan gunakan sidik jari atau wajah Anda...');
      console.log('[LOGIN WEBAUTHN - LANGKAH 2] Memanggil startAuthentication() dari @simplewebauthn/browser...');
      console.log(' -> Menunggu warga memverifikasi sidik jari/wajah pada perangkat...');

      const credential = await startAuthentication({
        optionsJSON: options,
      });

      console.log(' -> Pengguna memverifikasi sidik jari! Tanda tangan digital berhasil dibuat perangkat.');
      console.log('    - Credential ID yang digunakan:', credential.id);
      console.log('    - Signature Kriptografis:', credential.response.signature);
      console.log('    - Client Data JSON (mengandung challenge saat ini):', atob(credential.response.clientDataJSON));

      setMessage('Memverifikasi autentikasi...');
      console.log('[LOGIN WEBAUTHN - LANGKAH 3] Mengirim signature dan data login ke server untuk verifikasi...');

      const verifyResponse = await api.post('/auth/webauthn/login/verify', {
        identifier: nik,
        credential,
      });

      console.log(' -> Verifikasi backend berhasil! Pengguna berhasil login.');
      console.log('    - User Info:', verifyResponse.user);
      console.log('==================================================\n');

      setAuth(verifyResponse.token, verifyResponse.user);
      setMessage('Login berhasil!');
      onSuccess(verifyResponse);
    } catch (err) {
      console.error(' [!] Error saat login:', err);
      if (err.name === 'AbortError' || err.name === 'NotAllowedError' || err.message?.includes('timed out')) {
        setLoading(false);
        setMessage('');
        return;
      }
      const errorMsg = err.response?.data?.message || err.message;
      console.log('Pesan Error Login:', errorMsg);
      setError(errorMsg || 'Login gagal, pastikan akun sudah terdaftar.');
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
              className="w-full px-4 py-3 bg-white/3 border border-white/8 rounded-xl text-(--text) placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all text-sm"
              placeholder="Masukkan nama lengkap Anda"
            />
          </div>
        )}

        {/* Input NIK (Untuk Login/Register) */}
        <div>
          <label htmlFor="webauthn-nik" className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-widest text-[10px]">
            Nomor Induk Kependudukan (NIK)
          </label>
          <input
            type="text"
            inputMode="numeric"
            id="webauthn-nik"
            value={nik}
            onChange={handleNikChange}
            required
            disabled={loading}
            className="w-full px-4 py-3 bg-white/3 border border-white/8 rounded-xl text-(--text) placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all text-sm"
            placeholder="Masukkan 16 digit NIK"
          />
          {mode && nik.length > 0 && nik.length < 16 && <p className="text-[10px] text-yellow-400 mt-1.5 font-medium">{nik.length}/16 digit</p>}
        </div>

        {/* Notifikasi Error */}
        {error && <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">{error}</div>}

        {/* Notifikasi Status Proses */}
        {message && <div className="px-4 py-3 bg-emerald-500/6 border border-emerald-500/15 rounded-xl text-emerald-500 font-medium text-sm">{message}</div>}

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
