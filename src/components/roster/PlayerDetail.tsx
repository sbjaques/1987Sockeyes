import { useMemo } from 'react';
import type { RosterEntry } from '../../types/roster';
import type { Game } from '../../types/games';
import type { MediaItem } from '../../types/media';
import { isSkater, isGoalie } from '../../types/roster';

export function PlayerDetail({
  entry, games, media, onOpenMedia, onClose,
}: {
  entry: RosterEntry;
  games: Game[];
  media: MediaItem[];
  onOpenMedia: (m: MediaItem) => void;
  onClose: () => void;
}) {
  const mentions = useMemo(() => {
    const needle = entry.name.toLowerCase();
    const last = entry.name.split(' ').slice(-1)[0].toLowerCase();
    return {
      games: games.filter(g =>
        g.highlights.some(h => h.toLowerCase().includes(needle) || h.toLowerCase().includes(last))
      ),
      media: media.filter(m =>
        (m.caption || '').toLowerCase().includes(needle) ||
        (m.caption || '').toLowerCase().includes(last) ||
        (m.title || '').toLowerCase().includes(needle) ||
        (m.title || '').toLowerCase().includes(last)
      ),
    };
  }, [entry, games, media]);

  return (
    <div role="dialog" aria-modal="true" aria-label={entry.name}
         className="fixed inset-0 z-50 bg-navy-900/80 flex items-center justify-center p-4"
         onClick={onClose}>
      <div className="bg-cream text-navy max-w-2xl w-full max-h-[85vh] overflow-auto rounded shadow-xl p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl">{entry.name}</h2>
            <div className="text-sm text-navy/70 mt-1">
              {entry.number ? `#${entry.number} · ` : ''}
              {isSkater(entry) ? (entry.position === 'F' ? 'Forward' : 'Defence') : isGoalie(entry) ? 'Goaltender' : entry.role.replace('-', ' ')}
              {entry.hometown ? ` · ${entry.hometown}` : ''}
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="px-3 py-1 bg-crimson text-cream">Close</button>
        </div>

        {isSkater(entry) && (
          <div className="mt-4 grid grid-cols-5 gap-2 text-center text-sm bg-cream-200 p-3 rounded">
            <div><div className="text-xs text-navy/60">GP</div><div className="font-semibold">{entry.playoffStats.gp}</div></div>
            <div><div className="text-xs text-navy/60">G</div><div className="font-semibold">{entry.playoffStats.g}</div></div>
            <div><div className="text-xs text-navy/60">A</div><div className="font-semibold">{entry.playoffStats.a}</div></div>
            <div><div className="text-xs text-navy/60">Pts</div><div className="font-semibold">{entry.playoffStats.pts}</div></div>
            <div><div className="text-xs text-navy/60">PIM</div><div className="font-semibold">{entry.playoffStats.pim}</div></div>
          </div>
        )}
        {isGoalie(entry) && (
          <div className="mt-4 grid grid-cols-6 gap-2 text-center text-sm bg-cream-200 p-3 rounded">
            <div><div className="text-xs text-navy/60">GP</div><div className="font-semibold">{entry.playoffStats.gp}</div></div>
            <div><div className="text-xs text-navy/60">W</div><div className="font-semibold">{entry.playoffStats.w}</div></div>
            <div><div className="text-xs text-navy/60">L</div><div className="font-semibold">{entry.playoffStats.l}</div></div>
            <div><div className="text-xs text-navy/60">GAA</div><div className="font-semibold">{entry.playoffStats.gaa.toFixed(2)}</div></div>
            <div><div className="text-xs text-navy/60">Sv%</div><div className="font-semibold">{entry.playoffStats.svpct.toFixed(3)}</div></div>
            <div><div className="text-xs text-navy/60">SO</div><div className="font-semibold">{entry.playoffStats.so}</div></div>
          </div>
        )}

        {entry.notes && <p className="mt-4">{entry.notes}</p>}

        <h3 className="font-display text-xl mt-6 mb-2">Games mentioned</h3>
        {mentions.games.length === 0 ? (
          <p className="text-sm text-navy/60">No game entries reference this player yet.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {mentions.games.map(g => (
              <li key={g.id}>
                <span className="font-semibold">{g.series} Cup</span> — vs {g.opponent} ({g.date}), {g.result} {g.score.for}–{g.score.against}
              </li>
            ))}
          </ul>
        )}

        <h3 className="font-display text-xl mt-6 mb-2">Clippings mentioning {entry.name.split(' ').slice(-1)[0]}</h3>
        {mentions.media.length === 0 ? (
          <p className="text-sm text-navy/60">No clippings reference this player yet.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-2">
            {mentions.media.map(m => (
              <li key={m.id}>
                <button onClick={() => onOpenMedia(m)}
                        className="text-left text-sm underline text-crimson hover:text-crimson-700">
                  {m.title}{m.publication ? ` — ${m.publication}` : ''}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
