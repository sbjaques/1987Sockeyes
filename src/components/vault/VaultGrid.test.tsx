import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VaultGrid } from './VaultGrid';
import type { MediaItem } from '../../types/media';

const items: MediaItem[] = [
  { id:'a', type:'newspaper', date:'1987-04-01', access:'public', thumb:'/a.jpg', descriptionShort:'Sockeyes Win', descriptionLong:'', tags:['centennial-cup'] },
  { id:'b', type:'photo',     date:'1987-05-01', access:'public', thumb:'/b.jpg', descriptionShort:'Team Photo',   descriptionLong:'', tags:['team'] },
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
