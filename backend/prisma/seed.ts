import 'dotenv/config';
import { PrismaClient, RiskLevel, Role, Severity } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const CATEGORIES: { name: string; description: string; order: number }[] = [
  { name: 'Technical', description: 'Feasibility, architecture and delivery risk.', order: 1 },
  { name: 'Market', description: 'Demand, timing and customer evidence.', order: 2 },
  { name: 'Social', description: 'Adoption, trust and reputational dynamics.', order: 3 },
  { name: 'Financial', description: 'Cost, runway and unit economics.', order: 4 },
  { name: 'Legal', description: 'Regulation, IP and compliance exposure.', order: 5 },
  { name: 'Scalability', description: 'Growth limits and operational leverage.', order: 6 },
  { name: 'Competition', description: 'Alternatives, moats and fast followers.', order: 7 },
];

const QUESTION_BANK: Record<
  string,
  { question: string; riskLevel: RiskLevel; explanation: string }[]
> = {
  Technical: [
    { question: 'Can this idea be built with technology your team can realistically access in the next 90 days?', riskLevel: RiskLevel.MEDIUM, explanation: 'Flags technical feasibility and skill gaps early.' },
    { question: 'What is the hardest technical dependency in this idea, and what happens if it fails?', riskLevel: RiskLevel.HIGH, explanation: 'Surfaces single points of technical failure.' },
  ],
  Market: [
    { question: 'Who exactly pays for this, and how often do they encounter the problem?', riskLevel: RiskLevel.HIGH, explanation: 'Confirms a real, repeatable market need.' },
    { question: 'What evidence do you have that customers will switch from their current solution?', riskLevel: RiskLevel.HIGH, explanation: 'Switching cost is the most underestimated market risk.' },
  ],
  Social: [
    { question: 'Would your target users be comfortable publicly adopting this product?', riskLevel: RiskLevel.MEDIUM, explanation: 'Social acceptance drives organic adoption.' },
  ],
  Financial: [
    { question: 'What is the estimated cost to reach first revenue, and can you fund it?', riskLevel: RiskLevel.CRITICAL, explanation: 'Runway mismatch kills more startups than bad products.' },
    { question: 'How will the idea make money within the first six months?', riskLevel: RiskLevel.CRITICAL, explanation: 'Delayed monetization needs a deliberate funding plan.' },
  ],
  Legal: [
    { question: 'Are there regulations, licenses, or compliance requirements in this domain?', riskLevel: RiskLevel.HIGH, explanation: 'Regulatory blockers can invalidate an otherwise strong idea.' },
  ],
  Scalability: [
    { question: 'Does the operating cost grow linearly with every new customer?', riskLevel: RiskLevel.HIGH, explanation: 'Linear cost growth caps margins at scale.' },
  ],
  Competition: [
    { question: 'What durable advantage protects you after the first competitor appears?', riskLevel: RiskLevel.CRITICAL, explanation: 'Without a moat, success attracts displacement.' },
    { question: 'Which existing product is the customer’s real alternative today?', riskLevel: RiskLevel.MEDIUM, explanation: 'The true competitor is often “doing nothing”.' },
  ],
};

const RISK_RULES: {
  name: string;
  description: string;
  category: string | null;
  severity: Severity;
  threshold: number | null;
}[] = [
  { name: 'No paying evidence', description: 'Trial verdicts where the Financial category scores below 40 are flagged for review.', category: 'Financial', severity: Severity.HIGH, threshold: 40 },
  { name: 'Regulatory exposure', description: 'Legal answers mentioning licences or compliance escalate the risk rule.', category: 'Legal', severity: Severity.CRITICAL, threshold: null },
  { name: 'Single-channel acquisition', description: 'Scalability scores below 50 trigger a growth-risk warning.', category: 'Scalability', severity: Severity.MEDIUM, threshold: 50 },
  { name: 'No defensible moat', description: 'Competition scores below 45 trigger a moat-building recommendation.', category: 'Competition', severity: Severity.HIGH, threshold: 45 },
  { name: 'Copycat exposure', description: 'Ideas completable in under 30 days get a fast-follower risk note.', category: 'Competition', severity: Severity.MEDIUM, threshold: 30 },
];

