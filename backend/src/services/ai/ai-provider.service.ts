import { env } from '../../config/env';
import { serviceUnavailable } from '../../utils/errors';
import {
  AIService,
  AnswerForAnalysis,
  AlternativeDirection,
  GeneratedAssumption,
  GeneratedExperiment,
  GeneratedIdea,
  GeneratedQuestion,
  GeneratedRecommendation,
  GeneratedRisk,
  GeneratedRoadmapStage,
  IdeaGenerationInput,
  QuestionGenerationInput,
  VerdictResult,
} from './ai.service';

/**
 * AIProviderService — future implementation that talks to a real
 * AI provider (OpenAI/Anthropic/…) using AI_API_KEY.
 *
 * It is intentionally a stub: every method fails fast with 503 until a
 * provider integration is configured. The factory in index.ts falls back
 * to MockAIService whenever no provider key is present, so the product
 * always works end-to-end.
 *
 * IMPORTANT: AI calls are only ever made from the backend. Neither the
 * frontend nor the admin app may call an AI provider directly.
 */
export class AIProviderService implements AIService {
  private assertConfigured(): never {
    if (!env.AI_API_KEY) {
      throw serviceUnavailable(
        'AI provider is not configured. Set AI_API_KEY (or use AI_PROVIDER=mock).',
      );
    }
    throw serviceUnavailable('AI provider integration is not implemented yet.');
  }

  generateIdea(_input: IdeaGenerationInput): Promise<GeneratedIdea[]> {
    this.assertConfigured();
  }
  generateQuestions(_input: QuestionGenerationInput): Promise<GeneratedQuestion[]> {
    this.assertConfigured();
  }
  analyzeTrial(_answers: AnswerForAnalysis[]): Promise<VerdictResult> {
    this.assertConfigured();
  }
  generateVerdict(_answers: AnswerForAnalysis[]): Promise<VerdictResult> {
    this.assertConfigured();
  }
  generateAssumptions(_answers: AnswerForAnalysis[]): Promise<GeneratedAssumption[]> {
    this.assertConfigured();
  }
  generateRisks(_answers: AnswerForAnalysis[]): Promise<GeneratedRisk[]> {
    this.assertConfigured();
  }
  generateRecommendations(_answers: AnswerForAnalysis[]): Promise<GeneratedRecommendation[]> {
    this.assertConfigured();
  }
  generateAlternativeDirections(_result: VerdictResult): Promise<AlternativeDirection[]> {
    this.assertConfigured();
  }
  generateExperiment(_result: VerdictResult, _ideaText: string): Promise<GeneratedExperiment> {
    this.assertConfigured();
  }
  generateRoadmap(_result: VerdictResult, _ideaText: string): Promise<GeneratedRoadmapStage[]> {
    this.assertConfigured();
  }
}
