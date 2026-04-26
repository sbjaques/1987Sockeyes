import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LeaveNoteModal } from './LeaveNoteModal';
import { _resetMeCache } from '../../hooks/useMe';

beforeEach(() => {
  _resetMeCache();
  vi.restoreAllMocks();
});

function withMe(annotation: string | null) {
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
    const u = String(url);
    if (u.endsWith('/api/me')) {
      return new Response(JSON.stringify({ email: 'a@b.test', isAdmin: false, annotation }), { status: 200 });
    }
    if (u.endsWith('/api/comments')) {
      return new Response(JSON.stringify({ id: 'new-id', submittedAt: Date.now() }), { status: 201 });
    }
    return new Response('not stubbed', { status: 599 });
  });
}

describe('LeaveNoteModal', () => {
  it('renders the body textarea and target pill for global', () => {
    withMe(null);
    render(<LeaveNoteModal target="global" targetLabel="General archive note" onClose={() => {}} />);
    expect(screen.getByText(/General archive note/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/correction|identification|memory/i)).toBeInTheDocument();
  });

  it('shows the connection input only on first submission', async () => {
    withMe(null);
    render(<LeaveNoteModal target="global" targetLabel="General archive note" onClose={() => {}} />);
    expect(await screen.findByPlaceholderText(/Brian Kozak's son/i)).toBeInTheDocument();
  });

  it('hides the connection input when annotation already exists', async () => {
    withMe('Cousin');
    render(<LeaveNoteModal target="global" targetLabel="General archive note" onClose={() => {}} />);
    await screen.findByText(/General archive note/);
    expect(screen.queryByPlaceholderText(/Brian Kozak's son/i)).not.toBeInTheDocument();
  });

  it('renders body text via plain text node — script tags as literals', () => {
    withMe(null);
    render(<LeaveNoteModal target="global" targetLabel="General archive note" onClose={() => {}} />);
    const textarea = screen.getByPlaceholderText(/correction|identification|memory/i);
    fireEvent.change(textarea, { target: { value: '<script>alert(1)</script>' } });
    expect((textarea as HTMLTextAreaElement).value).toBe('<script>alert(1)</script>');
  });

  it('calls onClose when Cancel clicked', async () => {
    withMe(null);
    const onClose = vi.fn();
    render(<LeaveNoteModal target="global" targetLabel="General archive note" onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('submits and calls onClose on success', async () => {
    withMe(null);
    const onClose = vi.fn();
    render(<LeaveNoteModal target="global" targetLabel="General archive note" onClose={onClose} />);
    await screen.findByPlaceholderText(/Brian Kozak's son/i);
    fireEvent.change(screen.getByPlaceholderText(/correction|identification|memory/i), {
      target: { value: 'a real comment body that is long enough' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Leave note/i }));
    await new Promise((r) => setTimeout(r, 30));
    expect(onClose).toHaveBeenCalled();
  });

  it('responds to ESC key to close', () => {
    withMe(null);
    const onClose = vi.fn();
    render(<LeaveNoteModal target="global" targetLabel="General archive note" onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});
