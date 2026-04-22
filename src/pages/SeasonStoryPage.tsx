import { renderChapter } from '../lib/markdownChapter';
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

export default function SeasonStoryPage() {
  const media = loadMedia();
  return (
    <article className="max-w-3xl mx-auto px-4 py-12 prose prose-navy">
      {chapters.map((ch, i) => (
        <section key={i} id={`chapter-${i}`} className="mb-16">
          {renderChapter(ch, media)}
        </section>
      ))}
    </article>
  );
}
