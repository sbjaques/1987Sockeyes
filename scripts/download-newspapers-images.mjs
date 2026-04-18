#!/usr/bin/env node
// Download full-page newspapers.com images for every ID referenced in bios/
// highlights, via an Edge browser YOU launched with a remote debugging port.
//
// Setup (one time):
//   1. Close all Edge windows.
//   2. Launch a dedicated Edge instance:
//      & "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" `
//         --remote-debugging-port=9222 `
//         --user-data-dir="C:\temp\edge-newspapers"
//   3. In that window, sign in to newspapers.com (Publisher Extra).
//   4. Leave the window open.
//
// Then:
//   node scripts/download-newspapers-images.mjs              # full batch
//   node scripts/download-newspapers-images.mjs --limit=3    # pilot
//   node scripts/download-newspapers-images.mjs --dry-run    # plan only
//
// Flags:
//   --limit=N    cap the batch (default: all)
//   --delay=MS   ms between images (default 2500)
//   --cdp=URL    CDP endpoint (default http://localhost:9222)
//   --dry-run    list plan, don't download
//
// Mechanism (discovered via probe):
//   Tile URLs the viewer requests are like:
//     https://img.newspapers.com/img/img?id=<ID>&width=334&height=380
//       &crop=<X,Y,W,H>&brightness=0&contrast=0&invert=0&ts=1&cacheable=1
//       &iat=<JWT signed by server, bound to id+user+exp>
//   The JWT does NOT bind to the crop — so we can modify width/height/crop
//   to request the WHOLE page at native resolution in a single call.
//   Steps per image:
//     1. Navigate Edge to https://www.newspapers.com/image/<ID>/
//     2. Capture one iat-signed tile URL + derive page dims from all crops
//     3. Substitute width/height/crop → full page
//     4. ctx.request.get() → save .jpg
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const INDEX_PATH = path.join(root, 'src/data/imageIndex.json');
const OUT_DIR = 'G:/My Drive/87 Sockeyes/Newspaper Articles/by-image-id';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const limit = parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1] ?? 'Infinity', 10);
const delay = parseInt(args.find(a => a.startsWith('--delay='))?.split('=')[1] ?? '2500', 10);
const cdpUrl = args.find(a => a.startsWith('--cdp='))?.split('=')[1] ?? 'http://localhost:9222';

function buildFullPageUrl(tileUrl, pageW, pageH) {
  const u = new URL(tileUrl);
  u.searchParams.set('width', String(pageW));
  u.searchParams.set('height', String(pageH));
  u.searchParams.set('crop', `0,0,${pageW},${pageH}`);
  // Keep iat, brightness, contrast, invert, ts, cacheable, id — iat still validates.
  return u.toString();
}

async function main() {
  const index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'));
  const ids = Object.keys(index);
  console.log(`image index: ${ids.length} IDs`);

  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    console.log(`created ${OUT_DIR}`);
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
  if (dryRun) return;

  console.log(`connecting to Edge at ${cdpUrl}...`);
  let browser;
  try {
    browser = await chromium.connectOverCDP(cdpUrl);
  } catch (e) {
    console.error(`Failed to connect: ${e.message}`);
    console.error('Start Edge with --remote-debugging-port=9222 first.');
    process.exit(1);
  }
  const ctx = browser.contexts()[0];
  if (!ctx) { console.error('No browser context.'); process.exit(1); }

  let ok = 0, fail = 0;
  for (let i = 0; i < todo.length; i++) {
    const { id, dest, filename } = todo[i];
    const progress = `[${i + 1}/${todo.length}]`;

    // Fresh page per image — Edge's renderer leaks state across navigations,
    // and after ~150-200 loads the tab gets killed. Closing between images
    // keeps memory bounded.
    const page = await ctx.newPage();
    const caught = [];
    const handler = req => {
      const u = req.url();
      if (/img\.newspapers\.com\/img\/img\?.*\biat=/.test(u)) caught.push(u);
    };
    page.on('request', handler);
    try {
      await page.goto(`https://www.newspapers.com/image/${id}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(4500);
      if (!caught.length) {
        // Aggressive fallback: scroll + extra wait
        for (let k = 0; k < 6 && !caught.length; k++) {
          await page.mouse.wheel(0, 800);
          await page.waitForTimeout(1500);
        }
      }
      page.off('request', handler);
      if (!caught.length) {
        console.error(`${progress} ${id} FAIL no iat-signed tile URLs captured (${filename})`);
        fail++;
        await page.close().catch(() => {});
        if (i < todo.length - 1) await new Promise(r => setTimeout(r, delay));
        continue;
      }
      // Derive page dimensions from crops
      let pageW = 0, pageH = 0;
      for (const u of caught) {
        const crop = new URL(u).searchParams.get('crop');
        if (!crop) continue;
        const [x, y, w, h] = crop.split(',').map(Number);
        pageW = Math.max(pageW, x + w);
        pageH = Math.max(pageH, y + h);
      }
      if (!pageW || !pageH) {
        console.error(`${progress} ${id} FAIL could not infer page dims`);
        fail++;
        continue;
      }
      const fullUrl = buildFullPageUrl(caught[0], pageW, pageH);
      const resp = await ctx.request.get(fullUrl, { headers: { referer: `https://www.newspapers.com/image/${id}/` } });
      const ct = resp.headers()['content-type'] || '';
      if (resp.status() !== 200 || !ct.startsWith('image/')) {
        const bodyPreview = (await resp.text()).slice(0, 160);
        console.error(`${progress} ${id} FAIL status=${resp.status()} type=${ct} body=${bodyPreview}`);
        fail++;
      } else {
        const body = await resp.body();
        fs.writeFileSync(dest, body);
        ok++;
        console.log(`${progress} ${id} saved ${(body.length / 1024).toFixed(0)}KB  dims=${pageW}x${pageH}  (${filename})`);
      }
    } catch (e) {
      page.off('request', handler);
      console.error(`${progress} ${id} ERROR ${e.message}`);
      fail++;
    } finally {
      await page.close().catch(() => {});
    }
    if (i < todo.length - 1) await new Promise(r => setTimeout(r, delay));
  }

  console.log(`\ndone. ok=${ok} fail=${fail} skipped=${skipped}`);
  await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });
