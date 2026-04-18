#!/usr/bin/env node
// For each of the 7 Abbotsford News IDs that 404 on the original viewer URL,
// run a targeted newspapers.com search (publication 12357, date-bracketed,
// phrase-quoted) and extract the top-hit image ID if the DB has re-ingested
// the page under a new ID.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Publication ID for "The Abbotsford News" on newspapers.com
const PUB_ID = 12357;

// Distinctive phrases picked from each OCR extraction
const QUERIES = [
  { oldId: '536570359', date: '1987-04-11', phrase: 'Kerry Russell, Kel' },
  { oldId: '536573978', date: '1987-12-16', phrase: 'David Wensley, Bruce Major' },
  { oldId: '536581352', date: '1987-04-22', phrase: 'Sockeyes assured of Cup play' },
  { oldId: '536728203', date: '1987-07-11', phrase: 'Greg Moro' },
  { oldId: '536733310', date: '1987-09-19', phrase: 'Russ Ullyot' },
  { oldId: '536895890', date: '1987-01-28', phrase: 'Aaron Nosky' },
  { oldId: '537066955', date: '1990-10-03', phrase: 'Scott Edwards' },
];

function dateBracket(dateStr) {
  // +/- 3 days to absorb any date mismatch
  const d = new Date(dateStr + 'T00:00:00Z');
  const min = new Date(d); min.setUTCDate(d.getUTCDate() - 3);
  const max = new Date(d); max.setUTCDate(d.getUTCDate() + 3);
  const f = x => x.toISOString().slice(0, 10);
  return { min: f(min), max: f(max) };
}

const browser = await chromium.connectOverCDP('http://localhost:9222');
const ctx = browser.contexts()[0];

for (const q of QUERIES) {
  const page = await ctx.newPage();
  const { min, max } = dateBracket(q.date);
  const searchUrl = `https://www.newspapers.com/search/?query=${encodeURIComponent('"' + q.phrase + '"')}&pubs=${PUB_ID}&date=${q.date}&date-min=${min}&date-max=${max}&sort=date-ascending`;
  console.log(`\n=== ${q.oldId} (${q.date}) ===`);
  console.log(`  search: ${searchUrl}`);
  try {
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000);

    const hits = await page.evaluate(() => {
      // Every result card links to /image/<id>/. Grab unique IDs in order.
      const hrefs = Array.from(document.querySelectorAll('a[href*="/image/"]'))
        .map(a => a.getAttribute('href'))
        .filter(h => h && /\/image\/\d+/.test(h));
      const ids = [];
      for (const h of hrefs) {
        const m = h.match(/\/image\/(\d+)/);
        if (m && !ids.includes(m[1])) ids.push(m[1]);
      }
      const text = document.body.textContent || '';
      const noResults = /no results|did not match|0 results|try a different search/i.test(text);
      return { ids: ids.slice(0, 10), noResults };
    });

    console.log(`  hits: ${hits.ids.length}  noResultsFlag=${hits.noResults}`);
    if (hits.ids.length) console.log(`  top IDs: ${hits.ids.slice(0, 5).join(', ')}`);

    // For each new candidate ID, verify viewer URL is alive (not 404)
    for (const newId of hits.ids.slice(0, 3)) {
      if (newId === q.oldId) continue;
      const probeUrl = `https://www.newspapers.com/image/${newId}/`;
      const resp = await ctx.request.get(probeUrl);
      console.log(`    ${newId} → HTTP ${resp.status()}`);
      if (resp.status() === 200) {
        console.log(`    ✓ CANDIDATE: ${newId}`);
        break;
      }
    }
  } catch (e) {
    console.log(`  ERROR ${e.message}`);
  } finally {
    await page.close();
  }
}

await browser.close();
