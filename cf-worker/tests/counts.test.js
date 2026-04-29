import { describe, it, expect, beforeEach, vi } from 'vitest';
import { env, SELF } from 'cloudflare:test';
import * as access from '../lib/access.js';
import { recordNewComment } from '../lib/kv.js';

beforeEach(async () => {
  vi.spyOn(access, 'authenticate').mockImplementation(async (request) => ({
    ok: true, payload: { email: request.headers.get('x-test-email') ?? 'anon@x.test' },
  }));
  const list = await env.SOCKEYES_COMMENTS.list();
  for (const k of list.keys) await env.SOCKEYES_COMMENTS.delete(k.name);
});

describe('GET /api/comments/counts', () => {
  it('returns zero map when empty', async () => {
    const res = await SELF.fetch('http://archive.87sockeyes.win/api/comments/counts', {
      headers: { 'x-test-email': 'a@b.test' },
    });
    const body = await res.json();
    expect(body.byStatus.pending).toBe(0);
    expect(body.byTarget).toEqual({});
  });

  it('returns counts after recordNewComment increments', async () => {
    await recordNewComment(env, 'media:scan-1');
    await recordNewComment(env, 'media:scan-1');
    await recordNewComment(env, 'global');
    const res = await SELF.fetch('http://archive.87sockeyes.win/api/comments/counts', {
      headers: { 'x-test-email': 'a@b.test' },
    });
    const body = await res.json();
    expect(body.byStatus.pending).toBe(3);
    expect(body.byTarget['media:scan-1']).toBe(2);
    expect(body.byTarget['global']).toBe(1);
  });
});
