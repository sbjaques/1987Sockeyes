import { describe, it, expect, beforeEach } from 'vitest';
import { env } from 'cloudflare:test';
import {
  putComment, getComment, listComments,
  putAnnotation, getAnnotation,
  readCounts, recordNewComment, applyStatusChange,
  recordRateHit, getRateWindow,
  addSubmitter, listSubmitters,
} from '../lib/kv.js';

beforeEach(async () => {
  // miniflare resets per-test, but be explicit
  const list = await env.SOCKEYES_COMMENTS.list();
  for (const k of list.keys) await env.SOCKEYES_COMMENTS.delete(k.name);
});

describe('comment CRUD', () => {
  it('round-trips a comment', async () => {
    const comment = {
      id: 'abc-123', target: 'global', body: 'hi',
      submitterEmail: 'a@b.test', status: 'pending',
      submittedAt: Date.now(),
    };
    await putComment(env, comment);
    expect(await getComment(env, 'abc-123')).toEqual(comment);
  });

  it('lists with cursor pagination', async () => {
    for (let i = 0; i < 5; i++) {
      await putComment(env, {
        id: `id-${i}`, target: 'global', body: `body ${i}`,
        submitterEmail: 'a@b.test', status: 'pending', submittedAt: Date.now() + i,
      });
    }
    const page1 = await listComments(env, { limit: 3 });
    expect(page1.comments.length).toBe(3);
    expect(page1.cursor).toBeTruthy();
    const page2 = await listComments(env, { limit: 3, cursor: page1.cursor });
    expect(page2.comments.length).toBe(2);
  });
});

describe('annotation', () => {
  it('round-trips an annotation', async () => {
    await putAnnotation(env, 'a@b.test', { label: 'cousin', updatedAt: 1 });
    expect(await getAnnotation(env, 'a@b.test')).toEqual({ label: 'cousin', updatedAt: 1 });
  });
  it('returns null for unknown email', async () => {
    expect(await getAnnotation(env, 'noone@x.test')).toBeNull();
  });
});

describe('counts cache', () => {
  it('starts zero', async () => {
    const c = await readCounts(env);
    expect(c.byStatus.pending).toBe(0);
    expect(c.byTarget).toEqual({});
  });
  it('increments on create', async () => {
    await recordNewComment(env, 'media:scan-1');
    const c = await readCounts(env);
    expect(c.byStatus.pending).toBe(1);
    expect(c.byTarget['media:scan-1']).toBe(1);
  });
  it('shifts byStatus on status change', async () => {
    await recordNewComment(env, 'global');
    await applyStatusChange(env, 'pending', 'applied');
    const c = await readCounts(env);
    expect(c.byStatus.pending).toBe(0);
    expect(c.byStatus.applied).toBe(1);
  });
});

describe('rate window', () => {
  it('records and retrieves hits within window', async () => {
    const t0 = Date.now();
    await recordRateHit(env, 'a@b.test', t0);
    await recordRateHit(env, 'a@b.test', t0 + 1000);
    const w = await getRateWindow(env, 'a@b.test', t0 + 2000);
    expect(w.hour.length).toBe(2);
    expect(w.day.length).toBe(2);
  });
  it('drops expired hits', async () => {
    const old = Date.now() - 25 * 60 * 60 * 1000;  // 25h ago
    await recordRateHit(env, 'a@b.test', old);
    const now = Date.now();
    await recordRateHit(env, 'a@b.test', now);
    const w = await getRateWindow(env, 'a@b.test', now);
    expect(w.day.length).toBe(1);
  });
});

describe('submitters list', () => {
  it('adds and de-duplicates', async () => {
    await addSubmitter(env, 'a@b.test');
    await addSubmitter(env, 'a@b.test');
    await addSubmitter(env, 'c@d.test');
    expect((await listSubmitters(env)).sort()).toEqual(['a@b.test', 'c@d.test']);
  });
});
