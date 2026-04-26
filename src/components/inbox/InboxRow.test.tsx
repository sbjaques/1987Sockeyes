import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InboxRow } from './InboxRow';

const baseComment = {
  id: 'c1', target: 'global' as const, body: 'a memory',
  submitterEmail: 'a@b.test', status: 'pending' as const, submittedAt: Date.now() - 60_000,
};

describe('InboxRow', () => {
  it('renders body and submitter', () => {
    render(<InboxRow comment={baseComment} annotation={null} onTriage={() => {}} onAnnotate={() => {}} />);
    expect(screen.getByText('a memory')).toBeInTheDocument();
    expect(screen.getByText('a@b.test')).toBeInTheDocument();
  });

  it('renders body as plain text — script tag is literal', () => {
    render(<InboxRow comment={{ ...baseComment, body: '<script>alert(1)</script>' }} annotation={null} onTriage={() => {}} onAnnotate={() => {}} />);
    expect(screen.getByText('<script>alert(1)</script>')).toBeInTheDocument();
    expect(document.querySelector('script')).toBeNull();
  });

  it('shows email-failure pill if emailNotified=false', () => {
    render(<InboxRow comment={{ ...baseComment, emailNotified: false, emailError: 'oops' }} annotation={null} onTriage={() => {}} onAnnotate={() => {}} />);
    expect(screen.getByText(/delivery failed/i)).toBeInTheDocument();
  });

  it('fires onTriage when Applied clicked', () => {
    const onTriage = vi.fn();
    render(<InboxRow comment={baseComment} annotation={null} onTriage={onTriage} onAnnotate={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Applied/i }));
    expect(onTriage).toHaveBeenCalledWith('applied', '');
  });
});
