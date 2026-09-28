export type { PolymarketUSOptions } from './client';
export { PolymarketUS } from './client';

export {
  APIError,
  AuthenticationError,
  BadRequestError,
  InternalServerError,
  NotFoundError,
  PolymarketUSError,
  RateLimitError,
  WebSocketError,
} from './error';

export * from './types';
export type { Trade as PortfolioTrade } from './types/portfolio';

export {
  type AccountBalanceSnapshot,
  type AccountBalanceUpdate,
  type Heartbeat,
  type LegacyAccountBalanceSnapshot,
  type LegacyAccountBalanceUpdate,
  type LegacyPositionUpdate,
  type MarketData,
  type MarketDataLite,
  type MarketMessage,
  type MarketSubscriptionType,
  MarketsWebSocket,
  type OrderSnapshot,
  type OrderUpdate,
  type PositionSnapshot,
  type PositionUpdate,
  type PrivateMessage,
  type PrivateSubscriptionType,
  PrivateWebSocket,
  type RFQEvent,
  type RFQEventPayload,
  type Trade,
  type WebSocketErrorMessage,
  type WebSocketOptions,
} from './websocket';
