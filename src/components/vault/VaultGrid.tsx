import { useState } from 'react';
import type { MediaItem } from '../../types/media';
import { useMediaFilters } from '../../hooks/useMediaFilters';
import { MediaCard } from './MediaCard';
import { MediaLightbox } from './MediaLightbox';
import { VaultFilters } from './VaultFilters';

export function VaultGrid({ items }: { items: MediaItem[] }) {
  const { filtered, state, toggleType, clear } = useMediaFilters(items);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const openable = filtered.filter(m => m.type !== 'program' && m.type !== 'video' && m.type !== 'document');

  const handleOpen = (item: MediaItem) => {
    const i = openable.findIndex(x => x.id === item.id);
    if (i >= 0) setOpenIndex(i);
  };

  return (
    <div>
      <VaultFilters activeTypes={state.types} onToggleType={toggleType} onClear={clear} />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(m => <MediaCard key={m.id} item={m} onOpen={handleOpen} />)}
      </div>
      <MediaLightbox items={openable} index={openIndex} onClose={() => setOpenIndex(null)} />
    </div>
  );
}
