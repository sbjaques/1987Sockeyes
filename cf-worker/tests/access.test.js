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
