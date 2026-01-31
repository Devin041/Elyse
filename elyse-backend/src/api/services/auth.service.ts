import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query } from '../../config/database.config';
import { env } from '../../config/env.config';
import logger from '../../utils/logger';
import {
    AuthenticationError,
    ValidationError,
    ConflictError,
    NotFoundError,
} from '../../utils/errors/AppError';
import type {
    RegisterInput,
    LoginInput,
    UpdateProfileInput,
    ChangePasswordInput,
} from '../validators/auth.validator';

/**
 * Authentication Service
 * Handles user registration, login, token generation, and password management
 */

interface User {
    id: string;
    email: string;
    password_hash: string;
    first_name: string;
    last_name: string;
    phone?: string;
    role: string;
    email_verified: boolean;
    created_at: Date;
}

interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

interface AuthResponse {
    user: Omit<User, 'password_hash'>;
    tokens: TokenPair;
}

// Generate JWT tokens
export function generateTokens(userId: string, role: string): TokenPair {
    const accessToken = jwt.sign(
        { userId, role },
        env.JWT_ACCESS_SECRET,
        { expiresIn: env.JWT_ACCESS_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
        { userId, role },
        env.JWT_REFRESH_SECRET,
        { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
    );

    return { accessToken, refreshToken };
}

// Verify and decode JWT token
export function verifyToken(token: string, secret: string): any {
    try {
        return jwt.verify(token, secret);
    } catch (error) {
        throw new AuthenticationError('Invalid or expired token');
    }
}

// Hash password
async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
}

// Compare password
async function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

// Register new user
export async function registerUser(input: RegisterInput): Promise<AuthResponse> {
    const { email, password, firstName, lastName, phone } = input;

    // Check if user already exists
    const existingUser = await query(
        'SELECT id FROM users WHERE email = $1',
        [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
        throw new ConflictError('Email already registered');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const result = await query(
        `INSERT INTO users (email, password_hash, first_name, last_name, phone, role, email_verified)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, email, first_name, last_name, phone, role, email_verified, created_at`,
        [email.toLowerCase(), passwordHash, firstName, lastName, phone || null, 'customer', false]
    );

    const user = result.rows[0];

    // Generate tokens
    const tokens = generateTokens(user.id, user.role);

    // Update last login
    await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    logger.info('User registered successfully', { userId: user.id, email: user.email });

    return {
        user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            phone: user.phone,
            role: user.role,
            email_verified: user.email_verified,
            created_at: user.created_at,
        },
        tokens,
    };
}

// Login user
export async function loginUser(input: LoginInput): Promise<AuthResponse> {
    const { email, password } = input;

    // Find user
    const result = await query(
        `SELECT id, email, password_hash, first_name, last_name, phone, role, email_verified, 
            login_attempts, locked_until, created_at
     FROM users WHERE email = $1`,
        [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
        throw new AuthenticationError('Invalid email or password');
    }

    const user = result.rows[0];

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
        const minutesLeft = Math.ceil(
            (new Date(user.locked_until).getTime() - Date.now()) / 60000
        );
        throw new AuthenticationError(
            `Account locked. Try again in ${minutesLeft} minutes`
        );
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash);

    if (!isValidPassword) {
        // Increment login attempts
        const attempts = (user.login_attempts || 0) + 1;
        const lockUntil = attempts >= 5 ? new Date(Date.now() + 30 * 60000) : null; // 30 min lock

        await query(
            'UPDATE users SET login_attempts = $1, locked_until = $2 WHERE id = $3',
            [attempts, lockUntil, user.id]
        );

        if (lockUntil) {
            throw new AuthenticationError(
                'Too many failed attempts. Account locked for 30 minutes'
            );
        }

        throw new AuthenticationError('Invalid email or password');
    }

    // Reset login attempts and update last login
    await query(
        'UPDATE users SET login_attempts = 0, locked_until = NULL, last_login = NOW() WHERE id = $1',
        [user.id]
    );

    // Generate tokens
    const tokens = generateTokens(user.id, user.role);

    logger.info('User logged in successfully', { userId: user.id, email: user.email });

    return {
        user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            phone: user.phone,
            role: user.role,
            email_verified: user.email_verified,
            created_at: user.created_at,
        },
        tokens,
    };
}

// Refresh access token
export async function refreshAccessToken(refreshToken: string): Promise<TokenPair> {
    const decoded = verifyToken(refreshToken, env.JWT_REFRESH_SECRET);

    // Verify user still exists
    const result = await query(
        'SELECT id, role FROM users WHERE id = $1',
        [decoded.userId]
    );

    if (result.rows.length === 0) {
        throw new AuthenticationError('User not found');
    }

    const user = result.rows[0];

    // Generate new tokens
    return generateTokens(user.id, user.role);
}

// Get user profile
export async function getUserProfile(userId: string) {
    const result = await query(
        `SELECT id, email, first_name, last_name, phone, role, email_verified, created_at, last_login
     FROM users WHERE id = $1`,
        [userId]
    );

    if (result.rows.length === 0) {
        throw new NotFoundError('User not found');
    }

    return result.rows[0];
}

// Update user profile
export async function updateUserProfile(userId: string, input: UpdateProfileInput) {
    const { firstName, lastName, phone } = input;

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (firstName !== undefined) {
        updates.push(`first_name = $${paramCount++}`);
        values.push(firstName);
    }

    if (lastName !== undefined) {
        updates.push(`last_name = $${paramCount++}`);
        values.push(lastName);
    }

    if (phone !== undefined) {
        updates.push(`phone = $${paramCount++}`);
        values.push(phone || null);
    }

    if (updates.length === 0) {
        throw new ValidationError('No fields to update');
    }

    values.push(userId);

    const result = await query(
        `UPDATE users 
     SET ${updates.join(', ')}, updated_at = NOW()
     WHERE id = $${paramCount}
     RETURNING id, email, first_name, last_name, phone, role, email_verified, created_at`,
        values
    );

    logger.info('User profile updated', { userId });

    return result.rows[0];
}

// Change password
export async function changeUserPassword(userId: string, input: ChangePasswordInput) {
    const { currentPassword, newPassword } = input;

    // Get current password hash
    const result = await query(
        'SELECT password_hash FROM users WHERE id = $1',
        [userId]
    );

    if (result.rows.length === 0) {
        throw new NotFoundError('User not found');
    }

    const user = result.rows[0];

    // Verify current password
    const isValid = await comparePassword(currentPassword, user.password_hash);

    if (!isValid) {
        throw new AuthenticationError('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await query(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
        [newPasswordHash, userId]
    );

    logger.info('User password changed', { userId });

    return { message: 'Password changed successfully' };
}

// Generate password reset token
export async function generatePasswordResetToken(email: string) {
    const result = await query(
        'SELECT id FROM users WHERE email = $1',
        [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
        // Don't reveal if email exists
        return { message: 'If email exists, reset link has been sent' };
    }

    const user = result.rows[0];

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    // Save token
    await query(
        'UPDATE users SET password_reset_token = $1, password_reset_expires = $2 WHERE id = $3',
        [resetToken, resetExpires, user.id]
    );

    // TODO: Send email with reset link
    // For now, we'll log it (in production, use email service)
    logger.info('Password reset token generated', {
        userId: user.id,
        email,
        resetToken, // Remove this in production!
    });

    return { message: 'If email exists, reset link has been sent' };
}

// Reset password with token
export async function resetPasswordWithToken(token: string, newPassword: string) {
    const result = await query(
        `SELECT id FROM users 
     WHERE password_reset_token = $1 AND password_reset_expires > NOW()`,
        [token]
    );

    if (result.rows.length === 0) {
        throw new AuthenticationError('Invalid or expired reset token');
    }

    const user = result.rows[0];

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password and clear reset token
    await query(
        `UPDATE users 
     SET password_hash = $1, password_reset_token = NULL, password_reset_expires = NULL,
         updated_at = NOW()
     WHERE id = $2`,
        [passwordHash, user.id]
    );

    logger.info('Password reset successfully', { userId: user.id });

    return { message: 'Password reset successfully' };
}

// Get all users (Admin only) with order stats
export async function getAllUsers(role?: string) {
    let queryText = `
        SELECT 
            u.id, u.email, u.first_name, u.last_name, u.phone, u.role, 
            u.email_verified, u.created_at, u.last_login,
            COUNT(DISTINCT o.id) as total_orders,
            COALESCE(SUM(o.total_amount), 0) as total_spent
        FROM users u
        LEFT JOIN orders o ON o.user_id = u.id
        WHERE 1=1
    `;

    const params: any[] = [];

    if (role) {
        queryText += ` AND u.role = $1`;
        params.push(role);
    }

    queryText += ` GROUP BY u.id ORDER BY u.created_at DESC`;

    const result = await query(queryText, params);
    return result.rows;
}
