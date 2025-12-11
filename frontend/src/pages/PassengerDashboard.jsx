import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { bookingAPI, locationAPI } from '../services/api';
import { subscribeToUserChannel } from '../services/pusher';
import './Dashboard.css';

const PassengerDashboard = () => {
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [formData, setFormData] = useState({
    pickup_latitude: '',
    pickup_longitude: '',
    pickup_address: '',
    dropoff_latitude: '',
    dropoff_longitude: '',
    dropoff_address: '',
    special_instructions: '',
  });
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchBookings();
    
    // Subscribe to real-time notifications
    const channel = subscribeToUserChannel(user.id, (data) => {
      setNotifications((prev) => [data, ...prev]);
      
      // Refresh bookings if it's a booking update
      if (data.type === 'booking_accepted' || data.type === 'booking_completed') {
        fetchBookings();
      }
    });

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            pickup_latitude: position.coords.latitude.toString(),
            pickup_longitude: position.coords.longitude.toString(),
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please enter manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await bookingAPI.create({
        ...formData,
        pickup_latitude: parseFloat(formData.pickup_latitude),
        pickup_longitude: parseFloat(formData.pickup_longitude),
        dropoff_latitude: formData.dropoff_latitude ? parseFloat(formData.dropoff_latitude) : null,
        dropoff_longitude: formData.dropoff_longitude ? parseFloat(formData.dropoff_longitude) : null,
      });
      
      alert('Booking created successfully! Notifying nearby riders...');
      setShowBookingForm(false);
      setFormData({
        pickup_latitude: '',
        pickup_longitude: '',
        pickup_address: '',
        dropoff_latitude: '',
        dropoff_longitude: '',
        dropoff_address: '',
        special_instructions: '',
      });
      fetchBookings();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await bookingAPI.cancel(bookingId);
      alert('Booking cancelled successfully');
      fetchBookings();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>Welcome, {user.name}</h1>
            <p className="role-badge passenger">Passenger</p>
          </div>
          <button onClick={logout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        {notifications.length > 0 && (
          <div className="notifications-panel">
            <h3>🔔 Recent Notifications</h3>
            {notifications.slice(0, 3).map((notif, index) => (
              <div key={index} className="notification-item">
                <strong>{notif.title}</strong>
                <p>{notif.message}</p>
              </div>
            ))}
          </div>
        )}

        <div className="action-section">
          {!showBookingForm ? (
            <button
              onClick={() => setShowBookingForm(true)}
              className="btn btn-primary btn-large"
            >
              🚀 Book a Ride
            </button>
          ) : (
            <div className="booking-form-card">
              <h2>Create New Booking</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Pickup Latitude *</label>
                    <input
                      type="number"
                      name="pickup_latitude"
                      value={formData.pickup_latitude}
                      onChange={handleChange}
                      step="any"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Pickup Longitude *</label>
                    <input
                      type="number"
                      name="pickup_longitude"
                      value={formData.pickup_longitude}
                      onChange={handleChange}
                      step="any"
                      required
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="btn btn-secondary btn-small"
                >
                  📍 Use Current Location
                </button>

                <div className="form-group">
                  <label>Pickup Address *</label>
                  <input
                    type="text"
                    name="pickup_address"
                    value={formData.pickup_address}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Dropoff Latitude</label>
                    <input
                      type="number"
                      name="dropoff_latitude"
                      value={formData.dropoff_latitude}
                      onChange={handleChange}
                      step="any"
                    />
                  </div>
                  <div className="form-group">
                    <label>Dropoff Longitude</label>
                    <input
                      type="number"
                      name="dropoff_longitude"
                      value={formData.dropoff_longitude}
                      onChange={handleChange}
                      step="any"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Dropoff Address</label>
                  <input
                    type="text"
                    name="dropoff_address"
                    value={formData.dropoff_address}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Special Instructions</label>
                  <textarea
                    name="special_instructions"
                    value={formData.special_instructions}
                    onChange={handleChange}
                    rows="3"
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => setShowBookingForm(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Booking'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="bookings-section">
          <h2>My Bookings</h2>
          {bookings.length === 0 ? (
            <div className="empty-state">
              <p>No bookings yet. Create your first booking above!</p>
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
                        <span className="label">Estimated Fare:</span>
                        <span className="fare">${booking.estimated_fare}</span>
                      </div>
                    )}
                    {booking.rider && (
                      <div className="detail-row">
                        <span className="label">Rider:</span>
                        <span>{booking.rider.name} ⭐ {booking.rider.rating}</span>
                      </div>
                    )}
                  </div>
                  {booking.status === 'pending' && (
                    <button
                      onClick={() => cancelBooking(booking.id)}
                      className="btn btn-danger btn-small"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PassengerDashboard;
