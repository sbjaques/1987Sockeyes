#!/usr/bin/env node
// Generate src/data/imageIndex.json — a map of image ID → extraction filename,
// limited to the IDs actually referenced in roster bios and game highlights.
// Runs as a prebuild step; also a prevalidate step to keep the index in sync.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const extractionsDir = path.join(root, 'docs/extractions');
const rosterPath = path.join(root, 'src/data/roster.json');
const gamesPath = path.join(root, 'src/data/games.json');
const outPath = path.join(root, 'src/data/imageIndex.json');

const filenameById = {};
for (const f of fs.readdirSync(extractionsDir)) {
  if (!f.endsWith('.md')) continue;
  const m = f.match(/-i(\d{7,})\.md$/);
  if (m) filenameById[m[1]] = f;
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

const filtered = {};
let missing = 0;
for (const id of referenced) {
  if (filenameById[id]) filtered[id] = filenameById[id];
  else missing++;
}

const sorted = Object.fromEntries(Object.keys(filtered).sort().map(k => [k, filtered[k]]));
fs.writeFileSync(outPath, JSON.stringify(sorted, null, 2) + '\n');
console.log(`image index: ${Object.keys(sorted).length} referenced IDs written (${missing} referenced IDs not found in docs/extractions)`);
