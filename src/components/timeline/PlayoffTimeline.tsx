import type { CupSeries, Game } from '../../types/games';
import { CupSegment } from './CupSegment';

const ORDER: CupSeries[] = ['Mowat', 'Doyle', 'Abbott', 'Centennial'];

export function PlayoffTimeline({ games }: { games: Game[] }) {
  const byCup = new Map<CupSeries, Game[]>();
  for (const g of games) {
    if (!byCup.has(g.series)) byCup.set(g.series, []);
    byCup.get(g.series)!.push(g);
  }
  for (const list of byCup.values()) list.sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div>
      {ORDER.filter(c => byCup.has(c)).map(c => (
        <CupSegment key={c} cup={c} games={byCup.get(c)!} />
      ))}
    </div>
  );
}
