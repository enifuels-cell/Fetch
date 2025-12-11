# Fetch Frontend Documentation

## Overview

The Fetch frontend is a modern React-based single-page application (SPA) that provides an intuitive interface for both passengers and riders to interact with the ride-booking system.

## Technology Stack

- **React 18.3** - Modern React with Hooks
- **Vite 7.2** - Fast build tool and dev server
- **React Router DOM 7.1** - Client-side routing
- **Axios 1.7** - Promise-based HTTP client
- **Pusher JS 8.4** - Real-time WebSocket notifications

## Project Architecture

### Directory Structure

```
frontend/
├── public/                    # Static files
├── src/
│   ├── components/            # Reusable React components
│   │   └── PrivateRoute.jsx   # Authentication guard
│   ├── contexts/              # React Context providers
│   │   └── AuthContext.jsx    # Authentication state management
│   ├── pages/                 # Page components (routes)
│   │   ├── Login.jsx          # Login page
│   │   ├── Register.jsx       # Registration page
│   │   ├── Dashboard.jsx      # Dashboard router
│   │   ├── PassengerDashboard.jsx  # Passenger interface
│   │   ├── RiderDashboard.jsx      # Rider interface
│   │   ├── Auth.css           # Authentication pages styles
│   │   └── Dashboard.css      # Dashboard styles
│   ├── services/              # API and external services
│   │   ├── api.js             # API client and endpoints
│   │   └── pusher.js          # Pusher WebSocket setup
│   ├── utils/                 # Utility functions
│   ├── App.jsx                # Main application component
│   ├── App.css                # App-level styles
│   ├── main.jsx               # Application entry point
│   └── index.css              # Global CSS reset and base styles
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
├── index.html                 # HTML template
├── package.json               # Dependencies and scripts
├── vite.config.js             # Vite configuration
└── README.md                  # Frontend documentation
```

## Getting Started

### Prerequisites

1. **Node.js 16+** - JavaScript runtime
2. **npm** - Package manager
3. **Backend API** - Laravel Fetch API must be running
4. **Pusher Account** - For real-time notifications (optional but recommended)

