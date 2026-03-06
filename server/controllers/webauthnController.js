import User from '../models/User.js';
import { getRegistrationOptions, verifyRegistration, getAuthenticationOptions, verifyAuthentication } from '../utils/webauthn.js';
import { generateToken } from '../utils/tokenHelper.js';

// Simpan tantangan/challenge sementara di memori
const challenges = new Map();

// OPSI REGISTRASI: Menyiapkan parameter WebAuthn untuk pendaftaran perangkat baru
export const getRegisterOptions = async (req, res) => {
  try {
    const { email, username: inputUsername } = req.body;

    if (!email || !inputUsername) {
      return res.status(400).json({ message: 'Email dan Nama wajib diisi' });
    }

    let user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      const username = inputUsername.trim();
      if (username.length < 3) {
        return res.status(400).json({ message: 'Nama minimal 3 karakter' });
      }

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
        if (saveError.code === 11000) {
          return res.status(400).json({ message: 'Email atau Nama sudah terdaftar' });
        }
        return res.status(500).json({ message: 'Gagal membuat akun' });
      }
    }

    if (!user._id) {
      return res.status(500).json({ message: 'ID User tidak ditemukan' });
    }

    const options = await getRegistrationOptions(user);
    challenges.set(user._id.toString(), options.challenge);

    res.json(options);
  } catch (error) {
    console.error('Get register options error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// VERIFIKASI REGISTRASI: Validasi data biometrik dan simpan kredensial ke DB
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

    const expectedChallenge = challenges.get(user._id.toString());
    if (!expectedChallenge) {
      return res.status(400).json({ message: 'Sesi habis, silakan ulangi' });
    }

    const credentialData = await verifyRegistration(credential, expectedChallenge, user);
    await user.addWebAuthnCredential(credentialData);

    challenges.delete(user._id.toString());
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

// OPSI LOGIN: Menyiapkan challenge untuk proses login
export const getLoginOptions = async (req, res) => {
  try {
    const { identifier } = req.body;

    if (!identifier) {
      return res.status(400).json({ message: 'Nama atau Email wajib diisi' });
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

    if (!user.webauthnCredentials?.length) {
      return res.status(400).json({ message: 'Tidak ada perangkat terdaftar' });
    }

    const options = await getAuthenticationOptions(user);
    challenges.set(user._id.toString(), options.challenge);

    res.json(options);
  } catch (error) {
    console.error('Get login options error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// VERIFIKASI LOGIN: Validasi tanda tangan biometrik untuk masuk ke sistem
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
      return res.status(400).json({ message: 'Sesi habis, silakan ulangi' });
    }

    const credentialID = credential?.id;
    if (!credentialID) return res.status(400).json({ message: 'ID perangkat tidak valid' });

    // Cari kredensial yang cocok di database
    const userCredential = user.webauthnCredentials.find(
      (cred) => cred.credentialID === credentialID || cred.credentialID.trim() === String(credentialID).trim()
    );

    if (!userCredential) {
      return res.status(400).json({ message: 'Perangkat tidak dikenali' });
    }

    const verification = await verifyAuthentication(credential, expectedChallenge, user, userCredential);

    if (verification.verified) {
      // Update data kredensial dan user dalam satu kali save
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
      throw new Error('Verifikasi gagal');
    }
  } catch (error) {
    console.error('Verify login error:', error);
    res.status(400).json({ message: 'Login gagal', error: error.message });
  }
};

