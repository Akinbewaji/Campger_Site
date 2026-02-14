'use client';

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ServiceHeader from './ServiceHeader';
import '../Dashboard.css';
import './Services.css';

export default function Airtime() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    campaignName: '',
    recipients: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/airtime', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
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
      const recipients = formData.recipients
        .split(/[,\n]/)
        .map(r => r.trim())
        .filter(r => r);

      if (recipients.length === 0) {
        setError('Please add at least one recipient');
        return;
      }

      // Parse recipients with amounts (format: +254712345678:100)
      const parsedRecipients = recipients.map(r => {
        const [phone, amount] = r.split(':');
        return { phoneNumber: phone, amount: parseInt(amount) || 50 };
      });

      const totalAmount = parsedRecipients.reduce((sum, r) => sum + r.amount, 0);

      const response = await fetch('http://localhost:5000/api/airtime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          campaignName: formData.campaignName,
          recipients: parsedRecipients,
          totalAmount,
        }),
      });

      if (!response.ok) throw new Error('Failed to create');
      const newCampaign = await response.json();
      setCampaigns([newCampaign, ...campaigns]);
      setFormData({ campaignName: '', recipients: '' });
      setShowCreate(false);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to create campaign');
    }
  };

  const handleSend = async (campaignId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/airtime/${campaignId}/send`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to send');
      await fetchCampaigns();
    } catch (err) {
      setError('Failed to send campaign');
    }
  };

  const handleDelete = async (campaignId) => {
    if (!window.confirm('Delete this campaign?')) return;
    try {
      await fetch(`http://localhost:5000/api/airtime/${campaignId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setCampaigns(campaigns.filter(c => c._id !== campaignId));
    } catch (err) {
      setError('Failed to delete campaign');
    }
  };

  return (
    <div className="dashboard">
      <ServiceHeader
        title="Airtime Campaigns"
        subtitle="Send mobile airtime to your contacts"
        icon="📱"
        onBack={() => navigate('/dashboard')}
      />

      <main className="dashboard-main">
        <div className="dashboard-container">
          {error && <div className="error-message">{error}</div>}

          <div className="service-section">
            <div className="section-header">
              <h2>Airtime Campaigns</h2>
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
                    placeholder="e.g., Monthly Airtime Gift"
                  />
                </div>

                <div className="form-group">
                  <label>Recipients and Amounts (phone:amount, one per line)</label>
                  <textarea
                    value={formData.recipients}
                    onChange={e =>
                      setFormData({ ...formData, recipients: e.target.value })
                    }
                    placeholder={`+254712345678:100&#10;+254798765432:50&#10;(Format: phone:amount in KES)`}
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
                <p>No airtime campaigns yet. Create your first one!</p>
              </div>
            ) : (
              <div className="campaigns-list">
                {campaigns.map(campaign => (
                  <div key={campaign._id} className="campaign-item">
                    <div className="campaign-info">
                      <h4>{campaign.campaignName}</h4>
                      <p>
                        Amount: KES {campaign.totalAmount} | Recipients:{' '}
                        {campaign.recipients?.length || 0}
                      </p>
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
