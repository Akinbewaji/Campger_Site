const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema(
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
    recipients: [
      {
        phoneNumber: {
          type: String,
          required: true,
        },
        dataAmount: {
          type: String,
          required: true,
        },
        cost: {
          type: Number,
          required: true,
        },
        status: {
          type: String,
          enum: ['pending', 'sent', 'failed', 'delivered'],
          default: 'pending',
        },
        transactionId: String,
        errorMessage: String,
      },
    ],
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'running', 'completed', 'failed'],
      default: 'draft',
    },
    totalCost: {
      type: Number,
      required: true,
    },
    scheduledTime: Date,
    sentAt: Date,
    completedAt: Date,
    stats: {
      total: {
        type: Number,
        default: 0,
      },
      sent: {
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
  },
  { timestamps: true }
);

module.exports = mongoose.model('Data', dataSchema);
