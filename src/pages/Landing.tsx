import { Hero } from '../components/hero/Hero';
import { Section } from '../components/layout/Section';
import { PlayoffTimeline } from '../components/timeline/PlayoffTimeline';
import { RosterTable } from '../components/roster/RosterTable';
import { VaultGrid } from '../components/vault/VaultGrid';
import { loadGames, loadRoster, loadMedia } from '../lib/loadData';
import { Seo } from '../lib/seo';
import { teamStructuredData } from '../lib/structuredData';

export default function Landing() {
  return (
    <>
      <Seo
        title="1987 Richmond Sockeyes — Centennial Cup Champions"
        description="Permanent archive of the 1987 Richmond Sockeyes: roster, playoff path through the Mowat, Doyle, Abbott, and Centennial Cups, and source newspaper coverage."
        jsonLd={teamStructuredData()}
      />
      <Hero />
      <Section id="timeline" title="The Playoff Path">
        <PlayoffTimeline games={loadGames()} />
      </Section>
      <Section id="roster" title="The Roster">
        <p className="text-sm text-navy/70 mb-4">Visit the <a href="#/roster" className="underline text-crimson">Roster page</a> for player details, game mentions, and linked clippings.</p>
        <RosterTable entries={loadRoster()} />
      </Section>
      <Section id="vault" title="The Vault">
        <VaultGrid items={loadMedia()} />
      </Section>
    </>
  );
}
