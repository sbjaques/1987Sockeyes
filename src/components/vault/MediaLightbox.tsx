import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import Download from 'yet-another-react-lightbox/plugins/download';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/captions.css';
import type { MediaItem } from '../../types/media';

export function MediaLightbox({
  items, index, onClose,
}: {
  items: MediaItem[];
  index: number | null;
  onClose: () => void;
}) {
  const open = index !== null;
  const slides = items
    .filter(m => m.type !== 'video' && m.type !== 'program' && m.type !== 'document')
    .map(m => ({
      src: m.file,
      alt: m.caption || m.title,
      title: m.title + (m.publication ? ` — ${m.publication}` : '') + (m.date ? ` (${m.date})` : ''),
      description: m.caption,
      download: { url: m.file, filename: m.file.split('/').pop() ?? `${m.id}.jpg` },
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