### Installation

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` file:
   ```env
   VITE_API_URL=http://localhost:8000/api
   VITE_PUSHER_KEY=your_pusher_app_key
   VITE_PUSHER_CLUSTER=mt1
   ```

### Development Server

Start the development server with hot module replacement:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Build

Build optimized production files:

```bash
npm run build
```

Build output will be in the `dist/` directory.

Preview production build locally:

```bash
npm run preview
```

## Features

### Authentication System

#### Login
- Email and password authentication
- JWT token-based sessions
- Automatic token storage in localStorage
- Remember me functionality
- Error handling and validation

#### Registration
- User registration for passengers and riders
- Form validation (email, password strength, etc.)
- Role selection (passenger/rider)
- Phone number collection
- Automatic login after registration

#### Auth Context
- Global authentication state
- Automatic token refresh
- User profile management
- Role-based access control
- Logout functionality

### Passenger Dashboard

#### Features
- **Book New Rides**
  - Manual coordinate entry
  - Geolocation API integration for current location
  - Pickup and dropoff locations
  - Special instructions field
  - Real-time fare estimation

- **Booking Management**
  - View all bookings (past and present)
  - Booking status tracking (pending, notified, accepted, in_transit, completed)
  - Cancel pending bookings
  - View assigned rider information
  - Booking history

- **Real-time Updates**
  - Receive booking acceptance notifications
  - Status change alerts
  - Rider arrival notifications
  - Ride completion confirmations

### Rider Dashboard

#### Features
- **Online/Offline Status**
  - Toggle availability with one click
  - Automatic location tracking when online
  - Visual status indicator
  - Location permission handling

- **Booking Requests**
  - Real-time incoming booking notifications
  - Distance from pickup location
  - Passenger information and rating
  - Estimated fare display
  - One-click accept functionality

- **Active Rides**
  - View all accepted bookings
  - Passenger contact information
  - Pickup and dropoff details
  - Special instructions
  - Navigation information

- **Stats Dashboard**
  - Total rides completed
  - Average rating
  - Unread notification count
  - Online status

### Real-time Notifications

#### Pusher Integration
- WebSocket connection to Pusher
- User-specific channels (`user.{user_id}`)
- Real-time event handling
- Automatic reconnection

#### Browser Notifications
- Desktop notification support
- Permission request handling
- Custom notification icons
- Sound alerts (configurable)

#### Notification Types
- `booking_request` - New ride request for riders
- `booking_accepted` - Ride accepted by rider
- `rider_arriving` - Rider approaching pickup
- `ride_completed` - Ride finished

## API Integration

### Base Configuration

The frontend uses Axios for HTTP requests with:
- Base URL from environment variable
- Automatic JWT token injection
- Response/request interceptors
- Error handling

### Endpoints Used

#### Authentication
```javascript
POST /api/auth/register     // User registration
POST /api/auth/login        // User login
POST /api/auth/logout       // User logout
GET  /api/auth/me           // Get current user
```

#### Bookings
```javascript
POST /api/bookings                     // Create booking
GET  /api/bookings/{id}                // Get booking details
POST /api/bookings/{id}/accept         // Accept booking (rider)
POST /api/bookings/{id}/cancel         // Cancel booking (passenger)
GET  /api/bookings/my-bookings         // Get user's bookings
```

#### Location
```javascript
POST /api/location/update              // Update location
GET  /api/location/nearby-riders       // Find nearby riders
POST /api/location/go-online           // Go online (rider)
POST /api/location/go-offline          // Go offline (rider)
```

#### Notifications
```javascript
GET  /api/notifications                // Get all notifications
POST /api/notifications/{id}/read      // Mark as read
POST /api/notifications/mark-all-read  // Mark all as read
GET  /api/notifications/unread-count   // Get unread count
```

## State Management

### Auth Context

Manages global authentication state:
- User profile data
- Authentication status
- Login/logout functions
- Token management
- Loading states

### Component State

Local state managed with React Hooks:
- Form data (useState)
- Loading indicators (useState)
- Error messages (useState)
- Real-time notifications (useState)

## Styling

### Design System

#### Colors
- **Primary**: `#667eea` (Purple)
- **Secondary**: `#764ba2` (Deep Purple)
- **Success**: `#10b981` (Green)
- **Danger**: `#ef4444` (Red)
- **Gray Scale**: `#111827` to `#f3f4f6`

#### Typography
- **Font Family**: Inter, system-ui, sans-serif
- **Headings**: Bold, large sizes
- **Body**: Regular weight, readable sizes
- **Labels**: Semi-bold, small caps

#### Components
- **Cards**: White background, rounded corners, subtle shadows
- **Buttons**: Gradient fills, hover effects, disabled states
- **Forms**: Clear labels, focus states, validation feedback
- **Badges**: Rounded pills, color-coded by status

### Responsive Design

- **Mobile First**: Base styles for mobile
- **Breakpoints**:
  - Mobile: < 640px
  - Tablet: 640px - 768px
  - Desktop: > 768px
- **Grid Layouts**: Auto-responsive with CSS Grid
- **Flexible Containers**: Flexbox for alignment

## User Flows

### Passenger Flow

1. **Registration/Login**
   - Navigate to login/register page
   - Enter credentials and role
   - Automatic redirect to dashboard

2. **Book a Ride**
   - Click "Book a Ride" button
   - Enter pickup location (or use current location)
   - Enter dropoff location
   - Add special instructions
   - Submit booking

3. **Track Booking**
   - View booking status in real-time
   - Receive notifications when rider accepts
   - View rider details
   - Track ride progress

4. **Complete Ride**
   - Receive completion notification
   - View final fare
   - Rate and review rider (optional)

### Rider Flow

1. **Registration/Login**
   - Register as rider
   - Login to dashboard

2. **Go Online**
   - Click "Go Online" button
   - Grant location permissions
   - Receive online confirmation

3. **Receive Requests**
   - Notification appears for new booking
   - View passenger details and distance
   - Accept or ignore request

4. **Complete Ride**
   - Navigate to pickup location
   - Pick up passenger
   - Navigate to dropoff
   - Complete ride
   - Receive rating from passenger

## Error Handling

