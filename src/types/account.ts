export interface UserBalance {
  currentBalance: number;
  currency: string;
  lastUpdated?: string | null;
  buyingPower: number;
  assetNotional?: number;
  assetAvailable?: number;
  pendingCredit?: number;
  openOrders?: number;
  unsettledFunds?: number;
  pendingWithdrawals?: PendingWithdrawal[];
  marginRequirement?: number;
  balanceReservation?: number;
  depositReservation?: number;
  bonusReservation?: number;
  displayedBonus?: number;
  displayedAvailableSoon?: number;
  displayedCash?: number;
  availableToWithdraw?: number;
  bonusHold?: number;
}

export interface PendingWithdrawal {
  id: string;
  name?: string;
  balance?: number;
  description?: string;
  acknowledged?: boolean;
  bankId?: string;
  creationTime?: string | null;
  destinationAccountName?: string;
}

export interface GetAccountBalancesResponse {
  balances: UserBalance[];
}
