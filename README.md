# Fetch - Motorcycle Ride Booking System

A full-featured motorcycle ride booking system with role-based authentication (Users, Riders, and Admins).

## Features

- **User Management**: Users can register, login, and book motorcycle rides
- **Rider Management**: Riders can register with vehicle details, accept bookings, and manage rides
- **Admin Panel**: Admins can manage users, approve riders, and oversee all bookings
- **Booking System**: Complete booking workflow from creation to completion with rating system
- **Authentication**: JWT-based authentication with role-based access control

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Encryption**: bcryptjs

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Fetch
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/motorcycle-booking
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
```

4. Start MongoDB (if running locally):
```bash
mongod
```

5. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "role": "user" // Options: "user", "rider", "admin"
}

Response:
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "user",
    "isApproved": true
  }
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

Body:
{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "user",
    "isApproved": true
  }
}
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer <token>

Response:
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "user",
    "isApproved": true,
    "isActive": true
  }
}
```

#### Update Profile
```
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "name": "John Updated",
  "phone": "+0987654321"
}
```

### Rider Endpoints

#### Register as Rider
```
POST /api/riders/register
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "licenseNumber": "DL123456",
  "vehicleType": "sport", // Options: scooter, standard, sport, cruiser, touring
  "vehicleBrand": "Yamaha",
  "vehicleModel": "R15",
  "vehicleYear": 2023,
  "plateNumber": "ABC-1234"
}

Response:
{
  "success": true,
  "message": "Rider registration submitted. Waiting for admin approval.",
  "rider": { ... }
}
```

#### Get Rider Profile
```
GET /api/riders/profile
Authorization: Bearer <token> (Rider only)

Response:
{
  "success": true,
  "rider": { ... }
}
```

#### Update Rider Profile
```
PUT /api/riders/profile
Authorization: Bearer <token> (Rider only)
Content-Type: application/json

Body:
{
  "vehicleType": "cruiser",
  "isAvailable": true
}
```

#### Get Available Riders
```
GET /api/riders
Authorization: Bearer <token>

Response:
{
  "success": true,
  "count": 5,
  "riders": [ ... ]
}
```

#### Get Rider by ID
```
GET /api/riders/:id
Authorization: Bearer <token>
```

### Booking Endpoints

#### Create Booking
```
POST /api/bookings
Authorization: Bearer <token> (User only)
Content-Type: application/json

Body:
{
  "pickupLocation": {
    "address": "123 Main St, City",
    "coordinates": {
      "lat": 40.7128,
      "lng": -74.0060
    }
  },
  "dropoffLocation": {
    "address": "456 Oak Ave, City",
    "coordinates": {
      "lat": 40.7580,
      "lng": -73.9855
    }
  },
  "scheduledTime": "2024-01-15T10:00:00Z",
  "fare": 25.50,
  "distance": 5.2,
  "duration": 15,
  "passengerCount": 1,
  "notes": "Please call when you arrive"
}

Response:
{
  "success": true,
  "booking": { ... }
}
```

#### Get My Bookings
```
GET /api/bookings/my-bookings
Authorization: Bearer <token> (User only)

Response:
{
  "success": true,
  "count": 3,
  "bookings": [ ... ]
}
```

#### Get Rider Bookings
```
GET /api/bookings/rider-bookings
Authorization: Bearer <token> (Rider only)

Response:
{
  "success": true,
  "count": 10,
  "bookings": [ ... ]
}
```

#### Get Available Bookings (for Riders)
```
GET /api/bookings/available
Authorization: Bearer <token> (Rider only)

Response:
{
  "success": true,
  "count": 5,
  "bookings": [ ... ]
}
```

#### Accept Booking
```
PUT /api/bookings/:id/accept
Authorization: Bearer <token> (Rider only)

Response:
{
  "success": true,
  "booking": { ... }
}
```

#### Update Booking Status
```
PUT /api/bookings/:id/status
Authorization: Bearer <token> (Rider only)
Content-Type: application/json

Body:
{
  "status": "in-progress" // Options: "in-progress", "completed"
}
```

#### Cancel Booking
```
PUT /api/bookings/:id/cancel
Authorization: Bearer <token> (User only)

Response:
{
  "success": true,
  "booking": { ... }
}
```

#### Rate Booking
```
PUT /api/bookings/:id/rate
Authorization: Bearer <token> (User only)
Content-Type: application/json

Body:
{
  "rating": 5,
  "review": "Great ride!"
}
```

#### Get Booking by ID
```
GET /api/bookings/:id
Authorization: Bearer <token>
```

### Admin Endpoints

