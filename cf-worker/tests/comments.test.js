import { describe, it, expect, beforeEach, vi } from 'vitest';
import { env, SELF } from 'cloudflare:test';
import * as access from '../lib/access.js';
import { readCounts, listComments } from '../lib/kv.js';

beforeEach(async () => {
  vi.spyOn(access, 'authenticate').mockImplementation(async (request) => {
    const email = request.headers.get('x-test-email');
    if (!email) return { ok: false, response: new Response('Unauthorized', { status: 401 }) };
    return { ok: true, payload: { email } };
  });
  const list = await env.SOCKEYES_COMMENTS.list();
  for (const k of list.keys) await env.SOCKEYES_COMMENTS.delete(k.name);
});

const post = (body, headers = {}) => SELF.fetch('http://archive.87sockeyes.win/api/comments', {
  method: 'POST',
  headers: { 'content-type': 'application/json', Origin: 'https://archive.87sockeyes.win', ...headers },
  body: JSON.stringify(body),
});

describe('POST /api/comments', () => {
  it('rejects 401 without auth', async () => {
    const res = await post({ target: 'global', body: 'x' });
    expect(res.status).toBe(401);
  });

  it('rejects 403 without Origin header', async () => {
    const res = await SELF.fetch('http://archive.87sockeyes.win/api/comments', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-test-email': 'a@b.test' },
      body: JSON.stringify({ target: 'global', body: 'x' }),
    });
    expect(res.status).toBe(403);
  });

  it('rejects 400 on schema mismatch', async () => {
    const res = await post({ target: 'invalid', body: 'x' }, { 'x-test-email': 'a@b.test' });
    expect(res.status).toBe(400);
  });

  it('persists, updates counts, returns 201', async () => {
    const res = await post(
      { target: 'media:scan-1', body: 'cool clipping' },
      { 'x-test-email': 'a@b.test' },
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.id).toMatch(/^[0-9a-f-]{36}$/);
    const all = await listComments(env, { limit: 10 });
    expect(all.comments.length).toBe(1);
    expect(all.comments[0].submitterEmail).toBe('a@b.test');
    const counts = await readCounts(env);
    expect(counts.byStatus.pending).toBe(1);
    expect(counts.byTarget['media:scan-1']).toBe(1);
  });

  it('rate-limits at 11th hour-window submission', async () => {
    for (let i = 0; i < 10; i++) {
      const r = await post({ target: 'global', body: `c${i}` }, { 'x-test-email': 'a@b.test' });
      expect(r.status).toBe(201);
    }
    const r11 = await post({ target: 'global', body: 'overflow' }, { 'x-test-email': 'a@b.test' });
    expect(r11.status).toBe(429);
    expect(r11.headers.get('retry-after')).toBeTruthy();
  });

  it('seeds annotation write-once on first submission', async () => {
    const res = await post(
      { target: 'global', body: 'hi', firstAnnotation: "Brian's son" },
      { 'x-test-email': 'a@b.test' },
    );
    expect(res.status).toBe(201);
    const meRes = await SELF.fetch('http://archive.87sockeyes.win/api/me', {
      headers: { 'x-test-email': 'a@b.test' },
    });
    const me = await meRes.json();
    expect(me.annotation).toBe("Brian's son");
  });

  it('does not overwrite an existing annotation', async () => {
    await post({ target: 'global', body: 'first', firstAnnotation: 'one' }, { 'x-test-email': 'a@b.test' });
    await post({ target: 'global', body: 'second', firstAnnotation: 'two' }, { 'x-test-email': 'a@b.test' });
    const meRes = await SELF.fetch('http://archive.87sockeyes.win/api/me', {
      headers: { 'x-test-email': 'a@b.test' },
    });
    const me = await meRes.json();
    expect(me.annotation).toBe('one');
  });
});

describe('POST /api/comments — email side effect', () => {
  it('records emailNotified=true on Resend success', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      if (typeof url === 'string' && url.includes('resend.com')) {
        return new Response(JSON.stringify({ id: 'em_xyz' }), { status: 200 });
      }
      return new Response('not stubbed', { status: 599 });
    });
    const res = await post({ target: 'global', body: 'a' }, { 'x-test-email': 'a@b.test' });
    expect(res.status).toBe(201);
    const all = await listComments(env, { limit: 10 });
    expect(all.comments[0].emailNotified).toBe(true);
  });

  it('records emailNotified=false + emailError on Resend failure but still 201s', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      if (typeof url === 'string' && url.includes('resend.com')) {
        return new Response('boom', { status: 500 });
      }
      return new Response('not stubbed', { status: 599 });
    });
    const res = await post({ target: 'global', body: 'b' }, { 'x-test-email': 'a@b.test' });
    expect(res.status).toBe(201);
    const all = await listComments(env, { limit: 10 });
    expect(all.comments[0].emailNotified).toBe(false);
    expect(all.comments[0].emailError).toMatch(/500/);
  });
});
