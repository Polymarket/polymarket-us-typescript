import { MarketsWebSocket, PolymarketUS, PrivateWebSocket } from '../src';

describe('WebSocket', () => {
  describe('WebSocket Factory', () => {
    test('should have ws factory on client', () => {
      const client = new PolymarketUS({
        keyId: 'test-key',
        secretKey: 'nWGxne/9WmC6hEr0kuwsxERJxWl7MmkZcDusAxyuf2A=',
      });

      expect(client.ws).toBeDefined();
    });

    test('should create private WebSocket instance', () => {
      const client = new PolymarketUS({
        keyId: 'test-key',
        secretKey: 'nWGxne/9WmC6hEr0kuwsxERJxWl7MmkZcDusAxyuf2A=',
      });

      const privateWs = client.ws.private();
      expect(privateWs).toBeInstanceOf(PrivateWebSocket);
    });

    test('should create markets WebSocket instance', () => {
      const client = new PolymarketUS({
        keyId: 'test-key',
        secretKey: 'nWGxne/9WmC6hEr0kuwsxERJxWl7MmkZcDusAxyuf2A=',
      });

      const marketsWs = client.ws.markets();
      expect(marketsWs).toBeInstanceOf(MarketsWebSocket);
    });

    test('should throw without credentials for private WebSocket', () => {
      const client = new PolymarketUS();

      expect(() => client.ws.private()).toThrow('credentials required');
    });

    test('should throw without credentials for markets WebSocket', () => {
      const client = new PolymarketUS();

      expect(() => client.ws.markets()).toThrow('credentials required');
    });
  });

  describe('PrivateWebSocket', () => {
    let client: PolymarketUS;

    beforeEach(() => {
      client = new PolymarketUS({
        keyId: 'test-key',
        secretKey: 'nWGxne/9WmC6hEr0kuwsxERJxWl7MmkZcDusAxyuf2A=',
      });
    });

    test('should have connect method', () => {
      const ws = client.ws.private();
      expect(ws.connect).toBeDefined();
      expect(typeof ws.connect).toBe('function');
    });

    test('should have close method', () => {
      const ws = client.ws.private();
      expect(ws.close).toBeDefined();
      expect(typeof ws.close).toBe('function');
    });

    test('should have subscribe methods', () => {
      const ws = client.ws.private();
      expect(ws.subscribeOrders).toBeDefined();
      expect(ws.subscribePositions).toBeDefined();
      expect(ws.subscribeAccountBalance).toBeDefined();
      expect(typeof ws.subscribeOrders).toBe('function');
      expect(typeof ws.subscribePositions).toBe('function');
      expect(typeof ws.subscribeAccountBalance).toBe('function');
    });

    test('should have unsubscribe method', () => {
      const ws = client.ws.private();
      expect(ws.unsubscribe).toBeDefined();
      expect(typeof ws.unsubscribe).toBe('function');
    });

    test('should have on method for event listeners', () => {
      const ws = client.ws.private();
      expect(ws.on).toBeDefined();
      expect(typeof ws.on).toBe('function');
    });

    test('should have off method to remove listeners', () => {
      const ws = client.ws.private();
      expect(ws.off).toBeDefined();
      expect(typeof ws.off).toBe('function');
    });

    test('should have isConnected getter', () => {
      const ws = client.ws.private();
      expect(ws.isConnected).toBeDefined();
      expect(ws.isConnected).toBe(false);
    });

    test('should accept event listeners', () => {
      const ws = client.ws.private();
      const onOrderSnapshot = jest.fn();
      const onOrderUpdate = jest.fn();
      const onError = jest.fn();

      ws.on('orderSnapshot', onOrderSnapshot);
      ws.on('orderUpdate', onOrderUpdate);
      ws.on('error', onError);

      // Just verify no errors thrown
      expect(true).toBe(true);
    });
  });

  describe('MarketsWebSocket', () => {
    let client: PolymarketUS;

    beforeEach(() => {
      client = new PolymarketUS({
        keyId: 'test-key',
        secretKey: 'nWGxne/9WmC6hEr0kuwsxERJxWl7MmkZcDusAxyuf2A=',
      });
    });

    test('should have connect method', () => {
      const ws = client.ws.markets();
      expect(ws.connect).toBeDefined();
      expect(typeof ws.connect).toBe('function');
    });

    test('should have close method', () => {
      const ws = client.ws.markets();
      expect(ws.close).toBeDefined();
      expect(typeof ws.close).toBe('function');
    });

    test('should have subscribe methods', () => {
      const ws = client.ws.markets();
      expect(ws.subscribeMarketData).toBeDefined();
      expect(ws.subscribeMarketDataLite).toBeDefined();
      expect(ws.subscribeTrades).toBeDefined();
      expect(typeof ws.subscribeMarketData).toBe('function');
      expect(typeof ws.subscribeMarketDataLite).toBe('function');
      expect(typeof ws.subscribeTrades).toBe('function');
    });

    test('should have unsubscribe method', () => {
      const ws = client.ws.markets();
      expect(ws.unsubscribe).toBeDefined();
      expect(typeof ws.unsubscribe).toBe('function');
    });

    test('should have on method for event listeners', () => {
      const ws = client.ws.markets();
      expect(ws.on).toBeDefined();
      expect(typeof ws.on).toBe('function');
    });

    test('should have isConnected getter', () => {
      const ws = client.ws.markets();
      expect(ws.isConnected).toBeDefined();
      expect(ws.isConnected).toBe(false);
    });

    test('should accept event listeners', () => {
      const ws = client.ws.markets();
      const onMarketData = jest.fn();
      const onTrade = jest.fn();
      const onError = jest.fn();

      ws.on('marketData', onMarketData);
      ws.on('trade', onTrade);
      ws.on('error', onError);

      // Just verify no errors thrown
      expect(true).toBe(true);
    });
  });
});
