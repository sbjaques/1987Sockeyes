# Archive Public/Private Split — Plan 2: Content Pipeline

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Populate the archive with its real content — 225 private newspaper scans + ~45 private videos + ~74 curated scrapbook items + 4 already-staged HOF photos — plus the scripts that inventory, upload to R2, draft descriptions, and promote into `media.json`. First task hardens the build-time filter so private URLs never leak into the public bundle.

**Architecture:** Plan 1 landed the runtime filter in `loadMedia()`, which is insufficient once private items have real URLs (raw JSON still ships in the bundle). Plan 2 adds a true build-time filter via a Vite plugin that rewrites `src/data/media.json` at bundle time — stripping `url` and `attribution` from private items in the public build before Vite sees the JSON. Then a curation-to-media.json pipeline reads staged files from Google Drive and an R2 bucket, calls Claude API for description drafts, lets the user review, and promotes approved drafts.

**Tech Stack:** Vite 8 plugin, Cloudflare R2 (S3-compatible), AWS SDK v3, Anthropic SDK v0.30+, `rclone` or `@aws-sdk/client-s3` for R2 access, Node 20.

**Spec:** `docs/superpowers/specs/2026-04-22-archive-public-private-split-design.md`
**Prior plan:** `docs/superpowers/plans/2026-04-22-archive-foundation.md`

**Prerequisites (user sets up before Plan 2 execution):**
- Cloudflare account + R2 bucket `1987sockeyes-private` + API token with R2 write scope
- Local env var `R2_ACCESS_KEY_ID` + `R2_SECRET_ACCESS_KEY` + `R2_ACCOUNT_ID` configured for local script runs
- Anthropic API key for description drafting: env var `ANTHROPIC_API_KEY`
- `1987Sockeyes-images` companion repo still public during Plan 2; flips private only at cutover (Plan 3 runbook)

---

## File structure

