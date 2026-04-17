import { Hero } from '../components/hero/Hero';
import { SeasonArc } from '../components/hero/SeasonArc';
import { ExploreGrid } from '../components/hero/ExploreGrid';
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
      <SeasonArc />
      <ExploreGrid />
    </>
  );
}
