import Markdown from 'react-markdown';
import { Fragment } from 'react';
import type { MediaItem } from '../types/media';

function MediaEmbed({ item }: { item: MediaItem | null }) {
  if (!item) return <span className="italic text-navy/60">(private item)</span>;
  return (
    <figure className="my-6 bg-cream-200 border border-navy/10 rounded overflow-hidden">
      <img src={item.thumb} alt={item.descriptionShort} className="w-full h-auto" loading="lazy" />
      <figcaption className="p-3 text-sm text-navy/80">
        <span>{item.descriptionShort}</span>
        {item.date && <span>{` — ${item.date}`}</span>}
      </figcaption>
    </figure>
  );
}

export function renderChapter(markdown: string, items: MediaItem[]) {
  const byId = new Map(items.map(i => [i.id, i]));

  // Pre-process: replace ![](media:id) patterns in the markdown
  const mediaRefs: Map<string, MediaItem | null> = new Map();
  let processed = markdown;
  let tokenIndex = 0;

  processed = processed.replace(/!\[\]\(media:([a-zA-Z0-9\-_]+)\)/g, (match, id) => {
    const token = `MEDIATOKEN${tokenIndex}`;
    mediaRefs.set(token, byId.get(id) ?? null);
    tokenIndex++;
    return token;
  });

  return (
    <Markdown
      components={{
        p: ({ children }) => {
          const result: (JSX.Element | string)[] = [];
          const buffer: (JSX.Element | string)[] = [];

          const flushBuffer = () => {
            if (buffer.length > 0) {
              result.push(
                <p key={`p-${result.length}`}>
                  {buffer.splice(0)}
                </p>,
              );
            }
          };

          // Process text in paragraph
          const processChild = (child: any) => {
            if (typeof child === 'string') {
              // Split by token pattern
              const parts = child.split(/(MEDIATOKEN\d+)/);
              parts.forEach((part) => {
                if (mediaRefs.has(part)) {
                  flushBuffer();
                  result.push(<MediaEmbed key={part} item={mediaRefs.get(part) ?? null} />);
                } else if (part) {
                  buffer.push(part);
                }
              });
            } else {
              buffer.push(child);
            }
          };

          if (Array.isArray(children)) {
            children.forEach(processChild);
          } else {
            processChild(children);
          }

          flushBuffer();
          return result.length > 0 ? <Fragment>{result}</Fragment> : null;
        },
      }}
    >
      {processed}
    </Markdown>
  );
}
