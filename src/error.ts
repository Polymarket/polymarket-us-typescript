export class PolymarketUSError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PolymarketUSError';
  }
}

export class APIError extends PolymarketUSError {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.code = code;
  }
}

export class AuthenticationError extends APIError {
  constructor(message: string = 'Authentication failed') {
    super(401, message, 'authentication_error');
    this.name = 'AuthenticationError';
  }
}

export class BadRequestError extends APIError {
  constructor(message: string = 'Bad request') {
    super(400, message, 'bad_request');
    this.name = 'BadRequestError';
  }
}

export class NotFoundError extends APIError {
  constructor(message: string = 'Resource not found') {
    super(404, message, 'not_found');
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends APIError {
  constructor(message: string = 'Rate limit exceeded') {
    super(429, message, 'rate_limit_exceeded');
    this.name = 'RateLimitError';
  }
}

export class InternalServerError extends APIError {
  constructor(message: string = 'Internal server error') {
    super(500, message, 'internal_server_error');
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
