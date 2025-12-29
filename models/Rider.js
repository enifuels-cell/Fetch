const mongoose = require('mongoose');

const riderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  licenseNumber: {
    type: String,
    required: [true, 'Please add a license number'],
    unique: true,
  },
  vehicleType: {
    type: String,
    required: [true, 'Please add a vehicle type'],
    enum: ['scooter', 'standard', 'sport', 'cruiser', 'touring'],
  },
  vehicleBrand: {
    type: String,
    required: [true, 'Please add a vehicle brand'],
  },
  vehicleModel: {
    type: String,
    required: [true, 'Please add a vehicle model'],
  },
  vehicleYear: {
    type: Number,
    required: [true, 'Please add a vehicle year'],
  },
  plateNumber: {
    type: String,
    required: [true, 'Please add a plate number'],
    unique: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  currentLocation: {
    lat: Number,
    lng: Number,
  },
  rating: {
    type: Number,
    default: 5,
    min: 0,
    max: 5,
  },
  totalRides: {
    type: Number,
    default: 0,
  },
  documents: {
    licensePhoto: String,
    vehicleRegistration: String,
    insurance: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Rider', riderSchema);
