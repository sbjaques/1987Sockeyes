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
- **Roster entries** (`src/data/roster.json`): 35 entries (22 players + 3 goalies + 10 staff including Kurtenbach, O'Brien, Eric Wolf, Moro, Clark, Peterson, Harrison, Tucker, Palmer, Willkomm, Taylor, Jackie Wolf). Optional fields now include: `bio`, `programBio`, `aliases[]`, `priorTeams[]`, `linemates[]`, `scoutingNotes`, `personalDetails { hobbies, likes, dislikes, college }`, `birthDate`, `height`, `weight`, `shoots`, `awards[]`, `links { hockeydb, eliteprospects, wikipedia, other[] }`, `careerStats[]`, `abbottCupStats`, `postseasonStats`. Goalies use `{ gp, w, l, gaa, svpct, so }`; skaters use `{ gp, g, a, pts, pim }`.
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
  - Round-robin vs Pembroke: **May 4, 4-3 W** (was listed as May 7 4-1; two third-period goals from Tomlinson won it)
  - Round-robin vs Humboldt: **May 6, 1-6 L** (was listed as May 5; Czenczek goal; Kazuik SH breakaway after Jaques turnover)
  - Semifinal vs Pembroke: **May 7, 9-3 W** (was listed as May 9)
  - Final vs Humboldt: **May 9, 5-2 W** (was listed as May 10)

## Other corrections (don't revert)
- **Frank Romeo** was a late-season goaltender pickup who started only in the playoffs. Quote from Tomlinson in Richmond News 2012.
- **Jim Gunn position is D** (not F). Hometown Prince George, BC.
- **Fred Page Cup (BCJHL final)** was a 4-0 sweep of Kelowna Packers. Our schema enum keeps `series: "Mowat"` for this entry.
- **Abbott Cup Game 6** (Apr 28 1987): Humboldt 4 Richmond 3 OT. Rutherford 2G, Tomlinson 1G for Richmond. Bobbitt took a penalty for closing hand on puck; Jaques received a 5-minute match penalty for headbutting McDougall. Source: Nanaimo Daily News Apr 29 1987, image 325077439.
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

## Newspapers.com session (2026-04-13 3-day trial)

**Trial active:** User has Publisher Extra 3-day trial on newspapers.com. Credentials in chat history only — NOT saved to any file.

**Extraction pipeline (discovered this session):**
- newspapers.com search result pages cache OCR text per image in `sessionStorage` under keys `search-record-images=<id>&terms=...&ocr=true` with a `compressedParagraphs` field.
- Decode: base64 → `deflate-raw` → JSON array of `{text, rectangle, id}` paragraphs.
- Bulk-harvest: navigate to search results, click "Show more results" ~80 times to paginate, then dump `sessionStorage` entries. See `window.__extractedMerged` pattern in chat history.
- Metadata scraped from DOM of search results (pub name, page, date, location) since `/api/search/query` returns metadata-only and `/api/search/record` 500s when called directly.

**Current corpus:** **2350 OCR markdown files** in `docs/extractions/*.md` (dated 1984-2005+). Master JSON at `docs/extractions/ocr-all.json` (2592 entries; 2350 with metadata, 242 without).

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

### 2. Extract box scores from newspapers.com
Manifest: `docs/newspapers-com-manifest.md` (5,379 words, commit `e918b33`). Top priority:
1. Star Phoenix May 11 1987 — Centennial Cup final box (resolves 5-2 vs 5-3)
2. May 9 1987 semifinal vs Pembroke (currently zero sources in games.json)
3. All five Centennial Cup round-robin/playoff boxes
4. All Doyle Cup games (Red Deer Advocate daily)
5. Individual game coverage to expand games.json from series-level to per-game

Protocol: user pastes OCR text + URL into `docs/extractions/<slug>.md`. Assistant parses into games.json + tallies real `playoffStats` into roster.json (rename field or add `postseasonStats` when real playoff data arrives).

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
