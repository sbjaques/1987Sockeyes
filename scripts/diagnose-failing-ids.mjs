#!/usr/bin/env node
// Visit each of the 7 failing IDs, capture what actually renders, and write
// a per-ID report. Looking for: paywall overlays, missing-image markers,
// different viewer DOMs, alternate image URLs.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const FAILING = [
  { id: '536570359', filename: '1987-04-11-the-abbotsford-news-p34-i536570359.md' },
  { id: '536573978', filename: '1987-12-16-the-abbotsford-news-p17-i536573978.md' },
  { id: '536581352', filename: '1987-04-22-the-abbotsford-news-p15-i536581352.md' },
  { id: '536728203', filename: '1987-07-11-the-abbotsford-news-p24-i536728203.md' },
  { id: '536733310', filename: '1987-09-19-the-abbotsford-news-p24-i536733310.md' },
  { id: '536895890', filename: '1987-01-28-the-abbotsford-news-p14-i536895890.md' },
  { id: '537066955', filename: '1990-10-03-the-abbotsford-news-p47-i537066955.md' },
];

const browser = await chromium.connectOverCDP('http://localhost:9222');
const ctx = browser.contexts()[0];

const results = [];
for (const { id, filename } of FAILING) {
  console.log(`\n=== ${id} (${filename}) ===`);
  const page = await ctx.newPage();
  const requests = [];
  page.on('request', r => {
    const u = r.url();
    if (/img\.newspapers|\/api\/|\.jpg|\.png|subscribe|paywall|tileimg|download/i.test(u)) {
      requests.push({ method: r.method(), url: u });
    }
  });
  try {
    const resp = await page.goto(`https://www.newspapers.com/image/${id}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log(`  initial response: ${resp?.status()} ${resp?.url()}`);
    await page.waitForTimeout(6000);
    // Snapshot DOM
    const diag = await page.evaluate(() => {
      const body = document.body.textContent || '';
      const paywall = /subscribe|publisher.*extra|upgrade|sign in to view|not\s+available/i.test(body);
      const notFound = /lost.*found|page.*not.*found|no longer available|404/i.test(body);
      const upsellKey = [...body.matchAll(/(subscribe|upgrade|publisher.*extra|paywall|get.*full.*access)/gi)].slice(0,5).map(m => m[0]);
      const title = document.title;
      const h1s = Array.from(document.querySelectorAll('h1, h2')).map(h => (h.textContent || '').trim().slice(0,120)).filter(Boolean).slice(0,5);
      const bodySnippet = body.replace(/\s+/g, ' ').slice(0, 600);
      return { title, h1s, paywall, notFound, upsellKey, bodySnippet };
    });
    console.log(`  title: ${diag.title}`);
    console.log(`  paywall=${diag.paywall}  notFound=${diag.notFound}`);
    if (diag.h1s.length) console.log(`  headings: ${diag.h1s.join(' | ')}`);
    if (diag.upsellKey.length) console.log(`  upsell hints: ${diag.upsellKey.join(', ')}`);
    console.log(`  body: ${diag.bodySnippet.slice(0, 200)}...`);
    // Look for anchor to alternate URL (sometimes there's a link to "try searching again")
    const alternates = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a[href*="newspapers.com"]'))
        .map(a => ({ text: (a.textContent||'').trim().slice(0,60), href: a.href }))
        .filter(a => a.href && !/favicon|topics|blog/.test(a.href))
        .slice(0, 10);
    });
    if (alternates.length) console.log(`  in-page links: ${alternates.map(a=>a.href).slice(0,3).join(' | ')}`);
    console.log(`  captured ${requests.length} interesting network requests`);
    for (const r of requests.slice(0, 5)) console.log(`    ${r.method} ${r.url.slice(0,200)}`);

    results.push({ id, filename, ...diag, requestCount: requests.length, requestsPreview: requests.slice(0,10) });
  } catch (e) {
    console.log(`  ERROR ${e.message}`);
    results.push({ id, filename, error: e.message });
  } finally {
    await page.close();
  }
}

fs.writeFileSync(path.join(root, '.playwright-mcp/abbotsford-diagnosis.json'), JSON.stringify(results, null, 2));
console.log('\nFull report written to .playwright-mcp/abbotsford-diagnosis.json');
await browser.close();
