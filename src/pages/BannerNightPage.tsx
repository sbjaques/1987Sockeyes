import { Section } from '../components/layout/Section';
import { Seo } from '../lib/seo';

const photos = [
  { src: '/1987Sockeyes/assets/banner-night/program-1.png', alt: 'Banner Night program cover, 26 September 2025' },
  { src: '/1987Sockeyes/assets/banner-night/program-2.jpg', alt: 'Banner Night program interior' },
  { src: '/1987Sockeyes/assets/banner-night/pucks.jpg',      alt: 'Commemorative pucks from the banner-raising ceremony' },
];

export default function BannerNightPage() {
  return (
    <>
      <Seo title="Banner Night — 1987 Richmond Sockeyes"
           description="26 September 2025 championship banner raising at Minoru Arena honouring the 1987 Richmond Sockeyes." />
      <Section title="Banner Night — 26 September 2025">
        <p className="mb-6 max-w-3xl">
          Thirty-eight years after winning the Centennial Cup, the 1987 Richmond Sockeyes
          were honoured with a championship banner raised at Minoru Arena.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map(p => (
            <img key={p.src} src={p.src} alt={p.alt} className="w-full h-64 object-cover rounded" loading="lazy" />
          ))}
        </div>
      </Section>
    </>
  );
}
