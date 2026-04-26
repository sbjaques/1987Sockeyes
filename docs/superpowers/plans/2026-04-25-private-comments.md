# Private Archive Comments + Admin Inbox Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let any private-tier user (you, family, players, descendants) submit corrections, identifications, or stories on the archive — globally or pinned to a specific vault item — and surface them in an admin-only inbox for triage that integrates into the corpus through the existing chat-based per-item review workflow.

**Architecture:** A single CF Worker (`sockeyes-archive-media`, extended) hosts six new `/api/*` routes alongside its existing `/media/*` route, backed by a new KV namespace `SOCKEYES_COMMENTS`. Admin identity is server-side only — `GET /api/me` returns `{ email, isAdmin }` derived from the CF Access JWT plus a Worker-side `ADMIN_EMAIL` secret check; the frontend never knows the admin's address. All comment UI is build-time gated by `BUILD_MODE === 'private'` so the public bundle ships zero code or strings related to comments. Email notifications go through Resend with both the API key and destination address as Wrangler secrets.

**Tech stack:**
- **Worker:** ESM Modules workers, `itty-router` (~1KB) for routing, `ajv` for JSON-schema validation, `@cloudflare/vitest-pool-workers` for tests, native `fetch()` to Resend's API
- **Frontend:** Existing Vite + React 19 + TypeScript + Tailwind + React Router (HashRouter), Vitest + Testing Library
- **Storage:** Cloudflare KV (single namespace, five key prefixes)
- **Auth:** Cloudflare Access (existing) + RS256 JWT verification on every `/api/*` (existing helpers extended)

The full design lives at [`docs/superpowers/specs/2026-04-25-private-comments-design.md`](../specs/2026-04-25-private-comments-design.md).

---

## File structure

### New files

**Worker side (`cf-worker/`):**
- `cf-worker/lib/access.js` — JWT helpers: `verifyAccessJwt`, `readToken`, `getJwks`, base64 helpers, `requireAdmin` middleware
- `cf-worker/lib/csrf.js` — `requireOrigin` helper for `POST` routes
- `cf-worker/lib/kv.js` — typed KV helpers: comments, annotations, counts, rate-limit, submitters
- `cf-worker/lib/schema.js` — ajv validator factory + compiled validators for each schema
- `cf-worker/lib/email.js` — Resend client (single `sendNotification` function)
- `cf-worker/handlers.js` — six route handlers (me, comments-create, counts, comments-list, status, annotations, recount)
- `cf-worker/schemas/comment.schema.json` — `POST /api/comments` body
- `cf-worker/schemas/status.schema.json` — `POST /api/comments/:id/status` body
- `cf-worker/schemas/annotation.schema.json` — `POST /api/annotations/:email` body
- `cf-worker/tests/access.test.js` — JWT verify happy path + tampered tokens + admin gate
- `cf-worker/tests/comments.test.js` — schema validation, rate limit, counts cache update
- `cf-worker/tests/integration.test.js` — full request → KV round-trip
- `cf-worker/vitest.config.js` — `@cloudflare/vitest-pool-workers` config

**Frontend (`src/`):**
- `src/lib/api.ts` — typed wrappers for `/api/*` fetches with shared error handling
- `src/lib/comments.ts` — Comment / Annotation / Counts type definitions (shared with the Worker schemas)
- `src/hooks/useMe.ts` — fetches `/api/me`, in-memory cache, exposes `{ email, isAdmin, annotation, isLoading }`
- `src/hooks/useCommentCounts.ts` — fetches `/api/comments/counts` once at vault mount
- `src/components/comments/LeaveNoteModal.tsx` — modal with body textarea + first-submission annotation field
- `src/components/comments/LeaveNoteButton.tsx` — header / lightbox pill button
- `src/components/comments/CommentIcon.tsx` — `MediaCard` corner icon + count badge
- `src/components/inbox/AdminBadge.tsx` — header pending-count badge
- `src/pages/AdminInboxPage.tsx` — `/admin/inbox` page (tabs + filters + cursor pagination)
- `src/components/inbox/InboxRow.tsx` — single row with triage panel
- `src/components/inbox/InboxFilters.tsx` — target/submitter/sort filters + search
- `src/components/comments/LeaveNoteModal.test.tsx`
- `src/components/comments/CommentIcon.test.tsx`
- `src/components/inbox/InboxRow.test.tsx`
- `src/hooks/useMe.test.tsx`
- `src/pages/VaultPage.test.tsx` (new — covers `?focus=<id>` behavior)

### Modified files

- `cf-worker/wrangler.toml` — add KV namespace binding, document new secrets
- `cf-worker/archive-media-resolver.js` — refactor to use `itty-router`, import `lib/access.js`, mount `/media/*` and `/api/*`
- `cf-worker/package.json` — new file; add `itty-router` + `ajv` + Vitest dev deps
- `src/components/vault/MediaCard.tsx` — add `<CommentIcon>` (private build only)
- `src/components/vault/MediaLightbox.tsx` — add `<LeaveNoteButton>` to the toolbar
- `src/components/layout/Header.tsx` — add `<LeaveNoteButton>` and `<AdminBadge>` (private build only)
- `src/pages/VaultPage.tsx` — read `?focus=<id>` on mount → scroll to item → open `MediaLightbox`
- `src/App.tsx` (or wherever routes are declared) — add `/admin/inbox` route, gate to private build
- `scripts/verify-build-filter.mjs` — assert public bundle contains no `/api/comments`, `/api/me`, `/admin/inbox`, `LeaveNoteModal`, `Resend`, `RESEND_API_KEY`

---

## Phase 1 — Worker refactor + foundation

### Task 1: Initialize Worker package + add deps

Worker doesn't currently have its own `package.json`; it ships as a single source file. Adding routing + schema-validation needs proper bundling.

**Files:**
- Create: `cf-worker/package.json`
- Create: `cf-worker/vitest.config.js`

- [ ] **Step 1: Create the Worker package.json**

```bash
cat > cf-worker/package.json <<'EOF'
{
  "name": "sockeyes-archive-media",
  "version": "0.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy",
    "test": "vitest run"
  },
  "dependencies": {
    "ajv": "^8.17.1",
    "itty-router": "^5.0.18"
  },
  "devDependencies": {
    "@cloudflare/vitest-pool-workers": "^0.5.0",
    "vitest": "^3.2.4",
    "wrangler": "^3.78.0"
  }
}
EOF
```

- [ ] **Step 2: Install deps**

```bash
cd cf-worker && npm install
```

Expected: lockfile created, no errors.

- [ ] **Step 3: Create vitest config for Workers**

Write `cf-worker/vitest.config.js`:

```javascript
import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
  test: {
    poolOptions: {
      workers: {
        wrangler: { configPath: './wrangler.toml' },
        miniflare: {
          compatibilityDate: '2026-04-22',
          compatibilityFlags: ['nodejs_compat'],
          kvNamespaces: ['SOCKEYES_COMMENTS'],
          bindings: {
            CF_ACCESS_TEAM: 'sbjaques.cloudflareaccess.com',
            CF_ACCESS_AUD: 'test-audience',
            ADMIN_EMAIL: 'admin@example.com',
            NOTIFY_EMAIL: 'notify@example.com',
            RESEND_API_KEY: 'test-key',
          },
        },
      },
    },
  },
});
```

- [ ] **Step 4: Verify the test runner boots**

```bash
cd cf-worker && npx vitest run --reporter=verbose 2>&1 | head -10
```

Expected: "No test files found, exiting with code 0" or similar — verifying Vitest + the workers pool can start.

- [ ] **Step 5: Commit**

```bash
cd c:/Users/sjaques/projects/1987Sockeyes
git add cf-worker/package.json cf-worker/package-lock.json cf-worker/vitest.config.js
git commit -m "worker: bootstrap package.json + vitest pool-workers config"
```

---

### Task 2: Extract JWT helpers to `lib/access.js`

The current Worker has all JWT logic inlined. Extract to a reusable module so both `/media/*` and the new `/api/*` routes share the verify path.

**Files:**
- Create: `cf-worker/lib/access.js`
- Create: `cf-worker/tests/access.test.js`

- [ ] **Step 1: Write the failing test for `readToken`**

`cf-worker/tests/access.test.js`:

```javascript
import { describe, it, expect } from 'vitest';
import { readToken } from '../lib/access.js';

describe('readToken', () => {
  it('reads the cf-access-jwt-assertion header', () => {
    const req = new Request('https://example.test/x', {
      headers: { 'cf-access-jwt-assertion': 'abc.def.ghi  ' },
    });
    expect(readToken(req)).toBe('abc.def.ghi');
  });

  it('falls back to the CF_Authorization cookie', () => {
    const req = new Request('https://example.test/x', {
      headers: { cookie: 'foo=1; CF_Authorization=abc.def.ghi; bar=2' },
    });
    expect(readToken(req)).toBe('abc.def.ghi');
  });

  it('returns null when neither header nor cookie has a token', () => {
    const req = new Request('https://example.test/x');
    expect(readToken(req)).toBeNull();
  });
});
```

- [ ] **Step 2: Run the test to confirm it fails**

```bash
cd cf-worker && npx vitest run tests/access.test.js
```

Expected: FAIL — module `../lib/access.js` not found.

