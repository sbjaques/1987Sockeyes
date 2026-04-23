import Markdown from 'react-markdown';
import { Fragment, type JSX } from 'react';
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

export interface RenderChapterOptions {
  /** CSS class(es) applied to the first rendered paragraph. */
  firstParagraphClass?: string;
  /** CSS class(es) applied to paragraphs that are chapter CTAs (contain a → arrow link). */
  ctaParagraphClass?: string;
}

/** Return true if the paragraph's text content contains a → arrow (chapter CTA). */
function hasCta(children: React.ReactNode): boolean {
  const flatten = (node: React.ReactNode): string => {
    if (typeof node === 'string') return node;
    if (Array.isArray(node)) return node.map(flatten).join('');
    if (node && typeof node === 'object' && 'props' in (node as any)) {
      return flatten((node as any).props?.children);
    }
    return '';
  };
  return flatten(children).includes('→');
}

export function renderChapter(
  markdown: string,
  items: MediaItem[],
  options: RenderChapterOptions = {},
) {
  const {
    firstParagraphClass = '',
    ctaParagraphClass = '',
  } = options;

  const byId = new Map(items.map(i => [i.id, i]));

  // Pre-process: replace ![](media:id) patterns in the markdown
  // Also strip leading H1 — the page renders it as a styled chapter title.
  const mediaRefs: Map<string, MediaItem | null> = new Map();
  let processed = markdown;
  let tokenIndex = 0;

  // Remove the first H1 line so it doesn't re-render inside the prose block
  processed = processed.replace(/^#\s+.+\n?/, '');

  processed = processed.replace(/!\[\]\(media:([a-zA-Z0-9\-_]+)\)/g, (_match, id) => {
    const token = `MEDIATOKEN${tokenIndex}`;
    mediaRefs.set(token, byId.get(id) ?? null);
    tokenIndex++;
    return token;
  });

  let paragraphIndex = 0;

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

          const isCta = ctaParagraphClass && hasCta(children);
          const isFirst = paragraphIndex === 0 && firstParagraphClass && !isCta;
          paragraphIndex++;

          if (result.length === 0) return null;

          // Unwrap the inner <p> tags and apply class at the top-level wrapper
          const className = isCta
            ? ctaParagraphClass
            : isFirst
            ? firstParagraphClass
            : undefined;

          if (className) {
            // Re-wrap the accumulated result in a single <p> with the class
            const flat = result.flatMap(r => {
              if (typeof r !== 'string' && 'props' in (r as any) && (r as any).type === 'p') {
                return (r as any).props.children;
              }
              return [r];
            });
            return <p className={className}>{flat}</p>;
          }

          return <Fragment>{result}</Fragment>;
        },
        // Render thematic breaks (---) as a subtle divider
        hr: () => (
          <hr className="my-8 border-navy/15" />
        ),
        // Render block italics (used for the chapter coda in ch0) with a distinct style
        em: ({ children }) => <em className="italic">{children}</em>,
      }}
    >
      {processed}
    </Markdown>
  );
}

/** Extract the H1 title from a chapter's markdown string. */
export function extractChapterTitle(markdown: string): string {
  const match = markdown.match(/^#\s+(.+)/m);
  return match ? match[1].trim() : '';
}
