# Frontend E2E tests

Recommended runner: Playwright.

Covered journeys (dark-fantasy UI, desktop + mobile viewports):

- Landing → Sign up → Gate opening animation → Paths
- Gate CTA → `/paths` navigation (including `prefers-reduced-motion`)
- Create idea (500-char counter) → trial questions → auto-save survives reload
- Complete trial → verdict score ring → roadmap stage progression
- History search/filter/reopen
- Mobile bottom navigation, no horizontal scrolling
- Themed 404/401/500/network error states

Run (once Playwright is configured):

```bash
npm run test:e2e --prefix frontend
```
