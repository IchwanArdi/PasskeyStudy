import express from 'express';
import { authenticate } from '../middleware/auth.js';
import PerformanceLog from '../models/PerformanceLog.js';

const router = express.Router();

/**
 * Performance Summary — Aggregated latency stats
 */
router.get('/summary', authenticate, async (req, res) => {
  try {
    const logs = await PerformanceLog.find().sort({ createdAt: -1 }).limit(1000);

    if (logs.length === 0) {
      return res.json({
        totalRequests: 0,
        endpoints: [],
        overall: { avgResponseTime: 0, p50: 0, p95: 0, p99: 0 },
      });
    }

    // Group by endpoint
    const endpointGroups = {};
    logs.forEach((log) => {
      const key = `${log.httpMethod} ${log.endpoint}`;
      if (!endpointGroups[key]) {
        endpointGroups[key] = [];
      }
      endpointGroups[key].push(log);
    });

    const endpoints = Object.entries(endpointGroups).map(([key, entries]) => {
      const times = entries.map((e) => e.responseTime).sort((a, b) => a - b);
      const avg = times.reduce((sum, t) => sum + t, 0) / times.length;

      return {
        endpoint: key,
        count: entries.length,
        avgResponseTime: Math.round(avg * 100) / 100,
        minResponseTime: times[0],
        maxResponseTime: times[times.length - 1],
        p50: times[Math.floor(times.length * 0.5)],
        p95: times[Math.floor(times.length * 0.95)],
        avgRequestSize: Math.round(entries.reduce((s, e) => s + e.requestSize, 0) / entries.length),
        avgResponseSize: Math.round(entries.reduce((s, e) => s + e.responseSize, 0) / entries.length),
        successRate: Math.round((entries.filter((e) => e.statusCode < 400).length / entries.length) * 100 * 10) / 10,
      };
    });

    // Overall stats
    const allTimes = logs.map((l) => l.responseTime).sort((a, b) => a - b);
    const overallAvg = allTimes.reduce((sum, t) => sum + t, 0) / allTimes.length;

    res.json({
      totalRequests: logs.length,
      endpoints: endpoints.sort((a, b) => b.count - a.count),
      overall: {
        avgResponseTime: Math.round(overallAvg * 100) / 100,
        p50: allTimes[Math.floor(allTimes.length * 0.5)],
        p95: allTimes[Math.floor(allTimes.length * 0.95)],
        p99: allTimes[Math.floor(allTimes.length * 0.99)],
      },
    });
  } catch (error) {
    console.error('Performance summary error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Performance Comparison — WebAuthn vs Password head-to-head
 */
router.get('/comparison', authenticate, async (req, res) => {
  try {
    const webauthnLogs = await PerformanceLog.find({ authMethod: 'webauthn' }).sort({ createdAt: -1 }).limit(500);
    const passwordLogs = await PerformanceLog.find({ authMethod: 'password' }).sort({ createdAt: -1 }).limit(500);

    const calcStats = (logs) => {
      if (logs.length === 0) {
        return {
          count: 0,
          avgResponseTime: 0,
          avgRequestSize: 0,
          avgResponseSize: 0,
          successRate: 0,
          p50: 0,
          p95: 0,
        };
      }

      const times = logs.map((l) => l.responseTime).sort((a, b) => a - b);
      return {
        count: logs.length,
        avgResponseTime: Math.round((times.reduce((s, t) => s + t, 0) / times.length) * 100) / 100,
        avgRequestSize: Math.round(logs.reduce((s, l) => s + l.requestSize, 0) / logs.length),
        avgResponseSize: Math.round(logs.reduce((s, l) => s + l.responseSize, 0) / logs.length),
        successRate: Math.round((logs.filter((l) => l.statusCode < 400).length / logs.length) * 100 * 10) / 10,
        p50: times[Math.floor(times.length * 0.5)],
        p95: times[Math.floor(times.length * 0.95)],
      };
    };

    const webauthnStats = calcStats(webauthnLogs);
    const passwordStats = calcStats(passwordLogs);

    // WebAuthn ceremony round-trip count
    const webauthnRoundTrips = 2; // options + verify
    const passwordRoundTrips = 1; // single login request

    res.json({
      webauthn: {
        ...webauthnStats,
        roundTrips: webauthnRoundTrips,
        ceremonyDescription: 'WebAuthn requires 2 round-trips: get options → verify response',
      },
      password: {
        ...passwordStats,
        roundTrips: passwordRoundTrips,
        ceremonyDescription: 'Password requires 1 round-trip: send credentials → verify',
      },
      comparison: {
        responseTimeDiff: Math.round((webauthnStats.avgResponseTime - passwordStats.avgResponseTime) * 100) / 100,
        requestSizeDiff: webauthnStats.avgRequestSize - passwordStats.avgRequestSize,
        responseSizeDiff: webauthnStats.avgResponseSize - passwordStats.avgResponseSize,
        roundTripDiff: webauthnRoundTrips - passwordRoundTrips,
        successRateDiff: Math.round((webauthnStats.successRate - passwordStats.successRate) * 10) / 10,
        analysis:
          webauthnStats.avgResponseTime > passwordStats.avgResponseTime
            ? `WebAuthn ${Math.round(webauthnStats.avgResponseTime - passwordStats.avgResponseTime)}ms lebih lambat karena kriptografi asimetris dan 2 round-trips, tetapi menawarkan keamanan jauh lebih tinggi.`
            : `WebAuthn ${Math.round(passwordStats.avgResponseTime - webauthnStats.avgResponseTime)}ms lebih cepat — keamanan superior tanpa trade-off performa.`,
      },
    });
  } catch (error) {
    console.error('Performance comparison error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
