import { PolymarketUSError, WebSocketError } from '../error';
import { BaseWebSocket, type WebSocketOptions } from './base';
import type {
  AccountBalanceSnapshot,
  AccountBalanceUpdate,
  LegacyAccountBalanceSnapshot,
  LegacyAccountBalanceUpdate,
  LegacyPositionUpdate,
  OrderSnapshot,
  OrderUpdate,
  PositionSnapshot,
  PositionUpdate,
  PrivateMessage,
  PrivateSubscriptionType,
  RFQEvent,
} from './types';

type PrivateEventTypes = {
  open: () => void;
  message: (data: PrivateMessage) => void;
  orderSnapshot: (data: OrderSnapshot) => void;
  orderUpdate: (data: OrderUpdate) => void;
  positionSnapshot: (data: PositionSnapshot) => void;
  positionUpdate: (data: PositionUpdate | LegacyPositionUpdate) => void;
  accountBalanceSnapshot: (
    data: AccountBalanceSnapshot | LegacyAccountBalanceSnapshot,
  ) => void;
  accountBalanceUpdate: (
    data: AccountBalanceUpdate | LegacyAccountBalanceUpdate,
  ) => void;
  rfqEvent: (data: RFQEvent) => void;
  heartbeat: () => void;
  error: (error: PolymarketUSError | WebSocketError) => void;
  close: () => void;
};

export class PrivateWebSocket extends BaseWebSocket<PrivateEventTypes> {
  constructor(options: WebSocketOptions) {
    super(options, '/v1/ws/private');
  }

  subscribeOrders(requestId: string, marketSlugs?: string[]): void {
    this.subscribe(requestId, 'SUBSCRIPTION_TYPE_ORDER', marketSlugs);
  }

  subscribePositions(requestId: string, marketSlugs?: string[]): void {
    this.subscribe(requestId, 'SUBSCRIPTION_TYPE_POSITION', marketSlugs);
  }

  subscribeAccountBalance(requestId: string): void {
    this.subscribe(requestId, 'SUBSCRIPTION_TYPE_ACCOUNT_BALANCE');
  }

  subscribeRFQ(requestId: string): void {
    this.subscribe(requestId, 'SUBSCRIPTION_TYPE_RFQ');
  }

  subscribeAll(
    requestId: string,
    subscriptionType: PrivateSubscriptionType,
    marketSlugs?: string[],
  ): void {
    this.subscribe(requestId, subscriptionType, marketSlugs);
  }

  protected handleMessage(data: string): void {
    let message: PrivateMessage;
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

    if ('error' in message && message.error) {
      this._emit(
        'error',
        new WebSocketError(
          message.error,
          message.requestId,
          message.subscriptionType,
        ),
      );
      return;
    }

    if ('orderSubscriptionSnapshot' in message || 'ordersSnapshot' in message) {
      this._emit('orderSnapshot', message as OrderSnapshot);
    } else if (
      'orderSubscriptionUpdate' in message ||
      'orderUpdate' in message
    ) {
      this._emit('orderUpdate', message as OrderUpdate);
    } else if (
      'positionSubscriptionSnapshot' in message ||
      'positionsSnapshot' in message
    ) {
      this._emit('positionSnapshot', message as PositionSnapshot);
    } else if (
      'positionSubscription' in message ||
      'positionSubscriptionUpdate' in message ||
      'positionUpdate' in message
    ) {
      this._emit('positionUpdate', message);
    } else if (
      'accountBalanceSubscriptionSnapshot' in message ||
      'accountBalancesSnapshot' in message
    ) {
      this._emit('accountBalanceSnapshot', message);
    } else if (
      'accountBalancesUpdate' in message ||
      'accountBalanceSubscriptionUpdate' in message ||
      'accountBalanceUpdate' in message
    ) {
      this._emit('accountBalanceUpdate', message);
    } else if ('rfqEvent' in message) {
      this._emit('rfqEvent', message);
    }
  }

  protected handleError(event: unknown): void {
    const message =
      event instanceof Error ? event.message : 'WebSocket error occurred';
    this._emit('error', new PolymarketUSError(message));
  }

  protected handleClose(): void {
    this._emit('close');
  }
}
