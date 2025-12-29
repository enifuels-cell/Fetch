# Fetch - Motorcycle Ride Booking System

A complete Laravel-based motorcycle ride-sharing platform with real-time location tracking, automated rider matching, and instant push notifications.

## Features

### Core Features
- **User Registration & Authentication**: Separate roles for passengers and riders
- **Location-Based Rider Matching**: Automatically finds the closest available riders within a configurable radius
- **Real-Time Notifications**: Instant push notifications to nearby riders using Pusher
- **Booking Management**: Create, accept, and track ride bookings
- **Fare Calculation**: Automatic fare calculation based on distance and estimated time
- **Rating & Reviews**: Passengers and riders can rate each other after completed rides
- **Online Status**: Riders can toggle online/offline status with real-time location updates

### Technical Features
- RESTful API with Sanctum authentication
- WebSocket support via Pusher for real-time updates
- Database-backed queue system
- Comprehensive error handling
- Soft deletes for data integrity
- Geolocation distance calculation using Haversine formula

## Project Structure

```
fetch/
├── app/
│   ├── Http/
│   │   └── Controllers/
│   │       └── Api/
│   │           ├── AuthController.php          # User authentication
│   │           ├── BookingController.php        # Booking management
│   │           ├── LocationController.php       # Location & rider status
│   │           ├── NotificationController.php   # Notification management
│   │           └── ReviewController.php         # Reviews & ratings
│   ├── Models/
│   │   ├── User.php                             # User model (passenger/rider)
│   │   ├── Booking.php                          # Booking model
│   │   ├── Notification.php                     # Notification model
│   │   └── Review.php                           # Review model
│   ├── Services/
│   │   ├── RiderMatchingService.php             # Core matching algorithm
│   │   ├── NotificationService.php              # Push notification handler
│   │   └── FareCalculationService.php           # Fare calculation logic
├── database/
│   └── migrations/
│       ├── *_create_users_table.php
│       ├── *_create_bookings_table.php
│       ├── *_create_notifications_table.php
│       └── *_create_reviews_table.php
├── routes/
│   └── api.php                                  # API routes
├── config/
│   ├── broadcasting.php                         # Pusher configuration
│   └── queue.php                                # Queue configuration
└── .env.example                                 # Environment template
```

## Database Schema

### Users Table
- `id`: Primary key
- `role`: enum('passenger', 'rider')
- `name`, `email`, `password`: Authentication
- `phone_number`: Contact information
- `latitude`, `longitude`: Current location
- `is_online`: Online status (riders only)
- `rating`: Average rating (1-5)
- `total_rides`: Total completed rides

### Bookings Table
- `id`: Primary key
- `passenger_id`: Foreign key to users
- `rider_id`: Foreign key to users (nullable)
- `pickup_latitude/longitude`: Pickup location
- `dropoff_latitude/longitude`: Dropoff location (nullable)
- `status`: enum(pending, notified, accepted, in_transit, completed, cancelled)
- `estimated_fare`, `actual_fare`: Pricing
- `booking_time`, `accepted_time`, `completed_time`: Timestamps

### Notifications Table
- `id`: Primary key
- `booking_id`: Foreign key to bookings
- `recipient_id`: Foreign key to users
- `type`: enum(booking_request, booking_accepted, rider_arriving, ride_completed)
- `title`, `message`: Notification content
- `data`: JSON payload with additional details
- `read_at`: Read timestamp

### Reviews Table
- `id`: Primary key
- `booking_id`: Foreign key to bookings
- `reviewer_id`: Foreign key to users
- `reviewee_id`: Foreign key to users
- `rating`: 1-5 scale
- `comment`: Optional review text

## API Endpoints

### Authentication
```
POST   /api/auth/register        - Register new user
POST   /api/auth/login           - Login user
POST   /api/auth/logout          - Logout user (requires auth)
GET    /api/auth/me              - Get current user (requires auth)
```

### Bookings
```
POST   /api/bookings                    - Create new booking
GET    /api/bookings/{booking}          - Get booking details
POST   /api/bookings/{booking}/accept   - Accept a booking (rider only)
POST   /api/bookings/{booking}/cancel   - Cancel a booking (passenger only)
GET    /api/bookings/my-bookings        - Get user's bookings
```

### Location
```
POST   /api/location/update            - Update current location
GET    /api/location/nearby-riders     - Find nearby available riders
POST   /api/location/go-online         - Go online (rider only)
POST   /api/location/go-offline        - Go offline (rider only)
```

