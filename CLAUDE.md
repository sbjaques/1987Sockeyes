# 1987 Richmond Sockeyes Eternal Archive — Project State

## What this is
Permanent static archive of the 1987 Richmond Sockeyes Centennial Cup championship team, deployed as a two-tier site:
- **Public tribute** at https://87sockeyes.win (anyone)
- **Private archive** at https://archive.87sockeyes.win (Cloudflare Access — email allowlist)

Vite + React + TypeScript + Tailwind + React Router (HashRouter). Two build outputs from one codebase via `VITE_BUILD_MODE`. Source materials live in `G:/My Drive/87 Sockeyes/`.

## How to run
```bash
npm install              # first time only
npm run dev              # public build, http://localhost:5173/
npm run dev:private      # private build (shows private-archive ribbon)
npm test                 # Vitest — 45 tests across 16 files
npm run build:public     # → dist-public/
npm run build:private    # → dist-private/
npm run build:all        # both
npm run validate:data    # AJV schema validation of JSON data
```

## Deploy (CI on push to main)

Both tiers deploy via GitHub Actions → `cloudflare/wrangler-action@v3` → Cloudflare Pages direct upload:

- `.github/workflows/deploy-public.yml` → CF Pages project **sockeyes-public** → custom domain `87sockeyes.win`
- `.github/workflows/deploy-private.yml` → CF Pages project **sockeyes-archive** → custom domain `archive.87sockeyes.win` (behind CF Access)

Manual deploys from the repo root:
```bash
# after `npm run build:public && npm run build:private`:
npx wrangler pages deploy dist-public  --project-name=sockeyes-public  --branch=main
npx wrangler pages deploy dist-private --project-name=sockeyes-archive --branch=main
```

CI reads `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` from repo secrets. Local scripts read those plus `R2_*` + `ANTHROPIC_API_KEY` from a gitignored `.env.local` at repo root.

## Stack notes
- **HashRouter** (necessary for static hosting that 404s on unknown paths).
- Base path is `/` (not `/1987Sockeyes/` — that was the old GitHub Pages setup). Hero image and logo load from `/assets/*`.
- `vite.config.ts` imports `defineConfig` from `vite` (not `vitest/config`); vitest is `v3.2.4` (v4 broke on Node 24).
- `src/lib/seo.tsx` uses `.tsx` (contains JSX) — not `.ts`.
- **Vitest config excludes `.worktrees/**`** so test count doesn't double when a worktree exists.
- Tailwind theme: brand red `#D8282B`, black `#231F20`, white, cream `#F2EDDC`. Legacy aliases (`navy`, `crimson`, `cream`) map to brand colors.
- **`@tailwindcss/typography` plugin is installed** — the `prose` classes on markdown-rendered player bios use it. Removing the plugin breaks long-form bio formatting.
- **`react-markdown` + `remark-gfm` render player bios** when the bio field contains markdown syntax (headers, tables, bold). Plain-text bios keep the `whitespace-pre-line` rendering path. See `PlayerProfile.renderBio()`.

## Private tier plumbing

- **R2 bucket** `1987sockeyes-private` — holds full-page newspaper scans (225), videos (45), and scan thumbs (225 × 480px JPEGs under `thumbs/scans/`).
- **CF Worker** `sockeyes-archive-media` (source: `cf-worker/archive-media-resolver.js`) is routed at `archive.87sockeyes.win/media/*` and fetches objects from R2. **Verifies the Cloudflare Access JWT before serving** — RS256 signature against the team JWKS at `https://${CF_ACCESS_TEAM}/cdn-cgi/access/certs` (cached 1h), plus `iss`/`aud`/`exp`/`nbf` claims. Two `[vars]` in `cf-worker/wrangler.toml`: `CF_ACCESS_TEAM` (`sbjaques.cloudflareaccess.com`) and `CF_ACCESS_AUD` (the Application AUD tag). R2 binding also declared there. Auto-deploys via `.github/workflows/deploy-worker.yml` on any push touching `cf-worker/**`.
- **CF Access** application protects `archive.87sockeyes.win` (email OTP, allowlist policy). Verified enforcing 2026-04-24 — both `/` and `/media/*` redirect anonymous clients with 302 to `sbjaques.cloudflareaccess.com/cdn-cgi/access/login/...`. Two-layer defense: Access intercepts at the edge; if it ever drifts back into Bypass, the Worker JWT gate is the second wall.
- **Vite plugin `filterMediaPlugin`** (at `vite-plugin-filter-media.ts`) strips `url` + `attribution` + `descriptionLong` from private MediaItems in the PUBLIC bundle at build time. (`descriptionLong` was added 2026-04-24 — AI-drafted summaries paraphrased article content and were leaking through `LockedLightbox` on the public tier.) Security boundary, not a UI toggle.
- **Build-time mode** via `src/lib/buildMode.ts` reads `import.meta.env.VITE_BUILD_MODE` — `.env.public` / `.env.private` set it.
- **`stripArchivistNotesForPublic` (`src/lib/stripArchivistNotes.ts`)** runs at render time on every prose surface (Season chapters, player bios, roster `programBio`, GameCard highlights). On public it removes inline 9-digit imageId citations, the `## Sources & gaps` markdown section, and `[verified later as ...]` editor brackets. No-op on private.

