# 1987 Sockeyes Archive — Public/Private Split Design

**Status:** approved design, pending user review of written spec → writing-plans
**Date:** 2026-04-22
**Author:** design session with Steve Jaques (Claude Opus 4.7)

## Why

The 225 full-page newspapers.com scans and ~45 event videos currently exposed on the public site carry copyright risk. The goal is to preserve the public tribute experience while moving reproduction-risk primary sources behind invite-only authentication, without duplicating the codebase or data.

A secondary goal: the public site gains a proper narrative page (`/the-season`) and a dedicated Hall of Fame page (`/hall-of-fame`) covering the July 2025 BCHHoF induction. Both replace what is currently a mega-scroll landing plus a standalone `/playoffs` page.

## Outcome

Two Cloudflare Pages deployments, one codebase:

- **`87sockeyes.win`** — public tribute. No auth. Shows thumbnails and stand-alone descriptions for every archival item, with reproduction-risk items rendering as "locked" cards that link to a sign-in affordance. Attribution (paper names, bylines, headlines, image IDs) stripped from private items on this tier.
- **`archive.87sockeyes.win`** — invite-only archive. Cloudflare Access, email-OTP, manual allowlist. Serves the full assets: full-resolution newspaper scans, videos, scrapbooks, full attribution.

The two sites share source code, data schemas, components, and content authoring. The only difference is whether private media files are included in the build output.

## Architecture

### Two sites, one codebase, one content source

```
1987Sockeyes (this repo, public)
├── src/                           ← all code, one Vite app
├── src/data/roster.json           ← shared
├── src/data/games.json            ← shared
├── src/data/media.json            ← single source of truth; every item has access: 'public'|'private'
├── src/content/the-season/*.md    ← narrative chapters (all public)
├── src/content/hall-of-fame/*.md  ← HOF page content (all public)
└── vite.config.ts                 ← reads BUILD_MODE env var

Build targets
├── BUILD_MODE=public  →  dist-public/   →  Cloudflare Pages → 87sockeyes.win            (no auth)
└── BUILD_MODE=private →  dist-private/  →  Cloudflare Pages → archive.87sockeyes.win    (CF Access, email-OTP, allowlist)

Deploy pipeline (GitHub Actions on this repo)
├── Job A: build public,  deploy dist-public/ to public CF Pages project (direct deploy from this repo)
└── Job B: build private, push dist-private/ contents to 1987Sockeyes-archive-dist (NEW private repo) → CF Pages watches it

Content storage
├── 1987Sockeyes-images       →  flipped from public to PRIVATE (225 newspaper scans)
├── 1987Sockeyes-archive-dist →  NEW private repo, receives private-build artifacts via CI
└── Cloudflare R2 bucket `1987sockeyes-private` → private raw videos, scrapbooks, PII-bearing documents.
                                                     CI pulls these at build time for the private build only.
```

### Key seam: the filter helper

`src/data/media.json` is the single source of truth. At build time, a `filterMediaForBuild(items, mode)` helper decides what ships:

```ts
function filterMediaForBuild(items: MediaItem[], mode: BuildMode): MediaItem[] {
  if (mode === 'private') return items
  return items.map(item =>
    item.access === 'public'
      ? item
      : { ...item, url: undefined, attribution: undefined } // stub
  )
}
```

This is the **security boundary**. Private URLs and attribution strings are literally absent from the public bundle — not hidden at runtime.

### Private media at build time

- Private raw files live in Cloudflare R2 bucket `1987sockeyes-private`, organized by `videos/`, `scans/`, `scrapbooks/`.
- The private-build CI job pulls needed assets via `rclone` (or AWS CLI — R2 is S3-compatible) before Vite runs. Assets are written into `public/media/private/` which Vite copies into `dist-private/`.
- Thumbs are generated once by `scripts/build-media-thumbs.mjs` and committed to this repo under `public/media/thumbs/<id>.jpg`. Thumbs ship in both builds (always public).
- No private raw files ever land in a git repo. Eliminates accidental-publish risk from git history.

