import { Section } from '../components/layout/Section';
import { RosterTable } from '../components/roster/RosterTable';
import { loadRoster } from '../lib/loadData';

export default function RosterPage() {
  return (
    <Section title="Roster & Playoff Stats">
      <RosterTable entries={loadRoster()} />
    </Section>
  );
}
