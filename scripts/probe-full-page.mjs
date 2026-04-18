#!/usr/bin/env node
// Test whether a single iat-signed URL can be modified to fetch the whole
// page in one request (or if the JWT is bound to the tile's exact crop).
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TMP = path.join(root, '.playwright-mcp');
if (!fs.existsSync(TMP)) fs.mkdirSync(TMP, { recursive: true });

const TEST_ID = '512098543';
const browser = await chromium.connectOverCDP('http://localhost:9222');
const ctx = browser.contexts()[0];
const page = await ctx.newPage();

const captured = [];
page.on('request', r => {
  if (/img\.newspapers\.com\/img\/img\?.*iat=/.test(r.url())) captured.push(r.url());
});

console.log('Loading viewer + scrolling to capture all tiles...');
await page.goto(`https://www.newspapers.com/image/${TEST_ID}/`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);
for (let i = 0; i < 8; i++) {
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(1200);
}
await page.waitForTimeout(3000);

console.log(`captured ${captured.length} iat-signed tile URLs`);

// Decode one JWT payload
const sample = captured[0];
if (sample) {
  const iat = new URL(sample).searchParams.get('iat');
  const [, payload] = iat.split('.');
  const b64 = payload.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(payload.length / 4) * 4, '=');
  try {
    const decoded = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
    console.log('JWT payload:', JSON.stringify(decoded));
  } catch (e) {
    console.log('(could not decode JWT payload cleanly)', e.message);
  }
}

// Find page dimensions from crops
const dims = { maxX: 0, maxY: 0 };
for (const url of captured) {
  const p = new URL(url);
  const crop = p.searchParams.get('crop');
  if (!crop) continue;
  const [x, y, w, h] = crop.split(',').map(Number);
  dims.maxX = Math.max(dims.maxX, x + w);
  dims.maxY = Math.max(dims.maxY, y + h);
}
console.log(`inferred page dimensions: ${dims.maxX} x ${dims.maxY}`);

// Try: modify one URL to request the full page at original res
if (sample) {
  const base = new URL(sample);
  const iatOrig = base.searchParams.get('iat');

  const experiments = [
    { label: 'original tile (sanity)', params: null, url: sample },
    { label: 'full page at native res', params: { width: dims.maxX, height: dims.maxY, crop: `0,0,${dims.maxX},${dims.maxY}` } },
    { label: 'full page at 2000px wide', params: { width: 2000, height: Math.round(2000 * dims.maxY / dims.maxX), crop: `0,0,${dims.maxX},${dims.maxY}` } },
    { label: 'full page at 1200px wide', params: { width: 1200, height: Math.round(1200 * dims.maxY / dims.maxX), crop: `0,0,${dims.maxX},${dims.maxY}` } },
  ];

  for (const exp of experiments) {
    let url = exp.url;
    if (exp.params) {
      const u = new URL(sample);
      for (const [k, v] of Object.entries(exp.params)) u.searchParams.set(k, String(v));
      url = u.toString();
    }
    try {
      const resp = await ctx.request.get(url, { headers: { referer: `https://www.newspapers.com/image/${TEST_ID}/` } });
      const ct = resp.headers()['content-type'] || '';
      const bodyLen = ct.startsWith('image/') ? (await resp.body()).length : 0;
      console.log(`  [${exp.label}]  ${resp.status()} ${ct}  ${bodyLen ? bodyLen.toLocaleString() + ' bytes' : ''}`);
      if (bodyLen) {
        const out = path.join(TMP, `${TEST_ID}-${exp.label.replace(/[^a-z0-9]+/gi, '-')}.jpg`);
        fs.writeFileSync(out, await resp.body());
        console.log(`      saved → ${out}`);
      } else if (ct.includes('json') || ct.includes('text')) {
        const t = await resp.text();
        console.log(`      body: ${t.slice(0, 200)}`);
      }
    } catch (e) {
      console.log(`  [${exp.label}] ERROR ${e.message}`);
    }
    await page.waitForTimeout(1000);
  }
}

await page.close();
await browser.close();
