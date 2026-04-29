import { useEffect, useState } from 'react';
import type { MeResponse } from '../lib/comments';
import { api } from '../lib/api';

let cache: MeResponse | null = null;
let inflight: Promise<MeResponse> | null = null;

export function _resetMeCache() {
  cache = null;
  inflight = null;
}

export interface UseMeResult {
  data: MeResponse | null;
  isLoading: boolean;
  error: unknown;
}

export function useMe(): UseMeResult {
  const [data, setData] = useState<MeResponse | null>(cache);
  const [error, setError] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(cache === null);

  useEffect(() => {
    if (cache) return;
    setIsLoading(true);
    if (!inflight) inflight = api.me();
    inflight
      .then((r) => { cache = r; setData(r); })
      .catch((e) => setError(e))
      .finally(() => setIsLoading(false));
  }, []);

  return { data, isLoading, error };
}
