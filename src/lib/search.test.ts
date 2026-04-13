import { describe, it, expect } from 'vitest';
import { buildSearchIndex } from './search';

const roster = [
  { id:'frank-furlan', name:'Frank Furlan', position:'F' as const, hometown:'Richmond, BC', role:'player' as const,
    playoffStats:{ gp:0,g:0,a:0,pts:0,pim:0 } },
  { id:'orland-kurtenbach', name:'Orland Kurtenbach', hometown:'', role:'head-coach' as const },
];
const games = [
  { id:'g1', date:'1987-05-10', series:'Centennial' as const, round:'Final' as const, opponent:'Humboldt Broncos',
    location:'Saskatoon, SK', result:'W' as const, score:{for:5,against:2}, highlights:['Victory secured'], sources:[] },
];
const media = [
  { id:'m1', type:'newspaper' as const, title:'Sockeyes win Centennial Cup', publication:'The Vancouver Sun',
    file:'/a.jpg', caption:'Championship headline', tags:['centennial-cup','final'] },
];

describe('buildSearchIndex', () => {
  const idx = buildSearchIndex(roster, games, media);

  it('finds a player by name', () => {
    const results = idx.search('Furlan');
    expect(results.some(r => r.kind === 'player' && r.id === 'frank-furlan')).toBe(true);
  });
  it('finds a coach', () => {
    const results = idx.search('Kurtenbach');
    expect(results.some(r => r.kind === 'staff')).toBe(true);
  });
  it('finds a game by opponent', () => {
    const results = idx.search('Humboldt');
    expect(results.some(r => r.kind === 'game')).toBe(true);
  });
  it('finds media by publication', () => {
    const results = idx.search('Vancouver Sun');
    expect(results.some(r => r.kind === 'media')).toBe(true);
  });
  it('empty query returns empty', () => {
    expect(idx.search('')).toEqual([]);
  });
});