## Information architecture (2026-04-23, post-cutover)

**Nav:** HOME · THE SEASON ▾ · ROSTER · THE VAULT · HALL OF FAME. The Season dropdown contains "Story" + "The Run" siblings. **Do NOT re-add Banner Night — the feature was retired and its page deleted; `/banner-night` redirects to `/hall-of-fame`.**

- `/` **Landing** — Hero (team photo over navy) + SeasonArc (five-stat strip + narrative) + ExploreGrid (4 cards: Season, Run, Roster, Vault). Do NOT revert to a mega-scroll landing.
- `/the-season` **The Season** — 8-chapter narrative (Prologue + Chapters I-VI + Epilogue), ~3,800 words, factual voice, image-id citations inline. Chapters live in `src/content/the-season/*.md` and render via `renderChapter` + `remark-gfm`.
- `/the-season/the-run` **The Run** — PlayoffTimeline, 26 games across Mowat / Doyle / Abbott / Centennial.
- `/playoffs` → redirects to `/the-season/the-run`.
- `/roster` **Roster** — skater + goalie tables; staff as grouped cards.
- `/vault` **The Vault** — 330 items, chronological sort, ACCESS filter (all/public/private). Private items show a crimson lock badge. AI-drafted scan descriptions still carry `needsReview: true` in the data, but the amber "AI DRAFT" badge **only renders on the private tier** (was confusing on the public tier; hidden 2026-04-24). Click-through behaviour: public tier + private item → `LockedLightbox` (renders `descriptionShort` + lock notice + Close button only; no contact link, never `descriptionLong` since that field is stripped from the public bundle). Private tier → regular `MediaLightbox` with zoom + download for any image (Worker proxies R2 behind CF Access). `MediaLightbox` translates the click index into `viewable` via item id — earlier the index was off because `openable` includes private items but `viewable` doesn't.
- `/hall-of-fame` **Hall of Fame** — 2025 BC Hall of Fame induction page with Sequeira photos, five-stat citation strip, interview + induction video grids, class-of-2025 cards. Kimberley Dynamiters card correctly cites the 1978 Allan Cup (Senior WIHL), not Centennial Cup. H1 + body copy avoid the "BCHHoF" abbreviation per the 2026-04-24 plain-viewer pass.
- `/player/:id` — profile with aliases, pull-quote scoutingNotes, Vitals / Path to Richmond / Linemates / Off the Ice grid, 1987 Program Snapshot block, career tables, full bio (markdown-rendered when appropriate), games-mentioned, clippings-mentioned.
- `/timeline/:cup` — per-cup deep link (retained).
- `/banner-night` → redirects to `/hall-of-fame`.

