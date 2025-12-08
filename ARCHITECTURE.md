# Motorcycle Booking System - Architecture Documentation

## System Overview

The Motorcycle Booking System is a RESTful API built with Node.js and Express that enables users to book motorcycle rides, riders to accept and fulfill bookings, and administrators to manage the entire system.

## Architecture Pattern

**Pattern**: MVC (Model-View-Controller) with RESTful API

```
┌─────────────┐
│   Client    │ (Mobile/Web App)
└──────┬──────┘
       │ HTTP/JSON
       ▼
┌─────────────────────────────────────┐
│         Express Server              │
│  ┌──────────────────────────────┐  │
│  │       Middleware Layer       │  │
│  │  - CORS                      │  │
│  │  - Body Parser               │  │
│  │  - Authentication (JWT)      │  │
│  │  - Authorization (Roles)     │  │
│  │  - Error Handler             │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │       Routes Layer           │  │
│  │  - /api/auth                 │  │
│  │  - /api/riders               │  │
│  │  - /api/bookings             │  │
│  │  - /api/admin                │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │     Controllers Layer        │  │
│  │  - Business Logic            │  │
│  │  - Request Validation        │  │
│  │  - Response Formatting       │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │       Models Layer           │  │
│  │  - User Model                │  │
│  │  - Rider Model               │  │
│  │  - Booking Model             │  │
│  └──────────────────────────────┘  │
└──────────┬──────────────────────────┘
           │ Mongoose ODM
           ▼
    ┌──────────────┐
    │   MongoDB    │
    └──────────────┘
```

## Database Schema

### Collections and Relationships

```
┌────────────────────┐
│       Users        │
│ ─────────────────  │
│ _id (ObjectId)     │◄───────┐
│ name (String)      │        │
│ email (String)*    │        │
│ password (Hash)    │        │  1:1
│ phone (String)     │        │
│ role (Enum)        │        │
│ isActive (Bool)    │        │
│ isApproved (Bool)  │        │
│ createdAt (Date)   │        │
└────────────────────┘        │
                              │
┌────────────────────┐        │
│      Riders        │        │
│ ─────────────────  │        │
│ _id (ObjectId)     │        │
│ user (ObjectId) ───┼────────┘
│ licenseNumber*     │
│ vehicleType        │        ┌────────────────────┐
│ vehicleBrand       │        │     Bookings       │
│ vehicleModel       │◄───┐   │ ─────────────────  │
│ vehicleYear        │    │   │ _id (ObjectId)     │
│ plateNumber*       │    │   │ user (ObjectId) ───┼──┐
│ isAvailable        │    │   │ rider (ObjectId) ──┼──┘
│ rating             │    └───│ pickupLocation     │
│ totalRides         │     1:N│ dropoffLocation    │
│ createdAt          │        │ scheduledTime      │
└────────────────────┘        │ status (Enum)      │
                              │ fare               │
                              │ distance           │
                              │ duration           │
                              │ passengerCount     │
                              │ rating             │
                              │ review             │
                              │ createdAt          │
                              │ updatedAt          │
                              └────────────────────┘

* = Unique constraint
```

## User Roles and Permissions

### Role Hierarchy

```
┌──────────────────────────────────────────────────┐
│                    Admin                         │
│  - Full system access                            │
│  - User management                               │
│  - Rider approval                                │
│  - System oversight                              │
└────────────────┬─────────────────────────────────┘
                 │
      ┌──────────┴──────────┐
      │                     │
┌─────▼─────────────┐  ┌────▼────────────────┐
│      Rider        │  │       User          │
│  - Accept bookings│  │  - Create bookings  │
│  - Manage rides   │  │  - View bookings    │
│  - Update status  │  │  - Rate rides       │
│  - View earnings  │  │  - Cancel bookings  │
└───────────────────┘  └─────────────────────┘
```

### Permission Matrix

