import express from 'express';
import User from '../models/User.js';
import { getRegistrationOptions, verifyRegistration } from '../utils/webauthn.js';
import { generateToken } from '../utils/tokenHelper.js';
import { authenticate } from '../middleware/auth.js';
import { createHash } from '../utils/hash.js';

const router = express.Router();

// Map challenge pemulihan
const recoveryChallenges = new Map();

// --- 1. BACKUP CODES (UNTUK USER) ---

// Buat kode pemulihan baru
router.post('/generate-codes', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const codes = await user.generateRecoveryCodes();
    res.json({ message: 'Kode pemulihan berhasil dibuat', codes });
  } catch (error) {
    res.status(500).json({ message: 'Gagal membuat kode' });
  }
});

// Pakai kode pemulihan buat masuk
router.post('/verify-code', async (req, res) => {
  const { nik, code } = req.body;
  const user = await User.findOne({ nikHash: createHash(nik) });
  if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
  
  const isValid = await user.useRecoveryCode(code);
  if (!isValid) return res.status(401).json({ message: 'Kode tidak valid/sudah dipakai' });

  // Kasih token sementara buat daftar HP baru
  const tempToken = generateToken(user._id, '1h');
  res.json({ message: 'Kode valid! Silakan daftarkan perangkat baru.', token: tempToken });
});

// --- 2. RECOVERY WEBAUTHN (DAFTAR ULANG) ---

// Opsi daftar ulang (Boleh perangkat lama yang sama)
router.post('/re-register/options', authenticate, async (req, res) => {
  const user = await User.findById(req.user._id);
  const options = await getRegistrationOptions(user, true); // true = allowExisting
  recoveryChallenges.set(user._id.toString(), options.challenge);
  res.json(options);
});

// Verifikasi dan simpan perangkat hasil recovery
router.post('/re-register/verify', authenticate, async (req, res) => {
  const { credential } = req.body;
  const user = await User.findById(req.user._id);
  const expected = recoveryChallenges.get(user._id.toString());
  if (!expected) return res.status(400).json({ message: 'Sesi habis' });

  try {
    const credentialData = await verifyRegistration(credential, expected, user);
    
    // Simpan perangkat (jika ID sama, kita timpa yang lama/update)
    const existIdx = user.webauthnCredentials.findIndex(c => c.credentialID === credentialData.credentialID);
    if (existIdx !== -1) user.webauthnCredentials[existIdx] = { ...user.webauthnCredentials[existIdx], ...credentialData };
    else user.webauthnCredentials.push(credentialData);
    
    await user.save();
    recoveryChallenges.delete(user._id.toString());
    
    const token = generateToken(user._id);
    const newCodes = await user.generateRecoveryCodes(); // Otomatis refresh kode cadangan
    res.json({ message: 'Akun berhasil dipulihkan!', token, newRecoveryCodes: newCodes });
  } catch (error) {
    res.status(400).json({ message: 'Gagal daftar ulang', error: error.message });
  }
});

// --- 3. DARURAT (ADMIN) ---

// Admin bikin kode darurat buat warga yang hilang segalanya
router.post('/admin/emergency-code', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Akses ditolak' });
  
  const user = await User.findById(req.body.userId);
  if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
  
  const code = await user.generateEmergencyCode();
  res.json({ message: 'Kode darurat dibuat', code, username: user.username });
});

export default router;
