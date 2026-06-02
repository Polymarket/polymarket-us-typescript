import { DEFAULT_PAGE_SIZE, paginateOffset } from '../pagination';
import { APIResource } from '../resource';
import type {
  GetMarketResponse,
  GetMarketsResponse,
  MarketBBO,
  MarketBook,
  MarketDetail,
  MarketSettlement,
  MarketsListParams,
} from '../types';

export class Markets extends APIResource {
  async list(params?: MarketsListParams): Promise<GetMarketsResponse> {
    return this.client.get('/v1/markets', { query: params });
  }

  /** Iterate over all markets across pages, fetching them lazily. */
  iterate(
    params?: MarketsListParams,
    pageSize: number = DEFAULT_PAGE_SIZE,
  ): AsyncGenerator<MarketDetail> {
    return paginateOffset<MarketDetail>(
      (offset, limit) =>
        this.client.get<Record<string, unknown>>('/v1/markets', {
          query: { ...params, limit, offset },
        }),
      'markets',
      pageSize,
    );
  }

  async retrieve(id: number): Promise<GetMarketResponse> {
    return this.client.get(`/v1/market/id/${id}`);
  }

  async retrieveBySlug(slug: string): Promise<GetMarketResponse> {
    return this.client.get(`/v1/market/slug/${slug}`);
  }

  async book(slug: string): Promise<MarketBook> {
    return this.client.get(`/v1/markets/${slug}/book`);
  }

  async bbo(slug: string): Promise<MarketBBO> {
    return this.client.get(`/v1/markets/${slug}/bbo`);
  }

  async settlement(slug: string): Promise<MarketSettlement> {
    return this.client.get(`/v1/markets/${slug}/settlement`);
  }
}
