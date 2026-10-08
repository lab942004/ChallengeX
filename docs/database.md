# ChallengeX — Database

PostgreSQL + Prisma. **The only Prisma installation in the repository lives in
`backend/prisma/`** — frontend and admin never touch the database.

- Schema: `backend/prisma/schema.prisma`
- Migrations: `backend/prisma/migrations/`
- Seed: `backend/prisma/seed.ts`
- Client: generated into `backend/node_modules/@prisma/client`

```bash
npm run prisma:generate   # from repo root → backend
npm run prisma:migrate
npm run prisma:seed
npm run prisma --prefix backend -- studio   # optional GUI
```

## Enums

| Enum | Values |
|---|---|
| `Role` | `USER` `ADMIN` `SUPER_ADMIN` |
| `IdeaStatus` | `DRAFT` `ACTIVE` `ARCHIVED` `DELETED` |
| `TrialMode` | `STRESS_TEST` `BRUTAL_MODE` `X100_MODE` `COMPETITOR_MODE` `FAILURE_MODE` |
| `TrialStatus` | `ACTIVE` `COMPLETED` `ABANDONED` |
| `Verdict` | `BUILD` `PIVOT` `VALIDATE` `KILL` |
| `RiskLevel` / `Severity` | `LOW` `MEDIUM` `HIGH` `CRITICAL` |
| `Priority` | `LOW` `MEDIUM` `HIGH` |
| `RoadmapStatus` / `StepStatus` | `PENDING` `IN_PROGRESS` `COMPLETED` |
| `ExperimentStatus` | `DRAFT` `PLANNED` `RUNNING` `COMPLETED` `CANCELLED` |
| `NotificationType` | `TRIAL_COMPLETED` `VERDICT_GENERATED` `ROADMAP_COMPLETED` `EXPERIMENT_CREATED` `SAVED_IDEA` `SYSTEM` |

## Models

### User
`id` · `name` · `username` (unique) · `email` (unique) · `passwordHash` ·
`avatar?` · `role` · `createdAt` · `updatedAt`
Relations: `ideas`, `trials`, `savedIdeas`, `notifications`, `passwordResetTokens` (all cascade delete).

### Idea
`id` · `userId` → User (cascade) · `title` · `description` · `status` · timestamps.
Indexes: `userId`, `status`, `createdAt`.

### Trial
`id` · `userId` · `ideaId` · `mode` · `status` · `currentQuestion` · `score?` ·
`verdict?` · `analysis?` (JSON snapshot of the backend analysis) · `createdAt` · `completedAt?`.
Indexes: `userId`, `ideaId`, `status`, `verdict`, `createdAt`.

### TrialQuestion
`id` · `trialId` (cascade) · `category` · `question` · `order` · `riskLevel` · `explanation?`.
Unique `(trialId, order)`.

### TrialAnswer
`id` · `trialId` (cascade) · `questionId` (cascade) · `answer` · timestamps.
Unique `(trialId, questionId)` — enables auto-save upserts.

### Assumption / Risk / Recommendation
Per-trial analysis output (`trialId` cascade, indexed):
- Assumption: `title, description, risk, evidence, validationMethod`
- Risk: `title, description, severity, evidence`
- Recommendation: `title, description, priority`

### Experiment
`id` · `trialId` (cascade) · `title` · `description` · `steps` (JSON array) ·
`successMetric` · `estimatedCost` · `duration` · `status` · timestamps.

### Roadmap / RoadmapStep
Roadmap: `trialId` unique (cascade) · `title` · `status`.
Step: `roadmapId` (cascade) · `title` · `description` · `order` · `status` ·
`objective?` · `tasks?` (JSON) · `deliverables?` (JSON) · `estimatedEffort?`.
Unique `(roadmapId, order)`.

### SavedIdea
Unique `(userId, ideaId)` · cascade on both sides.

### Notification
`userId` (cascade) · `title` · `message` · `type` · `read` · `createdAt`.
Indexes: `(userId, read)`, `createdAt`.

### PasswordResetToken
`userId` (cascade) · `token` unique · `expiresAt` · `used` · `createdAt`.

### ChallengeCategory / ChallengeQuestion (admin-managed content)
Category: `name` unique · `description` · `order` · `active`.
Question: `categoryId` (cascade) · `question` · `riskLevel` · `explanation` ·
`order` · `active`. Index `(categoryId, active)`.

### RiskRule / RoadmapTemplate / SystemSetting (admin configuration)
- RiskRule: `name` unique · `description` · `category?` · `severity` · `threshold?` · `active`
- RoadmapTemplate: `name` · `order` · `objective` · `tasks`/`deliverables` JSON · `estimatedEffort` · `active`
- SystemSetting: `key` unique · `value` JSON · timestamps

## Seed contents

- `SUPER_ADMIN` + `ADMIN` accounts (credentials from `SEED_*` env vars)
- 7 challenge categories + 12 challenge questions
- 5 risk rules
- 6 roadmap templates (VALIDATE → LAUNCH)
- 5 default system settings

## Conventions

- All PKs are `cuid()` strings.
- All child rows cascade on parent delete.
- Every list endpoint paginates (`page`, `limit`, capped at 100).
