import { env } from '../../config/env';
import { AIService } from './ai.service';
import { MockAIService } from './mock-ai.service';
import { AIProviderService } from './ai-provider.service';

export * from './ai.service';
export { MockAIService } from './mock-ai.service';
export { AIProviderService } from './ai-provider.service';

let instance: AIService | null = null;

/**
 * Returns the configured AIService.
 * - AI_PROVIDER=provider AND AI_API_KEY set → AIProviderService
 * - otherwise → MockAIService (works out of the box)
 *
 * All business logic depends only on the AIService interface, so swapping
 * implementations requires no controller/service changes.
 */
export function getAIService(): AIService {
  if (instance) return instance;
  if (env.AI_PROVIDER === 'provider' && env.AI_API_KEY) {
    instance = new AIProviderService();
  } else {
    instance = new MockAIService();
  }
  return instance;
}

/** Test hook — replace the AI implementation. */
export function setAIService(service: AIService | null): void {
  instance = service;
}
