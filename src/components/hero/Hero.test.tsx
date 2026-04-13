import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Hero } from './Hero';

describe('Hero', () => {
  it('renders the championship title and subtitle', () => {
    render(<Hero />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Centennial Cup Champions/i);
    expect(screen.getByText(/1987/)).toBeInTheDocument();
  });
});
