# 1987 Richmond Sockeyes Eternal Archive — Design

**Date:** 2026-04-12
**Status:** Draft pending user review

## 1. Purpose

A "world class" digital reference archive commemorating the 1987 Richmond Sockeyes Centennial Cup championship. Public-facing, permanent, fast, mobile-first. Hosted as a static site on GitHub Pages with no backend or database.

## 2. Scope (In / Out)

**In scope**
- Static React site built with Vite, styled with Tailwind CSS.
- Data-driven from local JSON (`roster.json`, `games.json`, `media.json`).
- Four primary sections: Hero, Interactive Playoff Timeline, Sortable Roster, Media Vault.
- GitHub Actions workflow deploying to GitHub Pages.
- SEO (meta tags, Open Graph, JSON-LD `SportsTeam` structured data).
- Accessibility (WCAG 2.1 AA target: semantic HTML, keyboard nav, alt text, contrast).
- Performance: Lighthouse ≥ 90 on mobile.

**Out of scope**
- Any backend, CMS, comments, user accounts, analytics beyond basic GA4 (optional).
- Content from WhatsApp logs other than verified historical facts already corroborated in newspapers/programs.
- Any private contact info, opinions, or modern commentary from source materials.

## 3. Technical Stack

| Layer | Choice |
|---|---|
| Build | Vite + React 18 + TypeScript |
| Styling | Tailwind CSS (custom theme: Navy `#0B1F3A`, Crimson `#A6192E`, Cream `#F5EFE0`) |
| Data | Local JSON imported at build time |
| Routing | React Router (hash routing for GitHub Pages compatibility) |
| Deploy | GitHub Actions → `gh-pages` branch or Pages artifact |
| Assets | Optimized images committed to repo under `public/assets/` |

## 4. Site Architecture

Single-page app with anchor-scrolled sections plus two subroutes:

- `/` — Landing (Hero → Timeline → Roster preview → Vault preview)
- `/roster` — Full sortable roster table with player detail modals
- `/vault` — Full media gallery (articles, programs, photos) with filters
- `/timeline/:cup` — Deep link to a specific cup (Mowat, Doyle, Abbott, Centennial)
- `/banner-night` — 2025-09-26 Banner Night page (photos + factual recap)

## 5. Data Schemas

### `src/data/roster.json`
```json
[
  {
    "id": "frank-furlan",
    "name": "Frank Furlan",
    "position": "F",           // F | D | G | Coach | Staff
    "number": 11,
    "hometown": "Richmond, BC",
    "role": "player",          // player | head-coach | assistant | trainer
    "playoffStats": { "gp": 0, "g": 0, "a": 0, "pts": 0, "pim": 0 },
    "notes": ""                // brief factual note only
  }
]
```
Goalies use `playoffStats: { gp, w, l, gaa, svpct, so }` (separate shape; UI switches columns by position).

### `src/data/games.json`
```json
[
  {
    "id": "1987-05-10-humboldt-final",
    "date": "1987-05-10",
    "series": "Centennial Cup",   // Mowat | Doyle | Abbott | Centennial
    "round": "Final",
    "opponent": "Humboldt Broncos",
    "location": "Saskatoon, SK",
    "result": "W",
    "score": { "for": 5, "against": 3 },
    "highlights": ["Factual highlight 1", "Factual highlight 2"],
    "sources": ["media-id-1", "media-id-2"]
  }
]
```

### `src/data/media.json`
```json
[
  {
    "id": "vansun-1987-05-11-centennial-win",
    "type": "newspaper",         // newspaper | program | photo | video | document
    "title": "Sockeyes win Centennial Cup",
    "publication": "The Vancouver Sun",
    "date": "1987-05-11",
    "file": "/assets/vault/vansun-1987-05-11.jpg",
    "thumb": "/assets/vault/thumbs/vansun-1987-05-11.jpg",
    "caption": "Factual caption derived from the article.",
    "tags": ["centennial-cup", "final"],
    "relatedGames": ["1987-05-10-humboldt-final"]
  }
]
```

## 6. Component Boundaries

Each component has a single responsibility and a clearly typed props contract. Consumers never read its internals.

```
src/
  components/
    layout/        Header, Footer, Nav
    hero/          Hero (championship imagery, title, tagline)
    timeline/      PlayoffTimeline, CupSegment, GameCard
    roster/        RosterTable (sortable), PlayerCard, PlayerModal
    vault/         VaultGrid, MediaCard, MediaLightbox, VaultFilters
    common/        Section, Heading, Badge, Img (lazy + srcset)
  data/            roster.json, games.json, media.json
  hooks/           useSortableTable, useMediaFilters
  lib/             seo.ts (meta helpers), structuredData.ts
  pages/           Landing, Roster, Vault, CupPage
  styles/          tailwind.css, theme.ts
  types/           roster.ts, games.ts, media.ts
```

