import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

// Booking endpoints
export const bookingAPI = {
  create: (data) => api.post('/bookings', data),
  get: (id) => api.get(`/bookings/${id}`),
  accept: (id) => api.post(`/bookings/${id}/accept`),
  cancel: (id) => api.post(`/bookings/${id}/cancel`),
  myBookings: () => api.get('/bookings/my-bookings'),
};

// Location endpoints
export const locationAPI = {
  update: (data) => api.post('/location/update', data),
  nearbyRiders: () => api.get('/location/nearby-riders'),
  goOnline: (data) => api.post('/location/go-online', data),
  goOffline: () => api.post('/location/go-offline'),
};

// Notification endpoints
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.post(`/notifications/${id}/read`),
  markAllAsRead: () => api.post('/notifications/mark-all-read'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
};

// Review endpoints
export const reviewAPI = {
  submit: (data) => api.post('/reviews', data),
  getUserReviews: (userId) => api.get(`/reviews/user/${userId}`),
};

export default api;
