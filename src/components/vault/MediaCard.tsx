import type { MediaItem } from '../../types/media';
import { BUILD_MODE } from '../../lib/buildMode';

export function MediaCard({ item, onOpen }: { item: MediaItem; onOpen: (m: MediaItem) => void }) {
  const isDoc = item.type === 'program' || item.type === 'document' || item.type === 'video';
  const filename = item.url?.split('/').pop() ?? 'download';
  const handleDownload = (e: React.MouseEvent) => e.stopPropagation();

  const thumbImg = (
    <img
      src={item.thumb}
      alt={item.descriptionShort}
      loading="lazy"
      className="w-full h-48 object-cover"
    />
  );

  return (
    <div className="relative group bg-cream-200 border border-navy/10 hover:border-crimson transition overflow-hidden rounded">
      <button
        onClick={() => {
          if (isDoc && item.url) {
            window.open(item.url, '_blank', 'noopener,noreferrer');
          } else {
            onOpen(item);
          }
        }}
        className="w-full text-left">
        <div className="relative">
          {thumbImg}
          {item.access === 'private' && (
            <span
              aria-label="Private archive item"
              className="absolute top-2 left-2 bg-crimson text-cream text-[10px] uppercase tracking-widest px-2 py-1 rounded flex items-center gap-1">
              <span aria-hidden="true">🔒</span>
              <span className="sr-only">Locked</span>
            </span>
          )}
          {isDoc && (
            <span className={`absolute top-2 ${item.access === 'private' ? 'left-12' : 'left-2'} bg-navy/85 text-cream text-[10px] uppercase tracking-widest px-2 py-1 rounded`}>
              {item.type === 'video' ? 'Video' : 'PDF'}
            </span>
          )}
          {item.needsReview && BUILD_MODE === 'private' && (
            <span
              title="AI-drafted description — not yet editor-reviewed"
              className="absolute bottom-2 right-2 bg-amber-500/90 text-black text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded">
              AI draft
            </span>
          )}
        </div>
        <div className="p-3">
          <div className="text-xs uppercase tracking-wider text-navy/60">
            {item.type}{item.date ? ` · ${item.date}` : ''}
          </div>
          <div className="font-semibold group-hover:text-crimson line-clamp-2">
            {item.descriptionShort}
          </div>
          {item.attribution?.paper && (
            <div className="text-sm text-navy/70">{item.attribution.paper}</div>
          )}
        </div>
      </button>
      {item.url && (
        <a
          href={item.url}
          download={filename}
          onClick={handleDownload}
          title={`Download ${filename}`}
          aria-label={`Download item`}
          className="absolute top-2 right-2 bg-navy/85 hover:bg-crimson text-cream rounded p-1.5 opacity-0 group-hover:opacity-100 focus:opacity-100 transition">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M10 3a.75.75 0 0 1 .75.75v7.69l2.72-2.72a.75.75 0 1 1 1.06 1.06l-4 4a.75.75 0 0 1-1.06 0l-4-4a.75.75 0 1 1 1.06-1.06l2.72 2.72V3.75A.75.75 0 0 1 10 3Zm-6.75 13a.75.75 0 0 1 .75-.75h12a.75.75 0 0 1 0 1.5H4a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
          </svg>
        </a>
      )}
    </div>
  );
}
