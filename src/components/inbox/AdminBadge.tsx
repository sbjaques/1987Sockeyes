import { Link } from 'react-router-dom';
import { useMe } from '../../hooks/useMe';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export function AdminBadge() {
  const me = useMe();
  const [pending, setPending] = useState<number | null>(null);

  useEffect(() => {
    if (!me.data?.isAdmin) return;
    api.counts().then((c) => setPending(c.byStatus.pending)).catch(() => {});
  }, [me.data?.isAdmin]);

  if (!me.data?.isAdmin || pending === null) return null;

  return (
    <Link
      to="/admin/inbox"
      title="Admin inbox"
      className="inline-flex items-center gap-1 bg-navy/85 hover:bg-crimson text-cream px-2 py-1 rounded text-[11px]">
      ✉ <span className="font-bold">{pending}</span>
    </Link>
  );
}
