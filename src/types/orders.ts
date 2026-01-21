import type { Amount } from './common';

export type OrderType = 'ORDER_TYPE_LIMIT' | 'ORDER_TYPE_MARKET';
export type OrderSide = 'ORDER_SIDE_BUY' | 'ORDER_SIDE_SELL';
export type OrderIntent =
  | 'ORDER_INTENT_BUY_LONG'
  | 'ORDER_INTENT_SELL_LONG'
  | 'ORDER_INTENT_BUY_SHORT'
  | 'ORDER_INTENT_SELL_SHORT';
export type TimeInForce =
  | 'TIME_IN_FORCE_GOOD_TILL_CANCEL'
  | 'TIME_IN_FORCE_GOOD_TILL_DATE'
  | 'TIME_IN_FORCE_IMMEDIATE_OR_CANCEL'
  | 'TIME_IN_FORCE_FILL_OR_KILL';
export type OrderState =
  | 'ORDER_STATE_NEW'
  | 'ORDER_STATE_PENDING_NEW'
  | 'ORDER_STATE_PENDING_REPLACE'
  | 'ORDER_STATE_PENDING_CANCEL'
  | 'ORDER_STATE_PENDING_RISK'
  | 'ORDER_STATE_PARTIALLY_FILLED'
  | 'ORDER_STATE_FILLED'
  | 'ORDER_STATE_CANCELED'
  | 'ORDER_STATE_REPLACED'
  | 'ORDER_STATE_REJECTED'
  | 'ORDER_STATE_EXPIRED';
export type ExecutionType =
  | 'EXECUTION_TYPE_NEW'
  | 'EXECUTION_TYPE_PARTIAL_FILL'
  | 'EXECUTION_TYPE_FILL'
  | 'EXECUTION_TYPE_CANCELED'
  | 'EXECUTION_TYPE_REPLACE'
  | 'EXECUTION_TYPE_REJECTED'
  | 'EXECUTION_TYPE_EXPIRED'
  | 'EXECUTION_TYPE_DONE_FOR_DAY';
export type ManualOrderIndicator =
  | 'MANUAL_ORDER_INDICATOR_MANUAL'
  | 'MANUAL_ORDER_INDICATOR_AUTOMATIC';

export interface SlippageTolerance {
  currentPrice: Amount;
  bips?: number;
  ticks?: number;
}

export interface MarketMetadata {
  slug: string;
  icon?: string;
  title?: string;
  outcome?: string;
  eventSlug?: string;
  teamId?: number;
  team?: {
    id: number;
    name: string;
    abbreviation?: string;
    league?: string;
    record?: string;
    logo?: string;
  };
}

export interface Order {
  id: string;
  marketSlug: string;
  side: OrderSide;
  type: OrderType;
  price: Amount;
  quantity: number;
  cumQuantity: number;
  leavesQuantity: number;
  tif: TimeInForce;
  goodTillTime?: string;
  intent: OrderIntent;
  marketMetadata?: MarketMetadata;
  state: OrderState;
  avgPx?: Amount;
  cashOrderQty?: Amount;
  insertTime?: string;
  createTime?: string;
  commissionNotionalTotalCollected?: Amount;
  commissionsBasisPoints?: string;
  makerCommissionsBasisPoints?: string;
}

export interface Execution {
  id: string;
  order: Order;
  lastShares?: string;
  lastPx?: Amount;
  type: ExecutionType;
  text?: string;
  orderRejectReason?: string;
  transactTime?: string;
  tradeId?: string;
  aggressor?: boolean;
  commissionNotionalCollected?: Amount;
}

export interface CreateOrderParams {
  marketSlug: string;
  intent: OrderIntent;
  type?: OrderType;
  price?: Amount;
  quantity?: number;
  tif?: TimeInForce;
  participateDontInitiate?: boolean;
  goodTillTime?: string;
  cashOrderQty?: Amount;
  manualOrderIndicator?: ManualOrderIndicator;
  synchronousExecution?: boolean;
  maxBlockTime?: string;
  slippageTolerance?: SlippageTolerance;
}

export interface CreateOrderResponse {
  id: string;
  executions?: Execution[];
}

export interface ModifyOrderParams {
  marketSlug: string;
  price?: Amount;
  quantity?: number;
  tif?: TimeInForce;
  participateDontInitiate?: boolean;
  goodTillTime?: string;
}

export interface CancelOrderParams {
  marketSlug: string;
}

export interface CancelAllOrdersParams {
  slugs?: string[];
}

export interface CancelAllOrdersResponse {
  canceledOrderIds: string[];
}

export interface ClosePositionParams {
  marketSlug: string;
  manualOrderIndicator?: ManualOrderIndicator;
  synchronousExecution?: boolean;
  maxBlockTime?: string;
  slippageTolerance?: SlippageTolerance;
}

export interface ClosePositionResponse {
  id: string;
  executions?: Execution[];
}

export interface PreviewOrderParams {
  request: CreateOrderParams;
}

export interface PreviewOrderResponse {
  order: Order;
}

export interface GetOpenOrdersParams {
  slugs?: string[];
}

export interface GetOpenOrdersResponse {
  orders: Order[];
}

export interface GetOrderResponse {
  order: Order;
}
