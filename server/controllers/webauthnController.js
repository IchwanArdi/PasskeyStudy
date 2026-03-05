import User from '../models/User.js';
import { getRegistrationOptions, verifyRegistration, getAuthenticationOptions, verifyAuthentication } from '../utils/webauthn.js';
import { generateToken } from '../utils/tokenHelper.js';

// Simpan tantangan/challenge sementara
// NOTE: Untuk production multi-instance, gunakan Redis atau MongoDB TTL collection
const challenges = new Map();

// CONTROLLER REGISTRASI 1: Endpoint awal registrasi. Menyiapkan parameter WebAuthn (seperti challenge & RP ID) untuk merangsang authenticator perangkat.
export const getRegisterOptions = async (req, res) => {
  try {
    const { email, username: inputUsername } = req.body;

    if (!email || !inputUsername) {
      return res.status(400).json({ message: 'Email dan Nama tidak boleh kosong' });
    }

    // Cari user berdasarkan email (abaikan huruf besar/kecil)
    let user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      // Validasi dan bersihkan spasi pada nama
      const username = inputUsername.trim();
      if (username.length < 3) {
        return res.status(400).json({ message: 'Nama harus terdiri dari minimal 3 karakter' });
      }

      // Cek apakah nama sudah dipakai
      const existingName = await User.findOne({ username });
      if (existingName) {
        return res.status(400).json({ message: 'Nama ini sudah terdaftar. Silakan gunakan nama lain atau tambahkan angka di belakang nama Anda.' });
      }

      try {
        user = new User({
          username,
          email: email.toLowerCase().trim(),
        });
        await user.save();
        await user.save();
      } catch (saveError) {
        console.error('Error saving user (WebAuthn registration):', saveError);
        
        if (saveError.code === 11000) {
          return res.status(400).json({ message: 'Email atau Nama ini sudah terdaftar.' });
        } else if (saveError.name === 'ValidationError') {
          return res.status(400).json({
            message: 'Validasi gagal',
            errors: Object.values(saveError.errors || {}).map((err) => err.message),
          });
        }
        
        return res.status(500).json({ message: 'Gagal membuat akun' });
      }
    } else {
      // Jika user sudah ada, gunakan user tersebut untuk menambah perangkat WebAuthn baru

    }

    // Pastikan user memiliki ID (_id)
    if (!user._id) {
      return res.status(500).json({ message: 'ID User tidak ditemukan' });
    }

    const options = await getRegistrationOptions(user);

    // Simpan challenge ke memori
    challenges.set(user._id.toString(), options.challenge);

    res.json(options);
  } catch (error) {
    console.error('Get register options error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

// CONTROLLER REGISTRASI 2: Endpoint kedua registrasi. Mengurai data biometrik yang dibalikan oleh browser.
// Jika valid, Public Key dan Credential ID dari perangkat user akan di-save permanen ke DB.
export const verifyRegister = async (req, res) => {
  const startTime = Date.now();

  try {
    const { email, credential } = req.body;

    if (!email || !credential) {
      return res.status(400).json({ message: 'Email dan kredensial FIDO wajib dikirim' });
    }

    // Find user with normalized email (case-insensitive)
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }

    const expectedChallenge = challenges.get(user._id.toString());
    if (!expectedChallenge) {
      return res.status(400).json({ message: 'Sesi habis. Silakan ulangi proses pendaftaran.' });
    }



    let credentialData;
    try {
      credentialData = await verifyRegistration(credential, expectedChallenge, user);
    } catch (verifyError) {
      console.error('Verify registration error:', verifyError);
      const duration = Date.now() - startTime;
      return res.status(400).json({
        message: 'Verifikasi pendaftaran ditolak klien',
        error: verifyError.message,
      });
    }

    // Tambahkan kredensial ke akun user
    await user.addWebAuthnCredential(credentialData);

    // Clear challenge
    challenges.delete(user._id.toString());

    const duration = Date.now() - startTime;
    const token = generateToken(user._id);

    res.json({
      message: 'Kredensial WebAuthn berhasil didaftarkan',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role || 'warga',
      },
      duration,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('Verify register error:', error);

    res.status(400).json({ message: 'Verifikasi pendaftaran ditolak klien', error: error.message });
  }
};

// CONTROLLER LOGIN 1: Endpoint awal login. Meracik parameter challenge khusus untuk user yang mencoba masuk
export const getLoginOptions = async (req, res) => {
  try {
    const { identifier } = req.body;

    if (!identifier) {
      return res.status(400).json({ message: 'Nama atau Email dibutuhkan' });
    }

    // Find user with normalized email (case-insensitive) or username
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase().trim() },
        { username: identifier.trim() }
      ]
    });
    if (!user) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }

    if (!user.webauthnCredentials || user.webauthnCredentials.length === 0) {
      return res.status(400).json({ message: 'Tidak ada perangkat WebAuthn yang ditemukan untuk pengguna ini' });
    }

    // Pastikan semua perangkat FIDO memiliki counter minimal 0
    user.webauthnCredentials.forEach((cred) => {
      if (cred.counter === undefined || cred.counter === null) {
        cred.counter = 0;
      }
    });

    const options = await getAuthenticationOptions(user);

    // Simpan challenge ke memori
    challenges.set(user._id.toString(), options.challenge);

    res.json(options);
  } catch (error) {
    console.error('Get login options error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// CONTROLLER LOGIN 2: Endpoint penentuan login. Membandingkan "tanda tangan" kriptografi dari browser 
// dengan Public Key milik user yang sudah tersimpan di database saat registrasi.
export const verifyLogin = async (req, res) => {
  const startTime = Date.now();

  try {
    const { identifier, credential } = req.body;

    if (!identifier || !credential) {
      return res.status(400).json({ message: 'Nama/Email dan credential dibutuhkan' });
    }

    // Find user with normalized email (case-insensitive) or username
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase().trim() },
        { username: identifier.trim() }
      ]
    });
    if (!user) {
      const duration = Date.now() - startTime;
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }

    if (!user.webauthnCredentials || user.webauthnCredentials.length === 0) {
      const duration = Date.now() - startTime;
      return res.status(400).json({ message: 'Tidak ada data perangkat WebAuthn yang terdaftar untuk akun ini' });
    }

    const expectedChallenge = challenges.get(user._id.toString());
    if (!expectedChallenge) {
      return res.status(400).json({ message: 'Sesi habis. Silakan mulai ulang login.' });
    }

    // Cari kredensial yang sedang dipakai (format base64url)
    const credentialID = credential?.id;

    if (!credentialID) {
      const duration = Date.now() - startTime;
      return res.status(400).json({ message: 'ID perangkat tidak dikirimkan' });
    }

    // Normalisasi ID kredensial menjadi string murni
    const normalizedCredentialID = typeof credentialID === 'string' ? credentialID : credentialID.toString();


    // Cari kredensial yang cocok di database (tepat sama atau setelah di-trim)
    let userCredential = user.webauthnCredentials.find((cred) => {
      if (!cred.credentialID) return false;
      // Pencarian presisi
      if (cred.credentialID === normalizedCredentialID) return true;
      // Cadangan: bandingkan bentuk string trim-nya
      return cred.credentialID.trim() === normalizedCredentialID.trim();
    });

    if (!userCredential) {
      const duration = Date.now() - startTime;
      return res.status(400).json({
        message: 'Perangkat tidak dikenali. Pastikan Anda menggunakan kunci FIDO / Authenticator yang tepat.',
        debug:
          process.env.NODE_ENV === 'development'
            ? {
                requestedID: normalizedCredentialID.substring(0, 30),
                availableIDs: user.webauthnCredentials.map((c) => c.credentialID?.substring(0, 30)),
              }
            : undefined,
      });
    }

    // Setel default counter ke 0 jika kosong
    if (userCredential.counter === undefined || userCredential.counter === null) {
      userCredential.counter = 0;

    }

    // Pastikan nilai counter adalah angka murni
    userCredential.counter = Number(userCredential.counter) || 0;

    // Validasi atribut data kredensial lengkap
    if (!userCredential.credentialID || !userCredential.credentialPublicKey) {
      const duration = Date.now() - startTime;
      return res.status(400).json({ message: 'Data perangkat login tidak lengkap' });
    }


    const verification = await verifyAuthentication(credential, expectedChallenge, user, userCredential);

    if (verification.verified) {
      // Update hitungan keamanan kredensial
      await user.updateCredentialCounter(userCredential.credentialID, verification.newCounter);

      // Perbarui waktu login terakhir perangkat
      userCredential.lastUsed = new Date();

      // Bebaskan tantangan dari RAM
      challenges.delete(user._id.toString());

      // Assess Risk - Removed Risk Engine Logic
      const currentIP = req.ip || req.connection.remoteAddress;
      const currentUA = req.get('user-agent');

      const duration = Date.now() - startTime;
      const token = generateToken(user._id);

      // Simpan catatan IP / perangkat login terakhir user
      user.lastLoginIP = currentIP;
      user.lastLoginUA = currentUA;
      await user.save();

      res.json({
        message: 'Login berhasil',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role || 'warga',
        },
        duration,
      });
    } else {
      throw new Error('Verifikasi sesi login ditolak oleh sistem');
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('Verify login error:', error);

    res.status(400).json({ message: 'Verifikasi sesi login ditolak oleh sistem', error: error.message });
  }
};
