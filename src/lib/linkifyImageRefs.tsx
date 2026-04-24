import type { ReactNode } from 'react';
import imageIndex from '../data/imageIndex.json';
import { BUILD_MODE } from './buildMode';

const IMAGE_ID_RE = /\d{7,}/g;
// Private tier resolves image-id refs to R2-backed /media/scans/ served by the
// archive Worker behind CF Access. Public tier renders them as plain citation
// text — the full-page JPGs live in a private companion repo and the OCR
// markdown also lives under the private-tier content tree, neither suitable
// for public linking.
const PRIVATE_SCAN_BASE = '/media/scans/';

type IndexEntry = { filename: string; date?: string; image?: boolean };
const index = imageIndex as Record<string, IndexEntry>;

function privateUrlForImageId(id: string): { href: string; title: string } | null {
  const entry = index[id];
  if (entry?.image) {
    const datePrefix = entry.date ? `[${entry.date}] ` : '';
    return {
      href: `${PRIVATE_SCAN_BASE}${id}.jpg`,
      title: `${datePrefix}View newspaper scan: ${entry.filename.replace(/\.md$/, '.jpg')}`,
    };
  }
  return null;
}

export function linkifyImageRefs(text: string | undefined): ReactNode {
  if (!text) return text ?? null;
  const parts: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const m of text.matchAll(IMAGE_ID_RE)) {
    const id = m[0];
    const idx = m.index ?? 0;
    if (idx > last) parts.push(text.slice(last, idx));

    const link = BUILD_MODE === 'private' ? privateUrlForImageId(id) : null;
    if (link) {
      parts.push(
        <a
          key={key++}
          href={link.href}
          title={link.title}
          target="_blank"
          rel="noopener noreferrer"
          className="text-crimson underline decoration-dotted underline-offset-2 hover:decoration-solid"
        >
          {id}
        </a>
      );
    } else {
      // Public tier (or unknown id): keep as plain citation text, muted.
      parts.push(
        <span key={key++} className="text-navy/55 tabular-nums">{id}</span>
      );
    }
    last = idx + id.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

// Preprocess for Markdown rendering. On private tier, archived image IDs
// become Markdown links. On public tier (or for IDs we don't have archived),
// we strip backticks but leave the ID as bare text (no Markdown link syntax),
// so ReactMarkdown renders them as inline citation text rather than URLs.
export function linkifyImageRefsToMarkdown(text: string): string {
  const stripped = text.replace(/`(\d{7,})`/g, '$1');
  if (BUILD_MODE !== 'private') return stripped;
  return stripped.replace(/\d{7,}/g, (id) => {
    const link = privateUrlForImageId(id);
    if (!link) return id;
    const escapedTitle = link.title.replace(/"/g, '\\"');
    return `[${id}](${link.href} "${escapedTitle}")`;
  });
}