### Files created
- `vite-plugin-filter-media.ts` — Vite plugin rewriting `media.json` for the public bundle at build time
- `scripts/inventory-drive-staging.mjs` — walks Drive folders, emits canonical item list
- `scripts/upload-private-media-to-r2.mjs` — uploads videos, scans, scrapbook pages to R2
- `scripts/draft-media-descriptions.mjs` — Claude API description drafter
- `scripts/promote-drafts-to-media-json.mjs` — moves approved drafts into `media.json`
- `scripts/prune-ocr-corpus.mjs` — moves 225 cited OCR files to private content, deletes ~2,125 uncited
- `scripts/make-placeholder-video-thumbs.mjs` — generates better placeholder thumbnails (stopgap improvement over Task 14's 332-byte grey JPEG)
- `docs/curation/drafts/` — directory for AI drafts awaiting review
- `docs/curation/private-media-inventory.json` — canonical list of private items (output of inventory-drive-staging)

### Files modified
- `vite.config.ts` — register the new plugin
- `src/lib/filterMediaForBuild.ts` — can be simplified or removed (Vite plugin handles public build; private build passes all data through)
- `src/lib/loadData.ts` — may simplify (if plugin strips private fields at build time, the runtime filter becomes defensive-only)
- `src/data/media.json` — populated to ~390 items after Plan 2 completes
- `docs/extractions/` — pruned from ~2,350 files to 225

### Files moved
- `docs/extractions/<225 cited>.md` → `src/content/private/ocr/<225>.md` (become part of the private build only)

---

## Task 1: Vite plugin for build-time media.json filtering

**Files:**
- Create: `vite-plugin-filter-media.ts` (at repo root)
- Modify: `vite.config.ts`

### Context

Plan 1 introduced `filterMediaForBuild()` in `loadMedia()` at runtime. This stripped `url` and `attribution` from private items before returning them to consumers, but the raw `media.json` is imported as a static JSON module by Vite, so `url` and `attribution` strings still ship in the public bundle and are extractable via DevTools. Plan 2 must harden this BEFORE adding any private items with real URLs.

The fix: a Vite plugin that intercepts the import of `src/data/media.json` and rewrites the JSON at bundle time based on `BUILD_MODE`. In public mode, private items get their `url` and `attribution` fields stripped BEFORE Vite parses the JSON. The filtered JSON never enters the bundle.

### Steps

- [ ] **Step 1: Write the plugin**

Create `vite-plugin-filter-media.ts` at the repo root:

```ts
import type { Plugin } from 'vite';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

type BuildMode = 'public' | 'private';

export function filterMediaPlugin(buildMode: BuildMode): Plugin {
  const mediaJsonPath = resolve(process.cwd(), 'src/data/media.json');
  return {
    name: 'filter-media-json',
    enforce: 'pre',
    load(id) {
      if (id !== mediaJsonPath) return null;
      const raw = readFileSync(mediaJsonPath, 'utf8');
      const items = JSON.parse(raw);
      if (buildMode === 'private') {
        return `export default ${JSON.stringify(items)};`;
      }
      // Public: strip url + attribution from private items
      const filtered = items.map((item: any) =>
        item.access === 'public' ? item : { ...item, url: undefined, attribution: undefined }
      );
      // Delete the undefined keys so they don't appear in the JSON at all
      for (const item of filtered) {
        if (item.url === undefined) delete item.url;
        if (item.attribution === undefined) delete item.attribution;
      }
      return `export default ${JSON.stringify(filtered)};`;
    },
  };
}
```

- [ ] **Step 2: Register in vite.config.ts**

Open `vite.config.ts`. Replace contents with:

```ts
/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { filterMediaPlugin } from './vite-plugin-filter-media';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const buildMode = env.VITE_BUILD_MODE ?? 'public';
  if (buildMode !== 'public' && buildMode !== 'private') {
    throw new Error(`VITE_BUILD_MODE must be 'public' or 'private', got '${buildMode}'`);
  }
  return {
    plugins: [react(), filterMediaPlugin(buildMode)],
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

- [ ] **Step 3: Add a verification test**

Create `scripts/verify-build-filter.mjs`:

```js
#!/usr/bin/env node
// Verifies that the public build strips url + attribution from private items.
// Adds a private item with a distinctive marker string, builds both modes,
// greps both bundles for the marker, confirms public does NOT contain it.

import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const MARKER = 'BUILDFILTERTESTMARKERxyzzy12345';
const mediaPath = 'src/data/media.json';
const original = readFileSync(mediaPath, 'utf8');
const items = JSON.parse(original);

// Insert a private item whose url and attribution contain the marker
const testItem = {
  id: 'build-filter-test-item',
  type: 'photo',
  date: '1987-01-01',
  access: 'private',
  thumb: '/thumb.jpg',
  url: `/r2/private/${MARKER}.jpg`,
  descriptionShort: 'Test item for build-filter verification (temporary).',
  descriptionLong: 'Inserted by scripts/verify-build-filter.mjs to confirm public build strips url and attribution fields from private items. Removed after verification. ' + 'x'.repeat(30),
  attribution: { paper: `${MARKER}-Publisher` },
  tags: ['test'],
};
writeFileSync(mediaPath, JSON.stringify([...items, testItem], null, 2) + '\n');

try {
  execSync('npm run build:public', { stdio: 'inherit' });
  execSync('npm run build:private', { stdio: 'inherit' });

  const publicHasMarker  = execSync(`grep -r "${MARKER}" dist-public/  || true`).toString().trim();
  const privateHasMarker = execSync(`grep -r "${MARKER}" dist-private/ || true`).toString().trim();

  if (publicHasMarker) {
    console.error(`FAIL: public bundle contains marker "${MARKER}":\n${publicHasMarker}`);
    process.exitCode = 1;
  } else {
    console.log('PASS: public bundle does not contain marker string.');
  }
  if (!privateHasMarker) {
    console.error(`FAIL: private bundle does NOT contain marker "${MARKER}" (it should).`);
    process.exitCode = 1;
  } else {
    console.log('PASS: private bundle contains marker (as expected).');
  }
} finally {
  writeFileSync(mediaPath, original); // Always restore original media.json
}
```

- [ ] **Step 4: Run the verification**

Run: `node scripts/verify-build-filter.mjs`
Expected output:
```
PASS: public bundle does not contain marker string.
PASS: private bundle contains marker (as expected).
```

If the public bundle contains the marker, the plugin is NOT working and must be fixed before proceeding.

- [ ] **Step 5: Run the full suite**

Run: `npm test`
Expected: 43/43 (Plan 1 state).

Run: `npm run build:all`
Expected: green.

- [ ] **Step 6: Commit**

```bash
git add vite-plugin-filter-media.ts vite.config.ts scripts/verify-build-filter.mjs
git commit -m "build: Vite plugin strips url+attribution from private items at build time (true security boundary)"
```

---

## Task 2: Inventory script — walk Drive staging folders

**Files:**
- Create: `scripts/inventory-drive-staging.mjs`
- Create (output): `docs/curation/private-media-inventory.json`

### Context

User has already curated three Drive folders. The inventory script reads them and emits the canonical list of items that will be ingested. No AI, just file listing + metadata.

### Steps

- [ ] **Step 1: Write the script**

Create `scripts/inventory-drive-staging.mjs`:

```js
#!/usr/bin/env node
import { readdirSync, statSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, basename, extname } from 'node:path';

const DRIVE_ROOT = process.env.DRIVE_ROOT ?? 'G:/My Drive/87 Sockeyes';
const OUT_PATH = 'docs/curation/private-media-inventory.json';

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/\.[^.]+$/, '')               // strip extension
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function listFiles(dir, exts) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isFile())
    .map(d => d.name)
    .filter(f => exts.some(ext => f.toLowerCase().endsWith(ext)));
}

