import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../middlewares/validate.middleware';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { authLimiter } from '../middlewares/rateLimit.middleware';
import {
    registerSchema,
    loginSchema,
    refreshTokenSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    updateProfileSchema,
    changePasswordSchema,
} from '../validators/auth.validator';
import * as authService from '../services/auth.service';

const router = Router();

/**
 * @route   GET /api/v1/auth/users
 * @desc    Get all users (Admin only)
 * @access  Private (Admin)
 */
router.get(
    '/users',
    authenticate,
    authorize(['admin']),
    asyncHandler(async (req, res) => {
        const { role } = req.query;
        const users = await authService.getAllUsers(role as string);

        res.json({
            success: true,
            data: users,
        });
    })
);

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
    '/register',
    authLimiter,
    validate(registerSchema),
    asyncHandler(async (req, res) => {
        const result = await authService.registerUser(req.body);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: result,
        });
    })
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
    '/login',
    authLimiter,
    validate(loginSchema),
    asyncHandler(async (req, res) => {
        const result = await authService.loginUser(req.body);

        res.json({
            success: true,
            message: 'Login successful',
            data: result,
        });
    })
);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post(
    '/refresh',
    validate(refreshTokenSchema),
    asyncHandler(async (req, res) => {
        const { refreshToken } = req.body;
        const tokens = await authService.refreshAccessToken(refreshToken);

        res.json({
            success: true,
            message: 'Token refreshed successfully',
            data: { tokens },
        });
    })
);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user (client should delete tokens)
 * @access  Private
 */
router.post(
    '/logout',
    authenticate,
    asyncHandler(async (req, res) => {
        // In a stateless JWT system, logout is handled client-side by deleting tokens
        // For additional security, you could maintain a token blacklist in Redis

        res.json({
            success: true,
            message: 'Logged out successfully',
        });
    })
);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
    '/me',
    authenticate,
    asyncHandler(async (req, res) => {
        const user = await authService.getUserProfile(req.user!.userId);

        res.json({
            success: true,
            data: { user },
        });
    })
);

/**
 * @route   PUT /api/v1/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
    '/profile',
    authenticate,
    validate(updateProfileSchema),
    asyncHandler(async (req, res) => {
        const user = await authService.updateUserProfile(req.user!.userId, req.body);

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: { user },
        });
    })
);

/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post(
    '/change-password',
    authenticate,
    validate(changePasswordSchema),
    asyncHandler(async (req, res) => {
        const result = await authService.changeUserPassword(req.user!.userId, req.body);

        res.json({
            success: true,
            message: result.message,
        });
    })
);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post(
    '/forgot-password',
    authLimiter,
    validate(forgotPasswordSchema),
    asyncHandler(async (req, res) => {
        const result = await authService.generatePasswordResetToken(req.body.email);

        res.json({
            success: true,
            message: result.message,
        });
    })
);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post(
    '/reset-password',
    authLimiter,
    validate(resetPasswordSchema),
    asyncHandler(async (req, res) => {
        const { token, password } = req.body;
        const result = await authService.resetPasswordWithToken(token, password);

        res.json({
            success: true,
            message: result.message,
        });
    })
);

export default router;
