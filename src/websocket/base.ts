import { createAuthHeaders } from '../auth';
import { PolymarketUSError } from '../error';
import { EventEmitter } from './emitter';
import type {
  MarketSubscriptionType,
  PrivateSubscriptionType,
  WebSocketRequest,
} from './types';

export interface WebSocketOptions {
  keyId: string;
  secretKey: string;
  baseUrl?: string;
}

type WebSocketLike = {
  send(data: string): void;
  close(code?: number, reason?: string): void;
  addEventListener(
    type: string,
    listener: (event: { data: string }) => void,
  ): void;
  readyState: number;
};

const WS_OPEN = 1;

async function getWebSocketImpl(): Promise<
  new (
    url: string,
    protocols?: string[],
    options?: object,
  ) => WebSocketLike
> {
  // Prefer `ws` package as it supports custom headers in handshake
  // Native WebSocket in Node.js doesn't support headers
  try {
    const ws = await import('ws');
    return ws.default as unknown as new (
      url: string,
      protocols?: string[],
      options?: object,
    ) => WebSocketLike;
  } catch {
    // Fall back to native WebSocket (browsers, or Node 22+ without ws)
    if (typeof globalThis.WebSocket !== 'undefined') {
      return globalThis.WebSocket as unknown as new (
        url: string,
        protocols?: string[],
        options?: object,
      ) => WebSocketLike;
    }
    throw new PolymarketUSError(
      'WebSocket is not available. Install the "ws" package: npm install ws',
    );
  }
}

export abstract class BaseWebSocket<
  // biome-ignore lint/suspicious/noExplicitAny: complex generics needed for type-safe event emitter
  EventTypes extends Record<string, (...args: any[]) => any>,
> extends EventEmitter<EventTypes> {
  protected socket: WebSocketLike | null = null;
  protected readonly options: WebSocketOptions;
  protected readonly path: string;

  constructor(options: WebSocketOptions, path: string) {
    super();
    this.options = options;
    this.path = path;
  }

  async connect(): Promise<void> {
    const baseUrl = this.options.baseUrl || 'wss://api.polymarket.us';
    const url = `${baseUrl}${this.path}`;

    const authHeaders = await createAuthHeaders(
      this.options.keyId,
      this.options.secretKey,
      'GET',
      this.path,
    );

    const WebSocketImpl = await getWebSocketImpl();

    this.socket = new WebSocketImpl(url, [], {
      headers: authHeaders,
    });

    this.socket.addEventListener('message', (event: { data: string }) => {
      this.handleMessage(event.data.toString());
    });

    this.socket.addEventListener('error', (event: unknown) => {
      this.handleError(event);
    });

    this.socket.addEventListener('close', () => {
      this.handleClose();
    });

    const socket = this.socket;
    return new Promise((resolve, reject) => {
      socket.addEventListener('open', () => {
        // biome-ignore lint/suspicious/noExplicitAny: emit open event to subclass
        (this as any)._emit('open');
        resolve();
      });
      socket.addEventListener('error', (e: unknown) =>
        reject(new PolymarketUSError(`WebSocket connection failed: ${e}`)),
      );
    });
  }

  send(request: WebSocketRequest): void {
    if (!this.socket || this.socket.readyState !== WS_OPEN) {
      throw new PolymarketUSError('WebSocket is not connected');
    }
    this.socket.send(JSON.stringify(request));
  }

  subscribe(
    requestId: string,
    subscriptionType: PrivateSubscriptionType | MarketSubscriptionType,
    marketSlugs?: string[],
  ): void {
    this.send({
      subscribe: {
        requestId,
        subscriptionType,
        marketSlugs,
      },
    });
  }

  unsubscribe(requestId: string): void {
    this.send({
      unsubscribe: { requestId },
    });
  }

  close(): void {
    if (this.socket) {
      this.socket.close(1000, 'OK');
      this.socket = null;
    }
  }

  get isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WS_OPEN;
  }

  protected abstract handleMessage(data: string): void;
  protected abstract handleError(event: unknown): void;
  protected abstract handleClose(): void;
}
