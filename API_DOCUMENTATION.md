# Fetch API Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication
The API uses Laravel Sanctum for authentication. Include the token in the Authorization header:
```
Authorization: Bearer {token}
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "phone_number": "+1234567890",
  "role": "passenger"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone_number": "+1234567890",
      "role": "passenger",
      "rating": 5.0,
      "is_online": false
    },
    "token": "1|abcdef123456..."
  }
}
```

**Validations:**
- `name`: Required, string, max 255
- `email`: Required, unique, valid email
- `password`: Required, min 8, must be confirmed
- `phone_number`: Required, string
- `role`: Required, must be 'passenger' or 'rider'

---

### Login
**POST** `/auth/login`

Authenticate a user and receive a token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "passenger",
      "rating": 5.0,
      "is_online": false
    },
    "token": "1|abcdef123456..."
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

### Logout
**POST** `/auth/logout`

Logout and invalidate the current token.

**Headers:** Requires authentication

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### Get Current User
**GET** `/auth/me`

Retrieve the authenticated user's profile.

**Headers:** Requires authentication

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone_number": "+1234567890",
    "role": "passenger",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "is_online": false,
    "rating": 5.0,
    "total_rides": 0
  }
}
```

---

## Booking Endpoints

### Create Booking
**POST** `/bookings`

Create a new ride booking. Automatically finds and notifies nearby riders.

**Headers:** Requires authentication (passenger)

**Request Body:**
```json
{
  "pickup_latitude": 40.7128,
  "pickup_longitude": -74.0060,
  "pickup_address": "123 Main Street, New York",
  "dropoff_latitude": 40.7589,
  "dropoff_longitude": -73.9851,
  "dropoff_address": "Times Square, New York",
  "special_instructions": "Please call when you arrive",
  "vehicle_type": "motorcycle"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Booking created and riders notified",
  "data": {
    "booking": {
      "id": 1,
      "passenger_id": 1,
      "rider_id": null,
      "pickup_latitude": 40.7128,
      "pickup_longitude": -74.0060,
      "pickup_address": "123 Main Street, New York",
      "dropoff_latitude": 40.7589,
      "dropoff_longitude": -73.9851,
      "dropoff_address": "Times Square, New York",
      "status": "notified",
      "booking_time": "2024-12-12T10:30:00Z",
      "estimated_fare": 12.50,
      "vehicle_type": "motorcycle"
    },
    "nearby_riders_count": 3
  }
}
```

**Validations:**
- `pickup_latitude`: Required, numeric, between -90 and 90
- `pickup_longitude`: Required, numeric, between -180 and 180
- `pickup_address`: Required, string
- `dropoff_latitude`: Optional, numeric, between -90 and 90
- `dropoff_longitude`: Optional, numeric, between -180 and 180
- `dropoff_address`: Optional, string
- `special_instructions`: Optional, string
- `vehicle_type`: Optional, must be 'motorcycle'

---

### Get Booking Details
**GET** `/bookings/{bookingId}`

Retrieve detailed information about a specific booking.

**Headers:** Requires authentication

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "passenger_id": 1,
    "rider_id": 2,
    "pickup_latitude": 40.7128,
    "pickup_longitude": -74.0060,
    "pickup_address": "123 Main Street, New York",
    "dropoff_latitude": 40.7589,
    "dropoff_longitude": -73.9851,
    "dropoff_address": "Times Square, New York",
    "status": "in_transit",
    "booking_time": "2024-12-12T10:30:00Z",
    "accepted_time": "2024-12-12T10:32:00Z",
    "estimated_fare": 12.50,
    "actual_fare": null,
    "special_instructions": "Please call when you arrive",
    "passenger": {
      "id": 1,
      "name": "John Doe",
      "rating": 4.8,
      "phone_number": "+1234567890"
    },
    "rider": {
      "id": 2,
      "name": "Jane Smith",
      "rating": 4.9,
      "phone_number": "+0987654321"
    },
    "notifications": [...]
  }
}
```

---

### Accept Booking
**POST** `/bookings/{bookingId}/accept`

Accept a booking request. Only available to riders.

**Headers:** Requires authentication (rider)

**Response (200):**
```json
{
  "success": true,
  "message": "Booking accepted successfully",
  "data": {
    "id": 1,
    "passenger_id": 1,
    "rider_id": 2,
    "status": "accepted",
    "accepted_time": "2024-12-12T10:32:00Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Booking cannot be accepted in its current status"
}
```

---

### Cancel Booking
**POST** `/bookings/{bookingId}/cancel`

Cancel a booking. Only passengers can cancel their own bookings.

**Headers:** Requires authentication

**Response (200):**
```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "id": 1,
    "status": "cancelled",
    "cancellation_count": 1
  }
}
```

---

### Get My Bookings
**GET** `/bookings/my-bookings`

Retrieve all bookings for the authenticated user (paginated).

**Headers:** Requires authentication

