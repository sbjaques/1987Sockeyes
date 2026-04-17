import type { Game } from '../../types/games';
import { linkifyImageRefs } from '../../lib/linkifyImageRefs';

export function GameCard({ game }: { game: Game }) {
  return (
    <article className="border-l-4 border-crimson pl-4 py-3">
      <div className="text-xs uppercase tracking-wider text-navy/60">{game.date} · {game.round}</div>
      <div className="font-display text-lg">vs {game.opponent}</div>
      <div className="text-sm">{game.location}</div>
      <div className={`mt-1 font-semibold ${game.result === 'W' ? 'text-crimson' : 'text-navy/70'}`}>
        {game.result} {game.score.for}–{game.score.against}
      </div>
      {game.highlights.length > 0 && (
        <ul className="mt-2 text-sm list-disc list-inside">
          {game.highlights.map((h, i) => <li key={i}>{linkifyImageRefs(h)}</li>)}
        </ul>
      )}
    </article>
  );
}
