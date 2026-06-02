import { MarketsWebSocket, PrivateWebSocket } from '../src';

const validOptions = {
  keyId: 'test-key',
  secretKey: 'nWGxne/9WmC6hEr0kuwsxERJxWl7MmkZcDusAxyuf2A=',
};

// biome-ignore lint/suspicious/noExplicitAny: tests reach into protected/private members
type Internal = any;

function mockSocket() {
  return { readyState: 1, send: jest.fn(), close: jest.fn() };
}

describe('WebSocket reconnect & resubscribe', () => {
  describe('subscription tracking', () => {
    test('subscribe records the subscription', () => {
      const ws = new PrivateWebSocket(validOptions);
      (ws as Internal).socket = mockSocket();

      ws.subscribeOrders('ord-1', ['mkt-a']);

      const tracked = (ws as Internal).subscriptions.get('ord-1');
      expect(tracked.subscriptionType).toBe('SUBSCRIPTION_TYPE_ORDER');
      expect(tracked.marketSlugs).toEqual(['mkt-a']);
    });

    test('unsubscribe clears the subscription', () => {
      const ws = new MarketsWebSocket(validOptions);
      (ws as Internal).socket = mockSocket();

      ws.subscribeMarketData('md-1', ['mkt-a']);
      expect((ws as Internal).subscriptions.has('md-1')).toBe(true);

      ws.unsubscribe('md-1');
      expect((ws as Internal).subscriptions.has('md-1')).toBe(false);
    });

    test('resubscribe replays all tracked subscriptions', () => {
      const ws = new MarketsWebSocket(validOptions);
      const socket = mockSocket();
      (ws as Internal).socket = socket;

      ws.subscribeMarketData('md-1', ['mkt-a']);
      ws.subscribeTrades('tr-1', ['mkt-b']);
      socket.send.mockClear();

      (ws as Internal).resubscribe();

      expect(socket.send).toHaveBeenCalledTimes(2);
    });
  });

  describe('reconnect loop', () => {
    test('reconnects after a transient failure', async () => {
      const ws = new PrivateWebSocket(validOptions);
      const openSocket = jest
        .fn()
        .mockRejectedValueOnce(new Error('boom'))
        .mockResolvedValueOnce(undefined);
      (ws as Internal).openSocket = openSocket;
      const onReconnect = jest.fn();
      ws.on('reconnect', onReconnect);

      await (ws as Internal).reconnect();

      expect(openSocket).toHaveBeenCalledTimes(2);
      expect(onReconnect).toHaveBeenCalledTimes(1);
    });

    test('stops reconnecting on fatal auth failure', async () => {
      const ws = new PrivateWebSocket(validOptions);
      (ws as Internal).openSocket = jest
        .fn()
        .mockRejectedValue(new Error('Unexpected server response: 401'));
      const onError = jest.fn();
      const onClose = jest.fn();
      ws.on('error', onError);
      ws.on('close', onClose);

      await (ws as Internal).reconnect();

      expect((ws as Internal).openSocket).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    test('gives up after reconnectMaxAttempts', async () => {
      const ws = new PrivateWebSocket({
        ...validOptions,
        reconnectMaxAttempts: 2,
      });
      const openSocket = jest.fn().mockRejectedValue(new Error('network'));
      (ws as Internal).openSocket = openSocket;
      const onClose = jest.fn();
      ws.on('close', onClose);

      await (ws as Internal).reconnect();

      expect(openSocket).toHaveBeenCalledTimes(2);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('onClose guard', () => {
    test('does not start a second loop while already reconnecting', () => {
      const ws = new PrivateWebSocket(validOptions);
      (ws as Internal).established = true;
      (ws as Internal).reconnecting = true;
      const spy = jest.fn();
      (ws as Internal).reconnect = spy;

      (ws as Internal).onClose();

      expect(spy).not.toHaveBeenCalled();
    });

    test('does not reconnect before the first successful connect', () => {
      const ws = new PrivateWebSocket(validOptions);
      (ws as Internal).established = false;
      const spy = jest.fn();
      (ws as Internal).reconnect = spy;

      (ws as Internal).onClose();

      expect(spy).not.toHaveBeenCalled();
    });

    test('reconnects after an established connection drops', () => {
      const ws = new PrivateWebSocket(validOptions);
      (ws as Internal).established = true;
      (ws as Internal).reconnecting = false;
      const spy = jest.fn();
      (ws as Internal).reconnect = spy;

      (ws as Internal).onClose();

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('reconnect edge cases', () => {
    test('does not treat an incidental 3-digit number as fatal auth', async () => {
      const ws = new PrivateWebSocket({
        ...validOptions,
        reconnectMaxAttempts: 1,
      });
      (ws as Internal).openSocket = jest
        .fn()
        .mockRejectedValue(new Error('timeout after 401 ms'));
      const onError = jest.fn();
      const onClose = jest.fn();
      ws.on('error', onError);
      ws.on('close', onClose);

      await (ws as Internal).reconnect();

      expect(onError).not.toHaveBeenCalled();
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    test('does not resurrect a connection closed mid-handshake', async () => {
      const ws = new PrivateWebSocket(validOptions);
      const socketClose = jest.fn();
      (ws as Internal).openSocket = jest.fn().mockImplementation(async () => {
        (ws as Internal).closed = true;
        (ws as Internal).socket = {
          readyState: 1,
          send: jest.fn(),
          close: socketClose,
        };
      });
      const onReconnect = jest.fn();
      ws.on('reconnect', onReconnect);

      await (ws as Internal).reconnect();

      expect(onReconnect).not.toHaveBeenCalled();
      expect(socketClose).toHaveBeenCalled();
    });
  });
});
