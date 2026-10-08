# ChallengeX — Architecture

ChallengeX is a gamified idea-validation platform built as **three independent
applications** with a strict boundary between them.

```
                     INTERNET
                         |
              +----------+----------+
              |                     |
              ▼                     ▼
       ┌─────────────┐       ┌─────────────┐
       │  FRONTEND   │       │    ADMIN    │
       │  React/Vite │       │ React/Vite  │
       │   :5173     │       │   :5174     │
       └──────┬──────┘       └──────┬──────┘
              |      REST API       |
              +----------+----------+
                         ▼
                 ┌──────────────┐
                 │   BACKEND    │
                 │ Node/Express │
                 │    :5000     │
                 └──────┬───────┘
                        ▼
                 ┌──────────────┐
                 │  PostgreSQL  │
                 └──────┬───────┘
                        ▼
                     Prisma
```

## Applications

| App | Path | Port | Responsibility |
|---|---|---|---|
| Frontend | `frontend/` | 5173 | Public/user experience (dark-fantasy) |
| Admin | `admin/` | 5174 | Management console (professional/data-focused) |
| Backend | `backend/` | 5000 | REST API, business logic, database, AI |

### Hard boundaries

- Only **backend** talks to PostgreSQL and imports Prisma.
- Frontend and Admin never import backend source; they call the REST API at
  the same-origin `/api/v1` route, forwarded to the backend by a reverse proxy.
- Frontend and Admin never share source code — each has its own types,
  utils, constants, Tailwind config, and `package.json`.
- There is **no `shared/`, `client/`, or `server/` directory** anywhere.

## Backend structure

```
backend/src/
├── config/        env, database (Prisma singleton), CORS, security headers
├── controllers/   thin HTTP layer (+ controllers/admin/)
├── routes/        /api/v1/* + /api/v1/admin/* (+ routes/admin/)
├── middleware/    auth, admin RBAC, super-admin, validation, rate-limit, errors
├── services/      ALL business logic (auth, trial, verdict, roadmap, AI, admin…)
├── validators/    Zod schemas
├── types/         API DTOs + Express augmentation
├── constants/     roles, modes, verdict thresholds
├── utils/         errors, jwt, password, pagination, logger
├── app.ts         Express app factory
└── server.ts      process entry point
backend/prisma/    schema.prisma · seed.ts · migrations/   (ONLY location of Prisma)
```

## Database

PostgreSQL via Prisma. Models: `User`, `Idea`, `Trial`, `TrialQuestion`,
`TrialAnswer`, `Assumption`, `Risk`, `Recommendation`, `Experiment`, `Roadmap`,
`RoadmapStep`, `SavedIdea`, `Notification`, `ChallengeCategory`,
`ChallengeQuestion`, `PasswordResetToken` plus admin-managed `RiskRule`,
`RoadmapTemplate`, `SystemSetting`. See [database.md](./database.md).

## API

All endpoints live under `/api/v1`. See [api.md](./api.md).

## Authentication

- Signup/login with bcrypt-hashed passwords (bcryptjs, cost from `BCRYPT_ROUNDS`).
- JWT signed with `JWT_SECRET`, delivered as an **HTTP-only cookie**
  (`cx_token`) with `SameSite=None; Secure` in production and `Lax` in dev.
  `Remember me` extends expiry (30 days vs 1 day).
- Every protected request is verified server-side; the current user role is
  re-read from the database so demotions apply immediately.
- Password reset issues single-use, 1-hour tokens (`PasswordResetToken`).
  Without an email provider in development the reset URL is returned by the
  API; in production nothing secret is exposed.

## RBAC

| Role | Frontend | Admin app | `/api/v1/admin/*` |
|---|---|---|---|
| `USER` | ✓ | ✗ | **403 FORBIDDEN** |
| `ADMIN` | ✓ | ✓ | ✓ (except admins/settings) |
| `SUPER_ADMIN` | ✓ | ✓ | ✓ including `/admins` + `/settings` |

Enforcement is **server-side only** (`requireAuth` → `requireAdmin` →
`requireSuperAdmin` middleware). Frontend/admin route guards are UX sugar.

## AI architecture

```
Frontend/Admin → Backend API → AIService (interface) → MockAIService | AIProviderService
```

- `backend/src/services/ai/ai.service.ts` defines the contract
  (`generateIdea`, `generateQuestions`, `analyzeTrial`, `generateVerdict`,
  `generateRisks`, `generateRecommendations`, `generateAlternativeDirections`,
  `generateExperiment`, `generateRoadmap`).
- `MockAIService` is the default deterministic implementation.
- `AIProviderService` is the future external provider (requires `AI_API_KEY`).
- Frontend and Admin never call an AI provider directly.

All scores, verdicts, risks, roadmaps, and permissions are computed **only**
on the backend.

## Design system

- Frontend: dark-fantasy (Cinzel/Cinzel Decorative + Inter/Manrope, red neon
  palette, supplied artwork in `frontend/public/assets/`).
- Admin: professional data-focused variant with the same brand colors,
  its own Tailwind config (no shared Tailwind).
