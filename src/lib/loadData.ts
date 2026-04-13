import rosterJson from '../data/roster.json';
import gamesJson  from '../data/games.json';
import mediaJson  from '../data/media.json';
import { assertValid, validateRoster, validateGames, validateMedia } from './validateData';
import type { RosterEntry } from '../types/roster';
import type { Game }        from '../types/games';
import type { MediaItem }   from '../types/media';

export const loadRoster = (): RosterEntry[] => assertValid(validateRoster, rosterJson, 'roster');
export const loadGames  = (): Game[]        => assertValid(validateGames,  gamesJson,  'games');
export const loadMedia  = (): MediaItem[]   => assertValid(validateMedia,  mediaJson,  'media');
