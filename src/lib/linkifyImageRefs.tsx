import type { ReactNode } from 'react';
import imageIndex from '../data/imageIndex.json';

const IMAGE_ID_RE = /\d{7,}/g;
const IMAGES_RAW_BASE = 'https://raw.githubusercontent.com/sbjaques/1987Sockeyes-images/main/';
const OCR_BLOB_BASE = 'https://github.com/sbjaques/1987Sockeyes/blob/main/docs/extractions/';
const NEWSPAPERS_FALLBACK = 'https://www.newspapers.com/image/';

type IndexEntry = { filename: string; image?: boolean };
const index = imageIndex as Record<string, IndexEntry>;

function urlForImageId(id: string): { href: string; title: string } {
  const entry = index[id];
  if (entry?.image) {
    return {
      href: `${IMAGES_RAW_BASE}${id}.jpg`,
      title: `View newspaper scan: ${entry.filename.replace(/\.md$/, '.jpg')}`,
    };
  }
  if (entry) {
    return {
      href: OCR_BLOB_BASE + entry.filename,
      title: `View OCR extraction: ${entry.filename}`,
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

// Preprocess for Markdown rendering: turn bare 7+-digit image IDs into
// markdown link syntax so ReactMarkdown renders them as real links.
// Also strips backticks around bare IDs (some drafts wrap them in `backticks`
// for monospace, which would otherwise hide the link inside <code>).
export function linkifyImageRefsToMarkdown(text: string): string {
  const stripped = text.replace(/`(\d{7,})`/g, '$1');
  return stripped.replace(/\d{7,}/g, (id) => {
    const { href, title } = urlForImageId(id);
    // Markdown link with title attribute: [text](url "title")
    const escapedTitle = title.replace(/"/g, '\\"');
    return `[${id}](${href} "${escapedTitle}")`;
  });
}
