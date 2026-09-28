import {
  type AccountBalanceSnapshot,
  type AccountBalanceUpdate,
  type Amount,
  type ComboLegDetail,
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
  avgPx: null,
  fees: null,
  baseCost: null,
  costPerShare: null,
  netPositionDecimal: '10.25',
  qtyBoughtDecimal: '10.25',
  qtySoldDecimal: '0',
  bodPositionDecimal: '0',
  positionId: 'user-1:LONG:market-1',
  comboLegDetails: [],
};

const balance: UserBalance = {
  currentBalance: 0,
  currency: 'USD',
  lastUpdated: null,
  buyingPower: 0,
  pendingWithdrawals: [{ id: 'withdrawal-1', creationTime: null }],
  balanceReservation: 0,
  depositReservation: 0,
  bonusReservation: 0,
  displayedBonus: 0,
  displayedAvailableSoon: 0,
  displayedCash: 0,
  availableToWithdraw: 0,
  bonusHold: 0,
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

  test('exposes exact quantities and nullable cost fields to typed consumers', () => {
    const quantities: Array<string | undefined> = [];
    const costs: Array<Amount | null | undefined> = [];
    const positionIds: Array<string | undefined> = [];
    ws.on('positionUpdate', (data) => {
      if ('positionSubscription' in data) {
        const after = data.positionSubscription.afterPosition;
        if (after) {
          quantities.push(
            after.netPositionDecimal,
            after.qtyBoughtDecimal,
            after.qtySoldDecimal,
            after.bodPositionDecimal,
            after.qtyAvailableDecimal,
          );
          costs.push(
            after.avgPx,
            after.fees,
            after.baseCost,
            after.costPerShare,
          );
          positionIds.push(after.positionId);
        }
      }
    });

    ws.dispatch(JSON.stringify(positionUpdate));
    ws.dispatch(
      JSON.stringify({
        ...positionUpdate,
        positionSubscription: {
          ...positionUpdate.positionSubscription,
          afterPosition: {
            ...position,
            qtyAvailableDecimal: '0',
            avgPx: { value: '0.5', currency: 'USD' },
            fees: { value: '0', currency: 'USD' },
            baseCost: { value: '5.125', currency: 'USD' },
            costPerShare: { value: '0.5', currency: 'USD' },
          },
        },
      } satisfies PositionUpdate),
    );

    expect(quantities).toEqual([
      '10.25',
      '10.25',
      '0',
      '0',
      undefined,
      '10.25',
      '10.25',
      '0',
      '0',
      '0',
    ]);
    expect(costs).toEqual([
      null,
      null,
      null,
      null,
      { value: '0.5', currency: 'USD' },
      { value: '0', currency: 'USD' },
      { value: '5.125', currency: 'USD' },
      { value: '0.5', currency: 'USD' },
    ]);
    expect(positionIds).toEqual([
      'user-1:LONG:market-1',
      'user-1:LONG:market-1',
    ]);
  });

  test('preserves zero and absent reservation display fields', () => {
    const displays: Array<Array<number | undefined>> = [];
    const readBalance = (item: UserBalance): void => {
      displays.push([
        item.depositReservation,
        item.bonusReservation,
        item.displayedBonus,
        item.displayedAvailableSoon,
        item.displayedCash,
        item.availableToWithdraw,
        item.bonusHold,
      ]);
    };
    ws.on('accountBalanceSnapshot', (data) => {
      if ('accountBalancesSnapshot' in data)
        data.accountBalancesSnapshot.balances.forEach(readBalance);
    });
    ws.on('accountBalanceUpdate', (data) => {
      if ('accountBalancesUpdate' in data) {
        const after = data.accountBalancesUpdate.balanceChange.afterBalance;
        if (after) readBalance(after);
      }
    });

    ws.dispatch(JSON.stringify(balanceSnapshot));
    ws.dispatch(JSON.stringify(balanceUpdate));
    ws.dispatch(
      JSON.stringify({
        ...balanceUpdate,
        accountBalancesUpdate: {
          balanceChange: {
            ...balanceUpdate.accountBalancesUpdate.balanceChange,
            afterBalance: {
              currentBalance: 0,
              currency: 'USD',
              buyingPower: 0,
            },
          },
        },
      } satisfies AccountBalanceUpdate),
    );

    expect(displays).toEqual([
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      ],
    ]);
  });

  test('exposes typed position metadata without filling absent or null fields', () => {
    const leg: ComboLegDetail = {
      slug: 'leg-1',
      icon: '',
      title: 'Leg one',
      outcome: 'Yes',
      eventSlug: 'event-1',
      eventId: 'event-id-1',
      outcomeSide: 'OUTCOME_SIDE_YES',
      eventGroupTitle: '',
      eventStartTime: null,
      live: false,
      indicativePrice: null,
      state: 'COMBO_LEG_STATE_PENDING',
    };
    const settledLeg: ComboLegDetail = {
      ...leg,
      teamId: 0,
      team: {
        id: 0,
        name: 'Team one',
        providerId: 0,
        ordering: '',
        longIcon: 'long.svg',
        shortIcon: 'short.svg',
        displayAbbreviation: 'ONE',
        ranking: '0',
        conference: '',
        providerIds: [{ provider: 'PROVIDER_GRID', providerId: 'team-1' }],
        longIconDark: 'long-dark.svg',
        shortIconDark: 'short-dark.svg',
        color: { light: '#ffffff', dark: '#000000' },
        imageDisplayType: 'IMAGE_DISPLAY_TYPE_LOGO',
      },
      subject: { id: 0, name: 'Player one', subjectType: 'player' },
      eventStartTime: '2026-09-28T18:00:00Z',
      indicativePrice: { value: '1', currency: 'USD' },
      settlement: {
        settlementPrice: { value: '1', currency: 'USD' },
        settlementSetTime: null,
      },
      state: 'COMBO_LEG_STATE_WON',
    };
    const legs: ComboLegDetail[] = [];
    const metadata: Array<UserPosition['marketMetadata']> = [];
    ws.on('positionUpdate', (data) => {
      if ('positionSubscription' in data) {
        const after = data.positionSubscription.afterPosition;
        if (after?.comboLegDetails) legs.push(...after.comboLegDetails);
        if (after) metadata.push(after.marketMetadata);
      }
    });

    ws.dispatch(
      JSON.stringify({
        ...positionUpdate,
        positionSubscription: {
          ...positionUpdate.positionSubscription,
          afterPosition: {
            ...position,
            comboLegDetails: [leg, settledLeg],
            marketMetadata: {
              slug: 'market-1',
              eventId: 'event-id-1',
              team: settledLeg.team,
              subject: settledLeg.subject,
            },
          },
        },
      } satisfies PositionUpdate),
    );

    expect(legs).toEqual([leg, settledLeg]);
    expect(legs[0]).not.toHaveProperty('settlement');
    expect(legs[0]).not.toHaveProperty('team');
    expect(legs[0].indicativePrice).toBeNull();
    expect(legs[1].subject?.subjectType).toBe('player');
    expect(legs[1].team?.id).toBe(0);
    expect(legs[1].team?.providerId).toBe(0);
    expect(legs[1].team?.ranking).toBe('0');
    expect(legs[1].team?.providerIds?.[0].providerId).toBe('team-1');
    expect(legs[1].team?.providerIds?.[0].provider).toBe('PROVIDER_GRID');
    expect(legs[1].team?.color?.dark).toBe('#000000');
    expect(legs[1].team?.imageDisplayType).toBe('IMAGE_DISPLAY_TYPE_LOGO');
    expect(legs[1].settlement?.settlementPrice.value).toBe('1');
    expect(legs[1].settlement?.settlementSetTime).toBeNull();
    expect(metadata[0]?.eventId).toBe('event-id-1');
    expect(metadata[0]?.team?.providerIds?.[0].providerId).toBe('team-1');
    expect(metadata[0]?.team?.ranking).toBe('0');
    expect(metadata[0]?.subject?.name).toBe('Player one');
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