| Action                  | User | Rider | Admin |
|------------------------|------|-------|-------|
| Register               | ✓    | ✓     | ✓     |
| Login                  | ✓    | ✓     | ✓     |
| Create Booking         | ✓    | ✗     | ✗     |
| View Own Bookings      | ✓    | ✗     | ✗     |
| Cancel Booking         | ✓    | ✗     | ✗     |
| Rate Booking           | ✓    | ✗     | ✗     |
| Apply as Rider         | ✓    | ✓     | ✗     |
| View Available Bookings| ✗    | ✓*    | ✗     |
| Accept Booking         | ✗    | ✓*    | ✗     |
| Update Booking Status  | ✗    | ✓*    | ✗     |
| View Rider Bookings    | ✗    | ✓*    | ✗     |
| View Dashboard         | ✗    | ✗     | ✓     |
| Approve Riders         | ✗    | ✗     | ✓     |
| Manage Users           | ✗    | ✗     | ✓     |
| View All Bookings      | ✗    | ✗     | ✓     |
| Delete Users           | ✗    | ✗     | ✓     |

*Requires admin approval

## Booking Workflow State Machine

```
┌─────────┐
│  User   │
│ Creates │
│ Booking │
└────┬────┘
     │
     ▼
┌──────────┐     Rider Accepts    ┌───────────┐
│ PENDING  ├────────────────────►│ CONFIRMED │
└────┬─────┘                      └─────┬─────┘
     │                                  │
     │ User Cancels                     │ Rider Starts
     │                                  ▼
     │                          ┌──────────────┐
     │                          │ IN-PROGRESS  │
     │                          └──────┬───────┘
     │                                 │
     │                                 │ Rider Completes
     │                                 ▼
     │                          ┌─────────────┐
     └─────────────────────────►│  COMPLETED  │◄──┐
                                └─────────────┘   │
                                                  │
                          ┌──────────────┐        │
                          │  CANCELLED   ├────────┘
                          └──────────────┘

Status Values:
- PENDING: Waiting for rider acceptance
- CONFIRMED: Rider assigned, waiting for pickup
- IN-PROGRESS: Ride in progress
- COMPLETED: Ride finished
- CANCELLED: Booking cancelled by user
```

## Authentication Flow

```
┌───────────┐
│  Client   │
└─────┬─────┘
      │ POST /api/auth/register or /api/auth/login
      │ { email, password }
      ▼
┌─────────────────┐
│  Auth Handler   │
│  - Validate     │
│  - Hash Password│
│  - Create User  │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│  JWT Generator  │
│  - Create Token │
│  - Set Expiry   │
└─────┬───────────┘
      │ Returns: { token, user }
      ▼
┌───────────┐
│  Client   │ Stores token
└─────┬─────┘
      │
      │ Subsequent requests
      │ Header: Authorization: Bearer <token>
      ▼
┌─────────────────┐
│  Auth Middleware│
│  - Verify Token │
│  - Check Expiry │
│  - Load User    │
│  - Check Role   │
└─────┬───────────┘
      │ req.user = user
      ▼
┌─────────────────┐
│  Route Handler  │
└─────────────────┘
```

## API Request Flow

```
1. Client Request
   │
   ▼
2. Express Server
   │
   ▼
3. CORS Middleware
   │
   ▼
4. Body Parser
   │
   ▼
5. Authentication Middleware (if protected route)
   │
   ▼
6. Authorization Middleware (if role-specific)
   │
   ▼
7. Route Handler
   │
   ▼
8. Controller
   │  - Validate input
   │  - Business logic
   │  - Database operations
   │
   ▼
9. Model (Mongoose)
   │
   ▼
10. MongoDB
    │
    ▼
11. Response back through stack
    │
    ▼
12. Error Handler (if error occurs)
    │
    ▼
13. Client receives response
```

## Security Measures

### 1. Password Security
- Passwords hashed using bcrypt (salt rounds: 10)
- Never stored in plain text
- Not included in API responses

### 2. Authentication
- JWT (JSON Web Tokens) for stateless authentication
- Tokens expire after 7 days (configurable)
- Bearer token authentication scheme

### 3. Authorization
- Role-based access control (RBAC)
- Middleware checks for required roles
- Admin role has elevated privileges

### 4. Input Validation
- Express-validator for request validation
- Mongoose schema validation
- Email format validation
- Required field checking

### 5. Database Security
- MongoDB connection string in environment variables
- Unique constraints on sensitive fields
- ObjectId validation to prevent injection

### 6. Error Handling
- Custom error handler middleware
- Sensitive error details hidden in production
- Consistent error response format

## Scalability Considerations

### Current Architecture
- Monolithic Node.js application
- Single MongoDB instance
- Suitable for small to medium scale

### Future Scaling Options

#### 1. Horizontal Scaling
```
Load Balancer
     │
     ├── App Instance 1
     ├── App Instance 2
     └── App Instance 3
          │
          └── MongoDB Cluster
```

