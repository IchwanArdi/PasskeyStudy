import express from 'express';
import User from '../models/User.js';
import { getRegistrationOptions, verifyRegistration, getAuthenticationOptions, verifyAuthentication } from '../utils/webauthn.js';
import { generateToken } from '../utils/tokenHelper.js';
import { createHash } from '../utils/hash.js';

const router = express.Router();

// Map buat simpan "tantangan" (challenge) sementara
const challenges = new Map();

// --- 1. REGISTRASI WEBAUTHN ---

// Langkah 1: Ambil opsi pendaftaran (RP ID, Challenge, dll)
router.post('/webauthn/register/options', async (req, res) => {
  try {
    const { email, username: inputUsername } = req.body;
    if (!email || !inputUsername) return res.status(400).json({ message: 'Email dan Nama wajib diisi' });

    // Cari berdasarkan Blind Index (emailHash)
    let user = await User.findOne({ emailHash: createHash(email) }); 
    
    // Jika belum ada, buatkan akun baru (Otomatis daftar)
    if (!user) {
      const username = inputUsername.trim();
      if (username.length < 3) return res.status(400).json({ message: 'Nama minimal 3 karakter' });
      
      const existingName = await User.findOne({ username });
      if (existingName) return res.status(400).json({ message: 'Nama sudah terdaftar' });

      user = new User({ 
        username, 
        email: email.toLowerCase().trim(),
        emailHash: createHash(email) 
      });
      await user.save();
    }

    const options = await getRegistrationOptions(user);
    challenges.set(user._id.toString(), options.challenge);
    res.json(options);
  } catch (error) {
    console.error('Register options error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Langkah 2: Verifikasi sidik jari/wajah dan simpan kuncinya
router.post('/webauthn/register/verify', async (req, res) => {
  try {
    const { email, credential } = req.body;
    const user = await User.findOne({ emailHash: createHash(email) });
    if (!user) return res.status(404).json({ message: 'Pengguna tidak ditemukan' });

    const expectedChallenge = challenges.get(user._id.toString());
    if (!expectedChallenge) return res.status(400).json({ message: 'Sesi habis, silakan ulangi' });

    const credentialData = await verifyRegistration(credential, expectedChallenge, user);
    await user.addWebAuthnCredential(credentialData);
    challenges.delete(user._id.toString());
    
    const token = generateToken(user._id);
    res.json({ 
      message: 'Registrasi berhasil', 
      token, 
      user: { id: user._id, username: user.username, email: user.email, role: user.role || 'warga' } 
    });
  } catch (error) {
    console.error('Verify register error:', error);
    res.status(400).json({ message: 'Registrasi ditolak', error: error.message });
  }
});

// --- 2. LOGIN WEBAUTHN ---

// Langkah 1: Ambil opsi login (Minta browser scan sidik jari)
router.post('/webauthn/login/options', async (req, res) => {
  try {
    const { identifier } = req.body;
    // Cari user berdasarkan username ATAU emailHash (jika dia input berupa email)
    const user = await User.findOne({ 
      $or: [
        { emailHash: createHash(identifier) }, 
        { username: identifier.trim() }
      ] 
    });
    if (!user) return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    if (!user.webauthnCredentials?.length) return res.status(400).json({ message: 'Tidak ada perangkat terdaftar' });

    const options = await getAuthenticationOptions(user);
    challenges.set(user._id.toString(), options.challenge);
    res.json(options);
  } catch (error) {
    console.error('Get login options error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Langkah 2: Verifikasi tanda tangan digital biometrik
router.post('/webauthn/login/verify', async (req, res) => {
  try {
    const { identifier, credential } = req.body;
    const user = await User.findOne({ 
      $or: [
        { emailHash: createHash(identifier) }, 
        { username: identifier.trim() }
      ] 
    });
    if (!user) return res.status(404).json({ message: 'Pengguna tidak ditemukan' });

    const expectedChallenge = challenges.get(user._id.toString());
    if (!expectedChallenge) return res.status(400).json({ message: 'Sesi habis' });

    const userCredential = user.webauthnCredentials.find(c => c.credentialID === credential.id);
    if (!userCredential) return res.status(400).json({ message: 'Perangkat tidak dikenali' });

    const verification = await verifyAuthentication(credential, expectedChallenge, user, userCredential);
    if (verification.verified) {
      userCredential.counter = verification.newCounter;
      userCredential.lastUsed = new Date();
      await user.save();
      
      challenges.delete(user._id.toString());
      const token = generateToken(user._id);
      
      res.json({ 
        message: 'Login berhasil', 
        token, 
        user: { id: user._id, username: user.username, email: user.email, role: user.role || 'warga' } 
      });
    } else {
      throw new Error('Verifikasi gagal');
    }
  } catch (error) {
    console.error('Verify login error:', error);
    res.status(400).json({ message: 'Login gagal', error: error.message });
  }
});

export default router;
