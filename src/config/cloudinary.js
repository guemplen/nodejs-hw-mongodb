import cloudinary from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

console.log('Cloudinary Configuration:');
console.log('Cloud Name:', cloudinaryConfig.cloud_name);
console.log('API Key:', cloudinaryConfig.api_key);

cloudinary.v2.config(cloudinaryConfig);

try {
  cloudinary.v2.config(cloudinaryConfig);
  console.log('Cloudinary configured successfully.');
} catch (error) {
  console.error('Error configuring Cloudinary:', error);
}

export default cloudinary.v2;
