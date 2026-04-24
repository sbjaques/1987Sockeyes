import { BUILD_MODE } from './buildMode';

const IMAGE_REF_RE = /,?\s*images?\s+\d{7,}(?:(?:\s*,\s*|\s+and\s+|\s*;\s*)\d{7,})*/g;
const EDITOR_NOTE_RE = /\s*\[verified\s+[^\]]*\]/gi;
const SOURCES_SECTION_RE = /\n(?:-{3,}\s*\n\s*)?##\s+Sources\s*(?:&amp;|&|and)\s*gaps[\s\S]*$/i;

function cleanupArtifacts(text: string): string {
  let s = text;
  s = s.replace(/,(\s*,)+/g, ',');
  s = s.replace(/;(\s*;)+/g, ';');
  s = s.replace(/\(\s*[,;]\s*/g, '(');
  s = s.replace(/\s*[,;]\s*\)/g, ')');
  s = s.replace(/\s*\(\s*[,;.]?\s*\)/g, '');
  s = s.replace(/[ \t]{2,}/g, ' ');
  s = s.replace(/ +([,.;])/g, '$1');
  return s;
}

/** Strip inline image-id citations and editor brackets. Public build only. */
export function stripImageRefsForPublic(text: string): string {
  if (BUILD_MODE === 'private') return text;
  let s = text;
  s = s.replace(IMAGE_REF_RE, '');
  s = s.replace(EDITOR_NOTE_RE, '');
  s = cleanupArtifacts(s);
  return s;
}

/** Strip trailing `## Sources & gaps` section from long-form markdown. Public build only. */
export function stripSourcesSectionForPublic(markdown: string): string {
  if (BUILD_MODE === 'private') return markdown;
  return markdown.replace(SOURCES_SECTION_RE, '');
}

/** Apply every public-tier strip. Safe to call on any prose or markdown string. */
export function stripArchivistNotesForPublic(text: string): string {
  if (BUILD_MODE === 'private') return text;
  return stripImageRefsForPublic(stripSourcesSectionForPublic(text));
}
