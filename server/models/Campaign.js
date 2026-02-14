const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    recipients: [
      {
        phone: {
          type: String,
          required: true,
        },
        status: {
          type: String,
          enum: ['pending', 'sent', 'failed', 'delivered'],
          default: 'pending',
        },
        sentAt: Date,
        errorMessage: String,
      },
    ],
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'running', 'completed', 'paused'],
      default: 'draft',
    },
    scheduledTime: {
      type: Date,
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    stats: {
      totalRecipients: {
        type: Number,
        default: 0,
      },
      sent: {
        type: Number,
        default: 0,
      },
      delivered: {
        type: Number,
        default: 0,
      },
      failed: {
        type: Number,
        default: 0,
      },
      pending: {
        type: Number,
        default: 0,
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: 'campaigns' }
);

module.exports = mongoose.model('Campaign', campaignSchema);
