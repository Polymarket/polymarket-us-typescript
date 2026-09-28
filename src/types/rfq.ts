export type RFQSide = 'SIDE_UNDEFINED' | 'SIDE_BUY' | 'SIDE_SELL';

export type RFQStatus =
  | 'RFQ_STATUS_UNSPECIFIED'
  | 'RFQ_STATUS_OPEN'
  | 'RFQ_STATUS_CLOSED';

export type QuoteStatus =
  | 'QUOTE_STATUS_UNDEFINED'
  | 'QUOTE_STATUS_ACTIVE'
  | 'QUOTE_STATUS_CONFIRMED'
  | 'QUOTE_STATUS_DELETED'
  | 'QUOTE_STATUS_ACCEPTED'
  | 'QUOTE_STATUS_EXECUTED';

export interface RFQComboLeg {
  symbol: string;
  side: RFQSide;
  settlementPrice?: string;
}

export interface RFQ {
  id: string;
  qtyDecimal?: string;
  cashOrderQty?: string;
  symbol: string;
  rfqCreatorUserId: string;
  createdTime: string | null;
  restRemainder: boolean;
  status: RFQStatus;
  updatedTime: string | null;
  comboLegs: RFQComboLeg[];
  tickSize?: number;
}

export interface Quote {
  id: string;
  rfqId: string;
  creatorRfqUserId: string;
  symbol: string;
  status: QuoteStatus;
  createdTime: string | null;
  buyPrice: string;
  sellPrice: string;
  restRemainder: boolean;
  postOnly: boolean;
  rfqCreatorUserId: string;
  rfqCashOrderQty?: string;
  buyQtyDecimal: string;
  sellQtyDecimal: string;
  updatedTime: string | null;
  acceptedSide: RFQSide;
  acceptedTime: string | null;
  confirmedTime: string | null;
  confirmationDeadline: string | null;
  executionDeadline: string | null;
  executedTime: string | null;
  rfqCreatorOrderId?: string;
  creatorOrderId?: string;
}