### Cloudflare Access on the archive site

- Free tier (up to 50 users).
- Identity provider: email-OTP (no external IdP).
- Policy: manual allowlist of email addresses maintained in the CF dashboard. No self-serve signup.
- Runs in front of the CF Pages deployment. Unauthenticated requests never reach the static files.
- First allowlisted user: Steve Jaques. Adding additional users is a dashboard operation, no code change.

## Data schema

### New `MediaItem` shape

```ts
{
  id: string
  type: 'clipping' | 'photo' | 'program' | 'video' | 'document'
  date: string                     // ISO YYYY-MM-DD
  access: 'public' | 'private'     // NEW — required
  thumb: string                    // NEW required — public URL to small preview; always public
  descriptionShort: string         // NEW required — 15-50 words, shown on cards + in search
  descriptionLong: string          // NEW required — 60-300 words, shown on lightbox + stub cards
  url?: string                     // full-resolution asset URL; stripped on public render for access='private'
  attribution?: {                  // newspaper source metadata; stripped on public render for access='private'
    paper: string
    headline?: string
    byline?: string
    page?: string
    imageId?: string               // newspapers.com image id
  }
  tags?: string[]                  // e.g. ['doyle-cup', 'game-6', 'player:dtomlinson']
}
```

### Schema validation

- AJV schema at `src/data/schema/media.schema.json`.
- `access`, `thumb`, `descriptionShort`, `descriptionLong` required on every item.
- `descriptionShort` length 15-50 words; `descriptionLong` length 60-300 words.
- CI `npm run validate:data` blocks merge on violations.

### Description authoring rules (hard constraints)

- `descriptionShort` and `descriptionLong` MUST stand alone — describe WHAT the item is and WHAT it contains, NOT WHERE it is from.
- No paper name, headline, byline, or image ID inside description text for ANY item — that metadata belongs in `attribution`, which is conditionally rendered.
- Factual-narrative voice matching project voice rule — no editorializing.

### Migration

One-time script `scripts/migrate-media-schema.mjs`:

1. Walks existing 46 items in `media.json`.
2. Adds `access: 'public'`, moves existing `description`/`title` into placeholder `descriptionShort`/`descriptionLong` (flagged for AI redraft in later step).
3. Moves existing `source`/`paper`/`headline` fields into `attribution` block.
4. Generates thumbs for any item missing one; writes to `public/media/thumbs/`.

### Item count projection

- Existing public items: 46
- Newspaper scans to add (private): 225
- Videos to add (private): ~45, including the 5 Sequeira HOF event videos already in the `_Video Review/Private/` folder
- Scrapbook items to add: 74 (59 private from `_Scrapbook Review/Likely Private/` + 15 public from `_Scrapbook Review/Likely Public/`)
- Sequeira HOF photos to add (public): 4 (team shot, Tomlinson speech, two captain shots)
- **Total at full archive: ~394 items (~65 public + ~329 private).**

## Public vs private rendering

### Card rendering

Every media card shows `thumb` + `descriptionShort` + `date`. Private items additionally show a small lock badge in the top-right corner of the thumb.

### Public-build lightbox behaviour

- `access: 'public'` items: current `yet-another-react-lightbox` with Zoom / Captions / Download plugins — unchanged.
- `access: 'private'` items: a new locked-lightbox component shows the thumb at larger size plus `descriptionLong`, plus a "Request access →" call to action. No paper name, byline, headline, or image ID appears anywhere.

### Locked-lightbox CTA target

- Initial: `mailto:sbjaques@yahoo.com?subject=1987%20Sockeyes%20archive%20access%20request`.
- Future (Phase 2): replaced by the `/request-access` page.

### Private-build rendering

