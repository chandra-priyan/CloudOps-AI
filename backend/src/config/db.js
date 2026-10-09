const mongoose = require('mongoose');
const config = require('./index');

let isConnected = false;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 3000
    });
    isConnected = true;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    isConnected = false;
    console.warn(`[Database Warning] MongoDB connection failed (${err.message}). Running with resilient in-memory fallback store.`);
  }
};

const getIsConnected = () => isConnected;

module.exports = { connectDB, getIsConnected };
