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
