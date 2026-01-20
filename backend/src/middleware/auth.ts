import { Request, Response, NextFunction } from 'express';
import { getUserByAuthToken, getOrCreateUser, checkUserLimit } from '../supabase.js';

export interface AuthRequest extends Request {
  user?: any;
  dbUser?: any;
  isAdmin?: boolean;
}

// Middleware za provjeru admin passworda ili user tokena
export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const adminPassword = req.headers['x-admin-password'];

  // 1. Provjeri admin password
  if (adminPassword === process.env.ADMIN_PASSWORD) {
    req.isAdmin = true;
    req.user = { id: 'admin' };
    req.dbUser = { 
      user_id: 'admin', 
      is_subscribed: true, 
      tokens_used: 0, 
      suspicious: false 
    };
    return next();
  }

  // 2. Provjeri JWT token
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized - No token provided' });
  }

  const token = authHeader.replace('Bearer ', '');
  const user = await getUserByAuthToken(token);

  if (!user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // 3. Dohvati ili kreiraj DB korisnika
  const dbUser = await getOrCreateUser(user.id, user.email);
  
  if (!dbUser) {
    return res.status(500).json({ error: 'Failed to get user data' });
  }

  req.user = user;
  req.dbUser = dbUser;
  req.isAdmin = false;

  // 4. Provjeri limite za besplatne korisnike
  const limitCheck = await checkUserLimit(user.id);
  
  if (!limitCheck.allowed) {
    return res.status(403).json({ 
      error: limitCheck.reason,
      tokensUsed: limitCheck.tokensUsed,
      limit: limitCheck.limit
    });
  }

  next();
}

// Middleware samo za admina
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.isAdmin) {
    return res.status(403).json({ error: 'Forbidden - Admin only' });
  }
  next();
}
