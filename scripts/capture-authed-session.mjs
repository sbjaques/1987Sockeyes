#!/usr/bin/env node
// Supervised session capture:
//   1. Opens Chromium at newspapers.com/signin
//   2. User logs in manually, then navigates to a test image page
//   3. Script records ALL network requests/responses for ~4 minutes
//   4. Dumps auth cookies, image URL parameters, hash patterns, API calls
//
// Purpose: discover (a) which cookie(s) indicate auth, (b) how the full-page
// image URL is constructed (particularly any &hash= signature).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const USER_DATA_DIR = path.join(root, '.playwright-newspapers-profile');
const OUT_FILE = path.join(root, 'newspapers-capture.json');
const TEST_ID = '512098543';

const ctx = await chromium.launchPersistentContext(USER_DATA_DIR, {
  headless: false,
  channel: 'msedge', // use real Edge binary to bypass Playwright-Chromium fingerprinting
  viewport: { width: 1600, height: 1100 },
  args: ['--disable-blink-features=AutomationControlled'],
  ignoreDefaultArgs: ['--enable-automation'],
});
const page = ctx.pages()[0] ?? await ctx.newPage();

const events = [];
page.on('request', r => {
  events.push({ t: Date.now(), kind: 'req', method: r.method(), url: r.url(), resourceType: r.resourceType() });
});
page.on('response', async r => {
  const u = r.url();
  if (/img\.newspapers|\/api\/|\/image\/|tileimg|download|clip|pdf|signin|login|auth|session|subscription/i.test(u)) {
    const entry = { t: Date.now(), kind: 'resp', status: r.status(), url: u, contentType: r.headers()['content-type'] || '' };
    try {
      if (/json|text/i.test(entry.contentType)) {
        entry.bodyPreview = (await r.text()).slice(0, 400);
      }
    } catch {}
    events.push(entry);
  }
});

console.log('\n=========================================================');
console.log(' STEP 1: Log in to newspapers.com in the Chromium window');
console.log(' STEP 2: Navigate to https://www.newspapers.com/image/' + TEST_ID + '/');
console.log(' STEP 3: Let the page fully load (watch the image render)');
console.log(' STEP 4: Try clicking the Print/Download button (if visible)');
console.log('=========================================================\n');
console.log('Capture window: ~4 minutes. Script will auto-exit.\n');

await page.goto('https://www.newspapers.com/signin/');

const CAPTURE_MS = 4 * 60 * 1000;
const startedAt = Date.now();
while (Date.now() - startedAt < CAPTURE_MS) {
  await new Promise(r => setTimeout(r, 15000));
  console.log(`  ...capturing (${Math.floor((Date.now() - startedAt) / 1000)}s / ${CAPTURE_MS / 1000}s)  events=${events.length}  url=${page.url().slice(0, 80)}`);
}

// Final dump
const cookies = await ctx.cookies('https://www.newspapers.com/');
const imgRequests = events.filter(e => e.kind === 'req' && /img\.newspapers\.com/.test(e.url));
const hashedImgs = imgRequests.filter(e => /[?&]hash=/.test(e.url));
const apiRequests = events.filter(e => e.kind === 'req' && /\/api\//.test(e.url));

const summary = {
  cookies: cookies.map(c => ({ name: c.name, valuePreview: c.value.slice(0, 60), domain: c.domain })),
  totalEvents: events.length,
  imgRequests: imgRequests.map(e => ({ t: e.t - startedAt, method: e.method, url: e.url })),
  hashedImgRequests: hashedImgs.map(e => e.url),
  apiRequests: apiRequests.slice(0, 50).map(e => ({ method: e.method, url: e.url })),
  interestingResponses: events.filter(e => e.kind === 'resp').slice(0, 80).map(e => ({
    status: e.status, url: e.url.slice(0, 220), contentType: e.contentType, bodyPreview: e.bodyPreview,
  })),
};

fs.writeFileSync(OUT_FILE, JSON.stringify(summary, null, 2));
console.log(`\nWrote ${OUT_FILE}`);
console.log(`summary: cookies=${cookies.length}  imgReqs=${imgRequests.length}  hashed=${hashedImgs.length}  apiReqs=${apiRequests.length}`);

await ctx.close();
