import type { Activity, Amount, PortfolioTrade, Trade } from 'polymarket-us';

export function exactTradeQuantity(trade: PortfolioTrade): string | undefined {
  return trade.qtyDecimal;
}

export function activityTrade(activity: Activity): PortfolioTrade | undefined {
  return activity.trade;
}

export function marketTradeQuantity(trade: Trade): Amount {
  return trade.trade.quantity;
}
