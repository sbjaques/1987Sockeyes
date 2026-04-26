import type { Comment, CountsResponse, ListResponse, MeResponse, CommentStatus } from './comments';

const BASE = ''; // relative — same origin as the SPA

class ApiError extends Error {
  public status: number;
  public body: unknown;

  constructor(status: number, body: unknown) {
    super(`api ${status}`);
    this.status = status;
    this.body = body;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    let body: unknown;
    try { body = await res.json(); } catch { body = await res.text(); }
    throw new ApiError(res.status, body);
  }
  return res.json() as Promise<T>;
}

export const api = {
  me: () => request<MeResponse>('/api/me'),
  counts: () => request<CountsResponse>('/api/comments/counts'),
  createComment: (body: { target: string; body: string; firstAnnotation?: string }) =>
    request<{ id: string; submittedAt: number }>('/api/comments', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  listComments: (params: { status?: CommentStatus; cursor?: string }) => {
    const qs = new URLSearchParams();
    if (params.status) qs.set('status', params.status);
    if (params.cursor) qs.set('cursor', params.cursor);
    return request<ListResponse>(`/api/comments?${qs}`);
  },
  setStatus: (id: string, status: CommentStatus, adminNote?: string) =>
    request<Comment>(`/api/comments/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, adminNote }),
    }),
  setAnnotation: (email: string, label: string) =>
    request<{ label: string; updatedAt: number }>(`/api/annotations/${encodeURIComponent(email)}`, {
      method: 'POST',
      body: JSON.stringify({ label }),
    }),
};

export { ApiError };
