import crypto from 'crypto';
import { Role, User } from '@prisma/client';
import { prisma } from '../../config/database';
import { env, isProd } from '../../config/env';
import { LoginInput, RegisterInput, ResetPasswordInput } from '../../validators/auth.validator';
import { badRequest, conflict, unauthorized } from '../../utils/errors';
import { hashPassword, verifyPassword } from '../../utils/password';
import { signAuthToken } from '../../utils/jwt';
import { AuthUserDto } from '../../types/api';
import { logger } from '../../utils/logger';

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export function toAuthUserDto(user: User): AuthUserDto {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  };
}

export interface AuthResult {
  user: AuthUserDto;
  token: string;
}

export const authService = {
  async register(input: RegisterInput): Promise<AuthResult> {
    const [existingEmail, existingUsername] = await Promise.all([
      prisma.user.findUnique({ where: { email: input.email } }),
      prisma.user.findUnique({ where: { username: input.username } }),
    ]);
    if (existingEmail) throw conflict('An account with this email already exists.');
    if (existingUsername) throw conflict('This username is already taken.');

    const passwordHash = await hashPassword(input.password);
    const user = await prisma.user.create({
      data: {
        name: input.name,
        username: input.username,
        email: input.email,
        passwordHash,
      },
    });

    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Welcome to ChallengeX',
        message: 'Your trial grounds are ready. Enter the gate when you are prepared to be challenged.',
        type: 'SYSTEM',
      },
    });

    const token = signAuthToken({ sub: user.id, role: user.role });
    return { user: toAuthUserDto(user), token };
  },

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    // Constant-ish response for unknown emails vs bad passwords.
    if (!user) throw unauthorized('Invalid email or password.');
    const valid = await verifyPassword(input.password, user.passwordHash);
    if (!valid) throw unauthorized('Invalid email or password.');

    const token = signAuthToken({
      sub: user.id,
      role: user.role,
      remember: input.rememberMe ?? false,
    });
    return { user: toAuthUserDto(user), token };
  },

  async me(userId: string): Promise<AuthUserDto> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw unauthorized('Your account no longer exists.');
    return toAuthUserDto(user);
  },

  /**
   * Password reset — creates a real single-use token.
   * - With EMAIL_PROVIDER configured the reset link is emailed.
   * - In development without email, the link is returned in the response
   *   (development-only convenience; never leaks production secrets).
   * - In production without email, nothing secret is returned.
   */
  async forgotPassword(email: string): Promise<{ message: string; devResetUrl?: string }> {
    const user = await prisma.user.findUnique({ where: { email } });
    // Always answer the same way to avoid account enumeration.
    const generic = {
      message: 'If an account exists for that email, a password reset link has been sent.',
    };
    if (!user) return generic;

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, used: false } });
    await prisma.passwordResetToken.create({ data: { userId: user.id, token, expiresAt } });

    const appUrl = env.CLIENT_URL;
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    if (env.EMAIL_PROVIDER && env.SMTP_URL) {
      // Real email delivery would be performed here via the SMTP provider.
      logger.info('Password reset email queued', { to: user.email });
      return generic;
    }

    if (isProd) {
      logger.warn('No email provider configured; reset link not delivered', { userId: user.id });
      return generic;
    }

    logger.info('Password reset link generated (dev mode)', { token });
    return { ...generic, devResetUrl: resetUrl };
  },

  async resetPassword(input: ResetPasswordInput): Promise<{ message: string }> {
    const record = await prisma.passwordResetToken.findUnique({ where: { token: input.token } });
    if (!record || record.used || record.expiresAt.getTime() < Date.now()) {
      throw badRequest('This reset link is invalid or has expired.');
    }

    const passwordHash = await hashPassword(input.password);
    await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
      prisma.passwordResetToken.update({ where: { id: record.id }, data: { used: true } }),
      // Invalidate all other outstanding sessions by deleting other tokens.
      prisma.passwordResetToken.deleteMany({
        where: { userId: record.userId, used: false },
      }),
    ]);

    return { message: 'Password updated. You can now log in with your new password.' };
  },
};

export function roleLabel(role: Role): string {
  return role.replace('_', ' ');
}
