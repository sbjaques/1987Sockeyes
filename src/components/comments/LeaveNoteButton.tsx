import { useState } from 'react';
import { LeaveNoteModal } from './LeaveNoteModal';

interface Props {
  target: string;
  targetLabel: string;
  variant?: 'pill' | 'icon';
  className?: string;
}

export function LeaveNoteButton({ target, targetLabel, variant = 'pill', className = '' }: Props) {
  const [open, setOpen] = useState(false);
  const trigger = variant === 'pill' ? (
    <button
      onClick={() => setOpen(true)}
      className={`bg-crimson text-cream px-3 py-1.5 text-xs uppercase tracking-widest hover:bg-crimson/90 rounded-sm ${className}`}>
      + Leave a note
    </button>
  ) : (
    <button
      onClick={() => setOpen(true)}
      aria-label="Leave a note"
      title="Leave a note"
      className={`bg-navy/85 hover:bg-crimson text-cream rounded-full w-7 h-7 flex items-center justify-center text-sm ${className}`}>
      💬
    </button>
  );
  return <>
    {trigger}
    {open && <LeaveNoteModal target={target} targetLabel={targetLabel} onClose={() => setOpen(false)} />}
  </>;
}
