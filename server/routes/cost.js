import express from 'express';
import { authenticate } from '../middleware/auth.js';
import AuthLog from '../models/AuthLog.js';
import User from '../models/User.js';

const router = express.Router();

/**
 * Implementation Cost Analysis
 */
router.get('/implementation', authenticate, async (req, res) => {
  try {
    // Estimated costs (in hours, can be converted to currency)
    const passwordImplementation = {
      method: 'password',
      development: {
        backend: 8, // hours
        frontend: 4,
        testing: 4,
        total: 16,
      },
      infrastructure: {
        database: 0, // no additional storage needed
        server: 0, // standard server
        total: 0,
      },
      complexity: 'Low',
      description: 'Standard password authentication is well-established and straightforward',
    };

    const webauthnImplementation = {
      method: 'webauthn',
      development: {
        backend: 16, // hours (more complex)
        frontend: 8,
        testing: 8,
        total: 32,
      },
      infrastructure: {
        database: 0, // minimal additional storage
        server: 0, // standard server
        total: 0,
      },
      complexity: 'Medium',
      description: 'WebAuthn requires understanding of public-key cryptography and WebAuthn API',
    };

    res.json({
      password: passwordImplementation,
      webauthn: webauthnImplementation,
      comparison: {
        developmentDifference: webauthnImplementation.development.total - passwordImplementation.development.total,
        developmentIncrease: (((webauthnImplementation.development.total - passwordImplementation.development.total) / passwordImplementation.development.total) * 100).toFixed(1),
        conclusion: `WebAuthn requires ${webauthnImplementation.development.total - passwordImplementation.development.total} more development hours (${(
          ((webauthnImplementation.development.total - passwordImplementation.development.total) / passwordImplementation.development.total) *
          100
        ).toFixed(1)}% increase)`,
      },
    });
  } catch (error) {
    console.error('Implementation cost error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Operational Cost Analysis
 */
router.get('/operational', authenticate, async (req, res) => {
  try {
    // Get actual data from logs
    const allLogs = await AuthLog.find();
    const passwordLogs = allLogs.filter((log) => log.method === 'password');
    const webauthnLogs = allLogs.filter((log) => log.method === 'webauthn');

    // Analyze support tickets (simulated based on failed attempts and errors)
    const passwordFailed = passwordLogs.filter((log) => !log.success);
    const webauthnFailed = webauthnLogs.filter((log) => !log.success);

    // Estimate support tickets (assume 30% of failures result in support tickets)
    const passwordSupportTickets = Math.ceil(passwordFailed.length * 0.3);
    const webauthnSupportTickets = Math.ceil(webauthnFailed.length * 0.3);

    // Average resolution time (in minutes)
    const passwordAvgResolutionTime = 15; // minutes (password reset, account unlock)
    const webauthnAvgResolutionTime = 10; // minutes (usually device-related, simpler)

    // Cost per support ticket (estimated)
    const costPerTicket = 10; // USD or hours

    const passwordOperational = {
      method: 'password',
      supportTickets: passwordSupportTickets,
      avgResolutionTime: passwordAvgResolutionTime,
      totalSupportTime: passwordSupportTickets * passwordAvgResolutionTime,
      estimatedCost: passwordSupportTickets * costPerTicket,
      maintenance: {
        securityUpdates: 'Frequent (password policy, hashing updates)',
        complexity: 'Medium',
        frequency: 'Monthly',
      },
    };

    const webauthnOperational = {
      method: 'webauthn',
      supportTickets: webauthnSupportTickets,
      avgResolutionTime: webauthnAvgResolutionTime,
      totalSupportTime: webauthnSupportTickets * webauthnAvgResolutionTime,
      estimatedCost: webauthnSupportTickets * costPerTicket,
      maintenance: {
        securityUpdates: 'Less frequent (standard WebAuthn implementation)',
        complexity: 'Low',
        frequency: 'Quarterly',
      },
    };

    res.json({
      password: passwordOperational,
      webauthn: webauthnOperational,
      comparison: {
        supportDifference: passwordSupportTickets - webauthnSupportTickets,
        supportReduction: passwordSupportTickets > 0 ? (((passwordSupportTickets - webauthnSupportTickets) / passwordSupportTickets) * 100).toFixed(1) : 0,
        costSavings: passwordOperational.estimatedCost - webauthnOperational.estimatedCost,
        conclusion: `WebAuthn reduces support tickets by ${passwordSupportTickets - webauthnSupportTickets} (${
          passwordSupportTickets > 0 ? (((passwordSupportTickets - webauthnSupportTickets) / passwordSupportTickets) * 100).toFixed(1) : 0
        }%)`,
      },
    });
  } catch (error) {
    console.error('Operational cost error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * ROI (Return on Investment) Calculation
 */
router.get('/roi', authenticate, async (req, res) => {
  try {
    // Get implementation and operational costs
    // This is a simplified calculation
    const passwordImplementationCost = 16; // hours
    const webauthnImplementationCost = 32; // hours

    // Get operational data
    const allLogs = await AuthLog.find();
    const passwordLogs = allLogs.filter((log) => log.method === 'password');
    const webauthnLogs = allLogs.filter((log) => log.method === 'webauthn');

    const passwordFailed = passwordLogs.filter((log) => !log.success);
    const webauthnFailed = webauthnLogs.filter((log) => !log.success);

    const passwordSupportTickets = Math.ceil(passwordFailed.length * 0.3);
    const webauthnSupportTickets = Math.ceil(webauthnFailed.length * 0.3);

    const costPerTicket = 10;
    const passwordOperationalCost = passwordSupportTickets * costPerTicket;
    const webauthnOperationalCost = webauthnSupportTickets * costPerTicket;

    // Calculate ROI over time (assuming hourly rate of $50)
    const hourlyRate = 50;
    const passwordTotalCost = passwordImplementationCost * hourlyRate + passwordOperationalCost;
    const webauthnTotalCost = webauthnImplementationCost * hourlyRate + webauthnOperationalCost;

    // Benefits (cost savings from reduced support, security incidents, etc.)
    const supportSavings = passwordOperationalCost - webauthnOperationalCost;
    const securityIncidentCost = 1000; // estimated cost per security incident
    const passwordSecurityIncidents = passwordFailed.length > 100 ? 1 : 0; // simplified
    const webauthnSecurityIncidents = 0; // WebAuthn is more secure

    const securitySavings = (passwordSecurityIncidents - webauthnSecurityIncidents) * securityIncidentCost;

    const totalBenefits = supportSavings + securitySavings;
    const totalInvestment = webauthnTotalCost - passwordTotalCost;

    // ROI = (Benefits - Investment) / Investment * 100
    const roi = totalInvestment !== 0 ? ((totalBenefits - totalInvestment) / Math.abs(totalInvestment)) * 100 : 0;

    // Payback period (in months, simplified)
    const monthlyOperationalSavings = supportSavings / 12; // assuming annual
    const paybackPeriod = totalInvestment > 0 && monthlyOperationalSavings > 0 ? totalInvestment / monthlyOperationalSavings : 0;

    res.json({
      costs: {
        password: {
          implementation: passwordImplementationCost * hourlyRate,
          operational: passwordOperationalCost,
          total: passwordTotalCost,
        },
        webauthn: {
          implementation: webauthnImplementationCost * hourlyRate,
          operational: webauthnOperationalCost,
          total: webauthnTotalCost,
        },
      },
      benefits: {
        supportSavings,
        securitySavings,
        total: totalBenefits,
      },
      roi: {
        investment: totalInvestment,
        return: totalBenefits,
        roi: Math.round(roi * 10) / 10,
        paybackPeriod: Math.round(paybackPeriod * 10) / 10,
        paybackPeriodUnit: 'months',
        interpretation: roi > 0 ? 'Positive ROI - WebAuthn provides value' : 'Negative ROI - Higher initial investment',
      },
    });
  } catch (error) {
    console.error('ROI calculation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Total Cost Comparison
 */
router.get('/comparison', authenticate, async (req, res) => {
  try {
    // Get all cost data
    const hourlyRate = 50;

    const passwordImplementation = 16 * hourlyRate;
    const webauthnImplementation = 32 * hourlyRate;

    const allLogs = await AuthLog.find();
    const passwordLogs = allLogs.filter((log) => log.method === 'password');
    const webauthnLogs = allLogs.filter((log) => log.method === 'webauthn');

    const passwordFailed = passwordLogs.filter((log) => !log.success);
    const webauthnFailed = webauthnLogs.filter((log) => !log.success);

    const passwordSupportTickets = Math.ceil(passwordFailed.length * 0.3);
    const webauthnSupportTickets = Math.ceil(webauthnFailed.length * 0.3);

    const costPerTicket = 10;
    const passwordOperational = passwordSupportTickets * costPerTicket;
    const webauthnOperational = webauthnSupportTickets * costPerTicket;

    // Annual operational cost (projected)
    const passwordAnnual = passwordOperational * 12;
    const webauthnAnnual = webauthnOperational * 12;

    // 3-year total cost
    const password3Year = passwordImplementation + passwordAnnual * 3;
    const webauthn3Year = webauthnImplementation + webauthnAnnual * 3;

    res.json({
      password: {
        implementation: passwordImplementation,
        annual: passwordAnnual,
        threeYear: password3Year,
      },
      webauthn: {
        implementation: webauthnImplementation,
        annual: webauthnAnnual,
        threeYear: webauthn3Year,
      },
      comparison: {
        implementationDifference: webauthnImplementation - passwordImplementation,
        annualSavings: passwordAnnual - webauthnAnnual,
        threeYearSavings: password3Year - webauthn3Year,
        breakEvenPoint: passwordAnnual > webauthnAnnual ? Math.ceil(((webauthnImplementation - passwordImplementation) / (passwordAnnual - webauthnAnnual)) * 12) : null,
        breakEvenUnit: 'months',
        conclusion: `Over 3 years, WebAuthn ${webauthn3Year < password3Year ? 'saves' : 'costs'} $${Math.abs(webauthn3Year - password3Year).toFixed(2)} compared to password`,
      },
    });
  } catch (error) {
    console.error('Cost comparison error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
