const express = require('express');
const {
  getDashboard,
  getAllUsers,
  getAllRiders,
  updateRiderApproval,
  toggleUserStatus,
  getAllBookings,
  deleteUser,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/users', getAllUsers);
router.get('/riders', getAllRiders);
router.put('/riders/:id/approval', updateRiderApproval);
router.put('/users/:id/status', toggleUserStatus);
router.get('/bookings', getAllBookings);
router.delete('/users/:id', deleteUser);

module.exports = router;
