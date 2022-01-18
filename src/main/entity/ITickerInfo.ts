export interface ITickerInfo {
  tickerId: number;
  symbol: string;
  sector: string;
  industry: string;
  customGroup: string;
  ibkrContractId: string;
  securityId: string;
  description: string;
  exchange: string;
  type: string;
  marketPrice: number;
  avgPrice: number;
  actualPositions: number;
  purchaseValue: number;
  marketValue: number;
  realizedPnL: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  portfolioPercent: number;
  dividendAmount: number;
  logoImage: string;
}
