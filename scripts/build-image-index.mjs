#!/usr/bin/env node
// Generate src/data/imageIndex.json — per referenced image ID, records the
// local OCR filename and whether a full-page JPG has been archived to the
// companion repo 1987Sockeyes-images. Runs as a prebuild step.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const extractionsDir = path.join(root, 'docs/extractions');
const rosterPath = path.join(root, 'src/data/roster.json');
const gamesPath = path.join(root, 'src/data/games.json');
const outPath = path.join(root, 'src/data/imageIndex.json');
// Sibling repo on disk (optional). If present, we mark IDs whose <id>.jpg
// has been archived there. If absent, the script still works — just no
// image flags.
const IMAGES_REPO_DIR = path.join(root, '..', '1987Sockeyes-images');

const filenameById = {};
const dateById = {};
for (const f of fs.readdirSync(extractionsDir)) {
  if (!f.endsWith('.md')) continue;
  const m = f.match(/^(\d{4}-\d{2}-\d{2})-.*-i(\d{7,})\.md$/);
  if (m) {
    filenameById[m[2]] = f;
    dateById[m[2]] = m[1];
  }
}

const archivedImages = new Set();
if (fs.existsSync(IMAGES_REPO_DIR)) {
  for (const f of fs.readdirSync(IMAGES_REPO_DIR)) {
    const m = f.match(/^(\d{7,})\.jpg$/);
    if (m) archivedImages.add(m[1]);
  }
}

const referenced = new Set();
function scan(text) {
  if (!text) return;
  for (const m of text.matchAll(/\d{7,}/g)) referenced.add(m[0]);
}
const roster = JSON.parse(fs.readFileSync(rosterPath, 'utf8'));
for (const p of roster) { scan(p.bio); scan(p.programBio); }
const games = JSON.parse(fs.readFileSync(gamesPath, 'utf8'));
for (const g of games) for (const h of g.highlights) scan(h);

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
