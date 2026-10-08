import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { Role } from '@prisma/client';

export interface TokenPayload {
  sub: string; // user id
  role: Role;
  remember?: boolean;
}

export function signAuthToken(payload: TokenPayload): string {
  const expiresIn = payload.remember ? env.JWT_REMEMBER_EXPIRES_IN : env.JWT_EXPIRES_IN;
  return jwt.sign(
    { role: payload.role, remember: payload.remember ?? false },
    env.JWT_SECRET,
    { subject: payload.sub, expiresIn: expiresIn as SignOptions['expiresIn'], issuer: 'challengex' },
  );
}

export function verifyAuthToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET, { issuer: 'challengex' }) as jwt.JwtPayload;
  if (!decoded.sub || typeof decoded.role !== 'string') {
    throw new Error('Malformed token payload');
  }
  return {
    sub: decoded.sub,
    role: decoded.role as Role,
    remember: Boolean(decoded.remember),
  };
}
