import client from '../api/client';

export const campaignService = {
  getAllCampaigns: async () => {
    try {
      const response = await client.get('/campaigns');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getCampaign: async (id) => {
    try {
      const response = await client.get(`/campaigns/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  createCampaign: async (campaignData) => {
    try {
      const response = await client.post('/campaigns', campaignData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateCampaign: async (id, campaignData) => {
    try {
      const response = await client.put(`/campaigns/${id}`, campaignData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  sendCampaign: async (id) => {
    try {
      const response = await client.post(`/campaigns/${id}/send`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  deleteCampaign: async (id) => {
    try {
      const response = await client.delete(`/campaigns/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
