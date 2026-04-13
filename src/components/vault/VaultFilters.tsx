import type { MediaType } from '../../types/media';

const TYPES: MediaType[] = ['newspaper','program','photo','video','document'];

export function VaultFilters({
  activeTypes, onToggleType, onClear,
}: {
  activeTypes: MediaType[];
  onToggleType: (t: MediaType) => void;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {TYPES.map(t => {
        const active = activeTypes.includes(t);
        return (
          <button key={t} onClick={() => onToggleType(t)}
            className={`px-3 py-1 text-sm capitalize border ${active ? 'bg-crimson text-cream border-crimson' : 'border-navy/20 text-navy'}`}>
            {t}
          </button>
        );
      })}
      {activeTypes.length > 0 && (
        <button onClick={onClear} className="px-3 py-1 text-sm underline">Clear</button>
      )}
    </div>
  );
}
