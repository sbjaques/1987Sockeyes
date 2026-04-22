import { Link } from 'react-router-dom';

type Card = {
  to: string;
  eyebrow: string;
  title: string;
  blurb: string;
};

const CARDS: Card[] = [
  {
    to: '/the-season',
    eyebrow: 'The Story',
    title: 'The Season',
    blurb:
      'Seven chapters bookended by the 2025 BCHHoF induction — how Kurtenbach rebuilt the roster, the 15-0 BCJHL playoff run, the 9-1 Game 7 in Red Deer, and the five-goal final in Humboldt.',
  },
  {
    to: '/the-season/the-run',
    eyebrow: 'The Games',
    title: 'The Run',
    blurb:
      'Twenty-six games across four trophies — Mowat, Doyle, Abbott, Centennial — with scorers, turning points, and period-by-period detail where the box scores survived.',
  },
  {
    to: '/roster',
    eyebrow: 'The Team',
    title: 'Roster & Staff',
    blurb:
      'Twenty-two players, head coach Orland Kurtenbach, the coaching staff, owner Bruce Taylor, and the booster club. Click any name for the full program snapshot, nicknames, linemates, and path to Richmond.',
  },
  {
    to: '/vault',
    eyebrow: 'The Archive',
    title: 'The Vault',
    blurb:
      'Primary-source newspaper clippings, programs, and photos — cross-referenced to every person, game, and chapter in the story.',
  },
];

export function ExploreGrid() {
  return (
    <section className="bg-cream">
      <div className="max-w-6xl mx-auto px-4 py-14">
        <h2 className="font-display text-3xl md:text-4xl mb-2">Explore the Archive</h2>
        <p className="text-navy/70 mb-8">
          Every person, every game, every clipping we could find — cross-referenced and sourced.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {CARDS.map(c => (
            <Link
              key={c.to}
              to={c.to}
              className="group relative block bg-cream-200 border border-navy/10 hover:border-crimson rounded p-6 transition">
              <div className="text-xs uppercase tracking-widest text-crimson font-semibold mb-2">
                {c.eyebrow}
              </div>
              <div className="font-display text-2xl text-navy group-hover:text-crimson transition">
                {c.title}
              </div>
              <p className="text-navy/75 mt-3 text-sm leading-relaxed">{c.blurb}</p>
              <span className="text-crimson text-sm mt-4 inline-block group-hover:underline">
                Enter →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
