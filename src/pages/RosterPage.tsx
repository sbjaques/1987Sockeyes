import { Section } from '../components/layout/Section';
import { RosterTable } from '../components/roster/RosterTable';
import { loadRoster } from '../lib/loadData';
import { Seo } from '../lib/seo';

export default function RosterPage() {
  const roster = loadRoster();

  return (
    <>
      <Seo title="Roster — 1987 Richmond Sockeyes"
           description="Players, coaches, and staff of the 1987 Centennial Cup champion Richmond Sockeyes with playoff stats." />
      <Section title="Roster & Playoff Stats">
        <p className="text-sm text-navy/70 mb-4">Click any row for the full player profile.</p>
        <RosterTable entries={roster} />
      </Section>
    </>
  );
}
