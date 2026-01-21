import { APIResource } from '../resource';
import type {
  GetSeriesListResponse,
  GetSeriesResponse,
  SeriesListParams,
} from '../types';

export class Series extends APIResource {
  async list(params?: SeriesListParams): Promise<GetSeriesListResponse> {
    return this.client.get('/v1/series', { query: params });
  }

  async retrieve(id: number): Promise<GetSeriesResponse> {
    return this.client.get(`/v1/series/id/${id}`);
  }
}
