import {
  type AccountBalanceSnapshot,
  type AccountBalanceUpdate,
  type PositionUpdate,
  type PrivateMessage,
  PrivateWebSocket,
  type UserBalance,
  type UserPosition,
  WebSocketError,
} from '../src';

class TestPrivateWebSocket extends PrivateWebSocket {
  dispatch(data: string): void {
    this.handleMessage(data);
  }
}

const position: UserPosition = {
  netPosition: '10',
  qtyBought: '10',
  qtySold: '0',
  cost: null,
  realized: { value: '0', currency: 'USD' },
  bodPosition: '0',
  expired: false,
  updateTime: null,
  marketMetadata: null,
  cashValue: null,
};

const balance: UserBalance = {
  currentBalance: 0,
  currency: 'USD',
  lastUpdated: null,
  buyingPower: 0,
  pendingWithdrawals: [{ id: 'withdrawal-1', creationTime: null }],
};

const positionUpdate: PositionUpdate = {
  requestId: 'positions-1',
  subscriptionType: 'SUBSCRIPTION_TYPE_POSITION',
  positionSubscription: {
    beforePosition: null,
    afterPosition: position,
    updateTime: null,
    entryType: 'LEDGER_ENTRY_TYPE_ORDER_EXECUTION',
    tradeId: 'trade-1',
    referenceId: '',
    description: '',
    allocationGroupId: '',
    transferReferenceTradeIds: [],
    shortTransfer: false,
    updateTradeDate: null,
  },
};

const balanceSnapshot: AccountBalanceSnapshot = {
  requestId: 'balances-1',
  subscriptionType: 'SUBSCRIPTION_TYPE_ACCOUNT_BALANCE',
  accountBalancesSnapshot: { balances: [balance] },
};

const balanceUpdate: AccountBalanceUpdate = {
  requestId: 'balances-1',
  subscriptionType: 'SUBSCRIPTION_TYPE_ACCOUNT_BALANCE',
  accountBalancesUpdate: {
    balanceChange: {
      beforeBalance: null,
      afterBalance: balance,
      description: '',
      updateTime: null,
      modifiedSecurityId: '',
      entryType: 'LEDGER_ENTRY_TYPE_DEPOSIT',
      accountName: 'test-account',
      id: 'entry-1',
    },
  },
};

const dataEvents = [
  'orderSnapshot',
  'orderUpdate',
  'positionSnapshot',
  'positionUpdate',
  'accountBalanceSnapshot',
  'accountBalanceUpdate',
] as const;
type DataEvent = (typeof dataEvents)[number];

