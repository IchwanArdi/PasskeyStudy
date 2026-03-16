import express from 'express';
import User from '../models/User.js';
import { getRegistrationOptions, verifyRegistration } from '../utils/webauthn.js';
import { authenticate } from '../middleware/auth.js';
import { createHash } from '../utils/hash.js';

const router = express.Router();

// Map buat simpan challenge nambah perangkat baru
const addDeviceChallenges = new Map();

// Middleware buat cek Admin
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Akses ditolak, khusus admin.' });
  next();
};

// --- 1. PROFIL USER ---

// Ambil data profil saya
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update data profil (Nama/Email)
router.put('/me', authenticate, async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = await User.findById(req.user._id);
    if (username) user.username = username;
    if (email) {
      const exist = await User.findOne({ emailHash: createHash(email), _id: { $ne: user._id } });
      if (exist) return res.status(400).json({ message: 'Email sudah dipakai akun lain' });
      user.email = email;
    }
    await user.save();
    res.json({ message: 'Profil diperbarui', user: { id: user._id, username: user.username, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update profil' });
  }
});

// Hapus akun pengguna (Permanen)
router.delete('/me', authenticate, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: 'Akun berhasil dihapus secara permanen' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus akun' });
  }
});

// --- 2. MANAJEMEN PERANGKAT (PASSKEYS) ---

// Daftar perangkat terdaftar
router.get('/credentials', authenticate, async (req, res) => {
  const user = await User.findById(req.user._id).select('webauthnCredentials');
  res.json(user.webauthnCredentials);
});

// Hapus perangkat
router.delete('/credentials/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    await user.removeWebAuthnCredential(req.params.id);
    res.json({ message: 'Perangkat berhasil dihapus' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Ganti nama perangkat
router.put('/credentials/:id/nickname', authenticate, async (req, res) => {
  const user = await User.findById(req.user._id);
  const cred = user.webauthnCredentials.find(c => c.credentialID === req.params.id);
  if (!cred) return res.status(404).json({ message: 'Perangkat tidak ditemukan' });
  cred.nickname = req.body.nickname?.trim() || 'Perangkat Baru';
  await user.save();
  res.json({ message: 'Nama perangkat diperbarui' });
});

// Nambah perangkat baru (Langkah 1)
router.post('/credentials/add-options', authenticate, async (req, res) => {
  const user = await User.findById(req.user._id);
  const options = await getRegistrationOptions(user);
  addDeviceChallenges.set(user._id.toString(), options.challenge);
  res.json(options);
});

// Nambah perangkat baru (Langkah 2)
router.post('/credentials/add-verify', authenticate, async (req, res) => {
  const { credential, nickname } = req.body;
  const user = await User.findById(req.user._id);
  const expected = addDeviceChallenges.get(user._id.toString());
  if (!expected) return res.status(400).json({ message: 'Sesi habis' });
  
  try {
    const credentialData = await verifyRegistration(credential, expected, user);
    if (nickname) credentialData.nickname = nickname.trim();
    await user.addWebAuthnCredential(credentialData);
    addDeviceChallenges.delete(user._id.toString());
    res.json({ message: 'Perangkat baru ditambahkan' });
  } catch (error) {
    res.status(400).json({ message: 'Gagal verifikasi perangkat', error: error.message });
  }
});


// --- 3. MANAJEMEN ADMIN ---

// Liat semua warga (Admin saja)
router.get('/admin/semua', authenticate, adminOnly, async (req, res) => {
  const users = await User.find().select('username email role createdAt').sort({ createdAt: -1 });
  res.json({ users });
});

// Ubah jabatan (Warga <-> Admin)
router.put('/admin/role', authenticate, adminOnly, async (req, res) => {
  const { userId, role } = req.body;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
  user.role = role;
  await user.save();
  res.json({ message: `Jabatan diubah menjadi ${role}` });
});

export default router;
