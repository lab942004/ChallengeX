export type TrialMode =
  | 'STRESS_TEST'
  | 'BRUTAL_MODE'
  | 'X100_MODE'
  | 'COMPETITOR_MODE'
  | 'FAILURE_MODE';

export type TrialStatus = 'ACTIVE' | 'COMPLETED' | 'ABANDONED';
export type Verdict = 'BUILD' | 'PIVOT' | 'VALIDATE' | 'KILL';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface TrialQuestion {
  id: string;
  category: string;
  question: string;
  order: number;
  riskLevel: RiskLevel;
  explanation: string | null;
  answer: string | null;
}

export interface Trial {
  id: string;
  userId: string;
  ideaId: string;
  mode: TrialMode;
  status: TrialStatus;
  currentQuestion: number;
  score: number | null;
  verdict: Verdict | null;
  createdAt: string;
  completedAt: string | null;
}

export interface TrialListItem extends Trial {
  ideaTitle: string;
  answeredCount: number;
  questionCount: number;
}

export interface TrialDetail extends Trial {
  idea: { id: string; title: string; description: string };
  questions: TrialQuestion[];
}
