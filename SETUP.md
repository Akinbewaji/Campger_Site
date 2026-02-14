# SMS Campaign Manager - Setup Guide

## Prerequisites

Before starting, ensure you have:
- Node.js (v14+) installed
- MongoDB running locally or access to MongoDB Atlas
- Africa's Talking API credentials (from https://africastalking.com)
- Two terminal windows ready

## Step 1: Set Up Environment Variables

### Server (.env)

Navigate to the `server` directory and update `.env` with your credentials:

```bash
cd server
```

Update the following in `.env`:

- **MONGODB_URI**: Your MongoDB connection string
  - Local: `mongodb://localhost:27017/sms-campaign-manager`
  - MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net/sms-campaign-manager`

- **AT_USERNAME**: Your Africa's Talking username
  - Get from: https://africastalking.com/user/settings/apps

- **AT_API_KEY**: Your Africa's Talking API Key
  - Get from: https://africastalking.com/user/settings/apis

- **JWT_SECRET**: A strong random string (keep it secret!)
  - Example: `your_random_jwt_secret_key_12345`

### Client (.env)

The client `.env` is already configured correctly:
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Step 2: Start MongoDB

If using MongoDB locally:

```bash
# macOS with Homebrew
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

To verify MongoDB is running:
```bash
mongo --eval "db.adminCommand('ping')"
```

If using MongoDB Atlas, skip this step.

## Step 3: Install and Start Backend

**Terminal 1:**

```bash
cd server
npm install
npm run dev
```

You should see:
```
[v0] MongoDB connected: localhost
[v0] Server running on port 5000
```

## Step 4: Install and Start Frontend

**Terminal 2:**

```bash
cd client
npm install
npm start
```

The app will automatically open at `http://localhost:3000`

## Step 5: Verify Everything is Working

1. **Login Page**: You should see the SMS Campaign Manager login page
2. **Backend Health Check**: Visit http://localhost:5000/api/health
   - Should return: `{"status":"ok","timestamp":"..."}`
3. **Register**: Create a new account with email and password
4. **Create Campaign**: Test creating a campaign with phone numbers

## Troubleshooting

### White Screen Error
- Check if backend is running on port 5000
- Open browser console (F12) for errors
- Verify `.env` variables are set correctly

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- For local: try `mongodb://127.0.0.1:27017/sms-campaign-manager`

### Africa's Talking API Errors
- Verify `AT_USERNAME` and `AT_API_KEY` are correct
- Check account balance in Africa's Talking dashboard
- Ensure phone numbers include country code (e.g., +254712345678)

### Port Already in Use
- Backend: Change `PORT=5000` to `PORT=5001` in `server/.env`
- Frontend: Kill process on port 3000 or use different port

### CORS Errors
- Backend CORS is configured for `http://localhost:3000`
- If frontend is on different port, update `CORS_ORIGIN` in `server/.env`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login user

### Campaigns
- `GET /api/campaigns` - List all campaigns
- `POST /api/campaigns` - Create new campaign
- `POST /api/campaigns/:id/send` - Send campaign SMS
- `DELETE /api/campaigns/:id` - Delete campaign

## Testing SMS Sending

1. Register and login
2. Create a campaign with:
   - Campaign name: "Test Campaign"
   - Message: "Hello from SMS Manager!"
   - Recipients: `+254712345678` (or your test number with country code)
3. Click "Send Campaign"
4. Check the SMS on your phone

## Production Deployment

For production:
1. Update `CORS_ORIGIN` to your frontend domain
2. Use production Africa's Talking API (not sandbox)
3. Use MongoDB Atlas for database
4. Set `NODE_ENV=production`
5. Deploy backend to Heroku, AWS, or similar
6. Deploy frontend to Vercel, Netlify, or similar
