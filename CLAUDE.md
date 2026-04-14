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
    hero/      Hero (Centennial Cup team photo)
    timeline/  PlayoffTimeline, CupSegment, GameCard
    roster/    RosterTable (skaters + goalies + staff), PlayerDetail (modal)
    vault/     VaultGrid, MediaCard, MediaLightbox (yet-another-react-lightbox + zoom)
    search/    SearchBar (Ctrl+K / Cmd+K)
  pages/
    Landing, RosterPage, VaultPage, CupPage (/timeline/:cup),
    BannerNightPage, PlayerProfile (/player/:id), NotFound
```

## Data shape (key invariants)
- **Roster entries** (`src/data/roster.json`): 22 players + Kurtenbach (head coach) + 10 staff. Optional fields: `bio`, `photoUrl`, `awards[]`, `links { hockeydb, eliteprospects, wikipedia, other[] }`, `careerStats[]`. Goalies use `{ gp, w, l, gaa, svpct, so }`; skaters use `{ gp, g, a, pts, pim }`.
- **Known caveat:** current `playoffStats` on each player is actually 1986-87 **regular-season** totals from hockeydb (not playoff). Hockeydb's playoff page 404'd. Also in `careerStats[]` as a `type:"regular"` row. Real playoff totals are blocked on newspapers.com box-score extraction.
- **Games** (`src/data/games.json`): 9 entries (mostly series-level, not individual-game). Need individual-game expansion from newspapers.com box scores.
- **Media** (`src/data/media.json`): 47 items — 41 newspaper clippings + 4 program PDFs + 2 photos. Files copied to `public/assets/vault/`.

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

## Features done
- Zoomable/pannable lightbox (`yet-another-react-lightbox` with Zoom + Captions plugins). Programs/videos open in a new tab.
- Site-wide fuzzy search (Fuse.js) — Ctrl+K or Cmd+K. Indexes roster, games, media. Results grouped (players / staff / games / media) and link to profile pages / cup pages / vault.
- Per-player profile pages at `/#/player/:id`. Sections: header with avatar initials or photo, 1987 playoff totals, career stats (skater + goalie tables), bio, awards badges, external links, games mentioned, clippings mentioning player (click → zoomable lightbox).
- Clickable roster rows navigate to profile (Landing preserves quick-peek modal via PlayerDetail).
- Banner Night page with real photos from `G:/My Drive/87 Sockeyes/2025-09-26 - Banner Night/`.
- Page-level SEO + JSON-LD (`SportsTeam` on landing).
- GitHub Actions workflows: CI (lint/validate/test/build) and Pages deploy. Repo not yet created — user to run manual step.

## Priority work queue (tomorrow)

### 1. User environment prep (BLOCKING)
- Install **Playwright MCP** to bypass hockey-reference.com / richmond-news.com 403s and drive newspapers.com after login:
  ```json
  // %APPDATA%\Claude\claude_desktop_config.json
  { "mcpServers": { "playwright": { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-playwright"] } } }
  ```
- Subscribe to **newspapers.com** ($20/mo monthly is fine; cancelable)

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
