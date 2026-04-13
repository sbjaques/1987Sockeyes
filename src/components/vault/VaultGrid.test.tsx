import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VaultGrid } from './VaultGrid';
import type { MediaItem } from '../../types/media';

const items: MediaItem[] = [
  { id:'a', type:'newspaper', title:'Sockeyes Win', file:'/a.jpg', caption:'', tags:['centennial-cup'] },
  { id:'b', type:'photo',     title:'Team Photo', file:'/b.jpg', caption:'', tags:['team'] },
];

describe('VaultGrid', () => {
  it('renders all items by default', () => {
    render(<VaultGrid items={items} />);
    expect(screen.getByText('Sockeyes Win')).toBeInTheDocument();
    expect(screen.getByText('Team Photo')).toBeInTheDocument();
  });
  it('filters by type', async () => {
    render(<VaultGrid items={items} />);
    await userEvent.click(screen.getByRole('button', { name: /^newspaper$/i }));
    expect(screen.getByText('Sockeyes Win')).toBeInTheDocument();
    expect(screen.queryByText('Team Photo')).toBeNull();
  });
});
