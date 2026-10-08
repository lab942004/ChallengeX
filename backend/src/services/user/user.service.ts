import { prisma } from '../../config/database';

/** Availability checks used by the signup form for live validation. */
export const userService = {
  async isEmailAvailable(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    return !user;
  },

  async isUsernameAvailable(username: string): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { username } });
    return !user;
  },
};