## Architecture
```
src/
  types/     roster.ts, games.ts, media.ts
  data/      roster.json, games.json, media.json, imageIndex.json
  data/schema/  *.schema.json                       # AJV validated in CI
  lib/       loadData, validateData, sort, filter, search (Fuse.js),
             seo.tsx, structuredData, buildMode, filterMediaForBuild,
             linkifyImageRefs (mode-aware), markdownChapter
  hooks/     useSortableTable, useMediaFilters
  components/
    layout/    Header (logo + search + nav), Footer, Nav, NavSeasonDropdown, Section
    hero/      Hero, SeasonArc, ExploreGrid
    timeline/  PlayoffTimeline, CupSegment, GameCard
    roster/    RosterTable, PlayerDetail (modal)
    vault/     VaultGrid, MediaCard (with needsReview badge), MediaLightbox,
               LockedLightbox (private-item gate on public tier)
    search/    SearchBar (Ctrl+K / Cmd+K)
  pages/
    Landing, RosterPage, PlayoffsPage, SeasonStoryPage, HallOfFamePage,
    VaultPage, CupPage, PlayerProfile, NotFound
  content/
    the-season/*.md                      # 8 chapter markdown files
    private/ocr/*.md                     # 225 OCR'd newspaper clippings

cf-worker/
  archive-media-resolver.js              # /media/* → R2
  wrangler.toml                          # R2 binding config

scripts/
  build-image-index.mjs                    # prebuild: generates src/data/imageIndex.json
  inventory-drive-staging.mjs              # snapshots G:/My Drive/87 Sockeyes/ staged items
  upload-private-media-to-r2.mjs           # uploads inventoried items to R2 (resumable)
  draft-media-descriptions.mjs             # Claude Haiku 4.5 → docs/curation/drafts/
  generate-scan-thumbs.mjs                 # sharp → public/assets/vault/scan-thumbs + R2
  promote-drafts-to-media-json.mjs         # video drafts → media.json
  promote-scan-drafts-to-media-json.mjs    # scan drafts → media.json (needsReview: true)
  enrich-roster-from-programs.py           # applies program-sourced roster enrichments
  make-pdf-thumbs.py                       # page-1 JPGs for PDFs via PyMuPDF
  validate-data.mjs                        # AJV schema runner
  verify-build-filter.mjs                  # post-build marker assertion for the Vite filter
  download-newspapers-images.mjs           # CDP-based newspapers.com puller (archaeological)
```

## Data (key invariants)

- **Roster** (`src/data/roster.json`): 35 entries (22 players + 3 goalies + 10 staff). Optional fields include `bio`, `programBio`, `aliases[]`, `priorTeams[]`, `linemates[]`, `scoutingNotes`, `personalDetails`, `birthDate`, `height`, `weight`, `shoots`, `awards[]`, `links`, `careerStats[]`, and per-cup stat blocks (`abbottCupStats`, `doyleCupStats`, `abbottCupSeriesStats`, `centennialCupStats`, `postseasonStats`). Goalies use `{gp,w,l,gaa,svpct,so}`; skaters use `{gp,g,a,pts,pim}`. **Field-name trap:** `playoffStats` actually holds **regular-season** numbers (the BCJHL 51-game line). `postseasonStats` is the real 15-game playoff line and is incomplete for most players. Don't rename the field — the 2026-04-24 fix relabeled the UI ("Roster & 1986-87 Regular Season", "1986-87 Sockeyes Season") instead.
- **Roster nicknames** (`aliases[]`) are no longer rendered inline in the roster table. They're still shown on player profile pages and used for search.
- **Bios may be markdown.** Jaques (~1.1k w) and Tomlinson (~4.5k w) use the deep-dive markdown format — chapter headers, tables, blockquotes, inline image-id refs. `PlayerProfile` detects markdown syntax and renders via `ReactMarkdown + remarkGfm`.
- **Scope rule (hard):** every roster entry must be 1987 Sockeyes personnel AND clearly mentioned at least twice in source material. Do not re-add previously removed entries (Raduak, Houghton, Comeau, McNeil, Whiteley).
- **Series-stats distinction:** `abbottCupStats` is tournament-wide through the Abbott Cup (15 games) per the 1987 program. `doyleCupStats` / `abbottCupSeriesStats` / `centennialCupStats` are the verified per-series finals only (7 / 7 / 5 games).
- **Games** (`src/data/games.json`): 26 individual-game entries covering all four cup series.
- **Media** (`src/data/media.json`): 330 items.
  - 60 original public items (newspaper clippings, programs, photos — thumbs in `public/assets/vault/`)
  - 45 private videos (thumbs use shared `video-placeholder.jpg`, URL `/media/videos/<filename>`)
  - 225 private newspaper scans (thumbs in `public/assets/vault/scan-thumbs/<id>.jpg`, URL `/media/scans/<id>.jpg`)
  - 225 scans carry `needsReview: true` — AI-drafted descriptions occasionally hallucinate details from adjacent-column OCR noise; filename-derived attribution (paper + page + date) is accurate. Editorial pass flips the flag as each is verified.

