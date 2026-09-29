import { once } from 'node:events';
import { WebSocketServer } from 'ws';
import {
  PolymarketUS,
  type PrivateMessage,
  type RFQEvent,
  type RFQEventPayload,
  WebSocketError,
} from '../src';
import { rfqEvents } from './fixtures/rfq-events';

test('dispatches RFQ wire events unchanged over a local socket', async () => {
  const server = new WebSocketServer({ host: '127.0.0.1', port: 0 });
  await once(server, 'listening');
  const address = server.address();
  if (typeof address === 'string' || address === null)
    throw new Error('Expected a local socket address');

  const client = new PolymarketUS({
    keyId: 'test-key',
    secretKey: 'nWGxne/9WmC6hEr0kuwsxERJxWl7MmkZcDusAxyuf2A=',
    apiBaseUrl: `http://127.0.0.1:${address.port}`,
  });
  const ws = client.ws.private();
  const requests: unknown[] = [];
  const messages: PrivateMessage[] = [];
  const callbacks: RFQEvent[] = [];
  const errors: Error[] = [];
  const otherEvent = jest.fn();
  const expected = rfqEvents.map(({ message }) => message);
  const emptyError = { ...expected[0], error: '' };
  const failed = { ...expected[0], error: 'subscription failed' };
  const heartbeat = { ...expected[0], heartbeat: {} };

  server.on('connection', (socket) => {
    socket.once('message', (data) => {
      requests.push(JSON.parse(data.toString()));
      for (const frame of [...expected, emptyError, failed, heartbeat]) {
        socket.send(JSON.stringify(frame));
      }
    });
  });
  ws.on('message', (data) => messages.push(data));
  ws.on('rfqEvent', (data) => callbacks.push(data));
  ws.on('error', (error) => errors.push(error));
  for (const event of [
    'orderSnapshot',
    'orderUpdate',
    'positionSnapshot',
    'positionUpdate',
    'accountBalanceSnapshot',
    'accountBalanceUpdate',
  ] as const) {
    ws.on(event, otherEvent);
  }

  try {
    await ws.connect();
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error('Timed out waiting for local RFQ frames')),
        2000,
      );
      ws.once('heartbeat', () => {
        clearTimeout(timeout);
        resolve();
      });
      ws.subscribeRFQ('rfqs');
    });

    expect(requests).toEqual([
      {
        subscribe: {
          requestId: 'rfqs',
          subscriptionType: 'SUBSCRIPTION_TYPE_RFQ',
        },
      },
    ]);
    expect(messages).toEqual([...expected, emptyError, failed, heartbeat]);
    expect(callbacks).toEqual([...expected, emptyError]);
    for (const [index, callback] of callbacks.entries()) {
      expect(callback).toBe(messages[index]);
    }
    expect(errors).toHaveLength(1);
    expect(errors[0]).toBeInstanceOf(WebSocketError);
    expect(errors[0]).toMatchObject({
      message: 'subscription failed',
      requestId: 'rfqs',
    });
    expect(otherEvent).not.toHaveBeenCalled();

    const created: RFQEventPayload | undefined = callbacks[0]?.rfqEvent;
    expect(created?.rfqCreated?.rfq?.qtyDecimal).toBe('0.0100');
    expect(created?.rfqCreated?.rfq?.comboLegs[0].settlementPrice).toBe('0');
    expect(created?.rfqCreated?.rfq?.comboLegs[1]).not.toHaveProperty(
      'settlementPrice',
    );
    expect(created?.rfqCreated?.rfq?.tickSize).toBe(0.0001);
    expect(callbacks[2].rfqEvent.quoteCreated?.quote?.executedTime).toBeNull();
    expect(callbacks[6].rfqEvent.quoteExecuted?.quote?.creatorOrderId).toBe(
      'quoter-order-1',
    );
    expect(callbacks[7].rfqEvent.rfqCreated?.rfq).not.toHaveProperty(
      'tickSize',
    );
    expect(callbacks[9].rfqEvent.rfqCreated?.rfq).toBeNull();
    expect(callbacks[11].rfqEvent).toEqual({});
  } finally {
    ws.close();
    for (const socket of server.clients) socket.terminate();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
