import { describe, it, expect } from 'vitest';
import { loadRoster, loadGames, loadMedia } from './loadData';

describe('data loaders', () => {
  it('returns typed arrays', () => {
    expect(Array.isArray(loadRoster())).toBe(true);
    expect(Array.isArray(loadGames())).toBe(true);
    expect(Array.isArray(loadMedia())).toBe(true);
  });
});
