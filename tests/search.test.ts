import { PolymarketUS } from '../src';

const mockFetch = jest.fn();
global.fetch = mockFetch as jest.Mock;

describe('Search Endpoints', () => {
  let client: PolymarketUS;

  beforeEach(() => {
    mockFetch.mockReset();
    client = new PolymarketUS();
  });

  describe('search.query()', () => {
    test('should search without params', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ events: [] }), { status: 200 }),
      );

      const response = await client.search.query();

      expect(response.events).toBeDefined();
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    test('should pass search query params', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ events: [] }), { status: 200 }),
      );

      await client.search.query({ query: 'bitcoin', limit: 5 });

      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain('query=bitcoin');
      expect(url).toContain('limit=5');
    });

    test('should use correct path', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ events: [] }), { status: 200 }),
      );

      await client.search.query();

      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain('/v1/search');
    });

    test('should call gateway URL', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ events: [] }), { status: 200 }),
      );

      await client.search.query();

      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain('gateway.polymarket.us');
    });
  });
});
