import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import Contact from '../models/contact.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const importContacts = async () => {
  const { MONGODB_USER, MONGODB_PASSWORD, MONGODB_URL, MONGODB_DB } =
    process.env;
  const mongoUri = `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_URL}/${MONGODB_DB}?retryWrites=true&w=majority`;

  try {
    await mongoose.connect(mongoUri);
    console.log('Mongo connection successfully established!');

    const filePath = path.join(__dirname, 'contacts.json');
    const data = fs.readFileSync(filePath, 'utf-8');
    const contacts = JSON.parse(data);

    await Contact.insertMany(contacts);
    console.log('Contacts imported successfully!');
  } catch (error) {
    console.error('Error importing contacts:', error);
  } finally {
    mongoose.connection.close();
  }
};

importContacts();
