import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/index.js';

export interface AuthRequest extends Request {
  user?: { id: number; role: 'user' | 'admin' };
}

function extractUser(req: AuthRequest, res: Response): boolean {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized — missing or malformed token' });
    return false;
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = { id: decoded.userId, role: decoded.role };
    return true;
  } catch {
    res.status(401).json({ error: 'Unauthorized — invalid or expired token' });
    return false;
  }
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  if (extractUser(req, res)) next();
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!extractUser(req, res)) return;
  if (req.user?.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden — admin access required' });
    return;
  }
  next();
}
