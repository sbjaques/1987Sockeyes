import type { MediaItem } from '../../types/media';

export function MediaCard({ item, onOpen }: { item: MediaItem; onOpen: (m: MediaItem) => void }) {
  const isDoc = item.type === 'program' || item.type === 'document' || item.type === 'video';
  const filename = item.file.split('/').pop() ?? 'download';
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  return (
    <div className="relative group bg-cream-200 border border-navy/10 hover:border-crimson transition overflow-hidden rounded">
      <button
        onClick={() => isDoc ? window.open(item.file, '_blank', 'noopener,noreferrer') : onOpen(item)}
        className="w-full text-left">
        {isDoc && !item.thumb ? (
          <div className="w-full h-48 flex items-center justify-center bg-navy text-cream">
            <span className="uppercase tracking-widest text-xs">{item.type === 'video' ? 'Video' : 'PDF'}</span>
          </div>
        ) : (
          <div className="relative">
            <img
              src={item.thumb ?? item.file}
              alt={item.caption || item.title}
              loading="lazy"
              className="w-full h-48 object-cover" />
            {isDoc && (
              <span className="absolute top-2 left-2 bg-navy/85 text-cream text-[10px] uppercase tracking-widest px-2 py-1 rounded">
                {item.type === 'video' ? 'Video' : 'PDF'}
              </span>
            )}
          </div>
        )}
        <div className="p-3">
          <div className="text-xs uppercase tracking-wider text-navy/60">{item.type}{item.date ? ` · ${item.date}` : ''}</div>
          <div className="font-semibold group-hover:text-crimson">{item.title}</div>
          {item.publication && <div className="text-sm text-navy/70">{item.publication}</div>}
        </div>
      </button>
      <a
        href={item.file}
        download={filename}
        onClick={handleDownload}
        title={`Download ${filename}`}
        aria-label={`Download ${item.title}`}
        className="absolute top-2 right-2 bg-navy/85 hover:bg-crimson text-cream rounded p-1.5 opacity-0 group-hover:opacity-100 focus:opacity-100 transition">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M10 3a.75.75 0 0 1 .75.75v7.69l2.72-2.72a.75.75 0 1 1 1.06 1.06l-4 4a.75.75 0 0 1-1.06 0l-4-4a.75.75 0 1 1 1.06-1.06l2.72 2.72V3.75A.75.75 0 0 1 10 3Zm-6.75 13a.75.75 0 0 1 .75-.75h12a.75.75 0 0 1 0 1.5H4a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
        </svg>
      </a>
    </div>
  );
}
