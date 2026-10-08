/** Frontend-local constants — independent from backend/admin. */

export const ROUTES = {
  home: '/',
  login: '/login',
  signup: '/signup',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  gate: '/gate',
  paths: '/paths',
  idea: '/idea',
  trial: '/trial',
  verdict: '/verdict',
  generate: '/generate',
  roadmap: '/roadmap',
  history: '/history',
  dashboard: '/dashboard',
  profile: '/profile',
  notifications: '/notifications',
} as const;

export const TRIAL_MODES: {
  value: 'STRESS_TEST' | 'BRUTAL_MODE' | 'X100_MODE' | 'COMPETITOR_MODE' | 'FAILURE_MODE';
  label: string;
  description: string;
}[] = [
  { value: 'STRESS_TEST', label: 'Stress Test', description: 'Push every assumption to its limit.' },
  { value: 'BRUTAL_MODE', label: 'Brutal Mode', description: 'No mercy. Pure honest feedback.' },
  { value: 'X100_MODE', label: '100x Mode', description: 'Think at massive scale, from day one.' },
  { value: 'COMPETITOR_MODE', label: 'Competitor Mode', description: 'Face your fiercest rivals.' },
  { value: 'FAILURE_MODE', label: 'Failure Mode', description: 'Assume it fails. Find out why.' },
];

export const TRIAL_CATEGORIES = [
  'Technical',
  'Market',
  'Social',
  'Financial',
  'Legal',
  'Scalability',
  'Competition',
] as const;

export const VERDICT_LABELS: Record<string, string> = {
  BUILD: 'Build',
  PIVOT: 'Pivot',
  VALIDATE: 'Validate',
  KILL: 'Kill',
};

export const VERDICT_DESCRIPTIONS: Record<string, string> = {
  BUILD: 'The evidence supports building this idea now.',
  PIVOT: 'The core insight is real, but the direction must change.',
  VALIDATE: 'Promising, but the riskiest assumptions need proof first.',
  KILL: 'The risks outweigh the opportunity — walk away or reinvent.',
};

export const LOADING_MESSAGES = [
  'ENTERING THE REALM...',
  'FORGING YOUR TRIAL...',
  'ANALYZING YOUR IDEA...',
  'FORGING YOUR VERDICT...',
  'BUILDING YOUR ROADMAP...',
] as const;

export const IDEAL_CHAR_LIMIT = 500;
