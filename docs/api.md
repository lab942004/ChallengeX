# ChallengeX — API Reference

Base path: `/api/v1` (forwarded to the backend by the dev-server or production reverse proxy)

All responses use the envelope:

```json
{ "success": true,  "data": { ... } }
{ "success": false, "error": { "code": "…", "message": "…", "details": [] } }
```

Authentication uses an HTTP-only `cx_token` cookie (send
`credentials: 'include'`). A `Bearer` header is also accepted.

Rate limits: general API 300 req/15 min; auth endpoints 20 req/15 min;
AI generation 30 req/hour.

---

## Authentication — `/api/v1/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | public | Create account (name, username, email, password, confirmPassword, acceptTerms) → sets cookie |
| POST | `/auth/login` | public | Email + password (+ `rememberMe`) → sets cookie |
| POST | `/auth/logout` | session | Clears the cookie |
| GET | `/auth/me` | session | Current user |
| POST | `/auth/forgot-password` | public | Always returns a generic message; in dev without email config also returns `devResetUrl` |
| POST | `/auth/reset-password` | public | `{ token, password, confirmPassword }` — single-use, 1 h expiry |

`GET /users/availability?email=&username=` (session) — live signup checks.

## Ideas — `/api/v1/ideas`

| Method | Path | Description |
|---|---|---|
| POST | `/ideas` | Create `{ title, description ≤ 500 }` |
| GET | `/ideas` | List own ideas (`page`, `limit`, `search`) |
| GET | `/ideas/saved` | Saved idea collection |
| GET | `/ideas/:id` | Own idea |
| PUT | `/ideas/:id` | Update own idea |
| DELETE | `/ideas/:id` | Soft-delete (status `DELETED`) |
| POST | `/ideas/:id/save` | Toggle save → `{ saved }` |
| POST | `/ideas/generate` | AI: `{ interests[], skills[], problemArea, count? }` → 3–5 idea drafts |

## Trials — `/api/v1/trials`

| Method | Path | Description |
|---|---|---|
| POST | `/trials` | `{ ideaId, mode }` — creates trial + AI-generated questions (7) |
| GET | `/trials` | List (`page, limit, status, verdict, search, sort, order`) |
| GET | `/trials/:id` | Trial detail incl. questions + saved answers (resume) |
| POST | `/trials/:id/answers` | `{ questionId, answer }` — auto-save, advances cursor |
| POST | `/trials/:id/complete` | Runs the full analysis pipeline → verdict payload |
| GET | `/trials/:id/verdict` | Score, verdict, breakdown, assumptions, risks, recommendations, alternatives, experiment |
| GET | `/trials/:id/roadmap` | Roadmap with 6 stages |
| GET | `/trials/:id/experiments` | Experiments for the trial |
| POST | `/trials/:id/experiments` | Create experiment |

Modes: `STRESS_TEST · BRUTAL_MODE · X100_MODE · COMPETITOR_MODE · FAILURE_MODE`

## Mutations — `/api/v1`

| Method | Path | Description |
|---|---|---|
| PUT | `/roadmap/:id/steps/:stepId` | `{ status }` — persists progress; completes roadmap |
| PUT | `/experiments/:id` | Update experiment |

## Notifications — `/api/v1/notifications`

| Method | Path | Description |
|---|---|---|
| GET | `/notifications` | List (`page`, `limit`) |
| GET | `/notifications/unread-count` | Badge count |
| PUT | `/notifications/:id/read` | Mark one read |
| POST | `/notifications/mark-all-read` | Mark all read |

## Profile — `/api/v1/profile`

| Method | Path | Description |
|---|---|---|
| GET | `/profile` | User + stats (ideas, trials, builds, pivots, kills) |
| PUT | `/profile` | Update name / username / avatar |
| PUT | `/profile/password` | Change password |

## Dashboard — `/api/v1/dashboard`

| Method | Path | Description |
|---|---|---|
| GET | `/dashboard/stats` | Totals, verdict counts, average score, active trial, recent trials, saved ideas, roadmap/experiment counts |

## Admin — `/api/v1/admin` (ADMIN unless noted)

| Method | Path | Access | Description |
|---|---|---|---|
| GET/POST | `/admin/users`* | ADMIN | *list with search/role/page; PUT/DELETE `/admin/users/:id` |
| GET | `/admin/ideas` | ADMIN | List (+ `GET /admin/ideas/:id`) |
| GET | `/admin/trials` | ADMIN | List (+ `GET /admin/trials/:id`) |
| GET/POST/PUT/DELETE | `/admin/questions` | ADMIN | Question bank CRUD |
| GET/POST/PUT/DELETE | `/admin/categories` | ADMIN | Category CRUD |
| GET/POST/PUT/DELETE | `/admin/risk-rules` | ADMIN | Risk rule CRUD |
| GET/POST/PUT/DELETE | `/admin/roadmaps` | ADMIN | Roadmap template CRUD |
| GET | `/admin/experiments` | ADMIN | All experiments |
| GET | `/admin/analytics` | ADMIN | Aggregated platform analytics |
| GET/PUT | `/admin/settings` | **SUPER_ADMIN** | Global settings |
| GET/POST/PUT/DELETE | `/admin/admins` | **SUPER_ADMIN** | Admin account management |

A `USER` requesting any `/admin/*` route receives **403 FORBIDDEN**;
an `ADMIN` on `/admins` or `/settings` receives **403 FORBIDDEN**.

## Health

`GET /health` → `{ status: "ok" }` (outside the rate limiter).
