# Proximity-Based Booking System

## Overview

The Fetch motorcycle booking system uses intelligent proximity-based matching to automatically connect users with the closest available riders. When a user creates a booking, the system calculates distances and notifies riders in order of proximity to the pickup location.

## How It Works

### 1. User Creates Booking

When a user creates a booking with pickup coordinates:

```json
POST /api/bookings
{
  "pickupLocation": {
    "address": "123 Main St, City",
    "coordinates": {
      "lat": 40.7128,
      "lng": -74.0060
    }
  },
  "dropoffLocation": { ... },
  "scheduledTime": "2024-01-15T10:00:00Z",
  "fare": 25.50
}
```

### 2. System Finds Closest Riders

The system automatically:
- Queries all available and approved riders
- Filters riders with known current locations
- Calculates distance from each rider to pickup location using Haversine formula
- Sorts riders by proximity
- Selects up to 5 closest riders

### 3. Notification Cascade

**Initial Notification:**
- The closest rider is notified first
- Booking shows in their "Available Bookings" list
- Other riders don't see this booking initially

**If Closest Rider Accepts:**
- Booking status changes to `confirmed`
- Booking is assigned to that rider
- Other notified riders no longer see it

**If Closest Rider Declines:**
- System automatically notifies the next closest rider
- Previous decline is recorded
- Process continues until a rider accepts

### 4. Rider Response Options

**Accept Booking:**
```
PUT /api/bookings/:id/accept
```
- Assigns booking to rider
- Changes status to confirmed
- Records acceptance in notification history

**Decline Booking:**
```
PUT /api/bookings/:id/decline
```
- Records decline in notification history
- Automatically notifies next closest rider
- Continues cascade until accepted

## Distance Calculation

### Haversine Formula

The system uses the Haversine formula to calculate great-circle distances between coordinates on Earth's surface:

```
a = sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlng/2)
c = 2 × atan2(√a, √(1-a))
distance = R × c
```

Where:
- R = Earth's radius (6,371 km)
- Δlat = difference in latitude
- Δlng = difference in longitude

### Distance in Kilometers

All distances are calculated in kilometers for consistency. This provides accurate ground distance between two points.

## Rider Location Updates

### Update Location

Riders must keep their location updated for accurate matching:

```
PUT /api/riders/location
{
  "lat": 40.7128,
  "lng": -74.0060
}
```

**Best Practices:**
- Update location every few minutes when available
- Update when starting shift
- Update after completing each ride
- System validates coordinates (-90 to 90 for lat, -180 to 180 for lng)

### Location Privacy

- User location is used only for pickup/dropoff
- Rider location is used only for proximity matching
- Locations are not shared between users and riders
- Admin can see locations for oversight only

## Booking Notification System

### Notification Data Structure

Each booking tracks notified riders:

```json
{
  "notifiedRiders": [
    {
      "riderId": "rider_object_id",
      "notifiedAt": "2024-01-15T10:00:00Z",
      "response": "pending"  // or "accepted" or "declined"
    }
  ]
}
```

### Response States

- **pending**: Rider has been notified, awaiting response
- **accepted**: Rider accepted the booking
- **declined**: Rider declined, system moved to next rider

## Available Bookings Logic

### What Riders See

Riders see bookings in their "Available Bookings" where:
1. They were explicitly notified, OR
2. Booking has no notified riders (manual assignment mode)

This prevents riders from accepting bookings intended for others.

### Filtering Example

```javascript
// Rider sees only relevant bookings
GET /api/bookings/available

// Returns bookings where:
// - Status is "pending"
// - No rider assigned yet
// - Current rider was notified OR no riders notified
```

## Admin Oversight

### Admin Capabilities

Admins can:
- View all bookings regardless of notification status
- See notification history for each booking
- See which riders were notified and their responses
- Manually intervene if needed

### Monitoring

Admins can track:
- Average response time per rider
- Decline rate per rider
- Distance between matched riders and users
- Booking success rate

## Example Workflow

### Scenario: User Books a Ride

