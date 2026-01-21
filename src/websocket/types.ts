import type { Amount, Execution, Order, UserPosition } from '../types';

export type PrivateSubscriptionType =
  | 'SUBSCRIPTION_TYPE_ORDER'
  | 'SUBSCRIPTION_TYPE_POSITION'
  | 'SUBSCRIPTION_TYPE_ACCOUNT_BALANCE';

export type MarketSubscriptionType =
  | 'SUBSCRIPTION_TYPE_MARKET_DATA'
  | 'SUBSCRIPTION_TYPE_MARKET_DATA_LITE'
  | 'SUBSCRIPTION_TYPE_TRADE';

export interface SubscribeRequest {
  subscribe: {
    requestId: string;
    subscriptionType: PrivateSubscriptionType | MarketSubscriptionType;
    marketSlugs?: string[];
  };
}

export interface UnsubscribeRequest {
  unsubscribe: {
    requestId: string;
  };
}

export type WebSocketRequest = SubscribeRequest | UnsubscribeRequest;

export interface OrderSnapshot {
  requestId: string;
  subscriptionType: 'SUBSCRIPTION_TYPE_ORDER';
  orderSubscriptionSnapshot: {
    orders: Order[];
    eof: boolean;
  };
}

export interface OrderUpdate {
  requestId: string;
  subscriptionType: 'SUBSCRIPTION_TYPE_ORDER';
  orderSubscriptionUpdate: {
    execution: Execution;
  };
}

export interface PositionSnapshot {
  requestId: string;
  subscriptionType: 'SUBSCRIPTION_TYPE_POSITION';
  positionSubscriptionSnapshot: {
    positions: Record<string, UserPosition>;
    eof: boolean;
  };
}

export interface PositionUpdate {
  requestId: string;
  subscriptionType: 'SUBSCRIPTION_TYPE_POSITION';
  positionSubscriptionUpdate: {
    marketSlug: string;
    position: UserPosition;
  };
}

export interface AccountBalanceSnapshot {
  requestId: string;
  subscriptionType: 'SUBSCRIPTION_TYPE_ACCOUNT_BALANCE';
  accountBalanceSubscriptionSnapshot: {
    balance: number;
    buyingPower: number;
  };
}

export interface AccountBalanceUpdate {
  requestId: string;
  subscriptionType: 'SUBSCRIPTION_TYPE_ACCOUNT_BALANCE';
  accountBalanceSubscriptionUpdate: {
    balance: number;
    buyingPower: number;
  };
}

export interface MarketData {
  requestId: string;
  subscriptionType: 'SUBSCRIPTION_TYPE_MARKET_DATA';
  marketData: {
    marketSlug: string;
    bids: Array<{ px: Amount; qty: string }>;
    offers: Array<{ px: Amount; qty: string }>;
    state: string;
    stats?: {
      lastTradePx?: Amount;
      sharesTraded?: string;
      openInterest?: string;
      highPx?: Amount;
      lowPx?: Amount;
    };
    transactTime?: string;
  };
}

export interface MarketDataLite {
  requestId: string;
  subscriptionType: 'SUBSCRIPTION_TYPE_MARKET_DATA_LITE';
  marketDataLite: {
    marketSlug: string;
    bestBid?: Amount;
    bestAsk?: Amount;
    lastTradePx?: Amount;
  };
}

export interface Trade {
  requestId: string;
  subscriptionType: 'SUBSCRIPTION_TYPE_TRADE';
  trade: {
    marketSlug: string;
    price: Amount;
    quantity: Amount;
    tradeTime: string;
    maker: { side: string; intent: string };
    taker: { side: string; intent: string };
  };
}

export interface Heartbeat {
  heartbeat: Record<string, never>;
}

export interface WebSocketErrorMessage {
  requestId?: string;
  error: string;
}

export type PrivateMessage =
  | OrderSnapshot
  | OrderUpdate
  | PositionSnapshot
  | PositionUpdate
  | AccountBalanceSnapshot
  | AccountBalanceUpdate
  | Heartbeat
  | WebSocketErrorMessage;

export type MarketMessage =
  | MarketData
  | MarketDataLite
  | Trade
  | Heartbeat
  | WebSocketErrorMessage;
