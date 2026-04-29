// Origin-header CSRF check. CF Access cookies are SameSite=Lax, but a same-site
// forged form on another *.87sockeyes.win subdomain could still attempt a write.
// Origin is the second wall.

export function requireOrigin(request, allowedOrigins) {
  const origin = request.headers.get('Origin');
  if (!origin || !allowedOrigins.includes(origin)) {
    return { ok: false, response: new Response(JSON.stringify({ error: 'csrf' }), {
      status: 403, headers: { 'content-type': 'application/json' },
    }) };
  }
  return { ok: true };
}

export const ALLOWED_ORIGINS = ['https://archive.87sockeyes.win'];
