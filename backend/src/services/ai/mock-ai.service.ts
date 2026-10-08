import { Priority, RiskLevel, Severity, TrialMode, Verdict } from '@prisma/client';
import { verdictForScore } from '../../constants';
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
  ScoreBreakdownEntry,
  VerdictResult,
} from './ai.service';

/**
 * MockAIService — deterministic, dependency-free initial implementation of
 * the AI contract. It produces stable, sensible output from the trial data
 * so the entire product flow works without external AI credentials.
 * A real provider can be swapped in via AIProviderService later without
 * touching controllers or services.
 */

const CATEGORY_QUESTIONS: Record<
  string,
  { question: string; riskLevel: RiskLevel; explanation: string }[]
> = {
  Technical: [
    { question: 'Can this idea be built with technology your team can realistically access in the next 90 days?', riskLevel: RiskLevel.MEDIUM, explanation: 'Flags technical feasibility and skill gaps early.' },
    { question: 'What is the hardest technical dependency in this idea, and what happens if it fails?', riskLevel: RiskLevel.HIGH, explanation: 'Surfaces single points of technical failure.' },
    { question: 'Does the product need data, integrations, or infrastructure you do not yet have?', riskLevel: RiskLevel.HIGH, explanation: 'Hidden infrastructure cost is a common silent killer.' },
  ],
  Market: [
    { question: 'Who exactly pays for this, and how often do they encounter the problem?', riskLevel: RiskLevel.HIGH, explanation: 'Confirms a real, repeatable market need.' },
    { question: 'What evidence do you have that customers will switch from their current solution?', riskLevel: RiskLevel.HIGH, explanation: 'Switching cost is the most underestimated market risk.' },
    { question: 'Is the market growing, shrinking, or seasonal right now?', riskLevel: RiskLevel.MEDIUM, explanation: 'Timing can outweigh product quality.' },
  ],
  Social: [
    { question: 'Would your target users be comfortable publicly adopting this product?', riskLevel: RiskLevel.MEDIUM, explanation: 'Social acceptance drives organic adoption.' },
    { question: 'Does this idea create any community, trust, or reputation risk?', riskLevel: RiskLevel.MEDIUM, explanation: 'Reputation damage is hard to reverse.' },
    { question: 'Who are the vocal opponents of this idea and what is their strongest argument?', riskLevel: RiskLevel.HIGH, explanation: 'Knowing the best counter-argument sharpens positioning.' },
  ],
  Financial: [
    { question: 'What is the estimated cost to reach first revenue, and can you fund it?', riskLevel: RiskLevel.CRITICAL, explanation: 'Runway mismatch kills more startups than bad products.' },
    { question: 'What are the expected unit economics — acquisition cost versus lifetime value?', riskLevel: RiskLevel.HIGH, explanation: 'Unsustainable unit economics cannot be fixed by growth.' },
    { question: 'How will the idea make money within the first six months?', riskLevel: RiskLevel.CRITICAL, explanation: 'Delayed monetization needs a deliberate funding plan.' },
  ],
  Legal: [
    { question: 'Are there regulations, licenses, or compliance requirements in this domain?', riskLevel: RiskLevel.HIGH, explanation: 'Regulatory blockers can invalidate an otherwise strong idea.' },
    { question: 'Could this idea infringe existing patents, trademarks, or data-protection rules?', riskLevel: RiskLevel.HIGH, explanation: 'IP conflicts are expensive to discover late.' },
    { question: 'Who owns the data you collect, and is that legally sound?', riskLevel: RiskLevel.MEDIUM, explanation: 'Data ownership shapes trust and compliance.' },
  ],
  Scalability: [
    { question: 'Does the operating cost grow linearly with every new customer?', riskLevel: RiskLevel.HIGH, explanation: 'Linear cost growth caps margins at scale.' },
    { question: 'Can the delivery model handle 100x users without a full rebuild?', riskLevel: RiskLevel.MEDIUM, explanation: 'Architecture decisions made now constrain future growth.' },
    { question: 'Will support and quality hold up as volume increases?', riskLevel: RiskLevel.MEDIUM, explanation: 'Quality collapse at scale destroys retention.' },
  ],
  Competition: [
    { question: 'Who would copy this idea within 90 days of it working, and how would you respond?', riskLevel: RiskLevel.HIGH, explanation: 'Fast followers are inevitable for good ideas.' },
    { question: 'What durable advantage protects you after the first competitor appears?', riskLevel: RiskLevel.CRITICAL, explanation: 'Without a moat, success attracts displacement.' },
    { question: 'Which existing product is the customer’s real alternative today?', riskLevel: RiskLevel.MEDIUM, explanation: 'The true competitor is often “doing nothing”.' },
  ],
};

