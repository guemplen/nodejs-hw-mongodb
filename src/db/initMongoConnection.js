import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const { MONGODB_USER, MONGODB_PASSWORD, MONGODB_URL, MONGODB_DB } = process.env;

if (!MONGODB_USER || !MONGODB_PASSWORD || !MONGODB_URL || !MONGODB_DB) {
  console.error('Missing required environment variables');
  process.exit(1);
}

export async function initMongoConnection() {
  const uri = `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_URL}/${MONGODB_DB}?retryWrites=true&w=majority`;

  try {
    await mongoose.connect(uri);
    console.log('Mongo connection successfully established!');
  } catch (error) {
    console.error('Mongo connection error:', error);
    process.exit(1);
  }
}
