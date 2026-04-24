import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderChapter, extractChapterTitle } from './markdownChapter';
import type { MediaItem } from '../types/media';

const items: MediaItem[] = [
  {
    id: 'test-item',
    type: 'photo',
    date: '1987-05-09',
    access: 'public',
    thumb: '/thumbs/test.jpg',
    descriptionShort: 'Test item short description.',
    descriptionLong: 'x'.repeat(90),
    tags: [],
  },
];

describe('renderChapter', () => {
  it('renders plain markdown paragraphs (H1 stripped — title rendered by page)', () => {
    render(<div>{renderChapter('# Heading\n\nSome paragraph.', items)}</div>);
    // The H1 is stripped by renderChapter; the page layer renders it via extractChapterTitle.
    expect(screen.queryByRole('heading', { level: 1 })).toBeNull();
    expect(screen.getByText('Some paragraph.')).toBeInTheDocument();
  });

  it('replaces ![](media:<id>) with a media embed', () => {
    render(<div>{renderChapter('See this: ![](media:test-item)', items)}</div>);
    expect(screen.getByText('Test item short description.')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', '/thumbs/test.jpg');
  });

  it('renders a placeholder when the id is missing', () => {
    render(<div>{renderChapter('Hidden: ![](media:missing-id)', items)}</div>);
    expect(screen.getByText('(private item)')).toBeInTheDocument();
  });
});

describe('extractChapterTitle', () => {
  it('returns the text of the first H1', () => {
    expect(extractChapterTitle('# My Title\n\nBody text.')).toBe('My Title');
  });

  it('returns empty string when there is no H1', () => {
    expect(extractChapterTitle('Just body text.')).toBe('');
  });
});