- Same components; since `url` and `attribution` are present, cards open to full assets, lightbox captions display full attribution, Download plugin works.
- A subtle header ribbon reads "Private archive · signed in". The signed-in email is available from the CF Access JWT header (`CF-Access-Jwt-Assertion`) if fine-grained personalization is wanted later; the MVP just shows a static ribbon.

### Search

- Public site's Fuse.js index fields: `id`, `date`, `descriptionShort`, `descriptionLong`, `tags` — NOT `attribution`.
- Private-item search hits render with the lock badge and open the locked lightbox.
- Private site's Fuse.js index includes `attribution` fields.

### Image-ID linkify

`src/lib/linkifyImageRefs.tsx` scans rendered bio/programBio/game-highlight text for 7+ digit image IDs:

- Public build: resolves to the locked lightbox for the matching media item, or plain text if no match.
- Private build: resolves to the full asset via the archive URL.
- Fallback: if no matching media entry exists, renders as plain text (no link). Removes the current "raw JPG on companion repo" fallback at cutover.

## Site information architecture

### Nav (both sites)

```
Home · The Season ▾ · Roster · Vault · Banner Night
         ├─ Story
         └─ The Run
```

Dropdown on desktop, expandable group on mobile. Clicking "The Season" goes to `/the-season`. HOF is NOT a top-nav item — it's linked from within The Season page at chapters 0 and 7.

### Routes

| Route | Page | Notes |
|---|---|---|
| `/` | Landing | Hero + SeasonArc + ExploreGrid (updated card labels). Adds "Read the full story →" link to end of SeasonArc narrative. |
| `/the-season` | Season Story (NEW) | 7-chapter narrative, 3,000-5,000 words. |
| `/the-season/the-run` | Playoff timeline (MOVED from `/playoffs`) | PlayoffTimeline component, content unchanged. Breadcrumb shows "The Season › The Run". |
| `/playoffs` | → Redirect | Client-side `<Navigate replace>` to `/the-season/the-run`. |
| `/hall-of-fame` | HOF page (NEW) | 2025 BCHHoF induction detail page. Linked from The Season chapters 0 + 7. |
| `/roster` | Roster | Unchanged. |
| `/vault` | Vault | Public + locked private items, chronological. Adds `access` filter row. |
| `/banner-night` | Banner Night | Unchanged. |
| `/player/:id` | Player profile | Structurally unchanged; linkify targets swap per rendering rules. |
| `/timeline/:cup` | Cup deep-link | Retained. |

### The Season page structure

Eight-part structure (chapters 0-7), where chapters 0 and 7 serve as 2025 bookends framing chapters 1-6 (the 1986-87 season narrative). Stored as eight markdown files at `src/content/the-season/`:

- `00-penticton-2025.md` — July 2025 frame, BCHHoF induction opening (links into `/hall-of-fame`)
- `01-the-rebuild.md` — July 1986, Taylor, MacPherson out, Kurtenbach in, Dickie captain
- `02-regular-season.md` — Oct 1986–Mar 1987, 38-14-0, Coast Division
- `03-fred-page-mowat-cup.md` — March 1987, 4-0 sweep Kelowna (links into `/the-season/the-run`)
- `04-doyle-cup.md` — April 1987, 4-3 Red Deer (links into `/the-season/the-run`)
- `05-abbott-cup.md` — April 1987, 4-3 Humboldt, helmet-butt G6, G7 comeback (links into `/the-season/the-run`)
- `06-centennial-cup.md` — May 1987, 5-2 final, Romeo MVP, Phillips hat trick (links into `/the-season/the-run`)
- `07-back-to-penticton.md` — 2025 close, July 12 SOEC (links into `/hall-of-fame`)

Length target: 3,000-5,000 words total. Factual-narrative voice. Every substantive claim cites an image ID via linkify. Chapters 3-6 each end with "See the game-by-game →" anchor links into `/the-season/the-run`.