const ROADMAP_TEMPLATES: {
  name: string;
  description: string;
  order: number;
  objective: string;
  tasks: string[];
  deliverables: string[];
  estimatedEffort: string;
}[] = [
  { name: 'VALIDATE', description: 'Prove demand before writing serious code.', order: 1, objective: 'Confirm real demand and willingness to pay.', tasks: ['Interview 10+ target users', 'Run the validation experiment', 'Score results'], deliverables: ['Evidence log', 'Go/no-go memo'], estimatedEffort: '1–2 weeks' },
  { name: 'SPECIFY', description: 'Turn learning into a precise specification.', order: 2, objective: 'Define scope, success metrics, and non-goals.', tasks: ['Write user stories', 'Define MVP boundary', 'Prioritise backlog'], deliverables: ['PRD', 'Prioritised backlog'], estimatedEffort: '1 week' },
  { name: 'DESIGN', description: 'Design the core experience.', order: 3, objective: 'Produce a testable design of the critical flow.', tasks: ['Map user flows', 'Create wireframes', 'Test prototypes'], deliverables: ['Prototype', 'Usability report'], estimatedEffort: '1–2 weeks' },
  { name: 'BLUEPRINT', description: 'Architect the system.', order: 4, objective: 'Lock architecture and data model.', tasks: ['Choose the stack', 'Design the schema', 'Plan integrations'], deliverables: ['Architecture diagram', 'Data model'], estimatedEffort: '3–5 days' },
  { name: 'PROTOTYPE', description: 'Build the thin slice.', order: 5, objective: 'Ship a working vertical slice.', tasks: ['Implement core flow', 'Instrument analytics', 'Dogfood'], deliverables: ['Working prototype', 'Bug list'], estimatedEffort: '2–4 weeks' },
  { name: 'LAUNCH', description: 'Launch and learn.', order: 6, objective: 'Acquire first users and measure retention.', tasks: ['Launch to beachhead', 'Collect feedback', 'Iterate weekly'], deliverables: ['Public launch', 'Retention dashboard'], estimatedEffort: '1–2 weeks' },
];

async function upsertUser(
  email: string,
  username: string,
  password: string,
  name: string,
  role: Role,
) {
  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.user.upsert({
    where: { email },
    update: { role },
    create: { email, username, passwordHash, name, role },
  });
}

async function main() {
  console.log('Seeding ChallengeX database…');

  // ── Users: SUPER_ADMIN + ADMIN (credentials from environment only) ──
  await upsertUser(
    process.env.SEED_SUPER_ADMIN_EMAIL ?? 'superadmin@challengex.dev',
    'superadmin',
    process.env.SEED_SUPER_ADMIN_PASSWORD ?? 'ChangeMe_SuperAdmin1!',
    'Realm Sovereign',
    Role.SUPER_ADMIN,
  );
  await upsertUser(
    process.env.SEED_ADMIN_EMAIL ?? 'admin@challengex.dev',
    'admin',
    process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe_Admin1!',
    'Realm Warden',
    Role.ADMIN,
  );

  // ── Categories + questions ──
  for (const category of CATEGORIES) {
    const row = await prisma.challengeCategory.upsert({
      where: { name: category.name },
      update: { description: category.description, order: category.order },
      create: category,
    });
    const bank = QUESTION_BANK[category.name] ?? [];
    for (let i = 0; i < bank.length; i++) {
      const q = bank[i];
      const existing = await prisma.challengeQuestion.findFirst({
        where: { categoryId: row.id, question: q.question },
      });
      if (!existing) {
        await prisma.challengeQuestion.create({
          data: {
            categoryId: row.id,
            question: q.question,
            riskLevel: q.riskLevel,
            explanation: q.explanation,
            order: i + 1,
          },
        });
      }
    }
  }

  // ── Risk rules ──
  for (const rule of RISK_RULES) {
    await prisma.riskRule.upsert({
      where: { name: rule.name },
      update: { description: rule.description, severity: rule.severity, threshold: rule.threshold },
      create: rule,
    });
  }

  // ── Roadmap templates ──
  for (const template of ROADMAP_TEMPLATES) {
    const existing = await prisma.roadmapTemplate.findFirst({ where: { name: template.name } });
    if (!existing) {
      await prisma.roadmapTemplate.create({
        data: {
          name: template.name,
          description: template.description,
          order: template.order,
          objective: template.objective,
          tasks: template.tasks,
          deliverables: template.deliverables,
          estimatedEffort: template.estimatedEffort,
        },
      });
    }
  }

  // ── Default system settings ──
  const defaults: Record<string, unknown> = {
    'site.maintenanceMode': false,
    'site.registrationEnabled': true,
    'trial.defaultMode': 'STRESS_TEST',
    'trial.questionsPerTrial': 7,
    'brand.supportEmail': 'support@challengex.com',
  };
  for (const [key, value] of Object.entries(defaults)) {
    await prisma.systemSetting.upsert({
      where: { key },
      update: {},
      create: { key, value: value as never },
    });
  }

  console.log('Seed complete.');
  console.log(`  SUPER_ADMIN: ${process.env.SEED_SUPER_ADMIN_EMAIL ?? 'superadmin@challengex.dev'}`);
  console.log(`  ADMIN:       ${process.env.SEED_ADMIN_EMAIL ?? 'admin@challengex.dev'}`);
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });




