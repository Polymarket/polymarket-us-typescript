import type {
  Amount,
  Execution,
  GetAccountBalancesResponse,
  Order,
  Quote,
  RFQ,
  UserBalance,
  UserPosition,
} from '../types';

export type PrivateSubscriptionType =
  | 'SUBSCRIPTION_TYPE_ORDER'
  | 'SUBSCRIPTION_TYPE_ORDER_SNAPSHOT'
  | 'SUBSCRIPTION_TYPE_POSITION'
  | 'SUBSCRIPTION_TYPE_ACCOUNT_BALANCE'
  | 'SUBSCRIPTION_TYPE_RFQ';

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
  subscriptionType: 'SUBSCRIPTION_TYPE_ORDER_SNAPSHOT';
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
  positionSubscription: {
    beforePosition: UserPosition | null;
    afterPosition: UserPosition | null;
    updateTime: string | null;
    entryType: string;
    tradeId: string;
    referenceId: string;
    description: string;
    allocationGroupId: string;
    transferReferenceTradeIds: string[];
    shortTransfer: boolean;
    updateTradeDate: string | null;
  };
}

export interface AccountBalanceSnapshot {
  requestId: string;
  subscriptionType: 'SUBSCRIPTION_TYPE_ACCOUNT_BALANCE';
  accountBalancesSnapshot: GetAccountBalancesResponse;
}

export interface AccountBalanceUpdate {
  requestId: string;
  subscriptionType: 'SUBSCRIPTION_TYPE_ACCOUNT_BALANCE';
  accountBalancesUpdate: {
    balanceChange: {
      beforeBalance: UserBalance | null;
      afterBalance: UserBalance | null;
      description: string;
      updateTime: string | null;
      modifiedSecurityId: string;
      entryType: string;
      accountName: string;
      id: string;
    };
  };
}

interface LegacyPosition {
  marketSlug: string;
  position: UserPosition;
}

export type LegacyPositionUpdate = {
  requestId: string;
  subscriptionType: 'SUBSCRIPTION_TYPE_POSITION';
} & (
  | { positionSubscriptionUpdate: LegacyPosition }
  | { positionUpdate: LegacyPosition }
);

interface LegacyAccountBalance {
  balance: number;
  buyingPower: number;
}

export interface LegacyAccountBalanceSnapshot {
  requestId: string;
  subscriptionType: 'SUBSCRIPTION_TYPE_ACCOUNT_BALANCE';
  accountBalanceSubscriptionSnapshot: LegacyAccountBalance;
}

export type LegacyAccountBalanceUpdate = {
  requestId: string;
  subscriptionType: 'SUBSCRIPTION_TYPE_ACCOUNT_BALANCE';
} & (
  | { accountBalanceSubscriptionUpdate: LegacyAccountBalance }
  | { accountBalanceUpdate: LegacyAccountBalance }
);

export interface RFQEventPayload {
  rfqCreated?: { rfq: RFQ | null };
  rfqClosed?: { rfq: RFQ | null };
  quoteCreated?: { quote: Quote | null };
  quoteDeleted?: { quote: Quote | null };
  quoteAccepted?: {
    quote: Quote | null;
    confirmationDeadline: string | null;
  };
  quoteConfirmed?: {
    quote: Quote | null;
    executionDeadline: string | null;
  };
  quoteExecuted?: {
    quote: Quote | null;
    orderId: string;
    clientOrderId: string;
    executedTime: string | null;
  };
}

export interface RFQEvent {
  requestId: string;
  subscriptionType: 'SUBSCRIPTION_TYPE_RFQ';
  rfqEvent: RFQEventPayload;
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
  | LegacyPositionUpdate
  | AccountBalanceSnapshot
  | AccountBalanceUpdate
  | LegacyAccountBalanceSnapshot
  | LegacyAccountBalanceUpdate
  | RFQEvent
  | Heartbeat
  | WebSocketErrorMessage;

export type MarketMessage =
  | MarketData
  | MarketDataLite
  | Trade
  | Heartbeat
  | WebSocketErrorMessage;
