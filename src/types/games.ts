export type CupSeries = 'Mowat' | 'Doyle' | 'Abbott' | 'Centennial';
export type Round = 'Round-Robin' | 'Semifinal' | 'Final' | 'Game 1' | 'Game 2' | 'Game 3' | 'Game 4' | 'Game 5' | 'Game 6' | 'Game 7';
export type Result = 'W' | 'L' | 'T';

export interface Game {
  id: string;
  date: string;
  series: CupSeries;
  round: Round;
  opponent: string;
  location: string;
  result: Result;
  score: { for: number; against: number };
  highlights: string[];
  sources: string[];
}
