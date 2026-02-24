import express from 'express';
import { authenticate } from '../middleware/auth.js';
import AuthLog from '../models/AuthLog.js';
import { SUSSurvey, CognitiveLoad, TaskCompletion, DemographicData, UsabilitySession } from '../models/UXData.js';

const router = express.Router();

/**
 * Submit SUS (System Usability Scale) Survey
 * 10 questions, scale 1-5
 */
router.post('/sus-survey', authenticate, async (req, res) => {
  try {
    const { method, answers } = req.body; // method: 'password' or 'webauthn', answers: array of 10 numbers (1-5)

    if (!method || !answers || answers.length !== 10) {
      return res.status(400).json({ message: 'Method and 10 answers are required' });
    }

    // Validate answers (1-5)
    if (answers.some((a) => a < 1 || a > 5)) {
      return res.status(400).json({ message: 'All answers must be between 1 and 5' });
    }

    // Calculate SUS score
    // For odd-numbered questions (1,3,5,7,9): score = answer - 1
    // For even-numbered questions (2,4,6,8,10): score = 5 - answer
    // Total SUS = sum of all scores * 2.5
    let rawScore = 0;
    for (let i = 0; i < 10; i++) {
      if (i % 2 === 0) {
        // Odd-numbered (0-indexed: 0,2,4,6,8)
        rawScore += answers[i] - 1;
      } else {
        // Even-numbered (0-indexed: 1,3,5,7,9)
        rawScore += 5 - answers[i];
      }
    }
    const susScore = rawScore * 2.5;

    // Interpret score
    let interpretation = '';
    if (susScore >= 80) interpretation = 'Excellent';
    else if (susScore >= 68) interpretation = 'Good';
    else if (susScore >= 51) interpretation = 'OK';
    else interpretation = 'Poor';

    // Store survey in database
    const survey = new SUSSurvey({
      userId: req.user._id,
      method,
      answers,
      susScore: Math.round(susScore * 10) / 10,
      interpretation,
    });
    await survey.save();

    res.json({
      _id: survey._id,
      userId: survey.userId,
      method: survey.method,
      answers: survey.answers,
      susScore: survey.susScore,
      interpretation: survey.interpretation,
      timestamp: survey.createdAt,
    });
  } catch (error) {
    console.error('SUS survey error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Get SUS Survey Results
 */
router.get('/sus-results', authenticate, async (req, res) => {
  try {
    // Get real data from database
    const passwordSurveys = await SUSSurvey.find({ method: 'password' }).sort({ createdAt: -1 });
    const webauthnSurveys = await SUSSurvey.find({ method: 'webauthn' }).sort({ createdAt: -1 });

    const calculateStats = (surveys) => {
      if (surveys.length === 0) {
        return {
          count: 0,
          average: 0,
          median: 0,
          min: 0,
          max: 0,
          interpretation: 'No data',
        };
      }

      const scores = surveys.map((s) => s.susScore).sort((a, b) => a - b);
      const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      const median = scores.length % 2 === 0 ? (scores[scores.length / 2 - 1] + scores[scores.length / 2]) / 2 : scores[Math.floor(scores.length / 2)];

      let interpretation = '';
      if (average >= 80) {
        interpretation = 'Excellent';
      } else if (average >= 68) {
        interpretation = 'Good';
      } else if (average >= 51) {
        interpretation = 'OK';
      } else {
        interpretation = 'Poor';
      }

      return {
        count: scores.length,
        average: Math.round(average * 10) / 10,
        median: Math.round(median * 10) / 10,
        min: scores[0],
        max: scores[scores.length - 1],
        interpretation,
      };
    };

    res.json({
      password: calculateStats(passwordSurveys),
      webauthn: calculateStats(webauthnSurveys),
      comparison: {
        difference: passwordSurveys.length > 0 && webauthnSurveys.length > 0 ? Math.round((calculateStats(webauthnSurveys).average - calculateStats(passwordSurveys).average) * 10) / 10 : 0,
        winner: passwordSurveys.length > 0 && webauthnSurveys.length > 0 ? (calculateStats(webauthnSurveys).average > calculateStats(passwordSurveys).average ? 'webauthn' : 'password') : 'insufficient data',
      },
    });
  } catch (error) {
    console.error('Get SUS results error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Submit Cognitive Load Measurement
 */
router.post('/cognitive-load', authenticate, async (req, res) => {
  try {
    const { method, mentalEffort, taskDifficulty, timePressure, frustration } = req.body;

    if (!method || mentalEffort === undefined || taskDifficulty === undefined || timePressure === undefined || frustration === undefined) {
      return res.status(400).json({ message: 'Method and all cognitive load metrics are required' });
    }

    // Validate scores (1-7 scale)
    const scores = [mentalEffort, taskDifficulty, timePressure, frustration];
    if (scores.some((s) => s < 1 || s > 7)) {
      return res.status(400).json({ message: 'All scores must be between 1 and 7' });
    }

    // Calculate overall cognitive load (average)
    const overallLoad = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    // Store in database
    const cognitiveLoad = new CognitiveLoad({
      userId: req.user._id,
      method,
      mentalEffort,
      taskDifficulty,
      timePressure,
      frustration,
      overallLoad: Math.round(overallLoad * 10) / 10,
    });
    await cognitiveLoad.save();

    res.json({
      _id: cognitiveLoad._id,
      userId: cognitiveLoad.userId,
      method: cognitiveLoad.method,
      mentalEffort: cognitiveLoad.mentalEffort,
      taskDifficulty: cognitiveLoad.taskDifficulty,
      timePressure: cognitiveLoad.timePressure,
      frustration: cognitiveLoad.frustration,
      overallLoad: cognitiveLoad.overallLoad,
      timestamp: cognitiveLoad.createdAt,
    });
  } catch (error) {
    console.error('Cognitive load error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Get Cognitive Load Results
 */
router.get('/cognitive-load-results', authenticate, async (req, res) => {
  try {
    // Get real data from database
    const passwordData = await CognitiveLoad.find({ method: 'password' }).sort({ createdAt: -1 });
    const webauthnData = await CognitiveLoad.find({ method: 'webauthn' }).sort({ createdAt: -1 });

    const calculateStats = (data) => {
      if (data.length === 0) {
        return {
          count: 0,
          averageMentalEffort: 0,
          averageTaskDifficulty: 0,
          averageTimePressure: 0,
          averageFrustration: 0,
          averageOverall: 0,
        };
      }

      return {
        count: data.length,
        averageMentalEffort: Math.round((data.reduce((sum, d) => sum + d.mentalEffort, 0) / data.length) * 10) / 10,
        averageTaskDifficulty: Math.round((data.reduce((sum, d) => sum + d.taskDifficulty, 0) / data.length) * 10) / 10,
        averageTimePressure: Math.round((data.reduce((sum, d) => sum + d.timePressure, 0) / data.length) * 10) / 10,
        averageFrustration: Math.round((data.reduce((sum, d) => sum + d.frustration, 0) / data.length) * 10) / 10,
        averageOverall: Math.round((data.reduce((sum, d) => sum + d.overallLoad, 0) / data.length) * 10) / 10,
      };
    };

    res.json({
      password: calculateStats(passwordData),
      webauthn: calculateStats(webauthnData),
      comparison: {
        mentalEffortDifference: passwordData.length > 0 && webauthnData.length > 0 ? Math.round((calculateStats(webauthnData).averageMentalEffort - calculateStats(passwordData).averageMentalEffort) * 10) / 10 : 0,
        overallDifference: passwordData.length > 0 && webauthnData.length > 0 ? Math.round((calculateStats(webauthnData).averageOverall - calculateStats(passwordData).averageOverall) * 10) / 10 : 0,
        winner: passwordData.length > 0 && webauthnData.length > 0 ? (calculateStats(webauthnData).averageOverall < calculateStats(passwordData).averageOverall ? 'webauthn' : 'password') : 'insufficient data',
      },
    });
  } catch (error) {
    console.error('Get cognitive load results error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Submit Task Completion Data
 */
router.post('/task-completion', authenticate, async (req, res) => {
  try {
    const { method, taskType, completionTime, success, errors, steps } = req.body;

    if (!method || !taskType || completionTime === undefined || success === undefined) {
      return res.status(400).json({ message: 'Method, taskType, completionTime, and success are required' });
    }

    // Store in database
    const taskCompletion = new TaskCompletion({
      userId: req.user._id,
      method,
      taskType,
      completionTime,
      success,
      errors: errors || 0,
      steps: steps || 1,
    });
    await taskCompletion.save();

    res.json({
      _id: taskCompletion._id,
      userId: taskCompletion.userId,
      method: taskCompletion.method,
      taskType: taskCompletion.taskType,
      completionTime: taskCompletion.completionTime,
      success: taskCompletion.success,
      errors: taskCompletion.errors,
      steps: taskCompletion.steps,
      timestamp: taskCompletion.createdAt,
    });
  } catch (error) {
    console.error('Task completion error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Get Task Completion Results
 */
router.get('/task-completion-results', authenticate, async (req, res) => {
  try {
    // Get real data from database
    const passwordTasks = await TaskCompletion.find({ method: 'password' }).sort({ createdAt: -1 });
    const webauthnTasks = await TaskCompletion.find({ method: 'webauthn' }).sort({ createdAt: -1 });

    const calculateStats = (tasks) => {
      if (tasks.length === 0) {
        return {
          count: 0,
          averageTime: 0,
          successRate: 0,
          averageErrors: 0,
          averageSteps: 0,
        };
      }

      const successfulTasks = tasks.filter((t) => t.success);
      return {
        count: tasks.length,
        averageTime: Math.round(tasks.reduce((sum, t) => sum + t.completionTime, 0) / tasks.length),
        successRate: Math.round((successfulTasks.length / tasks.length) * 100 * 10) / 10,
        averageErrors: Math.round((tasks.reduce((sum, t) => sum + t.errors, 0) / tasks.length) * 10) / 10,
        averageSteps: Math.round((tasks.reduce((sum, t) => sum + t.steps, 0) / tasks.length) * 10) / 10,
      };
    };

    res.json({
      password: calculateStats(passwordTasks),
      webauthn: calculateStats(webauthnTasks),
      comparison: {
        timeDifference: passwordTasks.length > 0 && webauthnTasks.length > 0 ? Math.round(calculateStats(webauthnTasks).averageTime - calculateStats(passwordTasks).averageTime) : 0,
        successRateDifference: passwordTasks.length > 0 && webauthnTasks.length > 0 ? Math.round((calculateStats(webauthnTasks).successRate - calculateStats(passwordTasks).successRate) * 10) / 10 : 0,
        winner:
          passwordTasks.length > 0 && webauthnTasks.length > 0
            ? calculateStats(webauthnTasks).averageTime < calculateStats(passwordTasks).averageTime && calculateStats(webauthnTasks).successRate > calculateStats(passwordTasks).successRate
              ? 'webauthn'
              : 'password'
            : 'insufficient data',
      },
    });
  } catch (error) {
    console.error('Get task completion results error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Submit Demographic Data
 */
router.post('/demographics', authenticate, async (req, res) => {
  try {
    const { age, gender, techExpertise, biometricExperience, occupation } = req.body;
    
    const demographic = await DemographicData.findOneAndUpdate(
      { userId: req.user._id },
      { age, gender, techExpertise, biometricExperience, occupation },
      { upsert: true, new: true }
    );

    res.json(demographic);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Manage Usability Sessions
 */
router.post('/session', authenticate, async (req, res) => {
  try {
    const { sessionId, order, tasks, status } = req.body;
    
    const session = await UsabilitySession.findOneAndUpdate(
      { sessionId },
      { userId: req.user._id, order, tasks, status },
      { upsert: true, new: true }
    );

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Export Research Data as CSV
 */
router.get('/export-csv', authenticate, async (req, res) => {
  try {
    const surveys = await SUSSurvey.find().populate('userId', 'username email');
    const cognitive = await CognitiveLoad.find().populate('userId', 'username email');
    const tasks = await TaskCompletion.find().populate('userId', 'username email');
    const demographics = await DemographicData.find().populate('userId', 'username email');

    // Simple CSV generation
    let csv = 'Type,User,Method,Value1,Value2,Value3,Value4,Score,Timestamp\n';
    
    surveys.forEach(s => {
      csv += `SUS,${s.userId?.email || 'Unknown'},${s.method},,,,,${s.susScore},${s.createdAt}\n`;
    });
    
    cognitive.forEach(c => {
      csv += `Cognitive,${c.userId?.email || 'Unknown'},${c.method},${c.mentalEffort},${c.taskDifficulty},${c.timePressure},${c.frustration},${c.overallLoad},${c.createdAt}\n`;
    });
    
    tasks.forEach(t => {
      csv += `Task,${t.userId?.email || 'Unknown'},${t.method},${t.taskType},${t.completionTime},${t.success},${t.errors},,${t.createdAt}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=research-data.csv');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ message: 'Export failed', error: error.message });
  }
});

export default router;
