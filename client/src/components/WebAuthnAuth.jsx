import { useState } from 'react';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import { authAPI } from '../services/api';
import { setAuth } from '../utils/auth';
import { Fingerprint } from 'lucide-react';

const WebAuthnAuth = ({ onSuccess, mode = 'login' }) => {
  const [email, setEmail] = useState('');
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
    if (!email) {
      setError('Email harus diisi');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      setMessage('Meminta opsi registrasi...');
      const options = await authAPI.getRegisterOptions(email);

      setMessage('Gunakan authenticator Anda (Touch ID, Face ID, Windows Hello, dll)...');
      const credential = await startRegistration(options);

      setMessage('Memverifikasi registrasi...');
      const verifyResponse = await authAPI.verifyRegister({
        email,
        credential,
      });

      setAuth(verifyResponse.token, verifyResponse.user);
      setMessage('Registrasi berhasil!');
      onSuccess(verifyResponse);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registrasi gagal');
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email harus diisi');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      setMessage('Meminta opsi login...');
      const options = await authAPI.getLoginOptions(email);

      if (!options || !options.challenge) {
        throw new Error('Opsi autentikasi tidak valid dari server');
      }

      setMessage('Gunakan authenticator Anda (Touch ID, Face ID, Windows Hello, dll)...');
      const credential = await startAuthentication(options);

      setMessage('Memverifikasi autentikasi...');
      const verifyResponse = await authAPI.verifyLogin({
        email,
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
        <div>
          <label htmlFor="webauthn-email" className="block text-sm font-medium text-gray-300 mb-2">
            Email
          </label>
          <input
            type="email"
            id="webauthn-email"
            value={email}
            onChange={handleEmailChange}
            required
            disabled={loading}
            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all text-sm"
            placeholder="Masukkan email terdaftar"
          />
        </div>
        {error && (
          <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}
        {message && (
          <div className="px-4 py-3 bg-blue-500/[0.06] border border-blue-500/15 rounded-xl text-blue-400 text-sm">
            {message}
          </div>
        )}
        <button
          type="submit"
          disabled={loading || !email}
          className="w-full px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:hover:bg-blue-600 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
        >
          {loading ? 'Memproses...' : mode === 'register' ? 'Daftar dengan Biometrik' : 'Verifikasi Kunci Keamanan'}
        </button>
      </form>
      {mode === 'login' && (
        <p className="text-sm text-gray-500 text-center">
          Pastikan Anda sudah mendaftar dengan WebAuthn terlebih dahulu
        </p>
      )}
    </div>
  );
};

export default WebAuthnAuth;
