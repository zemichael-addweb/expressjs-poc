import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import prisma from '../lib/prisma';

interface User {
  id: number;
  email: string;
  role: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET
};

passport.use(new JwtStrategy(options, async (payload, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true }
    });

    if (!user) {
      return done(null, false);
    }

    return done(null, user as User);
  } catch (error) {
    return done(error, false);
  }
}));

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const authenticate = passport.authenticate('jwt', { session: false });

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as User;

  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}; 