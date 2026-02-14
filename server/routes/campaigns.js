const express = require('express');
const { body, validationResult } = require('express-validator');
const Campaign = require('../models/Campaign');
const auth = require('../middleware/auth');
const africastalkingService = require('../services/africastalkingService');

const router = express.Router();

// Get all campaigns for a user
router.get('/', auth, async (req, res) => {
  try {
    const campaigns = await Campaign.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific campaign
router.get('/:id', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findOne({ _id: req.params.id, userId: req.user.userId });

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    res.json(campaign);
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new campaign
router.post(
  '/',
  auth,
  [
    body('name', 'Campaign name is required').notEmpty(),
    body('message', 'Message is required').notEmpty(),
    body('recipients', 'Recipients array is required').isArray({ min: 1 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, message, recipients, scheduledTime } = req.body;

    try {
      const campaign = new Campaign({
        name,
        description,
        userId: req.user.userId,
        message,
        recipients: recipients.map((phone) => ({
          phone,
          status: 'pending',
        })),
        status: scheduledTime ? 'scheduled' : 'draft',
        scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
        stats: {
          totalRecipients: recipients.length,
          sent: 0,
          delivered: 0,
          failed: 0,
          pending: recipients.length,
        },
      });

      await campaign.save();

      res.status(201).json({
        message: 'Campaign created successfully',
        campaign,
      });
    } catch (error) {
      console.error('Error creating campaign:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Send campaign
router.post('/:id/send', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findOne({ _id: req.params.id, userId: req.user.userId });

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (campaign.status === 'running' || campaign.status === 'completed') {
      return res.status(400).json({ message: 'Campaign is already running or completed' });
    }

    // Update campaign status
    campaign.status = 'running';
    campaign.startTime = new Date();
    await campaign.save();

    // Send SMS asynchronously
    sendCampaignSMS(campaign);

    res.json({
      message: 'Campaign started',
      campaign,
    });
  } catch (error) {
    console.error('Error sending campaign:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send SMS for all pending recipients
async function sendCampaignSMS(campaign) {
  try {
    const pendingRecipients = campaign.recipients.filter((r) => r.status === 'pending');

    for (const recipient of pendingRecipients) {
      const result = await africastalkingService.sendSMS(recipient.phone, campaign.message);

      // Update recipient status
      const recipientIndex = campaign.recipients.findIndex((r) => r.phone === recipient.phone);
      if (result.success) {
        campaign.recipients[recipientIndex].status = 'sent';
        campaign.recipients[recipientIndex].sentAt = new Date();
        campaign.stats.sent += 1;
        campaign.stats.pending -= 1;
      } else {
        campaign.recipients[recipientIndex].status = 'failed';
        campaign.recipients[recipientIndex].errorMessage = result.error;
        campaign.stats.failed += 1;
        campaign.stats.pending -= 1;
      }
    }

    // Mark campaign as completed
    campaign.status = 'completed';
    campaign.endTime = new Date();
    await campaign.save();

    console.log('[v0] Campaign completed:', campaign._id);
  } catch (error) {
    console.error('[v0] Error in sendCampaignSMS:', error);
  }
}

// Update campaign
router.put(
  '/:id',
  auth,
  [
    body('name', 'Campaign name is required').optional().notEmpty(),
    body('message', 'Message is required').optional().notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let campaign = await Campaign.findOne({ _id: req.params.id, userId: req.user.userId });

      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      if (campaign.status !== 'draft') {
        return res.status(400).json({ message: 'Only draft campaigns can be updated' });
      }

      const { name, description, message, recipients, scheduledTime } = req.body;

      if (name) campaign.name = name;
      if (description) campaign.description = description;
      if (message) campaign.message = message;
      if (recipients) {
        campaign.recipients = recipients.map((phone) => ({
          phone,
          status: 'pending',
        }));
        campaign.stats.totalRecipients = recipients.length;
        campaign.stats.pending = recipients.length;
      }
      if (scheduledTime) {
        campaign.scheduledTime = new Date(scheduledTime);
        campaign.status = 'scheduled';
      }

      campaign.updatedAt = new Date();
      await campaign.save();

      res.json({
        message: 'Campaign updated successfully',
        campaign,
      });
    } catch (error) {
      console.error('Error updating campaign:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete campaign
router.delete('/:id', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findOne({ _id: req.params.id, userId: req.user.userId });

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (campaign.status === 'running') {
      return res.status(400).json({ message: 'Cannot delete a running campaign' });
    }

    await Campaign.findByIdAndDelete(req.params.id);

    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
