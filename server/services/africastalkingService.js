const axios = require('axios');

class AfricasTalkingService {
  constructor() {
    this.username = process.env.AT_USERNAME;
    this.apiKey = process.env.AT_API_KEY;
    this.apiUrl = 'https://api.sandbox.africastalking.com/version1/messaging';
  }

  /**
   * Send SMS message using Africa's Talking API
   * @param {string} phoneNumber - Recipient phone number (must include country code, e.g., +254712345678)
   * @param {string} message - SMS message content
   * @returns {Promise} Response from Africa's Talking API
   */
  async sendSMS(phoneNumber, message) {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          username: this.username,
          to: phoneNumber,
          message: message,
        },
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'apiKey': this.apiKey,
          },
        }
      );

      console.log('[Africa\'s Talking] SMS sent successfully:', response.data);
      return {
        success: true,
        data: response.data,
        messageId: response.data.SMSMessageData?.Messages?.[0]?.id,
      };
    } catch (error) {
      console.error('[Africa\'s Talking] Error sending SMS:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Send bulk SMS to multiple recipients
   * @param {Array<string>} phoneNumbers - Array of recipient phone numbers
   * @param {string} message - SMS message content
   * @returns {Promise} Response from Africa's Talking API
   */
  async sendBulkSMS(phoneNumbers, message) {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          username: this.username,
          to: phoneNumbers.join(','),
          message: message,
        },
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'apiKey': this.apiKey,
          },
        }
      );

      console.log('[Africa\'s Talking] Bulk SMS sent successfully:', response.data);

      return {
        success: true,
        data: response.data,
        messages: response.data.SMSMessageData?.Messages || [],
      };
    } catch (error) {
      console.error('[Africa\'s Talking] Error sending bulk SMS:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Fetch SMS balance
   * @returns {Promise} Account balance information
   */
  async getBalance() {
    try {
      const response = await axios.get(
        'https://api.sandbox.africastalking.com/version1/user',
        {
          params: {
            username: this.username,
          },
          headers: {
            'Accept': 'application/json',
            'apiKey': this.apiKey,
          },
        }
      );

      console.log('[Africa\'s Talking] Balance fetched:', response.data);
      return {
        success: true,
        balance: response.data.UserData?.balance,
        currency: response.data.UserData?.currency,
      };
    } catch (error) {
      console.error('[Africa\'s Talking] Error fetching balance:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }
}

module.exports = new AfricasTalkingService();
