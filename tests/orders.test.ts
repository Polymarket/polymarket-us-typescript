import { AuthenticationError, PolymarketUS } from '../src';

const mockFetch = jest.fn();
global.fetch = mockFetch as jest.Mock;

describe('Orders Endpoints', () => {
  let client: PolymarketUS;
  let authClient: PolymarketUS;

  // Test key (base64 encoded 32-byte key)
  const testSecretKey = 'nWGxne/9WmC6hEr0kuwsxERJxWl7MmkZcDusAxyuf2A=';

  beforeEach(() => {
    mockFetch.mockReset();
    client = new PolymarketUS();
    authClient = new PolymarketUS({
      keyId: 'test-key-id',
      secretKey: testSecretKey,
    });
  });

  describe('Authentication Required', () => {
    test('should throw AuthenticationError without credentials', async () => {
      await expect(client.orders.list()).rejects.toThrow(AuthenticationError);
    });

    test('should throw AuthenticationError for create without credentials', async () => {
      await expect(
        client.orders.create({
          marketSlug: 'test',
          intent: 'ORDER_INTENT_BUY_LONG',
        }),
      ).rejects.toThrow(AuthenticationError);
    });
  });

  describe('orders.list()', () => {
    test('should list open orders with auth', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            orders: [
              { id: 'order-1', marketSlug: 'btc-100k' },
              { id: 'order-2', marketSlug: 'eth-5k' },
            ],
          }),
          { status: 200 },
        ),
      );

      const response = await authClient.orders.list();

      expect(response.orders).toBeDefined();
      expect(response.orders.length).toBe(2);
    });

    test('should include auth headers', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ orders: [] }), { status: 200 }),
      );

      await authClient.orders.list();

      const options = mockFetch.mock.calls[0][1] as RequestInit;
      const headers = options.headers as Record<string, string>;
      expect(headers['X-PM-Access-Key']).toBe('test-key-id');
      expect(headers['X-PM-Timestamp']).toBeDefined();
      expect(headers['X-PM-Signature']).toBeDefined();
    });

    test('should call API URL not gateway', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ orders: [] }), { status: 200 }),
      );

      await authClient.orders.list();

      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain('api.polymarket.us');
      expect(url).toContain('/v1/orders/open');
    });
  });

  describe('orders.create()', () => {
    test('should create order', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 'new-order-123' }), { status: 200 }),
      );

      const response = await authClient.orders.create({
        marketSlug: 'btc-100k',
        intent: 'ORDER_INTENT_BUY_LONG',
        type: 'ORDER_TYPE_LIMIT',
        price: { value: '0.55', currency: 'USD' },
        quantity: 100,
      });

      expect(response.id).toBe('new-order-123');
    });

    test('should use POST method', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 'test' }), { status: 200 }),
      );

      await authClient.orders.create({
        marketSlug: 'test',
        intent: 'ORDER_INTENT_BUY_LONG',
      });

      const options = mockFetch.mock.calls[0][1] as RequestInit;
      expect(options.method).toBe('POST');
    });
  });

  describe('orders.retrieve()', () => {
    test('should retrieve order by ID', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            order: { id: 'order-123', state: 'ORDER_STATE_NEW' },
          }),
          { status: 200 },
        ),
      );

      const response = await authClient.orders.retrieve('order-123');

      expect(response.order.id).toBe('order-123');
    });

    test('should use correct path', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ order: {} }), { status: 200 }),
      );

      await authClient.orders.retrieve('my-order-id');

      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain('/v1/order/my-order-id');
    });
  });

  describe('orders.cancel()', () => {
    test('should cancel order', async () => {
      mockFetch.mockResolvedValueOnce(new Response('', { status: 200 }));

      await authClient.orders.cancel('order-123', { marketSlug: 'btc-100k' });

      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain('/v1/order/order-123/cancel');
    });
  });

  describe('orders.cancelAll()', () => {
    test('should cancel all orders', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({ canceledOrderIds: ['order-1', 'order-2'] }),
          { status: 200 },
        ),
      );

      const response = await authClient.orders.cancelAll();

      expect(response.canceledOrderIds).toBeDefined();
      expect(response.canceledOrderIds.length).toBe(2);
    });

    test('should use correct path', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ canceledOrderIds: [] }), { status: 200 }),
      );

      await authClient.orders.cancelAll();

      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain('/v1/orders/open/cancel');
    });
  });
});
