export type Position = 'F' | 'D' | 'G';
export type RosterRole = 'player' | 'head-coach' | 'assistant-coach' | 'trainer' | 'staff';

export interface SkaterStats { gp: number; g: number; a: number; pts: number; pim: number; }
export interface GoalieStats { gp: number; w: number; l: number; gaa: number; svpct: number; so: number; }

interface BaseEntry {
  id: string;
  name: string;
  hometown: string;
  role: RosterRole;
  number?: number;
  notes?: string;
}
export interface Skater extends BaseEntry { position: 'F' | 'D'; playoffStats: SkaterStats; }
export interface Goalie extends BaseEntry  { position: 'G';       playoffStats: GoalieStats; }
export interface Staff  extends BaseEntry  { position?: undefined; playoffStats?: undefined; }

export type RosterEntry = Skater | Goalie | Staff;
export const isSkater = (e: RosterEntry): e is Skater => e.position === 'F' || e.position === 'D';
export const isGoalie = (e: RosterEntry): e is Goalie => e.position === 'G';
