import type { MediaItem } from '../../types/media';

function LockIcon() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block align-middle mr-1.5 shrink-0"
    >
      <rect x="3" y="7" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="11" r="1" fill="currentColor" />
    </svg>
  );
}

export function LockedLightbox({ item, onClose }: { item: MediaItem; onClose: () => void }) {
  return (
    <div role="dialog" aria-modal="true" aria-label="Locked archive item" className="fixed inset-0 bg-navy/90 z-50 flex items-center justify-center p-4">
      <div className="bg-cream max-w-2xl w-full rounded shadow-xl overflow-hidden">
        {/* Thumb with subtle crimson frame */}
        <div className="border-2 border-crimson/30">
          <img src={item.thumb} alt="" className="w-full max-h-[55vh] object-contain bg-navy" />
        </div>
        <div className="p-6">
          <div className="text-xs uppercase tracking-widest text-navy/60 mb-2">
            {item.type}{item.date ? ` · ${item.date}` : ''}
          </div>
          <p className="text-navy/90 mb-6 leading-relaxed">{item.descriptionShort}</p>
          <div className="border-t border-navy/15 pt-4">
            <div className="flex items-center text-navy/70 text-sm mb-4">
              <LockIcon />
              This item is in the private archive.
            </div>
            <div className="flex gap-3 flex-wrap">
              <button
                type="button"
                onClick={onClose}
                className="border border-navy/30 text-navy px-5 py-2 text-xs uppercase tracking-widest hover:border-navy">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
