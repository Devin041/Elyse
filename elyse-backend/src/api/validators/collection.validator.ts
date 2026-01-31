import { z } from 'zod';

export const createCollectionSchema = z.object({
    name: z.string().min(1, 'Collection name is required').max(255),
    slug: z.string().max(255).optional(),
    description: z.string().optional(),
    imageUrl: z.string().url().optional().or(z.literal('')),
    isActive: z.boolean().optional(),
    displayOrder: z.number().int().optional(),
});

export const updateCollectionSchema = createCollectionSchema.partial();

export const addProductToCollectionSchema = z.object({
    productId: z.string().uuid('Invalid product ID'),
    displayOrder: z.number().int().optional(),
});

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>;
