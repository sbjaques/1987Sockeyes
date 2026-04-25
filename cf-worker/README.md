# Sockeyes Archive Media Worker

Resolves `archive.87sockeyes.win/media/<path>` to objects in the `1987sockeyes-private` R2 bucket.

The Worker verifies the Cloudflare Access JWT before fetching from R2 — defense in depth, so this route stays gated even if the Access Application's policy is later misconfigured back into Bypass. Two layers must both fail before a private scan leaks: (1) the Access Application allows the request through, AND (2) the Worker accepts the JWT.

## Configuration

Two Worker vars in `wrangler.toml` (both are public identifiers — safe to commit):

- `CF_ACCESS_TEAM` — your team domain, e.g. `sbjaques.cloudflareaccess.com`. From CF Zero Trust → Settings → Custom Pages → Team domain.
- `CF_ACCESS_AUD` — the Application AUD tag. From CF Zero Trust → Access → Applications → **Sockeyes Archive** → Overview → "Application Audience (AUD) Tag". Paste the long hex string.

If you ever recreate the Access Application, the AUD changes; update `wrangler.toml` and redeploy.

## Deploy

```
cd cf-worker
npx wrangler deploy
```

CF dashboard one-time wiring (not in this repo):

1. Workers & Pages → `sockeyes-archive-media` → Triggers → Custom Domains → add `archive.87sockeyes.win/media/*`.
2. Zero Trust → Access → Applications → "Sockeyes Archive" → ensure path coverage includes `/media/*` (or leave path blank to cover everything).

## Verify after deploy

Anonymous request — should return **401**:

```
curl -sI https://archive.87sockeyes.win/media/scans/<imageId>.jpg
# expect: HTTP/2 302  (redirect to Cloudflare Access login — Access intercepts before the Worker)
```

If you reach the Worker directly (e.g. by sending the request to its `*.workers.dev` URL with no Access cookie), expect **401 Unauthorized** instead of a 302.

Authenticated request — sign in to `https://archive.87sockeyes.win/` in a browser (you'll get a one-time PIN by email), then load `https://archive.87sockeyes.win/media/scans/<imageId>.jpg` — the JPEG streams.

## What the Worker checks (in order)

1. `CF_ACCESS_TEAM` and `CF_ACCESS_AUD` are set → else 500.
2. JWT present in `Cf-Access-Jwt-Assertion` header or `CF_Authorization` cookie → else 401.
3. JWT signature verifies against the team's JWKS (`https://${CF_ACCESS_TEAM}/cdn-cgi/access/certs`, cached 1h).
4. JWT claims: `iss = https://${CF_ACCESS_TEAM}`, `aud` includes `CF_ACCESS_AUD`, `exp` not past, `nbf` not future.
5. Path matches `/media/<key>` → else 404.
6. R2 object exists → else 404. Otherwise stream with `cache-control: private, max-age=3600`.
