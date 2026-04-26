# Private archive comments + admin inbox — design (2026-04-25)

A way for anyone with private archive access (you, family, players, their kids and grandkids) to leave structured corrections, identifications, and stories on the archive. You triage everything personally; integrations into the source data (`roster.json`, `media.json`, etc.) flow through the existing chat-based review system.

## Goals

1. Two friction-light entry points on the private tier:
   1. A **global** "leave a note" — for stories, identifications, or insights that don't pin to a specific item.
   2. A **per-vault-item** affordance on every `MediaCard` and `MediaLightbox` — for corrections and context on a specific clipping, photo, or video.
2. Comments persist server-side and surface in a new `/admin/inbox` triage page (your eyes only).
3. Integration into the corpus stays human — the inbox flips status (`Applied` / `Rejected` / `Parked`); actual data-file edits happen through the existing chat workflow under the per-item review rule (player-identity changes are proposed in chat and approved per-item before any write to `roster.json` / `media.json`).
4. No contact info ever ships to the public bundle. Notification email + service API keys live only as Wrangler secrets.

## Out of scope (v1)

- Comments on player profiles, games, season chapters, or paragraph-level "margin notes" on bios.
- Auto-PR generation or auto-edit-on-approve flows. Triage flips status; humans do the edits.
- Photo / file attachments on submission.
- Threaded replies between commenters.
- Public-tier commenting.
- The **download-everything-related-to-player-X** feature — that's a separate spec. Comments are a *forcing function* for the data prerequisite (a `relatedPlayers: []` field per media item) but don't block on it.

## Architecture

### Frontend (private build only)

| Surface | Trigger | Modal target |
|---|---|---|
| Header pill button `+ Leave a note` | Click | `target: "global"` |
| `MediaCard` corner icon (`💬`) | Click on any vault card | `target: "media:<id>"` |
| `MediaLightbox` toolbar pill | Same modal, opened from inside the lightbox | `target: "media:<id>"` |
| `/admin/inbox` route | Direct URL or header badge link | (admin-only) |

Visual treatment locked in via the brainstorm mockups:
- `comment-entry-points.html` — header / card / lightbox / modal layouts
- `admin-inbox.html` — inbox tabs, filters, per-row triage panel

The header badge (numeric pending count) renders only when the logged-in CF Access email matches `VITE_ADMIN_EMAIL` (your address), set at build time in `.env.private`.

### Backend (Cloudflare Worker — extends `sockeyes-archive-media`)

