import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../../utils/errors/AppError';

/**
 * Request validation middleware using Zod schemas
 * 
 * @param schema - Zod schema to validate against
 * @param source - Which part of request to validate (body, query, params)
 */
export const validate = (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
    return (req: Request, _res: Response, next: NextFunction) => {
        try {
            const data = req[source];
            const validated = schema.parse(data);

            // For query and params, store validated data in separate property
            // as they are read-only
            if (source === 'query') {
                (req as any).validatedQuery = validated;
            } else if (source === 'params') {
                (req as any).validatedParams = validated;
            } else {
                // Body is mutable, so we can replace it
                req.body = validated;
            }

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const details = error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                    code: err.code,
                }));

                next(
                    new ValidationError('Validation failed', details)
                );
            } else {
                next(error);
            }
        }
    };
};