function guessDateFromFilename(name) {
  // Matches YYYY-MM-DD or YYYY_MM_DD anywhere in name
  const m = name.match(/(\d{4})[-_](\d{2})[-_](\d{2})/);
  if (!m) return undefined;
  return `${m[1]}-${m[2]}-${m[3]}`;
}

const inventory = {
  generated: new Date().toISOString(),
  driveRoot: DRIVE_ROOT,
  videos: listFiles(join(DRIVE_ROOT, '_Video Review', 'Private'), ['.mp4', '.mov', '.m4v']).map(f => ({
    filename: f,
    slugId: 'video-' + slugify(basename(f)),
    date: guessDateFromFilename(f),
    access: 'private',
    type: 'video',
    source: join(DRIVE_ROOT, '_Video Review', 'Private', f),
  })),
  scrapbookPublic: listFiles(join(DRIVE_ROOT, '_Scrapbook Review', 'Likely Public'), ['.jpg', '.jpeg', '.png', '.pdf']).map(f => ({
    filename: f,
    slugId: 'scrapbook-public-' + slugify(basename(f)),
    date: guessDateFromFilename(f),
    access: 'public',
    type: extname(f).toLowerCase() === '.pdf' ? 'document' : 'photo',
    source: join(DRIVE_ROOT, '_Scrapbook Review', 'Likely Public', f),
  })),
  scrapbookPrivate: listFiles(join(DRIVE_ROOT, '_Scrapbook Review', 'Likely Private'), ['.jpg', '.jpeg', '.png', '.pdf']).map(f => ({
    filename: f,
    slugId: 'scrapbook-private-' + slugify(basename(f)),
    date: guessDateFromFilename(f),
    access: 'private',
    type: extname(f).toLowerCase() === '.pdf' ? 'document' : 'photo',
    source: join(DRIVE_ROOT, '_Scrapbook Review', 'Likely Private', f),
  })),
  scans: listFiles(join(DRIVE_ROOT, 'Newspaper Articles', 'by-image-id'), ['.jpg', '.jpeg']).map(f => {
    const imageId = basename(f, extname(f));
    return {
      filename: f,
      slugId: `scan-${imageId}`,
      imageId,
      access: 'private',
      type: 'newspaper',
      source: join(DRIVE_ROOT, 'Newspaper Articles', 'by-image-id', f),
    };
  }),
};

const totalCount =
  inventory.videos.length +
  inventory.scrapbookPublic.length +
  inventory.scrapbookPrivate.length +
  inventory.scans.length;

mkdirSync('docs/curation', { recursive: true });
writeFileSync(OUT_PATH, JSON.stringify(inventory, null, 2) + '\n');