Reuse the existing Worker (`cf-worker/archive-media-resolver.js`) and its CF Access JWT verification. Add four new routes alongside the existing `/media/*`:

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET` | `/api/me` | CF Access JWT (any allowlisted email) | Returns `{ email, annotation }` for the calling user. Used by the modal to detect first submission and to show "Submitted as X" |
| `POST` | `/api/comments` | CF Access JWT (any allowlisted email) | Create new comment. If body includes `firstAnnotation` and no `annotation:<email>` exists yet, the Worker also writes the annotation (write-once semantics — submitters can seed, only admin can overwrite) |
| `GET` | `/api/comments?status=...` | JWT + admin email match | List comments by status |
| `POST` | `/api/comments/:id/status` | JWT + admin email match | Triage: flip status, set `adminNote` |
| `POST` | `/api/annotations/:email` | JWT + admin email match | Admin overwrite/set submitter annotation (used from the inbox) |

All routes verify the JWT against the CF Access team JWKS (`sbjaques.cloudflareaccess.com`) using the existing RS256 path. Admin-only routes additionally compare the JWT's `email` claim against `ADMIN_EMAIL` (Worker env var, not committed).

### Storage — Cloudflare KV

A single KV namespace `SOCKEYES_COMMENTS` bound in `cf-worker/wrangler.toml`. Two key prefixes:

```
comment:<uuid>      → Comment record (JSON)
annotation:<email>  → { label, updatedAt }
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
};
```

**Annotation record:**

```ts
type Annotation = {
  email: string;
  label: string;             // e.g. "Brian Kozak's son"
  updatedAt: number;
};
```

For a small archive with hundreds (not thousands) of comments expected over its lifetime, KV is sufficient. List operations scan the namespace prefix and filter in-Worker — adequate for low volume; can migrate to D1 later if it ever feels tight.

### Email notifications

When a new comment is created, the Worker fires a transactional email to the archivist (you) using a sender on the existing `87sockeyes.win` zone. Both the destination address and the service API key are Wrangler secrets:

```
wrangler secret put NOTIFY_EMAIL        # the archivist's address
wrangler secret put RESEND_API_KEY      # transactional email API key
```

These never enter the repo, the build output, or any HTTP response. They live encrypted in Cloudflare's Worker env, read at runtime only.

**Service: Resend.** Free tier (3000 emails/month) is more than enough. Sender is `noreply@87sockeyes.win`; setup adds one DKIM TXT record to the existing CF DNS zone for `87sockeyes.win`. Resend was chosen over Cloudflare's native `send_email` binding because the binding requires `destination_address` in `wrangler.toml` (committed to the repo and preserved in Git history forever). The privacy rule covers commit history regardless of current repo visibility, so the Resend path — destination as a Wrangler secret — is the durable choice.

## Form UX

Submission modal (same component for all three entry points):

- **Body textarea** — required, max 4000 chars. Placeholder text guides the kind of content welcomed: corrections, identifications, memories, requests.
- **Target pill** — non-editable, shows `General archive note` (global trigger) or the item title and date (media trigger).
- **Submitter line** — `Submitted as joe.brown@gmail.com` (auto-pulled from JWT, not editable).
- **First-submission only**: an extra short input — *"How are you connected to the team? (optional)"* with placeholder *"Brian Kozak's son"* or similar. Captured into `submitterFirstAnnotation` on the comment AND seeded into `annotation:<email>` (write-once — only set if no annotation already exists, to prevent submitters from clobbering an admin-set label). Detection: when the modal opens, the frontend calls `GET /api/me`; if `annotation` is `null` the field is shown, otherwise suppressed.
- **Submit / Cancel buttons** — Submit shows a toast on success and closes the modal. Failure shows a toast with retry.

## Inbox UX (`/admin/inbox`)

Designed for the higher-volume scope (every player + descendants):

- **Tabs:** Pending / Applied / Rejected / Parked, each with live count.
- **Filters:** target type (all / global / media), submitter (dropdown of all addresses ever seen), sort newest/oldest, body-text search box.
- **Per-row:**
  - Submitter email + annotation suffix (italic, lower-emphasis): *"— Brian Kozak's son"*. Clicking the email shows all of that submitter's comments.
  - Target pill (linked to the item if `media:<id>`).
  - Body (full text, `white-space: pre-wrap`).
  - Timestamp ("2 hours ago").
- **Right-side triage panel per row:**
  - Three buttons: `✓ Applied` (red, primary) / `✗ Rejected` / `⏸ Parked`.
  - Optional one-line `adminNote` textarea — e.g. *"add to Bill Hardy bio re: roommate detail"*.
  - For unannotated submitters: an `+ Annotate this submitter` link that opens an inline label input.
- **Triage flips status only.** It does **not** edit `roster.json` / `media.json` / chapter markdown. Those edits happen in our chat workflow.

## Privacy & security

- **No contact info in public bundle.** `VITE_ADMIN_EMAIL` set in `.env.private` only; the public build never sees it. The submission Worker doesn't expose the admin email — admin checks happen by comparing the JWT email claim against the Worker's `ADMIN_EMAIL` env var (server-side).
- **Submitter emails are admin-viewable only.** They appear in the inbox, never to other commenters or in any public-facing surface.
- **All endpoints gated by CF Access JWT.** The Worker re-verifies (RS256 against the team JWKS) as a belt-and-suspenders second wall, even though CF Access already gates the edge — same defense pattern the media Worker already uses.
- **Admin endpoints additionally check `email` claim** against `ADMIN_EMAIL`. A non-admin allowlisted user calling `/api/comments` for the list would get 403.
- **Notification email** uses Wrangler secrets only; no leak path through repo, build, or HTTP responses.

## Error handling

| Failure | Behavior |
|---|---|
| Worker JWT verify fails | 401, generic body, browser shows "Session expired — please log in again" |
| Admin route hit by non-admin | 403, body `{ error: "admin only" }` |
| KV write fails (rare) | 500, frontend shows toast `Couldn't save — try again`, body remains in the modal so the user doesn't lose their text |
| Email send fails | Worker logs the failure to its console; comment is still saved. Notification is best-effort, not blocking. |
| Body validation (empty, > 4000 chars) | 400, frontend shows inline error |