const MODE_EMPHASIS: Record<TrialMode, string[]> = {
  STRESS_TEST: ['Market', 'Technical'],
  BRUTAL_MODE: ['Financial', 'Competition'],
  X100_MODE: ['Scalability', 'Market'],
  COMPETITOR_MODE: ['Competition', 'Market'],
  FAILURE_MODE: ['Financial', 'Legal'],
};

const POSITIVE_SIGNALS = [
  'yes', 'validated', 'proven', 'confirmed', 'customers', 'revenue', 'demand', 'evidence',
  'tested', 'strong', 'clear', 'growing', 'profitable', 'differentiated', 'advantage',
  'committed', 'funded', 'stable', 'low', 'easy', 'fast',
];
const NEGATIVE_SIGNALS = [
  'no', 'unsure', 'unclear', 'risky', 'expensive', 'nothing', 'never', 'hard', 'difficult',
  'blocked', 'regulated', 'unproven', 'guess', 'assume', 'unlimited', 'everyone', 'later',
  'linear', 'cheap', 'weak',
];

function scoreAnswer(answer: string): number {
  const text = answer.toLowerCase();
  const words = text.split(/[^a-z]+/).filter(Boolean);
  if (words.length === 0) return 30;
  let positive = 0;
  let negative = 0;
  for (const word of words) {
    if (POSITIVE_SIGNALS.includes(word)) positive += 1;
    if (NEGATIVE_SIGNALS.includes(word)) negative += 1;
  }
  const lengthBonus = Math.min(20, Math.floor(words.length / 4));
  const raw = 55 + positive * 9 - negative * 8 + lengthBonus;
  return Math.max(5, Math.min(98, raw));
}

function categoryScores(answers: AnswerForAnalysis[]): ScoreBreakdownEntry[] {
  const buckets = new Map<string, number[]>();
  for (const a of answers) {
    const list = buckets.get(a.category) ?? [];
    list.push(scoreAnswer(a.answer));
    buckets.set(a.category, list);
  }
  return Array.from(buckets.entries()).map(([category, scores]) => ({
    category,
    score: Math.round(scores.reduce((s, n) => s + n, 0) / scores.length),
  }));
}

function truncate(text: string, max = 120): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

const IDEA_TEMPLATES: Omit<GeneratedIdea, 'title'>[] = [
  {
    problem: 'People dealing with this problem lose hours because existing tools were not designed for their workflow.',
    solution: 'A focused platform that combines modern tooling with automation to remove the hardest step.',
    targetUsers: 'Professionals and hobbyists who face this problem weekly.',
    whyNow: 'AI tooling and modern frameworks make this buildable by a small team in weeks, not months.',
    businessModel: 'Tiered subscription with a free trial tier and a premium automation layer.',
  },
  {
    problem: 'This process is still solved with spreadsheets, memory and luck.',
    solution: 'A guided workflow that turns messy processes into repeatable, measurable steps.',
    targetUsers: 'Small teams without dedicated specialists.',
    whyNow: 'Remote work made digital-first workflows the default expectation for this audience.',
    businessModel: 'Per-seat SaaS pricing with usage-based add-ons for heavy automation.',
  },
  {
    problem: 'Existing solutions are either too generic or too expensive for early adopters.',
    solution: 'A niche, opinionated product that delivers one outcome extremely well.',
    targetUsers: 'Early adopters actively searching for better tooling.',
    whyNow: 'Community-driven distribution lets a niche product reach its audience without ad budgets.',
    businessModel: 'One-time purchase plus a support/updates plan for predictable revenue.',
  },
  {
    problem: 'Decision-makers cannot see the true cost of this problem until it is too late.',
    solution: 'An analytics layer that surfaces risk and cost signals from everyday activity.',
    targetUsers: 'Team leads and founders accountable for outcomes.',
    whyNow: 'Data pipelines and dashboards are cheaper than ever to integrate and maintain.',
    businessModel: 'B2B subscription with onboarding fee and enterprise reporting tier.',
  },
  {
    problem: 'Newcomers abandon their goals because the first 30 days are confusing.',
    solution: 'A gamified onboarding companion that coaches users to their first win.',
    targetUsers: 'Beginners with high intent but low guidance.',
    whyNow: 'Expectations for guided, interactive learning are now mainstream.',
    businessModel: 'Freemium with premium coaching modules and partner-sponsored content.',
  },
];

const IDEA_PREFIXES = ['Forge', 'Aegis', 'Rune', 'Citadel', 'Ember'];
const IDEA_SUFFIXES = ['Companion', 'Workflow', 'Engine', 'Signal', 'Path'];

