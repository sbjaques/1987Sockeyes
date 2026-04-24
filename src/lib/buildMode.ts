import type { BuildMode } from './filterMediaForBuild';

const raw = import.meta.env.VITE_BUILD_MODE ?? 'public';
if (raw !== 'public' && raw !== 'private') {
  throw new Error(`Invalid VITE_BUILD_MODE=${raw}; expected 'public' or 'private'.`);
}

export const BUILD_MODE: BuildMode = raw;
