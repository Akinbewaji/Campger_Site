'use client';

import React, { useState } from 'react';
import { campaignService } from '../services/campaignService';
import './CreateCampaign.css';

export default function CreateCampaign({ onCampaignCreated, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    message: '',
    recipients: '',
    scheduledTime: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const recipientsList = formData.recipients
        .split(/[,\n]/)
        .map((phone) => phone.trim())
        .filter((phone) => phone.length > 0);

      if (recipientsList.length === 0) {
        setError('Please enter at least one recipient');
        setLoading(false);
        return;
      }

      const campaignData = {
        name: formData.name,
        description: formData.description,
        message: formData.message,
        recipients: recipientsList,
        ...(formData.scheduledTime && { scheduledTime: formData.scheduledTime }),
      };

      const result = await campaignService.createCampaign(campaignData);
      onCampaignCreated(result.campaign);
    } catch (err) {
      setError(err.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-campaign-form">
      <h3>Create New Campaign</h3>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Campaign Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g., Weekly Promotion"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Optional campaign description"
          />
        </div>

        <div className="form-group">
          <label htmlFor="message">Message *</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            placeholder="Enter your SMS message here"
            rows="4"
          />
        </div>

        <div className="form-group">
          <label htmlFor="recipients">Recipients *</label>
          <textarea
            id="recipients"
            name="recipients"
            value={formData.recipients}
            onChange={handleChange}
            required
            placeholder="Enter phone numbers (one per line or comma-separated)&#10;e.g., +254712345678&#10;+254712345679"
            rows="4"
          />
        </div>

        <div className="form-group">
          <label htmlFor="scheduledTime">Schedule Send (Optional)</label>
          <input
            type="datetime-local"
            id="scheduledTime"
            name="scheduledTime"
            value={formData.scheduledTime}
            onChange={handleChange}
          />
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating...' : 'Create Campaign'}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
