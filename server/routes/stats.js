import express from 'express';
import mongoose from 'mongoose';
import { authenticate } from '../middleware/auth.js';
import AuthLog from '../models/AuthLog.js';

const router = express.Router();

// Error categorization
const categorizeError = (errorMessage) => {
  if (!errorMessage) return 'Unknown';
  if (errorMessage.includes('Invalid credentials') || errorMessage.includes('Invalid password')) return 'Invalid Credentials';
  if (errorMessage.includes('timeout') || errorMessage.includes('Timed out')) return 'Timeout';
  if (errorMessage.includes('cancelled') || errorMessage.includes('canceled')) return 'User Cancelled';
  if (errorMessage.includes('verification failed')) return 'Verification Failed';
  if (errorMessage.error === 'network_error') return 'Network Error';
  return 'Other Errors';
};

// Get statistics for current user
router.get('/my-stats', authenticate, async (req, res) => {
  try {
    const logs = await AuthLog.find({ userId: req.user._id }).sort({ timestamp: -1 });

    const webauthnLogs = logs.filter((log) => log.method === 'webauthn');
    const webauthnSuccessCount = webauthnLogs.filter((log) => log.success).length;

    const webauthnErrorCategories = webauthnLogs
      .filter((l) => !l.success)
      .reduce((acc, log) => {
        const category = categorizeError(log.errorMessage);
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

    const errorDistribution = Object.entries(webauthnErrorCategories).map(([name, value]) => ({ name, value }));

    // Group by date (Last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const logsByDate = {};
    logs.filter((l) => new Date(l.timestamp) >= thirtyDaysAgo).forEach((log) => {
      const dateStr = new Date(log.timestamp).toISOString().split('T')[0];
      if (!logsByDate[dateStr]) logsByDate[dateStr] = { webauthn: 0 };
      if (log.method === 'webauthn') logsByDate[dateStr].webauthn++;
    });

    const totalLogins = webauthnLogs.length; // Only webauthn matters now
    const webauthnRatio = totalLogins > 0 ? 100.0 : 0;
    const uniqueIPs = new Set(logs.map((l) => l.ipAddress).filter(Boolean)).size;

    const activityOverTime = Object.entries(logsByDate)
      .map(([date, counts]) => ({ date, webauthn: counts.webauthn }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const successRates = [
      {
        name: 'Success Rate (%)',
        webauthn: parseFloat(webauthnLogs.length > 0 ? ((webauthnSuccessCount / webauthnLogs.length) * 100).toFixed(1) : 0),
      },
    ];

    res.json({
      totalLogins,
      webauthnRatio,
      uniqueIPs,
      activityOverTime,
      errorDistribution,
      successRates,
      summary: {
        webauthn: {
          total: webauthnLogs.length,
          success: webauthnSuccessCount,
          successRate: webauthnLogs.length > 0 ? ((webauthnSuccessCount / webauthnLogs.length) * 100).toFixed(1) : 0,
        },
      },
      recentLogs: logs.slice(0, 5).map((l) => ({
        id: l._id,
        method: l.method,
        success: l.success,
        timestamp: l.timestamp,
        duration: l.duration,
        ipAddress: l.ipAddress,
        errorMessage: l.errorMessage,
      })),
    });
  } catch (error) {
    console.error('My Stats Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get global statistics
router.get('/global-stats', authenticate, async (req, res) => {
  try {
    const allLogs = await AuthLog.find().sort({ timestamp: -1 });
    const webauthnLogs = allLogs.filter((log) => log.method === 'webauthn');

    const webauthnSuccessCount = webauthnLogs.filter((log) => log.success).length;

    const webauthnErrorCategories = webauthnLogs
      .filter((l) => !l.success)
      .reduce((acc, log) => {
        const cat = categorizeError(log.errorMessage);
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {});

    const errorDistribution = Object.entries(webauthnErrorCategories).map(([name, value]) => ({ name, value }));

    // Group by date (Last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const logsByDate = {};
    allLogs.filter((l) => new Date(l.timestamp) >= thirtyDaysAgo).forEach((log) => {
      const dateStr = new Date(log.timestamp).toISOString().split('T')[0];
      if (!logsByDate[dateStr]) logsByDate[dateStr] = { webauthn: 0 };
      if (log.method === 'webauthn') logsByDate[dateStr].webauthn++;
    });

    const totalLogins = webauthnLogs.length; // Focus entirely on WebAuthn
    const webauthnRatio = totalLogins > 0 ? 100.0 : 0;
    const uniqueIPs = new Set(allLogs.map((l) => l.ipAddress).filter(Boolean)).size;

    const activityOverTime = Object.entries(logsByDate)
      .map(([date, counts]) => ({ date, webauthn: counts.webauthn }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const successRates = [
      {
        name: 'Success Rate (%)',
        webauthn: parseFloat(webauthnLogs.length > 0 ? ((webauthnSuccessCount / webauthnLogs.length) * 100).toFixed(1) : 0),
      },
    ];

    res.json({
      totalLogins,
      webauthnRatio,
      uniqueIPs,
      activityOverTime,
      errorDistribution,
      successRates,
      summary: {
        webauthn: {
          total: webauthnLogs.length,
          success: webauthnSuccessCount,
          successRate: webauthnLogs.length > 0 ? ((webauthnSuccessCount / webauthnLogs.length) * 100).toFixed(1) : 0,
        },
      },
      recentLogs: allLogs.slice(0, 10).map((l) => ({
        id: l._id,
        method: l.method,
        success: l.success,
        timestamp: l.timestamp,
        duration: l.duration,
        ipAddress: l.ipAddress,
      })),
    });
  } catch (error) {
    console.error('Global Stats Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
