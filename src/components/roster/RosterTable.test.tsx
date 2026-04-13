import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RosterTable } from './RosterTable';
import type { Skater } from '../../types/roster';

const skaters: Skater[] = [
  { id:'a', name:'Adam A', position:'F', hometown:'Richmond, BC', role:'player',
    playoffStats:{ gp:10, g:5, a:7, pts:12, pim:4 } },
  { id:'b', name:'Ben B', position:'D', hometown:'Richmond, BC', role:'player',
    playoffStats:{ gp:10, g:2, a:9, pts:11, pim:6 } },
];

describe('RosterTable skaters', () => {
  it('renders rows', () => {
    render(<RosterTable entries={skaters} />);
    expect(screen.getByText('Adam A')).toBeInTheDocument();
    expect(screen.getByText('Ben B')).toBeInTheDocument();
  });
  it('sorts by points descending when Pts header clicked twice', async () => {
    render(<RosterTable entries={skaters} />);
    const ptsHeader = screen.getByRole('button', { name: /pts/i });
    await userEvent.click(ptsHeader);
    await userEvent.click(ptsHeader);
    const rows = screen.getAllByRole('row').slice(1);
    expect(rows[0]).toHaveTextContent('Adam A');
  });
});
