import { Request, Response, NextFunction } from 'express';
import * as categoryService from '../services/category.service';
import { createCategorySchema, updateCategorySchema } from '../validators/category.validator';
import { ValidationError } from '../../utils/errors/AppError';

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const includeInactive = req.query.includeInactive === 'true';
        const categories = await categoryService.getCategories(includeInactive);

        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        next(error);
    }
};

export const getCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const category = await categoryService.getCategoryById(id);

        res.json({
            success: true,
            data: category
        });
    } catch (error) {
        next(error);
    }
};

export const getCategoryBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { slug } = req.params;
        const category = await categoryService.getCategoryBySlug(slug);

        res.json({
            success: true,
            data: category
        });
    } catch (error) {
        next(error);
    }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validation = createCategorySchema.safeParse(req.body);
        if (!validation.success) {
            throw new ValidationError('Invalid category data', validation.error.errors);
        }

        const category = await categoryService.createCategory(validation.data);

        res.status(201).json({
            success: true,
            data: category
        });
    } catch (error) {
        next(error);
    }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const validation = updateCategorySchema.safeParse(req.body);
        if (!validation.success) {
            throw new ValidationError('Invalid category data', validation.error.errors);
        }

        const category = await categoryService.updateCategory(id, validation.data);

        res.json({
            success: true,
            data: category
        });
    } catch (error) {
        next(error);
    }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await categoryService.deleteCategory(id);

        res.json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
