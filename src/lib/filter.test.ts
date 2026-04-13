import { describe, it, expect } from 'vitest';
import { filterMedia } from './filter';
import type { MediaItem } from '../types/media';

const items: MediaItem[] = [
  { id:'a', type:'newspaper', title:'A', file:'/a.jpg', caption:'', tags:['centennial-cup'] },
  { id:'b', type:'photo',     title:'B', file:'/b.jpg', caption:'', tags:['banner'] },
  { id:'c', type:'newspaper', title:'C', file:'/c.jpg', caption:'', tags:['abbott-cup'] },
];

describe('filterMedia', () => {
  it('returns all when filters empty', () => {
    expect(filterMedia(items, { types: [], tags: [] })).toHaveLength(3);
  });
  it('filters by type', () => {
    expect(filterMedia(items, { types: ['newspaper'], tags: [] })).toHaveLength(2);
  });
  it('filters by tag', () => {
    expect(filterMedia(items, { types: [], tags: ['banner'] })).toHaveLength(1);
  });
  it('AND across dimensions, OR within', () => {
    expect(filterMedia(items, { types: ['newspaper'], tags: ['centennial-cup','abbott-cup'] })).toHaveLength(2);
  });
});
