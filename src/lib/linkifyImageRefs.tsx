import type { ReactNode } from 'react';
import imageIndex from '../data/imageIndex.json';

const IMAGE_ID_RE = /\d{7,}/g;
const REPO_BLOB_BASE = 'https://github.com/sbjaques/1987Sockeyes/blob/main/docs/extractions/';
const NEWSPAPERS_FALLBACK = 'https://www.newspapers.com/image/';

const index = imageIndex as Record<string, string>;

function urlForImageId(id: string): { href: string; title: string } {
  const file = index[id];
  if (file) {
    return {
      href: REPO_BLOB_BASE + file,
      title: `View local OCR extraction: ${file}`,
    };
  }
  return {
    href: `${NEWSPAPERS_FALLBACK}${id}/`,
    title: 'Open on newspapers.com (subscription required)',
  };
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
    const { href, title } = urlForImageId(id);
    parts.push(
      <a
        key={key++}
        href={href}
        title={title}
        target="_blank"
        rel="noopener noreferrer"
        className="text-crimson underline decoration-dotted underline-offset-2 hover:decoration-solid"
      >
        {id}
      </a>
    );
    last = idx + id.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}
