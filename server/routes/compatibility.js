import express from 'express';
import { authenticate } from '../middleware/auth.js';
import AuthLog from '../models/AuthLog.js';

const router = express.Router();

/**
 * Browser Compatibility Matrix
 */
router.get('/browser-matrix', authenticate, async (req, res) => {
  try {
    // Browser support matrix
    const passwordSupport = {
      Chrome: { minVersion: '1.0', support: 'Full', notes: 'Universal support' },
      Firefox: { minVersion: '1.0', support: 'Full', notes: 'Universal support' },
      Safari: { minVersion: '1.0', support: 'Full', notes: 'Universal support' },
      Edge: { minVersion: '1.0', support: 'Full', notes: 'Universal support' },
      Opera: { minVersion: '1.0', support: 'Full', notes: 'Universal support' },
      IE: { minVersion: '1.0', support: 'Full', notes: 'Universal support (legacy)' },
    };

    const webauthnSupport = {
      Chrome: { minVersion: '67', support: 'Full', notes: 'WebAuthn API support' },
      Firefox: { minVersion: '60', support: 'Full', notes: 'WebAuthn API support' },
      Safari: { minVersion: '13', support: 'Full', notes: 'WebAuthn API support (iOS 13+)' },
      Edge: { minVersion: '18', support: 'Full', notes: 'WebAuthn API support' },
      Opera: { minVersion: '54', support: 'Full', notes: 'WebAuthn API support' },
      IE: { minVersion: 'N/A', support: 'None', notes: 'Not supported' },
    };

    // Calculate compatibility percentage
    const passwordCompatibility = (Object.keys(passwordSupport).filter((browser) => passwordSupport[browser].support === 'Full').length / Object.keys(passwordSupport).length) * 100;
    const webauthnCompatibility = (Object.keys(webauthnSupport).filter((browser) => webauthnSupport[browser].support === 'Full').length / Object.keys(webauthnSupport).length) * 100;

    res.json({
      password: {
        browsers: passwordSupport,
        compatibility: Math.round(passwordCompatibility),
        notes: 'Universal browser support',
      },
      webauthn: {
        browsers: webauthnSupport,
        compatibility: Math.round(webauthnCompatibility),
        notes: 'Requires modern browsers with WebAuthn API support',
      },
      comparison: {
        difference: Math.round(passwordCompatibility - webauthnCompatibility),
        conclusion: `Password has ${Math.round(passwordCompatibility - webauthnCompatibility)}% higher browser compatibility`,
      },
    });
  } catch (error) {
    console.error('Browser compatibility error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Device Compatibility Analysis
 */
router.get('/device-support', authenticate, async (req, res) => {
  try {
    // Get actual device data from logs
    const allLogs = await AuthLog.find();
    const passwordLogs = allLogs.filter((log) => log.method === 'password');
    const webauthnLogs = allLogs.filter((log) => log.method === 'webauthn');

    // Parse user agent to get device info
    const parseDevice = (userAgent) => {
      if (!userAgent) return 'Unknown';
      const ua = userAgent.toLowerCase();
      if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) return 'Mobile';
      if (ua.includes('tablet') || ua.includes('ipad')) return 'Tablet';
      return 'Desktop';
    };

    const passwordDevices = {};
    passwordLogs.forEach((log) => {
      const device = parseDevice(log.userAgent);
      passwordDevices[device] = (passwordDevices[device] || 0) + 1;
    });

    const webauthnDevices = {};
    webauthnLogs.forEach((log) => {
      const device = parseDevice(log.userAgent);
      webauthnDevices[device] = (webauthnDevices[device] || 0) + 1;
    });

    // Platform support
    const passwordPlatforms = {
      Windows: { support: 'Full', requirements: 'None', notes: 'Universal support' },
      macOS: { support: 'Full', requirements: 'None', notes: 'Universal support' },
      Linux: { support: 'Full', requirements: 'None', notes: 'Universal support' },
      iOS: { support: 'Full', requirements: 'None', notes: 'Universal support' },
      Android: { support: 'Full', requirements: 'None', notes: 'Universal support' },
    };

    const webauthnPlatforms = {
      Windows: { support: 'Full', requirements: 'Windows Hello or security key', notes: 'Requires Windows 10+' },
      macOS: { support: 'Full', requirements: 'Touch ID or security key', notes: 'Requires macOS with Touch ID' },
      Linux: { support: 'Partial', requirements: 'Security key or FIDO2 device', notes: 'No built-in biometric support' },
      iOS: { support: 'Full', requirements: 'Face ID or Touch ID', notes: 'Requires iOS 13+' },
      Android: { support: 'Full', requirements: 'Fingerprint or security key', notes: 'Requires Android 7+' },
    };

    res.json({
      password: {
        devices: passwordDevices,
        platforms: passwordPlatforms,
        compatibility: 'Universal',
        requirements: 'None',
      },
      webauthn: {
        devices: webauthnDevices,
        platforms: webauthnPlatforms,
        compatibility: 'Modern devices',
        requirements: 'Biometric sensor or security key',
      },
      comparison: {
        conclusion: 'Password has universal device support, while WebAuthn requires modern devices with biometric sensors or security keys',
      },
    });
  } catch (error) {
    console.error('Device compatibility error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Accessibility Analysis
 */
router.get('/accessibility', authenticate, async (req, res) => {
  try {
    // WCAG compliance analysis
    const passwordAccessibility = {
      keyboardNavigation: { score: 10, notes: 'Full keyboard support' },
      screenReader: { score: 10, notes: 'Standard form inputs, well-supported' },
      visualImpairment: { score: 9, notes: 'Text-based, can be read by screen readers' },
      motorImpairment: { score: 7, notes: 'Requires typing, may be difficult for some users' },
      cognitiveImpairment: { score: 6, notes: 'Requires remembering password' },
      overall: 0,
    };

    const webauthnAccessibility = {
      keyboardNavigation: { score: 8, notes: 'Mostly keyboard accessible, some biometric flows may require mouse' },
      screenReader: { score: 7, notes: 'WebAuthn dialogs may not be fully accessible' },
      visualImpairment: { score: 8, notes: 'Biometric authentication may be challenging' },
      motorImpairment: { score: 9, notes: 'Biometric is easier than typing' },
      cognitiveImpairment: { score: 10, notes: 'No need to remember anything' },
      overall: 0,
    };

    // Calculate overall score
    passwordAccessibility.overall =
      Object.values(passwordAccessibility)
        .filter((v) => typeof v === 'object' && v.score)
        .reduce((sum, v) => sum + v.score, 0) / 5;

    webauthnAccessibility.overall =
      Object.values(webauthnAccessibility)
        .filter((v) => typeof v === 'object' && v.score)
        .reduce((sum, v) => sum + v.score, 0) / 5;

    res.json({
      password: {
        ...passwordAccessibility,
        overall: Math.round(passwordAccessibility.overall * 10) / 10,
        wcagLevel: passwordAccessibility.overall >= 9 ? 'AAA' : passwordAccessibility.overall >= 7 ? 'AA' : 'A',
      },
      webauthn: {
        ...webauthnAccessibility,
        overall: Math.round(webauthnAccessibility.overall * 10) / 10,
        wcagLevel: webauthnAccessibility.overall >= 9 ? 'AAA' : webauthnAccessibility.overall >= 7 ? 'AA' : 'A',
      },
      comparison: {
        difference: Math.round((webauthnAccessibility.overall - passwordAccessibility.overall) * 10) / 10,
        conclusion: `WebAuthn has ${Math.round((webauthnAccessibility.overall - passwordAccessibility.overall) * 10) / 10} points ${webauthnAccessibility.overall > passwordAccessibility.overall ? 'higher' : 'lower'} accessibility score`,
      },
    });
  } catch (error) {
    console.error('Accessibility analysis error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
