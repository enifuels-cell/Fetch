# Fetch - Quick Start Guide

## System Overview

Fetch is a complete Laravel motorcycle ride-sharing platform that connects passengers with nearby available riders using real-time location tracking and instant notifications.

### Key Components

1. **User Management**: Register and manage passengers and riders
2. **Location Tracking**: Real-time GPS location updates
3. **Smart Rider Matching**: Automatic distance-based rider selection
4. **Real-Time Notifications**: Instant Pusher notifications to nearby riders
5. **Booking Management**: Complete booking lifecycle
6. **Rating System**: Peer-to-peer reviews and ratings
7. **Fare Calculation**: Automatic pricing based on distance and time

---

## Getting Started

### 1. Environment Setup

```bash
# Copy environment file
cp .env.example .env

# Generate app key
php artisan key:generate
```

Edit `.env` and configure:
- Database credentials (MySQL)
- Pusher credentials (for real-time notifications)
- App URL

### 2. Database Setup

```bash
# Run migrations
php artisan migrate

# Seed test data (optional)
php artisan db:seed
```

### 3. Start Development Server

```bash
# Start Laravel dev server
php artisan serve

# In another terminal, start queue worker (for notifications)
php artisan queue:work database
```

The API will be available at: `http://localhost:8000/api`

---

## How It Works: Step-by-Step Flow

### Scenario: A Passenger Books a Ride

#### Step 1: Passenger Creates Booking
```bash
curl -X POST http://localhost:8000/api/bookings \
  -H "Authorization: Bearer {passenger_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "pickup_latitude": 40.7128,
    "pickup_longitude": -74.0060,
    "pickup_address": "123 Main Street",
    "dropoff_latitude": 40.7589,
    "dropoff_longitude": -73.9851,
    "dropoff_address": "Times Square"
  }'
```

**What Happens:**
1. Booking record is created with status `pending`
2. Fare is estimated using FareCalculationService
3. RiderMatchingService finds nearby riders
4. Booking status changes to `notified`

#### Step 2: Riders Get Notified (Real-Time via Pusher)

The system automatically finds all online riders within 15km and sends them notifications:

```javascript
// Riders receive this via Pusher on channel: user.{rider_id}
{
  "notification_id": 1,
  "type": "booking_request",
  "title": "New Ride Request",
  "message": "New ride request from John Doe at 123 Main Street",
  "data": {
    "booking_id": 1,
    "passenger_name": "John Doe",
    "passenger_rating": 4.8,
    "pickup_address": "123 Main Street",
    "distance_km": 2.5,
    "estimated_fare": 12.50
  }
}
```

#### Step 3: Rider Accepts Booking

```bash
curl -X POST http://localhost:8000/api/bookings/{bookingId}/accept \
  -H "Authorization: Bearer {rider_token}"
```

**What Happens:**
1. Booking status changes to `accepted`
2. Rider is linked to the booking
3. Passenger is notified in real-time
4. Other nearby riders stop receiving notifications

#### Step 4: Ride Completion & Review

Once the ride is completed:

```bash
# Passenger rates the rider
curl -X POST http://localhost:8000/api/reviews \
  -H "Authorization: Bearer {passenger_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": 1,
    "rating": 5,
    "comment": "Great service!"
  }'
```

Rider's rating is automatically updated.

---

## Key Workflows

### For Riders

#### Going Online
```bash
curl -X POST http://localhost:8000/api/location/go-online \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 40.7128,
    "longitude": -74.0060
  }'
```

- Rider becomes visible to passengers
- Available for booking notifications
- Location is stored and updated

#### Finding Nearby Riders (from passenger app)
```bash
curl -X GET "http://localhost:8000/api/location/nearby-riders?latitude=40.7128&longitude=-74.0060&radius_km=15" \
  -H "Authorization: Bearer {token}"
```

Returns all online riders sorted by distance.

#### Going Offline
```bash
curl -X POST http://localhost:8000/api/location/go-offline \
  -H "Authorization: Bearer {token}"
```

---

## Database Relationships

```
User (Passenger/Rider)
├── Bookings (as passenger_id)
├── Bookings (as rider_id)
├── Notifications (as recipient_id)
├── Reviews (as reviewer_id)
└── Reviews (as reviewee_id)

Booking
├── Passenger (User)
├── Rider (User, nullable)
├── Notifications
└── Reviews

Notification
├── Booking
└── Recipient (User)

Review
├── Booking
├── Reviewer (User)
└── Reviewee (User)
```

---

## API Response Format

All API responses follow this structure:

### Success Response
```json
{
  "success": true,
  "message": "Optional message",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message"
}
```

---

## Booking Statuses

