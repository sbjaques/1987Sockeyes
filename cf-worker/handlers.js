// All /api/* route handlers. Stubs are filled in by Tasks 9, 10, 18, 20, 21.
import { authenticate, requireAdmin } from './lib/access.js';
import { requireOrigin, ALLOWED_ORIGINS } from './lib/csrf.js';
import { validateCommentBody, validateStatusBody, validateAnnotationBody } from './lib/schema.js';
import { sendNotification } from './lib/email.js';
import {
  getAnnotation, putAnnotation, putComment, getComment,
  recordNewComment, getRateWindow, recordRateHit, addSubmitter,
  readCounts, listComments, applyStatusChange, recountAll,
} from './lib/kv.js';

const RATE_HOUR = 10;
const RATE_DAY  = 50;

export async function handleMe(request, env) {
  const auth = await authenticate(request, env);
  if (!auth.ok) return auth.response;
  const isAdmin = auth.payload.email === env.ADMIN_EMAIL;
  const annotationRecord = await getAnnotation(env, auth.payload.email);
  return Response.json({
    email: auth.payload.email,
    isAdmin,
    annotation: annotationRecord ? annotationRecord.label : null,
  });
}

export async function handleCreateComment(request, env) {
  const csrf = requireOrigin(request, ALLOWED_ORIGINS);
  if (!csrf.ok) return csrf.response;

  const auth = await authenticate(request, env);
  if (!auth.ok) return auth.response;
  const submitterEmail = auth.payload.email;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid json' }, { status: 400 });
  }

  const v = validateCommentBody(body);
  if (!v.ok) {
    return Response.json({ error: 'schema', details: v.errors }, { status: 400 });
  }

  // Reject control characters (except \t \r \n) and null bytes.
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(body.body)) {
    return Response.json({ error: 'control characters not allowed' }, { status: 400 });
  }

  // Rate limit
  const now = Date.now();
  const window = await getRateWindow(env, submitterEmail, now);
  if (window.hour.length >= RATE_HOUR || window.day.length >= RATE_DAY) {
    const oldestHour = Math.min(...window.hour);
    const retryAfter = Math.max(1, Math.ceil((oldestHour + 60 * 60 * 1000 - now) / 1000));
    return new Response(JSON.stringify({
      error: 'rate_limited',
      limit: window.hour.length >= RATE_HOUR ? '10/hour' : '50/day',
      retryAfterSeconds: retryAfter,
    }), {
      status: 429,
      headers: { 'content-type': 'application/json', 'retry-after': String(retryAfter) },
    });
  }

  const id = crypto.randomUUID();
  const comment = {
    id,
    target: body.target,
    body: body.body.trim(),
    submitterEmail,
    submitterFirstAnnotation: body.firstAnnotation,
    status: 'pending',
    submittedAt: now,
    emailNotified: false,
  };

  await putComment(env, comment);
  await recordRateHit(env, submitterEmail, now);
  await recordNewComment(env, body.target);
  await addSubmitter(env, submitterEmail);

  // Write-once annotation seed
  if (body.firstAnnotation) {
    const existing = await getAnnotation(env, submitterEmail);
    if (!existing) {
      await putAnnotation(env, submitterEmail, { label: body.firstAnnotation, updatedAt: now });
    }
  }

  // Best-effort email notification — never block comment persistence on this.
  const emailResult = await sendNotification(env, comment);
  if (!emailResult.ok) {
    comment.emailError = emailResult.error;
    comment.emailNotified = false;
  } else {
    comment.emailNotified = true;
  }
  await putComment(env, comment);  // re-write with notification status

  return Response.json({ id, submittedAt: now }, { status: 201 });
}

export async function handleCommentCounts(request, env) {
  const auth = await authenticate(request, env);
  if (!auth.ok) return auth.response;
  return Response.json(await readCounts(env));
}
export async function handleListComments(request, env) {
  const auth = await authenticate(request, env);
  if (!auth.ok) return auth.response;
  const adm = requireAdmin(auth.payload, env);
  if (!adm.ok) return adm.response;

  const url = new URL(request.url);
  const statusFilter = url.searchParams.get('status');
  const cursor = url.searchParams.get('cursor') || undefined;

  const page = await listComments(env, { limit: 20, cursor });
  const filtered = statusFilter
    ? page.comments.filter(c => c.status === statusFilter)
    : page.comments;
  return Response.json({ comments: filtered, cursor: page.cursor });
}

export async function handleStatusChange(request, env) {
  const csrf = requireOrigin(request, ALLOWED_ORIGINS);
  if (!csrf.ok) return csrf.response;
  const auth = await authenticate(request, env);
  if (!auth.ok) return auth.response;
  const adm = requireAdmin(auth.payload, env);
  if (!adm.ok) return adm.response;

  const url = new URL(request.url);
  const id = url.pathname.split('/')[3];   // /api/comments/:id/status
  const body = await request.json().catch(() => ({}));
  const v = validateStatusBody(body);
  if (!v.ok) return Response.json({ error: 'schema', details: v.errors }, { status: 400 });

  const existing = await getComment(env, id);
  if (!existing) return new Response('Not found', { status: 404 });

  const updated = {
    ...existing,
    status: body.status,
    adminNote: body.adminNote,
    lastTriagedAt: Date.now(),
  };
  await putComment(env, updated);
  await applyStatusChange(env, existing.status, body.status);
  return Response.json(updated);
}

export async function handleSetAnnotation(request, env) {
  const csrf = requireOrigin(request, ALLOWED_ORIGINS);
  if (!csrf.ok) return csrf.response;
  const auth = await authenticate(request, env);
  if (!auth.ok) return auth.response;
  const adm = requireAdmin(auth.payload, env);
  if (!adm.ok) return adm.response;

  const url = new URL(request.url);
  const email = decodeURIComponent(url.pathname.split('/').pop());
  const body = await request.json().catch(() => ({}));
  const v = validateAnnotationBody(body);
  if (!v.ok) return Response.json({ error: 'schema', details: v.errors }, { status: 400 });

  const annotation = { label: body.label, updatedAt: Date.now() };
  await putAnnotation(env, email, annotation);
  return Response.json(annotation);
}

export async function handleRecount(request, env) {
  const csrf = requireOrigin(request, ALLOWED_ORIGINS);
  if (!csrf.ok) return csrf.response;
  const auth = await authenticate(request, env);
  if (!auth.ok) return auth.response;
  const adm = requireAdmin(auth.payload, env);
  if (!adm.ok) return adm.response;

  const counts = await recountAll(env);
  return Response.json(counts);
}
