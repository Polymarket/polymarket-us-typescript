import {
  type MarketMessage,
  MarketsWebSocket,
  PolymarketUSError,
  type PrivateMessage,
  PrivateWebSocket,
  WebSocketError,
  type WebSocketErrorMessage,
} from '../src';

class TestMarketsWebSocket extends MarketsWebSocket {
  dispatch(data: string): void {
    this.handleMessage(data);
  }
}

class TestPrivateWebSocket extends PrivateWebSocket {
  dispatch(data: string): void {
    this.handleMessage(data);
  }
}

const cases: { name: string; frame: WebSocketErrorMessage }[] = [
  {
    name: 'market subscription',
    frame: {
      error: 'subscription failed',
      requestId: 'request-1',
      subscriptionType: 'SUBSCRIPTION_TYPE_TRADE',
    },
  },
  {
    name: 'private subscription',
    frame: {
      error: 'subscription failed',
      requestId: 'request-1',
      subscriptionType: 'SUBSCRIPTION_TYPE_POSITION',
    },
  },
  {
    name: 'unspecified subscription',
    frame: {
      error: 'invalid request',
      subscriptionType: 'SUBSCRIPTION_TYPE_UNSPECIFIED',
    },
  },
  {
    name: 'future subscription',
    frame: {
      error: 'subscription failed',
      requestId: 'request-1',
      subscriptionType: 'SUBSCRIPTION_TYPE_FUTURE',
    },
  },
  {
    name: 'legacy request ID only',
    frame: { error: 'subscription failed', requestId: 'request-1' },
  },
  { name: 'context-free error', frame: { error: 'invalid request' } },
];

describe.each([
  { name: 'MarketsWebSocket', Socket: TestMarketsWebSocket },
  { name: 'PrivateWebSocket', Socket: TestPrivateWebSocket },
])('$name error context', ({ Socket }) => {
  test.each(cases)('preserves $name', ({ frame }) => {
    const ws = new Socket({ keyId: 'unused', secretKey: 'unused' });
    const error = jest.fn<void, [PolymarketUSError]>();
    const message = jest.fn<void, [MarketMessage | PrivateMessage]>();
    const heartbeat = jest.fn();
    if (ws instanceof TestMarketsWebSocket) {
      ws.on('error', error);
      ws.on('message', message);
      ws.on('heartbeat', heartbeat);
    } else {
      ws.on('error', error);
      ws.on('message', message);
      ws.on('heartbeat', heartbeat);
    }

    ws.dispatch(JSON.stringify(frame));

    expect(message).toHaveBeenCalledTimes(1);
    expect(message).toHaveBeenCalledWith(frame);
    expect(error).toHaveBeenCalledTimes(1);
    expect(error.mock.calls[0][0]).toBeInstanceOf(WebSocketError);
    expect(error.mock.calls[0][0]).toBeInstanceOf(PolymarketUSError);
    expect(error.mock.calls[0][0]).toMatchObject({
      name: 'WebSocketError',
      message: frame.error,
      requestId: frame.requestId,
      subscriptionType: frame.subscriptionType,
    });
    expect(message.mock.invocationCallOrder[0]).toBeLessThan(
      error.mock.invocationCallOrder[0],
    );
    expect(heartbeat).not.toHaveBeenCalled();
  });
});
