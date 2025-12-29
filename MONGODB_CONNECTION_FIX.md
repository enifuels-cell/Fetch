# MongoDB Atlas Connection Fix

## Current Status
✅ **API Server is running on http://localhost:3000**
❌ **MongoDB connection failing** - IP whitelist issue

## Quick Fix Options

### Option 1: Allow Any IP (Development Only - NOT Secure)
1. Go to https://cloud.mongodb.com
2. Login to your account
3. Navigate to **Network Access** (left sidebar)
4. Click **"Add IP Address"**
5. Change from specific IP to **0.0.0.0/0** (Allow from anywhere)
6. Click **Confirm**
7. Restart the server: `npm run dev`

⚠️ **Warning**: Only use 0.0.0.0/0 for development. Use specific IPs in production.

### Option 2: Get Your Current IP and Whitelist It
```powershell
# Get your public IP
(Invoke-WebRequest -Uri 'https://api.ipify.org' -UseBasicParsing).Content
```
Then add this IP to MongoDB Atlas Network Access whitelist.

### Option 3: Use Local MongoDB (Recommended for Development)

#### Install MongoDB Community:
1. Download from: https://www.mongodb.com/try/download/community
2. Run the installer
3. Keep default path: C:\Program Files\MongoDB\Server\7.0
4. Install as Windows Service
5. Verify: `mongod --version`

Then update `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/motorcycle-booking
```

### Option 4: Switch Connection String Format
If your Atlas connection is timing out, try the standard connection string:
```env
MONGODB_URI=mongodb://nagacclark_db_user:1MhyhWJUTdLTUIoP@fetch.7idiskx.mongodb.net:27017/motorcycle-booking?authSource=admin&retryWrites=true
```

---

## How to Test After Fixing

Once MongoDB connects, run these tests:

### 1. Register a User
```powershell
$body = @{
    name = "Test User"
    email = "test@example.com"
    password = "password123"
    phone = "+1234567890"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/auth/register" `
  -Method Post `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

### 2. Login
```powershell
$loginBody = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" `
  -Method Post `
  -Headers @{"Content-Type"="application/json"} `
  -Body $loginBody
```

### 3. Create Admin User
```bash
npm run create-admin
```

---

## Checking Connection Status

Monitor the server output:
```
✅ MongoDB Connected: ac-omopqc3-shard-00-00.7idiskx.mongodb.net
```

Once you see this, your database is ready!

---

## Need Help?

1. **Check MongoDB Atlas Status**: https://status.mongodb.com
2. **Verify Network**: `Test-NetConnection fetch.7idiskx.mongodb.net -Port 27017`
3. **Check Firewall**: Ensure port 27017 isn't blocked
4. **Review Logs**: Check MongoDB Atlas Activity/Logs

