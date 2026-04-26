#!/usr/bin/env node
// Verifies that the public build strips url + attribution from private items.
// Adds a private item with a distinctive marker string, builds both modes,
// greps both bundles for the marker, confirms public does NOT contain it.

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const MARKER = 'BUILDFILTERTESTMARKERxyzzy12345';
const mediaPath = 'src/data/media.json';
const original = readFileSync(mediaPath, 'utf8');
const items = JSON.parse(original);

// Insert a private item whose url and attribution contain the marker
const testItem = {
  id: 'build-filter-test-item',
  type: 'photo',
  date: '1987-01-01',
  access: 'private',
  thumb: '/thumb.jpg',
  url: `/r2/private/${MARKER}.jpg`,
  descriptionShort: 'Test item for build-filter verification (temporary).',
  descriptionLong:
    'Inserted by scripts/verify-build-filter.mjs to confirm public build strips url and attribution fields from private items. Removed after verification. ' +
    'x'.repeat(30),
  attribution: { paper: `${MARKER}-Publisher` },
  tags: ['test'],
};
writeFileSync(mediaPath, JSON.stringify([...items, testItem], null, 2) + '\n');

try {
  execSync('npm run build:public', { stdio: 'inherit' });
  execSync('npm run build:private', { stdio: 'inherit' });

  const publicHasMarker = execSync(`grep -r "${MARKER}" dist-public/ || true`)
    .toString()
    .trim();
  const privateHasMarker = execSync(`grep -r "${MARKER}" dist-private/ || true`)
    .toString()
    .trim();

  let failed = false;

  if (publicHasMarker) {
    console.error(`FAIL: public bundle contains marker "${MARKER}":\n${publicHasMarker}`);
    failed = true;
  } else {
    console.log('PASS: public bundle does not contain marker string.');
  }
  if (!privateHasMarker) {
    console.error(`FAIL: private bundle does NOT contain marker "${MARKER}" (it should).`);
    failed = true;
  } else {
    console.log('PASS: private bundle contains marker (as expected).');
  }

  if (failed) process.exitCode = 1;

  // Check that public bundle does NOT contain comment/admin feature strings
  const FORBIDDEN_IN_PUBLIC = [
    '/api/comments',
    '/api/me',
    '/api/admin/recount',
    '/admin/inbox',
    'LeaveNoteModal',
    'LeaveNoteButton',
    'AdminInboxPage',
    'AdminBadge',
    'Resend',
    'RESEND_API_KEY',
    'NOTIFY_EMAIL',
    'ADMIN_EMAIL',
  ];

  const distPublic = join(process.cwd(), 'dist-public');
  if (existsSync(distPublic)) {
    const assetsDir = join(distPublic, 'assets');
    if (existsSync(assetsDir)) {
      const jsFiles = readdirSync(assetsDir).filter(f => f.endsWith('.js'));
      let forbiddenFound = false;
      for (const f of jsFiles) {
        const content = readFileSync(join(assetsDir, f), 'utf8');
        for (const forbidden of FORBIDDEN_IN_PUBLIC) {
          if (content.includes(forbidden)) {
            console.error(`✗ FAIL: dist-public/assets/${f} contains "${forbidden}"`);
            forbiddenFound = true;
            failed = true;
          }
        }
      }
      if (!forbiddenFound) {
        console.log('✓ public bundle clean of comment/admin strings.');
      }
    }
  }

  if (failed) process.exitCode = 1;
} finally {
  writeFileSync(mediaPath, original); // Always restore original media.json
}
