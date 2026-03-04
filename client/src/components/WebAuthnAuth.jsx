import { useState } from 'react';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import { authAPI } from '../services/api';
import { setAuth } from '../utils/auth';
import { Fingerprint } from 'lucide-react';

const WebAuthnAuth = ({ onSuccess, mode = 'login' }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setError('');
    setMessage('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email || !username) {
      setError('Nama dan Email harus diisi');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      setMessage('Meminta opsi registrasi...');
      // Pass both email and username to the backend
      const options = await authAPI.getRegisterOptions(email, username);
      const credential = await startRegistration({
        ...options,
      });

      setMessage('Menyimpan kunci aman...');
      const verifyResponse = await authAPI.verifyRegister({
        email,
        credential,
      });

      setAuth(verifyResponse.token, verifyResponse.user);
      setMessage('Registrasi berhasil!');
      onSuccess(verifyResponse);
    } catch (err) {
      if (err.name === 'InvalidStateError' || err.message?.includes('already registered')) {
        setError('Email ini sudah terdaftar dan passkey sudah ada di perangkat Anda atau tersinkronisasi. Silakan langsung Login.');
      } else {
        setError(err.response?.data?.message || err.message || 'Registrasi gagal');
      }
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    // In login mode, 'email' state acts as the identifier (can be username or email)
    if (!email) {
      setError('Nama atau Email harus diisi');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      setMessage('Meminta opsi login...');
      const options = await authAPI.getLoginOptions(email);

      if (!options || !options.challenge) {
        throw new Error('Gagal menghubungkan ke sistem desa');
      }

      setMessage('Tempelkan jari di sensor HP atau Laptop Anda...');
      const credential = await startAuthentication({
        ...options,
      });

      setMessage('Memverifikasi identitas...');
      const verifyResponse = await authAPI.verifyLogin({
        identifier: email,
        credential,
      });

      setAuth(verifyResponse.token, verifyResponse.user);
      setMessage('Login berhasil!');
      onSuccess(verifyResponse);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Autentikasi gagal');
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={mode === 'register' ? handleRegister : handleLogin} className="space-y-5">
        
        {mode === 'register' && (
          <div>
            <label htmlFor="webauthn-username" className="block text-sm font-medium text-gray-300 mb-2">
              Nama Lengkap/Panggilan
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
              placeholder="Contoh: Budi Santoso"
            />
          </div>
        )}

        <div>
          <label htmlFor="webauthn-email" className="block text-sm font-medium text-gray-300 mb-2">
            {mode === 'register' ? 'Email' : 'Nama atau Email'}
          </label>
          <input
            type={mode === 'register' ? "email" : "text"}
            id="webauthn-email"
            value={email}
            onChange={handleEmailChange}
            required
            disabled={loading}
            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-[var(--text)] placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all text-sm"
            placeholder={mode === 'register' ? "Contoh: budi@gmail.com" : "Masukkan Nama atau Email"}
          />
        </div>

        {error && (
          <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
            <b>Masalah:</b> {error}
          </div>
        )}
        {message && (
          <div className="px-4 py-3 bg-emerald-500/[0.06] border border-emerald-500/15 rounded-xl text-emerald-500 font-medium text-sm">
            {message}
          </div>
        )}
        <button
          type="submit"
          disabled={loading || !email || (mode === 'register' && !username)}
          className="w-full px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 flex items-center justify-center gap-2"
        >
          <Fingerprint className="w-4 h-4" />
          {loading ? 'Memproses...' : mode === 'register' ? 'Daftar dengan Sidik Jari' : 'Masuk dengan Sidik Jari'}
        </button>
      </form>
      {mode === 'login' && (
        <p className="text-sm text-gray-400 text-center">
          Belum punya akun? Yuk daftar dulu agar bisa masuk pakai nama.
        </p>
      )}
    </div>
  );
};

export default WebAuthnAuth;
