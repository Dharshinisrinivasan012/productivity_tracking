import mongoose from 'mongoose';
import { config } from '../config';

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.error(
      'Ensure MongoDB is running locally (mongodb://localhost:27017) or set MONGODB_URI in backend/.env to your Atlas connection string.'
    );
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
};
