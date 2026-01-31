import { z } from 'zod';

/**
 * Shopping Cart Validation Schemas
 */

// Add item to cart
export const addToCartSchema = z.object({
    productId: z.string().uuid('Invalid product ID'),
    variantId: z.string().uuid('Invalid variant ID'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1').max(99, 'Maximum quantity is 99'),
});

// Update cart item quantity
export const updateCartItemSchema = z.object({
    quantity: z.number().int().min(0, 'Quantity cannot be negative').max(99, 'Maximum quantity is 99'),
});

// Get cart (for guest users via session)
export const getCartSchema = z.object({
    sessionId: z.string().optional(), // For guest carts
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type GetCartInput = z.infer<typeof getCartSchema>;
