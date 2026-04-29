import { describe, it, expect } from 'vitest';
import { validateCommentBody, validateStatusBody, validateAnnotationBody } from '../lib/schema.js';

describe('comment body validation', () => {
  it('accepts a valid global comment', () => {
    const r = validateCommentBody({ target: 'global', body: 'hello world' });
    expect(r.ok).toBe(true);
  });

  it('accepts a valid media-target comment with first annotation', () => {
    const r = validateCommentBody({
      target: 'media:scan-12345',
      body: 'a memory',
      firstAnnotation: "Brian Kozak's son",
    });
    expect(r.ok).toBe(true);
  });

  it('rejects an empty body', () => {
    const r = validateCommentBody({ target: 'global', body: '' });
    expect(r.ok).toBe(false);
    expect(r.errors[0].instancePath).toBe('/body');
  });

  it('rejects a body over 4000 chars', () => {
    const r = validateCommentBody({ target: 'global', body: 'x'.repeat(4001) });
    expect(r.ok).toBe(false);
  });

  it('rejects an invalid target', () => {
    const r = validateCommentBody({ target: 'player:steve', body: 'x' });
    expect(r.ok).toBe(false);
  });

  it('rejects extra properties', () => {
    const r = validateCommentBody({ target: 'global', body: 'x', evil: 'extra' });
    expect(r.ok).toBe(false);
  });
});

describe('status body validation', () => {
  it('accepts applied + adminNote', () => {
    expect(validateStatusBody({ status: 'applied', adminNote: 'merged' }).ok).toBe(true);
  });
  it('rejects unknown status', () => {
    expect(validateStatusBody({ status: 'foo' }).ok).toBe(false);
  });
});

describe('annotation body validation', () => {
  it('accepts a label', () => {
    expect(validateAnnotationBody({ label: "Brian Kozak's son" }).ok).toBe(true);
  });
  it('rejects empty label', () => {
    expect(validateAnnotationBody({ label: '' }).ok).toBe(false);
  });
});
