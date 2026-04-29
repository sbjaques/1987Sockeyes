# Private archive comments + admin inbox — design (2026-04-25, v2)

A way for anyone with private archive access (you, family, players, their kids and grandkids) to leave structured corrections, identifications, and stories on the archive. You triage everything personally; integrations into the source data (`roster.json`, `media.json`, etc.) flow through the existing chat-based per-item review system.

> **v2 changes** (after independent review): admin identity moved entirely server-side; `BUILD_MODE === 'private'` gates added explicitly to comment surfaces; Worker refactor (JWT helpers + router) called out; sections added for body sanitization, rate limiting, pagination + counts cache, schema validation, operational checklist; "Submitted as" line dropped from the modal; mockup placeholder addresses sanitized; literal addresses removed from spec.

## Goals

1. Two friction-light entry points on the private tier:
   1. A **global** "leave a note" — for stories, identifications, or insights that don't pin to a specific item.
   2. A **per-vault-item** affordance on every `MediaCard` and `MediaLightbox` — for corrections and context on a specific clipping, photo, or video.
2. Comments persist server-side in Cloudflare KV and surface in a new `/admin/inbox` triage page (admin-only).
3. Integration into the corpus stays human — the inbox flips status (`Applied` / `Rejected` / `Parked`); actual data-file edits happen through the existing chat workflow under the per-item review rule (player-identity changes are proposed in chat and approved per-item before any write to `roster.json` / `media.json`).
4. **Privacy invariant: no email-shaped string ever ships to the deployed bundle, git, or any HTTP response.** The single exception is the outbound `From:` envelope on Resend-sent notification emails (sender = `noreply@87sockeyes.win`), which never appears in the bundle or in git — it only leaves the system inside an outbound SMTP envelope.

## Out of scope (v1)

- Comments on player profiles, games, season chapters, or paragraph-level "margin notes" on bios.
- Auto-PR generation or auto-edit-on-approve flows. Triage flips status; humans do the edits.
- Photo / file attachments on submission.
- Threaded replies between commenters.
- Public-tier commenting.
- The **download-everything-related-to-player-X** feature — separate spec. Comments are a *forcing function* for the data prerequisite (a `relatedPlayers: []` field per media item) but don't block on it.

## Architecture

### Frontend (gated to the private build)

| Surface | Trigger | Modal target | Build-mode gate |
|---|---|---|---|
| Header pill button `+ Leave a note` | Click | `target: "global"` | `BUILD_MODE === 'private'` |
| `MediaCard` corner icon (`💬`) and per-item count | Click on any vault card | `target: "media:<id>"` | `BUILD_MODE === 'private'` |
| `MediaLightbox` toolbar pill | Same modal, opened from inside the lightbox | `target: "media:<id>"` | `BUILD_MODE === 'private'` |
| `/admin/inbox` route | Direct URL or header badge | (admin-only — see below) | `BUILD_MODE === 'private'` |

Every comment surface — buttons, icons, the route, the count badges, the network calls that fetch counts — is wrapped in `BUILD_MODE === 'private'`. The public bundle does not render any of it and does not issue any `/api/*` request. The Vite build produces two distinct outputs from one codebase, so this is a build-time strip, not a runtime check.

**Admin identity is server-side only.** The frontend does *not* know the admin's email at build time. Instead:

- On private-tier load, the SPA calls `GET /api/me`, which returns `{ email, isAdmin, annotation }` derived from the CF Access JWT plus a server-side comparison against the Worker's `ADMIN_EMAIL` secret.
- The header badge (numeric pending count + link to inbox) renders only if `isAdmin === true`.
- The `/admin/inbox` route renders a "Not authorized" page if `isAdmin === false`.
- Worker-side admin gates (`GET /api/comments`, `POST /api/comments/:id/status`, `POST /api/annotations/:email`) re-check `isAdmin` on every request. The frontend gate is just UX; the Worker is the security boundary.

This drops the previous `VITE_ADMIN_EMAIL` design entirely. The admin email never leaves Worker env, never appears in the build artifact, never appears in CI config, never appears in `.env.private`.

### Backend (Cloudflare Worker — extends `sockeyes-archive-media`)

