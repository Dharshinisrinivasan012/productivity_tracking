import jwt, { SignOptions } from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { Response, NextFunction } from 'express';
import { config } from '../config';
import { User } from '../models';
import { AuthRequest } from '../types';
import { AppError } from '../utils/helpers';

interface TokenPayload {
  userId: string;
  email: string;
}

export const generateAccessToken = (userId: string, email: string): string => {
  const options: SignOptions = { expiresIn: config.jwt.accessExpiresIn as SignOptions['expiresIn'] };
  return jwt.sign({ userId, email }, config.jwt.accessSecret, options);
};

export const generateRefreshToken = (userId: string, email: string): string => {
  const options: SignOptions = { expiresIn: config.jwt.refreshExpiresIn as SignOptions['expiresIn'] };
  return jwt.sign({ userId, email, jti: randomUUID() }, config.jwt.refreshSecret, options);
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwt.accessSecret) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
};

export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('Access token required', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new AppError('User not found', 401);
    }

    req.user = user;
    req.userId = user._id.toString();
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid or expired token', 401));
    } else {
      next(error);
    }
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.userId);
      if (user) {
        req.user = user;
        req.userId = user._id.toString();
      }
    }
    next();
  } catch {
    next();
  }
};
