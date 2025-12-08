require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/error');
const { apiLimiter } = require('./middleware/rateLimiter');

// Route files
const authRoutes = require('./routes/auth');
const riderRoutes = require('./routes/riders');
const bookingRoutes = require('./routes/bookings');
const adminRoutes = require('./routes/admin');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/riders', riderRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Motorcycle Ride Booking System API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
        updateProfile: 'PUT /api/auth/profile',
      },
      riders: {
        register: 'POST /api/riders/register',
        profile: 'GET /api/riders/profile',
        updateProfile: 'PUT /api/riders/profile',
        getAll: 'GET /api/riders',
        getById: 'GET /api/riders/:id',
      },
      bookings: {
        create: 'POST /api/bookings',
        myBookings: 'GET /api/bookings/my-bookings',
        riderBookings: 'GET /api/bookings/rider-bookings',
        available: 'GET /api/bookings/available',
        accept: 'PUT /api/bookings/:id/accept',
        updateStatus: 'PUT /api/bookings/:id/status',
        cancel: 'PUT /api/bookings/:id/cancel',
        rate: 'PUT /api/bookings/:id/rate',
        getById: 'GET /api/bookings/:id',
      },
      admin: {
        dashboard: 'GET /api/admin/dashboard',
        users: 'GET /api/admin/users',
        riders: 'GET /api/admin/riders',
        approveRider: 'PUT /api/admin/riders/:id/approval',
        toggleUserStatus: 'PUT /api/admin/users/:id/status',
        bookings: 'GET /api/admin/bookings',
        deleteUser: 'DELETE /api/admin/users/:id',
      },
    },
  });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;