console.log(`Inventory written to ${OUT_PATH}:`);
console.log(`  ${inventory.videos.length} videos`);
console.log(`  ${inventory.scrapbookPublic.length} scrapbook (public)`);
console.log(`  ${inventory.scrapbookPrivate.length} scrapbook (private)`);
console.log(`  ${inventory.scans.length} newspaper scans`);
console.log(`  Total: ${totalCount} items`);
```

- [ ] **Step 2: Run it**

Run: `node scripts/inventory-drive-staging.mjs`
Expected: counts approximately 45 videos, 15 public scrapbook, 59 private scrapbook, 225 scans. Total ≈ 344.

- [ ] **Step 3: Commit**

```bash
git add scripts/inventory-drive-staging.mjs docs/curation/private-media-inventory.json
git commit -m "curation: inventory script + initial inventory of 344 staged private-media items"
```

---

## Task 3: R2 bucket — upload private raw files

**Files:**
- Create: `scripts/upload-private-media-to-r2.mjs`
- Modify: `package.json` (add `@aws-sdk/client-s3` + `@aws-sdk/lib-storage`)

### Context

R2 is S3-compatible. The AWS SDK v3 works directly against R2's endpoint. The upload script reads the inventory, uploads each file, skips files already present with matching checksum.

### Steps

- [ ] **Step 1: Install AWS SDK**

Run: `npm install @aws-sdk/client-s3 @aws-sdk/lib-storage`

- [ ] **Step 2: Write the script**

Create `scripts/upload-private-media-to-r2.mjs`:

```js
#!/usr/bin/env node
import { readFileSync, statSync, createReadStream } from 'node:fs';
import { basename } from 'node:path';
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } = process.env;
if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  console.error('Missing R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY env vars.');
  process.exit(1);
}

const BUCKET = '1987sockeyes-private';
const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
});

const inventory = JSON.parse(readFileSync('docs/curation/private-media-inventory.json', 'utf8'));

async function objectExists(key, sizeBytes) {
  try {
    const r = await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return r.ContentLength === sizeBytes;
  } catch {
    return false;
  }
}

async function uploadOne(key, localPath) {
  const size = statSync(localPath).size;
  if (await objectExists(key, size)) {
    console.log(`skip  ${key} (${size} bytes, already present)`);
    return;
  }
  const upload = new Upload({
    client: s3,
    params: { Bucket: BUCKET, Key: key, Body: createReadStream(localPath) },
  });
  await upload.done();
  console.log(`up    ${key} (${size} bytes)`);
}

async function main() {
  // Videos → r2://1987sockeyes-private/videos/<slugId>.<ext>
  for (const v of inventory.videos) {
    const ext = v.filename.split('.').pop();
    await uploadOne(`videos/${v.slugId}.${ext}`, v.source);
  }
  // Scrapbook (private only → R2; public scrapbook goes into public/assets/vault/ instead)
  for (const s of inventory.scrapbookPrivate) {
    const ext = s.filename.split('.').pop();
    await uploadOne(`scrapbooks/${s.slugId}.${ext}`, s.source);
  }
  // Newspaper scans
  for (const s of inventory.scans) {
    await uploadOne(`scans/${s.imageId}.jpg`, s.source);
  }
  console.log('Done.');
}
main().catch(e => { console.error(e); process.exit(1); });
```

- [ ] **Step 3: Run upload**

Run: `node scripts/upload-private-media-to-r2.mjs`
Expected: ~344 items uploaded. Total ~800 MB (mostly scans). First run takes a while — it's one-time.

Subsequent runs skip items already present.

- [ ] **Step 4: Handle public scrapbook (lighter — they commit to the repo)**

For the ~15 public scrapbook items, they don't go to R2. They land in `public/assets/vault/scrapbook/` the same way the 4 HOF Sequeira photos landed in `public/assets/vault/hof-2025/`. Copy them manually or add a small script step:

```js
// Add at the end of main() in upload-private-media-to-r2.mjs, before 'Done.':
import { mkdirSync, copyFileSync } from 'node:fs';
const localVaultDir = 'public/assets/vault/scrapbook';
mkdirSync(localVaultDir, { recursive: true });
for (const s of inventory.scrapbookPublic) {
  const ext = s.filename.split('.').pop();
  const dest = `${localVaultDir}/${s.slugId}.${ext}`;
  copyFileSync(s.source, dest);
  console.log(`copy  ${dest}`);
}
```

- [ ] **Step 5: Commit**

```bash
git add scripts/upload-private-media-to-r2.mjs package.json package-lock.json public/assets/vault/scrapbook/
git commit -m "curation: upload 329 private items to R2 + copy 15 public scrapbook items into repo"
```

---

## Task 4: AI description drafter

**Files:**
- Create: `scripts/draft-media-descriptions.mjs`
- Create: `docs/curation/drafts/` (directory populated by script output)
- Modify: `package.json` — add `@anthropic-ai/sdk`

### Context

~340 items need `descriptionShort` + `descriptionLong`. Claude API drafts per-item, outputs to `docs/curation/drafts/<slugId>.md`. User reviews in batches, then Task 5 promotes approved drafts.

### Steps

- [ ] **Step 1: Install Anthropic SDK**

Run: `npm install @anthropic-ai/sdk`

- [ ] **Step 2: Write the drafter**

Create `scripts/draft-media-descriptions.mjs`:

```js
#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import Anthropic from '@anthropic-ai/sdk';

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY env var is required.');
  process.exit(1);
}

