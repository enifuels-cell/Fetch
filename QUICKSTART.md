# Quick Start Guide

Get the Motorcycle Booking System up and running in minutes!

## 🚀 Prerequisites

- **Node.js** v14+ and npm
- **MongoDB** (local or Atlas)
- **Git**

## 📦 Installation

### 1. Clone and Install
```bash
git clone <repository-url>
cd Fetch
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` if needed (defaults work for local development):
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/motorcycle-booking
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 3. Start MongoDB

**Option A: Local MongoDB**
```bash
mongod
```

**Option B: MongoDB Atlas**
- Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Create cluster and get connection string
- Update `MONGODB_URI` in `.env`

### 4. Create Admin Account
```bash
npm run create-admin
```

Default credentials:
- Email: `admin@motorcyclebooking.com`
- Password: `admin123`

⚠️ **Change password after first login!**

### 5. Start Server
```bash
npm run dev
```

Server runs at: **http://localhost:3000**

## 🎯 Quick Test

### 1. Check API is Running
```bash
curl http://localhost:3000
```

### 2. Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "+1234567890",
    "role": "user"
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the `token` from the response!

### 4. Create a Booking
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "pickupLocation": {
      "address": "123 Main St"
    },
    "dropoffLocation": {
      "address": "456 Oak Ave"
    },
    "scheduledTime": "2024-12-15T10:00:00Z",
    "fare": 25.50
  }'
```

## 🔑 User Roles

### **User** (Customer)
- Create bookings
- View own bookings
- Cancel bookings
- Rate completed rides

### **Rider** (Driver)
- All user capabilities
- View available bookings
- Accept bookings
- Update ride status
- Manage availability

### **Admin**
- Full system access
- Approve riders
- Manage users
- View all bookings
- System statistics

## 📱 Testing with Postman

1. Import `Motorcycle-Booking-API.postman_collection.json`
2. Set variables:
   - `baseUrl`: `http://localhost:3000/api`
   - `token`: (from login response)
3. Test all endpoints!

## 🛣️ Complete User Journey

### As a Customer:
1. Register as user → `POST /api/auth/register`
2. Login → `POST /api/auth/login`
3. Create booking → `POST /api/bookings`
4. View bookings → `GET /api/bookings/my-bookings`
5. Wait for rider acceptance
6. Rate completed ride → `PUT /api/bookings/:id/rate`

### As a Rider:
1. Register as user → `POST /api/auth/register`
2. Apply to be rider → `POST /api/riders/register`
3. Wait for admin approval
4. Login → `POST /api/auth/login`
5. View available bookings → `GET /api/bookings/available`
6. Accept booking → `PUT /api/bookings/:id/accept`
7. Start ride → `PUT /api/bookings/:id/status` (in-progress)
8. Complete ride → `PUT /api/bookings/:id/status` (completed)

### As Admin:
1. Login → `POST /api/auth/login`
2. View dashboard → `GET /api/admin/dashboard`
3. Approve riders → `PUT /api/admin/riders/:id/approval`
4. Manage users → `GET /api/admin/users`
5. View all bookings → `GET /api/admin/bookings`

## 🔍 API Endpoints Overview

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Riders
- `POST /api/riders/register` - Apply as rider
- `GET /api/riders/profile` - Get rider profile
- `PUT /api/riders/profile` - Update rider profile
- `GET /api/riders` - List available riders

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my-bookings` - User's bookings
- `GET /api/bookings/rider-bookings` - Rider's bookings
- `GET /api/bookings/available` - Available bookings
- `PUT /api/bookings/:id/accept` - Accept booking
- `PUT /api/bookings/:id/status` - Update status
- `PUT /api/bookings/:id/cancel` - Cancel booking
- `PUT /api/bookings/:id/rate` - Rate booking

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - All users
- `GET /api/admin/riders` - All riders
- `PUT /api/admin/riders/:id/approval` - Approve rider
- `PUT /api/admin/users/:id/status` - Toggle user status
- `GET /api/admin/bookings` - All bookings
- `DELETE /api/admin/users/:id` - Delete user

## 🐛 Troubleshooting

### MongoDB Connection Failed
```bash
# Check MongoDB is running
ps aux | grep mongod

# Start MongoDB
mongod
```

### Port 3000 Already in Use
```bash
# Change PORT in .env or kill process
lsof -ti:3000 | xargs kill
```

### Dependencies Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## 📚 Next Steps

- Read full [README.md](README.md) for detailed API docs
- Check [TESTING.md](TESTING.md) for comprehensive test scenarios
- Explore code structure in project files
- Customize for your needs

## 🆘 Need Help?

- Check logs in console
- Review error messages
- Verify MongoDB connection
- Ensure all environment variables are set
- Test with Postman collection

## 🎉 You're Ready!

Your motorcycle booking system is now running. Start testing the APIs and building your application!
