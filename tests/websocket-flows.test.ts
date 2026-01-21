import { MarketsWebSocket, PrivateWebSocket } from '../src';
import { PolymarketUSError } from '../src/error';

describe('WebSocket Message Flows', () => {
  const validOptions = {
    keyId: 'test-key',
    secretKey: 'nWGxne/9WmC6hEr0kuwsxERJxWl7MmkZcDusAxyuf2A=',
  };

  describe('PrivateWebSocket message handling', () => {
    let ws: PrivateWebSocket;

    beforeEach(() => {
      ws = new PrivateWebSocket(validOptions);
    });

    test('should emit orderSnapshot on order snapshot message', () => {
      const onOrderSnapshot = jest.fn();
      ws.on('orderSnapshot', onOrderSnapshot);

      const message = {
        requestId: 'req-1',
        subscriptionType: 'SUBSCRIPTION_TYPE_ORDER',
        orderSubscriptionSnapshot: {
          orders: [{ id: 'order-1', status: 'OPEN' }],
          eof: true,
        },
      };

      // Access protected method for testing
      (ws as any).handleMessage(JSON.stringify(message));

      expect(onOrderSnapshot).toHaveBeenCalledWith(message);
    });

    test('should emit orderUpdate on order update message', () => {
      const onOrderUpdate = jest.fn();
      ws.on('orderUpdate', onOrderUpdate);

      const message = {
        requestId: 'req-1',
        subscriptionType: 'SUBSCRIPTION_TYPE_ORDER',
        orderSubscriptionUpdate: {
          execution: { orderId: 'order-1', fillQty: '10' },
        },
      };

      (ws as any).handleMessage(JSON.stringify(message));

      expect(onOrderUpdate).toHaveBeenCalledWith(message);
    });

    test('should emit positionSnapshot on position snapshot message', () => {
      const onPositionSnapshot = jest.fn();
      ws.on('positionSnapshot', onPositionSnapshot);

      const message = {
        requestId: 'req-1',
        subscriptionType: 'SUBSCRIPTION_TYPE_POSITION',
        positionSubscriptionSnapshot: {
          positions: { 'market-1': { qty: '100' } },
          eof: true,
        },
      };

      (ws as any).handleMessage(JSON.stringify(message));

      expect(onPositionSnapshot).toHaveBeenCalledWith(message);
    });

    test('should emit accountBalanceSnapshot on balance message', () => {
      const onBalanceSnapshot = jest.fn();
      ws.on('accountBalanceSnapshot', onBalanceSnapshot);

      const message = {
        requestId: 'req-1',
        subscriptionType: 'SUBSCRIPTION_TYPE_ACCOUNT_BALANCE',
        accountBalanceSubscriptionSnapshot: {
          balance: 1000,
          buyingPower: 500,
        },
      };

      (ws as any).handleMessage(JSON.stringify(message));

      expect(onBalanceSnapshot).toHaveBeenCalledWith(message);
    });

    test('should emit heartbeat on heartbeat message', () => {
      const onHeartbeat = jest.fn();
      ws.on('heartbeat', onHeartbeat);

      const message = { heartbeat: {} };

      (ws as any).handleMessage(JSON.stringify(message));

      expect(onHeartbeat).toHaveBeenCalled();
    });

    test('should emit error on error message', () => {
      const onError = jest.fn();
      ws.on('error', onError);

      const message = { error: 'Subscription failed' };

      (ws as any).handleMessage(JSON.stringify(message));

      expect(onError).toHaveBeenCalledWith(expect.any(PolymarketUSError));
      expect(onError.mock.calls[0][0].message).toBe('Subscription failed');
    });

    test('should emit error on invalid JSON', () => {
      const onError = jest.fn();
      ws.on('error', onError);

      (ws as any).handleMessage('not valid json');

      expect(onError).toHaveBeenCalledWith(expect.any(PolymarketUSError));
      expect(onError.mock.calls[0][0].message).toContain('Failed to parse');
    });

    test('should always emit raw message event', () => {
      const onMessage = jest.fn();
      ws.on('message', onMessage);

      const message = {
        requestId: 'req-1',
        subscriptionType: 'SUBSCRIPTION_TYPE_ORDER',
        orderSubscriptionSnapshot: { orders: [], eof: true },
      };

      (ws as any).handleMessage(JSON.stringify(message));

      expect(onMessage).toHaveBeenCalledWith(message);
    });
  });

  describe('MarketsWebSocket message handling', () => {
    let ws: MarketsWebSocket;

    beforeEach(() => {
      ws = new MarketsWebSocket(validOptions);
    });

    test('should emit marketData on market data message', () => {
      const onMarketData = jest.fn();
      ws.on('marketData', onMarketData);

      const message = {
        requestId: 'req-1',
        subscriptionType: 'SUBSCRIPTION_TYPE_MARKET_DATA',
        marketData: {
          marketSlug: 'btc-100k',
          bids: [{ px: '0.55', qty: '100' }],
          offers: [{ px: '0.56', qty: '50' }],
          state: 'OPEN',
        },
      };

      (ws as any).handleMessage(JSON.stringify(message));

      expect(onMarketData).toHaveBeenCalledWith(message);
    });

    test('should emit marketDataLite on lite data message', () => {
      const onMarketDataLite = jest.fn();
      ws.on('marketDataLite', onMarketDataLite);

      const message = {
        requestId: 'req-1',
        subscriptionType: 'SUBSCRIPTION_TYPE_MARKET_DATA_LITE',
        marketDataLite: {
          marketSlug: 'btc-100k',
          bestBid: '0.55',
          bestAsk: '0.56',
        },
      };

      (ws as any).handleMessage(JSON.stringify(message));

      expect(onMarketDataLite).toHaveBeenCalledWith(message);
    });

    test('should emit trade on trade message', () => {
      const onTrade = jest.fn();
      ws.on('trade', onTrade);

      const message = {
        requestId: 'req-1',
        subscriptionType: 'SUBSCRIPTION_TYPE_TRADE',
        trade: {
          marketSlug: 'btc-100k',
          price: '0.55',
          quantity: '10',
          tradeTime: '2026-01-20T12:00:00Z',
          maker: { side: 'BID', intent: 'OPEN' },
          taker: { side: 'OFFER', intent: 'OPEN' },
        },
      };

      (ws as any).handleMessage(JSON.stringify(message));

      expect(onTrade).toHaveBeenCalledWith(message);
    });

    test('should emit heartbeat on heartbeat message', () => {
      const onHeartbeat = jest.fn();
      ws.on('heartbeat', onHeartbeat);

      (ws as any).handleMessage(JSON.stringify({ heartbeat: {} }));

      expect(onHeartbeat).toHaveBeenCalled();
    });

    test('should emit error on error message', () => {
      const onError = jest.fn();
      ws.on('error', onError);

      (ws as any).handleMessage(
        JSON.stringify({ error: 'Invalid subscription' }),
      );

      expect(onError).toHaveBeenCalledWith(expect.any(PolymarketUSError));
    });
  });

  describe('Event listener management', () => {
    test('should support multiple listeners for same event', () => {
      const ws = new PrivateWebSocket(validOptions);
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      ws.on('heartbeat', listener1);
      ws.on('heartbeat', listener2);

      (ws as any).handleMessage(JSON.stringify({ heartbeat: {} }));

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });

    test('should remove listener with off()', () => {
      const ws = new PrivateWebSocket(validOptions);
      const listener = jest.fn();

      ws.on('heartbeat', listener);
      ws.off('heartbeat', listener);

      (ws as any).handleMessage(JSON.stringify({ heartbeat: {} }));

      expect(listener).not.toHaveBeenCalled();
    });
  });
});
