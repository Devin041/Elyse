import { Router } from 'express';
import multer from 'multer';
import { ImageService } from '../services/image.service';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    },
});

/**
 * @route   POST /api/v1/images/upload
 * @desc    Upload single image
 * @access  Private (Admin)
 */
router.post(
    '/upload',
    authenticate,
    authorize(['admin', 'inventory_manager']),
    upload.single('image'),
    asyncHandler(async (req: any, res) => {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided',
            });
        }

        const imageUrl = await ImageService.uploadImage(req.file);

        res.json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                url: imageUrl,
            },
        });
    })
);

/**
 * @route   POST /api/v1/images/upload-multiple
 * @desc    Upload multiple images
 * @access  Private (Admin)
 */
router.post(
    '/upload-multiple',
    authenticate,
    authorize(['admin', 'inventory_manager']),
    upload.array('images', 5), // Max 5 images
    asyncHandler(async (req: any, res) => {
        const files = req.files as Express.Multer.File[];

        if (!files || files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No image files provided',
            });
        }

        const imageUrls = await ImageService.uploadMultipleImages(files);

        res.json({
            success: true,
            message: `${imageUrls.length} images uploaded successfully`,
            data: {
                urls: imageUrls,
            },
        });
    })
);

/**
 * @route   DELETE /api/v1/images
 * @desc    Delete image from Cloudinary
 * @access  Private (Admin)
 */
router.delete(
    '/',
    authenticate,
    authorize(['admin', 'inventory_manager']),
    asyncHandler(async (req: any, res) => {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({
                success: false,
                message: 'Image URL is required',
            });
        }

        await ImageService.deleteImage(url);

        res.json({
            success: true,
            message: 'Image deleted successfully',
        });
    })
);

export default router;
