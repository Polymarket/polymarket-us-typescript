import { PolymarketUS } from '../src';

const mockFetch = jest.fn();
global.fetch = mockFetch as jest.Mock;

describe('Series Endpoints', () => {
  let client: PolymarketUS;

  beforeEach(() => {
    mockFetch.mockReset();
    client = new PolymarketUS();
  });

  describe('series.list()', () => {
    test('should list series', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            series: [
              { id: 1, name: 'NBA Finals' },
              { id: 2, name: 'World Series' },
            ],
          }),
          { status: 200 },
        ),
      );

      const response = await client.series.list();

      expect(response.series).toBeDefined();
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    test('should pass query params', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ series: [] }), { status: 200 }),
      );

      await client.series.list({ limit: 10 });

      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain('limit=10');
    });

    test('should use correct path', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ series: [] }), { status: 200 }),
      );

      await client.series.list();

      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain('/v1/series');
    });
  });

  describe('series.retrieve()', () => {
    test('should retrieve series by ID', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({ series: { id: 123, name: 'Test Series' } }),
          { status: 200 },
        ),
      );

      const response = await client.series.retrieve(123);

      expect(response.series).toBeDefined();
    });

    test('should use correct path', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ series: {} }), { status: 200 }),
      );

      await client.series.retrieve(456);

      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain('/v1/series/id/456');
    });
  });
});