1. **User submits booking**
   - Pickup: Manhattan, NY (40.7580, -73.9855)
   - 3 riders are available:
     - Rider A: 2.3 km away
     - Rider B: 4.1 km away  
     - Rider C: 7.8 km away

2. **System notifies Rider A** (closest)
   - Rider A sees booking in available list
   - Riders B and C don't see it yet

3. **Rider A declines**
   - System records decline
   - Automatically notifies Rider B (next closest)
   - Rider A no longer sees booking

4. **Rider B accepts**
   - Booking assigned to Rider B
   - Status changes to confirmed
   - Rider C never gets notified (booking filled)

5. **Booking proceeds**
   - Rider B picks up user
   - Updates status to in-progress
   - Completes ride
   - User rates Rider B

## Benefits

### For Users
- Faster pickup times (closest rider responds first)
- More reliable service (automatic fallback to next rider)
- Better experience (matched with nearby riders)

### For Riders
- Fair distribution (closest gets first opportunity)
- No notification spam (only see relevant bookings)
- Clear workflow (accept or decline, system handles rest)

### For System
- Efficient matching algorithm
- Automated fallback mechanism
- Trackable decision history
- Scalable architecture

## Configuration

### Proximity Settings

Current defaults (can be adjusted in code):
- Maximum riders notified per booking: 5
- Distance calculation method: Haversine
- Distance unit: Kilometers
- Coordinate validation: Standard lat/lng ranges

### Future Enhancements

Potential improvements:
- Configurable radius limits (e.g., don't notify riders >10km away)
- Priority based on rider ratings
- Time-based notification expiry
- Real-time push notifications
- WebSocket for instant updates
- Machine learning for optimal matching

## API Reference

### Related Endpoints

**Rider Location:**
- `PUT /api/riders/location` - Update current location

**Booking Management:**
- `POST /api/bookings` - Create booking (triggers proximity matching)
- `GET /api/bookings/available` - Get bookings for current rider
- `PUT /api/bookings/:id/accept` - Accept a booking
- `PUT /api/bookings/:id/decline` - Decline and cascade to next rider

**Admin Oversight:**
- `GET /api/admin/bookings` - View all bookings with notification history
- `GET /api/admin/riders` - View all riders with locations

## Testing the Feature

### Test Setup

1. Create multiple rider accounts
2. Approve riders as admin
3. Update each rider's location to different coordinates
4. Create a booking as a user with pickup coordinates

### Verification

- Check which rider sees the booking first
- Verify others don't see it initially
- Test decline functionality
- Confirm cascade to next rider
- Verify acceptance stops cascade

### Test Locations

Example coordinates for testing:
- New York: 40.7128, -74.0060
- Los Angeles: 34.0522, -118.2437
- Chicago: 41.8781, -87.6298

## Troubleshooting

### Issue: No riders notified

**Possible causes:**
- No riders have current location set
- No approved riders available
- Booking missing pickup coordinates

**Solution:**
- Ensure riders update location via `/api/riders/location`
- Check rider approval status
- Include coordinates in booking creation

### Issue: All riders see the booking

**Possible causes:**
- Booking has empty notifiedRiders array
- System in fallback mode

**Solution:**
- Normal behavior for bookings without coordinates
- Update booking creation to include pickup coordinates

### Issue: Decline doesn't cascade

**Possible causes:**
- No other riders available
- All nearby riders already notified

**Solution:**
- System will inform that no other riders available
- User may need to cancel and try later

## Security & Privacy

- Location data stored securely in database
- Only current location stored (not historical)
- Coordinate validation prevents injection
- Authorization required for location updates
- Riders cannot see other riders' locations
- Users cannot see rider locations directly

## Performance Considerations

- Distance calculation: O(n) where n = number of available riders
- Typically very fast (< 100ms for 100 riders)
- Database indexes on isAvailable and coordinates
- Efficient sorting algorithm
- Minimal memory footprint

## Conclusion

The proximity-based booking system provides an intelligent, automated, and fair way to match users with the closest available riders, improving service quality and user satisfaction while maintaining simplicity for all parties involved.
