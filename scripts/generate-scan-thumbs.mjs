#!/usr/bin/env node
/**
 * Generate ~480px-wide JPG thumbs for every newspaper scan in the inventory,
 * upload them to R2 under thumbs/scans/<imageId>.jpg. The Vault grid then
 * loads thumbs via /media/thumbs/scans/<id>.jpg (Worker → R2 → user).
 *
 * Thumbs live locally in public/assets/vault/scan-thumbs/ so the public tier
 * can serve low-res thumbnail previews of cited scans even after the private
 * archive is locked down. (Thumbs are safe to expose publicly — not the
 * full-page scans.)
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const envPath = path.join(root, '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf-8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET = '1987sockeyes-private' } = process.env;

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
});

const inventory = JSON.parse(fs.readFileSync(path.join(root, 'docs/curation/private-media-inventory.json'), 'utf-8'));
const scans = inventory.scans || [];

const localThumbDir = path.join(root, 'public/assets/vault/scan-thumbs');
fs.mkdirSync(localThumbDir, { recursive: true });

async function headKey(key) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    return true;
  } catch { return false; }
}

let done = 0, skipped = 0, failed = 0;

for (let i = 0; i < scans.length; i++) {
  const item = scans[i];
  const prefix = `[${String(i + 1).padStart(3)}/${scans.length}]`;
  const localThumb = path.join(localThumbDir, `${item.imageId}.jpg`);
  const r2Key = `thumbs/scans/${item.imageId}.jpg`;

  try {
    if (fs.existsSync(localThumb) && await headKey(r2Key)) {
      skipped++;
      continue;
    }
    if (!fs.existsSync(item.source)) {
      failed++;
      console.error(`${prefix} ✗ ${item.imageId} — source missing`);
      continue;
    }

    const buf = await sharp(item.source)
      .resize({ width: 480, fit: 'inside' })
      .jpeg({ quality: 78, mozjpeg: true })
      .toBuffer();

    fs.writeFileSync(localThumb, buf);
    await s3.send(new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: r2Key,
      Body: buf,
      ContentType: 'image/jpeg',
      ContentLength: buf.length,
    }));

    done++;
    if (done % 20 === 0 || i === 0) console.log(`${prefix} ✓ ${item.imageId} (${(buf.length / 1024).toFixed(0)} KB)`);
  } catch (err) {
    failed++;
    console.error(`${prefix} ✗ ${item.imageId} — ${err.message}`);
  }
}

console.log(`\nDone — new: ${done}, skipped: ${skipped}, failed: ${failed}`);
