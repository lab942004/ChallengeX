import { Notification, NotificationType } from '@prisma/client';
import { prisma } from '../../config/database';
import { notFound } from '../../utils/errors';
import { buildMeta, resolvePagination, PageMeta } from '../../utils/pagination';

export const notificationService = {
  async list(
    userId: string,
    query: { page?: number; limit?: number },
  ): Promise<{ items: Notification[]; meta: PageMeta }> {
    const { page, limit, skip, take } = resolvePagination(query);
    const where = { userId };
    const [total, items] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);
    return { items, meta: buildMeta(page, limit, total) };
  },

  async unreadCount(userId: string): Promise<number> {
    return prisma.notification.count({ where: { userId, read: false } });
  },

  async markRead(userId: string, id: string): Promise<Notification> {
    const notification = await prisma.notification.findFirst({ where: { id, userId } });
    if (!notification) throw notFound('Notification not found.');
    return prisma.notification.update({ where: { id }, data: { read: true } });
  },

  async markAllRead(userId: string): Promise<{ updated: number }> {
    const result = await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return { updated: result.count };
  },

  /** Internal helper used by other services to emit user-facing events. */
  async create(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
  ): Promise<Notification> {
    return prisma.notification.create({ data: { userId, type, title, message } });
  },
};
