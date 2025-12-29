const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

async function testLogins() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const accounts = [
      { email: 'user@test.com', password: 'user123' },
      { email: 'rider@test.com', password: 'rider123' },
      { email: 'admin@motorcyclebooking.com', password: 'admin123' }
    ];

    for(let account of accounts) {
      console.log(`Testing: ${account.email}`);
      // Use .select('+password') to get the password field
      const user = await User.findOne({ email: account.email }).select('+password');
      
      if (!user) {
        console.log('  ❌ User not found\n');
        continue;
      }

      if (!user.password) {
        console.log('  ❌ Password field is empty\n');
        continue;
      }

      const isMatch = await bcrypt.compare(account.password, user.password);
      console.log(`  ✅ Password Match: ${isMatch ? 'YES' : 'NO'}\n`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testLogins();
