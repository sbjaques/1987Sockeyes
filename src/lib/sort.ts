export type SortDir = 'asc' | 'desc';

export function sortBy<T, K extends keyof T>(rows: T[], key: K, dir: SortDir): T[] {
  const copy = [...rows];
  copy.sort((a, b) => {
    const av = a[key], bv = b[key];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (typeof av === 'number' && typeof bv === 'number') return av - bv;
    return String(av).localeCompare(String(bv), undefined, { sensitivity: 'base' });
  });
  return dir === 'desc' ? copy.reverse() : copy;
}
