import { createAuthHeaders } from './auth';
import {
  APIError,
  AuthenticationError,
  BadRequestError,
  InternalServerError,
  NotFoundError,
  PolymarketUSError,
  RateLimitError,
} from './error';
import {
  Account,
  Events,
  Markets,
  Orders,
  Portfolio,
  Search,
  Series,
  Sports,
} from './resources';
import {
  backoffDelayMs,
  canRetryMethod,
  DEFAULT_MAX_RETRIES,
  isRetryableStatus,
  parseRetryAfterMs,
  sleep,
} from './retry';
import { MarketsWebSocket, PrivateWebSocket } from './websocket';

const GATEWAY_BASE_URL = 'https://gateway.polymarket.us';
const API_BASE_URL = 'https://api.polymarket.us';

// SDK identifier sent on every request.
const USER_AGENT = 'polymarket-us-typescript';

// Correlation id sent with every request so failures can be traced server-side.
const CORRELATION_ID_HEADER = 'poly-correlation-id';

function generateCorrelationId(): string {
  const cryptoObj = (globalThis as { crypto?: { randomUUID?: () => string } })
    .crypto;
  if (cryptoObj?.randomUUID) {
    return cryptoObj.randomUUID();
  }
  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
}

function getFetch(): typeof fetch {
  if (typeof fetch !== 'undefined') {
    return fetch;
  }
  throw new PolymarketUSError(
    '`fetch` is not defined. This SDK requires Node.js 18+ or a browser environment. ' +
      'If using an older Node.js version, polyfill fetch: `globalThis.fetch = require("node-fetch")`',
  );
}

export interface PolymarketUSOptions {
  keyId?: string;
  secretKey?: string;
  gatewayBaseUrl?: string;
  apiBaseUrl?: string;
  timeout?: number;
  /**
   * Maximum automatic retries for idempotent requests on transient failures
   * (timeouts, connection errors, and 408/409/429/5xx). Non-idempotent requests
   * (e.g. order placement) are never retried. Defaults to 2.
   */
  maxRetries?: number;
}

interface RequestOptions {
  query?: Record<string, unknown> | object;
  body?: unknown;
  authenticated?: boolean;
}

export class PolymarketUS {
  readonly keyId?: string;
  readonly secretKey?: string;
  readonly gatewayBaseUrl: string;
  readonly apiBaseUrl: string;
  readonly timeout: number;
  readonly maxRetries: number;

  readonly events: Events;
  readonly markets: Markets;
  readonly orders: Orders;
  readonly portfolio: Portfolio;
  readonly account: Account;
  readonly series: Series;
  readonly sports: Sports;
  readonly search: Search;
  readonly ws: WebSocketFactory;

