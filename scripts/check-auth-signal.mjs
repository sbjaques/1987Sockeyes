#!/usr/bin/env node
// Find a reliable logged-in vs anon signal.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const USER_DATA_DIR = path.join(root, '.playwright-newspapers-profile');

const ctx = await chromium.launchPersistentContext(USER_DATA_DIR, { headless: false });
const page = ctx.pages()[0] ?? await ctx.newPage();

// Probe auth-specific endpoints
for (const url of [
  'https://www.newspapers.com/api/users/me',
  'https://www.newspapers.com/api/user',
  'https://www.newspapers.com/api/user/me',
  'https://www.newspapers.com/api/account',
  'https://www.newspapers.com/api/subscription/mine',
]) {
  try {
    const resp = await ctx.request.get(url);
    const ct = resp.headers()['content-type'] || '';
    const body = ct.includes('json') || ct.includes('text') ? (await resp.text()).slice(0, 200) : '[non-text]';
    console.log(`${resp.status()} ${url}\n   ${body}\n`);
  } catch (e) {
    console.log(`ERR  ${url}: ${e.message}\n`);
  }
}

// Cookie dump
const cookies = await ctx.cookies('https://www.newspapers.com/');
console.log(`Cookies on newspapers.com (${cookies.length}):`);
for (const c of cookies) console.log(`  ${c.name}=${c.value.slice(0, 50)}${c.value.length > 50 ? '...' : ''}`);

await ctx.close();
