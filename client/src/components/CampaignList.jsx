'use client';

import React, { useState } from 'react';
import { campaignService } from '../services/campaignService';
import CampaignCard from './CampaignCard';
import './CampaignList.css';

export default function CampaignList({ campaigns, onCampaignUpdated, onCampaignDeleted }) {
  const [error, setError] = useState('');

  const handleSendCampaign = async (campaignId) => {
    try {
      setError('');
      const result = await campaignService.sendCampaign(campaignId);
      onCampaignUpdated(result.campaign);
    } catch (err) {
      setError(err.message || 'Failed to send campaign');
    }
  };

  const handleDeleteCampaign = async (campaignId) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) {
      return;
    }

    try {
      setError('');
      await campaignService.deleteCampaign(campaignId);
      onCampaignDeleted(campaignId);
    } catch (err) {
      setError(err.message || 'Failed to delete campaign');
    }
  };

  if (campaigns.length === 0) {
    return <div className="no-campaigns">No campaigns yet. Create your first campaign!</div>;
  }

  return (
    <div className="campaign-list">
      {error && <div className="error-message">{error}</div>}
      <div className="campaigns-grid">
        {campaigns.map((campaign) => (
          <CampaignCard
            key={campaign._id}
            campaign={campaign}
            onSend={() => handleSendCampaign(campaign._id)}
            onDelete={() => handleDeleteCampaign(campaign._id)}
          />
        ))}
      </div>
    </div>
  );
}
