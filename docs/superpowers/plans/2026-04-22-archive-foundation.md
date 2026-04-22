# Archive Public/Private Split — Plan 1: Foundation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land the codebase changes that enable a public/private split — new `MediaItem` schema with `access` flag, build-mode filter, new IA (`/the-season`, `/the-season/the-run`, `/hall-of-fame`), locked-lightbox rendering for private items, and dual-build CI — without yet populating the private archive (that is Plan 2) or cutting DNS over (that is the cutover runbook).

**Architecture:** Single Vite app, two build targets via `BUILD_MODE=public|private` env var. A `filterMediaForBuild` helper strips `url` and `attribution` from private items during the public build so they are literally absent from the shipped bundle. Routes are Hash-routed (preserves existing bookmarks). Narrative content lives as markdown files in `src/content/` with a custom `![](media:<id>)` embed convention rendered by `react-markdown`. CI splits into two deploy jobs: one pushes `dist-public/` straight to the public CF Pages project, the other pushes `dist-private/` contents to a separate private repo (`1987Sockeyes-archive-dist`) that another CF Pages project watches.

**Tech Stack:** Vite 8, React 19, TypeScript, React Router v7 (HashRouter), Tailwind v3, Vitest 3, AJV 8, `react-markdown` (new), `yet-another-react-lightbox` 3.

**Spec:** `docs/superpowers/specs/2026-04-22-archive-public-private-split-design.md`

---

## File structure

### Files created
- `src/lib/filterMediaForBuild.ts` — pure function that strips private fields from public build
- `src/lib/filterMediaForBuild.test.ts`
- `src/lib/buildMode.ts` — tiny typed accessor for `import.meta.env.VITE_BUILD_MODE`
- `src/lib/markdownChapter.tsx` — markdown → React renderer with `media:<id>` embed convention
- `src/lib/markdownChapter.test.tsx`
- `src/pages/SeasonStoryPage.tsx`
- `src/pages/HallOfFamePage.tsx`
- `src/components/vault/LockedLightbox.tsx`
- `src/components/vault/LockedLightbox.test.tsx`
- `src/components/layout/NavSeasonDropdown.tsx` — the sub-nav
- `src/content/the-season/00-penticton-2025.md`
- `src/content/the-season/01-the-rebuild.md`
- `src/content/the-season/02-regular-season.md`
- `src/content/the-season/03-fred-page-mowat-cup.md`
- `src/content/the-season/04-doyle-cup.md`
- `src/content/the-season/05-abbott-cup.md`
- `src/content/the-season/06-centennial-cup.md`
- `src/content/the-season/07-back-to-penticton.md`
- `src/content/hall-of-fame/index.md`
- `scripts/migrate-media-schema.mjs` — one-time data migration
- `scripts/push-dist-private-to-archive-repo.mjs` — CI helper
- `.env.public` — VITE_BUILD_MODE=public
- `.env.private` — VITE_BUILD_MODE=private
- `.github/workflows/deploy-public.yml`
- `.github/workflows/deploy-private.yml`

### Files modified
- `src/types/media.ts` — new MediaItem shape
- `src/data/schema/media.schema.json` — matching AJV schema
- `src/data/media.json` — migrated to new shape + 14 HOF entries appended
- `src/lib/loadData.ts` — apply filter based on build mode
- `src/App.tsx` — add `/the-season`, `/the-season/the-run`, `/hall-of-fame`, `/playoffs` redirect
- `src/pages/PlayoffsPage.tsx` — add breadcrumb + "Back to the Season Story" link
- `src/components/layout/Nav.tsx` — replace flat list with Season dropdown + siblings
- `src/components/hero/ExploreGrid.tsx` — card targets + copy
- `src/components/hero/SeasonArc.tsx` — append "Read the full story →" link
- `src/components/vault/MediaCard.tsx` — read new schema fields + lock badge
- `src/components/vault/MediaLightbox.tsx` — route to LockedLightbox for private items, read `attribution`
- `vite.config.ts` — base path flip + BUILD_MODE env handling + outDir switching
- `package.json` — new scripts, `react-markdown` dep
- `.github/workflows/deploy.yml` — deleted (replaced by deploy-public.yml)
- `.github/workflows/ci.yml` — runs both build targets

### Files deleted
- `.github/workflows/deploy.yml` — replaced by `deploy-public.yml`

---

## Task 0: Install react-markdown

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install**

Run: `npm install react-markdown@9`

Expected: adds `react-markdown` to `dependencies`. No peer-dep warnings beyond existing React 19 notes.

- [ ] **Step 2: Smoke-test import**

Run: `node -e "import('react-markdown').then(m => console.log(typeof m.default))"`
Expected: `function`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: add react-markdown for season/hof chapter rendering"
```

---

## Task 1: New MediaItem type + AJV schema

**Files:**
- Modify: `src/types/media.ts`
- Modify: `src/data/schema/media.schema.json`

- [ ] **Step 1: Replace `src/types/media.ts`**

```ts
export type MediaType = 'newspaper' | 'program' | 'photo' | 'video' | 'document';

export type MediaAccess = 'public' | 'private';

export interface MediaAttribution {
  paper: string;
  headline?: string;
  byline?: string;
  page?: string;
  imageId?: string;
}

export interface MediaItem {
  id: string;
  type: MediaType;
  date: string;
  access: MediaAccess;
  thumb: string;
  descriptionShort: string;
  descriptionLong: string;
  url?: string;
  attribution?: MediaAttribution;
  tags: string[];
  relatedGames?: string[];
}
```

- [ ] **Step 2: Replace `src/data/schema/media.schema.json`**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "array",
  "items": {
    "type": "object",
    "required": ["id","type","date","access","thumb","descriptionShort","descriptionLong","tags"],
    "properties": {
      "id":               { "type": "string", "pattern": "^[a-z0-9-]+$" },
      "type":             { "enum": ["newspaper","program","photo","video","document"] },
      "date":             { "type": "string", "format": "date" },
      "access":           { "enum": ["public","private"] },
      "thumb":            { "type": "string" },
      "descriptionShort": { "type": "string", "minLength": 20, "maxLength": 400 },
      "descriptionLong":  { "type": "string", "minLength": 80, "maxLength": 2000 },
      "url":              { "type": "string" },
      "attribution": {
        "type": "object",
        "required": ["paper"],
        "properties": {
          "paper":    { "type": "string" },
          "headline": { "type": "string" },
          "byline":   { "type": "string" },
          "page":     { "type": "string" },
          "imageId":  { "type": "string" }
        },
        "additionalProperties": false
      },
      "tags":         { "type": "array", "items": { "type": "string" } },
      "relatedGames": { "type": "array", "items": { "type": "string" } }
    },
    "additionalProperties": false
  }
}
```

Note: `descriptionShort` / `descriptionLong` length bounds are character counts, chosen to map to the spec's "15-50 words" / "60-300 words" approximately (assume ~5 characters per word).

- [ ] **Step 3: Commit**

```bash
git add src/types/media.ts src/data/schema/media.schema.json
git commit -m "schema: new MediaItem shape with access flag, descriptions, attribution"
```

---

## Task 2: Migrate `media.json` to new shape

**Files:**
- Create: `scripts/migrate-media-schema.mjs`
- Modify: `src/data/media.json`

- [ ] **Step 1: Write the migration script**

Create `scripts/migrate-media-schema.mjs`:

```js
#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const mediaPath = join(__dirname, '..', 'src', 'data', 'media.json');
const items = JSON.parse(readFileSync(mediaPath, 'utf8'));

// The base path changes from /1987Sockeyes/ to / in Task 5. Strip the legacy prefix.
const stripBase = (p) => typeof p === 'string' ? p.replace(/^\/1987Sockeyes\//, '/') : p;

const SHORT_SUFFIX = '— 1987 Sockeyes archive item pending AI draft + review pass.';
const LONG_SUFFIX  = '1987 Sockeyes archive item. Description pending AI drafting pass; refer to the thumb and linked source for current content.';

const pad = (s, minLen, suffix) => s.length >= minLen ? s : (s ? `${s} ${suffix}` : suffix);

function migrate(old) {
  const short = (old.title ?? '').trim();
  const long  = (old.caption ?? old.title ?? '').trim();
  const out = {
    id: old.id,
    type: old.type,
    date: old.date ?? '1987-01-01',
    access: 'public',
    thumb: stripBase(old.thumb ?? old.file),
    descriptionShort: pad(short, 20, SHORT_SUFFIX),
    descriptionLong:  pad(long,  80, LONG_SUFFIX),
    tags: Array.isArray(old.tags) ? old.tags : [],
  };
  if (old.file)         out.url = stripBase(old.file);
  if (old.publication)  out.attribution = { paper: old.publication };
  if (old.relatedGames) out.relatedGames = old.relatedGames;
  return out;
}

const migrated = items.map(migrate);
writeFileSync(mediaPath, JSON.stringify(migrated, null, 2) + '\n');
console.log(`Migrated ${migrated.length} items.`);
```

- [ ] **Step 2: Run the migration**

Run: `node scripts/migrate-media-schema.mjs`
Expected: `Migrated 46 items.`

- [ ] **Step 3: Run data validation**

Run: `npm run validate:data`
Expected: passes, no errors.

- [ ] **Step 4: Commit**

```bash
git add scripts/migrate-media-schema.mjs src/data/media.json
git commit -m "data: migrate media.json to new schema with access/descriptions/attribution"
```

---

## Task 3: Update MediaItem consumers to read new schema

