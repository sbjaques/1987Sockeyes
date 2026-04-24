import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import Download from 'yet-another-react-lightbox/plugins/download';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/captions.css';
import type { MediaItem } from '../../types/media';
import { LockedLightbox } from './LockedLightbox';

export function MediaLightbox({
  items, index, onClose,
}: {
  items: MediaItem[];
  index: number | null;
  onClose: () => void;
}) {
  const open = index !== null;

  // Route private items to LockedLightbox before the URL filter strips them out.
  const active = index !== null ? items[index] : undefined;
  if (active && active.access === 'private') {
    return <LockedLightbox item={active} onClose={onClose} />;
  }

  const viewable = items.filter(
    m => m.type !== 'video' && m.type !== 'program' && m.type !== 'document' && m.url
  );

  if (viewable.length === 0 || index === null) {
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
    <Lightbox
      open={open}
      close={onClose}
      slides={slides}
      index={index ?? 0}
      plugins={[Zoom, Captions, Download]}
      zoom={{ maxZoomPixelRatio: 4, zoomInMultiplier: 2, doubleTapDelay: 300, doubleClickDelay: 300, doubleClickMaxStops: 2, keyboardMoveDistance: 50, wheelZoomDistanceFactor: 100, pinchZoomDistanceFactor: 100, scrollToZoom: true }}
      carousel={{ finite: true }}
    />
  );
}
