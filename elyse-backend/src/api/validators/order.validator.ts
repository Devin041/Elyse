import { z } from 'zod';

/**
 * Order Validation Schemas
 */

export const createOrderSchema = z.object({
    items: z.array(
        z.object({
            productId: z.string().uuid(),
            variantId: z.string().uuid(),
            quantity: z.number().int().positive(),
        })
    ).min(1, 'Order must have at least one item'),
    shippingAddressId: z.string().uuid(),
    paymentMethod: z.enum(['cod', 'card', 'upi', 'wallet']).default('cod'),
    notes: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
    status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
});

export const updatePaymentStatusSchema = z.object({
    paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']),
    paymentId: z.string().optional(),
});

export const getOrdersQuerySchema = z.object({
    status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).optional(),
    paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
    userId: z.string().uuid().optional(),
    limit: z.coerce.number().int().positive().max(100).default(20),
    offset: z.coerce.number().int().nonnegative().default(0),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type UpdatePaymentStatusInput = z.infer<typeof updatePaymentStatusSchema>;
export type GetOrdersQuery = z.infer<typeof getOrdersQuerySchema>;
