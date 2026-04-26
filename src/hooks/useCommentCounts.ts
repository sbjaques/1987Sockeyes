import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { CountsResponse } from '../lib/comments';
import { BUILD_MODE } from '../lib/buildMode';

export function useCommentCounts(): { byTarget: Record<string, number> } {
  const [byTarget, setByTarget] = useState<Record<string, number>>({});
  useEffect(() => {
    if (BUILD_MODE !== 'private') return;
    api.counts()
      .then((r: CountsResponse) => setByTarget(r.byTarget))
      .catch(() => {});  // silent — count badge is decorative
  }, []);
  return { byTarget };
}
