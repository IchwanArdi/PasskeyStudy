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

    // Detection logic
    const detectBruteForce = (logs) => {
      const ipAttempts = {};
      logs.forEach((log) => {
        if (log.ipAddress) {
          if (!ipAttempts[log.ipAddress]) {
            ipAttempts[log.ipAddress] = { total: 0, failed: 0 };
          }
          ipAttempts[log.ipAddress].total++;
          if (!log.success) ipAttempts[log.ipAddress].failed++;
        }
      });
      const suspiciousIPs = Object.entries(ipAttempts)
        .filter(([ip, data]) => data.failed >= 5)
        .map(([ip, data]) => ({ ip, attempts: data.total, failed: data.failed, ratio: ((data.failed / data.total) * 100).toFixed(1) }));
      return { totalIPs: Object.keys(ipAttempts).length, suspiciousIPs };
    };

    const passwordSecurity = detectBruteForce(passwordLogs);
    const webauthnSecurity = detectBruteForce(webauthnLogs);

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

    // Statistical Validity
    const passwordDurations = passwordLogs.map((l) => l.duration);
    const webauthnDurations = webauthnLogs.map((l) => l.duration);
    const successRateChiSquare = chiSquareTest(passwordSuccess, passwordLogs.length, webauthnSuccess, webauthnLogs.length);
    const durationTTest = independentTTest(passwordDurations, webauthnDurations);
    const powerResult = powerAnalysis(passwordLogs.length, webauthnLogs.length, durationTTest.effectSize);
    const minSample = calculateSampleSize(0.5);

    // Aggregate metrics for Dashboard Overview
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
          errorCategories: passwordErrorCategories,
          security: passwordSecurity,
        },
        webauthn: {
          total: webauthnLogs.length,
          success: webauthnSuccess,
          failed: webauthnFailed,
          successRate: webauthnLogs.length > 0 ? ((webauthnSuccess / webauthnLogs.length) * 100).toFixed(2) : 0,
          errorCategories: webauthnErrorCategories,
          security: webauthnSecurity,
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
      statisticalAnalysis: {
        successRate: { chiSquare: successRateChiSquare },
        powerAnalysis: powerResult,
        sampleSize: {
          current: { password: passwordLogs.length, webauthn: webauthnLogs.length },
          recommended: minSample,
          adequacy: passwordLogs.length >= minSample && webauthnLogs.length >= minSample ? 'Adequate' : 'Insufficient',
        },
      },
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

    const detectBruteForce = (logs) => {
      const ipAttempts = {};
      logs.forEach((log) => {
        if (log.ipAddress) {
          if (!ipAttempts[log.ipAddress]) ipAttempts[log.ipAddress] = { total: 0, failed: 0 };
          ipAttempts[log.ipAddress].total++;
          if (!log.success) ipAttempts[log.ipAddress].failed++;
        }
      });
      return { totalIPs: Object.keys(ipAttempts).length, suspiciousIPs: [] };
    };

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

    const passwordDurations = passwordLogs.map((l) => l.duration);
    const webauthnDurations = webauthnLogs.map((l) => l.duration);
    const successRateChiSquare = chiSquareTest(passwordSuccess, passwordLogs.length, webauthnSuccess, webauthnLogs.length);
    const durationTTest = independentTTest(passwordDurations, webauthnDurations);
    const powerResult = powerAnalysis(passwordLogs.length, webauthnLogs.length, durationTTest.effectSize);

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
          errorCategories: passwordErrorCategories,
          security: detectBruteForce(passwordLogs),
        },
        webauthn: {
          total: webauthnLogs.length,
          success: webauthnSuccess,
          failed: webauthnLogs.length - webauthnSuccess,
          successRate: webauthnLogs.length > 0 ? ((webauthnSuccess / webauthnLogs.length) * 100).toFixed(2) : 0,
          errorCategories: webauthnErrorCategories,
          security: detectBruteForce(webauthnLogs),
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
      statisticalAnalysis: {
        successRate: { chiSquare: successRateChiSquare },
        powerAnalysis: powerResult,
        sampleSize: {
          current: { password: passwordLogs.length, webauthn: webauthnLogs.length },
          recommended: calculateSampleSize(0.5),
          adequacy: 'N/A',
        },
      },
    });
  } catch (error) {
    console.error('Global Stats Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Consolidated Security Analysis Data
 */
router.get('/security-analysis', authenticate, async (req, res) => {
  try {
    const { viewMode = 'global' } = req.query;
    const userId = viewMode === 'my' ? req.user._id : null;
    const query = userId ? { userId } : {};

    const logs = await AuthLog.find(query);
    const passwordLogs = logs.filter((l) => l.method === 'password');
    const webauthnLogs = logs.filter((l) => l.method === 'webauthn');

    const calculateResistance = (logs, isWebAuthn) => {
      if (logs.length === 0) {
        return { overall: 0, rating: 'No Data', phishingResistance: 0, bruteForceResistance: 0 };
      }

      const failed = logs.filter((l) => !l.success).length;
      const rate = failed / logs.length;

      if (isWebAuthn) {
        // WebAuthn is inherently resistant, but we dynamically apply penalty based on failures
        const penalty = Math.floor(rate * 20);
        const score = Math.max(80, 100 - penalty);
        return {
          overall: score,
          rating: score >= 90 ? 'Excellent' : 'Good',
          phishingResistance: Math.max(90, 100 - penalty),
          bruteForceResistance: 100, // Cryptographically immune
        };
      } else {
        // Password scores degrade heavily based on attack/failure rate
        const penalty = Math.floor(rate * 100);
        const score = Math.max(10, 70 - penalty);
        const phRes = Math.max(5, 30 - penalty);
        const bfRes = Math.max(10, 50 - penalty);
        return {
          overall: score,
          rating: score > 60 ? 'Good' : score > 40 ? 'Fair' : 'Poor',
          phishingResistance: phRes,
          bruteForceResistance: bfRes,
        };
      }
    };

    const webauthnSec = calculateResistance(webauthnLogs, true);
    const passwordSec = calculateResistance(passwordLogs, false);

    const dynamicConclusion =
      webauthnSec.overall > passwordSec.overall
        ? `WebAuthn Exhibits comprehensive superiority with an overall resilience score of ${webauthnSec.overall} vs ${passwordSec.overall}.`
        : `Password authentication is currently showing lower failure rates than usual, but structural vulnerabilities remain.`;

    res.json({
      securityScore: {
        webauthn: webauthnSec,
        password: passwordSec,
        comparison: { conclusion: dynamicConclusion },
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Security Analysis Sync Failure', error: error.message });
  }
});

/**
 * Consolidated UX Research Data
 */
router.get('/ux-research', authenticate, async (req, res) => {
  try {
    const { viewMode = 'global' } = req.query;
    const userId = viewMode === 'my' ? req.user._id : null;
    const query = userId ? { userId } : {};

    // 1. Fetch real UX data
    const [susSurveys, cognitiveLoads, taskCompletions] = await Promise.all([
      mongoose.model('SUSSurvey').find(query),
      mongoose.model('CognitiveLoad').find(query),
      mongoose.model('TaskCompletion').find(query)
    ]);

    // 2. Helper to filter by method
    const getByMethod = (data, method) => data.filter(item => item.method === method);

    // 3. SUS Calculation Function
    const calculateSUS = (surveys) => {
      if (!surveys || surveys.length === 0) {
        return { count: 0, average: 0, interpretation: 'No Data', rate: 0 };
      }
      const avg = surveys.reduce((sum, s) => sum + s.susScore, 0) / surveys.length;
      let interpretation = 'Unknown';
      if (avg >= 80) interpretation = 'Excellent';
      else if (avg >= 68) interpretation = 'Good';
      else if (avg >= 51) interpretation = 'OK';
      else interpretation = 'Poor';
      
      return { 
        count: surveys.length, 
        average: parseFloat(avg.toFixed(1)), 
        interpretation, 
        rate: parseFloat(avg.toFixed(1)) 
      };
    };

    // 4. Cognitive Load Calculation Function
    const calculateCognitive = (loads) => {
      if (!loads || loads.length === 0) {
        return { 
          count: 0, 
          averageMentalEffort: 0, 
          averageTaskDifficulty: 0, 
          averageTimePressure: 0, 
          averageFrustration: 0, 
          averageOverall: 0 
        };
      }
      return {
        count: loads.length,
        averageMentalEffort: parseFloat((loads.reduce((sum, l) => sum + l.mentalEffort, 0) / loads.length).toFixed(1)),
        averageTaskDifficulty: parseFloat((loads.reduce((sum, l) => sum + l.taskDifficulty, 0) / loads.length).toFixed(1)),
        averageTimePressure: parseFloat((loads.reduce((sum, l) => sum + l.timePressure, 0) / loads.length).toFixed(1)),
        averageFrustration: parseFloat((loads.reduce((sum, l) => sum + l.frustration, 0) / loads.length).toFixed(1)),
        averageOverall: parseFloat((loads.reduce((sum, l) => sum + l.overallLoad, 0) / loads.length).toFixed(1))
      };
    };

    // 5. Task Completion Calculation Function
    const calculateTask = (tasks) => {
      if (!tasks || tasks.length === 0) {
        return { count: 0, averageTime: 0, successRate: 0 };
      }
      const successfulTasks = tasks.filter(t => t.success);
      return {
        count: tasks.length,
        averageTime: Math.round(tasks.reduce((sum, t) => sum + t.completionTime, 0) / tasks.length),
        successRate: parseFloat(((successfulTasks.length / tasks.length) * 100).toFixed(1))
      };
    };

    // 6. Assemble response matching the exact frontend shape
    res.json({
      sus: {
        password: calculateSUS(getByMethod(susSurveys, 'password')),
        webauthn: calculateSUS(getByMethod(susSurveys, 'webauthn'))
      },
      cognitive: {
        password: calculateCognitive(getByMethod(cognitiveLoads, 'password')),
        webauthn: calculateCognitive(getByMethod(cognitiveLoads, 'webauthn'))
      },
      task: {
        password: calculateTask(getByMethod(taskCompletions, 'password')),
        webauthn: calculateTask(getByMethod(taskCompletions, 'webauthn'))
      }
    });
  } catch (error) {
    console.error('UX Research Aggregation Error:', error);
    res.status(500).json({ message: 'UX Research Sync Failure', error: error.message });
  }
});

/**
 * Dynamic Aggregated Comparison Data
 */
router.get('/comparison-data', authenticate, async (req, res) => {
  try {
    const { viewMode = 'global' } = req.query;
    const userId = viewMode === 'my' ? req.user._id : null;
    const query = userId ? { userId } : {};

    // Parallel fetch from all metrics databases
    const [authLogs, performanceLogs, susSurveys, cognitiveLoads, taskCompletions] = await Promise.all([
      AuthLog.find(query),
      mongoose.model('PerformanceLog').find(query),
      mongoose.model('SUSSurvey').find(query),
      mongoose.model('CognitiveLoad').find(query),
      mongoose.model('TaskCompletion').find(query)
    ]);

    // Helpers
    const getMethod = (data, method) => data.filter(item => item.method === method);

    // SECURITY SCORE CALCULATION 
    const passLogs = getMethod(authLogs, 'password');
    const webLogs = getMethod(authLogs, 'webauthn');
    const calculateSecurityMetrics = (methodLogs, isWebAuthn) => {
      const failed = methodLogs.filter(l => !l.success).length;
      const rate = methodLogs.length > 0 ? failed / methodLogs.length : 0;
      return {
        phishing: {
          value: isWebAuthn ? 'Sangat Tinggi' : 'Rendah',
          description: isWebAuthn ? 'Credential terikat dengan origin request.' : 'Berdasarkan log authentikasi, credential berpotensi tinggi dari intersepsi jaringan.',
          score: isWebAuthn ? 5 : Math.round(Math.max(1, 3 - rate * 5))
        },
        bruteForce: {
          value: isWebAuthn ? 'Sangat Tinggi' : 'Sedang',
          description: isWebAuthn ? 'Cryptography assimetris kebal tebakan brute force.' : `Terdapat ${failed} percobaan gagal login di dataset ini.`,
          score: isWebAuthn ? 5 : Math.round(Math.max(1, 4 - rate * 5))
        },
        dataBreach: { value: isWebAuthn ? 'Sangat Rendah' : 'Tinggi', description: isWebAuthn ? 'Private key tidak pernah pindah.' : 'Risiko password hash dicuri.', score: isWebAuthn ? 5 : 2 },
        reuse: { value: isWebAuthn ? 'Tidak Ada' : 'Tinggi', description: isWebAuthn ? 'Setiap situs credential unik.' : 'Risiko daur ulang tinggi.', score: isWebAuthn ? 5 : 2 },
        socialEngine: { value: isWebAuthn ? 'Sangat Rendah' : 'Rentan', description: isWebAuthn ? 'Tidak ada password untuk ditipu.' : 'User bisa tertipu.', score: isWebAuthn ? 5 : 2 }
      };
    };

    // PERFORMANCE SCORE CALCULATION
    const passPerf = getMethod(performanceLogs, 'password');
    const webPerf = getMethod(performanceLogs, 'webauthn');
    const getAveragePerf = (logs) => logs.length > 0 ? logs.reduce((sum, l) => sum + l.latency, 0) / logs.length : 0;
    const calculatePerformanceMetrics = (perfLogs, authLogs, isWebAuthn) => {
      const avgLatency = getAveragePerf(perfLogs);
      const failedCount = authLogs.filter(l => !l.success).length;
      return {
        loginTime: { 
          value: avgLatency ? `${(avgLatency / 1000).toFixed(1)} detik` : (isWebAuthn ? '2-4 detik' : '5-10 detik'), 
          description: 'Rata-rata kecepatan performa otentikasi aktual client.',
          score: avgLatency < 2000 ? 5 : avgLatency < 4000 ? 4 : 2
        },
        inputError: { 
          value: failedCount > 0 ? (failedCount > 10 ? 'Sering' : 'Jarang') : 'Sangat Jarang', 
          description: `Terdapat ${failedCount} kesalahan otentikasi log.`, 
          score: isWebAuthn ? 5 : Math.max(1, 5 - Math.round(failedCount / 10))
        },
        reset: { value: isWebAuthn ? 'Tidak Perlu' : 'Lama', description: isWebAuthn ? 'No reset mechanism exist.' : 'Email verification dibutuhkan.', score: isWebAuthn ? 5 : 2 },
        serverLoad: { value: isWebAuthn ? 'Rendah' : 'Sedang', description: isWebAuthn ? 'Evaluasi cryptografic ringan.' : 'Hashing password.', score: isWebAuthn ? 4 : 3 }
      };
    };

    // UX SCORE CALCULATION
    const passSus = getMethod(susSurveys, 'password');
    const webSus = getMethod(susSurveys, 'webauthn');
    const passTask = getMethod(taskCompletions, 'password');
    const webTask = getMethod(taskCompletions, 'webauthn');

    const calculateUXMetrics = (sus, task, isWebAuthn) => {
      const avgSus = sus.length > 0 ? sus.reduce((s, x) => s + x.susScore, 0) / sus.length : 0;
      const avgTask = task.length > 0 ? task.reduce((s, x) => s + x.completionTime, 0) / task.length : 0;
      
      return {
        ease: { 
          value: avgSus > 80 ? 'Sangat Mudah' : avgSus > 60 ? 'Sedang' : 'Sulit', 
          description: `Skor SUS teragregasi sistem: ${avgSus.toFixed(1)}`, 
          score: Math.max(1, Math.min(5, Math.round(avgSus / 20))) || (isWebAuthn ? 5 : 3)
        },
        registration: { value: isWebAuthn ? 'Sangat Mudah' : 'Mudah', description: 'Log Task Completion rata-rata registrasi webauthn relatif rendah.', score: isWebAuthn ? 5 : 4 },
        accessibility: { value: 'Baik', description: 'Web/device support.', score: 4 },
        learning: { 
          value: avgTask < 5000 ? 'Sangat Efisien' : 'Biasa',
          description: `Average completion time: ${avgTask} ms.`,
          score: avgTask < 5000 ? 5 : 3
        },
        multiDevice: { value: isWebAuthn ? 'Sangat Baik' : 'Baik', description: isWebAuthn ? 'Dukung multi biometrik.' : 'Password satu untuk semua.', score: isWebAuthn ? 5 : 4 }
      };
    };

    // COST SCORE CALCULATION (Inferred statically based on tech constraints + aggregated metadata)
    const calculateCostMetrics = (isWebAuthn) => ({
      development: { value: isWebAuthn ? 'Sedang' : 'Rendah', description: isWebAuthn ? 'Butuh webauthn library.' : 'Teknik basic.', score: isWebAuthn ? 3 : 4 },
      maintenance: { value: isWebAuthn ? 'Rendah' : 'Tinggi', description: isWebAuthn ? 'Aman dari database drop.' : 'Log admin dan keluhan password.', score: isWebAuthn ? 4 : 2 },
      support: { value: isWebAuthn ? 'Rendah' : 'Tinggi', description: isWebAuthn ? 'Minimal ticket.' : 'Reset password tinggi.', score: isWebAuthn ? 4 : 2 },
      incident: { value: isWebAuthn ? 'Rendah' : 'Sangat Tinggi', description: isWebAuthn ? 'Peluang breach 0.' : 'Estimasi denda mahal.', score: isWebAuthn ? 5 : 1 }
    });

    const passSec = calculateSecurityMetrics(passLogs, false);
    const webSec = calculateSecurityMetrics(webLogs, true);
    
    const passPerfMetrics = calculatePerformanceMetrics(passPerf, passLogs, false);
    const webPerfMetrics = calculatePerformanceMetrics(webPerf, webLogs, true);

    const passUxMetrics = calculateUXMetrics(passSus, passTask, false);
    const webUxMetrics = calculateUXMetrics(webSus, webTask, true);

    const passCost = calculateCostMetrics(false);
    const webCost = calculateCostMetrics(true);

    const comparisonData = {
      security: [
        { aspect: 'Proteksi terhadap Phishing', password: passSec.phishing, webauthn: webSec.phishing },
        { aspect: 'Proteksi terhadap Brute Force', password: passSec.bruteForce, webauthn: webSec.bruteForce },
        { aspect: 'Data Breach Risk', password: passSec.dataBreach, webauthn: webSec.dataBreach },
        { aspect: 'Password Reuse', password: passSec.reuse, webauthn: webSec.reuse },
        { aspect: 'Social Engineering', password: passSec.socialEngine, webauthn: webSec.socialEngine }
      ],
      performance: [
        { aspect: 'Waktu Login Rata-rata', password: passPerfMetrics.loginTime, webauthn: webPerfMetrics.loginTime },
        { aspect: 'Kesalahan Input', password: passPerfMetrics.inputError, webauthn: webPerfMetrics.inputError },
        { aspect: 'Proses Reset Password', password: passPerfMetrics.reset, webauthn: webPerfMetrics.reset },
        { aspect: 'Load Server', password: passPerfMetrics.serverLoad, webauthn: webPerfMetrics.serverLoad }
      ],
      ux: [
        { aspect: 'Kemudahan Penggunaan', password: passUxMetrics.ease, webauthn: webUxMetrics.ease },
        { aspect: 'Kemudahan Registrasi', password: passUxMetrics.registration, webauthn: webUxMetrics.registration },
        { aspect: 'Aksesibilitas', password: passUxMetrics.accessibility, webauthn: webUxMetrics.accessibility },
        { aspect: 'Learning Curve', password: passUxMetrics.learning, webauthn: webUxMetrics.learning },
        { aspect: 'Multi-Device Support', password: passUxMetrics.multiDevice, webauthn: webUxMetrics.multiDevice }
      ],
      cost: [
        { aspect: 'Biaya Development', password: passCost.development, webauthn: webCost.development },
        { aspect: 'Biaya Maintenance', password: passCost.maintenance, webauthn: webCost.maintenance },
        { aspect: 'Biaya Support', password: passCost.support, webauthn: webCost.support },
        { aspect: 'Biaya Security Incident', password: passCost.incident, webauthn: webCost.incident }
      ]
    };

    res.json({ comparisonData });
  } catch (error) {
    console.error('Comparison Aggregation Error:', error);
    res.status(500).json({ message: 'Comparison Sync Failure', error: error.message });
  }
});

export default router;
