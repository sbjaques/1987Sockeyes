import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useMe, _resetMeCache } from './useMe';

beforeEach(() => {
  _resetMeCache();
  vi.restoreAllMocks();
});

describe('useMe', () => {
  it('fetches /api/me and returns the response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ email: 'a@b.test', isAdmin: false, annotation: null }), { status: 200 }),
    );
    const { result } = renderHook(() => useMe());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual({ email: 'a@b.test', isAdmin: false, annotation: null });
  });

  it('caches the response across multiple hook instances', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ email: 'a@b.test', isAdmin: false, annotation: null }), { status: 200 }),
    );
    renderHook(() => useMe());
    renderHook(() => useMe());
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
  });
});
