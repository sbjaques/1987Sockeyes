import { useSearchParams } from 'react-router-dom';
import { Section } from '../components/layout/Section';
import { VaultGrid } from '../components/vault/VaultGrid';
import { loadMedia } from '../lib/loadData';
import { Seo } from '../lib/seo';

export default function VaultPage() {
  const [searchParams] = useSearchParams();
  const focusId = searchParams.get('focus') ?? undefined;

  return (
    <>
      <Seo title="The Vault — 1987 Richmond Sockeyes Archive"
           description="Newspaper clippings, souvenir programs, and photographs from the 1987 Richmond Sockeyes championship season." />
      <Section title="The Vault">
        <VaultGrid items={loadMedia()} focusId={focusId} />
      </Section>
    </>
  );
}
