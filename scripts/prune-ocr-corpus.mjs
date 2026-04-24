#!/usr/bin/env node
import { readFileSync, readdirSync, mkdirSync, renameSync, unlinkSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const EXTRACTIONS = 'docs/extractions';
const PRIVATE_OCR = 'src/content/private/ocr';

mkdirSync(PRIVATE_OCR, { recursive: true });

const imageIndex = JSON.parse(readFileSync('src/data/imageIndex.json', 'utf8'));
const cited = new Set(Object.values(imageIndex).map(e => e.filename));

const mdFiles = readdirSync(EXTRACTIONS).filter(f => f.endsWith('.md'));
let moved = 0, deleted = 0;

for (const f of mdFiles) {
  if (cited.has(f)) {
    renameSync(join(EXTRACTIONS, f), join(PRIVATE_OCR, f));
    moved++;
  } else {
    unlinkSync(join(EXTRACTIONS, f));
    deleted++;
  }
}

// Rewrite ocr-all.json with only cited entries (if it exists)
const ocrAllPath = join(EXTRACTIONS, 'ocr-all.json');
if (existsSync(ocrAllPath)) {
  const ocrAll = JSON.parse(readFileSync(ocrAllPath, 'utf8'));
  const citedImageIds = new Set(Object.keys(imageIndex).map(Number));
  const filteredOcr = ocrAll.filter(e => citedImageIds.has(e.imageId));
  writeFileSync(ocrAllPath, JSON.stringify(filteredOcr, null, 2) + '\n');
  console.log(`ocr-all.json now has ${filteredOcr.length} entries (was ${ocrAll.length}).`);
}

console.log(`Moved ${moved} cited files to ${PRIVATE_OCR}.`);
console.log(`Deleted ${deleted} uncited files from ${EXTRACTIONS}.`);
