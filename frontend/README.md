# Fetch Frontend - React Application

A modern React-based frontend application for the Fetch motorcycle ride-booking system.

## Features

- 🔐 **User Authentication** - Login and registration for passengers and riders
- 🚗 **Passenger Dashboard** - Book rides, track bookings, view history
- 🏍️ **Rider Dashboard** - Go online/offline, receive booking requests, manage accepted rides
- 🔔 **Real-time Notifications** - Pusher WebSocket integration for instant updates
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- 🎨 **Modern UI/UX** - Clean, intuitive interface with smooth animations

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API requests
- **Pusher JS** - Real-time WebSocket notifications
- **CSS3** - Modern styling with flexbox and grid

## Prerequisites

- Node.js 16+ and npm
- Backend API running (Laravel Fetch API)
- Pusher account for real-time notifications

## Installation

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

4. **Update `.env` with your settings:**
   ```env
   VITE_API_URL=http://localhost:8000/api
   VITE_PUSHER_KEY=your_pusher_key
   VITE_PUSHER_CLUSTER=mt1
   ```

## Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Building for Production

Create an optimized production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable components
│   │   └── PrivateRoute.jsx
│   ├── contexts/        # React contexts
│   │   └── AuthContext.jsx
│   ├── pages/           # Page components
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── PassengerDashboard.jsx
│   │   └── RiderDashboard.jsx
│   ├── services/        # API and service utilities
│   │   ├── api.js
│   │   └── pusher.js
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── .env.example         # Environment template
├── package.json         # Dependencies
└── vite.config.js       # Vite configuration
```

## Key Features

### Authentication
- JWT token-based authentication
- Automatic token refresh
- Protected routes
- Role-based access (passenger/rider)

### Passenger Features
- Create new ride bookings
- Use current location via Geolocation API
- View booking history
- Cancel pending bookings
- Real-time status updates

### Rider Features
- Toggle online/offline status
- Receive real-time booking requests
- Accept bookings
- View accepted rides
- Track earnings and ratings

### Real-time Updates
- WebSocket notifications via Pusher
- Browser notifications
- Automatic booking list refresh
- Live status changes

## API Integration

The frontend communicates with the Laravel backend API:

- **Base URL:** `http://localhost:8000/api`
- **Authentication:** Bearer token in Authorization header
- **Format:** JSON requests and responses

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000/api` |
| `VITE_PUSHER_KEY` | Pusher application key | Required |
| `VITE_PUSHER_CLUSTER` | Pusher cluster | `mt1` |

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### API Connection Issues
- Verify backend API is running
- Check `VITE_API_URL` in `.env`
- Ensure CORS is properly configured in Laravel

### Notifications Not Working
- Verify Pusher credentials in `.env`
- Check browser console for errors
- Ensure WebSocket connections are not blocked

### Build Errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear build cache: `rm -rf dist`
- Check Node.js version: `node --version`

## License

This project is part of the Fetch system and follows the same license.

## Support

For issues or questions, refer to the main project documentation or contact the development team.
