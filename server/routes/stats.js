import express from 'express';
import mongoose from 'mongoose';
import { authenticate } from '../middleware/auth.js';
import AuthLog from '../models/AuthLog.js';
import { mean, standardDeviation, confidenceInterval, independentTTest, chiSquareTest, powerAnalysis, calculateSampleSize } from '../utils/statistics.js';

const router = express.Router();

// Get statistics for current user
router.get('/my-stats', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;

    console.log('Fetching stats for user:', userId.toString());
    console.log('User ID type:', typeof userId);
    console.log('User ID is ObjectId:', userId instanceof mongoose.Types.ObjectId);

    // Convert userId to ObjectId to ensure proper comparison
    const userIdObjectId = userId instanceof mongoose.Types.ObjectId ? userId : new mongoose.Types.ObjectId(userId);

    console.log('Querying with userId:', {
      original: userId,
      objectId: userIdObjectId,
      string: userId.toString(),
    });

    // Get all logs for this user - try ObjectId first (most common case)
    let logs = await AuthLog.find({
      userId: userIdObjectId,
    }).sort({ timestamp: -1 });

    console.log('Total logs found with ObjectId:', logs.length);

    // If no logs found, try with string comparison (in case some logs have string userId)
    if (logs.length === 0) {
      console.log('Trying with string userId...');
      logs = await AuthLog.find({
        userId: userId.toString(),
      }).sort({ timestamp: -1 });
      console.log('Total logs found with string:', logs.length);
    }

    // Final fallback: try with original userId
    if (logs.length === 0) {
      console.log('Trying with original userId...');
      logs = await AuthLog.find({
        userId: userId,
      }).sort({ timestamp: -1 });
      console.log('Total logs found with original:', logs.length);
    }

    console.log('Final total logs found:', logs.length);
    console.log('Logs breakdown:', {
      password: logs.filter((log) => log.method === 'password').length,
      webauthn: logs.filter((log) => log.method === 'webauthn').length,
    });

    // Log sample log entries for debugging
    if (logs.length > 0) {
      console.log(
        'Sample log entries:',
        logs.slice(0, 3).map((log) => ({
          userId: log.userId?.toString(),
          method: log.method,
          duration: log.duration,
          success: log.success,
          timestamp: log.timestamp,
        }))
      );
    } else {
      // If no logs found, check if there are any logs at all
      const allLogsCount = await AuthLog.countDocuments();
      console.log('No logs found for user. Total logs in database:', allLogsCount);

      // Check a few sample logs to see their userId format
      const sampleLogs = await AuthLog.find().limit(3);
      if (sampleLogs.length > 0) {
        console.log(
          'Sample logs from database:',
          sampleLogs.map((log) => ({
            userId: log.userId?.toString(),
            method: log.method,
            duration: log.duration,
          }))
        );
      }
    }

    // Calculate statistics
    const passwordLogs = logs.filter((log) => log.method === 'password');
    const webauthnLogs = logs.filter((log) => log.method === 'webauthn');

    const passwordSuccess = passwordLogs.filter((log) => log.success).length;
    const passwordFailed = passwordLogs.filter((log) => !log.success).length;
    const webauthnSuccess = webauthnLogs.filter((log) => log.success).length;
    const webauthnFailed = webauthnLogs.filter((log) => !log.success).length;

    // Calculate average durations
    const passwordAvgDuration = passwordLogs.length > 0 ? passwordLogs.reduce((sum, log) => sum + log.duration, 0) / passwordLogs.length : 0;
    const webauthnAvgDuration = webauthnLogs.length > 0 ? webauthnLogs.reduce((sum, log) => sum + log.duration, 0) / webauthnLogs.length : 0;

    // Calculate percentiles for duration
    const calculatePercentile = (arr, percentile) => {
      if (arr.length === 0) return 0;
      const sorted = [...arr].sort((a, b) => a - b);
      const index = Math.ceil((percentile / 100) * sorted.length) - 1;
      return sorted[Math.max(0, index)] || 0;
    };

    const passwordDurations = passwordLogs.map((log) => log.duration);
    const webauthnDurations = webauthnLogs.map((log) => log.duration);

    const passwordPercentiles = {
      p50: calculatePercentile(passwordDurations, 50),
      p95: calculatePercentile(passwordDurations, 95),
      p99: calculatePercentile(passwordDurations, 99),
      min: passwordDurations.length > 0 ? Math.min(...passwordDurations) : 0,
      max: passwordDurations.length > 0 ? Math.max(...passwordDurations) : 0,
    };

    const webauthnPercentiles = {
      p50: calculatePercentile(webauthnDurations, 50),
      p95: calculatePercentile(webauthnDurations, 95),
      p99: calculatePercentile(webauthnDurations, 99),
      min: webauthnDurations.length > 0 ? Math.min(...webauthnDurations) : 0,
      max: webauthnDurations.length > 0 ? Math.max(...webauthnDurations) : 0,
    };

    // Error analysis
    const passwordErrors = passwordLogs.filter((log) => !log.success);
    const webauthnErrors = webauthnLogs.filter((log) => !log.success);

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

    const passwordErrorCategories = passwordErrors.reduce((acc, log) => {
      const category = categorizeError(log.errorMessage);
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const webauthnErrorCategories = webauthnErrors.reduce((acc, log) => {
      const category = categorizeError(log.errorMessage);
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    // Device/Browser analysis
    const parseUserAgent = (userAgent) => {
      if (!userAgent) return { browser: 'Unknown', device: 'Unknown', os: 'Unknown' };
      const ua = userAgent.toLowerCase();
      let browser = 'Unknown';
      let device = 'Desktop';
      let os = 'Unknown';

      if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome';
      else if (ua.includes('firefox')) browser = 'Firefox';
      else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
      else if (ua.includes('edg')) browser = 'Edge';
      else if (ua.includes('opera')) browser = 'Opera';

      if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) device = 'Mobile';
      else if (ua.includes('tablet') || ua.includes('ipad')) device = 'Tablet';

      if (ua.includes('windows')) os = 'Windows';
      else if (ua.includes('mac')) os = 'macOS';
      else if (ua.includes('linux')) os = 'Linux';
      else if (ua.includes('android')) os = 'Android';
      else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';

      return { browser, device, os };
    };

    const passwordDeviceBreakdown = passwordLogs.reduce(
      (acc, log) => {
        const { browser, device, os } = parseUserAgent(log.userAgent);
        if (!acc.browsers[browser]) acc.browsers[browser] = 0;
        if (!acc.devices[device]) acc.devices[device] = 0;
        if (!acc.os[os]) acc.os[os] = 0;
        acc.browsers[browser]++;
        acc.devices[device]++;
        acc.os[os]++;
        return acc;
      },
      { browsers: {}, devices: {}, os: {} }
    );

    const webauthnDeviceBreakdown = webauthnLogs.reduce(
      (acc, log) => {
        const { browser, device, os } = parseUserAgent(log.userAgent);
        if (!acc.browsers[browser]) acc.browsers[browser] = 0;
        if (!acc.devices[device]) acc.devices[device] = 0;
        if (!acc.os[os]) acc.os[os] = 0;
        acc.browsers[browser]++;
        acc.devices[device]++;
        acc.os[os]++;
        return acc;
      },
      { browsers: {}, devices: {}, os: {} }
    );

    // Time-based analysis
    const passwordTimeAnalysis = passwordLogs.reduce(
      (acc, log) => {
        const hour = new Date(log.timestamp).getHours();
        const day = new Date(log.timestamp).getDay();
        acc.hours[hour] = (acc.hours[hour] || 0) + 1;
        acc.days[day] = (acc.days[day] || 0) + 1;
        return acc;
      },
      { hours: {}, days: {} }
    );

    const webauthnTimeAnalysis = webauthnLogs.reduce(
      (acc, log) => {
        const hour = new Date(log.timestamp).getHours();
        const day = new Date(log.timestamp).getDay();
        acc.hours[hour] = (acc.hours[hour] || 0) + 1;
        acc.days[day] = (acc.days[day] || 0) + 1;
        return acc;
      },
      { hours: {}, days: {} }
    );

    // Security metrics - brute force detection
    const detectBruteForce = (logs) => {
      const ipAttempts = {};
      logs.forEach((log) => {
        if (log.ipAddress) {
          if (!ipAttempts[log.ipAddress]) {
            ipAttempts[log.ipAddress] = { total: 0, failed: 0, lastAttempt: null };
          }
          ipAttempts[log.ipAddress].total++;
          if (!log.success) ipAttempts[log.ipAddress].failed++;
          if (!ipAttempts[log.ipAddress].lastAttempt || log.timestamp > ipAttempts[log.ipAddress].lastAttempt) {
            ipAttempts[log.ipAddress].lastAttempt = log.timestamp;
          }
        }
      });

      const suspiciousIPs = Object.entries(ipAttempts)
        .filter(([ip, data]) => data.failed >= 5 || (data.total >= 10 && data.failed / data.total > 0.7))
        .map(([ip, data]) => ({ ip, attempts: data.total, failed: data.failed, ratio: ((data.failed / data.total) * 100).toFixed(1) }));

      return { totalIPs: Object.keys(ipAttempts).length, suspiciousIPs };
    };

    const passwordSecurity = detectBruteForce(passwordLogs);
    const webauthnSecurity = detectBruteForce(webauthnLogs);

    // Get recent logs (last 10)
    const recentLogs = logs.slice(0, 10);

    // Get logs by date (last 30 days) - use the same userId format that worked
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Use the same query pattern that found logs above
    let recentLogsByDate = await AuthLog.find({
      userId: userIdObjectId,
      timestamp: { $gte: thirtyDaysAgo },
    }).sort({ timestamp: 1 });

    if (recentLogsByDate.length === 0) {
      recentLogsByDate = await AuthLog.find({
        userId: userId.toString(),
        timestamp: { $gte: thirtyDaysAgo },
      }).sort({ timestamp: 1 });
    }

    if (recentLogsByDate.length === 0) {
      recentLogsByDate = await AuthLog.find({
        userId: userId,
        timestamp: { $gte: thirtyDaysAgo },
      }).sort({ timestamp: 1 });
    }

    // Group by date
    const logsByDate = recentLogsByDate.reduce((acc, log) => {
      const date = log.timestamp.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { password: 0, webauthn: 0 };
      }
      if (log.success) {
        acc[date][log.method]++;
      }
      return acc;
    }, {});

    // Statistical Analysis
    const passwordDurationsArray = passwordLogs.map((log) => log.duration);
    const webauthnDurationsArray = webauthnLogs.map((log) => log.duration);

    // Confidence Intervals
    const passwordCI = confidenceInterval(passwordDurationsArray);
    const webauthnCI = confidenceInterval(webauthnDurationsArray);

    // Independent t-test for duration comparison
    const durationTTest = independentTTest(passwordDurationsArray, webauthnDurationsArray);

    // Chi-square test for success rate comparison
    const successRateChiSquare = chiSquareTest(passwordSuccess, passwordLogs.length, webauthnSuccess, webauthnLogs.length);

    // Power analysis
    const powerAnalysisResult = powerAnalysis(passwordLogs.length, webauthnLogs.length, durationTTest.effectSize);

    // Minimum sample size calculation
    const minSampleSize = calculateSampleSize(0.5);

    const statisticalAnalysis = {
      duration: {
        tTest: durationTTest,
        confidenceIntervals: {
          password: passwordCI,
          webauthn: webauthnCI,
        },
      },
      successRate: {
        chiSquare: successRateChiSquare,
      },
      powerAnalysis: powerAnalysisResult,
      sampleSize: {
        current: {
          password: passwordLogs.length,
          webauthn: webauthnLogs.length,
        },
        recommended: minSampleSize,
        adequacy: passwordLogs.length >= minSampleSize && webauthnLogs.length >= minSampleSize ? 'Adequate' : 'Insufficient',
      },
    };

    res.json({
      summary: {
        password: {
          total: passwordLogs.length,
          success: passwordSuccess,
          failed: passwordFailed,
          successRate: passwordLogs.length > 0 ? ((passwordSuccess / passwordLogs.length) * 100).toFixed(2) : 0,
          avgDuration: Math.round(passwordAvgDuration),
          percentiles: passwordPercentiles,
          errorCategories: passwordErrorCategories,
          deviceBreakdown: passwordDeviceBreakdown,
          timeAnalysis: passwordTimeAnalysis,
          security: passwordSecurity,
        },
        webauthn: {
          total: webauthnLogs.length,
          success: webauthnSuccess,
          failed: webauthnFailed,
          successRate: webauthnLogs.length > 0 ? ((webauthnSuccess / webauthnLogs.length) * 100).toFixed(2) : 0,
          avgDuration: Math.round(webauthnAvgDuration),
          percentiles: webauthnPercentiles,
          errorCategories: webauthnErrorCategories,
          deviceBreakdown: webauthnDeviceBreakdown,
          timeAnalysis: webauthnTimeAnalysis,
          security: webauthnSecurity,
        },
      },
      recentLogs: recentLogs.map((log) => ({
        method: log.method,
        timestamp: log.timestamp,
        duration: log.duration,
        success: log.success,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        errorMessage: log.errorMessage,
      })),
      logsByDate,
      statisticalAnalysis,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get global statistics (for comparison)
router.get('/global-stats', authenticate, async (req, res) => {
  try {
    // Get all logs
    const allLogs = await AuthLog.find().sort({ timestamp: -1 });

    const passwordLogs = allLogs.filter((log) => log.method === 'password');
    const webauthnLogs = allLogs.filter((log) => log.method === 'webauthn');

    const passwordSuccess = passwordLogs.filter((log) => log.success).length;
    const passwordFailed = passwordLogs.filter((log) => !log.success).length;
    const webauthnSuccess = webauthnLogs.filter((log) => log.success).length;
    const webauthnFailed = webauthnLogs.filter((log) => !log.success).length;

    const passwordAvgDuration = passwordLogs.length > 0 ? passwordLogs.reduce((sum, log) => sum + log.duration, 0) / passwordLogs.length : 0;
    const webauthnAvgDuration = webauthnLogs.length > 0 ? webauthnLogs.reduce((sum, log) => sum + log.duration, 0) / webauthnLogs.length : 0;

    // Calculate percentiles for duration
    const calculatePercentile = (arr, percentile) => {
      if (arr.length === 0) return 0;
      const sorted = [...arr].sort((a, b) => a - b);
      const index = Math.ceil((percentile / 100) * sorted.length) - 1;
      return sorted[Math.max(0, index)] || 0;
    };

    const passwordDurations = passwordLogs.map((log) => log.duration);
    const webauthnDurations = webauthnLogs.map((log) => log.duration);

    const passwordPercentiles = {
      p50: calculatePercentile(passwordDurations, 50),
      p95: calculatePercentile(passwordDurations, 95),
      p99: calculatePercentile(passwordDurations, 99),
      min: passwordDurations.length > 0 ? Math.min(...passwordDurations) : 0,
      max: passwordDurations.length > 0 ? Math.max(...passwordDurations) : 0,
    };

    const webauthnPercentiles = {
      p50: calculatePercentile(webauthnDurations, 50),
      p95: calculatePercentile(webauthnDurations, 95),
      p99: calculatePercentile(webauthnDurations, 99),
      min: webauthnDurations.length > 0 ? Math.min(...webauthnDurations) : 0,
      max: webauthnDurations.length > 0 ? Math.max(...webauthnDurations) : 0,
    };

    // Error analysis
    const passwordErrors = passwordLogs.filter((log) => !log.success);
    const webauthnErrors = webauthnLogs.filter((log) => !log.success);

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

    const passwordErrorCategories = passwordErrors.reduce((acc, log) => {
      const category = categorizeError(log.errorMessage);
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const webauthnErrorCategories = webauthnErrors.reduce((acc, log) => {
      const category = categorizeError(log.errorMessage);
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    // Device/Browser analysis
    const parseUserAgent = (userAgent) => {
      if (!userAgent) return { browser: 'Unknown', device: 'Unknown', os: 'Unknown' };
      const ua = userAgent.toLowerCase();
      let browser = 'Unknown';
      let device = 'Desktop';
      let os = 'Unknown';

      if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome';
      else if (ua.includes('firefox')) browser = 'Firefox';
      else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
      else if (ua.includes('edg')) browser = 'Edge';
      else if (ua.includes('opera')) browser = 'Opera';

      if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) device = 'Mobile';
      else if (ua.includes('tablet') || ua.includes('ipad')) device = 'Tablet';

      if (ua.includes('windows')) os = 'Windows';
      else if (ua.includes('mac')) os = 'macOS';
      else if (ua.includes('linux')) os = 'Linux';
      else if (ua.includes('android')) os = 'Android';
      else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';

      return { browser, device, os };
    };

    const passwordDeviceBreakdown = passwordLogs.reduce(
      (acc, log) => {
        const { browser, device, os } = parseUserAgent(log.userAgent);
        if (!acc.browsers[browser]) acc.browsers[browser] = 0;
        if (!acc.devices[device]) acc.devices[device] = 0;
        if (!acc.os[os]) acc.os[os] = 0;
        acc.browsers[browser]++;
        acc.devices[device]++;
        acc.os[os]++;
        return acc;
      },
      { browsers: {}, devices: {}, os: {} }
    );

    const webauthnDeviceBreakdown = webauthnLogs.reduce(
      (acc, log) => {
        const { browser, device, os } = parseUserAgent(log.userAgent);
        if (!acc.browsers[browser]) acc.browsers[browser] = 0;
        if (!acc.devices[device]) acc.devices[device] = 0;
        if (!acc.os[os]) acc.os[os] = 0;
        acc.browsers[browser]++;
        acc.devices[device]++;
        acc.os[os]++;
        return acc;
      },
      { browsers: {}, devices: {}, os: {} }
    );

    // Time-based analysis
    const passwordTimeAnalysis = passwordLogs.reduce(
      (acc, log) => {
        const hour = new Date(log.timestamp).getHours();
        const day = new Date(log.timestamp).getDay();
        acc.hours[hour] = (acc.hours[hour] || 0) + 1;
        acc.days[day] = (acc.days[day] || 0) + 1;
        return acc;
      },
      { hours: {}, days: {} }
    );

    const webauthnTimeAnalysis = webauthnLogs.reduce(
      (acc, log) => {
        const hour = new Date(log.timestamp).getHours();
        const day = new Date(log.timestamp).getDay();
        acc.hours[hour] = (acc.hours[hour] || 0) + 1;
        acc.days[day] = (acc.days[day] || 0) + 1;
        return acc;
      },
      { hours: {}, days: {} }
    );

    // Security metrics - brute force detection
    const detectBruteForce = (logs) => {
      const ipAttempts = {};
      logs.forEach((log) => {
        if (log.ipAddress) {
          if (!ipAttempts[log.ipAddress]) {
            ipAttempts[log.ipAddress] = { total: 0, failed: 0, lastAttempt: null };
          }
          ipAttempts[log.ipAddress].total++;
          if (!log.success) ipAttempts[log.ipAddress].failed++;
          if (!ipAttempts[log.ipAddress].lastAttempt || log.timestamp > ipAttempts[log.ipAddress].lastAttempt) {
            ipAttempts[log.ipAddress].lastAttempt = log.timestamp;
          }
        }
      });

      const suspiciousIPs = Object.entries(ipAttempts)
        .filter(([ip, data]) => data.failed >= 5 || (data.total >= 10 && data.failed / data.total > 0.7))
        .map(([ip, data]) => ({ ip, attempts: data.total, failed: data.failed, ratio: ((data.failed / data.total) * 100).toFixed(1) }));

      return { totalIPs: Object.keys(ipAttempts).length, suspiciousIPs };
    };

    const passwordSecurity = detectBruteForce(passwordLogs);
    const webauthnSecurity = detectBruteForce(webauthnLogs);

    // Statistical Analysis
    const passwordDurationsArray = passwordLogs.map((log) => log.duration);
    const webauthnDurationsArray = webauthnLogs.map((log) => log.duration);

    // Confidence Intervals
    const passwordCI = confidenceInterval(passwordDurationsArray);
    const webauthnCI = confidenceInterval(webauthnDurationsArray);

    // Independent t-test for duration comparison
    const durationTTest = independentTTest(passwordDurationsArray, webauthnDurationsArray);

    // Chi-square test for success rate comparison
    const successRateChiSquare = chiSquareTest(passwordSuccess, passwordLogs.length, webauthnSuccess, webauthnLogs.length);

    // Power analysis
    const powerAnalysisResult = powerAnalysis(passwordLogs.length, webauthnLogs.length, durationTTest.effectSize);

    // Minimum sample size calculation
    const minSampleSize = calculateSampleSize(0.5);

    const statisticalAnalysis = {
      duration: {
        tTest: durationTTest,
        confidenceIntervals: {
          password: passwordCI,
          webauthn: webauthnCI,
        },
      },
      successRate: {
        chiSquare: successRateChiSquare,
      },
      powerAnalysis: powerAnalysisResult,
      sampleSize: {
        current: {
          password: passwordLogs.length,
          webauthn: webauthnLogs.length,
        },
        recommended: minSampleSize,
        adequacy: passwordLogs.length >= minSampleSize && webauthnLogs.length >= minSampleSize ? 'Adequate' : 'Insufficient',
      },
    };

    // Get recent logs (last 10 from all users)
    const recentLogs = allLogs.slice(0, 10).map((log) => ({
      method: log.method,
      timestamp: log.timestamp,
      duration: log.duration,
      success: log.success,
      ipAddress: log.ipAddress,
    }));

    // Get logs by date (last 30 days) - all users
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentLogsByDate = await AuthLog.find({
      timestamp: { $gte: thirtyDaysAgo },
    }).sort({ timestamp: 1 });

    // Group by date
    const logsByDate = recentLogsByDate.reduce((acc, log) => {
      const date = log.timestamp.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { password: 0, webauthn: 0 };
      }
      if (log.success) {
        acc[date][log.method]++;
      }
      return acc;
    }, {});

    res.json({
      summary: {
        password: {
          total: passwordLogs.length,
          success: passwordSuccess,
          failed: passwordFailed,
          successRate: passwordLogs.length > 0 ? ((passwordSuccess / passwordLogs.length) * 100).toFixed(2) : 0,
          avgDuration: Math.round(passwordAvgDuration),
          percentiles: passwordPercentiles,
          errorCategories: passwordErrorCategories,
          deviceBreakdown: passwordDeviceBreakdown,
          timeAnalysis: passwordTimeAnalysis,
          security: passwordSecurity,
        },
        webauthn: {
          total: webauthnLogs.length,
          success: webauthnSuccess,
          failed: webauthnFailed,
          successRate: webauthnLogs.length > 0 ? ((webauthnSuccess / webauthnLogs.length) * 100).toFixed(2) : 0,
          avgDuration: Math.round(webauthnAvgDuration),
          percentiles: webauthnPercentiles,
          errorCategories: webauthnErrorCategories,
          deviceBreakdown: webauthnDeviceBreakdown,
          timeAnalysis: webauthnTimeAnalysis,
          security: webauthnSecurity,
        },
      },
      recentLogs: recentLogs.map((log) => ({
        method: log.method,
        timestamp: log.timestamp,
        duration: log.duration,
        success: log.success,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        errorMessage: log.errorMessage,
      })),
      logsByDate,
      statisticalAnalysis,
    });
  } catch (error) {
    console.error('Get global stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
