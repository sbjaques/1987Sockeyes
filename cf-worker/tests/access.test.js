import { describe, it, expect } from 'vitest';
import { readToken } from '../lib/access.js';

describe('readToken', () => {
  it('reads the cf-access-jwt-assertion header', () => {
    const req = new Request('https://example.test/x', {
      headers: { 'cf-access-jwt-assertion': 'abc.def.ghi  ' },
    });
    expect(readToken(req)).toBe('abc.def.ghi');
  });

  it('falls back to the CF_Authorization cookie', () => {
    const req = new Request('https://example.test/x', {
      headers: { cookie: 'foo=1; CF_Authorization=abc.def.ghi; bar=2' },
    });
    expect(readToken(req)).toBe('abc.def.ghi');
  });

  it('returns null when neither header nor cookie has a token', () => {
    const req = new Request('https://example.test/x');
    expect(readToken(req)).toBeNull();
  });
});

import { requireOrigin } from '../lib/csrf.js';

describe('requireOrigin', () => {
  const allowed = ['https://archive.87sockeyes.win'];

  it('passes when Origin matches an allowed value', () => {
    const req = new Request('https://archive.87sockeyes.win/api/comments', {
      method: 'POST',
      headers: { Origin: 'https://archive.87sockeyes.win' },
    });
    expect(requireOrigin(req, allowed).ok).toBe(true);
  });

  it('rejects when Origin is missing', () => {
    const req = new Request('https://archive.87sockeyes.win/api/comments', { method: 'POST' });
    const r = requireOrigin(req, allowed);
    expect(r.ok).toBe(false);
    expect(r.response.status).toBe(403);
  });

  it('rejects when Origin is wrong', () => {
    const req = new Request('https://archive.87sockeyes.win/api/comments', {
      method: 'POST',
      headers: { Origin: 'https://attacker.example' },
    });
    expect(requireOrigin(req, allowed).ok).toBe(false);
  });
});
