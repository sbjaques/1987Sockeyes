#!/usr/bin/env node
// Generate src/data/imageIndex.json — per referenced image ID, records the
// local OCR filename, publication date (from the filename prefix), and
// whether a full-page JPG has been archived to the companion repo
// 1987Sockeyes-images. Runs as a prebuild step.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Private OCR corpus is the source of truth; the old docs/extractions path
// is kept as a secondary scan location in case any stray files remain.
const ocrDirs = [
  path.join(root, 'src/content/private/ocr'),
  path.join(root, 'docs/extractions'),
];
const rosterPath = path.join(root, 'src/data/roster.json');
const gamesPath = path.join(root, 'src/data/games.json');
const mediaPath = path.join(root, 'src/data/media.json');
const outPath = path.join(root, 'src/data/imageIndex.json');
const IMAGES_REPO_DIR = path.join(root, '..', '1987Sockeyes-images');

const filenameById = {};
const dateById = {};
for (const dir of ocrDirs) {
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.md')) continue;
    const m = f.match(/^(\d{4}-\d{2}-\d{2})-.+-i(\d{7,})\.md$/);
    if (m) {
      filenameById[m[2]] = f;
      dateById[m[2]] = m[1];
      continue;
    }
    const n = f.match(/-i(\d{7,})\.md$/);
    if (n) filenameById[n[1]] = f;
  }
}

const archivedImages = new Set();
// Source 1: companion images repo on disk (public tier cutover source)
const imagesRepoCandidates = [
  IMAGES_REPO_DIR,
  path.join(root, '..', '..', '1987Sockeyes-images'), // worktree sibling
];
for (const dir of imagesRepoCandidates) {
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir)) {
    const m = f.match(/^(\d{7,})\.jpg$/);
    if (m) archivedImages.add(m[1]);
  }
  break;
}
// Source 2: private media inventory — any scan we uploaded to R2 is archived
// for the private tier (served via /media/scans/<id>.jpg through the Worker).
const inventoryPath = path.join(root, 'docs/curation/private-media-inventory.json');
if (fs.existsSync(inventoryPath)) {
  const inv = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
  for (const scan of inv.scans || []) if (scan.imageId) archivedImages.add(scan.imageId);
}

const referenced = new Set();
function scan(text) {
  if (!text) return;
  for (const m of text.matchAll(/\d{7,}/g)) referenced.add(m[0]);
}
const roster = JSON.parse(fs.readFileSync(rosterPath, 'utf8'));
for (const p of roster) { scan(p.bio); scan(p.programBio); }
const games = JSON.parse(fs.readFileSync(gamesPath, 'utf8'));
for (const g of games) for (const h of g.highlights || []) scan(h);
const media = JSON.parse(fs.readFileSync(mediaPath, 'utf8'));
for (const m of media) if (m.attribution?.imageId) referenced.add(m.attribution.imageId);

const entries = {};
let missingOcr = 0, withImage = 0;
for (const id of referenced) {
  const filename = filenameById[id];
  if (!filename) { missingOcr++; continue; }
  const image = archivedImages.has(id);
  if (image) withImage++;
  const date = dateById[id];
  const entry = { filename };
  if (date) entry.date = date;
  if (image) entry.image = true;
  entries[id] = entry;
}

const sorted = Object.fromEntries(Object.keys(entries).sort().map(k => [k, entries[k]]));
fs.writeFileSync(outPath, JSON.stringify(sorted, null, 2) + '\n');
console.log(`image index: ${Object.keys(sorted).length} referenced IDs, ${withImage} with archived JPG, ${missingOcr} with no matching OCR file`);
