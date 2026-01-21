import { PolymarketUS } from '../src';

const mockFetch = jest.fn();
global.fetch = mockFetch as jest.Mock;

describe('Markets Endpoints', () => {
  let client: PolymarketUS;

  beforeEach(() => {
    mockFetch.mockReset();
    client = new PolymarketUS();
  });

  describe('markets.list()', () => {
    test('should list markets', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            markets: [
              { id: 1, slug: 'market-1' },
              { id: 2, slug: 'market-2' },
            ],
          }),
          { status: 200 },
        ),
      );

      const response = await client.markets.list();

      expect(response.markets).toBeDefined();
      expect(response.markets.length).toBe(2);
    });
  });

  describe('markets.retrieve()', () => {
    test('should retrieve market by ID', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({ market: { id: 123, slug: 'btc-100k' } }),
          { status: 200 },
        ),
      );

      const response = await client.markets.retrieve(123);

      expect(response.market.id).toBe(123);
    });

    test('should use correct path with id', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ market: {} }), { status: 200 }),
      );

      await client.markets.retrieve(456);

      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain('/v1/market/id/456');
    });
  });

  describe('markets.retrieveBySlug()', () => {
    test('should use correct path with slug', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ market: {} }), { status: 200 }),
      );

      await client.markets.retrieveBySlug('btc-100k');

      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain('/v1/market/slug/btc-100k');
    });
  });

  describe('markets.book()', () => {
    test('should get order book', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            marketSlug: 'btc-100k',
            bids: [{ px: { value: '0.55', currency: 'USD' }, qty: '100' }],
            offers: [{ px: { value: '0.56', currency: 'USD' }, qty: '80' }],
            state: 'MARKET_STATE_OPEN',
          }),
          { status: 200 },
        ),
      );

      const book = await client.markets.book('btc-100k');

      expect(book.marketSlug).toBe('btc-100k');
      expect(book.bids).toBeDefined();
      expect(book.offers).toBeDefined();
    });

    test('should use correct path', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ bids: [], offers: [] }), { status: 200 }),
      );

      await client.markets.book('test-market');

      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain('/v1/markets/test-market/book');
    });
  });

  describe('markets.bbo()', () => {
    test('should get best bid/offer', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            marketSlug: 'btc-100k',
            bestBid: { value: '0.55', currency: 'USD' },
            bestAsk: { value: '0.56', currency: 'USD' },
          }),
          { status: 200 },
        ),
      );

      const bbo = await client.markets.bbo('btc-100k');

      expect(bbo.bestBid).toBeDefined();
      expect(bbo.bestAsk).toBeDefined();
    });

    test('should use correct path', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({}), { status: 200 }),
      );

      await client.markets.bbo('test-market');

      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain('/v1/markets/test-market/bbo');
    });
  });

  describe('markets.settlement()', () => {
    test('should use correct path', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({}), { status: 200 }),
      );

      await client.markets.settlement('settled-market');

      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain('/v1/markets/settled-market/settlement');
    });
  });
});
