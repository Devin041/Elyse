import { Router } from 'express';
import { OrderService } from '../services/order.service';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
    createOrderSchema,
    updateOrderStatusSchema,
    getOrdersQuerySchema,
} from '../validators/order.validator';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

/**
 * @route   POST /api/v1/orders
 * @desc    Create new order
 * @access  Private
 */
router.post(
    '/',
    authenticate,
    validate(createOrderSchema, 'body'),
    asyncHandler(async (req: any, res) => {
        const order = await OrderService.createOrder(req.user.id, req.body);

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            data: order,
        });
    })
);

/**
 * @route   GET /api/v1/orders
 * @desc    Get orders (all for admin, user's own otherwise)
 * @access  Private
 */
router.get(
    '/',
    authenticate,
    validate(getOrdersQuerySchema, 'query'),
    asyncHandler(async (req: any, res) => {
        const isAdmin = req.user.role === 'admin';
        const filters = (req as any).validatedQuery || req.query;

        const orders = await OrderService.getOrders(
            filters,
            req.user.id,
            isAdmin
        );

        res.json({
            success: true,
            data: orders,
            meta: {
                total: orders.length,
                limit: filters.limit,
                offset: filters.offset,
            },
        });
    })
);

/**
 * @route   GET /api/v1/orders/:id
 * @desc    Get order details
 * @access  Private
 */
router.get(
    '/:id',
    authenticate,
    asyncHandler(async (req: any, res) => {
        const isAdmin = req.user.role === 'admin';
        const order = await OrderService.getOrderById(
            req.params.id,
            req.user.id,
            isAdmin
        );

        res.json({
            success: true,
            data: order,
        });
    })
);

/**
 * @route   PATCH /api/v1/orders/:id/status
 * @desc    Update order status (admin only)
 * @access  Private (Admin)
 */
router.patch(
    '/:id/status',
    authenticate,
    authorize(['admin', 'inventory_manager']),
    validate(updateOrderStatusSchema, 'body'),
    asyncHandler(async (req: any, res) => {
        const order = await OrderService.updateOrderStatus(
            req.params.id,
            req.body
        );

        res.json({
            success: true,
            message: 'Order status updated',
            data: order,
        });
    })
);

/**
 * @route   POST /api/v1/orders/:id/cancel
 * @desc    Cancel order
 * @access  Private
 */
router.post(
    '/:id/cancel',
    authenticate,
    asyncHandler(async (req: any, res) => {
        const isAdmin = req.user.role === 'admin';
        const order = await OrderService.cancelOrder(
            req.params.id,
            req.user.id,
            isAdmin
        );

        res.json({
            success: true,
            message: 'Order cancelled successfully',
            data: order,
        });
    })
);

/**
 * @route   PATCH /api/v1/orders/:id/payment
 * @desc    Update payment status (admin only)
 * @access  Private (Admin)
 */
router.patch(
    '/:id/payment',
    authenticate,
    authorize(['admin']),
    asyncHandler(async (req: any, res) => {
        const order = await OrderService.updatePaymentStatus(
            req.params.id,
            req.body.paymentStatus,
            req.body.paymentId
        );

        res.json({
            success: true,
            message: 'Payment status updated',
            data: order,
        });
    })
);

export default router;
