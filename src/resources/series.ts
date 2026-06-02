import { DEFAULT_PAGE_SIZE, paginateOffset } from '../pagination';
import { APIResource } from '../resource';
import type {
  GetSeriesListResponse,
  GetSeriesResponse,
  SeriesListParams,
  Series as SeriesModel,
} from '../types';

export class Series extends APIResource {
  async list(params?: SeriesListParams): Promise<GetSeriesListResponse> {
    return this.client.get('/v1/series', { query: params });
  }

  /** Iterate over all series across pages, fetching them lazily. */
  iterate(
    params?: SeriesListParams,
    pageSize: number = DEFAULT_PAGE_SIZE,
  ): AsyncGenerator<SeriesModel> {
    return paginateOffset<SeriesModel>(
      (offset, limit) =>
        this.client.get<Record<string, unknown>>('/v1/series', {
          query: { ...params, limit, offset },
        }),
      'series',
      pageSize,
    );
  }

  async retrieve(id: number): Promise<GetSeriesResponse> {
    return this.client.get(`/v1/series/id/${id}`);
  }
}
