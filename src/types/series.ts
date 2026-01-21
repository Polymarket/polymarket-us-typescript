import type { PaginationParams } from './common';

export interface Series {
  id: number;
  slug: string;
  title: string;
  description?: string;
  active: boolean;
  closed: boolean;
  archived: boolean;
  recurrence?: string;
}

export interface SeriesListParams extends PaginationParams {
  orderBy?: string[];
  orderDirection?: 'asc' | 'desc';
  slug?: string[];
  archived?: boolean;
  active?: boolean;
  closed?: boolean;
  recurrence?: string;
}

export interface GetSeriesListResponse {
  series: Series[];
}

export interface GetSeriesResponse {
  series: Series;
}
