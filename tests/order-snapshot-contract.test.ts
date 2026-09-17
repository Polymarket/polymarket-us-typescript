import {
  type OrderSnapshot,
  type PolymarketUSError,
  type PrivateMessage,
  PrivateWebSocket,
  WebSocketError,
} from '../src';

class TestPrivateWebSocket extends PrivateWebSocket {
  dispatch(message: PrivateMessage): void {
    this.handleMessage(JSON.stringify(message));
  }
}

describe('PrivateWebSocket order snapshots', () => {
  // Public test credentials; these tests never connect a socket.
  const options = {
    keyId: 'test-key',
    secretKey: 'nWGxne/9WmC6hEr0kuwsxERJxWl7MmkZcDusAxyuf2A=',
  };
  const terminal: OrderSnapshot = {
    requestId: 'snapshot-1',
    subscriptionType: 'SUBSCRIPTION_TYPE_ORDER_SNAPSHOT',
    orderSubscriptionSnapshot: { orders: [], eof: true },
  };

  let ws: TestPrivateWebSocket;

  beforeEach(() => {
    ws = new TestPrivateWebSocket(options);
  });

  test('sends separate requests for live orders and an order snapshot', () => {
    const send = jest.spyOn(ws, 'send').mockImplementation(() => {});

    ws.subscribeOrders('live-1');
    ws.subscribe('snapshot-1', 'SUBSCRIPTION_TYPE_ORDER_SNAPSHOT');

    expect(send.mock.calls.map(([request]) => request)).toEqual([
      {
        subscribe: {
          requestId: 'live-1',
          subscriptionType: 'SUBSCRIPTION_TYPE_ORDER',
        },
      },
      {
        subscribe: {
          requestId: 'snapshot-1',
          subscriptionType: 'SUBSCRIPTION_TYPE_ORDER_SNAPSHOT',
        },
      },
    ]);
  });

  test('emits an empty successful EOF as an order snapshot and raw message', () => {
    const snapshot = jest.fn<void, [OrderSnapshot]>();
    const error = jest.fn<void, [PolymarketUSError]>();
    const message = jest.fn<void, [PrivateMessage]>();
    ws.on('orderSnapshot', snapshot);
    ws.on('error', error);
    ws.on('message', message);

    ws.dispatch(terminal);

    expect(snapshot).toHaveBeenCalledWith(terminal);
    expect(message).toHaveBeenCalledWith(terminal);
    expect(error).not.toHaveBeenCalled();
  });

  test('emits a failed EOF as an error and raw message', () => {
    const snapshot = jest.fn<void, [OrderSnapshot]>();
    const error = jest.fn<void, [PolymarketUSError]>();
    const message = jest.fn<void, [PrivateMessage]>();
    ws.on('orderSnapshot', snapshot);
    ws.on('error', error);
    ws.on('message', message);
    const failed = { ...terminal, error: 'deadline exceeded' };

    ws.dispatch(failed);

    expect(snapshot).not.toHaveBeenCalled();
    expect(message).toHaveBeenCalledWith(failed);
    expect(error).toHaveBeenCalledTimes(1);
    expect(error.mock.calls[0][0]).toBeInstanceOf(WebSocketError);
    expect(error.mock.calls[0][0]).toMatchObject({
      message: 'deadline exceeded',
      requestId: 'snapshot-1',
    });
  });
});
