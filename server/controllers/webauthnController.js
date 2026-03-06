import User from '../models/User.js';
import { getRegistrationOptions, verifyRegistration, getAuthenticationOptions, verifyAuthentication } from '../utils/webauthn.js';
import { generateToken } from '../utils/tokenHelper.js';

// Map buat simpan "tantangan" (challenge) sementara. 
// Ini penting biar gak ada orang yang bisa "replay" atau kirim data login yang sama berulang kali.
const challenges = new Map();

// LANGKAH 1 REGISTRASI: Kasih tau browser apa saja syarat buat daftar passkey baru
export const getRegisterOptions = async (req, res) => {
  try {
    const { email, username: inputUsername } = req.body;

    if (!email || !inputUsername) {
      return res.status(400).json({ message: 'Email dan Nama wajib diisi' });
    }

    // Cari dulu apa email ini sudah punya akun atau belum
    let user = await User.findOne({ email: email.toLowerCase().trim() });

    // Kalau belum punya akun, kita buatkan akun baru (otomatis daftar)
    if (!user) {
      const username = inputUsername.trim();
      if (username.length < 3) {
        return res.status(400).json({ message: 'Nama minimal 3 karakter' });
      }

      // Pastikan nama panggilannya unik
      const existingName = await User.findOne({ username });
      if (existingName) {
        return res.status(400).json({ message: 'Nama sudah terdaftar' });
      }

      try {
        user = new User({
          username,
          email: email.toLowerCase().trim(),
        });
        await user.save();
      } catch (saveError) {
        console.error('Error saving user:', saveError);
        // Jaga-jaga kalau ada balapan (race condition) pendaftaran email yang sama
        if (saveError.code === 11000) {
          return res.status(400).json({ message: 'Email atau Nama sudah terdaftar' });
        }
        return res.status(500).json({ message: 'Gagal membuat akun' });
      }
    }

    // Ambil opsi konfigurasi biometrik dari server (RP ID, Challenge, dll)
    const options = await getRegistrationOptions(user);
    
    // Simpan challenge di memori server buat dicek nanti pas langkah verifikasi
    challenges.set(user._id.toString(), options.challenge);

    res.json(options);
  } catch (error) {
    console.error('Get register options error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// LANGKAH 2 REGISTRASI: Terima hasil scan sidik jari/wajah dari browser dan simpan kuncinya
export const verifyRegister = async (req, res) => {
  try {
    const { email, credential } = req.body;

    if (!email || !credential) {
      return res.status(400).json({ message: 'Email dan kredensial wajib diisi' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }

    // Ambil challenge yang tadi kita simpan di Langkah 1
    const expectedChallenge = challenges.get(user._id.toString());
    if (!expectedChallenge) {
      return res.status(400).json({ message: 'Sesi habis, silakan ulangi langkah awal' });
    }

    // Verifikasi apakah sidik jarinya valid dan cocok dengan tantangan tadi
    const credentialData = await verifyRegistration(credential, expectedChallenge, user);
    
    // Simpan "kunci publik" perangkat user ke database. Kunci privat tetep aman di HP user.
    await user.addWebAuthnCredential(credentialData);

    // Hapus tantangan karena akun sudah berhasil dibuat/didaftar perangkatnya
    challenges.delete(user._id.toString());
    
    // Bikin token JWT biar user langsung otomatis login setelah daftar
    const token = generateToken(user._id);

    res.json({
      message: 'Registrasi berhasil',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role || 'warga',
      }
    });
  } catch (error) {
    console.error('Verify register error:', error);
    res.status(400).json({ message: 'Registrasi ditolak', error: error.message });
  }
};

// LANGKAH 1 LOGIN: Tanya ke browser perangkat mana yang mau dipakai login
export const getLoginOptions = async (req, res) => {
  try {
    const { identifier } = req.body;

    if (!identifier) {
      return res.status(400).json({ message: 'Nama atau Email wajib diisi' });
    }

    // Bisa login pakai Email atau Username
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase().trim() },
        { username: identifier.trim() }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }

    // Cek dulu user ini sudah punya passkey terdaftar atau belum
    if (!user.webauthnCredentials?.length) {
      return res.status(400).json({ message: 'Tidak ada perangkat terdaftar. Silakan daftar dulu.' });
    }

    // Minta opsi login biometrik
    const options = await getAuthenticationOptions(user);
    
    // Simpan tantangan buat dicek pas Langkah 2 nanti
    challenges.set(user._id.toString(), options.challenge);

    res.json(options);
  } catch (error) {
    console.error('Get login options error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// LANGKAH 2 LOGIN: Verifikasi tanda tangan digital biometrik dari user
export const verifyLogin = async (req, res) => {
  try {
    const { identifier, credential } = req.body;

    if (!identifier || !credential) {
      return res.status(400).json({ message: 'Data login tidak lengkap' });
    }

    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase().trim() },
        { username: identifier.trim() }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }

    const expectedChallenge = challenges.get(user._id.toString());
    if (!expectedChallenge) {
      return res.status(400).json({ message: 'Sesi habis, silakan login ulang' });
    }

    const credentialID = credential?.id;
    if (!credentialID) return res.status(400).json({ message: 'ID perangkat tidak valid' });

    // Cari kunci publik yang cocok dengan perangkat yang dikirim browser
    const userCredential = user.webauthnCredentials.find(
      (cred) => cred.credentialID === credentialID || cred.credentialID.trim() === String(credentialID).trim()
    );

    if (!userCredential) {
      return res.status(400).json({ message: 'Perangkat tidak dikenali. Gunakan perangkat yang sudah terdaftar.' });
    }

    // Verifikasi tanda tangan menggunakan kunci publik yang kita simpan di DB
    const verification = await verifyAuthentication(credential, expectedChallenge, user, userCredential);

    if (verification.verified) {
      // Login sukses! Update info keamanan (IP, Device Name, Counter)
      userCredential.counter = verification.newCounter;
      userCredential.lastUsed = new Date();
      user.lastLoginIP = req.ip || req.connection.remoteAddress;
      user.lastLoginUA = req.get('user-agent');
      
      await user.save();

      challenges.delete(user._id.toString());
      const token = generateToken(user._id);

      res.json({
        message: 'Login berhasil',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role || 'warga',
        }
      });
    } else {
      throw new Error('Verifikasi tanda tangan biometrik gagal');
    }
  } catch (error) {
    console.error('Verify login error:', error);
    res.status(400).json({ message: 'Login gagal', error: error.message });
  }
};

// Fungsi info kalau registrasi via password sudah gak ada (sistem 100% passwordless)
export const register = async (req, res) => {
  res.status(410).json({ message: 'Registrasi berbasis password sudah tidak tersedia.' });
};

// Fungsi info kalau login via password sudah ditiadakan
export const login = async (req, res) => {
  res.status(410).json({ message: 'Login berbasis password sudah tidak tersedia.' });
};

