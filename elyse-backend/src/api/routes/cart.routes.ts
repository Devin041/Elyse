import { Router, Request } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../middlewares/validate.middleware';
import { optionalAuth } from '../middlewares/auth.middleware';
import {
    addToCartSchema,
    updateCartItemSchema,
} from '../validators/cart.validator';
import * as cartService from '../services/cart.service';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Helper to get userId or sessionId
function getUserOrSession(req: Request): { userId?: string; sessionId: string } {
    const userId = req.user?.userId;

    // Get or create session ID from cookies
    let sessionId = req.cookies?.sessionId;
    if (!sessionId) {
        sessionId = uuidv4();
        // In production, set this as a cookie
    }

    return { userId, sessionId };
}

/**
 * @route   GET /api/v1/cart
 * @desc    Get user's cart
 * @access  Public (supports both auth and guest)
 */
router.get(
    '/',
    optionalAuth,
    asyncHandler(async (req, res) => {
        const { userId, sessionId } = getUserOrSession(req);
        const cart = await cartService.getCart(userId, sessionId);

        // Set session cookie for guest users
        if (!userId) {
            res.cookie('sessionId', sessionId, {
                httpOnly: true,
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                sameSite: 'lax',
            });
        }

        res.json({
            success: true,
            data: cart,
        });
    })
);

/**
 * @route   POST /api/v1/cart/items
 * @desc    Add item to cart
 * @access  Public (supports both auth and guest)
 */
router.post(
    '/items',
    optionalAuth,
    validate(addToCartSchema),
    asyncHandler(async (req, res) => {
        const { userId, sessionId } = getUserOrSession(req);
        const cart = await cartService.addToCart(req.body, userId, sessionId);

        // Set session cookie for guest users
        if (!userId) {
            res.cookie('sessionId', sessionId, {
                httpOnly: true,
                maxAge: 7 * 24 * 60 * 60 * 1000,
                sameSite: 'lax',
            });
        }

        res.json({
            success: true,
            message: 'Item added to cart',
            data: cart,
        });
    })
);

/**
 * @route   PUT /api/v1/cart/items/:id
 * @desc    Update cart item quantity
 * @access  Public (supports both auth and guest)
 */
router.put(
    '/items/:id',
    optionalAuth,
    validate(updateCartItemSchema),
    asyncHandler(async (req, res) => {
        const { userId, sessionId } = getUserOrSession(req);
        const cart = await cartService.updateCartItem(
            req.params.id,
            req.body,
            userId,
            sessionId
        );

        res.json({
            success: true,
            message: 'Cart updated',
            data: cart,
        });
    })
);

/**
 * @route   DELETE /api/v1/cart/items/:id
 * @desc    Remove item from cart
 * @access  Public (supports both auth and guest)
 */
router.delete(
    '/items/:id',
    optionalAuth,
    asyncHandler(async (req, res) => {
        const { userId, sessionId } = getUserOrSession(req);
        const cart = await cartService.removeCartItem(
            req.params.id,
            userId,
            sessionId
        );

        res.json({
            success: true,
            message: 'Item removed from cart',
            data: cart,
        });
    })
);

/**
 * @route   DELETE /api/v1/cart
 * @desc    Clear entire cart
 * @access  Public (supports both auth and guest)
 */
router.delete(
    '/',
    optionalAuth,
    asyncHandler(async (req, res) => {
        const { userId, sessionId } = getUserOrSession(req);
        await cartService.clearCart(userId, sessionId);

        res.json({
            success: true,
            message: 'Cart cleared',
        });
    })
);

/**
 * @route   POST /api/v1/cart/merge
 * @desc    Merge guest cart into user cart (called after login)
 * @access  Private
 */
router.post(
    '/merge',
    optionalAuth,
    asyncHandler(async (req, res) => {
        const userId = req.user?.userId;
        const sessionId = req.cookies?.sessionId;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }

        if (!sessionId) {
            res.json({
                success: true,
                message: 'No guest cart to merge',
            });
            return;
        }

        const cart = await cartService.mergeGuestCart(userId, sessionId);

        res.json({
            success: true,
            message: 'Cart merged successfully',
            data: cart,
        });
    })
);

export default router;
