import { RiskLevel, Severity, Priority, TrialMode, Verdict } from '@prisma/client';

/**
 * AIService — the single AI contract for the whole backend.
 *
 * Frontend and Admin NEVER call an AI provider directly; they go:
 *   Frontend/Admin → Backend API → AIService → (Mock | Provider)
 */

export interface GeneratedQuestion {
  category: string;
  question: string;
  riskLevel: RiskLevel;
  explanation: string;
  order: number;
}

export interface QuestionGenerationInput {
  ideaText: string;
  mode: TrialMode;
  count?: number;
}

export interface GeneratedIdea {
  title: string;
  problem: string;
  solution: string;
  targetUsers: string;
  whyNow: string;
  businessModel: string;
}

export interface IdeaGenerationInput {
  interests: string[];
  skills: string[];
  problemArea: string;
  count?: number;
}

export interface AnswerForAnalysis {
  category: string;
  question: string;
  answer: string;
}

export interface ScoreBreakdownEntry {
  category: string;
  score: number;
}

export interface VerdictResult {
  score: number;
  verdict: Verdict;
  summary: string;
  breakdown: ScoreBreakdownEntry[];
}

export interface GeneratedAssumption {
  title: string;
  description: string;
  risk: string;
  evidence: string;
  validationMethod: string;
}

export interface GeneratedRisk {
  title: string;
  description: string;
  severity: Severity;
  evidence: string;
}

export interface GeneratedRecommendation {
  title: string;
  description: string;
  priority: Priority;
}

export interface AlternativeDirection {
  title: string;
  description: string;
}

export interface GeneratedExperiment {
  title: string;
  description: string;
  steps: string[];
  successMetric: string;
  estimatedCost: string;
  duration: string;
}

export interface GeneratedRoadmapStage {
  title: string;
  description: string;
  objective: string;
  tasks: string[];
  deliverables: string[];
  estimatedEffort: string;
}

export interface AIService {
  generateIdea(input: IdeaGenerationInput): Promise<GeneratedIdea[]>;
  generateQuestions(input: QuestionGenerationInput): Promise<GeneratedQuestion[]>;
  analyzeTrial(answers: AnswerForAnalysis[]): Promise<VerdictResult>;
  generateVerdict(answers: AnswerForAnalysis[]): Promise<VerdictResult>;
  generateAssumptions(answers: AnswerForAnalysis[]): Promise<GeneratedAssumption[]>;
  generateRisks(answers: AnswerForAnalysis[]): Promise<GeneratedRisk[]>;
  generateRecommendations(answers: AnswerForAnalysis[]): Promise<GeneratedRecommendation[]>;
  generateAlternativeDirections(result: VerdictResult): Promise<AlternativeDirection[]>;
  generateExperiment(result: VerdictResult, ideaText: string): Promise<GeneratedExperiment>;
  generateRoadmap(result: VerdictResult, ideaText: string): Promise<GeneratedRoadmapStage[]>;
}