### Network Errors
- Connection timeout handling
- Retry logic for failed requests
- Offline mode detection
- User-friendly error messages

### Validation Errors
- Form field validation
- Real-time feedback
- Server-side error display
- Clear error messages

### Authentication Errors
- Token expiration handling
- Automatic logout on 401
- Redirect to login page
- Session timeout warnings

## Performance Optimization

### Code Splitting
- Route-based code splitting
- Lazy loading of components
- Dynamic imports

### Build Optimization
- Vite's fast build pipeline
- Tree shaking unused code
- Minification and compression
- Asset optimization

### Runtime Optimization
- React.memo for expensive components
- useCallback for event handlers
- useMemo for computed values
- Debounced API calls

## Security

### Token Management
- Secure token storage (localStorage)
- Automatic token injection
- Token expiration handling
- Logout on invalid token

### Data Validation
- Client-side form validation
- XSS prevention
- CSRF token handling (via API)
- Input sanitization

### HTTPS/SSL
- Enforce HTTPS in production
- Secure WebSocket connections
- Mixed content prevention

## Testing

### Manual Testing Checklist

#### Authentication
- [ ] Register as passenger
- [ ] Register as rider
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Logout functionality
- [ ] Token persistence

#### Passenger Features
- [ ] Create new booking
- [ ] Use current location
- [ ] View booking list
- [ ] Cancel booking
- [ ] Receive notifications

#### Rider Features
- [ ] Toggle online/offline
- [ ] Receive booking requests
- [ ] Accept booking
- [ ] View accepted bookings
- [ ] Check stats

#### UI/UX
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Form validation
- [ ] Loading states
- [ ] Error messages
- [ ] Navigation

## Deployment

### Build for Production

```bash
# Build optimized files
npm run build

# Preview build locally
npm run preview
```

### Deploy to Static Hosting

The `dist/` folder contains static files that can be deployed to:
- **Netlify**: Drag and drop `dist/` folder
- **Vercel**: Connect GitHub repo
- **AWS S3**: Upload to S3 bucket
- **GitHub Pages**: Push to gh-pages branch
- **Any static host**: Upload `dist/` contents

### Environment Configuration

Update production environment variables:
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_PUSHER_KEY=production_pusher_key
VITE_PUSHER_CLUSTER=mt1
```

### Deployment Steps

1. Update `.env` with production values
2. Build the application: `npm run build`
3. Test the build: `npm run preview`
4. Deploy `dist/` folder to hosting
5. Configure domain and SSL
6. Test production deployment

## Troubleshooting

### Common Issues

#### API Connection Failed
**Problem**: Cannot connect to backend API
**Solutions**:
- Check `VITE_API_URL` in `.env`
- Verify backend is running
- Check CORS configuration in Laravel
- Inspect browser console for errors

#### Notifications Not Working
**Problem**: Real-time notifications not appearing
**Solutions**:
- Verify Pusher credentials
- Check WebSocket connection in browser dev tools
- Ensure queue worker is running on backend
- Check browser notification permissions

#### Build Errors
**Problem**: Build fails or shows errors
**Solutions**:
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear build cache: `rm -rf dist`
- Update dependencies: `npm update`
- Check Node.js version: `node --version`

#### Location Services Not Working
**Problem**: Cannot get current location
**Solutions**:
- Grant browser location permissions
- Use HTTPS (required for geolocation)
- Check browser console for errors
- Provide manual coordinate entry option

### Debug Mode

Enable detailed logging:
```javascript
// Add to .env
VITE_DEBUG=true
```

Check console logs for:
- API requests/responses
- WebSocket messages
- State changes
- Error details

## Browser Compatibility

| Browser | Minimum Version |
|---------|----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |
| Opera | 76+ |

## Contributing

### Code Style
- Use functional components with Hooks
- Follow React best practices
- Use meaningful variable names
- Add comments for complex logic
- Keep components small and focused

### Git Workflow
1. Create feature branch
2. Make changes
3. Test thoroughly
4. Commit with clear messages
5. Submit pull request

## Support

For issues, questions, or feature requests:
- Check this documentation
- Review backend API documentation
- Check browser console for errors
- Contact development team

## License

This frontend application is part of the Fetch project and follows the same license terms.
