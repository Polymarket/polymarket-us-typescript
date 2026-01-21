import { APIResource } from '../resource';
import type { SearchParams, SearchResponse } from '../types';

export class Search extends APIResource {
  async query(params?: SearchParams): Promise<SearchResponse> {
    return this.client.get('/v1/search', { query: params });
  }
}
