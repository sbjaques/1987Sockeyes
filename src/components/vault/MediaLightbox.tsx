import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import Download from 'yet-another-react-lightbox/plugins/download';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/captions.css';
import type { MediaItem } from '../../types/media';
import { BUILD_MODE } from '../../lib/buildMode';
import { LeaveNoteButton } from '../comments/LeaveNoteButton';
import { LockedLightbox } from './LockedLightbox';

export function MediaLightbox({
  items, index, onClose,
}: {
  items: MediaItem[];
  index: number | null;
  onClose: () => void;
}) {
  const open = index !== null;

  // On the public tier, private items have no URL (stripped by the build-time
  // filter) and shouldn't be openable anyway — route to LockedLightbox so the
  // visitor sees the "request access" CTA. On the private tier, the user has
  // already passed CF Access; let private items fall through to the regular
  // Lightbox so they get zoom + download like everything else.
  const active = index !== null ? items[index] : undefined;
  if (active && active.access === 'private' && BUILD_MODE === 'public') {
    return <LockedLightbox item={active} onClose={onClose} />;
  }

  const viewable = items.filter(
    m => m.type !== 'video' && m.type !== 'program' && m.type !== 'document' && m.url
  );

  // `index` indexes into `items` (the caller's openable list, which may include
  // private items that get stripped out of `viewable`). Look up the active
  // item's position in `viewable` so the Lightbox opens on the clicked slide.
  const viewableIndex = active ? viewable.findIndex(v => v.id === active.id) : -1;

  if (viewable.length === 0 || index === null || viewableIndex < 0) {
    return (
      <Lightbox
        open={false}
        close={onClose}
        slides={[]}
        plugins={[Zoom, Captions, Download]}
      />
    );
  }

  const slides = viewable.map(m => ({
    src: m.url as string,
    alt: m.descriptionLong || m.descriptionShort,
    title: m.descriptionShort + (m.attribution?.paper ? ` — ${m.attribution.paper}` : '') + (m.date ? ` (${m.date})` : ''),
    description: m.descriptionLong,
    download: { url: m.url as string, filename: (m.url as string).split('/').pop() ?? `${m.id}.jpg` },
  }));

  return (
    <>
      <Lightbox
        open={open}
        close={onClose}
        slides={slides}
        index={viewableIndex}
        plugins={[Zoom, Captions, Download]}
        zoom={{ maxZoomPixelRatio: 4, zoomInMultiplier: 2, doubleTapDelay: 300, doubleClickDelay: 300, doubleClickMaxStops: 2, keyboardMoveDistance: 50, wheelZoomDistanceFactor: 100, pinchZoomDistanceFactor: 100, scrollToZoom: true }}
        carousel={{ finite: true }}
      />
      {open && BUILD_MODE === 'private' && active && (
        <div className="fixed bottom-6 right-6 z-40 pointer-events-auto">
          <LeaveNoteButton
            target={`media:${active.id}`}
            targetLabel={`${active.attribution?.paper ?? active.type}${active.date ? ' · ' + active.date : ''}`}
            variant="pill"
          />
        </div>
      )}
    </>
  );
}