### Notifications
```
GET    /api/notifications              - Get user's notifications
POST   /api/notifications/{id}/read    - Mark notification as read
POST   /api/notifications/mark-all-read - Mark all as read
GET    /api/notifications/unread-count - Get unread count
```

### Reviews
```
POST   /api/reviews                    - Submit a review
GET    /api/reviews/user/{userId}      - Get user's reviews
```

## Installation & Setup

### Quick Setup Options

Choose the setup method that works best for you:

1. **[XAMPP Setup (Windows - Recommended for Beginners)](XAMPP_SETUP.md)** - Complete guide for Windows users using XAMPP
2. **[Windows Setup (Manual)](WINDOWS_SETUP.md)** - Manual Windows installation or Docker
3. **[Quick Start (Linux/Mac)](QUICK_START.md)** - Fast setup for Unix-based systems
4. **[Detailed Setup Guide](SETUP.md)** - Comprehensive setup instructions

### Prerequisites
- PHP 8.1+
- MySQL 5.7+
- Composer
- Node.js & npm (optional, for frontend)
- Pusher account (for real-time notifications)

### Quick Installation Steps

1. **Clone/Download the project**
   ```bash
   cd fetch
   ```

2. **Install dependencies**
   ```bash
   composer install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. **Database setup**
   ```bash
   php artisan migrate
   ```

5. **Configure Pusher** (in `.env`)
   ```
   PUSHER_APP_ID=your_app_id
   PUSHER_APP_KEY=your_app_key
   PUSHER_APP_SECRET=your_app_secret
   PUSHER_APP_CLUSTER=mt1
   ```

6. **Start the development server**
   ```bash
   php artisan serve
   ```

The API will be available at `http://localhost:8000/api`

For **XAMPP users**, see the [XAMPP Setup Guide](XAMPP_SETUP.md) for detailed instructions including virtual host configuration.

## Rider Matching Algorithm

The `RiderMatchingService` uses the Haversine formula to calculate distances between riders and passenger locations:

1. Finds all online riders with no active bookings
2. Calculates distance using GPS coordinates
3. Filters riders within 15km radius (configurable)
4. Sorts by distance (closest first)
5. Notifies top 5 closest riders via Pusher

## Fare Calculation

The `FareCalculationService` calculates fares using:
- Base fare: $2.50
- Distance rate: $1.50 per km
- Time rate: $0.30 per minute
- Minimum fare: $5.00

Formula: `Total = $2.50 + (distance × $1.50) + (estimated_minutes × $0.30)`

## Real-Time Notifications

Notifications are sent via Pusher to user-specific channels (`user.{user_id}`):

```json
{
  "notification_id": 1,
  "type": "booking_request",
  "title": "New Ride Request",
  "message": "New ride request from John Doe at Market Street",
  "data": {
    "booking_id": 5,
    "passenger_name": "John Doe",
    "passenger_rating": 4.8,
    "pickup_address": "Market Street",
    "distance_km": 2.5,
    "estimated_fare": 8.75
  },
  "timestamp": "2024-12-12T10:30:00Z"
}
```

## Testing the System

### Register Users
```bash
# Register as passenger
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "phone_number": "1234567890",
    "role": "passenger"
  }'

# Register as rider
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "phone_number": "0987654321",
    "role": "rider"
  }'
```

### Create a Booking
```bash
curl -X POST http://localhost:8000/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pickup_latitude": 40.7128,
    "pickup_longitude": -74.0060,
    "pickup_address": "123 Main Street",
    "dropoff_latitude": 40.7589,
    "dropoff_longitude": -73.9851,
    "dropoff_address": "Times Square",
    "special_instructions": "Please call when you arrive"
  }'
```

### Go Online (Rider)
```bash
curl -X POST http://localhost:8000/api/location/go-online \
  -H "Authorization: Bearer YOUR_RIDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 40.7128,
    "longitude": -74.0060
  }'
```

## Next Steps / Enhancements

- [ ] Payment integration (Stripe/PayPal)
- [ ] Chat messaging between passengers and riders
- [ ] Map integration with route optimization
- [ ] Ride history and analytics
- [ ] Admin dashboard
- [ ] Mobile app (React Native/Flutter)
- [ ] Emergency SOS feature
- [ ] Surge pricing during peak hours
- [ ] Scheduled bookings
- [ ] Multiple language support

## License

This project is open source and available under the MIT license.

## Support

For issues, questions, or feature requests, please contact the development team.
