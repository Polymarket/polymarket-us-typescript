export interface UserBalance {
  currentBalance: number;
  currency: string;
  lastUpdated?: string;
  buyingPower: number;
  assetNotional?: number;
  assetAvailable?: number;
  pendingCredit?: number;
  openOrders?: number;
  unsettledFunds?: number;
  pendingWithdrawals?: PendingWithdrawal[];
  marginRequirement?: number;
  balanceReservation?: number;
}

export interface PendingWithdrawal {
  id: string;
  name?: string;
  balance?: number;
  description?: string;
  acknowledged?: boolean;
  bankId?: string;
  creationTime?: string;
  destinationAccountName?: string;
}

export interface GetAccountBalancesResponse {
  balances: UserBalance[];
}
