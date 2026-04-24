import { useState } from 'react';
import { loadMedia } from '../lib/loadData';
import { MediaLightbox } from '../components/vault/MediaLightbox';
import { Seo } from '../lib/seo';
import type { MediaItem } from '../types/media';

// ── Helpers ────────────────────────────────────────────────────────────────

/** Stat strip data for the citation section. */
const STATS = [
  { label: 'Regular season', value: '38–14–0' },
  { label: 'BCJHL playoffs', value: '15–0' },
  { label: 'Doyle Cup', value: '4–3' },
  { label: 'Abbott Cup', value: '4–3' },
  { label: 'Centennial Cup', value: '5–2' },
] as const;

/** Class of 2025 inductees beside the Sockeyes. */
const CLASS_OF_2025 = [
  { name: 'Dan Hamhuis', note: 'Long-time NHL defenceman, BC-born' },
  { name: 'Shawn Horcoff', note: 'Long-time NHL centre, Edmonton Oilers captain' },
  { name: 'Mike Penny', note: 'Hockey executive' },
  { name: 'Larry Kwong', note: 'First player of Chinese descent in the NHL (New York Rangers, 1948)' },
  { name: 'Ted Hargreaves', note: 'Hockey builder' },
  { name: '1977–78 Kimberley Dynamiters', note: 'Junior B team, Centennial Cup champions' },
] as const;

/** A click-to-open video card used in both video grid sections. */
function VideoCard({
  item,
  onOpen,
}: {
  item: MediaItem;
  onOpen: (item: MediaItem) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className="group relative w-full text-left bg-cream-200 border border-navy/10 hover:border-crimson rounded overflow-hidden transition focus:outline-none focus-visible:ring-2 focus-visible:ring-crimson"
    >
      {/* Thumbnail */}
      <div className="relative">
        <img
          src={item.thumb}
          alt=""
          loading="lazy"
          className="w-full aspect-video object-cover"
        />
        {/* Lock badge */}
        {item.access === 'private' && (
          <span className="absolute top-2 left-2 bg-crimson text-cream text-[10px] uppercase tracking-widest px-2 py-1 rounded flex items-center gap-1">
            <span aria-hidden="true">🔒</span>
          </span>
        )}
        {/* Video badge */}
        <span className="absolute top-2 right-2 bg-navy/85 text-cream text-[10px] uppercase tracking-widest px-2 py-1 rounded">
          Video
        </span>
        {/* Play overlay */}
        <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-navy/30">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-12 h-12 text-cream drop-shadow"
            aria-hidden="true"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </div>
      {/* Label */}
      <div className="p-3">
        <p className="text-sm font-semibold text-navy group-hover:text-crimson leading-snug line-clamp-2">
          {item.descriptionShort}
        </p>
      </div>
    </button>
  );
}

// ── Page component ─────────────────────────────────────────────────────────

