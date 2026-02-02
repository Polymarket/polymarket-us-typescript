import {
  AuthenticationError,
  BadRequestError,
  NotFoundError,
  PolymarketUS,
  RateLimitError,
} from '../src';

const mockFetch = jest.fn();
global.fetch = mockFetch as jest.Mock;

describe('Orders Advanced Endpoints', () => {
  let client: PolymarketUS;
  let authClient: PolymarketUS;

  const testSecretKey = 'nWGxne/9WmC6hEr0kuwsxERJxWl7MmkZcDusAxyuf2A=';

  beforeEach(() => {
    mockFetch.mockReset();
    client = new PolymarketUS();
    authClient = new PolymarketUS({
      keyId: 'test-key-id',
      secretKey: testSecretKey,
    });
  });

  describe('orders.modify()', () => {
    test('should modify an existing order with valid params', async () => {
      const params = {
        marketSlug: 'btc-100k-2025',
        price: { value: '0.57', currency: 'USD' as const },
        quantity: 125,
        tif: 'TIME_IN_FORCE_GOOD_TILL_CANCEL' as const,
      };

      mockFetch.mockResolvedValueOnce(new Response('', { status: 200 }));

      await authClient.orders.modify('order-123', params);

      expect(mockFetch).toHaveBeenCalledTimes(1);

      const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toContain('api.polymarket.us');
      expect(url).toContain('/v1/order/order-123/modify');
      expect(options.method).toBe('POST');
      expect(JSON.parse(options.body as string)).toEqual(params);

      const headers = options.headers as Record<string, string>;
      expect(headers['X-PM-Access-Key']).toBe('test-key-id');
      expect(headers['X-PM-Timestamp']).toBeDefined();
      expect(headers['X-PM-Signature']).toBeDefined();
    });

    test('should throw NotFoundError when order does not exist', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Order not found' }), {
          status: 404,
        }),
      );

      await expect(
        authClient.orders.modify('missing-order', {
          marketSlug: 'btc-100k-2025',
        }),
      ).rejects.toThrow(NotFoundError);
    });

    test('should throw BadRequestError for invalid modify params', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            message: 'Invalid modify request: quantity must be positive',
          }),
          { status: 400 },
        ),
      );

      await expect(
        authClient.orders.modify('order-123', {
          marketSlug: 'btc-100k-2025',
          quantity: -5,
        }),
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe('orders.preview()', () => {
    test('should return order preview for valid estimate request', async () => {
      const request = {
        request: {
          marketSlug: 'btc-100k-2025',
          intent: 'ORDER_INTENT_BUY_LONG' as const,
          type: 'ORDER_TYPE_LIMIT' as const,
          price: { value: '0.55', currency: 'USD' as const },
          quantity: 100,
          tif: 'TIME_IN_FORCE_GOOD_TILL_CANCEL' as const,
        },
      };

      mockFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            order: {
              id: 'preview-order-1',
              marketSlug: 'btc-100k-2025',
              side: 'ORDER_SIDE_BUY',
              type: 'ORDER_TYPE_LIMIT',
              price: { value: '0.55', currency: 'USD' },
              quantity: 100,
              cumQuantity: 0,
              leavesQuantity: 100,
              tif: 'TIME_IN_FORCE_GOOD_TILL_CANCEL',
              intent: 'ORDER_INTENT_BUY_LONG',
              state: 'ORDER_STATE_NEW',
            },
          }),
          { status: 200 },
        ),
      );

      const response = await authClient.orders.preview(request);

      expect(response.order.id).toBe('preview-order-1');
      expect(response.order.marketSlug).toBe('btc-100k-2025');

      const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toContain('/v1/order/preview');
      expect(options.method).toBe('POST');
      expect(JSON.parse(options.body as string)).toEqual(request);
    });

    test('should throw BadRequestError for invalid estimate constraints', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            message: 'slippageTolerance.bips must be between 0 and 10000',
          }),
          { status: 400 },
        ),
      );

      await expect(
        authClient.orders.preview({
          request: {
            marketSlug: 'btc-100k-2025',
            intent: 'ORDER_INTENT_BUY_LONG',
            slippageTolerance: {
              currentPrice: { value: '0.55', currency: 'USD' },
              bips: -10,
            },
          },
        }),
      ).rejects.toThrow(BadRequestError);
    });

    test('should throw NotFoundError when preview market does not exist', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({ message: 'Market not found for provided slug' }),
          {
            status: 404,
          },
        ),
      );

      await expect(
        authClient.orders.preview({
          request: {
            marketSlug: 'missing-market',
            intent: 'ORDER_INTENT_BUY_LONG',
          },
        }),
      ).rejects.toThrow(NotFoundError);
    });

    test('should throw AuthenticationError on 401 response', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Unauthorized' }), {
          status: 401,
        }),
      );

      await expect(
        authClient.orders.preview({
          request: {
            marketSlug: 'btc-100k-2025',
            intent: 'ORDER_INTENT_BUY_LONG',
          },
        }),
      ).rejects.toThrow(AuthenticationError);
    });

    test('should require credentials before preview request', async () => {
      await expect(
        client.orders.preview({
          request: {
            marketSlug: 'btc-100k-2025',
            intent: 'ORDER_INTENT_BUY_LONG',
          },
        }),
      ).rejects.toThrow(AuthenticationError);
    });
  });

  describe('orders.closePosition()', () => {
    test('should close position successfully', async () => {
      const params = {
        marketSlug: 'btc-100k-2025',
        slippageTolerance: {
          currentPrice: { value: '0.55', currency: 'USD' as const },
          bips: 50,
        },
      };

      mockFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: 'close-order-1',
            executions: [
              {
                id: 'execution-1',
                type: 'EXECUTION_TYPE_FILL',
              },
            ],
          }),
          { status: 200 },
        ),
      );

      const response = await authClient.orders.closePosition(params);

      expect(response.id).toBe('close-order-1');

      const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toContain('api.polymarket.us');
      expect(url).toContain('/v1/order/close-position');
      expect(options.method).toBe('POST');
      expect(JSON.parse(options.body as string)).toEqual(params);
    });

    test('should throw NotFoundError when no position exists', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({ message: 'No open position for market slug' }),
          {
            status: 404,
          },
        ),
      );

      await expect(
        authClient.orders.closePosition({
          marketSlug: 'non-existent-market',
        }),
      ).rejects.toThrow(NotFoundError);
    });

    test('should throw RateLimitError when rate limited', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Rate limit exceeded' }), {
          status: 429,
        }),
      );

      await expect(
        authClient.orders.closePosition({
          marketSlug: 'btc-100k-2025',
        }),
      ).rejects.toThrow(RateLimitError);
    });
  });
});
