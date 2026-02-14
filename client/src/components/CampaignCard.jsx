'use client';

import React from 'react';
import './CampaignCard.css';

export default function CampaignCard({ campaign, onSend, onDelete }) {
  const statusColors = {
    draft: '#999',
    scheduled: '#ff9800',
    running: '#2196f3',
    completed: '#4caf50',
    paused: '#f44336',
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canSend = campaign.status === 'draft' || campaign.status === 'scheduled';

  return (
    <div className="campaign-card">
      <div className="card-header">
        <h3>{campaign.name}</h3>
        <span className="status-badge" style={{ backgroundColor: statusColors[campaign.status] }}>
          {campaign.status}
        </span>
      </div>

      <p className="card-description">{campaign.description || 'No description'}</p>

      <div className="card-stats">
        <div className="stat">
          <span className="stat-label">Total Recipients</span>
          <span className="stat-value">{campaign.stats.totalRecipients}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Sent</span>
          <span className="stat-value">{campaign.stats.sent}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Failed</span>
          <span className="stat-value">{campaign.stats.failed}</span>
        </div>
      </div>

      <div className="card-message">
        <p className="message-preview">{campaign.message}</p>
      </div>

      <div className="card-dates">
        <small>Created: {formatDate(campaign.createdAt)}</small>
      </div>

      <div className="card-actions">
        {canSend && (
          <button onClick={onSend} className="btn-send">
            Send Campaign
          </button>
        )}
        <button onClick={onDelete} className="btn-delete">
          Delete
        </button>
      </div>
    </div>
  );
}
