import { Hero } from '../components/hero/Hero';
import { Section } from '../components/layout/Section';
import { PlayoffTimeline } from '../components/timeline/PlayoffTimeline';
import { loadGames } from '../lib/loadData';

export default function Landing() {
  const games = loadGames();
  return (
    <>
      <Hero />
      <Section id="timeline" title="The Playoff Path">
        <PlayoffTimeline games={games} />
      </Section>
    </>
  );
}
