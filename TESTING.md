# Fetch System Testing Guide

This guide provides comprehensive testing procedures to verify that both the backend API and frontend application are working correctly.

## Prerequisites

Before testing, ensure:
- Backend API is running (`php artisan serve`)
- Database is migrated (`php artisan migrate`)
- Queue worker is running (`php artisan queue:work database`)
- Frontend dev server is running (`npm run dev` in frontend directory)
- Pusher credentials are configured (optional for basic testing)

## Backend API Testing

### 1. Health Check

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{"status": "ok"}
```

### 2. User Registration

**Register a Passenger:**
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Passenger",
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "phone_number": "1234567890",
    "role": "passenger"
  }'
```

**Register a Rider:**
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Rider",
    "email": "jane@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "phone_number": "0987654321",
    "role": "rider"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {...},
    "token": "1|xxx..."
  }
}
```

**Save the tokens for subsequent requests!**

### 3. User Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 4. Get Current User

```bash
curl http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Rider Goes Online

```bash
curl -X POST http://localhost:8000/api/location/go-online \
  -H "Authorization: Bearer RIDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 40.7128,
    "longitude": -74.0060
  }'
```

### 6. Create a Booking (Passenger)

```bash
curl -X POST http://localhost:8000/api/bookings \
  -H "Authorization: Bearer PASSENGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pickup_latitude": 40.7128,
    "pickup_longitude": -74.0060,
    "pickup_address": "123 Main Street, New York",
    "dropoff_latitude": 40.7589,
    "dropoff_longitude": -73.9851,
    "dropoff_address": "Times Square, New York",
    "special_instructions": "Please call when you arrive"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Booking created and riders notified",
  "data": {
    "booking": {...},
    "nearby_riders_count": 1
  }
}
```

### 7. Get Notifications (Rider)

```bash
curl http://localhost:8000/api/notifications \
  -H "Authorization: Bearer RIDER_TOKEN"
```

### 8. Accept Booking (Rider)

```bash
curl -X POST http://localhost:8000/api/bookings/1/accept \
  -H "Authorization: Bearer RIDER_TOKEN"
```

### 9. Get My Bookings

**Passenger:**
```bash
curl http://localhost:8000/api/bookings/my-bookings \
  -H "Authorization: Bearer PASSENGER_TOKEN"
```

**Rider:**
```bash
curl http://localhost:8000/api/bookings/my-bookings \
  -H "Authorization: Bearer RIDER_TOKEN"
```

### 10. Cancel Booking (Passenger)

```bash
curl -X POST http://localhost:8000/api/bookings/1/cancel \
  -H "Authorization: Bearer PASSENGER_TOKEN"
```

## Frontend Testing

### 1. Access the Application

Navigate to `http://localhost:5173` in your browser.

### 2. Test User Registration

**Passenger Registration:**
1. Click "Sign up" link
2. Fill in form:
   - Name: "Test Passenger"
   - Email: "passenger@test.com"
   - Phone: "1234567890"
   - Role: "Passenger"
   - Password: "password123"
   - Confirm Password: "password123"
3. Click "Sign Up"
4. Should redirect to passenger dashboard

**Rider Registration:**
1. Logout (if logged in)
2. Click "Sign up" link
3. Fill in form with role "Rider"
4. Click "Sign Up"
5. Should redirect to rider dashboard

### 3. Test User Login

1. Click "Sign in" link (or logout first)
2. Enter email and password
3. Click "Sign In"
4. Should redirect to appropriate dashboard

### 4. Test Passenger Dashboard

**View Dashboard:**
- Should see "Welcome, [Name]" header
- Should see "Passenger" role badge
- Should see "Book a Ride" button

**Create Booking:**
1. Click "Book a Ride"
2. Fill in pickup coordinates (or click "Use Current Location")
   - Latitude: 40.7128
   - Longitude: -74.0060
   - Address: "123 Main St"
3. Fill in dropoff (optional):
   - Latitude: 40.7589
   - Longitude: -73.9851
   - Address: "Times Square"
