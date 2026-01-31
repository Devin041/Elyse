import { z } from 'zod';

export const createCategorySchema = z.object({
    name: z.string().min(1, 'Category name is required').max(100),
    slug: z.string().max(100).optional(),
    description: z.string().optional(),
    imageUrl: z.string().url().optional().or(z.literal('')),
    posterUrl: z.string().url().optional().or(z.literal('')),
    parentId: z.string().uuid().optional().nullable(),
    isActive: z.boolean().optional(),
    displayOrder: z.number().int().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
