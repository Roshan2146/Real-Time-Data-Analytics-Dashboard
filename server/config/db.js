const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/realtime_analytics';
  
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[Database] Could not connect to primary MongoDB URI (${mongoURI}): ${error.message}`);
    console.log('[Database] Initializing fallback in-memory MongoDB server for zero-config demonstration...');
    
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`[Database] In-memory MongoDB Connected: ${memUri}`);
      return conn;
    } catch (memError) {
      console.error(`[Database] Failed to initialize in-memory database: ${memError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