const client = new Anthropic();
const MODEL = 'claude-opus-4-7';
const DRAFTS_DIR = 'docs/curation/drafts';
mkdirSync(DRAFTS_DIR, { recursive: true });

const inventory = JSON.parse(readFileSync('docs/curation/private-media-inventory.json', 'utf8'));
const roster = JSON.parse(readFileSync('src/data/roster.json', 'utf8'));
const games  = JSON.parse(readFileSync('src/data/games.json', 'utf8'));

// Context pack — roster nicknames + games summary
const contextPack = `
ROSTER (abbreviated):
${roster.map(r => `- ${r.name} (${r.position}${r.number ? ', #'+r.number : ''})${r.nickname ? ' aka "'+r.nickname+'"' : ''}`).join('\n')}

GAMES:
${games.map(g => `- ${g.date} ${g.series}: ${g.opponent} ${g.score} (${g.result})`).join('\n')}
`;

const SYSTEM_PROMPT = `You are drafting archival media descriptions for the 1987 Richmond Sockeyes championship hockey team's website.

Output YAML with exactly these fields:
  descriptionShort: 15-50 words. What the item IS and what it contains. NO paper name, NO byline, NO headline strings. NO image IDs. NO editorializing.
  descriptionLong: 60-300 words. Stands alone without source metadata. Factual-narrative voice. NO adjectives like "stunning" or "heroic". Report facts.
  reviewNotes: empty string OR a brief note flagging any PII (phone, email, street address), possible copyright sensitivity, or ambiguous subject matter. Leave empty if the item is routine.

Rules:
- Descriptions must stand alone; readers may not see attribution.
- If the item is a newspaper scan, describe what the article covers, NOT where it appeared.
- If the item is a video, describe the action/subject, NOT the camera source.
- Factual-narrative voice matches the project; see examples below.

EXAMPLE (good descriptionShort): "Game-7 recap describing Rutherford's overtime winner and the in-game helmet-butt incident between Jaques and McDougall."
EXAMPLE (bad descriptionShort): "Dramatic account of the Sockeyes' heroic comeback in the deciding game."`;

async function draftOne(item, extraContext) {
  const userMessage = `Item metadata:
- slugId: ${item.slugId}
- type: ${item.type}
- date: ${item.date ?? 'unknown'}
- filename: ${item.filename}
- source location: ${item.source}

${extraContext ? 'Additional context:\n' + extraContext : ''}

${contextPack}

Produce the YAML.`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  });
  const text = response.content.map(c => c.type === 'text' ? c.text : '').join('');
  return text;
}

