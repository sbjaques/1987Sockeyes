export type MediaType = 'newspaper' | 'program' | 'photo' | 'video' | 'document';

export type MediaAccess = 'public' | 'private';

export interface MediaAttribution {
  paper: string;
  headline?: string;
  byline?: string;
  page?: string;
  imageId?: string;
}

export interface MediaItem {
  id: string;
  type: MediaType;
  date: string;
  access: MediaAccess;
  thumb: string;
  descriptionShort: string;
  descriptionLong: string;
  url?: string;
  attribution?: MediaAttribution;
  tags: string[];
  relatedGames?: string[];
}
