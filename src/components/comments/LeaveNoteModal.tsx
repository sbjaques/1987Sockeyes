import { useEffect, useRef, useState } from 'react';
import { api } from '../../lib/api';
import { useMe } from '../../hooks/useMe';

interface Props {
  target: string;             // "global" or "media:<id>"
  targetLabel: string;        // human-readable label shown in the pill
  onClose: () => void;
}

export function LeaveNoteModal({ target, targetLabel, onClose }: Props) {
  const me = useMe();
  const [body, setBody] = useState('');
  const [firstAnnotation, setFirstAnnotation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFocusable = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    firstFocusable.current?.focus();
  }, []);

  const isFirst = me.data?.annotation === null;

  async function handleSubmit() {
    if (submitting) return;
    if (!body.trim()) { setError('Please enter a note.'); return; }
    setSubmitting(true);
    setError(null);
    try {
      await api.createComment({
        target,
        body: body.trim(),
        firstAnnotation: isFirst && firstAnnotation.trim() ? firstAnnotation.trim() : undefined,
      });
      onClose();
    } catch (e) {
      setError('Could not save — try again.');
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Leave a note"
      className="fixed inset-0 bg-navy/70 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={dialogRef} className="bg-cream max-w-2xl w-full rounded shadow-xl p-6">
        <div className="flex items-baseline justify-between mb-1">
          <h3 className="text-lg font-serif">Leave a note</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-navy/60 text-lg">×</button>
        </div>
        <div className="text-xs uppercase tracking-widest text-navy/60 mb-3">
          About: <span className="bg-navy text-cream px-2 py-0.5 rounded ml-1 normal-case tracking-normal">{targetLabel}</span>
        </div>
        {isFirst && (
          <input
            type="text"
            value={firstAnnotation}
            onChange={(e) => setFirstAnnotation(e.target.value)}
            placeholder="Brian Kozak's son (optional — helps Steve recognize you)"
            className="w-full mb-3 px-3 py-2 border border-navy/20 bg-white rounded text-sm"
            maxLength={200}
          />
        )}
        <textarea
          ref={firstFocusable}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="A correction, an identification, a memory, a question — anything you want Steve to see. He reviews everything personally before integrating."
          className="w-full min-h-[140px] px-3 py-2 border border-navy/20 bg-white rounded text-sm font-serif"
          maxLength={4000}
        />
        {error && <div className="text-crimson text-sm mt-2">{error}</div>}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-xs uppercase tracking-widest text-navy">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-crimson text-cream px-5 py-2 text-xs uppercase tracking-widest disabled:opacity-50">
            {submitting ? 'Sending…' : 'Leave note →'}
          </button>
        </div>
      </div>
    </div>
  );
}