async function main() {
  const all = [
    ...inventory.videos,
    ...inventory.scrapbookPublic,
    ...inventory.scrapbookPrivate,
    ...inventory.scans,
  ];

  const existing = new Set(readdirSync(DRAFTS_DIR).map(f => f.replace(/\.md$/, '')));
  const todo = all.filter(i => !existing.has(i.slugId));

  console.log(`${todo.length} items to draft (${all.length - todo.length} already drafted).`);

  for (let i = 0; i < todo.length; i++) {
    const item = todo[i];
    // For newspaper scans, load OCR text if available
    let extraContext = '';
    if (item.type === 'newspaper' && item.imageId) {
      const ocrPath = `docs/extractions/${item.imageId}.md`;
      if (existsSync(ocrPath)) {
        extraContext = 'OCR text from the scan:\n' + readFileSync(ocrPath, 'utf8').slice(0, 4000);
      }
    }
    try {
      const draft = await draftOne(item, extraContext);
      const outPath = join(DRAFTS_DIR, `${item.slugId}.md`);
      writeFileSync(outPath, `---\nslugId: ${item.slugId}\ntype: ${item.type}\ndate: ${item.date ?? ''}\naccess: ${item.access}\nsource: ${item.source}\n---\n\n${draft}\n`);
      console.log(`[${i + 1}/${todo.length}] drafted ${item.slugId}`);
    } catch (e) {
      console.error(`[${i + 1}/${todo.length}] FAILED ${item.slugId}: ${e.message}`);
    }
  }
}
main().catch(e => { console.error(e); process.exit(1); });
```

- [ ] **Step 3: Run the drafter (first pass)**

Run: `node scripts/draft-media-descriptions.mjs`
Expected: ~340 draft files in `docs/curation/drafts/`. Cost ~$5-15 at Claude pricing.

- [ ] **Step 4: Commit drafts (for user review)**

```bash
git add scripts/draft-media-descriptions.mjs package.json package-lock.json docs/curation/drafts/
git commit -m "curation: AI-draft descriptions for all staged private-media items (review pass pending)"
```

---

## Task 5: User review + promote drafts

**Files:**
- Modify: `docs/curation/drafts/*.md` (user edits inline)
- Create: `scripts/promote-drafts-to-media-json.mjs`

### Context

User reviews drafts. Rejected drafts: delete the file. Approved drafts: edit inline if needed, then promote. The promotion script reads the draft files, parses frontmatter + YAML, emits new entries into `media.json`.

### Steps

- [ ] **Step 1: User review pass**

User reads `docs/curation/drafts/*.md` and edits any drafts that need changes. For each draft:
- Good description? Leave it.
- Bad description? Edit inline OR delete the file to skip this item entirely.
- PII flagged in `reviewNotes`? Decide: redact, reclassify to private, or delete.
- Bill Reid letter (per spec): ensure this item has `access: private`.

This is a multi-day human pass. Not scripted.

- [ ] **Step 2: Write promotion script**

Create `scripts/promote-drafts-to-media-json.mjs`:

```js
#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DRAFTS_DIR = 'docs/curation/drafts';
const mediaPath = 'src/data/media.json';
const items = JSON.parse(readFileSync(mediaPath, 'utf8'));
const byId = new Map(items.map(i => [i.id, i]));

function parseDraft(filename) {
  const raw = readFileSync(join(DRAFTS_DIR, filename), 'utf8');
  // Frontmatter block
  const fm = raw.match(/^---\n([\s\S]*?)\n---\n/);
  if (!fm) return null;
  const meta = Object.fromEntries(
    fm[1].split('\n').map(l => { const [k, ...v] = l.split(':'); return [k.trim(), v.join(':').trim()]; })
  );
  // YAML block (descriptionShort, descriptionLong, reviewNotes)
  const body = raw.slice(fm[0].length);
  const yamlFields = {};
  for (const field of ['descriptionShort', 'descriptionLong', 'reviewNotes']) {
    const m = body.match(new RegExp(`${field}:\\s*(.+?)(?=\\n\\w+:|$)`, 's'));
    if (m) yamlFields[field] = m[1].trim().replace(/^[>|]\s*/, '').replace(/\n\s+/g, ' ').trim();
  }
  return { meta, yamlFields };
}

const drafts = readdirSync(DRAFTS_DIR).filter(f => f.endsWith('.md'));
let added = 0, updated = 0, skipped = 0;

for (const filename of drafts) {
  const parsed = parseDraft(filename);
  if (!parsed) { skipped++; continue; }
  const { meta, yamlFields } = parsed;
  if (!yamlFields.descriptionShort || !yamlFields.descriptionLong) {
    console.warn(`Skipping ${filename}: missing required fields.`);
    skipped++;
    continue;
  }

  // Build the MediaItem based on meta.type + meta.slugId
  const id = meta.slugId;
  const baseItem = {
    id,
    type: meta.type,
    date: meta.date || '1987-01-01',
    access: meta.access,
    thumb: `/assets/vault/thumbs/${id}.jpg`, // thumb generation is a separate step; for now assume this path
    descriptionShort: yamlFields.descriptionShort,
    descriptionLong:  yamlFields.descriptionLong,
    tags: [],
  };

  // Add URL based on access + source type
  if (meta.access === 'private' && meta.source) {
    if (meta.type === 'video') {
      baseItem.url = `r2://1987sockeyes-private/videos/${id}.${meta.source.split('.').pop()}`;
    } else if (meta.type === 'newspaper' && meta.slugId.startsWith('scan-')) {
      const imageId = meta.slugId.replace('scan-', '');
      baseItem.url = `r2://1987sockeyes-private/scans/${imageId}.jpg`;
      baseItem.attribution = { imageId };
    } else {
      baseItem.url = `r2://1987sockeyes-private/scrapbooks/${id}.${meta.source.split('.').pop()}`;
    }
  } else if (meta.access === 'public' && meta.source) {
    baseItem.url = `/assets/vault/scrapbook/${id}.${meta.source.split('.').pop()}`;
  }

  if (byId.has(id)) {
    Object.assign(byId.get(id), baseItem);
    updated++;
  } else {
    items.push(baseItem);
    byId.set(id, baseItem);
    added++;
  }
}