Rendered by `SeasonStoryPage` component that concatenates chapter markdown and wraps each in a `<section id="chapter-N">`. Inline media embedded via `{{media:<id>}}` syntax resolved at build time against `media.json`.

### Hall of Fame page structure

Route: `/hall-of-fame`. Content at `src/content/hall-of-fame/`.

Structure:
- Hero: team photo from the induction (Sequeira "Richmond Sockeyes team horiz")
- Section 1: The induction — date, venue, class, chair (Jim Hughson)
- Section 2: The Sockeyes' citation — sourced from BCHL/PJHL/BCHHoF retrospectives
- Section 3: Photos — 4 Sequeira photos (team, captain horiz/vert, Tomlinson speech)
- Section 4: Videos grid — 10+ event videos (Hughson intro, Dickie speech, Tomlinson speech, Phillips/Moro/Gunn/Dickie interviews, display case). All `access: 'private'` — render as locked cards on public site, play on private.
- Section 5: Class of 2025 — brief notes on fellow inductees (Hamhuis, Horcoff, Penny, Kwong, Hargreaves, 1977-78 Kimberley Dynamiters)

Length target: 600-1,200 words of narrative + the photo/video grids.

### Landing updates

- SeasonArc unchanged, adds trailing "Read the full story →" link to `/the-season`.
- ExploreGrid cards:
  - "The Season Story" → `/the-season` (NEW)
  - "The Run" → `/the-season/the-run` (was "The Run" → `/playoffs`)
  - "Roster" → `/roster` (unchanged)
  - "Vault" → `/vault` (unchanged)
- Drops any 5th card to maintain four-across layout.

## Content migration and description workflow

### Curation (done)

User has already curated the content in Google Drive staging folders:

- `G:/My Drive/87 Sockeyes/_Video Review/Private/` — ~45 videos, all in, all private.
- `G:/My Drive/87 Sockeyes/_Scrapbook Review/Likely Public/` — 15 items, all in, all public.
- `G:/My Drive/87 Sockeyes/_Scrapbook Review/Likely Private/` — 59 items, all in, all private.
- `G:/My Drive/87 Sockeyes/HOF Weekend Videos - Emanuel Sequeira/` — 5 videos + 4 photo variants. Videos private; photos public.
- `G:/My Drive/87 Sockeyes/Newspaper Articles/by-image-id/` — 225 scans matched to `1987Sockeyes-images`. All private.

An inventory script `scripts/inventory-drive-staging.mjs` walks these folders and emits the canonical list of items for ingestion.

### AI description drafting

`scripts/draft-media-descriptions.mjs` calls Claude API in batches:

- Input per item: OCR text (scans), filename + embedded metadata (videos), PDF text extraction (scrapbook PDFs). Plus a context pack: roster, games, project CLAUDE.md.
- Output per item: draft markdown file at `docs/curation/drafts/<id>.md` with `descriptionShort` and `descriptionLong` fields plus a `reviewNotes` field for any PII or ambiguity concerns.
- Hard prompt constraints: word counts, no-attribution-in-description, factual voice, PII flagging.

### Human review pass

User reviews drafts in `docs/curation/drafts/`, edits inline. `scripts/promote-drafts-to-media-json.mjs` moves approved drafts into `media.json` with full schema, correct `access`, `url`, `thumb`, and `attribution`. Rejected drafts stay for rework.

### Budget

~330 items × ~2k input tokens × Claude Sonnet pricing ≈ $5-15 total.

### Private raw files → R2

`scripts/upload-private-media-to-r2.mjs` (AWS SDK against R2 endpoint):

- Videos from `_Video Review/Private/` → `r2://1987sockeyes-private/videos/<id>.mp4`
- Scrapbook private items → `r2://1987sockeyes-private/scrapbooks/<id>.{pdf,jpg}`
- Newspaper scans from `1987Sockeyes-images` local checkout → `r2://1987sockeyes-private/scans/<id>.jpg` (mirrors the companion repo before it flips private)
- Idempotent: skips keys with matching checksum.