export class MockAIService implements AIService {
  async generateIdea(input: IdeaGenerationInput): Promise<GeneratedIdea[]> {
    const count = Math.min(5, Math.max(3, input.count ?? 3));
    const interest = (input.interests[0] ?? 'technology').trim();
    const skill = (input.skills[0] ?? 'building products').trim();
    const problem = (input.problemArea || 'a daily frustration').trim();
    const capitalizedInterest = interest.charAt(0).toUpperCase() + interest.slice(1);

    return IDEA_TEMPLATES.slice(0, count).map((template, i) => ({
      ...template,
      title: `${IDEA_PREFIXES[i]} ${capitalizedInterest} — ${IDEA_SUFFIXES[i]}`,
      problem: `People in ${interest} lose time on ${problem}: ${template.problem}`,
      solution: `${template.solution} Built with ${skill}.`,
      targetUsers: `${template.targetUsers} Focus: ${interest}.`,
    }));
  }

  async generateQuestions(input: QuestionGenerationInput): Promise<GeneratedQuestion[]> {
    const count = input.count ?? 7;
    const emphasis = MODE_EMPHASIS[input.mode] ?? [];
    const ideaSnippet = truncate(input.ideaText, 80);

    const orderedCategories = [
      ...emphasis,
      ...Object.keys(CATEGORY_QUESTIONS).filter((c) => !emphasis.includes(c)),
    ];

    const questions: GeneratedQuestion[] = [];
    let order = 1;
    for (const category of orderedCategories) {
      if (questions.length >= count) break;
      const bank = CATEGORY_QUESTIONS[category];
      const base = bank[order % bank.length];
      questions.push({
        category,
        question: `${base.question} (Context: "${ideaSnippet}")`,
        riskLevel: base.riskLevel,
        explanation: base.explanation,
        order: order++,
      });
    }
    return questions;
  }

  async analyzeTrial(answers: AnswerForAnalysis[]): Promise<VerdictResult> {
    return this.generateVerdict(answers);
  }

  async generateVerdict(answers: AnswerForAnalysis[]): Promise<VerdictResult> {
    const breakdown = categoryScores(answers);
    const overall =
      breakdown.length === 0
        ? 0
        : Math.round(breakdown.reduce((sum, b) => sum + b.score, 0) / breakdown.length);
    const verdict: Verdict = verdictForScore(overall);
    const weakest = [...breakdown].sort((a, b) => a.score - b.score)[0];
    const strongest = [...breakdown].sort((a, b) => b.score - a.score)[0];

    const summary =
      breakdown.length === 0
        ? 'No answers were analysed. Complete every trial question to forge a verdict.'
        : `Strongest ground: ${strongest.category} (${strongest.score}). ` +
          `Weakest ground: ${weakest.category} (${weakest.score}). ` +
          `Overall market readiness is ${overall}/100 → ${verdict}.`;

    return { score: overall, verdict, summary, breakdown };
  }

  async generateAssumptions(answers: AnswerForAnalysis[]): Promise<GeneratedAssumption[]> {
    return answers.slice(0, 5).map((a) => ({
      title: `${a.category} assumption`,
      description: `The idea assumes that: ${truncate(a.answer, 160)}`,
      risk:
        a.answer.toLowerCase().includes('no') || a.answer.toLowerCase().includes('unsure')
          ? 'HIGH'
          : 'MEDIUM',
      evidence: `Source: "${truncate(a.question, 100)}"`,
      validationMethod: `Run a focused ${a.category.toLowerCase()} test with 5–10 target users within 2 weeks.`,
    }));
  }

  async generateRisks(answers: AnswerForAnalysis[]): Promise<GeneratedRisk[]> {
    const scored = answers
      .map((a) => ({ ...a, value: scoreAnswer(a.answer) }))
      .sort((a, b) => a.value - b.value)
      .slice(0, 4);

    return scored.map((a) => ({
      title: `${a.category} risk in execution`,
      description: `Answering "${truncate(a.answer, 100)}" indicates exposure in ${a.category.toLowerCase()}.`,
      severity:
        a.value < 35 ? Severity.CRITICAL : a.value < 50 ? Severity.HIGH : Severity.MEDIUM,
      evidence: truncate(a.question, 140),
    }));
  }

  async generateRecommendations(
    answers: AnswerForAnalysis[],
  ): Promise<GeneratedRecommendation[]> {
    const weakest = answers
      .map((a) => ({ ...a, value: scoreAnswer(a.answer) }))
      .sort((a, b) => a.value - b.value)
      .slice(0, 4);

    const priorities: Priority[] = [Priority.HIGH, Priority.HIGH, Priority.MEDIUM, Priority.LOW];
    return weakest.map((a, i) => ({
      title: `De-risk ${a.category.toLowerCase()} before building`,
      description: `Validate "${truncate(a.question, 110)}" with real evidence — interviews, pre-orders, or a concierge test.`,
      priority: priorities[i] ?? Priority.MEDIUM,
    }));
  }

