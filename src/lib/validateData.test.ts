import { describe, it, expect } from 'vitest';
import { validateRoster, validateGames, validateMedia, assertValid } from './validateData';

describe('schema validators', () => {
  it('accepts a valid skater', () => {
    const ok = [{ id: 'x', name: 'X', position: 'F', hometown: 'Richmond, BC', role: 'player',
                  playoffStats: { gp:1,g:0,a:0,pts:0,pim:0 } }];
    expect(validateRoster(ok)).toBe(true);
  });
  it('rejects a skater with bad stats', () => {
    const bad = [{ id: 'x', name: 'X', position: 'F', hometown: 'Y', role: 'player',
                   playoffStats: { gp: -1, g:0, a:0, pts:0, pim:0 } }];
    expect(validateRoster(bad)).toBe(false);
  });
  it('accepts a valid game', () => {
    const ok = [{ id:'g1', date:'1987-05-10', series:'Centennial', round:'Final',
                  opponent:'Humboldt', location:'Saskatoon, SK', result:'W',
                  score:{for:5,against:3}, highlights:[], sources:[] }];
    expect(validateGames(ok)).toBe(true);
  });
  it('accepts a valid media item', () => {
    const ok = [{ id:'m1', type:'newspaper', title:'X', file:'/a.jpg', caption:'c', tags:[] }];
    expect(validateMedia(ok)).toBe(true);
  });
  it('assertValid throws on invalid data', () => {
    expect(() => assertValid(validateRoster, [{}], 'roster')).toThrow();
  });
});
