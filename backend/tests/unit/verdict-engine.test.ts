import { describe, expect, it } from 'vitest';
import { MockAIService } from '../../src/services/ai/mock-ai.service';
import { AnswerForAnalysis } from '../../src/services/ai/ai.service';

const ai = new MockAIService();

const strongAnswers: AnswerForAnalysis[] = [
  { category: 'Market', question: 'Who pays?', answer: 'Yes, customers pay monthly, proven demand, validated with interviews, clear growing revenue evidence.' },
  { category: 'Financial', question: 'Can you fund it?', answer: 'Funded, low cost, profitable unit economics, strong margins confirmed, stable revenue.' },
  { category: 'Technical', question: 'Buildable?', answer: 'Yes, proven stack, fast to build, clear architecture, tested components, easy integration.' },
];

const weakAnswers: AnswerForAnalysis[] = [
  { category: 'Market', question: 'Who pays?', answer: 'No idea, unsure, guess, everyone maybe, unclear demand, risky assumption, never tested.' },
  { category: 'Financial', question: 'Can you fund it?', answer: 'Expensive, no money, hard, unclear costs, risky, expensive infrastructure, weak.' },
  { category: 'Legal', question: 'Regulated?', answer: 'Blocked by regulation, unclear legal basis, risky, no licence, difficult compliance.' },
];

describe('MockAIService verdict engine', () => {
  it('scores strong answers higher than weak answers', async () => {
    const strong = await ai.generateVerdict(strongAnswers);
    const weak = await ai.generateVerdict(weakAnswers);
    expect(strong.score).toBeGreaterThan(weak.score);
    expect(strong.score).toBeGreaterThanOrEqual(0);
    expect(strong.score).toBeLessThanOrEqual(100);
  });

  it('returns a verdict from the allowed set', async () => {
    const result = await ai.generateVerdict(strongAnswers);
    expect(['BUILD', 'PIVOT', 'VALIDATE', 'KILL']).toContain(result.verdict);
  });

  it('produces BUILD for clearly strong answers and KILL for clearly weak ones', async () => {
    const strong = await ai.generateVerdict(strongAnswers);
    const weak = await ai.generateVerdict(weakAnswers);
    expect(strong.verdict).toBe('BUILD');
    expect(weak.verdict).toBe('KILL');
  });

  it('produces a per-category score breakdown', async () => {
    const result = await ai.generateVerdict(strongAnswers);
    expect(result.breakdown).toHaveLength(3);
    for (const entry of result.breakdown) {
      expect(entry.score).toBeGreaterThanOrEqual(0);
      expect(entry.score).toBeLessThanOrEqual(100);
    }
  });

  it('handles an empty answer list gracefully', async () => {
    const result = await ai.generateVerdict([]);
    expect(result.score).toBe(0);
    expect(result.summary).toContain('No answers');
  });
});

describe('MockAIService generation', () => {
  it('generates 7 ordered questions covering multiple categories', async () => {
    const questions = await ai.generateQuestions({
      ideaText: 'A tool for finding co-founders',
      mode: 'STRESS_TEST',
    });
    expect(questions).toHaveLength(7);
    expect(questions.map((q) => q.order)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    const categories = new Set(questions.map((q) => q.category));
    expect(categories.size).toBeGreaterThanOrEqual(3);
  });

  it('generates 3–5 idea drafts with all required fields', async () => {
    const ideas = await ai.generateIdea({
      interests: ['health', 'AI'],
      skills: ['React', 'data analysis'],
      problemArea: 'appointment no-shows',
      count: 4,
    });
    expect(ideas.length).toBe(4);
    for (const idea of ideas) {
      expect(idea.title.length).toBeGreaterThan(0);
      expect(idea.problem.length).toBeGreaterThan(0);
      expect(idea.solution.length).toBeGreaterThan(0);
      expect(idea.targetUsers.length).toBeGreaterThan(0);
      expect(idea.whyNow.length).toBeGreaterThan(0);
      expect(idea.businessModel.length).toBeGreaterThan(0);
    }
  });

  it('generates a 6-stage roadmap', async () => {
    const stages = await ai.generateRoadmap(
      { score: 70, verdict: 'VALIDATE', summary: '', breakdown: [] },
      'Test idea',
    );
    expect(stages.map((s) => s.title)).toEqual([
      'VALIDATE',
      'SPECIFY',
      'DESIGN',
      'BLUEPRINT',
      'PROTOTYPE',
      'LAUNCH',
    ]);
  });

  it('generates alternative directions relevant to the verdict', async () => {
    const kill = await ai.generateAlternativeDirections({
      score: 20,
      verdict: 'KILL',
      summary: '',
      breakdown: [],
    });
    expect(kill.length).toBeGreaterThan(0);
  });
});
