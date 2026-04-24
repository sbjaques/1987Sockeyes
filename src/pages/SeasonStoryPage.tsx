import { renderChapter, extractChapterTitle } from '../lib/markdownChapter';
import { loadMedia } from '../lib/loadData';
import ch0 from '../content/the-season/00-penticton-2025.md?raw';
import ch1 from '../content/the-season/01-the-rebuild.md?raw';
import ch2 from '../content/the-season/02-regular-season.md?raw';
import ch3 from '../content/the-season/03-fred-page-mowat-cup.md?raw';
import ch4 from '../content/the-season/04-doyle-cup.md?raw';
import ch5 from '../content/the-season/05-abbott-cup.md?raw';
import ch6 from '../content/the-season/06-centennial-cup.md?raw';
import ch7 from '../content/the-season/07-back-to-penticton.md?raw';

const chapters = [ch0, ch1, ch2, ch3, ch4, ch5, ch6, ch7];

/** Roman numerals for Chapter I–VI (chapters 1–6 are the body chapters). */
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

/**
 * Returns the display label for a chapter index.
 * - 0 → "Prologue"
 * - 1–6 → "Chapter I" … "Chapter VI"
 * - 7 → "Epilogue"
 */
function chapterLabel(index: number): string {
  if (index === 0) return 'Prologue';
  if (index === chapters.length - 1) return 'Epilogue';
  return `Chapter ${ROMAN[index - 1]}`;
}

export default function SeasonStoryPage() {
  const media = loadMedia();

  return (
    <div className="bg-cream-200 min-h-screen">
      {/* ── Page Hero ──────────────────────────────────────────────── */}
      <header className="bg-navy text-cream py-16 md:py-24 px-6 text-center">
        <p className="uppercase tracking-[0.25em] text-crimson text-xs font-sans mb-4">
          Richmond Sockeyes · 1986–87
        </p>
        <h1 className="font-display text-4xl md:text-6xl leading-tight">
          The Season Story
        </h1>
        <p className="mt-4 text-cream/70 text-base md:text-lg font-sans max-w-lg mx-auto leading-relaxed">
          A narrative in eight chapters — from the summer rebuild to the night in
          Humboldt, and back to Penticton thirty-eight years later.
        </p>
      </header>

      {/* ── Rule between hero and first chapter ───────────────────── */}
      <div className="border-t border-navy/20" />

      {/* ── Chapter stream ─────────────────────────────────────────── */}
      <article className="mx-auto max-w-prose px-5 md:px-0 py-16">
        {chapters.map((ch, i) => {
          const title = extractChapterTitle(ch);
          const label = chapterLabel(i);

          return (
            <section key={i} id={`chapter-${i}`} className="mb-0">
              {/* Chapter header */}
              <div className={i === 0 ? 'mb-8' : 'mt-20 mb-8 pt-8 border-t border-navy/15'}>
                <p className="uppercase tracking-[0.2em] text-crimson text-xs font-sans mb-2">
                  {label}
                </p>
                <h2 className="font-display text-2xl md:text-3xl text-navy leading-snug">
                  {title}
                </h2>
              </div>

              {/* Chapter body */}
              <div className="prose prose-navy prose-lg max-w-none
                prose-p:text-navy prose-p:leading-relaxed
                prose-a:text-crimson prose-a:underline prose-a:underline-offset-2
                prose-a:decoration-crimson/40 hover:prose-a:decoration-crimson
                prose-strong:text-navy prose-em:text-navy/80
                prose-hr:border-navy/15">
                {renderChapter(ch, media, {
                  firstParagraphClass: 'text-lg leading-relaxed text-navy/90 mb-5 font-sans [&:first-letter]:float-left [&:first-letter]:font-display [&:first-letter]:text-5xl [&:first-letter]:leading-none [&:first-letter]:mr-2 [&:first-letter]:mt-1 [&:first-letter]:text-navy',
                  ctaParagraphClass: 'mt-8 pt-6 border-t border-navy/15 text-right font-sans text-sm not-italic text-navy/60 [&_a]:text-crimson [&_a]:no-underline [&_a]:font-medium [&_a]:tracking-wide hover:[&_a]:underline',
                })}
              </div>
            </section>
          );
        })}

        {/* ── End-of-narrative dingbat ───────────────────────────── */}
        <div className="mt-20 pt-12 border-t border-navy/15 text-center text-navy/30 font-display text-2xl select-none" aria-hidden="true">
          ✦ ✦ ✦
        </div>
      </article>
    </div>
  );
}