Data flows one way: JSON → typed loader → page → presentational components. No shared mutable state.

## 7. Visual Design

- **Palette:** Navy (primary surface), Crimson (accents, CTAs, cup markers), Cream (background, negative space).
- **Typography:** Display serif for headings (e.g., Playfair Display or Cooper-adjacent to match team logo font note in source); clean sans (Inter) for body; tabular numerics for stats.
- **Hero:** Full-bleed Centennial Cup victory image, heavy navy overlay, crimson underline on title "1987 Richmond Sockeyes — Centennial Cup Champions".
- **Timeline:** Horizontal on desktop, vertical on mobile. Four segments (Mowat → Doyle → Abbott → Centennial). Each game is a card with score, opponent, date, linked sources.
- **Roster:** Data-dense table on desktop; card list on mobile. Column headers sort ascending/descending; skaters and goalies shown in two sub-tables to avoid mixed stat columns.
- **Vault:** Masonry grid with type/series filters. Click → lightbox with full image and caption.

## 8. SEO & Structured Data

- `<title>`, `<meta description>`, canonical, Open Graph, Twitter cards per page.
- JSON-LD: `SportsTeam` for the team, `SportsEvent` for each Centennial Cup final game, `NewsArticle` references for vault items where appropriate.
- Sitemap and robots.txt generated at build.

## 9. Privacy & Source Integrity (Critical)

- No phone numbers, emails, or private addresses from WhatsApp or any source log ever enter the codebase or assets.
- WhatsApp media folder: only historical/photographic items clearly appropriate for a public archive are used; text logs are not imported.
- All narrative copy is factual: names, dates, scores, official results. No subjective commentary.
- Every `games.json` highlight and `media.json` caption must be traceable to a cited newspaper/program source listed in `sources`.

## 10. Accessibility

- Semantic landmarks (`header`, `main`, `nav`, `footer`).
- All images have meaningful `alt` text; decorative images use `alt=""`.
- Color contrast ≥ 4.5:1 for body text; focus rings visible on all interactive elements.
- Keyboard: tables sortable via Enter/Space on headers; lightbox closable with Esc.
- `prefers-reduced-motion` respected for timeline scroll animation.

## 11. Performance

- Vite code-splits per route.
- Images: precomputed responsive sizes, WebP where possible, `loading="lazy"` below the fold.
- No runtime data fetches — all JSON bundled.
- Target: LCP < 2.0s on 4G mobile, CLS < 0.1, total JS < 150KB gzipped on landing.

## 12. Deployment

- Repo root = Vite project.
- `.github/workflows/deploy.yml`: on push to `main`, build and publish to GitHub Pages via `actions/deploy-pages`.
- `vite.config.ts` `base` set to `/<repo-name>/` for Pages.
- Hash routing to avoid 404s on deep links.

## 13. Testing

- Unit tests (Vitest) for sort logic, filter logic, and schema validation of JSON data.
- A small schema-validation script (AJV) runs in CI so malformed data fails the build.
- Lighthouse CI assertion: Performance, Accessibility, Best Practices, SEO all ≥ 90.

## 14. Content Authoring Workflow

1. Scan/transcribe newspaper clippings and program pages into `media.json` with captions.
2. Fill `roster.json` from Centennial/Abbott Cup souvenir programs.
3. Fill `games.json` from box scores (Red Deer, Humboldt, Pembroke, Dartmouth, etc. already present in `Newspaper Articles/`).
4. Each entry cites its source media id(s).

## 15. Resolved Decisions

1. **Domain:** Default GitHub Pages URL (`<user>.github.io/1987Sockeyes`) for launch. Design allows swap to custom domain later via `CNAME` + DNS.
2. **Banner Night:** Its own page at `/banner-night`, linked from the primary nav. Not an epilogue on the landing page.
3. **Analytics:** None. No tracking scripts, no cookies, no consent banner.
4. **Content authoring:** Claude transcribes roster, games, and media metadata from the source materials (newspaper clippings, souvenir programs). User reviews and corrects before publish. Every datum cites its source media id.

## 16. Out-of-Scope Reminders

- No comments, guestbook, or social features.
- No database, no serverless functions.
- No content sourced from private WhatsApp text logs.
