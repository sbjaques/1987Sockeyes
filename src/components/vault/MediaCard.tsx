import type { MediaItem } from '../../types/media';

export function MediaCard({ item, onOpen }: { item: MediaItem; onOpen: (m: MediaItem) => void }) {
  const isDoc = item.type === 'program' || item.type === 'document' || item.type === 'video';
  return (
    <button
      onClick={() => isDoc ? window.open(item.file, '_blank', 'noopener,noreferrer') : onOpen(item)}
      className="group text-left bg-cream-200 border border-navy/10 hover:border-crimson transition overflow-hidden rounded">
      {isDoc ? (
        <div className="w-full h-48 flex items-center justify-center bg-navy text-cream">
          <span className="uppercase tracking-widest text-xs">{item.type === 'video' ? 'Video' : 'PDF'}</span>
        </div>
      ) : (
        <img
          src={item.thumb ?? item.file}
          alt={item.caption || item.title}
          loading="lazy"
          className="w-full h-48 object-cover" />
      )}
      <div className="p-3">
        <div className="text-xs uppercase tracking-wider text-navy/60">{item.type}{item.date ? ` · ${item.date}` : ''}</div>
        <div className="font-semibold group-hover:text-crimson">{item.title}</div>
        {item.publication && <div className="text-sm text-navy/70">{item.publication}</div>}
      </div>
    </button>
  );
}
