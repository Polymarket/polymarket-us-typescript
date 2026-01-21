import { APIResource } from '../resource';
import type {
  GetMarketResponse,
  GetMarketsResponse,
  MarketBBO,
  MarketBook,
  MarketSettlement,
  MarketsListParams,
} from '../types';

export class Markets extends APIResource {
  async list(params?: MarketsListParams): Promise<GetMarketsResponse> {
    return this.client.get('/v1/markets', { query: params });
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
