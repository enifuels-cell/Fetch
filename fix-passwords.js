const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

async function fixPasswords() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Hash passwords
    const adminPass = await bcrypt.hash('admin123', 10);
    const userPass = await bcrypt.hash('user123', 10);
    const riderPass = await bcrypt.hash('rider123', 10);

    // Update admin
    await User.findOneAndUpdate(
      { email: 'admin@motorcyclebooking.com' },
      { password: adminPass },
      { new: true }
    );
    console.log('✅ Admin password updated');

    // Update user
    await User.findOneAndUpdate(
      { email: 'user@test.com' },
      { password: userPass },
      { new: true }
    );
    console.log('✅ User password updated');

    // Update rider
    await User.findOneAndUpdate(
      { email: 'rider@test.com' },
      { password: riderPass },
      { new: true }
    );
    console.log('✅ Rider password updated');

    // Verify
    console.log('\n=== Verification ===\n');
    const users = await User.find({ email: { $in: ['user@test.com', 'rider@test.com', 'admin@motorcyclebooking.com'] } });
    
    for(let user of users) {
      console.log(`Email: ${user.email}`);
      const testPwd = user.email === 'admin@motorcyclebooking.com' ? 'admin123' : user.email === 'rider@test.com' ? 'rider123' : 'user123';
      const isMatch = await bcrypt.compare(testPwd, user.password);
      console.log(`Password Match: ${isMatch ? '✅ YES' : '❌ NO'}\n`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

fixPasswords();
