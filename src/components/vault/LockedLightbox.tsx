import type { MediaItem } from '../../types/media';

export function LockedLightbox({ item, onClose }: { item: MediaItem; onClose: () => void }) {
  const subject = encodeURIComponent('1987 Sockeyes archive access request');
  return (
    <div role="dialog" aria-modal="true" aria-label="Locked archive item" className="fixed inset-0 bg-navy/90 z-50 flex items-center justify-center p-4">
      <div className="bg-cream max-w-2xl w-full rounded shadow-xl overflow-hidden">
        <img src={item.thumb} alt="" className="w-full max-h-[55vh] object-contain bg-navy" />
        <div className="p-6">
          <div className="text-xs uppercase tracking-widest text-navy/60 mb-2">
            {item.date}
          </div>
          <p className="text-navy/90 mb-6 leading-relaxed">{item.descriptionLong}</p>
          <div className="border-t border-navy/15 pt-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="text-navy/80 text-sm">
              <span aria-hidden="true">🔒 </span>
              This item is in the private archive.
            </div>
            <div className="flex gap-3">
              <a
                href={`mailto:sbjaques@yahoo.com?subject=${subject}`}
                className="bg-crimson text-cream px-4 py-2 rounded uppercase tracking-widest text-xs hover:bg-crimson/90">
                Request access →
              </a>
              <button
                type="button"
                onClick={onClose}
                className="border border-navy/30 text-navy px-4 py-2 rounded uppercase tracking-widest text-xs hover:border-navy">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
