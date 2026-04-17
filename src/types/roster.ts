export type Position = 'F' | 'D' | 'G';
export type RosterRole =
  | 'player'
  | 'head-coach'
  | 'assistant-coach'
  | 'trainer'
  | 'assistant-trainer'
  | 'equipment-manager'
  | 'president'
  | 'owner'
  | 'staff';

export interface SkaterStats { gp: number; g: number; a: number; pts: number; pim: number; }
export interface GoalieStats { gp: number; w: number; l: number; gaa: number; svpct: number; so: number; }
export interface GoaliePartialStats {
  gp: number;
  w?: number;
  l?: number;
  gaa?: number;
  svpct?: number;
  so?: number;
}

export interface SeasonStats {
  season: string;
  team: string;
  league: string;
  type: 'regular' | 'playoff';
  stats: SkaterStats | GoalieStats;
}

export interface PlayerLinks {
  hockeydb?: string;
  eliteprospects?: string;
  wikipedia?: string;
  other?: { label: string; url: string }[];
}

export interface PersonalDetails {
  hobbies?: string[];
  likes?: string[];
  dislikes?: string[];
  college?: string;
}

interface BaseEntry {
  id: string;
  name: string;
  hometown: string;
  role: RosterRole;
  number?: number;
  notes?: string;
  bio?: string;
  /** Verbatim/lightly-edited mini-bio from the 1986-87 souvenir program. */
  programBio?: string;
  /** Nicknames and clubhouse aliases. */
  aliases?: string[];
  /** Teams before joining the Sockeyes, chronological. */
  priorTeams?: string[];
  /** Roster ids of regular 1986-87 linemates. */
  linemates?: string[];
  /** Brief scouting/narrative assessment in 1986-87. */
  scoutingNotes?: string;
  /** Personality, hobbies, off-ice notes. */
  personalDetails?: PersonalDetails;
  photoUrl?: string;
  birthDate?: string;
  height?: string;
  weight?: number;
  shoots?: 'L' | 'R';
  awards?: string[];
  links?: PlayerLinks;
  careerStats?: SeasonStats[];
  /** Official playoff totals through the Abbott Cup (Mowat + Doyle + Abbott runs, 15 games) per the 1987 Abbott Cup Souvenir Program. Excludes Centennial Cup. */
  abbottCupStats?: SkaterStats | GoaliePartialStats;
  /** Real postseason totals (where known), typically cumulative across 22 playoff games. */
  postseasonStats?: SkaterStats | GoalieStats;
}
export interface Skater extends BaseEntry { position: 'F' | 'D'; playoffStats?: SkaterStats; }
export interface Goalie extends BaseEntry  { position: 'G';       playoffStats?: GoalieStats; }
export interface Staff  extends BaseEntry  { position?: undefined; playoffStats?: undefined; }

export type RosterEntry = Skater | Goalie | Staff;
export const isSkater = (e: RosterEntry): e is Skater => e.position === 'F' || e.position === 'D';
export const isGoalie = (e: RosterEntry): e is Goalie => e.position === 'G';
