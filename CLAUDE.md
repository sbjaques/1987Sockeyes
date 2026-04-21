# 1987 Richmond Sockeyes Eternal Archive — Project State

## What this is
Permanent static archive of the 1987 Richmond Sockeyes Centennial Cup championship team. Vite + React + TypeScript + Tailwind, deployed to GitHub Pages. Source materials in `G:/My Drive/87 Sockeyes/`.

## How to run
```bash
npm install         # first time only
npm run dev         # http://localhost:5173/1987Sockeyes/
npm test            # Vitest — 34 tests across 13 files
npm run build       # production build
npm run validate:data  # AJV schema validation of JSON data
```

## Stack notes
- HashRouter (GitHub Pages compat). Base path `/1987Sockeyes/` — all asset URLs must include it.
- `vite.config.ts` imports `defineConfig` from `vite` (not `vitest/config`); vitest is `v3.2.4` (v4 broke on Node 24).
- `src/lib/seo.tsx` uses `.tsx` (contains JSX) — not `.ts`.
- Tailwind theme: brand red `#D8282B`, black `#231F20`, white, cream `#F2EDDC`. Legacy utility aliases (`navy`, `crimson`, `cream`) map to brand colors — components use the aliases.

## Live
- Public repo: https://github.com/sbjaques/1987Sockeyes (created 2026-04-16)
- Live site: https://sbjaques.github.io/1987Sockeyes/ (GitHub Pages, workflow build)

## Information architecture (current model — locked 2026-04-16)
Tight narrative landing, deep pages carry the weight. Do NOT revert to a mega-scroll landing.

- `/` **Landing** — Hero + SeasonArc (five-stat strip: 38-14-0 → 15-0 → 4-3 → 4-3 → 5-2, plus a four-paragraph sourced narrative) + ExploreGrid (four destination cards).
- `/roster` **Roster** — skater + goalie tables with nicknames inline; staff as grouped cards (Ownership & Front Office / Coaching Staff / Training & Equipment / Booster Club & Supporters), each showing scoutingNotes preview.
- `/playoffs` **The Run** — PlayoffTimeline standalone page (hoisted from the old landing), 26 games across Mowat / Doyle / Abbott / Centennial.
- `/vault` **The Vault** — 46 items, chronological sort, PDF thumbs, hover-reveal per-card download, lightbox Download plugin.
- `/banner-night` — 2025 commemoration.
- `/player/:id` — profile with aliases under header, pull-quote scoutingNotes, Vitals / Path to Richmond / Linemates / Off the Ice quick-facts grid, 1987 Program Snapshot block (verbatim programBio), career tables, bio, games-mentioned, clippings-mentioned lightbox.
- `/timeline/:cup` — per-cup deep link (retained).

Nav: Home · Roster · The Run · The Vault · Banner Night.

## Architecture
```
src/
  types/     roster.ts, games.ts, media.ts        # TypeScript types
  data/      roster.json, games.json, media.json  # all content
  data/schema/  *.schema.json                      # AJV validated in CI
  lib/       loadData.ts, validateData.ts, sort.ts, filter.ts, search.ts (Fuse.js),
             seo.tsx, structuredData.ts
  hooks/     useSortableTable, useMediaFilters
  components/
    layout/    Header (logo + search + nav), Footer, Nav, Section
    hero/      Hero, SeasonArc, ExploreGrid
    timeline/  PlayoffTimeline, CupSegment, GameCard
    roster/    RosterTable (skaters + goalies + grouped staff cards), PlayerDetail (modal)
    vault/     VaultGrid, MediaCard, MediaLightbox (yet-another-react-lightbox + Zoom + Captions + Download)
    search/    SearchBar (Ctrl+K / Cmd+K)
  pages/
    Landing, RosterPage, PlayoffsPage, VaultPage,
    CupPage (/timeline/:cup), BannerNightPage, PlayerProfile (/player/:id), NotFound
scripts/
  enrich-roster-from-programs.py   # applies program-sourced enrichments
  make-pdf-thumbs.py               # renders page-1 JPG thumbs for PDFs via PyMuPDF
```

