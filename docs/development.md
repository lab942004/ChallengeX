# ChallengeX — Local Development

## Prerequisites

- Node.js ≥ 20 (tested on 22)
- npm ≥ 10
- PostgreSQL 14+ (local service **or** Docker)

## One-time setup

```bash
# 1. Install all four dependency trees
npm run install:all          # root + frontend + admin + backend

# 2. Environment
copy .env.example .env
copy backend\.env.example backend\.env      # set DATABASE_URL to match .env

# 3. Database (choose one)
docker compose up -d postgres               # containerized PostgreSQL
# — or use your local PostgreSQL and create role/database:
#   CREATE ROLE challengex LOGIN PASSWORD '<your-local-password>' CREATEDB;
#   CREATE DATABASE challengex OWNER challengex;

# 4. Schema + seed
npm run prisma:migrate                      # applies migrations
npm run prisma:seed                         # admin users, content, settings
```

## Running

```bash
npm run dev            # all three apps (backend :5000, frontend :5173, admin :5174)
npm run dev:backend
npm run dev:frontend
npm run dev:admin
```

| App | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Admin | http://localhost:5174 |
| Backend API (proxied by frontend/admin dev servers) | `/api/v1` |
| Health | http://localhost:5000/health |

## Seeded logins

| Role | Email | Password |
|---|---|---|
| SUPER_ADMIN | `superadmin@challengex.dev` | `ChangeMe_SuperAdmin1!` |
| ADMIN | `admin@challengex.dev` | `ChangeMe_Admin1!` |

(Override via `SEED_*` env vars — never use defaults in production.)

## Scripts

| Command | What it does |
|---|---|
| `npm run build` | Builds frontend, admin, backend |
| `npm run lint` | Type-checks all three apps (`tsc --noEmit`) |
| `npm run test` | Runs all three test suites (vitest) |
| `npm run prisma:generate/migrate/seed` | Prisma tasks scoped to backend |
| `npm run db:up` / `db:down` | Start/stop the PostgreSQL container |

## Ports

- Frontend dev server: **5173**
- Admin dev server: **5174**
- Backend: **5000**
- PostgreSQL: **5432**

CORS allows exactly `CLIENT_URL` and `ADMIN_URL` (plus `ALLOWED_ORIGINS`).

## Tests

```bash
npm test --prefix frontend   # unit + component tests (jsdom)
npm test --prefix admin
npm test --prefix backend    # unit + API smoke + DB integration (auto-skips if DB unreachable)
```

E2E/integration playbooks live in each app's `tests/` folders.

## Troubleshooting

- **Port taken**: stop the other instance; dev servers use strict ports.
- **Prisma client errors**: `npm run prisma:generate`.
- **Migration drift**: `npx prisma migrate dev --name fix` inside `backend/`.
- **CORS errors**: check `CLIENT_URL`/`ADMIN_URL` in `backend/.env`.
- **403 on admin APIs**: your account role must be `ADMIN`/`SUPER_ADMIN`.
