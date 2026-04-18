#!/usr/bin/env node
// Authoritative probe: load the viewer with network capture turned on BEFORE
// navigation, so we catch the hash-signed image URL the viewer actually uses.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const USER_DATA_DIR = path.join(root, '.playwright-newspapers-profile');
const TEST_ID = '512098543';

const ctx = await chromium.launchPersistentContext(USER_DATA_DIR, {
  headless: false,
  viewport: { width: 1600, height: 1100 },
});
const page = ctx.pages()[0] ?? await ctx.newPage();

const captured = [];
page.on('request', r => {
  const u = r.url();
  if (/img\.newspapers|\/api\/|\.jpg|\.png|\.jpeg|tileimg|download|clip/i.test(u)) {
    captured.push({ method: r.method(), url: u });
  }
});
page.on('response', async r => {
  const u = r.url();
  if (/img\.newspapers\.com\/img\/img\?id=/i.test(u)) {
    const status = r.status();
    const ct = r.headers()['content-type'] || '';
    console.log(`  [network]  ${status} ${ct}  ${u}`);
  }
});

console.log('Loading viewer with network capture...');
await page.goto(`https://www.newspapers.com/image/${TEST_ID}/`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(15000); // let viewer fully initialize

console.log(`\nCaptured ${captured.length} matching requests:`);
for (const r of captured.slice(0, 40)) console.log(`  ${r.method} ${r.url.slice(0, 220)}`);

const hashed = captured.filter(r => /[?&]hash=/.test(r.url));
console.log(`\nHash-signed image URLs: ${hashed.length}`);
for (const r of hashed.slice(0, 5)) console.log(`  ${r.url}`);

// Try fetching the first hashed URL and save to see resolution
if (hashed.length) {
  const testUrl = hashed[0].url;
  console.log(`\nFetching authed URL: ${testUrl.slice(0, 200)}`);
  const resp = await ctx.request.get(testUrl, { headers: { referer: `https://www.newspapers.com/image/${TEST_ID}/` } });
  console.log(`  status: ${resp.status()}, type: ${resp.headers()['content-type']}, size: ${(await resp.body()).length} bytes`);
}

// Also check for clip/download/print URLs
const downloadish = captured.filter(r => /download|clip|print/i.test(r.url));
console.log(`\nDownload-ish URLs: ${downloadish.length}`);
for (const r of downloadish.slice(0, 5)) console.log(`  ${r.url}`);

await ctx.close();
