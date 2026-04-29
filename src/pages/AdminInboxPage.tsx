import { useEffect, useState } from 'react';
import { api, ApiError } from '../lib/api';
import { useMe } from '../hooks/useMe';
import { InboxRow } from '../components/inbox/InboxRow';
import type { Comment, CommentStatus, CountsResponse } from '../lib/comments';

const TABS: CommentStatus[] = ['pending', 'applied', 'rejected', 'parked'];

export function AdminInboxPage() {
  const me = useMe();
  const [activeTab, setActiveTab] = useState<CommentStatus>('pending');
  const [comments, setComments] = useState<Comment[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [counts, setCounts] = useState<CountsResponse | null>(null);
  const [annotations, setAnnotations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.counts().then(setCounts).catch(() => {});
  }, []);

  async function loadPage(opts: { reset?: boolean } = {}) {
    setLoading(true);
    setError(null);
    try {
      const r = await api.listComments({
        status: activeTab,
        cursor: opts.reset ? undefined : cursor ?? undefined,
      });
      setComments((prev) => opts.reset ? r.comments : [...prev, ...r.comments]);
      setCursor(r.cursor);
    } catch (e) {
      setError(e instanceof ApiError ? `Error ${e.status}` : 'Network error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadPage({ reset: true }); }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  async function triage(c: Comment, status: CommentStatus, adminNote: string) {
    await api.setStatus(c.id, status, adminNote);
    setComments((prev) => prev.filter((x) => x.id !== c.id));
    api.counts().then(setCounts).catch(() => {});
  }

  async function annotate(email: string) {
    const label = window.prompt(`Annotate ${email} (e.g. "Brian Kozak's son")`);
    if (!label) return;
    await api.setAnnotation(email, label);
    setAnnotations((prev) => ({ ...prev, [email]: label }));
  }

  if (me.isLoading) return <div className="p-8 text-center">Loading…</div>;
  if (!me.data?.isAdmin) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl">Not authorized</h1>
        <p className="opacity-70 mt-2">This page is for the archivist only.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-serif mb-4">Admin inbox</h1>
      <div className="flex border-b border-navy/20 mb-4">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-xs uppercase tracking-widest border-b-2 ${activeTab === t ? 'border-crimson' : 'border-transparent opacity-60'}`}
          >
            {t}{counts && (
              <span className="ml-2 bg-cream px-2 rounded-full">{counts.byStatus[t]}</span>
            )}
          </button>
        ))}
      </div>
      {error && <div className="text-crimson text-sm mb-3">{error}</div>}
      <div className="bg-white border border-navy/10 rounded">
        {comments.map((c) => (
          <InboxRow
            key={c.id}
            comment={c}
            annotation={annotations[c.submitterEmail] ?? null}
            onTriage={(status, note) => triage(c, status, note)}
            onAnnotate={() => annotate(c.submitterEmail)}
          />
        ))}
        {comments.length === 0 && !loading && (
          <div className="p-12 text-center opacity-60">No {activeTab} comments.</div>
        )}
      </div>
      {cursor && (
        <button
          onClick={() => loadPage()}
          disabled={loading}
          className="mt-4 mx-auto block px-4 py-2 text-xs uppercase tracking-widest border border-navy/30 rounded"
        >
          {loading ? 'Loading…' : 'Load more'}
        </button>
      )}
    </div>
  );
}
