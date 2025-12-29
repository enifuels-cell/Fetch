const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const users = await User.find({ email: { $in: ['user@test.com', 'rider@test.com', 'admin@motorcyclebooking.com'] } });
    
    console.log('Found Users:');
    for(let user of users) {
      console.log(`\nEmail: ${user.email}`);
      console.log(`Name: ${user.name}`);
      console.log(`Role: ${user.role}`);
      console.log(`Password Hash: ${user.password.substring(0, 30)}...`);
      
      // Test password
      const testPwd = user.email === 'admin@motorcyclebooking.com' ? 'admin123' : user.email === 'rider@test.com' ? 'rider123' : 'user123';
      const isMatch = await bcrypt.compare(testPwd, user.password);
      console.log(`Password Match: ${isMatch ? '✅ YES' : '❌ NO'}`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkUsers();
