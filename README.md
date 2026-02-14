# SMS Campaign Manager

A full-stack web application for creating and managing SMS campaigns using Africa's Talking API. Built with Node.js/Express backend and React frontend.

## Project Structure

```
├── server/                 # Express backend
│   ├── models/            # MongoDB models (User, Campaign)
│   ├── routes/            # API routes (auth, campaigns)
│   ├── services/          # Business logic (Africa's Talking integration)
│   ├── middleware/        # Authentication middleware
│   └── server.js          # Express app entry point
└── client/                # React frontend
    ├── src/
    │   ├── components/    # React components
    │   ├── services/      # API client services
    │   ├── api/          # Axios client configuration
    │   └── App.jsx       # Main app component
    └── public/           # Static files
```

## Features

- **User Authentication**: Register and login with JWT tokens
- **Campaign Management**: Create, update, and delete SMS campaigns
- **Recipient Management**: Add multiple phone numbers to campaigns
- **Campaign Status**: Track campaign status (draft, scheduled, running, completed)
- **Africa's Talking Integration**: Send SMS messages via Africa's Talking API
- **Campaign Statistics**: Track sent, delivered, and failed messages
- **Responsive UI**: Works on desktop and mobile devices

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Africa's Talking account with API credentials

## Setup Instructions

### 1. Backend Setup

#### Clone and Install Dependencies

```bash
cd server
npm install
```

#### Configure Environment Variables

Create a `.env` file in the `server` directory with the following variables:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/sms-campaign-manager

# JWT Secret
JWT_SECRET=your_secure_jwt_secret_key

# Africa's Talking
AT_USERNAME=your_africas_talking_username
AT_API_KEY=your_africas_talking_api_key

# Server
PORT=5000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000
```

#### Start MongoDB

If using MongoDB locally:

```bash
mongod
```

#### Run Backend Server

```bash
npm run dev
```

The backend server will start on `http://localhost:5000`

### 2. Frontend Setup

#### Install Dependencies

```bash
cd client
npm install
```

#### Configure Environment Variables

Create a `.env` file in the `client` directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

#### Start Frontend Development Server

```bash
npm start
```

The frontend will open at `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Campaigns

- `GET /api/campaigns` - Get all campaigns (requires auth)
- `GET /api/campaigns/:id` - Get specific campaign (requires auth)
- `POST /api/campaigns` - Create new campaign (requires auth)
- `PUT /api/campaigns/:id` - Update campaign (requires auth)
- `POST /api/campaigns/:id/send` - Send campaign (requires auth)
- `DELETE /api/campaigns/:id` - Delete campaign (requires auth)

## Africa's Talking Integration

The application integrates with Africa's Talking API for sending SMS messages. The integration is handled in `server/services/africastalkingService.js`.

### Key Functions

1. **sendSMS(phoneNumber, message)** - Send single SMS
2. **sendBulkSMS(phoneNumbers, message)** - Send SMS to multiple recipients
3. **getBalance()** - Check account balance

### Phone Number Format

Phone numbers must include the country code. Example: `+254712345678` for Kenya

## Campaign Workflow

1. **Create Campaign**: Set name, message, and add recipients
2. **Review**: Check campaign details before sending
3. **Send**: Click "Send Campaign" to start sending SMS
4. **Track**: Monitor campaign status and statistics

## Authentication

The application uses JWT (JSON Web Tokens) for authentication:

1. User registers or logs in
2. Server returns JWT token
3. Token is stored in browser localStorage
4. Token is sent with every API request in Authorization header
5. Server validates token before processing requests

## Database Models

### User

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  organization: String,
  role: String (user/admin),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Campaign

```javascript
{
  name: String,
  description: String,
  userId: ObjectId (ref: User),
  message: String,
  recipients: [
    {
      phone: String,
      status: String (pending/sent/failed/delivered),
      sentAt: Date,
      errorMessage: String
    }
  ],
  status: String (draft/scheduled/running/completed/paused),
  scheduledTime: Date,
  startTime: Date,
  endTime: Date,
  stats: {
    totalRecipients: Number,
    sent: Number,
    delivered: Number,
    failed: Number,
    pending: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Development Tips

### Testing the Backend

Use tools like Postman or cURL to test API endpoints:

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "+254712345678",
    "organization": "My Org"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'

# Get Campaigns
curl http://localhost:5000/api/campaigns \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Testing Africa's Talking Integration

Before sending real SMS:

1. Use Africa's Talking sandbox environment
2. Test with valid phone numbers
3. Monitor your account balance
4. Check error messages in campaign statistics

## Troubleshooting

### MongoDB Connection Error

- Ensure MongoDB is running locally or connection string is correct
- Check MONGODB_URI in .env file

### Africa's Talking API Errors

- Verify AT_USERNAME and AT_API_KEY are correct
- Check phone number format (must include country code)
- Ensure account has sufficient balance
- Check Africa's Talking API documentation for error codes

### CORS Errors

- Verify CORS_ORIGIN in backend .env matches frontend URL
- By default, backend accepts http://localhost:3000

### JWT Token Errors

- Clear browser localStorage if token is invalid
- Re-login to get a new token
- Verify JWT_SECRET is set in backend .env

## Future Enhancements

- Schedule campaigns for specific times
- Advanced recipient segmentation
- Campaign templates
- Message delivery reports
- Webhook support for delivery notifications
- Rate limiting and throttling
- Admin dashboard for system management
- Analytics and reporting

## License

MIT
# Campger
