import {
  APIError,
  AuthenticationError,
  BadRequestError,
  InternalServerError,
  NotFoundError,
  PolymarketUS,
  RateLimitError,
} from '../src';

const mockFetch = jest.fn();
global.fetch = mockFetch as jest.Mock;

describe('HTTP Error Handling', () => {
  let client: PolymarketUS;

  beforeEach(() => {
    mockFetch.mockReset();
    client = new PolymarketUS();
  });

  describe('JSON error responses', () => {
    test('should parse JSON error with message field', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Invalid parameter' }), {
          status: 400,
        }),
      );

      await expect(client.events.list()).rejects.toThrow(BadRequestError);
    });

    test('should include message from JSON response', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Invalid parameter' }), {
          status: 400,
        }),
      );

      try {
        await client.events.list();
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestError);
        expect((error as BadRequestError).message).toBe('Invalid parameter');
      }
    });

    test('should parse JSON error with error field', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Something went wrong' }), {
          status: 500,
        }),
      );

      await expect(client.events.list()).rejects.toThrow(InternalServerError);
    });
  });

  describe('Non-JSON error responses', () => {
    test('should handle plain text error response', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response('Bad Gateway', {
          status: 502,
          statusText: 'Bad Gateway',
          headers: { 'Content-Type': 'text/plain' },
        }),
      );

      await expect(client.events.list()).rejects.toThrow(APIError);
    });

    test('should handle HTML error response', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response('<html><body>503 Service Unavailable</body></html>', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'text/html' },
        }),
      );

      await expect(client.events.list()).rejects.toThrow(APIError);
    });

    test('should handle empty error response with statusText', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(null, {
          status: 500,
          statusText: 'Internal Server Error',
        }),
      );

      await expect(client.events.list()).rejects.toThrow(InternalServerError);
    });
  });

  describe('Status code mapping', () => {
    test('should throw BadRequestError for 400', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Bad request' }), {
          status: 400,
        }),
      );

      await expect(client.events.list()).rejects.toThrow(BadRequestError);
    });

    test('should throw AuthenticationError for 401', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Unauthorized' }), {
          status: 401,
        }),
      );

      await expect(client.events.list()).rejects.toThrow(AuthenticationError);
    });

    test('should throw NotFoundError for 404', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Not found' }), { status: 404 }),
      );

      await expect(client.events.list()).rejects.toThrow(NotFoundError);
    });

    test('should throw RateLimitError for 429', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Too many requests' }), {
          status: 429,
        }),
      );

      await expect(client.events.list()).rejects.toThrow(RateLimitError);
    });

    test('should throw InternalServerError for 500', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Server error' }), {
          status: 500,
        }),
      );

      await expect(client.events.list()).rejects.toThrow(InternalServerError);
    });

    test('should throw generic APIError for other status codes', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Conflict' }), { status: 409 }),
      );

      await expect(client.events.list()).rejects.toThrow(APIError);
    });
  });

  describe('Timeout handling', () => {
    test('should throw APIError on timeout', async () => {
      const client = new PolymarketUS({ timeout: 50 });

      mockFetch.mockImplementationOnce(
        () =>
          new Promise((resolve, reject) => {
            setTimeout(() => {
              const error = new Error('The operation was aborted');
              error.name = 'AbortError';
              reject(error);
            }, 100);
          }),
      );

      try {
        await client.events.list();
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(APIError);
        expect((error as APIError).status).toBe(408);
      }
    });

    test('should succeed within timeout', async () => {
      const client = new PolymarketUS({ timeout: 200 });

      mockFetch.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () =>
                resolve(
                  new Response(JSON.stringify({ events: [] }), { status: 200 }),
                ),
              50,
            );
          }),
      );

      const response = await client.events.list();
      expect(response.events).toBeDefined();
    });
  });

  describe('Network errors', () => {
    test('should wrap network errors in APIError', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network request failed'));

      try {
        await client.events.list();
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(APIError);
        expect((error as APIError).message).toBe('Network request failed');
      }
    });

    test('should handle DNS resolution errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('getaddrinfo ENOTFOUND'));

      await expect(client.events.list()).rejects.toThrow(APIError);
    });
  });
});
