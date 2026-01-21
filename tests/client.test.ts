import { PolymarketUS } from '../src';

describe('PolymarketUS Client', () => {
  describe('Client Initialization', () => {
    test('should create client without any options', () => {
      const client = new PolymarketUS();
      expect(client).toBeDefined();
    });

    test('should create client with credentials', () => {
      const client = new PolymarketUS({
        keyId: 'test-key-id',
        secretKey: 'dGVzdC1zZWNyZXQta2V5', // base64 encoded
      });
      expect(client).toBeDefined();
      expect(client.keyId).toBe('test-key-id');
    });

    test('should create client with custom base URLs', () => {
      const client = new PolymarketUS({
        gatewayBaseUrl: 'https://custom-gateway.example.com',
        apiBaseUrl: 'https://custom-api.example.com',
      });
      expect(client.gatewayBaseUrl).toBe('https://custom-gateway.example.com');
      expect(client.apiBaseUrl).toBe('https://custom-api.example.com');
    });

    test('should have default base URLs', () => {
      const client = new PolymarketUS();
      expect(client.gatewayBaseUrl).toBe('https://gateway.polymarket.us');
      expect(client.apiBaseUrl).toBe('https://api.polymarket.us');
    });

    test('should have default timeout', () => {
      const client = new PolymarketUS();
      expect(client.timeout).toBe(30000);
    });

    test('should allow custom timeout', () => {
      const client = new PolymarketUS({ timeout: 60000 });
      expect(client.timeout).toBe(60000);
    });
  });

  describe('Resource Accessors', () => {
    let client: PolymarketUS;

    beforeAll(() => {
      client = new PolymarketUS();
    });

    test('should have events resource', () => {
      expect(client.events).toBeDefined();
      expect(typeof client.events.list).toBe('function');
      expect(typeof client.events.retrieve).toBe('function');
      expect(typeof client.events.retrieveBySlug).toBe('function');
    });

    test('should have markets resource', () => {
      expect(client.markets).toBeDefined();
      expect(typeof client.markets.list).toBe('function');
      expect(typeof client.markets.retrieve).toBe('function');
      expect(typeof client.markets.retrieveBySlug).toBe('function');
      expect(typeof client.markets.book).toBe('function');
      expect(typeof client.markets.bbo).toBe('function');
      expect(typeof client.markets.settlement).toBe('function');
    });

    test('should have orders resource', () => {
      expect(client.orders).toBeDefined();
      expect(typeof client.orders.create).toBe('function');
      expect(typeof client.orders.list).toBe('function');
      expect(typeof client.orders.retrieve).toBe('function');
      expect(typeof client.orders.cancel).toBe('function');
      expect(typeof client.orders.modify).toBe('function');
      expect(typeof client.orders.cancelAll).toBe('function');
      expect(typeof client.orders.preview).toBe('function');
      expect(typeof client.orders.closePosition).toBe('function');
    });

    test('should have portfolio resource', () => {
      expect(client.portfolio).toBeDefined();
      expect(typeof client.portfolio.positions).toBe('function');
      expect(typeof client.portfolio.activities).toBe('function');
    });

    test('should have account resource', () => {
      expect(client.account).toBeDefined();
      expect(typeof client.account.balances).toBe('function');
    });

    test('should have series resource', () => {
      expect(client.series).toBeDefined();
      expect(typeof client.series.list).toBe('function');
      expect(typeof client.series.retrieve).toBe('function');
    });

    test('should have sports resource', () => {
      expect(client.sports).toBeDefined();
      expect(typeof client.sports.list).toBe('function');
      expect(typeof client.sports.teams).toBe('function');
    });

    test('should have search resource', () => {
      expect(client.search).toBeDefined();
      expect(typeof client.search.query).toBe('function');
    });

    test('should have ws factory', () => {
      expect(client.ws).toBeDefined();
    });
  });
});
