import { APIResource } from '../resource';
import type {
  GetMarketBBOResponse,
  GetMarketBookResponse,
  GetMarketResponse,
  GetMarketsResponse,
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

  async book(slug: string): Promise<GetMarketBookResponse> {
    return this.client.get(`/v1/markets/${slug}/book`);
  }

  async bbo(slug: string): Promise<GetMarketBBOResponse> {
    return this.client.get(`/v1/markets/${slug}/bbo`);
  }

  async settlement(slug: string): Promise<MarketSettlement> {
    return this.client.get(`/v1/markets/${slug}/settlement`);
  }
}
