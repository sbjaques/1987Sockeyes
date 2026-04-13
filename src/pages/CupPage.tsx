import { useParams, Navigate } from 'react-router-dom';
import { Section } from '../components/layout/Section';
import { CupSegment } from '../components/timeline/CupSegment';
import { loadGames } from '../lib/loadData';
import { Seo } from '../lib/seo';
import type { CupSeries } from '../types/games';

const VALID: CupSeries[] = ['Mowat','Doyle','Abbott','Centennial'];

function normalize(s: string | undefined): CupSeries | null {
  if (!s) return null;
  const match = VALID.find(v => v.toLowerCase() === s.toLowerCase());
  return match ?? null;
}

export default function CupPage() {
  const { cup } = useParams();
  const series = normalize(cup);
  if (!series) return <Navigate to="/" replace />;
  const games = loadGames().filter(g => g.series === series).sort((a,b) => a.date.localeCompare(b.date));
  return (
    <>
      <Seo
        title={`${series} Cup — 1987 Richmond Sockeyes`}
        description={`The 1987 Richmond Sockeyes' path through the ${series} Cup.`}
      />
      <Section title={`${series} Cup`}>
        <CupSegment cup={series} games={games} />
      </Section>
    </>
  );
}
