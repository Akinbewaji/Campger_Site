const express = require('express');
const router = express.Router();
const Data = require('../models/Data');
const campgerService = require('../services/campgerService');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const campaigns = await Data.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const campaign = await Data.findOne({ _id: req.params.id, userId: req.user.id });
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { campaignName, recipients, totalCost } = req.body;

    if (!campaignName || !recipients || recipients.length === 0) {
      return res.status(400).json({ error: 'Campaign name and recipients are required' });
    }

    const campaign = new Data({
      userId: req.user.id,
      campaignName,
      recipients: recipients.map(r => ({
        phoneNumber: r.phoneNumber,
        dataAmount: r.dataAmount,
        cost: r.cost,
        status: 'pending',
      })),
      totalCost,
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
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/send', auth, async (req, res) => {
  try {
    const campaign = await Data.findOne({ _id: req.params.id, userId: req.user.id });
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    if (campaign.status !== 'draft') {
      return res.status(400).json({ error: 'Campaign cannot be sent in current status' });
    }

    campaign.status = 'running';
    campaign.sentAt = new Date();

    for (let i = 0; i < campaign.recipients.length; i++) {
      const recipient = campaign.recipients[i];
      const result = await campgerService.purchaseData(recipient.phoneNumber, {
        amount: recipient.dataAmount,
      });

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
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { campaignName, recipients, totalCost } = req.body;
    const campaign = await Data.findOne({ _id: req.params.id, userId: req.user.id });

    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    if (campaign.status !== 'draft') {
      return res.status(400).json({ error: 'Can only update draft campaigns' });
    }

    campaign.campaignName = campaignName || campaign.campaignName;
    campaign.recipients = recipients || campaign.recipients;
    campaign.totalCost = totalCost || campaign.totalCost;

    await campaign.save();
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const campaign = await Data.findOne({ _id: req.params.id, userId: req.user.id });
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    if (campaign.status === 'running') {
      return res.status(400).json({ error: 'Cannot delete running campaigns' });
    }

    await Data.deleteOne({ _id: req.params.id });
    res.json({ message: 'Campaign deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
