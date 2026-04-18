#!/usr/bin/env node
// One-off tool: download the full-page images for every image ID referenced
// in bios/highlights, using an authenticated newspapers.com session.
//
// Flow:
//   1. Launches Chromium with a persistent context (login survives restarts).
//   2. If not logged in, opens newspapers.com/signin and waits for you to
//      authenticate manually. Press Enter in the terminal once you see the
//      "Papers" nav bar (or any logged-in page).
//   3. Iterates src/data/imageIndex.json, fetching
//      https://img.newspapers.com/img/img?id=<ID> via the browser's
//      authenticated context. Saves to G:/My Drive/87 Sockeyes/Newspaper
//      Articles/by-image-id/<ID>.jpg
//   4. Resumable: skips IDs whose JPG already exists. Rate-limited.
//
// Flags:
//   --dry-run    do not open a browser; just print what would be fetched
//   --limit=N    cap the batch at N images (useful for a first-pilot run)
//   --delay=MS   milliseconds between fetches (default 2500)
//
// Requires: npm install (playwright in devDeps), then
//           npx playwright install chromium.
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const INDEX_PATH = path.join(root, 'src/data/imageIndex.json');
const OUT_DIR = 'G:/My Drive/87 Sockeyes/Newspaper Articles/by-image-id';
const USER_DATA_DIR = path.join(root, '.playwright-newspapers-profile');
const SIGNIN_URL = 'https://www.newspapers.com/signin/';
const IMG_URL = (id) => `https://img.newspapers.com/img/img?id=${id}`;

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const limitArg = args.find(a => a.startsWith('--limit='));
const delayArg = args.find(a => a.startsWith('--delay='));
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity;
const delay = delayArg ? parseInt(delayArg.split('=')[1], 10) : 2500;

function prompt(question) {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, answer => { rl.close(); resolve(answer); });
  });
}

async function isLoggedIn(page) {
  try {
    await page.goto('https://www.newspapers.com/', { waitUntil: 'domcontentloaded' });
    const html = await page.content();
    return /sign\s*out|my\s+papers|account|\/signout/i.test(html);
  } catch { return false; }
}

async function main() {
  const index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'));
  const ids = Object.keys(index);
  console.log(`image index: ${ids.length} IDs referenced in bios/highlights`);

  if (!fs.existsSync(OUT_DIR)) {
    if (dryRun) {
      console.log(`would create output dir: ${OUT_DIR}`);
    } else {
      fs.mkdirSync(OUT_DIR, { recursive: true });
      console.log(`created output dir: ${OUT_DIR}`);
    }
  }

  const todo = [];
  let skipped = 0;
  for (const id of ids) {
    const dest = path.join(OUT_DIR, `${id}.jpg`);
    if (fs.existsSync(dest) && !dryRun) { skipped++; continue; }
    todo.push({ id, dest, filename: index[id] });
    if (todo.length >= limit) break;
  }
  console.log(`plan: ${todo.length} to fetch, ${skipped} already on disk`);

  if (dryRun) {
    console.log('\nDry run — sample of what would be fetched:');
    for (const t of todo.slice(0, 10)) {
      console.log(`  ${IMG_URL(t.id)}  →  ${t.dest}  (source: ${t.filename})`);
    }
    if (todo.length > 10) console.log(`  ...and ${todo.length - 10} more`);
    return;
  }

  const { chromium } = await import('playwright');
  const ctx = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    viewport: { width: 1280, height: 900 },
    acceptDownloads: true,
  });
  const page = ctx.pages()[0] ?? await ctx.newPage();

  if (!(await isLoggedIn(page))) {
    console.log('\nNot logged in. Opening sign-in page — please log in in the browser window.');
    await page.goto(SIGNIN_URL);
    await prompt('After you see the logged-in homepage, press Enter here to begin downloads... ');
    if (!(await isLoggedIn(page))) {
      console.error('Still not logged in — aborting. Re-run the script once signed in.');
      await ctx.close();
      process.exit(1);
    }
  }
  console.log('Logged in. Starting downloads.');

  let ok = 0, fail = 0;
  for (let i = 0; i < todo.length; i++) {
    const { id, dest, filename } = todo[i];
    const progress = `[${i + 1}/${todo.length}]`;
    try {
      const resp = await ctx.request.get(IMG_URL(id), {
        headers: { referer: `https://www.newspapers.com/image/${id}/` },
      });
      const status = resp.status();
      const contentType = resp.headers()['content-type'] || '';
      if (status !== 200 || !contentType.startsWith('image/')) {
        console.error(`${progress} ${id} FAIL status=${status} type=${contentType}`);
        fail++;
      } else {
        const body = await resp.body();
        fs.writeFileSync(dest, body);
        ok++;
        console.log(`${progress} ${id} saved ${body.length.toLocaleString()} bytes (${filename})`);
      }
    } catch (e) {
      console.error(`${progress} ${id} ERROR`, e.message);
      fail++;
    }
    if (i < todo.length - 1) await new Promise(r => setTimeout(r, delay));
  }

  console.log(`\ndone. ok=${ok} fail=${fail} skipped=${skipped}`);
  await ctx.close();
}

main().catch(e => { console.error(e); process.exit(1); });
