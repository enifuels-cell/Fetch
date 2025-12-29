const express = require('express');
const {
  createBooking,
  getMyBookings,
  getRiderBookings,
  getAvailableBookings,
  acceptBooking,
  updateBookingStatus,
  cancelBooking,
  rateBooking,
  declineBooking,
  getBooking,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');
const { bookingLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/', protect, authorize('user'), bookingLimiter, createBooking);
router.get('/my-bookings', protect, authorize('user'), getMyBookings);
router.get('/rider-bookings', protect, authorize('rider'), getRiderBookings);
router.get('/available', protect, authorize('rider'), getAvailableBookings);
router.put('/:id/accept', protect, authorize('rider'), acceptBooking);
router.put('/:id/decline', protect, authorize('rider'), declineBooking);
router.put('/:id/status', protect, authorize('rider'), updateBookingStatus);
router.put('/:id/cancel', protect, authorize('user'), cancelBooking);
router.put('/:id/rate', protect, authorize('user'), rateBooking);
router.get('/:id', protect, getBooking);

module.exports = router;
