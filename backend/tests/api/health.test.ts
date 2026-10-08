import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import http from 'http';
import { createApp } from '../../src/app';

/**
 * Boots the real Express app on an ephemeral port and exercises
 * DB-free endpoints (health, 404, auth guard).
 */
describe('API smoke tests', () => {
  let server: http.Server;
  let base: string;

  beforeAll(async () => {
    const app = createApp();
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const address = server.address();
    const port = typeof address === 'object' && address ? address.port : 0;
    base = `http://127.0.0.1:${port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('GET /health returns ok', async () => {
    const res = await fetch(`${base}/health`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { data: { status: string } };
    expect(body.data.status).toBe('ok');
  });

  it('returns themed 404 for unknown API routes', async () => {
    const res = await fetch(`${base}/api/v1/does-not-exist`);
    expect(res.status).toBe(404);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe('NOT_FOUND');
  });

  it('protects /api/v1/trials without a session (401)', async () => {
    const res = await fetch(`${base}/api/v1/trials`);
    expect(res.status).toBe(401);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('protects /api/v1/admin/users without a session (401)', async () => {
    const res = await fetch(`${base}/api/v1/admin/users`);
    expect(res.status).toBe(401);
  });

  it('rejects malformed JSON bodies with 400', async () => {
    const res = await fetch(`${base}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"email": "broken"',
    });
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });

  it('validates login input with Zod (400 on bad payload)', async () => {
    const res = await fetch(`${base}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email', password: '' }),
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe('BAD_REQUEST');
  });
});
