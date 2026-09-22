import {
  type GetMarketBBOResponse,
  type GetMarketBookResponse,
  type MarketBBO,
  type MarketBook,
  type MarketSettlement,
  PolymarketUS,
} from '../src';

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
    const books: GetMarketBookResponse[] = [
      {
        marketData: {
          marketSlug: 'btc-100k',
          bids: [{ px: { value: '0.55', currency: 'USD' }, qty: '100' }],
          offers: [{ px: { value: '0.56', currency: 'USD' }, qty: '80' }],
          state: 'MARKET_STATE_OPEN',
          stats: { lastTradePx: { value: '0.55', currency: 'USD' } },
          transactTime: '2026-09-21T00:00:00Z',
        },
      },
      {
        marketData: {
          marketSlug: 'btc-100k',
          bids: [],
          offers: [],
          state: 'MARKET_STATE_CLOSED',
          stats: null,
          transactTime: null,
        },
      },
    ];

    test.each(
      books,
    )('preserves the order book response envelope: %j', async (wire) => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify(wire), { status: 200 }),
      );

      const response: GetMarketBookResponse =
        await client.markets.book('btc-100k');
      const book: MarketBook = response.marketData;

      expect(response).toEqual(wire);
      expect(book.marketSlug).toBe('btc-100k');
      expect(book.bids).toEqual(wire.marketData.bids);
      expect(book.offers).toEqual(wire.marketData.offers);
      expect(book.stats?.lastTradePx?.value).toBe(
        wire.marketData.stats?.lastTradePx?.value,
      );
      expect(mockFetch.mock.calls[0][0]).toContain('/v1/markets/btc-100k/book');
    });
  });

  describe('markets.bbo()', () => {
    const quotes: GetMarketBBOResponse[] = [
      {
        marketData: {
          marketSlug: 'btc-100k',
          bestBid: { value: '0.55', currency: 'USD' },
          bestAsk: { value: '0.56', currency: 'USD' },
          bidDepth: 1,
          askDepth: 1,
          lastTradePx: { value: '0.55', currency: 'USD' },
          sharesTraded: '100',
          openInterest: '80',
        },
      },
      {
        marketData: {
          marketSlug: 'btc-100k',
          bestBid: null,
          bestAsk: null,
          bidDepth: 0,
          askDepth: 0,
          lastTradePx: null,
          sharesTraded: '',
          openInterest: '',
        },
      },
    ];

    test.each(
      quotes,
    )('preserves the BBO response envelope: %j', async (wire) => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify(wire), { status: 200 }),
      );

      const response: GetMarketBBOResponse =
        await client.markets.bbo('btc-100k');
      const bbo: MarketBBO = response.marketData;

      expect(response).toEqual(wire);
      expect(bbo.marketSlug).toBe('btc-100k');
      expect(bbo.bestBid?.value).toBe(wire.marketData.bestBid?.value);
      expect(bbo.bestAsk?.value).toBe(wire.marketData.bestAsk?.value);
      expect(mockFetch.mock.calls[0][0]).toContain('/v1/markets/btc-100k/bbo');
    });
  });

  describe('markets.settlement()', () => {
    test.each([
      0, 0.5, 1,
    ])('preserves a numeric settlement of %s', async (value) => {
      const wire: MarketSettlement = {
        slug: 'settled-market',
        settlement: value,
      };
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify(wire), { status: 200 }),
      );

      const response = await client.markets.settlement('settled-market');
      const settlement: number = response.settlement;

      expect(response).toEqual(wire);
      expect(response.slug).toBe('settled-market');
      expect(settlement).toBe(value);
      expect(mockFetch.mock.calls[0][0]).toContain(
        '/v1/markets/settled-market/settlement',
      );
    });
  });
});
