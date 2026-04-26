import { useState } from 'react';
import type { Comment, CommentStatus } from '../../lib/comments';

interface Props {
  comment: Comment;
  annotation: string | null;
  onTriage: (status: CommentStatus, adminNote: string) => void;
  onAnnotate: () => void;
}

export function InboxRow({ comment, annotation, onTriage, onAnnotate }: Props) {
  const [adminNote, setAdminNote] = useState(comment.adminNote ?? '');
  const ts = new Date(comment.submittedAt);
  const targetLabel = comment.target === 'global'
    ? 'General archive note'
    : comment.target;
  return (
    <div className="grid grid-cols-[1fr_280px] border-b border-cream-300 last:border-b-0">
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-3 text-xs mb-2">
          <span className="font-semibold">{comment.submitterEmail}</span>
          {annotation && <span className="italic opacity-60">— {annotation}</span>}
          <span className="bg-navy text-cream px-2 py-0.5 rounded text-[11px]">{targetLabel}</span>
          {comment.emailNotified === false && (
            <span className="text-crimson text-[11px]">✉ delivery failed</span>
          )}
          <span className="opacity-50 ml-auto">{ts.toLocaleString()}</span>
        </div>
        <p className="text-sm whitespace-pre-wrap">{comment.body}</p>
      </div>
      <div className="border-l border-cream-300 p-4 bg-cream-100">
        <div className="text-[11px] uppercase tracking-widest opacity-60 mb-2">Triage</div>
        <div className="flex gap-2 flex-wrap mb-2">
          <button onClick={() => onTriage('applied', adminNote)}
            className="bg-crimson text-cream px-3 py-1 text-[11px] uppercase tracking-widest rounded">✓ Applied</button>
          <button onClick={() => onTriage('rejected', adminNote)}
            className="border border-navy/30 px-3 py-1 text-[11px] uppercase tracking-widest rounded">✗ Rejected</button>
          <button onClick={() => onTriage('parked', adminNote)}
            className="border border-navy/30 px-3 py-1 text-[11px] uppercase tracking-widest rounded">⏸ Parked</button>
        </div>
        <textarea
          value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
          placeholder="One-line note (optional)"
          className="w-full text-xs px-2 py-1 border border-navy/20 rounded"
          rows={2}
          maxLength={500}
        />
        {!annotation && (
          <button onClick={onAnnotate} className="text-[11px] text-crimson mt-2 underline">
            + Annotate this submitter
          </button>
        )}
      </div>
    </div>
  );
}
