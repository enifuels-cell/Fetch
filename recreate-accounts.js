const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Rider = require('./models/Rider');

async function recreateTestAccounts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete existing test accounts
    await User.deleteMany({ email: { $in: ['user@test.com', 'rider@test.com', 'admin@motorcyclebooking.com'] } });
    await Rider.deleteMany({});
    console.log('Cleaned up old accounts');

    // 1. Create Regular User (don't pre-hash, let the model handle it)
    const user = new User({
      name: 'John Rider',
      email: 'user@test.com',
      phone: '+1234567890',
      password: 'user123',
      role: 'user',
      isApproved: true
    });
    await user.save();
    console.log('✅ User created: user@test.com / user123');

    // 2. Create Rider User
    const riderUser = new User({
      name: 'Mike Motorcycle',
      email: 'rider@test.com',
      phone: '+0987654321',
      password: 'rider123',
      role: 'rider',
      isApproved: true
    });
    await riderUser.save();
    console.log('✅ Rider created: rider@test.com / rider123');

    // Create Rider Profile
    const riderProfile = new Rider({
      user: riderUser._id,
      licenseNumber: 'DL123456',
      vehicleType: 'sport',
      vehicleBrand: 'Yamaha',
      vehicleModel: 'YZF-R3',
      vehicleYear: 2024,
      plateNumber: 'MH01AB1234',
      isAvailable: true
    });
    await riderProfile.save();
    console.log('✅ Rider profile created');

    // 3. Create Admin User
    const admin = new User({
      name: 'Admin',
      email: 'admin@motorcyclebooking.com',
      phone: '+0000000000',
      password: 'admin123',
      role: 'admin',
      isApproved: true
    });
    await admin.save();
    console.log('✅ Admin created: admin@motorcyclebooking.com / admin123');

    console.log('\n════════════════════════════════════');
    console.log('   ACCOUNTS RECREATED & READY');
    console.log('════════════════════════════════════\n');
    console.log('👤 REGULAR USER:');
    console.log('   Email: user@test.com');
    console.log('   Password: user123\n');
    console.log('🏍️ MOTORCYCLE RIDER:');
    console.log('   Email: rider@test.com');
    console.log('   Password: rider123\n');
    console.log('🔐 ADMIN:');
    console.log('   Email: admin@motorcyclebooking.com');
    console.log('   Password: admin123\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

recreateTestAccounts();
