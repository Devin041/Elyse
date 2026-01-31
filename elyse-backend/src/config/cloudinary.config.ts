import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.config';

/**
 * Cloudinary Configuration
 * For image upload and management
 */

cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME || 'demo',
    api_key: env.CLOUDINARY_API_KEY || 'demo',
    api_secret: env.CLOUDINARY_API_SECRET || 'demo',
});

export default cloudinary;
