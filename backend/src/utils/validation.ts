import { ZodSchema, ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { AppError } from './helpers';

export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
        next(new AppError(messages.join(', '), 400));
      } else {
        next(error);
      }
    }
  };
};