describe('PrivateWebSocket callback contracts', () => {
  let ws: TestPrivateWebSocket;

  beforeEach(() => {
    // Public test credentials; dispatch tests do not open a socket.
    ws = new TestPrivateWebSocket({
      keyId: 'test-key',
      secretKey: 'nWGxne/9WmC6hEr0kuwsxERJxWl7MmkZcDusAxyuf2A=',
    });
  });

  const frames: { name: string; event: DataEvent; wire: PrivateMessage }[] = [
    { name: 'opening position', event: 'positionUpdate', wire: positionUpdate },
    {
      name: 'closing position',
      event: 'positionUpdate',
      wire: {
        ...positionUpdate,
        positionSubscription: {
          ...positionUpdate.positionSubscription,
          beforePosition: position,
          afterPosition: null,
        },
      },
    },
    {
      name: 'balance snapshot',
      event: 'accountBalanceSnapshot',
      wire: balanceSnapshot,
    },
    {
      name: 'empty balance snapshot',
      event: 'accountBalanceSnapshot',
      wire: { ...balanceSnapshot, accountBalancesSnapshot: { balances: [] } },
    },
    {
      name: 'balance update',
      event: 'accountBalanceUpdate',
      wire: balanceUpdate,
    },
    {
      name: 'balance update without an after balance',
      event: 'accountBalanceUpdate',
      wire: {
        ...balanceUpdate,
        accountBalancesUpdate: {
          balanceChange: {
            ...balanceUpdate.accountBalancesUpdate.balanceChange,
            beforeBalance: balance,
            afterBalance: null,
          },
        },
      },
    },
  ];

  test.each(frames)('dispatches $name unchanged and once', ({
    event,
    wire,
  }) => {
    const raw = jest.fn<void, [PrivateMessage]>();
    const error = jest.fn();
    const callbacks = new Map(
      dataEvents.map((name) => {
        const callback = jest.fn<void, [PrivateMessage]>();
        ws.on(name, callback);
        return [name, callback];
      }),
    );
    ws.on('message', raw);
    ws.on('error', error);

    ws.dispatch(JSON.stringify(wire));

    expect(raw).toHaveBeenCalledTimes(1);
    expect(raw).toHaveBeenCalledWith(wire);
    for (const [name, callback] of callbacks) {
      expect(callback).toHaveBeenCalledTimes(name === event ? 1 : 0);
    }
    expect(callbacks.get(event)?.mock.calls[0][0]).toBe(raw.mock.calls[0][0]);
    expect(error).not.toHaveBeenCalled();
  });

  test('supports typed consumers of the gateway payloads', () => {
    const positions: Array<UserPosition | null> = [];
    const buyingPowers: number[] = [];
    const entryIds: string[] = [];
    ws.on('positionUpdate', (data) => {
      if ('positionSubscription' in data) {
        const change: PositionUpdate['positionSubscription'] =
          data.positionSubscription;
        positions.push(change.beforePosition, change.afterPosition);
      }
    });
    ws.on('accountBalanceSnapshot', (data) => {
      if ('accountBalancesSnapshot' in data) {
        buyingPowers.push(
          ...data.accountBalancesSnapshot.balances.map(
            (item) => item.buyingPower,
          ),
        );
      }
    });
    ws.on('accountBalanceUpdate', (data) => {
      if ('accountBalancesUpdate' in data) {
        const change = data.accountBalancesUpdate.balanceChange;
        entryIds.push(change.id);
        if (change.afterBalance)
          buyingPowers.push(change.afterBalance.buyingPower);
      }
    });

    ws.dispatch(JSON.stringify(positionUpdate));
    ws.dispatch(JSON.stringify(balanceSnapshot));
    ws.dispatch(JSON.stringify(balanceUpdate));

    expect(positions).toEqual([null, position]);
    expect(buyingPowers).toEqual([0, 0]);
    expect(entryIds).toEqual(['entry-1']);
  });

  const legacyCases: {
    key: string;
    event: DataEvent;
    subscriptionType: string;
    payload: object;
  }[] = [
    ...['orderSubscriptionSnapshot', 'ordersSnapshot'].map((key) => ({
      key,
      event: 'orderSnapshot' as const,
      subscriptionType: 'SUBSCRIPTION_TYPE_ORDER_SNAPSHOT',
      payload: { orders: [], eof: true },
    })),
    ...['orderSubscriptionUpdate', 'orderUpdate'].map((key) => ({
      key,
      event: 'orderUpdate' as const,
      subscriptionType: 'SUBSCRIPTION_TYPE_ORDER',
      payload: { execution: { orderId: 'order-1' } },
    })),
    ...['positionSubscriptionSnapshot', 'positionsSnapshot'].map((key) => ({
      key,
      event: 'positionSnapshot' as const,
      subscriptionType: 'SUBSCRIPTION_TYPE_POSITION',
      payload: { positions: {}, eof: true },
    })),
    ...['positionSubscriptionUpdate', 'positionUpdate'].map((key) => ({
      key,
      event: 'positionUpdate' as const,
      subscriptionType: 'SUBSCRIPTION_TYPE_POSITION',
      payload: { marketSlug: 'market-1', position },
    })),
    {
      key: 'accountBalanceSubscriptionSnapshot',
      event: 'accountBalanceSnapshot',
      subscriptionType: 'SUBSCRIPTION_TYPE_ACCOUNT_BALANCE',
      payload: { balance: 0, buyingPower: 0 },
    },
    ...['accountBalanceSubscriptionUpdate', 'accountBalanceUpdate'].map(
      (key) => ({
        key,
        event: 'accountBalanceUpdate' as const,
        subscriptionType: 'SUBSCRIPTION_TYPE_ACCOUNT_BALANCE',
        payload: { balance: 0, buyingPower: 0 },
      }),
    ),
  ];

  test.each(legacyCases)('preserves the $key alias', ({
    key,
    event,
    subscriptionType,
    payload,
  }) => {
    const callback = jest.fn<void, [PrivateMessage]>();
    const raw = jest.fn<void, [PrivateMessage]>();
    const wire = { requestId: 'legacy-1', subscriptionType, [key]: payload };
    ws.on(event, callback);
    ws.on('message', raw);

    ws.dispatch(JSON.stringify(wire));

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(wire);
    expect(callback.mock.calls[0][0]).toBe(raw.mock.calls[0][0]);
  });

  test.each([
    '',
    'subscription failed',
  ])('handles error %j before dispatch', (message) => {
    const callback = jest.fn();
    const error = jest.fn();
    const raw = jest.fn<void, [PrivateMessage]>();
    const wire = { ...positionUpdate, error: message };
    ws.on('positionUpdate', callback);
    ws.on('error', error);
    ws.on('message', raw);

    ws.dispatch(JSON.stringify(wire));

    expect(raw).toHaveBeenCalledWith(wire);
    expect(callback).toHaveBeenCalledTimes(message ? 0 : 1);
    expect(error).toHaveBeenCalledTimes(message ? 1 : 0);
    if (message) {
      expect(error.mock.calls[0][0]).toBeInstanceOf(WebSocketError);
      expect(error.mock.calls[0][0]).toMatchObject({
        message,
        requestId: 'positions-1',
      });
    }
  });
});
