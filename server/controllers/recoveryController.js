import User from '../models/User.js';
import AuthLog from '../models/AuthLog.js';
import jwt from 'jsonwebtoken';
import { getRegistrationOptions, verifyRegistration } from '../utils/webauthn.js';

const generateToken = (userId, expiresIn = '7d') => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn });
};

// Store challenges temporarily
const recoveryChallenges = new Map();

/**
 * Generate recovery codes for authenticated user
 */
export const generateCodes = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const codes = await user.generateRecoveryCodes();

    await AuthLog.create({
      userId: user._id,
      method: 'webauthn',
      duration: 0,
      success: true,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      errorMessage: 'Recovery codes generated',
    });

    res.json({
      message: 'Recovery codes generated successfully',
      codes,
      count: codes.length,
      warning: 'Simpan kode ini di tempat yang aman. Setiap kode hanya bisa digunakan satu kali.',
    });
  } catch (error) {
    console.error('Generate recovery codes error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Verify a recovery code (unauthenticated endpoint)
 */
export const verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and recovery code are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isValid = await user.useRecoveryCode(code);
    if (!isValid) {
      await AuthLog.create({
        userId: user._id,
        method: 'webauthn',
        duration: 0,
        success: false,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        errorMessage: 'Invalid recovery code',
      });
      return res.status(401).json({ message: 'Kode pemulihan tidak valid atau sudah digunakan' });
    }

    // Generate a temporary token (1 hour) to allow re-registration
    const tempToken = generateToken(user._id, '1h');

    await AuthLog.create({
      userId: user._id,
      method: 'webauthn',
      duration: 0,
      success: true,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      errorMessage: 'Recovery code verified',
    });

    const remainingCodes = user.backupCodes.filter((c) => !c.used).length;

    res.json({
      message: 'Recovery code verified. You can now register a new authenticator.',
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

/**
 * Get registration options for re-registering a new authenticator after recovery
 */
export const reRegisterOptions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const options = await getRegistrationOptions(user);
    recoveryChallenges.set(user._id.toString(), options.challenge);

    res.json(options);
  } catch (error) {
    console.error('Re-register options error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Verify and add new authenticator after recovery
 */
export const reRegister = async (req, res) => {
  const startTime = Date.now();

  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: 'Credential is required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const expectedChallenge = recoveryChallenges.get(user._id.toString());
    if (!expectedChallenge) {
      return res.status(400).json({ message: 'Challenge not found. Please start again.' });
    }

    const credentialData = await verifyRegistration(credential, expectedChallenge, user);
    await user.addWebAuthnCredential(credentialData);

    recoveryChallenges.delete(user._id.toString());

    const duration = Date.now() - startTime;
    const token = generateToken(user._id);

    await AuthLog.create({
      userId: user._id,
      method: 'webauthn',
      duration,
      success: true,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      errorMessage: 'New authenticator registered via recovery',
    });

    // Generate new recovery codes
    const newCodes = await user.generateRecoveryCodes();

    res.json({
      message: 'New authenticator registered successfully',
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
    res.status(400).json({ message: 'Re-registration failed', error: error.message });
  }
};
