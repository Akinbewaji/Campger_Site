const express = require('express');
const router = express.Router();
const USSD = require('../models/USSD');
const campgerService = require('../services/campgerService');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const campaigns = await USSD.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const campaign = await USSD.findOne({ _id: req.params.id, userId: req.user.id });
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { campaignName, ussdCode, recipients } = req.body;

    if (!campaignName || !ussdCode || !recipients || recipients.length === 0) {
      return res.status(400).json({ error: 'Campaign name, USSD code, and recipients required' });
    }

    const campaign = new USSD({
      userId: req.user.id,
      campaignName,
      ussdCode,
      recipients: recipients.map(r => ({
        phoneNumber: r,
        status: 'pending',
      })),
      stats: {
        total: recipients.length,
        initiated: 0,
        completed: 0,
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
    const campaign = await USSD.findOne({ _id: req.params.id, userId: req.user.id });
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    if (campaign.status !== 'draft') {
      return res.status(400).json({ error: 'Campaign cannot be initiated in current status' });
    }

    campaign.status = 'running';
    campaign.startedAt = new Date();

    for (let i = 0; i < campaign.recipients.length; i++) {
      const recipient = campaign.recipients[i];
      const result = await campgerService.initiateUSSD(recipient.phoneNumber, campaign.ussdCode);

      if (result.success) {
        campaign.recipients[i].status = 'initiated';
        campaign.recipients[i].sessionId = Math.random().toString(36).substring(7);
        campaign.stats.initiated++;
      } else {
        campaign.recipients[i].status = 'failed';
        campaign.recipients[i].errorMessage = result.error;
        campaign.stats.failed++;
      }
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
    const { campaignName, ussdCode, recipients } = req.body;
    const campaign = await USSD.findOne({ _id: req.params.id, userId: req.user.id });

    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    if (campaign.status !== 'draft') {
      return res.status(400).json({ error: 'Can only update draft campaigns' });
    }

    campaign.campaignName = campaignName || campaign.campaignName;
    campaign.ussdCode = ussdCode || campaign.ussdCode;
    campaign.recipients = recipients || campaign.recipients;

    await campaign.save();
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const campaign = await USSD.findOne({ _id: req.params.id, userId: req.user.id });
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    if (campaign.status === 'running') {
      return res.status(400).json({ error: 'Cannot delete running campaigns' });
    }

    await USSD.deleteOne({ _id: req.params.id });
    res.json({ message: 'Campaign deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
