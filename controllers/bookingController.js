const Booking = require('../models/Booking');
const Rider = require('../models/Rider');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (User)
const createBooking = async (req, res) => {
  try {
    const {
      pickupLocation,
      dropoffLocation,
      scheduledTime,
      fare,
      distance,
      duration,
      passengerCount,
      notes,
    } = req.body;

    const booking = await Booking.create({
      user: req.user.id,
      pickupLocation,
      dropoffLocation,
      scheduledTime,
      fare,
      distance,
      duration,
      passengerCount,
      notes,
    });

    res.status(201).json({
      success: true,
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all bookings for logged in user
// @route   GET /api/bookings/my-bookings
// @access  Private (User)
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('rider', 'vehicleBrand vehicleModel plateNumber rating')
      .sort('-createdAt');

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all bookings for rider
// @route   GET /api/bookings/rider-bookings
// @access  Private (Rider)
const getRiderBookings = async (req, res) => {
  try {
    const rider = await Rider.findOne({ user: req.user.id });

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: 'Rider profile not found',
      });
    }

    const bookings = await Booking.find({ rider: rider._id })
      .populate('user', 'name phone')
      .sort('-createdAt');

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get available bookings (pending) for riders
// @route   GET /api/bookings/available
// @access  Private (Rider)
const getAvailableBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ 
      status: 'pending',
      rider: null,
    })
      .populate('user', 'name phone')
      .sort('scheduledTime');

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Accept a booking
// @route   PUT /api/bookings/:id/accept
// @access  Private (Rider)
const acceptBooking = async (req, res) => {
  try {
    const rider = await Rider.findOne({ user: req.user.id });

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: 'Rider profile not found',
      });
    }

    if (!rider.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'You are not available to accept bookings',
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This booking is no longer available',
      });
    }

    if (booking.rider) {
      return res.status(400).json({
        success: false,
        message: 'This booking has already been accepted',
      });
    }

    booking.rider = rider._id;
    booking.status = 'confirmed';
    await booking.save();

    res.json({
      success: true,
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private (Rider)
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['in-progress', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const rider = await Rider.findOne({ user: req.user.id });

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: 'Rider profile not found',
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.rider.toString() !== rider._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking',
      });
    }

    booking.status = status;
    await booking.save();

    // Update rider stats if completed
    if (status === 'completed') {
      rider.totalRides += 1;
      await rider.save();
    }

    res.json({
      success: true,
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private (User)
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking',
      });
    }

    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a ${booking.status} booking`,
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({
      success: true,
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Rate a completed booking
// @route   PUT /api/bookings/:id/rate
// @access  Private (User)
const rateBooking = async (req, res) => {
  try {
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a rating between 1 and 5',
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to rate this booking',
      });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate completed bookings',
      });
    }

    booking.rating = rating;
    booking.review = review;
    await booking.save();

    // Update rider rating
    const rider = await Rider.findById(booking.rider);
    if (rider) {
      const allBookings = await Booking.find({
        rider: rider._id,
        rating: { $exists: true },
      });

      const avgRating =
        allBookings.reduce((acc, b) => acc + b.rating, 0) / allBookings.length;
      rider.rating = avgRating;
      await rider.save();
    }

    res.json({
      success: true,
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name phone email')
      .populate({
        path: 'rider',
        populate: { path: 'user', select: 'name phone' },
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check authorization
    const rider = await Rider.findOne({ user: req.user.id });
    const isOwner = booking.user._id.toString() === req.user.id;
    const isRider = rider && booking.rider && booking.rider._id.toString() === rider._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isRider && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking',
      });
    }

    res.json({
      success: true,
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getRiderBookings,
  getAvailableBookings,
  acceptBooking,
  updateBookingStatus,
  cancelBooking,
  rateBooking,
  getBooking,
};