#### 2. Microservices Architecture
```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Auth Service │  │ Ride Service │  │ User Service │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                  │
       └─────────────────┴──────────────────┘
                         │
                    API Gateway
```

#### 3. Caching Layer
```
Client → API → Redis Cache → MongoDB
```

#### 4. Message Queue for Async Tasks
```
API → RabbitMQ/Redis → Worker Processes
                           │
                           └── Email, Notifications, etc.
```

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **ODM**: Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Environment**: dotenv
- **CORS**: cors
- **Validation**: express-validator

### Development
- **Dev Server**: nodemon

## Project Structure

```
Fetch/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── authController.js    # Auth business logic
│   ├── riderController.js   # Rider management
│   ├── bookingController.js # Booking operations
│   └── adminController.js   # Admin functions
├── middleware/
│   ├── auth.js              # JWT & role checking
│   └── error.js             # Error handling
├── models/
│   ├── User.js              # User schema
│   ├── Rider.js             # Rider schema
│   └── Booking.js           # Booking schema
├── routes/
│   ├── auth.js              # Auth endpoints
│   ├── riders.js            # Rider endpoints
│   ├── bookings.js          # Booking endpoints
│   └── admin.js             # Admin endpoints
├── scripts/
│   └── createAdmin.js       # Admin user setup
├── utils/
│   └── jwt.js               # JWT utilities
├── .env                     # Environment config
├── server.js                # Entry point
├── package.json             # Dependencies
└── README.md                # Documentation
```

## API Design Principles

### RESTful Design
- Resource-based URLs
- HTTP methods for operations (GET, POST, PUT, DELETE)
- Stateless communication
- Standard HTTP status codes

### Response Format
```json
{
  "success": true|false,
  "data": { ... },      // or "message": "..."
  "count": 10           // for list endpoints
}
```

### Error Format
```json
{
  "success": false,
  "message": "Error description"
}
```

### Status Codes
- 200: Success (GET, PUT)
- 201: Created (POST)
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

## Performance Optimizations

### Current
- Mongoose query optimization
- Index on frequently queried fields
- Selective field population

### Future Improvements
- Redis caching for frequent queries
- Database query optimization
- Connection pooling
- Response compression
- Rate limiting

## Monitoring and Logging

### Current
- Console logging
- Error logging

### Recommended Additions
- Winston for structured logging
- Morgan for HTTP request logging
- PM2 for process management
- APM tools (New Relic, DataDog)
- Health check endpoints

## Deployment Considerations

### Environment Variables
- Keep secrets in environment variables
- Different configs for dev/staging/production
- Never commit .env files

### Production Checklist
- [ ] Change default admin password
- [ ] Use strong JWT secret
- [ ] Enable HTTPS
- [ ] Set NODE_ENV=production
- [ ] Configure proper CORS origins
- [ ] Set up database backups
- [ ] Implement rate limiting
- [ ] Add logging and monitoring
- [ ] Use process manager (PM2)
- [ ] Set up CI/CD pipeline

### Hosting Options
- **Traditional**: AWS EC2, DigitalOcean, Linode
- **PaaS**: Heroku, Railway, Render
- **Serverless**: AWS Lambda, Vercel
- **Container**: Docker + Kubernetes

## Testing Strategy

### Unit Tests
- Model validation
- Utility functions
- Middleware logic

### Integration Tests
- API endpoint testing
- Database operations
- Authentication flows

### E2E Tests
- Complete user journeys
- Booking workflows
- Admin operations

### Recommended Tools
- Jest for unit/integration tests
- Supertest for API testing
- MongoDB Memory Server for test database

## Future Enhancements

### Features
- Real-time location tracking
- In-app chat between user and rider
- Payment integration (Stripe, PayPal)
- Push notifications
- Ride scheduling
- Pricing algorithm based on distance/time
- Surge pricing
- Referral system
- Promo codes
- Ride history analytics
- Rider earnings dashboard

### Technical
- GraphQL API option
- WebSocket for real-time updates
- File upload for documents/photos
- Email notifications (SendGrid, SES)
- SMS notifications (Twilio)
- Multi-language support
- Mobile app (React Native)
- Admin web dashboard (React, Vue)

## Contributing Guidelines

1. Fork the repository
2. Create feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Follow existing code style
6. Update documentation
7. Submit pull request

## License

ISC License - See LICENSE file for details
