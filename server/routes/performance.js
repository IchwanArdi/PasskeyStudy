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

export default router;
