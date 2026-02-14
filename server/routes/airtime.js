const express = require('express');
const router = express.Router();
const Airtime = require('../models/Airtime');
const campgerService = require('../services/campgerService');
const auth = require('../middleware/auth');

// Get all airtime campaigns
router.get('/', auth, async (req, res) => {
  try {
    const campaigns = await Airtime.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching airtime campaigns:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single airtime campaign
router.get('/:id', auth, async (req, res) => {
  try {
    const campaign = await Airtime.findOne({ _id: req.params.id, userId: req.user.id });
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    res.json(campaign);
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create airtime campaign
router.post('/', auth, async (req, res) => {
  try {
    const { campaignName, recipients, totalAmount } = req.body;

    if (!campaignName || !recipients || recipients.length === 0) {
      return res.status(400).json({ error: 'Campaign name and recipients are required' });
    }

    const campaign = new Airtime({
      userId: req.user.id,
      campaignName,
      recipients: recipients.map(r => ({
        phoneNumber: r.phoneNumber,
        amount: r.amount,
        status: 'pending',
      })),
      totalAmount,
      stats: {
        total: recipients.length,
        pending: recipients.length,
        sent: 0,
        failed: 0,
      },
    });

    await campaign.save();
    res.status(201).json(campaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send airtime campaign
router.post('/:id/send', auth, async (req, res) => {
  try {
    const campaign = await Airtime.findOne({ _id: req.params.id, userId: req.user.id });
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    if (campaign.status !== 'draft') {
      return res.status(400).json({ error: 'Campaign cannot be sent in current status' });
    }

    campaign.status = 'running';
    campaign.sentAt = new Date();

    // Send airtime to each recipient
    for (let i = 0; i < campaign.recipients.length; i++) {
      const recipient = campaign.recipients[i];
      const result = await campgerService.sendAirtime(recipient.phoneNumber, recipient.amount);

      if (result.success) {
        campaign.recipients[i].status = 'sent';
        campaign.recipients[i].transactionId = result.transactionId;
        campaign.stats.sent++;
      } else {
        campaign.recipients[i].status = 'failed';
        campaign.recipients[i].errorMessage = result.error;
        campaign.stats.failed++;
      }
      campaign.stats.pending--;
    }

    campaign.status = 'completed';
    campaign.completedAt = new Date();
    await campaign.save();

    res.json(campaign);
  } catch (error) {
    console.error('Error sending campaign:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update airtime campaign
router.put('/:id', auth, async (req, res) => {
  try {
    const { campaignName, recipients, totalAmount } = req.body;
    const campaign = await Airtime.findOne({ _id: req.params.id, userId: req.user.id });

    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    if (campaign.status !== 'draft') {
      return res.status(400).json({ error: 'Can only update draft campaigns' });
    }

    campaign.campaignName = campaignName || campaign.campaignName;
    campaign.recipients = recipients || campaign.recipients;
    campaign.totalAmount = totalAmount || campaign.totalAmount;

    await campaign.save();
    res.json(campaign);
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete airtime campaign
router.delete('/:id', auth, async (req, res) => {
  try {
    const campaign = await Airtime.findOne({ _id: req.params.id, userId: req.user.id });
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    if (campaign.status === 'running') {
      return res.status(400).json({ error: 'Cannot delete running campaigns' });
    }

    await Airtime.deleteOne({ _id: req.params.id });
    res.json({ message: 'Campaign deleted' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
