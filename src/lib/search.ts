import Fuse from 'fuse.js';
import type { RosterEntry } from '../types/roster';
import type { Game } from '../types/games';
import type { MediaItem } from '../types/media';

export type SearchResultKind = 'player' | 'staff' | 'game' | 'media';

export interface SearchResult {
  kind: SearchResultKind;
  id: string;
  title: string;
  subtitle: string;
  href: string;
  snippet?: string;
}

export interface SearchIndex {
  search: (query: string) => SearchResult[];
}

export function buildSearchIndex(roster: RosterEntry[], games: Game[], media: MediaItem[]): SearchIndex {
  const rosterDocs = roster.map(r => ({
    kind: (r.role === 'player' ? 'player' : 'staff') as SearchResultKind,
    id: r.id,
    name: r.name,
    hometown: r.hometown,
    role: r.role,
    number: r.number,
    position: (r as { position?: string }).position,
    notes: r.notes ?? '',
    _type: 'roster' as const,
  }));
  const gameDocs = games.map(g => ({
    kind: 'game' as SearchResultKind,
    id: g.id,
    title: `${g.series} Cup — vs ${g.opponent}`,
    opponent: g.opponent,
    series: g.series,
    round: g.round,
    date: g.date,
    location: g.location,
    highlights: g.highlights.join(' '),
    _type: 'game' as const,
  }));
  const mediaDocs = media.map(m => ({
    kind: 'media' as SearchResultKind,
    id: m.id,
    title: m.title,
    publication: m.publication ?? '',
    caption: m.caption,
    tags: m.tags.join(' '),
    date: m.date ?? '',
    type: m.type,
    _type: 'media' as const,
  }));

  type Doc =
    | typeof rosterDocs[number]
    | typeof gameDocs[number]
    | typeof mediaDocs[number];
  const all: Doc[] = [...rosterDocs, ...gameDocs, ...mediaDocs];

  const fuse = new Fuse(all, {
    includeScore: true,
    threshold: 0.35,
    ignoreLocation: true,
    keys: [
      { name: 'name', weight: 3 },
      { name: 'title', weight: 3 },
      { name: 'opponent', weight: 2 },
      { name: 'publication', weight: 1.5 },
      { name: 'hometown', weight: 1 },
      { name: 'highlights', weight: 1 },
      { name: 'caption', weight: 1 },
      { name: 'tags', weight: 1 },
      { name: 'notes', weight: 1 },
      { name: 'series', weight: 0.5 },
      { name: 'role', weight: 0.5 },
    ],
  });

  return {
    search: (query: string): SearchResult[] => {
      if (!query.trim()) return [];
      return fuse.search(query).slice(0, 30).map(r => {
        const d = r.item;
        if (d._type === 'roster') {
          return {
            kind: d.kind, id: d.id,
            title: d.name,
            subtitle: `${d.role.replace('-', ' ')}${d.position ? ` · ${d.position}` : ''}${d.number ? ` · #${d.number}` : ''}${d.hometown ? ` · ${d.hometown}` : ''}`,
            href: `/roster#${d.id}`,
          };
        }
        if (d._type === 'game') {
          return {
            kind: d.kind, id: d.id,
            title: d.title,
            subtitle: `${d.date} · ${d.round} · ${d.location}`,
            href: `/timeline/${d.series}`,
            snippet: d.highlights.slice(0, 120),
          };
        }
        return {
          kind: d.kind, id: d.id,
          title: d.title,
          subtitle: `${d.type}${d.publication ? ` · ${d.publication}` : ''}${d.date ? ` · ${d.date}` : ''}`,
          href: `/vault#${d.id}`,
          snippet: d.caption.slice(0, 160),
        };
      });
    },
  };
}
