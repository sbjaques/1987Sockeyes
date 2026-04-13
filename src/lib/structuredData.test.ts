import { describe, it, expect } from 'vitest';
import { teamStructuredData, gameStructuredData } from './structuredData';

describe('structured data', () => {
  it('produces SportsTeam JSON-LD', () => {
    const d = teamStructuredData();
    expect(d['@type']).toBe('SportsTeam');
    expect(d.name).toMatch(/Sockeyes/);
  });
  it('produces SportsEvent JSON-LD', () => {
    const d = gameStructuredData({
      date: '1987-05-10', opponent: 'Humboldt Broncos',
      location: 'Saskatoon, SK', score: { for: 5, against: 3 },
    });
    expect(d['@type']).toBe('SportsEvent');
    expect(d.awayTeam.name).toBe('Humboldt Broncos');
  });
});
