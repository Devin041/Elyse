import cloudinary from '../../config/cloudinary.config';
import { AppError } from '../../utils/errors/AppError';
import logger from '../../utils/logger';
import { Readable } from 'node:stream';

export class ImageService {
    /**
     * Upload image to Cloudinary
     */
    static async uploadImage(file: Express.Multer.File, folder = 'elyse-products'): Promise<string> {
        try {
            // Convert buffer to stream
            const stream = Readable.from(file.buffer);

            // Upload to Cloudinary
            const result = await new Promise<any>((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder,
                        resource_type: 'image',
                        transformation: [
                            { width: 1200, height: 1200, crop: 'limit' },
                            { quality: 'auto:good' },
                            { fetch_format: 'auto' },
                        ],
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );

                stream.pipe(uploadStream);
            });

            logger.info('Image uploaded to Cloudinary', { url: result.secure_url });
            return result.secure_url;
        } catch (error) {
            logger.error('Image upload failed', { error });
            throw new AppError('Failed to upload image', 500);
        }
    }

    /**
     * Upload multiple images
     */
    static async uploadMultipleImages(files: Express.Multer.File[], folder = 'elyse-products'): Promise<string[]> {
        const uploadPromises = files.map((file) => this.uploadImage(file, folder));
        return Promise.all(uploadPromises);
    }

    /**
     * Delete image from Cloudinary
     */
    static async deleteImage(imageUrl: string): Promise<void> {
        try {
            // Extract public_id from Cloudinary URL
            const publicId = this.extractPublicId(imageUrl);
            if (!publicId) {
                throw new AppError('Invalid Cloudinary URL', 400);
            }

            await cloudinary.uploader.destroy(publicId);
            logger.info('Image deleted from Cloudinary', { publicId });
        } catch (error) {
            logger.error('Image deletion failed', { error });
            throw new AppError('Failed to delete image', 500);
        }
    }

    /**
     * Extract public_id from Cloudinary URL
     */
    private static extractPublicId(url: string): string | null {
        const regex = /\/v\d+\/(.+)\.\w+$/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }
}
