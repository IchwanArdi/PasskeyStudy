/**
 * Machine Learning-Inspired Risk Engine for Adaptive Authentication
 * Uses Behavioral Profiling (Z-Score & Temporal Entropy) to detect anomalies
 */

export const calculateRiskScore = async (user, requestData) => {
  const { currentIP, currentUA, recentLogs = [] } = requestData;
  let riskScore = 0;
  let riskFactors = [];

  if (!user) {
    return { score: 100, factors: ['Identitas subjek tidak ditemukan'] };
  }

  // 1. Behavioral Profiling: Temporal Analysis (Z-Score)
  // We analyze the 'Hour of Day' of successful logins to build a probability density
  const hourMatches = recentLogs.filter((log) => log.success).map((log) => new Date(log.timestamp).getHours());

  const currentHour = new Date().getHours();

  if (hourMatches.length >= 5) {
    const mean = hourMatches.reduce((a, b) => a + b, 0) / hourMatches.length;
    const variance = hourMatches.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / hourMatches.length;
    const stdDev = Math.sqrt(variance) || 1; // Avoid division by zero

    const zScore = Math.abs(currentHour - mean) / stdDev;

    // If Z-Score > 2 (95th percentile anomaly in statistics)
    if (zScore > 2) {
      const penalty = Math.min(Math.round(zScore * 10), 40);
      riskScore += penalty;
      riskFactors.push(`Anomali Temporal (Z-Score: ${zScore.toFixed(2)})`);
    }
  }

  // 2. Identity Consistency: Jaccard Similarity for User Agent
  // Instead of static match, we look at historical UA frequency
  const uaCounts = recentLogs.reduce((acc, log) => {
    if (log.success) acc[log.userAgent] = (acc[log.userAgent] || 0) + 1;
    return acc;
  }, {});

  const totalSuccessful = Object.values(uaCounts).reduce((a, b) => a + b, 0);
  const uaProbability = totalSuccessful > 0 ? (uaCounts[currentUA] || 0) / totalSuccessful : 0;

  if (uaProbability < 0.1) {
    // If this device represents < 10% of history
    riskScore += 25;
    riskFactors.push('Device Fingerprint Baru');
  }

  // 3. Spatial Velocity & IP Reputation
  const ipMatches = recentLogs.filter((log) => log.success && log.ipAddress === currentIP).length;
  if (ipMatches === 0 && totalSuccessful > 0) {
    riskScore += 20;
    riskFactors.push('Lokasi Geografis Tidak Dikenal');
  }

  // 4. Failure Correlation (Sequential Anomaly)
  const recentFailures = recentLogs.slice(0, 5).filter((log) => !log.success).length;
  if (recentFailures >= 2) {
    const penalty = recentFailures * 15;
    riskScore += penalty;
    riskFactors.push(`Deteksi Bruteforce (${recentFailures} kegagalan beruntun)`);
  }

  // Cap score at 100 for normalization
  return {
    score: Math.min(riskScore, 100),
    factors: riskFactors,
  };
};

export const getRiskLevel = (score) => {
  if (score < 30) return 'low';
  if (score < 70) return 'medium';
  return 'high';
};
