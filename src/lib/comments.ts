export type CommentTarget = 'global' | `media:${string}`;
export type CommentStatus = 'pending' | 'applied' | 'rejected' | 'parked';

export interface Comment {
  id: string;
  target: CommentTarget;
  body: string;
  submitterEmail: string;
  submitterFirstAnnotation?: string;
  status: CommentStatus;
  adminNote?: string;
  submittedAt: number;
  lastTriagedAt?: number;
  emailNotified?: boolean;
  emailError?: string;
}

export interface MeResponse {
  email: string;
  isAdmin: boolean;
  annotation: string | null;
}

export interface CountsResponse {
  byStatus: Record<CommentStatus, number>;
  byTarget: Record<string, number>;
}

export interface ListResponse {
  comments: Comment[];
  cursor: string | null;
}
