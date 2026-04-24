#!/usr/bin/env node
/**
 * AI-draft descriptionShort + descriptionLong + tags + (for scans) attribution
 * for every item in docs/curation/private-media-inventory.json.
 *
 * Writes each draft to docs/curation/drafts/<slugId>.json. Resumable — skips
 * any slugId already on disk.
 *
 * Uses Claude Haiku 4.5 via the Messages API with a tool-use schema so the
 * model returns validated JSON rather than a prose reply.
 *
 * Context sources:
 *   - Videos: filename + date only
 *   - Newspaper scans: OCR markdown from src/content/private/ocr/<matching>.md
 *     (first ~3500 chars so the prompt stays compact)
 *   - Scrapbook: filename + date (none in current inventory)
 *
 * Reads ANTHROPIC_API_KEY from .env.local or env.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

// --- load .env.local ---
const envPath = path.join(root, '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf-8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('Missing ANTHROPIC_API_KEY. Set in .env.local or env.');
  process.exit(1);
}

const client = new Anthropic();

const draftsDir = path.join(root, 'docs/curation/drafts');
fs.mkdirSync(draftsDir, { recursive: true });

const ocrDir = path.join(root, 'src/content/private/ocr');
const ocrByImageId = {};
if (fs.existsSync(ocrDir)) {
  for (const f of fs.readdirSync(ocrDir)) {
    const m = f.match(/-i(\d{7,})\.md$/);
    if (m) ocrByImageId[m[1]] = path.join(ocrDir, f);
  }
}

// --- tool schemas ---
const newspaperTool = {
  name: 'describe_newspaper_scan',
  description: 'Return structured description + attribution for a newspaper page scan related to the 1987 Richmond Sockeyes junior hockey team.',
  input_schema: {
    type: 'object',
    properties: {
      descriptionShort: { type: 'string', description: 'One-sentence summary of what this clipping is, in 15-30 words. Factual, no adjectives.' },
      descriptionLong:  { type: 'string', description: '2-4 sentences, 40-100 words. Cover who/what/when/where. Mention key names, scores, or outcomes cited in the OCR. Factual voice — no editorial.' },
      paper:            { type: 'string', description: 'Paper name, e.g. "Vancouver Sun", "Nanaimo Daily News", "Star-Phoenix". Best-guess from filename/OCR.' },
      headline:         { type: 'string', description: 'Article headline if clear from OCR. Empty string if not.' },
      byline:           { type: 'string', description: 'Reporter byline if named. Empty string if not.' },
      page:             { type: 'string', description: 'Page number as string, e.g. "p9" or "p22". Empty if unknown.' },
      tags:             { type: 'array', items: { type: 'string' }, description: '2-5 lowercase hyphenated tags. Vocabulary: mowat-cup, doyle-cup, abbott-cup, centennial-cup, bcjhl, regular-season, playoff, box-score, recap, feature, photo, preview, standings, profile, retrospective.' }
    },
    required: ['descriptionShort', 'descriptionLong', 'paper', 'headline', 'byline', 'page', 'tags']
  }
};

const videoTool = {
  name: 'describe_video',
  description: 'Return structured description for a video file related to the 1987 Richmond Sockeyes team (either 2025 banner-night / HOF footage, or historical 1987-1998 playing-era footage).',
  input_schema: {
    type: 'object',
    properties: {
      descriptionShort: { type: 'string', description: 'One sentence, 15-30 words. What the video depicts based on the filename.' },
      descriptionLong:  { type: 'string', description: '2-4 sentences, 40-100 words. Best-guess content based on filename and date. Note if context is ambiguous.' },
      tags:             { type: 'array', items: { type: 'string' }, description: '2-5 lowercase hyphenated tags. Vocabulary: banner-night, hof-induction, interview, ceremony, speech, game-footage, ahl, whl, ihl, pro-career, archival.' }
    },
    required: ['descriptionShort', 'descriptionLong', 'tags']
  }
};

async function draftNewspaper(item) {
  const ocrPath = ocrByImageId[item.imageId];
  let ocrText = '';
  if (ocrPath) {
    ocrText = fs.readFileSync(ocrPath, 'utf-8').slice(0, 3500);
  }
  const sys = `You describe newspaper clippings in a historical archive about the 1987 Richmond Sockeyes, a BC junior-A hockey team that won the Centennial Cup (Canadian junior-A championship) in May 1987 in Humboldt, SK. Head coach: Orland Kurtenbach. Owner: Bruce Taylor. Captain: Trevor Dickie. Use the OCR content to identify the subject. Be factual and concise.`;
  const user = `Newspaper scan inventory entry:
- filename: ${item.filename}
- imageId: ${item.imageId}

OCR extract (may contain noise, other articles on the page, etc.):
---
${ocrText || '(OCR unavailable)'}
---

Call describe_newspaper_scan with your description.`;
  const res = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: sys,
    tools: [newspaperTool],
    tool_choice: { type: 'tool', name: 'describe_newspaper_scan' },
    messages: [{ role: 'user', content: user }]
  });
  const toolUse = res.content.find(b => b.type === 'tool_use');
  if (!toolUse) throw new Error('no tool_use in response');
  return toolUse.input;
}

async function draftVideo(item) {
  const sys = `You describe videos in a historical archive about the 1987 Richmond Sockeyes, a BC junior-A hockey team that won the Centennial Cup in May 1987. The archive spans the team's playing era (1986-1990s) AND the 2025 banner-night / BC Hockey Hall of Fame reunion events. Newer-dated videos (2024-2025) are typically from the modern HOF / commemoration events. Older-dated videos (1988-1998) are usually game-footage fragments from alumni's pro careers (AHL, IHL). Filenames usually encode the subject. Be factual and note uncertainty.`;
  const user = `Video inventory entry:
- filename: ${item.filename}
- date: ${item.date}
- slugId: ${item.slugId}

Call describe_video with your description.`;
  const res = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 768,
    system: sys,
    tools: [videoTool],
    tool_choice: { type: 'tool', name: 'describe_video' },
    messages: [{ role: 'user', content: user }]
  });
  const toolUse = res.content.find(b => b.type === 'tool_use');
  if (!toolUse) throw new Error('no tool_use in response');
  return toolUse.input;
}

async function draftOne(item) {
  const outPath = path.join(draftsDir, `${item.slugId}.json`);
  if (fs.existsSync(outPath)) return { skipped: 'already-drafted' };

  let draft;
  if (item.type === 'newspaper') {
    const r = await draftNewspaper(item);
    draft = {
      id: item.slugId,
      type: 'newspaper',
      date: item.date || null,
      access: item.access,
      descriptionShort: r.descriptionShort,
      descriptionLong: r.descriptionLong,
      attribution: {
        paper: r.paper,
        ...(r.headline ? { headline: r.headline } : {}),
        ...(r.byline ? { byline: r.byline } : {}),
        ...(r.page ? { page: r.page } : {}),
        imageId: item.imageId,
      },
      tags: r.tags,
    };
  } else if (item.type === 'video') {
    const r = await draftVideo(item);
    draft = {
      id: item.slugId,
      type: 'video',
      date: item.date || null,
      access: item.access,
      descriptionShort: r.descriptionShort,
      descriptionLong: r.descriptionLong,
      tags: r.tags,
    };
  } else {
    return { skipped: `unsupported-type-${item.type}` };
  }

  fs.writeFileSync(outPath, JSON.stringify(draft, null, 2));
  return { wrote: outPath };
}

async function main() {
  const inventory = JSON.parse(
    fs.readFileSync(path.join(root, 'docs/curation/private-media-inventory.json'), 'utf-8')
  );
  const all = [
    ...(inventory.videos || []),
    ...(inventory.publicScrapbook || []),
    ...(inventory.privateScrapbook || []),
    ...(inventory.scans || []),
  ];
  console.log(`Items to draft: ${all.length}`);
  console.log(`Drafts dir:     ${draftsDir}`);
  console.log('');

  let wrote = 0, skipped = 0, failed = 0;
  for (let i = 0; i < all.length; i++) {
    const item = all[i];
    const prefix = `[${String(i + 1).padStart(3)}/${all.length}]`;
    try {
      const r = await draftOne(item);
      if (r.wrote) {
        wrote++;
        console.log(`${prefix} ✓ ${item.slugId}`);
      } else {
        skipped++;
        // don't log the noise of already-drafted
        if (r.skipped !== 'already-drafted') console.log(`${prefix} · ${item.slugId} — ${r.skipped}`);
      }
    } catch (err) {
      failed++;
      console.error(`${prefix} ✗ ${item.slugId} — ${err.message}`);
    }
  }
  console.log('');
  console.log(`Done — wrote: ${wrote}, skipped: ${skipped}, failed: ${failed}`);
}

main().catch(err => { console.error(err); process.exit(1); });
