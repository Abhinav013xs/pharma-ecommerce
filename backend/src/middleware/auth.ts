import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { dbOperation } from '../db.js';
import { dbInstance } from '../mockData.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_pharmaceutical_compliance_jwt_key_2026';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
    name: string;
  };
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Expecting "Bearer <token>"

  if (!token) {
    return res.status(401).json({ success: false, error: "Access token is missing or invalid." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: Role; name: string };
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, error: "Session expired or invalid token." });
  }
}

export function authorizeRoles(...roles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized access." });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access Denied: Requires role of type: ${roles.join(' or ')}`
      });
    }

    next();
  };
}
