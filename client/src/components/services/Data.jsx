'use client';

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ServiceHeader from './ServiceHeader';
import '../Dashboard.css';
import './Services.css';

export default function Data() {
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
      const response = await fetch('http://localhost:5000/api/data', {
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
      const recipients = formData.recipients
        .split(/[,\n]/)
        .map(r => r.trim())
        .filter(r => r);

      if (recipients.length === 0) {
        setError('Please add at least one recipient');
        return;
      }

      const parsedRecipients = recipients.map(r => {
        const [phone, amount] = r.split(':');
        return { phoneNumber: phone, dataAmount: amount || '1GB', cost: parseInt(amount) || 100 };
      });

      const totalCost = parsedRecipients.reduce((sum, r) => sum + r.cost, 0);

      const response = await fetch('http://localhost:5000/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          campaignName: formData.campaignName,
          recipients: parsedRecipients,
          totalCost,
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
      await fetch(`http://localhost:5000/api/data/${campaignId}/send`, {
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
      await fetch(`http://localhost:5000/api/data/${campaignId}`, {
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
        title="Data Campaigns"
        subtitle="Send mobile data bundles to your customers"
        icon="📊"
        onBack={() => navigate('/dashboard')}
      />

      <main className="dashboard-main">
        <div className="dashboard-container">
          {error && <div className="error-message">{error}</div>}

          <div className="service-section">
            <div className="section-header">
              <h2>Data Bundle Campaigns</h2>
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
                    placeholder="e.g., Weekend Data Promotion"
                  />
                </div>

                <div className="form-group">
                  <label>Recipients and Data (phone:amount, one per line)</label>
                  <textarea
                    value={formData.recipients}
                    onChange={e => setFormData({ ...formData, recipients: e.target.value })}
                    placeholder={`+254712345678:1GB:100&#10;+254798765432:5GB:300`}
                    rows="4"
                  />
                  <small>Format: phone:dataAmount:cost</small>
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
                <p>No data campaigns yet. Create your first one!</p>
              </div>
            ) : (
              <div className="campaigns-list">
                {campaigns.map(campaign => (
                  <div key={campaign._id} className="campaign-item">
                    <div className="campaign-info">
                      <h4>{campaign.campaignName}</h4>
                      <p>
                        Cost: KES {campaign.totalCost} | Recipients: {campaign.recipients?.length || 0}
                      </p>
                      <span className={`status-badge status-${campaign.status}`}>
                        {campaign.status}
                      </span>
                    </div>
                    <div className="campaign-actions">
                      {campaign.status === 'draft' && (
                        <button onClick={() => handleSend(campaign._id)} className="btn-action send">
                          Send
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
