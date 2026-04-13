# 1987 Sockeyes Eternal Archive — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static React archive site for the 1987 Richmond Sockeyes Centennial Cup team, deployed to GitHub Pages.

**Architecture:** Vite + React + TypeScript + Tailwind. Data is local JSON (roster/games/media) bundled at build time; no backend. Hash routing for Pages compatibility. JSON schemas validated in CI via AJV. Tested with Vitest + React Testing Library. Deployed via GitHub Actions.

**Tech Stack:** Vite, React 18, TypeScript, Tailwind CSS, React Router (HashRouter), Vitest, React Testing Library, AJV, GitHub Actions → GitHub Pages.

---

## File Structure

```
1987Sockeyes/
  .github/workflows/deploy.yml          CI: build + deploy to Pages
  .github/workflows/ci.yml              CI: test + validate JSON
  public/
    assets/                             optimized images (logo, hero, vault/, thumbs/)
    CNAME                               (empty placeholder; enables later custom domain)
  src/
    main.tsx                            entry
    App.tsx                             router + layout shell
    index.css                           tailwind directives + CSS vars
    types/
      roster.ts                         RosterEntry types (skater vs goalie)
      games.ts                          Game types
      media.ts                          MediaItem types
    data/
      roster.json
      games.json
      media.json
      schema/
        roster.schema.json
        games.schema.json
        media.schema.json
    lib/
      loadData.ts                       typed loaders for each JSON
      sort.ts                           generic sort helper
      filter.ts                         media filter helper
      seo.ts                            <Seo> component helper (react-helmet-async)
      structuredData.ts                 JSON-LD builders (SportsTeam, SportsEvent)
      validateData.ts                   AJV-based validator used in tests + CI
    hooks/
      useSortableTable.ts
      useMediaFilters.ts
    components/
      layout/{Header,Footer,Nav,Section}.tsx
      hero/Hero.tsx
      timeline/{PlayoffTimeline,CupSegment,GameCard}.tsx
      roster/{RosterTable,PlayerCard,PlayerModal}.tsx
      vault/{VaultGrid,MediaCard,MediaLightbox,VaultFilters}.tsx
      common/{Heading,Badge,Img}.tsx
    pages/
      Landing.tsx
      RosterPage.tsx
      VaultPage.tsx
      CupPage.tsx
      BannerNightPage.tsx
      NotFound.tsx
    styles/theme.ts                     palette + font tokens (exported constants)
  scripts/
    validate-data.mjs                   CI-runnable AJV validator
  tests/
    (co-located; Vitest picks up *.test.ts(x))
  index.html
  vite.config.ts
  tailwind.config.ts
  tsconfig.json
  package.json
  README.md
  .gitignore
```

---

## Task 1: Initialize repository and Vite project

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `.gitignore`, `README.md`

- [ ] **Step 1: Initialize git and scaffold Vite**

```bash
cd c:/Users/sjaques/projects/1987Sockeyes
git init
git branch -M main
npm create vite@latest . -- --template react-ts
```
When prompted "Current directory is not empty", choose "Ignore files and continue".

- [ ] **Step 2: Install base deps**

```bash
npm install
npm install react-router-dom react-helmet-async
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom ajv ajv-formats @types/node
```

- [ ] **Step 3: Replace `vite.config.ts`**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/1987Sockeyes/',
  build: { outDir: 'dist', sourcemap: false },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
});
```

- [ ] **Step 4: Create `src/test-setup.ts`**

```ts
import '@testing-library/jest-dom';
```

- [ ] **Step 5: Add `.gitignore`**

```
node_modules
dist
.DS_Store
*.log
.vite
coverage
```

- [ ] **Step 6: Update `package.json` scripts**

Replace the `scripts` block with:
```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest",
  "validate:data": "node scripts/validate-data.mjs"
}
```

- [ ] **Step 7: Verify build**

Run: `npm run build`
Expected: success, `dist/` created.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: initialize Vite + React + TS project"
```

---

## Task 2: Install and configure Tailwind with theme tokens

**Files:** Create `tailwind.config.ts`, `postcss.config.js`, `src/styles/theme.ts`; modify `src/index.css`.

- [ ] **Step 1: Install Tailwind**

```bash
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
```

- [ ] **Step 2: Replace `tailwind.config.js` content with a TS config**

Delete `tailwind.config.js`, create `tailwind.config.ts`:
```ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy:   { DEFAULT: '#0B1F3A', 900: '#06122A' },
        crimson:{ DEFAULT: '#A6192E', 700: '#7E1222' },
        cream:  { DEFAULT: '#F5EFE0', 200: '#FAF5E8' },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
```

- [ ] **Step 3: Create `src/styles/theme.ts`**

```ts
export const palette = {
  navy: '#0B1F3A',
  crimson: '#A6192E',
  cream: '#F5EFE0',
} as const;
```

- [ ] **Step 4: Replace `src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root { color-scheme: light; }
html, body, #root { height: 100%; }
body { @apply bg-cream text-navy font-sans antialiased; }
h1, h2, h3, h4 { @apply font-display; }
:focus-visible { @apply outline-2 outline-offset-2 outline-crimson; }
```

- [ ] **Step 5: Smoke-test the theme in `App.tsx`**

Replace `src/App.tsx`:
```tsx
export default function App() {
  return (
    <main className="p-8">
      <h1 className="text-4xl text-crimson">1987 Richmond Sockeyes</h1>
      <p className="mt-2">Theme check.</p>
    </main>
  );
}
```

- [ ] **Step 6: Run dev server to verify**

Run: `npm run dev`
Expected: page renders with Playfair display heading in crimson on cream. Stop the server.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(style): add Tailwind theme with navy/crimson/cream palette"
```

---

## Task 3: Define TypeScript types for data

**Files:** Create `src/types/roster.ts`, `src/types/games.ts`, `src/types/media.ts`.

- [ ] **Step 1: Create `src/types/roster.ts`**

```ts
export type Position = 'F' | 'D' | 'G';
export type RosterRole = 'player' | 'head-coach' | 'assistant-coach' | 'trainer' | 'staff';

export interface SkaterStats { gp: number; g: number; a: number; pts: number; pim: number; }
export interface GoalieStats { gp: number; w: number; l: number; gaa: number; svpct: number; so: number; }

interface BaseEntry {
  id: string;
  name: string;
  hometown: string;
  role: RosterRole;
  number?: number;
  notes?: string;
}
export interface Skater extends BaseEntry { position: 'F' | 'D'; playoffStats: SkaterStats; }
export interface Goalie extends BaseEntry  { position: 'G';       playoffStats: GoalieStats; }
export interface Staff  extends BaseEntry  { position?: undefined; playoffStats?: undefined; }

export type RosterEntry = Skater | Goalie | Staff;
export const isSkater = (e: RosterEntry): e is Skater => e.position === 'F' || e.position === 'D';
export const isGoalie = (e: RosterEntry): e is Goalie => e.position === 'G';
```

- [ ] **Step 2: Create `src/types/games.ts`**

```ts
export type CupSeries = 'Mowat' | 'Doyle' | 'Abbott' | 'Centennial';
export type Round = 'Round-Robin' | 'Semifinal' | 'Final' | 'Game 1' | 'Game 2' | 'Game 3' | 'Game 4' | 'Game 5' | 'Game 6' | 'Game 7';
export type Result = 'W' | 'L' | 'T';

