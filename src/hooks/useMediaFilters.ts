import { useMemo, useState } from 'react';
import { filterMedia, type MediaFilterState } from '../lib/filter';
import type { MediaItem, MediaType } from '../types/media';

export function useMediaFilters(items: MediaItem[]) {
  const [state, setState] = useState<MediaFilterState>({ types: [], tags: [] });
  const toggleType = (t: MediaType) =>
    setState(s => ({ ...s, types: s.types.includes(t) ? s.types.filter(x => x !== t) : [...s.types, t] }));
  const toggleTag = (t: string) =>
    setState(s => ({ ...s, tags: s.tags.includes(t) ? s.tags.filter(x => x !== t) : [...s.tags, t] }));
  const clear = () => setState({ types: [], tags: [] });
  const filtered = useMemo(() => filterMedia(items, state), [items, state]);
  return { filtered, state, toggleType, toggleTag, clear };
}
