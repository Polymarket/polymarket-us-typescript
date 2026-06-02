import {
  APIError,
  BadRequestError,
  InternalServerError,
  PolymarketUS,
} from '../src';
import { backoffDelayMs } from '../src/retry';

const mockFetch = jest.fn();
global.fetch = mockFetch as jest.Mock;

const TEST_SECRET_KEY = 'nWGxne/9WmC6hEr0kuwsxERJxWl7MmkZcDusAxyuf2A=';

function jsonResponse(
  status: number,
  payload: unknown = { message: 'error' },
): Response {
  return new Response(JSON.stringify(payload), { status });
}

describe('Retries', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  test('retries GET on 500 then succeeds', async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse(500))
      .mockResolvedValueOnce(jsonResponse(200, { events: [] }));
    const client = new PolymarketUS();

    const result = await client.events.list();

    expect(result).toEqual({ events: [] });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  test('exhausts retries and throws', async () => {
    mockFetch.mockResolvedValue(jsonResponse(503));
    const client = new PolymarketUS({ maxRetries: 2 });

    await expect(client.events.list()).rejects.toThrow(InternalServerError);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  test('retries GET on network error then succeeds', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce(jsonResponse(200, { events: [] }));
    const client = new PolymarketUS();

    const result = await client.events.list();

    expect(result).toEqual({ events: [] });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  test('does not retry POST requests', async () => {
    mockFetch.mockResolvedValue(jsonResponse(500));
    const client = new PolymarketUS({
      keyId: 'test-key',
      secretKey: TEST_SECRET_KEY,
    });

    await expect(
      client.orders.create({
        marketSlug: 'm',
        intent: 'ORDER_INTENT_BUY_LONG',
      }),
    ).rejects.toThrow(InternalServerError);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  test('does not retry 4xx responses', async () => {
    mockFetch.mockResolvedValue(jsonResponse(400));
    const client = new PolymarketUS();

    await expect(client.events.list()).rejects.toThrow(BadRequestError);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  test('errors carry a request id', async () => {
    mockFetch.mockResolvedValue(jsonResponse(400));
    const client = new PolymarketUS({ maxRetries: 0 });

    try {
      await client.events.list();
      fail('Expected error to be thrown');
    } catch (error) {
      expect((error as APIError).requestId).toBeTruthy();
    }
  });

  test('sends user-agent and correlation-id headers', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(200, { events: [] }));
    const client = new PolymarketUS();

    await client.events.list();

    const headers = mockFetch.mock.calls[0][1].headers as Record<
      string,
      string
    >;
    expect(headers['User-Agent']).toBe('polymarket-us-typescript');
    expect(headers['poly-correlation-id']).toBeTruthy();
  });

  test('wraps a malformed success body in APIError', async () => {
    mockFetch.mockResolvedValueOnce(new Response('not json{', { status: 200 }));
    const client = new PolymarketUS({ maxRetries: 0 });

    try {
      await client.events.list();
      fail('Expected error to be thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(APIError);
      expect((error as APIError).status).toBe(0);
    }
  });

  test('clamps Retry-After to the backoff ceiling', () => {
    expect(backoffDelayMs(0, 3_600_000)).toBe(8000);
    expect(backoffDelayMs(0, Number.POSITIVE_INFINITY)).toBe(8000);
  });
});
