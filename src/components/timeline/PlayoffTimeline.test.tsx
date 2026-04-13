import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlayoffTimeline } from './PlayoffTimeline';
import type { Game } from '../../types/games';

const games: Game[] = [
  { id:'g1', date:'1987-03-20', series:'Mowat', round:'Game 1',
    opponent:'Kelowna', location:'Richmond, BC', result:'W',
    score:{for:4,against:2}, highlights:[], sources:[] },
  { id:'g2', date:'1987-05-10', series:'Centennial', round:'Final',
    opponent:'Humboldt Broncos', location:'Saskatoon, SK', result:'W',
    score:{for:5,against:3}, highlights:[], sources:[] },
];

describe('PlayoffTimeline', () => {
  it('renders a segment per cup present', () => {
    render(<PlayoffTimeline games={games} />);
    expect(screen.getByRole('heading', { name: /Mowat Cup/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Centennial Cup/i })).toBeInTheDocument();
  });
  it('renders each game card', () => {
    render(<PlayoffTimeline games={games} />);
    expect(screen.getByText(/Kelowna/)).toBeInTheDocument();
    expect(screen.getByText(/Humboldt Broncos/)).toBeInTheDocument();
  });
});
