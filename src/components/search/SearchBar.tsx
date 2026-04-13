import { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildSearchIndex, type SearchResult } from '../../lib/search';
import { loadRoster, loadGames, loadMedia } from '../../lib/loadData';

export function SearchBar() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const index = useMemo(() => buildSearchIndex(loadRoster(), loadGames(), loadMedia()), []);
  const results = useMemo(() => index.search(q), [index, q]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        (ref.current?.querySelector('input') as HTMLInputElement | null)?.focus();
        setOpen(true);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const go = (r: SearchResult) => {
    setOpen(false);
    setQ('');
    navigate(r.href);
  };

  const groups: Record<SearchResult['kind'], SearchResult[]> = { player: [], staff: [], game: [], media: [] };
  results.forEach(r => groups[r.kind].push(r));

  return (
    <div ref={ref} className="relative w-full sm:w-80">
      <input
        type="search"
        value={q}
        onChange={e => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Search players, games, clippings… (Ctrl+K)"
        className="w-full px-3 py-2 bg-cream-200 text-navy placeholder:text-navy/50 text-sm rounded focus:outline-none focus:ring-2 focus:ring-crimson"
        aria-label="Search the archive"
      />
      {open && q.trim() && (
        <div role="listbox" className="absolute right-0 mt-1 w-[28rem] max-w-[95vw] max-h-[70vh] overflow-auto bg-cream text-navy shadow-xl rounded border border-navy/10 z-40">
          {results.length === 0 ? (
            <p className="p-4 text-sm text-navy/60">No matches for "{q}".</p>
          ) : (
            (['player','staff','game','media'] as const).map(kind =>
              groups[kind].length > 0 ? (
                <div key={kind} className="py-2">
                  <div className="px-3 pb-1 text-xs uppercase tracking-widest text-navy/50">{kind}s</div>
                  {groups[kind].map(r => (
                    <button key={r.kind + r.id}
                      onClick={() => go(r)}
                      className="w-full text-left px-3 py-2 hover:bg-cream-200 focus:bg-cream-200 focus:outline-none">
                      <div className="font-semibold">{r.title}</div>
                      <div className="text-xs text-navy/70">{r.subtitle}</div>
                      {r.snippet && <div className="text-xs text-navy/60 mt-1 line-clamp-2">{r.snippet}</div>}
                    </button>
                  ))}
                </div>
              ) : null
            )
          )}
        </div>
      )}
    </div>
  );
}
