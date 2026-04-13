import { Section } from '../components/layout/Section';
import { VaultGrid } from '../components/vault/VaultGrid';
import { loadMedia } from '../lib/loadData';

export default function VaultPage() {
  return (
    <Section title="The Vault">
      <VaultGrid items={loadMedia()} />
    </Section>
  );
}