#### Get Dashboard Statistics
```
GET /api/admin/dashboard
Authorization: Bearer <token> (Admin only)

Response:
{
  "success": true,
  "stats": {
    "totalUsers": 50,
    "totalRiders": 20,
    "pendingRiders": 5,
    "totalBookings": 100,
    "pendingBookings": 10,
    "completedBookings": 80
  }
}
```

#### Get All Users
```
GET /api/admin/users
Authorization: Bearer <token> (Admin only)

Response:
{
  "success": true,
  "count": 50,
  "users": [ ... ]
}
```

#### Get All Riders
```
GET /api/admin/riders
Authorization: Bearer <token> (Admin only)

Response:
{
  "success": true,
  "count": 20,
  "riders": [ ... ]
}
```

#### Approve/Reject Rider
```
PUT /api/admin/riders/:id/approval
Authorization: Bearer <token> (Admin only)
Content-Type: application/json

Body:
{
  "isApproved": true
}

Response:
{
  "success": true,
  "message": "Rider approved successfully",
  "rider": { ... }
}
```

#### Toggle User Status (Activate/Deactivate)
```
PUT /api/admin/users/:id/status
Authorization: Bearer <token> (Admin only)

Response:
{
  "success": true,
  "message": "User activated successfully",
  "user": { ... }
}
```

#### Get All Bookings
```
GET /api/admin/bookings
Authorization: Bearer <token> (Admin only)

Response:
{
  "success": true,
  "count": 100,
  "bookings": [ ... ]
}
```

#### Delete User
```
DELETE /api/admin/users/:id
Authorization: Bearer <token> (Admin only)

Response:
{
  "success": true,
  "message": "User deleted successfully"
}
```

## Database Models

### User Model
- name
- email (unique)
- password (hashed)
- phone
- role (user, rider, admin)
- isActive
- isApproved
- createdAt

### Rider Model
- user (reference to User)
- licenseNumber (unique)
- vehicleType
- vehicleBrand
- vehicleModel
- vehicleYear
- plateNumber (unique)
- isAvailable
- rating
- totalRides
- documents
- createdAt

### Booking Model
- user (reference to User)
- rider (reference to Rider)
- pickupLocation
- dropoffLocation
- scheduledTime
- status (pending, confirmed, in-progress, completed, cancelled)
- fare
- distance
- duration
- passengerCount
- notes
- rating
- review
- createdAt
- updatedAt

## User Roles and Permissions

### User
- Register and login
- Create bookings
- View own bookings
- Cancel bookings (if not completed)
- Rate completed bookings

### Rider
- All user permissions
- Register as rider (requires admin approval)
- View available bookings
- Accept bookings
- Update booking status (in-progress, completed)
- View assigned bookings

### Admin
- All permissions
- View dashboard statistics
- Manage all users
- Approve/reject rider applications
- View all bookings
- Activate/deactivate users
- Delete users

## Booking Workflow

1. **User creates booking** → Status: `pending`
2. **Rider accepts booking** → Status: `confirmed`
3. **Rider starts ride** → Status: `in-progress`
4. **Rider completes ride** → Status: `completed`
5. **User rates the ride** → Rider rating updated

Alternative: User can cancel booking at any time before completion

## Testing the API

You can test the API using tools like:
- Postman
- cURL
- Thunder Client (VS Code extension)
- Insomnia

### Example cURL Commands

Register a user:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "+1234567890",
    "role": "user"
  }'
```

Login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

Create booking (replace TOKEN with actual JWT):
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "pickupLocation": {
      "address": "123 Main St"
    },
    "dropoffLocation": {
      "address": "456 Oak Ave"
    },
    "scheduledTime": "2024-01-15T10:00:00Z",
    "fare": 25.50
  }'
```

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Role-based access control
- Protected routes
- Input validation
- Error handling

## Project Structure

```
Fetch/
├── config/
│   └── database.js          # Database connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── riderController.js   # Rider management
│   ├── bookingController.js # Booking management
│   └── adminController.js   # Admin operations
├── middleware/
│   ├── auth.js              # Authentication & authorization
│   └── error.js             # Error handling
├── models/
│   ├── User.js              # User schema
│   ├── Rider.js             # Rider schema
│   └── Booking.js           # Booking schema
├── routes/
│   ├── auth.js              # Auth routes
│   ├── riders.js            # Rider routes
│   ├── bookings.js          # Booking routes
│   └── admin.js             # Admin routes
├── utils/
│   └── jwt.js               # JWT utilities
├── .env                     # Environment variables
├── .env.example             # Environment template
├── .gitignore               # Git ignore rules
├── package.json             # Dependencies
├── server.js                # Entry point
└── README.md                # Documentation
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

ISC

## Support

For issues and questions, please create an issue in the repository.