## Image-id linkify
- `src/lib/linkifyImageRefs.tsx` scans rendered bio/programBio/highlights text for 7+ digit image IDs.
- **Private build:** wraps any ID with an R2 scan in an anchor to `/media/scans/<id>.jpg` (Worker → R2 behind CF Access).
- **Public build:** renders IDs as plain muted-text citations (no link). Rationale: the full scans live in the private companion repo `1987Sockeyes-images` (flipped private 2026-04-23) and the OCR corpus lives under `src/content/private/` — neither is suitable for public linking.
- `scripts/build-image-index.mjs` runs prebuild. Reads OCR filenames from `src/content/private/ocr/` (primary) + `docs/extractions/` (legacy fallback), R2 scan inventory (any imageId in the inventory is flagged `image: true`), and IDs referenced from roster + games + media.attribution. Writes `src/data/imageIndex.json` with entries `{ filename, date?, image? }`.

## Resolved facts (2026-04-13 newspapers.com dive)
- **Centennial Cup final score: 5-2** — confirmed by Star-Phoenix May 11 1987 + Vancouver Sun May 11 1987 + Times Colonist May 10 1987.
- **Centennial Cup final date: May 9 1987** (Saturday, 7:30 PM, Humboldt Uniplex).
- **Centennial Cup MVP: Frank Romeo** — confirmed by two contemporaneous 1987 papers. **Jason Phillips** won the Most Gentlemanly Player award and All-Star Team nod, plus a hat trick in the final.
- **Centennial Cup schedule:**
  - Round-robin vs Dartmouth: May 3 (7-3 W)
  - Round-robin vs Pembroke: **May 4, 4-1 W**
  - Round-robin vs Humboldt: **May 6, 1-6 L**
  - Semifinal vs Pembroke: **May 7, 9-3 W**
  - Final vs Humboldt: **May 9, 5-2 W**

