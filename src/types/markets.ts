import type { Amount, PaginationParams } from './common';

export interface MarketDetail {
  id: number;
  slug: string;
  title: string;
  outcome: string;
  description?: string;
  active: boolean;
  closed: boolean;
  liquidity?: number;
  volume?: number;
  eventSlug?: string;
  team?: Team;
}

export interface Team {
  id: number;
  name: string;
  abbreviation?: string;
  league?: string;
  record?: string;
  logo?: string;
  alias?: string;
  safeName?: string;
  homeIcon?: string;
  awayIcon?: string;
  colorPrimary?: string;
}

export interface OrderBookLevel {
  px: Amount;
  qty: string;
}

export interface MarketBook {
  marketSlug: string;
  bids: OrderBookLevel[];
  offers: OrderBookLevel[];
  state: MarketState;
  stats?: MarketStats | null;
  transactTime?: string | null;
}

export interface MarketStats {
  lastTradePx?: Amount;
  sharesTraded?: string;
  openInterest?: string;
  highPx?: Amount;
  lowPx?: Amount;
}

export interface MarketBBO {
  marketSlug: string;
  bestBid?: Amount | null;
  bestAsk?: Amount | null;
  bidDepth?: number;
  askDepth?: number;
  lastTradePx?: Amount | null;
  sharesTraded?: string;
  openInterest?: string;
}

export interface MarketSettlement {
  slug: string;
  settlement: number;
}

export type MarketState =
  | 'MARKET_STATE_CLOSED'
  | 'MARKET_STATE_OPEN'
  | 'MARKET_STATE_PREOPEN'
  | 'MARKET_STATE_SUSPENDED'
  | 'MARKET_STATE_HALTED'
  | 'MARKET_STATE_EXPIRED'
  | 'MARKET_STATE_TERMINATED'
  | 'MARKET_STATE_MATCH_AND_CLOSE_AUCTION';

export interface MarketsListParams extends PaginationParams {
  orderBy?: string[];
  orderDirection?: 'asc' | 'desc';
  id?: number[];
  slug?: string[];
  eventSlug?: string[];
  archived?: boolean;
  active?: boolean;
  closed?: boolean;
  liquidityMin?: number;
  liquidityMax?: number;
  volumeMin?: number;
  volumeMax?: number;
  gameId?: number;
  categories?: string[];
}

export interface GetMarketsResponse {
  markets: MarketDetail[];
}

export interface GetMarketResponse {
  market: MarketDetail;
}

export interface GetMarketBookResponse {
  marketData: MarketBook;
}

export interface GetMarketBBOResponse {
  marketData: MarketBBO;
}
