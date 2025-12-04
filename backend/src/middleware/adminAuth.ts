import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger.js';

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!user.roles || !user.roles.includes('admin')) {
      logger.warn(`Unauthorized admin access attempt by user ${user.userId}`);
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    next();
  } catch (err) {
    logger.error('Error in requireAdmin middleware:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Optional: More granular permissions
export function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      if (!user.roles || !user.roles.includes(role)) {
        logger.warn(`Unauthorized ${role} access attempt by user ${user.userId}`);
        return res.status(403).json({ error: `${role} access required` });
      }
      
      next();
    } catch (err) {
      logger.error('Error in requireRole middleware:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}