  constructor(options: PolymarketUSOptions = {}) {
    this.keyId = options.keyId;
    this.secretKey = options.secretKey;
    this.gatewayBaseUrl = options.gatewayBaseUrl || GATEWAY_BASE_URL;
    this.apiBaseUrl = options.apiBaseUrl || API_BASE_URL;
    this.timeout = options.timeout || 30000;
    this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;

    this.events = new Events(this);
    this.markets = new Markets(this);
    this.orders = new Orders(this);
    this.portfolio = new Portfolio(this);
    this.account = new Account(this);
    this.series = new Series(this);
    this.sports = new Sports(this);
    this.search = new Search(this);
    this.ws = new WebSocketFactory(this);
  }

  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('GET', path, options);
  }

  async post<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('POST', path, options);
  }

  async delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('DELETE', path, options);
  }

  private async request<T>(
    method: string,
    path: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const { query, body, authenticated } = options;
    const baseUrl = authenticated ? this.apiBaseUrl : this.gatewayBaseUrl;
    const url = new URL(path, baseUrl);

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            for (const item of value) {
              url.searchParams.append(key, String(item));
            }
          } else {
            url.searchParams.set(key, String(value));
          }
        }
      }
    }

    if (authenticated && (!this.keyId || !this.secretKey)) {
      throw new AuthenticationError(
        'API key credentials required for authenticated endpoints. ' +
          'Provide keyId and secretKey when initializing the client.',
      );
    }

    const correlationId = generateCorrelationId();

    let attempt = 0;
    for (;;) {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': USER_AGENT,
        [CORRELATION_ID_HEADER]: correlationId,
      };

      if (authenticated) {
        const authHeaders = await createAuthHeaders(
          this.keyId as string,
          this.secretKey as string,
          method,
          url.pathname,
        );
        Object.assign(headers, authHeaders);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      let response: Response;
      try {
        response = await getFetch()(url.toString(), {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });
      } catch (error) {
        clearTimeout(timeoutId);
        if (canRetryMethod(method) && attempt < this.maxRetries) {
          await sleep(backoffDelayMs(attempt));
          attempt++;
          continue;
        }
        if (error instanceof Error && error.name === 'AbortError') {
          throw new APIError(408, 'Request timeout', {
            requestId: correlationId,
          });
        }
        const message =
          error instanceof Error ? error.message : 'Network error';
        throw new APIError(0, message, { requestId: correlationId });
      }

      clearTimeout(timeoutId);

      if (response.ok) {
        try {
          const text = await response.text();
          if (!text) {
            return {} as T;
          }
          return JSON.parse(text) as T;
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : 'Failed to parse response body';
          throw new APIError(0, message, { requestId: correlationId });
        }
      }

      if (
        isRetryableStatus(response.status) &&
        canRetryMethod(method) &&
        attempt < this.maxRetries
      ) {
        const retryAfter = parseRetryAfterMs(
          response.headers.get('Retry-After'),
        );
        await sleep(backoffDelayMs(attempt, retryAfter));
        attempt++;
        continue;
      }

      await this.handleErrorResponse(response, correlationId);
    }
  }

  private async handleErrorResponse(
    response: Response,
    correlationId: string,
  ): Promise<never> {
    let text: string;
    try {
      text = await response.text();
    } catch {
      text = '';
    }
    let message: string;
    let body: unknown;
    try {
      const data = JSON.parse(text);
      body = data;
      message = data.message || data.error || response.statusText;
    } catch {
      message = text || response.statusText;
    }

    const requestId =
      response.headers.get(CORRELATION_ID_HEADER) ??
      response.headers.get('x-request-id') ??
      correlationId;
    const errorOptions = { requestId, body };

    switch (response.status) {
      case 400:
        throw new BadRequestError(message, errorOptions);
      case 401:
        throw new AuthenticationError(message, errorOptions);
      case 404:
        throw new NotFoundError(message, errorOptions);
      case 429:
        throw new RateLimitError(message, errorOptions);
      case 500:
      case 502:
      case 503:
      case 504:
        throw new InternalServerError(message, errorOptions);
      default:
        throw new APIError(response.status, message, errorOptions);
    }
  }
}

class WebSocketFactory {
  private client: PolymarketUS;

  constructor(client: PolymarketUS) {
    this.client = client;
  }

  private getWebSocketOptions() {
    if (!this.client.keyId || !this.client.secretKey) {
      throw new AuthenticationError(
        'API key credentials required for WebSocket connections. ' +
          'Provide keyId and secretKey when initializing the client.',
      );
    }
    const url = new URL(this.client.apiBaseUrl);
    url.protocol = url.protocol === 'http:' ? 'ws:' : 'wss:';
    return {
      keyId: this.client.keyId,
      secretKey: this.client.secretKey,
      baseUrl: url.origin,
    };
  }

  private(): PrivateWebSocket {
    return new PrivateWebSocket(this.getWebSocketOptions());
  }

  markets(): MarketsWebSocket {
    return new MarketsWebSocket(this.getWebSocketOptions());
  }
}
