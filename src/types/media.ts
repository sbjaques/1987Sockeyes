export type MediaType = 'newspaper' | 'program' | 'photo' | 'video' | 'document';

export interface MediaItem {
  id: string;
  type: MediaType;
  title: string;
  publication?: string;
  date?: string;
  file: string;
  thumb?: string;
  caption: string;
  tags: string[];
  relatedGames?: string[];
}
