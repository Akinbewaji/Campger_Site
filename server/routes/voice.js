const express = require('express');
const router = express.Router();
const Voice = require('../models/Voice');
const campgerService = require('../services/campgerService');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const campaigns = await Voice.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const campaign = await Voice.findOne({ _id: req.params.id, userId: req.user.id });
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { campaignName, callbackUrl, recipients } = req.body;

    if (!campaignName || !callbackUrl || !recipients || recipients.length === 0) {
      return res.status(400).json({ error: 'Campaign name, callback URL, and recipients required' });
    }

    const campaign = new Voice({
      userId: req.user.id,
      campaignName,
      callbackUrl,
      recipients: recipients.map(r => ({
        phoneNumber: r,
        status: 'pending',
      })),
      stats: {
        total: recipients.length,
        called: 0,
        answered: 0,
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
    const campaign = await Voice.findOne({ _id: req.params.id, userId: req.user.id });
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    if (campaign.status !== 'draft') {
      return res.status(400).json({ error: 'Campaign cannot be called in current status' });
    }

    campaign.status = 'running';
    campaign.startedAt = new Date();

    const phoneNumbers = campaign.recipients.map(r => r.phoneNumber);
    const result = await campgerService.bulkCall(phoneNumbers, campaign.callbackUrl);

    if (result.success) {
      result.calls.forEach((call, index) => {
        campaign.recipients[index].status = 'called';
        campaign.recipients[index].callId = call.entryId;
        campaign.stats.called++;
      });
    } else {
      campaign.recipients.forEach((recipient, index) => {
        campaign.recipients[index].status = 'failed';
        campaign.recipients[index].errorMessage = result.error;
        campaign.stats.failed++;
      });
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
    const { campaignName, callbackUrl, recipients } = req.body;
    const campaign = await Voice.findOne({ _id: req.params.id, userId: req.user.id });

    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    if (campaign.status !== 'draft') {
      return res.status(400).json({ error: 'Can only update draft campaigns' });
    }

    campaign.campaignName = campaignName || campaign.campaignName;
    campaign.callbackUrl = callbackUrl || campaign.callbackUrl;
    campaign.recipients = recipients || campaign.recipients;

    await campaign.save();
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const campaign = await Voice.findOne({ _id: req.params.id, userId: req.user.id });
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    if (campaign.status === 'running') {
      return res.status(400).json({ error: 'Cannot delete running campaigns' });
    }

    await Voice.deleteOne({ _id: req.params.id });
    res.json({ message: 'Campaign deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
