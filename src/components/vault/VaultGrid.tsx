import { useState } from 'react';
import type { MediaItem } from '../../types/media';
import { useMediaFilters } from '../../hooks/useMediaFilters';
import { MediaCard } from './MediaCard';
import { MediaLightbox } from './MediaLightbox';
import { VaultFilters } from './VaultFilters';

export function VaultGrid({ items }: { items: MediaItem[] }) {
  const { filtered, state, toggleType, clear } = useMediaFilters(items);
  const [open, setOpen] = useState<MediaItem | null>(null);

  return (
    <div>
      <VaultFilters activeTypes={state.types} onToggleType={toggleType} onClear={clear} />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(m => <MediaCard key={m.id} item={m} onOpen={setOpen} />)}
      </div>
      <MediaLightbox item={open} onClose={() => setOpen(null)} />
    </div>
  );
}
