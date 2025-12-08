# Testing Guide - Motorcycle Booking System

This guide provides step-by-step instructions for testing the motorcycle booking system.

## Prerequisites

1. **MongoDB**: Install and run MongoDB locally or use MongoDB Atlas
2. **Node.js**: Version 14 or higher
3. **Postman** (optional): For API testing

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start MongoDB (if running locally):
```bash
mongod
```

4. Create admin user (optional):
```bash
npm run create-admin
```

5. Start the server:
```bash
npm run dev
```

The server should start at `http://localhost:3000`

## Testing Scenarios

### Scenario 1: User Registration and Login

#### 1.1 Register as User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Customer",
    "email": "alice@example.com",
    "password": "password123",
    "phone": "+1234567890",
    "role": "user"
  }'
```

Expected Response:
- Status: 201
- Response includes token and user data
- User role should be "user"
- isApproved should be true

#### 1.2 Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "password123"
  }'
```

Expected Response:
- Status: 200
- Response includes token and user data

Save the token for subsequent requests.

#### 1.3 Get Current User
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected Response:
- Status: 200
- User details returned

### Scenario 2: Rider Registration and Approval

#### 2.1 Register as Rider (First register as user)
```bash
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bob Rider",
    "email": "bob@example.com",
    "password": "password123",
    "phone": "+0987654321",
    "role": "user"
  }'
```

#### 2.2 Apply to become Rider
```bash
curl -X POST http://localhost:3000/api/riders/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer BOB_TOKEN" \
  -d '{
    "licenseNumber": "DL123456",
    "vehicleType": "sport",
    "vehicleBrand": "Yamaha",
    "vehicleModel": "R15",
    "vehicleYear": 2023,
    "plateNumber": "ABC-1234"
  }'
```

Expected Response:
- Status: 201
- Message: "Rider registration submitted. Waiting for admin approval."
- User role changed to "rider"
- isApproved should be false

#### 2.3 Admin Login and Approve Rider
```bash
# Login as admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@motorcyclebooking.com",
    "password": "admin123"
  }'

# Get all riders (to find rider ID)
curl -X GET http://localhost:3000/api/admin/riders \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Approve rider
curl -X PUT http://localhost:3000/api/admin/riders/RIDER_ID/approval \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "isApproved": true
  }'
```

Expected Response:
- Status: 200
- Rider approved successfully

### Scenario 3: Complete Booking Workflow

#### 3.1 User Creates Booking
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ALICE_TOKEN" \
  -d '{
    "pickupLocation": {
      "address": "123 Main St, Downtown",
      "coordinates": {
        "lat": 40.7128,
        "lng": -74.0060
      }
    },
    "dropoffLocation": {
      "address": "456 Oak Ave, Uptown",
      "coordinates": {
        "lat": 40.7580,
        "lng": -73.9855
      }
    },
    "scheduledTime": "2024-12-15T10:00:00Z",
    "fare": 25.50,
    "distance": 5.2,
    "duration": 15,
    "passengerCount": 1,
    "notes": "Please call when you arrive"
  }'
```

Expected Response:
- Status: 201
- Booking created with status "pending"
- No rider assigned yet

#### 3.2 Rider Views Available Bookings
```bash
curl -X GET http://localhost:3000/api/bookings/available \
  -H "Authorization: Bearer BOB_TOKEN"
```

Expected Response:
- Status: 200
- List of pending bookings without assigned riders

#### 3.3 Rider Accepts Booking
```bash
curl -X PUT http://localhost:3000/api/bookings/BOOKING_ID/accept \
  -H "Authorization: Bearer BOB_TOKEN"
```

Expected Response:
- Status: 200
- Booking status changed to "confirmed"
- Rider assigned to booking

#### 3.4 Rider Starts Ride
```bash
curl -X PUT http://localhost:3000/api/bookings/BOOKING_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer BOB_TOKEN" \
  -d '{
    "status": "in-progress"
  }'
```

Expected Response:
- Status: 200
- Booking status changed to "in-progress"

#### 3.5 Rider Completes Ride
```bash
curl -X PUT http://localhost:3000/api/bookings/BOOKING_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer BOB_TOKEN" \
  -d '{
    "status": "completed"
  }'
```

Expected Response:
- Status: 200
- Booking status changed to "completed"
- Rider's totalRides incremented

#### 3.6 User Rates the Ride
```bash
curl -X PUT http://localhost:3000/api/bookings/BOOKING_ID/rate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ALICE_TOKEN" \
  -d '{
    "rating": 5,
    "review": "Excellent ride! Very professional and safe."
  }'
