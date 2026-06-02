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
  /** Reconnect and replay subscriptions on unexpected drops (default true). */
  autoReconnect?: boolean;
  /** Max reconnect attempts per drop (default unlimited). */
  reconnectMaxAttempts?: number;
}

/** Events emitted by every WebSocket, used as the base constraint. */
export type BaseWebSocketEvents = {
  open: () => void;
  close: () => void;
  reconnect: () => void;
  error: (error: PolymarketUSError) => void;
};

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

// WebSocket upgrade failures with these statuses are fatal (bad credentials or
// rate limiting) and must not trigger reconnect attempts.
const FATAL_AUTH_STATUSES = new Set([401, 403, 429]);

const RECONNECT_INITIAL_MS = 500;
const RECONNECT_MAX_MS = 30000;

function reconnectDelayMs(attempt: number): number {
  const capped = Math.min(
    RECONNECT_INITIAL_MS * 2 ** attempt,
    RECONNECT_MAX_MS,
  );
  return capped / 2 + Math.random() * (capped / 2);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Extract the HTTP status from a failed WebSocket upgrade error, if present.
 * The `ws` library surfaces this as `Unexpected server response: <status>`.
 */
function upgradeStatus(error: unknown): number | undefined {
  const message = error instanceof Error ? error.message : String(error);
  // Match only the `ws` upgrade-failure format so an incidental 3-digit number
  // (a port, a timeout, etc.) is not misread as a fatal auth status.
  const match = message.match(/unexpected server response:\s*(\d{3})/i);
  return match ? Number(match[1]) : undefined;
}

function isBrowser(): boolean {
  return (
    typeof window !== 'undefined' && typeof window.document !== 'undefined'
  );
}

async function getWebSocketImpl(): Promise<
  new (
    url: string,
    protocols?: string[],
    options?: object,
  ) => WebSocketLike
> {
  if (isBrowser()) {
    throw new PolymarketUSError(
      'WebSocket is not supported in browsers. ' +
        'The Polymarket US API requires header-based authentication which browser WebSocket cannot send. ' +
        'Use this SDK in a Node.js environment.',
    );
  }

  const ws = await import('ws');
  return ws.default as unknown as new (
    url: string,
    protocols?: string[],
    options?: object,
  ) => WebSocketLike;
}

type TrackedSubscription = {
  subscriptionType: PrivateSubscriptionType | MarketSubscriptionType;
  marketSlugs?: string[];
};

export abstract class BaseWebSocket<
  EventTypes extends BaseWebSocketEvents,
> extends EventEmitter<EventTypes> {
  protected socket: WebSocketLike | null = null;
  protected readonly options: WebSocketOptions;
  protected readonly path: string;

  private readonly autoReconnect: boolean;
  private readonly reconnectMaxAttempts?: number;
  private readonly subscriptions = new Map<string, TrackedSubscription>();
  private closed = false;
  // True only after a connection has successfully opened, so an initial connect
  // failure does not trigger background reconnects.
  private established = false;
  // True while a reconnect loop is running, so a failed attempt's own `close`
  // event does not spawn a second, parallel loop.
  private reconnecting = false;

  constructor(options: WebSocketOptions, path: string) {
    super();
    this.options = options;
    this.path = path;
    this.autoReconnect = options.autoReconnect ?? true;
    this.reconnectMaxAttempts = options.reconnectMaxAttempts;
  }

  // Bridges the generic emitter to the always-present base events. `EventTypes`
  // is constrained to `BaseWebSocketEvents`, so these events always exist with
  // compatible signatures; the cast satisfies the generic `_emit` signature.
  private get emitter(): { _emit(event: string, ...args: unknown[]): void } {
    return this as unknown as {
      _emit(event: string, ...args: unknown[]): void;
    };
  }

  async connect(): Promise<void> {
    this.closed = false;
    // Reset before opening so a failed (re)connect doesn't leave a stale
    // `established` flag that would trigger a background reconnect loop.
    this.established = false;
    await this.openSocket();
    this.established = true;
    this.emitter._emit('open');
  }

  private async openSocket(): Promise<void> {
    const baseUrl = this.options.baseUrl || 'wss://api.polymarket.us';
    const url = `${baseUrl}${this.path}`;

    // Re-sign on every (re)connect: the timestamp must be within the skew window.
    const authHeaders = await createAuthHeaders(
      this.options.keyId,
      this.options.secretKey,
      'GET',
      this.path,
    );

    const WebSocketImpl = await getWebSocketImpl();
    const socket = new WebSocketImpl(url, [], { headers: authHeaders });
    this.socket = socket;

    socket.addEventListener('message', (event: { data: string }) => {
      this.handleMessage(event.data.toString());
    });
    socket.addEventListener('error', (event: unknown) => {
      this.emitter._emit('error', this.toError(event));
    });
    socket.addEventListener('close', () => {
      this.onClose();
    });

    return new Promise<void>((resolve, reject) => {
      socket.addEventListener('open', () => resolve());
      socket.addEventListener('error', (event: unknown) =>
        reject(this.toError(event)),
      );
    });
  }

  private onClose(): void {
    // A failed reconnect attempt's socket also fires `close`; ignore it so we
    // don't spawn a second, parallel reconnect loop.
    if (this.reconnecting) {
      return;
    }
    if (this.closed) {
      this.emitter._emit('close');
      return;
    }
    // An initial connect failure is surfaced via the rejected connect() promise.
    if (!this.established) {
      return;
    }
    if (!this.autoReconnect) {
      this.emitter._emit('close');
      return;
    }
    void this.reconnect();
  }

  private async reconnect(): Promise<void> {
    this.reconnecting = true;
    try {
      let attempt = 0;
      while (
        !this.closed &&
        (this.reconnectMaxAttempts === undefined ||
          attempt < this.reconnectMaxAttempts)
      ) {
        await sleep(reconnectDelayMs(attempt));
        if (this.closed) {
          // Closed during backoff: surface the close like any other teardown.
          this.emitter._emit('close');
          return;
        }
        try {
          await this.openSocket();
        } catch (error) {
          const status = upgradeStatus(error);
          if (status !== undefined && FATAL_AUTH_STATUSES.has(status)) {
            this.established = false;
            this.emitter._emit(
              'error',
              new PolymarketUSError(`WebSocket auth failed (${status})`),
            );
            this.emitter._emit('close');
            return;
          }
          attempt++;
          continue;
        }
        // The user may have called close() while the upgrade was in flight.
        if (this.closed) {
          this.socket?.close(1000, 'OK');
          this.socket = null;
          this.emitter._emit('close');
          return;
        }
        this.resubscribe();
        this.emitter._emit('reconnect');
        return;
      }
      // Exhausted attempts: connection is no longer established, so a late
      // `close` from a failed socket won't restart reconnection.
      this.established = false;
      this.emitter._emit('close');
    } finally {
      this.reconnecting = false;
    }
  }

  private resubscribe(): void {
    for (const [requestId, sub] of this.subscriptions) {
      this.send({
        subscribe: {
          requestId,
          subscriptionType: sub.subscriptionType,
          marketSlugs: sub.marketSlugs,
        },
      });
    }
  }

  private toError(event: unknown): PolymarketUSError {
    if (event instanceof Error) {
      return new PolymarketUSError(event.message);
    }
    const candidate = event as { error?: unknown; message?: string };
    if (candidate?.error instanceof Error) {
      return new PolymarketUSError(candidate.error.message);
    }
    if (typeof candidate?.message === 'string') {
      return new PolymarketUSError(candidate.message);
    }
    return new PolymarketUSError('WebSocket error occurred');
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
    this.subscriptions.set(requestId, { subscriptionType, marketSlugs });
  }

  unsubscribe(requestId: string): void {
    this.subscriptions.delete(requestId);
    this.send({
      unsubscribe: { requestId },
    });
  }

  close(): void {
    this.closed = true;
    if (this.socket) {
      this.socket.close(1000, 'OK');
      this.socket = null;
    }
  }

  get isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WS_OPEN;
  }

  protected abstract handleMessage(data: string): void;
}
