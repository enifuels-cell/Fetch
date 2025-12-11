import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { bookingAPI, locationAPI, notificationAPI } from '../services/api';
import { subscribeToUserChannel } from '../services/pusher';
import './Dashboard.css';

const RiderDashboard = () => {
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [isOnline, setIsOnline] = useState(user.is_online || false);
  const [location, setLocation] = useState({
    latitude: user.latitude || '',
    longitude: user.longitude || '',
  });
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchBookings();
    fetchNotifications();
    
    // Subscribe to real-time notifications
    const channel = subscribeToUserChannel(user.id, (data) => {
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);
      
      // Show browser notification
      if (Notification.permission === 'granted') {
        new Notification(data.title, {
          body: data.message,
          icon: '/motorcycle-icon.png',
        });
      }
      
      // Play sound
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {});
    });

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      if (channel) channel.unbind_all();
    };
  }, [user.id]);

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.myBookings();
      setBookings(response.data.data.data || []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const [notifsRes, countRes] = await Promise.all([
        notificationAPI.getAll(),
        notificationAPI.getUnreadCount(),
      ]);
      setNotifications(notifsRes.data.data || []);
      setUnreadCount(countRes.data.data || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coords = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            setLocation(coords);
            resolve(coords);
          },
          (error) => {
            reject(error);
          }
        );
      } else {
        reject(new Error('Geolocation not supported'));
      }
    });
  };

  const toggleOnlineStatus = async () => {
    try {
      if (!isOnline) {
        const coords = await getCurrentLocation();
        await locationAPI.goOnline(coords);
        setIsOnline(true);
        alert('You are now online and available for bookings!');
      } else {
        await locationAPI.goOffline();
        setIsOnline(false);
        alert('You are now offline.');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  const acceptBooking = async (bookingId) => {
    if (!confirm('Accept this booking?')) return;

    try {
      await bookingAPI.accept(bookingId);
      alert('Booking accepted! Contact the passenger to coordinate pickup.');
      fetchBookings();
      fetchNotifications();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to accept booking');
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>Welcome, {user.name}</h1>
            <p className="role-badge rider">Rider ⭐ {user.rating || 'N/A'}</p>
          </div>
          <div className="header-actions">
            <button
              onClick={toggleOnlineStatus}
              className={`btn ${isOnline ? 'btn-success' : 'btn-secondary'}`}
            >
              {isOnline ? '🟢 Online' : '⚫ Offline'}
            </button>
            <button onClick={logout} className="btn btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{user.total_rides || 0}</div>
            <div className="stat-label">Total Rides</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">⭐ {user.rating || 'N/A'}</div>
            <div className="stat-label">Rating</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{unreadCount}</div>
            <div className="stat-label">Unread Notifications</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {isOnline ? '🟢 Online' : '⚫ Offline'}
            </div>
            <div className="stat-label">Status</div>
          </div>
        </div>

        {!isOnline && (
          <div className="alert alert-info">
            <strong>You are currently offline.</strong>
            <p>Go online to start receiving booking requests from nearby passengers.</p>
          </div>
        )}

        {notifications.length > 0 && (
          <div className="notifications-section">
            <h2>
              🔔 Notifications 
              {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </h2>
            <div className="notifications-list">
              {notifications.slice(0, 5).map((notif) => (
                <div
                  key={notif.id}
                  className={`notification-card ${!notif.read_at ? 'unread' : ''}`}
                  onClick={() => !notif.read_at && markNotificationAsRead(notif.id)}
                >
                  <div className="notification-header">
                    <strong>{notif.title}</strong>
                    <span className="notification-time">
                      {new Date(notif.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p>{notif.message}</p>
                  {notif.data && notif.data.booking_id && (
                    <div className="notification-details">
                      <span>Booking #{notif.data.booking_id}</span>
                      {notif.data.distance_km && (
                        <span>📍 {notif.data.distance_km} km away</span>
                      )}
                      {notif.data.estimated_fare && (
                        <span>💰 ${notif.data.estimated_fare}</span>
                      )}
                    </div>
                  )}
                  {notif.type === 'booking_request' && notif.data?.booking_id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        acceptBooking(notif.data.booking_id);
                      }}
                      className="btn btn-primary btn-small"
                    >
                      Accept Booking
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bookings-section">
          <h2>My Accepted Bookings</h2>
          {bookings.length === 0 ? (
            <div className="empty-state">
              <p>No bookings yet. Go online to receive booking requests!</p>
            </div>
          ) : (
            <div className="bookings-grid">
              {bookings.map((booking) => (
                <div key={booking.id} className="booking-card">
                  <div className="booking-header">
                    <span className={`status-badge status-${booking.status}`}>
                      {booking.status}
                    </span>
                    <span className="booking-id">#{booking.id}</span>
                  </div>
                  <div className="booking-details">
                    <div className="detail-row">
                      <span className="label">Passenger:</span>
                      <span>{booking.passenger?.name} ⭐ {booking.passenger?.rating || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Phone:</span>
                      <span>{booking.passenger?.phone_number}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Pickup:</span>
                      <span>{booking.pickup_address}</span>
                    </div>
                    {booking.dropoff_address && (
                      <div className="detail-row">
                        <span className="label">Dropoff:</span>
                        <span>{booking.dropoff_address}</span>
                      </div>
                    )}
                    {booking.estimated_fare && (
                      <div className="detail-row">
                        <span className="label">Fare:</span>
                        <span className="fare">${booking.estimated_fare}</span>
                      </div>
                    )}
                    {booking.special_instructions && (
                      <div className="detail-row">
                        <span className="label">Instructions:</span>
                        <span>{booking.special_instructions}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiderDashboard;
