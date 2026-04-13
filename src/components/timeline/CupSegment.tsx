import type { CupSeries, Game } from '../../types/games';
import { GameCard } from './GameCard';

export function CupSegment({ cup, games }: { cup: CupSeries; games: Game[] }) {
  return (
    <div className="mb-12">
      <h3 className="font-display text-2xl mb-4">{cup} Cup</h3>
      <div className="space-y-4">
        {games.map(g => <GameCard key={g.id} game={g} />)}
      </div>
    </div>
  );
}
