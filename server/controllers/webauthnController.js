import User from '../models/User.js';
import AuthLog from '../models/AuthLog.js';
import jwt from 'jsonwebtoken';
import { getRegistrationOptions, verifyRegistration, getAuthenticationOptions, verifyAuthentication } from '../utils/webauthn.js';
import { calculateRiskScore } from '../utils/riskEngine.js';

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Store challenges temporarily (in production, use Redis)
const challenges = new Map();

export const getRegisterOptions = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find existing user by email (case-insensitive)
    let user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      // User doesn't exist, create new user for WebAuthn-only registration
      // Generate unique username if needed
      let baseUsername = email.split('@')[0].trim();

      // Remove any invalid characters and ensure it's alphanumeric
      baseUsername = baseUsername.replace(/[^a-zA-Z0-9]/g, '');

      // Ensure username meets minimum length requirement
      if (baseUsername.length < 3) {
        baseUsername = baseUsername + '123';
      }

      // Ensure username doesn't exceed max length
      if (baseUsername.length > 30) {
        baseUsername = baseUsername.substring(0, 27) + '123';
      }

      let username = baseUsername;
      let counter = 1;

      // Check if username already exists
      while (await User.findOne({ username })) {
        const suffix = counter.toString();
        const maxLength = 30;
        const availableLength = maxLength - suffix.length;

        if (baseUsername.length > availableLength) {
          username = baseUsername.substring(0, availableLength) + suffix;
        } else {
          username = baseUsername + suffix;
        }

        counter++;
        // Prevent infinite loop
        if (counter > 100) {
          username = `user${Date.now()}`.substring(0, 30);
          break;
        }
      }

      try {
        user = new User({
          username,
          email: email.toLowerCase().trim(),
        });
        await user.save();
        console.log('User created successfully for WebAuthn:', user.email);
      } catch (saveError) {
        console.error('Error saving user (WebAuthn registration):', saveError);
        console.error('Error details:', {
          name: saveError.name,
          code: saveError.code,
          message: saveError.message,
          errors: saveError.errors,
          keyPattern: saveError.keyPattern,
        });

        // If user creation fails due to duplicate (email or username), try to find by email
        if (saveError.code === 11000) {
          // Try to find user by email (maybe it was created between our check and save)
          user = await User.findOne({ email: email.toLowerCase().trim() });
          if (user) {
            console.log('User already exists (found after duplicate error), using existing user:', user.email);
          } else {
            // If duplicate is on username, try to generate new username
            if (saveError.keyPattern && saveError.keyPattern.username) {
              // Username duplicate, generate new one
              const timestamp = Date.now().toString().slice(-6);
              username = `user${timestamp}`.substring(0, 30);
              try {
                user = new User({
                  username,
                  email: email.toLowerCase().trim(),
                });
                await user.save();
                console.log('User created with fallback username:', user.email);
              } catch (retryError) {
                return res.status(500).json({
                  message: 'Failed to create user - duplicate key error',
                  error: saveError.message,
                  details: saveError.keyPattern,
                });
              }
            } else {
              return res.status(500).json({
                message: 'Failed to create user - duplicate key error',
                error: saveError.message,
                details: saveError.keyPattern,
              });
            }
          }
        } else if (saveError.name === 'ValidationError') {
          // Handle validation errors
          const errors = Object.values(saveError.errors || {}).map((err) => err.message);
          return res.status(400).json({
            message: 'Validation error',
            errors,
            details: saveError.message,
          });
        } else {
          return res.status(500).json({
            message: 'Failed to create user',
            error: saveError.message,
            name: saveError.name,
            stack: process.env.NODE_ENV === 'development' ? saveError.stack : undefined,
          });
        }
      }
    } else {
      // User already exists (maybe registered with password), use existing user
      console.log('User already exists, adding WebAuthn credential to existing user:', user.email);
    }

    // Ensure user has _id
    if (!user._id) {
      return res.status(500).json({ message: 'User ID not found' });
    }

    const options = await getRegistrationOptions(user);

    // Store challenge
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

