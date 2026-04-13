import { useEffect } from 'react';
import type { MediaItem } from '../../types/media';

export function MediaLightbox({ item, onClose }: { item: MediaItem | null; onClose: () => void }) {
  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [item, onClose]);

  if (!item) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label={item.title}
         className="fixed inset-0 bg-navy-900/90 flex items-center justify-center p-6 z-50"
         onClick={onClose}>
      <figure className="max-w-5xl max-h-full" onClick={e => e.stopPropagation()}>
        <img src={item.file} alt={item.caption || item.title} className="max-h-[80vh] w-auto mx-auto" />
        <figcaption className="text-cream text-sm mt-3">
          <strong>{item.title}</strong>{item.publication ? ` — ${item.publication}` : ''}{item.date ? ` (${item.date})` : ''}
          <p className="opacity-80">{item.caption}</p>
        </figcaption>
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-crimson text-cream">Close</button>
      </figure>
    </div>
  );
}
