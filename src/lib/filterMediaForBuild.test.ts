import { describe, it, expect } from 'vitest';
import { filterMediaForBuild } from './filterMediaForBuild';
import type { MediaItem } from '../types/media';

const publicItem: MediaItem = {
  id: 'a', type: 'newspaper', date: '1987-04-29', access: 'public',
  thumb: 't.jpg', descriptionShort: 'Public item short.', descriptionLong: 'x'.repeat(90),
  url: 'full.jpg', attribution: { paper: 'Vancouver Sun' }, tags: [],
};

const privateItem: MediaItem = {
  id: 'b', type: 'newspaper', date: '1987-04-29', access: 'private',
  thumb: 't2.jpg', descriptionShort: 'Private item short.', descriptionLong: 'y'.repeat(90),
  url: 'scan.jpg', attribution: { paper: 'Nanaimo Daily News', headline: 'Secret' }, tags: [],
};

describe('filterMediaForBuild', () => {
  it('returns items unchanged in private mode', () => {
    const result = filterMediaForBuild([publicItem, privateItem], 'private');
    expect(result).toEqual([publicItem, privateItem]);
  });

  it('strips url and attribution from private items in public mode', () => {
    const [pub, priv] = filterMediaForBuild([publicItem, privateItem], 'public');
    expect(pub).toEqual(publicItem);
    expect(priv.id).toBe('b');
    expect(priv.access).toBe('private');
    expect(priv.thumb).toBe('t2.jpg');
    expect(priv.descriptionShort).toBe('Private item short.');
    expect(priv.url).toBeUndefined();
    expect(priv.attribution).toBeUndefined();
  });

  it('leaves public items unmodified in public mode', () => {
    const [pub] = filterMediaForBuild([publicItem], 'public');
    expect(pub.url).toBe('full.jpg');
    expect(pub.attribution?.paper).toBe('Vancouver Sun');
  });
});
