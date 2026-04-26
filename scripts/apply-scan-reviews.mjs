#!/usr/bin/env node
/**
 * Read all per-scan review files in docs/curation/reviews/, apply confident
 * verdicts to src/data/media.json, and report a summary.
 *
 * Apply rules:
 *   verdict=accurate  → flip needsReview to false. Don't touch text.
 *   verdict=needs-fix → apply non-empty corrections, flip needsReview to false.
 *                       paper, page, imageId, date are NEVER changed (filename-derived).
 *   verdict=uncertain → leave needsReview true. Logged for editor.
 *
 * Description-length safety: if a "needs-fix" correction violates the schema
 * length bounds (short 20-400, long 80-2000), the entry is downgraded to
 * "uncertain" so the bad correction does not get written.
 *
 * Idempotent: running it twice produces the same result.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const mediaPath = path.join(root, 'src/data/media.json');
const reviewsDir = path.join(root, 'docs/curation/reviews');
const reportPath = path.join(root, 'docs/curation/scan-review-report.json');

const SHORT_MIN = 20, SHORT_MAX = 400;
const LONG_MIN = 80, LONG_MAX = 2000;

function lengthOk(s, min, max) {
  return typeof s === 'string' && s.length >= min && s.length <= max;
}

function main() {
  if (!fs.existsSync(reviewsDir)) {
    console.error(`No reviews dir at ${reviewsDir}. Run verify-scan-drafts.mjs first.`);
    process.exit(1);
  }
  const media = JSON.parse(fs.readFileSync(mediaPath, 'utf-8'));
  const byId = new Map(media.map(x => [x.id, x]));

  const reviewFiles = fs.readdirSync(reviewsDir).filter(f => f.endsWith('.json'));
  console.log(`reviews loaded: ${reviewFiles.length}`);

  let accurate = 0, fixed = 0, uncertain = 0, downgraded = 0, missing = 0;
  const fixedItems = [];
  const uncertainItems = [];
  const issues = [];

  for (const f of reviewFiles) {
    const review = JSON.parse(fs.readFileSync(path.join(reviewsDir, f), 'utf-8'));
    const item = byId.get(review.id);
    if (!item) { missing++; continue; }
    const r = review.review;

    if (r.verdict === 'accurate') {
      item.needsReview = false;
      accurate++;
      continue;
    }

    if (r.verdict === 'uncertain') {
      uncertain++;
      uncertainItems.push({ id: review.id, notes: r.notes, issues: r.issues });
      continue;
    }

    if (r.verdict === 'needs-fix') {
      const newShort = r.correctedDescriptionShort?.trim() || '';
      const newLong = r.correctedDescriptionLong?.trim() || '';
      const newHeadline = r.correctedHeadline?.trim() || '';
      const newByline = r.correctedByline?.trim() || '';

      const haveShortFix = newShort && newShort !== item.descriptionShort;
      const haveLongFix = newLong && newLong !== item.descriptionLong;
      const haveHeadlineFix = newHeadline && newHeadline !== (item.attribution?.headline || '');
      const haveBylineFix = newByline && newByline !== (item.attribution?.byline || '');

      // Validate any text fix against schema bounds before writing.
      if (haveShortFix && !lengthOk(newShort, SHORT_MIN, SHORT_MAX)) {
        downgraded++;
        uncertainItems.push({ id: review.id, notes: `correctedDescriptionShort failed length check (${newShort.length} chars). ${r.notes || ''}`.trim(), issues: r.issues });
        continue;
      }
      if (haveLongFix && !lengthOk(newLong, LONG_MIN, LONG_MAX)) {
        downgraded++;
        uncertainItems.push({ id: review.id, notes: `correctedDescriptionLong failed length check (${newLong.length} chars). ${r.notes || ''}`.trim(), issues: r.issues });
        continue;
      }

      const before = {
        descriptionShort: item.descriptionShort,
        descriptionLong: item.descriptionLong,
        headline: item.attribution?.headline || '',
        byline: item.attribution?.byline || ''
      };

      if (haveShortFix) item.descriptionShort = newShort;
      if (haveLongFix) item.descriptionLong = newLong;
      if (haveHeadlineFix) {
        item.attribution = item.attribution || {};
        item.attribution.headline = newHeadline;
      }
      if (haveBylineFix) {
        item.attribution = item.attribution || {};
        item.attribution.byline = newByline;
      }

      // Strip empty headline/byline keys per schema (additionalProperties:false is strict on missing required).
      // Schema only requires `paper`. Empty strings are still valid strings, but we drop them for cleanliness.
      if (item.attribution) {
        if (item.attribution.headline === '') delete item.attribution.headline;
        if (item.attribution.byline === '') delete item.attribution.byline;
      }

      item.needsReview = false;
      fixed++;
      fixedItems.push({
        id: review.id,
        before,
        after: {
          descriptionShort: item.descriptionShort,
          descriptionLong: item.descriptionLong,
          headline: item.attribution?.headline || '',
          byline: item.attribution?.byline || ''
        },
        issues: r.issues
      });
    }
  }

  // Total still flagged
  const stillNeedsReview = media.filter(x => x.needsReview === true).length;

  fs.writeFileSync(mediaPath, JSON.stringify(media, null, 2) + '\n');

  const report = {
    generatedAt: new Date().toISOString(),
    summary: { accurate, fixed, uncertain, downgraded, missing, stillNeedsReview },
    fixedItems,
    uncertainItems,
    issues
  };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');

  console.log('');
  console.log('Apply summary:');
  console.log(`  accurate (flipped, no text change): ${accurate}`);
  console.log(`  needs-fix (corrections applied):    ${fixed}`);
  console.log(`  uncertain (left flagged):           ${uncertain}`);
  console.log(`  downgraded (bad-length correction): ${downgraded}`);
  console.log(`  missing (review id not in media):   ${missing}`);
  console.log(`  still needsReview after pass:       ${stillNeedsReview}`);
  console.log(`\nReport: ${path.relative(root, reportPath)}`);
  console.log(`Wrote:  ${path.relative(root, mediaPath)}`);
}

main();
