// JWT verification + admin gating helpers shared by /media/* and /api/*.

const HEADER_NAME = 'cf-access-jwt-assertion';
const COOKIE_NAME = 'CF_Authorization';

let jwksCache = null;
let jwksCacheExpiry = 0;

export function readToken(request) {
  const headerToken = request.headers.get(HEADER_NAME);
  if (headerToken) return headerToken.trim();
  const cookie = request.headers.get('cookie') || '';
  for (const part of cookie.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === COOKIE_NAME) return rest.join('=').trim();
  }
  return null;
}

function b64urlToUint8(b64url) {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/').padEnd(b64url.length + ((4 - b64url.length % 4) % 4), '=');
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function b64urlToJson(b64url) {
  return JSON.parse(new TextDecoder().decode(b64urlToUint8(b64url)));
}

async function getJwks(team) {
  const now = Date.now();
  if (jwksCache && jwksCacheExpiry > now) return jwksCache;
  const res = await fetch(`https://${team}/cdn-cgi/access/certs`, {
    cf: { cacheTtl: 3600, cacheEverything: true },
  });
  if (!res.ok) throw new Error(`jwks fetch ${res.status}`);
  const body = await res.json();
  jwksCache = body;
  jwksCacheExpiry = now + 3600 * 1000;
  return body;
}

export async function verifyAccessJwt(token, env) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('malformed jwt');
  const [headerB64, payloadB64, sigB64] = parts;

  const header = b64urlToJson(headerB64);
  const payload = b64urlToJson(payloadB64);
  if (header.alg !== 'RS256') throw new Error(`unsupported alg ${header.alg}`);

  const { keys } = await getJwks(env.CF_ACCESS_TEAM);
  const jwk = keys.find(k => k.kid === header.kid);
  if (!jwk) throw new Error('no matching key');

  const cryptoKey = await crypto.subtle.importKey(
    'jwk', jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false, ['verify'],
  );
  const signed = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
  const signature = b64urlToUint8(sigB64);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', cryptoKey, signature, signed);
  if (!ok) throw new Error('bad signature');

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) throw new Error('expired');
  if (payload.nbf && payload.nbf > now + 5) throw new Error('not yet valid');
  if (payload.iss !== `https://${env.CF_ACCESS_TEAM}`) throw new Error('bad iss');
  const auds = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!auds.includes(env.CF_ACCESS_AUD)) throw new Error('bad aud');

  return payload;
}

// Verifies the request, returns { ok: true, payload } or { ok: false, response: Response }.
export async function authenticate(request, env) {
  if (!env.CF_ACCESS_TEAM || !env.CF_ACCESS_AUD) {
    return { ok: false, response: new Response('Server misconfigured', { status: 500 }) };
  }
  const token = readToken(request);
  if (!token) return { ok: false, response: new Response('Unauthorized', { status: 401 }) };
  try {
    const payload = await verifyAccessJwt(token, env);
    return { ok: true, payload };
  } catch {
    return { ok: false, response: new Response('Unauthorized', { status: 401 }) };
  }
}

// Admin gate. Caller has already verified the JWT. Returns { ok: true } or { ok: false, response: 403 }.
export function requireAdmin(payload, env) {
  if (!env.ADMIN_EMAIL) {
    return { ok: false, response: new Response('Server misconfigured: no ADMIN_EMAIL', { status: 500 }) };
  }
  if (payload.email !== env.ADMIN_EMAIL) {
    return { ok: false, response: new Response(JSON.stringify({ error: 'admin only' }), {
      status: 403, headers: { 'content-type': 'application/json' },
    }) };
  }
  return { ok: true };
}
