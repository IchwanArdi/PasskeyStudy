import mongoose from 'mongoose';

const performanceLogSchema = new mongoose.Schema(
  {
    endpoint: {
      type: String,
      required: true,
    },
    httpMethod: {
      type: String,
      required: true,
      enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    },
    authMethod: {
      type: String,
      enum: ['webauthn', 'password', 'none'],
      default: 'none',
    },
    responseTime: {
      type: Number,
      required: true, // in milliseconds
    },
    requestSize: {
      type: Number,
      default: 0, // in bytes
    },
    responseSize: {
      type: Number,
      default: 0, // in bytes
    },
    statusCode: {
      type: Number,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
performanceLogSchema.index({ endpoint: 1, createdAt: -1 });
performanceLogSchema.index({ authMethod: 1, createdAt: -1 });

const PerformanceLog = mongoose.model('PerformanceLog', performanceLogSchema);

export default PerformanceLog;
