#!/usr/bin/env node
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
  if (/img\.newspapers|\/api\/|\.jpg|\.png|\.jpeg|tileimg|download|clip|pdf/i.test(u)) {
    captured.push({ method: r.method(), url: u });
  }
});

console.log('Checking subscription status...');
await page.goto('https://www.newspapers.com/my-membership/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(4000);
const membership = await page.evaluate(() => document.body.textContent?.slice(0, 1500) || '');
console.log('--- /my-membership/ text (first 1500 chars) ---');
console.log(membership);
console.log('---');

console.log('\nLoading viewer...');
await page.goto(`https://www.newspapers.com/image/${TEST_ID}/`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(10000);

// Scroll + zoom to trigger image loads
await page.mouse.wheel(0, 400);
await page.waitForTimeout(3000);

console.log(`\nCaptured ${captured.length} requests:`);
for (const r of captured.slice(0, 50)) console.log(`  ${r.method} ${r.url.slice(0, 240)}`);

// Look for a print/download button and try clicking it
console.log('\nHunting for Print/Download button...');
const buttons = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('button, a, [role="button"]'))
    .map(b => ({
      text: (b.textContent || '').trim().slice(0, 60),
      testid: b.getAttribute('data-testid'),
      aria: b.getAttribute('aria-label'),
      id: b.id,
      className: b.className?.slice ? b.className.slice(0, 80) : '',
    }))
    .filter(b => /print|download|save|clip|pdf/i.test(b.text + ' ' + (b.aria || '') + ' ' + (b.testid || '')))
    .slice(0, 15);
});
console.log(JSON.stringify(buttons, null, 2));

await ctx.close();
