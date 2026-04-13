import { useState } from 'react';
import { Section } from '../components/layout/Section';
import { RosterTable } from '../components/roster/RosterTable';
import { PlayerDetail } from '../components/roster/PlayerDetail';
import { MediaLightbox } from '../components/vault/MediaLightbox';
import { loadRoster, loadGames, loadMedia } from '../lib/loadData';
import { Seo } from '../lib/seo';
import type { RosterEntry } from '../types/roster';
import type { MediaItem } from '../types/media';

export default function RosterPage() {
  const roster = loadRoster();
  const games = loadGames();
  const media = loadMedia();
  const [selected, setSelected] = useState<RosterEntry | null>(null);
  const [mediaIndex, setMediaIndex] = useState<number | null>(null);

  const openableMedia = media.filter(m => m.type !== 'program' && m.type !== 'video' && m.type !== 'document');
  const openMedia = (m: MediaItem) => {
    const i = openableMedia.findIndex(x => x.id === m.id);
    if (i >= 0) setMediaIndex(i);
  };

  return (
    <>
      <Seo title="Roster — 1987 Richmond Sockeyes"
           description="Players, coaches, and staff of the 1987 Centennial Cup champion Richmond Sockeyes with playoff stats." />
      <Section title="Roster & Playoff Stats">
        <p className="text-sm text-navy/70 mb-4">Click any row for player details, game mentions, and linked clippings.</p>
        <RosterTable entries={roster} onRowClick={setSelected} />
      </Section>
      {selected && (
        <PlayerDetail entry={selected} games={games} media={media}
                      onOpenMedia={openMedia}
                      onClose={() => setSelected(null)} />
      )}
      <MediaLightbox items={openableMedia} index={mediaIndex} onClose={() => setMediaIndex(null)} />
    </>
  );
}
