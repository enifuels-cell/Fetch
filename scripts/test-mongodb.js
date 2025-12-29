#!/usr/bin/env node

const mongoose = require('mongoose');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🔐 MongoDB Connection Tester\n');
console.log('============================\n');

const question = (query) => new Promise(resolve => rl.question(query, resolve));

async function testConnection() {
  console.log('Enter your MongoDB Atlas credentials:\n');
  
  const username = await question('Username: ');
  const password = await question('Password: ');
  const cluster = await question('Cluster (e.g., fetch.7idiskx): ');
  const database = await question('Database name (default: motorcycle-booking): ') || 'motorcycle-booking';
  
  const uri = `mongodb+srv://${username}:${encodeURIComponent(password)}@${cluster}.mongodb.net/${database}?authSource=admin&retryWrites=true&w=majority`;
  
  console.log('\n🧪 Testing connection...\n');
  console.log(`URI: mongodb+srv://${username}:***@${cluster}.mongodb.net/...\n`);
  
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 10000,
    });
    
    console.log('✅ SUCCESS! MongoDB Connected!');
    console.log(`   Host: ${mongoose.connection.host}`);
    console.log(`   Database: ${mongoose.connection.db.databaseName}\n`);
    console.log('📝 Update your .env file with:');
    console.log(`MONGODB_URI=${uri}\n`);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.log('❌ CONNECTION FAILED\n');
    console.log(`Error: ${error.message}\n`);
    console.log('Possible causes:');
    console.log('1. Incorrect username or password');
    console.log('2. IP address not whitelisted in MongoDB Atlas');
    console.log('3. Cluster name is incorrect');
    console.log('4. Database name has special characters\n');
    console.log('Troubleshooting:');
    console.log('1. Check MongoDB Atlas: https://cloud.mongodb.com');
    console.log('2. Verify IP whitelist (Network Access)');
    console.log('3. Reset password if needed');
    console.log('4. Try copying connection string directly from MongoDB Atlas\n');
    
    process.exit(1);
  }
}

testConnection().catch(console.error);