  async generateAlternativeDirections(
    result: VerdictResult,
  ): Promise<AlternativeDirection[]> {
    const directionByVerdict: Record<Verdict, AlternativeDirection[]> = {
      BUILD: [
        { title: 'Double down on the winning segment', description: 'Increase investment in the highest-scoring category and expand adjacent features.' },
        { title: 'Move upmarket', description: 'Repackage the validated offer for higher-value customers.' },
      ],
      VALIDATE: [
        { title: 'Narrow to a beachhead', description: 'Serve one sharp segment first and prove retention before broadening.' },
        { title: 'Pre-sell before building', description: 'Run a landing-page or pre-order campaign to convert interest into commitment.' },
      ],
      PIVOT: [
        { title: 'Pivot the audience', description: 'Keep the core capability but retarget a different buyer with urgent pain.' },
        { title: 'Pivot the model', description: 'Shift from product sale to service, marketplace, or API-led delivery.' },
        { title: 'Pivot the problem', description: 'Reuse your technical asset to solve a better-paying adjacent problem.' },
      ],
      KILL: [
        { title: 'Archive and mine the insight', description: 'Preserve the learnings; the same research often unlocks a stronger idea.' },
        { title: 'Reverse-engineer the demand', description: 'Identify which scarce resource people already pay for and start there instead.' },
      ],
    };
    return directionByVerdict[result.verdict];
  }

  async generateExperiment(result: VerdictResult, ideaText: string): Promise<GeneratedExperiment> {
    const sorted = [...result.breakdown].sort((a, b) => a.score - b.score);
    const focus = sorted[0]?.category ?? 'Market';
    const focusScore = sorted[0]?.score ?? 0;
    return {
      title: `${focus} validation sprint for "${truncate(ideaText, 40)}"`,
      description: `A time-boxed experiment designed to attack the weakest category (${focus}, score ${focusScore}) before committing build budget.`,
      steps: [
        `Write 3 falsifiable hypotheses about ${focus.toLowerCase()} risk`,
        'Recruit 8–12 target users matching the ideal customer profile',
        'Run structured interviews and one concierge-style pilot',
        'Measure willingness to pay with a real (not hypothetical) offer',
        'Score results against the success metric and decide: continue, pivot, or stop',
      ],
      successMetric: `At least 4 of 12 target users commit to a paid pilot or deposit for ${focus.toLowerCase()} validation.`,
      estimatedCost: 'Under $500 and 2 weeks of time',
      duration: '14 days',
    };
  }

  async generateRoadmap(result: VerdictResult, ideaText: string): Promise<GeneratedRoadmapStage[]> {
    const seed = truncate(ideaText, 40);
    return [
      {
        title: 'VALIDATE',
        description: `Prove the riskiest assumptions behind "${seed}" before writing serious code.`,
        objective: 'Confirm real demand and willingness to pay.',
        tasks: ['Interview 10+ target users', 'Run the validation experiment', 'Score results against the success metric'],
        deliverables: ['Evidence log', 'Go/no-go decision memo'],
        estimatedEffort: '1–2 weeks',
      },
      {
        title: 'SPECIFY',
        description: 'Turn validated learning into a precise product specification.',
        objective: 'Define scope, success metrics, and non-goals.',
        tasks: ['Write user stories', 'Define MVP boundary', 'Prioritise the backlog'],
        deliverables: ['PRD', 'Prioritised backlog'],
        estimatedEffort: '1 week',
      },
      {
        title: 'DESIGN',
        description: 'Design the core experience that delivers the promise.',
        objective: 'Produce a usable, testable design of the critical flow.',
        tasks: ['Map user flows', 'Create wireframes', 'Test prototypes with users'],
        deliverables: ['Prototype', 'Usability test report'],
        estimatedEffort: '1–2 weeks',
      },
      {
        title: 'BLUEPRINT',
        description: 'Architect the system for the expected first 1,000 users.',
        objective: 'Lock technical architecture and data model.',
        tasks: ['Choose the stack', 'Design the schema', 'Plan integrations'],
        deliverables: ['Architecture diagram', 'Data model'],
        estimatedEffort: '3–5 days',
      },
      {
        title: 'PROTOTYPE',
        description: 'Build the end-to-end thin slice of the product.',
        objective: 'Ship a working vertical slice to real users.',
        tasks: ['Implement core flow', 'Instrument analytics', 'Internal dogfooding'],
        deliverables: ['Working prototype', 'Bug list'],
        estimatedEffort: '2–4 weeks',
      },
      {
        title: 'LAUNCH',
        description: `Launch "${seed}" to the beachhead segment and measure retention.`,
        objective: 'Acquire first users and learn fast.',
        tasks: ['Launch to beachhead segment', 'Collect feedback', 'Iterate weekly'],
        deliverables: ['Public launch', 'Retention dashboard'],
        estimatedEffort: '1–2 weeks',
      },
    ];
  }
}