**Query Parameters:**
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 15)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "passenger_id": 1,
        "rider_id": 2,
        "status": "completed",
        "booking_time": "2024-12-12T10:30:00Z"
      }
    ],
    "current_page": 1,
    "per_page": 15,
    "total": 5
  }
}
```

---

## Location Endpoints

### Update Location
**POST** `/location/update`

Update the current user's location.

**Headers:** Requires authentication

**Request Body:**
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Location updated successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "last_location_update": "2024-12-12T10:45:00Z"
  }
}
```

---

### Get Nearby Riders
**GET** `/location/nearby-riders`

Find available riders near a specific location.

**Headers:** Requires authentication

**Query Parameters:**
```
latitude=40.7128&longitude=-74.0060&radius_km=15
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "name": "Jane Smith",
      "rating": 4.9,
      "total_rides": 125,
      "distance_km": 0.5,
      "latitude": 40.7130,
      "longitude": -74.0059
    },
    {
      "id": 3,
      "name": "Mike Johnson",
      "rating": 4.7,
      "total_rides": 89,
      "distance_km": 1.2,
      "latitude": 40.7150,
      "longitude": -74.0080
    }
  ]
}
```

---

### Go Online
**POST** `/location/go-online`

Set rider status to online. Only available to riders.

**Headers:** Requires authentication (rider)

**Request Body:**
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "You are now online",
  "data": {
    "id": 2,
    "name": "Jane Smith",
    "is_online": true,
    "latitude": 40.7128,
    "longitude": -74.0060,
    "last_location_update": "2024-12-12T10:45:00Z"
  }
}
```

---

### Go Offline
**POST** `/location/go-offline`

Set rider status to offline. Only available to riders.

**Headers:** Requires authentication (rider)

**Response (200):**
```json
{
  "success": true,
  "message": "You are now offline",
  "data": {
    "id": 2,
    "name": "Jane Smith",
    "is_online": false
  }
}
```

---

## Notification Endpoints

### Get My Notifications
**GET** `/notifications`

Retrieve user's notifications (paginated).

**Headers:** Requires authentication

**Query Parameters:**
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "booking_id": 1,
        "recipient_id": 2,
        "type": "booking_request",
        "title": "New Ride Request",
        "message": "New ride request from John Doe",
        "data": {
          "booking_id": 1,
          "passenger_name": "John Doe",
          "distance_km": 0.5,
          "estimated_fare": 12.50
        },
        "read_at": null,
        "sent_at": "2024-12-12T10:30:00Z"
      }
    ],
    "current_page": 1,
    "total": 5
  }
}
```

---

### Mark Notification as Read
**POST** `/notifications/{notificationId}/read`

Mark a specific notification as read.

**Headers:** Requires authentication

**Response (200):**
```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "id": 1,
    "read_at": "2024-12-12T10:46:00Z"
  }
}
```

---

### Mark All as Read
**POST** `/notifications/mark-all-read`

Mark all unread notifications as read.

**Headers:** Requires authentication

**Response (200):**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

### Get Unread Count
**GET** `/notifications/unread-count`

Get the count of unread notifications.

**Headers:** Requires authentication

**Response (200):**
```json
{
  "success": true,
  "data": {
    "unread_count": 3
  }
}
```

---

## Review Endpoints

### Submit Review
**POST** `/reviews`

Submit a review for a completed ride.

**Headers:** Requires authentication

**Request Body:**
```json
{
  "booking_id": 1,
  "rating": 5,
  "comment": "Great ride! Friendly driver and smooth trip."
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Review submitted successfully",
  "data": {
    "id": 1,
    "booking_id": 1,
    "reviewer_id": 1,
    "reviewee_id": 2,
    "rating": 5,
    "comment": "Great ride! Friendly driver and smooth trip.",
    "created_at": "2024-12-12T10:50:00Z"
  }
}
```

**Validations:**
- `booking_id`: Required, must exist and be completed
- `rating`: Required, integer between 1-5
- `comment`: Optional, string, max 1000 characters

---

### Get User Reviews
**GET** `/reviews/user/{userId}`

Get all reviews for a specific user (paginated).

**Headers:** Requires authentication

**Query Parameters:**
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "booking_id": 1,
        "reviewer_id": 1,
        "reviewee_id": 2,
        "rating": 5,
        "comment": "Great ride!",
        "reviewer": {
          "id": 1,
          "name": "John Doe"
        },
        "created_at": "2024-12-12T10:50:00Z"
      }
    ],
    "current_page": 1,
    "total": 25
  }
}
```

---

## Error Responses

### Validation Error (422)
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password must be at least 8 characters."]
  }
}
```

### Unauthorized (401)
```json
{
  "message": "Unauthenticated."
}
```

### Forbidden (403)
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

### Not Found (404)
```json
{
  "message": "Not found."
}
```

---

## Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Validation Error
- `500`: Server Error
