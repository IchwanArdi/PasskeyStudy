import User from '../models/User.js';
import { getRegistrationOptions, verifyRegistration } from '../utils/webauthn.js';

// Map buat simpan challenge sementara pas user mau nambah perangkat baru
// NOTE: Kalau sudah banyak user, sebaiknya pakai Redis biar gak menuhin RAM
const addDeviceChallenges = new Map();

// Ambil data profil user yang sedang login
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update data profil (Username & Email)
export const updateUserProfile = async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = await User.findById(req.user._id);

    if (username) user.username = username;
    
    // Kalau email diubah, cek dulu apa sudah dipakai orang lain atau belum
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email sudah terdaftar di akun lain' });
      }
      user.email = email;
    }

    await user.save();

    res.json({
      message: 'Profil berhasil diperbarui',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Ambil daftar perangkat biometrik (Passkeys) yang sudah didaftarkan user
export const getUserCredentials = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('webauthnCredentials');
    res.json(user.webauthnCredentials);
  } catch (error) {
    console.error('Get credentials error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Hapus pendaftaran perangkat (Revoke Access)
export const deleteCredential = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    // Panggil fungsi di model User buat hapus kredensial berdasarkan ID-nya
    await user.removeWebAuthnCredential(id);

    res.json({
      message: 'Perangkat berhasil dihapus',
      remainingCredentials: user.webauthnCredentials.length,
    });
  } catch (error) {
    console.error('Delete credential error:', error);
    // Berikan pesan error yang jelas kalau user coba hapus perangkat terakhir
    const statusCode = error.message.includes('tidak ditemukan') ? 404 : 
                       error.message.includes('Tidak dapat menghapus') ? 400 : 500;
    res.status(statusCode).json({ message: error.message });
  }
};

// Ganti nama panggilan (nickname) perangkat biar gampang dikenali
export const updateCredentialNickname = async (req, res) => {
  try {
    const { id } = req.params;
    const { nickname } = req.body;

    if (!nickname || nickname.trim().length === 0) {
      return res.status(400).json({ message: 'Nama perangkat tidak boleh kosong' });
    }

    if (nickname.length > 50) {
      return res.status(400).json({ message: 'Nama perangkat maksimal 50 karakter' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const credential = user.webauthnCredentials.find(
      (cred) => cred.credentialID === id
    );

    if (!credential) {
      return res.status(404).json({ message: 'Perangkat tidak ditemukan' });
    }

    credential.nickname = nickname.trim();
    await user.save();

    res.json({
      message: 'Nama perangkat berhasil diperbarui',
      credential: {
        credentialID: credential.credentialID,
        nickname: credential.nickname,
      },
    });
  } catch (error) {
    console.error('Update nickname error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Siapkan opsi pendaftaran untuk nambah perangkat baru (user posisi sudah login)
export const getAddDeviceOptions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const options = await getRegistrationOptions(user);

    // Simpan challenge di Map (memori) untuk verifikasi nanti
    addDeviceChallenges.set(user._id.toString(), options.challenge);

    res.json(options);
  } catch (error) {
    console.error('Add device options error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verifikasi dan simpan kunci biometrik perangkat baru
export const verifyAddDevice = async (req, res) => {
  try {
    const { credential, nickname } = req.body;

    if (!credential) {
      return res.status(400).json({ message: 'Data kredensial diperlukan' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    // Cocokkan challenge yang dikirim browser dengan yang ada di memori server
    const expectedChallenge = addDeviceChallenges.get(user._id.toString());
    if (!expectedChallenge) {
      return res.status(400).json({
        message: 'Tantangan (challenge) kedaluwarsa. Silakan ulangi lagi.',
      });
    }

    // Verifikasi tanda tangan biometrik perangkat baru
    const credentialData = await verifyRegistration(credential, expectedChallenge, user);

    // Kasih nama perangkat kalau user input, kalau gak pakai default
    if (nickname && nickname.trim().length > 0) {
      credentialData.nickname = nickname.trim();
    }

    // Simpan ke array kredensial user di database
    await user.addWebAuthnCredential(credentialData);

    // Hapus challenge dari memori setelah sukses
    addDeviceChallenges.delete(user._id.toString());

    res.json({
      message: 'Perangkat baru berhasil ditambahkan',
      credential: {
        credentialID: credentialData.credentialID,
        nickname: credentialData.nickname || 'Perangkat Saya',
        deviceType: credentialData.deviceType,
        createdAt: new Date(),
      },
      totalCredentials: user.webauthnCredentials.length,
    });
  } catch (error) {
    console.error('Add device verify error:', error);
    res.status(400).json({ message: 'Gagal menambahkan perangkat', error: error.message });
  }
};

// Ambil semua daftar user (Hanya untuk Admin)
export const getAllUsers = async (req, res) => {
  try {
    // Keamanan: Cek tiap request apakah role-nya beneran admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Akses ditolak. Ini halaman khusus Admin.' });
    }
    const users = await User.find().select('username email role createdAt').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Ubah jabatan (Role) user (Misal: Jadikan warga biasa menjadi Admin)
export const changeUserRole = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Akses ditolak.' });
    }
    const { userId, role } = req.body;
    
    // Pastikan input role cuma 'warga' atau 'admin'
    if (!['warga', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Pilihan role tidak valid' });
    }
    
    const userToUpdate = await User.findById(userId);
    if (!userToUpdate) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    
    userToUpdate.role = role;
    await userToUpdate.save();
    
    res.json({ 
      message: `Jabatan berhasil diubah menjadi ${role}`, 
      user: { id: userToUpdate._id, username: userToUpdate.username, role: userToUpdate.role } 
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
