import mongoose from 'mongoose';

const authLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Allow null for failed logins where user is not found
    },
    method: {
      type: String,
      enum: ['password', 'webauthn'],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    duration: {
      type: Number, // in milliseconds
      required: true,
    },
    success: {
      type: Boolean,
      required: true,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    errorMessage: {
      type: String,
    },
    riskScore: {
      type: Number,
      default: 0,
    },
    riskFactors: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
authLogSchema.index({ userId: 1, timestamp: -1 });
authLogSchema.index({ method: 1, timestamp: -1 });

const AuthLog = mongoose.model('AuthLog', authLogSchema);

export default AuthLog;
