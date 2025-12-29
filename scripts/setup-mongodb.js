#!/usr/bin/env node

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🔧 MongoDB Connection Setup Helper\n');
console.log('=====================================\n');

const question = (query) => new Promise(resolve => rl.question(query, resolve));

async function main() {
  console.log('Current Status: ❌ MongoDB not connected');
  console.log('Reason: IP whitelist or connection timeout\n');

  console.log('Choose an option:\n');
  console.log('1. Allow any IP (0.0.0.0/0) - Development only');
  console.log('2. Get my current IP');
  console.log('3. Test MongoDB Atlas connection');
  console.log('4. Switch to local MongoDB');
  console.log('5. View connection guide\n');

  const choice = await question('Enter your choice (1-5): ');

  switch (choice) {
    case '1':
      showAtlasGuide();
      break;
    case '2':
      getPublicIP();
      break;
    case '3':
      testConnection();
      break;
    case '4':
      switchToLocal();
      break;
    case '5':
      showGuide();
      break;
    default:
      console.log('Invalid choice');
  }

  rl.close();
}

function showAtlasGuide() {
  console.log('\n📋 Steps to Allow Any IP:\n');
  console.log('1. Go to https://cloud.mongodb.com');
  console.log('2. Click "Network Access" in the left sidebar');
  console.log('3. Click "ADD IP ADDRESS"');
  console.log('4. Enter: 0.0.0.0/0');
  console.log('5. Click "Confirm"');
  console.log('6. Wait 1-2 minutes for changes to apply');
  console.log('7. Run: npm run dev\n');
  console.log('⚠️  Only use 0.0.0.0/0 for development!\n');
}

function getPublicIP() {
  console.log('\n🌐 Getting your public IP...\n');
  const https = require('https');
  https.get('https://api.ipify.org', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`Your Public IP: ${data}\n`);
      console.log('Add this IP to MongoDB Atlas Network Access whitelist');
      console.log('Steps:');
      console.log('1. Go to https://cloud.mongodb.com');
      console.log('2. Click "Network Access"');
      console.log('3. Click "ADD IP ADDRESS"');
      console.log(`4. Enter: ${data}`);
      console.log('5. Click "Confirm"\n');
    });
  });
}

function testConnection() {
  console.log('\n🧪 Testing MongoDB Atlas connection...\n');
  const mongoose = require('mongoose');
  const mongoUri = process.env.MONGODB_URI || 
    'mongodb+srv://nagacclark_db_user:1MhyhWJUTdLTUIoP@fetch.7idiskx.mongodb.net/motorcycle-booking';
  
  mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
      console.log('✅ MongoDB Connected!');
      console.log(`   Host: ${mongoose.connection.host}\n`);
      process.exit(0);
    })
    .catch(err => {
      console.log('❌ Connection Failed');
      console.log(`   Error: ${err.message}\n`);
      console.log('Solutions:');
      console.log('1. Check MongoDB Atlas Network Access whitelist');
      console.log('2. Verify your internet connection');
      console.log('3. Check firewall settings');
      console.log('4. See MONGODB_CONNECTION_FIX.md for more help\n');
      process.exit(1);
    });
}

function switchToLocal() {
  const envPath = path.join(__dirname, '.env');
  let envContent = fs.readFileSync(envPath, 'utf-8');
  
  envContent = envContent.replace(
    /MONGODB_URI=.*/,
    'MONGODB_URI=mongodb://localhost:27017/motorcycle-booking'
  );
  
  fs.writeFileSync(envPath, envContent);
  console.log('\n✅ Updated .env to use local MongoDB');
  console.log('   MONGODB_URI=mongodb://localhost:27017/motorcycle-booking\n');
  console.log('Next steps:');
  console.log('1. Install MongoDB: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/');
  console.log('2. Start MongoDB: mongod');
  console.log('3. Run the app: npm run dev\n');
}

function showGuide() {
  console.log('\n📖 MongoDB Connection Guide\n');
  console.log('See MONGODB_CONNECTION_FIX.md for detailed instructions\n');
}

main().catch(console.error);
