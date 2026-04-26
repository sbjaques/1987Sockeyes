import { describe, it, expect } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import VaultPage from './VaultPage';

describe('VaultPage ?focus=<id>', () => {
  it('opens the lightbox for the focused item', async () => {
    render(
      <MemoryRouter initialEntries={['/vault?focus=scan-664872292']}>
        <Routes>
          <Route path="/vault" element={<VaultPage />} />
        </Routes>
      </MemoryRouter>,
    );
    await waitFor(() => {
      const dialog = document.querySelector('[role="dialog"]');
      expect(dialog).toBeTruthy();
    }, { timeout: 3000 });
  });
});
