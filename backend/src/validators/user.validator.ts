import { z } from 'zod';
import { Role } from '@prisma/client';

export const availabilityQuerySchema = z.object({
  email: z.string().trim().email().toLowerCase().optional(),
  username: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9_]+$/)
    .min(3)
    .max(30)
    .optional(),
});

export const adminUpdateUserSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  username: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9_]+$/)
    .min(3)
    .max(30)
    .optional(),
  email: z.string().trim().email().toLowerCase().optional(),
  role: z.nativeEnum(Role).optional(),
  avatar: z.string().url().nullable().optional(),
});

export const adminCreateUserSchema = z.object({
  name: z.string().trim().min(2).max(80),
  username: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9_]+$/)
    .min(3)
    .max(30),
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(8).max(128),
  role: z.nativeEnum(Role),
});

export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;
export type AdminUpdateUserInput = z.infer<typeof adminUpdateUserSchema>;
export type AdminCreateUserInput = z.infer<typeof adminCreateUserSchema>;
