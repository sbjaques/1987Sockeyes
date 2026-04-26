import { useMemo, useState } from 'react';
import type { MediaItem } from '../../types/media';
import { useMediaFilters } from '../../hooks/useMediaFilters';
import { useCommentCounts } from '../../hooks/useCommentCounts';
import { MediaCard } from './MediaCard';
import { MediaLightbox } from './MediaLightbox';
import { VaultFilters, type AccessFilter } from './VaultFilters';

export function VaultGrid({ items }: { items: MediaItem[] }) {
  const { byTarget: commentCounts } = useCommentCounts();
  const sorted = useMemo(
    () => [...items].sort((a, b) => (a.date ?? '9999').localeCompare(b.date ?? '9999')),
    [items]
  );
  const { filtered, state, toggleType, clear } = useMediaFilters(sorted);
  const [accessFilter, setAccessFilter] = useState<AccessFilter>('all');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const accessFiltered = useMemo(() => {
    if (accessFilter === 'all') return filtered;
    return filtered.filter(m => m.access === accessFilter);
  }, [filtered, accessFilter]);

  // Private items are always openable so MediaLightbox can route them to LockedLightbox.
  // Public programs/videos/documents open in a new tab (handled in MediaCard), so exclude them.
  const openable = accessFiltered.filter(
    m => m.access === 'private' || (m.type !== 'program' && m.type !== 'video' && m.type !== 'document')
  );

  const handleOpen = (item: MediaItem) => {
    const i = openable.findIndex(x => x.id === item.id);
    if (i >= 0) setOpenIndex(i);
  };

  return (
    <div>
      <VaultFilters
        activeTypes={state.types}
        onToggleType={toggleType}
        onClear={clear}
        accessFilter={accessFilter}
        onSetAccessFilter={setAccessFilter}
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {accessFiltered.map(m => (
          <MediaCard key={m.id} item={m} onOpen={handleOpen} commentCount={commentCounts[`media:${m.id}`]} />
        ))}
      </div>
      <MediaLightbox items={openable} index={openIndex} onClose={() => setOpenIndex(null)} />
    </div>
  );
}