export const verifyRegister = async (req, res) => {
  const startTime = Date.now();

  try {
    const { email, credential } = req.body;

    if (!email || !credential) {
      return res.status(400).json({ message: 'Email and credential are required' });
    }

    // Find user with normalized email (case-insensitive)
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const expectedChallenge = challenges.get(user._id.toString());
    if (!expectedChallenge) {
      return res.status(400).json({ message: 'Challenge not found. Please start registration again.' });
    }

    console.log('Verifying registration for user:', user.email);
    console.log('Challenge exists:', !!expectedChallenge);

    let credentialData;
    try {
      credentialData = await verifyRegistration(credential, expectedChallenge, user);
    } catch (verifyError) {
      console.error('Verify registration error:', verifyError);
      const duration = Date.now() - startTime;
      await AuthLog.create({
        userId: user._id,
        method: 'webauthn',
        duration,
        success: false,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        errorMessage: verifyError.message,
      });
      return res.status(400).json({
        message: 'Registration verification failed',
        error: verifyError.message,
      });
    }

    // Add credential to user
    await user.addWebAuthnCredential(credentialData);

    // Clear challenge
    challenges.delete(user._id.toString());

    const duration = Date.now() - startTime;
    const token = generateToken(user._id);

    // Log registration
    await AuthLog.create({
      userId: user._id,
      method: 'webauthn',
      duration,
      success: true,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
    });

    res.json({
      message: 'WebAuthn credential registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      duration,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('Verify register error:', error);

    const user = await User.findOne({ email: req.body.email?.toLowerCase().trim() });
    if (user) {
      await AuthLog.create({
        userId: user._id,
        method: 'webauthn',
        duration,
        success: false,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        errorMessage: error.message,
      });
    }

    res.status(400).json({ message: 'Registration verification failed', error: error.message });
  }
};

export const getLoginOptions = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user with normalized email (case-insensitive)
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.webauthnCredentials || user.webauthnCredentials.length === 0) {
      return res.status(400).json({ message: 'No WebAuthn credentials found for this user' });
    }

    // Ensure all credentials have counter (set default to 0 if missing)
    user.webauthnCredentials.forEach((cred) => {
      if (cred.counter === undefined || cred.counter === null) {
        cred.counter = 0;
      }
    });

    const options = await getAuthenticationOptions(user);

    // Store challenge
    challenges.set(user._id.toString(), options.challenge);

    res.json(options);
  } catch (error) {
    console.error('Get login options error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const verifyLogin = async (req, res) => {
  const startTime = Date.now();

  try {
    const { email, credential } = req.body;

    console.log('verifyLogin called:', {
      hasEmail: !!email,
      hasCredential: !!credential,
      credentialKeys: credential ? Object.keys(credential) : null,
      credentialId: credential?.id,
      credentialResponse: credential?.response ? Object.keys(credential.response) : null,
    });

    if (!email || !credential) {
      return res.status(400).json({ message: 'Email and credential are required' });
    }

    // Find user with normalized email (case-insensitive)
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      const duration = Date.now() - startTime;
      await AuthLog.create({
        userId: null,
        method: 'webauthn',
        duration,
        success: false,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        errorMessage: 'User not found',
      });
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.webauthnCredentials || user.webauthnCredentials.length === 0) {
      const duration = Date.now() - startTime;
      await AuthLog.create({
        userId: user._id,
        method: 'webauthn',
        duration,
        success: false,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        errorMessage: 'No WebAuthn credentials found',
      });
      return res.status(400).json({ message: 'No WebAuthn credentials found' });
    }

    const expectedChallenge = challenges.get(user._id.toString());
    if (!expectedChallenge) {
      return res.status(400).json({ message: 'Challenge not found. Please start login again.' });
    }

    // Find the credential being used
    // credential.id from browser is base64url string
    const credentialID = credential?.id;

    if (!credentialID) {
      const duration = Date.now() - startTime;
      await AuthLog.create({
        userId: user._id,
        method: 'webauthn',
        duration,
        success: false,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        errorMessage: 'Credential ID is missing from request',
      });
      return res.status(400).json({ message: 'Credential ID is missing' });
    }

    // Normalize credentialID for comparison (ensure it's a string)
    const normalizedCredentialID = typeof credentialID === 'string' ? credentialID : credentialID.toString();

    // Log all stored credential IDs for debugging
    console.log('Searching for credential:', {
      requestedCredentialID: normalizedCredentialID.substring(0, 20) + '...',
      storedCredentialIDs: user.webauthnCredentials.map((cred) => ({
        id: cred.credentialID?.substring(0, 20) + '...',
        hasCounter: cred.counter !== undefined,
        counter: cred.counter,
      })),
    });

    // Find credential - try exact match first, then try to match by converting both to same format
    let userCredential = user.webauthnCredentials.find((cred) => {
      if (!cred.credentialID) return false;
      // Exact match
      if (cred.credentialID === normalizedCredentialID) return true;
      // Try comparing as strings after trimming
      return cred.credentialID.trim() === normalizedCredentialID.trim();
    });

    if (!userCredential) {
      const duration = Date.now() - startTime;
      await AuthLog.create({
        userId: user._id,
        method: 'webauthn',
        duration,
        success: false,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        errorMessage: `Credential not found. Requested ID: ${normalizedCredentialID.substring(0, 20)}...`,
      });
      return res.status(400).json({
        message: 'Credential not found. Please make sure you are using the correct authenticator.',
        debug:
          process.env.NODE_ENV === 'development'
            ? {
                requestedID: normalizedCredentialID.substring(0, 30),
                availableIDs: user.webauthnCredentials.map((c) => c.credentialID?.substring(0, 30)),
              }
            : undefined,
      });
    }

    // Ensure counter exists (default to 0 if missing)
    if (userCredential.counter === undefined || userCredential.counter === null) {
      userCredential.counter = 0;
      console.log('Counter was missing, set to 0');
    }

    // Ensure counter is a number
    userCredential.counter = Number(userCredential.counter) || 0;

    // Validate credential has all required fields
    if (!userCredential.credentialID || !userCredential.credentialPublicKey) {
      const duration = Date.now() - startTime;
      await AuthLog.create({
        userId: user._id,
        method: 'webauthn',
        duration,
        success: false,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        errorMessage: 'Credential is missing required fields (credentialID or credentialPublicKey)',
      });
      return res.status(400).json({ message: 'Credential data is incomplete' });
    }

    // Log credential data for debugging
    console.log('User credential found:', {
      credentialID: userCredential.credentialID?.substring(0, 20) + '...',
      hasPublicKey: !!userCredential.credentialPublicKey,
      publicKeyLength: userCredential.credentialPublicKey?.length,
      counter: userCredential.counter,
      counterType: typeof userCredential.counter,
      credentialKeys: Object.keys(userCredential),
    });

    const verification = await verifyAuthentication(credential, expectedChallenge, user, userCredential);

    if (verification.verified) {
      // Update credential counter
      await user.updateCredentialCounter(userCredential.credentialID, verification.newCounter);

      // Clear challenge
      challenges.delete(user._id.toString());

      // Assess Risk
      const currentIP = req.ip || req.connection.remoteAddress;
      const currentUA = req.get('user-agent');

      // Get deep historical logs for ML Behavioral Profiling
      const recentLogs = await AuthLog.find({ userId: user._id }).sort({ timestamp: -1 }).limit(20);

      const { score: riskScore, factors: riskFactors } = await calculateRiskScore(user, {
        currentIP,
        currentUA,
        recentLogs,
      });

      const duration = Date.now() - startTime;
      const token = generateToken(user._id);

      // Update user security profile
      user.lastLoginIP = currentIP;
      user.lastLoginUA = currentUA;

      const deviceIndex = user.knownDevices.findIndex((d) => d.userAgent === currentUA);
      if (deviceIndex > -1) {
        user.knownDevices[deviceIndex].lastUsed = new Date();
      } else {
        user.knownDevices.push({ userAgent: currentUA, lastUsed: new Date() });
      }
      await user.save();

      // Log successful login
      const authLog = await AuthLog.create({
        userId: user._id,
        method: 'webauthn',
        duration,
        success: true,
        ipAddress: currentIP,
        userAgent: currentUA,
        riskScore,
        riskFactors,
      });

      console.log('WebAuthn login logged:', {
        userId: user._id.toString(),
        duration,
        logId: authLog._id,
      });

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          riskScore,
          riskFactors,
        },
        duration,
      });
    } else {
      throw new Error('Authentication verification failed');
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('Verify login error:', error);

    const user = await User.findOne({ email: req.body.email?.toLowerCase().trim() });
    if (user) {
      await AuthLog.create({
        userId: user._id,
        method: 'webauthn',
        duration,
        success: false,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        errorMessage: error.message,
      });
    }

    res.status(400).json({ message: 'Authentication verification failed', error: error.message });
  }
};
