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
import { MarketsWebSocket, PrivateWebSocket } from './websocket';

const GATEWAY_BASE_URL = 'https://gateway.polymarket.us';
const API_BASE_URL = 'https://api.polymarket.us';

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

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (authenticated) {
      if (!this.keyId || !this.secretKey) {
        throw new AuthenticationError(
          'API key credentials required for authenticated endpoints. ' +
            'Provide keyId and secretKey when initializing the client.',
        );
      }
      const authHeaders = await createAuthHeaders(
        this.keyId,
        this.secretKey,
        method,
        url.pathname,
      );
      Object.assign(headers, authHeaders);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await getFetch()(url.toString(), {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      const text = await response.text();
      if (!text) {
        return {} as T;
      }
      return JSON.parse(text) as T;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof APIError) {
        throw error;
      }
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new APIError(408, 'Request timeout');
        }
        throw new APIError(0, error.message);
      }
      throw error;
    }
  }

  private async handleErrorResponse(response: Response): Promise<never> {
    const text = await response.text();
    let message: string;
    try {
      const data = JSON.parse(text);
      message = data.message || data.error || response.statusText;
    } catch {
      message = text || response.statusText;
    }

    switch (response.status) {
      case 400:
        throw new BadRequestError(message);
      case 401:
        throw new AuthenticationError(message);
      case 404:
        throw new NotFoundError(message);
      case 429:
        throw new RateLimitError(message);
      case 500:
      case 502:
      case 503:
      case 504:
        throw new InternalServerError(message);
      default:
        throw new APIError(response.status, message);
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
