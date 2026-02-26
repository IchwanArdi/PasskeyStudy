import express from 'express';
import mongoose from 'mongoose';
import { authenticate } from '../middleware/auth.js';
import AuthLog from '../models/AuthLog.js';
import { mean, standardDeviation, confidenceInterval } from '../utils/statistics.js';

const router = express.Router();

// Get statistics for current user
router.get('/my-stats', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const userIdObjectId = userId instanceof mongoose.Types.ObjectId ? userId : new mongoose.Types.ObjectId(userId);

    let logs = await AuthLog.find({ userId: userIdObjectId }).sort({ timestamp: -1 });
    if (logs.length === 0) {
      logs = await AuthLog.find({ userId: userId.toString() }).sort({ timestamp: -1 });
    }
    if (logs.length === 0) {
      logs = await AuthLog.find({ userId: userId }).sort({ timestamp: -1 });
    }

    const passwordLogs = logs.filter((log) => log.method === 'password');
    const webauthnLogs = logs.filter((log) => log.method === 'webauthn');

    const passwordSuccess = passwordLogs.filter((log) => log.success).length;
    const passwordFailed = passwordLogs.filter((log) => !log.success).length;
    const webauthnSuccess = webauthnLogs.filter((log) => log.success).length;
    const webauthnFailed = webauthnLogs.filter((log) => !log.success).length;

    // Error categorization
    const categorizeError = (errorMessage) => {
      if (!errorMessage) return 'Unknown';
      const msg = errorMessage.toLowerCase();
      if (msg.includes('not found') || msg.includes('invalid')) return 'Invalid Credentials';
      if (msg.includes('password')) return 'Password Error';
      if (msg.includes('timeout') || msg.includes('expired')) return 'Timeout';
      if (msg.includes('network') || msg.includes('connection')) return 'Network Error';
      if (msg.includes('verification') || msg.includes('failed')) return 'Verification Failed';
      return 'Other';
    };

    const passwordErrorCategories = passwordLogs
      .filter((l) => !l.success)
      .reduce((acc, log) => {
        const category = categorizeError(log.errorMessage);
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

    const webauthnErrorCategories = webauthnLogs
      .filter((l) => !l.success)
      .reduce((acc, log) => {
        const category = categorizeError(log.errorMessage);
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

    // Recent Logs & Date grouping
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentLogsByDate = logs.filter((l) => l.timestamp >= thirtyDaysAgo);

    const logsByDate = recentLogsByDate.reduce((acc, log) => {
      const date = log.timestamp.toISOString().split('T')[0];
      if (!acc[date]) acc[date] = { password: 0, webauthn: 0 };
      if (log.success) acc[date][log.method]++;
      return acc;
    }, {});


    const totalLogins = logs.length;
    const webauthnRatio = totalLogins > 0 ? ((webauthnLogs.length / totalLogins) * 100).toFixed(1) : 0;
    const logsWithRisk = logs.filter((l) => l.riskScore !== undefined);
    const avgRiskScore = logsWithRisk.length > 0 ? Math.round(logsWithRisk.reduce((sum, l) => sum + l.riskScore, 0) / logsWithRisk.length) : 0;
    const uniqueIPs = new Set(logs.map((l) => l.ipAddress).filter(Boolean)).size;

    // Map logsByDate to ActivityOverTimeChart format
    const activityOverTime = Object.entries(logsByDate)
      .map(([date, counts]) => ({
        date,
        webauthn: counts.webauthn,
        password: counts.password,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Map error categories to ErrorDistributionChart format
    const errorDistribution = Object.entries({ ...passwordErrorCategories, ...webauthnErrorCategories })
      .map(([name, value]) => ({ name, value }))
      .slice(0, 5);

    // Map success rates to SuccessRateChart format
    const successRates = [
      {
        name: 'Success Rate',
        webauthn: parseFloat(webauthnLogs.length > 0 ? ((webauthnSuccess / webauthnLogs.length) * 100).toFixed(1) : 0),
        password: parseFloat(passwordLogs.length > 0 ? ((passwordSuccess / passwordLogs.length) * 100).toFixed(1) : 0),
      },
    ];

    res.json({
      totalLogins,
      webauthnRatio,
      avgRiskScore,
      uniqueIPs,
      activityOverTime,
      errorDistribution,
      successRates,
      summary: {
        password: {
          total: passwordLogs.length,
          success: passwordSuccess,
          failed: passwordFailed,
          successRate: passwordLogs.length > 0 ? ((passwordSuccess / passwordLogs.length) * 100).toFixed(2) : 0,
          errorCategories: passwordErrorCategories
        },
        webauthn: {
          total: webauthnLogs.length,
          success: webauthnSuccess,
          failed: webauthnFailed,
          successRate: webauthnLogs.length > 0 ? ((webauthnSuccess / webauthnLogs.length) * 100).toFixed(2) : 0,
          errorCategories: webauthnErrorCategories
        },
      },
      recentLogs: logs.slice(0, 10).map((l) => ({
        method: l.method,
        timestamp: l.timestamp,
        success: l.success,
        ipAddress: l.ipAddress,
        riskScore: l.riskScore,
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
    const passwordLogs = allLogs.filter((log) => log.method === 'password');
    const webauthnLogs = allLogs.filter((log) => log.method === 'webauthn');

    const passwordSuccess = passwordLogs.filter((log) => log.success).length;
    const webauthnSuccess = webauthnLogs.filter((log) => log.success).length;

    const categorizeError = (errorMessage) => {
      if (!errorMessage) return 'Unknown';
      const msg = errorMessage.toLowerCase();
      if (msg.includes('not found') || msg.includes('invalid')) return 'Invalid Credentials';
      if (msg.includes('verification') || msg.includes('failed')) return 'Verification Failed';
      return 'Other';
    };

    const passwordErrorCategories = passwordLogs
      .filter((l) => !l.success)
      .reduce((acc, log) => {
        const cat = categorizeError(log.errorMessage);
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {});

    const webauthnErrorCategories = webauthnLogs
      .filter((l) => !l.success)
      .reduce((acc, log) => {
        const cat = categorizeError(log.errorMessage);
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {});

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const logsByDate = allLogs
      .filter((l) => l.timestamp >= thirtyDaysAgo)
      .reduce((acc, log) => {
        const date = log.timestamp.toISOString().split('T')[0];
        if (!acc[date]) acc[date] = { password: 0, webauthn: 0 };
        if (log.success) acc[date][log.method]++;
        return acc;
      }, {});



    // Aggregate metrics for Dashboard Overview
    const totalLogins = allLogs.length;
    const webauthnRatio = totalLogins > 0 ? ((webauthnLogs.length / totalLogins) * 100).toFixed(1) : 0;
    const logsWithRisk = allLogs.filter((l) => l.riskScore !== undefined);
    const avgRiskScore = logsWithRisk.length > 0 ? Math.round(logsWithRisk.reduce((sum, l) => sum + l.riskScore, 0) / logsWithRisk.length) : 0;
    const uniqueIPs = new Set(allLogs.map((l) => l.ipAddress).filter(Boolean)).size;

    // Map logsByDate to ActivityOverTimeChart format
    const activityOverTime = Object.entries(logsByDate)
      .map(([date, counts]) => ({
        date,
        webauthn: counts.webauthn,
        password: counts.password,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Map error categories to ErrorDistributionChart format
    const errorDistribution = Object.entries({ ...passwordErrorCategories, ...webauthnErrorCategories })
      .map(([name, value]) => ({ name, value }))
      .slice(0, 5);

    // Map success rates to SuccessRateChart format
    const successRates = [
      {
        name: 'Success Rate',
        webauthn: parseFloat(webauthnLogs.length > 0 ? ((webauthnSuccess / webauthnLogs.length) * 100).toFixed(1) : 0),
        password: parseFloat(passwordLogs.length > 0 ? ((passwordSuccess / passwordLogs.length) * 100).toFixed(1) : 0),
      },
    ];

    res.json({
      totalLogins,
      webauthnRatio,
      avgRiskScore,
      uniqueIPs,
      activityOverTime,
      errorDistribution,
      successRates,
      summary: {
        password: {
          total: passwordLogs.length,
          success: passwordSuccess,
          failed: passwordLogs.length - passwordSuccess,
          successRate: passwordLogs.length > 0 ? ((passwordSuccess / passwordLogs.length) * 100).toFixed(2) : 0,
          errorCategories: passwordErrorCategories
        },
        webauthn: {
          total: webauthnLogs.length,
          success: webauthnSuccess,
          failed: webauthnLogs.length - webauthnSuccess,
          successRate: webauthnLogs.length > 0 ? ((webauthnSuccess / webauthnLogs.length) * 100).toFixed(2) : 0,
          errorCategories: webauthnErrorCategories
        },
      },
      recentLogs: allLogs.slice(0, 10).map((l) => ({
        method: l.method,
        timestamp: l.timestamp,
        success: l.success,
        ipAddress: l.ipAddress,
        riskScore: l.riskScore,
        riskFactors: l.riskFactors,
      })),
    });
  } catch (error) {
    console.error('Global Stats Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});



export default router;
