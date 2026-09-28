import type { RFQEvent } from '../../src';

// Generated from go-gateway-us@eb891a3ef873ad322036fc75f95b194792b87286
// with protojson EmitUnpopulated=true and synthetic local data.
export const rfqEvents: { name: string; message: RFQEvent }[] = [
  {
    name: 'rfqCreated',
    message: {
      requestId: 'rfqs',
      subscriptionType: 'SUBSCRIPTION_TYPE_RFQ',
      rfqEvent: {
        rfqCreated: {
          rfq: {
            id: 'rfq-1',
            qtyDecimal: '0.0100',
            symbol: 'combo-example',
            rfqCreatorUserId: 'requester-1',
            createdTime: '2026-09-28T12:00:00.123456789Z',
            restRemainder: false,
            status: 'RFQ_STATUS_OPEN',
            updatedTime: '2026-09-28T12:00:01.123456789Z',
            comboLegs: [
              {
                symbol: 'market-a',
                side: 'SIDE_BUY',
                settlementPrice: '0',
              },
              {
                symbol: 'market-b',
                side: 'SIDE_SELL',
              },
            ],
            tickSize: 0.0001,
          },
        },
      },
    },
  },
  {
    name: 'rfqClosed',
    message: {
      requestId: 'rfqs',
      subscriptionType: 'SUBSCRIPTION_TYPE_RFQ',
      rfqEvent: {
        rfqClosed: {
          rfq: {
            id: 'rfq-1',
            cashOrderQty: '12.3400',
            symbol: 'combo-example',
            rfqCreatorUserId: 'requester-1',
            createdTime: '2026-09-28T12:00:00.123456789Z',
            restRemainder: false,
            status: 'RFQ_STATUS_CLOSED',
            updatedTime: '2026-09-28T12:00:01.123456789Z',
            comboLegs: [
              {
                symbol: 'market-a',
                side: 'SIDE_BUY',
                settlementPrice: '0',
              },
              {
                symbol: 'market-b',
                side: 'SIDE_SELL',
              },
            ],
            tickSize: 0.0001,
          },
        },
      },
    },
  },
  {
    name: 'quoteCreated',
    message: {
      requestId: 'rfqs',
      subscriptionType: 'SUBSCRIPTION_TYPE_RFQ',
      rfqEvent: {
        quoteCreated: {
          quote: {
            id: 'quote-1',
            rfqId: 'rfq-1',
            creatorRfqUserId: 'quoter-1',
            symbol: 'combo-example',
            status: 'QUOTE_STATUS_ACTIVE',
            createdTime: '2026-09-28T12:00:00.123456789Z',
            buyPrice: '0.1234',
            sellPrice: '0.8766',
            restRemainder: true,
            postOnly: false,
            rfqCreatorUserId: 'requester-1',
            rfqCashOrderQty: '12.3400',
            buyQtyDecimal: '19.6000',
            sellQtyDecimal: '0.0100',
            updatedTime: '2026-09-28T12:00:01.123456789Z',
            acceptedSide: 'SIDE_UNDEFINED',
            acceptedTime: null,
            confirmedTime: null,
            confirmationDeadline: null,
            executionDeadline: null,
            executedTime: null,
          },
        },
      },
    },
  },
  {
    name: 'quoteDeleted',
    message: {
      requestId: 'rfqs',
      subscriptionType: 'SUBSCRIPTION_TYPE_RFQ',
      rfqEvent: {
        quoteDeleted: {
          quote: {
            id: 'quote-1',
            rfqId: 'rfq-1',
            creatorRfqUserId: 'quoter-1',
            symbol: 'combo-example',
            status: 'QUOTE_STATUS_DELETED',
            createdTime: '2026-09-28T12:00:00.123456789Z',
            buyPrice: '0.1234',
            sellPrice: '0.8766',
            restRemainder: true,
            postOnly: false,
            rfqCreatorUserId: 'requester-1',
            rfqCashOrderQty: '12.3400',
            buyQtyDecimal: '19.6000',
            sellQtyDecimal: '0.0100',
            updatedTime: '2026-09-28T12:00:01.123456789Z',
            acceptedSide: 'SIDE_UNDEFINED',
            acceptedTime: null,
            confirmedTime: null,
            confirmationDeadline: null,
            executionDeadline: null,
            executedTime: null,
          },
        },
      },
    },
  },
  {
    name: 'quoteAccepted',
    message: {
      requestId: 'rfqs',
      subscriptionType: 'SUBSCRIPTION_TYPE_RFQ',
      rfqEvent: {
        quoteAccepted: {
          quote: {
            id: 'quote-1',
            rfqId: 'rfq-1',
            creatorRfqUserId: 'quoter-1',
            symbol: 'combo-example',
            status: 'QUOTE_STATUS_ACCEPTED',
            createdTime: '2026-09-28T12:00:00.123456789Z',
            buyPrice: '0.1234',
            sellPrice: '0.8766',
            restRemainder: true,
            postOnly: false,
            rfqCreatorUserId: 'requester-1',
            rfqCashOrderQty: '12.3400',
            buyQtyDecimal: '19.6000',
            sellQtyDecimal: '0.0100',
            updatedTime: '2026-09-28T12:00:01.123456789Z',
            acceptedSide: 'SIDE_BUY',
            acceptedTime: '2026-09-28T12:00:02.123456789Z',
            confirmedTime: null,
            confirmationDeadline: '2026-09-28T12:00:10.123456789Z',
            executionDeadline: null,
            executedTime: null,
          },
          confirmationDeadline: '2026-09-28T12:00:10.123456789Z',
        },
      },
    },
  },
  {
    name: 'quoteConfirmed',
    message: {
      requestId: 'rfqs',
      subscriptionType: 'SUBSCRIPTION_TYPE_RFQ',
      rfqEvent: {
        quoteConfirmed: {
          quote: {
            id: 'quote-1',
            rfqId: 'rfq-1',
            creatorRfqUserId: 'quoter-1',
            symbol: 'combo-example',
            status: 'QUOTE_STATUS_CONFIRMED',
            createdTime: '2026-09-28T12:00:00.123456789Z',
            buyPrice: '0.1234',
            sellPrice: '0.8766',
            restRemainder: true,
            postOnly: false,
            rfqCreatorUserId: 'requester-1',
            rfqCashOrderQty: '12.3400',
            buyQtyDecimal: '19.6000',
            sellQtyDecimal: '0.0100',
            updatedTime: '2026-09-28T12:00:01.123456789Z',
            acceptedSide: 'SIDE_BUY',
            acceptedTime: '2026-09-28T12:00:02.123456789Z',
            confirmedTime: '2026-09-28T12:00:03.123456789Z',
            confirmationDeadline: '2026-09-28T12:00:10.123456789Z',
            executionDeadline: '2026-09-28T12:00:11.123456789Z',
            executedTime: null,
          },
          executionDeadline: '2026-09-28T12:00:11.123456789Z',
        },
      },
    },
  },
  {
    name: 'quoteExecuted',
    message: {
      requestId: 'rfqs',
      subscriptionType: 'SUBSCRIPTION_TYPE_RFQ',
      rfqEvent: {
        quoteExecuted: {
          quote: {
            id: 'quote-1',
            rfqId: 'rfq-1',
            creatorRfqUserId: 'quoter-1',
            symbol: 'combo-example',
            status: 'QUOTE_STATUS_EXECUTED',
            createdTime: '2026-09-28T12:00:00.123456789Z',
            buyPrice: '0.1234',
            sellPrice: '0.8766',
            restRemainder: true,
            postOnly: false,
            rfqCreatorUserId: 'requester-1',
            rfqCashOrderQty: '12.3400',
            buyQtyDecimal: '19.6000',
            sellQtyDecimal: '0.0100',
            updatedTime: '2026-09-28T12:00:01.123456789Z',
            acceptedSide: 'SIDE_BUY',
            acceptedTime: '2026-09-28T12:00:02.123456789Z',
            confirmedTime: '2026-09-28T12:00:03.123456789Z',
            confirmationDeadline: '2026-09-28T12:00:10.123456789Z',
            executionDeadline: '2026-09-28T12:00:11.123456789Z',
            executedTime: '2026-09-28T12:00:11.123456789Z',
            rfqCreatorOrderId: 'requester-order-1',
            creatorOrderId: 'quoter-order-1',
          },
          orderId: 'own-order-1',
          clientOrderId: 'own-client-order-1',
          executedTime: '2026-09-28T12:00:11.123456789Z',
        },
      },
    },
  },
  {
    name: 'zeroRfq',
    message: {
      requestId: 'rfqs',
      subscriptionType: 'SUBSCRIPTION_TYPE_RFQ',
      rfqEvent: {
        rfqCreated: {
          rfq: {
            id: '',
            symbol: '',
            rfqCreatorUserId: '',
            createdTime: null,
            restRemainder: false,
            status: 'RFQ_STATUS_UNSPECIFIED',
            updatedTime: null,
            comboLegs: [
              {
                symbol: '',
                side: 'SIDE_UNDEFINED',
              },
            ],
          },
        },
      },
    },
  },
  {
    name: 'zeroQuote',
    message: {
      requestId: 'rfqs',
      subscriptionType: 'SUBSCRIPTION_TYPE_RFQ',
      rfqEvent: {
        quoteCreated: {
          quote: {
            id: '',
            rfqId: '',
            creatorRfqUserId: '',
            symbol: '',
            status: 'QUOTE_STATUS_UNDEFINED',
            createdTime: null,
            buyPrice: '',
            sellPrice: '',
            restRemainder: false,
            postOnly: false,
            rfqCreatorUserId: '',
            buyQtyDecimal: '',
            sellQtyDecimal: '',
            updatedTime: null,
            acceptedSide: 'SIDE_UNDEFINED',
            acceptedTime: null,
            confirmedTime: null,
            confirmationDeadline: null,
            executionDeadline: null,
            executedTime: null,
          },
        },
      },
    },
  },
  {
    name: 'nullRfq',
    message: {
      requestId: 'rfqs',
      subscriptionType: 'SUBSCRIPTION_TYPE_RFQ',
      rfqEvent: {
        rfqCreated: {
          rfq: null,
        },
      },
    },
  },
  {
    name: 'nullQuoteAndEventDeadline',
    message: {
      requestId: 'rfqs',
      subscriptionType: 'SUBSCRIPTION_TYPE_RFQ',
      rfqEvent: {
        quoteAccepted: {
          quote: null,
          confirmationDeadline: null,
        },
      },
    },
  },
  {
    name: 'emptyEvent',
    message: {
      requestId: 'rfqs',
      subscriptionType: 'SUBSCRIPTION_TYPE_RFQ',
      rfqEvent: {},
    },
  },
];
