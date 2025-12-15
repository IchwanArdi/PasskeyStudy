import mongoose from 'mongoose';

const susSurveySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    method: {
      type: String,
      enum: ['password', 'webauthn'],
      required: true,
    },
    answers: {
      type: [Number],
      required: true,
      validate: {
        validator: (arr) => arr.length === 10 && arr.every((a) => a >= 1 && a <= 5),
        message: 'Answers must be array of 10 numbers between 1 and 5',
      },
    },
    susScore: {
      type: Number,
      required: true,
    },
    interpretation: {
      type: String,
      enum: ['Excellent', 'Good', 'OK', 'Poor'],
    },
  },
  {
    timestamps: true,
  }
);

const cognitiveLoadSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    method: {
      type: String,
      enum: ['password', 'webauthn'],
      required: true,
    },
    mentalEffort: {
      type: Number,
      required: true,
      min: 1,
      max: 7,
    },
    taskDifficulty: {
      type: Number,
      required: true,
      min: 1,
      max: 7,
    },
    timePressure: {
      type: Number,
      required: true,
      min: 1,
      max: 7,
    },
    frustration: {
      type: Number,
      required: true,
      min: 1,
      max: 7,
    },
    overallLoad: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const taskCompletionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    method: {
      type: String,
      enum: ['password', 'webauthn'],
      required: true,
    },
    taskType: {
      type: String,
      required: true,
      enum: ['login', 'registration', 'password-reset', 'credential-management', 'other'],
    },
    completionTime: {
      type: Number,
      required: true, // in milliseconds
    },
    success: {
      type: Boolean,
      required: true,
    },
    errors: {
      type: Number,
      default: 0,
    },
    steps: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
susSurveySchema.index({ userId: 1, method: 1, createdAt: -1 });
cognitiveLoadSchema.index({ userId: 1, method: 1, createdAt: -1 });
taskCompletionSchema.index({ userId: 1, method: 1, createdAt: -1 });
taskCompletionSchema.index({ method: 1, taskType: 1, success: 1 });

export const SUSSurvey = mongoose.model('SUSSurvey', susSurveySchema);
export const CognitiveLoad = mongoose.model('CognitiveLoad', cognitiveLoadSchema);
export const TaskCompletion = mongoose.model('TaskCompletion', taskCompletionSchema);