- [ ] **Step 3: Create `cf-worker/lib/access.js` with the extracted helpers**

```javascript
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
```

- [ ] **Step 4: Re-run the test to confirm it passes**

```bash
cd cf-worker && npx vitest run tests/access.test.js
```

Expected: 3/3 pass.

- [ ] **Step 5: Commit**

```bash
cd c:/Users/sjaques/projects/1987Sockeyes
git add cf-worker/lib/access.js cf-worker/tests/access.test.js
git commit -m "worker: extract JWT helpers to lib/access.js with tests"
```

---

### Task 3: Add CSRF origin-check helper

**Files:**
- Create: `cf-worker/lib/csrf.js`
- Modify: `cf-worker/tests/access.test.js` (extend with one origin test)

- [ ] **Step 1: Add the failing test**

Append to `cf-worker/tests/access.test.js`:

```javascript
import { requireOrigin } from '../lib/csrf.js';

describe('requireOrigin', () => {
  const allowed = ['https://archive.87sockeyes.win'];

  it('passes when Origin matches an allowed value', () => {
    const req = new Request('https://archive.87sockeyes.win/api/comments', {
      method: 'POST',
      headers: { Origin: 'https://archive.87sockeyes.win' },
    });
    expect(requireOrigin(req, allowed).ok).toBe(true);
  });

  it('rejects when Origin is missing', () => {
    const req = new Request('https://archive.87sockeyes.win/api/comments', { method: 'POST' });
    const r = requireOrigin(req, allowed);
    expect(r.ok).toBe(false);
    expect(r.response.status).toBe(403);
  });

  it('rejects when Origin is wrong', () => {
    const req = new Request('https://archive.87sockeyes.win/api/comments', {
      method: 'POST',
      headers: { Origin: 'https://attacker.example' },
    });
    expect(requireOrigin(req, allowed).ok).toBe(false);
  });
});
```

- [ ] **Step 2: Run, expect failure**

```bash
cd cf-worker && npx vitest run tests/access.test.js
```

Expected: FAIL — `../lib/csrf.js` not found.

- [ ] **Step 3: Create `cf-worker/lib/csrf.js`**

```javascript
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
```

- [ ] **Step 4: Run, expect pass**

```bash
cd cf-worker && npx vitest run tests/access.test.js
```

Expected: all access + csrf tests pass.

- [ ] **Step 5: Commit**

```bash
cd c:/Users/sjaques/projects/1987Sockeyes
git add cf-worker/lib/csrf.js cf-worker/tests/access.test.js
git commit -m "worker: add Origin-header CSRF helper"
```

---

### Task 4: Add KV namespace + new secrets to wrangler.toml

The KV namespace is provisioned via `wrangler kv:namespace create` (returns IDs); secrets via `wrangler secret put` (encrypted, never in repo).

**Files:**
- Modify: `cf-worker/wrangler.toml`

- [ ] **Step 1: Provision the KV namespace**

```bash
cd cf-worker
npx wrangler kv:namespace create SOCKEYES_COMMENTS
npx wrangler kv:namespace create SOCKEYES_COMMENTS --preview
```

Expected output: two ID strings printed. Copy them.

- [ ] **Step 2: Update `cf-worker/wrangler.toml`**

Append after the existing `[[r2_buckets]]` block:

```toml
[[kv_namespaces]]
binding = "SOCKEYES_COMMENTS"
id = "<paste production id>"
preview_id = "<paste preview id>"
```

Append a comment block at the bottom documenting required secrets:

```toml
# Required secrets (set via `wrangler secret put`, never committed):
#   ADMIN_EMAIL       — the archivist's email for admin-route access
#   NOTIFY_EMAIL      — notification destination address
#   RESEND_API_KEY    — Resend API key for transactional email
```

- [ ] **Step 3: Set the three secrets**

```bash
cd cf-worker
npx wrangler secret put ADMIN_EMAIL       # paste archivist email when prompted
npx wrangler secret put NOTIFY_EMAIL      # paste notification destination
npx wrangler secret put RESEND_API_KEY    # paste Resend API key
```

Expected: each prompts for the value and confirms "Successfully created secret."

- [ ] **Step 4: Add the new CF route binding**

Cloudflare dashboard → Workers & Pages → `sockeyes-archive-media` → Triggers → Routes → Add Route:
- Route: `archive.87sockeyes.win/api/*`
- Zone: `87sockeyes.win`

Verify the existing `archive.87sockeyes.win/media/*` route is still listed.

- [ ] **Step 5: Commit (config only — secrets are not in repo)**

```bash
cd c:/Users/sjaques/projects/1987Sockeyes
git add cf-worker/wrangler.toml
git commit -m "worker: bind SOCKEYES_COMMENTS KV namespace + document secrets"
```

---

### Task 5: Add JSON schemas + ajv validators in `lib/schema.js`

**Files:**
- Create: `cf-worker/schemas/comment.schema.json`
- Create: `cf-worker/schemas/status.schema.json`
- Create: `cf-worker/schemas/annotation.schema.json`
- Create: `cf-worker/lib/schema.js`
- Create: `cf-worker/tests/schema.test.js`

- [ ] **Step 1: Write the failing test**

`cf-worker/tests/schema.test.js`:

```javascript
import { describe, it, expect } from 'vitest';
import { validateCommentBody, validateStatusBody, validateAnnotationBody } from '../lib/schema.js';

describe('comment body validation', () => {
  it('accepts a valid global comment', () => {
    const r = validateCommentBody({ target: 'global', body: 'hello world' });
    expect(r.ok).toBe(true);
  });

  it('accepts a valid media-target comment with first annotation', () => {
    const r = validateCommentBody({
      target: 'media:scan-12345',
      body: 'a memory',
      firstAnnotation: "Brian Kozak's son",
    });
    expect(r.ok).toBe(true);
  });

  it('rejects an empty body', () => {
    const r = validateCommentBody({ target: 'global', body: '' });
    expect(r.ok).toBe(false);
    expect(r.errors[0].instancePath).toBe('/body');
  });

  it('rejects a body over 4000 chars', () => {
    const r = validateCommentBody({ target: 'global', body: 'x'.repeat(4001) });
    expect(r.ok).toBe(false);
  });

  it('rejects an invalid target', () => {
    const r = validateCommentBody({ target: 'player:steve', body: 'x' });
    expect(r.ok).toBe(false);
  });

  it('rejects extra properties', () => {
    const r = validateCommentBody({ target: 'global', body: 'x', evil: 'extra' });
    expect(r.ok).toBe(false);
  });
});

describe('status body validation', () => {
  it('accepts applied + adminNote', () => {
    expect(validateStatusBody({ status: 'applied', adminNote: 'merged' }).ok).toBe(true);
  });
  it('rejects unknown status', () => {
    expect(validateStatusBody({ status: 'foo' }).ok).toBe(false);
  });
});

describe('annotation body validation', () => {
  it('accepts a label', () => {
    expect(validateAnnotationBody({ label: "Brian Kozak's son" }).ok).toBe(true);
  });
  it('rejects empty label', () => {
    expect(validateAnnotationBody({ label: '' }).ok).toBe(false);
  });
});
```

- [ ] **Step 2: Run, expect failure**

```bash
cd cf-worker && npx vitest run tests/schema.test.js
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create the three schema files**

`cf-worker/schemas/comment.schema.json`:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["target", "body"],
  "properties": {
    "target": { "type": "string", "pattern": "^(global|media:[a-z0-9-]+)$" },
    "body":   { "type": "string", "minLength": 1, "maxLength": 4000 },
    "firstAnnotation": { "type": "string", "minLength": 1, "maxLength": 200 }
  },
  "additionalProperties": false
}
```

`cf-worker/schemas/status.schema.json`:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["status"],
  "properties": {
    "status":    { "enum": ["pending", "applied", "rejected", "parked"] },
    "adminNote": { "type": "string", "maxLength": 500 }
  },
  "additionalProperties": false
}
```

`cf-worker/schemas/annotation.schema.json`:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["label"],
  "properties": {
    "label": { "type": "string", "minLength": 1, "maxLength": 200 }
  },
  "additionalProperties": false
}
```

- [ ] **Step 4: Create `cf-worker/lib/schema.js`**

```javascript
import Ajv from 'ajv';
import commentSchema from '../schemas/comment.schema.json' assert { type: 'json' };
import statusSchema from '../schemas/status.schema.json' assert { type: 'json' };
import annotationSchema from '../schemas/annotation.schema.json' assert { type: 'json' };

const ajv = new Ajv({ allErrors: true });
const compiledComment    = ajv.compile(commentSchema);
const compiledStatus     = ajv.compile(statusSchema);
const compiledAnnotation = ajv.compile(annotationSchema);

function wrap(validator) {
  return (body) => {
    const ok = validator(body);
    return ok ? { ok: true } : { ok: false, errors: validator.errors || [] };
  };
}

export const validateCommentBody    = wrap(compiledComment);
export const validateStatusBody     = wrap(compiledStatus);
export const validateAnnotationBody = wrap(compiledAnnotation);
```

- [ ] **Step 5: Run, expect pass; commit**

```bash
cd cf-worker && npx vitest run tests/schema.test.js
```

Expected: 9/9 pass.

