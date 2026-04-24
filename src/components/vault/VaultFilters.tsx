import type { MediaType } from '../../types/media';

const TYPES: MediaType[] = ['newspaper','program','photo','video','document'];

export type AccessFilter = 'all' | 'public' | 'private';

export function VaultFilters({
  activeTypes, onToggleType, onClear,
  accessFilter, onSetAccessFilter,
}: {
  activeTypes: MediaType[];
  onToggleType: (t: MediaType) => void;
  onClear: () => void;
  accessFilter: AccessFilter;
  onSetAccessFilter: (a: AccessFilter) => void;
}) {
  const ACCESS_OPTIONS: { value: AccessFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'public', label: 'Public' },
    { value: 'private', label: 'Private' },
  ];

  return (
    <div className="mb-6 space-y-3">
      {/* Access filter — segmented control */}
      <div className="flex items-center gap-1" role="group" aria-label="Filter by access">
        {ACCESS_OPTIONS.map(({ value, label }) => {
          const active = accessFilter === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => onSetAccessFilter(value)}
              aria-pressed={active}
              className={`px-3 py-1 text-xs uppercase tracking-widest border transition-colors ${
                active
                  ? 'bg-navy text-cream border-navy'
                  : 'border-navy/20 text-navy/60 hover:border-navy/40 hover:text-navy'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Type filters */}
      <div className="flex flex-wrap gap-2">
        {TYPES.map(t => {
          const active = activeTypes.includes(t);
          return (
            <button key={t} type="button" onClick={() => onToggleType(t)}
              className={`px-3 py-1 text-sm capitalize border ${active ? 'bg-crimson text-cream border-crimson' : 'border-navy/20 text-navy'}`}>
              {t}
            </button>
          );
        })}
        {activeTypes.length > 0 && (
          <button type="button" onClick={onClear} className="px-3 py-1 text-sm underline">Clear</button>
        )}
      </div>
    </div>
  );
}
