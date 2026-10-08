import { z } from 'zod';
import { passwordSchema } from './auth.validator';

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80).optional(),
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, 'Username may only contain letters, numbers and underscores')
    .optional(),
  avatar: z.string().url('Avatar must be a valid URL').nullable().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmNewPassword: z.string(),
});

export const idParamSchema = z.object({ id: z.string().min(1) });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
