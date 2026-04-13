import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSortableTable } from './useSortableTable';

describe('useSortableTable', () => {
  const rows = [{ n: 'b', v: 2 }, { n: 'a', v: 1 }];
  it('starts with default sort key asc', () => {
    const { result } = renderHook(() => useSortableTable(rows, 'n'));
    expect(result.current.sorted.map(r => r.n)).toEqual(['a','b']);
    expect(result.current.sortKey).toBe('n');
    expect(result.current.sortDir).toBe('asc');
  });
  it('toggles direction when same key clicked twice', () => {
    const { result } = renderHook(() => useSortableTable(rows, 'n'));
    act(() => result.current.toggleSort('n'));
    expect(result.current.sortDir).toBe('desc');
  });
  it('switches to new key with asc direction', () => {
    const { result } = renderHook(() => useSortableTable(rows, 'n'));
    act(() => result.current.toggleSort('v'));
    expect(result.current.sortKey).toBe('v');
    expect(result.current.sortDir).toBe('asc');
  });
});
