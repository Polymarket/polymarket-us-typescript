import type { PaginationParams } from './common';

export interface Event {
  id: number;
  slug: string;
  title: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  active: boolean;
  closed: boolean;
  archived: boolean;
  featured: boolean;
  liquidity?: number;
  volume?: number;
  markets?: Market[];
  tags?: Tag[];
  series?: SeriesInfo;
}

export interface Market {
  id: number;
  slug: string;
  title: string;
  outcome: string;
  active: boolean;
  closed: boolean;
  liquidity?: number;
  volume?: number;
}

export interface Tag {
  id: number;
  slug: string;
  label: string;
}

export interface SeriesInfo {
  id: number;
  slug: string;
  title: string;
}

export interface EventsListParams extends PaginationParams {
  orderBy?: string[];
  orderDirection?: 'asc' | 'desc';
  id?: number[];
  slug?: string[];
  archived?: boolean;
  active?: boolean;
  closed?: boolean;
  liquidityMin?: number;
  liquidityMax?: number;
  volumeMin?: number;
  volumeMax?: number;
  startDateMin?: string;
  startDateMax?: string;
  endDateMin?: string;
  endDateMax?: string;
  tagId?: number;
  tagSlug?: string;
  relatedTags?: boolean;
  featured?: boolean;
  seriesId?: number[];
  eventDate?: string;
  eventWeek?: number;
  startTimeMin?: string;
  startTimeMax?: string;
  gameId?: number;
  ended?: boolean;
  categories?: string[];
}

export interface GetEventsResponse {
  events: Event[];
}

export interface GetEventResponse {
  event: Event;
}
