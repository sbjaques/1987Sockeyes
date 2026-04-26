// Routes /media/* (R2-backed, original behavior) and /api/* (comments) for the
// 1987 Sockeyes archive. JWT verify happens per route; admin checks are in
// the /api handlers themselves.
import { Router } from 'itty-router';
import { authenticate } from './lib/access.js';
import {
  handleMe, handleCreateComment, handleCommentCounts,
  handleListComments, handleStatusChange, handleSetAnnotation, handleRecount,
} from './handlers.js';

const router = Router();

// /api/* — comment endpoints
router.get('/api/me', handleMe);
router.post('/api/comments', handleCreateComment);
router.get('/api/comments/counts', handleCommentCounts);
router.get('/api/comments', handleListComments);
router.post('/api/comments/:id/status', handleStatusChange);
router.post('/api/annotations/:email', handleSetAnnotation);
router.post('/api/admin/recount', handleRecount);

// /media/* — R2-backed media (original behavior)
router.get('/media/*', async (request, env) => {
  const auth = await authenticate(request, env);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const match = url.pathname.match(/^\/media\/(.+)$/);
  if (!match) return new Response('Not found', { status: 404 });
  const key = match[1];

  const object = await env.R2.get(key);
  if (!object) return new Response('Not found', { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('cache-control', 'private, max-age=3600');
  return new Response(object.body, { headers });
});

router.all('*', () => new Response('Not found', { status: 404 }));

export default {
  async fetch(request, env, ctx) {
    return router.fetch(request, env, ctx);
  },
};
