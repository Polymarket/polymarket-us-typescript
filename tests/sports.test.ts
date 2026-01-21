import { PolymarketUS } from '../src';

const mockFetch = jest.fn();
global.fetch = mockFetch as jest.Mock;

describe('Sports Endpoints', () => {
  let client: PolymarketUS;

  beforeEach(() => {
    mockFetch.mockReset();
    client = new PolymarketUS();
  });

  describe('sports.list()', () => {
    test('should list sports', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            sports: [
              { id: 'basketball', name: 'Basketball', slug: 'basketball' },
              { id: 'baseball', name: 'Baseball', slug: 'baseball' },
            ],
          }),
          { status: 200 },
        ),
      );

      const response = await client.sports.list();

      expect(response.sports).toBeDefined();
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    test('should use correct path', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ sports: [] }), { status: 200 }),
      );

      await client.sports.list();

      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain('/v1/sports');
    });
  });

  describe('sports.teams()', () => {
    test('should list teams', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            teams: {
              'lakers': { id: 1, name: 'Lakers' },
              'celtics': { id: 2, name: 'Celtics' },
            },
          }),
          { status: 200 },
        ),
      );

      const response = await client.sports.teams();

      expect(response.teams).toBeDefined();
    });

    test('should pass query params', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ teams: {} }), { status: 200 }),
      );

      await client.sports.teams({ provider: 'espn', league: 'nba' });

      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain('provider=espn');
      expect(url).toContain('league=nba');
    });

    test('should use correct path', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ teams: {} }), { status: 200 }),
      );

      await client.sports.teams();

      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain('/v1/sports/teams/provider');
    });
  });
});
