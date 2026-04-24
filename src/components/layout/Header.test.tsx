import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Header } from './Header';

describe('Header', () => {
  it('renders team name and nav links', () => {
    render(<MemoryRouter><Header /></MemoryRouter>);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText(/1987 Richmond Sockeyes/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /roster/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /vault/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /hall of fame/i })).toBeInTheDocument();
  });
});
