import { Link } from 'react-router-dom';
import { Section } from '../components/layout/Section';
import { PlayoffTimeline } from '../components/timeline/PlayoffTimeline';
import { loadGames } from '../lib/loadData';
import { Seo } from '../lib/seo';

export default function PlayoffsPage() {
  return (
    <>
      <nav aria-label="Breadcrumb" className="max-w-6xl mx-auto px-4 pt-6 text-sm text-navy/70">
        <Link to="/the-season" className="hover:text-crimson">The Season</Link>
        <span aria-hidden="true"> › </span>
        <span className="text-navy">The Run</span>
      </nav>
      <Seo
        title="The Playoff Run — 1987 Richmond Sockeyes"
        description="Game-by-game record of the 1987 Richmond Sockeyes playoff run through the Mowat, Doyle, Abbott, and Centennial Cups." />
      <Section title="The Playoff Run">
        <p className="text-navy/80 max-w-3xl mb-2">
          Twenty-six games across four trophies. The Sockeyes opened the playoffs with a 15-0 sweep of
          the BCJHL — Nanaimo, North Delta, and the 45-5-2 Kelowna Packers — then dug out of a 3-2 hole
          in the Doyle Cup against Red Deer, survived seven games against Humboldt in the Abbott Cup,
          and finished 5-2 over Humboldt in the Centennial Cup final at the Uniplex on May 9, 1987.
        </p>
        <p className="text-navy/60 text-sm mb-8">
          Click any segment for a dedicated cup page with highlights, sources, and related clippings.
        </p>
        <PlayoffTimeline games={loadGames()} />
      </Section>
      <div className="max-w-6xl mx-auto px-4 pb-12">
        <Link to="/the-season" className="text-crimson hover:underline">← Back to the Season Story</Link>
      </div>
    </>
  );
}
