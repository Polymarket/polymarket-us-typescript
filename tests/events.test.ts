import { PolymarketUS } from '../src';

const mockFetch = jest.fn();
global.fetch = mockFetch as jest.Mock;

describe('Events Endpoints', () => {
  let client: PolymarketUS;

  beforeEach(() => {
    mockFetch.mockReset();
    client = new PolymarketUS();
  });

  describe('events.list()', () => {
    test('should list events', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            events: [
              { id: 1, slug: 'event-1', title: 'Event 1' },
              { id: 2, slug: 'event-2', title: 'Event 2' },
            ],
          }),
          { status: 200 },
        ),
      );

      const response = await client.events.list();

      expect(response.events).toBeDefined();
      expect(response.events.length).toBe(2);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    test('should pass query params', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ events: [] }), { status: 200 }),
      );

      await client.events.list({ limit: 10, active: true });

      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain('limit=10');
      expect(url).toContain('active=true');
    });

    test('should call gateway URL', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ events: [] }), { status: 200 }),
      );

      await client.events.list();

      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain('gateway.polymarket.us');
      expect(url).toContain('/v1/events');
    });
  });

  describe('events.retrieve()', () => {
    test('should retrieve event by ID', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({ event: { id: 123, title: 'Test Event' } }),
          { status: 200 },
        ),
      );

      const response = await client.events.retrieve(123);

      expect(response.event).toBeDefined();
      expect(response.event.id).toBe(123);
    });

    test('should use correct path', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ event: {} }), { status: 200 }),
      );

      await client.events.retrieve(456);

      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain('/v1/events/456');
    });
  });

  describe('events.retrieveBySlug()', () => {
    test('should retrieve event by slug', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            event: { slug: 'super-bowl', title: 'Super Bowl' },
          }),
          { status: 200 },
        ),
      );

      const response = await client.events.retrieveBySlug('super-bowl');

      expect(response.event).toBeDefined();
      expect(response.event.slug).toBe('super-bowl');
    });

    test('should use correct path', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ event: {} }), { status: 200 }),
      );

      await client.events.retrieveBySlug('my-event');

      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain('/v1/events/slug/my-event');
    });
  });
});
