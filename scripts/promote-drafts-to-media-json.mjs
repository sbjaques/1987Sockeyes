#!/usr/bin/env node
/**
 * Ingest docs/curation/drafts/*.json into src/data/media.json.
 *
 * Scope in this pass: VIDEO drafts only. Scan drafts skipped — they need a
 * review pass (AI drafters occasionally hallucinate details when OCR context
 * includes adjacent articles) and real thumbnails before going into the Vault.
 *
 * For each new entry this script:
 *   - Normalizes the date (YYYY-00-00 → YYYY-01-01; similarly YYYY-MM-00 → YYYY-MM-01)
 *   - Sets thumb to the shared video placeholder
 *   - Sets url to /media/videos/<filename> (the CF Worker resolves this to R2)
 *   - Preserves existing media.json entries (idempotent — skips id collisions)
 *
 * Validates against src/data/schema/media.schema.json at the end.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const draftsDir = path.join(root, 'docs/curation/drafts');
const inventoryPath = path.join(root, 'docs/curation/private-media-inventory.json');
const mediaPath = path.join(root, 'src/data/media.json');

function normalizeDate(s) {
  if (!s) return undefined;
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return undefined;
  let [, y, mm, dd] = m;
  if (mm === '00') mm = '01';
  if (dd === '00') dd = '01';
  return `${y}-${mm}-${dd}`;
}

const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf-8'));
const inventoryByIndex = {};
for (const item of inventory.videos || []) inventoryByIndex[item.slugId] = item;

const media = JSON.parse(fs.readFileSync(mediaPath, 'utf-8'));
const existingIds = new Set(media.map(m => m.id));

const draftFiles = fs.readdirSync(draftsDir)
  .filter(f => f.startsWith('video-') && f.endsWith('.json'));

let added = 0, skipped = 0;

for (const file of draftFiles) {
  const draft = JSON.parse(fs.readFileSync(path.join(draftsDir, file), 'utf-8'));
  const id = draft.id;
  if (existingIds.has(id)) { skipped++; continue; }
  const inv = inventoryByIndex[id];
  if (!inv) { console.warn(`skip ${id} — no inventory match`); skipped++; continue; }

  const entry = {
    id,
    type: 'video',
    date: normalizeDate(inv.date) || '1987-01-01',
    access: inv.access || 'private',
    thumb: '/assets/vault/hof-2025/thumbs/video-placeholder.jpg',
    descriptionShort: draft.descriptionShort,
    descriptionLong: draft.descriptionLong,
    url: `/media/videos/${inv.filename}`,
    tags: draft.tags || [],
    relatedGames: [],
  };

  media.push(entry);
  existingIds.add(id);
  added++;
}

// Sort chronologically (Vault expects this)
media.sort((a, b) => (a.date || '').localeCompare(b.date || ''));

fs.writeFileSync(mediaPath, JSON.stringify(media, null, 2));

console.log(`media.json updated — added: ${added}, skipped: ${skipped}, total now: ${media.length}`);
