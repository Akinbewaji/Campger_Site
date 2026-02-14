const mongoose = require('mongoose');

const voiceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    campaignName: {
      type: String,
      required: true,
    },
    callbackUrl: {
      type: String,
      required: true,
    },
    recipients: [
      {
        phoneNumber: {
          type: String,
          required: true,
        },
        status: {
          type: String,
          enum: ['pending', 'called', 'failed', 'answered'],
          default: 'pending',
        },
        callId: String,
        errorMessage: String,
      },
    ],
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'running', 'completed', 'failed'],
      default: 'draft',
    },
    scheduledTime: Date,
    startedAt: Date,
    completedAt: Date,
    stats: {
      total: {
        type: Number,
        default: 0,
      },
      called: {
        type: Number,
        default: 0,
      },
      answered: {
        type: Number,
        default: 0,
      },
      failed: {
        type: Number,
        default: 0,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Voice', voiceSchema);
