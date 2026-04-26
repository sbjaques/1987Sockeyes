// All /api/* route handlers. Stubs are filled in by Tasks 9, 10, 18, 20, 21.
import { authenticate, requireAdmin } from './lib/access.js';
import { getAnnotation } from './lib/kv.js';

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
  return new Response('not implemented', { status: 501 });
}
export async function handleCommentCounts(request, env) {
  return new Response('not implemented', { status: 501 });
}
export async function handleListComments(request, env) {
  return new Response('not implemented', { status: 501 });
}
export async function handleStatusChange(request, env) {
  return new Response('not implemented', { status: 501 });
}
export async function handleSetAnnotation(request, env) {
  return new Response('not implemented', { status: 501 });
}
export async function handleRecount(request, env) {
  return new Response('not implemented', { status: 501 });
}