writeFileSync(mediaPath, JSON.stringify(items, null, 2) + '\n');
console.log(`Promoted: ${added} added, ${updated} updated, ${skipped} skipped.`);
```

Note: the `r2://` URL scheme is a marker for the private build; it is not directly fetchable by browsers. Task 7 (below) wires in a redirect from `archive.87sockeyes.win/media/*` to a CF Worker that resolves R2 keys. For Plan 2's scope, the media.json URLs can be `r2://` placeholders; Plan 3's cutover wires the resolution.

- [ ] **Step 3: Run promotion**

Run: `node scripts/promote-drafts-to-media-json.mjs`
Expected: `Promoted: ~340 added, 0 updated, 0 skipped` (or similar).

Run: `npm run validate:data`
Expected: passes.

Run: `npm test`
Expected: 43/43.

Run: `node scripts/verify-build-filter.mjs`
Expected: PASS both bundles — public has no `r2://` URLs of private items.

- [ ] **Step 4: Commit**

```bash
git add docs/curation/drafts/ scripts/promote-drafts-to-media-json.mjs src/data/media.json
git commit -m "curation: promote ~340 approved drafts into media.json (60 → ~400 items)"
```

---

## Task 6: CF Worker for R2 URL resolution (private build only)

**Files:**
- Create: `cf-worker/archive-media-resolver.js`
- Create: `cf-worker/wrangler.toml`

### Context

Private build's `media.json` has URLs like `r2://1987sockeyes-private/videos/abc.mp4`. The browser can't fetch those directly. Options:
- Pre-sign URLs at build time (expires — bad for static site)
- CF Worker at `archive.87sockeyes.win/media/*` that takes a path, pulls from R2, streams back

Going with CF Worker. The Worker runs behind the same Cloudflare Access policy as the archive site, so only authenticated users can fetch media.

### Steps

- [ ] **Step 1: Create worker source**

Create `cf-worker/archive-media-resolver.js`:

```js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // URL like /media/videos/abc.mp4 → key = 'videos/abc.mp4'
    const match = url.pathname.match(/^\/media\/(.+)$/);
    if (!match) return new Response('Not found', { status: 404 });
    const key = match[1];

    const object = await env.R2.get(key);
    if (!object) return new Response('Not found', { status: 404 });

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('cache-control', 'private, max-age=3600');
    return new Response(object.body, { headers });
  },
};
```

- [ ] **Step 2: Create wrangler config**

Create `cf-worker/wrangler.toml`:

```toml
name = "sockeyes-archive-media"
main = "archive-media-resolver.js"
compatibility_date = "2026-04-22"

[[r2_buckets]]
binding = "R2"
bucket_name = "1987sockeyes-private"

[triggers]
crons = []

# Deploy with: wrangler deploy
# Route via CF dashboard: archive.87sockeyes.win/media/* → this worker
# Access policy: apply the same Cloudflare Access policy as the archive page so the worker requires sign-in.
```

- [ ] **Step 3: Update media.json URLs + private-build to use /media/ path**

Modify `scripts/promote-drafts-to-media-json.mjs`: change `r2://1987sockeyes-private/` to `/media/` in the URL synthesis. Re-run promotion with the corrected script so all private items use `/media/videos/<id>.mp4` style URLs that route through the Worker.

- [ ] **Step 4: Commit worker**

```bash
git add cf-worker/
git commit -m "infra: CF Worker resolves /media/* → R2 objects for authenticated private site"
```

The actual worker deployment (`wrangler deploy`) is runbook territory — see `docs/superpowers/runbooks/archive-cutover.md`.

---

## Task 7: OCR corpus prune

**Files:**
- Create: `scripts/prune-ocr-corpus.mjs`
- Modify (moved): 225 files from `docs/extractions/` → `src/content/private/ocr/`
- Delete: ~2,125 uncited files from `docs/extractions/`

### Context

`docs/extractions/` currently has ~2,350 OCR markdown files, scraped from newspapers.com during the 2026-04-13 bulk OCR harvest. Only 225 of these are cited by any bio/game/highlight (tracked in `src/data/imageIndex.json`). The uncited ~2,125 files are noise — remove them. The 225 cited files move to `src/content/private/ocr/` (private-build only).

