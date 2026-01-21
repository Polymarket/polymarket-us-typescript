import type { Event } from './events';

export interface SearchParams {
  query?: string;
  limit?: number;
  seriesIds?: number[];
  status?: 'active' | 'closed' | 'upcoming';
  page?: number;
}

export interface SearchResponse {
  events: Event[];
}
