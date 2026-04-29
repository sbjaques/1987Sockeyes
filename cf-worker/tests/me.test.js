import { describe, it, expect, beforeEach, vi } from 'vitest';
import { env, SELF } from 'cloudflare:test';
import * as access from '../lib/access.js';
import { putAnnotation } from '../lib/kv.js';

beforeEach(async () => {
  vi.spyOn(access, 'authenticate').mockImplementation(async (request) => {
    const email = request.headers.get('x-test-email');
    if (!email) return { ok: false, response: new Response('Unauthorized', { status: 401 }) };
    return { ok: true, payload: { email } };
  });
  const list = await env.SOCKEYES_COMMENTS.list();
  for (const k of list.keys) await env.SOCKEYES_COMMENTS.delete(k.name);
});

describe('GET /api/me', () => {
  it('returns 401 without auth', async () => {
    const res = await SELF.fetch('http://archive.87sockeyes.win/api/me');
    expect(res.status).toBe(401);
  });

  it('returns isAdmin=true for the admin email', async () => {
    const res = await SELF.fetch('http://archive.87sockeyes.win/api/me', {
      headers: { 'x-test-email': 'admin@example.com' },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ email: 'admin@example.com', isAdmin: true, annotation: null });
  });

  it('returns isAdmin=false + annotation for a non-admin with annotation', async () => {
    await putAnnotation(env, 'cousin@example.com', { label: "Brian Kozak's son", updatedAt: 1 });
    const res = await SELF.fetch('http://archive.87sockeyes.win/api/me', {
      headers: { 'x-test-email': 'cousin@example.com' },
    });
    const body = await res.json();
    expect(body.isAdmin).toBe(false);
    expect(body.annotation).toBe("Brian Kozak's son");
  });
});