## Testing

- **Unit (Vitest)** — modal renders correctly with target preset and submitter email pulled from a mocked JWT context; first-submission detection (annotation hook) returns true/false correctly; inbox row triage button click fires the right mutation.
- **Worker tests (Miniflare or wrangler dev + supertest)** — JWT verify happy path + tampered token; admin-only routes reject non-admin email; KV round-trip on comment + annotation; notification call mocked.
- **Manual end-to-end before shipping** — submit a global comment as a non-admin, verify the email arrives and the inbox shows it; submit a media comment, verify the lightbox indicator increments; triage all three statuses; annotate a submitter and confirm the label appears on subsequent comments.

## Managing the inbox — your runbook

This is the "teach me how to manage it" piece. After v1 ships:

1. **Access:** Browse to `https://archive.87sockeyes.win/admin/inbox`. CF Access prompts for email OTP; once authenticated, the inbox renders only because your email matches `VITE_ADMIN_EMAIL` (other allowlisted users hitting that URL get a "Not authorized" page).
2. **What you see:** Pending tab is the active queue. Each row is one comment.
3. **Read it.** Hover the target pill to see the item; click to open the actual `MediaLightbox` for the referenced item (opens in a new tab so you don't lose the inbox).
4. **Decide:**
   - **`✓ Applied`** — the comment is something we'll incorporate. Click Applied; optionally add a one-line `adminNote` like *"add to Bill Hardy bio re: roommate quote"* so future-you remembers what you intended. The actual edit happens in our next chat session — bring me to the inbox, point me at applied items, I propose changes per the roster-proposals review rule, you approve per-item, I commit.
   - **`✗ Rejected`** — not accurate, not relevant, or not something we'll integrate. Add an `adminNote` for your own future reference if useful.
   - **`⏸ Parked`** — defer. Use this when you want to come back to it (e.g., "this needs me to talk to Trevor first").
5. **Annotating submitters:** the first time `joe.brown@gmail.com` shows up and you decode who they are, click `+ Annotate this submitter` and write *"Brian Kozak's son"* (or whatever). That label sticks to every future comment from that email.
6. **Searching old comments:** the `Applied` tab is your audit trail. Filter by submitter or search body text to find what someone contributed previously.
7. **If a comment offers a scan or photo to share:** reply over email out-of-band to coordinate the file transfer (don't share contact info on-site; the commenter already has your CF Access email if you choose to write them).

## Implementation phases

Suggested decomposition for the implementation plan (next skill, `writing-plans`):

1. **Worker + KV foundation** — extend `cf-worker/archive-media-resolver.js` with `/api/comments` POST + GET, `/api/comments/:id/status` POST, `/api/annotations/:email` POST. Bind KV namespace. Add JWT email-claim admin check. Wrangler secrets for notification.
2. **Comment submission UI** — modal component, three trigger surfaces (header / card / lightbox), first-submission detection.
3. **Admin inbox UI** — `/admin/inbox` route, tabs, filters, triage actions, annotation editor. Header badge.
4. **Notifications** — Resend integration. Sign up, add the DKIM TXT record to the `87sockeyes.win` zone, store API key + destination email as Wrangler secrets, wire the `POST /api/comments` handler to fire a one-line "new comment from X about Y" email.
5. **Tests + E2E walkthrough** — Vitest unit tests, manual smoke flow.

## Future / out of scope (tracked here, not built)

- **`relatedPlayers: []` field on media items.** The "download everything related to player X" feature needs this. Comments will help backfill it — when a grandchild leaves a note saying "this is my grandpa Brian Kozak in the team photo," that's exactly the data. After v1 ships and a few comments arrive, we can add `relatedPlayers` to the schema and start populating from applied comments.
- **Photo / file attachments on submission.** Worker → R2 upload, more infra. Defer.
- **Comment threading.** Wait until v1 surfaces a need.
- **Public-tier commenting.** Out of scope per the privacy rules.