4. Add special instructions (optional)
5. Click "Create Booking"
6. Should see success message
7. Booking should appear in "My Bookings" section

**View Bookings:**
- Should see all bookings with status badges
- Should see booking details (pickup, dropoff, fare)
- Should see rider info (if accepted)

**Cancel Booking:**
1. Find pending booking
2. Click "Cancel Booking"
3. Confirm cancellation
4. Booking status should update

### 5. Test Rider Dashboard

**View Dashboard:**
- Should see "Welcome, [Name]" header
- Should see "Rider" role badge with rating
- Should see stats cards (total rides, rating, notifications, status)
- Should see "Offline" button

**Go Online:**
1. Click "⚫ Offline" button
2. Browser may request location permission - allow it
3. Button should change to "🟢 Online"
4. Should see success message

**Receive Notifications:**
1. With rider online, create a booking from passenger account
2. Rider should receive notification in notifications panel
3. Should see notification details (distance, fare, passenger info)
4. Should see "Accept Booking" button

**Accept Booking:**
1. Click "Accept Booking" in notification
2. Confirm acceptance
3. Booking should appear in "My Accepted Bookings"
4. Should see passenger details and contact info

**View Accepted Bookings:**
- Should see all accepted bookings
- Should see passenger name, phone, rating
- Should see pickup/dropoff addresses
- Should see estimated fare

**Go Offline:**
1. Click "🟢 Online" button
2. Should change to "⚫ Offline"
3. Will stop receiving new booking requests

### 6. Test Real-time Notifications

**With Pusher configured:**
1. Open rider dashboard in one browser/tab
2. Open passenger dashboard in another browser/tab (or incognito)
3. Ensure rider is online
4. Create booking from passenger
5. Rider should receive real-time notification immediately
6. Accept booking from rider
7. Passenger should receive acceptance notification immediately

**Browser Notifications:**
1. Grant notification permissions when prompted
2. Real-time notifications should trigger browser notifications
3. Click notification to focus app

### 7. Test Responsive Design

**Desktop (>768px):**
- Multi-column layouts should display
- Stats in grid format
- Booking cards in grid
- Full navigation visible

**Tablet (640px-768px):**
- Adjusted grid columns
- Responsive forms
- Proper spacing

**Mobile (<640px):**
- Single column layouts
- Stacked forms
- Mobile-optimized buttons
- Proper touch targets

Test by resizing browser window or using browser dev tools device emulation.

## Integration Testing Workflow

Complete end-to-end user journey:

### Scenario 1: Successful Booking Flow

1. **Setup:**
   - Register rider and passenger accounts
   - Login as rider and go online

2. **Booking Creation:**
   - Login as passenger (different browser/incognito)
   - Create new booking with valid locations
   - Verify booking appears in passenger's list

3. **Notification:**
   - Verify rider receives notification
   - Check notification contains correct details

4. **Acceptance:**
   - Rider accepts the booking
   - Verify passenger receives acceptance notification
   - Verify booking appears in rider's accepted list

5. **Completion:**
   - Verify both users can see booking details
   - Verify status updates correctly

### Scenario 2: Booking Cancellation

1. Create booking as passenger
2. Before rider accepts, cancel the booking
3. Verify status changes to "cancelled"
4. Verify booking still visible in history

### Scenario 3: Multiple Riders

1. Register multiple riders (3-5)
2. Have all riders go online at different locations
3. Create booking from passenger
4. Verify nearest riders (within 15km) receive notifications
5. First rider to accept should get the booking
6. Verify other riders' notifications handled properly

## Error Testing

### Invalid Credentials
- Try login with wrong password
- Try login with non-existent email
- Verify error messages display correctly

### Validation Errors
- Submit registration with mismatched passwords
- Submit booking with invalid coordinates
- Try to accept already accepted booking
- Verify validation messages

### Authorization Errors
- Try to accept booking as passenger
- Try to create booking as logged out user
- Try to access other user's bookings
- Verify proper error responses

### Network Errors
- Stop backend server
- Try frontend operations
- Verify graceful error handling
- Restart server and verify recovery

## Performance Testing

