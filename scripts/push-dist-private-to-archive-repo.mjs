#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';

const token = process.env.ARCHIVE_DIST_PAT;
if (!token) {
  console.error('ARCHIVE_DIST_PAT env var is required.');
  process.exit(1);
}

const srcCommit = execSync('git rev-parse --short HEAD').toString().trim();
const srcMessage = execSync('git log -1 --pretty=%s').toString().trim();
const dest = 'archive-dist-clone';
if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });

execSync(`git clone --depth=1 https://x-access-token:${token}@github.com/sbjaques/1987Sockeyes-archive-dist.git ${dest}`, { stdio: 'inherit' });

execSync(`rm -rf ${dest}/*`, { stdio: 'inherit' });
execSync(`cp -r dist-private/. ${dest}/`, { stdio: 'inherit' });

execSync(`git -C ${dest} config user.email "actions@github.com"`, { stdio: 'inherit' });
execSync(`git -C ${dest} config user.name "archive-deploy-bot"`, { stdio: 'inherit' });
execSync(`git -C ${dest} add -A`, { stdio: 'inherit' });

try {
  execSync(`git -C ${dest} commit -m "deploy: source ${srcCommit} — ${srcMessage}"`, { stdio: 'inherit' });
} catch {
  console.log('No changes to deploy.');
  process.exit(0);
}

execSync(`git -C ${dest} push origin main`, { stdio: 'inherit' });
console.log('Pushed private dist to archive-dist repo.');
