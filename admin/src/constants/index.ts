/** Admin-local constants. */

export const ADMIN_ROUTES = {
  login: '/admin/login',
  dashboard: '/admin',
  users: '/admin/users',
  ideas: '/admin/ideas',
  trials: '/admin/trials',
  questions: '/admin/questions',
  categories: '/admin/categories',
  riskRules: '/admin/risk-rules',
  roadmaps: '/admin/roadmaps',
  experiments: '/admin/experiments',
  analytics: '/admin/analytics',
  settings: '/admin/settings',
  admins: '/admin/admins',
} as const;

export const NAV_SECTIONS: {
  label: string;
  items: { to: string; label: string; superAdminOnly?: boolean }[];
}[] = [
  {
    label: 'Overview',
    items: [
      { to: ADMIN_ROUTES.dashboard, label: 'Dashboard' },
      { to: ADMIN_ROUTES.analytics, label: 'Analytics' },
    ],
  },
  {
    label: 'Content',
    items: [
      { to: ADMIN_ROUTES.ideas, label: 'Ideas' },
      { to: ADMIN_ROUTES.trials, label: 'Trials' },
      { to: ADMIN_ROUTES.experiments, label: 'Experiments' },
    ],
  },
  {
    label: 'People',
    items: [{ to: ADMIN_ROUTES.users, label: 'Users' }],
  },
  {
    label: 'Challenge Engine',
    items: [
      { to: ADMIN_ROUTES.questions, label: 'Questions' },
      { to: ADMIN_ROUTES.categories, label: 'Categories' },
      { to: ADMIN_ROUTES.riskRules, label: 'Risk Rules' },
      { to: ADMIN_ROUTES.roadmaps, label: 'Roadmaps' },
    ],
  },
  {
    label: 'Administration',
    items: [
      { to: ADMIN_ROUTES.admins, label: 'Admins', superAdminOnly: true },
      { to: ADMIN_ROUTES.settings, label: 'Settings', superAdminOnly: true },
    ],
  },
];

export const SEVERITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
export const RISK_LEVEL_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
export const TRIAL_STATUS_OPTIONS = ['ACTIVE', 'COMPLETED', 'ABANDONED'] as const;
export const VERDICT_OPTIONS = ['BUILD', 'PIVOT', 'VALIDATE', 'KILL'] as const;
