import { useMemo, useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { Section } from '../components/layout/Section';
import { MediaLightbox } from '../components/vault/MediaLightbox';
import { Seo } from '../lib/seo';
import { loadRoster, loadGames, loadMedia } from '../lib/loadData';
import { isSkater, isGoalie, type RosterEntry } from '../types/roster';
import type { MediaItem } from '../types/media';

function formatRole(e: RosterEntry): string {
  if (isSkater(e)) return e.position === 'F' ? 'Forward' : 'Defence';
  if (isGoalie(e)) return 'Goaltender';
  return e.role.replace('-', ' ');
}

function SkaterStatRow({ label, stats }: { label: string; stats: { gp:number; g:number; a:number; pts:number; pim:number } }) {
  return (
    <tr className="odd:bg-cream even:bg-cream-200">
      <td className="px-3 py-2">{label}</td>
      <td className="px-3 py-2 tabular-nums text-right">{stats.gp}</td>
      <td className="px-3 py-2 tabular-nums text-right">{stats.g}</td>
      <td className="px-3 py-2 tabular-nums text-right">{stats.a}</td>
      <td className="px-3 py-2 tabular-nums text-right font-semibold">{stats.pts}</td>
      <td className="px-3 py-2 tabular-nums text-right">{stats.pim}</td>
    </tr>
  );
}
function GoalieStatRow({ label, stats }: { label: string; stats: { gp:number; w:number; l:number; gaa:number; svpct:number; so:number } }) {
  return (
    <tr className="odd:bg-cream even:bg-cream-200">
      <td className="px-3 py-2">{label}</td>
      <td className="px-3 py-2 tabular-nums text-right">{stats.gp}</td>
      <td className="px-3 py-2 tabular-nums text-right">{stats.w}</td>
      <td className="px-3 py-2 tabular-nums text-right">{stats.l}</td>
      <td className="px-3 py-2 tabular-nums text-right">{stats.gaa.toFixed(2)}</td>
      <td className="px-3 py-2 tabular-nums text-right">{stats.svpct.toFixed(3)}</td>
      <td className="px-3 py-2 tabular-nums text-right">{stats.so}</td>
    </tr>
  );
}

export default function PlayerProfile() {
  const { id } = useParams();
  const roster = loadRoster();
  const games  = loadGames();
  const media  = loadMedia();

  const entry = roster.find(r => r.id === id);
  const [mediaIndex, setMediaIndex] = useState<number | null>(null);

  const openable = media.filter(m => m.type !== 'program' && m.type !== 'video' && m.type !== 'document');

  const mentions = useMemo(() => {
    if (!entry) return { games: [], media: [] };
    const full = entry.name.toLowerCase();
    const last = entry.name.split(' ').slice(-1)[0].toLowerCase();
    const nameMatch = (t: string) => {
      const s = (t || '').toLowerCase();
      return s.includes(full) || s.includes(` ${last} `) || s.includes(` ${last}.`) || s.includes(` ${last},`) || s.endsWith(` ${last}`);
    };
    return {
      games: games.filter(g => g.highlights.some(nameMatch)),
      media: media.filter(m => nameMatch(m.caption) || nameMatch(m.title)),
    };
  }, [entry, games, media]);

  if (!entry) return <Navigate to="/roster" replace />;

  const openMedia = (m: MediaItem) => {
    const i = openable.findIndex(x => x.id === m.id);
    if (i >= 0) setMediaIndex(i);
  };

  const skater = isSkater(entry);
  const goalie = isGoalie(entry);
  const careerSkater = (entry.careerStats ?? []).filter(c => 'pts' in c.stats) as Array<{ season:string; team:string; league:string; type:'regular'|'playoff'; stats: { gp:number; g:number; a:number; pts:number; pim:number } }>;
  const careerGoalie = (entry.careerStats ?? []).filter(c => 'gaa' in c.stats) as Array<{ season:string; team:string; league:string; type:'regular'|'playoff'; stats: { gp:number; w:number; l:number; gaa:number; svpct:number; so:number } }>;

  return (
    <>
      <Seo
        title={`${entry.name} — 1987 Richmond Sockeyes`}
        description={`Profile of ${entry.name}, ${formatRole(entry)} for the 1987 Centennial Cup champion Richmond Sockeyes. Career stats, bio, photos, and contemporary press coverage.`}
        image={entry.photoUrl}
      />
      <Section>
        <Link to="/roster" className="text-sm text-crimson underline">← Back to roster</Link>
        <div className="mt-4 flex flex-col md:flex-row md:items-end gap-6">
          {entry.photoUrl ? (
            <img src={entry.photoUrl} alt={entry.name} className="w-40 h-40 object-cover rounded bg-cream-200" />
          ) : (
            <div className="w-40 h-40 flex items-center justify-center rounded bg-navy text-cream font-display text-5xl">
              {entry.name.split(' ').map(s => s[0]).slice(0,2).join('')}
            </div>
          )}
          <div>
            <h1 className="font-display text-4xl md:text-5xl">{entry.name}</h1>
            <p className="text-navy/70 mt-1">
              {entry.number ? `#${entry.number} · ` : ''}{formatRole(entry)}{entry.hometown ? ` · ${entry.hometown}` : ''}
            </p>
            {entry.awards && entry.awards.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-2">
                {entry.awards.map(a => <li key={a} className="text-xs uppercase tracking-widest bg-crimson text-cream px-2 py-1 rounded">{a}</li>)}
              </ul>
            )}
          </div>
        </div>

        {(skater || goalie) && (
          <>
            <h2 className="font-display text-2xl mt-10 mb-3">1987 Playoff Totals</h2>
            <table className="w-full text-sm">
              {skater ? (
                <>
                  <thead className="bg-navy text-cream">
                    <tr>
                      <th className="px-3 py-2 text-left">Season</th>
                      <th className="px-3 py-2 text-right">GP</th>
                      <th className="px-3 py-2 text-right">G</th>
                      <th className="px-3 py-2 text-right">A</th>
                      <th className="px-3 py-2 text-right">Pts</th>
                      <th className="px-3 py-2 text-right">PIM</th>
                    </tr>
                  </thead>
                  <tbody><SkaterStatRow label="1986-87 Playoffs (Richmond Sockeyes)" stats={entry.playoffStats as { gp:number; g:number; a:number; pts:number; pim:number }} /></tbody>
                </>
              ) : (
                <>
                  <thead className="bg-navy text-cream">
                    <tr>
                      <th className="px-3 py-2 text-left">Season</th>
                      <th className="px-3 py-2 text-right">GP</th>
                      <th className="px-3 py-2 text-right">W</th>
                      <th className="px-3 py-2 text-right">L</th>
                      <th className="px-3 py-2 text-right">GAA</th>
                      <th className="px-3 py-2 text-right">Sv%</th>
                      <th className="px-3 py-2 text-right">SO</th>
                    </tr>
                  </thead>
                  <tbody><GoalieStatRow label="1986-87 Playoffs (Richmond Sockeyes)" stats={entry.playoffStats as { gp:number; w:number; l:number; gaa:number; svpct:number; so:number }} /></tbody>
                </>
              )}
            </table>
          </>
        )}

        {careerSkater.length > 0 && (
          <>
            <h2 className="font-display text-2xl mt-10 mb-3">Career — Skater</h2>
            <table className="w-full text-sm">
              <thead className="bg-navy text-cream">
                <tr>
                  <th className="px-3 py-2 text-left">Season</th>
                  <th className="px-3 py-2 text-left">Team (League)</th>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-right">GP</th>
                  <th className="px-3 py-2 text-right">G</th>
                  <th className="px-3 py-2 text-right">A</th>
                  <th className="px-3 py-2 text-right">Pts</th>
                  <th className="px-3 py-2 text-right">PIM</th>
                </tr>
              </thead>
              <tbody>
                {careerSkater.map((c, i) => (
                  <tr key={i} className="odd:bg-cream even:bg-cream-200">
                    <td className="px-3 py-2">{c.season}</td>
                    <td className="px-3 py-2">{c.team} <span className="text-navy/60">({c.league})</span></td>
                    <td className="px-3 py-2 capitalize">{c.type}</td>
                    <td className="px-3 py-2 tabular-nums text-right">{c.stats.gp}</td>
                    <td className="px-3 py-2 tabular-nums text-right">{c.stats.g}</td>
                    <td className="px-3 py-2 tabular-nums text-right">{c.stats.a}</td>
                    <td className="px-3 py-2 tabular-nums text-right font-semibold">{c.stats.pts}</td>
                    <td className="px-3 py-2 tabular-nums text-right">{c.stats.pim}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {careerGoalie.length > 0 && (
          <>
            <h2 className="font-display text-2xl mt-10 mb-3">Career — Goaltender</h2>
            <table className="w-full text-sm">
              <thead className="bg-navy text-cream">
                <tr>
                  <th className="px-3 py-2 text-left">Season</th>
                  <th className="px-3 py-2 text-left">Team (League)</th>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-right">GP</th>
                  <th className="px-3 py-2 text-right">W</th>
                  <th className="px-3 py-2 text-right">L</th>
                  <th className="px-3 py-2 text-right">GAA</th>
                  <th className="px-3 py-2 text-right">Sv%</th>
                  <th className="px-3 py-2 text-right">SO</th>
                </tr>
              </thead>
              <tbody>
                {careerGoalie.map((c, i) => (
                  <tr key={i} className="odd:bg-cream even:bg-cream-200">
                    <td className="px-3 py-2">{c.season}</td>
                    <td className="px-3 py-2">{c.team} <span className="text-navy/60">({c.league})</span></td>
                    <td className="px-3 py-2 capitalize">{c.type}</td>
                    <td className="px-3 py-2 tabular-nums text-right">{c.stats.gp}</td>
                    <td className="px-3 py-2 tabular-nums text-right">{c.stats.w}</td>
                    <td className="px-3 py-2 tabular-nums text-right">{c.stats.l}</td>
                    <td className="px-3 py-2 tabular-nums text-right">{c.stats.gaa.toFixed(2)}</td>
                    <td className="px-3 py-2 tabular-nums text-right">{c.stats.svpct.toFixed(3)}</td>
                    <td className="px-3 py-2 tabular-nums text-right">{c.stats.so}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {entry.bio && (
          <>
            <h2 className="font-display text-2xl mt-10 mb-3">Biography</h2>
            <div className="prose max-w-none whitespace-pre-line">{entry.bio}</div>
          </>
        )}

        {entry.links && Object.keys(entry.links).length > 0 && (
          <>
            <h2 className="font-display text-2xl mt-10 mb-3">External References</h2>
            <ul className="list-disc pl-5 text-sm">
              {entry.links.hockeydb && <li><a className="text-crimson underline" href={entry.links.hockeydb} target="_blank" rel="noopener noreferrer">HockeyDB profile</a></li>}
              {entry.links.eliteprospects && <li><a className="text-crimson underline" href={entry.links.eliteprospects} target="_blank" rel="noopener noreferrer">Elite Prospects profile</a></li>}
              {entry.links.wikipedia && <li><a className="text-crimson underline" href={entry.links.wikipedia} target="_blank" rel="noopener noreferrer">Wikipedia</a></li>}
              {entry.links.other?.map(l => <li key={l.url}><a className="text-crimson underline" href={l.url} target="_blank" rel="noopener noreferrer">{l.label}</a></li>)}
            </ul>
          </>
        )}

        <h2 className="font-display text-2xl mt-10 mb-3">Games mentioned</h2>
        {mentions.games.length === 0 ? (
          <p className="text-sm text-navy/60">No game entries reference this player yet.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {mentions.games.map(g => (
              <li key={g.id}>
                <Link to={`/timeline/${g.series}`} className="text-crimson underline">{g.series} Cup</Link> — vs {g.opponent} ({g.date}), {g.result} {g.score.for}–{g.score.against}
              </li>
            ))}
          </ul>
        )}

        <h2 className="font-display text-2xl mt-10 mb-3">Clippings featuring {entry.name.split(' ').slice(-1)[0]}</h2>
        {mentions.media.length === 0 ? (
          <p className="text-sm text-navy/60">No clippings reference this player yet.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {mentions.media.map(m => (
              <li key={m.id}>
                <button onClick={() => openMedia(m)} className="text-left text-sm underline text-crimson hover:text-crimson-700">
                  {m.title}{m.publication ? ` — ${m.publication}` : ''}
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>
      <MediaLightbox items={openable} index={mediaIndex} onClose={() => setMediaIndex(null)} />
    </>
  );
}
