# CHALLENGEX

> **Challenge Your Idea. Prove It. Build It.**

ChallengeX is a gamified idea-validation and innovation platform. Feed it an
idea and it puts the idea through trials across seven risk categories, then
delivers a backend-computed **verdict — BUILD · PIVOT · VALIDATE · KILL** —
with risks, recommendations, a validation experiment, and a six-stage roadmap.

```
IDEA → ASSUMPTIONS → CHALLENGES → ANSWERS → RISK ANALYSIS
     → VERDICT → VALIDATION EXPERIMENT → ROADMAP → BUILD / PIVOT / KILL
```

---

## Architecture

Three **independent applications**, strictly separated — there is **no
`shared/`, `client/`, or `server/` directory**:

```
ChallengeX/
├── frontend/    Public/user app — React + Vite + TS + Tailwind   (:5173)
├── admin/       Management app — React + Vite + TS + Tailwind    (:5174)
├── backend/     REST API — Node + Express + TS + Prisma          (:5000)
│   └── prisma/  schema.prisma · migrations · seed  (only Prisma here)
├── docs/        architecture · api · database · deployment · development
├── package.json  orchestration only
├── docker-compose.yml  local PostgreSQL
├── .gitignore
└── README.md
```

Rules enforced end-to-end:

- **Only backend** touches PostgreSQL / imports Prisma.
- Frontend & Admin talk to the backend **only** via REST at the same-origin
  `/api/v1` route — no backend host is embedded in their browser bundles.
- All business logic (score, verdict, risks, roadmap, AI, permissions) lives
  in `backend/src/services/`.
- RBAC (`USER` / `ADMIN` / `SUPER_ADMIN`) is enforced **server-side**:
  a USER calling `/api/v1/admin/*` gets **403 FORBIDDEN**.

See [docs/architecture.md](docs/architecture.md) for diagrams and boundaries.

---

## Installation

```bash
git clone <repo> && cd ChallengeX
npm run install:all        # installs root + frontend + admin + backend
```

## Environment variables

| App | File | Key values |
|---|---|---|
| backend | `backend/.env` | `DATABASE_URL`, `JWT_SECRET`, `PORT=5000`, `CLIENT_URL`, `ADMIN_URL` |
| local Docker database | `.env` | `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` |

Copy `.env.example` and `backend/.env.example` first. Configure your production
web server to proxy `/api` to the backend; the API host is not configured in
the browser bundle. Secrets never ship to the browser bundles — `DATABASE_URL`,
`JWT_SECRET`, `AI_API_KEY` and password hashes exist only on the backend.

## Database setup

```bash
# Option A — Docker
npm run db:up

# Option B — local PostgreSQL: create role "challengex" + db "challengex"
#            (see docs/development.md)

npm run prisma:migrate      # create/apply migrations
npm run prisma:seed         # admin users, categories, questions, rules, templates
```

Prisma commands (all scoped to `backend/`):

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

## Running

```bash
npm run dev              # all three apps at once
npm run dev:frontend     # http://localhost:5173
npm run dev:admin        # http://localhost:5174
npm run dev:backend      # backend listens on the configured PORT
```

Seeded admin logins (dev):

- SUPER_ADMIN `superadmin@challengex.dev` / `ChangeMe_SuperAdmin1!`
- ADMIN `admin@challengex.dev` / `ChangeMe_Admin1!`

## Building

```bash
npm run build              # frontend + admin + backend
npm run build:frontend
npm run build:admin
npm run build:backend
npm start                  # run the built backend (dist/server.js)
```

## Testing & linting

```bash
npm run test               # vitest across all three apps
npm run lint               # tsc --noEmit type-checking across all three apps
```

Backend suites cover the verdict engine, validators, RBAC middleware, live
API smoke tests, and database integration tests (auto-skip when the DB is
unreachable). Per-app `tests/` folders document integration/E2E playbooks.

## Security

- bcrypt password hashing · JWT in **HTTP-only cookies** (SameSite=None; Secure in prod)
- Zod validation on every write endpoint · rate limiting · CORS allowlist
- Helmet security headers · sanitized errors (no stack traces in production)
- Real single-use password-reset tokens (1 h expiry)

## Deployment

Production topology, environment reference, and checklist:
[docs/deployment.md](docs/deployment.md).

Recommended: expose the frontend and admin apps, and keep the backend private
behind a reverse proxy for `/api`. Configure production hostnames in your
deployment platform; do not embed backend hosts in frontend code.

## Documentation

| Doc | Contents |
|---|---|
| [docs/architecture.md](docs/architecture.md) | Three-app architecture, boundaries, RBAC, AI service |
| [docs/api.md](docs/api.md) | Every REST endpoint |
| [docs/database.md](docs/database.md) | Prisma models, enums, relations |
| [docs/deployment.md](docs/deployment.md) | Production deployment + security checklist |
| [docs/development.md](docs/development.md) | Local development guide |

---

*ChallengeX — dark-fantasy idea validation. Only what survives the trials
deserves to be built.*
