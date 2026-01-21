import type { Amount } from './common';
import type { MarketMetadata } from './orders';

export interface UserPosition {
  netPosition: string;
  qtyBought: string;
  qtySold: string;
  cost: Amount;
  realized: Amount;
  bodPosition: string;
  expired: boolean;
  updateTime?: string;
  marketMetadata?: MarketMetadata;
  cashValue?: Amount;
  qtyAvailable?: string;
}

export interface GetUserPositionsParams {
  market?: string;
  limit?: number;
  cursor?: string;
}

export interface GetUserPositionsResponse {
  positions: Record<string, UserPosition>;
  nextCursor?: string;
  eof?: boolean;
}

export type ActivityType =
  | 'ACTIVITY_TYPE_TRADE'
  | 'ACTIVITY_TYPE_POSITION_RESOLUTION'
  | 'ACTIVITY_TYPE_ACCOUNT_DEPOSIT'
  | 'ACTIVITY_TYPE_ACCOUNT_ADVANCED_DEPOSIT'
  | 'ACTIVITY_TYPE_ACCOUNT_WITHDRAWAL'
  | 'ACTIVITY_TYPE_REFERRAL_BONUS'
  | 'ACTIVITY_TYPE_TRANSFER';

export type SortOrder = 'SORT_ORDER_DESCENDING' | 'SORT_ORDER_ASCENDING';

export interface Activity {
  type: ActivityType;
  trade?: Trade;
  positionResolution?: PositionResolution;
  accountBalanceChange?: AccountBalanceChange;
}

export interface Trade {
  id: string;
  marketSlug: string;
  state: string;
  createTime?: string;
  updateTime?: string;
  price: Amount;
  qty: string;
  isAggressor?: boolean;
  costBasis?: Amount;
  realizedPnl?: Amount;
}

export interface PositionResolution {
  marketSlug: string;
  beforePosition?: UserPosition;
  afterPosition?: UserPosition;
  updateTime?: string;
  tradeId?: string;
  side?: string;
}

export interface AccountBalanceChange {
  transactions?: AccountBalanceChangeTransaction[];
}

export interface AccountBalanceChangeTransaction {
  transactionId: string;
  status: string;
  amount: Amount;
  updateTime?: string;
  createTime?: string;
}

export interface GetActivitiesParams {
  limit?: number;
  cursor?: string;
  marketSlug?: string;
  types?: ActivityType[];
  sortOrder?: SortOrder;
}

export interface GetActivitiesResponse {
  activities: Activity[];
  nextCursor?: string;
  eof?: boolean;
}
