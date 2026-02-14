'use client';

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ServiceHeader from './ServiceHeader';
import '../Dashboard.css';
import './Services.css';

export default function USSD() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    campaignName: '',
    ussdCode: '',
    recipients: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/ussd', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Failed to fetch');
      setCampaigns(await response.json() || []);
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
      if (!formData.ussdCode) {
        setError('Please enter a USSD code');
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

      const response = await fetch('http://localhost:5000/api/ussd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          campaignName: formData.campaignName,
          ussdCode: formData.ussdCode,
          recipients,
        }),
      });

      if (!response.ok) throw new Error('Failed to create');
      const newCampaign = await response.json();
      setCampaigns([newCampaign, ...campaigns]);
      setFormData({ campaignName: '', ussdCode: '', recipients: '' });
      setShowCreate(false);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to create campaign');
    }
  };

  const handleSend = async (campaignId) => {
    try {
      await fetch(`http://localhost:5000/api/ussd/${campaignId}/send`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      await fetchCampaigns();
    } catch (err) {
      setError('Failed to send campaign');
    }
  };

  const handleDelete = async (campaignId) => {
    if (!window.confirm('Delete this campaign?')) return;
    try {
      await fetch(`http://localhost:5000/api/ussd/${campaignId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setCampaigns(campaigns.filter(c => c._id !== campaignId));
    } catch (err) {
      setError('Failed to delete campaign');
    }
  };

  return (
    <div className="dashboard">
      <ServiceHeader
        title="USSD Campaigns"
        subtitle="Trigger USSD sessions with your customers"
        icon="⚡"
        onBack={() => navigate('/dashboard')}
      />

      <main className="dashboard-main">
        <div className="dashboard-container">
          {error && <div className="error-message">{error}</div>}

          <div className="service-section">
            <div className="section-header">
              <h2>USSD Campaigns</h2>
              <button onClick={() => setShowCreate(!showCreate)} className="btn-primary">
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
                    onChange={e => setFormData({ ...formData, campaignName: e.target.value })}
                    placeholder="e.g., Balance Check Campaign"
                  />
                </div>

                <div className="form-group">
                  <label>USSD Code</label>
                  <input
                    type="text"
                    value={formData.ussdCode}
                    onChange={e => setFormData({ ...formData, ussdCode: e.target.value })}
                    placeholder="e.g., *123#"
                  />
                </div>

                <div className="form-group">
                  <label>Recipients (comma or newline separated)</label>
                  <textarea
                    value={formData.recipients}
                    onChange={e => setFormData({ ...formData, recipients: e.target.value })}
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
                <p>No USSD campaigns yet. Create your first one!</p>
              </div>
            ) : (
              <div className="campaigns-list">
                {campaigns.map(campaign => (
                  <div key={campaign._id} className="campaign-item">
                    <div className="campaign-info">
                      <h4>{campaign.campaignName}</h4>
                      <p>
                        USSD: {campaign.ussdCode} | Recipients: {campaign.recipients?.length || 0} | Initiated: {campaign.stats?.initiated || 0}
                      </p>
                      <span className={`status-badge status-${campaign.status}`}>
                        {campaign.status}
                      </span>
                    </div>
                    <div className="campaign-actions">
                      {campaign.status === 'draft' && (
                        <button onClick={() => handleSend(campaign._id)} className="btn-action send">
                          Initiate
                        </button>
                      )}
                      <button onClick={() => handleDelete(campaign._id)} className="btn-action delete">
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
