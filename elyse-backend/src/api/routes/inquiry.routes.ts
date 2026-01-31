import { Router } from 'express';
import * as inquiryService from '../services/inquiry.service';
import { createInquirySchema } from '../validators/inquiry.validator';
import { validate } from '../middlewares/validate.middleware';
import logger from '../../utils/logger';

const router = Router();

// Create inquiry
router.post('/', validate(createInquirySchema), async (req, res, next) => {
    try {
        const inquiry = await inquiryService.createInquiry(req.body);
        res.status(201).json({
            success: true,
            data: inquiry,
            message: 'Inquiry submitted successfully'
        });
    } catch (error) {
        next(error);
    }
});

// Get inquiries (Admin only - ideally would have auth middleware)
router.get('/', async (req, res, next) => {
    try {
        const { status, limit, offset } = req.query;
        const inquiries = await inquiryService.getInquiries({
            status: status as string,
            limit: limit ? parseInt(limit as string) : undefined,
            offset: offset ? parseInt(offset as string) : undefined
        });
        res.json({
            success: true,
            data: inquiries
        });
    } catch (error) {
        next(error);
    }
});

export default router;