```

Expected Response:
- Status: 200
- Rating and review added to booking
- Rider's average rating updated

### Scenario 4: User Views Their Bookings
```bash
curl -X GET http://localhost:3000/api/bookings/my-bookings \
  -H "Authorization: Bearer ALICE_TOKEN"
```

Expected Response:
- Status: 200
- List of all bookings created by the user

### Scenario 5: Rider Views Their Bookings
```bash
curl -X GET http://localhost:3000/api/bookings/rider-bookings \
  -H "Authorization: Bearer BOB_TOKEN"
```

Expected Response:
- Status: 200
- List of all bookings assigned to the rider

### Scenario 6: Admin Dashboard

#### 6.1 Get Dashboard Statistics
```bash
curl -X GET http://localhost:3000/api/admin/dashboard \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

Expected Response:
- Status: 200
- Statistics including:
  - Total users
  - Total riders
  - Pending riders
  - Total bookings
  - Pending bookings
  - Completed bookings

#### 6.2 Get All Users
```bash
curl -X GET http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

#### 6.3 Get All Bookings
```bash
curl -X GET http://localhost:3000/api/admin/bookings \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

#### 6.4 Deactivate User
```bash
curl -X PUT http://localhost:3000/api/admin/users/USER_ID/status \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

Expected Response:
- Status: 200
- User's isActive status toggled

### Scenario 7: Booking Cancellation

#### 7.1 User Cancels Booking
```bash
curl -X PUT http://localhost:3000/api/bookings/BOOKING_ID/cancel \
  -H "Authorization: Bearer ALICE_TOKEN"
```

Expected Response:
- Status: 200
- Booking status changed to "cancelled"
- Only works if booking is not completed

## Error Testing

### Test Invalid Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "wrong@example.com",
    "password": "wrongpass"
  }'
```

Expected Response:
- Status: 401
- Error message: "Invalid credentials"

### Test Unauthorized Access
```bash
curl -X GET http://localhost:3000/api/admin/users
```

Expected Response:
- Status: 401
- Error message: "Not authorized to access this route"

### Test Access Without Required Role
```bash
# User trying to access rider endpoint
curl -X GET http://localhost:3000/api/bookings/available \
  -H "Authorization: Bearer ALICE_TOKEN"
```

Expected Response:
- Status: 403
- Error message: "User role user is not authorized to access this route"

### Test Duplicate Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Customer",
    "email": "alice@example.com",
    "password": "password123",
    "phone": "+1234567890"
  }'
```

Expected Response:
- Status: 400
- Error message: "User already exists"

## Validation Testing

### Test Missing Required Fields
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ALICE_TOKEN" \
  -d '{
    "pickupLocation": {
      "address": "123 Main St"
    }
  }'
```

Expected Response:
- Status: 500
- Validation error for missing required fields

### Test Invalid Rating
```bash
curl -X PUT http://localhost:3000/api/bookings/BOOKING_ID/rate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ALICE_TOKEN" \
  -d '{
    "rating": 10
  }'
```

Expected Response:
- Status: 400
- Error message about invalid rating

## Using Postman Collection

Import the `Motorcycle-Booking-API.postman_collection.json` file into Postman:

1. Open Postman
2. Click "Import" button
3. Select the JSON file
4. Set the `baseUrl` variable to `http://localhost:3000/api`
5. After logging in, copy the token and set it in the `token` variable
6. Test all endpoints using the pre-configured requests

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGODB_URI in .env file
- Verify MongoDB port (default: 27017)

### Port Already in Use
- Change PORT in .env file
- Or kill the process using port 3000:
  ```bash
  lsof -ti:3000 | xargs kill
  ```

### JWT Token Expired
- Login again to get a new token
- Adjust JWT_EXPIRE in .env file for longer sessions

## Production Testing Checklist

- [ ] All endpoints return correct status codes
- [ ] Authentication works correctly
- [ ] Role-based authorization is enforced
- [ ] Data validation is working
- [ ] Error handling is appropriate
- [ ] Passwords are hashed
- [ ] JWT tokens are secure
- [ ] Database relationships are correct
- [ ] Rating system updates correctly
- [ ] Booking workflow is complete
- [ ] Admin can manage all entities

## Performance Testing

Test with multiple concurrent users:
```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test login endpoint
ab -n 100 -c 10 -p login.json -T application/json http://localhost:3000/api/auth/login
```

## Security Testing

- Test SQL injection attempts
- Test XSS attempts
- Test CSRF vulnerabilities
- Test rate limiting (if implemented)
- Test password complexity
- Verify sensitive data is not exposed

## Continuous Testing

Run tests after every code change:
```bash
npm run dev
```

Monitor logs for errors and warnings.
