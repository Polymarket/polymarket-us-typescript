export class PolymarketUSError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PolymarketUSError';
  }
}

export interface APIErrorOptions {
  code?: string;
  /** Correlation id for tracing the request server-side. */
  requestId?: string;
  /** Parsed response body, when available. */
  body?: unknown;
}

export class APIError extends PolymarketUSError {
  readonly status: number;
  readonly code?: string;
  readonly requestId?: string;
  readonly body?: unknown;

  constructor(status: number, message: string, options: APIErrorOptions = {}) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.code = options.code;
    this.requestId = options.requestId;
    this.body = options.body;
  }
}

type SubclassOptions = Omit<APIErrorOptions, 'code'>;

export class AuthenticationError extends APIError {
  constructor(
    message = 'Authentication failed',
    options: SubclassOptions = {},
  ) {
    super(401, message, { ...options, code: 'authentication_error' });
    this.name = 'AuthenticationError';
  }
}

export class BadRequestError extends APIError {
  constructor(message = 'Bad request', options: SubclassOptions = {}) {
    super(400, message, { ...options, code: 'bad_request' });
    this.name = 'BadRequestError';
  }
}

export class NotFoundError extends APIError {
  constructor(message = 'Resource not found', options: SubclassOptions = {}) {
    super(404, message, { ...options, code: 'not_found' });
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends APIError {
  constructor(message = 'Rate limit exceeded', options: SubclassOptions = {}) {
    super(429, message, { ...options, code: 'rate_limit_exceeded' });
    this.name = 'RateLimitError';
  }
}

export class InternalServerError extends APIError {
  constructor(
    message = 'Internal server error',
    options: SubclassOptions = {},
  ) {
    super(500, message, { ...options, code: 'internal_server_error' });
    this.name = 'InternalServerError';
  }
}

export class WebSocketError extends PolymarketUSError {
  readonly requestId?: string;

  constructor(message: string, requestId?: string) {
    super(message);
    this.name = 'WebSocketError';
    this.requestId = requestId;
  }
}
