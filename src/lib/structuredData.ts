export function teamStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsTeam',
    name: 'Richmond Sockeyes (1987)',
    sport: 'Ice Hockey',
    award: ['Centennial Cup 1987', 'Abbott Cup 1987', 'Mowat Cup 1987'],
    location: { '@type': 'Place', address: 'Richmond, British Columbia, Canada' },
  };
}

export function gameStructuredData(g: {
  date: string; opponent: string; location: string; score: { for: number; against: number };
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `Richmond Sockeyes vs ${g.opponent}`,
    startDate: g.date,
    location: { '@type': 'Place', name: g.location },
    homeTeam: { '@type': 'SportsTeam', name: 'Richmond Sockeyes' },
    awayTeam: { '@type': 'SportsTeam', name: g.opponent },
  };
}