### Backend Load Testing

Use Apache Bench or similar tools:

```bash
# Test authentication endpoint
ab -n 1000 -c 10 -p login.json -T application/json \
  http://localhost:8000/api/auth/login

# Test bookings endpoint (with auth token)
ab -n 500 -c 5 -H "Authorization: Bearer TOKEN" \
  http://localhost:8000/api/bookings/my-bookings
```

### Frontend Performance

1. Open browser DevTools
2. Navigate to Performance/Lighthouse tab
3. Run audit
4. Check scores for:
   - Performance (should be >80)
   - Accessibility (should be >90)
   - Best Practices (should be >80)
   - SEO (should be >80)

## Security Testing

### CSRF Protection
- Verify CSRF tokens on state-changing requests
- Test without proper authentication headers

### SQL Injection
- Try booking with malicious SQL in address fields
- Verify proper escaping/sanitization

### XSS Prevention
- Try inserting JavaScript in text fields
- Verify output is properly escaped

### Token Security
- Verify tokens expire appropriately
- Verify logout removes tokens
- Verify invalid tokens rejected

## Browser Compatibility

Test in multiple browsers:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

Test features:
- Authentication
- Form submission
- Real-time notifications
- Geolocation API
- Browser notifications
- Responsive layouts

## Troubleshooting Common Issues

### Backend Not Responding
```bash
# Check if server is running
curl http://localhost:8000/health

# Restart Laravel server
php artisan serve
```

### Frontend Not Loading
```bash
# Check if dev server is running
curl http://localhost:5173

# Restart frontend
cd frontend && npm run dev
```

### Database Connection Error
```bash
# Check database is running
mysql -u root -p

# Run migrations
php artisan migrate

# Check .env database credentials
```

### Queue Not Processing
```bash
# Start queue worker
php artisan queue:work database

# Check failed jobs
php artisan queue:failed
```

### Notifications Not Working
```bash
# Check Pusher credentials in .env
# Verify queue worker is running
# Check browser console for WebSocket errors
```

## Test Checklist

Use this checklist to ensure complete testing:

### Backend API
- [ ] Health check endpoint works
- [ ] User registration (passenger and rider)
- [ ] User login and token generation
- [ ] User logout
- [ ] Get current user profile
- [ ] Rider can go online/offline
- [ ] Passenger can create bookings
- [ ] Riders receive notifications
- [ ] Riders can accept bookings
- [ ] Passengers can cancel bookings
- [ ] Get booking details
- [ ] List user's bookings
- [ ] Notifications API endpoints

### Frontend Application
- [ ] Login page works
- [ ] Registration page works
- [ ] Passenger dashboard displays
- [ ] Rider dashboard displays
- [ ] Create booking form works
- [ ] Geolocation button works
- [ ] Booking list displays
- [ ] Cancel booking works
- [ ] Online/offline toggle works
- [ ] Accept booking works
- [ ] Real-time notifications work
- [ ] Browser notifications work
- [ ] Logout works
- [ ] Protected routes work
- [ ] Responsive design works

### Integration
- [ ] End-to-end booking flow
- [ ] Real-time updates between users
- [ ] Multiple riders scenario
- [ ] Booking cancellation
- [ ] Error handling
- [ ] Token persistence

### Performance
- [ ] Frontend loads quickly
- [ ] API responses fast
- [ ] Real-time updates immediate
- [ ] Build size optimized

### Security
- [ ] Authentication required
- [ ] Authorization enforced
- [ ] Input validation
- [ ] XSS prevention
- [ ] CSRF protection

## Conclusion

After completing all tests, you should have confidence that:
1. Backend API is functioning correctly
2. Frontend application works as expected
3. Real-time features operate properly
4. System handles errors gracefully
5. Security measures are in place
6. Performance is acceptable

For any issues found during testing, refer to the relevant documentation:
- **Backend Issues**: See SETUP.md, API_DOCUMENTATION.md
- **Frontend Issues**: See FRONTEND.md, frontend/README.md
- **Deployment Issues**: See DEPLOYMENT.md
