// All KV access goes through this module. Handlers never touch env.SOCKEYES_COMMENTS directly.
//
// Cloudflare Workers KV has no transactions: read-modify-write of a single key under
// concurrent writes can lose updates. The counts cache (`meta:counts`) is therefore
// best-effort — small drift is acceptable, and `recountAll()` rebuilds the cache from
// scratch by walking every comment record. Wire it to a manual admin endpoint or
// scheduled job whenever the badge visibly diverges from reality.

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS  = 24 * 60 * 60 * 1000;

export async function putComment(env, comment) {
  await env.SOCKEYES_COMMENTS.put(`comment:${comment.id}`, JSON.stringify(comment));
}

export async function getComment(env, id) {
  const raw = await env.SOCKEYES_COMMENTS.get(`comment:${id}`);
  return raw ? JSON.parse(raw) : null;
}

export async function listComments(env, { limit = 20, cursor = undefined } = {}) {
  // KV.list() returns keys only — we issue one KV.get() per key. At limit=20 that's
  // 21 reads per page, acceptable for hundreds of comments. If volume grows past
  // a few thousand, migrate to D1 (SQL with single-query joins).
  const result = await env.SOCKEYES_COMMENTS.list({ prefix: 'comment:', limit, cursor });
  const comments = [];
  for (const k of result.keys) {
    const raw = await env.SOCKEYES_COMMENTS.get(k.name);
    if (raw) comments.push(JSON.parse(raw));
  }
  return { comments, cursor: result.list_complete ? null : result.cursor };
}

export async function putAnnotation(env, email, annotation) {
  await env.SOCKEYES_COMMENTS.put(`annotation:${email}`, JSON.stringify(annotation));
}

export async function getAnnotation(env, email) {
  const raw = await env.SOCKEYES_COMMENTS.get(`annotation:${email}`);
  return raw ? JSON.parse(raw) : null;
}

const COUNTS_KEY = 'meta:counts';
export const VALID_STATUSES = ['pending', 'applied', 'rejected', 'parked'];
const ZERO_COUNTS = () => ({
  byStatus: { pending: 0, applied: 0, rejected: 0, parked: 0 },
  byTarget: {},
});

export async function readCounts(env) {
  const raw = await env.SOCKEYES_COMMENTS.get(COUNTS_KEY);
  return raw ? JSON.parse(raw) : ZERO_COUNTS();
}

// Called when a new comment lands. Status is always 'pending' on create, so
// this updates byStatus.pending and the per-target count atomically (modulo
// the no-transactions caveat — see header).
export async function recordNewComment(env, target) {
  const counts = await readCounts(env);
  counts.byStatus.pending += 1;
  counts.byTarget[target] = (counts.byTarget[target] || 0) + 1;
  await env.SOCKEYES_COMMENTS.put(COUNTS_KEY, JSON.stringify(counts));
}

export async function applyStatusChange(env, fromStatus, toStatus) {
  const counts = await readCounts(env);
  counts.byStatus[fromStatus] = Math.max(0, (counts.byStatus[fromStatus] || 0) - 1);
  counts.byStatus[toStatus] = (counts.byStatus[toStatus] || 0) + 1;
  await env.SOCKEYES_COMMENTS.put(COUNTS_KEY, JSON.stringify(counts));
}

export async function recountAll(env) {
  const counts = ZERO_COUNTS();
  let cursor;
  do {
    const page = await env.SOCKEYES_COMMENTS.list({ prefix: 'comment:', cursor });
    for (const k of page.keys) {
      const raw = await env.SOCKEYES_COMMENTS.get(k.name);
      if (!raw) continue;
      const c = JSON.parse(raw);
      if (VALID_STATUSES.includes(c.status)) {
        counts.byStatus[c.status] += 1;
      }
      counts.byTarget[c.target] = (counts.byTarget[c.target] || 0) + 1;
    }
    cursor = page.list_complete ? null : page.cursor;
  } while (cursor);
  await env.SOCKEYES_COMMENTS.put(COUNTS_KEY, JSON.stringify(counts));
  return counts;
}

export async function recordRateHit(env, email, ts = Date.now()) {
  const key = `meta:rate:${email}`;
  const raw = await env.SOCKEYES_COMMENTS.get(key);
  const window = raw ? JSON.parse(raw) : { hour: [], day: [] };
  const now = ts;
  window.hour = window.hour.filter(t => now - t < HOUR_MS);
  window.day  = window.day.filter(t => now - t < DAY_MS);
  window.hour.push(ts);
  window.day.push(ts);
  await env.SOCKEYES_COMMENTS.put(key, JSON.stringify(window), { expirationTtl: 86400 + 3600 });
}

export async function getRateWindow(env, email, now = Date.now()) {
  const raw = await env.SOCKEYES_COMMENTS.get(`meta:rate:${email}`);
  const window = raw ? JSON.parse(raw) : { hour: [], day: [] };
  return {
    hour: window.hour.filter(t => now - t < HOUR_MS),
    day:  window.day.filter(t => now - t < DAY_MS),
  };
}

const SUBMITTERS_KEY = 'meta:submitters';

export async function addSubmitter(env, email) {
  const raw = await env.SOCKEYES_COMMENTS.get(SUBMITTERS_KEY);
  const list = raw ? JSON.parse(raw) : { emails: [] };
  if (!list.emails.includes(email)) {
    list.emails.push(email);
    await env.SOCKEYES_COMMENTS.put(SUBMITTERS_KEY, JSON.stringify(list));
  }
}

export async function listSubmitters(env) {
  const raw = await env.SOCKEYES_COMMENTS.get(SUBMITTERS_KEY);
  return raw ? JSON.parse(raw).emails : [];
}
