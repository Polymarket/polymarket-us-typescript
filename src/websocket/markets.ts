import { PolymarketUSError, WebSocketError } from '../error';
import { BaseWebSocket, type WebSocketOptions } from './base';
import type {
  MarketData,
  MarketDataLite,
  MarketMessage,
  MarketSubscriptionType,
  Trade,
} from './types';

type MarketEventTypes = {
  open: () => void;
  message: (data: MarketMessage) => void;
  marketData: (data: MarketData) => void;
  marketDataLite: (data: MarketDataLite) => void;
  trade: (data: Trade) => void;
  heartbeat: () => void;
  error: (error: PolymarketUSError | WebSocketError) => void;
  reconnect: () => void;
  close: () => void;
};

export class MarketsWebSocket extends BaseWebSocket<MarketEventTypes> {
  constructor(options: WebSocketOptions) {
    super(options, '/v1/ws/markets');
  }

  subscribeMarketData(requestId: string, marketSlugs: string[]): void {
    this.subscribe(requestId, 'SUBSCRIPTION_TYPE_MARKET_DATA', marketSlugs);
  }

  subscribeMarketDataLite(requestId: string, marketSlugs: string[]): void {
    this.subscribe(
      requestId,
      'SUBSCRIPTION_TYPE_MARKET_DATA_LITE',
      marketSlugs,
    );
  }

  subscribeTrades(requestId: string, marketSlugs: string[]): void {
    this.subscribe(requestId, 'SUBSCRIPTION_TYPE_TRADE', marketSlugs);
  }

  subscribeAll(
    requestId: string,
    subscriptionType: MarketSubscriptionType,
    marketSlugs: string[],
  ): void {
    this.subscribe(requestId, subscriptionType, marketSlugs);
  }

  protected handleMessage(data: string): void {
    let message: MarketMessage;
    try {
      message = JSON.parse(data);
    } catch {
      this._emit(
        'error',
        new PolymarketUSError(`Failed to parse WebSocket message: ${data}`),
      );
      return;
    }

    this._emit('message', message);

    if ('heartbeat' in message) {
      this._emit('heartbeat');
      return;
    }

    if ('error' in message) {
      this._emit('error', new WebSocketError(message.error, message.requestId));
      return;
    }

    if ('marketData' in message) {
      this._emit('marketData', message as MarketData);
    } else if ('marketDataLite' in message) {
      this._emit('marketDataLite', message as MarketDataLite);
    } else if ('trade' in message) {
      this._emit('trade', message as Trade);
    }
  }
}