### Steps

- [ ] **Step 1: Write the script**

Create `scripts/prune-ocr-corpus.mjs`:

```js
#!/usr/bin/env node
import { readFileSync, readdirSync, mkdirSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const EXTRACTIONS = 'docs/extractions';
const PRIVATE_OCR = 'src/content/private/ocr';

mkdirSync(PRIVATE_OCR, { recursive: true });

const imageIndex = JSON.parse(readFileSync('src/data/imageIndex.json', 'utf8'));
const cited = new Set(Object.keys(imageIndex));

const mdFiles = readdirSync(EXTRACTIONS).filter(f => f.endsWith('.md'));
let moved = 0, deleted = 0;

for (const f of mdFiles) {
  const id = f.replace(/\.md$/, '');
  if (cited.has(id)) {
    renameSync(join(EXTRACTIONS, f), join(PRIVATE_OCR, f));
    moved++;
  } else {
    unlinkSync(join(EXTRACTIONS, f));
    deleted++;
  }
}

// Rewrite ocr-all.json with only cited entries
const ocrAll = JSON.parse(readFileSync(join(EXTRACTIONS, 'ocr-all.json'), 'utf8'));
const filteredOcr = ocrAll.filter(e => cited.has(e.imageId));
writeFileSync(join(EXTRACTIONS, 'ocr-all.json'), JSON.stringify(filteredOcr, null, 2) + '\n');

console.log(`Moved ${moved} cited files to ${PRIVATE_OCR}.`);
console.log(`Deleted ${deleted} uncited files from ${EXTRACTIONS}.`);
console.log(`ocr-all.json now has ${filteredOcr.length} entries (was ${ocrAll.length}).`);
```

- [ ] **Step 2: Run + commit**

Run: `node scripts/prune-ocr-corpus.mjs`
Expected: ~225 moved, ~2,125 deleted.

Commit:
```bash
git add scripts/prune-ocr-corpus.mjs docs/extractions src/content/private/ocr
git commit -m "curation: prune OCR corpus — move 225 cited to private content, delete 2,125 uncited"
```

---

## Task 8: Full-site verification after content pipeline

**Files:** none — verification only.

- [ ] **Step 1: Validate + test + build**

```bash
npm run validate:data     # OK
npm test                  # 43/43
npm run build:public      # green
npm run build:private     # green
node scripts/verify-build-filter.mjs   # PASS both
```

- [ ] **Step 2: Bundle inspection**

```bash
# Private URL strings absent from public bundle?
grep -c "r2://1987sockeyes-private\|/media/videos\|/media/scans" dist-public/assets/*.js
# Expected: 0
grep -c "r2://1987sockeyes-private\|/media/videos\|/media/scans" dist-private/assets/*.js
# Expected: > 0 (private items reference the /media/ paths)
```

- [ ] **Step 3: Dev server smoke**

```bash
npm run dev                    # public mode
# Click through /vault, /#/hall-of-fame — private items render as locked cards
# Click a private card — LockedLightbox opens, no URL visible

# Kill and restart in private mode
npm run dev:private
# Same clicks — private items open the full lightbox (though media won't actually load from CF Worker until deployment)
```

- [ ] **Step 4: Commit (only if fixes needed)**

---

## Notes for the implementing agent

### Drive access

Tasks 2 and 3 require `G:/My Drive/87 Sockeyes/` to be mounted. If running in CI or a headless environment, set the `DRIVE_ROOT` env var to a local copy path, or skip those tasks and run them from the user's workstation.

### R2 upload cost

Cloudflare R2 charges for egress only; uploads are free. Storage is ~$0.015/GB/month. At ~800 MB, cost is ~$0.012/month. Negligible.

### Claude API cost

Task 4 costs ~$5-15 for the full 340-item draft. Budget accordingly.

### Build-filter discipline

Task 1's plugin is the true security boundary. Every subsequent task must preserve it. Never bypass the plugin — no separate imports of the raw `media.json` in source code. If additional consumers are added, audit them to ensure they go through `loadMedia()` which goes through the plugin-transformed module.

### Private URL scheme

The `r2://` prefix in media.json (after Task 5) is replaced by `/media/` (after Task 6) to align with the CF Worker route. The private build's `r2://` scheme is never actually fetched — it's just a placeholder that becomes `/media/` relative URLs when the worker is wired up.
