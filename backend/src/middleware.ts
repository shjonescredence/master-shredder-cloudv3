import type { Request, Response, NextFunction } from 'express';

// Example middleware for logging requests
export function logger(req: Request, res: Response, next: NextFunction) {
  console.log(`${req.method} ${req.url}`);
  next();
}
