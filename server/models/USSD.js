const mongoose = require('mongoose');

const ussdSchema = new mongoose.Schema(
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
    ussdCode: {
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
          enum: ['pending', 'initiated', 'failed', 'completed'],
          default: 'pending',
        },
        sessionId: String,
        response: String,
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
      initiated: {
        type: Number,
        default: 0,
      },
      completed: {
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

module.exports = mongoose.model('USSD', ussdSchema);
