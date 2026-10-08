import { Verdict } from './trial';

export interface ScoreBreakdownEntry {
  category: string;
  score: number;
}

export interface Assumption {
  id: string;
  title: string;
  description: string;
  risk: string;
  evidence: string;
  validationMethod: string;
}

export interface Risk {
  id: string;
  title: string;
  description: string;
  severity: string;
  evidence: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: string;
}

export interface AlternativeDirection {
  title: string;
  description: string;
}

export interface ValidationExperiment {
  id: string;
  title: string;
  description: string;
  steps: string[];
  successMetric: string;
  estimatedCost: string;
  duration: string;
  status: string;
}

export interface VerdictPayload {
  trialId: string;
  ideaTitle: string;
  score: number;
  verdict: Verdict;
  summary: string;
  breakdown: ScoreBreakdownEntry[];
  assumptions: Assumption[];
  risks: Risk[];
  recommendations: Recommendation[];
  alternativeDirections: AlternativeDirection[];
  experiment: ValidationExperiment | null;
  completedAt: string | null;
}
