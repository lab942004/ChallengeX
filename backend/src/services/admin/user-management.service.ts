import { Prisma, Role, User } from '@prisma/client';
import { prisma } from '../../config/database';
import { badRequest, conflict, notFound } from '../../utils/errors';
import { buildMeta, resolvePagination, PageMeta } from '../../utils/pagination';
import { hashPassword } from '../../utils/password';

export interface UserListQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
}

export interface AdminCreateUserInput {
  name: string;
  username: string;
  email: string;
  password: string;
  role: Role;
}

const userPublicSelect = {
  id: true,
  name: true,
  username: true,
  email: true,
  avatar: true,
  role: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { ideas: true, trials: true } },
};

type UserRow = Prisma.UserGetPayload<{ select: typeof userPublicSelect }>;

export const userManagementService = {
  async list(query: UserListQuery): Promise<{ items: UserRow[]; meta: PageMeta }> {
    const { page, limit, skip, take } = resolvePagination(query);
    const where = {
      ...(query.role ? { role: query.role } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' as const } },
              { email: { contains: query.search, mode: 'insensitive' as const } },
              { username: { contains: query.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };
    const [total, items] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: userPublicSelect,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);
    return { items, meta: buildMeta(page, limit, total) };
  },

  async get(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        ...userPublicSelect,
        passwordHash: false,
        ideas: { orderBy: { createdAt: 'desc' }, take: 10 },
        trials: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { idea: { select: { title: true } } },
        },
      },
    });
    if (!user) throw notFound('User not found.');
    return user;
  },

  async update(id: string, data: Partial<{ name: string; username: string; email: string; role: Role; avatar: string | null }>) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw notFound('User not found.');

    if (data.email && data.email !== user.email) {
      const clash = await prisma.user.findUnique({ where: { email: data.email } });
      if (clash) throw conflict('A user with this email already exists.');
    }
    if (data.username && data.username !== user.username) {
      const clash = await prisma.user.findUnique({ where: { username: data.username } });
      if (clash) throw conflict('A user with this username already exists.');
    }

    return prisma.user.update({
      where: { id },
      data,
      select: userPublicSelect,
    });
  },

  async remove(id: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw notFound('User not found.');
    if (user.role === 'SUPER_ADMIN') throw badRequest('Super Admin accounts cannot be deleted.');
    // Cascade relations handle ideas/trials/notifications.
    await prisma.user.delete({ where: { id } });
  },

  /** Creates an ADMIN/SUPER_ADMIN account — SUPER_ADMIN only. */
  async createAdmin(input: AdminCreateUserInput): Promise<Omit<User, 'passwordHash'>> {
    if (input.role === 'USER') throw badRequest('Use registration for USER accounts.');
    const [emailClash, usernameClash] = await Promise.all([
      prisma.user.findUnique({ where: { email: input.email } }),
      prisma.user.findUnique({ where: { username: input.username } }),
    ]);
    if (emailClash) throw conflict('A user with this email already exists.');
    if (usernameClash) throw conflict('A user with this username already exists.');

    const passwordHash = await hashPassword(input.password);
    const { passwordHash: _ignored, ...safe } = await prisma.user.create({
      data: {
        name: input.name,
        username: input.username,
        email: input.email,
        passwordHash,
        role: input.role,
      },
    });
    void _ignored;
    return safe;
  },

  async listAdmins(): Promise<Omit<User, 'passwordHash'>[]> {
    const admins = await prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
      orderBy: { createdAt: 'desc' },
      select: { ...userPublicSelect, updatedAt: true },
    });
    return admins as Omit<User, 'passwordHash'>[];
  },

  async updateAdmin(
    id: string,
    data: Partial<{ name: string; email: string; role: Role }>,
    actorId: string,
  ): Promise<Omit<User, 'passwordHash'>> {
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) throw notFound('Admin not found.');
    if (target.role !== 'ADMIN' && target.role !== 'SUPER_ADMIN') {
      throw badRequest('That user is not an admin.');
    }
    // A super admin may not demote themselves — avoids locking everyone out.
    if (id === actorId && data.role && data.role !== 'SUPER_ADMIN') {
      throw badRequest('You cannot demote your own Super Admin account.');
    }
    const updated = await prisma.user.update({
      where: { id },
      data,
      select: userPublicSelect,
    });
    return updated as Omit<User, 'passwordHash'>;
  },

  async removeAdmin(id: string, actorId: string): Promise<void> {
    if (id === actorId) throw badRequest('You cannot delete your own account.');
    await this.remove(id);
  },
};
