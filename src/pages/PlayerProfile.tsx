import { useMemo, useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { Section } from '../components/layout/Section';
import { MediaLightbox } from '../components/vault/MediaLightbox';
import { Seo } from '../lib/seo';
import { linkifyImageRefs } from '../lib/linkifyImageRefs';
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
      media: media.filter(m => nameMatch(m.descriptionLong) || nameMatch(m.descriptionShort)),
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
            {entry.aliases && entry.aliases.length > 0 && (
              <p className="text-navy/60 italic mt-1 text-sm">
                a.k.a. {entry.aliases.map(a => `"${a}"`).join(' · ')}
              </p>
            )}
            {entry.awards && entry.awards.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-2">
                {entry.awards.map(a => <li key={a} className="text-xs uppercase tracking-widest bg-crimson text-cream px-2 py-1 rounded">{a}</li>)}
              </ul>
            )}
          </div>
        </div>

        {entry.scoutingNotes && (
          <blockquote className="mt-8 border-l-4 border-crimson bg-cream-200 px-5 py-4 text-navy/90 italic">
            {entry.scoutingNotes}
          </blockquote>
        )}

        {(entry.birthDate || entry.height || entry.weight || entry.shoots || (entry.priorTeams && entry.priorTeams.length > 0) || (entry.linemates && entry.linemates.length > 0) || entry.personalDetails) && (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {(entry.birthDate || entry.height || entry.weight || entry.shoots) && (
              <div>
                <h3 className="text-xs uppercase tracking-widest text-navy/60 mb-2">Vitals</h3>
                <dl className="text-sm grid grid-cols-[auto,1fr] gap-x-4 gap-y-1">
                  {entry.birthDate && (<><dt className="text-navy/60">Born</dt><dd>{entry.birthDate}</dd></>)}
                  {entry.height && (<><dt className="text-navy/60">Height</dt><dd>{entry.height}</dd></>)}
                  {entry.weight && (<><dt className="text-navy/60">Weight</dt><dd>{entry.weight} lbs</dd></>)}
                  {entry.shoots && (<><dt className="text-navy/60">Shoots</dt><dd>{entry.shoots === 'L' ? 'Left' : 'Right'}</dd></>)}
                </dl>
              </div>
            )}
            {entry.priorTeams && entry.priorTeams.length > 0 && (
              <div>
                <h3 className="text-xs uppercase tracking-widest text-navy/60 mb-2">Path to Richmond</h3>
                <ol className="text-sm space-y-1 list-decimal pl-5">
                  {entry.priorTeams.map((t, i) => <li key={i}>{t}</li>)}
                </ol>
              </div>
            )}
            {entry.linemates && entry.linemates.length > 0 && (
              <div>
                <h3 className="text-xs uppercase tracking-widest text-navy/60 mb-2">1986-87 Linemates</h3>
                <ul className="text-sm space-y-1">
                  {entry.linemates.map(lid => {
                    const mate = roster.find(r => r.id === lid);
                    return (
                      <li key={lid}>
                        {mate ? (
                          <Link to={`/player/${mate.id}`} className="text-crimson underline">
                            {mate.name}{mate.number ? ` (#${mate.number})` : ''}
                          </Link>
                        ) : lid}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            {entry.personalDetails && (
              <div>
                <h3 className="text-xs uppercase tracking-widest text-navy/60 mb-2">Off the Ice</h3>
                <dl className="text-sm grid grid-cols-[auto,1fr] gap-x-4 gap-y-1">
                  {entry.personalDetails.hobbies && entry.personalDetails.hobbies.length > 0 && (
                    <><dt className="text-navy/60">Hobbies</dt><dd>{entry.personalDetails.hobbies.join(', ')}</dd></>
                  )}
                  {entry.personalDetails.likes && entry.personalDetails.likes.length > 0 && (
                    <><dt className="text-navy/60">Likes</dt><dd>{entry.personalDetails.likes.join(', ')}</dd></>
                  )}
                  {entry.personalDetails.dislikes && entry.personalDetails.dislikes.length > 0 && (
                    <><dt className="text-navy/60">Dislikes</dt><dd>{entry.personalDetails.dislikes.join(', ')}</dd></>
                  )}
                  {entry.personalDetails.college && (
                    <><dt className="text-navy/60">College</dt><dd>{entry.personalDetails.college}</dd></>
                  )}
                </dl>
              </div>
            )}
          </div>
        )}

        {(skater || goalie) && entry.playoffStats && (
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

        {entry.programBio && (
          <>
            <h2 className="font-display text-2xl mt-10 mb-3">1987 Program Snapshot</h2>
            <div className="border-l-4 border-navy bg-cream-200 px-5 py-4 italic text-navy/90 whitespace-pre-line">
              {linkifyImageRefs(entry.programBio)}
            </div>
            <p className="text-xs text-navy/50 mt-2">Source: 1987 Abbott Cup / Centennial Cup Souvenir Program</p>
          </>
        )}

        {entry.bio && (
          <>
            <h2 className="font-display text-2xl mt-10 mb-3">Biography</h2>
            <div className="prose max-w-none whitespace-pre-line">{linkifyImageRefs(entry.bio)}</div>
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
                  {m.descriptionShort}{m.attribution?.paper ? ` — ${m.attribution.paper}` : ''}
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
