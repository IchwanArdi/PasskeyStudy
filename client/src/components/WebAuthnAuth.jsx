import { useState } from 'react';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import { authAPI } from '../services/api';
import { setAuth } from '../utils/auth';

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
      setError('Email is required');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Step 1: Get registration options
      setMessage('Requesting registration options...');
      const optionsResponse = await authAPI.getRegisterOptions(email);
      const options = optionsResponse.data;

      // Step 2: Start registration
      setMessage('Please use your authenticator (Touch ID, Face ID, Windows Hello, etc.)...');
      const credential = await startRegistration(options);

      // Step 3: Verify registration
      setMessage('Verifying registration...');
      const verifyResponse = await authAPI.verifyRegister({
        email,
        credential,
      });

      setAuth(verifyResponse.data.token, verifyResponse.data.user);
      setMessage('Registration successful!');
      onSuccess(verifyResponse.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Step 1: Get authentication options
      setMessage('Requesting login options...');
      const optionsResponse = await authAPI.getLoginOptions(email);
      const options = optionsResponse.data;

      // Validate options structure
      if (!options || !options.challenge) {
        throw new Error('Invalid authentication options received from server');
      }

      // Step 2: Start authentication
      setMessage('Please use your authenticator (Touch ID, Face ID, Windows Hello, etc.)...');
      const credential = await startAuthentication(options);

      // Step 3: Verify authentication
      setMessage('Verifying authentication...');
      const verifyResponse = await authAPI.verifyLogin({
        email,
        credential,
      });

      setAuth(verifyResponse.data.token, verifyResponse.data.user);
      setMessage('Login successful!');
      onSuccess(verifyResponse.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication failed');
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">WebAuthn / FIDO2 Authentication</h3>
        <p className="text-sm text-gray-400">Daftar langsung dengan autentikasi biometrik (Touch ID, Face ID, Windows Hello) atau security keys. Tidak perlu password!</p>
      </div>
      <form onSubmit={mode === 'register' ? handleRegister : handleLogin} className="space-y-4">
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
            className="w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Masukkan email"
          />
        </div>
        {error && <div className="px-4 py-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">{error}</div>}
        {message && <div className="px-4 py-3 bg-blue-500/10 border border-blue-500/50 rounded-lg text-blue-400 text-sm">{message}</div>}
        <button
          type="submit"
          disabled={loading || !email}
          className="w-full px-4 py-2.5 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition-all transform duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? 'Memproses...' : mode === 'register' ? 'Daftar dengan WebAuthn' : 'Masuk dengan WebAuthn'}
        </button>
      </form>
      {mode === 'login' && <p className="text-xs text-gray-500 text-center mt-4">Pastikan Anda sudah mendaftar dengan WebAuthn terlebih dahulu</p>}
    </div>
  );
};

export default WebAuthnAuth;
