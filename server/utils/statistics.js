/**
 * Statistical Analysis Utilities
 * Fungsi-fungsi untuk analisis statistik dalam penelitian
 */

/**
 * Calculate mean (rata-rata)
 */
export const mean = (arr) => {
  if (arr.length === 0) return 0;
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
};

/**
 * Calculate standard deviation
 */
export const standardDeviation = (arr) => {
  if (arr.length === 0) return 0;
  const avg = mean(arr);
  const squareDiffs = arr.map((val) => Math.pow(val - avg, 2));
  const avgSquareDiff = mean(squareDiffs);
  return Math.sqrt(avgSquareDiff);
};

/**
 * Calculate standard error
 */
export const standardError = (arr) => {
  if (arr.length === 0) return 0;
  return standardDeviation(arr) / Math.sqrt(arr.length);
};

/**
 * Calculate confidence interval (95%)
 * Returns: { lower, upper, mean }
 */
export const confidenceInterval = (arr, confidence = 0.95) => {
  if (arr.length === 0) return { lower: 0, upper: 0, mean: 0 };

  const n = arr.length;
  const avg = mean(arr);
  const se = standardError(arr);

  // t-value for 95% confidence (approximation for large samples, use 1.96 for normal distribution)
  // For small samples, should use t-distribution
  const tValue = n > 30 ? 1.96 : 2.045; // Approximation, ideally should use t-table

  const margin = tValue * se;

  return {
    mean: avg,
    lower: avg - margin,
    upper: avg + margin,
    margin,
    confidence: confidence * 100,
  };
};

/**
 * Independent t-test (two-sample t-test)
 * Tests if there is a significant difference between two groups
 * Returns: { tValue, pValue, df, significant, effectSize }
 */
export const independentTTest = (group1, group2) => {
  if (group1.length === 0 || group2.length === 0) {
    return {
      tValue: 0,
      pValue: 1,
      df: 0,
      significant: false,
      effectSize: 0,
      interpretation: 'Insufficient data',
    };
  }

  const n1 = group1.length;
  const n2 = group2.length;
  const mean1 = mean(group1);
  const mean2 = mean(group2);
  const sd1 = standardDeviation(group1);
  const sd2 = standardDeviation(group2);

  // Pooled standard deviation
  const pooledSD = Math.sqrt(((n1 - 1) * sd1 * sd1 + (n2 - 1) * sd2 * sd2) / (n1 + n2 - 2));

  // Standard error of the difference
  const seDiff = pooledSD * Math.sqrt(1 / n1 + 1 / n2);

  // t-value
  const tValue = (mean1 - mean2) / seDiff;

  // Degrees of freedom
  const df = n1 + n2 - 2;

  // Calculate p-value (two-tailed test)
  // Using approximation for t-distribution
  const pValue = calculatePValue(tValue, df);

  // Effect size (Cohen's d)
  const effectSize = (mean1 - mean2) / pooledSD;

  // Interpretation
  const significant = pValue < 0.05;
  let interpretation = '';
  if (significant) {
    interpretation = `Significant difference (p < 0.05). `;
  } else {
    interpretation = `No significant difference (p >= 0.05). `;
  }

  if (Math.abs(effectSize) < 0.2) {
    interpretation += 'Negligible effect size.';
  } else if (Math.abs(effectSize) < 0.5) {
    interpretation += 'Small effect size.';
  } else if (Math.abs(effectSize) < 0.8) {
    interpretation += 'Medium effect size.';
  } else {
    interpretation += 'Large effect size.';
  }

  return {
    tValue: Math.abs(tValue),
    pValue,
    df,
    significant,
    effectSize: Math.abs(effectSize),
    effectSizeInterpretation: getEffectSizeInterpretation(Math.abs(effectSize)),
    mean1,
    mean2,
    difference: mean1 - mean2,
    interpretation,
  };
};

/**
 * Chi-square test for independence
 * Tests if there is a significant difference in success rates
 * Returns: { chiSquare, pValue, df, significant, interpretation }
 */
