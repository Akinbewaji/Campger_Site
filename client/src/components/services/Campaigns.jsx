'use client';

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { campaignService } from '../../services/campaignService';
import ServiceHeader from './ServiceHeader';
import '../Dashboard.css';
import './Services.css';

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    campaignName: '',
    messageTemplate: '',
    recipients: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const data = await campaignService.getAllCampaigns();
      setCampaigns(data || []);
    } catch (err) {
      setError('Failed to load campaigns');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      if (!formData.campaignName || !formData.recipients) {
        setError('Please fill in all fields');
        return;
      }

      const recipients = formData.recipients
        .split(/[,\n]/)
        .map(r => r.trim())
        .filter(r => r);

      if (recipients.length === 0) {
        setError('Please add at least one recipient');
        return;
      }

      const newCampaign = await campaignService.createCampaign({
        campaignName: formData.campaignName,
        messageTemplate: formData.messageTemplate,
        recipients: recipients.map(r => ({ phoneNumber: r })),
      });

      setCampaigns([newCampaign, ...campaigns]);
      setFormData({ campaignName: '', messageTemplate: '', recipients: '' });
      setShowCreate(false);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to create campaign');
    }
  };

  const handleSend = async (campaignId) => {
    try {
      await campaignService.sendCampaign(campaignId);
      await fetchCampaigns();
    } catch (err) {
      setError('Failed to send campaign');
    }
  };

  const handleDelete = async (campaignId) => {
    if (!window.confirm('Delete this campaign?')) return;
    try {
      await campaignService.deleteCampaign(campaignId);
      setCampaigns(campaigns.filter(c => c._id !== campaignId));
    } catch (err) {
      setError('Failed to delete campaign');
    }
  };

  return (
    <div className="dashboard">
      <ServiceHeader
        title="SMS Campaigns"
        subtitle="Send text messages to your audience"
        icon="💬"
        onBack={() => navigate('/dashboard')}
      />

      <main className="dashboard-main">
        <div className="dashboard-container">
          {error && <div className="error-message">{error}</div>}

          <div className="service-section">
            <div className="section-header">
              <h2>SMS Campaigns</h2>
              <button
                onClick={() => setShowCreate(!showCreate)}
                className="btn-primary"
              >
                {showCreate ? 'Cancel' : '+ New Campaign'}
              </button>
            </div>

            {showCreate && (
              <form onSubmit={handleCreate} className="create-form">
                <div className="form-group">
                  <label>Campaign Name</label>
                  <input
                    type="text"
                    value={formData.campaignName}
                    onChange={e =>
                      setFormData({ ...formData, campaignName: e.target.value })
                    }
                    placeholder="e.g., Spring Promotion"
                  />
                </div>

                <div className="form-group">
                  <label>Message Template</label>
                  <textarea
                    value={formData.messageTemplate}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        messageTemplate: e.target.value,
                      })
                    }
                    placeholder="Enter your message"
                    rows="4"
                  />
                </div>

                <div className="form-group">
                  <label>Recipients (comma or newline separated)</label>
                  <textarea
                    value={formData.recipients}
                    onChange={e =>
                      setFormData({ ...formData, recipients: e.target.value })
                    }
                    placeholder="+254712345678&#10;+254798765432"
                    rows="4"
                  />
                </div>

                <button type="submit" className="btn-primary">
                  Create Campaign
                </button>
              </form>
            )}

            {loading ? (
              <div className="loading">Loading campaigns...</div>
            ) : campaigns.length === 0 ? (
              <div className="empty-state">
                <p>No campaigns yet. Create your first SMS campaign!</p>
              </div>
            ) : (
              <div className="campaigns-list">
                {campaigns.map(campaign => (
                  <div key={campaign._id} className="campaign-item">
                    <div className="campaign-info">
                      <h4>{campaign.campaignName}</h4>
                      <p>Recipients: {campaign.recipients?.length || 0}</p>
                      <span className={`status-badge status-${campaign.status}`}>
                        {campaign.status}
                      </span>
                    </div>
                    <div className="campaign-actions">
                      {campaign.status === 'draft' && (
                        <button
                          onClick={() => handleSend(campaign._id)}
                          className="btn-action send"
                        >
                          Send
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(campaign._id)}
                        className="btn-action delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