| Status | Description |
|--------|-------------|
| `pending` | Just created, searching for riders |
| `notified` | Nearby riders have been notified |
| `accepted` | A rider has accepted the booking |
| `rider_arriving` | Rider is on the way to pickup |
| `rider_arrived` | Rider arrived at pickup location |
| `in_transit` | Ride is in progress |
| `completed` | Ride finished |
| `cancelled` | Booking was cancelled |

---

## Real-Time Features

### Location Updates
Update location every 5-10 seconds:
```javascript
setInterval(async () => {
  navigator.geolocation.getCurrentPosition((position) => {
    fetch('/api/location/update', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      })
    });
  });
}, 5000);
```

### Listening for Notifications (Client-Side)
```javascript
// Install: npm install pusher-js

import Pusher from 'pusher-js';

const pusher = new Pusher('PUSHER_KEY', {
  cluster: 'mt1',
  authEndpoint: '/api/auth/broadcast',
  auth: {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
});

const channel = pusher.subscribe(`user.${userId}`);

channel.bind('booking-notification', function(notification) {
  console.log('New notification:', notification);
  // Handle notification: show alert, update UI, play sound, etc
});
```

---

## Configuration

### Pusher Setup

1. Create account at https://pusher.com
2. Create a new app
3. Update `.env`:
   ```
   PUSHER_APP_ID=your_app_id
   PUSHER_APP_KEY=your_app_key
   PUSHER_APP_SECRET=your_app_secret
   PUSHER_APP_CLUSTER=mt1
   ```

### Database Configuration

Edit `.env`:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=fetch
DB_USERNAME=root
DB_PASSWORD=your_password
```

---

## Testing Endpoints

### 1. Register Test Users

**Register Passenger:**
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Passenger",
    "email": "passenger@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "phone_number": "5551234567",
    "role": "passenger"
  }'
```

Save the returned token as `PASSENGER_TOKEN`.

**Register Rider:**
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Rider",
    "email": "rider@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "phone_number": "5559876543",
    "role": "rider"
  }'
```

Save the returned token as `RIDER_TOKEN`.

### 2. Rider Goes Online

```bash
curl -X POST http://localhost:8000/api/location/go-online \
  -H "Authorization: Bearer $RIDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 40.7130,
    "longitude": -74.0059
  }'
```

### 3. Passenger Creates Booking

```bash
curl -X POST http://localhost:8000/api/bookings \
  -H "Authorization: Bearer $PASSENGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pickup_latitude": 40.7128,
    "pickup_longitude": -74.0060,
    "pickup_address": "123 Main Street",
    "dropoff_latitude": 40.7589,
    "dropoff_longitude": -73.9851,
    "dropoff_address": "Times Square"
  }'
```

Save the returned `booking.id`.

### 4. Rider Accepts Booking

```bash
curl -X POST http://localhost:8000/api/bookings/{BOOKING_ID}/accept \
  -H "Authorization: Bearer $RIDER_TOKEN"
```

### 5. Check Notifications

```bash
curl -X GET http://localhost:8000/api/notifications \
  -H "Authorization: Bearer $RIDER_TOKEN"
```

---

## Common Issues & Solutions

### Notification Not Showing
- Ensure Pusher credentials are correct in `.env`
- Check queue is running: `php artisan queue:work database`
- Verify rider is online: Check `is_online` field in users table

### Riders Not Found Nearby
- Make sure riders have `is_online = 1`
- Verify locations are within 15km radius
- Check riders don't have active bookings

### Database Connection Error
- Verify MySQL is running
- Check `.env` database credentials
- Ensure database exists: `php artisan migrate`

### CORS Issues
- Configure CORS in `config/cors.php`
- Add frontend URL to allowed origins

---

## Production Deployment

1. Set `APP_ENV=production` in `.env`
2. Set `APP_DEBUG=false` in `.env`
3. Run `php artisan config:cache`
4. Set up proper database backups
5. Configure email service for notifications
6. Use proper web server (Nginx/Apache)
7. Set up SSL certificates
8. Configure queue workers for production

---

## Next Steps

1. **Frontend Development**: Build React/Vue mobile or web app
2. **Payment Integration**: Add Stripe/PayPal payment
3. **Chat Feature**: Implement real-time messaging
4. **Admin Dashboard**: Manage users, bookings, disputes
5. **Advanced Analytics**: Track rides, revenue, user metrics
6. **Mobile Apps**: iOS/Android native apps

---

## Support & Resources

- API Docs: See `API_DOCUMENTATION.md`
- Pusher Docs: https://pusher.com/docs
- Laravel Docs: https://laravel.com/docs
- Sanctum Auth: https://laravel.com/docs/sanctum
