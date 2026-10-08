# Admin integration tests

Run the backend, then exercise admin flows against live `/api/v1/admin/*`:

- ADMIN login → dashboard metrics → users list → user detail → role update
- USER session receives **403 FORBIDDEN** on every `/admin/*` endpoint
- ADMIN receives **403** on `/admin/admins` and `/admin/settings` (SUPER_ADMIN only)
- CRUD round-trips for questions, categories, risk rules, roadmap templates
- Analytics payload matches database aggregates
