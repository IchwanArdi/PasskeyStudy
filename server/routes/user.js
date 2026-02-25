import express from 'express';
import { authenticate } from '../middleware/auth.js';
import User from '../models/User.js';
import { getRegistrationOptions, verifyRegistration } from '../utils/webauthn.js';

const router = express.Router();

// Store challenges temporarily for add-device flow
// NOTE: Untuk production, gunakan Redis atau MongoDB TTL collection
const addDeviceChallenges = new Map();

// Get current user profile
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user profile
router.put('/me', authenticate, async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = await User.findById(req.user._id);

    if (username) user.username = username;
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = email;
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
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
});

// Get user's WebAuthn credentials
router.get('/credentials', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('webauthnCredentials');
    res.json(user.webauthnCredentials);
  } catch (error) {
    console.error('Get credentials error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// =============================================
// DEVICE MANAGEMENT ENDPOINTS
// =============================================

// Delete a credential (revoke device)
router.delete('/credentials/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    await user.removeWebAuthnCredential(id);

    res.json({
      message: 'Perangkat berhasil dihapus',
      remainingCredentials: user.webauthnCredentials.length,
    });
  } catch (error) {
    console.error('Delete credential error:', error);
    const statusCode = error.message.includes('tidak ditemukan') ? 404 : 
                       error.message.includes('Tidak dapat menghapus') ? 400 : 500;
    res.status(statusCode).json({ message: error.message });
  }
});

// Update credential nickname
router.put('/credentials/:id/nickname', authenticate, async (req, res) => {
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
      return res.status(404).json({ message: 'Credential tidak ditemukan' });
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
});

// Get registration options for adding a new device (user already authenticated)
router.post('/credentials/add-options', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const options = await getRegistrationOptions(user);

    // Store challenge for this add-device flow
    addDeviceChallenges.set(user._id.toString(), options.challenge);

    res.json(options);
  } catch (error) {
    console.error('Add device options error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify and save new credential for add-device flow
router.post('/credentials/add-verify', authenticate, async (req, res) => {
  try {
    const { credential, nickname } = req.body;

    if (!credential) {
      return res.status(400).json({ message: 'Credential diperlukan' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const expectedChallenge = addDeviceChallenges.get(user._id.toString());
    if (!expectedChallenge) {
      return res.status(400).json({
        message: 'Challenge tidak ditemukan. Silakan mulai ulang proses tambah perangkat.',
      });
    }

    const credentialData = await verifyRegistration(credential, expectedChallenge, user);

    // Set custom nickname if provided
    if (nickname && nickname.trim().length > 0) {
      credentialData.nickname = nickname.trim();
    }

    await user.addWebAuthnCredential(credentialData);

    // Clear challenge
    addDeviceChallenges.delete(user._id.toString());

    res.json({
      message: 'Perangkat baru berhasil ditambahkan',
      credential: {
        credentialID: credentialData.credentialID,
        nickname: credentialData.nickname || 'My Authenticator',
        deviceType: credentialData.deviceType,
        createdAt: new Date(),
      },
      totalCredentials: user.webauthnCredentials.length,
    });
  } catch (error) {
    console.error('Add device verify error:', error);
    res.status(400).json({ message: 'Gagal menambahkan perangkat', error: error.message });
  }
});

export default router;
