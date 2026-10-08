import { prisma } from '../../config/database';
import { AuthUserDto } from '../../types/api';
import {
  ChangePasswordInput,
  UpdateProfileInput,
} from '../../validators/profile.validator';
import { badRequest, conflict, notFound } from '../../utils/errors';
import { hashPassword, verifyPassword } from '../../utils/password';
import { toAuthUserDto } from '../auth/auth.service';

export interface ProfileStats {
  ideas: number;
  trials: number;
  builds: number;
  pivots: number;
  kills: number;
}

export const profileService = {
  async get(userId: string): Promise<{ user: AuthUserDto; stats: ProfileStats }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { _count: { select: { ideas: true, trials: true } } },
    });
    if (!user) throw notFound('Profile not found.');

    const [builds, pivots, kills] = await Promise.all([
      prisma.trial.count({ where: { userId, verdict: 'BUILD' } }),
      prisma.trial.count({ where: { userId, verdict: 'PIVOT' } }),
      prisma.trial.count({ where: { userId, verdict: 'KILL' } }),
    ]);

    return {
      user: toAuthUserDto(user),
      stats: {
        ideas: user._count.ideas,
        trials: user._count.trials,
        builds,
        pivots,
        kills,
      },
    };
  },

  async update(userId: string, input: UpdateProfileInput): Promise<AuthUserDto> {
    if (input.username) {
      const existing = await prisma.user.findUnique({ where: { username: input.username } });
      if (existing && existing.id !== userId) throw conflict('This username is already taken.');
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.username !== undefined ? { username: input.username } : {}),
        ...(input.avatar !== undefined ? { avatar: input.avatar } : {}),
      },
    });
    return toAuthUserDto(user);
  },

  async changePassword(userId: string, input: ChangePasswordInput): Promise<{ message: string }> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw notFound('Profile not found.');
    if (input.newPassword !== input.confirmNewPassword) {
      throw badRequest('New passwords do not match.');
    }

    const valid = await verifyPassword(input.currentPassword, user.passwordHash);
    if (!valid) throw badRequest('Your current password is incorrect.');

    const passwordHash = await hashPassword(input.newPassword);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    return { message: 'Password updated successfully.' };
  },
};