export default function HallOfFamePage() {
  const media = loadMedia();
  const byId = new Map(media.map(m => [m.id, m]));

  // Sequeira photos
  const teamPhoto = byId.get('hof-2025-sequeira-team-horiz')!;
  const captainPhoto = byId.get('hof-2025-sequeira-captain-horiz')!;
  const tomlinsonPhoto = byId.get('hof-2025-sequeira-tomlinson-speech')!;

  // Induction videos — Hughson intro (2 parts) + Dickie speech (2 parts) + Tomlinson remarks
  const inductionVideos: MediaItem[] = [
    'hof-2025-induction-hughson-intro-pt1',
    'hof-2025-induction-hughson-intro-pt2',
    'hof-2025-dickie-speech-pt1',
    'hof-2025-dickie-speech-pt2',
    'hof-2025-tomlinson-speech',
  ].flatMap(id => (byId.get(id) ? [byId.get(id)!] : []));

  // Weekend interview videos — 4 player interviews + display-case walkthrough
  const interviewVideos: MediaItem[] = [
    'hof-2025-interview-dickie',
    'hof-2025-interview-phillips',
    'hof-2025-interview-gunn',
    'hof-2025-interview-moro',
    'hof-2025-display-case',
  ].flatMap(id => (byId.get(id) ? [byId.get(id)!] : []));

  // Lightbox state — shared across both video grids
  const [lbItems, setLbItems] = useState<MediaItem[]>([]);
  const [lbIndex, setLbIndex] = useState<number | null>(null);

  function openLightbox(pool: MediaItem[], item: MediaItem) {
    setLbItems(pool);
    setLbIndex(pool.indexOf(item));
  }

  function closeLightbox() {
    setLbIndex(null);
    setLbItems([]);
  }

  // Photo lightbox state (public Sequeira photos)
  const publicPhotos = [teamPhoto, captainPhoto, tomlinsonPhoto].filter(Boolean);
  const [photoIndex, setPhotoIndex] = useState<number | null>(null);

  return (
    <div className="bg-cream-200 min-h-screen">
      <Seo
        title="Hall of Fame — 1987 Richmond Sockeyes"
        description="The 1987 Richmond Sockeyes reunite 38 years later at the BC Hockey Hall of Fame induction ceremony in Penticton, July 12 2025."
      />
      {/* ── Page hero: navy block with cream text ──────────────────────── */}
      <header className="bg-navy text-cream py-16 md:py-24 px-6 text-center">
        <p className="uppercase tracking-[0.25em] text-crimson text-xs font-sans mb-4">
          British Columbia Hockey Hall of Fame · July 12 2025
        </p>
        <h1 className="font-display text-4xl md:text-6xl leading-tight">
          2025 BCHHoF Induction
        </h1>
        <p className="mt-4 text-cream/70 text-base md:text-lg font-sans max-w-lg mx-auto leading-relaxed">
          The 1987 Richmond Sockeyes reunite after 38 years —{' '}
          South Okanagan Events Centre, Penticton
        </p>
      </header>

      {/* ── Hero photo: full-width team shot ───────────────────────────── */}
      <div className="bg-navy border-t border-cream/10">
        <div className="max-w-5xl mx-auto">
          <button
            type="button"
            onClick={() => {
              setPhotoIndex(publicPhotos.indexOf(teamPhoto));
            }}
            className="w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-crimson"
            aria-label="View team photo"
          >
            <img
              src={teamPhoto.thumb}
              alt={teamPhoto.descriptionShort}
              className="w-full h-auto block"
              loading="eager"
            />
          </button>
          <p className="text-center text-cream/50 text-xs font-sans px-4 py-3 tracking-wide">
            Photo: Emanuel Sequeira
          </p>
        </div>
      </div>

      {/* ── Rule ───────────────────────────────────────────────────────── */}
      <div className="border-t border-navy/20" />

      {/* ── Main content stream ────────────────────────────────────────── */}
      <div className="mx-auto max-w-prose px-5 md:px-0 py-16">

        {/* ── The ceremony ──────────────────────────────────────────────── */}
        <section className="mb-0">
          <SectionHeader>The ceremony</SectionHeader>

          <div className="prose prose-navy prose-lg max-w-none mt-6
            prose-p:text-navy prose-p:leading-relaxed
            prose-strong:text-navy prose-em:text-navy/80">
            <p>
              Jim Hughson, BCHHoF chair, introduced the team. Festivities ran July 11–12,
              with the formal induction on the Sunday. The Sockeyes went in alongside six
              other inductees: Dan Hamhuis, Shawn Horcoff, Mike Penny, Larry Kwong, Ted
              Hargreaves, and the 1977–78 Kimberley Dynamiters.
            </p>
            <p>
              Captain Trevor Dickie delivered the acceptance remarks; Dave Tomlinson
              followed with a second address.
            </p>
          </div>

          {/* Tomlinson speech photo */}
          <figure className="mt-8">
            <button
              type="button"
              onClick={() => setPhotoIndex(publicPhotos.indexOf(tomlinsonPhoto))}
              className="w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-crimson rounded"
              aria-label="View Dave Tomlinson speech photo"
            >
              <img
                src={tomlinsonPhoto.thumb}
                alt={tomlinsonPhoto.descriptionShort}
                className="w-full h-auto rounded"
                loading="lazy"
              />
            </button>
            <figcaption className="mt-2 text-sm text-navy/60 font-sans text-center">
              Dave Tomlinson delivering the acceptance address. Photo: Emanuel Sequeira
            </figcaption>
          </figure>
        </section>

        {/* ── The citation ──────────────────────────────────────────────── */}
        <section className="mt-20 pt-8 border-t border-navy/15">
          <SectionHeader>The citation</SectionHeader>

          {/* Stat strip */}
          <div className="mt-6 grid grid-cols-5 border border-navy/15 rounded overflow-hidden text-center">
            {STATS.map(({ label, value }, i) => (
              <div
                key={label}
                className={`px-2 py-4 ${i < STATS.length - 1 ? 'border-r border-navy/15' : ''}`}
              >
                <div className="font-display text-xl md:text-2xl text-crimson leading-none">
                  {value}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-navy/60 mt-1 font-sans leading-snug">
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* Prose below the strip */}
          <div className="prose prose-navy prose-base max-w-none mt-6
            prose-p:text-navy prose-p:leading-relaxed">
            <p>
              Per the BCHHoF and Pacific Junior Hockey League coverage, the Sockeyes were
              recognised for the 1986–87 season: a 38–14–0 BCJHL regular-season record,
              a 15–0 BCJHL playoff sweep (Mowat Cup over Kelowna), Doyle Cup over Red Deer,
              Abbott Cup over Humboldt, and the 5–2 Centennial Cup final win over Humboldt
              at the Uniplex on May 9 1987. Frank Romeo was named Centennial Cup tournament
              MVP; Jason Phillips was named to the All-Star team and received the Most
              Gentlemanly Player award, recording a hat trick in the final.
            </p>
          </div>
        </section>

        {/* ── The captain ───────────────────────────────────────────────── */}
        <section className="mt-20 pt-8 border-t border-navy/15">
          <SectionHeader>The captain</SectionHeader>

          <figure className="mt-6">
            <button
              type="button"
              onClick={() => setPhotoIndex(publicPhotos.indexOf(captainPhoto))}
              className="w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-crimson rounded"
              aria-label="View Trevor Dickie photo"
            >
              <img
                src={captainPhoto.thumb}
                alt={captainPhoto.descriptionShort}
                className="w-full h-auto rounded"
                loading="lazy"
              />
            </button>
            <figcaption className="mt-2 text-sm text-navy/60 font-sans text-center">
              Trevor Dickie, 1986–87 team captain, at the induction ceremony.
              Photo: Emanuel Sequeira
            </figcaption>
          </figure>
        </section>

        {/* ── Induction video ───────────────────────────────────────────── */}
        <section className="mt-20 pt-8 border-t border-navy/15">
          <SectionHeader>Induction video</SectionHeader>
          <p className="mt-2 text-sm text-navy/60 font-sans">
            Hughson's introduction and the formal acceptance speeches — private archive,
            available on request.
          </p>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
            {inductionVideos.map(item => (
              <VideoCard
                key={item.id}
                item={item}
                onOpen={v => openLightbox(inductionVideos, v)}
              />
            ))}
          </div>
        </section>

        {/* ── Weekend interviews ────────────────────────────────────────── */}
        <section className="mt-20 pt-8 border-t border-navy/15">
          <SectionHeader>Weekend interviews</SectionHeader>
          <p className="mt-2 text-sm text-navy/60 font-sans">
            On-site conversations recorded during the two-day induction weekend, plus a
            walkthrough of the team's display case.
          </p>

          {/* Slightly muted grid: cream bg instead of cream-200, lighter border */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4 opacity-90">
            {interviewVideos.map(item => (
              <VideoCard
                key={item.id}
                item={item}
                onOpen={v => openLightbox(interviewVideos, v)}
              />
            ))}
          </div>
        </section>

        {/* ── Class of 2025 ─────────────────────────────────────────────── */}
        <section className="mt-20 pt-8 border-t border-navy/15">
          <SectionHeader>Class of 2025</SectionHeader>
          <p className="mt-2 text-sm text-navy/60 font-sans">
            The full class inducted alongside the 1987 Sockeyes.
          </p>

          {/* Subtle dingbat divider before individual inductees */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CLASS_OF_2025.map(({ name, note }) => (
              <div
                key={name}
                className="bg-white border border-navy/10 rounded px-4 py-3"
              >
                <div className="font-semibold text-navy text-sm">{name}</div>
                <div className="text-xs text-navy/60 mt-0.5 leading-snug">{note}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── End dingbat ───────────────────────────────────────────────── */}
        <div
          className="mt-20 pt-12 border-t border-navy/15 text-center text-navy/30 font-display text-2xl select-none"
          aria-hidden="true"
        >
          ✦ ✦ ✦
        </div>
      </div>

      {/* ── Lightboxes ─────────────────────────────────────────────────── */}
      {/* Video lightbox (handles LockedLightbox routing internally) */}
      <MediaLightbox
        items={lbItems}
        index={lbIndex}
        onClose={closeLightbox}
      />

      {/* Public photo lightbox */}
      <MediaLightbox
        items={publicPhotos}
        index={photoIndex}
        onClose={() => setPhotoIndex(null)}
      />
    </div>
  );
}

// ── Section header component ──────────────────────────────────────────────

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-2xl md:text-3xl text-navy leading-snug">
      {children}
    </h2>
  );
}
