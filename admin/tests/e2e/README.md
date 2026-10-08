# Admin E2E tests

Recommended runner: Playwright against http://localhost:5174.

Covered journeys:

- Admin login (valid/invalid/USER-role rejection)
- Dashboard charts render with live data
- Users: search, filter by role, open detail, edit, delete with confirmation
- Trials: filters by status/verdict, detail view with Q&A
- Questions/Categories/Risk Rules/Roadmap templates CRUD
- Super Admin: create admin, settings persistence
- Responsive: sidebar collapses on mobile viewport; tables scroll horizontally