```bash
cd c:/Users/sjaques/projects/1987Sockeyes
git add cf-worker/schemas/ cf-worker/lib/schema.js cf-worker/tests/schema.test.js
git commit -m "worker: add JSON schemas + ajv validators for comment/status/annotation bodies"
```

---

### Task 6: KV helper module — `lib/kv.js`

Encapsulate every KV read/write so handlers don't touch `env.SOCKEYES_COMMENTS` directly.

**Files:**
- Create: `cf-worker/lib/kv.js`
- Create: `cf-worker/tests/kv.test.js`

- [ ] **Step 1: Write the failing tests**

`cf-worker/tests/kv.test.js`:

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { env } from 'cloudflare:test';
import {
  putComment, getComment, listComments,
  putAnnotation, getAnnotation,
  readCounts, incrementCounts, applyStatusChange,
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
    await incrementCounts(env, 'media:scan-1', +1);
    const c = await readCounts(env);
    expect(c.byStatus.pending).toBe(1);
    expect(c.byTarget['media:scan-1']).toBe(1);
  });
  it('shifts byStatus on status change', async () => {
    await incrementCounts(env, 'global', +1);
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
```

- [ ] **Step 2: Run, expect failure**

```bash
cd cf-worker && npx vitest run tests/kv.test.js
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create `cf-worker/lib/kv.js`**

```javascript
// All KV access goes through this module. Handlers never touch env.SOCKEYES_COMMENTS directly.

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
const ZERO_COUNTS = () => ({
  byStatus: { pending: 0, applied: 0, rejected: 0, parked: 0 },
  byTarget: {},
});

export async function readCounts(env) {
  const raw = await env.SOCKEYES_COMMENTS.get(COUNTS_KEY);
  return raw ? JSON.parse(raw) : ZERO_COUNTS();
}

export async function incrementCounts(env, target, delta) {
  const counts = await readCounts(env);
  counts.byStatus.pending += delta;
  counts.byTarget[target] = (counts.byTarget[target] || 0) + delta;
  if (counts.byTarget[target] <= 0) delete counts.byTarget[target];
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
      counts.byStatus[c.status] = (counts.byStatus[c.status] || 0) + 1;
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
```

- [ ] **Step 4: Run, expect pass**

```bash
cd cf-worker && npx vitest run tests/kv.test.js
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
cd c:/Users/sjaques/projects/1987Sockeyes
git add cf-worker/lib/kv.js cf-worker/tests/kv.test.js
git commit -m "worker: add lib/kv.js with comment/annotation/counts/rate/submitter helpers"
```

---

### Task 7: Email helper — `lib/email.js`

Best-effort Resend send, never blocks comment persistence.

**Files:**
- Create: `cf-worker/lib/email.js`

- [ ] **Step 1: Create `cf-worker/lib/email.js`**

```javascript
// Resend transactional email. Sender is fixed (noreply@87sockeyes.win).
// Both NOTIFY_EMAIL (destination) and RESEND_API_KEY are Wrangler secrets.

const SENDER = 'noreply@87sockeyes.win';
const RESEND_URL = 'https://api.resend.com/emails';

export async function sendNotification(env, comment) {
  if (!env.RESEND_API_KEY || !env.NOTIFY_EMAIL) {
    return { ok: false, error: 'email service not configured' };
  }
  const subject = `New ${comment.target === 'global' ? 'archive note' : 'comment'} — 1987 Sockeyes`;
  const html = `
    <p>A new comment landed in the archive inbox.</p>
    <p><strong>From:</strong> ${escapeHtml(comment.submitterEmail)}<br/>
       <strong>About:</strong> ${escapeHtml(comment.target)}<br/>
       <strong>When:</strong> ${new Date(comment.submittedAt).toISOString()}</p>
    <blockquote style="border-left:4px solid #D8282B;padding-left:12px;margin:12px 0;">
      ${escapeHtml(comment.body).replace(/\n/g, '<br/>')}
    </blockquote>
    <p><a href="https://archive.87sockeyes.win/admin/inbox">Open inbox →</a></p>
  `;
  try {
    const res = await fetch(RESEND_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from: SENDER,
        to: env.NOTIFY_EMAIL,
        subject,
        html,
      }),
    });
    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      return { ok: false, error: `resend ${res.status}: ${errBody.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
```

- [ ] **Step 2: Commit**

```bash
cd c:/Users/sjaques/projects/1987Sockeyes
git add cf-worker/lib/email.js
git commit -m "worker: add Resend notification helper (best-effort send)"
```

---

### Task 8: Refactor `archive-media-resolver.js` to use itty-router

The existing handler hard-routes `/media/*`. After this task it routes both `/media/*` and `/api/*` (handlers stub to 501 for now; we'll fill them in subsequent tasks).

**Files:**
- Modify: `cf-worker/archive-media-resolver.js`
- Create: `cf-worker/handlers.js`

- [ ] **Step 1: Create `cf-worker/handlers.js` with stub handlers**

```javascript
// All /api/* route handlers. Stubs are filled in by Tasks 9, 10, 24-27.
import { authenticate, requireAdmin } from './lib/access.js';

export async function handleMe(request, env) {
  const auth = await authenticate(request, env);
  if (!auth.ok) return auth.response;
  const isAdmin = auth.payload.email === env.ADMIN_EMAIL;
  return Response.json({
    email: auth.payload.email,
    isAdmin,
    annotation: null,  // filled in by Task 9
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
```

- [ ] **Step 2: Replace `cf-worker/archive-media-resolver.js`**

```javascript
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
```

- [ ] **Step 3: Smoke-test the refactored worker against the existing /media/* path**

```bash
cd cf-worker && npx wrangler dev --local
# In another terminal:
curl -i http://localhost:8787/media/test 2>&1 | head -3
```

Expected: 401 Unauthorized (no JWT). Confirms routing is wired and JWT-verify path is intact for `/media/*`.

```bash
curl -i http://localhost:8787/api/me 2>&1 | head -3
```

Expected: 401 Unauthorized (no JWT) — `/api/*` now routable and authenticated.

Stop wrangler dev (Ctrl+C).

- [ ] **Step 4: Run all worker tests to confirm nothing regressed**

```bash
cd cf-worker && npx vitest run
```

Expected: all access + csrf + schema + kv tests pass.

- [ ] **Step 5: Commit**

```bash
cd c:/Users/sjaques/projects/1987Sockeyes
git add cf-worker/handlers.js cf-worker/archive-media-resolver.js
git commit -m "worker: refactor to itty-router + mount /api/* alongside /media/*"
```

---

### Task 9: Implement `GET /api/me`

Returns `{ email, isAdmin, annotation }` for the calling user.

**Files:**
- Modify: `cf-worker/handlers.js`
- Create: `cf-worker/tests/me.test.js`

- [ ] **Step 1: Write the failing test**

`cf-worker/tests/me.test.js`:

```javascript
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
```

- [ ] **Step 2: Run, expect failure**

```bash
cd cf-worker && npx vitest run tests/me.test.js
```

Expected: 3rd test fails — `annotation` is `null`, not the expected label.

- [ ] **Step 3: Implement the handler**

Replace `handleMe` in `cf-worker/handlers.js`:

```javascript
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
```

- [ ] **Step 4: Run, expect pass**

```bash
cd cf-worker && npx vitest run tests/me.test.js
```

Expected: 3/3 pass.

- [ ] **Step 5: Commit**

```bash
cd c:/Users/sjaques/projects/1987Sockeyes
git add cf-worker/handlers.js cf-worker/tests/me.test.js
git commit -m "worker: implement GET /api/me with admin + annotation lookup"
```

---

## Phase 2 — Comment submission backend

### Task 10: Implement `POST /api/comments` (without email send)

Validates the body, enforces rate limit, persists, updates counts. Email integration lands in Task 12.

**Files:**
- Modify: `cf-worker/handlers.js`
- Create: `cf-worker/tests/comments.test.js`

- [ ] **Step 1: Write the failing test**

`cf-worker/tests/comments.test.js`:

```javascript
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
```

- [ ] **Step 2: Run, expect failure**

```bash
cd cf-worker && npx vitest run tests/comments.test.js
```

Expected: tests fail — handler returns 501.

- [ ] **Step 3: Implement `handleCreateComment`**

Replace in `cf-worker/handlers.js`:

```javascript
import { authenticate, requireAdmin } from './lib/access.js';
import { requireOrigin, ALLOWED_ORIGINS } from './lib/csrf.js';
import { validateCommentBody } from './lib/schema.js';
import {
  getAnnotation, putAnnotation, getComment, putComment,
  incrementCounts, getRateWindow, recordRateHit, addSubmitter,
} from './lib/kv.js';

const RATE_HOUR = 10;
const RATE_DAY = 50;

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
  await incrementCounts(env, body.target, +1);
  await addSubmitter(env, submitterEmail);

  // Write-once annotation seed
  if (body.firstAnnotation) {
    const existing = await getAnnotation(env, submitterEmail);
    if (!existing) {
      await putAnnotation(env, submitterEmail, { label: body.firstAnnotation, updatedAt: now });
    }
  }

  return Response.json({ id, submittedAt: now }, { status: 201 });
}
```

- [ ] **Step 4: Run, expect pass**

```bash
cd cf-worker && npx vitest run tests/comments.test.js
```

Expected: all 7 tests pass.

- [ ] **Step 5: Commit**

```bash
cd c:/Users/sjaques/projects/1987Sockeyes
git add cf-worker/handlers.js cf-worker/tests/comments.test.js
git commit -m "worker: implement POST /api/comments with schema/rate-limit/CSRF/counts"
```

---

### Task 11: Wire Resend send into `POST /api/comments`

Append email send after the KV writes; track `emailNotified` / `emailError` on the comment record.

**Files:**
- Modify: `cf-worker/handlers.js`
- Modify: `cf-worker/tests/comments.test.js` (mock fetch)

- [ ] **Step 1: Add a test asserting email-send is fire-and-forget**

Append to `cf-worker/tests/comments.test.js`:

```javascript
import { sendNotification } from '../lib/email.js';

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
```

- [ ] **Step 2: Run, expect failure**

```bash
cd cf-worker && npx vitest run tests/comments.test.js
```

Expected: 2 new tests fail — `emailNotified` not updated.

- [ ] **Step 3: Wire `sendNotification` into the handler**

Update `handleCreateComment` in `cf-worker/handlers.js` (replace the `return Response.json...` at the end):

```javascript
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
```

Add the import at the top of `handlers.js`:

```javascript
import { sendNotification } from './lib/email.js';
```

- [ ] **Step 4: Run, expect all comments tests pass**

```bash
cd cf-worker && npx vitest run tests/comments.test.js
```

Expected: 9/9 pass.

- [ ] **Step 5: Commit**

```bash
cd c:/Users/sjaques/projects/1987Sockeyes
git add cf-worker/handlers.js cf-worker/tests/comments.test.js
git commit -m "worker: wire Resend best-effort send into POST /api/comments"
```

---

## Phase 3 — Comment submission frontend

### Task 12: Frontend types + typed API client

**Files:**
- Create: `src/lib/comments.ts`
- Create: `src/lib/api.ts`

- [ ] **Step 1: Create the shared types**

`src/lib/comments.ts`:

```typescript
export type CommentTarget = 'global' | `media:${string}`;
export type CommentStatus = 'pending' | 'applied' | 'rejected' | 'parked';

export interface Comment {
  id: string;
  target: CommentTarget;
  body: string;
  submitterEmail: string;
  submitterFirstAnnotation?: string;
  status: CommentStatus;
  adminNote?: string;
  submittedAt: number;
  lastTriagedAt?: number;
  emailNotified?: boolean;
  emailError?: string;
}

export interface MeResponse {
  email: string;
  isAdmin: boolean;
  annotation: string | null;
}

export interface CountsResponse {
  byStatus: Record<CommentStatus, number>;
  byTarget: Record<string, number>;
}

export interface ListResponse {
  comments: Comment[];
  cursor: string | null;
}
```

- [ ] **Step 2: Create the API client**

`src/lib/api.ts`:

```typescript
import type { Comment, CountsResponse, ListResponse, MeResponse, CommentStatus } from './comments';

const BASE = ''; // relative — same origin as the SPA

class ApiError extends Error {
  constructor(public status: number, public body: unknown) {
    super(`api ${status}`);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    let body: unknown;
    try { body = await res.json(); } catch { body = await res.text(); }
    throw new ApiError(res.status, body);
  }
  return res.json() as Promise<T>;
}

export const api = {
  me: () => request<MeResponse>('/api/me'),
  counts: () => request<CountsResponse>('/api/comments/counts'),
  createComment: (body: { target: string; body: string; firstAnnotation?: string }) =>
    request<{ id: string; submittedAt: number }>('/api/comments', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  listComments: (params: { status?: CommentStatus; cursor?: string }) => {
    const qs = new URLSearchParams();
    if (params.status) qs.set('status', params.status);
    if (params.cursor) qs.set('cursor', params.cursor);
    return request<ListResponse>(`/api/comments?${qs}`);
  },
  setStatus: (id: string, status: CommentStatus, adminNote?: string) =>
    request<Comment>(`/api/comments/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, adminNote }),
    }),
  setAnnotation: (email: string, label: string) =>
    request<{ label: string; updatedAt: number }>(`/api/annotations/${encodeURIComponent(email)}`, {
      method: 'POST',
      body: JSON.stringify({ label }),
    }),
};

export { ApiError };
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd c:/Users/sjaques/projects/1987Sockeyes && npx tsc -b
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/comments.ts src/lib/api.ts
git commit -m "frontend: add comment types + typed API client"
```

---

### Task 13: `useMe` hook with module-level cache

**Files:**
- Create: `src/hooks/useMe.ts`
- Create: `src/hooks/useMe.test.tsx`

- [ ] **Step 1: Write the failing test**

`src/hooks/useMe.test.tsx`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useMe, _resetMeCache } from './useMe';

beforeEach(() => {
  _resetMeCache();
  vi.restoreAllMocks();
});

describe('useMe', () => {
  it('fetches /api/me and returns the response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ email: 'a@b.test', isAdmin: false, annotation: null }), { status: 200 }),
    );
    const { result } = renderHook(() => useMe());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual({ email: 'a@b.test', isAdmin: false, annotation: null });
  });

  it('caches the response across multiple hook instances', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ email: 'a@b.test', isAdmin: false, annotation: null }), { status: 200 }),
    );
    renderHook(() => useMe());
    renderHook(() => useMe());
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
  });
});
```

- [ ] **Step 2: Run, expect failure**

```bash
cd c:/Users/sjaques/projects/1987Sockeyes && npx vitest run src/hooks/useMe.test.tsx
```

Expected: FAIL — module `./useMe` not found.

- [ ] **Step 3: Create `src/hooks/useMe.ts`**

```typescript
import { useEffect, useState } from 'react';
import type { MeResponse } from '../lib/comments';
import { api } from '../lib/api';

let cache: MeResponse | null = null;
let inflight: Promise<MeResponse> | null = null;

export function _resetMeCache() {
  cache = null;
  inflight = null;
}

export interface UseMeResult {
  data: MeResponse | null;
  isLoading: boolean;
  error: unknown;
}

export function useMe(): UseMeResult {
  const [data, setData] = useState<MeResponse | null>(cache);
  const [error, setError] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(cache === null);

  useEffect(() => {
    if (cache) return;
    setIsLoading(true);
    if (!inflight) inflight = api.me();
    inflight
      .then((r) => { cache = r; setData(r); })
      .catch((e) => setError(e))
      .finally(() => setIsLoading(false));
  }, []);

  return { data, isLoading, error };
}
```

- [ ] **Step 4: Run, expect pass**

```bash
npx vitest run src/hooks/useMe.test.tsx
```

Expected: 2/2 pass.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useMe.ts src/hooks/useMe.test.tsx
git commit -m "frontend: add useMe hook with module-level cache"
```

---

### Task 14: `LeaveNoteModal` component

Reusable modal — opens from header (target=global) or vault item (target=media:<id>).

**Files:**
- Create: `src/components/comments/LeaveNoteModal.tsx`
- Create: `src/components/comments/LeaveNoteModal.test.tsx`

- [ ] **Step 1: Write the failing test**

`src/components/comments/LeaveNoteModal.test.tsx`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LeaveNoteModal } from './LeaveNoteModal';
import { _resetMeCache } from '../../hooks/useMe';

beforeEach(() => {
  _resetMeCache();
  vi.restoreAllMocks();
});

function withMe(annotation: string | null) {
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
    const u = String(url);
    if (u.endsWith('/api/me')) {
      return new Response(JSON.stringify({ email: 'a@b.test', isAdmin: false, annotation }), { status: 200 });
    }
    if (u.endsWith('/api/comments')) {
      return new Response(JSON.stringify({ id: 'new-id', submittedAt: Date.now() }), { status: 201 });
    }
    return new Response('not stubbed', { status: 599 });
  });
}

describe('LeaveNoteModal', () => {
  it('renders the body textarea and target pill for global', () => {
    withMe(null);
    render(<LeaveNoteModal target="global" targetLabel="General archive note" onClose={() => {}} />);
    expect(screen.getByText(/General archive note/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/correction|identification|memory/i)).toBeInTheDocument();
  });

  it('shows the connection input only on first submission', async () => {
    withMe(null);
    render(<LeaveNoteModal target="global" targetLabel="General archive note" onClose={() => {}} />);
    expect(await screen.findByPlaceholderText(/Brian Kozak's son/i)).toBeInTheDocument();
  });

  it('hides the connection input when annotation already exists', async () => {
    withMe('Cousin');
    render(<LeaveNoteModal target="global" targetLabel="General archive note" onClose={() => {}} />);
    await screen.findByText(/General archive note/);
    expect(screen.queryByPlaceholderText(/Brian Kozak's son/i)).not.toBeInTheDocument();
  });

  it('renders body text via plain text node — script tags as literals', () => {
    withMe(null);
    render(<LeaveNoteModal target="global" targetLabel="General archive note" onClose={() => {}} />);
    const textarea = screen.getByPlaceholderText(/correction|identification|memory/i);
    fireEvent.change(textarea, { target: { value: '<script>alert(1)</script>' } });
    expect((textarea as HTMLTextAreaElement).value).toBe('<script>alert(1)</script>');
  });

  it('calls onClose when Cancel clicked', async () => {
    withMe(null);
    const onClose = vi.fn();
    render(<LeaveNoteModal target="global" targetLabel="General archive note" onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('submits and calls onClose on success', async () => {
    withMe(null);
    const onClose = vi.fn();
    render(<LeaveNoteModal target="global" targetLabel="General archive note" onClose={onClose} />);
    await screen.findByPlaceholderText(/Brian Kozak's son/i);
    fireEvent.change(screen.getByPlaceholderText(/correction|identification|memory/i), {
      target: { value: 'a real comment body that is long enough' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Leave note/i }));
    await new Promise((r) => setTimeout(r, 30));
    expect(onClose).toHaveBeenCalled();
  });

  it('responds to ESC key to close', () => {
    withMe(null);
    const onClose = vi.fn();
    render(<LeaveNoteModal target="global" targetLabel="General archive note" onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run, expect failure**

```bash
npx vitest run src/components/comments/LeaveNoteModal.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create `src/components/comments/LeaveNoteModal.tsx`**

```typescript
import { useEffect, useRef, useState } from 'react';
import { api } from '../../lib/api';
import { useMe } from '../../hooks/useMe';

interface Props {
  target: string;             // "global" or "media:<id>"
  targetLabel: string;        // human-readable label shown in the pill
  onClose: () => void;
}

export function LeaveNoteModal({ target, targetLabel, onClose }: Props) {
  const me = useMe();
  const [body, setBody] = useState('');
  const [firstAnnotation, setFirstAnnotation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFocusable = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    firstFocusable.current?.focus();
  }, []);

  const isFirst = me.data?.annotation === null;

  async function handleSubmit() {
    if (submitting) return;
    if (!body.trim()) { setError('Please enter a note.'); return; }
    setSubmitting(true);
    setError(null);
    try {
      await api.createComment({
        target,
        body: body.trim(),
        firstAnnotation: isFirst && firstAnnotation.trim() ? firstAnnotation.trim() : undefined,
      });
      onClose();
    } catch (e) {
      setError('Could not save — try again.');
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Leave a note"
      className="fixed inset-0 bg-navy/70 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={dialogRef} className="bg-cream max-w-2xl w-full rounded shadow-xl p-6">
        <div className="flex items-baseline justify-between mb-1">
          <h3 className="text-lg font-serif">Leave a note</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-navy/60 text-lg">×</button>
        </div>
        <div className="text-xs uppercase tracking-widest text-navy/60 mb-3">
          About: <span className="bg-navy text-cream px-2 py-0.5 rounded ml-1 normal-case tracking-normal">{targetLabel}</span>
        </div>
        {isFirst && (
          <input
            type="text"
            value={firstAnnotation}
            onChange={(e) => setFirstAnnotation(e.target.value)}
            placeholder="Brian Kozak's son (optional — helps Steve recognize you)"
            className="w-full mb-3 px-3 py-2 border border-navy/20 bg-white rounded text-sm"
            maxLength={200}
          />
        )}
        <textarea
          ref={firstFocusable}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="A correction, an identification, a memory, a question — anything you want Steve to see. He reviews everything personally before integrating."
          className="w-full min-h-[140px] px-3 py-2 border border-navy/20 bg-white rounded text-sm font-serif"
          maxLength={4000}
        />
        {error && <div className="text-crimson text-sm mt-2">{error}</div>}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-xs uppercase tracking-widest text-navy">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-crimson text-cream px-5 py-2 text-xs uppercase tracking-widest disabled:opacity-50">
            {submitting ? 'Sending…' : 'Leave note →'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run, expect pass**

```bash
npx vitest run src/components/comments/LeaveNoteModal.test.tsx
```

Expected: 7/7 pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/comments/LeaveNoteModal.tsx src/components/comments/LeaveNoteModal.test.tsx
git commit -m "frontend: add LeaveNoteModal with a11y + first-submission annotation"
```

---

### Task 15: Wire `LeaveNoteButton` into header (private build only)

**Files:**
- Create: `src/components/comments/LeaveNoteButton.tsx`
- Modify: `src/components/layout/Header.tsx`

- [ ] **Step 1: Create the trigger button**

`src/components/comments/LeaveNoteButton.tsx`:

```typescript
import { useState } from 'react';
import { LeaveNoteModal } from './LeaveNoteModal';

interface Props {
  target: string;
  targetLabel: string;
  variant?: 'pill' | 'icon';
  className?: string;
}

export function LeaveNoteButton({ target, targetLabel, variant = 'pill', className = '' }: Props) {
  const [open, setOpen] = useState(false);
  const trigger = variant === 'pill' ? (
    <button
      onClick={() => setOpen(true)}
      className={`bg-crimson text-cream px-3 py-1.5 text-xs uppercase tracking-widest hover:bg-crimson/90 rounded-sm ${className}`}>
      + Leave a note
    </button>
  ) : (
    <button
      onClick={() => setOpen(true)}
      aria-label="Leave a note"
      title="Leave a note"
      className={`bg-navy/85 hover:bg-crimson text-cream rounded-full w-7 h-7 flex items-center justify-center text-sm ${className}`}>
      💬
    </button>
  );
  return <>
    {trigger}
    {open && <LeaveNoteModal target={target} targetLabel={targetLabel} onClose={() => setOpen(false)} />}
  </>;
}
```

- [ ] **Step 2: Modify the header to include the button on the private build**

Find the actions section of `src/components/layout/Header.tsx` and add (gated by `BUILD_MODE === 'private'`):

```typescript
import { BUILD_MODE } from '../../lib/buildMode';
import { LeaveNoteButton } from '../comments/LeaveNoteButton';
// ...inside the JSX, near the existing search/nav actions:
{BUILD_MODE === 'private' && (
  <LeaveNoteButton target="global" targetLabel="General archive note" variant="pill" className="ml-2" />
)}
```

(Adapt the exact placement to the existing Header structure.)

- [ ] **Step 3: Run all frontend tests**

```bash
npx vitest run --reporter=verbose 2>&1 | tail -10
```

Expected: all existing tests still pass.

- [ ] **Step 4: Manual smoke — public build**

```bash
npm run build:public
grep -r LeaveNoteButton dist-public/ || echo "absent — good"
grep -r LeaveNoteModal dist-public/ || echo "absent — good"
```

Expected: both grep results say "absent — good" (the `BUILD_MODE === 'private'` constant is replaced at build time and the button is dead code, tree-shaken).

- [ ] **Step 5: Commit**

```bash
git add src/components/comments/LeaveNoteButton.tsx src/components/layout/Header.tsx
git commit -m "frontend: add LeaveNoteButton + wire global trigger into private-tier header"
```

---

### Task 16: Add `CommentIcon` to `MediaCard` (private build only)

**Files:**
- Create: `src/components/comments/CommentIcon.tsx`
- Modify: `src/components/vault/MediaCard.tsx`

- [ ] **Step 1: Create `CommentIcon`**

`src/components/comments/CommentIcon.tsx`:

```typescript
import { LeaveNoteButton } from './LeaveNoteButton';

interface Props {
  target: string;
  targetLabel: string;
  count?: number;
}

export function CommentIcon({ target, targetLabel, count }: Props) {
  return (
    <div
      className="absolute bottom-2 right-2"
      onClick={(e) => e.stopPropagation()}>
      <div className="relative">
        <LeaveNoteButton target={target} targetLabel={targetLabel} variant="icon" />
        {count != null && count > 0 && (
          <span className="absolute -top-1 -right-1 bg-crimson text-cream text-[9px] px-1 rounded-full font-bold">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Modify `MediaCard.tsx`**

Add at the top:

```typescript
import { CommentIcon } from '../comments/CommentIcon';
```

Replace the closing tag of the `<div className="relative group ...">` wrapper to include the icon — just before the existing `<a>` download link, gated by `BUILD_MODE === 'private'`:

```typescript
{BUILD_MODE === 'private' && (
  <CommentIcon
    target={`media:${item.id}`}
    targetLabel={`${item.attribution?.paper ?? item.type}${item.date ? ' · ' + item.date : ''}`}
  />
)}
```

(Counts wired in Task 18; for now no `count` prop is passed.)

- [ ] **Step 3: Run frontend tests**

```bash
npx vitest run
```

Expected: all pass.

- [ ] **Step 4: Public-bundle no-leak check**

```bash
npm run build:public
grep -r CommentIcon dist-public/ || echo "absent — good"
```

Expected: absent.

- [ ] **Step 5: Commit**

```bash
git add src/components/comments/CommentIcon.tsx src/components/vault/MediaCard.tsx
git commit -m "frontend: add per-vault-item CommentIcon trigger (private build only)"
```

---

### Task 17: Add `LeaveNoteButton` to `MediaLightbox` toolbar

**Files:**
- Modify: `src/components/vault/MediaLightbox.tsx`

- [ ] **Step 1: Read the existing lightbox to find the toolbar**

```bash
grep -n "Download\|Zoom" src/components/vault/MediaLightbox.tsx | head -10
```

- [ ] **Step 2: Add the button next to existing toolbar actions**

Inside the toolbar JSX (alongside the existing Zoom/Download buttons), add:

```typescript
{BUILD_MODE === 'private' && currentItem && (
  <LeaveNoteButton
    target={`media:${currentItem.id}`}
    targetLabel={`${currentItem.attribution?.paper ?? currentItem.type}${currentItem.date ? ' · ' + currentItem.date : ''}`}
    variant="pill"
  />
)}
```

Add the imports at the top:

```typescript
import { BUILD_MODE } from '../../lib/buildMode';
import { LeaveNoteButton } from '../comments/LeaveNoteButton';
```

(Adjust the variable name `currentItem` to match what the lightbox actually exposes for the current image.)

- [ ] **Step 3: Run frontend tests**

```bash
npx vitest run
```

Expected: all pass.

- [ ] **Step 4: Manual smoke**

```bash
npm run dev:private
```

Open browser to `http://localhost:5173`, navigate to Vault, open a media item; confirm the "+ Leave a note" pill appears in the lightbox toolbar.

- [ ] **Step 5: Commit**

```bash
git add src/components/vault/MediaLightbox.tsx
git commit -m "frontend: wire LeaveNoteButton into MediaLightbox toolbar (private build only)"
```

---

## Phase 4 — Comment counts

### Task 18: Implement `GET /api/comments/counts`

**Files:**
- Modify: `cf-worker/handlers.js`
- Create: `cf-worker/tests/counts.test.js`

- [ ] **Step 1: Write the failing test**

`cf-worker/tests/counts.test.js`:

```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { env, SELF } from 'cloudflare:test';
import * as access from '../lib/access.js';
import { incrementCounts } from '../lib/kv.js';

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

  it('returns counts after increments', async () => {
    await incrementCounts(env, 'media:scan-1', +1);
    await incrementCounts(env, 'media:scan-1', +1);
    await incrementCounts(env, 'global', +1);
    const res = await SELF.fetch('http://archive.87sockeyes.win/api/comments/counts', {
      headers: { 'x-test-email': 'a@b.test' },
    });
    const body = await res.json();
    expect(body.byStatus.pending).toBe(3);
    expect(body.byTarget['media:scan-1']).toBe(2);
    expect(body.byTarget['global']).toBe(1);
  });
});
```

- [ ] **Step 2: Run, expect failure**

```bash
cd cf-worker && npx vitest run tests/counts.test.js
```

- [ ] **Step 3: Implement `handleCommentCounts`**

In `cf-worker/handlers.js`:

```javascript
import { readCounts } from './lib/kv.js';

export async function handleCommentCounts(request, env) {
  const auth = await authenticate(request, env);
  if (!auth.ok) return auth.response;
  return Response.json(await readCounts(env));
}
```

- [ ] **Step 4: Run, expect pass**

```bash
cd cf-worker && npx vitest run tests/counts.test.js
```

- [ ] **Step 5: Commit**

```bash
cd c:/Users/sjaques/projects/1987Sockeyes
git add cf-worker/handlers.js cf-worker/tests/counts.test.js
git commit -m "worker: implement GET /api/comments/counts batch endpoint"
```

---

### Task 19: `useCommentCounts` hook + wire into `VaultGrid`

Single fetch at vault mount; `MediaCard` reads from the resulting map.

**Files:**
- Create: `src/hooks/useCommentCounts.ts`
- Modify: `src/components/vault/VaultGrid.tsx`
- Modify: `src/components/vault/MediaCard.tsx`

- [ ] **Step 1: Create the hook**

`src/hooks/useCommentCounts.ts`:

```typescript
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { CountsResponse } from '../lib/comments';
import { BUILD_MODE } from '../lib/buildMode';

export function useCommentCounts(): { byTarget: Record<string, number> } {
  const [byTarget, setByTarget] = useState<Record<string, number>>({});
  useEffect(() => {
    if (BUILD_MODE !== 'private') return;
    api.counts()
      .then((r: CountsResponse) => setByTarget(r.byTarget))
      .catch(() => {});  // silent — count badge is decorative
  }, []);
  return { byTarget };
}
```

- [ ] **Step 2: Wire into `VaultGrid`**

In `src/components/vault/VaultGrid.tsx`, near the top of the component:

```typescript
import { useCommentCounts } from '../../hooks/useCommentCounts';
// ...
const { byTarget: commentCounts } = useCommentCounts();
```

Pass `commentCount={commentCounts[`media:${item.id`]}` into each `MediaCard`.

- [ ] **Step 3: Update `MediaCard` to accept the count prop**

Add to props:

```typescript
export function MediaCard({ item, onOpen, commentCount }: { item: MediaItem; onOpen: (m: MediaItem) => void; commentCount?: number }) {
```

Pass to `CommentIcon`:

```typescript
{BUILD_MODE === 'private' && (
  <CommentIcon
    target={`media:${item.id}`}
    targetLabel={`${item.attribution?.paper ?? item.type}${item.date ? ' · ' + item.date : ''}`}
    count={commentCount}
  />
)}
```

- [ ] **Step 4: Run frontend tests**

```bash
npx vitest run
```

Expected: existing tests still pass.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useCommentCounts.ts src/components/vault/VaultGrid.tsx src/components/vault/MediaCard.tsx
git commit -m "frontend: wire per-card comment counts via single useCommentCounts fetch"
```

---

## Phase 5 — Admin inbox

### Task 20: Implement `GET /api/comments` (admin-only, paginated)

**Files:**
- Modify: `cf-worker/handlers.js`

- [ ] **Step 1: Write a quick test in `cf-worker/tests/comments.test.js`**

Append:

```javascript
import { putComment } from '../lib/kv.js';

describe('GET /api/comments (admin-only list)', () => {
  it('rejects 403 for non-admin', async () => {
    const res = await SELF.fetch('http://archive.87sockeyes.win/api/comments', {
      headers: { 'x-test-email': 'cousin@example.com' },
    });
    expect(res.status).toBe(403);
  });

  it('returns paginated list for admin', async () => {
    for (let i = 0; i < 25; i++) {
      await putComment(env, {
        id: `id-${i}`, target: 'global', body: `b${i}`,
        submitterEmail: 'a@b.test', status: 'pending', submittedAt: Date.now() + i,
      });
    }
    const res = await SELF.fetch('http://archive.87sockeyes.win/api/comments?status=pending', {
      headers: { 'x-test-email': 'admin@example.com' },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.comments.length).toBe(20);
    expect(body.cursor).toBeTruthy();
    const page2 = await SELF.fetch(`http://archive.87sockeyes.win/api/comments?status=pending&cursor=${encodeURIComponent(body.cursor)}`, {
      headers: { 'x-test-email': 'admin@example.com' },
    });
    const p2 = await page2.json();
    expect(p2.comments.length).toBe(5);
  });
});
```

- [ ] **Step 2: Run, expect failure**

- [ ] **Step 3: Implement `handleListComments` in `cf-worker/handlers.js`**

```javascript
import { listComments } from './lib/kv.js';

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
```

- [ ] **Step 4: Run, expect pass**

- [ ] **Step 5: Commit**

```bash
cd c:/Users/sjaques/projects/1987Sockeyes
git add cf-worker/handlers.js cf-worker/tests/comments.test.js
git commit -m "worker: implement admin-only GET /api/comments with cursor pagination"
```

---

### Task 21: Implement status flip + annotation set + recount

**Files:**
- Modify: `cf-worker/handlers.js`

- [ ] **Step 1: Add tests**

In `cf-worker/tests/comments.test.js`:

```javascript
import { applyStatusChange, getAnnotation, recountAll } from '../lib/kv.js';

describe('POST /api/comments/:id/status', () => {
  it('flips status, updates counts, sets adminNote', async () => {
    await putComment(env, {
      id: 'flip-1', target: 'global', body: 'x',
      submitterEmail: 'a@b.test', status: 'pending', submittedAt: Date.now(),
    });
    const res = await SELF.fetch('http://archive.87sockeyes.win/api/comments/flip-1/status', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-test-email': 'admin@example.com', Origin: 'https://archive.87sockeyes.win' },
      body: JSON.stringify({ status: 'applied', adminNote: 'merged into bio' }),
    });
    expect(res.status).toBe(200);
    const updated = JSON.parse(await env.SOCKEYES_COMMENTS.get('comment:flip-1'));
    expect(updated.status).toBe('applied');
    expect(updated.adminNote).toBe('merged into bio');
  });
});

describe('POST /api/annotations/:email', () => {
  it('admin can set annotation', async () => {
    const res = await SELF.fetch('http://archive.87sockeyes.win/api/annotations/cousin%40example.com', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-test-email': 'admin@example.com', Origin: 'https://archive.87sockeyes.win' },
      body: JSON.stringify({ label: 'Brian Kozak\'s son' }),
    });
    expect(res.status).toBe(200);
    expect((await getAnnotation(env, 'cousin@example.com')).label).toBe("Brian Kozak's son");
  });
});

describe('POST /api/admin/recount', () => {
  it('recomputes counts from scratch', async () => {
    await putComment(env, {
      id: 'rc-1', target: 'media:s1', body: 'x',
      submitterEmail: 'a@b.test', status: 'applied', submittedAt: Date.now(),
    });
    const res = await SELF.fetch('http://archive.87sockeyes.win/api/admin/recount', {
      method: 'POST',
      headers: { 'x-test-email': 'admin@example.com', Origin: 'https://archive.87sockeyes.win' },
    });
    expect(res.status).toBe(200);
    const counts = await res.json();
    expect(counts.byStatus.applied).toBe(1);
    expect(counts.byTarget['media:s1']).toBe(1);
  });
});
```

- [ ] **Step 2: Run, expect failure**

- [ ] **Step 3: Implement the three handlers in `cf-worker/handlers.js`**

```javascript
import { validateStatusBody, validateAnnotationBody } from './lib/schema.js';
import { recountAll, putAnnotation } from './lib/kv.js';

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
```

(Add the missing imports: `applyStatusChange`, `getComment`, `putAnnotation`, `recountAll`.)

- [ ] **Step 4: Run, expect pass**

```bash
cd cf-worker && npx vitest run
```

- [ ] **Step 5: Commit**

```bash
cd c:/Users/sjaques/projects/1987Sockeyes
git add cf-worker/handlers.js cf-worker/tests/comments.test.js
git commit -m "worker: implement admin status-flip + annotation-set + recount endpoints"
```

---

### Task 22: Build `AdminInboxPage`

**Files:**
- Create: `src/pages/AdminInboxPage.tsx`
- Create: `src/components/inbox/InboxRow.tsx`
- Create: `src/components/inbox/InboxRow.test.tsx`

- [ ] **Step 1: Write a row test**

`src/components/inbox/InboxRow.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InboxRow } from './InboxRow';

const baseComment = {
  id: 'c1', target: 'global' as const, body: 'a memory',
  submitterEmail: 'a@b.test', status: 'pending' as const, submittedAt: Date.now() - 60_000,
};

describe('InboxRow', () => {
  it('renders body and submitter', () => {
    render(<InboxRow comment={baseComment} annotation={null} onTriage={() => {}} onAnnotate={() => {}} />);
    expect(screen.getByText('a memory')).toBeInTheDocument();
    expect(screen.getByText('a@b.test')).toBeInTheDocument();
  });

  it('renders body as plain text — script tag is literal', () => {
    render(<InboxRow comment={{ ...baseComment, body: '<script>alert(1)</script>' }} annotation={null} onTriage={() => {}} onAnnotate={() => {}} />);
    expect(screen.getByText('<script>alert(1)</script>')).toBeInTheDocument();
    expect(document.querySelector('script')).toBeNull();
  });

  it('shows email-failure pill if emailNotified=false', () => {
    render(<InboxRow comment={{ ...baseComment, emailNotified: false, emailError: 'oops' }} annotation={null} onTriage={() => {}} onAnnotate={() => {}} />);
    expect(screen.getByText(/delivery failed/i)).toBeInTheDocument();
  });

  it('fires onTriage when Applied clicked', () => {
    const onTriage = vi.fn();
    render(<InboxRow comment={baseComment} annotation={null} onTriage={onTriage} onAnnotate={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Applied/i }));
    expect(onTriage).toHaveBeenCalledWith('applied', '');
  });
});
```

- [ ] **Step 2: Run, expect failure**

- [ ] **Step 3: Create `InboxRow`**

`src/components/inbox/InboxRow.tsx`:

```typescript
import { useState } from 'react';
import type { Comment, CommentStatus } from '../../lib/comments';

interface Props {
  comment: Comment;
  annotation: string | null;
  onTriage: (status: CommentStatus, adminNote: string) => void;
  onAnnotate: () => void;
}

export function InboxRow({ comment, annotation, onTriage, onAnnotate }: Props) {
  const [adminNote, setAdminNote] = useState(comment.adminNote ?? '');
  const ts = new Date(comment.submittedAt);
  const targetLabel = comment.target === 'global'
    ? 'General archive note'
    : comment.target;
  return (
    <div className="grid grid-cols-[1fr_280px] border-b border-cream-300 last:border-b-0">
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-3 text-xs mb-2">
          <span className="font-semibold">{comment.submitterEmail}</span>
          {annotation && <span className="italic opacity-60">— {annotation}</span>}
          <span className="bg-navy text-cream px-2 py-0.5 rounded text-[11px]">{targetLabel}</span>
          {comment.emailNotified === false && (
            <span className="text-crimson text-[11px]">✉ delivery failed</span>
          )}
          <span className="opacity-50 ml-auto">{ts.toLocaleString()}</span>
        </div>
        <p className="text-sm whitespace-pre-wrap">{comment.body}</p>
      </div>
      <div className="border-l border-cream-300 p-4 bg-cream-100">
        <div className="text-[11px] uppercase tracking-widest opacity-60 mb-2">Triage</div>
        <div className="flex gap-2 flex-wrap mb-2">
          <button onClick={() => onTriage('applied', adminNote)}
            className="bg-crimson text-cream px-3 py-1 text-[11px] uppercase tracking-widest rounded">✓ Applied</button>
          <button onClick={() => onTriage('rejected', adminNote)}
            className="border border-navy/30 px-3 py-1 text-[11px] uppercase tracking-widest rounded">✗ Rejected</button>
          <button onClick={() => onTriage('parked', adminNote)}
            className="border border-navy/30 px-3 py-1 text-[11px] uppercase tracking-widest rounded">⏸ Parked</button>
        </div>
        <textarea
          value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
          placeholder="One-line note (optional)"
          className="w-full text-xs px-2 py-1 border border-navy/20 rounded"
          rows={2}
          maxLength={500}
        />
        {!annotation && (
          <button onClick={onAnnotate} className="text-[11px] text-crimson mt-2 underline">
            + Annotate this submitter
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run, expect pass**

```bash
npx vitest run src/components/inbox/InboxRow.test.tsx
```

- [ ] **Step 5: Commit**

```bash
git add src/components/inbox/InboxRow.tsx src/components/inbox/InboxRow.test.tsx
git commit -m "frontend: add InboxRow with triage actions + email-failure pill"
```

---

### Task 23: Compose `AdminInboxPage` (v1: tabs + cursor pagination only)

> **v1 scope note:** the spec calls for filter UI (target-type dropdown, submitter dropdown, body-text search, newest/oldest sort). v1 ships **tabs + cursor pagination only**. The data layer (`meta:submitters`, status filtering on the Worker side) is already wired from Tasks 6 and 20, so the filter UI is a pure-frontend follow-up tracked at the bottom of this plan.

**Files:**
- Create: `src/pages/AdminInboxPage.tsx`

- [ ] **Step 1: Create the page**

```typescript
import { useEffect, useState } from 'react';
import { api, ApiError } from '../lib/api';
import { useMe } from '../hooks/useMe';
import { InboxRow } from '../components/inbox/InboxRow';
import type { Comment, CommentStatus, CountsResponse } from '../lib/comments';

const TABS: CommentStatus[] = ['pending', 'applied', 'rejected', 'parked'];

export function AdminInboxPage() {
  const me = useMe();
  const [activeTab, setActiveTab] = useState<CommentStatus>('pending');
  const [comments, setComments] = useState<Comment[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [counts, setCounts] = useState<CountsResponse | null>(null);
  const [annotations, setAnnotations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.counts().then(setCounts).catch(() => {});
  }, []);

  async function loadPage(opts: { reset?: boolean } = {}) {
    setLoading(true);
    setError(null);
    try {
      const r = await api.listComments({
        status: activeTab,
        cursor: opts.reset ? undefined : cursor ?? undefined,
      });
      setComments((prev) => opts.reset ? r.comments : [...prev, ...r.comments]);
      setCursor(r.cursor);
    } catch (e) {
      setError(e instanceof ApiError ? `Error ${e.status}` : 'Network error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadPage({ reset: true }); }, [activeTab]);

  async function triage(c: Comment, status: CommentStatus, adminNote: string) {
    await api.setStatus(c.id, status, adminNote);
    setComments((prev) => prev.filter((x) => x.id !== c.id));
    api.counts().then(setCounts);
  }

  async function annotate(email: string) {
    const label = window.prompt(`Annotate ${email} (e.g. "Brian Kozak's son")`);
    if (!label) return;
    await api.setAnnotation(email, label);
    setAnnotations((prev) => ({ ...prev, [email]: label }));
  }

  if (me.isLoading) return <div className="p-8 text-center">Loading…</div>;
  if (!me.data?.isAdmin) {
    return <div className="p-8 text-center"><h1 className="text-2xl">Not authorized</h1>
      <p className="opacity-70 mt-2">This page is for the archivist only.</p></div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-serif mb-4">Admin inbox</h1>
      <div className="flex border-b border-navy/20 mb-4">
        {TABS.map((t) => (
          <button key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-xs uppercase tracking-widest border-b-2 ${activeTab === t ? 'border-crimson' : 'border-transparent opacity-60'}`}>
            {t} {counts && <span className="ml-2 bg-cream-300 px-2 rounded-full">{counts.byStatus[t]}</span>}
          </button>
        ))}
      </div>
      {error && <div className="text-crimson text-sm mb-3">{error}</div>}
      <div className="bg-white border border-navy/10 rounded">
        {comments.map((c) => (
          <InboxRow
            key={c.id}
            comment={c}
            annotation={annotations[c.submitterEmail] ?? null}
            onTriage={(status, note) => triage(c, status, note)}
            onAnnotate={() => annotate(c.submitterEmail)}
          />
        ))}
        {comments.length === 0 && !loading && (
          <div className="p-12 text-center opacity-60">No {activeTab} comments.</div>
        )}
      </div>
      {cursor && (
        <button
          onClick={() => loadPage()}
          disabled={loading}
          className="mt-4 mx-auto block px-4 py-2 text-xs uppercase tracking-widest border border-navy/30 rounded">
          {loading ? 'Loading…' : 'Load more'}
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Add the route**

In whatever file declares routes (e.g. `src/App.tsx` — adapt to actual structure):

```typescript
import { AdminInboxPage } from './pages/AdminInboxPage';
import { BUILD_MODE } from './lib/buildMode';

// Inside <Routes>:
{BUILD_MODE === 'private' && <Route path="/admin/inbox" element={<AdminInboxPage />} />}
```

- [ ] **Step 3: Run frontend tests + dev**

```bash
npx vitest run
```

Expected: all pass.

```bash
npm run dev:private
```

Open `http://localhost:5173/#/admin/inbox` in a browser. Confirm "Not authorized" renders unless you stub admin (Task 24 wires the real admin gate from CF Access in production).

- [ ] **Step 4: Public-bundle no-leak check**

```bash
npm run build:public
grep -r AdminInboxPage dist-public/ || echo "absent — good"
grep -r "/admin/inbox" dist-public/ || echo "absent — good"
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/AdminInboxPage.tsx src/App.tsx
git commit -m "frontend: add AdminInboxPage at /admin/inbox (private build, isAdmin-gated)"
```

---

### Task 24: Header `AdminBadge` with pending count

**Files:**
- Create: `src/components/inbox/AdminBadge.tsx`
- Modify: `src/components/layout/Header.tsx`

- [ ] **Step 1: Create the badge**

`src/components/inbox/AdminBadge.tsx`:

```typescript
import { Link } from 'react-router-dom';
import { useMe } from '../../hooks/useMe';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export function AdminBadge() {
  const me = useMe();
  const [pending, setPending] = useState<number | null>(null);
  useEffect(() => {
    if (!me.data?.isAdmin) return;
    api.counts().then((c) => setPending(c.byStatus.pending)).catch(() => {});
  }, [me.data?.isAdmin]);

  if (!me.data?.isAdmin || pending === null) return null;
  return (
    <Link
      to="/admin/inbox"
      title="Admin inbox"
      className="inline-flex items-center gap-1 bg-navy/85 hover:bg-crimson text-cream px-2 py-1 rounded text-[11px]">
      ✉ <span className="font-bold">{pending}</span>
    </Link>
  );
}
```

- [ ] **Step 2: Add to header**

In `src/components/layout/Header.tsx`, near the LeaveNoteButton:

```typescript
import { AdminBadge } from '../inbox/AdminBadge';
// ...
{BUILD_MODE === 'private' && <AdminBadge />}
```

- [ ] **Step 3: Run frontend tests**

- [ ] **Step 4: Commit**

```bash
git add src/components/inbox/AdminBadge.tsx src/components/layout/Header.tsx
git commit -m "frontend: header AdminBadge shows pending count for admin only"
```

---

### Task 25: `VaultPage` `?focus=<id>` deep-link

**Files:**
- Modify: `src/pages/VaultPage.tsx`
- Create: `src/pages/VaultPage.test.tsx`

- [ ] **Step 1: Write the failing test**

`src/pages/VaultPage.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { VaultPage } from './VaultPage';

describe('VaultPage ?focus=<id>', () => {
  it('opens the lightbox for the focused item', async () => {
    render(
      <MemoryRouter initialEntries={['/vault?focus=scan-664872292']}>
        <Routes>
          <Route path="/vault" element={<VaultPage />} />
        </Routes>
      </MemoryRouter>,
    );
    await waitFor(() => {
      const dialog = document.querySelector('[role="dialog"]');
      expect(dialog).toBeTruthy();
    });
  });
});
```

(Adjust `scan-664872292` to a real id in `media.json`.)

- [ ] **Step 2: Run, expect failure**

- [ ] **Step 3: Modify `VaultPage.tsx`**

Inside the component, near the top:

```typescript
import { useSearchParams } from 'react-router-dom';
import { useEffect, useRef } from 'react';

const [searchParams] = useSearchParams();
const focusId = searchParams.get('focus');

useEffect(() => {
  if (!focusId) return;
  // The vault grid renders all items; find the one matching focusId and open it.
  const item = items.find((i) => i.id === focusId);
  if (item) setLightboxItem(item);  // adapt to existing state setter
}, [focusId, items]);
```

(Adapt to the existing component's lightbox state management.)

- [ ] **Step 4: Run, expect pass**

- [ ] **Step 5: Commit**

```bash
git add src/pages/VaultPage.tsx src/pages/VaultPage.test.tsx
git commit -m "frontend: VaultPage handles ?focus=<id> -> auto-open lightbox"
```

---

## Phase 6 — Verification

### Task 26: Extend `verify-build-filter.mjs`

**Files:**
- Modify: `scripts/verify-build-filter.mjs`

- [ ] **Step 1: Add the new assertions**

Find the existing string-presence checks and add:

```javascript
const FORBIDDEN_IN_PUBLIC = [
  '/api/comments',
  '/api/me',
  '/admin/inbox',
  'LeaveNoteModal',
  'LeaveNoteButton',
  'AdminInboxPage',
  'Resend',
  'RESEND_API_KEY',
  'NOTIFY_EMAIL',
  'ADMIN_EMAIL',
];

const fs = await import('node:fs');
const path = await import('node:path');
const distPublic = path.join(process.cwd(), 'dist-public');
const jsFiles = fs.readdirSync(path.join(distPublic, 'assets')).filter(f => f.endsWith('.js'));
for (const f of jsFiles) {
  const content = fs.readFileSync(path.join(distPublic, 'assets', f), 'utf8');
  for (const forbidden of FORBIDDEN_IN_PUBLIC) {
    if (content.includes(forbidden)) {
      console.error(`✗ FAIL: dist-public/assets/${f} contains "${forbidden}"`);
      process.exit(1);
    }
  }
}
console.log('✓ public bundle clean of comment/admin strings');
```

- [ ] **Step 2: Run the verifier**

```bash
npm run build:public
node scripts/verify-build-filter.mjs
```

Expected: passes — no forbidden strings in public bundle.

- [ ] **Step 3: Run the existing test suite end-to-end**

```bash
npm run validate:data
npm test -- --run
cd cf-worker && npm test
```

Expected: all green.

- [ ] **Step 4: Manual E2E smoke test**

```bash
npm run dev:private
```

In a browser:
1. Click `+ Leave a note` in the header → modal opens with target = "General archive note", body textarea, optional "How are you connected" field.
2. Submit a test note. Toast confirms; modal closes.
3. Confirm a notification email arrives at the address you set in `wrangler secret put NOTIFY_EMAIL`.
4. Open a vault item → lightbox shows `+ Leave a note` pill alongside Zoom/Download.
5. Submit a media-targeted note. Confirm the `💬N` badge appears on the corresponding card after a refresh.
6. Visit `/#/admin/inbox` while logged in as the admin email. Confirm the new comments appear in the Pending tab.
7. Click `✓ Applied` → comment moves out of Pending, counts update, target pill links to `/vault?focus=<id>` → opens that item's lightbox in a new tab.
8. Submit as a non-admin allowlisted email; visit `/#/admin/inbox` — confirm "Not authorized."

- [ ] **Step 5: Commit**

```bash
cd c:/Users/sjaques/projects/1987Sockeyes
git add scripts/verify-build-filter.mjs
git commit -m "build: extend verify-build-filter with comment/admin strings"
```

---

## Self-review checklist

Before declaring the implementation complete:

- [ ] `cf-worker/wrangler.toml` has `[[kv_namespaces]]` with both `id` and `preview_id`
- [ ] All three secrets set: `wrangler secret list` shows `ADMIN_EMAIL`, `NOTIFY_EMAIL`, `RESEND_API_KEY`
- [ ] Cloudflare dashboard route `archive.87sockeyes.win/api/*` is bound to `sockeyes-archive-media` Worker
- [ ] Resend domain `87sockeyes.win` is verified (DKIM TXT record on the CF DNS zone)
- [ ] `npm run build:public && node scripts/verify-build-filter.mjs` passes — public bundle has zero comment/admin strings
- [ ] All Vitest tests pass (frontend + worker)
- [ ] Manual E2E walkthrough in Task 26 Step 4 completes successfully

---

## Out of scope for this plan (deferred from the spec's Follow-ups, or v1.1)

- **Inbox filter UI** (target-type dropdown, submitter dropdown, body-text search, newest/oldest sort) — spec calls these out, but v1 ships with tabs + cursor pagination only. The data layer (`meta:submitters`, KV scans) is in place from Task 6, so adding the filter UI later is purely a frontend task. **Tracked as v1.1 follow-up.**
- D1 migration (only if KV listing exceeds 500ms p99 or > 2000 comments).
- Photo/file attachments.
- Comment threading.
- Public-tier commenting.
- Full-text search across comment bodies.
- `relatedPlayers: []` field on media items (separate spec for the download-by-player feature).
