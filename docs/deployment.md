# ChallengeX — Deployment

## Production topology

| Service | Suggested URL | Build |
|---|---|---|
| Frontend | https://challengex.com | `npm run build --prefix frontend` → static `frontend/dist` |
| Admin | https://admin.challengex.com | `npm run build --prefix admin` → static `admin/dist` |
| API | Private backend service (no public URL required) | `npm run build --prefix backend` → `backend/dist/server.js` |
| PostgreSQL | private host | managed database or `docker compose` volume |

The frontend and admin call the same-origin `/api/v1` route. Configure the
production web server to proxy `/api` to the backend. This keeps the backend
host out of the browser bundle; requests and the route are still visible to
browser users. The database URL is configured only on the backend.

## Environment

### Backend (`backend/.env`)
```
NODE_ENV=production
PORT=5000
DATABASE_URL=<private PostgreSQL connection string>
JWT_SECRET=<≥32 random chars — REQUIRED in production>
JWT_EXPIRES_IN=7d
JWT_REMEMBER_EXPIRES_IN=30d
CLIENT_URL=https://challengex.com
ADMIN_URL=https://admin.challengex.com
ALLOWED_ORIGINS=
AI_PROVIDER=mock            # or "provider" + AI_API_KEY
EMAIL_PROVIDER=smtp         # enables real password-reset emails
SMTP_URL=smtp://…
SEED_SUPER_ADMIN_EMAIL=…    # change before seeding production!
SEED_SUPER_ADMIN_PASSWORD=…
```

### Frontend and admin

No API URL build-time variable is needed. Configure the production web server
to proxy `/api` to the private backend service. Do not put database connection
strings or credentials in frontend/admin environment variables.

## Deploy steps

```bash
# 1. Database
createdb challengex
npm run prisma:deploy --prefix backend     # apply migrations (no dev prompts)
npm run prisma:seed  --prefix backend      # once — then remove SEED_* secrets

# 2. API
npm ci --prefix backend
npm run build --prefix backend
node backend/dist/server.js                # or PM2 / systemd / Docker

# 3. SPAs
npm ci --prefix frontend && npm run build --prefix frontend   # serve dist/ with nginx
npm ci --prefix admin    && npm run build --prefix admin
```

Serve both SPAs over HTTPS (required for `SameSite=None; Secure` cookies).
Configure the web server to fall back to `index.html` for SPA routes.

## Security checklist

- [ ] `JWT_SECRET` ≥ 32 chars, unique, not committed
- [ ] `DATABASE_URL` unreachable from the public internet
- [ ] HTTPS everywhere (HSTS is enabled by helmet in production)
- [ ] `SEED_*` credentials changed or seed disabled after first run
- [ ] `ALLOWED_ORIGINS` contains only your real domains (CORS allowlist)
- [ ] Rate limiting stays enabled (default 300/15 min, auth 20/15 min)
- [ ] Email provider configured so password reset works without dev fallback
- [ ] `AI_API_KEY` stored only on the backend when using `AI_PROVIDER=provider`
- [ ] Regular `prisma migrate deploy` in the release pipeline

## Health checks

- `GET /health` → `{ "data": { "status": "ok" } }`
- Deep check: `GET /api/v1/auth/me` (401 without a session = healthy)

## Scaling notes

- The API is stateless (JWT in cookie) → horizontal scaling behind a load
  balancer; enable sticky cookies only if you later add in-memory sessions.
- Static SPAs can be served from any CDN.
- PostgreSQL: standard primary/read-replica setup; Prisma connection pool
  sizing via `DATABASE_URL?connection_limit=`.

## Docker

`docker-compose.yml` at the repository root provides local PostgreSQL only
(`npm run db:up`). Application containers are intentionally not bundled so
each app can be deployed to its own host/platform.
