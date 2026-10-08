# Frontend integration tests

Integration tests exercise the frontend against a running backend:

1. Start PostgreSQL (`docker compose up -d postgres`)
2. Run migrations + seed in `backend/`
3. Start the backend (`npm run dev --prefix backend`) on :5000
4. Start the frontend (`npm run dev --prefix frontend`) on :5173

Key flows to cover (with MSW or a live backend):

- Register → login → session cookie → logout
- Idea creation → trial → answers persist across reload → completion
- Verdict rendering with backend-provided numbers
- Roadmap progress persistence
- Notifications unread badge refresh
- Protected route redirects for guests
