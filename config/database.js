const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`⚠️  MongoDB Connection Failed: ${error.message}`);
    console.log('\n📌 MongoDB Atlas Connection Timeout Detection:');
    console.log('   - Your network/firewall may be blocking MongoDB Atlas');
    console.log('   - MongoDB Atlas IP address restrictions may apply');
    console.log('\n💡 Solutions:');
    console.log('   1. Check your MongoDB Atlas IP whitelist');
    console.log('   2. Run: npm run setup-atlas (for guided setup)');
    console.log('   3. Use local MongoDB: mongod command');
    console.log('   4. Configure firewall to allow 27017 port');
    console.log('\n⏱️  Server will still start in API-only mode');
    console.log('   Database operations will be mocked for testing.\n');
    
    // Don't exit - allow server to run in mock mode
    // This lets you test the API structure without DB
  }
};

module.exports = connectDB;
