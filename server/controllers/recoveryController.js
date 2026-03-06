import User from '../models/User.js';
import { getRegistrationOptions, verifyRegistration } from '../utils/webauthn.js';
import { generateToken } from '../utils/tokenHelper.js';

// Map untuk simpan challenge WebAuthn sementara selama proses recovery/daftar ulang
const recoveryChallenges = new Map();

// Fungsi buat bikin kode pemulihan (Backup Codes) baru
export const generateCodes = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    // Panggil method di model User untuk generate 4 kode acak
    const codes = await user.generateRecoveryCodes();

    res.json({
      message: 'Kode pemulihan berhasil dibuat',
      codes,
      count: codes.length,
      warning: 'Simpan kode ini di tempat yang aman. Setiap kode hanya bisa digunakan satu kali.',
    });
  } catch (error) {
    console.error('Generate recovery codes error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verifikasi kode pemulihan kalau user kehilangan perangkat biometriknya
export const verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email dan kode pemulihan wajib diisi' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    // Cek apakah kodenya cocok dan belum pernah dipakai
    const isValid = await user.useRecoveryCode(code);
    if (!isValid) {
      return res.status(401).json({ message: 'Kode pemulihan tidak valid atau sudah digunakan' });
    }

    // PENTING: Jika kode valid, kita kasih token sementara (berlaku cuma 1 jam).
    // Token ini dipakai HANYA untuk mengizinkan user mendaftarkan perangkat biometrik baru.
    const tempToken = generateToken(user._id, '1h');

    const remainingCodes = user.backupCodes.filter((c) => !c.used).length;

    res.json({
      message: 'Kode valid! Silakan daftarkan perangkat baru Anda.',
      token: tempToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      remainingCodes,
    });
  } catch (error) {
    console.error('Verify recovery code error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Siapkan opsi WebAuthn untuk daftar ulang perangkat baru (setelah recovery)
export const reRegisterOptions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    // Ambil parameter konfigurasi biometrik dari server
    const options = await getRegistrationOptions(user);
    
    // Simpan challenge biar nanti bisa dicocokkan saat verifikasi
    recoveryChallenges.set(user._id.toString(), options.challenge);

    res.json(options);
  } catch (error) {
    console.error('Re-register options error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verifikasi dan simpan perangkat biometrik baru hasil recovery
export const reRegister = async (req, res) => {
  const startTime = Date.now();

  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: 'Kredensial wajib diisi' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    // Pastikan challenge-nya masih ada dan cocok
    const expectedChallenge = recoveryChallenges.get(user._id.toString());
    if (!expectedChallenge) {
      return res.status(400).json({ message: 'Sesi habis atau tantangan tidak ditemukan. Silakan ulang.' });
    }

    // Verifikasi data biometrik baru yang dikirim browser
    const credentialData = await verifyRegistration(credential, expectedChallenge, user);
    
    // Tambahkan perangkat baru ke database user
    await user.addWebAuthnCredential(credentialData);

    // Bersihkan challenge karena sudah dipakai
    recoveryChallenges.delete(user._id.toString());

    const duration = Date.now() - startTime;
    
    // Berikan token akses penuh yang baru
    const token = generateToken(user._id);

    // Otomatis bikin kode pemulihan baru sebagai pengganti yang tadi sudah terpakai
    const newCodes = await user.generateRecoveryCodes();

    res.json({
      message: 'Perangkat baru berhasil didaftarkan!',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      newRecoveryCodes: newCodes,
      duration,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('Re-register error:', error);
    res.status(400).json({ message: 'Gagal mendaftarkan perangkat baru', error: error.message });
  }
};
