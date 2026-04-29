// Resend transactional email. Sender is fixed (noreply@87sockeyes.win).
// Both NOTIFY_EMAIL (destination) and RESEND_API_KEY are Wrangler secrets.

const SENDER = 'noreply@87sockeyes.win';
const RESEND_URL = 'https://api.resend.com/emails';

export async function sendNotification(env, comment) {
  if (!env.RESEND_API_KEY || !env.NOTIFY_EMAIL) {
    return { ok: false, error: 'email service not configured' };
  }
  const subject = `New ${comment.target === 'global' ? 'archive note' : 'comment'} — 1987 Sockeyes`;
  const html = `
    <p>A new comment landed in the archive inbox.</p>
    <p><strong>From:</strong> ${escapeHtml(comment.submitterEmail)}<br/>
       <strong>About:</strong> ${escapeHtml(comment.target)}<br/>
       <strong>When:</strong> ${new Date(comment.submittedAt).toISOString()}</p>
    <blockquote style="border-left:4px solid #D8282B;padding-left:12px;margin:12px 0;">
      ${escapeHtml(comment.body).replace(/\n/g, '<br/>')}
    </blockquote>
    <p><a href="https://archive.87sockeyes.win/admin/inbox">Open inbox →</a></p>
  `;
  try {
    const res = await fetch(RESEND_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from: SENDER,
        to: env.NOTIFY_EMAIL,
        subject,
        html,
      }),
    });
    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      return { ok: false, error: `resend ${res.status}: ${errBody.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
