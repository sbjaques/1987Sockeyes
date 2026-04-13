import { describe, it, expect } from 'vitest';
import { sortBy } from './sort';

describe('sortBy', () => {
  const data = [{ n: 'b', v: 2 }, { n: 'a', v: 1 }, { n: 'c', v: 3 }];
  it('sorts numeric ascending', () => {
    expect(sortBy(data, 'v', 'asc').map(d => d.v)).toEqual([1, 2, 3]);
  });
  it('sorts numeric descending', () => {
    expect(sortBy(data, 'v', 'desc').map(d => d.v)).toEqual([3, 2, 1]);
  });
  it('sorts string ascending case-insensitive', () => {
    expect(sortBy(data, 'n', 'asc').map(d => d.n)).toEqual(['a','b','c']);
  });
  it('does not mutate input', () => {
    const input = [...data];
    sortBy(input, 'v', 'desc');
    expect(input.map(d => d.v)).toEqual([2,1,3]);
  });
});