**Files (all modify):**
- `src/components/vault/MediaCard.tsx`
- `src/components/vault/MediaLightbox.tsx`
- `src/components/roster/PlayerDetail.tsx` (lines 24-27, 93 use `m.caption`, `m.title`, `m.publication`)
- `src/pages/PlayerProfile.tsx` (lines ~64, ~341 use `m.caption`, `m.title`, `m.publication`)
- `src/lib/search.ts` (lines ~48-50 and ~98-109 use `m.title`, `m.publication`, `m.caption`)
- `src/components/search/SearchBar.tsx` (reads fields from search results — update if it references old names)

**Mapping to apply everywhere:**
- `item.title` → `item.descriptionShort`
- `item.caption` → `item.descriptionLong`
- `item.publication` → `item.attribution?.paper ?? ''`
- `item.file` → `item.url` (guard against missing — private items in public build won't have it)

- [ ] **Step 1: Rewrite `MediaCard.tsx`**

Replace the file body with a version that reads `item.descriptionShort`, `item.thumb`, `item.url`, `item.attribution?.paper`. Preserve the PDF/video download button behaviour:

```tsx
import type { MediaItem } from '../../types/media';

export function MediaCard({ item, onOpen }: { item: MediaItem; onOpen: (m: MediaItem) => void }) {
  const isDoc = item.type === 'program' || item.type === 'document' || item.type === 'video';
  const filename = item.url?.split('/').pop() ?? 'download';
  const handleDownload = (e: React.MouseEvent) => e.stopPropagation();

  const thumbImg = (
    <img
      src={item.thumb}
      alt={item.descriptionShort}
      loading="lazy"
      className="w-full h-48 object-cover"
    />
  );

  return (
    <div className="relative group bg-cream-200 border border-navy/10 hover:border-crimson transition overflow-hidden rounded">
      <button
        onClick={() => {
          if (isDoc && item.url) {
            window.open(item.url, '_blank', 'noopener,noreferrer');
          } else {
            onOpen(item);
          }
        }}
        className="w-full text-left">
        <div className="relative">
          {thumbImg}
          {isDoc && (
            <span className="absolute top-2 left-2 bg-navy/85 text-cream text-[10px] uppercase tracking-widest px-2 py-1 rounded">
              {item.type === 'video' ? 'Video' : 'PDF'}
            </span>
          )}
        </div>
        <div className="p-3">
          <div className="text-xs uppercase tracking-wider text-navy/60">
            {item.type}{item.date ? ` · ${item.date}` : ''}
          </div>
          <div className="font-semibold group-hover:text-crimson line-clamp-2">
            {item.descriptionShort}
          </div>
          {item.attribution?.paper && (
            <div className="text-sm text-navy/70">{item.attribution.paper}</div>
          )}
        </div>
      </button>
      {item.url && (
        <a
          href={item.url}
          download={filename}
          onClick={handleDownload}
          title={`Download ${filename}`}
          aria-label={`Download item`}
          className="absolute top-2 right-2 bg-navy/85 hover:bg-crimson text-cream rounded p-1.5 opacity-0 group-hover:opacity-100 focus:opacity-100 transition">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M10 3a.75.75 0 0 1 .75.75v7.69l2.72-2.72a.75.75 0 1 1 1.06 1.06l-4 4a.75.75 0 0 1-1.06 0l-4-4a.75.75 0 1 1 1.06-1.06l2.72 2.72V3.75A.75.75 0 0 1 10 3Zm-6.75 13a.75.75 0 0 1 .75-.75h12a.75.75 0 0 1 0 1.5H4a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
          </svg>
        </a>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Update `MediaLightbox.tsx`**

Read the file. Apply the mapping above to every field reference. If `item.url` is missing (happens for private items in the public build), render a fallback "No asset available on this tier." block and do NOT pass anything to the lightbox slideshow. This fallback path never actually triggers in practice because private items are routed to `LockedLightbox` in Task 17 — but the guard prevents runtime errors before Task 17 lands.

- [ ] **Step 3: Update search.ts**

`src/lib/search.ts` builds the Fuse.js index. Open the file and apply the field mapping. The important spec rule: the public build MUST NOT index `attribution` fields. Since `loadMedia()` in Task 6 returns filtered items (private items have no `attribution` field), indexing `item.attribution?.paper ?? ''` naturally satisfies this — the empty string is indexed harmlessly. Replace:

- `m.title` → `m.descriptionShort`
- `m.publication ?? ''` → `m.attribution?.paper ?? ''`
- `m.caption` → `m.descriptionLong`
- `d.title` → `d.descriptionShort`
- `d.publication` → `d.attribution?.paper`
- `d.caption.slice(0, 160)` → `d.descriptionLong.slice(0, 160)`

- [ ] **Step 4: Update PlayerDetail.tsx + PlayerProfile.tsx**

Apply the field mapping. For `nameMatch(m.caption) || nameMatch(m.title)` in PlayerProfile.tsx, use `nameMatch(m.descriptionLong) || nameMatch(m.descriptionShort)`. For the label `{m.title}{m.publication ? ...}` in both files, use `{m.descriptionShort}{m.attribution?.paper ? ` — ${m.attribution.paper}` : ''}`.

- [ ] **Step 5: Update SearchBar.tsx if needed**

Open `src/components/search/SearchBar.tsx`. If it reads `result.title`, `result.publication`, `result.caption` from the search-result objects — those field names in the result shape depend on what search.ts emits. If search.ts emits `subtitle` and `snippet` (which is the existing shape per the grep output), no change needed. If it emits raw MediaItem fields, apply the same mapping.

- [ ] **Step 6: Run tests and build**

Run: `npm test`
Expected: all tests pass after fixes. If `src/lib/filter.test.ts`, `src/lib/loadData.test.ts`, or `src/components/vault/VaultGrid.test.tsx` reference old field names, update them too.

Run: `npm run build:public`
Expected: green. TypeScript errors at this step are residual old-field references that must be fixed before proceeding.

- [ ] **Step 7: Commit**

```bash
git add src/components/ src/pages/PlayerProfile.tsx src/lib/search.ts
git commit -m "consumers: update MediaItem field references to new schema (descriptionShort/Long + attribution)"
```

---

## Task 4: `filterMediaForBuild` helper (TDD)

**Files:**
- Create: `src/lib/filterMediaForBuild.ts`
- Test: `src/lib/filterMediaForBuild.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/filterMediaForBuild.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { filterMediaForBuild } from './filterMediaForBuild';
import type { MediaItem } from '../types/media';

const publicItem: MediaItem = {
  id: 'a', type: 'newspaper', date: '1987-04-29', access: 'public',
  thumb: 't.jpg', descriptionShort: 'Public item short.', descriptionLong: 'x'.repeat(90),
  url: 'full.jpg', attribution: { paper: 'Vancouver Sun' }, tags: [],
};

const privateItem: MediaItem = {
  id: 'b', type: 'newspaper', date: '1987-04-29', access: 'private',
  thumb: 't2.jpg', descriptionShort: 'Private item short.', descriptionLong: 'y'.repeat(90),
  url: 'scan.jpg', attribution: { paper: 'Nanaimo Daily News', headline: 'Secret' }, tags: [],
};

describe('filterMediaForBuild', () => {
  it('returns items unchanged in private mode', () => {
    const result = filterMediaForBuild([publicItem, privateItem], 'private');
    expect(result).toEqual([publicItem, privateItem]);
  });

  it('strips url and attribution from private items in public mode', () => {
    const [pub, priv] = filterMediaForBuild([publicItem, privateItem], 'public');
    expect(pub).toEqual(publicItem);
    expect(priv.id).toBe('b');
    expect(priv.access).toBe('private');
    expect(priv.thumb).toBe('t2.jpg');
    expect(priv.descriptionShort).toBe('Private item short.');
    expect(priv.url).toBeUndefined();
    expect(priv.attribution).toBeUndefined();
  });

  it('leaves public items unmodified in public mode', () => {
    const [pub] = filterMediaForBuild([publicItem], 'public');
    expect(pub.url).toBe('full.jpg');
    expect(pub.attribution?.paper).toBe('Vancouver Sun');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/filterMediaForBuild.test.ts`
Expected: FAIL with "Cannot find module './filterMediaForBuild'".

- [ ] **Step 3: Write the implementation**

Create `src/lib/filterMediaForBuild.ts`:

```ts
import type { MediaItem } from '../types/media';

export type BuildMode = 'public' | 'private';

export function filterMediaForBuild(items: MediaItem[], mode: BuildMode): MediaItem[] {
  if (mode === 'private') return items;
  return items.map(item => {
    if (item.access === 'public') return item;
    const { url: _url, attribution: _attr, ...rest } = item;
    return rest as MediaItem;
  });
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/lib/filterMediaForBuild.test.ts`
Expected: all 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/filterMediaForBuild.ts src/lib/filterMediaForBuild.test.ts
git commit -m "lib: filterMediaForBuild strips url+attribution from private items in public mode"
```

---

## Task 5: Wire `BUILD_MODE` env + update `vite.config.ts`

**Files:**
- Create: `src/lib/buildMode.ts`
- Create: `.env.public`
- Create: `.env.private`
- Modify: `vite.config.ts`
- Modify: `package.json`

- [ ] **Step 1: Create `.env.public`**

```
VITE_BUILD_MODE=public
```

- [ ] **Step 2: Create `.env.private`**

```
VITE_BUILD_MODE=private
```

- [ ] **Step 3: Create `src/lib/buildMode.ts`**

```ts
import type { BuildMode } from './filterMediaForBuild';

const raw = import.meta.env.VITE_BUILD_MODE;
if (raw !== 'public' && raw !== 'private') {
  throw new Error(`Invalid VITE_BUILD_MODE=${raw}; expected 'public' or 'private'.`);
}

export const BUILD_MODE: BuildMode = raw;
```

- [ ] **Step 4: Update `vite.config.ts`**

Replace contents with:

```ts
/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const buildMode = env.VITE_BUILD_MODE ?? 'public';
  if (buildMode !== 'public' && buildMode !== 'private') {
    throw new Error(`VITE_BUILD_MODE must be 'public' or 'private', got '${buildMode}'`);
  }
  return {
    plugins: [react()],
    base: '/',
    build: {
      outDir: buildMode === 'private' ? 'dist-private' : 'dist-public',
      sourcemap: false,
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test-setup.ts'],
    },
  } as Parameters<typeof defineConfig>[0];
});
```

- [ ] **Step 5: Update `package.json` scripts**

Change the `scripts` block to:

```json
"scripts": {
  "dev": "npm run build:image-index && vite --mode public",
  "dev:private": "npm run build:image-index && vite --mode private",
  "build:image-index": "node scripts/build-image-index.mjs",
  "prebuild": "npm run build:image-index",
  "build": "npm run build:public",
  "build:public": "tsc -b && vite build --mode public",
  "build:private": "tsc -b && vite build --mode private",
  "build:all": "npm run build:public && npm run build:private",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest",
  "validate:data": "node scripts/validate-data.mjs"
}
```

- [ ] **Step 6: Smoke-test both builds**

Run: `npm run build:public`
Expected: green. Output to `dist-public/`.

Run: `npm run build:private`
Expected: green. Output to `dist-private/`.

Run: `ls dist-public dist-private`
Expected: both directories contain an `index.html`.

- [ ] **Step 7: Commit**

```bash
git add src/lib/buildMode.ts .env.public .env.private vite.config.ts package.json
git commit -m "build: add BUILD_MODE env var and dual dist outputs (public/private)"
```

Note: `dist-public/` and `dist-private/` should be gitignored. Verify with `git status`; if they appear, add them to `.gitignore`.

---

## Task 6: Apply filter in `loadData`

**Files:**
- Modify: `src/lib/loadData.ts`

- [ ] **Step 1: Rewrite `loadData.ts`**

```ts
import rosterJson from '../data/roster.json';
import gamesJson  from '../data/games.json';
import mediaJson  from '../data/media.json';
import { assertValid, validateRoster, validateGames, validateMedia } from './validateData';
import { filterMediaForBuild } from './filterMediaForBuild';
import { BUILD_MODE } from './buildMode';
import type { RosterEntry } from '../types/roster';
import type { Game }        from '../types/games';
import type { MediaItem }   from '../types/media';

export const loadRoster = (): RosterEntry[] => assertValid(validateRoster, rosterJson, 'roster');
export const loadGames  = (): Game[]        => assertValid(validateGames,  gamesJson,  'games');
export const loadMedia  = (): MediaItem[]   => {
  const validated = assertValid<MediaItem[]>(validateMedia, mediaJson, 'media');
  return filterMediaForBuild(validated, BUILD_MODE);
};
```

- [ ] **Step 2: Run tests**

Run: `npm test`
Expected: green.

- [ ] **Step 3: Commit**

```bash
git add src/lib/loadData.ts
git commit -m "lib: loadMedia applies build-mode filter before returning items"
```

---

## Task 7: `/playoffs` redirect to `/the-season/the-run`

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/pages/PlayoffsPage.tsx`

- [ ] **Step 1: Update App.tsx**

```tsx
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import Landing from './pages/Landing';
import RosterPage from './pages/RosterPage';
import PlayoffsPage from './pages/PlayoffsPage';
import SeasonStoryPage from './pages/SeasonStoryPage';
import HallOfFamePage from './pages/HallOfFamePage';
import VaultPage from './pages/VaultPage';
import CupPage from './pages/CupPage';
import BannerNightPage from './pages/BannerNightPage';
import PlayerProfile from './pages/PlayerProfile';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <HelmetProvider>
      <HashRouter>
        <Header />
        <main>
          <Routes>
            <Route path="/"                         element={<Landing />} />
            <Route path="/roster"                   element={<RosterPage />} />
            <Route path="/the-season"               element={<SeasonStoryPage />} />
            <Route path="/the-season/the-run"       element={<PlayoffsPage />} />
            <Route path="/hall-of-fame"             element={<HallOfFamePage />} />
            <Route path="/playoffs"                 element={<Navigate to="/the-season/the-run" replace />} />
            <Route path="/vault"                    element={<VaultPage />} />
            <Route path="/timeline/:cup"            element={<CupPage />} />
            <Route path="/banner-night"             element={<BannerNightPage />} />
            <Route path="/player/:id"               element={<PlayerProfile />} />
            <Route path="*"                         element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </HashRouter>
    </HelmetProvider>
  );
}
```

- [ ] **Step 2: Create stub `SeasonStoryPage`**

Create `src/pages/SeasonStoryPage.tsx`:

```tsx
export default function SeasonStoryPage() {
  return (
    <section className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-display text-4xl mb-4">The Season</h1>
      <p className="text-navy/70">Narrative coming — stub page.</p>
    </section>
  );
}
```

- [ ] **Step 3: Create stub `HallOfFamePage`**

Create `src/pages/HallOfFamePage.tsx`:

```tsx
export default function HallOfFamePage() {
  return (
    <section className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-display text-4xl mb-4">Hall of Fame — 2025 BCHHoF Induction</h1>
      <p className="text-navy/70">Content coming — stub page.</p>
    </section>
  );
}
```

- [ ] **Step 4: Add breadcrumb + back-link to `PlayoffsPage`**

Open `src/pages/PlayoffsPage.tsx`. Add at the top of the rendered output:

```tsx
import { Link } from 'react-router-dom';
// existing imports …

// Inside the page's top-level container, before any existing content:
<nav aria-label="Breadcrumb" className="max-w-6xl mx-auto px-4 pt-6 text-sm text-navy/70">
  <Link to="/the-season" className="hover:text-crimson">The Season</Link>
  <span aria-hidden="true"> › </span>
  <span className="text-navy">The Run</span>
</nav>
```

And at the bottom of the page content, before the closing container:

```tsx
<div className="max-w-6xl mx-auto px-4 pb-12">
  <Link to="/the-season" className="text-crimson hover:underline">← Back to the Season Story</Link>
</div>
```

- [ ] **Step 5: Add the private-build ribbon**

The spec calls for a subtle "Private archive · signed in" ribbon on the private build only. Add it to `src/App.tsx` inside the `<HashRouter>` but above `<Header />`:

```tsx
import { BUILD_MODE } from './lib/buildMode';

// Inside the JSX, above <Header />:
{BUILD_MODE === 'private' && (
  <div className="bg-crimson text-cream text-xs uppercase tracking-widest text-center py-1">
    Private archive · signed in
  </div>
)}
```

On `BUILD_MODE === 'public'`, the ribbon is absent. The `BUILD_MODE` import resolves at build time via `import.meta.env.VITE_BUILD_MODE`, so the conditional is dead-code-eliminated from the public bundle — the ribbon's string literal does not ship in the public build.

- [ ] **Step 6: Verify routes in dev**

Run: `npm run dev`
Open: `http://localhost:5173/#/the-season` — shows stub "The Season". No ribbon.
Open: `http://localhost:5173/#/the-season/the-run` — shows PlayoffsPage with breadcrumb.
Open: `http://localhost:5173/#/hall-of-fame` — shows stub "Hall of Fame".
Open: `http://localhost:5173/#/playoffs` — auto-navigates to `/#/the-season/the-run`.

Run: `npm run dev:private`
Open: `http://localhost:5173/` — now shows a thin crimson ribbon "Private archive · signed in" above the header.

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx src/pages/SeasonStoryPage.tsx src/pages/HallOfFamePage.tsx src/pages/PlayoffsPage.tsx
git commit -m "routes: add /the-season, /hall-of-fame, move /playoffs to /the-season/the-run, private ribbon"
```

---

## Task 8: Nav with Season dropdown

**Files:**
- Create: `src/components/layout/NavSeasonDropdown.tsx`
- Modify: `src/components/layout/Nav.tsx`

- [ ] **Step 1: Create dropdown component**

Create `src/components/layout/NavSeasonDropdown.tsx`:

```tsx
import { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

export function NavSeasonDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return (
    <li ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="hover:text-crimson text-cream">
        The Season ▾
      </button>
      {open && (
        <ul role="menu" className="absolute top-full left-0 mt-2 bg-navy border border-cream/20 min-w-[10rem] py-2 z-20">
          <li role="none">
            <NavLink
              role="menuitem"
              to="/the-season"
              end
              onClick={() => setOpen(false)}
              className={({ isActive }) => `block px-4 py-1.5 ${isActive ? 'text-crimson' : 'text-cream hover:text-crimson'}`}>
              Story
            </NavLink>
          </li>
          <li role="none">
            <NavLink
              role="menuitem"
              to="/the-season/the-run"
              onClick={() => setOpen(false)}
              className={({ isActive }) => `block px-4 py-1.5 ${isActive ? 'text-crimson' : 'text-cream hover:text-crimson'}`}>
              The Run
            </NavLink>
          </li>
        </ul>
      )}
    </li>
  );
}
```

- [ ] **Step 2: Replace `Nav.tsx`**

```tsx
import { NavLink } from 'react-router-dom';
import { NavSeasonDropdown } from './NavSeasonDropdown';

const links = [
  { to: '/',             label: 'Home' },
  { to: '/roster',       label: 'Roster' },
  { to: '/vault',        label: 'The Vault' },
  { to: '/banner-night', label: 'Banner Night' },
];

export function Nav() {
  return (
    <nav aria-label="Primary">
      <ul className="flex gap-6 text-sm uppercase tracking-widest items-center">
        <li>
          <NavLink to="/" end className={({ isActive }) => `hover:text-crimson ${isActive ? 'text-crimson' : 'text-cream'}`}>
            Home
          </NavLink>
        </li>
        <NavSeasonDropdown />
        {links.slice(1).map(l => (
          <li key={l.to}>
            <NavLink to={l.to} className={({ isActive }) => `hover:text-crimson ${isActive ? 'text-crimson' : 'text-cream'}`}>
              {l.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

- [ ] **Step 3: Verify in dev**

Run: `npm run dev`
Click "The Season ▾" — dropdown reveals "Story" and "The Run" items. Each navigates correctly. Clicking outside closes the dropdown.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Nav.tsx src/components/layout/NavSeasonDropdown.tsx
git commit -m "nav: Season dropdown reveals Story + The Run sub-links"
```

---

## Task 9: Update ExploreGrid + SeasonArc link

**Files:**
- Modify: `src/components/hero/ExploreGrid.tsx`
- Modify: `src/components/hero/SeasonArc.tsx`

- [ ] **Step 1: Replace `ExploreGrid.tsx` CARDS array**

Change the `CARDS` constant to:

```tsx
const CARDS: Card[] = [
  {
    to: '/the-season',
    eyebrow: 'The Story',
    title: 'The Season',
    blurb:
      'Seven chapters bookended by the 2025 BCHHoF induction — how Kurtenbach rebuilt the roster, the 15-0 BCJHL playoff run, the 9-1 Game 7 in Red Deer, and the five-goal final in Humboldt.',
  },
  {
    to: '/the-season/the-run',
    eyebrow: 'The Games',
    title: 'The Run',
    blurb:
      'Twenty-six games across four trophies — Mowat, Doyle, Abbott, Centennial — with scorers, turning points, and period-by-period detail where the box scores survived.',
  },
  {
    to: '/roster',
    eyebrow: 'The Team',
    title: 'Roster & Staff',
    blurb:
      'Twenty-two players, head coach Orland Kurtenbach, the coaching staff, owner Bruce Taylor, and the booster club. Click any name for the full program snapshot, nicknames, linemates, and path to Richmond.',
  },
  {
    to: '/vault',
    eyebrow: 'The Archive',
    title: 'The Vault',
    blurb:
      'Primary-source newspaper clippings, programs, and photos — cross-referenced to every person, game, and chapter in the story.',
  },
];
```

- [ ] **Step 2: Append "Read the full story →" link to `SeasonArc.tsx`**

Inside the closing `</div>` of the inner content block (after the last `<p>`), before the outer closing `</div>`, add:

```tsx
<p className="mt-8">
  <Link
    to="/the-season"
    className="inline-block text-crimson uppercase tracking-widest text-sm font-semibold hover:underline">
    Read the full story →
  </Link>
</p>
```

Add the `Link` import at the top of the file:

```tsx
import { Link } from 'react-router-dom';
```

- [ ] **Step 3: Verify in dev**

Run: `npm run dev`
Open `/`: verify the updated ExploreGrid cards show the new titles, and SeasonArc now has a "Read the full story →" link at the end. Clicking it takes you to `/#/the-season`.

- [ ] **Step 4: Commit**

```bash
git add src/components/hero/ExploreGrid.tsx src/components/hero/SeasonArc.tsx
git commit -m "landing: update ExploreGrid cards for new IA + add SeasonArc full-story link"
```

---

## Task 10: Markdown chapter renderer (TDD)

**Files:**
- Create: `src/lib/markdownChapter.tsx`
- Test: `src/lib/markdownChapter.test.tsx`

The chapters use standard markdown with one convention: a media embed is written as `![](media:<id>)`. The renderer intercepts images whose `src` starts with `media:` and renders a `MediaEmbed` component that shows the thumb + short description and opens the media in the Vault's lightbox. If the id is not in `loadMedia()`'s output (e.g., a private id stripped from a public build), renders a plain text "(private item)" placeholder.

- [ ] **Step 1: Write the failing test**

Create `src/lib/markdownChapter.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderChapter } from './markdownChapter';
import type { MediaItem } from '../types/media';

const items: MediaItem[] = [
  {
    id: 'test-item',
    type: 'photo',
    date: '1987-05-09',
    access: 'public',
    thumb: '/thumbs/test.jpg',
    descriptionShort: 'Test item short description.',
    descriptionLong: 'x'.repeat(90),
    tags: [],
  },
];

describe('renderChapter', () => {
  it('renders plain markdown paragraphs', () => {
    render(<div>{renderChapter('# Heading\n\nSome paragraph.', items)}</div>);
    expect(screen.getByRole('heading', { level: 1, name: 'Heading' })).toBeInTheDocument();
    expect(screen.getByText('Some paragraph.')).toBeInTheDocument();
  });

  it('replaces ![](media:<id>) with a media embed', () => {
    render(<div>{renderChapter('See this: ![](media:test-item)', items)}</div>);
    expect(screen.getByText('Test item short description.')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', '/thumbs/test.jpg');
  });

  it('renders a placeholder when the id is missing', () => {
    render(<div>{renderChapter('Hidden: ![](media:missing-id)', items)}</div>);
    expect(screen.getByText('(private item)')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/markdownChapter.test.tsx`
Expected: FAIL with "Cannot find module './markdownChapter'".

- [ ] **Step 3: Implement the renderer**

Create `src/lib/markdownChapter.tsx`:

```tsx
import Markdown from 'react-markdown';
import type { MediaItem } from '../types/media';

export function renderChapter(markdown: string, items: MediaItem[]) {
  const byId = new Map(items.map(i => [i.id, i]));
  return (
    <Markdown
      components={{
        img: ({ src, alt }) => {
          if (typeof src === 'string' && src.startsWith('media:')) {
            const id = src.slice('media:'.length);
            const item = byId.get(id);
            if (!item) return <span className="italic text-navy/60">(private item)</span>;
            return (
              <figure className="my-6 bg-cream-200 border border-navy/10 rounded overflow-hidden">
                <img src={item.thumb} alt={item.descriptionShort} className="w-full h-auto" loading="lazy" />
                <figcaption className="p-3 text-sm text-navy/80">
                  {item.descriptionShort}
                  {item.date ? ` — ${item.date}` : ''}
                </figcaption>
              </figure>
            );
          }
          return <img src={src} alt={alt ?? ''} loading="lazy" />;
        },
      }}
    >
      {markdown}
    </Markdown>
  );
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/lib/markdownChapter.test.tsx`
Expected: all 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/markdownChapter.tsx src/lib/markdownChapter.test.tsx
git commit -m "lib: markdown chapter renderer with media-embed convention (![](media:id))"
```

---

## Task 11: Season Story page infrastructure

**Files:**
- Modify: `src/pages/SeasonStoryPage.tsx`
- Create: `src/content/the-season/00-penticton-2025.md`
- Create: `src/content/the-season/01-the-rebuild.md`
- Create: `src/content/the-season/02-regular-season.md`
- Create: `src/content/the-season/03-fred-page-mowat-cup.md`
- Create: `src/content/the-season/04-doyle-cup.md`
- Create: `src/content/the-season/05-abbott-cup.md`
- Create: `src/content/the-season/06-centennial-cup.md`
- Create: `src/content/the-season/07-back-to-penticton.md`

- [ ] **Step 1: Create all eight chapter files with placeholder content**

Each chapter file should have a heading, a two-sentence placeholder summary, and a TODO marker noting the target word count. Content is filled in Task 12. Example:

Create `src/content/the-season/00-penticton-2025.md`:

```markdown
# Penticton, July 2025

Chapter 0 — frame. 2025 BCHHoF induction opening.

<!-- TARGET: 350-500 words. Sourced from docs/retrospectives/bchl-horcoff-sockeyes-bchof-2025.md, pjhl-bchof-gala-sockeyes-inductees.md, princegeorgecitizen.com Gunn retrospective. Touchstones: July 12 2025, SOEC Penticton, Jim Hughson chair, class of 7, "first reunion in 38 years." Ends with link into /hall-of-fame and into the body of the season. -->
```

Repeat the pattern for chapters 01-07, updating heading and TODO marker. The TODO markers for the remaining chapters:

- `01-the-rebuild.md` — "Chapter 1 — July 1986. Bruce Taylor ownership, MacPherson out, Kurtenbach hired, Trevor Dickie captain. Target 400-600 words."
- `02-regular-season.md` — "Chapter 2 — Oct 1986–Mar 1987. 38-14-0, Coast Division, scoring leaders (Tomlinson/Clarke/Moller), line chemistry. Target 400-600 words."
- `03-fred-page-mowat-cup.md` — "Chapter 3 — March 1987. 15-0 BCJHL run, sweep Kelowna 4-0. Target 350-500 words. Links into /the-season/the-run#mowat."
- `04-doyle-cup.md` — "Chapter 4 — April 1987. 4-3 vs Red Deer, Game 7 9-1 comeback. Clarke PP hat trick in G6. Target 500-700 words. Links into /the-season/the-run#doyle."
- `05-abbott-cup.md` — "Chapter 5 — April 1987. 4-3 vs Humboldt, helmet-butt G6, G7 comeback. Rutherford 2G. Target 500-700 words. Links into /the-season/the-run#abbott."
- `06-centennial-cup.md` — "Chapter 6 — May 1987. Centennial round-robin, 5-2 final May 9 Humboldt Uniplex. Romeo MVP, Phillips hat trick + Gentlemanly + All-Star. Target 500-700 words. Links into /the-season/the-run#centennial."
- `07-back-to-penticton.md` — "Chapter 7 — 2025 close. July 12 SOEC. 38 years pass. Pointers to /hall-of-fame and phase-2 pages. Target 250-400 words."

- [ ] **Step 2: Wire chapters into SeasonStoryPage**

Replace `src/pages/SeasonStoryPage.tsx`:

```tsx
import { renderChapter } from '../lib/markdownChapter';
import { loadMedia } from '../lib/loadData';
import ch0 from '../content/the-season/00-penticton-2025.md?raw';
import ch1 from '../content/the-season/01-the-rebuild.md?raw';
import ch2 from '../content/the-season/02-regular-season.md?raw';
import ch3 from '../content/the-season/03-fred-page-mowat-cup.md?raw';
import ch4 from '../content/the-season/04-doyle-cup.md?raw';
import ch5 from '../content/the-season/05-abbott-cup.md?raw';
import ch6 from '../content/the-season/06-centennial-cup.md?raw';
import ch7 from '../content/the-season/07-back-to-penticton.md?raw';

const chapters = [ch0, ch1, ch2, ch3, ch4, ch5, ch6, ch7];

export default function SeasonStoryPage() {
  const media = loadMedia();
  return (
    <article className="max-w-3xl mx-auto px-4 py-12 prose prose-navy">
      {chapters.map((ch, i) => (
        <section key={i} id={`chapter-${i}`} className="mb-16">
          {renderChapter(ch, media)}
        </section>
      ))}
    </article>
  );
}
```

- [ ] **Step 3: Confirm Vite handles `?raw` imports**

Vite supports `?raw` imports natively. No plugin needed. If TypeScript complains about the `.md?raw` module, add a declaration:

Create (if missing) `src/vite-env.d.ts` with:

```ts
/// <reference types="vite/client" />

declare module '*.md?raw' {
  const content: string;
  export default content;
}
```

If `src/vite-env.d.ts` already exists, add only the `declare module '*.md?raw'` block.

- [ ] **Step 4: Verify page renders**

Run: `npm run dev`
Open `/#/the-season`: page shows 8 chapter sections with placeholder headings and TODO markers as HTML comments (invisible to end users, visible in DOM).

- [ ] **Step 5: Commit**

```bash
git add src/pages/SeasonStoryPage.tsx src/content/the-season/*.md src/vite-env.d.ts
git commit -m "season: scaffold 8 chapter files + render via markdownChapter on /the-season"
```

---

## Task 12: Write Season Story chapter content — bookends + setup (chapters 0, 1, 2, 7)

**Files:**
- Modify: `src/content/the-season/00-penticton-2025.md`
- Modify: `src/content/the-season/01-the-rebuild.md`
- Modify: `src/content/the-season/02-regular-season.md`
- Modify: `src/content/the-season/07-back-to-penticton.md`

**Source material:** `docs/retrospectives/*.md`, `CLAUDE.md`, existing `SeasonArc.tsx`, `src/data/roster.json`. Factual-narrative voice per project rule — no editorializing. Every substantive claim that references a specific newspaper source should include the newspapers.com image ID inline (7+ digits). The linkify pass wraps them automatically.

- [ ] **Step 1: Draft chapter 0 — Penticton, July 2025**

Target 350-500 words. Narrative opens at the South Okanagan Events Centre, July 12 2025. Frame: "first reunion in 38 years." Mention: Jim Hughson chairing, class of 7 (Dan Hamhuis, Shawn Horcoff, Mike Penny, Larry Kwong, Ted Hargreaves, 1987 Sockeyes team, 1977-78 Kimberley Dynamiters), festivities spanned July 11-12. Close with a segue to 1986: "To understand what was being honoured, go back 38 years." Include a `[See the induction detail →](/hall-of-fame)` inline link. Sources: `docs/retrospectives/bchl-horcoff-sockeyes-bchof-2025.md`, `pjhl-bchof-gala-sockeyes-inductees.md`, Castanet line ("first reunion in 38 years"), Penticton Herald.

- [ ] **Step 2: Draft chapter 1 — The Rebuild**

Target 400-600 words. Bruce Taylor's ownership context (Burnaby businessman, also owned Bluehawks 1985 and Coast Division contenders). Muzz MacPherson out; July 1986 hiring of Orland Kurtenbach as head coach + director of hockey operations (primary source: Vancouver Sun Nov 4 1986, image 494902975, Arv Olson byline). Mike O'Brien as assistant coach (same source). Horst Willkomm as team president (The Province Apr 14 1987 p.45, image 502036260). Trevor Dickie (#21, formerly New West Bruins WHL) as captain — Vancouver Sun Mar 25 1987 p.25, image 495157862. Bill Hardy (#16) assistant captain (Red Deer Advocate Jun 17 1987).

- [ ] **Step 3: Draft chapter 2 — Regular Season**

Target 400-600 words. 38-14-0 record, Coast Division champions, +104 goal differential. Scoring: Tomlinson 43-65-108 (2nd in BCJHL), Rob Clarke 65-38-103 (3rd), Bryon Moller 27-64-91 (6th). Line chemistry: Phillips-Kozak-Hardy; Tomlinson at centre. Narrative through the fall and winter — include one or two specific game moments from `src/data/games.json` if documented. No need to enumerate every game; paint the arc.

- [ ] **Step 4: Draft chapter 7 — Back to Penticton**

Target 250-400 words. Close the bookend. Mid-May 1987: team disperses. Kurtenbach returns to pro-hockey scouting. Players scatter to junior programs, NCAA, pro tryouts. 38 years pass. July 12 2025: the surviving team gathers at SOEC. Include `[Full induction details →](/hall-of-fame)` link and `[The players today →](#)` as a `/where-are-they-now` phase-2 stub (just an anchor for now). End on the banner-night frame from Sep 2025. No editorializing.

- [ ] **Step 5: Verify rendering**

Run: `npm run dev`
Open `/#/the-season`: chapters 0, 1, 2, 7 show full narrative; chapters 3-6 still show TODO placeholders.

- [ ] **Step 6: Commit**

```bash
git add src/content/the-season/00-penticton-2025.md src/content/the-season/01-the-rebuild.md src/content/the-season/02-regular-season.md src/content/the-season/07-back-to-penticton.md
git commit -m "season: chapters 0, 1, 2, 7 — 2025 bookends + rebuild + regular-season narrative"
```

---

## Task 13: Write Season Story chapter content — playoff run (chapters 3, 4, 5, 6)

**Files:**
- Modify: `src/content/the-season/03-fred-page-mowat-cup.md`
- Modify: `src/content/the-season/04-doyle-cup.md`
- Modify: `src/content/the-season/05-abbott-cup.md`
- Modify: `src/content/the-season/06-centennial-cup.md`

Same sourcing conventions as Task 12. Each chapter ends with a `[See the game-by-game →](/the-season/the-run#<anchor>)` link to the corresponding series on the playoff-timeline page.

- [ ] **Step 1: Draft chapter 3 — Fred Page / Mowat Cup**

Target 350-500 words. 15-0 BCJHL playoff run: sweep Nanaimo Clippers, sweep North Delta Flyers, defeat Kelowna Packers 4-0 (Kelowna had gone 45-5-2, best Canadian Junior A regular-season record). Note: Kelowna post-sweep photo of captain Dickie — Vancouver Sun Mar 25 1987 p.25 (image 495157862). End with `[See the game-by-game →](/the-season/the-run#mowat)`.

- [ ] **Step 2: Draft chapter 4 — Doyle Cup**

Target 500-700 words. Best-of-7 vs Red Deer Rustlers. Richmond behind 3-2. Rustlers snapped a 17-game Sockeyes winning streak. Games 6 & 7: Richmond wins. Clarke PP hat trick in G6. Game 7 in Red Deer ends 9-1. Cite specific scorers from `src/data/games.json` Doyle entries. Acknowledge Game 7 box-score narrative-only gap (per CLAUDE.md). End with `[See the game-by-game →](/the-season/the-run#doyle)`.

- [ ] **Step 3: Draft chapter 5 — Abbott Cup**

Target 500-700 words. Best-of-7 vs Humboldt Broncos (55-9 in SAJHL, own 17-game winning streak). Richmond takes the series 4-3. Game 6 Apr 28: Humboldt 4 Richmond 3 OT, Rutherford 2G, Tomlinson 1G, Bobbitt closing-hand-on-puck penalty, Jaques 5-min match penalty for helmet-butting McDougall (Nanaimo Daily News Apr 29 1987, image 325077439 — the word "helmet-butting" appears in four contemporaneous wire reports). Game 7: comeback W. Don't sanitize; state facts neutrally. End with `[See the game-by-game →](/the-season/the-run#abbott)`.

- [ ] **Step 4: Draft chapter 6 — Centennial Cup**

Target 500-700 words. 1987 Centennial Cup, Humboldt Uniplex.
- Round-robin: May 3 vs Dartmouth 7-3 W; May 4 vs Pembroke 4-1 W (Kozak opened 2:39/1st from Phillips+Hervey; Dupont tied it PP 4:06/3rd; Czenczek 6:35, Tomlinson 15:01 + 18:26); May 6 vs Humboldt 1-6 L (Czenczek goal, Kazuik SH breakaway after Jaques turnover).
- Semi: May 7 vs Pembroke 9-3 W.
- Final: May 9 vs Humboldt 5-2 W (Star-Phoenix May 11 1987 images 512098529 + 512098543; Vancouver Sun May 11 1987 images 495230735 + 495229991; Times Colonist May 10 1987 image 508633163).
- Frank Romeo named tournament MVP (confirmed by Star-Phoenix May 11 + Times Colonist May 10, correcting the 2025 Richmond Sentinel "Phillips MVP" error). Jason Phillips: Most Gentlemanly Player + All-Star Team + hat trick in final. Hat-trick narrative vs Sun p.20 5G/7A figure is unresolved per CLAUDE.md — state what is known, flag the tension neutrally.

End with `[See the game-by-game →](/the-season/the-run#centennial)`.

- [ ] **Step 5: Verify rendering**

Run: `npm run dev`
Open `/#/the-season`: all 8 chapters render with full content. Inline links navigate correctly.

- [ ] **Step 6: Commit**

```bash
git add src/content/the-season/03-fred-page-mowat-cup.md src/content/the-season/04-doyle-cup.md src/content/the-season/05-abbott-cup.md src/content/the-season/06-centennial-cup.md
git commit -m "season: chapters 3-6 — BCJHL sweep, Doyle comeback, Abbott G7, Centennial 5-2"
```

---

## Task 14: Add Hall of Fame media entries to `media.json`

**Files:**
- Modify: `src/data/media.json`
- Asset: copy 4 Sequeira photos into `public/assets/vault/hof-2025/` (if staged in Drive; otherwise use placeholder paths that the user will populate)

The Sequeira HOF photos are public; the 10 induction videos are private stubs (url absent, no attribution).

- [ ] **Step 1: Copy the 4 Sequeira photos into `public/assets/vault/hof-2025/`**

Source folder on user's drive: `G:/My Drive/87 Sockeyes/HOF Weekend Videos - Emanuel Sequeira/`. The four photos to copy (using the `.jpg` variants, not the `.HEIC`):

- `Richmond Sockeyes team horiz (1).jpg` → `public/assets/vault/hof-2025/team-horiz.jpg`
- `R Sockeyes captain horiz 2.jpg` → `public/assets/vault/hof-2025/captain-horiz.jpg`
- `R Sockeyes captain vert 2.jpg` → `public/assets/vault/hof-2025/captain-vert.jpg`
- `Dave Tomlinson speech horiz.jpg` → `public/assets/vault/hof-2025/tomlinson-speech.jpg`

If the Drive source is not accessible from the build environment, commit 400x500 placeholder JPEGs with the target filenames; the user replaces them manually post-deploy.

Generate thumb variants at `public/assets/vault/hof-2025/thumbs/<name>.jpg` using any available image tool (user should run `node scripts/make-thumbs.mjs` or similar — if no such script exists, commit the full-size images for both `url` and `thumb` as a stopgap).

- [ ] **Step 2: Append 14 entries to `src/data/media.json`**

Open `src/data/media.json` and append these entries before the closing `]`:

```json
,
{
  "id": "hof-2025-sequeira-team-horiz",
  "type": "photo",
  "date": "2025-07-12",
  "access": "public",
  "thumb": "/assets/vault/hof-2025/thumbs/team-horiz.jpg",
  "url": "/assets/vault/hof-2025/team-horiz.jpg",
  "descriptionShort": "1987 Sockeyes team group photo at the 2025 BCHHoF induction, Penticton.",
  "descriptionLong": "The full 1987 Richmond Sockeyes team reunited for the first time in 38 years at the 2025 British Columbia Hockey Hall of Fame induction ceremony, held July 12 2025 at the South Okanagan Events Centre in Penticton. Photo by Emanuel Sequeira.",
  "attribution": { "paper": "Emanuel Sequeira" },
  "tags": ["hof-2025","reunion","team-photo"]
},
{
  "id": "hof-2025-sequeira-captain-horiz",
  "type": "photo",
  "date": "2025-07-12",
  "access": "public",
  "thumb": "/assets/vault/hof-2025/thumbs/captain-horiz.jpg",
  "url": "/assets/vault/hof-2025/captain-horiz.jpg",
  "descriptionShort": "1986-87 captain Trevor Dickie at the 2025 BCHHoF induction (horizontal).",
  "descriptionLong": "Trevor Dickie, captain of the 1986-87 Richmond Sockeyes, at the 2025 British Columbia Hockey Hall of Fame induction ceremony in Penticton. Photo by Emanuel Sequeira.",
  "attribution": { "paper": "Emanuel Sequeira" },
  "tags": ["hof-2025","dickie","captain"]
},
{
  "id": "hof-2025-sequeira-captain-vert",
  "type": "photo",
  "date": "2025-07-12",
  "access": "public",
  "thumb": "/assets/vault/hof-2025/thumbs/captain-vert.jpg",
  "url": "/assets/vault/hof-2025/captain-vert.jpg",
  "descriptionShort": "1986-87 captain Trevor Dickie at the 2025 BCHHoF induction (vertical).",
  "descriptionLong": "Trevor Dickie, captain of the 1986-87 Richmond Sockeyes, at the 2025 British Columbia Hockey Hall of Fame induction ceremony in Penticton (vertical framing). Photo by Emanuel Sequeira.",
  "attribution": { "paper": "Emanuel Sequeira" },
  "tags": ["hof-2025","dickie","captain"]
},
{
  "id": "hof-2025-sequeira-tomlinson-speech",
  "type": "photo",
  "date": "2025-07-12",
  "access": "public",
  "thumb": "/assets/vault/hof-2025/thumbs/tomlinson-speech.jpg",
  "url": "/assets/vault/hof-2025/tomlinson-speech.jpg",
  "descriptionShort": "Dave Tomlinson delivering the induction acceptance speech, July 2025.",
  "descriptionLong": "Dave Tomlinson, leading scorer for the 1986-87 Richmond Sockeyes, delivers the team's acceptance speech at the 2025 British Columbia Hockey Hall of Fame induction ceremony in Penticton. Photo by Emanuel Sequeira.",
  "attribution": { "paper": "Emanuel Sequeira" },
  "tags": ["hof-2025","tomlinson","speech"]
},
{
  "id": "hof-2025-induction-hughson-intro-pt1",
  "type": "video",
  "date": "2025-07-13",
  "access": "private",
  "thumb": "/assets/vault/hof-2025/thumbs/video-placeholder.jpg",
  "descriptionShort": "Jim Hughson introduces the 1987 Sockeyes induction, part 1.",
  "descriptionLong": "BCHHoF chair Jim Hughson opens the 1987 Richmond Sockeyes induction segment at the 2025 ceremony, introducing the team's regular-season dominance and playoff run. Part 1 of 2.",
  "tags": ["hof-2025","induction","hughson"]
},
{
  "id": "hof-2025-induction-hughson-intro-pt2",
  "type": "video",
  "date": "2025-07-13",
  "access": "private",
  "thumb": "/assets/vault/hof-2025/thumbs/video-placeholder.jpg",
  "descriptionShort": "Jim Hughson introduces the 1987 Sockeyes induction, part 2.",
  "descriptionLong": "BCHHoF chair Jim Hughson continues the introduction, covering the 1987 Centennial Cup final and the team's legacy. Part 2 of 2.",
  "tags": ["hof-2025","induction","hughson"]
},
{
  "id": "hof-2025-dickie-speech-pt1",
  "type": "video",
  "date": "2025-07-13",
  "access": "private",
  "thumb": "/assets/vault/hof-2025/thumbs/video-placeholder.jpg",
  "descriptionShort": "Trevor Dickie acceptance speech on behalf of the 1987 team, part 1.",
  "descriptionLong": "Captain Trevor Dickie delivers the first half of the acceptance speech on behalf of the 1986-87 Richmond Sockeyes at the 2025 BCHHoF induction.",
  "tags": ["hof-2025","dickie","speech"]
},
{
  "id": "hof-2025-dickie-speech-pt2",
  "type": "video",
  "date": "2025-07-13",
  "access": "private",
  "thumb": "/assets/vault/hof-2025/thumbs/video-placeholder.jpg",
  "descriptionShort": "Trevor Dickie acceptance speech on behalf of the 1987 team, part 2.",
  "descriptionLong": "Captain Trevor Dickie completes the acceptance speech on behalf of the 1986-87 Richmond Sockeyes at the 2025 BCHHoF induction.",
  "tags": ["hof-2025","dickie","speech"]
},
{
  "id": "hof-2025-tomlinson-speech",
  "type": "video",
  "date": "2025-07-13",
  "access": "private",
  "thumb": "/assets/vault/hof-2025/thumbs/video-placeholder.jpg",
  "descriptionShort": "Dave Tomlinson acceptance remarks on behalf of the 1987 team.",
  "descriptionLong": "Dave Tomlinson, leading scorer for the 1986-87 Richmond Sockeyes, delivers remarks at the 2025 BCHHoF induction ceremony.",
  "tags": ["hof-2025","tomlinson","speech"]
},
{
  "id": "hof-2025-display-case",
  "type": "video",
  "date": "2025-07-12",
  "access": "private",
  "thumb": "/assets/vault/hof-2025/thumbs/video-placeholder.jpg",
  "descriptionShort": "Walkthrough of the 1987 Sockeyes display case at the BCHHoF venue.",
  "descriptionLong": "Walkthrough of the display case showcasing 1986-87 Richmond Sockeyes memorabilia at the 2025 BCHHoF induction ceremony venue in Penticton.",
  "tags": ["hof-2025","display-case","memorabilia"]
},
{
  "id": "hof-2025-interview-dickie",
  "type": "video",
  "date": "2025-07-12",
  "access": "private",
  "thumb": "/assets/vault/hof-2025/thumbs/video-placeholder.jpg",
  "descriptionShort": "Interview with 1986-87 captain Trevor Dickie at the 2025 induction weekend.",
  "descriptionLong": "On-site interview with Trevor Dickie, captain of the 1986-87 Richmond Sockeyes, recorded during the 2025 BCHHoF induction weekend in Penticton.",
  "tags": ["hof-2025","dickie","interview"]
},
{
  "id": "hof-2025-interview-phillips",
  "type": "video",
  "date": "2025-07-12",
  "access": "private",
  "thumb": "/assets/vault/hof-2025/thumbs/video-placeholder.jpg",
  "descriptionShort": "Interview with Jason Phillips at the 2025 induction weekend.",
  "descriptionLong": "On-site interview with Jason Phillips, 1987 Centennial Cup hat-trick scorer and All-Star team selection, recorded during the 2025 BCHHoF induction weekend.",
  "tags": ["hof-2025","phillips","interview"]
},
{
  "id": "hof-2025-interview-gunn",
  "type": "video",
  "date": "2025-07-12",
  "access": "private",
  "thumb": "/assets/vault/hof-2025/thumbs/video-placeholder.jpg",
  "descriptionShort": "Interview with Jim Gunn at the 2025 induction weekend.",
  "descriptionLong": "On-site interview with Jim Gunn, Prince George-raised 1986-87 defenceman, recorded during the 2025 BCHHoF induction weekend.",
  "tags": ["hof-2025","gunn","interview"]
},
{
  "id": "hof-2025-interview-moro",
  "type": "video",
  "date": "2025-07-12",
  "access": "private",
  "thumb": "/assets/vault/hof-2025/thumbs/video-placeholder.jpg",
  "descriptionShort": "Interview with Greg Moro at the 2025 induction weekend.",
  "descriptionLong": "On-site interview with Greg Moro, 1986-87 Richmond Sockeyes staff, recorded during the 2025 BCHHoF induction weekend.",
  "tags": ["hof-2025","moro","interview"]
}
```

For the `thumb: /assets/vault/hof-2025/thumbs/video-placeholder.jpg` — commit a single 400x500 placeholder JPEG at that path (simple grey rectangle with a play-icon overlay). Used for all 10 video entries.

- [ ] **Step 3: Validate**

Run: `npm run validate:data`
Expected: passes. `media.json` now has 46 + 14 = 60 items.

- [ ] **Step 4: Commit**

```bash
git add src/data/media.json public/assets/vault/hof-2025/
git commit -m "data: add 14 HOF-2025 media entries (4 public Sequeira photos + 10 private videos)"
```

---

## Task 15: Hall of Fame page content + component

**Files:**
- Modify: `src/pages/HallOfFamePage.tsx`
- Create: `src/content/hall-of-fame/index.md`

- [ ] **Step 1: Write the HOF page markdown**

Create `src/content/hall-of-fame/index.md`:

```markdown
# 2025 BCHHoF Induction

On July 12 2025, at the South Okanagan Events Centre in Penticton, the 1986-87 Richmond Sockeyes were inducted into the British Columbia Hockey Hall of Fame. It was the first time the team had gathered in 38 years.

![](media:hof-2025-sequeira-team-horiz)

## The ceremony

Jim Hughson, BCHHoF chair, introduced the team. Festivities ran July 11-12, with the formal induction on the Sunday. The Sockeyes went in alongside six other inductees: Dan Hamhuis, Shawn Horcoff, Mike Penny, Larry Kwong, Ted Hargreaves, and the 1977-78 Kimberley Dynamiters.

Captain Trevor Dickie delivered the acceptance remarks; Dave Tomlinson followed with a second address.

![](media:hof-2025-sequeira-tomlinson-speech)

## The citation

Per the BCHHoF and Pacific Junior Hockey League coverage, the Sockeyes were recognised for the 1986-87 season: a 38-14-0 BCJHL regular-season record, a 15-0 BCJHL playoff sweep (Mowat Cup over Kelowna), Doyle Cup over Red Deer, Abbott Cup over Humboldt, and the 5-2 Centennial Cup final win over Humboldt at the Uniplex on May 9 1987. Frank Romeo was named Centennial Cup tournament MVP; Jason Phillips was named to the All-Star team and received the Most Gentlemanly Player award, recording a hat trick in the final.

## The captain

![](media:hof-2025-sequeira-captain-horiz)

## Induction video

![](media:hof-2025-induction-hughson-intro-pt1)

![](media:hof-2025-induction-hughson-intro-pt2)

![](media:hof-2025-dickie-speech-pt1)

![](media:hof-2025-dickie-speech-pt2)

![](media:hof-2025-tomlinson-speech)

## Weekend interviews

![](media:hof-2025-interview-dickie)

![](media:hof-2025-interview-phillips)

![](media:hof-2025-interview-gunn)

![](media:hof-2025-interview-moro)

![](media:hof-2025-display-case)

## Class of 2025

- **Dan Hamhuis** — long-time NHL defenceman, BC-born
- **Shawn Horcoff** — long-time NHL centre, Edmonton Oilers captain
- **Mike Penny** — hockey executive
- **Larry Kwong** — first player of Chinese descent in the NHL (New York Rangers, 1948)
- **Ted Hargreaves** — hockey builder
- **1977-78 Kimberley Dynamiters** — junior B team, Centennial Cup champions
```

- [ ] **Step 2: Wire the HOF page**

Replace `src/pages/HallOfFamePage.tsx`:

```tsx
import { renderChapter } from '../lib/markdownChapter';
import { loadMedia } from '../lib/loadData';
import hofContent from '../content/hall-of-fame/index.md?raw';

export default function HallOfFamePage() {
  const media = loadMedia();
  return (
    <article className="max-w-3xl mx-auto px-4 py-12 prose prose-navy">
      {renderChapter(hofContent, media)}
    </article>
  );
}
```

- [ ] **Step 3: Verify**

Run: `npm run dev`
Open `/#/hall-of-fame`: page shows the HOF narrative with embedded Sequeira photos and (placeholder) video cards. Video cards show thumb + short description but no link-through yet — that's Task 16.

- [ ] **Step 4: Commit**

```bash
git add src/content/hall-of-fame/index.md src/pages/HallOfFamePage.tsx
git commit -m "hof: /hall-of-fame page with 2025 BCHHoF induction narrative + media embeds"
```

---

## Task 16: `LockedLightbox` component + lock badge on `MediaCard`

**Files:**
- Create: `src/components/vault/LockedLightbox.tsx`
- Test: `src/components/vault/LockedLightbox.test.tsx`
- Modify: `src/components/vault/MediaCard.tsx`

- [ ] **Step 1: Write the failing test for LockedLightbox**

Create `src/components/vault/LockedLightbox.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LockedLightbox } from './LockedLightbox';
import type { MediaItem } from '../../types/media';

const item: MediaItem = {
  id: 'locked-1',
  type: 'video',
  date: '2025-07-13',
  access: 'private',
  thumb: '/thumb.jpg',
  descriptionShort: 'Short.',
  descriptionLong: 'Long description that appears in the locked lightbox.',
  tags: [],
};

describe('LockedLightbox', () => {
  it('renders the long description and a mailto request link', () => {
    render(<LockedLightbox item={item} onClose={() => {}} />);
    expect(screen.getByText(/Long description/)).toBeInTheDocument();
    const cta = screen.getByRole('link', { name: /Request access/ });
    expect(cta).toHaveAttribute('href', expect.stringMatching(/^mailto:/));
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn();
    render(<LockedLightbox item={item} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /Close/ }));
    expect(onClose).toHaveBeenCalled();
  });

  it('does NOT render attribution fields', () => {
    const itemWithAttr: MediaItem = { ...item, attribution: { paper: 'Secret Paper', headline: 'Secret Headline' } };
    render(<LockedLightbox item={itemWithAttr} onClose={() => {}} />);
    expect(screen.queryByText(/Secret Paper/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Secret Headline/)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/vault/LockedLightbox.test.tsx`
Expected: FAIL with "Cannot find module './LockedLightbox'".

- [ ] **Step 3: Implement LockedLightbox**

Create `src/components/vault/LockedLightbox.tsx`:

```tsx
import type { MediaItem } from '../../types/media';

export function LockedLightbox({ item, onClose }: { item: MediaItem; onClose: () => void }) {
  const subject = encodeURIComponent('1987 Sockeyes archive access request');
  return (
    <div role="dialog" aria-modal="true" aria-label="Locked archive item" className="fixed inset-0 bg-navy/90 z-50 flex items-center justify-center p-4">
      <div className="bg-cream max-w-2xl w-full rounded shadow-xl overflow-hidden">
        <img src={item.thumb} alt="" className="w-full max-h-[55vh] object-contain bg-navy" />
        <div className="p-6">
          <div className="text-xs uppercase tracking-widest text-navy/60 mb-2">
            {item.date}
          </div>
          <p className="text-navy/90 mb-6 leading-relaxed">{item.descriptionLong}</p>
          <div className="border-t border-navy/15 pt-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="text-navy/80 text-sm">
              <span aria-hidden="true">🔒 </span>
              This item is in the private archive.
            </div>
            <div className="flex gap-3">
              <a
                href={`mailto:sbjaques@yahoo.com?subject=${subject}`}
                className="bg-crimson text-cream px-4 py-2 rounded uppercase tracking-widest text-xs hover:bg-crimson/90">
                Request access →
              </a>
              <button
                type="button"
                onClick={onClose}
                className="border border-navy/30 text-navy px-4 py-2 rounded uppercase tracking-widest text-xs hover:border-navy">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/components/vault/LockedLightbox.test.tsx`
Expected: all 3 tests pass.

- [ ] **Step 5: Add lock badge to MediaCard**

Edit `src/components/vault/MediaCard.tsx`. Inside the card wrapper `<div>`, add a lock badge in the top-left corner that only renders when `item.access === 'private'`:

Add this JSX inside the `<div className="relative">` block that wraps the thumb image, ALONGSIDE the existing document-type badge (not replacing it):

```tsx
{item.access === 'private' && (
  <span
    aria-label="Private archive item"
    className="absolute top-2 left-2 bg-crimson text-cream text-[10px] uppercase tracking-widest px-2 py-1 rounded flex items-center gap-1">
    <span aria-hidden="true">🔒</span>
    <span className="sr-only">Locked</span>
  </span>
)}
```

If this conflicts with an existing top-left badge position, shift the document-type badge to `top-2 left-12` when `item.access === 'private'`.

- [ ] **Step 6: Commit**

```bash
git add src/components/vault/LockedLightbox.tsx src/components/vault/LockedLightbox.test.tsx src/components/vault/MediaCard.tsx
git commit -m "vault: LockedLightbox component + lock badge on private MediaCards"
```

---

## Task 17: Route `MediaLightbox` by `access`

**Files:**
- Modify: `src/components/vault/MediaLightbox.tsx`

- [ ] **Step 1: Route between regular and locked lightbox**

Open `src/components/vault/MediaLightbox.tsx`. At the top of the component body (before the existing lightbox JSX), add:

```tsx
import { LockedLightbox } from './LockedLightbox';

// Inside the component:
if (item && item.access === 'private') {
  return <LockedLightbox item={item} onClose={onClose} />;
}
```

Where `item` and `onClose` are whatever the component already uses to control the existing yet-another-react-lightbox instance.

If the existing `MediaLightbox` currently maps over an array of items (for slideshow/carousel mode), guard at the open boundary: when the active index points to a private item, route to LockedLightbox instead of the standard lightbox.

- [ ] **Step 2: Manual verification**

Run: `npm run dev`
Open `/#/hall-of-fame`: click any private video card. Expected: LockedLightbox opens with long description + sign-in CTA, NO url/download button, NO attribution.

Click one of the public Sequeira photos. Expected: regular lightbox with zoom + download, attribution visible.

- [ ] **Step 3: Commit**

```bash
git add src/components/vault/MediaLightbox.tsx
git commit -m "vault: route private items to LockedLightbox, public items to standard lightbox"
```

---

## Task 18: Update CI workflow for dual build

**Files:**
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Replace ci.yml**

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run validate:data
      - run: npm test
      - run: npm run build:public
      - run: npm run build:private
```

- [ ] **Step 2: Push to a branch, verify CI passes**

Branch, push, observe CI. Expected: validate + test + both builds green.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: build both public and private targets on every push"
```

---

## Task 19: Replace GitHub Pages deploy with Cloudflare Pages public deploy

**Files:**
- Delete: `.github/workflows/deploy.yml`
- Create: `.github/workflows/deploy-public.yml`

Assumption: the user has created a Cloudflare Pages project named `sockeyes-public` and has the following GitHub Actions secrets configured on the `1987Sockeyes` repo:
- `CLOUDFLARE_API_TOKEN` — CF API token with "Cloudflare Pages: Edit" permission
- `CLOUDFLARE_ACCOUNT_ID` — CF account ID

If these secrets are not yet set, the user creates them before this workflow runs.

- [ ] **Step 1: Delete old workflow**

Run: `git rm .github/workflows/deploy.yml`

- [ ] **Step 2: Create `.github/workflows/deploy-public.yml`**

```yaml
name: Deploy public site to Cloudflare Pages
on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run validate:data
      - run: npm test
      - run: npm run build:public
      - name: Publish to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy dist-public --project-name=sockeyes-public --branch=main
```

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy-public.yml
git commit -m "ci: deploy public site to Cloudflare Pages instead of GitHub Pages"
```

Note: the workflow will only succeed once the user has (a) created the CF Pages project named `sockeyes-public` and (b) added the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets. Until those exist, the deploy step fails — expected.

---

## Task 20: Private-build push to `1987Sockeyes-archive-dist`

**Files:**
- Create: `.github/workflows/deploy-private.yml`
- Create: `scripts/push-dist-private-to-archive-repo.mjs`

Assumption: the user has created a private GitHub repo `sbjaques/1987Sockeyes-archive-dist` and has a fine-grained personal access token with content-write access scoped to that repo, stored as `ARCHIVE_DIST_PAT` secret on `1987Sockeyes`.

The CF Pages project `sockeyes-archive` is connected directly to `1987Sockeyes-archive-dist` on the GitHub side; pushing a new commit triggers CF Pages to redeploy. No CF API calls in the workflow.

- [ ] **Step 1: Write the push script**

Create `scripts/push-dist-private-to-archive-repo.mjs`:

```js
#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';

const token = process.env.ARCHIVE_DIST_PAT;
if (!token) {
  console.error('ARCHIVE_DIST_PAT env var is required.');
  process.exit(1);
}

const srcCommit = execSync('git rev-parse --short HEAD').toString().trim();
const srcMessage = execSync('git log -1 --pretty=%s').toString().trim();
const dest = 'archive-dist-clone';
if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });

execSync(`git clone --depth=1 https://x-access-token:${token}@github.com/sbjaques/1987Sockeyes-archive-dist.git ${dest}`, { stdio: 'inherit' });

execSync(`rm -rf ${dest}/*`, { stdio: 'inherit' });
execSync(`cp -r dist-private/. ${dest}/`, { stdio: 'inherit' });

execSync(`git -C ${dest} config user.email "actions@github.com"`, { stdio: 'inherit' });
execSync(`git -C ${dest} config user.name "archive-deploy-bot"`, { stdio: 'inherit' });
execSync(`git -C ${dest} add -A`, { stdio: 'inherit' });

try {
  execSync(`git -C ${dest} commit -m "deploy: source ${srcCommit} — ${srcMessage}"`, { stdio: 'inherit' });
} catch {
  console.log('No changes to deploy.');
  process.exit(0);
}

execSync(`git -C ${dest} push origin main`, { stdio: 'inherit' });
console.log('Pushed private dist to archive-dist repo.');
```

- [ ] **Step 2: Create `.github/workflows/deploy-private.yml`**

```yaml
name: Deploy private archive artifacts
on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run validate:data
      - run: npm run build:private
      - name: Push dist-private to archive-dist repo
        env:
          ARCHIVE_DIST_PAT: ${{ secrets.ARCHIVE_DIST_PAT }}
        run: node scripts/push-dist-private-to-archive-repo.mjs
```

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy-private.yml scripts/push-dist-private-to-archive-repo.mjs
git commit -m "ci: private build deploys to 1987Sockeyes-archive-dist repo, CF Pages serves it"
```

Note: the workflow will only succeed once the user has (a) created the `1987Sockeyes-archive-dist` repo and (b) added the `ARCHIVE_DIST_PAT` secret. Until then, the push step fails — expected.

---

## Task 21: Full-site smoke test + final commit

**Files:** none (verification only).

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: all tests green.

- [ ] **Step 2: Run validate**

Run: `npm run validate:data`
Expected: passes.

- [ ] **Step 3: Build both modes**

Run: `npm run build:all`
Expected: both `dist-public/` and `dist-private/` produced, no TypeScript errors.

- [ ] **Step 4: Diff public vs private dist**

Run: `diff <(ls dist-public) <(ls dist-private)`
Expected: identical file list (same HTML/JS/CSS output; media content is loaded from CDN/asset paths at runtime). The private items are stripped from the JS bundle in public mode but the bundle structure is the same.

Run this spot check on the built JS:
```bash
grep -r "hof-2025-induction-hughson" dist-public/assets/ | wc -l
grep -r "hof-2025-induction-hughson" dist-private/assets/ | wc -l
```
Expected: the `id` `hof-2025-induction-hughson-intro-pt1` appears in both dist outputs (it's a private stub — id + thumb + description are shipped in both). But the stripped fields should not appear:

```bash
grep -c "CF-Access-Jwt-Assertion" dist-public/assets/ 2>/dev/null || echo "0"
```

More relevant: create a private item with a distinctive `url`/`attribution` and confirm those strings are absent from the public dist. Use one of the hof videos — they all have `access: 'private'` and no `url` set anyway, so this only verifies the `access` logic rather than URL-stripping. (Plan 2 tasks will add private items with real URLs; that's when the URL-stripping verification becomes meaningful.)

- [ ] **Step 5: Dev server smoke**

Run: `npm run dev`
Open and click through:
- `/` — Landing with updated ExploreGrid + "Read the full story →" link
- `/#/the-season` — 8 chapters render
- `/#/the-season/the-run` — playoff timeline with breadcrumb
- `/#/hall-of-fame` — HOF page with Sequeira photos + 10 locked video cards
- `/#/vault` — Vault shows HOF entries mixed chronologically with 46 existing items; private items have lock badge; clicking a private item opens LockedLightbox
- `/#/playoffs` — redirects to `/#/the-season/the-run`

Kill dev: `Ctrl+C`.

- [ ] **Step 6: Commit (if anything was tweaked in step 5)**

No commit needed unless issues were found during smoke test. If issues are found, fix them in-place, then:

```bash
git add -A
git commit -m "fixup: smoke-test corrections"
```

---

## Notes for the implementing agent

### The image-id linkify helper (DO NOT change in this plan)

`src/lib/linkifyImageRefs.tsx` currently resolves 7+ digit image IDs to the public `1987Sockeyes-images` companion repo raw JPGs, falling back to OCR markdown on GitHub, then to newspapers.com. This behaviour is intentionally preserved through Plan 1. The cutover (companion-repo flip to private + linkify dual-mode) happens in Plan 2 / the cutover runbook.

### Content voice rule

Project rule: "Factual tone only — no opinion or subjective commentary from source material." When drafting the 8 Season chapters and the HOF narrative, keep this in mind. State facts; avoid adjectives like "heroic" / "stunning" / "legendary." Where sources conflict (e.g., Phillips 7G narrative vs Sun p.20 5G/7A), state both and flag as unresolved.

### Scope discipline

Plan 1 is foundation — do not extend to Plan 2 items (content pipeline, OCR prune, R2 setup) or cutover items (DNS, CF Pages project creation, companion-repo flip). If a task feels like it's drifting into those territories, stop and flag.

### When a task cannot be completed

If Drive access is not available from the build environment and the Sequeira photos cannot be copied (Task 14 step 1), commit a `TODO` file at `public/assets/vault/hof-2025/README.md` explaining which files need to be populated, and proceed with placeholder JPEGs. Do not block the plan on asset availability.
