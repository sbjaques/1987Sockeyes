import type { Plugin } from 'vite';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

type BuildMode = 'public' | 'private';

/**
 * Vite plugin that intercepts imports of src/data/media.json and strips
 * `url`, `attribution`, and `descriptionLong` from private items in the public
 * build, so those fields never appear in the public JS bundle. The public
 * build keeps `descriptionShort` so cards and the locked-item dialog can
 * still describe the item at teaser level.
 *
 * Approach: redirect the .json import to a virtual module with a .js
 * extension so rolldown's built-in JSON plugin is never invoked.
 * - resolveId: catch the import and return a virtual \0 ID (no .json suffix)
 * - load: serve the filtered (or full) JS module for that virtual ID
 */
export function filterMediaPlugin(buildMode: BuildMode): Plugin {
  // Virtual ID has no .json extension — keeps rolldown's JSON plugin away
  const VIRTUAL_ID = '\0filter-media-json.js';
  const mediaJsonPath = resolve(process.cwd(), 'src/data/media.json');
  // Vite normalizes Windows backslashes to forward slashes in all hook IDs
  const mediaJsonId = mediaJsonPath.replace(/\\/g, '/');

  function buildFilteredModule(): string {
    const raw = readFileSync(mediaJsonPath, 'utf8');
    const items = JSON.parse(raw);
    if (buildMode === 'private') {
      return `export default ${JSON.stringify(items)};`;
    }
    // Public: strip url + attribution + descriptionLong from private items
    // before they enter the bundle. The raw values are never serialised into
    // the JS output. descriptionShort is retained as the teaser.
    const filtered = items.map((item: Record<string, unknown>) => {
      if (item.access === 'public') return item;
      const copy = { ...item };
      delete copy.url;
      delete copy.attribution;
      delete copy.descriptionLong;
      return copy;
    });
    return `export default ${JSON.stringify(filtered)};`;
  }

  return {
    name: 'filter-media-json',
    enforce: 'pre',

    resolveId(source, _importer) {
      // Vite passes the raw source string to resolveId before resolution.
      // For relative imports the source is relative (e.g. "../data/media.json").
      // We normalise and check the suffix.
      const sourcePath = source.split('?')[0].replace(/\\/g, '/');

      // Match absolute path (e.g. when Vite resolves and re-feeds the ID)
      if (sourcePath === mediaJsonId) {
        return VIRTUAL_ID;
      }

      // Match any relative import ending in src/data/media.json
      if (sourcePath.endsWith('/src/data/media.json') || sourcePath === '../data/media.json' || sourcePath.endsWith('src/data/media.json')) {
        return VIRTUAL_ID;
      }

      return null;
    },

    load(id) {
      if (id === VIRTUAL_ID) {
        return buildFilteredModule();
      }
      return null;
    },
  };
}