export interface Game {
  id: string;
  date: string;            // ISO YYYY-MM-DD
  series: CupSeries;
  round: Round;
  opponent: string;
  location: string;
  result: Result;
  score: { for: number; against: number };
  highlights: string[];
  sources: string[];       // media ids
}
```

- [ ] **Step 3: Create `src/types/media.ts`**

```ts
export type MediaType = 'newspaper' | 'program' | 'photo' | 'video' | 'document';

export interface MediaItem {
  id: string;
  type: MediaType;
  title: string;
  publication?: string;
  date?: string;           // ISO
  file: string;            // public path
  thumb?: string;
  caption: string;
  tags: string[];
  relatedGames?: string[];
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(types): add roster, games, media TypeScript types"
```

---

## Task 4: Add JSON Schemas and validator

**Files:** Create `src/data/schema/{roster,games,media}.schema.json`, `src/lib/validateData.ts`, `scripts/validate-data.mjs`, `src/lib/validateData.test.ts`.

- [ ] **Step 1: Create `src/data/schema/roster.schema.json`**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "array",
  "items": {
    "type": "object",
    "required": ["id", "name", "hometown", "role"],
    "properties": {
      "id": { "type": "string", "pattern": "^[a-z0-9-]+$" },
      "name": { "type": "string", "minLength": 1 },
      "position": { "enum": ["F", "D", "G"] },
      "number": { "type": "integer", "minimum": 1, "maximum": 99 },
      "hometown": { "type": "string" },
      "role": { "enum": ["player", "head-coach", "assistant-coach", "trainer", "staff"] },
      "notes": { "type": "string" },
      "playoffStats": {
        "oneOf": [
          { "type": "object", "required": ["gp","g","a","pts","pim"],
            "properties": {
              "gp": {"type":"integer","minimum":0}, "g":{"type":"integer","minimum":0},
              "a":  {"type":"integer","minimum":0}, "pts":{"type":"integer","minimum":0},
              "pim":{"type":"integer","minimum":0}
            }, "additionalProperties": false },
          { "type": "object", "required": ["gp","w","l","gaa","svpct","so"],
            "properties": {
              "gp":{"type":"integer","minimum":0}, "w":{"type":"integer","minimum":0},
              "l":{"type":"integer","minimum":0}, "gaa":{"type":"number","minimum":0},
              "svpct":{"type":"number","minimum":0,"maximum":1}, "so":{"type":"integer","minimum":0}
            }, "additionalProperties": false }
        ]
      }
    },
    "additionalProperties": false
  }
}
```

- [ ] **Step 2: Create `src/data/schema/games.schema.json`**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "array",
  "items": {
    "type": "object",
    "required": ["id","date","series","round","opponent","location","result","score","highlights","sources"],
    "properties": {
      "id":       { "type": "string", "pattern": "^[a-z0-9-]+$" },
      "date":     { "type": "string", "format": "date" },
      "series":   { "enum": ["Mowat","Doyle","Abbott","Centennial"] },
      "round":    { "type": "string" },
      "opponent": { "type": "string" },
      "location": { "type": "string" },
      "result":   { "enum": ["W","L","T"] },
      "score": {
        "type": "object", "required": ["for","against"],
        "properties": { "for": {"type":"integer","minimum":0}, "against":{"type":"integer","minimum":0} },
        "additionalProperties": false
      },
      "highlights": { "type": "array", "items": { "type": "string" } },
      "sources":    { "type": "array", "items": { "type": "string" } }
    },
    "additionalProperties": false
  }
}
```

- [ ] **Step 3: Create `src/data/schema/media.schema.json`**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "array",
  "items": {
    "type": "object",
    "required": ["id","type","title","file","caption","tags"],
    "properties": {
      "id":          { "type": "string", "pattern": "^[a-z0-9-]+$" },
      "type":        { "enum": ["newspaper","program","photo","video","document"] },
      "title":       { "type": "string" },
      "publication": { "type": "string" },
      "date":        { "type": "string", "format": "date" },
      "file":        { "type": "string" },
      "thumb":       { "type": "string" },
      "caption":     { "type": "string" },
      "tags":        { "type": "array", "items": { "type": "string" } },
      "relatedGames":{ "type": "array", "items": { "type": "string" } }
    },
    "additionalProperties": false
  }
}
```

- [ ] **Step 4: Create `src/lib/validateData.ts`**

```ts
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import rosterSchema from '../data/schema/roster.schema.json';
import gamesSchema  from '../data/schema/games.schema.json';
import mediaSchema  from '../data/schema/media.schema.json';

const ajv = addFormats(new Ajv({ allErrors: true }));

export const validateRoster = ajv.compile(rosterSchema);
export const validateGames  = ajv.compile(gamesSchema);
export const validateMedia  = ajv.compile(mediaSchema);

export function assertValid<T>(validator: (d: unknown) => boolean, data: unknown, name: string): T {
  if (!validator(data)) {
    const errs = (validator as unknown as { errors: unknown }).errors;
    throw new Error(`Invalid ${name}: ${JSON.stringify(errs, null, 2)}`);
  }
  return data as T;
}
```

Add `"resolveJsonModule": true` and `"esModuleInterop": true` to `tsconfig.json` compilerOptions if not present.

- [ ] **Step 5: Write failing test `src/lib/validateData.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { validateRoster, validateGames, validateMedia, assertValid } from './validateData';

describe('schema validators', () => {
  it('accepts a valid skater', () => {
    const ok = [{ id: 'x', name: 'X', position: 'F', hometown: 'Richmond, BC', role: 'player',
                  playoffStats: { gp:1,g:0,a:0,pts:0,pim:0 } }];
    expect(validateRoster(ok)).toBe(true);
  });
  it('rejects a skater with bad stats', () => {
    const bad = [{ id: 'x', name: 'X', position: 'F', hometown: 'Y', role: 'player',
                   playoffStats: { gp: -1, g:0, a:0, pts:0, pim:0 } }];
    expect(validateRoster(bad)).toBe(false);
  });
  it('accepts a valid game', () => {
    const ok = [{ id:'g1', date:'1987-05-10', series:'Centennial', round:'Final',
                  opponent:'Humboldt', location:'Saskatoon, SK', result:'W',
                  score:{for:5,against:3}, highlights:[], sources:[] }];
    expect(validateGames(ok)).toBe(true);
  });
  it('accepts a valid media item', () => {
    const ok = [{ id:'m1', type:'newspaper', title:'X', file:'/a.jpg', caption:'c', tags:[] }];
    expect(validateMedia(ok)).toBe(true);
  });
  it('assertValid throws on invalid data', () => {
    expect(() => assertValid(validateRoster, [{}], 'roster')).toThrow();
  });
});
```

- [ ] **Step 6: Run tests**

Run: `npm test`
Expected: 5 passing.

- [ ] **Step 7: Create `scripts/validate-data.mjs`**

```js
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ajv = addFormats(new Ajv({ allErrors: true }));
const load = (p) => JSON.parse(readFileSync(resolve(p), 'utf8'));

const pairs = [
  ['src/data/roster.json', 'src/data/schema/roster.schema.json'],
  ['src/data/games.json',  'src/data/schema/games.schema.json'],
  ['src/data/media.json',  'src/data/schema/media.schema.json'],
];

let failed = false;
for (const [dataPath, schemaPath] of pairs) {
  const data = load(dataPath);
  const validate = ajv.compile(load(schemaPath));
  if (!validate(data)) {
    console.error(`FAIL ${dataPath}`, validate.errors);
    failed = true;
  } else {
    console.log(`OK   ${dataPath}`);
  }
}
process.exit(failed ? 1 : 0);
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(data): add JSON schemas and validator"
```

---

