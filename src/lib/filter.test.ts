import { describe, it, expect } from 'vitest';
import { filterMedia } from './filter';
import type { MediaItem } from '../types/media';

const items: MediaItem[] = [
  { id:'a', type:'newspaper', date:'1987-04-01', access:'public', thumb:'/a.jpg', descriptionShort:'A', descriptionLong:'', tags:['centennial-cup'] },
  { id:'b', type:'photo',     date:'1987-05-01', access:'public', thumb:'/b.jpg', descriptionShort:'B', descriptionLong:'', tags:['banner'] },
  { id:'c', type:'newspaper', date:'1987-04-15', access:'public', thumb:'/c.jpg', descriptionShort:'C', descriptionLong:'', tags:['abbott-cup'] },
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