export const chiSquareTest = (success1, total1, success2, total2) => {
  if (total1 === 0 || total2 === 0) {
    return {
      chiSquare: 0,
      pValue: 1,
      df: 1,
      significant: false,
      interpretation: 'Insufficient data',
    };
  }

  const fail1 = total1 - success1;
  const fail2 = total2 - success2;

  // Observed frequencies
  const observed = [
    [success1, fail1],
    [success2, fail2],
  ];

  // Calculate expected frequencies
  const row1Total = success1 + fail1;
  const row2Total = success2 + fail2;
  const col1Total = success1 + success2;
  const col2Total = fail1 + fail2;
  const grandTotal = row1Total + row2Total;

  const expected = [
    [(row1Total * col1Total) / grandTotal, (row1Total * col2Total) / grandTotal],
    [(row2Total * col1Total) / grandTotal, (row2Total * col2Total) / grandTotal],
  ];

  // Calculate chi-square
  let chiSquare = 0;
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      const diff = observed[i][j] - expected[i][j];
      chiSquare += (diff * diff) / expected[i][j];
    }
  }

  // Degrees of freedom
  const df = 1;

  // Calculate p-value
  const pValue = calculateChiSquarePValue(chiSquare, df);

  const significant = pValue < 0.05;
  const interpretation = significant ? `Significant difference in success rates (p < 0.05)` : `No significant difference in success rates (p >= 0.05)`;

  return {
    chiSquare,
    pValue,
    df,
    significant,
    interpretation,
    observed,
    expected,
  };
};

/**
 * Calculate p-value for t-distribution (approximation)
 */
const calculatePValue = (tValue, df) => {
  // Simplified approximation using normal distribution for large samples
  if (df > 30) {
    // For large samples, use normal distribution approximation
    const z = Math.abs(tValue);
    // Approximation: p-value ≈ 2 * (1 - normalCDF(z))
    // Using approximation: normalCDF(z) ≈ 1 - 0.5 * (1 + erf(z/√2))
    // Simplified further for common values
    if (z > 3.0) return 0.002;
    if (z > 2.5) return 0.01;
    if (z > 2.0) return 0.05;
    if (z > 1.96) return 0.05;
    if (z > 1.645) return 0.1;
    return 0.2;
  }

  // For small samples, this is a rough approximation
  // In production, should use proper t-distribution table or library
  const z = Math.abs(tValue);
  if (z > 2.5) return 0.02;
  if (z > 2.0) return 0.05;
  if (z > 1.8) return 0.1;
  return 0.2;
};

/**
 * Calculate p-value for chi-square distribution
 */
const calculateChiSquarePValue = (chiSquare, df) => {
  // Simplified approximation
  // In production, should use proper chi-square distribution table or library
  if (chiSquare > 6.635) return 0.01;
  if (chiSquare > 3.841) return 0.05;
  if (chiSquare > 2.706) return 0.1;
  return 0.2;
};

/**
 * Get effect size interpretation (Cohen's d)
 */
const getEffectSizeInterpretation = (d) => {
  if (d < 0.2) return 'Negligible';
  if (d < 0.5) return 'Small';
  if (d < 0.8) return 'Medium';
  return 'Large';
};

/**
 * Calculate sample size for power analysis
 * Returns minimum sample size needed for desired power
 */
export const calculateSampleSize = (effectSize, power = 0.8, alpha = 0.05) => {
  // Simplified calculation for two-sample t-test
  // Using Cohen's formula: n = 2 * ((Z_alpha/2 + Z_power)^2 / d^2)
  const zAlpha = 1.96; // For alpha = 0.05
  const zPower = 0.84; // For power = 0.8

  const n = Math.ceil(2 * Math.pow((zAlpha + zPower) / effectSize, 2));
  return n;
};

/**
 * Power analysis
 * Calculate statistical power for given sample size and effect size
 */
export const powerAnalysis = (n1, n2, effectSize, alpha = 0.05) => {
  const n = Math.min(n1, n2);
  const zAlpha = 1.96;
  const zPower = Math.sqrt((n * effectSize * effectSize) / 2) - zAlpha;

  // Convert to power (probability)
  let power = 0.5;
  if (zPower > 0) {
    // Approximation
    if (zPower > 2) power = 0.98;
    else if (zPower > 1.5) power = 0.93;
    else if (zPower > 1) power = 0.84;
    else if (zPower > 0.5) power = 0.69;
    else power = 0.5 + zPower * 0.2;
  }

  return {
    power: Math.min(power, 0.99),
    interpretation: power >= 0.8 ? 'Adequate power' : 'Insufficient power (consider increasing sample size)',
  };
};
