const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rider',
  },
  notifiedRiders: [{
    riderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rider',
    },
    notifiedAt: {
      type: Date,
      default: Date.now,
    },
    response: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
    },
  }],
  pickupLocation: {
    address: {
      type: String,
      required: [true, 'Please add a pickup address'],
    },
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  dropoffLocation: {
    address: {
      type: String,
      required: [true, 'Please add a dropoff address'],
    },
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  scheduledTime: {
    type: Date,
    required: [true, 'Please add a scheduled time'],
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    default: 'pending',
  },
  fare: {
    type: Number,
    required: [true, 'Please add a fare amount'],
  },
  distance: {
    type: Number,
  },
  duration: {
    type: Number,
  },
  passengerCount: {
    type: Number,
    default: 1,
    min: 1,
    max: 2,
  },
  notes: {
    type: String,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  review: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
bookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
