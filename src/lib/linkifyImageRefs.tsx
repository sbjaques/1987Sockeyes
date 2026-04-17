import type { ReactNode } from 'react';

const IMAGE_ID_RE = /\d{7,}/g;

export function linkifyImageRefs(text: string | undefined): ReactNode {
  if (!text) return text ?? null;
  const parts: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const m of text.matchAll(IMAGE_ID_RE)) {
    const id = m[0];
    const idx = m.index ?? 0;
    if (idx > last) parts.push(text.slice(last, idx));
    parts.push(
      <a
        key={key++}
        href={`https://www.newspapers.com/image/${id}/`}
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
