#!/usr/bin/env node
/**
 * Upload every item in docs/curation/private-media-inventory.json to R2.
 *
 * Key scheme (the CF Worker strips /media/ and reads this):
 *   videos/<filename>       for type='video'
 *   scans/<imageId>.jpg     for type='newspaper'
 *   scrapbook/<filename>    for type='scrapbook' (public or private — access decides visibility in UI)
 *
 * Resumable: HEADs each key first; skips anything already uploaded with matching size.
 *
 * Reads creds from .env.local OR from env vars directly:
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  S3Client,
  HeadObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

// --- load .env.local if present, merge into process.env ---
const envPath = path.join(root, '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf-8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const {
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET = '1987sockeyes-private',
} = process.env;

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  console.error('Missing R2 creds. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY in .env.local or env.');
  process.exit(1);
}

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

const contentTypeByExt = {
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.mkv': 'video/x-matroska',
  '.webm': 'video/webm',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.pdf': 'application/pdf',
  '.heic': 'image/heic',
};

function r2KeyFor(item) {
  if (item.type === 'video') return `videos/${item.filename}`;
  if (item.type === 'newspaper') return `scans/${item.imageId}.jpg`;
  if (item.type === 'scrapbook') return `scrapbook/${item.filename}`;
  throw new Error(`Unknown type: ${item.type} (${item.slugId})`);
}

async function headKey(key) {
  try {
    const r = await s3.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    return { exists: true, size: Number(r.ContentLength || 0) };
  } catch (err) {
    if (err?.$metadata?.httpStatusCode === 404 || err?.name === 'NotFound') {
      return { exists: false };
    }
    throw err;
  }
}

async function uploadOne(item) {
  const key = r2KeyFor(item);
  const src = item.source;

  if (!fs.existsSync(src)) {
    return { key, skipped: true, reason: 'source-missing' };
  }

  const stat = fs.statSync(src);
  const head = await headKey(key);
  if (head.exists && head.size === stat.size) {
    return { key, skipped: true, reason: 'already-uploaded', size: stat.size };
  }

  const ext = path.extname(src).toLowerCase();
  const body = fs.createReadStream(src);

  await s3.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: body,
    ContentType: contentTypeByExt[ext] || 'application/octet-stream',
    ContentLength: stat.size,
  }));

  return { key, uploaded: true, size: stat.size };
}

function fmtBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

async function main() {
  const inventory = JSON.parse(
    fs.readFileSync(path.join(root, 'docs/curation/private-media-inventory.json'), 'utf-8')
  );

  const all = [
    ...(inventory.videos || []),
    ...(inventory.publicScrapbook || []),
    ...(inventory.privateScrapbook || []),
    ...(inventory.scans || []),
  ];

  console.log(`Inventory: ${all.length} items`);
  console.log(`Bucket:    ${R2_BUCKET}`);
  console.log('');

  let uploaded = 0, skipped = 0, missing = 0, bytes = 0;
  const started = Date.now();

  for (let i = 0; i < all.length; i++) {
    const item = all[i];
    const prefix = `[${String(i + 1).padStart(3)}/${all.length}]`;
    try {
      const r = await uploadOne(item);
      if (r.uploaded) {
        uploaded++;
        bytes += r.size;
        console.log(`${prefix} ✓ ${r.key} (${fmtBytes(r.size)})`);
      } else if (r.skipped && r.reason === 'already-uploaded') {
        skipped++;
        console.log(`${prefix} · ${r.key} — already uploaded`);
      } else if (r.skipped && r.reason === 'source-missing') {
        missing++;
        console.log(`${prefix} ! ${r.key} — source missing: ${item.source}`);
      }
    } catch (err) {
      console.error(`${prefix} ✗ ${item.slugId} — ${err.message}`);
    }
  }

  const secs = Math.round((Date.now() - started) / 1000);
  console.log('');
  console.log(`Done in ${secs}s — uploaded: ${uploaded}, skipped: ${skipped}, missing: ${missing}, bytes sent: ${fmtBytes(bytes)}`);
}

main().catch(err => { console.error(err); process.exit(1); });
