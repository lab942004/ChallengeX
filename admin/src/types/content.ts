export interface ChallengeCategory {
  id: string;
  name: string;
  description: string | null;
  order: number;
  active: boolean;
  _count?: { questions: number };
}

export interface ChallengeQuestion {
  id: string;
  categoryId: string;
  question: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  explanation: string | null;
  order: number;
  active: boolean;
  category?: { id: string; name: string };
}

export interface RiskRule {
  id: string;
  name: string;
  description: string;
  category: string | null;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  threshold: number | null;
  active: boolean;
  createdAt: string;
}

export interface RoadmapTemplate {
  id: string;
  name: string;
  description: string | null;
  order: number;
  objective: string;
  tasks: string[];
  deliverables: string[];
  estimatedEffort: string;
  active: boolean;
}

export interface AdminExperiment {
  id: string;
  title: string;
  description: string;
  steps: string[];
  successMetric: string;
  estimatedCost: string;
  duration: string;
  status: string;
  createdAt: string;
  trial: {
    id: string;
    verdict: string | null;
    score: number | null;
    idea: { title: string };
    user: { id: string; name: string; email: string };
  };
}

export interface AdminAnalytics {
  totals: {
    users: number;
    admins: number;
    ideas: number;
    trials: number;
    completedTrials: number;
    activeTrials: number;
    experiments: number;
    roadmaps: number;
    notifications: number;
    questions: number;
    categories: number;
    riskRules: number;
    roadmapTemplates: number;
  };
  verdictDistribution: { verdict: string; count: number }[];
  trialsByMode: { mode: string; count: number }[];
  averageScore: number;
  signupsByDay: { date: string; count: number }[];
  recentUsers: { id: string; name: string; email: string; role: string; createdAt: string }[];
}

export interface SettingRecord {
  key: string;
  value: unknown;
  updatedAt: string;
}
