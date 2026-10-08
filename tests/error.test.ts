import {
  APIError,
  AuthenticationError,
  BadRequestError,
  InternalServerError,
  NotFoundError,
  PolymarketUSError,
  RateLimitError,
  WebSocketError,
} from '../src';

describe('Error Classes', () => {
  test('PolymarketUSError should be an Error', () => {
    const error = new PolymarketUSError('test message');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(PolymarketUSError);
    expect(error.message).toBe('test message');
    expect(error.name).toBe('PolymarketUSError');
  });

  test('APIError should have status and code', () => {
    const error = new APIError(400, 'bad request', 'invalid_param');
    expect(error).toBeInstanceOf(PolymarketUSError);
    expect(error).toBeInstanceOf(APIError);
    expect(error.status).toBe(400);
    expect(error.code).toBe('invalid_param');
    expect(error.message).toBe('bad request');
  });

  test('AuthenticationError should have status 401', () => {
    const error = new AuthenticationError('invalid token');
    expect(error).toBeInstanceOf(APIError);
    expect(error.status).toBe(401);
    expect(error.code).toBe('authentication_error');
  });

  test('AuthenticationError should have default message', () => {
    const error = new AuthenticationError();
    expect(error.message).toBe('Authentication failed');
  });

  test('BadRequestError should have status 400', () => {
    const error = new BadRequestError('missing field');
    expect(error).toBeInstanceOf(APIError);
    expect(error.status).toBe(400);
    expect(error.code).toBe('bad_request');
  });

  test('NotFoundError should have status 404', () => {
    const error = new NotFoundError('order not found');
    expect(error).toBeInstanceOf(APIError);
    expect(error.status).toBe(404);
    expect(error.code).toBe('not_found');
  });

  test('RateLimitError should have status 429', () => {
    const error = new RateLimitError();
    expect(error).toBeInstanceOf(APIError);
    expect(error.status).toBe(429);
    expect(error.code).toBe('rate_limit_exceeded');
    expect(error.message).toBe('Rate limit exceeded');
  });

  test('InternalServerError should have status 500', () => {
    const error = new InternalServerError();
    expect(error).toBeInstanceOf(APIError);
    expect(error.status).toBe(500);
    expect(error.code).toBe('internal_server_error');
  });

  test('errors can be caught by type', () => {
    const error = new AuthenticationError('test');

    expect(() => {
      throw error;
    }).toThrow(AuthenticationError);

    expect(() => {
      throw error;
    }).toThrow(APIError);

    expect(() => {
      throw error;
    }).toThrow(PolymarketUSError);
  });
});

describe('WebSocketError', () => {
  test.each([
    [
      'message only',
      new WebSocketError('subscription failed'),
      undefined,
      undefined,
    ],
    [
      'request ID',
      new WebSocketError('subscription failed', 'request-1'),
      'request-1',
      undefined,
    ],
    [
      'subscription context',
      new WebSocketError(
        'subscription failed',
        'request-1',
        'SUBSCRIPTION_TYPE_TRADE',
      ),
      'request-1',
      'SUBSCRIPTION_TYPE_TRADE',
    ],
    [
      'context without request ID',
      new WebSocketError(
        'subscription failed',
        undefined,
        'SUBSCRIPTION_TYPE_FUTURE',
      ),
      undefined,
      'SUBSCRIPTION_TYPE_FUTURE',
    ],
  ])('preserves error behavior with %s', (_name, error, requestId, subscriptionType) => {
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(PolymarketUSError);
    expect(error).toBeInstanceOf(WebSocketError);
    expect(error.name).toBe('WebSocketError');
    expect(error.message).toBe('subscription failed');
    expect(error.requestId).toBe(requestId);
    expect(error.subscriptionType).toBe(subscriptionType);
  });
});
