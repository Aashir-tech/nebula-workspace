import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || '';

export const connectDB = async () => {
  try {
    if (!MONGO_URI) {
      console.warn('⚠️  MONGO_URI not found in .env file');
      console.warn('⚠️  Please add your MongoDB connection string to nebula-backend/.env');
      console.warn('⚠️  Running without database - API will fail on data operations');
      return;
    }

    const conn = await mongoose.connect(MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error:`, error);
    console.error('Please check your MONGO_URI in the .env file');
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err);
});
