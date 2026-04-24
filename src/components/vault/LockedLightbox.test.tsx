import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LockedLightbox } from './LockedLightbox';
import type { MediaItem } from '../../types/media';

const item: MediaItem = {
  id: 'locked-1',
  type: 'video',
  date: '2025-07-13',
  access: 'private',
  thumb: '/thumb.jpg',
  descriptionShort: 'Short.',
  descriptionLong: 'Long description that appears in the locked lightbox.',
  tags: [],
};

describe('LockedLightbox', () => {
  it('renders the long description and a mailto request link', () => {
    render(<LockedLightbox item={item} onClose={() => {}} />);
    expect(screen.getByText(/Long description/)).toBeInTheDocument();
    const cta = screen.getByRole('link', { name: /Request access/ });
    expect(cta).toHaveAttribute('href', expect.stringMatching(/^mailto:/));
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn();
    render(<LockedLightbox item={item} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /Close/ }));
    expect(onClose).toHaveBeenCalled();
  });

  it('does NOT render attribution fields', () => {
    const itemWithAttr: MediaItem = { ...item, attribution: { paper: 'Secret Paper', headline: 'Secret Headline' } };
    render(<LockedLightbox item={itemWithAttr} onClose={() => {}} />);
    expect(screen.queryByText(/Secret Paper/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Secret Headline/)).not.toBeInTheDocument();
  });
});
