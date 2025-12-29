const Rider = require('../models/Rider');
const User = require('../models/User');

// @desc    Register as rider
// @route   POST /api/riders/register
// @access  Private (user must be logged in)
const registerRider = async (req, res) => {
  try {
    const {
      licenseNumber,
      vehicleType,
      vehicleBrand,
      vehicleModel,
      vehicleYear,
      plateNumber,
    } = req.body;

    // Check if user is already a rider
    const existingRider = await Rider.findOne({ user: req.user.id });
    if (existingRider) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered as a rider',
      });
    }

    // Create rider profile
    const rider = await Rider.create({
      user: req.user.id,
      licenseNumber,
      vehicleType,
      vehicleBrand,
      vehicleModel,
      vehicleYear,
      plateNumber,
    });

    // Update user role to rider
    await User.findByIdAndUpdate(req.user.id, {
      role: 'rider',
      isApproved: false,
    });

    res.status(201).json({
      success: true,
      message: 'Rider registration submitted. Waiting for admin approval.',
      rider,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get rider profile
// @route   GET /api/riders/profile
// @access  Private (Rider)
const getRiderProfile = async (req, res) => {
  try {
    const rider = await Rider.findOne({ user: req.user.id }).populate('user', 'name email phone isApproved');

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: 'Rider profile not found',
      });
    }

    res.json({
      success: true,
      rider,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update rider profile
// @route   PUT /api/riders/profile
// @access  Private (Rider)
const updateRiderProfile = async (req, res) => {
  try {
    const {
      vehicleType,
      vehicleBrand,
      vehicleModel,
      vehicleYear,
      plateNumber,
      isAvailable,
    } = req.body;

    const rider = await Rider.findOne({ user: req.user.id });

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: 'Rider profile not found',
      });
    }

    const fieldsToUpdate = {};
    if (vehicleType) fieldsToUpdate.vehicleType = vehicleType;
    if (vehicleBrand) fieldsToUpdate.vehicleBrand = vehicleBrand;
    if (vehicleModel) fieldsToUpdate.vehicleModel = vehicleModel;
    if (vehicleYear) fieldsToUpdate.vehicleYear = vehicleYear;
    if (plateNumber) fieldsToUpdate.plateNumber = plateNumber;
    if (typeof isAvailable !== 'undefined') fieldsToUpdate.isAvailable = isAvailable;

    const updatedRider = await Rider.findByIdAndUpdate(
      rider._id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      rider: updatedRider,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all available riders
// @route   GET /api/riders
// @access  Private (User, Admin)
const getAvailableRiders = async (req, res) => {
  try {
    const riders = await Rider.find({ isAvailable: true })
      .populate('user', 'name phone isApproved')
      .sort('-rating');

    // Filter only approved riders
    const approvedRiders = riders.filter(rider => rider.user.isApproved);

    res.json({
      success: true,
      count: approvedRiders.length,
      riders: approvedRiders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get rider by ID
// @route   GET /api/riders/:id
// @access  Private
const getRiderById = async (req, res) => {
  try {
    const rider = await Rider.findById(req.params.id).populate('user', 'name email phone isApproved');

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: 'Rider not found',
      });
    }

    res.json({
      success: true,
      rider,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update rider location
// @route   PUT /api/riders/location
// @access  Private (Rider)
const updateRiderLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both latitude and longitude',
      });
    }

    // Validate coordinates
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates',
      });
    }

    const rider = await Rider.findOne({ user: req.user.id });

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: 'Rider profile not found',
      });
    }

    rider.currentLocation = { lat, lng };
    await rider.save();

    res.json({
      success: true,
      message: 'Location updated successfully',
      location: rider.currentLocation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  registerRider,
  getRiderProfile,
  updateRiderProfile,
  getAvailableRiders,
  getRiderById,
  updateRiderLocation,
};