### OCR corpus pruning

`scripts/prune-ocr-corpus.mjs`:

1. Reads `src/data/imageIndex.json` to get the 225 cited image IDs.
2. Moves matching markdown files from `docs/extractions/` → `src/content/private/ocr/` (private-build only — excluded from public build via `filterMediaForBuild` equivalent for content files).
3. Deletes the remaining ~2,125 uncited files from `docs/extractions/`.
4. Re-emits `docs/extractions/ocr-all.json` with only the 225 cited entries.

Runs once as an archeological pass.

## Build and deploy pipeline

### Phase 0 — prep (safe to do anytime before cutover)

1. Create private GitHub repo `1987Sockeyes-archive-dist` (receives dist artifacts from CI).
2. Create Cloudflare account if needed. Provision two CF Pages projects:
   - `sockeyes-public` → connected to this repo's `main` branch, builds `dist-public/`.
   - `sockeyes-archive` → connected to `1987Sockeyes-archive-dist` repo's `main` branch, serves static files directly.
3. Create R2 bucket `1987sockeyes-private` and API token scoped to it. Populate with private raw files.
4. Configure Cloudflare Access on `archive.87sockeyes.win`: email-OTP identity, manual allowlist policy. Seed with Steve's email.
5. Configure DNS: `87sockeyes.win` and `archive.87sockeyes.win` CNAMEs → respective CF Pages projects.

### Phase 1 — codebase changes (commits land on `main` incrementally, each green-CI)

1. Schema migration (add `access`, `thumb`, `descriptionShort`, `descriptionLong`, `attribution` fields; update AJV; migrate existing 46 items to new shape with `access: 'public'` and placeholder descriptions).
2. `filterMediaForBuild` helper + `BUILD_MODE` env wiring + `vite.config.ts` base-path change from `/1987Sockeyes/` to `/`.
3. IA changes: new `/the-season` route with placeholder content, move `/playoffs` → `/the-season/the-run`, add `/playoffs` redirect, nav dropdown, ExploreGrid card updates.
4. Rendering changes: locked-lightbox component, lock badge, linkify dual-mode. Linkify keeps companion-repo JPG fallback during Phase 1 so existing site still works.
5. Season Story chapters 0-7 drafted and wired in (series of smaller commits).
6. Hall of Fame page component + content written.
7. CI workflow updates: two build jobs, private job pushes `dist-private/` to `1987Sockeyes-archive-dist`. Old GitHub Pages workflow retired.
8. Seed real descriptions on the existing 46 items via AI draft + user review.

### Phase 2 — private content pipeline (parallel with Phase 1)

1. Run `scripts/inventory-drive-staging.mjs` → definitive item list.
2. Run `scripts/upload-private-media-to-r2.mjs` → R2 populated.
3. Run `scripts/draft-media-descriptions.mjs` → drafts land in `docs/curation/drafts/`.
4. User reviews drafts in batches.
5. Run `scripts/promote-drafts-to-media-json.mjs` → `media.json` populated with full archive.
6. Run `scripts/prune-ocr-corpus.mjs` → OCR corpus pruned.

### Phase 3 — cutover (single coordinated ~30-min window)

1. Private build passes CI with full content, deployed to `archive.87sockeyes.win` behind Access. Verify sign-in works and content renders.
2. Point `87sockeyes.win` DNS at the new public CF Pages deployment. Verify public site renders correctly. Old GitHub Pages site (`sbjaques.github.io/1987Sockeyes/`) can be disabled in repo settings or left to serve stale content.
3. **Flip `1987Sockeyes-images` GitHub repo visibility from public to private.** Breaks raw-JPG links for anyone still on the old GitHub Pages URL — acceptable because the new public site is already live with locked-lightbox linkify behaviour.
4. Smoke test: public site loads, private items render as locked cards, archive site demands sign-in then loads full content, linkify works in both directions, all search and navigation paths work.

