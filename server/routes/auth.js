import express from 'express';
import User from '../models/User.js';
import { getRegistrationOptions, verifyRegistration, getAuthenticationOptions, verifyAuthentication } from '../utils/webauthn.js';
import { generateToken } from '../utils/tokenHelper.js';
import { createHash } from '../utils/hash.js';

const router = express.Router();

// Map untuk menyimpan "tantangan" (challenge) acak secara sementara di memori server.
// Key: ID Pengguna (user._id), Value: Challenge String
const challenges = new Map();

// =========================================================================
// --- 1. REGISTRASI WEBAUTHN (PEMBUATAN PASSKEY) ---
// =========================================================================

// LANGKAH 1: Ambil opsi pendaftaran (Challenge, RP ID, dsb) untuk dikirim ke Browser
router.post('/webauthn/register/options', async (req, res) => {
  try {
    const { nik, username: inputUsername } = req.body;
    
    console.log('\n=========================================================================');
    console.log('[REGISTRASI - LANGKAH 1] Menerima permintaan opsi pendaftaran');
    console.log(` -> Input dari User - NIK: "${nik}", Nama: "${inputUsername}"`);

    if (!nik || !inputUsername) {
      console.log(' [!] Gagal: NIK atau Nama kosong.');
      return res.status(400).json({ message: 'NIK dan Nama wajib diisi' });
    }

    // 1. Enkripsi & Pencarian menggunakan Blind Index (nikHash)
    const nikHash = createHash(nik);
    console.log(` -> Melakukan Hashing NIK (HMAC-SHA256) untuk mencari di DB: ${nikHash}`);
    
    let user = await User.findOne({ nikHash });

    // Jika user belum terdaftar, buat akun baru secara otomatis (Auto-register)
    if (!user) {
      console.log(' -> Warga belum terdaftar di DB. Membuat dokumen baru...');
      const username = inputUsername.trim();
      if (username.length < 3) {
        console.log(' [!] Gagal: Nama terlalu pendek.');
        return res.status(400).json({ message: 'Nama minimal 3 karakter' });
      }

      const existingName = await User.findOne({ username });
      if (existingName) {
        console.log(' [!] Gagal: Nama sudah digunakan pengguna lain.');
        return res.status(400).json({ message: 'Nama sudah terdaftar' });
      }

      user = new User({
        username,
        nik: nik.trim(), // Secara otomatis akan di-enkripsi dengan AES-256-CBC oleh Mongoose middleware
        nikHash
      });
      await user.save();
      
      console.log(' -> Berhasil menyimpan warga baru ke MongoDB.');
      console.log(`    - NIK Terenkripsi (AES-256-CBC): ${user.nik}`);
      console.log(`    - NIK Hash (Blind Index): ${user.nikHash}`);
    } else {
      console.log(` -> Warga ditemukan: "${user.username}" (ID: ${user._id})`);
    }

    // 2. Buat opsi registrasi WebAuthn
    console.log(' -> Memanggil getRegistrationOptions() untuk membuat tantangan kriptografi...');
    const options = await getRegistrationOptions(user);
    
    console.log(`    - Challenge yang dibuat server: "${options.challenge}"`);
    console.log(`    - RP ID (Domain Server): "${options.rp.id}"`);
    console.log(`    - User ID (Biner): ${options.user.id}`);

    // 3. Simpan challenge sementara di server RAM Map
    challenges.set(user._id.toString(), options.challenge);
    console.log(` -> Menyimpan challenge di Map server RAM (Key: ${user._id} -> Value: ${options.challenge})`);
    console.log('=========================================================================');

    res.json(options);
  } catch (error) {
    console.error(' [!] Register options error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// LANGKAH 2: Verifikasi kunci publik dari browser dan simpan ke database
router.post('/webauthn/register/verify', async (req, res) => {
  try {
    const { nik, credential } = req.body;

    console.log('\n=========================================================================');
    console.log('[REGISTRASI - LANGKAH 2] Menerima verifikasi kunci publik dari browser');
    console.log(` -> NIK Pengirim: "${nik}"`);
    console.log(` -> Credential ID Perangkat: "${credential.id}"`);

    // 1. Cari user di DB
    const user = await User.findOne({ nikHash: createHash(nik) });
    if (!user) {
      console.log(' [!] Gagal: Pengguna tidak ditemukan.');
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }

    // 2. Ambil challenge yang disimpan di RAM server pada Langkah 1
    const expectedChallenge = challenges.get(user._id.toString());
    console.log(` -> Mencari challenge di RAM Map server untuk User ID: ${user._id}`);
    console.log(`    - Challenge yang diharapkan: "${expectedChallenge}"`);

    if (!expectedChallenge) {
      console.log(' [!] Gagal: Challenge tidak ditemukan / Sesi kedaluwarsa.');
      return res.status(400).json({ message: 'Sesi habis, silakan ulangi' });
    }

    // 3. Verifikasi respons tanda tangan dari browser
    console.log(' -> Memanggil verifyRegistration() untuk memvalidasi tanda tangan kriptografi...');
    const credentialData = await verifyRegistration(credential, expectedChallenge, user);
    
    console.log(' -> Kunci publik valid! Menyimpan perangkat baru ke database...');
    console.log(`    - Kunci Publik (Base64): ${credentialData.credentialPublicKey.slice(0, 30)}...`);
    console.log(`    - Tipe Perangkat: ${credentialData.deviceType}`);

    // Simpan kunci publik ke database & hapus challenge sementara dari memory
    await user.addWebAuthnCredential(credentialData);
    challenges.delete(user._id.toString());
    console.log(' -> Menghapus challenge dari RAM Map server karena registrasi sudah sukses.');

    // 4. Generate JWT Token untuk login otomatis setelah register
    const token = generateToken(user._id);
    console.log(` -> Generate token JWT untuk otorisasi sesi.`);
    console.log('=========================================================================');

    res.json({
      message: 'Registrasi berhasil',
      token,
      user: { id: user._id, username: user.username, nik: user.nik, role: user.role || 'warga' }
    });
  } catch (error) {
    console.error(' [!] Verify register error:', error);
    res.status(400).json({ message: 'Registrasi ditolak', error: error.message });
  }
});

// =========================================================================
// --- 2. LOGIN WEBAUTHN (AUTHENTICATION CEREMONY) ---
// =========================================================================

// LANGKAH 1: Ambil opsi login (Mengirim Challenge baru untuk ditandatangani perangkat)
router.post('/webauthn/login/options', async (req, res) => {
  try {
    const { identifier } = req.body;

    console.log('\n=========================================================================');
    console.log('[LOGIN - LANGKAH 1] Menerima permintaan opsi login');
    console.log(` -> NIK Input: "${identifier}"`);

    // 1. Cari user berdasarkan nikHash
    const user = await User.findOne({ nikHash: createHash(identifier) });
    if (!user) {
      console.log(' [!] Gagal: Pengguna belum terdaftar.');
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }

    // Pastikan user sudah punya perangkat terdaftar
    if (!user.webauthnCredentials?.length) {
      console.log(' [!] Gagal: Warga belum mendaftarkan perangkat biometrik.');
      return res.status(400).json({ message: 'Tidak ada perangkat terdaftar' });
    }

    // 2. Generate tantangan (challenge) autentikasi
    console.log(' -> Memanggil getAuthenticationOptions() untuk membuat tantangan baru...');
    const options = await getAuthenticationOptions(user);
    console.log(`    - Challenge baru yang dihasilkan server: "${options.challenge}"`);
    console.log(`    - Jumlah perangkat yang diperbolehkan login: ${options.allowCredentials.length}`);

    // 3. Simpan challenge sementara di RAM server
    challenges.set(user._id.toString(), options.challenge);
    console.log(` -> Menyimpan challenge di RAM Map server (Key: ${user._id} -> Value: ${options.challenge})`);
    console.log('=========================================================================');

    res.json(options);
  } catch (error) {
    console.error(' [!] Get login options error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// LANGKAH 2: Verifikasi tanda tangan digital biometrik dari perangkat pengguna
router.post('/webauthn/login/verify', async (req, res) => {
  try {
    const { identifier, credential } = req.body;

    console.log('\n=========================================================================');
    console.log('[LOGIN - LANGKAH 2] Menerima verifikasi tanda tangan biometrik perangkat');
    console.log(` -> NIK / Username: "${identifier}"`);
    console.log(` -> Credential ID Perangkat: "${credential.id}"`);

    if (!identifier) {
      console.log(' [!] Gagal: Pengenal kosong.');
      return res.status(400).json({ message: 'NIK atau Username wajib diisi' });
    }

    // 1. Cari user di MongoDB
    const user = await User.findOne({
      $or: [
        { nikHash: createHash(identifier) },
        { username: identifier.trim() }
      ]
    });

    if (!user) {
      console.log(' [!] Gagal: Pengguna tidak ditemukan.');
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }

    // 2. Ambil challenge yang tersimpan di RAM Map server pada Langkah 1
    const expectedChallenge = challenges.get(user._id.toString());
    console.log(` -> Mencari challenge di RAM Map server untuk User ID: ${user._id}`);
    console.log(`    - Challenge yang diharapkan: "${expectedChallenge}"`);

    if (!expectedChallenge) {
      console.log(' [!] Gagal: Sesi Habis. Potensi serangan Replay Attack!');
      return res.status(400).json({
        error: 'Sesi Habis (Potensi Replay Attack)',
        message: 'Sesi habis atau tantangan (challenge) tidak ditemukan.',
        keterangan: 'Server menolak permintaan karena challenge untuk sesi ini telah dihapus. Ini membuktikan data login lama tidak dapat digunakan kembali.'
      });
    }

    // 3. Cari kunci publik perangkat yang cocok di database
    const userCredential = user.webauthnCredentials.find(c => c.credentialID === credential.id);
    if (!userCredential) {
      console.log(` [!] Gagal: Perangkat (Credential ID) tidak terdaftar untuk pengguna: ${user.username}`);
      return res.status(400).json({ message: 'Perangkat tidak terdaftar' });
    }

    console.log(' -> Perangkat terdaftar ditemukan di database.');
    console.log(`    - Kunci Publik Terdaftar: ${userCredential.credentialPublicKey.slice(0, 30)}...`);
    console.log(`    - Counter Sebelumnya: ${userCredential.counter}`);

    // 4. Verifikasi tanda tangan digital menggunakan Kunci Publik
    console.log(' -> Memproses verifikasi tanda tangan kriptografi (verifyAuthentication)...');
    const verification = await verifyAuthentication(credential, expectedChallenge, user, userCredential);
    
    if (verification.verified) {
      console.log(' -> Tanda tangan digital valid! Otentikasi sukses.');
      
      // Update counter di database (untuk menangkal Replay Attack)
      console.log(`    - Counter Baru dari Perangkat: ${verification.newCounter}`);
      userCredential.counter = verification.newCounter;
      userCredential.lastUsed = new Date();
      await user.save();
      console.log(' -> Counter diperbarui di database MongoDB.');

      // Hapus challenge agar tidak dapat digunakan lagi (One-time use)
      challenges.delete(user._id.toString());
      console.log(' -> Menghapus challenge dari RAM Map server untuk mencegah Replay Attack.');

      // Generate JWT Token
      const token = generateToken(user._id);
      console.log(` -> Generate token JWT untuk akses warga.`);
      console.log('=========================================================================');

      res.json({
        message: 'Login berhasil',
        token,
        user: { id: user._id, username: user.username, nik: user.nik, role: user.role || 'warga' }
      });
    } else {
      throw new Error('Verifikasi tanda tangan kriptografi gagal');
    }
  } catch (error) {
    console.error(' [!] Verify login error:', error);
    if (error.message && error.message.toLowerCase().includes('challenge')) {
      console.log(' [!] Gagal: Tantangan Tidak Cocok! Potensi manipulasi replay.');
      return res.status(400).json({
        error: 'Tantangan Tidak Cocok (Challenge Mismatch)',
        message: error.message,
        keterangan: 'Server menolak permintaan karena tanda tangan biometrik lama dikirimkan dengan challenge baru. Ini membuktikan replay attack berhasil digagalkan.'
      });
    }
    res.status(400).json({ message: 'Login gagal', error: error.message });
  }
});

export default router;
