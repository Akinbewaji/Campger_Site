const axios = require('axios');

class CampgerService {
  constructor() {
    this.username = process.env.AT_USERNAME;
    this.apiKey = process.env.AT_API_KEY;
    this.baseUrl = 'https://api.sandbox.africastalking.com/version1';
  }

  // ==================== SMS SERVICE ====================
  async sendSMS(phoneNumber, message) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/messaging`,
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

      return {
        success: true,
        data: response.data,
        messageId: response.data.SMSMessageData?.Messages?.[0]?.id,
      };
    } catch (error) {
      console.error('[CAMPGER] Error sending SMS:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  async sendBulkSMS(phoneNumbers, message) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/messaging`,
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

      return {
        success: true,
        data: response.data,
        messages: response.data.SMSMessageData?.Messages || [],
      };
    } catch (error) {
      console.error('[CAMPGER] Error sending bulk SMS:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  // ==================== AIRTIME SERVICE ====================
  async sendAirtime(phoneNumber, amount) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/airtime/send`,
        {
          username: this.username,
          recipients: [
            {
              phoneNumber: phoneNumber,
              amount: `KES ${amount}`,
            },
          ],
        },
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'apiKey': this.apiKey,
          },
        }
      );

      return {
        success: true,
        data: response.data,
        transactionId: response.data.responses?.[0]?.transactionId,
      };
    } catch (error) {
      console.error('[CAMPGER] Error sending airtime:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  async sendBulkAirtime(recipients) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/airtime/send`,
        {
          username: this.username,
          recipients: recipients.map(r => ({
            phoneNumber: r.phoneNumber,
            amount: `KES ${r.amount}`,
          })),
        },
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'apiKey': this.apiKey,
          },
        }
      );

      return {
        success: true,
        data: response.data,
        transactions: response.data.responses || [],
      };
    } catch (error) {
      console.error('[CAMPGER] Error sending bulk airtime:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  // ==================== USSD SERVICE ====================
  async initiateUSSD(phoneNumber, ussdCode) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/ussd/send`,
        {
          username: this.username,
          phoneNumber: phoneNumber,
          sessionId: Math.random().toString(36).substring(7),
          serviceCode: ussdCode,
        },
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'apiKey': this.apiKey,
          },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('[CAMPGER] Error initiating USSD:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  // ==================== VOICE SERVICE ====================
  async makeCall(phoneNumber, callbackUrl) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/voice/call`,
        {
          username: this.username,
          recipients: [phoneNumber],
          callbackUrl: callbackUrl,
        },
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'apiKey': this.apiKey,
          },
        }
      );

      return {
        success: true,
        data: response.data,
        callId: response.data.Entries?.[0]?.entryId,
      };
    } catch (error) {
      console.error('[CAMPGER] Error making call:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  async bulkCall(phoneNumbers, callbackUrl) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/voice/call`,
        {
          username: this.username,
          recipients: phoneNumbers,
          callbackUrl: callbackUrl,
        },
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'apiKey': this.apiKey,
          },
        }
      );

      return {
        success: true,
        data: response.data,
        calls: response.data.Entries || [],
      };
    } catch (error) {
      console.error('[CAMPGER] Error making bulk calls:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  // ==================== DATA SERVICE ====================
  async purchaseData(phoneNumber, dataPackage) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/mobile/data/request`,
        {
          username: this.username,
          phoneNumber: phoneNumber,
          dataAmount: dataPackage.amount,
        },
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'apiKey': this.apiKey,
          },
        }
      );

      return {
        success: true,
        data: response.data,
        transactionId: response.data.responses?.[0]?.transactionId,
      };
    } catch (error) {
      console.error('[CAMPGER] Error purchasing data:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  async bulkPurchaseData(recipients) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/mobile/data/request`,
        {
          username: this.username,
          recipients: recipients.map(r => ({
            phoneNumber: r.phoneNumber,
            dataAmount: r.amount,
          })),
        },
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'apiKey': this.apiKey,
          },
        }
      );

      return {
        success: true,
        data: response.data,
        transactions: response.data.responses || [],
      };
    } catch (error) {
      console.error('[CAMPGER] Error bulk purchasing data:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  // ==================== ACCOUNT SERVICE ====================
  async getBalance() {
    try {
      const response = await axios.get(
        `${this.baseUrl}/user`,
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

      return {
        success: true,
        balance: response.data.UserData?.balance,
        currency: response.data.UserData?.currency,
        smsBalance: response.data.UserData?.balance,
        airtimeBalance: response.data.UserData?.balance,
        dataBalance: response.data.UserData?.balance,
      };
    } catch (error) {
      console.error('[CAMPGER] Error fetching balance:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }
}

module.exports = new CampgerService();
