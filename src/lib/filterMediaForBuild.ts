import type { MediaItem } from '../types/media';

export type BuildMode = 'public' | 'private';

export function filterMediaForBuild(items: MediaItem[], mode: BuildMode): MediaItem[] {
  if (mode === 'private') return items;
  return items.map(item => {
    if (item.access === 'public') return item;
    const { url: _url, attribution: _attr, ...rest } = item;
    return rest as MediaItem;
  });
}