## Data shape (key invariants)
- **Roster entries** (`src/data/roster.json`): 35 entries (22 players + 3 goalies + 10 staff including Kurtenbach, O'Brien, Eric Wolf, Moro, Clark, Peterson, Harrison, Tucker, Palmer, Willkomm, Taylor, Jackie Wolf). Optional fields now include: `bio`, `programBio`, `aliases[]`, `priorTeams[]`, `linemates[]`, `scoutingNotes`, `personalDetails { hobbies, likes, dislikes, college }`, `birthDate`, `height`, `weight`, `shoots`, `awards[]`, `links { hockeydb, eliteprospects, wikipedia, other[] }`, `careerStats[]`, `abbottCupStats`, `doyleCupStats`, `abbottCupSeriesStats`, `centennialCupStats`, `postseasonStats`. Goalies use `{ gp, w, l, gaa, svpct, so }`; skaters use `{ gp, g, a, pts, pim }`.
- **Series-stats distinction:** `abbottCupStats` is tournament-wide through the Abbott Cup (15 games) per the 1987 program. `doyleCupStats` / `abbottCupSeriesStats` / `centennialCupStats` are the verified per-series finals only (7 / 7 / 5 games), derived from newspapers.com box scores — partial where narrative-only coverage existed. Added 2026-04-17.
- **Scope rule (hard):** every roster entry must be 1987 Sockeyes personnel AND clearly mentioned at least twice in source material. John Raduak and Bob Houghton removed 2026-04-16 for failing this bar. Do not re-add.
- **Known caveat:** current `playoffStats` on each player is actually 1986-87 **regular-season** totals from hockeydb. Real postseason totals still blocked on newspapers.com box-score extraction.
- **Games** (`src/data/games.json`): 26 individual-game entries covering all four cup series.
- **Media** (`src/data/media.json`): 46 items — 41 newspaper clippings + 4 program PDFs (each with a JPG thumb) + 1 photo. Chronologically sorted in the Vault grid.

## Resolved facts (2026-04-13 newspapers.com dive)
- **Centennial Cup final score: 5-2** — confirmed by Star-Phoenix May 11 1987 (images 512098529, 512098543) and Vancouver Sun May 11 1987 (images 495230735, 495229991) and Times Colonist May 10 1987 (image 508633163). The 2025 BCHL/PJHL HOF "5-3" figure was wrong.
- **Centennial Cup final date: May 9 1987** (Saturday, 7:30 PM, Humboldt Uniplex) — games.json updated from May 10 to May 9.
- **Centennial Cup MVP: Frank Romeo** — confirmed by two contemporaneous 1987 papers (Star-Phoenix May 11 + Times Colonist May 10). The 2025 Richmond Sentinel article that credited Phillips with MVP was wrong. **Jason Phillips** won the tournament's **Most Gentlemanly Player** award (box-score terminology) and the **All-Star Team** nod, and had a hat trick in the final.
- **Centennial Cup schedule corrections** (per contemporaneous Star-Phoenix coverage):
  - Round-robin vs Dartmouth: May 3 (unchanged, 7-3 W)
  - Round-robin vs Pembroke: **May 4, 4-1 W** (Star-Phoenix box + 6 CP wires). Kozak opened 2:39/1st (from Phillips+Hervey); Dupont tied it PP 4:06/3rd; Czenczek 6:35, Tomlinson 15:01 and 18:26 sealed it. Previously logged as 4-3 — corrected 2026-04-17.
  - Round-robin vs Humboldt: **May 6, 1-6 L** (was listed as May 5; Czenczek goal; Kazuik SH breakaway after Jaques turnover)
  - Semifinal vs Pembroke: **May 7, 9-3 W** (was listed as May 9)
  - Final vs Humboldt: **May 9, 5-2 W** (was listed as May 10)

## Other corrections (don't revert)
- **Frank Romeo** was a late-season goaltender pickup who started only in the playoffs. Quote from Tomlinson in Richmond News 2012.
- **Jim Gunn position is D** (not F). Hometown Prince George, BC.
- **Fred Page Cup (BCJHL final)** was a 4-0 sweep of Kelowna Packers. Our schema enum keeps `series: "Mowat"` for this entry.
- **Abbott Cup Game 6** (Apr 28 1987): Humboldt 4 Richmond 3 OT. Rutherford 2G, Tomlinson 1G for Richmond. Bobbitt took a penalty for closing hand on puck; Jaques received a 5-minute match penalty for **helmet-butting** McDougall (four contemporaneous wires specifically describe it as helmet-butting — Jaques was wearing a helmet and struck McDougall's mouth with it). Source: Nanaimo Daily News Apr 29 1987, image 325077439.
- **Trevor Dickie (#21) was 1986-87 team captain** — not Tomlinson. Per Vancouver Sun Mar 25 1987 p.25 (image 495157862) post-BCJHL-sweep photo caption and direct quote from "Richmond captain Trevor Dickie". Tomlinson later became captain in 1987-88 or later, referenced retrospectively.
- **Mike O'Brien** confirmed as Kurtenbach's assistant coach per Vancouver Sun Nov 4 1986 (image 494902975, Arv Olson byline).
- **Horst Willkomm** confirmed as Sockeyes president per The Province Apr 14 1987 p.45 (image 502036260).
- **Bill Hardy** was an assistant captain (Red Deer Advocate Jun 17 1987).

## Features done
- Zoomable/pannable lightbox (`yet-another-react-lightbox` with Zoom + Captions + Download plugins). Programs/videos open in a new tab.
- Site-wide fuzzy search (Fuse.js) — Ctrl+K or Cmd+K. Indexes roster, games, media. Results grouped (players / staff / games / media) and link to profile pages / cup pages / vault.
- Per-player profile pages at `/#/player/:id` with aliases, pull-quote scoutingNotes, Vitals / Path to Richmond / Linemates / Off the Ice grid, 1987 Program Snapshot block, career tables, bio, games-mentioned, clippings-mentioned lightbox.
- RosterTable: skater + goalie tables with inline nicknames; staff rendered as grouped cards (Ownership & Front Office / Coaching Staff / Training & Equipment / Booster Club & Supporters).
- Landing restructured to Hero + SeasonArc (sourced five-stat strip + four-paragraph narrative) + ExploreGrid. NOT a mega-scroll.
- Vault: chronological sort, PDF thumbnails via PyMuPDF, hover-reveal per-card download button, lightbox Download plugin.
- Banner Night page with real photos from `G:/My Drive/87 Sockeyes/2025-09-26 - Banner Night/`.
- Page-level SEO + JSON-LD (`SportsTeam` on landing).
- GitHub Actions workflows: CI (lint/validate/test/build) and Pages deploy, both green.

## Newspapers.com — OCR corpus + image archive

### OCR corpus (2026-04-13 scrape)
- **2350 OCR markdown files** in `docs/extractions/*.md` (dated 1984-2005+). Master JSON `docs/extractions/ocr-all.json` (2592 entries; 2350 with metadata, 242 without).
- Extraction pipeline: the search-result page caches OCR per image in `sessionStorage` under keys `search-record-images=<id>&terms=...&ocr=true` with a `compressedParagraphs` field. Decode = base64 → `deflate-raw` → JSON array of `{text, rectangle, id}` paragraphs. Bulk harvest by clicking "Show more results" ~80× then dumping sessionStorage. Metadata scraped from result-card DOM.

### Image archive (2026-04-18 → 2026-04-21, Publisher Extra re-subscription)
- Companion repo: https://github.com/sbjaques/1987Sockeyes-images — raw URL base `https://raw.githubusercontent.com/sbjaques/1987Sockeyes-images/main/<id>.jpg`. Kept separate from the main repo to keep `git clone` fast.
- **Download flow** (`scripts/download-newspapers-images.mjs`): connects to a user-launched Edge via CDP (`--remote-debugging-port=9222 --user-data-dir=C:\temp\edge-newspapers`). Per image: navigate to `/image/<id>/`, capture one `iat`-signed tile URL (JWT param), drop `crop`, request with `width=<native-from-tile-crop> height=20000`. Server clamps to native dimensions and returns the full page (~4000×6800, 3-5 MB).
- **Archive complete**: **225 / 225 image IDs fully archived at native resolution** (companion repo commit `20589fb`). 220 broadsheet pages (~4000×6800, 3-5 MB each). 5 tabloid-format pages (~3200×4200, 1-2 MB — smaller papers, still native). Total ~700 MB.
- **Pulled over ~8 sessions across 3 days** because newspapers.com enforces a volume-based rate limit (~120 MB per window). Pattern: ~30 images download successfully, then HTTP 429 "Download rate limit exceeded!" for hours until the window clears. A 4-min backoff within the script is not enough; you have to wait and resume. Script is fully resumable — skips any `<id>.jpg` on disk larger than 1 MB.
- **Re-download / new images**: Stop all existing Edge windows, launch a fresh debug-enabled Edge with `& "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --remote-debugging-port=9222 --user-data-dir="C:\temp\edge-newspapers"`, then `node scripts/download-newspapers-images.mjs`. Files land in `G:/My Drive/87 Sockeyes/Newspaper Articles/by-image-id/`; copy + push into the companion repo after each successful run.
- **Abbotsford News "permanently gone" was wrong**: the 7 IDs (536570359, 536573978, 536581352, 536728203, 536733310, 536895890, 537066955) all 404'd initially and returned zero search hits — but they came back online a day later and all 7 downloaded at full res. Likely a newspapers.com CDN / indexing rotation, not an actual removal.

### Image linkify on the site
- `src/lib/linkifyImageRefs.tsx` scans rendered bio/programBio/highlights text for 7+ digit image IDs and wraps each in an anchor. URL preference: archived JPG → GitHub OCR markdown → newspapers.com.
- `scripts/build-image-index.mjs` runs prebuild. Reads `docs/extractions/` + sibling `../1987Sockeyes-images/` checkout and writes `src/data/imageIndex.json` with entries `{ filename, image?: true }`.
- Reverse-engineering scripts (probe-*, investigate-*, check-auth-signal, capture-authed-session, diagnose-failing-ids, search-missing-abbotsford) kept in `scripts/` as archaeological record — commit `3c2acab`.

## Ownership / Leadership (confirmed via 1987 primary sources)

- **Bruce Taylor** — team owner 1985-1988 (Burnaby businessman, Sockeyes won Coast Division in 1986, 1987, 1988 under his ownership; he also owned Burnaby Bluehawks 1985 and New West Royals 1989+). Hired Kurtenbach in July 1986.
- **Horst Willkomm** — team president under Taylor
- **Orland Kurtenbach** — head coach (also "director of hockey operations"), hired July 1986, replaced Muzz MacPherson
- **Mike O'Brien** — assistant coach
- **Trevor Dickie** (#21) — team captain 1986-87 (formerly WHL New West Bruins 1984-85)
- **Bill Hardy** (#16) — assistant captain

**Bio word counts (27 of 28 entries have bios, total 11,173 words):**
- Tomlinson 1560 · Hervey 1323 · Kurtenbach 1028 · Phillips 700 · Czenczek 482 · Romeo 427 · Clarke 376 · Gunn 355 · Hardy 353 · Bobbitt 353 · ... rest 150-350
- Only entry without bio: Tom Harrison (unidentifiable staff)
- Removed by user direction: Darren Comeau, Scott McNeil, Bob Houghton, Tim Whiteley
- Kurtenbach 795, Hervey 744, Tomlinson 677, Phillips 530, Romeo 427
- Gunn 355, Kozak 348, Jaques 346, Clarke 322, Moller 321, Hardy 320, Claringbull 317, Rutherford 274-ish, Rutledge 314, McCormick 309, Czenczek 238, Trevor Dickie 229, Stewart 290, Tony Bobbitt 290, Talo 195, Goglin 180
- Thin or none: Scott McNeil, Tom Harrison, Bob Houghton, Tim Whiteley, Horst Willkomm, Mike O'Brien, Eric Wolf, Darren Comeau (all staff — need program-PDF OCR to identify definitively)

## Priority work queue

### 2. Extract box scores from newspapers.com — **largely done 2026-04-17**
Proposal docs in `docs/box-score-extractions/{doyle,abbott,centennial}-cup.md`. Applied to `games.json` and `roster.json` (per-series stats). Remaining gaps:
- Doyle Game 7 box score (narrative-only in corpus — scorers all confirmed but no per-goal times/assists/penalties)
- Abbott Cup Games 4-7 (narrative-only — no period-by-period box was carried by any paper in the scraped set)
- Centennial Cup Games 1, 3, 4 full assist credits (narrative-only in those)
- Per-game attendance is missing for most Abbott Cup games
- Phillips Centennial tournament line conflict: narrative scorer-list sum = 7G; Vancouver Sun p.20 Pap says 5G 7A. Unresolved.

User re-subscribed to Publisher Extra on 2026-04-18 to fetch the page scans; see image archive section above. Further OCR/text resolution would require another dedicated pass — trial is currently active for the image batch only.

### 3. Finish career completion (deferred from last session)
Agent 1 did Kurtenbach (35 seasons), Stewart (9), Dickson (7), Clarke (6), Moller (8), confirmed Romeo (1). Still to do: add hockey-reference / HOF / university roster links to the other ~25 players. Many also need playoff rows separated from regular-season rows in careerStats.

### 4. Task 26: Create the GitHub repo
Manual (user): `gh repo create 1987Sockeyes --public --source=. --remote=origin --push` then Settings → Pages → Source: GitHub Actions.

### 5. Task 23: Lighthouse audit (deferred pending full content)

## Privacy rules (do NOT relax)
- No phone numbers, emails, or home addresses. Ever.
- No content sourced from `G:/My Drive/87 Sockeyes/WhatsApp media/`.
- Factual tone only — no opinion or subjective commentary from source material.
- Cross-reference every claim to a cited media id or URL in commit messages.

## Key documents
- `docs/superpowers/specs/2026-04-12-1987-sockeyes-eternal-archive-design.md` — design spec
- `docs/superpowers/plans/2026-04-12-1987-sockeyes-eternal-archive.md` — original 26-task plan
- `docs/newspapers-com-manifest.md` — retrieval shopping list
- `docs/retrospectives/*.md` — seven retrospective articles collected from web archives

## Commits (chronological, high-signal)
- `45fa33b` init, `6b1af50` tailwind, through `e4f5631` — initial scaffolding + 19 tasks
- `2efaf41` roster transcription (22 players, 10 staff)
- `7da66e0` media (47 items + asset copies)
- `e9c9d74` games (initial 8 series-level entries)
- `cf100d8`, `5386b83`, `ba40e06` — CI, deploy, README
- `71ea502` red/black/white rebrand + logo + hero + banner night photos
- `82a256a` roster stats from hockeydb
- `f3baf6e`, `f0ad593`, `91aef2a` — zoomable lightbox, search, player detail modal
- `da15774` profile page infrastructure + schema extension
- `c1e9de3` career stats + bios for all players
- `5196d8a` Kurtenbach 0→35 seasons, Stewart/Dickson/Clarke/Moller career fills
- `e918b33` newspapers.com manifest
- `3d5b12c` seven retrospective articles bypassing 403s
- `5559b3c` MVP correction (Phillips not Romeo), Jim Gunn bio, BC Hockey HOF 2025 awards, Fred Page Cup sweep
- `f7c9b8b` IA lockdown + scope rules
- `c891b19` box-score mining pass — 21 game entries enriched, May 4 Pembroke corrected 4-3 → 4-1, Clarke PP hat trick in Doyle G6 surfaced, doyleCup/abbottCupSeries/centennialCup stats added to 18 roster entries
- `213a737` linkify image-ID refs in bios/highlights (render-time transform, no data changes)
- `9b6d00e` linkify resolves to local OCR markdown on GitHub (replacing paywalled newspapers.com fallback)
- `bda11c5` initial newspapers.com batch-download script (Playwright persistent-context login; later pivoted)
- `7b4fc87` linkify prefers archived JPG in companion repo 1987Sockeyes-images; 218 scans pushed (truncated at this point — see `3c2acab`)
- `3c2acab` download script rewrite: CDP connect to user-launched Edge, native-width discovery, 429 backoff, clean browser-closed abort; one-off reverse-engineering scripts preserved in `scripts/`.
- `c397afe` CLAUDE.md update for image-download work
- (companion repo `1987Sockeyes-images`, 2026-04-18 → 2026-04-21) progressive commits `8e59770` → `89afd83` → `d896269` → `79afd9e` → `b6fb44d` → `0c981e0` → `8280ce8` → `20589fb` — 225 / 225 native-resolution newspaper scans. Done.
