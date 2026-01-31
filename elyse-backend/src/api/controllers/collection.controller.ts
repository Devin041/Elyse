import { Request, Response, NextFunction } from 'express';
import * as collectionService from '../services/collection.service';
import { createCollectionSchema, updateCollectionSchema } from '../validators/collection.validator';
import { ValidationError } from '../../utils/errors/AppError';

export const getCollections = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const includeInactive = req.query.includeInactive === 'true';
        const collections = await collectionService.getCollections(includeInactive);

        res.json({
            success: true,
            data: collections
        });
    } catch (error) {
        next(error);
    }
};

export const getCollection = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const collection = await collectionService.getCollectionById(id);

        res.json({
            success: true,
            data: collection
        });
    } catch (error) {
        next(error);
    }
};

export const getCollectionBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { slug } = req.params;
        const collection = await collectionService.getCollectionBySlug(slug);

        res.json({
            success: true,
            data: collection
        });
    } catch (error) {
        next(error);
    }
}

export const createCollection = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validation = createCollectionSchema.safeParse(req.body);
        if (!validation.success) {
            throw new ValidationError('Invalid collection data', validation.error.errors);
        }

        const collection = await collectionService.createCollection(validation.data);

        res.status(201).json({
            success: true,
            data: collection
        });
    } catch (error) {
        next(error);
    }
};

export const updateCollection = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const validation = updateCollectionSchema.safeParse(req.body);
        if (!validation.success) {
            throw new ValidationError('Invalid collection data', validation.error.errors);
        }

        const collection = await collectionService.updateCollection(id, validation.data);

        res.json({
            success: true,
            data: collection
        });
    } catch (error) {
        next(error);
    }
};

export const deleteCollection = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await collectionService.deleteCollection(id);

        res.json({
            success: true,
            message: 'Collection deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
