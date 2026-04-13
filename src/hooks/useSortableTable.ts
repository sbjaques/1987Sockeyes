import { useMemo, useState, useCallback } from 'react';
import { sortBy, type SortDir } from '../lib/sort';

export function useSortableTable<T, K extends keyof T>(rows: T[], initialKey: K, initialDir: SortDir = 'asc') {
  const [sortKey, setSortKey] = useState<keyof T>(initialKey);
  const [sortDir, setSortDir] = useState<SortDir>(initialDir);

  const toggleSort = useCallback((k: keyof T) => {
    if (k === sortKey) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(k); setSortDir('asc'); }
  }, [sortKey]);

  const sorted = useMemo(() => sortBy(rows, sortKey as K, sortDir), [rows, sortKey, sortDir]);
  return { sorted, sortKey, sortDir, toggleSort };
}
