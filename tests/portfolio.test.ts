import { type Activity, AuthenticationError, PolymarketUS } from '../src';

const mockFetch = jest.fn();
global.fetch = mockFetch as jest.Mock;

describe('Portfolio Endpoints', () => {
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

  describe('portfolio.positions()', () => {
    test('should require authentication', async () => {
      await expect(client.portfolio.positions()).rejects.toThrow(
        AuthenticationError,
      );
    });

    test('should get positions with auth', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            positions: {
              'btc-100k': {
                netPosition: '100',
                cost: { value: '55', currency: 'USD' },
              },
            },
          }),
          { status: 200 },
        ),
      );

      const response = await authClient.portfolio.positions();

      expect(response.positions).toBeDefined();
      expect(response.positions['btc-100k']).toBeDefined();
    });

    test('should use correct path', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ positions: {} }), { status: 200 }),
      );

      await authClient.portfolio.positions();

      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain('/v1/portfolio/positions');
    });
  });

  describe('portfolio.activities()', () => {
    test('preserves exact trade quantities alongside legacy quantities', async () => {
      const activity: Activity = {
        type: 'ACTIVITY_TYPE_TRADE',
        trade: {
          id: 'trade-1',
          marketSlug: 'market-1',
          state: 'TRADE_STATE_CONFIRMED',
          price: { value: '0.5', currency: 'USD' },
          qty: '0',
          qtyDecimal: '0.0100',
        },
      };
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ activities: [activity] }), {
          status: 200,
        }),
      );

      const response = await authClient.portfolio.activities();
      const quantity: string | undefined =
        response.activities[0].trade?.qtyDecimal;

      expect(quantity).toBe('0.0100');
      expect(response.activities[0].trade?.qty).toBe('0');
      expect(response.activities[0]).toEqual(activity);
    });

    test('should require authentication', async () => {
      await expect(client.portfolio.activities()).rejects.toThrow(
        AuthenticationError,
      );
    });

    test('should get activities with auth', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            activities: [{ type: 'ACTIVITY_TYPE_TRADE' }],
          }),
          { status: 200 },
        ),
      );

      const response = await authClient.portfolio.activities();

      expect(response.activities).toBeDefined();
      expect(response.activities.length).toBe(1);
    });

    test('should use correct path', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ activities: [] }), { status: 200 }),
      );

      await authClient.portfolio.activities();

      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain('/v1/portfolio/activities');
    });
  });
});

describe('Account Endpoints', () => {
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

  describe('account.balances()', () => {
    test('should require authentication', async () => {
      await expect(client.account.balances()).rejects.toThrow(
        AuthenticationError,
      );
    });

    test('should get balances with auth', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            balances: [
              { currentBalance: 1000, currency: 'USD', buyingPower: 800 },
            ],
          }),
          { status: 200 },
        ),
      );

      const response = await authClient.account.balances();

      expect(response.balances).toBeDefined();
      expect(response.balances[0].currentBalance).toBe(1000);
    });

    test('should use correct path', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ balances: [] }), { status: 200 }),
      );

      await authClient.account.balances();

      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain('/v1/account/balances');
    });
  });
});