### Ordering rationale

Linkify's raw-JPG fallback stays alive through Phases 1-2 so the existing GitHub Pages site doesn't break during the long content-migration window. Only at Phase 3 step 3 does the cutover to locked-lightbox model complete, at which point the old site is already being retired.

### Ongoing post-cutover

- Adding new items: Drive staging → inventory → AI-draft → review → promote → commit → CI builds both sites → R2 auto-updates if new files.
- Adding archive users: CF dashboard → Access → Policies → add email. No code change.

## Privacy and redaction

### Bill Reid letter

File: `G:/My Drive/87 Sockeyes/_Scrapbook Review/Likely Public/jaques-mom-IMG_6519.JPEG`. Contains Steve Jaques' 1987 home address in plaintext. **Decision: reclassify as `access: 'private'`.** Full document preserved in archive tier; no public exposure.

### "Letters from Sockeyes" PDF

File: `G:/My Drive/87 Sockeyes/_Scrapbook Review/Likely Public/jaques-mom-1987-04-22 - Letters from Sockeyes.pdf`. Title ambiguous. Spec-implementation step: open, eyeball, classify, flag for user confirmation. No design decision needed now.

### General PII safeguard

AI description-drafting prompt instructs the model to emit a `reviewNotes` field flagging any phone number, email address, home/street address, or unmarked personal information. Items with non-empty `reviewNotes` require a required human review before `promote-drafts-to-media-json.mjs` will ingest them.

## Out of scope

### Deferred to Phase 2

- Archive Access Request page (replaces `mailto:` stopgap).
- About page.
- Memories / Oral History page.
- Where Are They Now section.
- Banner Night page demotion.

### Explicitly deleted

- Press Coverage Index (redundant given repurposed Vault).

### Not addressed in this spec

- Career completion for ~25 players (hockey-reference / HOF / university links).
- Per-series postseason stats gaps (Doyle G7, Abbott G4-7, Centennial G1/3/4).
- Lighthouse audit (waits for post-cutover).

### Explicit non-changes

- HashRouter stays (preserves existing bookmarked deep-link URLs at low cost).
- Tailwind theme, component library, existing Vault lightbox tech unchanged.
- `roster.json`, `games.json` unchanged.
- Existing career/bio text unchanged.

### Decisions deferred until they arise

- Adding more archive users beyond Steve — no admin UI, CF dashboard operation.
- Takedown workflow if a copyright holder contacts — handled manually.
- Separate admin search UI on private site — not needed; Fuse.js indexes everything.

## Success criteria

- `87sockeyes.win` loads, renders the Landing / The Season / The Run / Roster / Vault / HOF / Banner Night / player profiles correctly, all media items show as cards with thumbs + descriptions.
- `access: 'private'` items on the public site show as locked cards with thumbs + descriptions + sign-in CTA, NO full URL, NO attribution visible in DOM.
- `archive.87sockeyes.win` demands CF Access sign-in, then serves the same site with full media assets and attribution.
- Search works on both tiers; public search returns private hits as locked cards.
- Image-ID linkify resolves correctly on both tiers.
- `npm run validate:data` passes with the new AJV schema.
- `1987Sockeyes-images` is private on GitHub.
- No private raw files exist in any git repo history.
- CI deploys both builds green on every `main` push.

## Open implementation-time questions

These are details the implementation plan resolves without needing user brainstorming:

- Exact `rclone` vs AWS CLI choice for R2 fetch in CI.
- Whether to generate thumbs at R2-upload time or in a separate script pass.
- Markdown renderer choice for `the-season` + `hall-of-fame` chapters (likely `markdown-it` with a custom `{{media:id}}` plugin).
- Whether `/the-season/the-run` gets its own page component or rewraps the existing `PlayoffsPage`.
- "Letters from Sockeyes" PDF classification (public or private — depends on content inspection).