## Other corrections (don't revert)
- **Frank Romeo** was a late-season goaltender pickup who started only in the playoffs.
- **Jim Gunn position is D** (not F). Hometown Prince George, BC.
- **Fred Page Cup** (BCJHL final) was a 4-0 sweep of Kelowna Packers. Schema enum keeps `series: "Mowat"` for this entry.
- **Abbott Cup Game 6** (Apr 28 1987): Humboldt 4 Richmond 3 OT. Jaques received a 5-minute match penalty for **helmet-butting** McDougall (four contemporaneous wires specifically describe it as helmet-butting). Source: Nanaimo Daily News Apr 29 1987 p.9.
- **Trevor Dickie (#21) was 1986-87 team captain** — not Tomlinson. Per Vancouver Sun Mar 25 1987 post-BCJHL-sweep photo caption.
- **Mike O'Brien** confirmed as Kurtenbach's assistant coach.
- **Horst Willkomm** confirmed as Sockeyes president.
- **Bill Hardy** was an assistant captain (Red Deer Advocate Jun 17 1987).
- **Bruce Taylor** owned the Sockeyes 1985-1988, hired Kurtenbach July 1986.
- **vansun-1987-04-08-photo-vs-red-deer** tagged `doyle-cup` (was incorrectly `abbott-cup` — fixed 2026-04-23).

## Ownership / Leadership (confirmed via 1987 primary sources)
- **Bruce Taylor** — team owner 1985-1988
- **Horst Willkomm** — team president under Taylor
- **Orland Kurtenbach** — head coach / director of hockey operations
- **Mike O'Brien** — assistant coach
- **Trevor Dickie** (#21) — team captain 1986-87
- **Bill Hardy** (#16) — assistant captain

## Privacy rules (do NOT relax)
- No phone numbers or home addresses in anything that lands in the public bundle. (Bill Reid letter `jaques-mom-IMG_6519.JPEG` has Steve's home address — classify private if it's ever brought into media.json.)
- **No contact info — email, phone, address — in any deployed code, rendered UI, or commit message.** Removed 2026-04-25 (LockedLightbox "Request access" CTA + Footer corrections mailto both deleted; no role-based forwarder either). Family, teammates, and contributors who need archive access know how to reach the archivist out of band. Do NOT re-add a "Request access" button, footer mailto, or any address (personal or role-based) without explicit approval.
- **Public bundle stripping for private items:** the Vite filter plugin removes `url`, `attribution`, AND `descriptionLong`. Do not weaken this — the AI-drafted long descriptions paraphrase article content and would effectively reveal the private archive.
- **`LockedLightbox` is the visual gate on the public tier only.** It renders `descriptionShort` (one-sentence teaser), the type/date, the lock notice, and a Close button. No contact link. Never `descriptionLong`. The private tier never reaches `LockedLightbox` — gated by `BUILD_MODE === 'public'` in `MediaLightbox`.
- **Public tier strips archivist voice from prose.** `stripArchivistNotesForPublic` removes inline 9-digit imageId citations, `## Sources & gaps` markdown sections, and `[verified later as ...]` brackets. Don't disable the strip pipeline — readers without the source corpus see meaningless 9-digit numbers and editor-only notes.
- Factual tone only — no opinion or subjective commentary from source material.
- Cross-reference every claim to a cited media id or URL in commit messages.
- WhatsApp content per-case evaluation only (user lifted the blanket ban 2026-04-22).

## Secrets (GitHub repo secrets + .env.local at repo root, gitignored)
`CLOUDFLARE_API_TOKEN` · `CLOUDFLARE_ACCOUNT_ID` · `R2_ACCOUNT_ID` · `R2_ACCESS_KEY_ID` · `R2_SECRET_ACCESS_KEY` · `R2_ENDPOINT` · `R2_BUCKET` · `ANTHROPIC_API_KEY`

## Known deferred work (low priority)
- **Editorial pass on 225 scan `needsReview: true` descriptions.** Flip to false as each is verified. AI drafts occasionally hallucinate details. Badge only shows on private tier.
- **Career completion** — ~25 players still need hockey-reference / HOF / university roster links. Many need playoff rows separated from regular-season in `careerStats`.
- **Lighthouse audit** + bundle code-splitting (current JS is ~1.1 MB → ~315 KB gzip — warn threshold).
- **Tom Harrison** roster entry has no bio. "Unidentifiable staff" — needs program-PDF OCR or removal.
- **Scan attribution polish** — AI-drafted headline/byline often wrong; editor pass corrects. `attribution.paper` + `page` + `date` are filename-derived and reliable.

## Key documents
- `docs/superpowers/specs/2026-04-22-archive-public-private-split-design.md` — public/private split design
- `docs/superpowers/plans/2026-04-22-archive-foundation.md` — Plan 1 (foundation) — executed
- `docs/superpowers/plans/2026-04-22-archive-content-pipeline.md` — Plan 2 (content pipeline) — executed
- `docs/superpowers/runbooks/2026-04-22-archive-cutover.md` — cutover runbook — executed
- `docs/deep-dives/{matt-hervey,dave-tomlinson,steve-jaques}/bio.md` — long-form bio research
- `docs/curation/private-media-inventory.json` — 270-item inventory of private media
- `docs/curation/drafts/*.json` — 270 AI-drafted media descriptions (45 video + 225 scan)

## Commits (chronological, high-signal)
- `b3217a7` Merge feature/archive-foundation → main (public/private split foundation + content pipeline, 35 commits squashed up)
- `11f11df` Cutover: linkify falls back to OCR; deep-dive reference material tracked
- `0a4a72e` Privacy + nav + broken-link fixes
- `40ecb8b` Image paths + Banner Night removal + typography plugin
- `beec15f` Seo titles on HOF + Season Story pages
- `f2a9165` UI plain-viewer pass — strip archivist voice, define trophies, stat-column tooltips, fix label bugs (Roster H2, "1987 Playoff Totals", Kimberley Dynamiters HOF card), 7→8 chapter count, footer contact
- `8ae1665` Vault — strip `descriptionLong` from public bundle, render only short in `LockedLightbox`, fix `MediaLightbox` index translation, drop nicknames from roster table
- `42cb5b4` Worker — verify CF Access JWT before serving R2 objects (RS256 against JWKS, iss/aud/exp/nbf claims; `CF_ACCESS_TEAM` + `CF_ACCESS_AUD` vars)
- `df6697b` CI — auto-deploy archive media Worker on `cf-worker/**` changes
- `92e31e9` Vault — only route private items to `LockedLightbox` on the public tier (private tier was incorrectly locking authenticated users out of zoom + download)

The companion repo `1987Sockeyes-images` was flipped **private** 2026-04-23. Old `sbjaques.github.io/1987Sockeyes/` GitHub Pages site disabled. Unused `1987Sockeyes-archive-dist` repo deleted.
