import { Role } from '@prisma/client';

export { Role };

export const ROLES = ['USER', 'ADMIN', 'SUPER_ADMIN'] as const;

export function isAdminRole(role: Role | undefined): boolean {
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

export function isSuperAdmin(role: Role | undefined): boolean {
  return role === 'SUPER_ADMIN';
}

export const TRIAL_MODES = [
  'STRESS_TEST',
  'BRUTAL_MODE',
  'X100_MODE',
  'COMPETITOR_MODE',
  'FAILURE_MODE',
] as const;

export const TRIAL_CATEGORIES = [
  'Technical',
  'Market',
  'Social',
  'Financial',
  'Legal',
  'Scalability',
  'Competition',
] as const;

export const VERDICTS = ['BUILD', 'PIVOT', 'VALIDATE', 'KILL'] as const;

/** Score → verdict thresholds. Backend is the only place these are applied. */
export const VERDICT_THRESHOLDS = {
  build: 80,
  validate: 65,
  pivot: 45,
} as const;

export function verdictForScore(score: number): 'BUILD' | 'VALIDATE' | 'PIVOT' | 'KILL' {
  if (score >= VERDICT_THRESHOLDS.build) return 'BUILD';
  if (score >= VERDICT_THRESHOLDS.validate) return 'VALIDATE';
  if (score >= VERDICT_THRESHOLDS.pivot) return 'PIVOT';
  return 'KILL';
}

export const ROADMAP_STAGES = [
  'VALIDATE',
  'SPECIFY',
  'DESIGN',
  'BLUEPRINT',
  'PROTOTYPE',
  'LAUNCH',
] as const;

export const NOTIFICATION_TYPES = [
  'TRIAL_COMPLETED',
  'VERDICT_GENERATED',
  'ROADMAP_COMPLETED',
  'EXPERIMENT_CREATED',
  'SAVED_IDEA',
  'SYSTEM',
] as const;

export const API_PREFIX = '/api/v1';
