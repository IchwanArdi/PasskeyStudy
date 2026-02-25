import User from '../models/User.js';
import AuthLog from '../models/AuthLog.js';
import { calculateRiskScore } from '../utils/riskEngine.js';
import { validationResult } from 'express-validator';
import { generateToken } from '../utils/tokenHelper.js';

export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = new User({
      username,
      email,
      password, // Will be hashed by pre-save hook
    });

    try {
      await user.save();
    } catch (saveError) {
      console.error('Error saving user (password registration):', saveError);
      // Handle duplicate key error
      if (saveError.code === 11000) {
        const field = Object.keys(saveError.keyPattern)[0];
        return res.status(400).json({
          message: `${field === 'email' ? 'Email' : 'Username'} already exists`,
        });
      }
      // Handle validation errors
      if (saveError.name === 'ValidationError') {
        const errors = Object.values(saveError.errors).map((err) => err.message);
        return res.status(400).json({
          message: 'Validation error',
          errors,
        });
      }
      throw saveError; // Re-throw if it's a different error
    }

    const token = generateToken(user._id);

    // Log registration
    await AuthLog.create({
      userId: user._id,
      method: 'password',
      duration: 0,
      success: true,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const login = async (req, res) => {
  const startTime = Date.now();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      const duration = Date.now() - startTime;
      await AuthLog.create({
        userId: null,
        method: 'password',
        duration,
        success: false,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        errorMessage: 'User not found',
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user has password
    if (!user.password) {
      const duration = Date.now() - startTime;
      await AuthLog.create({
        userId: user._id,
        method: 'password',
        duration,
        success: false,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        errorMessage: 'Password not set for this user',
      });
      return res.status(401).json({ message: 'Password authentication not available for this user' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const duration = Date.now() - startTime;
      await AuthLog.create({
        userId: user._id,
        method: 'password',
        duration,
        success: false,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        errorMessage: 'Invalid password',
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

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

    // Calculate duration after password verification
    const duration = Date.now() - startTime;
    const token = generateToken(user._id);

    // Update user security profile
    user.lastLoginIP = currentIP;
    user.lastLoginUA = currentUA;

    // Manage known devices
    const deviceIndex = user.knownDevices.findIndex((d) => d.userAgent === currentUA);
    if (deviceIndex > -1) {
      user.knownDevices[deviceIndex].lastUsed = new Date();
    } else {
      user.knownDevices.push({ userAgent: currentUA, lastUsed: new Date() });
    }
    await user.save();

    // Log successful login with risk info
    const authLog = await AuthLog.create({
      userId: user._id,
      method: 'password',
      duration,
      success: true,
      ipAddress: currentIP,
      userAgent: currentUA,
      riskScore,
      riskFactors,
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
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('Login error:', error);

    await AuthLog.create({
      userId: null,
      method: 'password',
      duration,
      success: false,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      errorMessage: error.message,
    });

    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
