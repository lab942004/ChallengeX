# Backend E2E tests

End-to-end tests exercise the full stack:

1. `docker compose up -d postgres` (or a local PostgreSQL)
2. `npm run prisma:migrate && npm run prisma:seed` (in `backend/`)
3. `npm run dev` (backend on :5000)
4. Run an E2E runner (Playwright/Cypress) against the backend's `/api/v1` route.
   Configure the test base URL in the test runner environment rather than
   hard-coding a deployment host.

Covered flows to automate:

- Registration → login → session cookie → logout
- Idea creation → trial creation → answers → completion → verdict
- Roadmap progression persistence
- Admin login → user management → RBAC (USER gets 403 on `/admin/*`)
- Super Admin → admin management → settings

The API-level assertions already implemented live in
`tests/api/` and `tests/integration/`.
