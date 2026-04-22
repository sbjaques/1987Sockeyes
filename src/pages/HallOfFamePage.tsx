import { renderChapter } from '../lib/markdownChapter';
import { loadMedia } from '../lib/loadData';
import hofContent from '../content/hall-of-fame/index.md?raw';

export default function HallOfFamePage() {
  const media = loadMedia();
  return (
    <article className="max-w-3xl mx-auto px-4 py-12 prose prose-navy">
      {renderChapter(hofContent, media)}
    </article>
  );
}
