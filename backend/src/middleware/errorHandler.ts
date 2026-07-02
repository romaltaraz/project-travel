import { Request, Response, NextFunction, RequestHandler } from 'express';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Wraps async route handlers so thrown errors reach the global error handler
export const asyncHandler = (fn: RequestHandler) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Global Express error-handling middleware (must have 4 params)
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message, details: err.details });
    return;
  }

  // MySQL duplicate-entry errors (e.g. duplicate likes/reviews/bookingReference)
  if ((err as NodeJS.ErrnoException & { code?: string }).code === 'ER_DUP_ENTRY') {
    res.status(409).json({ error: 'Duplicate entry — resource already exists' });
    return;
  }

  console.error('[Unhandled error]', err);
  res.status(500).json({ error: 'Internal server error' });
}