## Task 5: Create initial JSON data files (empty, schema-valid)

**Files:** Create `src/data/roster.json`, `src/data/games.json`, `src/data/media.json`.

- [ ] **Step 1: Create `src/data/roster.json`**

```json
[]
```

- [ ] **Step 2: Create `src/data/games.json`**

```json
[]
```

- [ ] **Step 3: Create `src/data/media.json`**

```json
[]
```

- [ ] **Step 4: Run validator**

Run: `npm run validate:data`
Expected: three `OK` lines.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(data): seed empty roster/games/media JSON"
```

---

## Task 6: Data loaders

**Files:** Create `src/lib/loadData.ts`, `src/lib/loadData.test.ts`.

- [ ] **Step 1: Write failing test `src/lib/loadData.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { loadRoster, loadGames, loadMedia } from './loadData';

describe('data loaders', () => {
  it('returns typed arrays', () => {
    expect(Array.isArray(loadRoster())).toBe(true);
    expect(Array.isArray(loadGames())).toBe(true);
    expect(Array.isArray(loadMedia())).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: fail, module not found.

- [ ] **Step 3: Create `src/lib/loadData.ts`**

```ts
import rosterJson from '../data/roster.json';
import gamesJson  from '../data/games.json';
import mediaJson  from '../data/media.json';
import { assertValid, validateRoster, validateGames, validateMedia } from './validateData';
import type { RosterEntry } from '../types/roster';
import type { Game }        from '../types/games';
import type { MediaItem }   from '../types/media';

export const loadRoster = (): RosterEntry[] => assertValid(validateRoster, rosterJson, 'roster');
export const loadGames  = (): Game[]        => assertValid(validateGames,  gamesJson,  'games');
export const loadMedia  = (): MediaItem[]   => assertValid(validateMedia,  mediaJson,  'media');
```

- [ ] **Step 4: Run tests**

Run: `npm test`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(data): add typed loaders with runtime validation"
```

---

## Task 7: Sort helper with tests

**Files:** Create `src/lib/sort.ts`, `src/lib/sort.test.ts`.

- [ ] **Step 1: Write failing test**

```ts
import { describe, it, expect } from 'vitest';
import { sortBy } from './sort';

describe('sortBy', () => {
  const data = [{ n: 'b', v: 2 }, { n: 'a', v: 1 }, { n: 'c', v: 3 }];
  it('sorts numeric ascending', () => {
    expect(sortBy(data, 'v', 'asc').map(d => d.v)).toEqual([1, 2, 3]);
  });
  it('sorts numeric descending', () => {
    expect(sortBy(data, 'v', 'desc').map(d => d.v)).toEqual([3, 2, 1]);
  });
  it('sorts string ascending case-insensitive', () => {
    expect(sortBy(data, 'n', 'asc').map(d => d.n)).toEqual(['a','b','c']);
  });
  it('does not mutate input', () => {
    const input = [...data];
    sortBy(input, 'v', 'desc');
    expect(input.map(d => d.v)).toEqual([2,1,3]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: fail.

- [ ] **Step 3: Implement `src/lib/sort.ts`**

```ts
export type SortDir = 'asc' | 'desc';

export function sortBy<T, K extends keyof T>(rows: T[], key: K, dir: SortDir): T[] {
  const copy = [...rows];
  copy.sort((a, b) => {
    const av = a[key], bv = b[key];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (typeof av === 'number' && typeof bv === 'number') return av - bv;
    return String(av).localeCompare(String(bv), undefined, { sensitivity: 'base' });
  });
  return dir === 'desc' ? copy.reverse() : copy;
}
```

- [ ] **Step 4: Run tests**

Run: `npm test`
Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(lib): add generic sortBy helper"
```

---

## Task 8: `useSortableTable` hook

**Files:** Create `src/hooks/useSortableTable.ts`, `src/hooks/useSortableTable.test.tsx`.

- [ ] **Step 1: Write failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSortableTable } from './useSortableTable';

describe('useSortableTable', () => {
  const rows = [{ n: 'b', v: 2 }, { n: 'a', v: 1 }];
  it('starts with default sort key asc', () => {
    const { result } = renderHook(() => useSortableTable(rows, 'n'));
    expect(result.current.sorted.map(r => r.n)).toEqual(['a','b']);
    expect(result.current.sortKey).toBe('n');
    expect(result.current.sortDir).toBe('asc');
  });
  it('toggles direction when same key clicked twice', () => {
    const { result } = renderHook(() => useSortableTable(rows, 'n'));
    act(() => result.current.toggleSort('n'));
    expect(result.current.sortDir).toBe('desc');
  });
  it('switches to new key with asc direction', () => {
    const { result } = renderHook(() => useSortableTable(rows, 'n'));
    act(() => result.current.toggleSort('v'));
    expect(result.current.sortKey).toBe('v');
    expect(result.current.sortDir).toBe('asc');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: fail.

- [ ] **Step 3: Implement `src/hooks/useSortableTable.ts`**

```ts
import { useMemo, useState, useCallback } from 'react';
import { sortBy, type SortDir } from '../lib/sort';

export function useSortableTable<T, K extends keyof T>(rows: T[], initialKey: K, initialDir: SortDir = 'asc') {
  const [sortKey, setSortKey] = useState<keyof T>(initialKey);
  const [sortDir, setSortDir] = useState<SortDir>(initialDir);

  const toggleSort = useCallback((k: keyof T) => {
    if (k === sortKey) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(k); setSortDir('asc'); }
  }, [sortKey]);

  const sorted = useMemo(() => sortBy(rows, sortKey as K, sortDir), [rows, sortKey, sortDir]);
  return { sorted, sortKey, sortDir, toggleSort };
}
```

- [ ] **Step 4: Run tests**

Run: `npm test`
Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(hooks): add useSortableTable"
```

---

## Task 9: Media filter helper + `useMediaFilters` hook

**Files:** Create `src/lib/filter.ts`, `src/lib/filter.test.ts`, `src/hooks/useMediaFilters.ts`.

- [ ] **Step 1: Write failing test `src/lib/filter.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { filterMedia } from './filter';
import type { MediaItem } from '../types/media';

const items: MediaItem[] = [
  { id:'a', type:'newspaper', title:'A', file:'/a.jpg', caption:'', tags:['centennial-cup'] },
  { id:'b', type:'photo',     title:'B', file:'/b.jpg', caption:'', tags:['banner'] },
  { id:'c', type:'newspaper', title:'C', file:'/c.jpg', caption:'', tags:['abbott-cup'] },
];

describe('filterMedia', () => {
  it('returns all when filters empty', () => {
    expect(filterMedia(items, { types: [], tags: [] })).toHaveLength(3);
  });
  it('filters by type', () => {
    expect(filterMedia(items, { types: ['newspaper'], tags: [] })).toHaveLength(2);
  });
  it('filters by tag', () => {
    expect(filterMedia(items, { types: [], tags: ['banner'] })).toHaveLength(1);
  });
  it('AND across dimensions, OR within', () => {
    expect(filterMedia(items, { types: ['newspaper'], tags: ['centennial-cup','abbott-cup'] })).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: fail.

- [ ] **Step 3: Implement `src/lib/filter.ts`**

```ts
import type { MediaItem, MediaType } from '../types/media';

export interface MediaFilterState { types: MediaType[]; tags: string[]; }

export function filterMedia(items: MediaItem[], f: MediaFilterState): MediaItem[] {
  return items.filter(m => {
    const typeOk = f.types.length === 0 || f.types.includes(m.type);
    const tagOk  = f.tags.length  === 0 || m.tags.some(t => f.tags.includes(t));
    return typeOk && tagOk;
  });
}
```

- [ ] **Step 4: Run tests**

Run: `npm test`
Expected: pass.

- [ ] **Step 5: Implement `src/hooks/useMediaFilters.ts`**

```ts
import { useMemo, useState } from 'react';
import { filterMedia, type MediaFilterState } from '../lib/filter';
import type { MediaItem, MediaType } from '../types/media';

export function useMediaFilters(items: MediaItem[]) {
  const [state, setState] = useState<MediaFilterState>({ types: [], tags: [] });
  const toggleType = (t: MediaType) =>
    setState(s => ({ ...s, types: s.types.includes(t) ? s.types.filter(x => x !== t) : [...s.types, t] }));
  const toggleTag = (t: string) =>
    setState(s => ({ ...s, tags: s.tags.includes(t) ? s.tags.filter(x => x !== t) : [...s.tags, t] }));
  const clear = () => setState({ types: [], tags: [] });
  const filtered = useMemo(() => filterMedia(items, state), [items, state]);
  return { filtered, state, toggleType, toggleTag, clear };
}
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(lib): add media filter + useMediaFilters hook"
```

---

## Task 10: SEO and structured data helpers

**Files:** Create `src/lib/seo.ts`, `src/lib/structuredData.ts`, `src/lib/structuredData.test.ts`.

- [ ] **Step 1: Install helmet**

```bash
npm install react-helmet-async
```

(If installed in Task 1 already, skip.)

- [ ] **Step 2: Create `src/lib/seo.ts`**

```tsx
import { Helmet } from 'react-helmet-async';

export interface SeoProps {
  title: string;
  description: string;
  url?: string;
  image?: string;
  jsonLd?: object;
}

export function Seo({ title, description, url, image, jsonLd }: SeoProps) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {url && <link rel="canonical" href={url} />}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:card" content="summary_large_image" />
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}
```

- [ ] **Step 3: Create `src/lib/structuredData.ts`**

```ts
export function teamStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsTeam',
    name: 'Richmond Sockeyes (1987)',
    sport: 'Ice Hockey',
    award: ['Centennial Cup 1987', 'Abbott Cup 1987', 'Mowat Cup 1987'],
    location: { '@type': 'Place', address: 'Richmond, British Columbia, Canada' },
  };
}

export function gameStructuredData(g: {
  date: string; opponent: string; location: string; score: { for: number; against: number };
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `Richmond Sockeyes vs ${g.opponent}`,
    startDate: g.date,
    location: { '@type': 'Place', name: g.location },
    homeTeam: { '@type': 'SportsTeam', name: 'Richmond Sockeyes' },
    awayTeam: { '@type': 'SportsTeam', name: g.opponent },
  };
}
```

- [ ] **Step 4: Write tests `src/lib/structuredData.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { teamStructuredData, gameStructuredData } from './structuredData';

describe('structured data', () => {
  it('produces SportsTeam JSON-LD', () => {
    const d = teamStructuredData();
    expect(d['@type']).toBe('SportsTeam');
    expect(d.name).toMatch(/Sockeyes/);
  });
  it('produces SportsEvent JSON-LD', () => {
    const d = gameStructuredData({
      date: '1987-05-10', opponent: 'Humboldt Broncos',
      location: 'Saskatoon, SK', score: { for: 5, against: 3 },
    });
    expect(d['@type']).toBe('SportsEvent');
    expect(d.awayTeam.name).toBe('Humboldt Broncos');
  });
});
```

- [ ] **Step 5: Run tests**

Run: `npm test`
Expected: pass.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(lib): add Seo component and structured data builders"
```

---

## Task 11: Layout shell — Header, Nav, Footer, Section

**Files:** Create `src/components/layout/{Header,Nav,Footer,Section}.tsx` and tests.

- [ ] **Step 1: Write failing test `src/components/layout/Header.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Header } from './Header';

describe('Header', () => {
  it('renders team name and nav links', () => {
    render(<MemoryRouter><Header /></MemoryRouter>);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText(/1987 Richmond Sockeyes/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /roster/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /vault/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /banner night/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test` → fail.

- [ ] **Step 3: Create `src/components/layout/Nav.tsx`**

```tsx
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/',             label: 'Home' },
  { to: '/roster',       label: 'Roster' },
  { to: '/vault',        label: 'Vault' },
  { to: '/banner-night', label: 'Banner Night' },
];

export function Nav() {
  return (
    <nav aria-label="Primary">
      <ul className="flex gap-6 text-sm uppercase tracking-widest">
        {links.map(l => (
          <li key={l.to}>
            <NavLink
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `hover:text-crimson ${isActive ? 'text-crimson' : 'text-cream'}`}>
              {l.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

- [ ] **Step 4: Create `src/components/layout/Header.tsx`**

```tsx
import { Link } from 'react-router-dom';
import { Nav } from './Nav';

export function Header() {
  return (
    <header className="bg-navy text-cream">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-display text-xl">1987 Richmond Sockeyes</Link>
        <Nav />
      </div>
    </header>
  );
}
```

- [ ] **Step 5: Create `src/components/layout/Footer.tsx`**

```tsx
export function Footer() {
  return (
    <footer className="bg-navy-900 text-cream/70 mt-24">
      <div className="mx-auto max-w-6xl px-6 py-8 text-sm">
        <p>Richmond Sockeyes — 1987 Centennial Cup Champions. Archive built from newspaper clippings, souvenir programs, and team photographs.</p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 6: Create `src/components/layout/Section.tsx`**

```tsx
import type { PropsWithChildren } from 'react';

export function Section({ id, title, children }: PropsWithChildren<{ id?: string; title?: string }>) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-6 py-16">
      {title && <h2 className="text-3xl mb-6">{title}</h2>}
      {children}
    </section>
  );
}
```

- [ ] **Step 7: Run tests**

Run: `npm test` → pass.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(layout): add Header, Nav, Footer, Section"
```

---

## Task 12: Routing scaffold + placeholder pages

**Files:** Modify `src/App.tsx`, `src/main.tsx`; create `src/pages/{Landing,RosterPage,VaultPage,CupPage,BannerNightPage,NotFound}.tsx`.

- [ ] **Step 1: Create each page as a minimal stub**

`src/pages/Landing.tsx`:
```tsx
export default function Landing() { return <div>Landing</div>; }
```
`src/pages/RosterPage.tsx`:
```tsx
export default function RosterPage() { return <div>Roster</div>; }
```
`src/pages/VaultPage.tsx`:
```tsx
export default function VaultPage() { return <div>Vault</div>; }
```
`src/pages/CupPage.tsx`:
```tsx
import { useParams } from 'react-router-dom';
export default function CupPage() {
  const { cup } = useParams();
  return <div>Cup: {cup}</div>;
}
```
`src/pages/BannerNightPage.tsx`:
```tsx
export default function BannerNightPage() { return <div>Banner Night</div>; }
```
`src/pages/NotFound.tsx`:
```tsx
export default function NotFound() { return <div>Not found</div>; }
```

- [ ] **Step 2: Replace `src/App.tsx`**

```tsx
import { HashRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import Landing from './pages/Landing';
import RosterPage from './pages/RosterPage';
import VaultPage from './pages/VaultPage';
import CupPage from './pages/CupPage';
import BannerNightPage from './pages/BannerNightPage';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <HelmetProvider>
      <HashRouter>
        <Header />
        <main>
          <Routes>
            <Route path="/"              element={<Landing />} />
            <Route path="/roster"        element={<RosterPage />} />
            <Route path="/vault"         element={<VaultPage />} />
            <Route path="/timeline/:cup" element={<CupPage />} />
            <Route path="/banner-night"  element={<BannerNightPage />} />
            <Route path="*"              element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </HashRouter>
    </HelmetProvider>
  );
}
```

- [ ] **Step 3: Verify dev server**

Run: `npm run dev`; manually click each nav link and confirm the route renders. Stop the server.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(router): add HashRouter with page stubs"
```

---

## Task 13: Hero component

**Files:** Create `src/components/hero/Hero.tsx`, `src/components/hero/Hero.test.tsx`; add placeholder asset reference.

- [ ] **Step 1: Add hero image placeholder**

Copy (or create a 1px placeholder at) `public/assets/hero-centennial.jpg`. If you don't yet have a final image, create a 1600×900 navy placeholder. The component must not crash when the image is missing; use `onError` fallback in `Img` later.

Run:
```bash
mkdir -p public/assets
```

- [ ] **Step 2: Write failing test `src/components/hero/Hero.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Hero } from './Hero';

describe('Hero', () => {
  it('renders the championship title and subtitle', () => {
    render(<Hero />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Centennial Cup Champions/i);
    expect(screen.getByText(/1987/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run test** → fail.

- [ ] **Step 4: Implement `src/components/hero/Hero.tsx`**

```tsx
export function Hero() {
  return (
    <section className="relative bg-navy text-cream">
      <img
        src="/1987Sockeyes/assets/hero-centennial.jpg"
        alt="Richmond Sockeyes hoisting the Centennial Cup, May 1987"
        className="absolute inset-0 w-full h-full object-cover opacity-40"
      />
      <div className="relative mx-auto max-w-6xl px-6 py-32 text-center">
        <p className="uppercase tracking-[0.3em] text-crimson text-sm">1987</p>
        <h1 className="font-display text-5xl md:text-7xl mt-4">
          Centennial Cup Champions
        </h1>
        <p className="mt-4 text-lg">Richmond Sockeyes — Mowat · Doyle · Abbott · Centennial</p>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Run tests** → pass.

- [ ] **Step 6: Render Hero in Landing**

Replace `src/pages/Landing.tsx`:
```tsx
import { Hero } from '../components/hero/Hero';
export default function Landing() {
  return <><Hero /></>;
}
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(hero): add championship hero section"
```

---

## Task 14: Timeline components

**Files:** Create `src/components/timeline/{PlayoffTimeline,CupSegment,GameCard}.tsx` + tests.

- [ ] **Step 1: Write failing test `src/components/timeline/PlayoffTimeline.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlayoffTimeline } from './PlayoffTimeline';
import type { Game } from '../../types/games';

const games: Game[] = [
  { id:'g1', date:'1987-03-20', series:'Mowat', round:'Game 1',
    opponent:'Kelowna', location:'Richmond, BC', result:'W',
    score:{for:4,against:2}, highlights:[], sources:[] },
  { id:'g2', date:'1987-05-10', series:'Centennial', round:'Final',
    opponent:'Humboldt Broncos', location:'Saskatoon, SK', result:'W',
    score:{for:5,against:3}, highlights:[], sources:[] },
];

describe('PlayoffTimeline', () => {
  it('renders a segment per cup present', () => {
    render(<PlayoffTimeline games={games} />);
    expect(screen.getByRole('heading', { name: /Mowat Cup/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Centennial Cup/i })).toBeInTheDocument();
  });
  it('renders each game card', () => {
    render(<PlayoffTimeline games={games} />);
    expect(screen.getByText(/Kelowna/)).toBeInTheDocument();
    expect(screen.getByText(/Humboldt Broncos/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test** → fail.

- [ ] **Step 3: Implement `src/components/timeline/GameCard.tsx`**

```tsx
import type { Game } from '../../types/games';

export function GameCard({ game }: { game: Game }) {
  return (
    <article className="border-l-4 border-crimson pl-4 py-3">
      <div className="text-xs uppercase tracking-wider text-navy/60">{game.date} · {game.round}</div>
      <div className="font-display text-lg">vs {game.opponent}</div>
      <div className="text-sm">{game.location}</div>
      <div className={`mt-1 font-semibold ${game.result === 'W' ? 'text-crimson' : 'text-navy/70'}`}>
        {game.result} {game.score.for}–{game.score.against}
      </div>
      {game.highlights.length > 0 && (
        <ul className="mt-2 text-sm list-disc list-inside">
          {game.highlights.map((h, i) => <li key={i}>{h}</li>)}
        </ul>
      )}
    </article>
  );
}
```

- [ ] **Step 4: Implement `src/components/timeline/CupSegment.tsx`**

```tsx
import type { CupSeries, Game } from '../../types/games';
import { GameCard } from './GameCard';

export function CupSegment({ cup, games }: { cup: CupSeries; games: Game[] }) {
  return (
    <div className="mb-12">
      <h3 className="font-display text-2xl mb-4">{cup} Cup</h3>
      <div className="space-y-4">
        {games.map(g => <GameCard key={g.id} game={g} />)}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Implement `src/components/timeline/PlayoffTimeline.tsx`**

```tsx
import type { CupSeries, Game } from '../../types/games';
import { CupSegment } from './CupSegment';

const ORDER: CupSeries[] = ['Mowat', 'Doyle', 'Abbott', 'Centennial'];

export function PlayoffTimeline({ games }: { games: Game[] }) {
  const byCup = new Map<CupSeries, Game[]>();
  for (const g of games) {
    if (!byCup.has(g.series)) byCup.set(g.series, []);
    byCup.get(g.series)!.push(g);
  }
  for (const list of byCup.values()) list.sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div>
      {ORDER.filter(c => byCup.has(c)).map(c => (
        <CupSegment key={c} cup={c} games={byCup.get(c)!} />
      ))}
    </div>
  );
}
```

- [ ] **Step 6: Run tests** → pass.

- [ ] **Step 7: Render in Landing**

Replace `src/pages/Landing.tsx`:
```tsx
import { Hero } from '../components/hero/Hero';
import { Section } from '../components/layout/Section';
import { PlayoffTimeline } from '../components/timeline/PlayoffTimeline';
import { loadGames } from '../lib/loadData';

export default function Landing() {
  const games = loadGames();
  return (
    <>
      <Hero />
      <Section id="timeline" title="The Playoff Path">
        <PlayoffTimeline games={games} />
      </Section>
    </>
  );
}
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(timeline): add PlayoffTimeline, CupSegment, GameCard"
```

---

## Task 15: Roster table

**Files:** Create `src/components/roster/RosterTable.tsx`, test; update `src/pages/RosterPage.tsx`.

- [ ] **Step 1: Write failing test `src/components/roster/RosterTable.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RosterTable } from './RosterTable';
import type { Skater } from '../../types/roster';

const skaters: Skater[] = [
  { id:'a', name:'Adam A', position:'F', hometown:'Richmond, BC', role:'player',
    playoffStats:{ gp:10, g:5, a:7, pts:12, pim:4 } },
  { id:'b', name:'Ben B', position:'D', hometown:'Richmond, BC', role:'player',
    playoffStats:{ gp:10, g:2, a:9, pts:11, pim:6 } },
];

describe('RosterTable skaters', () => {
  it('renders rows', () => {
    render(<RosterTable entries={skaters} />);
    expect(screen.getByText('Adam A')).toBeInTheDocument();
    expect(screen.getByText('Ben B')).toBeInTheDocument();
  });
  it('sorts by points descending when Pts header clicked twice', async () => {
    render(<RosterTable entries={skaters} />);
    const ptsHeader = screen.getByRole('button', { name: /pts/i });
    await userEvent.click(ptsHeader);
    await userEvent.click(ptsHeader);
    const rows = screen.getAllByRole('row').slice(1);
    expect(rows[0]).toHaveTextContent('Adam A');
  });
});
```

- [ ] **Step 2: Run test** → fail.

- [ ] **Step 3: Implement `src/components/roster/RosterTable.tsx`**

```tsx
import { isSkater, isGoalie, type RosterEntry, type Skater, type Goalie } from '../../types/roster';
import { useSortableTable } from '../../hooks/useSortableTable';

function SkaterTable({ rows }: { rows: Skater[] }) {
  const flat = rows.map(s => ({ ...s, ...s.playoffStats }));
  const { sorted, sortKey, sortDir, toggleSort } = useSortableTable(flat, 'pts', 'desc');

  const col = (key: keyof typeof flat[number], label: string) => (
    <th scope="col" className="px-3 py-2 text-left">
      <button onClick={() => toggleSort(key)} aria-sort={sortKey === key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
        {label}{sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
      </button>
    </th>
  );

  return (
    <table className="w-full text-sm">
      <thead className="bg-navy text-cream">
        <tr>
          {col('number', '#')}{col('name', 'Name')}{col('position','Pos')}{col('hometown','Hometown')}
          {col('gp','GP')}{col('g','G')}{col('a','A')}{col('pts','Pts')}{col('pim','PIM')}
        </tr>
      </thead>
      <tbody>
        {sorted.map(r => (
          <tr key={r.id} className="odd:bg-cream even:bg-cream-200">
            <td className="px-3 py-2">{r.number ?? ''}</td>
            <td className="px-3 py-2 font-semibold">{r.name}</td>
            <td className="px-3 py-2">{r.position}</td>
            <td className="px-3 py-2">{r.hometown}</td>
            <td className="px-3 py-2 tabular-nums">{r.gp}</td>
            <td className="px-3 py-2 tabular-nums">{r.g}</td>
            <td className="px-3 py-2 tabular-nums">{r.a}</td>
            <td className="px-3 py-2 tabular-nums font-semibold">{r.pts}</td>
            <td className="px-3 py-2 tabular-nums">{r.pim}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function GoalieTable({ rows }: { rows: Goalie[] }) {
  const flat = rows.map(g => ({ ...g, ...g.playoffStats }));
  const { sorted, sortKey, sortDir, toggleSort } = useSortableTable(flat, 'gaa', 'asc');
  const col = (key: keyof typeof flat[number], label: string) => (
    <th scope="col" className="px-3 py-2 text-left">
      <button onClick={() => toggleSort(key)} aria-sort={sortKey === key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
        {label}{sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
      </button>
    </th>
  );
  return (
    <table className="w-full text-sm mt-8">
      <thead className="bg-navy text-cream">
        <tr>
          {col('number','#')}{col('name','Name')}{col('hometown','Hometown')}
          {col('gp','GP')}{col('w','W')}{col('l','L')}{col('gaa','GAA')}{col('svpct','Sv%')}{col('so','SO')}
        </tr>
      </thead>
      <tbody>
        {sorted.map(r => (
          <tr key={r.id}>
            <td className="px-3 py-2">{r.number ?? ''}</td>
            <td className="px-3 py-2 font-semibold">{r.name}</td>
            <td className="px-3 py-2">{r.hometown}</td>
            <td className="px-3 py-2 tabular-nums">{r.gp}</td>
            <td className="px-3 py-2 tabular-nums">{r.w}</td>
            <td className="px-3 py-2 tabular-nums">{r.l}</td>
            <td className="px-3 py-2 tabular-nums">{r.gaa.toFixed(2)}</td>
            <td className="px-3 py-2 tabular-nums">{r.svpct.toFixed(3)}</td>
            <td className="px-3 py-2 tabular-nums">{r.so}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function RosterTable({ entries }: { entries: RosterEntry[] }) {
  const skaters = entries.filter(isSkater);
  const goalies = entries.filter(isGoalie);
  const staff   = entries.filter(e => e.role !== 'player');

  return (
    <div>
      {skaters.length > 0 && <SkaterTable rows={skaters} />}
      {goalies.length > 0 && <GoalieTable rows={goalies} />}
      {staff.length > 0 && (
        <>
          <h3 className="font-display text-2xl mt-12 mb-4">Coaches & Staff</h3>
          <ul className="grid gap-2 md:grid-cols-2">
            {staff.map(s => (
              <li key={s.id} className="border-l-4 border-crimson pl-3">
                <span className="font-semibold">{s.name}</span> — {s.role.replace('-', ' ')}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run tests** → pass.

- [ ] **Step 5: Wire into `src/pages/RosterPage.tsx`**

```tsx
import { Section } from '../components/layout/Section';
import { RosterTable } from '../components/roster/RosterTable';
import { loadRoster } from '../lib/loadData';

export default function RosterPage() {
  return (
    <Section title="Roster & Playoff Stats">
      <RosterTable entries={loadRoster()} />
    </Section>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(roster): add sortable skater and goalie tables"
```

---

## Task 16: Vault grid, filters, and lightbox

**Files:** Create `src/components/vault/{VaultGrid,MediaCard,MediaLightbox,VaultFilters}.tsx`; update `src/pages/VaultPage.tsx`.

- [ ] **Step 1: Write failing test `src/components/vault/VaultGrid.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VaultGrid } from './VaultGrid';
import type { MediaItem } from '../../types/media';

const items: MediaItem[] = [
  { id:'a', type:'newspaper', title:'Sockeyes Win', file:'/a.jpg', caption:'', tags:['centennial-cup'] },
  { id:'b', type:'photo',     title:'Team Photo', file:'/b.jpg', caption:'', tags:['team'] },
];

describe('VaultGrid', () => {
  it('renders all items by default', () => {
    render(<VaultGrid items={items} />);
    expect(screen.getByText('Sockeyes Win')).toBeInTheDocument();
    expect(screen.getByText('Team Photo')).toBeInTheDocument();
  });
  it('filters by type', async () => {
    render(<VaultGrid items={items} />);
    await userEvent.click(screen.getByRole('button', { name: /^newspaper$/i }));
    expect(screen.getByText('Sockeyes Win')).toBeInTheDocument();
    expect(screen.queryByText('Team Photo')).toBeNull();
  });
});
```

- [ ] **Step 2: Run test** → fail.

- [ ] **Step 3: Implement `src/components/vault/MediaCard.tsx`**

```tsx
import type { MediaItem } from '../../types/media';

export function MediaCard({ item, onOpen }: { item: MediaItem; onOpen: (m: MediaItem) => void }) {
  return (
    <button
      onClick={() => onOpen(item)}
      className="group text-left bg-cream-200 border border-navy/10 hover:border-crimson transition">
      <img
        src={item.thumb ?? item.file}
        alt={item.caption || item.title}
        loading="lazy"
        className="w-full h-48 object-cover" />
      <div className="p-3">
        <div className="text-xs uppercase tracking-wider text-navy/60">{item.type}{item.date ? ` · ${item.date}` : ''}</div>
        <div className="font-semibold group-hover:text-crimson">{item.title}</div>
        {item.publication && <div className="text-sm text-navy/70">{item.publication}</div>}
      </div>
    </button>
  );
}
```

- [ ] **Step 4: Implement `src/components/vault/MediaLightbox.tsx`**

```tsx
import { useEffect } from 'react';
import type { MediaItem } from '../../types/media';

export function MediaLightbox({ item, onClose }: { item: MediaItem | null; onClose: () => void }) {
  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [item, onClose]);

  if (!item) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label={item.title}
         className="fixed inset-0 bg-navy-900/90 flex items-center justify-center p-6 z-50"
         onClick={onClose}>
      <figure className="max-w-5xl max-h-full" onClick={e => e.stopPropagation()}>
        <img src={item.file} alt={item.caption || item.title} className="max-h-[80vh] w-auto mx-auto" />
        <figcaption className="text-cream text-sm mt-3">
          <strong>{item.title}</strong>{item.publication ? ` — ${item.publication}` : ''}{item.date ? ` (${item.date})` : ''}
          <p className="opacity-80">{item.caption}</p>
        </figcaption>
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-crimson text-cream">Close</button>
      </figure>
    </div>
  );
}
```

- [ ] **Step 5: Implement `src/components/vault/VaultFilters.tsx`**

```tsx
import type { MediaType } from '../../types/media';

const TYPES: MediaType[] = ['newspaper','program','photo','video','document'];

export function VaultFilters({
  activeTypes, onToggleType, onClear,
}: {
  activeTypes: MediaType[];
  onToggleType: (t: MediaType) => void;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {TYPES.map(t => {
        const active = activeTypes.includes(t);
        return (
          <button key={t} onClick={() => onToggleType(t)}
            className={`px-3 py-1 text-sm capitalize border ${active ? 'bg-crimson text-cream border-crimson' : 'border-navy/20 text-navy'}`}>
            {t}
          </button>
        );
      })}
      {activeTypes.length > 0 && (
        <button onClick={onClear} className="px-3 py-1 text-sm underline">Clear</button>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Implement `src/components/vault/VaultGrid.tsx`**

```tsx
import { useState } from 'react';
import type { MediaItem } from '../../types/media';
import { useMediaFilters } from '../../hooks/useMediaFilters';
import { MediaCard } from './MediaCard';
import { MediaLightbox } from './MediaLightbox';
import { VaultFilters } from './VaultFilters';

export function VaultGrid({ items }: { items: MediaItem[] }) {
  const { filtered, state, toggleType, clear } = useMediaFilters(items);
  const [open, setOpen] = useState<MediaItem | null>(null);

  return (
    <div>
      <VaultFilters activeTypes={state.types} onToggleType={toggleType} onClear={clear} />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(m => <MediaCard key={m.id} item={m} onOpen={setOpen} />)}
      </div>
      <MediaLightbox item={open} onClose={() => setOpen(null)} />
    </div>
  );
}
```

- [ ] **Step 7: Run tests** → pass.

- [ ] **Step 8: Wire into `src/pages/VaultPage.tsx`**

```tsx
import { Section } from '../components/layout/Section';
import { VaultGrid } from '../components/vault/VaultGrid';
import { loadMedia } from '../lib/loadData';

export default function VaultPage() {
  return (
    <Section title="The Vault">
      <VaultGrid items={loadMedia()} />
    </Section>
  );
}
```

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat(vault): add filterable media grid with lightbox"
```

---

## Task 17: CupPage deep link

**Files:** Replace `src/pages/CupPage.tsx`.

- [ ] **Step 1: Replace `src/pages/CupPage.tsx`**

```tsx
import { useParams, Navigate } from 'react-router-dom';
import { Section } from '../components/layout/Section';
import { CupSegment } from '../components/timeline/CupSegment';
import { loadGames } from '../lib/loadData';
import type { CupSeries } from '../types/games';

const VALID: CupSeries[] = ['Mowat','Doyle','Abbott','Centennial'];

function normalize(s: string | undefined): CupSeries | null {
  if (!s) return null;
  const match = VALID.find(v => v.toLowerCase() === s.toLowerCase());
  return match ?? null;
}

export default function CupPage() {
  const { cup } = useParams();
  const series = normalize(cup);
  if (!series) return <Navigate to="/" replace />;
  const games = loadGames().filter(g => g.series === series).sort((a,b) => a.date.localeCompare(b.date));
  return (
    <Section title={`${series} Cup`}>
      <CupSegment cup={series} games={games} />
    </Section>
  );
}
```

- [ ] **Step 2: Verify dev server**

Run: `npm run dev`; visit `http://localhost:5173/#/timeline/Centennial`. Stop the server.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(router): add cup deep-link page"
```

---

## Task 18: Banner Night page

**Files:** Replace `src/pages/BannerNightPage.tsx`; add `public/assets/banner-night/` folder with placeholders.

- [ ] **Step 1: Create asset folder**

```bash
mkdir -p public/assets/banner-night
```
Place 1+ banner-night photos in this folder (or a 1200×800 placeholder during development).

- [ ] **Step 2: Replace `src/pages/BannerNightPage.tsx`**

```tsx
import { Section } from '../components/layout/Section';

const photos = [
  { src: '/1987Sockeyes/assets/banner-night/photo-1.jpg', alt: 'Banner raising ceremony, 26 September 2025' },
];

export default function BannerNightPage() {
  return (
    <Section title="Banner Night — 26 September 2025">
      <p className="mb-6 max-w-3xl">
        Thirty-eight years after winning the Centennial Cup, the 1987 Richmond Sockeyes
        were honoured with a championship banner raised at Minoru Arena.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map(p => (
          <img key={p.src} src={p.src} alt={p.alt} className="w-full h-64 object-cover" loading="lazy" />
        ))}
      </div>
    </Section>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(pages): add Banner Night page"
```

---

## Task 19: Landing page SEO + full composition

**Files:** Replace `src/pages/Landing.tsx`; confirm helmet root in `src/App.tsx` (already in place from Task 12).

- [ ] **Step 1: Replace `src/pages/Landing.tsx`**

```tsx
import { Hero } from '../components/hero/Hero';
import { Section } from '../components/layout/Section';
import { PlayoffTimeline } from '../components/timeline/PlayoffTimeline';
import { RosterTable } from '../components/roster/RosterTable';
import { VaultGrid } from '../components/vault/VaultGrid';
import { loadGames, loadRoster, loadMedia } from '../lib/loadData';
import { Seo } from '../lib/seo';
import { teamStructuredData } from '../lib/structuredData';

export default function Landing() {
  return (
    <>
      <Seo
        title="1987 Richmond Sockeyes — Centennial Cup Champions"
        description="Permanent archive of the 1987 Richmond Sockeyes: roster, playoff path through the Mowat, Doyle, Abbott, and Centennial Cups, and source newspaper coverage."
        jsonLd={teamStructuredData()}
      />
      <Hero />
      <Section id="timeline" title="The Playoff Path">
        <PlayoffTimeline games={loadGames()} />
      </Section>
      <Section id="roster" title="The Roster">
        <RosterTable entries={loadRoster()} />
      </Section>
      <Section id="vault" title="The Vault">
        <VaultGrid items={loadMedia()} />
      </Section>
    </>
  );
}
```

- [ ] **Step 2: Also add page-level SEO to Roster, Vault, BannerNight, CupPage**

In each, wrap with `<Seo title="..." description="..." />` using page-appropriate strings. Example for `RosterPage.tsx` — add at top of return:
```tsx
<Seo title="Roster — 1987 Richmond Sockeyes"
     description="Players, coaches, and staff of the 1987 Centennial Cup champion Richmond Sockeyes with playoff stats." />
```
Do the equivalent for `VaultPage` ("The Vault — 1987 Richmond Sockeyes Archive"), `BannerNightPage` ("Banner Night — 1987 Richmond Sockeyes"), and `CupPage` using the dynamic `series` in the title/description.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(seo): add page-level Seo across all routes"
```

---

## Task 20: Content transcription — Roster from souvenir programs

**Files:** Modify `src/data/roster.json`; add any roster-sourced images under `public/assets/vault/`.

This is a content task. Each entry must cite its source in `notes` using media ids added in Task 21.

- [ ] **Step 1: Extract roster from Centennial Cup Souvenir Program**

Source: `G:/My Drive/87 Sockeyes/Centennial Cup Souvenir Program/87 Centennial Cup Souvenir Program - Full.pdf`. Read the roster page(s). For each player produce:
```json
{
  "id": "kebab-case-name",
  "name": "First Last",
  "position": "F|D|G",
  "number": 0,
  "hometown": "City, Prov",
  "role": "player",
  "playoffStats": { "gp":0, "g":0, "a":0, "pts":0, "pim":0 }
}
```
Leave `playoffStats` at zeros initially; they'll be filled from box scores.

- [ ] **Step 2: Add coaches and staff**

From the souvenir program and newspaper articles (e.g., Hervey/Romeo article). Each with `role: 'head-coach' | 'assistant-coach' | 'trainer' | 'staff'` and NO `position`, NO `playoffStats`.

- [ ] **Step 3: Validate**

Run: `npm run validate:data`
Expected: `OK src/data/roster.json`.

- [ ] **Step 4: Commit**

```bash
git add src/data/roster.json
git commit -m "data: transcribe roster from Centennial Cup souvenir program"
```

---

## Task 21: Content transcription — Media (newspaper + program thumbnails)

**Files:** Modify `src/data/media.json`; copy images to `public/assets/vault/`.

- [ ] **Step 1: Copy and rename newspaper images**

For each file in `G:/My Drive/87 Sockeyes/Newspaper Articles/*.jpg`, copy to `public/assets/vault/` with a stable kebab-case filename (e.g., `vansun-1987-05-11-centennial-win.jpg`). Do NOT include images that contain personal contact information.

```bash
mkdir -p public/assets/vault/thumbs
# manual copy or scripted; keep filenames deterministic
```

- [ ] **Step 2: Populate `src/data/media.json`**

One entry per clipping:
```json
{
  "id": "vansun-1987-05-11-centennial-win",
  "type": "newspaper",
  "title": "Sockeyes win Centennial Cup",
  "publication": "The Vancouver Sun",
  "date": "1987-05-11",
  "file": "/1987Sockeyes/assets/vault/vansun-1987-05-11-centennial-win.jpg",
  "thumb": "/1987Sockeyes/assets/vault/thumbs/vansun-1987-05-11-centennial-win.jpg",
  "caption": "Factual caption derived from article content (no opinion).",
  "tags": ["centennial-cup","final"],
  "relatedGames": ["1987-05-10-humboldt-final"]
}
```

Also add entries for the three Centennial Cup Souvenir Program PDFs (`type: "program"`).

- [ ] **Step 3: Generate thumbnails**

For each full image, produce a 600px-wide thumb into `public/assets/vault/thumbs/` (manual, or with any image tool). Skip if not available — the `MediaCard` falls back to `file`.

- [ ] **Step 4: Validate**

Run: `npm run validate:data`
Expected: all three OK.

- [ ] **Step 5: Commit**

```bash
git add public/assets/vault src/data/media.json
git commit -m "data: transcribe newspaper and program media metadata"
```

---

## Task 22: Content transcription — Games from box scores

**Files:** Modify `src/data/games.json`.

- [ ] **Step 1: Read every box-score article**

From `G:/My Drive/87 Sockeyes/Newspaper Articles/`, extract each game's date, opponent, location, score, series (Mowat / Doyle / Abbott / Centennial), round. Highlights must be factual (goal scorers, key saves as recorded), never opinion.

- [ ] **Step 2: Populate `src/data/games.json`**

```json
{
  "id": "1987-05-10-humboldt-final",
  "date": "1987-05-10",
  "series": "Centennial",
  "round": "Final",
  "opponent": "Humboldt Broncos",
  "location": "Saskatoon, SK",
  "result": "W",
  "score": { "for": 5, "against": 3 },
  "highlights": ["Sockeyes defeated Humboldt Broncos to win Centennial Cup."],
  "sources": ["vansun-1987-05-11-centennial-win"]
}
```

- [ ] **Step 3: Back-fill player playoff stats in `roster.json`**

Tally goals/assists/PIM per player across all `games.json` highlights where box-score lines were present. Update `roster.json` `playoffStats`. Revalidate.

- [ ] **Step 4: Validate**

Run: `npm run validate:data` → all OK.

- [ ] **Step 5: Commit**

```bash
git add src/data/games.json src/data/roster.json
git commit -m "data: transcribe playoff games and tally player stats"
```

---

## Task 23: Accessibility and performance audit

**Files:** Possible minor edits to components flagged by the audit.

- [ ] **Step 1: Build and preview**

```bash
npm run build
npm run preview
```

- [ ] **Step 2: Run Lighthouse in Chrome DevTools**

Open the preview URL, run a mobile Lighthouse audit. Target: Performance, Accessibility, Best Practices, SEO all ≥ 90.

- [ ] **Step 3: Fix any reported issues**

Common fixes:
- Missing `alt` on an image → add.
- Missing `lang` on `<html>` → set `<html lang="en">` in `index.html`.
- Heading order → renumber headings.
- Color contrast on crimson on cream → darken crimson text by using `crimson-700` utility.

Re-run Lighthouse until targets met.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "fix(a11y,perf): address Lighthouse audit findings"
```

---

## Task 24: CI workflow (tests + data validation)

**Files:** Create `.github/workflows/ci.yml`.

- [ ] **Step 1: Create workflow**

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
      - run: npm run build
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "ci: add test + validation + build workflow"
```

---

## Task 25: GitHub Pages deployment workflow

**Files:** Create `.github/workflows/deploy.yml`.

- [ ] **Step 1: Create workflow**

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run validate:data
      - run: npm test
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Create empty `public/CNAME`**

```bash
touch public/CNAME
```
(Leave empty. When a custom domain is purchased, populate with the domain name.)

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "ci: add GitHub Pages deployment workflow"
```

---

## Task 26: Create GitHub repo and enable Pages

Manual user steps — document in README.

- [ ] **Step 1: Create repo**

On github.com: create a new public repo named `1987Sockeyes` under your account. Do not initialize with README.

- [ ] **Step 2: Push**

```bash
git remote add origin https://github.com/<your-username>/1987Sockeyes.git
git push -u origin main
```

- [ ] **Step 3: Enable Pages**

Repo → Settings → Pages → Source: **GitHub Actions**.

- [ ] **Step 4: Verify deployment**

Wait for workflow to finish. Visit `https://<your-username>.github.io/1987Sockeyes/`.

- [ ] **Step 5: Update README**

Add to `README.md`:
```md
# 1987 Richmond Sockeyes Eternal Archive

Live site: https://<your-username>.github.io/1987Sockeyes/

Static archive built with Vite + React + Tailwind. Data is local JSON; no backend.

## Develop
npm install
npm run dev

## Test
npm test

## Validate data
npm run validate:data

## Build
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add README.md
git commit -m "docs: add README with deploy URL and dev instructions"
git push
```

---

## Plan Complete

At this point the site is live on GitHub Pages with validated data, tests, and CI/CD. Subsequent content additions follow the same flow: edit JSON → `npm run validate:data` → commit → Actions deploys.