The existing Worker (`cf-worker/archive-media-resolver.js`) currently has all routing inlined in a single `fetch` handler that hard-routes `/media/*`. Adding 6 new routes requires a small refactor that the implementation plan must call out explicitly:

1. **Extract JWT helpers** (`verifyAccessJwt`, `readToken`) to `cf-worker/lib/access.js`. Used by both `/media/*` and the new `/api/*` routes.
2. **Add an explicit router.** Recommend `itty-router` (Worker-native, ~1KB, zero runtime dependencies). Hand-rolled `if/else` is acceptable but harder to read with 7 routes.
3. **Admin-check middleware** — a single `requireAdmin(env, jwt)` helper that returns `{ ok: true }` or `{ ok: false, response: 403 }`. Don't inline the email comparison five times.

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET` | `/api/me` | Any allowlisted JWT | Returns `{ email, isAdmin, annotation }` for the calling user. Used by the SPA to gate admin UI and by the modal to detect first submission. |
| `POST` | `/api/comments` | Any allowlisted JWT | Create new comment. If body includes `firstAnnotation` and no `annotation:<email>` exists yet, the Worker also writes the annotation (write-once semantics — submitters can seed, only admin can overwrite). Subject to per-submitter rate limit. |
| `GET` | `/api/comments/counts` | Any allowlisted JWT | Batch endpoint: returns `{ "media:<id>": N, ... }` for all media targets that have ≥ 1 comment. Used by `MediaCard` to render the `💬N` indicator without N requests per card. |
| `GET` | `/api/comments?status=...&cursor=...` | Admin only | List comments by status, paginated 20 per page using KV's opaque cursor. Response includes `nextCursor` for the next page. |
| `POST` | `/api/comments/:id/status` | Admin only | Triage: flip status, set `adminNote`. Updates `meta:counts` cache. |
| `POST` | `/api/annotations/:email` | Admin only | Admin overwrite/set submitter annotation (used from the inbox). |

All routes verify the JWT against the CF Access team JWKS (`sbjaques.cloudflareaccess.com`) using the existing RS256 path (now extracted to `lib/access.js`). Admin-only routes additionally pass through `requireAdmin`.

### Storage — Cloudflare KV

Single namespace `SOCKEYES_COMMENTS` bound in `cf-worker/wrangler.toml`. Five key prefixes:

```
comment:<uuid>           → Comment record (JSON)
annotation:<email>       → { label, updatedAt }
meta:counts              → { byStatus: {pending, applied, rejected, parked}, byTarget: {"media:<id>": N} }
meta:submitters          → { emails: [string] }      // distinct submitter emails seen, for inbox dropdown
meta:rate:<email>        → { hour: [ts], day: [ts] } // sliding-window timestamps for rate limiting
```

**Comment record shape:**

```ts
type Comment = {
  id: string;                                    // uuid v4
  target: "global" | `media:${string}`;          // 'global' or 'media:<media.id>'
  body: string;                                  // raw text, max 4000 chars
  submitterEmail: string;                        // pulled from CF Access JWT, not user input
  submitterFirstAnnotation?: string;             // optional, captured on first submission
  status: "pending" | "applied" | "rejected" | "parked";
  adminNote?: string;                            // optional one-liner from triage
  submittedAt: number;                           // epoch ms
  lastTriagedAt?: number;                        // epoch ms when status last flipped
  emailNotified?: boolean;                       // false if Resend send failed
  emailError?: string;                           // populated if emailNotified === false
};
```

**Pagination & counts cache:**

- Inbox lists 20 comments per page. The API uses cursor-based pagination (`?cursor=<opaque>`), not numeric pages — Cloudflare KV's `list({cursor})` returns an opaque cursor for the next page; numeric paging would require walking from page 1 each time. The inbox UI maps "next/prev" buttons onto the cursor; deep-linking to a specific page is not supported in v1.
- Tab counts (`{pending, applied, rejected, parked}`) are read from `meta:counts.byStatus`. Per-target counts (for `MediaCard 💬N`) are read from `meta:counts.byTarget`. Both are read-modify-written on every comment create and status flip. Served to the SPA via `GET /api/comments/counts` (admin-side tab counts) and the same endpoint (per-target counts for the vault). The frontend fires this **once per `VaultGrid` mount**, not per card; cards read counts from the resulting in-memory map.
- **Concurrent-write drift.** Workers KV has no transactions, so two simultaneous `POST /api/comments` writes can lose an increment via the read-modify-write race. Acceptable v1 trade-off: the counts cache is best-effort and may drift slightly under burst load. A small `POST /api/admin/recount` endpoint (admin-only, expensive: full namespace scan) lets you resync if the badge ever visibly diverges from reality. If accurate counts become critical, the right next step is a Durable Object (single-writer per namespace), but at our expected volume the simple recount endpoint is sufficient.

**Migration trigger.** KV is sufficient for hundreds of comments. If we ever pass 2000 comments total, or `KV.list` p99 latency exceeds 500ms in observation, migrate to D1 (SQLite). The query patterns are SQL-friendly (filter by status, by submitter, by target), so the migration is a one-time `wrangler d1 execute` import with minimal Worker code change.

### Email notifications

When a new comment is created, the Worker calls Resend's API to email the archivist. Both the destination address and the API key are Wrangler secrets — never in `wrangler.toml`, never in any committed file, never in any HTTP response.

```
wrangler secret put NOTIFY_EMAIL        # archivist's destination address
wrangler secret put RESEND_API_KEY      # Resend API key
wrangler secret put ADMIN_EMAIL         # used by requireAdmin middleware
```

**Service: Resend.** Free tier (3000 emails/month) is plenty. Sender is `noreply@87sockeyes.win`; setup adds one DKIM TXT record to the existing CF DNS zone for `87sockeyes.win`. Resend was chosen over Cloudflare's native `send_email` binding because the binding requires `destination_address` in `wrangler.toml` (committed and preserved in git history forever).

**Best-effort delivery.** Email send is not on the critical path for comment persistence: the Worker writes the KV record first, then attempts the Resend call. On send failure, the comment record's `emailNotified` flag stays `false` and the error is captured in `emailError`. The inbox surfaces this on the row (small "✉ delivery failed" pill) so the archivist can manually re-poke or follow up out-of-band.

**Sender address (`noreply@87sockeyes.win`)** is the only place an email-shaped string legitimately exists in this system: it appears in outbound SMTP envelopes only, never in the deployed bundle, never in git, never in any HTTP response served by the Worker. The DKIM TXT record for it is in DNS, which is public by nature anyway.

## Form UX

Submission modal (same component for all three entry points):

- **Body textarea** — required, max 4000 chars. Placeholder text guides the kind of content welcomed: corrections, identifications, memories, requests.
- **Target pill** — non-editable. Reads `General archive note` (global trigger) or `<paper> · <date> · p<N>` (media trigger, derived from the item's attribution).
- **No "Submitted as ..." line.** The user's identity is already established by their CF Access login; rendering their email in the modal adds nothing and risks shoulder-surfing leak. The Worker pulls the submitter email from the JWT — no client-side handling of the address at all.
- **First-submission only**: an extra short input — *"How are you connected to the team? (optional)"* with placeholder hints like *"Brian Kozak's son"* or *"Played for the Sockeyes 1989-91"*. Captured into `submitterFirstAnnotation` on the comment AND seeded into `annotation:<email>` (write-once — only set if no annotation already exists, to prevent submitters from clobbering an admin-set label). Detection: on modal open, the SPA reads the cached `/api/me` response; if `annotation === null`, the field is shown.
- **Submit / Cancel buttons.** Submit → POST `/api/comments` → success toast and modal close. Failure → error toast + retry; body text remains in the modal so it isn't lost.
- **Accessibility.** Modal follows the existing `LockedLightbox` a11y pattern: `role="dialog"`, `aria-modal="true"`, focus trap, ESC closes, focus restored to triggering element on close.

## Inbox UX (`/admin/inbox`)

Designed for the higher-volume scope (every player + descendants). The inbox is admin-only context, so submitter emails are visible there — that's intentional and required for triage. The frontend reaches the inbox only via `isAdmin === true` from `/api/me`; non-admin allowlisted users get "Not authorized."

- **Tabs:** Pending / Applied / Rejected / Parked. Each tab renders a count read from `meta:counts.byStatus` (single KV read).
- **Filters:** target type (all / global / media), submitter (dropdown of all addresses ever seen, derived from a `meta:submitters` aggregate updated on each create), sort newest/oldest, body-text search box (in-Worker filter on the current page; full-text index is a future-spec concern).
- **Pagination:** 20 rows per page, page links at bottom.
- **Per-row:**
  - Submitter email + annotation suffix (italic, lower-emphasis): *"— Brian Kozak's son"*. Clicking the email filters the inbox to that submitter.
  - Target pill — links to `/vault?focus=<id>` opened in a new tab when target is `media:<id>`. **`VaultPage` does not currently parse `?focus=` — phase 4 must add this**: read the search param on mount, locate the matching item in the rendered grid, scroll to it, and open the `MediaLightbox` automatically.
  - Body (full text, `white-space: pre-wrap`, rendered via plain JSX text node — no `dangerouslySetInnerHTML`).
  - Timestamp ("2 hours ago").
  - Small `✉ delivery failed` pill if `emailNotified === false`.
- **Right-side triage panel per row:**
  - Three buttons: `✓ Applied` (red, primary) / `✗ Rejected` / `⏸ Parked`.
  - Optional one-line `adminNote` textarea — e.g. *"add to Bill Hardy bio re: roommate detail"*.
  - For unannotated submitters: `+ Annotate this submitter` link → inline label input → `POST /api/annotations/:email`.
- **Triage flips status only.** It does **not** edit `roster.json` / `media.json` / chapter markdown. Those edits happen in chat workflow, per the per-item review rule.

## Privacy & security

- **No email-shaped string in deployed code, build artifacts, git history, or any HTTP response.** The single exception is `noreply@87sockeyes.win` in outbound SMTP envelopes.
- **Admin identity is Worker-side only.** `ADMIN_EMAIL` is a Wrangler secret. Frontend never receives the admin's actual address — it only learns `isAdmin: true|false` from `/api/me`.
- **Submitter emails surface only in admin-authenticated GET responses** (`GET /api/me` for the caller's own email; admin GETs of `/api/comments` for the inbox).
- **Worker re-verifies the CF Access JWT** (RS256 against the team JWKS) for every `/api/*` request — same belt-and-suspenders defense the existing `/media/*` route already uses. CF Access at the edge is the first wall; Worker re-verification is the second.
- **Admin routes additionally check** the JWT `email` claim against `env.ADMIN_EMAIL` via the `requireAdmin` middleware. A non-admin allowlisted user calling an admin route gets 403.
- **Notification config (Resend API key + destination email)** lives only as Wrangler secrets.
- **CSRF defense.** All `POST /api/*` routes require an `Origin` header matching `https://archive.87sockeyes.win`. CF Access cookies are SameSite=Lax by default, which blocks most cross-site POSTs, but a same-site forged form (e.g., crafted on another `*.87sockeyes.win` subdomain or via an installed extension) could still attempt a write. The Origin check is the second wall.

## Body sanitization

- Worker accepts UTF-8 plain text; rejects null bytes, ASCII control characters (except `\n`/`\r`/`\t`), and malformed UTF-8 with 400.
- Maximum 4000 characters; trailing/leading whitespace trimmed before storage.
- Frontend renders body via plain JSX text node — never `dangerouslySetInnerHTML`. React's default text-node escaping is the security boundary.
- `white-space: pre-wrap` for line break preservation.
- No auto-linking in v1 — URLs stay plain text.
- Vitest assertion: `<script>alert(1)</script>` in body renders as literal text in the inbox row, not as an executed `<script>` tag.

## Rate limiting

- **Per-submitter limits:** 10 comments / hour, 50 / day. Exceeding either returns 429 with a `Retry-After` header.
- **Implementation (v1 primary):** maintain a `meta:rate:<email>` record holding two sliding-window timestamp arrays — `hour` (timestamps within the last 60min) and `day` (last 24h). On each `POST /api/comments`, read the record, drop expired entries, count remaining, accept-or-reject, then append the current timestamp and write back. This is O(1) work per request regardless of total comment count. The naive alternative — `KV.list({prefix: "comment:"})` filtered in-Worker by `submitterEmail` — is O(N) over total comments, not per-submitter, since `KV.list` only filters by key prefix. Don't use the naive path; use the counter.
- CF Access edge gating + the Worker JWT verify already block non-allowlisted submitters — the rate limit is for compromised mailboxes or runaway scripts inside the allowlist.

## Schema validation

POST bodies validated server-side. The schema lives at `cf-worker/schemas/comment.schema.json`:

```jsonc
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

Worker validates with a small JSON-schema validator (e.g. `ajv` works in Workers). 400 on mismatch with field-level error details. Status-flip and annotation routes get their own (smaller) schemas.

## Error handling

| Failure | Behavior |
|---|---|
| Worker JWT verify fails | 401, generic body. SPA shows "Session expired — please log in again" |
| Admin route hit by non-admin | 403, body `{ error: "admin only" }` |
| Body fails schema validation | 400, body lists which fields failed and why |
| Rate limit exceeded | 429, body `{ error: "rate_limited", limit: "10/hour", retryAfterSeconds: N }` + `Retry-After` header |
| KV write fails (rare) | 500, frontend shows toast `Couldn't save — try again`, body remains in the modal |
| Email send fails | KV record persists with `emailNotified: false` + `emailError`; comment is not lost. Inbox row shows ✉ failed pill |
| Modal opened but `/api/me` fails | Show a generic error and disable the submit button until reload — don't proceed without a verified identity |

## Testing

- **Vitest unit:** modal renders correctly with target preset; first-submission detection (annotation === null) gates the connection input; inbox row triage button click fires the right mutation; `<script>` in body renders as literal text.
- **Worker tests (Miniflare or wrangler dev + supertest):**
  - JWT verify happy path + tampered token + wrong audience.
  - Admin-only routes reject non-admin email (403).
  - Schema-validation rejection (400 with field details).
  - Rate-limit rejection (429 with Retry-After).
  - KV round-trip on comment + annotation; counts cache updated on create + status flip.
  - Notification call mocked; assertion on Resend payload shape.
- **Manual end-to-end before shipping:** submit a global comment as a non-admin; verify the email arrives and the inbox shows it; submit a media comment; verify the lightbox indicator increments; verify the public-tier bundle does not contain any `/api/*` references or comment UI; triage all three statuses; annotate a submitter; confirm the label appears on subsequent comments.
- **Build-time check:** the existing `verify-build-filter.mjs` post-build script gets extended to also assert `dist-public/assets/*.js` does not contain `/api/comments`, `/api/me`, `/admin/inbox`, `LeaveNoteButton`, `Resend`, or `RESEND_API_KEY`. Note: minifiers may keep dead-code string literals even after tree-shaking, so the assertion is checking the *built* bundle, not the source — this catches both code-path leaks and literal-string leaks.

## Operational checklist (before shipping)

1. **KV namespace:** `wrangler kv:namespace create SOCKEYES_COMMENTS` → add `id` and `preview_id` to the `[[kv_namespaces]]` block in `cf-worker/wrangler.toml`.
2. **Secrets:**
   - `wrangler secret put ADMIN_EMAIL`
   - `wrangler secret put NOTIFY_EMAIL`
   - `wrangler secret put RESEND_API_KEY`
3. **CF route binding:** in CF dashboard → Workers Routes, add `archive.87sockeyes.win/api/*` pointing to the existing `sockeyes-archive-media` Worker, alongside the existing `archive.87sockeyes.win/media/*` route.
4. **Resend:** sign up; verify the `87sockeyes.win` domain by adding the DKIM TXT record to the existing CF DNS zone; copy the API key into the `RESEND_API_KEY` secret.
5. **Confirm:** worker auto-deploy still works (`.github/workflows/deploy-worker.yml` triggers on `cf-worker/**`), KV namespace IDs are in `wrangler.toml`, no secrets in any committed file.

## Implementation phases

Suggested decomposition for `writing-plans`:

1. **Worker refactor + foundation** — extract `verifyAccessJwt` / `readToken` to `cf-worker/lib/access.js`; add itty-router; introduce `requireAdmin` middleware; add KV namespace binding; wire up `GET /api/me` first as the auth probe; verify deploy still works for `/media/*`.
2. **Comment submission** — `POST /api/comments` + schema validation + rate limit + counts-cache update; modal component + 3 trigger surfaces (header / card / lightbox) + `BUILD_MODE === 'private'` gates; first-submission detection via cached `/api/me`.
3. **Comment counts** — `GET /api/comments/counts` batch endpoint; `MediaCard 💬N` indicator hooks into a single page-load fetch.
4. **Admin inbox + vault deep-link** — `/admin/inbox` route gated on `isAdmin`; tabs + filters + cursor pagination + triage actions + annotation editor; header badge with pending count. **Also extend `VaultPage` to parse `?focus=<id>` on mount**, locate the matching item, scroll to it, and open the `MediaLightbox` — required for the inbox-row target pills to work.
5. **Notifications** — Resend integration; sender DKIM TXT record on `87sockeyes.win`; secrets; best-effort send with KV-recorded failure flag.
6. **Tests + smoke flow** — Vitest unit, Miniflare worker tests, public-bundle no-leak assertion, manual E2E walkthrough.

## Managing the inbox — your runbook

After v1 ships:

1. **Access:** Browse to `https://archive.87sockeyes.win/admin/inbox`. CF Access prompts for email OTP; once authenticated, the SPA hits `GET /api/me`, sees `isAdmin: true`, and renders the inbox. Other allowlisted users hitting that URL see "Not authorized."
2. **What you see:** Pending tab is the active queue. Each row is one comment.
3. **Read it.** Hover the target pill to see the item; click to open the actual `MediaLightbox` for the referenced item via `/vault?focus=<id>` (opens in a new tab so you don't lose your place in the inbox).
4. **Decide:**
   - **`✓ Applied`** — the comment is something we'll incorporate. Click Applied; optionally add a one-line `adminNote` like *"add to Bill Hardy bio re: roommate quote"* so future-you remembers what you intended. The actual edit happens in our next chat session — bring me to the inbox, point me at applied items, I propose changes per the per-item review rule, you approve per-item, I commit.
   - **`✗ Rejected`** — not accurate, not relevant, or not something we'll integrate. Add an `adminNote` for your own future reference if useful.
   - **`⏸ Parked`** — defer. Use this when you want to come back to it (e.g., "this needs me to talk to Trevor first").
5. **Annotating submitters:** the first time an unfamiliar email shows up and you decode who they are, click `+ Annotate this submitter` and write *"Brian Kozak's son"* (or whatever). That label sticks to every future comment from that email.
6. **Searching old comments:** the `Applied` tab is your audit trail. Filter by submitter or search body text to find what someone contributed previously.
7. **Email-delivery failures:** any row with the small `✉ failed` pill means Resend didn't deliver the notification (rare). Check the row's `emailError` field via the inbox's "show more" toggle if you need to debug or follow up out-of-band.
8. **If a comment offers a scan or photo to share:** reply over email out-of-band to coordinate the file transfer. Don't share contact info on-site; the commenter already has your CF Access login if you choose to write them.

## Follow-ups (not blocking v1)

These came out of the spec review but aren't worth gating v1 on. Track here, revisit after launch:

- **Modal mock-spec consistency on first-comment annotation timing.** Confirm in implementation: when a submitter fills in the connection field, does the inline annotation suffix appear immediately on their *first* comment in the inbox, or only after admin review? Current spec implies immediately (write-once on submit). Worth one Vitest assertion.
- **Annotation overwrite history.** Currently admin overwrite simply replaces the label, no history kept. Low value vs KV bloat. Decided: no history.
- **Comment threading / replies between commenters.** Out of scope for v1; revisit after launch if a need surfaces.
- **`relatedPlayers: []` field on media items.** The download-everything-related-to-player-X feature needs this. Comments will help backfill it — when a grandchild leaves a note saying "this is my grandpa Brian Kozak in the team photo," that's exactly the data. After v1 ships and a few comments arrive, we can add `relatedPlayers` to the schema and start populating from applied comments.
- **Photo / file attachments on submission.** Worker → R2 upload, more infra. Defer.
- **D1 migration.** If/when KV list latency becomes a problem (> 2000 comments or > 500ms p99), migrate to D1. Schema is SQL-friendly.
- **Public-tier commenting.** Out of scope per the privacy rules.
- **Full-text search across comment bodies.** Inbox search is in-Worker per-page only in v1. If volume grows, consider a small inverted index in KV or move to D1's FTS5.
