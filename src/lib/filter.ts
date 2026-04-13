import type { MediaItem, MediaType } from '../types/media';

export interface MediaFilterState { types: MediaType[]; tags: string[]; }

export function filterMedia(items: MediaItem[], f: MediaFilterState): MediaItem[] {
  return items.filter(m => {
    const typeOk = f.types.length === 0 || f.types.includes(m.type);
    const tagOk  = f.tags.length  === 0 || m.tags.some(t => f.tags.includes(t));
    return typeOk && tagOk;
  });
}
