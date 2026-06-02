import { PolymarketUS } from '../src';

const mockFetch = jest.fn();
global.fetch = mockFetch as jest.Mock;

const TEST_SECRET_KEY = 'nWGxne/9WmC6hEr0kuwsxERJxWl7MmkZcDusAxyuf2A=';

function jsonResponse(payload: unknown): Response {
  return new Response(JSON.stringify(payload), { status: 200 });
}

describe('Pagination', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe('offset pagination', () => {
    test('iterates until a short page', async () => {
      mockFetch
        .mockResolvedValueOnce(jsonResponse({ events: [{ id: 1 }, { id: 2 }] }))
        .mockResolvedValueOnce(jsonResponse({ events: [{ id: 3 }] }));
      const client = new PolymarketUS();

      const ids: number[] = [];
      for await (const event of client.events.iterate(undefined, 2)) {
        ids.push(event.id);
      }

      expect(ids).toEqual([1, 2, 3]);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    test('stops on an empty page', async () => {
      mockFetch
        .mockResolvedValueOnce(
          jsonResponse({ markets: [{ id: 1 }, { id: 2 }] }),
        )
        .mockResolvedValueOnce(jsonResponse({ markets: [] }));
      const client = new PolymarketUS();

      const ids: number[] = [];
      for await (const market of client.markets.iterate(undefined, 2)) {
        ids.push(market.id);
      }

      expect(ids).toEqual([1, 2]);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('cursor pagination', () => {
    test('follows the cursor until eof', async () => {
      mockFetch
        .mockResolvedValueOnce(
          jsonResponse({
            activities: [{ type: 'ACTIVITY_TYPE_TRADE' }],
            nextCursor: 'c1',
            eof: false,
          }),
        )
        .mockResolvedValueOnce(
          jsonResponse({
            activities: [{ type: 'ACTIVITY_TYPE_TRANSFER' }],
            eof: true,
          }),
        );
      const client = new PolymarketUS({
        keyId: 'k',
        secretKey: TEST_SECRET_KEY,
      });

      const types: (string | undefined)[] = [];
      for await (const activity of client.portfolio.iterateActivities()) {
        types.push(activity.type);
      }

      expect(types).toEqual(['ACTIVITY_TYPE_TRADE', 'ACTIVITY_TYPE_TRANSFER']);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    test('stops when there is no next cursor', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          activities: [{ type: 'ACTIVITY_TYPE_TRADE' }],
          nextCursor: '',
          eof: false,
        }),
      );
      const client = new PolymarketUS({
        keyId: 'k',
        secretKey: TEST_SECRET_KEY,
      });

      const types: (string | undefined)[] = [];
      for await (const activity of client.portfolio.iterateActivities()) {
        types.push(activity.type);
      }

      expect(types).toEqual(['ACTIVITY_TYPE_TRADE']);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });
});
