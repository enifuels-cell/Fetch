const express = require('express');
const {
  registerRider,
  getRiderProfile,
  updateRiderProfile,
  getAvailableRiders,
  getRiderById,
  updateRiderLocation,
} = require('../controllers/riderController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/register', protect, registerRider);
router.get('/profile', protect, authorize('rider'), getRiderProfile);
router.put('/profile', protect, authorize('rider'), updateRiderProfile);
router.put('/location', protect, authorize('rider'), updateRiderLocation);
router.get('/', protect, getAvailableRiders);
router.get('/:id', protect, getRiderById);

module.exports = router;
