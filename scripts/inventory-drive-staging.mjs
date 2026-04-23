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
  scrapbookPublic: listFiles(join(DRIVE_ROOT, '_Scrapbook Review', 'Likely Public (photos and artifacts)'), ['.jpg', '.jpeg', '.png', '.pdf']).map(f => ({
    filename: f,
    slugId: 'scrapbook-public-' + slugify(basename(f)),
    date: guessDateFromFilename(f),
    access: 'public',
    type: extname(f).toLowerCase() === '.pdf' ? 'document' : 'photo',
    source: join(DRIVE_ROOT, '_Scrapbook Review', 'Likely Public (photos and artifacts)', f),
  })),
  scrapbookPrivate: listFiles(join(DRIVE_ROOT, '_Scrapbook Review', 'Likely Private (newspaper clippings)'), ['.jpg', '.jpeg', '.png', '.pdf']).map(f => ({
    filename: f,
    slugId: 'scrapbook-private-' + slugify(basename(f)),
    date: guessDateFromFilename(f),
    access: 'private',
    type: extname(f).toLowerCase() === '.pdf' ? 'document' : 'photo',
    source: join(DRIVE_ROOT, '_Scrapbook Review', 'Likely Private (newspaper clippings)', f),
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
