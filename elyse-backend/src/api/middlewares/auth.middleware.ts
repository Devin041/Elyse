import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticationError, AuthorizationError } from '../../utils/errors/AppError';
import { env } from '../../config/env.config';

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                email: string;
                role: string;
            };
        }
    }
}

/**
 * JWT Authentication Middleware
 * Verifies the access token and attaches user info to request
 */
export const authenticate = async (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AuthenticationError('No authentication token provided');
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as any;

        // Attach user info to request
        // Attach user info to request
        // FIX: Map Supabase 'authenticated' role to 'admin' for Development/Admin Panel access
        const role = decoded.role === 'authenticated' ? 'admin' : decoded.role;

        req.user = {
            userId: decoded.sub || decoded.userId, // Map 'sub' from Supabase
            email: decoded.email,
            role: role,
        };

        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            next(new AuthenticationError('Token has expired'));
        } else if (error instanceof jwt.JsonWebTokenError) {
            next(new AuthenticationError('Invalid token'));
        } else {
            next(error);
        }
    }
};

/**
 * Role-based Authorization Middleware
 * Checks if user has required role
 * 
 * @param roles - Array of allowed roles
 */
export const authorize = (roles: string[]) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AuthenticationError('Authentication required'));
        }

        if (!roles.includes(req.user.role)) {
            return next(
                new AuthorizationError(
                    `This action requires one of the following roles: ${roles.join(', ')}`
                )
            );
        }

        next();
    };
};

/**
 * Optional Authentication Middleware
 * Attaches user info if token is present, but doesn't fail if missing
 */
export const optionalAuth = async (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as any;

            req.user = {
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role,
            };
        }
        next();
    } catch (error) {
        // Silently fail for optional auth
        next();
    }
};
